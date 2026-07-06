import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { App as AntdApp, ConfigProvider, theme as antdTheme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AnimatePresence, motion } from 'motion/react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { api } from './api/client';
import Footer from './components/Footer';
import Header from './components/Header';
import { LoadingBlock } from './components/StateBlock';
import Applications from './pages/Applications';
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';
import Home from './pages/Home';
import JobDetail from './pages/JobDetail';
import Jobs from './pages/Jobs';
import LoginRegister from './pages/LoginRegister';
import Resume from './pages/Resume';
import type { User } from './types';

const AdminApp = lazy(() => import('./admin/AdminApp'));

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  async function refresh() {
    const result = await api.me();
    setUser(result.authenticated ? (result.user as User) : null);
  }

  async function logout() {
    await api.logout();
    setUser(null);
    navigate('/');
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
  }, [themeMode]);

  const auth = useMemo(() => ({ user, loading, refresh, logout }), [user, loading]);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: themeMode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#00b38a',
          colorSuccess: '#00b38a',
          colorWarning: '#b7791f',
          colorError: '#b42318',
          borderRadius: 8,
          fontFamily: '"Microsoft YaHei", "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif'
        },
        components: {
          Button: { controlHeight: 42, borderRadius: 8, fontWeight: 700 },
          Card: { borderRadiusLG: 8 },
          Input: { controlHeight: 42 },
          Select: { controlHeight: 42 },
          Table: { headerBg: themeMode === 'dark' ? '#111827' : '#f8fafc' }
        }
      }}
    >
      <AntdApp>
        {isAdminRoute ? (
          <Suspense fallback={<LoadingBlock />}>
            <Routes location={location}>
              <Route path="/admin/*" element={<AdminApp auth={auth} />} />
            </Routes>
          </Suspense>
        ) : (
          <>
            <Header
              auth={auth}
              themeMode={themeMode}
              onThemeToggle={() => setThemeMode((value) => (value === 'dark' ? 'light' : 'dark'))}
              mobileOpen={mobileOpen}
              onMobileOpenChange={setMobileOpen}
            />
            <main className="page-shell" id="main">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname + location.search}
                  className="route-panel"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  <Routes location={location}>
                    <Route path="/" element={<Home />} />
                    <Route path="/jobs" element={<Jobs />} />
                    <Route path="/jobs/:id" element={<JobDetail auth={auth} />} />
                    <Route path="/companies" element={<Companies />} />
                    <Route path="/companies/:id" element={<CompanyDetail />} />
                    <Route path="/login" element={<LoginRegister auth={auth} />} />
                    <Route path="/resume" element={<Resume auth={auth} />} />
                    <Route path="/applications" element={<Applications auth={auth} />} />
                  </Routes>
                </motion.div>
              </AnimatePresence>
            </main>
            <Footer />
          </>
        )}
      </AntdApp>
    </ConfigProvider>
  );
}
