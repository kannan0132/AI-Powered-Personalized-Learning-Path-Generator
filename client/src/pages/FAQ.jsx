import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronDown, ChevronUp, Search, Book, Award, Settings, Zap } from 'lucide-react';
import '../styles/FAQ.css';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const [search, setSearch] = useState('');

    const faqCategories = [
        {
            title: 'Getting Started',
            icon: Book,
            questions: [
                { q: 'How do I create an account?', a: 'Click the "Register" button on the homepage, fill in your details, and set up your learning preferences. You\'ll be guided through a skill assessment to personalize your learning path.' },
                { q: 'How does the skill assessment work?', a: 'The assessment consists of multiple-choice questions across various topics. Based on your performance, we identify your strengths and areas for improvement to create a personalized learning path.' },
                { q: 'Can I retake the skill assessment?', a: 'Yes! You can take assessments multiple times. Your results help us continuously refine your learning recommendations.' }
            ]
        },
        {
            title: 'Courses & Learning',
            icon: Zap,
            questions: [
                { q: 'How are courses organized?', a: 'Courses are categorized by topic (Frontend, Backend, etc.) and difficulty level (Beginner, Intermediate, Advanced). Each course contains multiple lessons with video content, reading materials, and practice exercises.' },
                { q: 'What is a Learning Path?', a: 'A Learning Path is a personalized sequence of courses and lessons tailored to your goals and skill level. The AI recommendation engine suggests the optimal order to maximize your learning efficiency.' },
                { q: 'Can I skip lessons or courses?', a: 'Yes, you have full flexibility. However, we recommend following the suggested path for the best learning experience, as prerequisites are taken into account.' }
            ]
        },
        {
            title: 'Certificates',
            icon: Award,
            questions: [
                { q: 'How do I earn a certificate?', a: 'Complete at least 80% of a course\'s lessons, then pass the final exam with a score of 70% or higher. You\'ll receive a digital certificate you can download and share.' },
                { q: 'Are the certificates verified?', a: 'Yes! Each certificate has a unique verification code that employers or institutions can use to verify its authenticity on our platform.' },
                { q: 'How many attempts do I get for the final exam?', a: 'You typically get 3 attempts per exam. If you don\'t pass, you can review the material and try again.' }
            ]
        },
        {
            title: 'Account & Settings',
            icon: Settings,
            questions: [
                { q: 'How do I update my profile?', a: 'Navigate to the Profile Setup page from your dashboard. You can update your learning goals, preferred topics, and skill level at any time.' },
                { q: 'Can I change my email address?', a: 'Currently, email changes require contacting support. Use the feedback form to submit a request.' },
                { q: 'How is my progress saved?', a: 'All your progress is automatically saved to your account. You can continue learning from any device by logging in.' }
            ]
        }
    ];

    const filteredCategories = faqCategories.map(cat => ({
        ...cat,
        questions: cat.questions.filter(
            item => item.q.toLowerCase().includes(search.toLowerCase()) ||
                item.a.toLowerCase().includes(search.toLowerCase())
        )
    })).filter(cat => cat.questions.length > 0);

    const toggleQuestion = (catIdx, qIdx) => {
        const key = `${catIdx}-${qIdx}`;
        setOpenIndex(openIndex === key ? null : key);
    };

    return (
        <div className="faq-page">
            <div className="page-header">
                <HelpCircle size={32} />
                <h1>Frequently Asked Questions</h1>
                <p>Find answers to common questions about our platform</p>
            </div>

            <div className="search-container">
                <Search size={20} />
                <input
                    type="text"
                    placeholder="Search for answers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="faq-content">
                {filteredCategories.map((cat, catIdx) => (
                    <div key={catIdx} className="faq-category glass-card">
                        <div className="category-header">
                            <cat.icon size={24} />
                            <h2>{cat.title}</h2>
                        </div>
                        <div className="questions-list">
                            {cat.questions.map((item, qIdx) => (
                                <div
                                    key={qIdx}
                                    className={`faq-item ${openIndex === `${catIdx}-${qIdx}` ? 'open' : ''}`}
                                >
                                    <button
                                        className="faq-question"
                                        onClick={() => toggleQuestion(catIdx, qIdx)}
                                    >
                                        <span>{item.q}</span>
                                        {openIndex === `${catIdx}-${qIdx}` ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </button>
                                    {openIndex === `${catIdx}-${qIdx}` && (
                                        <div className="faq-answer">
                                            <p>{item.a}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {filteredCategories.length === 0 && (
                    <div className="no-results glass-card">
                        <p>No matching questions found.</p>
                        <p>Try a different search term or <Link to="/feedback">contact support</Link>.</p>
                    </div>
                )}
            </div>

            <div className="faq-footer glass-card">
                <h3>Still have questions?</h3>
                <p>Can't find what you're looking for? We're here to help!</p>
                <Link to="/feedback" className="btn-primary">Contact Support</Link>
            </div>
        </div>
    );
};

export default FAQ;
