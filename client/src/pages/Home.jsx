import React from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Brain, Target, ShieldCheck, Zap, BarChart3, ChevronRight } from 'lucide-react';
import '../styles/Home.css';

const Home = () => {
    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-bg-accent"></div>
                <div className="hero-content">
                    <h1 className="hero-title">AI-Powered Personalized <br /> Learning Path Generator</h1>
                    <p className="hero-subtitle">
                        Experience a new era of education. Our advanced AI engine analyzes your unique potential to build the most efficient path to mastery.
                    </p>
                    <div className="hero-actions">
                        <Link to="/register" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2.5rem', fontSize: '1.2rem', textDecoration: 'none' }}>
                            Start Free Assessment <ChevronRight size={20} />
                        </Link>
                        <Link to="/login" className="btn" style={{ padding: '1rem 2.5rem', fontSize: '1.2rem', textDecoration: 'none', border: '1px solid var(--glass-border)', background: 'var(--glass)' }}>
                            View Demo
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <div className="stats-section">
                <div className="stat-item">
                    <span className="stat-number">20+</span>
                    <span className="stat-label">AI Courses</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">95%</span>
                    <span className="stat-label">Completion Rate</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">10k+</span>
                    <span className="stat-label">Active Learners</span>
                </div>
            </div>

            {/* Features Section */}
            <section className="features-section">
                <span className="section-label">Features</span>
                <h2 className="section-title">A Smarter Way to Learn</h2>
                <div className="features-grid">
                    <div className="feature-card glass-card">
                        <div className="feature-icon"><Brain size={28} /></div>
                        <h3>AI Diagnostics</h3>
                        <p>Our intelligent assessment identifies exactly where your skill gaps are and what you need to focus on.</p>
                    </div>
                    <div className="feature-card glass-card">
                        <div className="feature-icon"><Target size={28} /></div>
                        <h3>Dynamic Paths</h3>
                        <p>Learning paths that adapt in real-time. If you struggle with a topic, we suggest supplementary content immediately.</p>
                    </div>
                    <div className="feature-card glass-card">
                        <div className="feature-icon"><BarChart3 size={28} /></div>
                        <h3>Deep Analytics</h3>
                        <p>Track your progress with granular data. Understand your learning speed and retention like never before.</p>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works">
                <span className="section-label">Process</span>
                <h2 className="section-title" style={{ color: 'white' }}>How It Works</h2>
                <div className="steps-container">
                    <div className="step-item">
                        <div className="step-number">1</div>
                        <h3>Take Assessment</h3>
                        <p>Complete a quick quiz to help AI understand your baseline.</p>
                    </div>
                    <div className="step-item">
                        <div className="step-number">2</div>
                        <h3>Get Your Path</h3>
                        <p>AI generates a custom curriculum tailored to your goals.</p>
                    </div>
                    <div className="step-item">
                        <div className="step-number">3</div>
                        <h3>Start Learning</h3>
                        <p>Follow your path and get certified upon completion.</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ textAlign: 'center', padding: '100px 20px', marginBottom: '60px' }}>
                <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto', border: '1px solid var(--primary)' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'white' }}>Ready to unlock your potential?</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.2rem' }}>
                        Join thousands of learners who are already using AI to master new skills faster.
                    </p>
                    <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.2rem', textDecoration: 'none' }}>
                        Join Now for Free
                    </Link>
                </div>
            </section>

            {/* Footer / Admin Link */}
            <footer style={{
                padding: '40px 20px',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                textAlign: 'center',
                background: 'rgba(0,0,0,0.2)'
            }}>
                <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    &copy; 2026 EduAI. All rights reserved.
                </div>
                <Link to="/admin/login" className="btn" style={{
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s',
                    padding: '0.5rem 1.5rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.02)'
                }}
                    onMouseOver={(e) => {
                        e.target.style.color = 'var(--primary)';
                        e.target.style.borderColor = 'var(--primary)';
                        e.target.style.background = 'rgba(255,255,255,0.05)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.color = 'var(--text-muted)';
                        e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                        e.target.style.background = 'rgba(255,255,255,0.02)';
                    }}
                >
                    <ShieldCheck size={16} /> Admin Portal
                </Link>
            </footer>
        </div>
    );
};

export default Home;
