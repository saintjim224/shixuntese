import { App } from 'antd';
import { Globe2, HelpCircle, Home, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import type { AuthContextValue } from '../../App';
import { menuGroups, routeTitles } from '../constants';
import { frontHref } from '../utils';

export function AdminShell({ auth, children }: { auth: AuthContextValue; children: ReactNode }) {
  const location = useLocation();
  const { modal } = App.useApp();
  const currentTitle = routeTitles[location.pathname] || '后台首页';

  return (
    <section className="legacy-admin-shell">
      <header className="legacy-admin-header">
        <a className="legacy-admin-logo" href={frontHref()}>
          <span className="legacy-admin-logo-mark">Q</span>
          <span>
            锐聘管理
            <small>Q_ITOffer Admin</small>
          </span>
        </a>
        <nav className="legacy-admin-shortcuts" aria-label="后台快捷导航">
          <a href={frontHref()}><Globe2 size={22} />网站前台</a>
          <NavLink to="/admin"><Home size={24} />后台首页</NavLink>
          <button type="button" onClick={() => modal.info({ title: '帮助', content: '后台用于维护企业、职位、投递、简历、用户和系统日志。' })}>
            <HelpCircle size={17} />帮助
          </button>
          <button type="button" onClick={() => modal.info({ title: '关于', content: 'Q_ITOffer 前后台分离招聘演示系统。' })}>
            关于
          </button>
          <button type="button" onClick={auth.logout}>
            <LogOut size={17} />退出
          </button>
        </nav>
        <div className="legacy-admin-user">
          <UserRound size={17} />
          <span>{auth.user?.fullName}</span>
        </div>
      </header>
      <div className="legacy-admin-body">
        <aside className="legacy-admin-sidebar">
          <div className="legacy-admin-menu-title">
            <ShieldCheck size={18} />
            功能菜单
          </div>
          <nav className="legacy-admin-menu" aria-label="后台功能菜单">
            {menuGroups.map((group) => (
              <section key={group.title}>
                <strong>{group.title}</strong>
                {group.items.map((item) => (
                  <NavLink key={item.to} end={item.end} to={item.to}>
                    {item.icon}
                    {item.label}
                  </NavLink>
                ))}
              </section>
            ))}
          </nav>
        </aside>
        <main className="legacy-admin-main" id="main">
          <div className="legacy-admin-breadcrumb">
            <strong>位置:</strong>
            <span>首页</span>
            <span>&gt;</span>
            <span>{currentTitle}</span>
          </div>
          {children}
        </main>
      </div>
    </section>
  );
}
