import { App, Button, Form, Input } from 'antd';
import { Save } from 'lucide-react';
import { useState } from 'react';
import { api } from '../../api/client';
import { AdminCrudShell } from '../components/PageParts';

export function PasswordAdmin() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [busy, setBusy] = useState(false);

  async function submit(values: { oldPassword: string; newPassword: string }) {
    setBusy(true);
    try {
      await api.changePassword(values);
      message.success('密码已修改');
      form.resetFields();
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminCrudShell title="密码修改">
      <div className="admin-password-card">
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item name="oldPassword" label="原密码" rules={[{ required: true, message: '请输入原密码' }]}>
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Form.Item name="newPassword" label="新密码" rules={[{ required: true, min: 6, message: '新密码至少 6 位' }]}>
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请再次输入新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                  return Promise.reject(new Error('两次输入的新密码不一致'));
                }
              })
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={busy} icon={<Save size={16} />}>保存新密码</Button>
        </Form>
      </div>
    </AdminCrudShell>
  );
}
