import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, BookOpen, User, Home, LayoutDashboard, Route, BarChart2 } from 'lucide-react';
import '../styles/Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <nav className="navbar">
                <Link to="/" className="navbar-brand">
                    <BookOpen className="logo-icon" size={28} />
                    <span>EduAI</span>
                </Link>

                <div className="navbar-links">
                    <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
                    <Link to="/courses" className={`nav-link ${isActive('/courses') ? 'active' : ''}`}>Courses</Link>
                    {user && (
                        <>
                            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>Dashboard</Link>
                            <Link to="/learning-path" className={`nav-link ${isActive('/learning-path') ? 'active' : ''}`}>My Path</Link>
                            <Link to="/progress" className={`nav-link ${isActive('/progress') ? 'active' : ''}`}>Progress</Link>
                            {user.role === 'Admin' && (
                                <Link to="/admin" className="nav-link admin-link" style={{ color: 'var(--primary)', fontWeight: '600' }}>Admin Panel</Link>
                            )}
                        </>
                    )}
                </div>

                <div className="navbar-actions">
                    {user ? (
                        <button onClick={logout} className="logout-btn">
                            <LogOut size={18} /> <span>Logout</span>
                        </button>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/register" className="btn btn-primary">Get Started</Link>
                        </>
                    )}
                </div>
            </nav>
            <div className="navbar-spacer"></div>
        </>
    );
};

export default Navbar;

