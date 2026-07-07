import type { Application, Company, Job, StatBucket } from '../types';

export const NEW_TIER_CITIES = [
  '成都',
  '杭州',
  '重庆',
  '武汉',
  '苏州',
  '西安',
  '南京',
  '长沙',
  '郑州',
  '天津',
  '合肥',
  '青岛',
  '东莞',
  '宁波',
  '佛山'
];

export const JOB_CATEGORIES = [
  '前端开发',
  '后端开发',
  '全栈开发',
  '测试开发',
  '数据分析',
  '算法/机器学习',
  '大数据开发',
  '云原生/DevOps',
  '安全工程',
  '数据库 DBA',
  '移动端开发',
  '嵌入式开发',
  '产品经理',
  'UI/UX 设计',
  '实施/运维'
];

export const EDUCATION_OPTIONS = ['专科及以上', '本科及以上', '硕士及以上', '学历不限'];
export const EXPERIENCE_OPTIONS = ['不限', '1年以内', '1-3年', '3-5年', '5年以上'];

export const SALARY_OPTIONS = [
  { label: '不限薪资', value: '' },
  { label: '5K 以下', value: '0-5000' },
  { label: '5K-10K', value: '5000-10000' },
  { label: '10K-20K', value: '10000-20000' },
  { label: '20K-30K', value: '20000-30000' },
  { label: '30K 以上', value: '30000-0' }
];

export const CITY_OPTIONS = NEW_TIER_CITIES.map((city) => ({ label: city, value: city }));
export const CATEGORY_OPTIONS = JOB_CATEGORIES.map((category) => ({ label: category, value: category }));

const logos = [
  '/assets/635508802169230812.jpg',
  '/assets/635170123249913750.jpg',
  '/assets/635086129655240312.jpg',
  '/assets/635581231315281772.jpg',
  '/assets/it-logo.png'
];

const banners = [
  '/assets/enterprise/team-collaboration.jpg',
  '/assets/enterprise/developer-workspace.jpg',
  '/assets/enterprise/analytics-dashboard.jpg',
  '/assets/enterprise/hero-office.jpg'
];

export const DEMO_COMPANIES: Company[] = [
  company(93001, '成都云程科技有限公司', '成都', '企业服务', '100-499人', 'B 轮', 4.7, 2018, 0, '专注企业级协同系统和数据中台建设，为制造、教育和政企客户提供软件交付服务。'),
  company(93002, '杭州栈云智能科技有限公司', '杭州', '人工智能', '100-499人', 'A 轮', 4.8, 2020, 1, '面向招聘、客服和运营场景提供智能文本分析、画像推荐和自动化流程能力。'),
  company(93003, '重庆山城数智科技有限公司', '重庆', '工业互联网', '500-999人', 'B 轮', 4.6, 2017, 2, '建设制造业数据平台、设备联网和供应链协同工具，重视工程质量与长期交付。'),
  company(93004, '武汉知行云软件有限公司', '武汉', '教育科技', '50-99人', 'Pre-A 轮', 4.5, 2021, 3, '服务高校实训、企业校招和在线学习业务，团队强调产品体验和敏捷迭代。'),
  company(93005, '苏州澄湖工业互联网有限公司', '苏州', '智能制造', '1000人以上', '成熟企业', 4.7, 2015, 4, '提供工厂数字化、质量追踪和现场数据采集平台，覆盖长三角制造客户。'),
  company(93006, '西安秦岭算法实验室', '西安', '算法平台', '100-499人', 'A 轮', 4.8, 2019, 0, '围绕推荐、搜索和视觉检测建设算法服务，支持招聘、零售和工业场景。'),
  company(93007, '南京玄武安全科技有限公司', '南京', '信息安全', '100-499人', 'B 轮', 4.6, 2016, 1, '为政企客户提供应用安全、身份访问管理和安全运营平台。'),
  company(93008, '长沙麓山产品设计有限公司', '长沙', '数字产品', '50-99人', '成长型企业', 4.5, 2020, 2, '为教育、政务和企业服务客户提供产品设计、前端工程和运营增长支持。'),
  company(93009, '郑州中原数据科技有限公司', '郑州', '数据服务', '100-499人', 'A 轮', 4.6, 2018, 3, '建设数据治理、BI 看板和指标平台，服务区域企业数字化转型。'),
  company(93010, '天津海河云原生科技有限公司', '天津', '云计算', '100-499人', 'B 轮', 4.7, 2017, 4, '提供 Kubernetes 平台、DevOps 工具链和企业上云咨询服务。'),
  company(93011, '合肥星河芯软科技有限公司', '合肥', '嵌入式软件', '500-999人', 'C 轮', 4.8, 2014, 0, '聚焦车载、工业控制和物联网终端的软件研发与测试验证。'),
  company(93012, '青岛海创测试平台有限公司', '青岛', '质量工程', '100-499人', 'A 轮', 4.6, 2019, 1, '为互联网与工业软件团队提供自动化测试、性能压测和质量度量平台。'),
  company(93013, '东莞莞芯智能制造有限公司', '东莞', '智能硬件', '1000人以上', '成熟企业', 4.5, 2013, 2, '将智能硬件、嵌入式系统和生产数据平台连接到制造现场。'),
  company(93014, '宁波甬港数字供应链有限公司', '宁波', '供应链 SaaS', '100-499人', 'B 轮', 4.7, 2018, 3, '服务港口、仓储和跨境贸易客户，建设订单、履约和风控系统。'),
  company(93015, '佛山岭南制造云有限公司', '佛山', '制造业 SaaS', '500-999人', '成长型企业', 4.6, 2016, 4, '为泛家居和装备制造企业提供生产计划、设备运维和数据分析平台。')
];

