import type {
  AdminApplication,
  AdminDashboard,
  AdminResume,
  AdminResumeDetail,
  AdminUser,
  Application,
  CityStats,
  Company,
  CompanyListResult,
  Job,
  MapStats,
  PagedResult,
  PlatformStats,
  RagChatRequest,
  RagChatResponse,
  RagHealth,
  RagSource,
  ResumeAnalysis,
  ResumeDocument,
  ResumePayload,
  SystemLog,
  User,
  VisionAnalyzeResponse
} from '../types';

function contextPath() {
  const idx = window.location.pathname.indexOf('/app');
  return idx > 0 ? window.location.pathname.slice(0, idx) : '';
}

const API_BASE = import.meta.env.VITE_API_BASE || `${contextPath()}/api`;
const RAG_BASE = (import.meta.env.VITE_RAG_BASE_URL || 'http://127.0.0.1:8010').replace(/\/$/, '');

export function assetUrl(path?: string) {
  if (!path) return './assets/it-logo.png';
  if (/^(https?:|data:)/.test(path)) return path;
  return `${contextPath()}${path.startsWith('/') ? path : `/${path}`}`;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...init,
    headers
  });
  const text = await response.text();
  let data: unknown = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error('后端服务暂时不可用，请确认接口服务已启动。');
  }
  if (!response.ok) {
    const message = typeof data === 'object' && data && 'message' in data ? String(data.message || '') : '';
    throw new Error(message || '请求失败');
  }
  return data as T;
}

async function externalRequest<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(url, {
    ...init,
    headers
  });
  const text = await response.text();
  let data: unknown = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error('智能问答服务暂时不可用，请确认 Python RAG 服务已启动。');
  }
  if (!response.ok) {
    const message = typeof data === 'object' && data && 'detail' in data ? String(data.detail || '') : '';
    throw new Error(message || '请求失败');
  }
  return data as T;
}

