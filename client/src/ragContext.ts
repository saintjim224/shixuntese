import { api } from './api/client';
import type { Application, RagUserContext, ResumeDocument, ResumePayload, User } from './types';

const RAG_RESUME_DRAFT_KEY = 'qitoffer-rag-current-resume-draft';

export async function buildRagUserContext(user: User | null): Promise<RagUserContext | undefined> {
  if (!user) {
    return undefined;
  }

  const context: RagUserContext = {
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone
    },
    resumeDocuments: [],
    applications: []
  };

  const [resumeResult, applicationResult] = await Promise.allSettled([api.resume(), api.applications()]);
  if (resumeResult.status === 'fulfilled') {
    applyResumeContext(context, resumeResult.value);
  }
  applyResumeDraft(context, user.id);
  if (applicationResult.status === 'fulfilled') {
    context.applications = applicationResult.value.items.slice(0, 30).map(applicationContext);
  }

  return context;
}

export function saveRagResumeDraft(user: User | null, values: Record<string, unknown>, payload: ResumePayload) {
  if (!user) {
    return;
  }
  const resume = payload.resume || {};
  const draft = {
    userId: user.id,
    updatedAt: Date.now(),
    resume: {
      fullName: values.fullName || resume.full_name || user.fullName,
      full_name: values.fullName || resume.full_name || user.fullName,
      email: values.email || resume.email || user.email,
      phone: values.phone || resume.phone || user.phone,
      gender: values.gender || resume.gender,
      birthDate: values.birthDate || resume.birth_date,
      birth_date: values.birthDate || resume.birth_date,
      education: values.education || resume.education,
      major: values.major || resume.major,
      yearsExperience: values.yearsExperience ?? resume.years_experience,
      years_experience: values.yearsExperience ?? resume.years_experience,
      expectedCity: values.expectedCity || resume.expected_city,
      expected_city: values.expectedCity || resume.expected_city,
      expectedSalary: values.expectedSalary || resume.expected_salary,
      expected_salary: values.expectedSalary || resume.expected_salary,
      skills: values.skills || resume.skills,
      selfIntro: values.selfIntro || resume.self_intro,
      self_intro: values.selfIntro || resume.self_intro
    },
    resumeModules: {
      educations: payload.educations || [],
      experiences: payload.experiences || [],
      projects: payload.projects || [],
      skills: payload.skills || [],
      certificates: payload.certificates || []
    }
  };
  sessionStorage.setItem(RAG_RESUME_DRAFT_KEY, JSON.stringify(draft));
}

function applyResumeContext(context: RagUserContext, payload: ResumePayload) {
  context.resume = payload.resume as Record<string, unknown>;
  context.resumeModules = {
    educations: payload.educations as unknown as Array<Record<string, unknown>>,
    experiences: payload.experiences as unknown as Array<Record<string, unknown>>,
    projects: payload.projects as unknown as Array<Record<string, unknown>>,
    skills: payload.skills as unknown as Array<Record<string, unknown>>,
    certificates: payload.certificates as unknown as Array<Record<string, unknown>>
  };
  context.resumeDocuments = (payload.documents || []).slice(0, 8).map(documentContext);
}

function applyResumeDraft(context: RagUserContext, userId: number) {
  try {
    const raw = sessionStorage.getItem(RAG_RESUME_DRAFT_KEY);
    if (!raw) return;
    const draft = JSON.parse(raw) as {
      userId?: number;
      resume?: Record<string, unknown>;
      resumeModules?: Record<string, Array<Record<string, unknown>>>;
    };
    if (draft.userId !== userId) return;
    context.resume = { ...(context.resume || {}), ...(draft.resume || {}) };
    context.resumeModules = { ...(context.resumeModules || {}), ...(draft.resumeModules || {}) };
  } catch {
    sessionStorage.removeItem(RAG_RESUME_DRAFT_KEY);
  }
}

function documentContext(item: ResumeDocument): Record<string, unknown> {
  return {
    id: item.id,
    originalFilename: item.original_filename,
    mimeType: item.mime_type,
    parsedText: item.parsed_text,
    analysisJson: item.analysis_json,
    createdAt: item.created_at
  };
}

function applicationContext(item: Application): Record<string, unknown> {
  return {
    id: item.id,
    status: item.status,
    interviewResponse: item.interview_response,
    title: item.title,
    companyName: item.company_name,
    city: item.city,
    appliedAt: item.applied_at,
    resumeFilename: item.resume_filename,
    message: item.message
  };
}
