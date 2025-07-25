
import React, { useState } from 'react';
import { Task, TaskStatus, ReportStatus } from './types';
import { INITIAL_TASKS } from './constants';
import Header from './components/Header';
import RequestForm from './components/RequestForm';
import AdminDashboard from './components/AdminDashboard';

export type View = 'requester' | 'admin';

function App() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [view, setView] = useState<View>('requester');

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

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-800">
      <Header activeView={view} setActiveView={setView} />
      <main className="p-4 sm:p-6 lg:p-8">
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