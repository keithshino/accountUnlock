import { Timestamp } from 'firebase/firestore';

export enum TaskStatus {
  NEW = '新規受付',
  IN_PROGRESS = '対応中',
  RESOLVED = 'ロック解除済み',
  CANNOT_RESOLVE = '対応不可（ロックなし）',
}

export enum ReportStatus {
  UNREPORTED = '未報告',
  REPORTED = '報告済み',
}

export interface Task {
  id: string;
  createdAt: Timestamp;
  requesterName: string;
  requesterEmail: string;
  employeeName: string;
  employeeId: string;
  status: TaskStatus;
  reportStatus: ReportStatus;
  log: string;
  completedBy?: string; // ★ この行を追加！
  completedAt?: any;    // ★ この行を追加！
}
