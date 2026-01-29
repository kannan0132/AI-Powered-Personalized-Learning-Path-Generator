import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import {
    Sparkles, BookOpen, Target, Clock, TrendingUp,
    ChevronRight, CheckCircle, Play, AlertCircle, Zap
} from 'lucide-react';
import '../styles/LearningPath.css';

const LearningPath = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activePath, setActivePath] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [genStep, setGenStep] = useState(0);

    const generationSteps = [
        "Analyzing your profile & goals...",
        "Identifying skill gaps from assessments...",
        "Scanning course library for best matches...",
        "Optimizing your personalized curriculum...",
        "Finalizing your Learning Path..."
    ];

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [user]);

    // Handle generation step transitions
    useEffect(() => {
        let interval;
        if (generating) {
            setGenStep(0);
            interval = setInterval(() => {
                setGenStep(prev => {
                    if (prev < generationSteps.length - 1) return prev + 1;
                    return prev;
                });
            }, 1200);
        } else {
            setGenStep(0);
        }
        return () => clearInterval(interval);
    }, [generating]);

    const fetchData = async () => {
        try {
            await Promise.all([fetchActivePath(), fetchRecommendations()]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchActivePath = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('http://localhost:5001/api/learning-path/active', config);
            setActivePath(data);
        } catch (error) {
            if (error.response?.status !== 404) {
                console.error('Error fetching path:', error);
            }
        }
    };

    const fetchRecommendations = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('http://localhost:5001/api/learning-path/recommendations', config);
            setRecommendations(data);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        }
    };

    const generatePath = async () => {
        setGenerating(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post('http://localhost:5001/api/learning-path/generate', {}, config);
            // Simulate a bit more time for aesthetic effect if it's too fast
            await new Promise(resolve => setTimeout(resolve, 6000));
            setActivePath(data);
            fetchRecommendations();
        } catch (error) {
            console.error('Error generating path:', error);
        } finally {
            setGenerating(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle size={20} className="status-complete" />;
            case 'in_progress': return <Play size={20} className="status-progress" />;
            default: return <div className="status-pending" />;
        }
    };

    if (loading) {
        return (
            <div className="learning-path-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Syncing with AI Engine...</p>
                </div>
            </div>
        );
    }

    // AI Generating State
    if (generating) {
        return (
            <div className="learning-path-container">
                <div className="ai-generating-loading glass-card">
                    <div className="ai-icon-wrapper">
                        <div className="ai-sparkle-bg"></div>
                        <Sparkles size={60} className="ai-main-icon" />
                    </div>
                    <h2 style={{ marginBottom: '2rem' }}>AI is Crafting Your Path</h2>
                    <div className="generation-steps">
                        {generationSteps.map((step, idx) => (
                            <div key={idx} className={`gen-step ${idx === genStep ? 'active' : ''} ${idx < genStep ? 'completed' : ''}`}>
                                <div className="step-indicator">
                                    {idx < genStep ? (
                                        <CheckCircle size={18} className="step-check" />
                                    ) : idx === genStep ? (
                                        <div className="step-spinner"></div>
                                    ) : (
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--glass-border)' }}></div>
                                    )}
                                </div>
                                <span className="step-text">{step}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="learning-path-container">
            <div className="path-header">
                <div className="header-content">
                    <h1><Sparkles size={32} /> Your Learning Journey</h1>
                    <p>Personalized curriculum generated by EduAI specifically for your growth</p>
                </div>
                <button
                    className="btn btn-primary generate-btn"
                    onClick={generatePath}
                    disabled={generating}
                    style={{ background: 'var(--primary)', boxShadow: '0 4px 15px rgba(106, 13, 173, 0.3)' }}
                >
                    <Zap size={18} />
                    {activePath ? 'Refresh AI Path' : 'Generate My Path'}
                </button>
            </div>

            {/* Recommendations Section */}
            {recommendations?.nextAction && (
                <div className="next-action-card glass-card">
                    <div className="action-icon">
                        <Target size={24} />
                    </div>
                    <div className="action-content">
                        <span className="action-label">Recommended Next Step</span>
                        <h3>{recommendations.nextAction.title}</h3>
                        <p>{recommendations.nextAction.reason}</p>
                    </div>
                    <Link
                        to={recommendations.nextAction.type === 'skill_gap' ? '/assessment' : `/lessons/${recommendations.nextAction.targetId}`}
                        className="btn btn-primary"
                    >
                        Continue Journey <ChevronRight size={18} />
                    </Link>
                </div>
            )}

            {/* Active Learning Path */}
            {activePath ? (
                <div className="active-path-section">
                    <div className="path-info glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                        <div className="path-meta">
                            <h2>{activePath.title}</h2>
                            <p>{activePath.description}</p>
                            <div className="path-stats">
                                <span><BookOpen size={16} /> {activePath.courses?.length || 0} Specialized Courses</span>
                                <span><Clock size={16} /> {activePath.estimatedDuration} Total</span>
                                <span className={`difficulty-badge ${activePath.difficulty?.toLowerCase()}`}>
                                    {activePath.difficulty}
                                </span>
                            </div>
                        </div>
                        <div className="path-progress">
                            <div className="progress-circle">
                                <svg viewBox="0 0 100 100">
                                    <circle className="bg" cx="50" cy="50" r="45" />
                                    <circle
                                        className="progress"
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        strokeDasharray={`${activePath.progress * 2.83} 283`}
                                        style={{ stroke: 'var(--primary)' }}
                                    />
                                </svg>
                                <span className="progress-text">{activePath.progress}%</span>
                            </div>
                            <span className="progress-label">Path Completion</span>
                        </div>
                    </div>

                    {/* Skill Analysis */}
                    {(activePath.weakTopics?.length > 0 || activePath.strongTopics?.length > 0) && (
                        <div className="skill-analysis glass-card">
                            <h3><TrendingUp size={20} /> AI Skill Gap Analysis</h3>
                            <div className="skills-grid">
                                {activePath.weakTopics?.length > 0 && (
                                    <div className="skill-column weak">
                                        <h4><AlertCircle size={16} /> Focus Opportunities</h4>
                                        <ul>
                                            {activePath.weakTopics.map((topic, idx) => (
                                                <li key={idx}>{topic}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {activePath.strongTopics?.length > 0 && (
                                    <div className="skill-column strong">
                                        <h4><CheckCircle size={16} /> Mastered Concepts</h4>
                                        <ul>
                                            {activePath.strongTopics.map((topic, idx) => (
                                                <li key={idx}>{topic}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Course List */}
                    <div className="courses-section">
                        <h3>Your Tailored Curriculum</h3>
                        <div className="path-courses">
                            {activePath.courses?.map((item, index) => (
                                <div key={item.course?._id || index} className={`course-item glass-card ${item.status}`}>
                                    <div className="course-order">
                                        {getStatusIcon(item.status)}
                                    </div>
                                    <div className="course-info">
                                        <h4 style={{ color: item.status === 'completed' ? 'var(--text-muted)' : 'white' }}>
                                            {item.course?.title || 'Course'}
                                        </h4>
                                        <p>{item.course?.description?.slice(0, 100)}...</p>
                                        <div className="course-meta">
                                            <span className={`difficulty ${item.course?.difficulty?.toLowerCase()}`}>
                                                {item.course?.difficulty}
                                            </span>
                                            <span>{item.course?.category}</span>
                                        </div>
                                    </div>
                                    <div className="course-progress">
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${item.progress}%` }}></div>
                                        </div>
                                        <span>{Math.round(item.progress)}%</span>
                                    </div>
                                    <Link to={`/courses/${item.course?._id}`} className="start-btn">
                                        {item.status === 'completed' ? 'Review' : item.status === 'in_progress' ? 'Resume' : 'Begin'}
                                        <ChevronRight size={16} />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="no-path-section glass-card" style={{ border: '2px dashed var(--glass-border)' }}>
                    <div className="ai-icon-wrapper" style={{ margin: '0 auto 2rem' }}>
                        <div className="ai-sparkle-bg" style={{ opacity: 0.1 }}></div>
                        <Sparkles size={64} className="no-path-icon" style={{ color: 'var(--primary)' }} />
                    </div>
                    <h2>Unlock Your AI Path</h2>
                    <p style={{ maxWidth: '600px', margin: '0 auto 2.5rem' }}>
                        Ready to accelerate your learning? Let our AI engine build a roadmap tailored to your specific strengths and weaknesses.
                    </p>
                    <div className="path-requirements">
                        <div className="requirement">
                            <div className="requirement-marker done"><CheckCircle size={16} /></div>
                            Profile Ready
                        </div>
                        <div className="requirement">
                            <div className="requirement-marker done"><CheckCircle size={16} /></div>
                            Skill Scan Complete
                        </div>
                        <div className="requirement">
                            <div className="requirement-marker pending"><Zap size={16} /></div>
                            Generate Map
                        </div>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={generatePath}
                        disabled={generating}
                        style={{ padding: '1rem 3rem', fontSize: '1.1rem', borderRadius: '50px' }}
                    >
                        <Zap size={20} />
                        Get AI-Generated Path
                    </button>
                </div>
            )}

            {/* Practice Recommendations */}
            {recommendations?.practiceRecommendations?.length > 0 && (
                <div className="practice-section">
                    <h3><Target size={20} /> Strategic Practice Suggestions</h3>
                    <div className="practice-grid">
                        {recommendations.practiceRecommendations.map((rec, idx) => (
                            <Link to={`/courses/${rec.course._id}`} key={idx} className="practice-card glass-card">
                                <span className="practice-topic">Topic: {rec.topic}</span>
                                <h4>{rec.course.title}</h4>
                                <p>{rec.reason}</p>
                                <span className="practice-difficulty">{rec.course.difficulty}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LearningPath;
