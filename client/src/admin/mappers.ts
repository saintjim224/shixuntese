import type { Company, Job } from '../types';

export function toCompanyForm(record: Company) {
  return {
    name: record.name,
    logoUrl: record.logo_url,
    bannerUrl: record.banner_url,
    city: record.city,
    industry: record.industry,
    scale: record.scale,
    foundedYear: record.founded_year,
    financingStage: record.financing_stage,
    rating: record.rating,
    website: record.website,
    description: record.description
  };
}

export function toJobForm(record: Job) {
  return {
    companyId: record.company_id,
    title: record.title,
    category: record.category,
    salaryMin: record.salary_min,
    salaryMax: record.salary_max,
    city: record.city,
    education: record.education,
    experience: record.experience,
    headcount: record.headcount,
    highlights: record.highlights,
    description: record.description,
    requirementText: record.requirement_text,
    status: record.status
  };
}
