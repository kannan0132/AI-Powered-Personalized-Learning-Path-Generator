import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="container">
            <h1>Welcome back, {user?.name}!</h1>
            <div className="glass-card">
                <h3>Your Learning Status</h3>
                <p>Skill Level: <strong>{user?.skillLevel}</strong></p>
                <p>Preferred Topics: <strong>{user?.preferredTopics?.join(', ') || 'Not set'}</strong></p>
                <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--glass)', borderRadius: '0.5rem' }}>
                    <p>Take the skill assessment to identify your strengths and areas for improvement!</p>
                    <Link to="/assessment">
                        <button className="btn btn-primary" style={{ marginTop: '1rem' }}>Take Assessment</button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

