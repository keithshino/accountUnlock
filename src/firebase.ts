// Firebaseから必要な機能をインポートする
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// ★★★★★ ここに、さっきコピーした自分の接続コードを貼り付ける！ ★★★★★
const firebaseConfig = {
    apiKey: "AIzaSyBfp6bhVdap5YU4TopWBGkzAnHXyjsII-4",
    authDomain: "accountunlock-cfa2b.firebaseapp.com",
    projectId: "accountunlock-cfa2b",
    storageBucket: "accountunlock-cfa2b.firebasestorage.app",
    messagingSenderId: "102446232782",
    appId: "1:102446232782:web:207d0625e0876757310c9f"
};
// ★★★★★ ここまで ★★★★★

// Firebaseアプリを初期化する
const app = initializeApp(firebaseConfig);

// Authentication（認証）の機能を初期化して、エクスポートする
// これで、他のファイルからauthが使えるようになるっちゃん
export const auth = getAuth(app);