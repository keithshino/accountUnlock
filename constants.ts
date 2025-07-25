
import { Task, TaskStatus, ReportStatus } from './types';

export const INITIAL_TASKS: Task[] = [
  {
    id: 1,
    createdAt: '2025/07/26 10:30',
    requesterName: 'BTEC 太郎',
    requesterEmail: 'taro.btec@example.com',
    employeeName: 'TOKIUM 花子',
    employeeId: '12345',
    status: TaskStatus.NEW,
    reportStatus: ReportStatus.UNREPORTED,
    log: '初回依頼です。'
  },
  {
    id: 2,
    createdAt: '2025/07/26 11:00',
    requesterName: 'BTEC 次郎',
    requesterEmail: 'jiro.btec@example.com',
    employeeName: 'TOKIUM 一郎',
    employeeId: '54321',
    status: TaskStatus.IN_PROGRESS,
    reportStatus: ReportStatus.UNREPORTED,
    log: ''
  },
  {
    id: 3,
    createdAt: '2025/07/25 18:00',
    requesterName: 'BTEC 三郎',
    requesterEmail: 'saburo.btec@example.com',
    employeeName: 'TOKIUM 未来',
    employeeId: '67890',
    status: TaskStatus.RESOLVED,
    reportStatus: ReportStatus.REPORTED,
    log: '無事解除完了。'
  }
];

export const TASK_STATUS_OPTIONS: TaskStatus[] = Object.values(TaskStatus);
export const REPORT_STATUS_OPTIONS: ReportStatus[] = Object.values(ReportStatus);
