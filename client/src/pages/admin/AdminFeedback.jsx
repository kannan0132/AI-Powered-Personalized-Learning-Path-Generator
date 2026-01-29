import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import {
    MessageSquare,
    Filter,
    Clock,
    CheckCircle,
    AlertCircle,
    User,
    ChevronDown,
    Search,
    Send,
    Tag
} from 'lucide-react';
import '../../styles/AdminFeedback.css';

const AdminFeedback = () => {
    const { user } = useContext(AuthContext);
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [response, setResponse] = useState('');
    const [updating, setUpdating] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        type: '',
        priority: ''
    });

    useEffect(() => {
        if (user) fetchFeedback();
    }, [user, filters]);

    const fetchFeedback = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
                params: filters
            };
            const res = await axios.get('http://localhost:5001/api/feedback/admin', config);
            setFeedback(res.data);
        } catch (error) {
            console.error('Error fetching feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status, responseText) => {
        setUpdating(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`http://localhost:5001/api/feedback/${id}`, {
                status,
                response: responseText
            }, config);
            fetchFeedback();
            setSelectedFeedback(null);
            setResponse('');
        } catch (error) {
            console.error('Error updating feedback:', error);
        } finally {
            setUpdating(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock size={18} className="status-pending" />;
            case 'in_progress': return <Clock size={18} className="status-progress" />;
            case 'resolved': return <CheckCircle size={18} className="status-resolved" />;
            case 'closed': return <AlertCircle size={18} className="status-closed" />;
            default: return null;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return '#ef4444';
            case 'high': return '#f59e0b';
            case 'medium': return '#3b82f6';
            case 'low': return '#10b981';
            default: return '#94a3b8';
        }
    };

    return (
        <div className="admin-page feedback-management">
            <div className="admin-page-header">
                <h1><MessageSquare size={28} /> Feedback Monitoring</h1>
                <p>Manage user-reported issues, bugs, and general feedback</p>
            </div>

            {/* Filters */}
            <div className="filters-section glass-card">
                <div className="filter-group">
                    <Filter size={18} />
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
                <div className="filter-group">
                    <Tag size={18} />
                    <select
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    >
                        <option value="">All Types</option>
                        <option value="feedback">Feedback</option>
                        <option value="bug">Bug</option>
                        <option value="feature">Feature</option>
                        <option value="support">Support</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading feedback...</p>
                </div>
            ) : feedback.length === 0 ? (
                <div className="empty-state glass-card">
                    <MessageSquare size={48} />
                    <h3>No feedback found</h3>
                    <p>Great job! All user queries are cleared.</p>
                </div>
            ) : (
                <div className="feedback-list">
                    {feedback.map(item => (
                        <div
                            key={item._id}
                            className={`feedback-card glass-card ${selectedFeedback?._id === item._id ? 'active' : ''}`}
                            onClick={() => setSelectedFeedback(item)}
                        >
                            <div className="feedback-card-header">
                                <div className="user-info">
                                    <div className="user-avatar">
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <div className="user-name">{item.user?.name || 'Deleted User'}</div>
                                        <div className="feedback-time">{new Date(item.createdAt).toLocaleString()}</div>
                                    </div>
                                </div>
                                <div className="feedback-meta">
                                    <span className="type-badge">{item.type}</span>
                                    <span
                                        className="priority-indicator"
                                        style={{ backgroundColor: getPriorityColor(item.priority) }}
                                    >
                                        {item.priority}
                                    </span>
                                </div>
                            </div>
                            <div className="feedback-content">
                                <h3>{item.subject}</h3>
                                <p>{item.message.length > 150 ? `${item.message.substring(0, 150)}...` : item.message}</p>
                            </div>
                            <div className="feedback-footer">
                                <div className="status-info">
                                    {getStatusIcon(item.status)}
                                    <span className={`status-text ${item.status}`}>{item.status.replace('_', ' ')}</span>
                                </div>
                                {item.response && <div className="has-response"><CheckCircle size={14} /> Responded</div>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {selectedFeedback && (
                <div className="feedback-modal-overlay" onClick={() => setSelectedFeedback(null)}>
                    <div className="feedback-modal glass-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Feedback Detail</h2>
                            <button className="close-btn" onClick={() => setSelectedFeedback(null)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-section">
                                <label>User Details</label>
                                <div className="detail-content user-detail">
                                    <div className="user-name">{selectedFeedback.user?.name}</div>
                                    <div className="user-email">{selectedFeedback.user?.email}</div>
                                </div>
                            </div>
                            <div className="detail-section">
                                <label>Message</label>
                                <div className="detail-content message-detail">
                                    <div className="message-subject">{selectedFeedback.subject}</div>
                                    <div className="message-text">{selectedFeedback.message}</div>
                                </div>
                            </div>
                            {selectedFeedback.metadata && (
                                <div className="detail-section">
                                    <label>Technical Metadata</label>
                                    <div className="detail-content meta-detail">
                                        {Object.entries(selectedFeedback.metadata).map(([key, val]) => (
                                            <div key={key}><strong>{key}:</strong> {val}</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="detail-section">
                                <label>Admin Response</label>
                                <textarea
                                    value={response}
                                    onChange={(e) => setResponse(e.target.value)}
                                    placeholder={selectedFeedback.response || "Type your response here..."}
                                    className="admin-response-input"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <div className="status-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => handleUpdateStatus(selectedFeedback._id, 'in_progress', response)}
                                    disabled={updating}
                                >
                                    Set In Progress
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleUpdateStatus(selectedFeedback._id, 'resolved', response)}
                                    disabled={updating || !response}
                                >
                                    <Send size={16} /> Resolve & Respond
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFeedback;
