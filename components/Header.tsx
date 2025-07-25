
import React from 'react';
import { View } from '../App';

interface HeaderProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, setActiveView }) => {
  const getButtonClasses = (view: View) => {
    const baseClasses = 'px-4 py-2 rounded-md font-semibold transition-all duration-300 ease-in-out transform hover:scale-105';
    if (activeView === view) {
      return `${baseClasses} bg-blue-600 text-white shadow-lg`;
    }
    return `${baseClasses} bg-white text-blue-700 hover:bg-blue-100 shadow`;
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
            アカウントロック解除管理ツール
          </h1>
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveView('requester')}
              className={getButtonClasses('requester')}
            >
              依頼フォーム
            </button>
            <button
              onClick={() => setActiveView('admin')}
              className={getButtonClasses('admin')}
            >
              管理ダッシュボード
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
