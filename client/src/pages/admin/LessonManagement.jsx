import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { BookOpen, Plus, Edit, Trash2, ChevronLeft, MoveUp, MoveDown, Save, X } from 'lucide-react';

const LessonManagement = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [formData, setFormData] = useState({
        title: '', description: '', content: '', contentType: 'text', duration: 10, order: 1, difficulty: 'Beginner'
    });

    useEffect(() => {
        if (user) {
            fetchCourse();
            fetchLessons();
        }
    }, [user, courseId]);

    const fetchCourse = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`http://localhost:5001/api/courses/${courseId}`, config);
            setCourse(res.data);
        } catch (error) {
            console.error('Error fetching course:', error);
        }
    };

    const fetchLessons = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`http://localhost:5001/api/lessons/course/${courseId}`, config);
            setLessons(res.data);
        } catch (error) {
            console.error('Error fetching lessons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const data = { ...formData, course: courseId };

            if (editingLesson) {
                await axios.put(`http://localhost:5001/api/lessons/${editingLesson._id}`, data, config);
            } else {
                await axios.post('http://localhost:5001/api/lessons', data, config);
            }

            setShowModal(false);
            setEditingLesson(null);
            fetchLessons();
        } catch (error) {
            console.error('Error saving lesson:', error);
        }
    };

    const handleEdit = (lesson) => {
        setEditingLesson(lesson);
        setFormData({
            title: lesson.title,
            description: lesson.description,
            content: lesson.content || '',
            contentType: lesson.contentType || 'text',
            duration: lesson.duration || 10,
            order: lesson.order,
            difficulty: lesson.difficulty || 'Beginner'
        });
        setShowModal(true);
    };

    const handleDelete = async (lessonId) => {
        if (!window.confirm('Are you sure you want to delete this lesson?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`http://localhost:5001/api/lessons/${lessonId}`, config);
            fetchLessons();
        } catch (error) {
            console.error('Error deleting lesson:', error);
        }
    };

    const handleReorder = async (lessonId, direction) => {
        const index = lessons.findIndex(l => l._id === lessonId);
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === lessons.length - 1) return;

        const newLessons = [...lessons];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newLessons[index], newLessons[swapIndex]] = [newLessons[swapIndex], newLessons[index]];

        // Update orders
        const lessonOrders = newLessons.map((l, i) => ({ lessonId: l._id, order: i + 1 }));

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put('http://localhost:5001/api/lessons/reorder', { courseId, lessonOrders }, config);
            setLessons(newLessons);
        } catch (error) {
            console.error('Error reordering lessons:', error);
            fetchLessons();
        }
    };

    if (loading) return <div className="admin-page"><div className="loading-state"><div className="spinner"></div></div></div>;

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <button className="back-btn" onClick={() => navigate('/admin/courses')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginBottom: '1rem' }}>
                    <ChevronLeft size={18} /> Back to Courses
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1><BookOpen size={28} /> {course?.title}</h1>
                        <p>Manage lessons and content for this course</p>
                    </div>
                    <button className="btn-primary" onClick={() => { setEditingLesson(null); setFormData({ title: '', description: '', content: '', contentType: 'text', duration: 10, order: lessons.length + 1, difficulty: 'Beginner' }); setShowModal(true); }}>
                        <Plus size={18} /> Add Lesson
                    </button>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Title</th>
                                <th>Duration</th>
                                <th>Difficulty</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lessons.map((lesson, idx) => (
                                <tr key={lesson._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {lesson.order}
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <button onClick={() => handleReorder(lesson._id, 'up')} disabled={idx === 0} style={{ background: 'none', border: 'none', color: idx === 0 ? '#334155' : '#94a3b8', cursor: idx === 0 ? 'default' : 'pointer', padding: '0' }}><MoveUp size={14} /></button>
                                                <button onClick={() => handleReorder(lesson._id, 'down')} disabled={idx === lessons.length - 1} style={{ background: 'none', border: 'none', color: idx === lessons.length - 1 ? '#334155' : '#94a3b8', cursor: idx === lessons.length - 1 ? 'default' : 'pointer', padding: '0' }}><MoveDown size={14} /></button>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 500 }}>{lesson.title}</td>
                                    <td>{lesson.duration} mins</td>
                                    <td>{lesson.difficulty}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="action-btn" onClick={() => handleEdit(lesson)}><Edit size={18} /></button>
                                            <button className="action-btn danger" onClick={() => handleDelete(lesson._id)}><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {lessons.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No lessons found for this course. Click "Add Lesson" to get started.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <h2 style={{ color: '#f1f5f9' }}>{editingLesson ? 'Edit Lesson' : 'Add Lesson'}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Title</label>
                                    <input className="search-input" placeholder="Lesson Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Duration (mins)</label>
                                    <input type="number" className="search-input" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })} required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea className="search-input" placeholder="Short description" rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                            </div>

                            <div className="form-group">
                                <label>Content (Markdown supported)</label>
                                <textarea className="search-input" placeholder="Lesson content..." rows={8} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} required style={{ fontFamily: 'monospace' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Content Type</label>
                                    <select className="filter-select" value={formData.contentType} onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}>
                                        <option value="text">Text/Markdown</option>
                                        <option value="video">Video</option>
                                        <option value="interactive">Interactive</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Difficulty</label>
                                    <select className="filter-select" value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}>
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                                <Save size={18} /> {editingLesson ? 'Save Changes' : 'Create Lesson'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LessonManagement;
