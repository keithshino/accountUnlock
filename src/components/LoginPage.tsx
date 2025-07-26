import React, { useState } from 'react';

// ★ 新規登録で渡すデータの型を定義
export interface SignUpData {
    email: string;
    pass: string;
    name: string;
    company: string;
    phone?: string;
}

interface LoginPageProps {
    onEmailLogin: (email: string, pass: string) => void;
    onGoogleLogin: () => void;
    onEmailSignUp: (data: SignUpData) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onEmailLogin, onGoogleLogin, onEmailSignUp }) => {
    const [userType, setUserType] = useState<'client' | 'support'>('client');
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

    // ★ フォームの入力値をまとめて管理
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        company: '',
        phone: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (authMode === 'login') {
            onEmailLogin(formData.email, formData.password);
        } else {
            onEmailSignUp({
                email: formData.email,
                pass: formData.password,
                name: formData.name,
                company: formData.company,
                phone: formData.phone,
            });
        }
    };

    const toggleAuthMode = () => {
        setAuthMode(prevMode => prevMode === 'login' ? 'signup' : 'login');
        // モード切替時にフォームをリセット
        setFormData({ email: '', password: '', name: '', company: '', phone: '' });
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg">
                <div className="flex border-b">
                    <button
                        onClick={() => setUserType('client')}
                        className={`flex-1 py-4 text-center font-semibold rounded-tl-xl transition-colors ${userType === 'client' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                    >
                        クライアント様
                    </button>
                    <button
                        onClick={() => setUserType('support')}
                        className={`flex-1 py-4 text-center font-semibold rounded-tr-xl transition-colors ${userType === 'support' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                    >
                        サポート窓口用
                    </button>
                </div>

                <div className="p-8">
                    {userType === 'client' ? (
                        <form onSubmit={handleSubmit}>
                            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">{authMode === 'login' ? 'ログイン' : '新規登録'}</h2>
                            <div className="space-y-4">
                                {/* ★ 新規登録の時だけ追加フォームを表示 ★ */}
                                {authMode === 'signup' && (
                                    <>
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">氏名 <span className="text-red-500">*</span></label>
                                            <input type="text" id="name" value={formData.name} onChange={handleInputChange} className="mt-1 w-full p-3 border rounded-md" required />
                                        </div>
                                        <div>
                                            <label htmlFor="company" className="block text-sm font-medium text-gray-700">会社名 <span className="text-red-500">*</span></label>
                                            <input type="text" id="company" value={formData.company} onChange={handleInputChange} className="mt-1 w-full p-3 border rounded-md" required />
                                        </div>
                                    </>
                                )}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">メールアドレス <span className="text-red-500">*</span></label>
                                    <input type="email" id="email" value={formData.email} onChange={handleInputChange} className="mt-1 w-full p-3 border rounded-md" required />
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">パスワード <span className="text-red-500">*</span></label>
                                    <input type="password" id="password" value={formData.password} onChange={handleInputChange} className="mt-1 w-full p-3 border rounded-md" required />
                                </div>
                                {authMode === 'signup' && (
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">電話番号</label>
                                        <input type="tel" id="phone" value={formData.phone} onChange={handleInputChange} className="mt-1 w-full p-3 border rounded-md" />
                                    </div>
                                )}
                            </div>
                            <div className="mt-8">
                                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700">
                                    {authMode === 'login' ? 'ログイン' : '登録する'}
                                </button>
                            </div>
                            <div className="text-center mt-4">
                                <button type="button" onClick={toggleAuthMode} className="text-sm text-blue-600 hover:underline">
                                    {authMode === 'login' ? 'アカウントをお持ちでないですか？新規登録' : 'すでにアカウントをお持ちですか？ログイン'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        // ... サポート窓口用のコードはそのまま ...
                        <div>
                            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">ログイン</h2>
                            <p className="text-center text-gray-600 mb-6">Googleアカウントでログインしてください。</p>
                            <button
                                onClick={onGoogleLogin}
                                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <svg className="w-6 h-6" viewBox="0 0 48 48">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.53-4.18 7.09-10.36 7.09-17.65z"></path>
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                    <path fill="none" d="M0 0h48v48H0z"></path>
                                </svg>
                                Googleでログイン
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;