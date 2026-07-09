import { App, Button, Form, Input, Modal, Select, Space, Table } from 'antd';
import { Save, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../../api/client';
import type { AdminUser, Role } from '../../types';
import { roleOptions, userStatusOptions } from '../constants';
import { AdminCrudShell, FilterBar } from '../components/PageParts';
import { renderRole, renderUserStatus } from '../renderers';
import type { FilterMap } from '../types';
import { exactOrEmpty, tablePagination, textIncludes } from '../utils';

export function UsersAdmin({ currentUserId, currentRole }: { currentUserId: number; currentRole: Role }) {
  const { message, modal } = App.useApp();
  const [items, setItems] = useState<AdminUser[]>([]);
  const [filters, setFilters] = useState<FilterMap>({});
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form] = Form.useForm<Record<string, unknown>>();

  const load = () => api.admin.users().then((result) => setItems(result.items));

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => items.filter((item) => (
    textIncludes(`${item.username} ${item.full_name} ${item.email || ''} ${item.phone || ''}`, filters.keyword) &&
    exactOrEmpty(item.role, filters.role) &&
    exactOrEmpty(item.status, filters.status)
  )), [items, filters]);
  const isCurrentSuperAdmin = currentRole === 'SUPER_ADMIN';
  const isProtectedAccount = (record: AdminUser) => (
    record.id === currentUserId ||
    record.role === 'SUPER_ADMIN' ||
    (record.role === 'ADMIN' && !isCurrentSuperAdmin)
  );

  async function save(values: Record<string, unknown>) {
    if (editing) await api.admin.updateUser(editing.id, values);
    else await api.admin.createUser(values);
    message.success('用户已保存');
    setOpen(false);
    setEditing(null);
    form.resetFields();
    load();
  }

  function edit(record: AdminUser) {
    setEditing(record);
    form.setFieldsValue({
      username: record.username,
      role: record.role,
      fullName: record.full_name,
      email: record.email,
      phone: record.phone,
      status: record.status
    });
    setOpen(true);
  }

  async function toggle(record: AdminUser) {
    await api.admin.toggleUser(record.id);
    message.success('用户状态已更新');
    load();
  }

  function remove(record: AdminUser) {
    modal.confirm({
      title: '删除用户',
      content: `确认删除 ${record.username}？`,
      onOk: async () => {
        await api.admin.deleteUser(record.id);
        message.success('用户已删除');
        load();
      }
    });
  }

  return (
    <AdminCrudShell title="用户管理" total={filtered.length} onAdd={() => { setEditing(null); form.resetFields(); form.setFieldsValue({ role: 'APPLICANT', status: 'ACTIVE' }); setOpen(true); }}>
      <FilterBar onSearch={setFilters}>
        <Form.Item name="keyword" label="关键词"><Input allowClear /></Form.Item>
        <Form.Item name="role" label="用户角色"><Select allowClear options={roleOptions()} /></Form.Item>
        <Form.Item name="status" label="用户状态"><Select allowClear options={userStatusOptions()} /></Form.Item>
      </FilterBar>
      <Table
        rowKey="id"
        dataSource={filtered}
        pagination={tablePagination(filtered.length)}
        scroll={{ x: 980 }}
        columns={[
          { title: '用户登录名', dataIndex: 'username', width: 150 },
          { title: '用户真实姓名', dataIndex: 'full_name', width: 160 },
          { title: '用户Email', dataIndex: 'email', width: 210 },
          { title: '用户角色', dataIndex: 'role', width: 130, render: renderRole },
          { title: '用户状态', dataIndex: 'status', width: 110, render: renderUserStatus },
          {
            title: '操作',
            width: 240,
            render: (_, record: AdminUser) => (
              <Space>
                <Button size="small" disabled={record.role === 'SUPER_ADMIN' && !isCurrentSuperAdmin} onClick={() => edit(record)}>修改</Button>
                <Button size="small" disabled={isProtectedAccount(record)} onClick={() => toggle(record)}>切换状态</Button>
                <Button size="small" danger disabled={isProtectedAccount(record)} onClick={() => remove(record)} icon={<Trash2 size={14} />}>删除</Button>
              </Space>
            )
          }
        ]}
      />
      <Modal title={editing ? '修改用户' : '新增用户'} open={open} onCancel={() => setOpen(false)} footer={null} width={620}>
        <Form form={form} layout="vertical" className="admin-form-grid" onFinish={save}>
          <Form.Item name="username" label="用户登录名" rules={[{ required: true, message: '请输入用户登录名' }]}><Input /></Form.Item>
          <Form.Item name="fullName" label="用户真实姓名" rules={[{ required: true, message: '请输入真实姓名' }]}><Input /></Form.Item>
          <Form.Item name="role" label="用户角色" initialValue="APPLICANT"><Select options={roleOptions()} /></Form.Item>
          <Form.Item name="status" label="用户状态" initialValue="ACTIVE"><Select options={userStatusOptions()} /></Form.Item>
          <Form.Item name="email" label="用户Email"><Input /></Form.Item>
          <Form.Item name="phone" label="手机号"><Input /></Form.Item>
          <Form.Item className="wide" name="password" label={editing ? '重置密码' : '密码'} rules={editing ? [{ min: 6, message: '密码至少 6 位' }] : [{ required: true, min: 6, message: '密码至少 6 位' }]}>
            <Input.Password placeholder={editing ? '留空则不修改密码' : undefined} />
          </Form.Item>
          <Button className="wide" type="primary" htmlType="submit" icon={<Save size={16} />}>保存用户</Button>
        </Form>
      </Modal>
    </AdminCrudShell>
  );
}
