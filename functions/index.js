// functions/index.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// ★★★ admin.initializeApp() はファイルの先頭近くに置くのが良いばい ★★★
admin.initializeApp();

// Functions内でFirestoreを使うためのインスタンスを取得 (追加)
const db = admin.firestore();


// ユーザーが新しく作成された時（または初回ログイン時）にトリガーされるFunction
// Googleログインユーザーのロールを設定する
exports.setCustomClaimsOnCreate = functions.auth.user().onCreate(async (user) => {
    // ★★★ user.email が存在しない可能性も考慮するばい ★★★
    console.log(`User created: ${user.email || 'No email'}, UID: ${user.uid}`);

    // Googleログイン（SSO）の場合のみ処理する
    // user.providerData が undefined の可能性も考慮して ?. オプショナルチェイニングを使う
    if (user.providerData?.some(provider => provider.providerId === 'google.com')) { // ★★★ user.providerData?. に変更 ★★★
        // メールアドレスが存在し、かつ特定のドメインの場合
        if (user.email && user.email.endsWith('@tokium.jp')) { // ★★★ user.email の存在チェックを追加 ★★★
            // @tokium.jp ドメインのユーザーなら 'support' ロールを付与
            await admin.auth().setCustomUserClaims(user.uid, { role: 'support' });
            console.log(`Custom claim 'support' set for user ${user.email} (${user.uid})`);
        } else {
            // それ以外のGoogleユーザーなら 'client' ロールを付与
            await admin.auth().setCustomUserClaims(user.uid, { role: 'client' });
            console.log(`Custom claim 'client' set for user ${user.email} (${user.uid})`);
        }

        // Firestore の users/{userId} ドキュメントにも role を書き込む（または更新する）
        const userRef = db.collection('users').doc(user.uid); // ★★★ db インスタンスを使う ★★★
        const docSnap = await userRef.get();

        let currentRoleInFirestore = 'client';
        if (docSnap.exists && docSnap.data() && docSnap.data().role) { // ★★★ docSnap.data() もチェック ★★★
            currentRoleInFirestore = docSnap.data().role;
        }

        const newRole = (user.email && user.email.endsWith('@tokium.jp')) ? 'support' : 'client';

        if (currentRoleInFirestore !== newRole || !docSnap.exists) {
            await userRef.set({
                uid: user.uid,
                email: user.email || '', // email が null の可能性も考慮
                displayName: user.displayName || user.email?.split('@')[0] || '', // displayNameやemailの存在を安全にチェック
                photoURL: user.photoURL || '', // photoURL も null の可能性
                createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : admin.firestore.Timestamp.now(),
                role: newRole,
            }, { merge: true });

            console.log(`Firestore user data synchronized for ${user.email || 'No email'} with role: ${newRole}`);
        }
    } else {
        // Googleログイン以外のプロバイダ（メール/パスワードなど）の場合の処理
        // ここではカスタムクレームを設定しないが、必要であれば設定可能
        console.log(`User created via non-Google provider: ${user.email || 'No email'}, UID: ${user.uid}`);
    }
});
