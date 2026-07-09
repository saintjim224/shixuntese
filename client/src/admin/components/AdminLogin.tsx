import { App, Button, Card, Form, Input } from 'antd';
import { useState } from 'react';
import type { AuthContextValue } from '../../App';
import { api } from '../../api/client';
import { frontHref } from '../utils';

export function AdminLogin({ auth }: { auth: AuthContextValue }) {
  const { message } = App.useApp();
  const [busy, setBusy] = useState(false);

  async function submit(values: { username: string; password: string }) {
    setBusy(true);
    try {
      await api.login(values);
      await auth.refresh();
      message.success('管理员已登录');
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-login-page">
      <Card className="admin-login-card">
        <div className="admin-login-brand">
          <span className="legacy-admin-logo-mark">Q</span>
          <div>
            <h1>Q_ITOffer 后台登录</h1>
            <p>请输入管理员账号进入后台管理系统。</p>
          </div>
        </div>
        <Form layout="vertical" initialValues={{ username: 'Saintjim', password: '123456' }} onFinish={submit}>
          <Form.Item name="username" label="管理员账号" rules={[{ required: true, message: '请输入管理员账号' }]}>
            <Input autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={busy}>登录后台</Button>
        </Form>
        <a className="admin-login-front" href={frontHref()}>返回网站前台</a>
      </Card>
    </main>
  );
}
