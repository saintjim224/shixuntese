import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';

const labels: Record<string, string> = {
  jobs: '职位',
  companies: '企业',
  resume: '简历',
  applications: '申请',
  login: '登录注册',
  admin: '后台'
};

export default function BreadcrumbTrail({ current }: { current?: string }) {
  const location = useLocation();
  const parts = location.pathname.split('/').filter(Boolean);
  if (parts.length === 0) {
    return null;
  }
  const items = [
    { title: <Link to="/">首页</Link> },
    ...parts.map((part, index) => {
      const path = `/${parts.slice(0, index + 1).join('/')}`;
      const title = index === parts.length - 1 ? current || labels[part] || '详情' : labels[part] || part;
      return { title: index === parts.length - 1 ? title : <Link to={path}>{title}</Link> };
    })
  ];
  return <Breadcrumb className="breadcrumb-trail" items={items} />;
}
