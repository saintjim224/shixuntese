import { Button, Card, Input, Pagination, Select, Tag } from 'antd';
import { Building2, MapPin, Search, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, assetUrl } from '../api/client';
import PageHero from '../components/PageHero';
import { CardGridSkeleton, EmptyBlock } from '../components/StateBlock';
import { DEMO_COMPANIES, industryBuckets, scaleBuckets } from '../data/catalog';
import type { Company, StatBucket } from '../types';

const demoIndustries = industryBuckets();
const demoScales = scaleBuckets();

export default function Companies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [industry, setIndustry] = useState(searchParams.get('industry') || '');
  const [scale, setScale] = useState(searchParams.get('scale') || '');
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));
  const [companies, setCompanies] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [industries, setIndustries] = useState<StatBucket[]>([]);
  const [scales, setScales] = useState<StatBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    setKeyword(searchParams.get('keyword') || '');
    setIndustry(searchParams.get('industry') || '');
    setScale(searchParams.get('scale') || '');
    setPage(Number(searchParams.get('page') || 1));
    setLoading(true);
    api.companies(`?${searchParams.toString() || 'pageSize=12'}`)
      .then((result) => {
        setDemoMode(false);
        setCompanies(result.items);
        setTotal(Number(result.total || result.items.length));
        setIndustries(result.industries || []);
        setScales(result.scales || []);
      })
      .catch(() => {
        const fallback = filterDemoCompanies(searchParams);
        setDemoMode(true);
        setCompanies(fallback);
        setTotal(fallback.length);
        setIndustries(demoIndustries);
        setScales(demoScales);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  function submit(nextPage = 1) {
    const next = new URLSearchParams();
    if (keyword.trim()) next.set('keyword', keyword.trim());
    if (industry) next.set('industry', industry);
    if (scale) next.set('scale', scale);
    if (nextPage > 1) next.set('page', String(nextPage));
    next.set('pageSize', '12');
    setSearchParams(next);
  }

  return (
    <div className="companies-page">
      <PageHero
        eyebrow={<><Building2 size={16} />企业展示</>}
        title="15 家新一线城市企业，连接完整岗位谱系"
        text="按企业名称、行业、规模或城市筛选招聘主体，优先查看在招职位更多、信息更完整的企业。"
        image={assetUrl('/assets/enterprise/team-collaboration.jpg')}
        alt="企业团队协作会议"
      />

      <Card className="filter-card company-filter-card">
        <div className="filter-bar enterprise-filter">
          <Input
            allowClear
            prefix={<Search size={17} />}
            placeholder="搜索企业名称、行业或城市"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onPressEnter={() => submit()}
          />
          <Select
            allowClear
            showSearch
            placeholder="行业"
            value={industry || undefined}
            options={(industries.length ? industries : demoIndustries).map((item) => ({ value: item.name, label: `${item.name} (${item.value})` }))}
            onChange={(value) => setIndustry(value || '')}
          />
          <Select
            allowClear
            placeholder="规模"
            value={scale || undefined}
            options={(scales.length ? scales : demoScales).map((item) => ({ value: item.name, label: `${item.name} (${item.value})` }))}
            onChange={(value) => setScale(value || '')}
          />
          <Button type="primary" icon={<Search size={17} />} onClick={() => submit()}>搜索</Button>
        </div>
      </Card>

      {loading && <CardGridSkeleton count={6} />}
      {!loading && demoMode && (
        <div className="demo-data-note">
          后端服务未连接，当前展示合规生成的演示企业，保证前台功能可完整预览。
        </div>
      )}
      {!loading && companies.length === 0 && <EmptyBlock title="没有找到企业" text="请更换企业名称、行业、规模或城市关键词。" />}
      {!loading && (
        <motion.section className="company-grid" layout>
          {companies.map((company) => (
            <motion.div key={company.id} whileHover={{ y: -4 }} transition={{ duration: 0.18 }}>
              <Link className="company-card company-banner-card" to={`/companies/${company.id}`}>
                <img src={assetUrl(company.logo_url)} alt={`${company.name} logo`} loading="lazy" />
                <strong>{company.name}</strong>
                <span><MapPin size={15} />{company.city} / {company.industry} / {company.scale}</span>
                <span><Star size={15} />{company.rating || 4.6} 分 / {company.financing_stage || '成长型企业'}</span>
                <p>{company.description}</p>
                <Tag color="green">{company.job_count || 0} 个开放职位</Tag>
              </Link>
            </motion.div>
          ))}
        </motion.section>
      )}
      {!loading && total > 0 && (
        <Pagination
          current={page}
          pageSize={12}
          total={total}
          showSizeChanger={false}
          onChange={submit}
          style={{ marginTop: 24, textAlign: 'center' }}
        />
      )}
    </div>
  );
}

function filterDemoCompanies(params: URLSearchParams) {
  const keyword = (params.get('keyword') || '').trim().toLowerCase();
  const industry = params.get('industry') || '';
  const scale = params.get('scale') || '';
  return DEMO_COMPANIES.filter((company) => {
    const haystack = [company.name, company.city, company.industry, company.scale, company.description].join(' ').toLowerCase();
    const matchKeyword = !keyword || haystack.includes(keyword);
    const matchIndustry = !industry || company.industry === industry;
    const matchScale = !scale || company.scale === scale;
    return matchKeyword && matchIndustry && matchScale;
  });
}
