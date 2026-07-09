import { Tag } from 'antd';
import type { AdminUser, Application, Role } from '../types';
import { applicationStatusColor, applicationStatusText, roleText, userStatusText } from './constants';

export function renderApplicationStatus(value: Application['status']) {
  return <Tag color={applicationStatusColor[value]}>{applicationStatusText[value] || value}</Tag>;
}

export function renderRole(value: Role) {
  const color = value === 'SUPER_ADMIN' ? 'gold' : value === 'ADMIN' ? 'blue' : 'green';
  return <Tag color={color}>{roleText[value]}</Tag>;
}

export function renderUserStatus(value: AdminUser['status']) {
  return <Tag color={value === 'ACTIVE' ? 'green' : 'red'}>{userStatusText[value]}</Tag>;
}
