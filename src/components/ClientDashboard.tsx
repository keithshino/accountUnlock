import React from 'react';
import { Task } from '../types';
import RequestForm from './RequestForm'; // 既存の依頼フォームを再利用する

// App.tsxから渡されるデータの型を定義
interface ClientDashboardProps {
    tasks: Task[]; // ログインしとるユーザーのタスクリスト
    userProfile: any; // ユーザー情報
    onAddTasks: (data: any) => Promise<void>; // 依頼を登録する関数
}

// 日付を読みやすい形式に変換する関数
const formatDate = (timestamp: any) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleString('ja-JP', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
        });
    }
    return String(timestamp);
};

const ClientDashboard: React.FC<ClientDashboardProps> = ({ tasks, userProfile, onAddTasks }) => {
    return (
        <div className="space-y-8">
            {/* 既存の依頼フォームコンポーネントをここに配置 */}
            <RequestForm onAddTasks={onAddTasks} userProfile={userProfile} />

            {/* 送信履歴のセクション */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">送信履歴 (直近10件)</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">依頼ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">受付日時</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">対象社員名</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">報告状況</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {tasks.length > 0 ? (
                                tasks.map((task) => (
                                    <tr key={task.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(task.createdAt)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.employeeName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{task.status}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{task.reportStatus}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500">送信履歴はありません。</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;