import React from 'react';
import { View } from '../App';
import { User } from 'firebase/auth'; // Userの型をインポート

interface HeaderProps {
  activeView: View;
  setActiveView: (view: View) => void;
  user: User; // userとonLogoutを受け取る
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, setActiveView, user, onLogout }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 左側のタイトル */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-800">アカウントロック解除管理ツール</h1>
          </div>

          {/* 中央のナビゲーション */}
          <nav className="hidden md:flex space-x-4">
            <button
              onClick={() => setActiveView('requester')}
              className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${activeView === 'requester' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              依頼フォーム
            </button>
            <button
              onClick={() => setActiveView('admin')}
              className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${activeView === 'admin' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              管理ダッシュボード
            </button>
          </nav>

          {/* ★★★ 右側のユーザー情報とログアウトボタン ★★★ */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden sm:block">{user.email}</span>
            <button
              onClick={onLogout}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;