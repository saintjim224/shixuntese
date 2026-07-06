import { Avatar, Button, Drawer, Dropdown } from 'antd';
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  FileText,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserRound
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import type { AuthContextValue } from '../App';

type HeaderProps = {
  auth: AuthContextValue;
  themeMode: 'light' | 'dark';
  onThemeToggle: () => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
};

const navItems = [
  { to: '/jobs', label: '职位', icon: <BriefcaseBusiness size={18} /> },
  { to: '/companies', label: '企业', icon: <Building2 size={18} /> },
  { to: '/resume', label: '简历', icon: <FileText size={18} /> },
  { to: '/applications', label: '申请', icon: <UserRound size={18} /> }
];

export default function Header({ auth, themeMode, onThemeToggle, mobileOpen, onMobileOpenChange }: HeaderProps) {
  const navigate = useNavigate();
  const isAdmin = auth.user?.role === 'ADMIN';
  const mobileNav = (
    <nav className="drawer-nav" aria-label="移动端导航">
      {navItems.map((item) => (
        <NavLink key={item.to} to={item.to} onClick={() => onMobileOpenChange(false)}>
          {item.icon}{item.label}
        </NavLink>
      ))}
      {isAdmin && (
        <NavLink to="/admin" onClick={() => onMobileOpenChange(false)}>
          <LayoutDashboard size={18} />后台
        </NavLink>
      )}
    </nav>
  );

  return (
    <header className="site-header">
      <a className="skip-link" href="#main">跳到主内容</a>
      <div className="header-inner">
        <Button className="icon-button mobile-menu-button" type="text" aria-label="打开导航" onClick={() => onMobileOpenChange(true)}>
          <Menu size={20} />
        </Button>
        <NavLink className="brand-link" to="/">
          <span className="brand-mark">Q</span>
          <span>
            <strong>Q_ITOffer</strong>
            <small>锐聘网</small>
          </span>
        </NavLink>
        <nav className="main-nav" aria-label="主导航">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}>{item.icon}{item.label}</NavLink>
          ))}
          {isAdmin && <NavLink to="/admin"><LayoutDashboard size={18} />后台</NavLink>}
        </nav>
        <div className="header-actions">
          <Button className="icon-button" type="text" aria-label="消息中心">
            <Bell size={18} />
          </Button>
          <Button className="icon-button" type="text" onClick={onThemeToggle} aria-label="切换亮暗主题">
            {themeMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          {auth.user ? (
            <Dropdown
              menu={{
                items: [
                  { key: 'resume', label: '我的简历', onClick: () => navigate('/resume') },
                  { key: 'applications', label: '申请记录', onClick: () => navigate('/applications') },
                  ...(isAdmin ? [{ key: 'admin', label: '后台工作台', onClick: () => navigate('/admin') }] : []),
                  { type: 'divider' as const },
                  { key: 'logout', label: '退出登录', danger: true, onClick: auth.logout }
                ]
              }}
            >
              <button className="user-pill" type="button">
                <Avatar size={28}>{auth.user.fullName.slice(0, 1)}</Avatar>
                {auth.user.fullName}
              </button>
            </Dropdown>
          ) : (
            <NavLink className="button compact ant-button-link" to="/login">
              <LogIn size={18} />登录
            </NavLink>
          )}
        </div>
      </div>
      <Drawer title="Q_ITOffer" placement="left" open={mobileOpen} onClose={() => onMobileOpenChange(false)} width={292}>
        {mobileNav}
        {auth.user && (
          <Button block className="drawer-logout" icon={<LogOut size={17} />} onClick={auth.logout}>
            退出登录
          </Button>
        )}
      </Drawer>
    </header>
  );
}
