import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Clock, AlertTriangle, CheckCircle, XCircle, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import '../styles/FinalExam.css';

const FinalExam = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [examInfo, setExamInfo] = useState(null);
    const [attempt, setAttempt] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [stage, setStage] = useState('info'); // info, exam, result

    useEffect(() => {
        if (user) fetchExamInfo();
    }, [user, courseId]);

    useEffect(() => {
        if (stage === 'exam' && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [stage, timeLeft]);

    const fetchExamInfo = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(
                `http://localhost:5000/api/certification/exam/${courseId}`,
                config
            );
            setExamInfo(res.data);
        } catch (error) {
            console.error('Error fetching exam:', error);
        } finally {
            setLoading(false);
        }
    };

    const startExam = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.post(
                `http://localhost:5000/api/certification/exam/${courseId}/start`,
                {},
                config
            );
            setAttempt(res.data.attempt);
            setQuestions(res.data.questions);
            setTimeLeft(res.data.exam.duration * 60);
            setStage('exam');
        } catch (error) {
            console.error('Error starting exam:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (questionId, answerIndex) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: { selectedAnswer: answerIndex, timeTaken: 0 }
        }));
    };

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const formattedAnswers = questions.map(q => ({
                questionId: q._id,
                selectedAnswer: answers[q._id]?.selectedAnswer ?? -1,
                timeTaken: answers[q._id]?.timeTaken || 0
            }));

            const res = await axios.post(
                `http://localhost:5000/api/certification/exam/${attempt._id}/submit`,
                { answers: formattedAnswers, totalTimeTaken: (examInfo.exam.duration * 60) - timeLeft },
                config
            );
            setResult(res.data);
            setStage('result');
        } catch (error) {
            console.error('Error submitting exam:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="final-exam-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading exam...</p>
                </div>
            </div>
        );
    }

    // Exam Info Stage
    if (stage === 'info' && examInfo) {
        return (
            <div className="final-exam-page">
                <div className="exam-info-container glass-card">
                    <div className="exam-header">
                        <Award size={48} className="exam-icon" />
                        <h1>{examInfo.exam.title}</h1>
                        <p className="course-name">{examInfo.course.title}</p>
                    </div>

                    <div className="exam-details">
                        <div className="detail-item">
                            <Clock size={20} />
                            <span>Duration: {examInfo.exam.duration} minutes</span>
                        </div>
                        <div className="detail-item">
                            <CheckCircle size={20} />
                            <span>Passing Score: {examInfo.exam.passingScore}%</span>
                        </div>
                        <div className="detail-item">
                            <AlertTriangle size={20} />
                            <span>Total Questions: {examInfo.exam.totalQuestions}</span>
                        </div>
                    </div>

                    <div className="exam-instructions">
                        <h3>Instructions</h3>
                        <ul>
                            <li>Read each question carefully before answering</li>
                            <li>You cannot go back once you submit the exam</li>
                            <li>The exam will auto-submit when time runs out</li>
                            <li>You need {examInfo.exam.passingScore}% to pass and earn your certificate</li>
                        </ul>
                    </div>

                    {examInfo.hasPassed ? (
                        <div className="already-passed">
                            <CheckCircle size={24} />
                            <span>You have already passed this exam!</span>
                            <button
                                className="btn-primary"
                                onClick={() => navigate('/certificates')}
                            >
                                View Certificate
                            </button>
                        </div>
                    ) : examInfo.attemptsRemaining > 0 ? (
                        <div className="exam-actions">
                            <p className="attempts-info">
                                Attempts remaining: {examInfo.attemptsRemaining}
                            </p>
                            <button className="btn-primary btn-large" onClick={startExam}>
                                Start Exam
                            </button>
                        </div>
                    ) : (
                        <div className="no-attempts">
                            <XCircle size={24} />
                            <span>No attempts remaining</span>
                        </div>
                    )}

                    {examInfo.previousAttempts?.length > 0 && (
                        <div className="previous-attempts">
                            <h4>Previous Attempts</h4>
                            {examInfo.previousAttempts.map((attempt, idx) => (
                                <div key={idx} className={`attempt-item ${attempt.passed ? 'passed' : 'failed'}`}>
                                    <span>Attempt {attempt.attemptNumber}</span>
                                    <span>{attempt.score}%</span>
                                    <span>{attempt.passed ? 'Passed' : 'Failed'}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Exam Taking Stage
    if (stage === 'exam' && questions.length > 0) {
        const currentQuestion = questions[currentIndex];
        const answeredCount = Object.keys(answers).length;

        return (
            <div className="final-exam-page">
                <div className="exam-container">
                    <div className="exam-topbar">
                        <div className="timer" style={{ color: timeLeft < 60 ? '#ef4444' : '#fff' }}>
                            <Clock size={20} />
                            <span>{formatTime(timeLeft)}</span>
                        </div>
                        <div className="progress-info">
                            Question {currentIndex + 1} of {questions.length}
                        </div>
                        <div className="answered-count">
                            {answeredCount}/{questions.length} Answered
                        </div>
                    </div>

                    <div className="question-card glass-card">
                        <div className="question-header">
                            <span className="question-number">Q{currentIndex + 1}</span>
                            <span className="question-category">{currentQuestion.category}</span>
                        </div>
                        <p className="question-text">{currentQuestion.text}</p>

                        <div className="options-list">
                            {currentQuestion.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    className={`option-btn ${answers[currentQuestion._id]?.selectedAnswer === idx ? 'selected' : ''}`}
                                    onClick={() => handleAnswer(currentQuestion._id, idx)}
                                >
                                    <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                                    <span className="option-text">{option}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="exam-navigation">
                        <button
                            className="nav-btn"
                            onClick={() => setCurrentIndex(prev => prev - 1)}
                            disabled={currentIndex === 0}
                        >
                            <ChevronLeft size={20} /> Previous
                        </button>

                        {currentIndex === questions.length - 1 ? (
                            <button
                                className="btn-primary submit-btn"
                                onClick={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? 'Submitting...' : 'Submit Exam'}
                            </button>
                        ) : (
                            <button
                                className="nav-btn"
                                onClick={() => setCurrentIndex(prev => prev + 1)}
                            >
                                Next <ChevronRight size={20} />
                            </button>
                        )}
                    </div>

                    <div className="question-navigator">
                        {questions.map((q, idx) => (
                            <button
                                key={idx}
                                className={`nav-dot ${idx === currentIndex ? 'current' : ''} ${answers[q._id] ? 'answered' : ''}`}
                                onClick={() => setCurrentIndex(idx)}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Result Stage
    if (stage === 'result' && result) {
        return (
            <div className="final-exam-page">
                <div className="result-container glass-card">
                    <div className={`result-header ${result.attempt.passed ? 'passed' : 'failed'}`}>
                        {result.attempt.passed ? (
                            <>
                                <Award size={64} />
                                <h1>Congratulations!</h1>
                                <p>You passed the exam!</p>
                            </>
                        ) : (
                            <>
                                <XCircle size={64} />
                                <h1>Keep Trying!</h1>
                                <p>You didn't pass this time</p>
                            </>
                        )}
                    </div>

                    <div className="result-stats">
                        <div className="stat">
                            <span className="stat-value">{result.attempt.percentage}%</span>
                            <span className="stat-label">Your Score</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">{result.attempt.score}/{result.attempt.maxScore}</span>
                            <span className="stat-label">Points</span>
                        </div>
                    </div>

                    {result.certificate && (
                        <div className="certificate-info">
                            <Award size={32} />
                            <div>
                                <h3>Certificate Earned!</h3>
                                <p>Certificate No: {result.certificate.certificateNumber}</p>
                                <p>Grade: {result.certificate.grade}</p>
                            </div>
                        </div>
                    )}

                    <div className="result-actions">
                        {result.certificate ? (
                            <button
                                className="btn-primary"
                                onClick={() => navigate('/certificates')}
                            >
                                View Certificates
                            </button>
                        ) : (
                            <button
                                className="btn-primary"
                                onClick={() => navigate(`/courses/${courseId}`)}
                            >
                                Back to Course
                            </button>
                        )}
                        <button
                            className="btn-secondary"
                            onClick={() => navigate('/courses')}
                        >
                            Browse Courses
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default FinalExam;
