import React from 'react';
import { User, Expense, ExpenseStatus, UserRole } from '../types';
import { db } from '../services/mockDb';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface DashboardProps {
  user: User;
}

const COLORS = ['#4f46e5', '#10b981', '#ef4444', '#f59e0b'];

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [expenses, setExpenses] = React.useState<Expense[]>([]);

  React.useEffect(() => {
    if (user.role === UserRole.ADMIN) {
      setExpenses(db.getAllExpenses());
    } else if (user.role === UserRole.MANAGER) {
        // Manager sees their own AND their team's (simplified to all for demo purposes or strictly pending approvals)
        // For dashboard stats, let's show all accessible data
        const pending = db.getPendingApprovals(user.id);
        const own = db.getExpensesForUser(user.id);
        // De-duplicate if needed, but for stats simply merging
        setExpenses([...pending, ...own]);
    } else {
      setExpenses(db.getExpensesForUser(user.id));
    }
  }, [user]);

  const stats = React.useMemo(() => {
    const total = expenses.reduce((acc, curr) => acc + (curr.convertedAmount || curr.amount), 0);
    const pending = expenses.filter(e => e.status === ExpenseStatus.PENDING).length;
    const approved = expenses.filter(e => e.status === ExpenseStatus.APPROVED).length;
    const rejected = expenses.filter(e => e.status === ExpenseStatus.REJECTED).length;
    return { total, pending, approved, rejected };
  }, [expenses]);

  const categoryData = React.useMemo(() => {
    const data: Record<string, number> = {};
    expenses.forEach(e => {
      data[e.category] = (data[e.category] || 0) + (e.convertedAmount || e.amount);
    });
    return Object.keys(data).map(key => ({ name: key, value: data[key] }));
  }, [expenses]);

  // Daily spending for the last 7 days
  const trendData = React.useMemo(() => {
    // Simplified trend mock
    return [
        { name: 'Mon', amount: 0 }, { name: 'Tue', amount: 0 },
        { name: 'Wed', amount: 0 }, { name: 'Thu', amount: 0 },
        { name: 'Fri', amount: 0 }, { name: 'Sat', amount: 0 },
        { name: 'Sun', amount: 0 }
    ].map(day => ({
        ...day,
        amount: Math.floor(Math.random() * 500) // Mocking trend for visual appeal in demo
    }));
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-500">Overview of your expense activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Expenses" 
          value={`$${stats.total.toLocaleString()}`} 
          icon={TrendingUp} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="Pending Approval" 
          value={stats.pending} 
          icon={Clock} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="Approved" 
          value={stats.approved} 
          icon={CheckCircle} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Rejected" 
          value={stats.rejected} 
          icon={AlertCircle} 
          color="bg-red-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Spending by Category</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Weekly Trends</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};