import { App, Button, Card, Tag } from 'antd';
import { Building2, ChevronRight, Clock3, GraduationCap, Heart, MapPin, WalletCards } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, assetUrl } from '../api/client';
import type { Job } from '../types';

export default function JobCard({ job }: { job: Job }) {
  const { message } = App.useApp();
  const [favorited, setFavorited] = useState(Boolean(job.favorited));
  const [busy, setBusy] = useState(false);
  const highlights = (job.highlights || '').split(',').map((item) => item.trim()).filter(Boolean).slice(0, 3);

  async function toggleFavorite() {
    setBusy(true);
    try {
      if (favorited) {
        await api.unfavoriteJob(job.id);
        setFavorited(false);
        message.success('已取消收藏');
      } else {
        await api.favoriteJob(job.id);
        setFavorited(true);
        message.success('已收藏职位');
      }
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
    >
      <Card className="job-card job-card-refined" hoverable>
        <div className="job-card-head">
          <div className="job-card-title">
            <img src={assetUrl(job.company_logo)} alt={`${job.company_name || '企业'} logo`} loading="lazy" />
            <div>
              <h3><Link to={`/jobs/${job.id}`}>{job.title}</Link></h3>
              <p><Building2 size={15} />{job.company_name || '企业信息待同步'}</p>
            </div>
          </div>
          <strong className="job-salary"><WalletCards size={16} />{job.salary_min}-{job.salary_max} 元/月</strong>
        </div>

        <div className="job-meta">
          <Tag icon={<MapPin size={14} />}>{job.city}</Tag>
          <Tag icon={<GraduationCap size={14} />}>{job.education || '学历不限'}</Tag>
          <Tag>{job.category}</Tag>
          {job.posted_at && <Tag icon={<Clock3 size={14} />}>{formatDate(job.posted_at)}</Tag>}
        </div>

        {highlights.length > 0 && (
          <div className="job-highlight-row">
            {highlights.map((item) => <span key={item}>{item}</span>)}
          </div>
        )}

        <p className="job-desc">{job.description || '暂无职位描述，进入详情页查看岗位要求和企业介绍。'}</p>

        <div className="job-card-actions">
          <Button type="primary" href={`#/jobs/${job.id}`}>
            查看详情 <ChevronRight size={16} />
          </Button>
          <Button
            aria-label={favorited ? '取消收藏职位' : '收藏职位'}
            icon={<Heart size={17} fill={favorited ? 'currentColor' : 'none'} />}
            loading={busy}
            onClick={toggleFavorite}
          />
        </div>
      </Card>
    </motion.article>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '刚刚发布';
  const diff = Date.now() - date.getTime();
  const days = Math.max(0, Math.floor(diff / 86400000));
  if (days === 0) return '今天发布';
  return `${days} 天前`;
}
