import { App, Button, Card, Form, Input, InputNumber, Modal, Select, Space, Statistic, Table, Tag } from 'antd';
import type { FormInstance } from 'antd';
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  FileClock,
  LayoutDashboard,
  LogOut,
  Plus,
  Save,
  ScrollText,
  UsersRound
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import type { AuthContextValue } from '../App';
import { api } from '../api/client';
import { LoadingBlock } from '../components/StateBlock';
import type { AdminApplication, AdminDashboard, AdminUser, Company, Job, SystemLog } from '../types';

type AdminFormInstance = FormInstance<Record<string, unknown>>;

const statusText: Record<string, string> = {
  SUBMITTED: '已投递',
  VIEWED: '已查看',
  INVITED: '邀面试',
  REJECTED: '不合适'
};

const colors = ['#1665d8', '#00b38a', '#69a7ff', '#f5c369', '#ff8c85'];

export default function AdminApp({ auth }: { auth: AuthContextValue }) {
  if (auth.loading) return <LoadingBlock />;
  if (auth.user?.role !== 'ADMIN') return <AdminLogin auth={auth} />;
  return (
    <section className="admin-shell">
      <AdminSidebar auth={auth} />
      <main className="admin-main" id="main">
        <div className="admin-topbar">
          <div>
            <strong>后台管理中心</strong>
            <span className="muted">企业、职位、简历投递和系统日志统一管理</span>
          </div>
          <Tag color="green">管理员：{auth.user.fullName}</Tag>
        </div>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="companies" element={<CompaniesAdmin />} />
          <Route path="jobs" element={<JobsAdmin />} />
          <Route path="applications" element={<ApplicationsAdmin />} />
          <Route path="users" element={<UsersAdmin />} />
          <Route path="logs" element={<LogsAdmin />} />
        </Routes>
      </main>
    </section>
  );
}

function AdminLogin({ auth }: { auth: AuthContextValue }) {
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
    <main className="login-page">
      <Card className="login-card">
        <h1>Q_ITOffer 后台登录</h1>
        <p>请输入管理员账号进入 React Admin。</p>
        <Form layout="vertical" initialValues={{ username: 'admin', password: 'admin123' }} onFinish={submit}>
          <Form.Item name="username" label="管理员账号" rules={[{ required: true }]}>
            <Input autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true }]}>
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={busy}>登录后台</Button>
        </Form>
      </Card>
    </main>
  );
}

function AdminSidebar({ auth }: { auth: AuthContextValue }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <span className="brand-mark">Q</span>
        <div>
          <strong>Q_ITOffer</strong>
          <small>React Admin</small>
        </div>
      </div>
      <nav className="admin-nav" aria-label="后台导航">
        <NavLink end to="/admin"><LayoutDashboard size={18} />工作台</NavLink>
        <NavLink to="/admin/companies"><Building2 size={18} />企业管理</NavLink>
        <NavLink to="/admin/jobs"><BriefcaseBusiness size={18} />职位管理</NavLink>
        <NavLink to="/admin/applications"><FileClock size={18} />投递处理</NavLink>
        <NavLink to="/admin/users"><UsersRound size={18} />用户管理</NavLink>
        <NavLink to="/admin/logs"><ScrollText size={18} />系统日志</NavLink>
        <button className="btn secondary" type="button" onClick={auth.logout}><LogOut size={18} />退出</button>
      </nav>
    </aside>
  );
}

function Dashboard() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.admin.dashboard().then(setData).finally(() => setLoading(false));
  }, []);
  if (loading || !data) return <LoadingBlock />;
  const trend = [...data.trendStats].reverse();
  return (
    <div>
      <h1 className="admin-page-title">后台工作台</h1>
      <section className="admin-stat-grid">
        <Card className="metric-card"><Statistic title="企业数量" value={data.companyCount} /><span className="metric-icon"><Building2 size={22} /></span></Card>
        <Card className="metric-card"><Statistic title="开放职位" value={data.openJobCount} /><span className="metric-icon"><BriefcaseBusiness size={22} /></span></Card>
        <Card className="metric-card"><Statistic title="用户数量" value={data.userCount} /><span className="metric-icon"><UsersRound size={22} /></span></Card>
        <Card className="metric-card"><Statistic title="投递数量" value={data.applicationCount} /><span className="metric-icon"><BarChart3 size={22} /></span></Card>
      </section>
      <section className="admin-chart-grid">
        <Card className="admin-card" title="投递趋势">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#00b38a" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card className="admin-card" title="申请状态分布">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.statusStats} dataKey="value" nameKey="name" innerRadius={56} outerRadius={86} label>
                {data.statusStats.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </section>
      <section className="admin-chart-grid">
        <Card className="admin-card" title="职位城市分布">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.cityStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#1665d8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="admin-card admin-table-card" title="最近投递">
          <Table
            rowKey="id"
            size="small"
            pagination={false}
            dataSource={data.recentApplications}
            columns={[
              { title: '求职者', dataIndex: 'full_name' },
              { title: '职位', dataIndex: 'title' },
              { title: '企业', dataIndex: 'company_name' },
              { title: '状态', dataIndex: 'status', render: (value) => <Tag>{statusText[value] || value}</Tag> }
            ]}
          />
        </Card>
      </section>
    </div>
  );
}

