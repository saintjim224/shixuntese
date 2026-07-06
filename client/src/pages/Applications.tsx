import { App, Button, Card, Collapse, Steps, Tabs, Tag } from 'antd';
import { CalendarClock, CheckCircle2, Eye, MailCheck, Send, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import type { AuthContextValue } from '../App';
import { api, assetUrl } from '../api/client';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../components/StateBlock';
import type { Application } from '../types';

const statusText: Record<Application['status'], string> = {
  SUBMITTED: '已投递',
  VIEWED: '已查看',
  INVITED: '邀面试',
  REJECTED: '不合适'
};

const statusStep: Record<Application['status'], number> = {
  SUBMITTED: 0,
  VIEWED: 1,
  INVITED: 2,
  REJECTED: 1
};

const statusColor: Record<Application['status'], string> = {
  SUBMITTED: 'blue',
  VIEWED: 'cyan',
  INVITED: 'green',
  REJECTED: 'red'
};

export default function Applications({ auth }: { auth: AuthContextValue }) {
  const { message } = App.useApp();
  const [items, setItems] = useState<Application[]>([]);
  const [status, setStatus] = useState<'ALL' | Application['status']>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.applications(status === 'ALL' ? '' : `?status=${status}`)
      .then((result) => setItems(result.items))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [auth.user, status]);

  const counts = useMemo(() => {
    const next: Record<string, number> = { ALL: items.length };
    items.forEach((item) => { next[item.status] = (next[item.status] || 0) + 1; });
    return next;
  }, [items]);

  async function respond(id: number, response: 'ACCEPTED' | 'DECLINED') {
    try {
      await api.respondInterview(id, response);
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, interview_response: response } : item));
      message.success(response === 'ACCEPTED' ? '已接受面试' : '已婉拒面试');
    } catch (err) {
      message.error((err as Error).message);
    }
  }

  if (auth.loading || loading) return <LoadingBlock />;
  if (!auth.user) {
    return (
      <Card className="auth-card">
        <h1>请先登录</h1>
        <p>登录后可以查看你的职位申请进度。</p>
        <Button type="primary" href="#/login">去登录</Button>
      </Card>
    );
  }

  return (
    <div>
      <section className="section-head">
        <div>
          <span className="eyebrow"><CalendarClock size={16} />申请跟踪</span>
          <h1>我的申请</h1>
          <p>查看已投递职位、后台处理状态和面试邀请响应。</p>
        </div>
        <Button href="#/jobs" icon={<Send size={16} />}>继续投递</Button>
      </section>
      <Tabs
        activeKey={status}
        onChange={(key) => setStatus(key as 'ALL' | Application['status'])}
        items={[
          { key: 'ALL', label: `全部 ${counts.ALL || 0}` },
          { key: 'SUBMITTED', label: `已投递 ${counts.SUBMITTED || 0}` },
          { key: 'VIEWED', label: `已查看 ${counts.VIEWED || 0}` },
          { key: 'INVITED', label: `邀面试 ${counts.INVITED || 0}` },
          { key: 'REJECTED', label: `不合适 ${counts.REJECTED || 0}` }
        ]}
      />
      {error && <ErrorBlock message={error} />}
      {!error && items.length === 0 && <EmptyBlock title="还没有申请记录" text="去职位列表选择适合的岗位并提交申请。" />}
      <section className="application-list">
        {items.map((item) => (
          <motion.article key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="application-item-card">
              <div className="application-item">
                <img src={assetUrl(item.company_logo)} alt={`${item.company_name} logo`} loading="lazy" />
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.company_name} / {item.city} / {item.salary_min}-{item.salary_max} 元/月</span>
                  <Tag color={statusColor[item.status]}>{statusText[item.status]}</Tag>
                  {item.interview_response && item.interview_response !== 'PENDING' && (
                    <Tag color={item.interview_response === 'ACCEPTED' ? 'green' : 'red'}>
                      {item.interview_response === 'ACCEPTED' ? '已接受面试' : '已婉拒面试'}
                    </Tag>
                  )}
                </div>
              </div>
              <Steps
                size="small"
                current={statusStep[item.status]}
                status={item.status === 'REJECTED' ? 'error' : 'process'}
                items={[
                  { title: '已投递', icon: <Send size={15} /> },
                  { title: 'HR 初筛', icon: <Eye size={15} /> },
                  { title: '邀面试', icon: item.status === 'INVITED' ? <CheckCircle2 size={15} /> : <MailCheck size={15} /> }
                ]}
              />
              <Collapse
                ghost
                items={[{
                  key: 'detail',
                  label: '查看申请留言',
                  children: (
                    <div className="application-extra">
                      <p>{item.message || '暂无申请留言'}</p>
                      {item.status === 'INVITED' && item.interview_response !== 'ACCEPTED' && item.interview_response !== 'DECLINED' && (
                        <div className="toolbar-actions">
                          <Button type="primary" icon={<CheckCircle2 size={16} />} onClick={() => respond(item.id, 'ACCEPTED')}>接受面试</Button>
                          <Button danger icon={<XCircle size={16} />} onClick={() => respond(item.id, 'DECLINED')}>婉拒</Button>
                        </div>
                      )}
                    </div>
                  )
                }]}
              />
            </Card>
          </motion.article>
        ))}
      </section>
    </div>
  );
}
