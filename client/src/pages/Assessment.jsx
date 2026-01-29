import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Clock, CheckCircle, XCircle, ArrowRight, ArrowLeft, RefreshCw, Trophy, Target, Zap } from 'lucide-react';
import '../styles/Assessment.css';

const Assessment = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Quiz states
    const [phase, setPhase] = useState('start'); // start, quiz, results
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [questionStartTime, setQuestionStartTime] = useState(null);
    const [timeTakenPerQuestion, setTimeTakenPerQuestion] = useState({});
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch available categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get('http://localhost:5001/api/assessment/categories');
                setCategories(data);
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };
        fetchCategories();
    }, []);

    // Timer logic
    useEffect(() => {
        let timer;
        if (phase === 'quiz' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleTimeUp();
                        return 0;
                    }
                    return prev - 1;
                });
                setTotalTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [phase, timeLeft]);

    const handleTimeUp = useCallback(() => {
        // Auto-move to next question or submit if last
        if (currentIndex < questions.length - 1) {
            moveToQuestion(currentIndex + 1);
        } else {
            handleSubmit();
        }
    }, [currentIndex, questions.length]);

    const startQuiz = async () => {
        setLoading(true);
        setError('');
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const params = new URLSearchParams();
            if (selectedCategory !== 'all') params.append('category', selectedCategory);
            params.append('count', '10');

            const { data } = await axios.get(
                `http://localhost:5001/api/assessment/questions?${params.toString()}`,
                config
            );

            if (data.length === 0) {
                setError('No questions available. Please seed the database first.');
                setLoading(false);
                return;
            }

            setQuestions(data);
            setAnswers({});
            setTimeTakenPerQuestion({});
            setCurrentIndex(0);
            setTimeLeft(data[0]?.timeLimit || 30);
            setQuestionStartTime(Date.now());
            setTotalTime(0);
            setPhase('quiz');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load questions');
        }
        setLoading(false);
    };

    const selectAnswer = (questionId, answerIndex) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answerIndex
        }));
    };

    const moveToQuestion = (index) => {
        // Record time taken for current question
        if (questionStartTime) {
            const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
            setTimeTakenPerQuestion(prev => ({
                ...prev,
                [questions[currentIndex]._id]: timeTaken
            }));
        }

        setCurrentIndex(index);
        setTimeLeft(questions[index]?.timeLimit || 30);
        setQuestionStartTime(Date.now());
    };

    const handleSubmit = async () => {
        // Record time for last question
        if (questionStartTime) {
            const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
            timeTakenPerQuestion[questions[currentIndex]._id] = timeTaken;
        }

        setLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };

            const formattedAnswers = questions.map(q => ({
                questionId: q._id,
                answerIndex: answers[q._id] ?? -1,
                timeTaken: timeTakenPerQuestion[q._id] || 0
            }));

            const { data } = await axios.post(
                'http://localhost:5001/api/assessment/submit',
                { answers: formattedAnswers, totalTimeTaken: totalTime },
                config
            );

            setResults(data);
            setPhase('results');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit assessment');
        }
        setLoading(false);
    };

    const restartQuiz = () => {
        setPhase('start');
        setQuestions([]);
        setAnswers({});
        setResults(null);
        setError('');
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Render Start Screen
    if (phase === 'start') {
        return (
            <div className="assessment-container">
                <div className="assessment-start glass-card">
                    <div className="start-header">
                        <Target className="start-icon" />
                        <h1>Skill Assessment</h1>
                        <p>Test your knowledge and discover your strengths and areas for improvement</p>
                    </div>

                    <div className="category-select">
                        <label>Select Category</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.category} value={cat.category}>
                                    {cat.category} ({cat.count} questions)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="quiz-rules">
                        <h3>Quiz Rules</h3>
                        <ul>
                            <li><Clock size={16} /> Each question has a time limit</li>
                            <li><Zap size={16} /> Questions are scored based on difficulty</li>
                            <li><CheckCircle size={16} /> Your skill level may be updated based on performance</li>
                        </ul>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button
                        className="btn btn-primary start-btn"
                        onClick={startQuiz}
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Start Assessment'}
                    </button>
                </div>
            </div>
        );
    }

    // Render Quiz Screen
    if (phase === 'quiz' && questions.length > 0) {
        const currentQuestion = questions[currentIndex];
        const progress = ((currentIndex + 1) / questions.length) * 100;
        const isUrgent = timeLeft <= 10;

        return (
            <div className="assessment-container">
                <div className="quiz-wrapper">
                    {/* Progress Bar */}
                    <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>

                    {/* Quiz Header */}
                    <div className="quiz-header">
                        <span className="question-counter">
                            Question {currentIndex + 1} of {questions.length}
                        </span>
                        <span className={`timer ${isUrgent ? 'urgent' : ''}`}>
                            <Clock size={18} />
                            {formatTime(timeLeft)}
                        </span>
                    </div>

                    {/* Question Card */}
                    <div className="question-card glass-card">
                        <div className="question-meta">
                            <span className="category-badge">{currentQuestion.category}</span>
                            <span className={`difficulty-badge ${currentQuestion.difficulty.toLowerCase()}`}>
                                {currentQuestion.difficulty}
                            </span>
                            <span className="points-badge">{currentQuestion.points} pts</span>
                        </div>

                        <h2 className="question-text">{currentQuestion.text}</h2>

                        <div className="options-grid">
                            {currentQuestion.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    className={`option-btn ${answers[currentQuestion._id] === idx ? 'selected' : ''}`}
                                    onClick={() => selectAnswer(currentQuestion._id, idx)}
                                >
                                    <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                                    <span className="option-text">{option}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="quiz-navigation">
                        <button
                            className="nav-btn prev"
                            onClick={() => moveToQuestion(currentIndex - 1)}
                            disabled={currentIndex === 0}
                        >
                            <ArrowLeft size={18} /> Previous
                        </button>

                        {currentIndex < questions.length - 1 ? (
                            <button
                                className="nav-btn next"
                                onClick={() => moveToQuestion(currentIndex + 1)}
                            >
                                Next <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button
                                className="btn btn-primary submit-btn"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? 'Submitting...' : 'Submit Quiz'}
                            </button>
                        )}
                    </div>

                    {/* Question Dots */}
                    <div className="question-dots">
                        {questions.map((q, idx) => (
                            <button
                                key={q._id}
                                className={`dot ${idx === currentIndex ? 'active' : ''} ${answers[q._id] !== undefined ? 'answered' : ''}`}
                                onClick={() => moveToQuestion(idx)}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Render Results Screen
    if (phase === 'results' && results) {
        const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];

        const pieData = results.categoryScores.map(cs => ({
            name: cs.category,
            value: cs.correct,
            total: cs.total
        }));

        const barData = results.categoryScores.map(cs => ({
            category: cs.category,
            percentage: cs.percentage
        }));

        return (
            <div className="assessment-container">
                <div className="results-wrapper">
                    {/* Score Summary */}
                    <div className="score-card glass-card">
                        <Trophy className="trophy-icon" />
                        <h1>Assessment Complete!</h1>

                        <div className="score-circle">
                            <svg viewBox="0 0 100 100">
                                <circle
                                    cx="50" cy="50" r="45"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeWidth="8"
                                />
                                <circle
                                    cx="50" cy="50" r="45"
                                    fill="none"
                                    stroke="url(#scoreGradient)"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={`${results.percentage * 2.83} 283`}
                                    transform="rotate(-90 50 50)"
                                />
                                <defs>
                                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#ec4899" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="score-text">
                                <span className="score-percent">{results.percentage}%</span>
                                <span className="score-label">{results.score}/{results.maxScore} pts</span>
                            </div>
                        </div>

                        <div className="stats-row">
                            <div className="stat-item">
                                <span className="stat-value">{results.totalQuestions}</span>
                                <span className="stat-label">Questions</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{formatTime(results.totalTimeTaken)}</span>
                                <span className="stat-label">Time Taken</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{results.difficulty}</span>
                                <span className="stat-label">Difficulty</span>
                            </div>
                        </div>
                    </div>

                    {/* Category Breakdown */}
                    <div className="charts-grid">
                        <div className="chart-card glass-card">
                            <h3>Category Performance</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={barData}>
                                    <XAxis dataKey="category" stroke="#94a3b8" fontSize={12} />
                                    <YAxis stroke="#94a3b8" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(30, 41, 59, 0.9)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                    />
                                    <Bar dataKey="percentage" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="#ec4899" />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="chart-card glass-card">
                            <h3>Score Distribution</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(30, 41, 59, 0.9)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                        formatter={(value, name, props) => [`${value}/${props.payload.total}`, name]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="pie-legend">
                                {pieData.map((entry, index) => (
                                    <div key={entry.name} className="legend-item">
                                        <span className="legend-color" style={{ background: COLORS[index % COLORS.length] }}></span>
                                        <span>{entry.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Skill Gap Analysis */}
                    <div className="skill-analysis glass-card">
                        <h3>Skill Gap Analysis</h3>
                        <div className="skills-grid">
                            <div className="skill-section strong">
                                <h4><CheckCircle size={18} /> Strong Topics</h4>
                                {results.skillGapAnalysis.strongTopics.length > 0 ? (
                                    <ul>
                                        {results.skillGapAnalysis.strongTopics.map(topic => (
                                            <li key={topic}>{topic}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="no-topics">Keep practicing to identify strong areas!</p>
                                )}
                            </div>
                            <div className="skill-section weak">
                                <h4><XCircle size={18} /> Areas to Improve</h4>
                                {results.skillGapAnalysis.weakTopics.length > 0 ? (
                                    <ul>
                                        {results.skillGapAnalysis.weakTopics.map(topic => (
                                            <li key={topic}>{topic}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="no-topics">Great job! No weak areas detected.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="results-actions">
                        <button className="btn btn-primary" onClick={restartQuiz}>
                            <RefreshCw size={18} /> Take Another Assessment
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="assessment-container">
            <div className="glass-card">
                <p>Loading...</p>
            </div>
        </div>
    );
};

export default Assessment;
