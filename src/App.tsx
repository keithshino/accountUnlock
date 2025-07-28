import React, { useState, useEffect, useCallback } from 'react';
import './index.css';
import { Task, TaskStatus, ReportStatus } from './types';
import Header from './components/Header';
// import RequestForm from './components/RequestForm';
import AdminDashboard from './components/AdminDashboard';
import ClientDashboard from './components/ClientDashboard';
import { SignUpData, default as LoginPage } from './components/LoginPage';
import ProfilePage from './components/ProfilePage';

// ★★★ React Routerをインポート ★★★
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

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
import { runTransaction, doc, setDoc, getDoc, updateDoc, collection, getDocs, Timestamp, query, orderBy, where, limit } from 'firebase/firestore';

// ★★★ UserProfileの型定義を最新版に！ ★★★
interface UserProfile {
  displayName: string;
  company: string;
  email: string;
  phone?: string;
  role: 'client' | 'support';
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true); //

  // ★ useNavigateとuseLocationをAppコンポーネントで使う
  const navigate = useNavigate();
  const location = useLocation();

  const fetchTasks = useCallback(async (profile: UserProfile | null) => {
    if (!profile) return;

    let q;
    // ロールがsupportなら全部、clientなら自分のだけ取得する
    if (profile.role === 'support') {
      q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
    } else {
      q = query(
        collection(db, "tasks"),
        where("requesterEmail", "==", profile.email), // ★ 自分のメアドと一致するタスクだけ！
        orderBy("createdAt", "desc"),
        limit(10) // ★ 直近10件だけ！
      );
    }

    const querySnapshot = await getDocs(q);
    const tasksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    setTasks(tasksData);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const profileData = userDocSnap.data() as UserProfile;
          setUserProfile(profileData);
          await fetchTasks(profileData);

          const targetPath = profileData.role === 'support' ? '/admin' : '/client';
          if (location.pathname === '/' || location.pathname === '/login') {
            navigate(targetPath, { replace: true });
          }
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setTasks([]);
        navigate('/');
      }
      setIsLoading(false); // ★★★ 準備完了！見張り番を解除 ★★★
    });
    return () => unsubscribe();
  }, [fetchTasks, navigate]);

  const addNewTasks = async (data: {
    requesterName: string;
    requesterEmail: string;
    employees: { employeeName: string; employeeId: string; }[]
  }) => {
    const counterRef = doc(db, "counters", "tasks");
    try {
      for (const employee of data.employees) {
        await runTransaction(db, async (transaction) => {
          const counterDoc = await transaction.get(counterRef);
          if (!counterDoc.exists()) throw "カウンタードキュメントが見つかりません！";
          const newIdNumber = counterDoc.data().lastId + 1;
          const formattedId = `A${String(newIdNumber).padStart(6, '0')}`;
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
      await fetchTasks(userProfile);
    } catch (e) {
      console.error("トランザクションに失敗しました: ", e);
      alert("依頼の登録に失敗しました。");
    }
  };

  const handleEmailSignUp = async (data: SignUpData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.pass);
      const newUser = userCredential.user;
      await setDoc(doc(db, "users", newUser.uid), {
        displayName: data.displayName, // ★ LoginPageと合わせるためにdisplayNameに変更
        company: data.company,
        phone: data.phone || '',
        email: data.email,
        role: 'client',
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
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          displayName: user.displayName || '名無しさん',
          email: user.email,
          company: '',
          phone: '',
          role: 'support', // Googleログインはサポート担当
        });
      }
    } catch (error) {
      alert("Googleログインに失敗しました。");
      console.error("Googleログインエラー:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleUpdateProfile = async (updatedProfile: Partial<UserProfile>) => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, updatedProfile);
    setUserProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
    alert('プロフィールを更新しました！');
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    if (!updatedTask.id || !user?.email) return; // ★ user.emailがない場合も弾くように

    // ★ 齟齬を修正！更新前のタスク情報を取得する
    const currentTask = tasks.find(task => task.id === updatedTask.id);
    if (!currentTask) return;

    try {
      const taskDocRef = doc(db, "tasks", updatedTask.id);

      const now = new Date();
      const timestamp = now.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

      let logEntry = `[${timestamp} by ${user.email}]`;
      const changes = [];

      if (updatedTask.status !== currentTask.status) {
        changes.push(`Statusを「${currentTask.status}」から「${updatedTask.status}」に変更`);
      }
      if (updatedTask.reportStatus !== currentTask.reportStatus) {
        changes.push(`報告状況を「${currentTask.reportStatus}」から「${updatedTask.reportStatus}」に変更`);
      }
      if (updatedTask.log !== currentTask.log) {
        changes.push('備考を更新');
      }

      if (changes.length > 0) {
        logEntry += ' ' + changes.join('、') + 'しました。';
      } else {
        logEntry = '';
      }

      const newLog = logEntry ? `${logEntry}\n${updatedTask.log}` : updatedTask.log;

      const dataToUpdate: Partial<Task> = {
        status: updatedTask.status,
        reportStatus: updatedTask.reportStatus,
        log: newLog,
      };

      if (updatedTask.reportStatus === '報告済' && currentTask.reportStatus !== '報告済') {
        dataToUpdate.completedBy = user.email;
        dataToUpdate.completedAt = Timestamp.now();
      }

      await updateDoc(taskDocRef, dataToUpdate);

      const finalUpdatedTask = { ...updatedTask, log: newLog, ...dataToUpdate };
      setTasks(prevTasks => prevTasks.map(task =>
        task.id === finalUpdatedTask.id ? finalUpdatedTask : task
      ));

      alert('タスクを更新しました！');
    } catch (error) {
      console.error("タスクの更新に失敗しました:", error);
      alert('タスクの更新に失敗しました。');
    }
  };

  // ★★★ 見張り番が「待って！」と言ってる間は、ローディング画面を出す ★★★
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-800">
      {user && userProfile && <Header user={user} onLogout={handleLogout} userProfile={userProfile} />}
      <main className="p-4 sm:p-6 lg:p-8">
        <Routes>
          {!user ? (
            <>
              <Route path="/" element={<LoginPage onEmailLogin={handleEmailLogin} onGoogleLogin={handleGoogleLogin} onEmailSignUp={handleEmailSignUp} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : userProfile ? (
            <>
              <Route path="/client" element={userProfile.role === 'client' ? <ClientDashboard tasks={tasks} userProfile={userProfile} onAddTasks={addNewTasks} /> : <Navigate to="/admin" replace />} />
              <Route path="/admin" element={userProfile.role === 'support' ? <AdminDashboard tasks={tasks} onUpdateTask={handleUpdateTask} /> : <Navigate to="/client" replace />} />
              <Route path="/profile" element={<ProfilePage user={user} userProfile={userProfile} onUpdateProfile={handleUpdateProfile} onBack={() => navigate(userProfile.role === 'support' ? '/admin' : '/client')} />} />
              <Route path="/" element={<Navigate to={userProfile.role === 'support' ? '/admin' : '/client'} replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <Route path="*" element={<div>Loading profile...</div>} />
          )}
        </Routes>
      </main>
    </div>
  );
}

export default App;