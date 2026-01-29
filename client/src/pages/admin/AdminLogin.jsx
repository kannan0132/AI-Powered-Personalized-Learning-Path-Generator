import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/AdminLogin.css';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [adminKey, setAdminKey] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { adminLogin, user } = useContext(AuthContext);
    const navigate = useNavigate();

    // If already logged in as admin, redirect
    useEffect(() => {
        if (user && user.role === 'Admin') {
            navigate('/admin');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const data = await adminLogin(email, password, adminKey);
            if (data?.role === 'Admin') {
                navigate('/admin');
            } else {
                setError('Unauthorized access. Admin role required.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid admin credentials');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                <div className="admin-login-header">
                    <h2>Admin Portal</h2>
                    <p>Enter your credentials to manage the platform</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form className="admin-login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Admin Security Key</label>
                        <input
                            type="password"
                            placeholder="Enter Security Key"
                            value={adminKey}
                            onChange={(e) => setAdminKey(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="admin-login-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Authenticating...' : 'Login to Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
