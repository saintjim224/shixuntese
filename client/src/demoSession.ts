import type { ResumePayload, User } from './types';

export const DEMO_SESSION_KEY = 'qitoffer.demo.user';

export const DEMO_USER: User = {
  id: 202607,
  username: 'applicant',
  role: 'APPLICANT',
  fullName: '演示求职者',
  email: 'applicant@example.local',
  phone: '13800002026'
};

export function isDemoAccount(username?: string, password?: string) {
  return username === 'applicant' && password === 'applicant123';
}

export function isBackendUnavailable(error: unknown) {
  return error instanceof Error && error.message.includes('后端服务暂时不可用');
}

export function enableDemoSession() {
  window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(DEMO_USER));
}

export function clearDemoSession() {
  window.localStorage.removeItem(DEMO_SESSION_KEY);
}

export function readDemoUser(): User | null {
  try {
    const raw = window.localStorage.getItem(DEMO_SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function demoResumePayload(user: User = DEMO_USER): ResumePayload {
  return {
    resume: {
      full_name: user.fullName,
      email: user.email,
      phone: user.phone,
      education: '本科',
      major: '软件工程',
      years_experience: 1,
      expected_city: '成都 / 杭州',
      expected_salary: '8k-12k',
      skills: 'React, TypeScript, Java Web, MySQL, Spring Boot',
      self_intro: '熟悉前后端基础开发流程，完成过招聘平台、简历管理和投递状态跟踪等实训项目。'
    },
    educations: [
      {
        id: 1,
        school: '西南民族大学',
        degree: '本科',
        major: '软件工程',
        start_date: '2023-09',
        end_date: '2027-06',
        description: '主修 Web 开发、数据库系统、软件工程和前端工程化。'
      }
    ],
    experiences: [
      {
        id: 1,
        company: 'Q_ITOffer 实训项目组',
        position: '前端开发实习生',
        start_date: '2026-06',
        end_date: '2026-07',
        description: '负责招聘首页、职位检索、企业展示和简历模块的前端实现。'
      }
    ],
    projects: [
      {
        id: 1,
        name: '锐聘 Q_ITOffer 校园招聘平台',
        role_name: '前端与联调',
        tech_stack: 'React, Ant Design, Servlet, MySQL',
        start_date: '2026-06',
        end_date: '2026-07',
        description: '实现职位搜索、企业列表、简历维护、申请跟踪和后台管理等核心流程。'
      }
    ],
    skills: [
      { id: 1, name: 'React', level_name: '熟练' },
      { id: 2, name: 'TypeScript', level_name: '熟悉' },
      { id: 3, name: 'Java Web', level_name: '熟悉' },
      { id: 4, name: 'MySQL', level_name: '熟悉' }
    ],
    certificates: [
      {
        id: 1,
        name: '校内暑期实训项目',
        issuer: '软件工程实训课程',
        acquired_date: '2026-07',
        description: '完成招聘平台端到端设计、开发与答辩演示。'
      }
    ]
  };
}
