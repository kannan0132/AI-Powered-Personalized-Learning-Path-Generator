import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    LayoutDashboard, Users, BookOpen, HelpCircle,
    BarChart3, MessageSquare, LogOut, ChevronRight, Shield
} from 'lucide-react';
import '../styles/AdminLayout.css';

const AdminLayout = ({ children }) => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    const menuItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/users', icon: Users, label: 'Users' },
        { path: '/admin/courses', icon: BookOpen, label: 'Courses' },
        { path: '/admin/questions', icon: HelpCircle, label: 'Question Bank' },
        { path: '/admin/ai-control', icon: Shield, label: 'AI Control' },
        { path: '/admin/feedback', icon: MessageSquare, label: 'Feedback' },
    ];

    const isActive = (path) => {
        if (path === '/admin') return location.pathname === '/admin';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="admin-badge">
                        <LayoutDashboard size={24} />
                        <span>Admin Panel</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                            {isActive(item.path) && <ChevronRight size={16} className="active-indicator" />}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                            <span className="user-name">{user?.name}</span>
                            <span className="user-role">Administrator</span>
                        </div>
                    </div>
                    <Link to="/dashboard" className="back-to-app">
                        <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
                        Back to App
                    </Link>
                </div>
            </aside>

            <main className="admin-main">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
