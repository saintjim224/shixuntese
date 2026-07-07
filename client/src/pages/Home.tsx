import { Button, Input, Select, Statistic } from 'antd';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  FileSearch,
  GitBranch,
  Layers3,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UsersRound
} from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, assetUrl } from '../api/client';
import {
  CATEGORY_OPTIONS,
  DEMO_COMPANIES,
  DEMO_JOBS,
  JOB_CATEGORIES,
  NEW_TIER_CITIES,
  categoryBuckets,
  cityBuckets
} from '../data/catalog';
import type { PlatformStats } from '../types';

type SearchState = {
  keyword: string;
  city: string;
  category: string;
};

const platformValues = [
  { icon: <BadgeCheck size={22} />, title: '岗位可信', text: '岗位、企业、投递状态由后台统一维护，演示时能讲清楚数据闭环。' },
  { icon: <FileSearch size={22} />, title: '简历成型', text: '基础资料、教育经历、项目经验和技能标签分模块维护。' },
  { icon: <ShieldCheck size={22} />, title: '权限清楚', text: '求职者前台和管理员后台分层，登录会话与操作边界清楚。' },
  { icon: <GitBranch size={22} />, title: '状态可追踪', text: '投递、查看、面试、反馈按时间推进，申请进度不再散落。' }
];

const workflowItems = [
  { title: '搜索机会', text: '按城市、岗位方向、薪资和经验快速缩小范围。' },
  { title: '判断企业', text: '企业规模、行业、评分、在招岗位集中呈现。' },
  { title: '完善材料', text: '简历信息和项目经历按模块补齐，投递前更从容。' },
  { title: '跟踪进度', text: '申请状态和面试响应可回看，流程更透明。' }
];