export const api = {
  me: () => request<{ authenticated: boolean; user: User | Record<string, never> }>('/auth/me'),
  login: (payload: { username: string; password: string }) =>
    request<{ user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload: { username: string; password: string; fullName: string; email: string; phone: string }) =>
    request<{ user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),
  changePassword: (payload: { oldPassword: string; newPassword: string }) =>
    request<{ message: string }>('/auth/password', { method: 'PUT', body: JSON.stringify(payload) }),
  jobs: (params = '') => request<PagedResult<Job>>(`/jobs${params}`),
  job: (id: string) => request<{ job: Job; related: Job[] }>(`/jobs/${id}`),
  apply: (id: string, payload: string | { message?: string; resumeDocumentId?: number | null }) => {
    const body = typeof payload === 'string' ? { message: payload } : payload;
    return request<{ id: number; message: string }>(`/jobs/${id}/apply`, { method: 'POST', body: JSON.stringify(body) });
  },
  favoriteJob: (id: number | string) => request<{ message: string }>(`/jobs/${id}/favorite`, { method: 'POST' }),
  unfavoriteJob: (id: number | string) => request<{ message: string }>(`/jobs/${id}/favorite`, { method: 'DELETE' }),
  companies: (params = '') => request<CompanyListResult>(`/companies${params}`),
  company: (id: string) => request<{ company: Company; jobs: Job[]; recommended: Company[] }>(`/companies/${id}`),
  stats: () => request<PlatformStats>('/stats'),
  cityStats: () => request<CityStats>('/stats/cities'),
  mapStats: () => request<MapStats>('/stats/map'),
  resume: () => request<ResumePayload>('/resume'),
  saveResume: (payload: Record<string, unknown>) =>
    request<ResumePayload>('/resume', { method: 'PUT', body: JSON.stringify(payload) }),
  uploadPhoto: (form: FormData) =>
    request<{ photoUrl: string }>('/resume/photo', { method: 'POST', body: form }),
  resumeDocuments: () => request<{ items: ResumeDocument[] }>('/resume/documents'),
  uploadResumeDocument: (form: FormData) =>
    request<{ document: ResumeDocument }>('/resume/documents', { method: 'POST', body: form }),
  updateResumeDocumentAnalysis: (id: number, payload: { parsedText?: string; analysis?: ResumeAnalysis }) =>
    request<{ document: ResumeDocument }>(`/resume/documents/${id}/analysis`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteResumeDocument: (id: number) =>
    request<{ items: ResumeDocument[] }>(`/resume/documents/${id}`, { method: 'DELETE' }),
  resumeModule: (module: string) => request<{ items: unknown[] }>(`/resume/${module}`),
  createResumeModule: (module: string, payload: Record<string, unknown>) =>
    request<{ items: unknown[] }>(`/resume/${module}`, { method: 'POST', body: JSON.stringify(payload) }),
  updateResumeModule: (module: string, id: number, payload: Record<string, unknown>) =>
    request<{ items: unknown[] }>(`/resume/${module}/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteResumeModule: (module: string, id: number) =>
    request<{ items: unknown[] }>(`/resume/${module}/${id}`, { method: 'DELETE' }),
  applications: (params = '') => request<{ items: Application[] }>(`/applications${params}`),
  respondInterview: (id: number, response: 'ACCEPTED' | 'DECLINED') =>
    request<{ message: string }>(`/applications/${id}/response`, { method: 'PUT', body: JSON.stringify({ response }) }),
  admin: {
    dashboard: () => request<AdminDashboard>('/admin/dashboard'),
    companies: () => request<{ items: Company[] }>('/admin/companies'),
    createCompany: (payload: Record<string, unknown>) =>
      request<{ message: string }>('/admin/companies', { method: 'POST', body: JSON.stringify(payload) }),
    updateCompany: (id: number, payload: Record<string, unknown>) =>
      request<{ message: string }>(`/admin/companies/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    deleteCompany: (id: number) => request<{ message: string }>(`/admin/companies/${id}`, { method: 'DELETE' }),
    jobs: () => request<{ items: Job[]; companies: Company[] }>('/admin/jobs'),
    createJob: (payload: Record<string, unknown>) =>
      request<{ message: string }>('/admin/jobs', { method: 'POST', body: JSON.stringify(payload) }),
    updateJob: (id: number, payload: Record<string, unknown>) =>
      request<{ message: string }>(`/admin/jobs/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    deleteJob: (id: number) => request<{ message: string }>(`/admin/jobs/${id}`, { method: 'DELETE' }),
    applications: () => request<{ items: AdminApplication[] }>('/admin/applications'),
    updateApplicationStatus: (id: number, status: Application['status']) =>
      request<{ message: string }>(`/admin/applications/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    resumes: () => request<{ items: AdminResume[] }>('/admin/resumes'),
    resumeDetail: (userId: number) => request<AdminResumeDetail>(`/admin/resumes/${userId}`),
    users: () => request<{ items: AdminUser[] }>('/admin/users'),
    createUser: (payload: Record<string, unknown>) =>
      request<{ message: string }>('/admin/users', { method: 'POST', body: JSON.stringify(payload) }),
    updateUser: (id: number, payload: Record<string, unknown>) =>
      request<{ message: string }>(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    toggleUser: (id: number) => request<{ message: string }>(`/admin/users/${id}/toggle`, { method: 'PATCH' }),
    deleteUser: (id: number) => request<{ message: string }>(`/admin/users/${id}`, { method: 'DELETE' }),
    logs: () => request<{ items: SystemLog[] }>('/admin/logs')
  },
  rag: {
    health: () => externalRequest<RagHealth>(`${RAG_BASE}/health`),
    sources: () => externalRequest<{ items: RagSource[]; total: number }>(`${RAG_BASE}/sources`),
    rebuild: () => externalRequest<{ status: string; documents: number; embeddedDocuments?: number }>(`${RAG_BASE}/index/rebuild`, { method: 'POST' }),
    chat: (payload: RagChatRequest) =>
      externalRequest<RagChatResponse>(`${RAG_BASE}/chat`, { method: 'POST', body: JSON.stringify(payload) }),
    analyzeResume: (form: FormData) =>
      externalRequest<ResumeAnalysis>(`${RAG_BASE}/resume/analyze`, { method: 'POST', body: form }),
    analyzeVision: (form: FormData) =>
      externalRequest<VisionAnalyzeResponse>(`${RAG_BASE}/vision/analyze`, { method: 'POST', body: form })
  }
};
