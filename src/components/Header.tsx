import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { Link, useLocation } from 'react-router-dom';

interface UserProfile {
  displayName: string;
  company: string;
  email: string;
  phone?: string;
  role: 'client' | 'support';
}

interface HeaderProps {
  user: User;
  onLogout: () => void;
  userProfile: UserProfile | null;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, userProfile }) => {
  const location = useLocation();
  const [isDropdownOpen, setDropdownOpen] = useState(false); // ★ ドロップダウンが開いとるかを記憶
  const dropdownRef = useRef<HTMLDivElement>(null); // ★ ドロップダウンメニューの要素を特定するため

  // ★ メニューの外側をクリックしたら閉じる機能
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const getLinkClassName = (path: string) => `
    py-2 px-3 rounded-md text-sm font-medium transition-colors
    ${location.pathname === path ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}
  `;

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to={userProfile?.role === 'support' ? '/admin' : '/client'}
            className="text-2xl font-bold text-gray-900 tracking-tight"
          >
            アカウントロック解除管理ツール
          </Link>
          <nav className="hidden md:flex space-x-4">
            <ul>
              {userProfile && userProfile.role === 'client' && (
                <li>
                  <Link to="/client" className={getLinkClassName('/client')}>依頼フォーム</Link>
                </li>
              )}
              {userProfile && userProfile.role === 'support' && (
                <li>
                  <Link to="/admin" className={getLinkClassName('/admin')}>管理ダッシュボード</Link>
                </li>
              )}
            </ul>
          </nav>
        </div>

        {/* ★★★ ここからがドロップダウンメニューの改造部分！ ★★★ */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
          >
            <span className="text-gray-600 text-sm hidden sm:block">
              {user.email}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {/* isDropdownOpenがtrueの時だけ、メニューを表示する */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)} // リンクをクリックしたらメニューを閉じる
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                プロフィール
              </Link>
              <button
                onClick={onLogout}
                className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                ログアウト
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;