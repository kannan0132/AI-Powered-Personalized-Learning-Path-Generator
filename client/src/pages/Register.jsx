import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [adminKey, setAdminKey] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await register(name, email, password, adminKey);
            if (user?.role === 'Admin') {
                navigate('/admin');
            } else {
                navigate('/profile-setup');
            }
        } catch (error) {
            const message = error.response?.data?.message ||
                error.response?.data?.errors?.[0]?.message ||
                'Registration failed';
            alert(message);
        }
    };

    return (
        <div className="flex-center">
            <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center' }}>Create Account</h2>
                <form onSubmit={handleSubmit}>
                    <label>Full Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

                    <label>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

                    <label>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                    <label>Admin Key (Optional)</label>
                    <input type="password" placeholder="Only for administrators" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} />

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Sign Up</button>
                </form>
                <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
