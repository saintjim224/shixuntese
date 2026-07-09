import { Route, Routes } from 'react-router-dom';
import type { AuthContextValue } from '../App';
import { LoadingBlock } from '../components/StateBlock';
import { AdminLogin } from './components/AdminLogin';
import { AdminShell } from './components/AdminShell';
import { ApplicationsAdmin } from './pages/ApplicationsAdmin';
import { CompaniesAdmin } from './pages/CompaniesAdmin';
import { Dashboard } from './pages/Dashboard';
import { JobsAdmin } from './pages/JobsAdmin';
import { LogsAdmin } from './pages/LogsAdmin';
import { PasswordAdmin } from './pages/PasswordAdmin';
import { ResumesAdmin } from './pages/ResumesAdmin';
import { UsersAdmin } from './pages/UsersAdmin';

export default function AdminApp({ auth }: { auth: AuthContextValue }) {
  if (auth.loading) return <LoadingBlock />;
  if (auth.user?.role !== 'ADMIN') return <AdminLogin auth={auth} />;

  return (
    <AdminShell auth={auth}>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="applications" element={<ApplicationsAdmin />} />
        <Route path="jobs" element={<JobsAdmin />} />
        <Route path="companies" element={<CompaniesAdmin />} />
        <Route path="resumes" element={<ResumesAdmin />} />
        <Route path="users" element={<UsersAdmin currentUserId={auth.user.id} />} />
        <Route path="system" element={<LogsAdmin />} />
        <Route path="logs" element={<LogsAdmin />} />
        <Route path="password" element={<PasswordAdmin />} />
      </Routes>
    </AdminShell>
  );
}
