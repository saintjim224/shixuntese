import { Button, Card, Input, Pagination, Select, Space, Tag } from 'antd';
import { Filter, Grid2X2, List, MapPin, Search, SlidersHorizontal, WalletCards } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, assetUrl } from '../api/client';
import JobCard from '../components/JobCard';
import PageHero from '../components/PageHero';
import { CardGridSkeleton, EmptyBlock } from '../components/StateBlock';
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

const salaryOptions = [
  { label: '不限薪资', value: '' },
  { label: '5K 以下', value: '0-5000' },
  { label: '5K-10K', value: '5000-10000' },
  { label: '10K-20K', value: '10000-20000' },
  { label: '20K 以上', value: '20000-0' }
];

const demoCities = ['成都', '杭州', '上海', '深圳'];
const demoCategories = ['React 前端', 'Java 后端', '测试开发', '数据分析', '产品运营'];

const demoJobs: Job[] = [
  {
    id: 91001,
    company_id: 9001,
    title: 'React 前端开发实习生',
    category: 'React 前端',
    salary_min: 7000,
    salary_max: 11000,
    city: '成都',
    education: '本科及以上',
    experience: '1年以内',
    headcount: 4,
    highlights: 'React,TypeScript,组件工程化',
    description: '参与招聘平台前端业务迭代，负责职位搜索、简历投递和企业展示等核心模块体验优化。',
    requirement_text: '熟悉 React、TypeScript 和基础工程化流程，有完整项目经验优先。',
    status: 'OPEN',
    posted_at: '2026-07-05T09:00:00+08:00',
    company_name: '青软实训数字科技',
    company_logo: '/assets/it-logo.png',
    company_industry: '教育科技'
  },
  {
    id: 91002,
    company_id: 9002,
    title: 'Java 后端开发实习生',
    category: 'Java 后端',
    salary_min: 8000,
    salary_max: 13000,
    city: '杭州',
    education: '本科及以上',
    experience: '1-3年',
    headcount: 3,
    highlights: 'Spring Boot,MySQL,接口设计',
    description: '建设职位、企业、简历和投递流程 API，保障前后台数据一致性与权限边界。',
    requirement_text: '理解 Spring Boot、RESTful API 和 MySQL 表结构设计。',
    status: 'OPEN',
    posted_at: '2026-07-04T10:20:00+08:00',
    company_name: '云启招聘智能',
    company_logo: '/assets/it-logo.png',
    company_industry: 'SaaS'
  },
  {
    id: 91003,
    company_id: 9003,
    title: '测试开发工程师',
    category: '测试开发',
    salary_min: 9000,
    salary_max: 15000,
    city: '上海',
    education: '本科及以上',
    experience: '1-3年',
    headcount: 2,
    highlights: '自动化测试,接口测试,质量平台',
    description: '负责招聘流程关键链路的自动化测试与质量看板建设，提高发布稳定性。',
    requirement_text: '熟悉接口测试、自动化测试框架和缺陷追踪流程。',
    status: 'OPEN',
    posted_at: '2026-07-03T14:00:00+08:00',
    company_name: '星程质量实验室',
    company_logo: '/assets/it-logo.png',
    company_industry: '企业服务'
  },
  {
    id: 91004,
    company_id: 9004,
    title: '数据分析实习生',
    category: '数据分析',
    salary_min: 6000,
    salary_max: 10000,
    city: '深圳',
    education: '本科及以上',
    experience: '不限',
    headcount: 5,
    highlights: 'SQL,BI 看板,业务分析',
    description: '围绕职位转化、投递效率和企业活跃度做指标分析，输出可用于产品决策的洞察。',
    requirement_text: '熟悉 SQL 和基础数据可视化，能把业务问题拆成指标。',
    status: 'OPEN',
    posted_at: '2026-07-02T11:30:00+08:00',
    company_name: '明策数据咨询',
    company_logo: '/assets/it-logo.png',
    company_industry: '数据服务'
  },
  {
    id: 91005,
    company_id: 9005,
    title: '产品运营实习生',
    category: '产品运营',
    salary_min: 5000,
    salary_max: 8000,
    city: '成都',
    education: '专科及以上',
    experience: '不限',
    headcount: 2,
    highlights: '用户反馈,内容运营,增长实验',
    description: '维护校园招聘内容质量，跟进求职者反馈，协助优化岗位推荐和申请转化。',
    requirement_text: '沟通清楚，能整理用户反馈并推进小步快跑的体验改进。',
    status: 'OPEN',
    posted_at: '2026-07-01T16:10:00+08:00',
    company_name: '锐聘校园增长组',
    company_logo: '/assets/it-logo.png',
    company_industry: '招聘平台'
  },
  {
    id: 91006,
    company_id: 9006,
    title: 'Web 全栈开发实习生',
    category: 'Java 后端',
    salary_min: 10000,
    salary_max: 18000,
    city: '上海',
    education: '本科及以上',
    experience: '3-5年',
    headcount: 1,
    highlights: 'React,Servlet,MySQL',
    description: '连接前端体验和后端业务模型，负责职位详情、企业主页和申请状态的端到端实现。',
    requirement_text: '具备前后端联调经验，理解基础安全、会话和表单校验。',
    status: 'OPEN',
    posted_at: '2026-06-30T13:40:00+08:00',
    company_name: '栈桥研发中心',
    company_logo: '/assets/it-logo.png',
    company_industry: '互联网'
  }
];

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
    () => (stats?.cities.length ? stats.cities.map((item) => item.name) : demoCities).map((item) => ({ label: item, value: item })),
    [stats]
  );
  const categoryOptions = useMemo(
    () => (stats?.categories.length ? stats.categories.map((item) => item.name) : demoCategories).map((item) => ({ label: item, value: item })),
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
    filters.salary && `薪资：${salaryOptions.find((item) => item.value === filters.salary)?.label}`
  ].filter(Boolean) as string[];

  return (
    <div className="jobs-page">
      <PageHero
        eyebrow={<><SlidersHorizontal size={16} />职位检索</>}
        title="发现适合你的 IT 岗位"
        text="按关键词、城市、方向、薪资和经验筛选开放中的招聘岗位。"
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
            options={['专科及以上', '本科及以上', '硕士及以上', '学历不限'].map((item) => ({ label: item, value: item }))}
            onChange={(value) => setFilters((prev) => ({ ...prev, education: value || '' }))}
          />
          <Select
            allowClear
            placeholder="经验要求"
            value={filters.experience || undefined}
            options={['不限', '1年以内', '1-3年', '3-5年'].map((item) => ({ label: item, value: item }))}
            onChange={(value) => setFilters((prev) => ({ ...prev, experience: value || '' }))}
          />
          <Select
            placeholder="薪资范围"
            value={filters.salary}
            options={salaryOptions}
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
          后端服务未连接，当前展示演示岗位用于前端预览。
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
  const result = demoJobs.filter((job) => {
    const haystack = [
      job.title,
      job.company_name,
      job.category,
      job.city,
      job.highlights,
      job.description
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
  return result;
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
