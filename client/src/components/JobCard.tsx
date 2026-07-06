import { App, Button, Card, Space, Tag } from 'antd';
import { Building2, Heart, MapPin, Timer, WalletCards } from 'lucide-react';
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
      <Card className="job-card" hoverable>
        <div className="job-card-top">
          <img src={assetUrl(job.company_logo)} alt={`${job.company_name || '企业'} logo`} loading="lazy" />
          <div>
            <h3><Link to={`/jobs/${job.id}`}>{job.title}</Link></h3>
            <p><Building2 size={16} />{job.company_name}</p>
          </div>
        </div>
        <div className="job-meta">
          <Tag icon={<MapPin size={14} />}>{job.city}</Tag>
          <Tag color="green" icon={<WalletCards size={14} />}>{job.salary_min}-{job.salary_max} 元/月</Tag>
          <Tag color="blue">{job.education || '学历不限'}</Tag>
          <Tag>{job.category}</Tag>
          {job.posted_at && <Tag icon={<Timer size={14} />}>{formatDate(job.posted_at)}</Tag>}
        </div>
        {highlights.length > 0 && (
          <Space wrap size={[6, 6]}>
            {highlights.map((item) => <Tag key={item} color="cyan">{item}</Tag>)}
          </Space>
        )}
        <p className="job-desc">{job.description}</p>
        <Space.Compact block>
          <Button type="primary" ghost block href={`#/jobs/${job.id}`}>
            查看详情
          </Button>
          <Button
            aria-label={favorited ? '取消收藏职位' : '收藏职位'}
            icon={<Heart size={17} fill={favorited ? 'currentColor' : 'none'} />}
            loading={busy}
            onClick={toggleFavorite}
          />
        </Space.Compact>
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
