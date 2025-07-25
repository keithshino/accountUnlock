import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';

// ユーザー情報の型を定義
interface UserProfile {
    name: string;
    company: string;
    email: string;
    phone?: string;
}

// このコンポーネントが受け取るデータの型を定義
interface ProfilePageProps {
    user: User;
    userProfile: UserProfile | null;
    onUpdateProfile: (updatedProfile: Partial<UserProfile>) => Promise<void>;
    onBack: () => void; // 戻るボタン用の関数
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, userProfile, onUpdateProfile, onBack }) => {
    const [profileData, setProfileData] = useState({
        name: '',
        company: '',
        phone: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    // 最初にユーザー情報が読み込まれたら、フォームにセットする
    useEffect(() => {
        if (userProfile) {
            setProfileData({
                name: userProfile.name,
                company: userProfile.company,
                phone: userProfile.phone || '',
            });
        }
    }, [userProfile]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setProfileData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onUpdateProfile(profileData);
            alert('プロフィールを更新しました！');
        } catch (error) {
            alert('更新に失敗しました。');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">プロフィール編集</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">メールアドレス（変更不可）</label>
                        <p className="mt-1 p-3 bg-gray-100 rounded-md text-gray-500">{user.email}</p>
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">氏名</label>
                        <input
                            type="text"
                            id="name"
                            value={profileData.name}
                            onChange={handleInputChange}
                            className="mt-1 w-full p-3 border rounded-md"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700">会社名</label>
                        <input
                            type="text"
                            id="company"
                            value={profileData.company}
                            onChange={handleInputChange}
                            className="mt-1 w-full p-3 border rounded-md"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">電話番号</label>
                        <input
                            type="tel"
                            id="phone"
                            value={profileData.phone}
                            onChange={handleInputChange}
                            className="mt-1 w-full p-3 border rounded-md"
                        />
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={onBack}
                            className="py-2 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            戻る
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {isLoading ? '更新中...' : '更新する'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;