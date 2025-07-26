import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, ReportStatus } from '../types';
import { TASK_STATUS_OPTIONS, REPORT_STATUS_OPTIONS } from '../constants';
import Modal from './Modal';

interface AdminDashboardProps {
    tasks: Task[];
    onUpdateTask: (updatedTask: Task) => Promise<void>;
}

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const formatDate = (timestamp: any) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleString('ja-JP', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
        });
    }
    return String(timestamp);
};

const EditTaskModal: React.FC<{
    task: Task;
    onClose: () => void;
    onUpdate: (updatedTask: Task) => void;
}> = ({ task, onClose, onUpdate }) => {
    const [status, setStatus] = useState(task.status);
    const [reportStatus, setReportStatus] = useState(task.reportStatus);
    const [log, setLog] = useState(task.log);

    useEffect(() => {
        setStatus(task.status);
        setReportStatus(task.reportStatus);
        setLog(task.log);
    }, [task]);

    const handleUpdate = () => {
        onUpdate({ ...task, status, reportStatus, log });
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={`タスク詳細 (ID: ${task.id})`}
            footer={
                <>
                    <button onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">
                        キャンセル
                    </button>
                    <button onClick={handleUpdate} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm">
                        更新
                    </button>
                </>
            }
        >
            <div className="space-y-4 text-sm">
                <div><strong>受付日時:</strong> {formatDate(task.createdAt)}</div>
                <div><strong>依頼者:</strong> {task.requesterName} ({task.requesterEmail})</div>
                <div><strong>対象社員:</strong> {task.employeeName} (社員番号: {task.employeeId})</div>
                <hr />
                <div className="space-y-2">
                    <div>
                        <label htmlFor="status" className="block font-medium text-gray-700">Status</label>
                        <select id="status" value={status} onChange={e => setStatus(e.target.value as TaskStatus)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                            {TASK_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="reportStatus" className="block font-medium text-gray-700">報告状況</label>
                        <select id="reportStatus" value={reportStatus} onChange={e => setReportStatus(e.target.value as ReportStatus)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                            {REPORT_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="log" className="block font-medium text-gray-700">Log (備考)</label>
                        <textarea id="log" value={log} onChange={e => setLog(e.target.value)} rows={4} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2"></textarea>
                    </div>
                </div>
            </div>
        </Modal>
    );
};


const AdminDashboard: React.FC<AdminDashboardProps> = ({ tasks, onUpdateTask }) => {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    type FilterOption = TaskStatus | 'all';
    const [filterStatus, setFilterStatus] = useState<FilterOption>('all');

    // ★★★ 報告状況フィルタリング用のStateを追加するばい！ ★★★
    type ReportFilterOption = ReportStatus | 'all';
    // デフォルトは「未報告」のみを抽出したいので 'unreported' を初期値にする
    const [filterReportStatus, setFilterReportStatus] = useState<ReportFilterOption>(ReportStatus.UNREPORTED);

    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

    // tasks, filterStatus, filterReportStatus が変わったら、フィルタリングを適用するばい！
    useEffect(() => {
        let currentFilteredTasks = tasks;

        // ステータスフィルタリングを適用
        if (filterStatus !== 'all') {
            currentFilteredTasks = currentFilteredTasks.filter(task => task.status === filterStatus);
        }

        // ★★★ 報告状況フィルタリングを適用するばい！ ★★★
        if (filterReportStatus !== 'all') {
            currentFilteredTasks = currentFilteredTasks.filter(task => task.reportStatus === filterReportStatus);
        }

        setFilteredTasks(currentFilteredTasks);
    }, [tasks, filterStatus, filterReportStatus]); // 依存配列に filterReportStatus も含める

    const handleUpdateTask = (updatedTask: Task) => {
        onUpdateTask(updatedTask);
        setSelectedTask(null);
    };

    const getStatusBadge = (status: TaskStatus) => {
        const baseClasses = 'px-3 py-1 text-xs font-semibold rounded-full inline-block';
        const colorMap: Record<TaskStatus, string> = {
            [TaskStatus.NEW]: 'bg-blue-100 text-blue-800',
            [TaskStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
            [TaskStatus.RESOLVED]: 'bg-green-100 text-green-800',
            [TaskStatus.CANNOT_RESOLVE]: 'bg-red-100 text-red-800',
        };
        return `${baseClasses} ${colorMap[status]}`;
    };

    const getReportStatusBadge = (status: ReportStatus) => {
        const baseClasses = 'px-3 py-1 text-xs font-semibold rounded-full inline-block';
        const colorMap: Record<ReportStatus, string> = {
            [ReportStatus.UNREPORTED]: 'bg-gray-100 text-gray-800',
            [ReportStatus.REPORTED]: 'bg-purple-100 text-purple-800',
        };
        return `${baseClasses} ${colorMap[status]}`;
    };

    const sortedTasks = [...filteredTasks].sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return dateB - dateA;
    });

    // ★★★ フィルタリングボタンのスタイルを決定するヘルパー関数 ★★★
    const getFilterButtonClasses = (currentFilter: ReportFilterOption, buttonValue: ReportFilterOption) => {
        const base = "py-2 px-4 rounded-full text-sm font-medium transition-colors";
        if (currentFilter === buttonValue) {
            return `${base} bg-blue-600 text-white`; // 選択中のスタイル
        } else {
            return `${base} bg-gray-200 text-gray-700 hover:bg-gray-300`; // 通常のスタイル
        }
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">依頼一覧</h2>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-4">
                {/* ステータスフィルタリングUI (そのまま) */}
                <div className="flex items-center space-x-3">
                    <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">
                        ステータスで絞り込む:
                    </label>
                    <select
                        id="statusFilter"
                        name="statusFilter"
                        className="mt-1 block w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as FilterOption)}
                    >
                        <option value="all">全てのステータス</option>
                        {TASK_STATUS_OPTIONS.map(statusOption => (
                            <option key={statusOption} value={statusOption}>
                                {statusOption}
                            </option>
                        ))}
                    </select>
                </div>

                {/* ★★★ 報告状況フィルタリングUIを追加するばい！ ★★★ */}
                <div className="flex items-center space-x-3">
                    <label className="block text-sm font-medium text-gray-700">
                        報告状況:
                    </label>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setFilterReportStatus(ReportStatus.UNREPORTED)}
                            className={getFilterButtonClasses(filterReportStatus, ReportStatus.UNREPORTED)}
                        >
                            未報告
                        </button>
                        <button
                            onClick={() => setFilterReportStatus(ReportStatus.REPORTED)}
                            className={getFilterButtonClasses(filterReportStatus, ReportStatus.REPORTED)}
                        >
                            報告済
                        </button>
                        <button
                            onClick={() => setFilterReportStatus('all')}
                            className={getFilterButtonClasses(filterReportStatus, 'all')}
                        >
                            全て
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {['ID', '受付日時', '依頼者名', '社員番号', '社員氏名', 'Status', '報告状況', '詳細'].map(header => (
                                <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedTasks.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                                    表示する依頼はありません。
                                </td>
                            </tr>
                        ) : (
                            sortedTasks.map((task) => (
                                <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(task.createdAt)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.requesterName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.employeeId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.employeeName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={getStatusBadge(task.status)}>{task.status}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={getReportStatusBadge(task.reportStatus)}>{task.reportStatus}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <button onClick={() => setSelectedTask(task)} className="text-blue-600 hover:text-blue-900 flex items-center gap-1 p-2 rounded-md hover:bg-blue-100 transition-colors">
                                            <SearchIcon className="inline" />
                                            <span className="hidden sm:inline">詳細</span>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {selectedTask && (
                <EditTaskModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onUpdate={handleUpdateTask}
                />
            )}
        </div>
    );
};

export default AdminDashboard;