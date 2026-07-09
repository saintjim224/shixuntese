export type Role = 'APPLICANT' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: number;
  username: string;
  role: Role;
  fullName: string;
  email?: string;
  phone?: string;
}

export interface Company {
  id: number;
  name: string;
  logo_url?: string;
  banner_url?: string;
  city: string;
  industry: string;
  scale?: string;
  founded_year?: number;
  financing_stage?: string;
  rating?: number;
  website?: string;
  description?: string;
  job_count?: number;
}

export interface Job {
  id: number;
  company_id: number;
  title: string;
  category: string;
  salary_min: number;
  salary_max: number;
  city: string;
  education?: string;
  experience?: string;
  headcount: number;
  highlights?: string;
  description?: string;
  requirement_text?: string;
  status: 'OPEN' | 'CLOSED';
  posted_at?: string;
  company_name?: string;
  company_logo?: string;
  company_industry?: string;
  company_description?: string;
  favorited?: boolean | number;
}

export interface Resume {
  full_name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  birth_date?: string;
  education?: string;
  major?: string;
  years_experience?: number;
  expected_city?: string;
  expected_salary?: string;
  skills?: string;
  self_intro?: string;
  photo_url?: string;
}

export interface ResumeEducation {
  id?: number;
  school: string;
  degree?: string;
  major?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  sort_order?: number;
}

export interface ResumeExperience {
  id?: number;
  company: string;
  position?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  sort_order?: number;
}

export interface ResumeProject {
  id?: number;
  name: string;
  role_name?: string;
  tech_stack?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  sort_order?: number;
}

export interface ResumeSkill {
  id?: number;
  name: string;
  level_name?: string;
  sort_order?: number;
}

export interface ResumeCertificate {
  id?: number;
  name: string;
  issuer?: string;
  acquired_date?: string;
  description?: string;
  sort_order?: number;
}

export interface JobMatchResult {
  jobId?: number;
  title: string;
  company?: string;
  city?: string;
  category?: string;
  salary?: string;
  score?: number;
  reason?: string;
}

export interface ResumeAnalysis {
  fileName: string;
  extractedText: string;
  summary: string;
  profile: {
    fullName?: string;
    email?: string;
    phone?: string;
    education?: string;
    major?: string;
    expectedCity?: string;
    skills?: string[];
    selfIntro?: string;
    [key: string]: unknown;
  };
  skills: string[];
  directions: string[];
  matches: JobMatchResult[];
  suggestions: string[];
  mode: string;
  configured: boolean;
}

export interface ResumeDocument {
  id: number;
  original_filename: string;
  file_url: string;
  mime_type?: string;
  file_size?: number;
  parsed_text?: string;
  analysis_json?: string;
  created_at?: string;
}

export interface ResumePayload {
  resume: Resume;
  educations: ResumeEducation[];
  experiences: ResumeExperience[];
  projects: ResumeProject[];
  skills: ResumeSkill[];
  certificates: ResumeCertificate[];
  documents?: ResumeDocument[];
}

export interface Application {
  id: number;
  status: 'SUBMITTED' | 'VIEWED' | 'INVITED' | 'REJECTED';
  interview_response?: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  message?: string;
  applied_at: string;
  title: string;
  city: string;
  salary_min: number;
  salary_max: number;
  company_name: string;
  company_logo?: string;
  resume_document_id?: number;
  resume_filename?: string;
  resume_file_url?: string;
}

export interface StatBucket {
  name: string;
  value: number;
}

export interface CityCoordinate {
  name: string;
  lng: number;
  lat: number;
  provinceLevel?: boolean;
}

export interface CityJobStat extends CityCoordinate {
  jobCount: number;
  categories: StatBucket[];
}

export interface PlatformStats {
  jobCount: number;
  companyCount: number;
  applicationCount: number;
  applicantCount: number;
  cities: StatBucket[];
  categories: StatBucket[];
  coordinates?: CityCoordinate[];
}

export interface CityStats {
  cities: StatBucket[];
  categories: StatBucket[];
  coordinates: CityCoordinate[];
}

export interface MapStats {
  items: CityJobStat[];
  totalJobs: number;
  maxCount: number;
}

export interface RagSource {
  id?: string;
  title: string;
  type?: string;
  source?: string;
  snippet?: string;
  score?: number;
}

export interface RagChatRequest {
  question: string;
  topK?: number;
  userContext?: RagUserContext;
}

export interface RagChatResponse {
  answer: string;
  sources: RagSource[];
  mode?: 'llm' | 'fallback';
  configured?: boolean;
}

export interface RagHealth {
  status: string;
  configured: boolean;
  chatConfigured?: boolean;
  embeddingConfigured?: boolean;
  visionConfigured?: boolean;
  documents: number;
  embeddedDocuments?: number;
  database?: boolean;
  embeddingError?: string;
}

export interface RagUserContext {
  user: Pick<User, 'id' | 'username' | 'role' | 'fullName' | 'email' | 'phone'>;
  resume?: Record<string, unknown>;
  resumeModules?: Record<string, Array<Record<string, unknown>>>;
  resumeDocuments?: Array<Record<string, unknown>>;
  applications?: Array<Record<string, unknown>>;
}

export interface VisionAnalyzeResponse {
  fileName: string;
  answer: string;
  mode: string;
  configured: boolean;
  sources?: RagSource[];
}

export interface PagedResult<T> {
  items: T[];
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface CompanyListResult extends PagedResult<Company> {
  industries?: StatBucket[];
  scales?: StatBucket[];
}

export interface AdminDashboard {
  companyCount: number;
  jobCount: number;
  openJobCount: number;
  userCount: number;
  applicationCount: number;
  cityStats: StatBucket[];
  categoryStats: StatBucket[];
  statusStats: StatBucket[];
  trendStats: StatBucket[];
  recentApplications: AdminApplication[];
}

export interface AdminApplication extends Application {
  full_name: string;
  email?: string;
  phone?: string;
  education?: string;
  major?: string;
  skills?: string;
}

export interface AdminUser {
  id: number;
  username: string;
  role: Role;
  full_name: string;
  email?: string;
  phone?: string;
  status: 'ACTIVE' | 'DISABLED';
  created_at?: string;
}

export interface AdminResume {
  user_id: number;
  username: string;
  full_name: string;
  email?: string;
  phone?: string;
  status: 'ACTIVE' | 'DISABLED';
  education?: string;
  major?: string;
  years_experience?: number;
  expected_city?: string;
  expected_salary?: string;
  skills?: string;
  application_count: number;
  updated_at?: string;
  created_at?: string;
}

export interface AdminResumeApplication {
  id: number;
  status: Application['status'];
  interview_response?: Application['interview_response'];
  message?: string;
  applied_at?: string;
  title: string;
  city?: string;
  company_name: string;
}

export interface AdminResumeDetail {
  resume: AdminResume & Resume;
  educations: ResumeEducation[];
  experiences: ResumeExperience[];
  projects: ResumeProject[];
  skills: ResumeSkill[];
  certificates: ResumeCertificate[];
  applications: AdminResumeApplication[];
}

export interface SystemLog {
  id: number;
  username?: string;
  action: string;
  detail?: string;
  created_at: string;
}
