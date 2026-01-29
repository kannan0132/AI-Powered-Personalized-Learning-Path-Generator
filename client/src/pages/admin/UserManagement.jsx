import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Users, Search, Shield, Trash2, ChevronLeft, ChevronRight, Lock, Unlock } from 'lucide-react';

const UserManagement = () => {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (user) fetchUsers();
    }, [user, page, roleFilter]);

    const fetchUsers = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const params = new URLSearchParams({ page, limit: 15 });
            if (search) params.append('search', search);
            if (roleFilter) params.append('role', roleFilter);

            const res = await axios.get(`http://localhost:5001/api/admin/users?${params}`, config);
            setUsers(res.data.users);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`http://localhost:5001/api/admin/users/${userId}/role`, { role: newRole }, config);
            fetchUsers();
        } catch (error) {
            console.error('Error updating role:', error);
        }
    };

    const toggleBlock = async (userId, isBlocked) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const endpoint = isBlocked ? 'unblock' : 'block';
            await axios.put(`http://localhost:5001/api/admin/users/${userId}/${endpoint}`, {}, config);
            fetchUsers();
        } catch (error) {
            console.error(`Error ${isBlocked ? 'unblocking' : 'blocking'} user:`, error);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`http://localhost:5001/api/admin/users/${userId}`, config);
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h1><Users size={28} /> User Management</h1>
                <p>Manage user accounts and roles</p>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem' }}>
                <form onSubmit={handleSearch} className="table-controls">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        className="filter-select"
                        value={roleFilter}
                        onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                    >
                        <option value="">All Roles</option>
                        <option value="Student">Student</option>
                        <option value="Admin">Admin</option>
                    </select>
                    <button type="submit" className="btn-primary">
                        <Search size={18} /> Search
                    </button>
                </form>

                {loading ? (
                    <div className="loading-state" style={{ padding: '3rem' }}>
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <>
                        <div className="data-table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Skill Level</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u._id}>
                                            <td>{u.name}</td>
                                            <td>{u.email}</td>
                                            <td>
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                    style={{
                                                        background: u.role === 'Admin' ? 'rgba(99,102,241,0.2)' : 'rgba(34,197,94,0.2)',
                                                        color: u.role === 'Admin' ? '#6366f1' : '#22c55e',
                                                        border: 'none',
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <option value="Student">Student</option>
                                                    <option value="Admin">Admin</option>
                                                </select>
                                            </td>
                                            <td>{u.skillLevel}</td>
                                            <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td className="actions-cell">
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        className={`action-btn ${u.isBlocked ? 'success' : 'warning'}`}
                                                        onClick={() => toggleBlock(u._id, u.isBlocked)}
                                                        disabled={u._id === user.id}
                                                        title={u.isBlocked ? 'Unblock user' : 'Block user'}
                                                    >
                                                        {u.isBlocked ? <Unlock size={18} /> : <Lock size={18} />}
                                                    </button>
                                                    <button
                                                        className="action-btn danger"
                                                        onClick={() => handleDelete(u._id)}
                                                        disabled={u._id === user.id}
                                                        title={u._id === user.id ? "Can't delete yourself" : "Delete user"}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="page-btn"
                                    onClick={() => setPage(p => p - 1)}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        className={`page-btn ${page === i + 1 ? 'active' : ''}`}
                                        onClick={() => setPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    className="page-btn"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={page === totalPages}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
