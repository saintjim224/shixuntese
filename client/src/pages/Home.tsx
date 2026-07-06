import { Button, Input, Select, Statistic } from 'antd';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
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
import type { PlatformStats } from '../types';

type SearchState = {
  keyword: string;
  city: string;
  category: string;
};

type GalleryItem = {
  image: string;
  title: string;
  text: string;
};

const fallbackCategories = ['Java Web', 'React 前端', '测试开发', '后端开发', '数据分析'];

const galleryAssets = {
  office: '/assets/enterprise/hero-office.jpg',
  team: '/assets/enterprise/team-collaboration.jpg',
  developer: '/assets/enterprise/developer-workspace.jpg',
  analytics: '/assets/enterprise/analytics-dashboard.jpg'
};

const galleryGroups: Array<{
  title: string;
  text: string;
  direction: 'left' | 'right';
  items: GalleryItem[];
}> = [
  {
    title: '企业现场',
    text: '用真实办公与团队协作照片建立招聘平台的可信感。',
    direction: 'left',
    items: [
      { image: galleryAssets.office, title: '协作办公', text: '团队场景与岗位机会同时出现' },
      { image: galleryAssets.team, title: '企业沟通', text: '企业信息、行业和地点更清楚' },
      { image: galleryAssets.developer, title: '技术现场', text: '研发氛围让 IT 岗位更可信' },
      { image: galleryAssets.analytics, title: '数据工作台', text: '后台和前台形成完整闭环' }
    ]
  },
  {
    title: '求职路径',
    text: '从简历、搜索到申请状态，用一条视觉动线贯穿。',
    direction: 'right',
    items: [
      { image: galleryAssets.developer, title: '开发者工作台', text: '适合 IT 求职方向的首屏视觉' },
      { image: galleryAssets.analytics, title: '岗位检索', text: '搜索、筛选和推荐放在同一流程' },
      { image: galleryAssets.office, title: '申请沟通', text: '投递、初筛、面试状态一目了然' },
      { image: galleryAssets.team, title: '团队匹配', text: '企业文化和岗位要求自然衔接' }
    ]
  },
  {
    title: '产品系统',
    text: '参考 GitHub 的信息层级，把招聘内容做得克制、清楚、可信。',
    direction: 'left',
    items: [
      { image: galleryAssets.analytics, title: '信息密度', text: '标签、统计、列表层级更像成熟产品' },
      { image: galleryAssets.team, title: '企业背书', text: '企业页保留招聘网站常见判断线索' },
      { image: galleryAssets.developer, title: '岗位比较', text: '薪资、城市、学历和福利优先展示' },
      { image: galleryAssets.office, title: '视觉延展', text: '用图片分组承接页面情绪和信息' }
    ]
  }
];

const platformValues = [
  { icon: <BadgeCheck size={22} />, title: '岗位可信', text: '职位、企业和投递状态由后台统一维护，适合实训答辩展示。' },
  { icon: <FileSearch size={22} />, title: '简历成型', text: '基础资料、项目经历和技能标签分模块维护，投递前快速补齐。' },
  { icon: <ShieldCheck size={22} />, title: '权限清楚', text: '求职者前台和管理员后台分层，登录会话与操作边界清晰。' },
  { icon: <GitBranch size={22} />, title: '状态可追踪', text: '申请记录按投递、查看、面试和结果推进，流程更透明。' }
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

  const cityOptions = useMemo(
    () => (stats?.cities || []).map((item) => ({ label: item.name, value: item.name })),
    [stats]
  );
  const categoryOptions = useMemo(
    () => (stats?.categories || fallbackCategories.map((name) => ({ name, value: 0 }))).map((item) => ({ label: item.name, value: item.name })),
    [stats]
  );
  const hotCategories = useMemo(
    () => (stats?.categories || fallbackCategories.map((name) => ({ name, value: 0 }))).slice(0, 5),
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
    <div className="home home-gallery-page">
      <section className="home-showcase">
        <motion.div
          className="home-showcase-copy"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, ease: 'easeOut' }}
        >
          <span className="product-kicker"><Sparkles size={16} />Q_ITOffer Recruitment Platform</span>
          <h1>让校园 IT 招聘，看起来像真正的产品。</h1>
          <p>首页独立承担品牌与入口，职位、企业、简历和申请页面回归高效的信息工作流。</p>

          <div className="home-search-panel" aria-label="职位搜索">
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

          <div className="hot-tags" aria-label="热门岗位方向">
            <span>热门方向</span>
            {hotCategories.map((item) => (
              <button
                key={item.name}
                type="button"
                className="keyword-chip"
                onClick={() => navigate(`/jobs?category=${encodeURIComponent(item.name)}`)}
              >
                {item.name}
              </button>
            ))}
          </div>
          {statsError && <span className="home-data-note">后端数据未连接时，页面会保留完整视觉结构。</span>}
        </motion.div>

        <motion.aside
          className="home-visual-wall"
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.34, ease: 'easeOut', delay: 0.08 }}
          aria-label="首页视觉预览"
        >
          <img className="wall-main" src={assetUrl('/assets/enterprise/hero-office.jpg')} alt="IT 企业协作办公场景" />
          <div className="wall-secondary">
            <img src={assetUrl('/assets/enterprise/developer-workspace.jpg')} alt="开发者工作台" />
            <img src={assetUrl('/assets/enterprise/analytics-dashboard.jpg')} alt="招聘数据分析工作台" />
          </div>
          <div className="wall-badge">
            <Layers3 size={18} />
            <span>多页面招聘系统</span>
            <strong>前台 / 简历 / 申请 / 后台</strong>
          </div>
        </motion.aside>
      </section>

      <section className="home-metrics" aria-label="平台数据">
        <article><Statistic title="开放职位" value={stats?.jobCount || 0} suffix="个" /><BriefcaseBusiness size={22} /></article>
        <article><Statistic title="认证企业" value={stats?.companyCount || 0} suffix="家" /><Building2 size={22} /></article>
        <article><Statistic title="求职用户" value={stats?.applicantCount || 0} suffix="人" /><UsersRound size={22} /></article>
        <article><Statistic title="在线投递" value={stats?.applicationCount || 0} suffix="次" /><TrendingUp size={22} /></article>
      </section>

      <section className="image-reel-section" aria-label="招聘平台视觉滚动展示">
        <div className="gallery-section-head">
          <span><Target size={16} />首页视觉系统</span>
          <h2>三组图片滚动，把招聘流程讲清楚。</h2>
          <p>图片承担氛围，卡片承担信息。首屏之后不急着塞列表，而是先建立产品质感。</p>
        </div>
        <div className="image-reel-stack">
          {galleryGroups.map((group) => (
            <article className="image-reel-group" key={group.title}>
              <div className="image-reel-group-copy">
                <strong>{group.title}</strong>
                <span>{group.text}</span>
              </div>
              <div className="image-reel-window">
                <div className={`image-reel-track image-reel-${group.direction}`}>
                  {[...group.items, ...group.items].map((item, index) => (
                    <figure className="image-reel-card" key={`${group.title}-${item.title}-${index}`}>
                      <img src={assetUrl(item.image)} alt={item.title} loading="lazy" />
                      <figcaption>
                        <strong>{item.title}</strong>
                        <span>{item.text}</span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
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
          <h2>从首页进入工作流，内页负责完成判断。</h2>
          <p>职位页看机会，企业页看可信度，简历页补材料，申请页看进度。</p>
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
