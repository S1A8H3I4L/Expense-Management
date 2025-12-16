import React, { useState, useEffect } from 'react';
import { User, Expense, ExpenseStatus } from '../types';
import { db } from '../services/mockDb';
import { ExpenseList } from './ExpenseList';
import { Filter } from 'lucide-react';

export const ExpenseManagement: React.FC<{ user: User }> = ({ user }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filter, setFilter] = useState<'ALL' | ExpenseStatus>('ALL');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Get all company expenses for the Admin
    const allExpenses = db.getCompanyExpenses(user.companyId);
    
    // Apply status filter
    const filtered = filter === 'ALL' 
      ? allExpenses 
      : allExpenses.filter(e => e.status === filter);
      
    // Sort by date desc
    const sorted = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setExpenses(sorted);
  }, [filter, refreshKey, user.companyId]);

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
  };

  const tabs = [
    { id: 'ALL', label: 'All Expenses' },
    { id: ExpenseStatus.PENDING, label: 'Pending' },
    { id: ExpenseStatus.APPROVED, label: 'Approved' },
    { id: ExpenseStatus.REJECTED, label: 'Rejected' },
    { id: ExpenseStatus.ESCALATED, label: 'Escalated' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Expense Reports</h2>
          <p className="text-slate-500">Company-wide expense oversight</p>
        </div>
      </div>

      <div className="flex items-center space-x-1 overflow-x-auto border-b border-slate-200 pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`
              px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap
              ${filter === tab.id 
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-1">
        <ExpenseList 
          expenses={expenses} 
          user={user} 
          onRefresh={handleRefresh}
          isApprovalMode={true} // Allow admin to act on any expense
          showEmployee={true}   // Show who submitted it
        />
      </div>
    </div>
  );
};