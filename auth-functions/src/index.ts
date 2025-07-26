// auth-functions/src/index.ts

// ★★★ functions/v2 のインポートを削除し、通常の functions をインポートするばい！ ★★★
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { UserRecord } from "firebase-admin/auth"; // UserRecord はそのまま使う

admin.initializeApp();
const db = admin.firestore();

// ユーザーが新しく作成された時（または初回ログイン時）にトリガーされるFunction
// Googleログインユーザーのロールを設定する
// ★★★ functions.auth.user().onCreate に戻す！ ★★★
export const setCustomClaimsOnCreate = functions.auth.user().onCreate(async (user: UserRecord) => {
    if (!user) {
        console.error("Error: User object is undefined in onCreate trigger.");
        return;
    }

    console.log(`User created: ${user.email || 'No email'}, UID: ${user.uid}`);

    const isGoogleAuth = user.providerData && Array.isArray(user.providerData) &&
        user.providerData.some((provider: { providerId: string; }) => provider.providerId === 'google.com');

    if (isGoogleAuth) {
        const isTokiumUser = user.email && user.email.endsWith('@tokium.jp');
        const newRole = isTokiumUser ? 'support' : 'client';

        await admin.auth().setCustomUserClaims(user.uid, { role: newRole });
        console.log(`Custom claim '${newRole}' set for user ${user.email} (${user.uid})`);

        const userRef = db.collection('users').doc(user.uid);
        const docSnap = await userRef.get();

        if (!docSnap.exists || (docSnap.exists && (docSnap.data() as { role: string })?.role !== newRole)) {
            await userRef.set({
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || user.email?.split('@')[0] || '',
                photoURL: user.photoURL || '',
                createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : admin.firestore.Timestamp.now(),
                role: newRole,
            }, { merge: true });
            console.log(`Firestore user data synchronized for ${user.email || 'No email'} with role: ${newRole}`);
        } else {
            console.log(`Firestore user data already up-to-date for ${user.email || 'No email'}`);
        }
    } else {
        console.log(`User created via non-Google provider: ${user.email || 'No email'}, UID: ${user.uid}`);
    }
});
