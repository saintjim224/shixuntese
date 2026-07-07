import { Button, Card, Statistic, Tabs, Tag } from 'antd';
import { ArrowLeft, ExternalLink, MapPin, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, assetUrl } from '../api/client';
import BreadcrumbTrail from '../components/BreadcrumbTrail';
import JobCard from '../components/JobCard';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../components/StateBlock';
import { DEMO_COMPANIES, DEMO_JOBS } from '../data/catalog';
import type { Company, Job } from '../types';

export default function CompanyDetail() {
  const { id = '' } = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recommended, setRecommended] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api.company(id)
      .then((result) => {
        setCompany(result.company);
        setJobs(result.jobs);
        setRecommended(result.recommended || []);
      })
      .catch((err: Error) => {
        const fallback = DEMO_COMPANIES.find((item) => String(item.id) === id);
        if (fallback) {
          setCompany(fallback);
          setJobs(DEMO_JOBS.filter((job) => job.company_id === fallback.id));
          setRecommended(DEMO_COMPANIES.filter((item) => item.id !== fallback.id).slice(0, 3));
          setError('');
          return;
        }
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingBlock />;
  if (!company) return <ErrorBlock message={error || '企业不存在'} />;

  return (
    <div>
      <BreadcrumbTrail current={company.name} />
      <Link className="back-link" to="/companies"><ArrowLeft size={18} />返回企业列表</Link>
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="company-hero company-detail-hero">
          <img src={assetUrl(company.logo_url)} alt={`${company.name} logo`} />
          <div>
            <Tag color="blue">{company.industry}</Tag>
            <h1>{company.name}</h1>
            <p><MapPin size={16} />{company.city} / {company.scale} / {company.financing_stage || '成长型企业'}</p>
            <p>{company.description}</p>
            {company.website && (
              <Button href={company.website} target="_blank" rel="noreferrer" icon={<ExternalLink size={18} />}>
                访问官网
              </Button>
            )}
          </div>
          <div className="company-hero-stat">
            <Statistic title="开放职位" value={jobs.length} suffix="个" />
            <Statistic title="员工评价" value={company.rating || 4.6} suffix="分" />
          </div>
        </Card>
      </motion.section>

      <Card className="filter-card">
        <Tabs
          items={[
            {
              key: 'about',
              label: '公司介绍',
              children: (
                <div className="detail-copy">
                  <h2>企业概况</h2>
                  <p>{company.description}</p>
                  <p>成立时间：{company.founded_year || 2019} 年 / 融资阶段：{company.financing_stage || '成长型企业'} / 所在城市：{company.city}</p>
                </div>
              )
            },
            {
              key: 'jobs',
              label: `在招职位 (${jobs.length})`,
              children: jobs.length === 0 ? (
                <EmptyBlock title="暂无开放职位" text="可以稍后再回来查看该企业是否发布新岗位。" />
              ) : (
                <section className="job-grid">
                  {jobs.map((job) => <JobCard key={job.id} job={{ ...job, company_name: company.name, company_logo: company.logo_url }} />)}
                </section>
              )
            },
            {
              key: 'gallery',
              label: '公司相册',
              children: (
                <section className="company-strip">
                  {['team-collaboration.jpg', 'developer-workspace.jpg', 'analytics-dashboard.jpg'].map((name) => (
                    <img key={name} className="compact-page-hero" src={assetUrl(`/assets/enterprise/${name}`)} alt="企业办公环境" loading="lazy" />
                  ))}
                </section>
              )
            }
          ]}
        />
      </Card>

      {recommended.length > 0 && (
        <>
          <section className="section-head">
            <div>
              <h2>其他推荐企业</h2>
              <p>按评分和城市覆盖推荐，便于继续浏览。</p>
            </div>
          </section>
          <section className="company-strip">
            {recommended.map((item) => (
              <Link className="company-card company-banner-card" to={`/companies/${item.id}`} key={item.id}>
                <img src={assetUrl(item.logo_url)} alt={`${item.name} logo`} loading="lazy" />
                <strong>{item.name}</strong>
                <span><MapPin size={15} />{item.city} / {item.industry}</span>
                <span><Star size={15} />{item.rating || 4.6} 分</span>
              </Link>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
