import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { ArrowLeft, ArrowRight, Clock, BookOpen, CheckCircle } from 'lucide-react';
import '../styles/Lesson.css';

const LessonViewer = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [navigation, setNavigation] = useState({ previous: null, next: null });
    const [loading, setLoading] = useState(true);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchLesson();
        fetchNavigation();
    }, [id, user]);

    const fetchLesson = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const { data } = await axios.get(`http://localhost:5001/api/lessons/${id}`, config);
            setLesson(data);
        } catch (error) {
            console.error('Error fetching lesson:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchNavigation = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const { data } = await axios.get(`http://localhost:5001/api/lessons/${id}/navigation`, config);
            setNavigation(data);
        } catch (error) {
            console.error('Error fetching navigation:', error);
        }
    };

    const markComplete = () => {
        setCompleted(true);
        // In a full implementation, this would call an API to save progress
    };

    if (loading) {
        return (
            <div className="lesson-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading lesson...</p>
                </div>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="lesson-container">
                <div className="empty-state glass-card">
                    <h3>Lesson not found</h3>
                    <Link to="/courses" className="btn btn-primary">Back to Courses</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="lesson-container">
            {/* Lesson Header */}
            <div className="lesson-header glass-card">
                <Link to={`/courses/${lesson.course._id}`} className="back-link">
                    <ArrowLeft size={18} /> Back to {lesson.course.title}
                </Link>

                <div className="lesson-title-section">
                    <h1>{lesson.title}</h1>
                    <div className="lesson-meta">
                        <span><Clock size={16} /> {lesson.duration} min</span>
                        <span><BookOpen size={16} /> {lesson.contentType}</span>
                        {completed && (
                            <span className="completed-badge">
                                <CheckCircle size={16} /> Completed
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Lesson Content */}
            <div className="lesson-content glass-card">
                {lesson.videoUrl && (
                    <div className="video-container">
                        <iframe
                            src={lesson.videoUrl}
                            title={lesson.title}
                            allowFullScreen
                        ></iframe>
                    </div>
                )}

                <div
                    className="lesson-text"
                    dangerouslySetInnerHTML={{ __html: lesson.content }}
                />

                {lesson.resources && lesson.resources.length > 0 && (
                    <div className="lesson-resources">
                        <h3>Resources</h3>
                        <ul>
                            {lesson.resources.map((resource, idx) => (
                                <li key={idx}>
                                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                        {resource.title} ({resource.type})
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Lesson Actions */}
            <div className="lesson-actions">
                {!completed && (
                    <button className="btn btn-primary complete-btn" onClick={markComplete}>
                        <CheckCircle size={18} /> Mark as Complete
                    </button>
                )}
            </div>

            {/* Navigation */}
            <div className="lesson-navigation">
                {navigation.previous ? (
                    <Link to={`/lessons/${navigation.previous._id}`} className="nav-btn prev glass-card">
                        <ArrowLeft size={20} />
                        <div>
                            <span className="nav-label">Previous</span>
                            <span className="nav-title">{navigation.previous.title}</span>
                        </div>
                    </Link>
                ) : (
                    <div></div>
                )}

                {navigation.next ? (
                    <Link to={`/lessons/${navigation.next._id}`} className="nav-btn next glass-card">
                        <div>
                            <span className="nav-label">Next</span>
                            <span className="nav-title">{navigation.next.title}</span>
                        </div>
                        <ArrowRight size={20} />
                    </Link>
                ) : (
                    <Link to={`/courses/${lesson.course._id}`} className="nav-btn next glass-card">
                        <div>
                            <span className="nav-label">Finished!</span>
                            <span className="nav-title">Back to Course</span>
                        </div>
                        <ArrowRight size={20} />
                    </Link>
                )}
            </div>
        </div>
    );
};

export default LessonViewer;