const jobTemplates = [
  template('前端开发工程师', '前端开发', 9000, 16000, '本科及以上', '1-3年', 3, 'React,TypeScript,组件工程化', '负责招聘、企业展示和数据看板等 Web 前台模块，推动组件复用和交互体验优化。', '熟悉 React、TypeScript、路由、表单和浏览器调试，理解接口联调和可访问性基础。'),
  template('Java 后端开发工程师', '后端开发', 10000, 18000, '本科及以上', '1-3年', 4, 'Java,Spring Boot,MySQL', '建设职位、企业、简历和投递流程 API，保障核心业务数据一致性与稳定性。', '掌握 Java 基础、RESTful API、SQL 调优和常见 Web 安全策略。'),
  template('Web 全栈开发工程师', '全栈开发', 12000, 22000, '本科及以上', '3-5年', 2, 'React,Java Web,接口联调', '连接前端体验和后端业务模型，负责从需求拆解到上线验证的端到端交付。', '具备前后端开发经验，能独立完成数据建模、接口设计和页面实现。'),
  template('测试开发工程师', '测试开发', 9000, 15000, '本科及以上', '1-3年', 3, '自动化测试,接口测试,质量平台', '负责招聘流程关键链路自动化测试、缺陷跟踪和质量看板建设。', '熟悉 HTTP、SQL、自动化测试框架和持续集成流程。'),
  template('数据分析师', '数据分析', 9000, 17000, '本科及以上', '1-3年', 2, 'SQL,BI,指标体系', '围绕职位转化、投递效率和企业活跃度做指标分析，输出产品决策洞察。', '熟悉 SQL、数据可视化和业务分析方法，能把问题拆成可衡量指标。'),
  template('机器学习算法工程师', '算法/机器学习', 16000, 30000, '硕士及以上', '1-3年', 2, '推荐算法,NLP,特征工程', '参与岗位推荐、简历匹配和文本理解模型建设，提升人岗匹配效率。', '理解机器学习基础、特征工程、模型评估和 Python 工程实践。'),
  template('大数据开发工程师', '大数据开发', 13000, 24000, '本科及以上', '1-3年', 3, 'Flink,Spark,数据仓库', '建设招聘数据采集、清洗、离线仓库和实时指标链路。', '熟悉 SQL、数据仓库建模和至少一种大数据计算框架。'),
  template('云原生 DevOps 工程师', '云原生/DevOps', 14000, 26000, '本科及以上', '1-3年', 2, 'Kubernetes,Docker,CI/CD', '维护应用发布、容器平台和监控告警体系，提升交付效率与稳定性。', '熟悉 Linux、容器、流水线和基础网络排障。'),
  template('安全工程师', '安全工程', 13000, 25000, '本科及以上', '1-3年', 2, '应用安全,渗透测试,安全运营', '负责 Web 应用安全评估、漏洞治理和安全运营流程建设。', '理解常见 Web 漏洞、权限模型和安全测试方法。'),
  template('数据库 DBA', '数据库 DBA', 12000, 22000, '本科及以上', '1-3年', 1, 'MySQL,备份恢复,性能优化', '负责核心数据库性能监控、备份恢复、慢 SQL 分析和容量规划。', '熟悉 MySQL、索引设计、事务隔离和高可用基础。'),
  template('移动端开发工程师', '移动端开发', 10000, 19000, '本科及以上', '1-3年', 2, 'Flutter,Android,移动体验', '开发招聘移动端功能，优化职位浏览、简历维护和消息提醒体验。', '熟悉移动端页面结构、接口联调、性能优化和发布流程。'),
  template('嵌入式软件工程师', '嵌入式开发', 11000, 21000, '本科及以上', '1-3年', 2, 'C/C++,RTOS,设备通信', '参与物联网终端和工业设备软件开发，连接设备数据与业务平台。', '掌握 C/C++、基础硬件接口和嵌入式调试方法。'),
  template('产品经理', '产品经理', 9000, 18000, '本科及以上', '1-3年', 2, '需求分析,原型设计,数据驱动', '负责招聘链路需求梳理、原型设计、版本验收和数据复盘。', '具备清晰表达、用户研究和跨团队协作能力。'),
  template('UI/UX 设计师', 'UI/UX 设计', 9000, 17000, '本科及以上', '1-3年', 2, 'Figma,设计系统,可用性测试', '负责招聘产品前台和后台的界面设计、组件规范和体验走查。', '熟悉信息架构、视觉层级、交互原型和设计交付。'),
  template('实施运维工程师', '实施/运维', 8000, 15000, '专科及以上', '不限', 4, 'Linux,客户交付,故障排查', '参与企业客户部署、配置、培训和上线后的问题跟进。', '熟悉 Linux 基础、数据库配置和客户沟通流程。')
];

