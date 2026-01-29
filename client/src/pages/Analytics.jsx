import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { BarChart3, TrendingUp, Clock, Award, AlertTriangle, Target } from 'lucide-react';
import '../styles/Analytics.css';

const Analytics = () => {
    const { user } = useContext(AuthContext);
    const [analytics, setAnalytics] = useState(null);
    const [difficultTopics, setDifficultTopics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchAnalytics();
    }, [user]);

    const fetchAnalytics = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [perfRes, topicsRes] = await Promise.all([
                axios.get('http://localhost:5001/api/analytics/performance', config),
                axios.get('http://localhost:5001/api/analytics/difficult-topics', config)
            ]);
            setAnalytics(perfRes.data);
            setDifficultTopics(topicsRes.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="analytics-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="analytics-page">
            <div className="page-header">
                <BarChart3 size={32} />
                <h1>Performance Analytics</h1>
                <p>Track your learning progress and identify areas for improvement</p>
            </div>

            <div className="stats-overview">
                <div className="stat-card glass-card">
                    <div className="stat-icon"><TrendingUp size={24} /></div>
                    <div className="stat-content">
                        <span className="stat-value">{analytics?.averageScore || 0}%</span>
                        <span className="stat-label">Average Score</span>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon"><Award size={24} /></div>
                    <div className="stat-content">
                        <span className="stat-value">{analytics?.lessonsCompleted || 0}</span>
                        <span className="stat-label">Lessons Completed</span>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon"><Clock size={24} /></div>
                    <div className="stat-content">
                        <span className="stat-value">{analytics?.totalTimeSpent || 0}m</span>
                        <span className="stat-label">Total Time Spent</span>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon"><Target size={24} /></div>
                    <div className="stat-content">
                        <span className="stat-value">{analytics?.totalAssessments || 0}</span>
                        <span className="stat-label">Assessments Taken</span>
                    </div>
                </div>
            </div>

            <div className="analytics-grid">
                <div className="glass-card chart-card">
                    <h3>Performance Over Time</h3>
                    {analytics?.performanceOverTime?.length > 0 ? (
                        <div className="mini-chart">
                            {analytics.performanceOverTime.slice(-10).map((p, idx) => (
                                <div key={idx} className="bar-container">
                                    <div
                                        className="bar"
                                        style={{
                                            height: `${p.score}%`,
                                            background: p.score >= 70 ? 'linear-gradient(to top, #22c55e, #4ade80)' : 'linear-gradient(to top, #ef4444, #f87171)'
                                        }}
                                    />
                                    <span className="bar-label">{new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-message">Take assessments to see your progress</p>
                    )}
                </div>

                <div className="glass-card skills-card">
                    <h3><Target size={20} /> Strong Areas</h3>
                    {analytics?.strongAreas?.length > 0 ? (
                        <div className="topics-list">
                            {analytics.strongAreas.map((area, idx) => (
                                <div key={idx} className="topic-item strong">
                                    <span className="topic-name">{area.topic}</span>
                                    <div className="topic-bar">
                                        <div className="topic-progress" style={{ width: `${Math.min(area.score * 20, 100)}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-message">Complete assessments to discover your strengths</p>
                    )}
                </div>

                <div className="glass-card skills-card">
                    <h3><AlertTriangle size={20} /> Areas to Improve</h3>
                    {analytics?.weakAreas?.length > 0 ? (
                        <div className="topics-list">
                            {analytics.weakAreas.map((area, idx) => (
                                <div key={idx} className="topic-item weak">
                                    <span className="topic-name">{area.topic}</span>
                                    <div className="topic-bar">
                                        <div className="topic-progress" style={{ width: `${Math.min(area.score * 20, 100)}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-message">No weak areas identified yet</p>
                    )}
                </div>

                <div className="glass-card">
                    <h3>Difficult Topics (Platform-wide)</h3>
                    {difficultTopics.length > 0 ? (
                        <div className="topics-list">
                            {difficultTopics.slice(0, 5).map((t, idx) => (
                                <div key={idx} className="topic-item">
                                    <span className="topic-name">{t.topic}</span>
                                    <span className="topic-frequency">{t.frequency} struggles</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-message">No data available yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
