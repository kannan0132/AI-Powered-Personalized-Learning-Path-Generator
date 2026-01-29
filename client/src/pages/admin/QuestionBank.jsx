import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { HelpCircle, Plus, Edit, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';

const QuestionBank = () => {
    const { user } = useContext(AuthContext);
    const [questions, setQuestions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [formData, setFormData] = useState({
        text: '', options: ['', '', '', ''], correctAnswer: 0, category: '', difficulty: 'Beginner', explanation: ''
    });

    useEffect(() => {
        if (user) fetchQuestions();
    }, [user, page, categoryFilter, difficultyFilter]);

    const fetchQuestions = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const params = new URLSearchParams({ page, limit: 10 });
            if (categoryFilter) params.append('category', categoryFilter);
            if (difficultyFilter) params.append('difficulty', difficultyFilter);

            const res = await axios.get(`http://localhost:5001/api/admin/questions?${params}`, config);
            setQuestions(res.data.questions);
            setCategories(res.data.categories);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const payload = { ...formData, correctAnswer: parseInt(formData.correctAnswer) };
            if (editingQuestion) {
                await axios.put(`http://localhost:5001/api/admin/questions/${editingQuestion._id}`, payload, config);
            } else {
                await axios.post('http://localhost:5001/api/admin/questions', payload, config);
            }
            setShowModal(false);
            resetForm();
            fetchQuestions();
        } catch (error) {
            console.error('Error saving question:', error);
        }
    };

    const handleEdit = (q) => {
        setEditingQuestion(q);
        setFormData({
            text: q.text,
            options: [...q.options],
            correctAnswer: q.correctAnswer,
            category: q.category,
            difficulty: q.difficulty,
            explanation: q.explanation || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this question?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`http://localhost:5001/api/admin/questions/${id}`, config);
            fetchQuestions();
        } catch (error) {
            console.error('Error deleting question:', error);
        }
    };

    const resetForm = () => {
        setEditingQuestion(null);
        setFormData({ text: '', options: ['', '', '', ''], correctAnswer: 0, category: '', difficulty: 'Beginner', explanation: '' });
    };

    const updateOption = (idx, value) => {
        const newOptions = [...formData.options];
        newOptions[idx] = value;
        setFormData({ ...formData, options: newOptions });
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1><HelpCircle size={28} /> Question Bank</h1>
                    <p>Manage assessment questions</p>
                </div>
                <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                    <Plus size={18} /> Add Question
                </button>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div className="table-controls">
                    <select className="filter-select" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select className="filter-select" value={difficultyFilter} onChange={(e) => { setDifficultyFilter(e.target.value); setPage(1); }}>
                        <option value="">All Difficulties</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                </div>

                {loading ? (
                    <div className="loading-state" style={{ padding: '3rem' }}><div className="spinner"></div></div>
                ) : (
                    <>
                        <div className="data-table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '50%' }}>Question</th>
                                        <th>Category</th>
                                        <th>Difficulty</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {questions.map((q) => (
                                        <tr key={q._id}>
                                            <td style={{ maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.text}</td>
                                            <td><span style={{ padding: '0.25rem 0.75rem', background: 'rgba(99,102,241,0.2)', color: '#6366f1', borderRadius: '20px', fontSize: '0.85rem' }}>{q.category}</span></td>
                                            <td><span style={{ color: q.difficulty === 'Beginner' ? '#22c55e' : q.difficulty === 'Intermediate' ? '#f59e0b' : '#ef4444' }}>{q.difficulty}</span></td>
                                            <td style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="action-btn" onClick={() => handleEdit(q)}><Edit size={18} /></button>
                                                <button className="action-btn danger" onClick={() => handleDelete(q._id)}><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}><ChevronLeft size={16} /></button>
                                {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                                    <button key={i} className={`page-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                                ))}
                                <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}><ChevronRight size={16} /></button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <h2 style={{ color: '#f1f5f9' }}>{editingQuestion ? 'Edit Question' : 'Add Question'}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <textarea className="search-input" placeholder="Question text" rows={2} value={formData.text} onChange={(e) => setFormData({ ...formData, text: e.target.value })} required style={{ resize: 'vertical' }} />

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <input className="search-input" style={{ flex: 1 }} placeholder="Category (e.g., JavaScript)" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required />
                                <select className="filter-select" value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}>
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>

                            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Options (select correct answer):</div>
                            {formData.options.map((opt, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input type="radio" name="correctAnswer" checked={formData.correctAnswer === idx} onChange={() => setFormData({ ...formData, correctAnswer: idx })} />
                                    <input className="search-input" style={{ flex: 1 }} placeholder={`Option ${idx + 1}`} value={opt} onChange={(e) => updateOption(idx, e.target.value)} required />
                                </div>
                            ))}

                            <textarea className="search-input" placeholder="Explanation (optional)" rows={2} value={formData.explanation} onChange={(e) => setFormData({ ...formData, explanation: e.target.value })} style={{ resize: 'vertical' }} />

                            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>{editingQuestion ? 'Save Changes' : 'Add Question'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionBank;
