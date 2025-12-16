import React, { useState } from 'react';
import { Expense, ExpenseStatus, User } from '../types';
import { db } from '../services/mockDb';
import { Check, X, Eye, FileText, User as UserIcon } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  user: User;
  onRefresh: () => void;
  isApprovalMode?: boolean;
  showEmployee?: boolean; // New prop to show who created the expense
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, user, onRefresh, isApprovalMode, showEmployee }) => {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    setProcessingId(id);
    const comment = prompt(`Enter comment for ${action.toLowerCase()}:`);
    if (comment !== null) {
      await db.processExpense(id, action, comment, user);
      onRefresh();
    }
    setProcessingId(null);
  };

  const getStatusColor = (status: ExpenseStatus) => {
    switch (status) {
      case ExpenseStatus.APPROVED: return 'bg-emerald-100 text-emerald-800';
      case ExpenseStatus.REJECTED: return 'bg-red-100 text-red-800';
      case ExpenseStatus.ESCALATED: return 'bg-purple-100 text-purple-800';
      default: return 'bg-amber-100 text-amber-800';
    }
  };

  // Helper to get user name (not optimized for large lists but fine for mock)
  const getUserName = (userId: string) => {
    const u = db.getUserById(userId);
    return u ? u.name : 'Unknown';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {showEmployee && (
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
              )}
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              {isApprovalMode && (
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={showEmployee ? 7 : 6} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="w-12 h-12 text-slate-300 mb-2" />
                    <p>No expenses found</p>
                  </div>
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                  {showEmployee && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs">
                           <UserIcon size={12} />
                        </div>
                        <span>{getUserName(expense.userId)}</span>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{expense.date}</td>
                  <td className="px-6 py-4 text-sm text-slate-800">
                    <div className="font-medium">{expense.merchant}</div>
                    <div className="text-slate-500 text-xs truncate max-w-xs">{expense.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                    {expense.currency} {expense.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                      {expense.status}
                    </span>
                  </td>
                  {isApprovalMode && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {expense.receiptImage && (
                          <button onClick={() => {
                            const w = window.open("");
                            w?.document.write(`<img src="${expense.receiptImage}" />`);
                          }} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-1.5 rounded-md" title="View Receipt">
                            <Eye size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleAction(expense.id, 'APPROVE')}
                          disabled={!!processingId}
                          className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 p-1.5 rounded-md hover:bg-emerald-100"
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={() => handleAction(expense.id, 'REJECT')}
                          disabled={!!processingId}
                          className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md hover:bg-red-100"
                          title="Reject"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};