import { Button, Card, Checkbox, Form, Input, Progress, Space, Tabs } from 'antd';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  FileText,
  Github,
  LogIn,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UserPlus
} from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthContextValue } from '../App';
import { api, assetUrl } from '../api/client';
import { enableDemoSession, isBackendUnavailable, isDemoAccount } from '../demoSession';

type LoginValues = {
  username: string;
  password: string;
  remember?: boolean;
  fullName?: string;
  email?: string;
  phone?: string;
};

export default function LoginRegister({ auth }: { auth: AuthContextValue }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [form] = Form.useForm<LoginValues>();
  const password = Form.useWatch('password', form) || '';
  const navigate = useNavigate();

  useEffect(() => {
    form.resetFields();
    if (mode === 'login') {
      form.setFieldsValue({ username: 'applicant', password: 'applicant123' });
    }
  }, [form, mode]);

  async function submit(values: LoginValues) {
    setBusy(true);
    setFormError('');
    setNotice('');
    try {
      if (mode === 'login') {
        await api.login({ username: values.username, password: values.password });
      } else {
        await api.register({
          username: values.username,
          password: values.password,
          fullName: values.fullName || '',
          email: values.email || '',
          phone: values.phone || ''
        });
      }
      await auth.refresh();
      navigate('/resume');
    } catch (err) {
      if (mode === 'login' && isBackendUnavailable(err)) {
        if (isDemoAccount(values.username, values.password)) {
          enableDemoSession();
          await auth.refresh();
          navigate('/resume');
          return;
        }
        setNotice('当前处于前端演示模式，请使用 applicant / applicant123 进入本地体验。');
      } else {
        setFormError((err as Error).message || '登录没有完成，请稍后再试。');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-layout auth-layout-polished">
      <motion.div className="auth-visual auth-visual-upgraded" initial={false} animate={{ opacity: 1, x: 0 }}>
        <img src={assetUrl('/assets/enterprise/developer-workspace.jpg')} alt="开发者求职工作台" />
        <div className="auth-visual-content">
          <span className="eyebrow"><Sparkles size={16} />Q_ITOffer Campus Hiring</span>
          <h1>登录后直接进入你的 IT 求职工作台</h1>
          <p>职位搜索、简历维护和申请进度放在同一条产品流程里，演示时即使后端未启动也能完整浏览。</p>
          <div className="auth-proof-grid">
            <span><BriefcaseBusiness size={17} />职位机会</span>
            <span><FileText size={17} />简历资产</span>
            <span><Building2 size={17} />企业背书</span>
            <span><BadgeCheck size={17} />申请跟踪</span>
          </div>
        </div>
      </motion.div>
      <Card className="auth-card auth-card-polished">
        <div className="auth-card-kicker">
          <ShieldCheck size={17} />
          前端演示可离线进入
        </div>
        <Tabs
          activeKey={mode}
          onChange={(key) => setMode(key as 'login' | 'register')}
          items={[
            { key: 'login', label: <span><LogIn size={16} />登录</span> },
            { key: 'register', label: <span><UserPlus size={16} />注册</span> }
          ]}
        />
        <h1>{mode === 'login' ? '求职者登录' : '创建求职者账号'}</h1>
        <p>演示账号已自动填入。后端未启动时，点击登录会进入本地体验模式。</p>
        {notice && (
          <div className="auth-inline-note">
            <CheckCircle2 size={17} />
            <span>{notice}</span>
          </div>
        )}
        {formError && (
          <div className="auth-inline-note auth-inline-note-danger">
            <ShieldCheck size={17} />
            <span>{formError}</span>
          </div>
        )}
        <Form form={form} layout="vertical" onFinish={submit} className="form-stack">
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input autoComplete="username" />
          </Form.Item>
          {mode === 'register' && (
            <Form.Item name="fullName" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
              <Input autoComplete="name" />
            </Form.Item>
          )}
          {mode === 'register' && (
            <Form.Item name="email" label="邮箱">
              <Input type="email" autoComplete="email" />
            </Form.Item>
          )}
          {mode === 'register' && (
            <Form.Item name="phone" label="手机号">
              <Input autoComplete="tel" />
            </Form.Item>
          )}
          <Form.Item name="password" label="密码" rules={[{ required: true, min: 6, message: '密码至少 6 位' }]}>
            <Input.Password autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </Form.Item>
          {mode === 'register' && (
            <Progress
              percent={passwordStrength(password)}
              size="small"
              status={passwordStrength(password) > 70 ? 'success' : 'active'}
              format={(percent) => (Number(percent) > 70 ? '强' : Number(percent) > 40 ? '中' : '弱')}
            />
          )}
          {mode === 'login' && (
            <div className="toolbar-actions" style={{ justifyContent: 'space-between' }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
              <Button type="link" size="small">忘记密码</Button>
            </div>
          )}
          <Button type="primary" htmlType="submit" block loading={busy}>
            {mode === 'login' ? <>进入求职工作台 <ArrowRight size={17} /></> : '注册并登录'}
          </Button>
          <Space.Compact block>
            <Button icon={<Github size={17} />} disabled block>GitHub 登录开发中</Button>
            <Button icon={<MessageCircle size={17} />} disabled block>微信开发中</Button>
          </Space.Compact>
        </Form>
      </Card>
    </section>
  );
}

function passwordStrength(value: string) {
  let score = 0;
  if (value.length >= 6) score += 35;
  if (/[A-Z]/.test(value)) score += 20;
  if (/[0-9]/.test(value)) score += 20;
  if (/[^A-Za-z0-9]/.test(value)) score += 25;
  return Math.min(100, score);
}
