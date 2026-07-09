import {
  BriefcaseBusiness,
  Building2,
  FileClock,
  FileSearch,
  LayoutDashboard,
  LockKeyhole,
  ScrollText,
  UsersRound
} from 'lucide-react';
import type { AdminUser, Application, Role } from '../types';

export const applicationStatusText: Record<Application['status'], string> = {
  SUBMITTED: '已申请',
  VIEWED: '已查看',
  INVITED: '已面试',
  REJECTED: '不合适'
};

export const applicationStatusColor: Record<Application['status'], string> = {
  SUBMITTED: 'blue',
  VIEWED: 'cyan',
  INVITED: 'green',
  REJECTED: 'red'
};

export const roleText: Record<Role, string> = {
  APPLICANT: '普通用户',
  ADMIN: '系统管理员'
};

export const userStatusText: Record<AdminUser['status'], string> = {
  ACTIVE: '启用',
  DISABLED: '停用'
};

export const colors = ['#1665d8', '#00a4bd', '#36a66a', '#f5a623', '#d64545'];

export const menuGroups = [
  {
    title: '企业职位管理',
    items: [
      { to: '/admin', label: '后台首页', icon: <LayoutDashboard size={17} />, end: true },
      { to: '/admin/applications', label: '职位申请查看', icon: <FileClock size={17} /> },
      { to: '/admin/jobs', label: '职位管理', icon: <BriefcaseBusiness size={17} /> },
      { to: '/admin/companies', label: '企业管理', icon: <Building2 size={17} /> }
    ]
  },
  {
    title: '资料用户管理',
    items: [
      { to: '/admin/resumes', label: '简历管理', icon: <FileSearch size={17} /> },
      { to: '/admin/users', label: '用户管理', icon: <UsersRound size={17} /> }
    ]
  },
  {
    title: '系统设置',
    items: [
      { to: '/admin/system', label: '系统管理', icon: <ScrollText size={17} /> },
      { to: '/admin/password', label: '密码修改', icon: <LockKeyhole size={17} /> }
    ]
  }
];

export const routeTitles: Record<string, string> = {
  '/admin': '后台首页',
  '/admin/applications': '职位申请查看',
  '/admin/jobs': '职位管理',
  '/admin/companies': '企业管理',
  '/admin/resumes': '简历管理',
  '/admin/users': '用户管理',
  '/admin/system': '系统管理',
  '/admin/logs': '系统管理',
  '/admin/password': '密码修改'
};

export function applicationStatusOptions() {
  return Object.entries(applicationStatusText).map(([value, label]) => ({ value, label }));
}

export function roleOptions() {
  return Object.entries(roleText).map(([value, label]) => ({ value, label }));
}

export function userStatusOptions() {
  return Object.entries(userStatusText).map(([value, label]) => ({ value, label }));
}
