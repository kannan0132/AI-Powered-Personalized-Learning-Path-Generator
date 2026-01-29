import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { BookOpen, Plus, Edit, Trash2, Eye, EyeOff, X, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CourseManagement = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState({
        title: '', description: '', category: 'Frontend', difficulty: 'Beginner', duration: '', isPublished: false
    });

    const categories = ['Frontend', 'Backend', 'Database', 'DevOps', 'Mobile', 'AI/ML', 'General'];
    const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

    useEffect(() => {
        if (user) fetchCourses();
    }, [user]);

    const fetchCourses = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get('http://localhost:5001/api/courses', config);
            setCourses(res.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            if (editingCourse) {
                await axios.put(`http://localhost:5001/api/admin/courses/${editingCourse._id}`, formData, config);
            } else {
                await axios.post('http://localhost:5001/api/admin/courses', formData, config);
            }
            setShowModal(false);
            setEditingCourse(null);
            setFormData({ title: '', description: '', category: 'Frontend', difficulty: 'Beginner', duration: '', isPublished: false });
            fetchCourses();
        } catch (error) {
            console.error('Error saving course:', error);
        }
    };

    const handleEdit = (course) => {
        setEditingCourse(course);
        setFormData({
            title: course.title,
            description: course.description,
            category: course.category,
            difficulty: course.difficulty,
            duration: course.duration || '',
            isPublished: course.isPublished
        });
        setShowModal(true);
    };

    const handleDelete = async (courseId) => {
        if (!window.confirm('Are you sure? This will also delete all lessons.')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`http://localhost:5001/api/admin/courses/${courseId}`, config);
            fetchCourses();
        } catch (error) {
            console.error('Error deleting course:', error);
        }
    };

    const togglePublish = async (course) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`http://localhost:5001/api/admin/courses/${course._id}`,
                { isPublished: !course.isPublished }, config);
            fetchCourses();
        } catch (error) {
            console.error('Error toggling publish:', error);
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1><BookOpen size={28} /> Course Management</h1>
                    <p>Create and manage courses</p>
                </div>
                <button className="btn-primary" onClick={() => { setEditingCourse(null); setFormData({ title: '', description: '', category: 'Frontend', difficulty: 'Beginner', duration: '', isPublished: false }); setShowModal(true); }}>
                    <Plus size={18} /> Add Course
                </button>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem' }}>
                {loading ? (
                    <div className="loading-state" style={{ padding: '3rem' }}><div className="spinner"></div></div>
                ) : (
                    <div className="data-table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Difficulty</th>
                                    <th>Lessons</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((course) => (
                                    <tr key={course._id}>
                                        <td style={{ fontWeight: 500 }}>{course.title}</td>
                                        <td><span style={{ padding: '0.25rem 0.75rem', background: 'rgba(99,102,241,0.2)', color: '#6366f1', borderRadius: '20px', fontSize: '0.85rem' }}>{course.category}</span></td>
                                        <td>{course.difficulty}</td>
                                        <td>{course.totalLessons || 0}</td>
                                        <td>
                                            <button className="action-btn" onClick={() => togglePublish(course)} title={course.isPublished ? 'Unpublish' : 'Publish'}>
                                                {course.isPublished ? <Eye size={18} style={{ color: '#22c55e' }} /> : <EyeOff size={18} style={{ color: '#94a3b8' }} />}
                                            </button>
                                        </td>
                                        <td style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="action-btn" onClick={() => navigate(`/admin/courses/${course._id}/lessons`)} title="Manage Lessons"><List size={18} /></button>
                                            <button className="action-btn" onClick={() => handleEdit(course)}><Edit size={18} /></button>
                                            <button className="action-btn danger" onClick={() => handleDelete(course._id)}><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <h2 style={{ color: '#f1f5f9' }}>{editingCourse ? 'Edit Course' : 'Add Course'}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input className="search-input" placeholder="Course Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                            <textarea className="search-input" placeholder="Description" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required style={{ resize: 'vertical' }} />
                            <select className="filter-select" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <select className="filter-select" value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}>
                                {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <input className="search-input" placeholder="Duration (e.g., 4 hours)" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                                <input type="checkbox" checked={formData.isPublished} onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })} />
                                Publish immediately
                            </label>
                            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>{editingCourse ? 'Save Changes' : 'Create Course'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseManagement;
