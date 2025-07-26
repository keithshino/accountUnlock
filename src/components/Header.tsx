import React from 'react';
//import { View } from '../App';
import { User } from 'firebase/auth';
import { Link, useLocation } from 'react-router-dom';

// ★★★ UserProfile の型定義を App.tsx と揃えるばい！ ★★★
interface UserProfile {
  displayName: string;
  company: string;
  email: string;
  phone?: string;
  role: 'client' | 'support';
}

interface HeaderProps {
  user: User;
  onLogout: () => void; // Promise<void> になっていたら調整してね。App.tsxのhandleLogoutに合わせる
  userProfile: UserProfile | null; // ★★★ これを追加するばい！ ★★★
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, userProfile }) => { // userProfile を受け取る
  const location = useLocation(); // ★★★ 現在のパスを取得するフック ★★★

  // アクティブなリンクのスタイルを決定するヘルパー関数
  const getLinkClassName = (path: string) => `
    py-2 px-3 rounded-md text-sm font-medium transition-colors
    ${location.pathname === path ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}
  `;

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* ★★★ タイトル部分を Link に変更するばい！ ★★★ */}
          {/* ログインユーザーのロールに応じて、クリックしたら飛ぶページを変える */}
          <Link
            to={userProfile?.role === 'support' ? '/admin' : '/client'}
            className="text-2xl font-bold text-gray-900 tracking-tight"
          >
            アカウントロック解除管理ツール
          </Link>
          <nav className="hidden md:flex space-x-4">
            {/* ★★★ ナビゲーションボタンを Link に変更し、ロールで表示を切り替えるばい！ ★★★ */}
            <ul> {/* ul で囲むと Semantic HTML になるけんおすすめたい */}
              {/* クライアント向けリンク */}
              {userProfile && userProfile.role === 'client' && (
                <li>
                  <Link
                    to="/client"
                    className={getLinkClassName('/client')}
                  >
                    依頼フォーム
                  </Link>
                </li>
              )}
              {/* サポート向けリンク */}
              {userProfile && userProfile.role === 'support' && (
                <li>
                  <Link
                    to="/admin"
                    className={getLinkClassName('/admin')}
                  >
                    管理ダッシュボード
                  </Link>
                </li>
              )}
              {/* プロフィールリンク（全員共通） */}
              <li>
                <Link
                  to="/profile"
                  className={getLinkClassName('/profile')}
                >
                  プロフィール
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-gray-600 text-sm hidden sm:block">
            {user.email}
          </span>
          {/* ログアウトボタンはそのまま onLogout を使う */}
          <button
            onClick={onLogout}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;