'use client';

import React, { useState, useTransition } from 'react';
import { UserProfile, AppRole } from '@/modules/shared/types/database.types';
import { createUserAccount, updateUserRole, deleteUserAccount } from '../../actions/adminActions';
import { UserPlus, Shield, User, Trash2, Loader2, CheckCircle2, AlertCircle, ShieldAlert, KeyRound } from 'lucide-react';

interface UsersTabProps {
    users: UserProfile[];
    currentUserRole: AppRole;
    onRefresh: () => void;
}

export const UsersTab: React.FC<UsersTabProps> = ({ users, currentUserRole, onRefresh }) => {
    const [isPending, startTransition] = useTransition();
    const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

    const [showAddModal, setShowAddModal] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<AppRole>('staff');

    const isAdmin = currentUserRole === 'admin';

    const handleCreateUser = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFeedback(null);

        startTransition(async () => {
            const res = await createUserAccount(fullName, email, password, role);
            if (res.success) {
                setFeedback({ type: 'success', text: res.message || 'User created!' });
                setShowAddModal(false);
                setFullName('');
                setEmail('');
                setPassword('');
                onRefresh();
            } else {
                setFeedback({ type: 'error', text: res.message || 'Failed to create account.' });
            }
        });
    };

    const handleRoleChange = (userId: string, newRole: AppRole) => {
        setFeedback(null);
        startTransition(async () => {
            const res = await updateUserRole(userId, newRole);
            if (res.success) {
                setFeedback({ type: 'success', text: res.message || 'Role updated.' });
                onRefresh();
            } else {
                setFeedback({ type: 'error', text: res.message || 'Role update failed.' });
            }
        });
    };

    const handleDeleteUser = (userId: string) => {
        if (!confirm('Are you sure you want to delete this user account?')) return;
        setFeedback(null);

        startTransition(async () => {
            const res = await deleteUserAccount(userId);
            if (res.success) {
                setFeedback({ type: 'success', text: res.message || 'User deleted.' });
                onRefresh();
            } else {
                setFeedback({ type: 'error', text: res.message || 'Delete failed.' });
            }
        });
    };

    return (
        <div className="space-y-6 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm">
                <div>
                    <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-800" />
                        <span>User Management & Role Permissions</span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                        Admins have full CRUD control; Managers and Staff can view and verify bookings.
                    </p>
                </div>

                {isAdmin ? (
                    <button
                        type="button"
                        onClick={() => setShowAddModal(true)}
                        className="bg-emerald-900 hover:bg-emerald-950 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 shrink-0 active:scale-95"
                    >
                        <UserPlus className="w-4 h-4 text-amber-300" />
                        <span>Add New User Account</span>
                    </button>
                ) : (
                    <span className="text-[11px] font-bold text-stone-500 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        Read-Only Permissions ({currentUserRole.toUpperCase()})
                    </span>
                )}
            </div>

            {feedback && (
                <div
                    className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                        feedback.type === 'error'
                            ? 'bg-red-50 text-red-800 border border-red-200'
                            : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    }`}
                >
                    {feedback.type === 'error' ? (
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    )}
                    <span>{feedback.text}</span>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto min-w-[640px]">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-bold uppercase tracking-wider">
                        <tr>
                            <th className="p-4">User</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">System Role</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                        {users.map((usr) => (
                            <tr key={usr.id} className="hover:bg-stone-50/80 transition-colors">
                                <td className="p-4 font-bold text-stone-900 flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-emerald-900/10 text-emerald-900 border border-emerald-900/20 flex items-center justify-center font-bold">
                                        <User className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <span>{usr.full_name}</span>
                                </td>
                                <td className="p-4 text-stone-600 font-medium">{usr.email}</td>
                                <td className="p-4">
                                        <span
                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                                usr.role === 'admin'
                                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                                    : usr.role === 'manager'
                                                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                                        : 'bg-stone-100 text-stone-700 border border-stone-200'
                                            }`}
                                        >
                                            <Shield className="w-3 h-3" />
                                            {usr.role}
                                        </span>
                                </td>
                                <td className="p-4 text-right">
                                    {isAdmin ? (
                                        <div className="flex items-center justify-end gap-2">
                                            <select
                                                value={usr.role}
                                                disabled={isPending}
                                                onChange={(e) => handleRoleChange(usr.id, e.target.value as AppRole)}
                                                className="bg-stone-50 border border-stone-300 rounded-lg px-2 py-1 font-bold text-stone-800 text-[11px] focus:outline-none"
                                            >
                                                <option value="staff">Staff</option>
                                                <option value="manager">Manager</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteUser(usr.id)}
                                                disabled={isPending}
                                                className="p-1.5 text-stone-400 hover:text-red-600 transition-colors rounded-lg"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-stone-400 italic text-[11px]">Restricted</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                            <h4 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                                <KeyRound className="w-4 h-4 text-emerald-800" />
                                <span>Create User Account</span>
                            </h4>
                            <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-700">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
                            <div>
                                <label className="font-bold text-stone-700 block mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Juan Dela Cruz"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-medium"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-stone-700 block mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="user@reginasgarden.ph"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-medium"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-stone-700 block mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-medium"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-stone-700 block mb-1">System Role</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as AppRole)}
                                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold"
                                >
                                    <option value="staff">Staff (Verify & Accept Bookings)</option>
                                    <option value="manager">Manager (Verify & Accept Bookings)</option>
                                    <option value="admin">Admin (Full System Operating Rights)</option>
                                </select>
                            </div>

                            <div className="pt-3 grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                                >
                                    {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};