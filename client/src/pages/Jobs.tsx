import { Button, Card, Input, Pagination, Select, Space, Tag } from 'antd';
import { Filter, Grid2X2, List, MapPin, Search, SlidersHorizontal, WalletCards } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, assetUrl } from '../api/client';
import JobCard from '../components/JobCard';
import PageHero from '../components/PageHero';
import { CardGridSkeleton, EmptyBlock } from '../components/StateBlock';
import {
  CATEGORY_OPTIONS,
  CITY_OPTIONS,
  DEMO_JOBS,
  EDUCATION_OPTIONS,
  EXPERIENCE_OPTIONS,
  SALARY_OPTIONS
} from '../data/catalog';
import type { Job, PlatformStats } from '../types';

type Filters = {
  keyword: string;
  city: string[];
  category: string[];
  education: string;
  experience: string;
  salary: string;
  sort: string;
  page: number;
};

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [filters, setFilters] = useState<Filters>(() => fromParams(searchParams));
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    const next = fromParams(searchParams);
    setFilters(next);
    setLoading(true);
    api.jobs(`?${toParams(next).toString()}`)
      .then((result) => {
        setDemoMode(false);
        setJobs(result.items);
        setTotal(Number(result.total || result.items.length));
      })
      .catch(() => {
        const fallback = filterDemoJobs(next);
        setDemoMode(true);
        setJobs(fallback);
        setTotal(fallback.length);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    api.stats().then(setStats).catch(() => undefined);
  }, []);

  const cityOptions = useMemo(
    () => (stats?.cities.length ? stats.cities.map((item) => ({ label: item.name, value: item.name })) : CITY_OPTIONS),
    [stats]
  );
  const categoryOptions = useMemo(
    () => (stats?.categories.length ? stats.categories.map((item) => ({ label: item.name, value: item.name })) : CATEGORY_OPTIONS),
    [stats]
  );

  function submit(next = { ...filters, page: 1 }) {
    setSearchParams(toParams(next));
  }

  function clear() {
    setSearchParams({});
  }

  const activeTags = [
    filters.keyword && `关键词：${filters.keyword}`,
    ...filters.city.map((item) => `城市：${item}`),
    ...filters.category.map((item) => `方向：${item}`),
    filters.education && `学历：${filters.education}`,
    filters.experience && `经验：${filters.experience}`,
    filters.salary && `薪资：${SALARY_OPTIONS.find((item) => item.value === filters.salary)?.label}`
  ].filter(Boolean) as string[];

  return (
    <div className="jobs-page">
      <PageHero
        eyebrow={<><SlidersHorizontal size={16} />职位检索</>}
        title="覆盖新一线城市的 IT 岗位库"
        text="按关键词、城市、方向、学历、经验和薪资筛选开放职位。前端离线预览和后端在线数据使用同一套岗位目录。"
        image={assetUrl('/assets/enterprise/developer-workspace.jpg')}
        alt="开发者办公桌"
      />

      <Card className="filter-card job-filter-card">
        <div className="filter-title">
          <span><Filter size={17} />精准筛选</span>
          <Tag color={demoMode ? 'blue' : 'green'}>{loading ? '查询中' : `${demoMode ? '演示 ' : ''}${total} 个结果`}</Tag>
        </div>
        <div className="filter-bar enterprise-filter">
          <Input
            allowClear
            prefix={<Search size={17} />}
            placeholder="职位、技能或企业名称"
            value={filters.keyword}
            onChange={(event) => setFilters((prev) => ({ ...prev, keyword: event.target.value }))}
            onPressEnter={() => submit()}
          />
          <Select
            mode="multiple"
            allowClear
            showSearch
            placeholder="城市"
            options={cityOptions}
            value={filters.city}
            onChange={(value) => setFilters((prev) => ({ ...prev, city: value }))}
            maxTagCount="responsive"
          />
          <Select
            mode="multiple"
            allowClear
            showSearch
            placeholder="岗位方向"
            options={categoryOptions}
            value={filters.category}
            onChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
            maxTagCount="responsive"
          />
          <Space>
            <Button type="primary" icon={<Search size={17} />} onClick={() => submit()}>筛选</Button>
            <Button onClick={clear}>重置</Button>
          </Space>
        </div>
        <div className="filter-bar enterprise-filter">
          <Select
            allowClear
            placeholder="学历要求"
            value={filters.education || undefined}
            options={EDUCATION_OPTIONS.map((item) => ({ label: item, value: item }))}
            onChange={(value) => setFilters((prev) => ({ ...prev, education: value || '' }))}
          />
          <Select
            allowClear
            placeholder="经验要求"
            value={filters.experience || undefined}
            options={EXPERIENCE_OPTIONS.map((item) => ({ label: item, value: item }))}
            onChange={(value) => setFilters((prev) => ({ ...prev, experience: value || '' }))}
          />
          <Select
            placeholder="薪资范围"
            value={filters.salary}
            options={SALARY_OPTIONS}
            onChange={(value) => setFilters((prev) => ({ ...prev, salary: value }))}
          />
          <Select
            value={filters.sort}
            options={[
              { label: '最新发布', value: 'latest' },
              { label: '薪资从高到低', value: 'salary_desc' },
              { label: '薪资从低到高', value: 'salary_asc' }
            ]}
            onChange={(value) => setFilters((prev) => ({ ...prev, sort: value }))}
          />
        </div>
        {activeTags.length > 0 && (
          <div className="active-filters">
            {activeTags.map((item) => <Tag key={item} color="blue">{item}</Tag>)}
            <Button size="small" onClick={clear}>清空筛选</Button>
          </div>
        )}
      </Card>

      <div className="list-toolbar">
        <span className="muted">共 {total} 个匹配岗位</span>
        <div className="view-switch">
          <Button icon={<Grid2X2 size={16} />} type={view === 'grid' ? 'primary' : 'default'} onClick={() => setView('grid')}>网格</Button>
          <Button icon={<List size={16} />} type={view === 'list' ? 'primary' : 'default'} onClick={() => setView('list')}>列表</Button>
        </div>
      </div>

      {loading && <CardGridSkeleton />}
      {!loading && demoMode && (
        <div className="demo-data-note">
          后端服务未连接，当前展示合规生成的演示岗位，保证前台功能可完整预览。
        </div>
      )}
      {!loading && jobs.length === 0 && <EmptyBlock title="没有匹配职位" text="换一个关键词或清空筛选条件再试一次。" />}
      {!loading && view === 'grid' && (
        <motion.section className="job-grid" layout>
          {jobs.map((job) => <JobCard key={job.id} job={job} />)}
        </motion.section>
      )}
      {!loading && view === 'list' && (
        <motion.section className="job-list" layout>
          {jobs.map((job) => <JobListCard key={job.id} job={job} />)}
        </motion.section>
      )}
      {!loading && total > 0 && (
        <Pagination
          current={filters.page}
          pageSize={12}
          total={total}
          showSizeChanger={false}
          onChange={(page) => submit({ ...filters, page })}
          style={{ marginTop: 24, textAlign: 'center' }}
        />
      )}
    </div>
  );
}