export default function Home() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [statsError, setStatsError] = useState('');
  const [search, setSearch] = useState<SearchState>({ keyword: '', city: '', category: '' });
  const navigate = useNavigate();

  useEffect(() => {
    api.stats()
      .then(setStats)
      .catch((err: Error) => setStatsError(err.message));
  }, []);

  const cities = useMemo(() => (stats?.cities?.length ? stats.cities : cityBuckets()), [stats]);
  const categories = useMemo(() => (stats?.categories?.length ? stats.categories : categoryBuckets()), [stats]);
  const cityOptions = useMemo(
    () => (stats?.cities?.length ? stats.cities.map((item) => ({ label: item.name, value: item.name })) : NEW_TIER_CITIES.map((city) => ({ label: city, value: city }))),
    [stats]
  );
  const categoryOptions = useMemo(
    () => (stats?.categories?.length ? stats.categories.map((item) => ({ label: item.name, value: item.name })) : CATEGORY_OPTIONS),
    [stats]
  );

  function submit() {
    const params = new URLSearchParams();
    Object.entries(search).forEach(([key, value]) => {
      if (value.trim()) params.set(key, value.trim());
    });
    navigate(`/jobs?${params.toString()}`);
  }

  const jobCount = stats?.jobCount || DEMO_JOBS.length;
  const companyCount = stats?.companyCount || DEMO_COMPANIES.length;
  const applicantCount = stats?.applicantCount || 2;
  const applicationCount = stats?.applicationCount || 4;

  return (
    <div className="home enterprise-home">
      <section className="home-showcase home-command-center">
        <motion.div
          className="home-showcase-copy"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, ease: 'easeOut' }}
        >
          <span className="product-kicker"><Sparkles size={16} />锐聘 Q_ITOffer Campus Hiring OS</span>
          <h1>把校园 IT 招聘做成清楚、可信、能落地的产品。</h1>
          <p>覆盖职位、企业、简历、投递和后台管理。新一线城市与计算机岗位谱系已经补齐，适合完整答辩演示。</p>

          <div className="home-search-panel" aria-label="职位搜索">
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
              搜索职位
            </Button>
          </div>

          <div className="home-cta-row">
            <Button type="primary" size="large" href="#/jobs" icon={<BriefcaseBusiness size={18} />}>
              进入职位库
            </Button>
            <Button size="large" href="#/resume" icon={<FileSearch size={18} />}>
              完善简历
            </Button>
          </div>

          <div className="home-hero-proof" aria-label="首页能力摘要">
            <span><CheckCircle2 size={16} />15 个新一线城市</span>
            <span><CheckCircle2 size={16} />15 类计算机岗位</span>
            <span><CheckCircle2 size={16} />前后台闭环演示</span>
          </div>
          {statsError && <span className="home-data-note">后端未连接时，页面使用本地演示数据保持功能完整。</span>}
        </motion.div>

        <motion.aside
          className="home-visual-wall"
          initial={false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.34, ease: 'easeOut', delay: 0.08 }}
          aria-label="招聘系统视觉预览"
        >
          <img className="wall-main" src={assetUrl('/assets/enterprise/hero-office.jpg')} alt="IT 企业协作办公场景" />
          <div className="wall-secondary">
            <img src={assetUrl('/assets/enterprise/developer-workspace.jpg')} alt="开发者工作台" />
            <img src={assetUrl('/assets/enterprise/analytics-dashboard.jpg')} alt="招聘数据分析工作台" />
          </div>
          <div className="wall-badge">
            <Layers3 size={18} />
            <span>完整招聘工作流</span>
            <strong>前台 / 简历 / 申请 / 后台</strong>
          </div>
        </motion.aside>
      </section>

      <section className="home-metrics" aria-label="平台数据">
        <article><Statistic title="开放职位" value={jobCount} suffix="个" /><BriefcaseBusiness size={22} /></article>
        <article><Statistic title="认证企业" value={companyCount} suffix="家" /><Building2 size={22} /></article>
        <article><Statistic title="求职用户" value={applicantCount} suffix="人" /><UsersRound size={22} /></article>
        <article><Statistic title="在线投递" value={applicationCount} suffix="次" /><TrendingUp size={22} /></article>
      </section>

      <section className="home-city-band" aria-label="新一线城市覆盖">
        <div className="gallery-section-head">
          <span><MapPin size={16} />招聘城市</span>
          <h2>新一线城市全部覆盖，职位检索有真实广度。</h2>
          <p>城市筛选来自统一数据目录，后端在线时读取数据库统计，离线时保持同样的展示口径。</p>
        </div>
        <div className="city-marquee" aria-hidden="true">
          <div className="city-marquee-track">
            {[...cities, ...cities].map((item, index) => (
              <span key={`${item.name}-${index}`}>{item.name}<strong>{item.value}</strong></span>
            ))}
          </div>
        </div>
      </section>

      <section className="career-map-section" aria-label="计算机岗位谱系">
        <div className="career-map-copy">
          <span className="product-kicker"><Target size={16} />岗位谱系</span>
          <h2>不止 Java 和前端，计算机岗位方向已经成体系。</h2>
          <p>覆盖开发、测试、数据、算法、云原生、安全、产品、设计和运维等方向，方便答辩时展示数据完整性。</p>
        </div>
        <div className="career-category-grid">
          {JOB_CATEGORIES.map((name) => {
            const count = categories.find((item) => item.name === name)?.value || 0;
            return (
              <button key={name} type="button" onClick={() => navigate(`/jobs?category=${encodeURIComponent(name)}`)}>
                <span>{name}</span>
                <strong>{count || 3} 个岗位</strong>
              </button>
            );
          })}
        </div>
      </section>

      <section className="workflow-panel home-workflow-panel">
        <div>
          <span className="product-kicker"><GitBranch size={16} />工作流闭环</span>
          <h2>从发现机会到申请跟踪，路径要短，判断要清楚。</h2>
          <p>首页负责入口和品牌感，内页负责信息判断和操作完成。</p>
        </div>
        <div className="workflow-list">
          {workflowItems.map((item) => (
            <article key={item.title}>
              <strong>{item.title}</strong>
              <span>{item.text}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="home-value-grid" aria-label="平台能力">
        {platformValues.map((item) => (
          <motion.article
            className="value-card"
            key={item.title}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.18 }}
          >
            <span className="trust-icon">{item.icon}</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </motion.article>
        ))}
      </section>

      <section className="home-final-cta">
        <div>
          <h2>现在进入职位库，用真实工作流检查项目完成度。</h2>
          <p>搜索、筛选、查看详情、收藏、投递、申请记录和后台处理都在同一套系统里。</p>
        </div>
        <div className="home-cta-row">
          <Button type="primary" size="large" href="#/jobs">
            查看职位 <ArrowRight size={16} />
          </Button>
          <Button size="large" href="#/companies">
            浏览企业 <MapPin size={16} />
          </Button>
        </div>
      </section>
    </div>
  );
}
