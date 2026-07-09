import type { Application, Company, Job, StatBucket } from '../types';

export const CITY_COORDINATES = [
  { name: '北京', lng: 116.4074, lat: 39.9042, provinceLevel: true },
  { name: '上海', lng: 121.4737, lat: 31.2304, provinceLevel: true },
  { name: '天津', lng: 117.2, lat: 39.1333, provinceLevel: true },
  { name: '重庆', lng: 106.5516, lat: 29.563, provinceLevel: true },
  { name: '石家庄', lng: 114.5149, lat: 38.0428, provinceLevel: true },
  { name: '太原', lng: 112.5492, lat: 37.8706, provinceLevel: true },
  { name: '呼和浩特', lng: 111.7492, lat: 40.8426, provinceLevel: true },
  { name: '沈阳', lng: 123.4315, lat: 41.8057, provinceLevel: true },
  { name: '长春', lng: 125.3235, lat: 43.8171, provinceLevel: true },
  { name: '哈尔滨', lng: 126.6425, lat: 45.756, provinceLevel: true },
  { name: '南京', lng: 118.7969, lat: 32.0603, provinceLevel: true },
  { name: '杭州', lng: 120.1551, lat: 30.2741, provinceLevel: true },
  { name: '合肥', lng: 117.2272, lat: 31.8206, provinceLevel: true },
  { name: '福州', lng: 119.2965, lat: 26.0745, provinceLevel: true },
  { name: '南昌', lng: 115.8582, lat: 28.6829, provinceLevel: true },
  { name: '济南', lng: 117.1201, lat: 36.6512, provinceLevel: true },
  { name: '郑州', lng: 113.6254, lat: 34.7466, provinceLevel: true },
  { name: '武汉', lng: 114.3054, lat: 30.5931, provinceLevel: true },
  { name: '长沙', lng: 112.9388, lat: 28.2282, provinceLevel: true },
  { name: '广州', lng: 113.2644, lat: 23.1291, provinceLevel: true },
  { name: '南宁', lng: 108.3669, lat: 22.817, provinceLevel: true },
  { name: '海口', lng: 110.3312, lat: 20.0311, provinceLevel: true },
  { name: '成都', lng: 104.0665, lat: 30.5723, provinceLevel: true },
  { name: '贵阳', lng: 106.6302, lat: 26.6477, provinceLevel: true },
  { name: '昆明', lng: 102.8329, lat: 24.8801, provinceLevel: true },
  { name: '拉萨', lng: 91.1175, lat: 29.6475, provinceLevel: true },
  { name: '西安', lng: 108.9398, lat: 34.3416, provinceLevel: true },
  { name: '兰州', lng: 103.8343, lat: 36.0611, provinceLevel: true },
  { name: '西宁', lng: 101.7782, lat: 36.6171, provinceLevel: true },
  { name: '银川', lng: 106.2309, lat: 38.4872, provinceLevel: true },
  { name: '乌鲁木齐', lng: 87.6168, lat: 43.8256, provinceLevel: true },
  { name: '深圳', lng: 114.0579, lat: 22.5431, provinceLevel: false },
  { name: '苏州', lng: 120.5853, lat: 31.2989, provinceLevel: false },
  { name: '青岛', lng: 120.3826, lat: 36.0671, provinceLevel: false },
  { name: '宁波', lng: 121.5503, lat: 29.8746, provinceLevel: false },
  { name: '东莞', lng: 113.7518, lat: 23.0207, provinceLevel: false },
  { name: '佛山', lng: 113.1214, lat: 23.0215, provinceLevel: false },
  { name: '厦门', lng: 118.0894, lat: 24.4798, provinceLevel: false },
  { name: '大连', lng: 121.6147, lat: 38.914, provinceLevel: false }
];

export const NEW_TIER_CITIES = CITY_COORDINATES.map((city) => city.name);

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
  '产品经理'
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

