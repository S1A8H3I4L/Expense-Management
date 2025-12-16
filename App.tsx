import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import { Login, Signup } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { AdminPanel } from './components/AdminPanel';
import { ExpenseManagement } from './components/ExpenseManagement';
import { User, UserRole } from './types';
import { db } from './services/mockDb';

// Wrapper for protected routes
const ProtectedRoute = ({ children, user, allowedRoles }: { children: React.ReactElement, user: User | null, allowedRoles?: UserRole[] }) => {
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div className="p-8 text-center text-red-600 font-semibold">Access Denied: You do not have permission to view this page.</div>;
  }

  return children;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = db.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    navigate('/');
  };

  const handleLogout = () => {
    db.logout();
    setUser(null);
    navigate('/login');
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={
        !user ? <Login onLogin={handleLogin} onSwitch={() => navigate('/signup')} /> : <Navigate to="/" />
      } />
      
      <Route path="/signup" element={
        !user ? <Signup onLogin={handleLogin} onSwitch={() => navigate('/login')} /> : <Navigate to="/" />
      } />

      <Route path="/" element={
        <ProtectedRoute user={user}>
          <Layout user={user!} onLogout={handleLogout}>
            <Dashboard user={user!} />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/my-expenses" element={
        <ProtectedRoute user={user}>
          <Layout user={user!} onLogout={handleLogout}>
            <MyExpensesPage user={user!} />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/approvals" element={
        <ProtectedRoute user={user} allowedRoles={[UserRole.MANAGER, UserRole.ADMIN]}>
          <Layout user={user!} onLogout={handleLogout}>
            <ApprovalsPage user={user!} />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN]}>
          <Layout user={user!} onLogout={handleLogout}>
            <ExpenseManagement user={user!} />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/users" element={
        <ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN]}>
          <Layout user={user!} onLogout={handleLogout}>
            <AdminPanel currentUser={user!} />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN]}>
           <Layout user={user!} onLogout={handleLogout}>
             <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
               <h2 className="text-xl font-bold mb-4">System Configuration</h2>
               <p className="text-slate-500">Settings functionality coming soon...</p>
             </div>
           </Layout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

// Sub-components to handle internal refreshing state
const MyExpensesPage = ({ user }: { user: User }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <ExpenseForm user={user} onSuccess={() => setRefreshKey(k => k + 1)} />
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">My History</h2>
        <ExpenseList 
          key={refreshKey}
          expenses={db.getExpensesForUser(user.id)} 
          user={user} 
          onRefresh={() => setRefreshKey(k => k + 1)} 
        />
      </div>
    </div>
  );
};

const ApprovalsPage = ({ user }: { user: User }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const pending = db.getPendingApprovals(user.id);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-slate-900">Pending Approvals</h2>
      <p className="text-slate-500">Review expenses submitted by your team</p>
      <ExpenseList 
        key={refreshKey}
        expenses={pending} 
        user={user} 
        onRefresh={() => setRefreshKey(k => k + 1)}
        isApprovalMode={true} 
      />
    </div>
  );
};

export default App;