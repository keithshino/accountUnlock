import React, { useState, useEffect, useCallback } from 'react';
import './index.css';
import { Task, TaskStatus, ReportStatus } from './types';
import Header from './components/Header';
import RequestForm from './components/RequestForm';
import AdminDashboard from './components/AdminDashboard';
import { SignUpData, default as LoginPage } from './components/LoginPage';
import ProfilePage from './components/ProfilePage';

import { auth, db } from './firebase';
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import { runTransaction, doc, setDoc, getDoc, updateDoc, collection, getDocs, Timestamp, query, orderBy } from 'firebase/firestore';

interface UserProfile {
  //name: string;
  displayName: string;
  company: string;
  email: string;
  phone?: string;
}

export type View = 'requester' | 'admin' | 'profile';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<View>('requester');
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const fetchTasks = useCallback(async () => {
    const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const tasksData = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      } as Task;
    });
    setTasks(tasksData);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const profileData = userDocSnap.data() as UserProfile;
          setUserProfile(profileData);
          console.log("App.tsx で userProfile がセットされました:", profileData);
        } else {
          console.log("App.tsx: userDocSnap.exists() が false でした。"); // ★追加その２
          // 新規登録直後などでuserProfileがまだない場合、空のUserProfileをセットするなどの考慮が必要かも
          // 一時的に空のプロフィールを設定して表示を試す
          setUserProfile({
            displayName: '', // 初期値を設定
            company: '',
            email: currentUser.email || '',
            phone: '',
          });
        }
        fetchTasks();
      } else {
        setUserProfile(null);
        setTasks([]);
        console.log("App.tsx: ユーザーがログアウトしました。"); // ★追加その３
      }
    });
    return () => unsubscribe();
  }, [fetchTasks]);

  const addNewTasks = async (data: {
    requesterName: string;
    requesterEmail: string;
    employees: { employeeName: string; employeeId: string; }[]
  }) => {
    const counterRef = doc(db, "counters", "tasks");

    // ★追加その１：カウンターリファレンスが正しいか確認
    console.log("カウンターリファレンスのパス:", counterRef.path);

    try {
      for (const employee of data.employees) {
        // ★★★ このrunTransactionのブロックが正しい形たい！ ★★★
        await runTransaction(db, async (transaction) => {
          const counterDoc = await transaction.get(counterRef);

          // ★追加その２：カウンタードキュメントが存在するか確認
          console.log("transaction.getで取得したドキュメントが存在するか？:", counterDoc.exists());

          if (!counterDoc.exists()) {
            // ★追加その３：なぜ存在しないのか、念のためログ
            console.error("エラー: カウンタードキュメントが見つかりません！パス:", counterRef.path);
            throw "カウンタードキュメントが見つかりません！";
          }

          // ★追加その４：カウンタードキュメントの中身を確認
          console.log("カウンタードキュメントのデータ:", counterDoc.data());

          const newIdNumber = counterDoc.data().lastId + 1;
          const formattedId = `A${String(newIdNumber).padStart(6, '0')}`;

          console.log("生成された新しいID:", formattedId); // ★追加その５：新しいIDを確認

          const newTaskRef = doc(db, "tasks", formattedId);
          const newTaskData = {
            id: formattedId,
            createdAt: Timestamp.now(),
            requesterName: data.requesterName,
            requesterEmail: data.requesterEmail,
            employeeName: employee.employeeName,
            employeeId: employee.employeeId,
            status: TaskStatus.NEW,
            reportStatus: ReportStatus.UNREPORTED,
            log: '',
          };

          transaction.set(newTaskRef, newTaskData);
          transaction.update(counterRef, { lastId: newIdNumber });
        });
      }
      await fetchTasks();
    } catch (e) {
      console.error("トランザクションに失敗しました: ", e);
      alert("依頼の登録に失敗しました。");
    }
  };

  const handleEmailSignUp = async (data: SignUpData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.pass);
      const newUser = userCredential.user;

      if (newUser) {
        const userRef = doc(db, "users", newUser.uid);
        await setDoc(userRef, {
          uid: newUser.uid, // UIDも保存しておくと便利たい
          email: newUser.email,
          displayName: data.name, // 登録時の名前があれば displayName に
          company: data.company, // 会社名も保存
          phone: data.phone || '', // 電話番号も保存
          createdAt: newUser.metadata.creationTime ? new Date(newUser.metadata.creationTime) : Timestamp.now(),
          role: 'client', // ここで 'client' ロールを付与するばい
        }, { merge: true });

        console.log("新規クライアントユーザー情報とロールがFirestoreに保存されました:", newUser.uid);
        alert("新規登録に成功しました！");
      } else {
        console.error("新規登録は成功しましたが、ユーザー情報が取得できませんでした。");
        alert("新規登録に失敗しました。ユーザー情報が取得できませんでした。");
      }

    } catch (error: any) { // error の型を any にしてエラーコードにアクセスできるようにする
      console.error("新規登録エラー:", error);
      let errorMessage = "新規登録に失敗しました。";
      if (error.code) {
        switch (error.code) {
          case 'auth/weak-password':
            errorMessage = "パスワードは6文字以上で入力してください。";
            break;
          case 'auth/email-already-in-use':
            errorMessage = "このメールアドレスはすでに登録されています。";
            break;
          case 'auth/invalid-email':
            errorMessage = "メールアドレスの形式が正しくありません。";
            break;
          default:
            errorMessage = `新規登録エラー: ${error.message}`;
        }
      }
      alert(errorMessage);
    }
  };

  const handleUpdateProfile = async (updatedProfile: Partial<UserProfile>) => {
    if (!user) return; // user が null の場合は処理しない
    const userDocRef = doc(db, "users", user.uid);
    try {
      await updateDoc(userDocRef, updatedProfile);
      // userProfile ステートも更新して、UIに反映させる
      setUserProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
      alert('プロフィールを更新しました！');
    } catch (error) {
      console.error("プロフィールの更新に失敗しました:", error);
      alert('プロフィールの更新に失敗しました。');
    }
  };

  const handleEmailLogin = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      alert("ログインに失敗しました。メールアドレスかパスワードが間違っとるかもしれん。");
      console.error(error);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider); // resultを受け取るように変更
      const user = result.user; // ログインしたユーザー情報

      if (user) {
        // Firestoreにユーザー情報を保存するドキュメントリファレンスを作成
        // ドキュメントIDはFirebase AuthenticationのUIDを使うとよ。
        const userRef = doc(db, "users", user.uid);

        // Firestoreにユーザー情報を保存（または更新）
        // { merge: true } を使うことで、既存のフィールドは上書きせず、
        // 新しいフィールド (roleなど) だけを追加または更新するばい。
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          // user.metadata.creationTime は文字列の可能性もあるけん Dateオブジェクトに変換
          createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : Timestamp.now(),
          // ロールがまだ設定されてない場合は 'client' を初期値とする
          // すでにロールが設定されている場合は、merge: true のおかげで上書きされない
          role: 'support',
        }, { merge: true });

        console.log("ユーザー情報とロールがFirestoreに保存されました:", user.uid);
        alert("Googleログインに成功しました！");
      } else {
        console.error("Googleログインは成功しましたが、ユーザー情報が取得できませんでした。");
        alert("Googleログインに失敗しました。ユーザー情報が取得できませんでした。");
      }
    } catch (error: any) {
      console.error("Googleログインエラー:", error);
      // エラーメッセージをユーザーにも分かりやすく表示するばい
      let errorMessage = "Googleログイン中に不明なエラーが発生しました。";
      if (error.code) {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = "Googleログインのポップアップが閉じられました。";
            break;
          case 'auth/cancelled-popup-request':
            errorMessage = "Googleログインのポップアップがキャンセルされました。";
            break;
          // 他にもfirebase/authのエラーコードがあればここに追加できるよ
          default:
            errorMessage = `Googleログインエラー: ${error.message}`;
        }
      }
      alert(errorMessage);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("ログアウトしました！"); // ログアウト成功時のメッセージ
    } catch (error) {
      console.error("ログアウトエラー:", error);
      alert("ログアウトに失敗しました。");
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    if (!updatedTask.id) return; // IDがない場合は処理しない
    try {
      const taskDocRef = doc(db, "tasks", updatedTask.id);
      await updateDoc(taskDocRef, {
        status: updatedTask.status,
        reportStatus: updatedTask.reportStatus,
        log: updatedTask.log,
      });
      // ステートを更新してUIに反映
      setTasks(prevTasks => prevTasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      ));
      alert('タスクを更新しました！');
    } catch (error) {
      console.error("タスクの更新に失敗しました:", error);
      alert('タスクの更新に失敗しました。セキュリティルール違反の可能性もあります。'); // セキュリティルール変更後なのでメッセージに追記
    }
  };

  const MainContent = () => {
    switch (view) {
      case 'requester':
        return <RequestForm onAddTasks={addNewTasks} userProfile={userProfile} />;
      case 'admin':
        return <AdminDashboard tasks={tasks} onUpdateTask={handleUpdateTask} />;
      case 'profile':
        if (user && userProfile) {
          return <ProfilePage user={user} userProfile={userProfile} onUpdateProfile={handleUpdateProfile} onBack={() => setView('requester')} />;
        }
        return null;
      default:
        return <RequestForm onAddTasks={addNewTasks} userProfile={userProfile} />;
    }
  };

  if (!user) {
    return <LoginPage onEmailLogin={handleEmailLogin} onGoogleLogin={handleGoogleLogin} onEmailSignUp={handleEmailSignUp} />;
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-800">
      <Header activeView={view} setActiveView={setView} user={user} onLogout={handleLogout} />
      <main className="p-4 sm:p-6 lg:p-8">
        <MainContent />
      </main>
    </div>
  );
}

export default App;