const JOBS_PER_COMPANY = 10;

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
  company(93000 + 1, '北京京辰数智科技有限公司', '北京', '人工智能', '50-99人', '成长型企业', 4.4, 2013, 0, '扎根北京的软件与数字化团队，围绕人工智能场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 2, '上海海派云联科技有限公司', '上海', '企业服务', '100-499人', 'A 轮', 4.5, 2014, 1, '扎根上海的软件与数字化团队，围绕企业服务场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 3, '天津海河云原生科技有限公司', '天津', '云计算', '500-999人', 'B 轮', 4.6, 2015, 2, '扎根天津的软件与数字化团队，围绕云计算场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 4, '重庆山城数智科技有限公司', '重庆', '工业互联网', '1000人以上', '成熟企业', 4.7, 2016, 3, '扎根重庆的软件与数字化团队，围绕工业互联网场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 5, '石家庄燕赵软件科技有限公司', '石家庄', '政企软件', '50-99人', 'C 轮', 4.8, 2017, 4, '扎根石家庄的软件与数字化团队，围绕政企软件场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 6, '太原晋源数据科技有限公司', '太原', '能源数字化', '100-499人', '成长型企业', 4.4, 2018, 5, '扎根太原的软件与数字化团队，围绕能源数字化场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 7, '呼和浩特青城云服科技有限公司', '呼和浩特', '企业服务', '500-999人', 'A 轮', 4.5, 2019, 6, '扎根呼和浩特的软件与数字化团队，围绕企业服务场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 8, '沈阳盛京工业软件有限公司', '沈阳', '工业软件', '1000人以上', 'B 轮', 4.6, 2020, 7, '扎根沈阳的软件与数字化团队，围绕工业软件场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 9, '长春北辰车联网科技有限公司', '长春', '车联网', '50-99人', '成熟企业', 4.7, 2021, 8, '扎根长春的软件与数字化团队，围绕车联网场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 10, '哈尔滨冰城信息科技有限公司', '哈尔滨', '智慧城市', '100-499人', 'C 轮', 4.8, 2022, 9, '扎根哈尔滨的软件与数字化团队，围绕智慧城市场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 11, '南京玄武安全科技有限公司', '南京', '信息安全', '500-999人', '成长型企业', 4.4, 2023, 10, '扎根南京的软件与数字化团队，围绕信息安全场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 12, '杭州栈云智能科技有限公司', '杭州', '人工智能', '1000人以上', 'A 轮', 4.5, 2013, 11, '扎根杭州的软件与数字化团队，围绕人工智能场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 13, '合肥星河芯软科技有限公司', '合肥', '嵌入式软件', '50-99人', 'B 轮', 4.6, 2014, 12, '扎根合肥的软件与数字化团队，围绕嵌入式软件场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 14, '福州榕城数字科技有限公司', '福州', '数字政务', '100-499人', '成熟企业', 4.7, 2015, 13, '扎根福州的软件与数字化团队，围绕数字政务场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 15, '南昌赣江软件有限公司', '南昌', '软件服务', '500-999人', 'C 轮', 4.8, 2016, 14, '扎根南昌的软件与数字化团队，围绕软件服务场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 16, '济南泉城数据科技有限公司', '济南', '数据服务', '1000人以上', '成长型企业', 4.4, 2017, 15, '扎根济南的软件与数字化团队，围绕数据服务场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 17, '郑州中原数据科技有限公司', '郑州', '数据服务', '50-99人', 'A 轮', 4.5, 2018, 16, '扎根郑州的软件与数字化团队，围绕数据服务场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 18, '武汉知行云软件有限公司', '武汉', '教育科技', '100-499人', 'B 轮', 4.6, 2019, 17, '扎根武汉的软件与数字化团队，围绕教育科技场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 19, '长沙麓山产品设计有限公司', '长沙', '数字产品', '500-999人', '成熟企业', 4.7, 2020, 18, '扎根长沙的软件与数字化团队，围绕数字产品场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 20, '广州珠江智造科技有限公司', '广州', '数字商业', '1000人以上', 'C 轮', 4.8, 2021, 19, '扎根广州的软件与数字化团队，围绕数字商业场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 21, '南宁邕城信息科技有限公司', '南宁', '企业服务', '50-99人', '成长型企业', 4.4, 2022, 20, '扎根南宁的软件与数字化团队，围绕企业服务场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 22, '海口椰城云链科技有限公司', '海口', '跨境服务', '100-499人', 'A 轮', 4.5, 2023, 21, '扎根海口的软件与数字化团队，围绕跨境服务场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 23, '成都云程科技有限公司', '成都', '企业服务', '500-999人', 'B 轮', 4.6, 2013, 22, '扎根成都的软件与数字化团队，围绕企业服务场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 24, '贵阳黔云大数据有限公司', '贵阳', '大数据', '1000人以上', '成熟企业', 4.7, 2014, 23, '扎根贵阳的软件与数字化团队，围绕大数据场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 25, '昆明春城数字科技有限公司', '昆明', '文旅科技', '50-99人', 'C 轮', 4.8, 2015, 24, '扎根昆明的软件与数字化团队，围绕文旅科技场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 26, '拉萨雪域云服科技有限公司', '拉萨', '政企服务', '100-499人', '成长型企业', 4.4, 2016, 25, '扎根拉萨的软件与数字化团队，围绕政企服务场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 27, '西安秦岭算法实验室', '西安', '算法平台', '500-999人', 'A 轮', 4.5, 2017, 26, '扎根西安的软件与数字化团队，围绕算法平台场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 28, '兰州黄河云智科技有限公司', '兰州', '能源软件', '1000人以上', 'B 轮', 4.6, 2018, 27, '扎根兰州的软件与数字化团队，围绕能源软件场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 29, '西宁青唐信息科技有限公司', '西宁', '数据平台', '50-99人', '成熟企业', 4.7, 2019, 28, '扎根西宁的软件与数字化团队，围绕数据平台场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 30, '银川塞上云服科技有限公司', '银川', '云服务', '100-499人', 'C 轮', 4.8, 2020, 29, '扎根银川的软件与数字化团队，围绕云服务场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 31, '乌鲁木齐天山数字科技有限公司', '乌鲁木齐', '智慧城市', '500-999人', '成长型企业', 4.4, 2021, 30, '扎根乌鲁木齐的软件与数字化团队，围绕智慧城市场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 32, '深圳南山工程云科技有限公司', '深圳', '互联网平台', '1000人以上', 'A 轮', 4.5, 2022, 31, '扎根深圳的软件与数字化团队，围绕互联网平台场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 33, '苏州澄湖工业互联网有限公司', '苏州', '智能制造', '50-99人', 'B 轮', 4.6, 2023, 32, '扎根苏州的软件与数字化团队，围绕智能制造场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 34, '青岛海创测试平台有限公司', '青岛', '质量工程', '100-499人', '成熟企业', 4.7, 2013, 33, '扎根青岛的软件与数字化团队，围绕质量工程场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 35, '宁波甬港数字供应链有限公司', '宁波', '供应链 SaaS', '500-999人', 'C 轮', 4.8, 2014, 34, '扎根宁波的软件与数字化团队，围绕供应链 SaaS场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 36, '东莞莞芯智能制造有限公司', '东莞', '智能硬件', '1000人以上', '成长型企业', 4.4, 2015, 35, '扎根东莞的软件与数字化团队，围绕智能硬件场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 37, '佛山岭南制造云有限公司', '佛山', '制造业 SaaS', '50-99人', 'A 轮', 4.5, 2016, 36, '扎根佛山的软件与数字化团队，围绕制造业 SaaS场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 38, '厦门鹭岛数字科技有限公司', '厦门', '跨境电商', '100-499人', 'B 轮', 4.6, 2017, 37, '扎根厦门的软件与数字化团队，围绕跨境电商场景提供产品研发、数据平台和工程交付服务。'),
  company(93000 + 39, '大连星海软件科技有限公司', '大连', '软件外包', '500-999人', '成熟企业', 4.7, 2018, 38, '扎根大连的软件与数字化团队，围绕软件外包场景提供产品研发、数据平台和工程交付服务。')
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
  template('产品经理', '产品经理', 9000, 18000, '本科及以上', '1-3年', 2, '需求分析,原型设计,数据驱动', '负责招聘链路需求梳理、原型设计、版本验收和数据复盘。', '具备清晰表达、用户研究和跨团队协作能力。')
];

export const DEMO_JOBS: Job[] = DEMO_COMPANIES.flatMap((company, companyIndex) =>
  jobTemplates.map((base, slot) => {
    const salaryShift = (companyIndex % 6) * 700 + (slot % 3) * 300;
    return {
      id: 94000 + companyIndex * jobTemplates.length + slot + 1,
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
      description: `${base.description} 团队位于${company.city}，业务方向聚焦${company.industry}。`,
      requirement_text: base.requirement_text,
      status: 'OPEN',
      posted_at: postedAt(companyIndex, slot),
      company_name: company.name,
      company_logo: company.logo_url,
      company_industry: company.industry,
      company_description: company.description,
      favorited: company.city === '成都' && slot === 1
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
    job_count: JOBS_PER_COMPANY
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
  const day = String(Math.max(1, 28 - (companyIndex % 18))).padStart(2, '0');
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
