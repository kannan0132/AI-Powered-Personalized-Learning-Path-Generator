import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { MessageSquare, Bug, Lightbulb, HelpCircle, Send, CheckCircle } from 'lucide-react';
import '../styles/Feedback.css';

const FeedbackForm = () => {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        type: 'feedback',
        subject: '',
        message: '',
        priority: 'medium'
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const feedbackTypes = [
        { value: 'feedback', label: 'General Feedback', icon: MessageSquare, color: '#6366f1' },
        { value: 'bug', label: 'Bug Report', icon: Bug, color: '#ef4444' },
        { value: 'feature', label: 'Feature Request', icon: Lightbulb, color: '#f59e0b' },
        { value: 'support', label: 'Support Request', icon: HelpCircle, color: '#22c55e' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/feedback', formData, config);
            setSubmitted(true);
        } catch (error) {
            console.error('Error submitting feedback:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="feedback-page">
                <div className="success-container glass-card">
                    <CheckCircle size={64} className="success-icon" />
                    <h2>Thank You!</h2>
                    <p>Your feedback has been submitted successfully.</p>
                    <p className="secondary">We'll review it and get back to you if needed.</p>
                    <button
                        className="btn-primary"
                        onClick={() => { setSubmitted(false); setFormData({ type: 'feedback', subject: '', message: '', priority: 'medium' }); }}
                    >
                        Submit Another
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="feedback-page">
            <div className="page-header">
                <MessageSquare size={32} />
                <h1>Feedback & Support</h1>
                <p>We'd love to hear from you! Help us improve your learning experience.</p>
            </div>

            <form onSubmit={handleSubmit} className="feedback-form glass-card">
                <div className="form-section">
                    <label>What type of feedback is this?</label>
                    <div className="type-selector">
                        {feedbackTypes.map((type) => (
                            <button
                                key={type.value}
                                type="button"
                                className={`type-btn ${formData.type === type.value ? 'selected' : ''}`}
                                onClick={() => setFormData({ ...formData, type: type.value })}
                                style={{ '--accent-color': type.color }}
                            >
                                <type.icon size={24} />
                                <span>{type.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-section">
                    <label htmlFor="subject">Subject</label>
                    <input
                        id="subject"
                        type="text"
                        className="form-input"
                        placeholder="Brief description of your feedback"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                        maxLength={200}
                    />
                </div>

                <div className="form-section">
                    <label htmlFor="message">Details</label>
                    <textarea
                        id="message"
                        className="form-input"
                        placeholder="Please provide as much detail as possible..."
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        maxLength={2000}
                    />
                    <span className="char-count">{formData.message.length}/2000</span>
                </div>

                {formData.type === 'bug' && (
                    <div className="form-section">
                        <label>Priority</label>
                        <div className="priority-selector">
                            {['low', 'medium', 'high', 'urgent'].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    className={`priority-btn ${formData.priority === p ? 'selected' : ''} ${p}`}
                                    onClick={() => setFormData({ ...formData, priority: p })}
                                >
                                    {p.charAt(0).toUpperCase() + p.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <button type="submit" className="btn-primary submit-btn" disabled={submitting}>
                    <Send size={18} />
                    {submitting ? 'Sending...' : 'Submit Feedback'}
                </button>
            </form>
        </div>
    );
};

export default FeedbackForm;
