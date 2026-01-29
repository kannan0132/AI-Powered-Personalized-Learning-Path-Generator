import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AIControl = () => {
    const [settings, setSettings] = useState({
        recommendationRules: {
            skillGapWeight: 0.4,
            interestWeight: 0.3,
            timeAvailabilityWeight: 0.2,
            learningSpeedWeight: 0.1
        },
        systemStatus: {
            aiEnabled: true,
            maintenanceMode: false
        }
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            const { data } = await axios.get('http://localhost:5001/api/admin/settings', config);
            setSettings(data);
            setLoading(false);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to fetch AI settings' });
            setLoading(false);
        }
    };

    const handleRuleChange = (rule, value) => {
        setSettings({
            ...settings,
            recommendationRules: {
                ...settings.recommendationRules,
                [rule]: parseFloat(value)
            }
        });
    };

    const handleStatusChange = (field, value) => {
        setSettings({
            ...settings,
            systemStatus: {
                ...settings.systemStatus,
                [field]: value
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            await axios.put('http://localhost:5001/api/admin/settings', settings, config);
            setMessage({ type: 'success', text: 'AI settings updated successfully' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update AI settings' });
        }
    };

    if (loading) return <div className="flex-center" style={{ height: '80vh' }}><div className="loader"></div></div>;

    return (
        <div className="admin-container">
            <h1 className="page-title">AI Recommendation Control</h1>

            {message.text && (
                <div className={`alert alert-${message.type}`} style={{ marginBottom: '1.5rem' }}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-2">
                <div className="glass-card">
                    <h3>Recommendation Rules Weights</h3>
                    <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                        Adjust how much each factor influences the AI's recommendations (values between 0 and 1).
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Skill Gap Weight: {settings.recommendationRules.skillGapWeight}</label>
                            <input
                                type="range"
                                min="0" max="1" step="0.1"
                                value={settings.recommendationRules.skillGapWeight}
                                onChange={(e) => handleRuleChange('skillGapWeight', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Interest Weight: {settings.recommendationRules.interestWeight}</label>
                            <input
                                type="range"
                                min="0" max="1" step="0.1"
                                value={settings.recommendationRules.interestWeight}
                                onChange={(e) => handleRuleChange('interestWeight', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Time Availability Weight: {settings.recommendationRules.timeAvailabilityWeight}</label>
                            <input
                                type="range"
                                min="0" max="1" step="0.1"
                                value={settings.recommendationRules.timeAvailabilityWeight}
                                onChange={(e) => handleRuleChange('timeAvailabilityWeight', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Learning Speed Weight: {settings.recommendationRules.learningSpeedWeight}</label>
                            <input
                                type="range"
                                min="0" max="1" step="0.1"
                                value={settings.recommendationRules.learningSpeedWeight}
                                onChange={(e) => handleRuleChange('learningSpeedWeight', e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                            Update AI Rules
                        </button>
                    </form>
                </div>

                <div className="glass-card">
                    <h3>System Status</h3>
                    <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                        Global overrides for AI and system availability.
                    </p>

                    <div className="flex-between" style={{ padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
                        <div>
                            <strong>AI Recommendations</strong>
                            <p className="text-muted small">Enable or disable the recommendation engine site-wide</p>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={settings.systemStatus.aiEnabled}
                                onChange={(e) => handleStatusChange('aiEnabled', e.target.checked)}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    <div className="flex-between" style={{ padding: '1rem 0' }}>
                        <div>
                            <strong>Maintenance Mode</strong>
                            <p className="text-muted small">Only admins can access the site when enabled</p>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={settings.systemStatus.maintenanceMode}
                                onChange={(e) => handleStatusChange('maintenanceMode', e.target.checked)}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'rgba(52, 211, 153, 0.1)', borderRadius: 'var(--radius-sm)' }}>
                        <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>How Recommendation Logic Works</h4>
                        <ul className="small text-muted" style={{ paddingLeft: '1.2rem' }}>
                            <li>Weighted average is calculated for all available courses.</li>
                            <li>Skill gaps identified in assessments are prioritized first.</li>
                            <li>Personalized goals and preferred topics are second.</li>
                            <li>Spaced repetition is triggered for revision suggestions.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIControl;
