import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfileSetup = () => {
    const { user, updateProfile } = useContext(AuthContext);
    const navigate = useNavigate();

    const [skillLevel, setSkillLevel] = useState('Beginner');
    const [learningGoals, setLearningGoals] = useState('');
    const [preferredTopics, setPreferredTopics] = useState('');
    const [timeAvailability, setTimeAvailability] = useState('5-10 hours/week');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateProfile({
                skillLevel,
                learningGoals: learningGoals.split(',').map(g => g.trim()),
                preferredTopics: preferredTopics.split(',').map(t => t.trim()),
                timeAvailability
            });
            navigate('/dashboard');
        } catch (error) {
            alert('Failed to update profile');
        }
    };

    return (
        <div className="flex-center">
            <div className="glass-card" style={{ width: '100%', maxWidth: '500px' }}>
                <h2 style={{ textAlign: 'center' }}>Personalize Your Path</h2>
                <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-muted)' }}>Help us tailor your learning journey.</p>
                <form onSubmit={handleSubmit}>
                    <label>Skill Level</label>
                    <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)}>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>

                    <label>Learning Goals (comma separated)</label>
                    <input type="text" placeholder="e.g., Learn React, Master Node.js" value={learningGoals} onChange={(e) => setLearningGoals(e.target.value)} />

                    <label>Preferred Topics (comma separated)</label>
                    <input type="text" placeholder="e.g., Frontend, Backend, AI" value={preferredTopics} onChange={(e) => setPreferredTopics(e.target.value)} />

                    <label>Weekly Time Availability</label>
                    <select value={timeAvailability} onChange={(e) => setTimeAvailability(e.target.value)}>
                        <option value="2-5 hours/week">2-5 hours/week</option>
                        <option value="5-10 hours/week">5-10 hours/week</option>
                        <option value="10-20 hours/week">10-20 hours/week</option>
                        <option value="Full-time">Full-time</option>
                    </select>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Complete Setup</button>
                </form>
            </div>
        </div>
    );
};

export default ProfileSetup;