export const DEMO_JOBS: Job[] = DEMO_COMPANIES.flatMap((company, companyIndex) =>
  [0, 1, 2].map((slot) => {
    const base = jobTemplates[(companyIndex * 3 + slot) % jobTemplates.length];
    const salaryShift = (companyIndex % 4) * 800;
    return {
      id: 94000 + companyIndex * 3 + slot + 1,
      company_id: company.id,
      title: base.title,
      category: base.category,
      salary_min: base.salary_min + salaryShift,
      salary_max: base.salary_max + salaryShift,
      city: company.city,
      education: base.education,
      experience: base.experience,
      headcount: base.headcount,
      highlights: base.highlights,
      description: `${base.description} 所属团队位于${company.city}，业务覆盖${company.industry}方向。`,
      requirement_text: base.requirement_text,
      status: 'OPEN',
      posted_at: postedAt(companyIndex, slot),
      company_name: company.name,
      company_logo: company.logo_url,
      company_industry: company.industry,
      company_description: company.description,
      favorited: companyIndex === 0 && slot === 0
    };
  })
);

export const DEMO_APPLICATIONS: Application[] = DEMO_JOBS.slice(0, 4).map((job, index) => ({
  id: 96001 + index,
  status: (['SUBMITTED', 'VIEWED', 'INVITED', 'REJECTED'] as const)[index],
  interview_response: index === 2 ? 'PENDING' : undefined,
  message: index === 0 ? '希望加入团队参与校园招聘产品的前端与数据体验建设。' : '我对该岗位很感兴趣，希望有机会进一步沟通。',
  applied_at: postedAt(index, 0),
  title: job.title,
  city: job.city,
  salary_min: job.salary_min,
  salary_max: job.salary_max,
  company_name: job.company_name || '',
  company_logo: job.company_logo
}));

export function cityBuckets(jobs: Job[] = DEMO_JOBS): StatBucket[] {
  return bucketBy(jobs.map((job) => job.city), NEW_TIER_CITIES);
}

export function categoryBuckets(jobs: Job[] = DEMO_JOBS): StatBucket[] {
  return bucketBy(jobs.map((job) => job.category), JOB_CATEGORIES);
}

export function industryBuckets(companies: Company[] = DEMO_COMPANIES): StatBucket[] {
  return bucketBy(companies.map((company) => company.industry));
}

export function scaleBuckets(companies: Company[] = DEMO_COMPANIES): StatBucket[] {
  return bucketBy(companies.map((company) => company.scale || '规模待披露'));
}

function company(
  id: number,
  name: string,
  city: string,
  industry: string,
  scale: string,
  financingStage: string,
  rating: number,
  foundedYear: number,
  assetIndex: number,
  description: string
): Company {
  return {
    id,
    name,
    logo_url: logos[assetIndex % logos.length],
    banner_url: banners[assetIndex % banners.length],
    city,
    industry,
    scale,
    founded_year: foundedYear,
    financing_stage: financingStage,
    rating,
    website: `https://example.com/qitoffer-${id}`,
    description,
    job_count: 3
  };
}

function template(
  title: string,
  category: string,
  salary_min: number,
  salary_max: number,
  education: string,
  experience: string,
  headcount: number,
  highlights: string,
  description: string,
  requirement_text: string
) {
  return { title, category, salary_min, salary_max, education, experience, headcount, highlights, description, requirement_text };
}

function postedAt(companyIndex: number, slot: number) {
  const day = String(Math.max(1, 28 - companyIndex - slot)).padStart(2, '0');
  return `2026-06-${day}T09:${String((companyIndex * 7 + slot * 11) % 60).padStart(2, '0')}:00+08:00`;
}

function bucketBy(values: Array<string | undefined>, order: string[] = []): StatBucket[] {
  const counts = values.reduce<Record<string, number>>((next, value) => {
    if (!value) return next;
    next[value] = (next[value] || 0) + 1;
    return next;
  }, {});
  const ordered = order.filter((name) => counts[name]).map((name) => ({ name, value: counts[name] }));
  const rest = Object.entries(counts)
    .filter(([name]) => !order.includes(name))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'))
    .map(([name, value]) => ({ name, value }));
  return [...ordered, ...rest];
}
