import { Button, Card, Input, Select, Space, Statistic, Tag } from 'antd';
import { ArrowRight, BadgeCheck, Building2, FileSearch, LockKeyhole, Search, Sparkles, TrendingUp, UsersRound } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, assetUrl } from '../api/client';
import JobCard from '../components/JobCard';
import { CardGridSkeleton, ErrorBlock } from '../components/StateBlock';
import type { Company, Job, PlatformStats } from '../types';

type SearchState = {
  keyword: string;
  city: string;
  category: string;
};

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [search, setSearch] = useState<SearchState>({ keyword: '', city: '', category: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.jobs(), api.companies(), api.stats()])
      .then(([jobResult, companyResult, statsResult]) => {
        setJobs(jobResult.items.slice(0, 4));
        setCompanies(companyResult.items.slice(0, 3));
        setStats(statsResult);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const cityOptions = useMemo(
    () => stats?.cities.map((item) => ({ label: item.name, value: item.name })) || [],
    [stats]
  );
  const categoryOptions = useMemo(
    () => stats?.categories.map((item) => ({ label: item.name, value: item.name })) || [],
    [stats]
  );

  function submit() {
    const params = new URLSearchParams();
    Object.entries(search).forEach(([key, value]) => {
      if (value.trim()) params.set(key, value.trim());
    });
    navigate(`/jobs?${params.toString()}`);
  }

  return (
    <div className="home">
      <section className="hero-section enterprise-hero">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={16} />IT 招聘代理服务平台</span>
          <h1>让 IT 人才和企业岗位在同一套流程里高效匹配。</h1>
          <p>职位、企业、简历和投递状态统一流转，帮助求职者更快判断机会，也让后台管理更清晰。</p>
          <div className="search-console" aria-label="职位搜索">
            <Input
              size="large"
              allowClear
              prefix={<Search size={18} />}
              placeholder="Java Web / React / 测试开发"
              value={search.keyword}
              onChange={(event) => setSearch((prev) => ({ ...prev, keyword: event.target.value }))}
              onPressEnter={submit}
            />
            <Select
              size="large"
              allowClear
              showSearch
              placeholder="选择城市"
              options={cityOptions}
              value={search.city || undefined}
              onChange={(value) => setSearch((prev) => ({ ...prev, city: value || '' }))}
            />
            <Select
              size="large"
              allowClear
              showSearch
              placeholder="选择岗位方向"
              options={categoryOptions}
              value={search.category || undefined}
              onChange={(value) => setSearch((prev) => ({ ...prev, category: value || '' }))}
            />
            <Button type="primary" size="large" icon={<Search size={18} />} onClick={submit}>
              搜索职位
            </Button>
          </div>
          <Space wrap className="hot-tags" size={[8, 8]}>
            <Tag color="green">热门方向</Tag>
            {(stats?.categories.slice(0, 4) || []).map((item) => (
              <Tag
                key={item.name}
                className="clickable-tag"
                onClick={() => navigate(`/jobs?category=${encodeURIComponent(item.name)}`)}
              >
                {item.name}
              </Tag>
            ))}
          </Space>
        </div>
        <motion.div
          className="hero-media"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.32, ease: 'easeOut' }}
        >
          <img src={assetUrl('/assets/enterprise/hero-office.jpg')} alt="IT 企业协作办公场景" width="520" height="420" />
          <div className="hero-float-card">
            <TrendingUp size={18} />
            <span>本地演示数据已连接</span>
            <strong>{stats?.applicationCount || 0} 份投递记录</strong>
          </div>
        </motion.div>
      </section>

      <section className="metric-strip" aria-label="平台数据">
        <Card className="metric-card"><Statistic title="开放职位" value={stats?.jobCount || 0} suffix="个" /><span className="metric-icon"><BriefcaseIcon /></span></Card>
        <Card className="metric-card"><Statistic title="认证企业" value={stats?.companyCount || 0} suffix="家" /><span className="metric-icon"><Building2 size={22} /></span></Card>
        <Card className="metric-card"><Statistic title="求职用户" value={stats?.applicantCount || 0} suffix="人" /><span className="metric-icon"><UsersRound size={22} /></span></Card>
        <Card className="metric-card"><Statistic title="在线投递" value={stats?.applicationCount || 0} suffix="次" /><span className="metric-icon"><TrendingUp size={22} /></span></Card>
      </section>

      <section className="trust-grid" aria-label="为什么选择锐聘">
        {[
          { icon: <BadgeCheck size={22} />, title: '真实岗位', text: '企业、职位和投递状态由后台统一维护，演示数据链路完整。' },
          { icon: <FileSearch size={22} />, title: '简历闭环', text: '基础信息、项目经历和技能标签可模块化维护，投递前更有把握。' },
          { icon: <LockKeyhole size={22} />, title: '会话安全', text: '求职者和管理员沿用 Java Web 会话，权限边界清晰。' },
          { icon: <TrendingUp size={22} />, title: '数据可视', text: '后台统计、图表和日志让平台运行状态一眼可见。' }
        ].map((item) => (
          <article className="trust-card" key={item.title}>
            <span className="trust-icon">{item.icon}</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      {loading && <CardGridSkeleton />}
      {error && <ErrorBlock message={error} />}

      {!loading && !error && (
        <>
          <section className="section-head">
            <div>
              <h2>最新职位</h2>
              <p>按薪资、城市、学历和企业信息快速判断岗位匹配度。</p>
            </div>
            <Button href="#/jobs">全部职位 <ArrowRight size={16} /></Button>
          </section>
          <section className="job-grid">
            {jobs.map((job) => <JobCard key={job.id} job={job} />)}
          </section>

          <section className="section-head">
            <div>
              <h2>精选企业</h2>
              <p>企业展示采用招聘系统常见的认证企业卡片，突出行业、地点和开放职位。</p>
            </div>
            <Button href="#/companies">全部企业 <ArrowRight size={16} /></Button>
          </section>
          <section className="company-strip">
            {companies.map((company) => (
              <motion.div key={company.id} whileHover={{ y: -3 }} transition={{ duration: 0.18 }}>
                <Link className="company-card company-banner-card" to={`/companies/${company.id}`}>
                  <img src={assetUrl(company.logo_url)} alt={`${company.name} logo`} />
                  <strong>{company.name}</strong>
                  <span><Building2 size={15} />{company.city} / {company.industry}</span>
                  <span>{company.financing_stage || '成长型企业'} / {company.scale}</span>
                  <p>{company.description}</p>
                  <Tag color="blue">{company.job_count || 0} 个开放职位</Tag>
                </Link>
              </motion.div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}

function BriefcaseIcon() {
  return <span aria-hidden="true" style={{ fontWeight: 900 }}>IT</span>;
}