function filterDemoJobs(filters: Filters) {
  const keyword = filters.keyword.trim().toLowerCase();
  const [salaryMin, salaryMax] = filters.salary.split('-').map((item) => Number(item || 0));
  const result = DEMO_JOBS.filter((job) => {
    const haystack = [
      job.title,
      job.company_name,
      job.company_industry,
      job.category,
      job.city,
      job.highlights,
      job.description,
      job.requirement_text
    ].join(' ').toLowerCase();
    const matchKeyword = !keyword || haystack.includes(keyword);
    const matchCity = filters.city.length === 0 || filters.city.includes(job.city);
    const matchCategory = filters.category.length === 0 || filters.category.includes(job.category);
    const matchEducation = !filters.education || filters.education === '学历不限' || job.education === filters.education;
    const matchExperience = !filters.experience || filters.experience === '不限' || job.experience === filters.experience;
    const matchSalary = !filters.salary || (salaryMax === 0 ? job.salary_max >= salaryMin : job.salary_max >= salaryMin && job.salary_min <= salaryMax);
    return matchKeyword && matchCity && matchCategory && matchEducation && matchExperience && matchSalary;
  });
  if (filters.sort === 'salary_desc') return [...result].sort((a, b) => b.salary_max - a.salary_max);
  if (filters.sort === 'salary_asc') return [...result].sort((a, b) => a.salary_min - b.salary_min);
  return [...result].sort((a, b) => String(b.posted_at || '').localeCompare(String(a.posted_at || '')));
}

function JobListCard({ job }: { job: Job }) {
  return (
    <Link className="job-list-card" to={`/jobs/${job.id}`}>
      <img src={assetUrl(job.company_logo)} alt={`${job.company_name || '企业'} logo`} loading="lazy" />
      <div>
        <h3>{job.title}</h3>
        <p>{job.company_name} / {job.category}</p>
        <Space wrap>
          <Tag icon={<MapPin size={14} />}>{job.city}</Tag>
          {(job.highlights || '').split(',').filter(Boolean).slice(0, 3).map((item) => <Tag key={item}>{item}</Tag>)}
        </Space>
      </div>
      <div className="job-list-side">
        <strong><WalletCards size={16} /> {job.salary_min}-{job.salary_max} 元/月</strong>
        <Tag color="green">{job.education || '学历不限'}</Tag>
      </div>
    </Link>
  );
}

function fromParams(params: URLSearchParams): Filters {
  return {
    keyword: params.get('keyword') || '',
    city: split(params.get('city')),
    category: split(params.get('category')),
    education: params.get('education') || '',
    experience: params.get('experience') || '',
    salary: params.get('salary') || '',
    sort: params.get('sort') || 'latest',
    page: Number(params.get('page') || 1)
  };
}

function toParams(filters: Filters) {
  const next = new URLSearchParams();
  if (filters.keyword.trim()) next.set('keyword', filters.keyword.trim());
  if (filters.city.length) next.set('city', filters.city.join(','));
  if (filters.category.length) next.set('category', filters.category.join(','));
  if (filters.education) next.set('education', filters.education);
  if (filters.experience) next.set('experience', filters.experience);
  if (filters.salary) {
    const [salaryMin, salaryMax] = filters.salary.split('-');
    next.set('salary', filters.salary);
    next.set('salaryMin', salaryMin);
    next.set('salaryMax', salaryMax);
  }
  if (filters.sort && filters.sort !== 'latest') next.set('sort', filters.sort);
  if (filters.page > 1) next.set('page', String(filters.page));
  next.set('pageSize', '12');
  return next;
}

function split(value: string | null) {
  return value ? value.split(',').filter(Boolean) : [];
}
