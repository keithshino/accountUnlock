import React, { useState, useEffect, useCallback } from 'react'; // ★ useCallbackをインポート！
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
import { doc, setDoc, getDoc, updateDoc, collection, addDoc, getDocs, Timestamp, query, orderBy } from 'firebase/firestore';

interface UserProfile {
  name: string;
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

  // ★★★ ここのuseEffectが一番大事な変更点！ ★★★
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // ログインしとったら、Firestoreからユーザー情報を取得
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserProfile(userDocSnap.data() as UserProfile);
        }
        // タスクも読み込む
        fetchTasks();
      } else {
        // ログアウトしたら、ユーザー情報とタスクを空にする
        setUserProfile(null);
        setTasks([]);
      }
    });
    return () => unsubscribe();
  }, [fetchTasks]); // fetchTasksを依存配列に追加

  const addNewTasks = async (data: {
    requesterName: string;
    requesterEmail: string;
    employees: { employeeName: string; employeeId: string; }[]
  }) => {
    try {
      for (const employee of data.employees) {
        await addDoc(collection(db, "tasks"), {
          createdAt: Timestamp.now(),
          requesterName: data.requesterName,
          requesterEmail: data.requesterEmail,
          employeeName: employee.employeeName,
          employeeId: employee.employeeId,
          status: TaskStatus.NEW,
          reportStatus: ReportStatus.UNREPORTED,
          log: '',
        });
      }
      await fetchTasks();
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("依頼の登録に失敗しました。");
    }
  };

  const handleEmailSignUp = async (data: SignUpData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.pass);
      const newUser = userCredential.user;
      await setDoc(doc(db, "users", newUser.uid), {
        name: data.name,
        company: data.company,
        phone: data.phone || '',
        email: data.email,
      });
    } catch (error) {
      alert("新規登録に失敗しました。パスワードが6文字未満か、メールアドレスがすでに使われとるかもしれん。");
      console.error(error);
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
      await signInWithPopup(auth, provider);
    } catch (error) {
      alert("Googleログインに失敗しました。");
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleUpdateProfile = async (updatedProfile: Partial<UserProfile>) => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, updatedProfile);
    // 更新が成功したら、ローカルのstateも更新する
    setUserProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
  };

  const MainContent = () => {
    switch (view) {
      case 'requester':
        return <RequestForm onAddTasks={addNewTasks} userProfile={userProfile} />;
      case 'admin':
        return <AdminDashboard tasks={tasks} setTasks={setTasks} />;
      case 'profile':
        if (user && userProfile) {
          return <ProfilePage user={user} userProfile={userProfile} onUpdateProfile={handleUpdateProfile} onBack={() => setView('requester')} />;
        }
        return null; // ユーザー情報がない場合は何も表示しない
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