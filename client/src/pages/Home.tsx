import { Button, Input, Select, Statistic, Tag } from 'antd';
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  FileSearch,
  Flame,
  MapPinned,
  Search,
  Sparkles,
  TrendingUp,
  UsersRound
} from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, assetUrl } from '../api/client';
import {
  CATEGORY_OPTIONS,
  CITY_OPTIONS,
  DEMO_COMPANIES,
  DEMO_JOBS,
  categoryBuckets,
  cityBuckets
} from '../data/catalog';
import type { PlatformStats } from '../types';

type SearchState = {
  keyword: string;
  city: string;
  category: string;
};

const actionCards = [
  {
    title: '职位热力图',
    text: '看城市机会密度和热门方向。',
    path: '/map',
    icon: <MapPinned size={22} />
  },
  {
    title: '内部问答',
    text: '检索项目、岗位、简历和投递记录。',
    path: '/rag',
    icon: <Bot size={22} />
  },
  {
    title: '简历中心',
    text: '整理资料后直接完成投递。',
    path: '/resume',
    icon: <FileSearch size={22} />
  }
];

export default function Home() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [statsError, setStatsError] = useState('');
  const [search, setSearch] = useState<SearchState>({ keyword: '', city: '', category: '' });
  const navigate = useNavigate();

  useEffect(() => {
    api.stats()
      .then((result) => {
        setStats(result);
        setStatsError('');
      })
      .catch((err: Error) => setStatsError(err.message));
  }, []);

  const cities = useMemo(() => (stats?.cities?.length ? stats.cities : cityBuckets()), [stats]);
  const categories = useMemo(() => (stats?.categories?.length ? stats.categories : categoryBuckets()), [stats]);
  const cityOptions = useMemo(
    () => (stats?.cities?.length ? stats.cities.map((item) => ({ label: item.name, value: item.name })) : CITY_OPTIONS),
    [stats]
  );
  const categoryOptions = useMemo(
    () => (stats?.categories?.length ? stats.categories.map((item) => ({ label: item.name, value: item.name })) : CATEGORY_OPTIONS),
    [stats]
  );
  const featuredJobs = useMemo(
    () => [...DEMO_JOBS].sort((a, b) => b.salary_max - a.salary_max).slice(0, 3),
    []
  );

  const jobCount = stats?.jobCount || DEMO_JOBS.length;
  const companyCount = stats?.companyCount || DEMO_COMPANIES.length;
  const applicantCount = stats?.applicantCount || 2;
  const applicationCount = stats?.applicationCount || 4;

  function submit() {
    const params = new URLSearchParams();
    Object.entries(search).forEach(([key, value]) => {
      if (value.trim()) params.set(key, value.trim());
    });
    const query = params.toString();
    navigate(query ? `/jobs?${query}` : '/jobs');
  }

  return (
    <div className="home home-redesign">
      <section className="home-clean-hero">
        <motion.div
          className="home-hero-copy"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, ease: 'easeOut' }}
        >
          <span className="product-kicker"><Sparkles size={16} />锐聘 Q_ITOffer</span>
          <h1>一个更轻、更清楚的 IT 校园招聘入口。</h1>
          <p>搜索职位、判断城市机会、完善简历、追踪申请，前台和后台都能完整演示。</p>
          <div className="home-search-panel clean-search-panel" aria-label="职位搜索">
            <Input
              size="large"
              allowClear
              prefix={<Search size={18} />}
              placeholder="搜索 Java、React、算法、DevOps"
              value={search.keyword}
              onChange={(event) => setSearch((prev) => ({ ...prev, keyword: event.target.value }))}
              onPressEnter={submit}
            />
            <Select
              size="large"
              allowClear
              showSearch
              placeholder="城市"
              options={cityOptions}
              value={search.city || undefined}
              onChange={(value) => setSearch((prev) => ({ ...prev, city: value || '' }))}
            />
            <Select
              size="large"
              allowClear
              showSearch
              placeholder="岗位方向"
              options={categoryOptions}
              value={search.category || undefined}
              onChange={(value) => setSearch((prev) => ({ ...prev, category: value || '' }))}
            />
            <Button type="primary" size="large" icon={<Search size={18} />} onClick={submit}>
              搜索
            </Button>
          </div>
          <div className="home-hero-proof">
            <span><CheckCircle2 size={16} />39 个重点城市</span>
            <span><CheckCircle2 size={16} />390 个演示岗位</span>
            <span><CheckCircle2 size={16} />前后台分离</span>
          </div>
          {statsError && <span className="home-data-note">后端未连接时，页面使用本地演示数据保持预览完整。</span>}
        </motion.div>

        <motion.aside
          className="home-focus-visual"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, ease: 'easeOut', delay: 0.08 }}
          aria-label="平台摘要"
        >
          <img src={assetUrl('/assets/enterprise/developer-workspace.jpg')} alt="开发者工作台" />
          <div className="focus-visual-panel">
            <span><Flame size={16} />今日机会</span>
            <strong>{jobCount}</strong>
            <small>开放职位</small>
          </div>
        </motion.aside>
      </section>

      <section className="home-overview-section" aria-label="岗位与城市概览">
        <div className="home-stat-strip">
          <article><Statistic title="职位" value={jobCount} suffix="个" /><BriefcaseBusiness size={21} /></article>
          <article><Statistic title="企业" value={companyCount} suffix="家" /><Building2 size={21} /></article>
          <article><Statistic title="用户" value={applicantCount} suffix="人" /><UsersRound size={21} /></article>
          <article><Statistic title="投递" value={applicationCount} suffix="次" /><TrendingUp size={21} /></article>
        </div>

        <div className="home-overview-grid">
          <div className="overview-panel">
            <div className="overview-head">
              <span><MapPinned size={16} />城市概览</span>
              <Button type="link" onClick={() => navigate('/map')}>地图 <ArrowRight size={14} /></Button>
            </div>
            <div className="city-pill-grid">
              {cities.slice(0, 8).map((item) => (
                <button key={item.name} type="button" onClick={() => navigate(`/jobs?city=${encodeURIComponent(item.name)}`)}>
                  {item.name}<strong>{item.value}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="overview-panel featured-jobs-panel">
            <div className="overview-head">
              <span><BriefcaseBusiness size={16} />精选岗位</span>
              <Button type="link" onClick={() => navigate('/jobs')}>全部 <ArrowRight size={14} /></Button>
            </div>
            {featuredJobs.map((job) => (
              <button key={job.id} type="button" className="mini-job-row" onClick={() => navigate(`/jobs/${job.id}`)}>
                <span>
                  <strong>{job.title}</strong>
                  <small>{job.city} · {job.category}</small>
                </span>
                <em>{Math.round(job.salary_min / 1000)}-{Math.round(job.salary_max / 1000)}K</em>
              </button>
            ))}
          </div>

          <div className="overview-panel category-panel">
            <div className="overview-head">
              <span><Sparkles size={16} />热门方向</span>
              <Button type="link" onClick={() => navigate('/jobs')}>筛选 <ArrowRight size={14} /></Button>
            </div>
            <div className="category-cloud">
              {categories.slice(0, 8).map((item) => (
                <Tag key={item.name} onClick={() => navigate(`/jobs?category=${encodeURIComponent(item.name)}`)}>
                  {item.name} {item.value}
                </Tag>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home-action-section" aria-label="项目亮点">
        <div className="action-section-copy">
          <span className="product-kicker"><Sparkles size={16} />演示入口</span>
          <h2>首页只留关键入口，复杂能力交给内页展开。</h2>
          <p>地图、问答、简历和后台管理互相连接，答辩时可以按真实流程逐步展示。</p>
        </div>
        <div className="home-action-grid">
          {actionCards.map((item, index) => (
            <motion.button
              key={item.title}
              type="button"
              onClick={() => navigate(item.path)}
              className="home-action-card"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <span>{item.icon}</span>
              <strong>{item.title}</strong>
              <small>{item.text}</small>
              <ArrowRight size={17} />
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  );
}
