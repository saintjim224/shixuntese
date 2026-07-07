import MDEditor from '@uiw/react-md-editor';
import { Alert, App, Button, Card, Descriptions, Drawer, Input, Space, Tag } from 'antd';
import { ArrowLeft, Building2, CheckCircle2, Heart, MapPin, Send, Share2, WalletCards } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { AuthContextValue } from '../App';
import { api, assetUrl } from '../api/client';
import BreadcrumbTrail from '../components/BreadcrumbTrail';
import JobCard from '../components/JobCard';
import { ErrorBlock, LoadingBlock } from '../components/StateBlock';
import { DEMO_JOBS } from '../data/catalog';
import { isBackendUnavailable } from '../demoSession';
import type { Job } from '../types';

export default function JobDetail({ auth }: { auth: AuthContextValue }) {
  const { message: toast } = App.useApp();
  const { id = '' } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [related, setRelated] = useState<Job[]>([]);
  const [message, setMessage] = useState('我对该岗位很感兴趣，希望有机会进一步沟通。');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError('');
    api.job(id)
      .then((result) => {
        setJob(result.job);
        setRelated(result.related || []);
      })
      .catch((err: Error) => {
        const fallback = DEMO_JOBS.find((item) => String(item.id) === id);
        if (fallback) {
          setJob(fallback);
          setRelated(
            DEMO_JOBS.filter((item) => item.id !== fallback.id && (item.category === fallback.category || item.company_id === fallback.company_id)).slice(0, 3)
          );
          setError('');
          return;
        }
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function apply() {
    if (!auth.user) {
      navigate('/login');
      return;
    }
    setSubmitting(true);
    try {
      const result = await api.apply(id, message);
      setFeedback(result.message);
      setError('');
      setDrawerOpen(false);
      toast.success('申请已提交');
    } catch (err) {
      if (isBackendUnavailable(err)) {
        setFeedback('演示申请已提交，可在“我的申请”查看样例进度。');
        setError('');
        setDrawerOpen(false);
        toast.success('演示申请已提交');
      } else {
        setError((err as Error).message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleFavorite() {
    if (!job) return;
    setFavoriteBusy(true);
    try {
      if (job.favorited) {
        await api.unfavoriteJob(job.id);
        setJob({ ...job, favorited: false });
        toast.success('已取消收藏');
      } else {
        await api.favoriteJob(job.id);
        setJob({ ...job, favorited: true });
        toast.success('已收藏职位');
      }
    } catch (err) {
      if (isBackendUnavailable(err)) {
        setJob({ ...job, favorited: !job.favorited });
        toast.success(job.favorited ? '已取消演示收藏' : '已加入演示收藏');
      } else {
        toast.error((err as Error).message);
      }
    } finally {
      setFavoriteBusy(false);
    }
  }

  async function share() {
    await navigator.clipboard?.writeText(window.location.href);
    toast.success('职位链接已复制');
  }

  if (loading) return <LoadingBlock />;
  if (!job) return <ErrorBlock message={error || '职位不存在'} />;

  const highlights = (job.highlights || '').split(',').map((item) => item.trim()).filter(Boolean);

  return (
    <article>
      <BreadcrumbTrail current={job.title} />
      <div className="detail-layout">
        <Link className="back-link" to="/jobs"><ArrowLeft size={18} />返回职位列表</Link>
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="detail-main">
            <div className="detail-title">
              <img src={assetUrl(job.company_logo)} alt={`${job.company_name} logo`} />
              <div>
                <Space wrap>
                  <Tag color="blue">{job.category}</Tag>
                  <Tag color={job.status === 'OPEN' ? 'green' : 'red'}>{job.status === 'OPEN' ? '招聘中' : '已关闭'}</Tag>
                  {highlights.map((item) => <Tag key={item} color="cyan">{item}</Tag>)}
                </Space>
                <h1>{job.title}</h1>
                <p><Building2 size={16} />{job.company_name} / {job.city} / {job.education || '学历不限'}</p>
              </div>
            </div>
            <div className="salary-band"><WalletCards size={22} />{job.salary_min}-{job.salary_max} 元/月</div>
            <Descriptions className="job-descriptions" bordered column={{ xs: 1, md: 2 }}>
              <Descriptions.Item label="工作城市">{job.city}</Descriptions.Item>
              <Descriptions.Item label="经验要求">{job.experience || '经验不限'}</Descriptions.Item>
              <Descriptions.Item label="学历要求">{job.education || '学历不限'}</Descriptions.Item>
              <Descriptions.Item label="招聘人数">{job.headcount} 人</Descriptions.Item>
            </Descriptions>
            <div className="detail-copy markdown-body" data-color-mode="light">
              <h2>职位描述</h2>
              <MDEditor.Markdown source={job.description || '暂无职位描述'} />
              <h2>任职要求</h2>
              <MDEditor.Markdown source={job.requirement_text || '暂无任职要求'} />
              <h2>企业介绍</h2>
              <MDEditor.Markdown source={job.company_description || '暂无企业介绍'} />
            </div>
          </Card>
        </motion.section>
        <aside className="apply-panel">
          <Card>
            <span className="eyebrow"><MapPin size={16} />在线申请</span>
            <h2>投递到 {job.company_name}</h2>
            <p>提交后记录会进入“我的申请”，后台管理员可处理状态，前台会同步展示进度。</p>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button type="primary" block icon={<Send size={18} />} onClick={() => setDrawerOpen(true)}>
                立即申请
              </Button>
              <Button block loading={favoriteBusy} icon={<Heart size={18} fill={job.favorited ? 'currentColor' : 'none'} />} onClick={toggleFavorite}>
                {job.favorited ? '已收藏' : '收藏职位'}
              </Button>
              <Button block icon={<Share2 size={18} />} onClick={share}>复制链接</Button>
            </Space>
            {feedback && <Alert type="success" showIcon title={feedback} icon={<CheckCircle2 size={18} />} />}
            {error && <Alert type="error" showIcon title={error} />}
          </Card>
        </aside>
      </div>

      {related.length > 0 && (
        <>
          <section className="section-head">
            <div>
              <h2>相似职位推荐</h2>
              <p>同类型岗位和同公司岗位优先展示，方便继续比较。</p>
            </div>
          </section>
          <section className="job-grid">
            {related.map((item) => <JobCard key={item.id} job={item} />)}
          </section>
        </>
      )}

      <Drawer
        title="确认投递"
        size="default"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={<Button type="primary" loading={submitting} icon={<Send size={16} />} onClick={apply}>提交申请</Button>}
      >
        <div className="drawer-job-summary">
          <img src={assetUrl(job.company_logo)} alt={`${job.company_name} logo`} />
          <div>
            <strong>{job.title}</strong>
            <span>{job.company_name} / {job.city}</span>
          </div>
        </div>
        <Alert
          type="info"
          showIcon
          title={auth.user ? `将使用 ${auth.user.fullName} 的当前简历投递` : '登录后可以提交申请'}
          style={{ marginBottom: 16 }}
        />
        <label className="drawer-field">
          <span>申请留言</span>
          <Input.TextArea
            value={message}
            rows={6}
            showCount
            maxLength={180}
            onChange={(event) => setMessage(event.target.value)}
          />
        </label>
      </Drawer>
    </article>
  );
}
