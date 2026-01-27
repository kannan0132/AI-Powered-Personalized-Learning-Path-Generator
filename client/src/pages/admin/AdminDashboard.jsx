import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Users, BookOpen, HelpCircle, Award, TrendingUp, Clock } from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchStats();
    }, [user]);

    const fetchStats = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get('http://localhost:5000/api/admin/stats', config);
            setStats(res.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h1><TrendingUp size={28} /> Admin Dashboard</h1>
                <p>Overview of platform statistics and recent activity</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card glass-card">
                    <div className="stat-icon users"><Users size={24} /></div>
                    <span className="stat-value">{stats?.users?.total || 0}</span>
                    <span className="stat-label">Total Users</span>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon courses"><BookOpen size={24} /></div>
                    <span className="stat-value">{stats?.content?.courses || 0}</span>
                    <span className="stat-label">Courses</span>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon questions"><HelpCircle size={24} /></div>
                    <span className="stat-value">{stats?.content?.questions || 0}</span>
                    <span className="stat-label">Questions</span>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon certificates"><Award size={24} /></div>
                    <span className="stat-value">{stats?.achievements?.certificates || 0}</span>
                    <span className="stat-label">Certificates Issued</span>
                </div>
            </div>

            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ color: '#f1f5f9', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={20} /> Recent Users
                    </h3>
                    {stats?.recent?.users?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {stats.recent.users.map((u, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <div>
                                        <div style={{ color: '#f1f5f9', fontWeight: 500 }}>{u.name}</div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{u.email}</div>
                                    </div>
                                    <span style={{ color: u.role === 'Admin' ? '#6366f1' : '#22c55e', fontSize: '0.8rem', padding: '0.25rem 0.75rem', background: u.role === 'Admin' ? 'rgba(99,102,241,0.2)' : 'rgba(34,197,94,0.2)', borderRadius: '20px' }}>
                                        {u.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#94a3b8' }}>No recent users</p>
                    )}
                </div>

                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ color: '#f1f5f9', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={20} /> Recent Assessments
                    </h3>
                    {stats?.recent?.assessments?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {stats.recent.assessments.map((a, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <div>
                                        <div style={{ color: '#f1f5f9', fontWeight: 500 }}>{a.user?.name || 'User'}</div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                            {new Date(a.completedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <span style={{ color: a.percentage >= 70 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                                        {a.percentage}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#94a3b8' }}>No recent assessments</p>
                    )}
                </div>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
                <h3 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>Quick Stats</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Students</div>
                        <div style={{ color: '#22c55e', fontSize: '1.5rem', fontWeight: 600 }}>{stats?.users?.students || 0}</div>
                    </div>
                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Admins</div>
                        <div style={{ color: '#6366f1', fontSize: '1.5rem', fontWeight: 600 }}>{stats?.users?.admins || 0}</div>
                    </div>
                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Published Courses</div>
                        <div style={{ color: '#f59e0b', fontSize: '1.5rem', fontWeight: 600 }}>{stats?.content?.publishedCourses || 0}</div>
                    </div>
                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Lessons Completed</div>
                        <div style={{ color: '#8b5cf6', fontSize: '1.5rem', fontWeight: 600 }}>{stats?.achievements?.lessonsCompleted || 0}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
