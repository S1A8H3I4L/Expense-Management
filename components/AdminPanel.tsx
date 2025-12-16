import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { db } from '../services/mockDb';
import { Plus, User as UserIcon } from 'lucide-react';

export const AdminPanel: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('password123');
  const [newRole, setNewRole] = useState<UserRole>(UserRole.EMPLOYEE);
  const [managerId, setManagerId] = useState('');

  const refreshUsers = () => {
    setUsers(db.getAllUsers());
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.createUser(currentUser, {
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
        managerId: managerId || undefined
      });
      setIsAdding(false);
      setNewName('');
      setNewEmail('');
      setManagerId('');
      refreshUsers();
    } catch (e) {
      alert("Failed to create user");
    }
  };

  const managers = users.filter(u => u.role === UserRole.MANAGER || u.role === UserRole.ADMIN);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-slate-500">Manage employees, managers and roles</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add User</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold mb-4">Create New User</h3>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              placeholder="Name" 
              required
              className="px-4 py-2 border rounded-lg"
              value={newName} onChange={e => setNewName(e.target.value)}
            />
            <input 
              placeholder="Email" 
              type="email"
              required
              className="px-4 py-2 border rounded-lg"
              value={newEmail} onChange={e => setNewEmail(e.target.value)}
            />
            <input 
              placeholder="Password" 
              type="text"
              required
              className="px-4 py-2 border rounded-lg"
              value={newPassword} onChange={e => setNewPassword(e.target.value)}
            />
            <select 
              className="px-4 py-2 border rounded-lg bg-white"
              value={newRole} onChange={e => setNewRole(e.target.value as UserRole)}
            >
              <option value={UserRole.EMPLOYEE}>Employee</option>
              <option value={UserRole.MANAGER}>Manager</option>
              <option value={UserRole.ADMIN}>Admin</option>
            </select>
            
            {newRole === UserRole.EMPLOYEE && (
              <select 
                className="px-4 py-2 border rounded-lg bg-white md:col-span-2"
                value={managerId} onChange={e => setManagerId(e.target.value)}
              >
                <option value="">Select Manager (Optional)</option>
                {managers.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                ))}
              </select>
            )}

            <div className="md:col-span-2 flex justify-end space-x-3 mt-2">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => (
          <div key={user.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-start space-x-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <UserIcon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                  {user.role.toLowerCase()}
                </span>
                {user.managerId && (
                   <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                     Reports to: {users.find(u => u.id === user.managerId)?.name || 'Unknown'}
                   </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};