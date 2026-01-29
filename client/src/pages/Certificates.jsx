import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Award, Download, ExternalLink, Calendar, Star } from 'lucide-react';
import '../styles/Certificates.css';

const Certificates = () => {
    const { user } = useContext(AuthContext);
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCert, setSelectedCert] = useState(null);

    useEffect(() => {
        if (user) fetchCertificates();
    }, [user]);

    const fetchCertificates = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get('http://localhost:5001/api/certification/certificates', config);
            setCertificates(res.data);
        } catch (error) {
            console.error('Error fetching certificates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (certId) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
                responseType: 'blob'
            };
            const res = await axios.get(
                `http://localhost:5001/api/certification/certificate/${certId}/download`,
                config
            );

            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `certificate-${certId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading certificate:', error);
        }
    };

    const getGradeColor = (grade) => {
        switch (grade) {
            case 'A+': case 'A': return '#22c55e';
            case 'B+': case 'B': return '#3b82f6';
            case 'C+': case 'C': return '#f59e0b';
            default: return '#8b5cf6';
        }
    };

    if (loading) {
        return (
            <div className="certificates-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading certificates...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="certificates-page">
            <div className="page-header">
                <Award size={32} />
                <h1>My Certificates</h1>
                <p>View and download your earned certificates</p>
            </div>

            {certificates.length === 0 ? (
                <div className="empty-state glass-card">
                    <Award size={64} className="empty-icon" />
                    <h2>No Certificates Yet</h2>
                    <p>Complete courses and pass final exams to earn certificates</p>
                    <Link to="/courses" className="btn-primary">Browse Courses</Link>
                </div>
            ) : (
                <div className="certificates-grid">
                    {certificates.map(cert => (
                        <div key={cert._id} className="certificate-card glass-card">
                            <div className="cert-header">
                                <div
                                    className="grade-badge"
                                    style={{ background: getGradeColor(cert.grade) }}
                                >
                                    {cert.grade}
                                </div>
                                <Award size={40} className="cert-icon" />
                            </div>

                            <div className="cert-body">
                                <h3>{cert.course?.title || 'Course'}</h3>
                                <p className="cert-number">#{cert.certificateNumber}</p>

                                <div className="cert-details">
                                    <div className="detail">
                                        <Star size={16} />
                                        <span>Score: {cert.score}%</span>
                                    </div>
                                    <div className="detail">
                                        <Calendar size={16} />
                                        <span>{new Date(cert.issueDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="cert-actions">
                                <button
                                    className="btn-icon"
                                    onClick={() => setSelectedCert(cert)}
                                    title="View Details"
                                >
                                    <ExternalLink size={18} />
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={() => handleDownload(cert._id)}
                                >
                                    <Download size={18} /> Download
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedCert && (
                <div className="modal-overlay" onClick={() => setSelectedCert(null)}>
                    <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <Award size={32} />
                            <h2>Certificate Details</h2>
                        </div>

                        <div className="modal-body">
                            <div className="detail-row">
                                <span>Course</span>
                                <strong>{selectedCert.course?.title}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Certificate Number</span>
                                <strong>{selectedCert.certificateNumber}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Verification Code</span>
                                <strong>{selectedCert.verificationCode}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Grade</span>
                                <strong style={{ color: getGradeColor(selectedCert.grade) }}>
                                    {selectedCert.grade} ({selectedCert.score}%)
                                </strong>
                            </div>
                            <div className="detail-row">
                                <span>Issue Date</span>
                                <strong>{new Date(selectedCert.issueDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</strong>
                            </div>
                            {selectedCert.metadata && (
                                <>
                                    <div className="detail-row">
                                        <span>Lessons Completed</span>
                                        <strong>{selectedCert.metadata.lessonsCompleted}</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Total Time Spent</span>
                                        <strong>{selectedCert.metadata.totalTimeSpent} minutes</strong>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => setSelectedCert(null)}
                            >
                                Close
                            </button>
                            <button
                                className="btn-primary"
                                onClick={() => handleDownload(selectedCert._id)}
                            >
                                <Download size={18} /> Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Certificates;
