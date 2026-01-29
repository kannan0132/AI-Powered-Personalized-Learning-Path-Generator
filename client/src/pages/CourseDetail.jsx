import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { BookOpen, Clock, Users, Star, Play, CheckCircle, Lock, ArrowLeft } from 'lucide-react';
import '../styles/Courses.css';

const CourseDetail = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        fetchCourse();
    }, [id]);

    const fetchCourse = async () => {
        try {
            const { data } = await axios.get(`http://localhost:5001/api/courses/${id}`);
            setCourse(data);
        } catch (error) {
            console.error('Error fetching course:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setEnrolling(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            await axios.post(`http://localhost:5001/api/courses/${id}/enroll`, {}, config);
            // Refresh course data
            fetchCourse();
        } catch (error) {
            console.error('Error enrolling:', error);
        } finally {
            setEnrolling(false);
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Beginner': return 'beginner';
            case 'Intermediate': return 'intermediate';
            case 'Advanced': return 'advanced';
            default: return '';
        }
    };

    if (loading) {
        return (
            <div className="course-detail-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading course...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="course-detail-container">
                <div className="empty-state glass-card">
                    <h3>Course not found</h3>
                    <Link to="/courses" className="btn btn-primary">Back to Courses</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="course-detail-container">
            <Link to="/courses" className="back-link">
                <ArrowLeft size={20} /> Back to Courses
            </Link>

            <div className="course-detail-header glass-card">
                <div className="course-detail-info">
                    <div className="course-badges">
                        <span className="category-badge">{course.category}</span>
                        <span className={`difficulty-badge ${getDifficultyColor(course.difficulty)}`}>
                            {course.difficulty}
                        </span>
                    </div>
                    <h1>{course.title}</h1>
                    <p className="course-description">{course.description}</p>

                    <div className="course-stats-row">
                        <span><BookOpen size={18} /> {course.totalLessons} Lessons</span>
                        <span><Clock size={18} /> {course.duration || 'Self-paced'}</span>
                        <span><Users size={18} /> {course.enrolledCount} Enrolled</span>
                        <span><Star size={18} /> {course.rating.toFixed(1)} Rating</span>
                    </div>

                    {course.tags && course.tags.length > 0 && (
                        <div className="course-tags">
                            {course.tags.map(tag => (
                                <span key={tag} className="tag">{tag}</span>
                            ))}
                        </div>
                    )}

                    <button
                        className="btn btn-primary enroll-btn"
                        onClick={handleEnroll}
                        disabled={enrolling}
                    >
                        {enrolling ? 'Enrolling...' : 'Start Learning'}
                    </button>
                </div>
            </div>

            <div className="course-content-section">
                <h2>Course Content</h2>
                <div className="lessons-list">
                    {course.lessons && course.lessons.map((lesson, index) => (
                        <Link
                            to={user ? `/lessons/${lesson._id}` : '/login'}
                            key={lesson._id}
                            className="lesson-item glass-card"
                        >
                            <div className="lesson-order">{index + 1}</div>
                            <div className="lesson-info">
                                <h4>{lesson.title}</h4>
                                <p>{lesson.description}</p>
                                <div className="lesson-meta">
                                    <span><Clock size={14} /> {lesson.duration} min</span>
                                    <span className="content-type">{lesson.contentType}</span>
                                </div>
                            </div>
                            <div className="lesson-action">
                                {user ? <Play size={20} /> : <Lock size={20} />}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
