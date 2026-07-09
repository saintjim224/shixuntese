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
  const currentTitle = routeTitles[location.pathname] || '????';

  return (
    <section className="legacy-admin-shell">
      <header className="legacy-admin-header">
        <a className="legacy-admin-logo" href={frontHref()}>
          <span className="legacy-admin-logo-mark">Q</span>
          <span>
            ????
            <small>Q_ITOffer Admin</small>
          </span>
        </a>
        <nav className="legacy-admin-shortcuts" aria-label="??????">
          <a href={frontHref()}><Globe2 size={22} />????</a>
          <NavLink to="/admin"><Home size={24} />????</NavLink>
          <button type="button" onClick={() => modal.info({ title: '??', content: '?????????????????????????' })}>
            <HelpCircle size={17} />??
          </button>
          <button type="button" onClick={() => modal.info({ title: '??', content: 'Q_ITOffer ??????????????' })}>
            ??
          </button>
          <button type="button" onClick={auth.logout}>
            <LogOut size={17} />??
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
            ????
          </div>
          <nav className="legacy-admin-menu" aria-label="??????">
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
            <strong>???</strong>
            <span>??</span>
            <span>?</span>
            <span>{currentTitle}</span>
          </div>
          {children}
        </main>
      </div>
    </section>
  );
}