function CompaniesAdmin() {
  const { message, modal } = App.useApp();
  const [items, setItems] = useState<Company[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [form] = Form.useForm<Record<string, unknown>>();
  const load = () => api.admin.companies().then((result) => setItems(result.items));
  useEffect(() => { load(); }, []);
  async function save(values: Record<string, unknown>) {
    if (editing) await api.admin.updateCompany(editing.id, values);
    else await api.admin.createCompany(values);
    message.success('企业已保存');
    setOpen(false);
    setEditing(null);
    form.resetFields();
    load();
  }
  function edit(record: Company) {
    setEditing(record);
    form.setFieldsValue(toCompanyForm(record));
    setOpen(true);
  }
  return (
    <AdminCrudShell title="企业管理" onAdd={() => { setEditing(null); form.resetFields(); setOpen(true); }}>
      <Table
        rowKey="id"
        dataSource={items}
        columns={[
          { title: '企业名称', dataIndex: 'name' },
          { title: '城市', dataIndex: 'city' },
          { title: '行业', dataIndex: 'industry' },
          { title: '规模', dataIndex: 'scale' },
          { title: '评分', dataIndex: 'rating' },
          { title: '操作', render: (_, record: Company) => <Space><Button onClick={() => edit(record)}>编辑</Button><Button danger onClick={() => modal.confirm({ title: '删除企业', onOk: async () => { await api.admin.deleteCompany(record.id); load(); } })}>删除</Button></Space> }
        ]}
      />
      <Modal title={editing ? '编辑企业' : '新增企业'} open={open} onCancel={() => setOpen(false)} footer={null} width={760}>
        <CompanyForm form={form} onFinish={save} />
      </Modal>
    </AdminCrudShell>
  );
}

function JobsAdmin() {
  const { message, modal } = App.useApp();
  const [items, setItems] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [form] = Form.useForm<Record<string, unknown>>();
  const load = () => api.admin.jobs().then((result) => { setItems(result.items); setCompanies(result.companies); });
  useEffect(() => { load(); }, []);
  async function save(values: Record<string, unknown>) {
    if (editing) await api.admin.updateJob(editing.id, values);
    else await api.admin.createJob(values);
    message.success('职位已保存');
    setOpen(false);
    setEditing(null);
    form.resetFields();
    load();
  }
  function edit(record: Job) {
    setEditing(record);
    form.setFieldsValue(toJobForm(record));
    setOpen(true);
  }
  return (
    <AdminCrudShell title="职位管理" onAdd={() => { setEditing(null); form.resetFields(); setOpen(true); }}>
      <Table
        rowKey="id"
        dataSource={items}
        columns={[
          { title: '职位', dataIndex: 'title' },
          { title: '企业', dataIndex: 'company_name' },
          { title: '城市', dataIndex: 'city' },
          { title: '薪资', render: (_, record: Job) => `${record.salary_min}-${record.salary_max}` },
          { title: '状态', dataIndex: 'status', render: (value) => <Tag color={value === 'OPEN' ? 'green' : 'red'}>{value === 'OPEN' ? '开放' : '关闭'}</Tag> },
          { title: '操作', render: (_, record: Job) => <Space><Button onClick={() => edit(record)}>编辑</Button><Button danger onClick={() => modal.confirm({ title: '删除职位', onOk: async () => { await api.admin.deleteJob(record.id); load(); } })}>删除</Button></Space> }
        ]}
      />
      <Modal title={editing ? '编辑职位' : '新增职位'} open={open} onCancel={() => setOpen(false)} footer={null} width={840}>
        <JobForm form={form} companies={companies} onFinish={save} />
      </Modal>
    </AdminCrudShell>
  );
}

function ApplicationsAdmin() {
  const { message } = App.useApp();
  const [items, setItems] = useState<AdminApplication[]>([]);
  const load = () => api.admin.applications().then((result) => setItems(result.items));
  useEffect(() => { load(); }, []);
  async function update(id: number, status: AdminApplication['status']) {
    await api.admin.updateApplicationStatus(id, status);
    message.success('状态已更新');
    load();
  }
  return (
    <AdminCrudShell title="投递与简历处理">
      <Table
        rowKey="id"
        dataSource={items}
        expandable={{ expandedRowRender: (record) => <p>{record.message || '暂无留言'} / 技能：{record.skills || '未填写'}</p> }}
        columns={[
          { title: '求职者', dataIndex: 'full_name' },
          { title: '职位', dataIndex: 'title' },
          { title: '企业', dataIndex: 'company_name' },
          { title: '联系方式', render: (_, record: AdminApplication) => `${record.email || ''} ${record.phone || ''}` },
          { title: '状态', render: (_, record: AdminApplication) => (
            <Select value={record.status} style={{ width: 120 }} onChange={(value) => update(record.id, value)}>
              {Object.entries(statusText).map(([value, label]) => <Select.Option key={value} value={value}>{label}</Select.Option>)}
            </Select>
          ) }
        ]}
      />
    </AdminCrudShell>
  );
}

function UsersAdmin() {
  const { message } = App.useApp();
  const [items, setItems] = useState<AdminUser[]>([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<Record<string, unknown>>();
  const load = () => api.admin.users().then((result) => setItems(result.items));
  useEffect(() => { load(); }, []);
  async function save(values: Record<string, unknown>) {
    await api.admin.createUser(values);
    message.success('用户已新增');
    setOpen(false);
    form.resetFields();
    load();
  }
  async function toggle(id: number) {
    await api.admin.toggleUser(id);
    message.success('用户状态已更新');
    load();
  }
  return (
    <AdminCrudShell title="用户管理" onAdd={() => setOpen(true)}>
      <Table
        rowKey="id"
        dataSource={items}
        columns={[
          { title: '账号', dataIndex: 'username' },
          { title: '姓名', dataIndex: 'full_name' },
          { title: '角色', dataIndex: 'role', render: (value) => <Tag color={value === 'ADMIN' ? 'blue' : 'green'}>{value}</Tag> },
          { title: '状态', dataIndex: 'status', render: (value) => <Tag color={value === 'ACTIVE' ? 'green' : 'red'}>{value === 'ACTIVE' ? '启用' : '停用'}</Tag> },
          { title: '操作', render: (_, record: AdminUser) => <Button disabled={record.role === 'ADMIN'} onClick={() => toggle(record.id)}>切换状态</Button> }
        ]}
      />
      <Modal title="新增用户" open={open} onCancel={() => setOpen(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={save}>
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, min: 6 }]}><Input.Password /></Form.Item>
          <Form.Item name="role" label="角色" initialValue="APPLICANT"><Select options={[{ value: 'APPLICANT', label: '求职者' }, { value: 'ADMIN', label: '管理员' }]} /></Form.Item>
          <Form.Item name="fullName" label="姓名" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="email" label="邮箱"><Input /></Form.Item>
          <Form.Item name="phone" label="手机号"><Input /></Form.Item>
          <Button type="primary" htmlType="submit" icon={<Save size={16} />}>保存</Button>
        </Form>
      </Modal>
    </AdminCrudShell>
  );
}

function LogsAdmin() {
  const [items, setItems] = useState<SystemLog[]>([]);
  useEffect(() => { api.admin.logs().then((result) => setItems(result.items)); }, []);
  return (
    <AdminCrudShell title="系统日志">
      <Table
        rowKey="id"
        dataSource={items}
        columns={[
          { title: '操作人', dataIndex: 'username', render: (value) => value || '系统' },
          { title: '操作类型', dataIndex: 'action' },
          { title: '详情', dataIndex: 'detail' },
          { title: '时间', dataIndex: 'created_at' }
        ]}
      />
    </AdminCrudShell>
  );
}

function AdminCrudShell({ title, onAdd, children }: { title: string; onAdd?: () => void; children: ReactNode }) {
  return (
    <section>
      <div className="admin-actions admin-page-title">
        <h1>{title}</h1>
        {onAdd && <Button type="primary" icon={<Plus size={16} />} onClick={onAdd}>新增</Button>}
      </div>
      <Card className="admin-card admin-table-card">{children}</Card>
    </section>
  );
}

function CompanyForm({ form, onFinish }: { form: AdminFormInstance; onFinish: (values: Record<string, unknown>) => void }) {
  return (
    <Form form={form} layout="vertical" className="resume-form" onFinish={onFinish}>
      <Form.Item name="name" label="企业名称" rules={[{ required: true }]}><Input /></Form.Item>
      <Form.Item name="city" label="城市" rules={[{ required: true }]}><Input /></Form.Item>
      <Form.Item name="industry" label="行业" rules={[{ required: true }]}><Input /></Form.Item>
      <Form.Item name="scale" label="规模"><Input /></Form.Item>
      <Form.Item name="foundedYear" label="成立年份"><InputNumber style={{ width: '100%' }} /></Form.Item>
      <Form.Item name="financingStage" label="融资阶段"><Input /></Form.Item>
      <Form.Item name="rating" label="评分"><InputNumber min={0} max={5} step={0.1} style={{ width: '100%' }} /></Form.Item>
      <Form.Item name="website" label="官网"><Input /></Form.Item>
      <Form.Item name="logoUrl" label="Logo 路径"><Input /></Form.Item>
      <Form.Item name="bannerUrl" label="Banner 路径"><Input /></Form.Item>
      <Form.Item className="wide" name="description" label="企业介绍"><Input.TextArea rows={4} /></Form.Item>
      <Button className="wide" type="primary" htmlType="submit" icon={<Save size={16} />}>保存企业</Button>
    </Form>
  );
}

function JobForm({ form, companies, onFinish }: { form: AdminFormInstance; companies: Company[]; onFinish: (values: Record<string, unknown>) => void }) {
  return (
    <Form form={form} layout="vertical" className="resume-form" onFinish={onFinish}>
      <Form.Item name="companyId" label="所属企业" rules={[{ required: true }]}><Select options={companies.map((item) => ({ value: item.id, label: item.name }))} /></Form.Item>
      <Form.Item name="title" label="职位名称" rules={[{ required: true }]}><Input /></Form.Item>
      <Form.Item name="category" label="岗位方向" rules={[{ required: true }]}><Input /></Form.Item>
      <Form.Item name="city" label="城市" rules={[{ required: true }]}><Input /></Form.Item>
      <Form.Item name="salaryMin" label="最低薪资"><InputNumber style={{ width: '100%' }} /></Form.Item>
      <Form.Item name="salaryMax" label="最高薪资"><InputNumber style={{ width: '100%' }} /></Form.Item>
      <Form.Item name="education" label="学历"><Input /></Form.Item>
      <Form.Item name="experience" label="经验"><Input /></Form.Item>
      <Form.Item name="headcount" label="招聘人数"><InputNumber style={{ width: '100%' }} /></Form.Item>
      <Form.Item name="status" label="状态" initialValue="OPEN"><Select options={[{ value: 'OPEN', label: '开放' }, { value: 'CLOSED', label: '关闭' }]} /></Form.Item>
      <Form.Item className="wide" name="highlights" label="职位亮点"><Input placeholder="五险一金,弹性工作,技术氛围" /></Form.Item>
      <Form.Item className="wide" name="description" label="职位描述"><Input.TextArea rows={4} /></Form.Item>
      <Form.Item className="wide" name="requirementText" label="任职要求"><Input.TextArea rows={4} /></Form.Item>
      <Button className="wide" type="primary" htmlType="submit" icon={<Save size={16} />}>保存职位</Button>
    </Form>
  );
}

function toCompanyForm(record: Company) {
  return {
    name: record.name,
    logoUrl: record.logo_url,
    bannerUrl: record.banner_url,
    city: record.city,
    industry: record.industry,
    scale: record.scale,
    foundedYear: record.founded_year,
    financingStage: record.financing_stage,
    rating: record.rating,
    website: record.website,
    description: record.description
  };
}

function toJobForm(record: Job) {
  return {
    companyId: record.company_id,
    title: record.title,
    category: record.category,
    salaryMin: record.salary_min,
    salaryMax: record.salary_max,
    city: record.city,
    education: record.education,
    experience: record.experience,
    headcount: record.headcount,
    highlights: record.highlights,
    description: record.description,
    requirementText: record.requirement_text,
    status: record.status
  };
}
