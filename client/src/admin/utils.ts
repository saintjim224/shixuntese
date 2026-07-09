import type { FilterValue } from './types';

export function tablePagination(total: number) {
  return {
    pageSize: 8,
    showSizeChanger: false,
    showTotal: () => `共${total}条记录`
  };
}

export function textIncludes(source: unknown, filter: FilterValue) {
  const keyword = String(filter || '').trim().toLowerCase();
  if (!keyword) return true;
  return String(source || '').toLowerCase().includes(keyword);
}

export function exactOrEmpty(source: unknown, filter: FilterValue) {
  const value = String(filter || '').trim();
  if (!value) return true;
  return String(source || '') === value;
}

export function dateText(value?: string | number) {
  if (value === undefined || value === null || value === '') return '-';
  const raw = String(value);
  if (/^\d{13}$/.test(raw)) return new Date(Number(raw)).toISOString().slice(0, 10);
  if (/^\d{10}$/.test(raw)) return new Date(Number(raw) * 1000).toISOString().slice(0, 10);
  return raw.slice(0, 10);
}

export function contextPath() {
  const pathname = window.location.pathname;
  for (const marker of ['/app', '/admin', '/manage', '/api']) {
    const index = pathname.indexOf(marker);
    if (index > 0) return pathname.slice(0, index);
  }
  return '';
}

export function frontHref() {
  const ctx = contextPath();
  return ctx ? `${ctx}/app/#/` : '#/';
}
