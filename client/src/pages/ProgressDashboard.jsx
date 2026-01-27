import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import {
    TrendingUp, BookOpen, Clock, Target, Flame, Award,
    Calendar, ChevronRight, CheckCircle
} from 'lucide-react';
import '../styles/ProgressDashboard.css';

const ProgressDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [weeklyData, setWeeklyData] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };

            const [statsRes, weeklyRes, activityRes] = await Promise.all([
                axios.get('http://localhost:5000/api/progress/stats', config),
                axios.get('http://localhost:5000/api/progress/weekly', config),
                axios.get('http://localhost:5000/api/progress/activity?limit=10', config)
            ]);

            setStats(statsRes.data);
            setWeeklyData(weeklyRes.data);
            setActivities(activityRes.data.activities);
        } catch (error) {
            console.error('Error fetching progress data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (minutes) => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const getActivityIcon = (action) => {
        switch (action) {
            case 'lesson_completed': return <CheckCircle size={16} className="activity-icon completed" />;
            case 'course_completed': return <Award size={16} className="activity-icon award" />;
            case 'assessment_completed': return <Target size={16} className="activity-icon target" />;
            default: return <BookOpen size={16} className="activity-icon" />;
        }
    };

    const formatActivityText = (activity) => {
        switch (activity.action) {
            case 'lesson_completed': return `Completed: ${activity.details?.title || 'Lesson'}`;
            case 'course_completed': return `Finished course: ${activity.details?.title || 'Course'}`;
            case 'assessment_completed': return `Took assessment (Score: ${activity.details?.score}%)`;
            case 'path_generated': return 'Generated new learning path';
            default: return activity.action.replace(/_/g, ' ');
        }
    };

    if (loading) {
        return (
            <div className="progress-dashboard">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading your progress...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="progress-dashboard">
            <div className="dashboard-header">
                <h1><TrendingUp size={28} /> Progress Dashboard</h1>
                <p>Track your learning journey and achievements</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card glass-card">
                    <div className="stat-icon lessons">
                        <BookOpen size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats?.lessonsCompleted || 0}</span>
                        <span className="stat-label">Lessons Completed</span>
                    </div>
                </div>

                <div className="stat-card glass-card">
                    <div className="stat-icon courses">
                        <Award size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats?.coursesCompleted || 0}/{stats?.coursesEnrolled || 0}</span>
                        <span className="stat-label">Courses Completed</span>
                    </div>
                </div>

                <div className="stat-card glass-card">
                    <div className="stat-icon time">
                        <Clock size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{formatTime(stats?.totalTimeSpent || 0)}</span>
                        <span className="stat-label">Total Learning Time</span>
                    </div>
                </div>

                <div className="stat-card glass-card">
                    <div className="stat-icon streak">
                        <Flame size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats?.currentStreak || 0}</span>
                        <span className="stat-label">Day Streak 🔥</span>
                    </div>
                </div>
            </div>

            {/* Weekly Activity Chart */}
            <div className="chart-section glass-card">
                <h3><Calendar size={20} /> Weekly Activity</h3>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={weeklyData?.weeklyData || []}>
                            <defs>
                                <linearGradient id="colorLessons" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis
                                dataKey="date"
                                stroke="#94a3b8"
                                tickFormatter={(date) => new Date(date).toLocaleDateString('en', { weekday: 'short' })}
                            />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(15, 23, 42, 0.9)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="lessonsCompleted"
                                stroke="#6366f1"
                                fillOpacity={1}
                                fill="url(#colorLessons)"
                                name="Lessons"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                {weeklyData?.summary && (
                    <div className="weekly-summary">
                        <span>{weeklyData.summary.totalLessons} lessons</span>
                        <span>{formatTime(weeklyData.summary.totalTime)} learning</span>
                        <span>{weeklyData.summary.totalAssessments} assessments</span>
                    </div>
                )}
            </div>

            <div className="dashboard-columns">
                {/* Course Progress */}
                <div className="course-progress-section glass-card">
                    <h3><Target size={20} /> Course Progress</h3>
                    {stats?.courseProgress?.length > 0 ? (
                        <div className="course-progress-list">
                            {stats.courseProgress.map((course, idx) => (
                                <Link to={`/courses/${course.courseId}`} key={idx} className="course-progress-item">
                                    <div className="course-progress-info">
                                        <span className="course-title">{course.title}</span>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${course.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <span className="progress-percent">{course.progress}%</span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-message">No courses started yet</p>
                    )}
                    <Link to="/courses" className="view-all-link">
                        Browse Courses <ChevronRight size={16} />
                    </Link>
                </div>

                {/* Recent Activity */}
                <div className="activity-section glass-card">
                    <h3><Clock size={20} /> Recent Activity</h3>
                    {activities.length > 0 ? (
                        <div className="activity-list">
                            {activities.map((activity, idx) => (
                                <div key={idx} className="activity-item">
                                    {getActivityIcon(activity.action)}
                                    <div className="activity-info">
                                        <span className="activity-text">{formatActivityText(activity)}</span>
                                        <span className="activity-time">
                                            {new Date(activity.timestamp).toLocaleDateString('en', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-message">No activity yet. Start learning!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProgressDashboard;
