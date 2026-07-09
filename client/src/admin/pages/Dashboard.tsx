import { Card, Statistic, Table } from 'antd';
import { BarChart3, BriefcaseBusiness, Building2, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
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
import { api } from '../../api/client';
import { LoadingBlock } from '../../components/StateBlock';
import type { AdminDashboard } from '../../types';
import { colors } from '../constants';
import { PageHeader } from '../components/PageParts';
import { renderApplicationStatus } from '../renderers';

export function Dashboard() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.dashboard().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <LoadingBlock />;

  const trend = [...data.trendStats].reverse();

  return (
    <div>
      <PageHeader title="后台首页" description="平台核心数据、投递趋势和最近申请集中查看。" />
      <section className="admin-stat-grid">
        <Card className="admin-metric-card">
          <Statistic title="企业数量" value={data.companyCount} />
          <Building2 size={24} />
        </Card>
        <Card className="admin-metric-card">
          <Statistic title="开放职位" value={data.openJobCount} />
          <BriefcaseBusiness size={24} />
        </Card>
        <Card className="admin-metric-card">
          <Statistic title="用户数量" value={data.userCount} />
          <UsersRound size={24} />
        </Card>
        <Card className="admin-metric-card">
          <Statistic title="投递数量" value={data.applicationCount} />
          <BarChart3 size={24} />
        </Card>
      </section>
      <section className="admin-chart-grid">
        <Card className="admin-panel" title="投递趋势">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#0079b8" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card className="admin-panel" title="申请状态分布">
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
        <Card className="admin-panel" title="职位城市分布">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.cityStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#1598c8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="admin-panel admin-table-panel" title="最近投递">
          <Table
            rowKey="id"
            size="small"
            pagination={false}
            dataSource={data.recentApplications}
            columns={[
              { title: '求职者', dataIndex: 'full_name' },
              { title: '职位', dataIndex: 'title' },
              { title: '企业', dataIndex: 'company_name' },
              { title: '状态', dataIndex: 'status', render: renderApplicationStatus }
            ]}
          />
        </Card>
      </section>
    </div>
  );
}
