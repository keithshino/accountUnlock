import React, { useState, useEffect } from 'react';
import './index.css';
import { Task, TaskStatus, ReportStatus } from './types';
import { INITIAL_TASKS } from './constants';
import Header from './components/Header';
import RequestForm from './components/RequestForm';
import AdminDashboard from './components/AdminDashboard';
import LoginPage from './components/LoginPage';

import { auth } from './firebase';
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword, // ★ 新規登録用の機能をインポート
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';

export type View = 'requester' | 'admin';

function App() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [view, setView] = useState<View>('requester');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const addNewTasks = (data: {
    requesterName: string;
    requesterEmail: string;
    employees: { employeeName: string; employeeId: string; }[]
  }) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const lastId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) : 0;
    const newTasks: Task[] = data.employees.map((employee, index) => ({
      id: lastId + index + 1,
      createdAt: formattedDate,
      requesterName: data.requesterName,
      requesterEmail: data.requesterEmail,
      employeeName: employee.employeeName,
      employeeId: employee.employeeId,
      status: TaskStatus.NEW,
      reportStatus: ReportStatus.UNREPORTED,
      log: '',
    }));
    setTasks(prevTasks => [...prevTasks, ...newTasks]);
  };

  // ★★★ メールとパスワードで新規登録する関数 ★★★
  const handleEmailSignUp = async (email: string, pass: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      // 登録が成功したら、Firebaseが自動でログイン状態にしてくれる！
    } catch (error) {
      alert("新規登録に失敗しました。パスワードが短いか、メールアドレスがすでに使われとるかもしれん。");
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

  if (!user) {
    // ★ LoginPageに新しい関数を渡す
    return <LoginPage onEmailLogin={handleEmailLogin} onGoogleLogin={handleGoogleLogin} onEmailSignUp={handleEmailSignUp} />;
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-800">
      <Header activeView={view} setActiveView={setView} user={user} onLogout={handleLogout} />
      <main className="p-4 sm-p-6 lg:p-8">
        {view === 'requester' ? (
          <RequestForm onAddTasks={addNewTasks} />
        ) : (
          <AdminDashboard tasks={tasks} setTasks={setTasks} />
        )}
      </main>
    </div>
  );
}

export default App;