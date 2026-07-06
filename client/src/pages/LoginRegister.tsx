import { Alert, Button, Card, Checkbox, Form, Input, Progress, Space, Tabs, Tag } from 'antd';
import { Github, LogIn, MessageCircle, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthContextValue } from '../App';
import { api, assetUrl } from '../api/client';

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
  const [error, setError] = useState('');
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
    setError('');
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
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-layout">
      <motion.div className="auth-visual" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
        <img src={assetUrl('/assets/enterprise/analytics-dashboard.jpg')} alt="招聘数据分析工作台" />
        <div>
          <span className="eyebrow">Q_ITOffer</span>
          <h1>统一管理简历、申请与职位机会</h1>
          <p>求职者前台和管理员后台共用一套 Java Web 会话体系，便于课程验收演示。</p>
          <Space wrap>
            <Tag color="green">发现好职位</Tag>
            <Tag color="blue">维护我的简历</Tag>
            <Tag color="cyan">跟踪申请进度</Tag>
          </Space>
        </div>
      </motion.div>
      <Card className="auth-card">
        <Tabs
          activeKey={mode}
          onChange={(key) => setMode(key as 'login' | 'register')}
          items={[
            { key: 'login', label: <span><LogIn size={16} />登录</span> },
            { key: 'register', label: <span><UserPlus size={16} />注册</span> }
          ]}
        />
        <h1>{mode === 'login' ? '求职者登录' : '创建求职者账号'}</h1>
        <p>演示账号：applicant / applicant123。后台请访问 /manage/login。</p>
        {error && <Alert type="error" showIcon message={error} />}
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
            {mode === 'login' ? '登录' : '注册并登录'}
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
