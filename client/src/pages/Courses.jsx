import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, Clock, Users, Star, Search, Filter } from 'lucide-react';
import '../styles/Courses.css';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: 'all',
        difficulty: 'all',
        search: ''
    });

    useEffect(() => {
        fetchCourses();
        fetchCategories();
    }, [filters.category, filters.difficulty]);

    const fetchCourses = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.category !== 'all') params.append('category', filters.category);
            if (filters.difficulty !== 'all') params.append('difficulty', filters.difficulty);
            if (filters.search) params.append('search', filters.search);

            const { data } = await axios.get(`http://localhost:5001/api/courses?${params.toString()}`);
            setCourses(data.courses);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await axios.get('http://localhost:5001/api/courses/categories');
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchCourses();
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Beginner': return 'beginner';
            case 'Intermediate': return 'intermediate';
            case 'Advanced': return 'advanced';
            default: return '';
        }
    };

    return (
        <div className="courses-container">
            <div className="courses-header">
                <h1>Explore Courses</h1>
                <p>Discover personalized learning paths tailored to your goals</p>
            </div>

            {/* Filters */}
            <div className="filters-section glass-card">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input-wrapper">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Search</button>
                </form>

                <div className="filter-row">
                    <div className="filter-group">
                        <Filter size={18} />
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.category} value={cat.category}>
                                    {cat.category} ({cat.count})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <select
                            value={filters.difficulty}
                            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                        >
                            <option value="all">All Levels</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Course Grid */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading courses...</p>
                </div>
            ) : courses.length === 0 ? (
                <div className="empty-state glass-card">
                    <BookOpen size={48} />
                    <h3>No courses found</h3>
                    <p>Try adjusting your filters or search terms</p>
                </div>
            ) : (
                <div className="courses-grid">
                    {courses.map(course => (
                        <Link to={`/courses/${course._id}`} key={course._id} className="course-card glass-card">
                            <div className="course-thumbnail">
                                {course.thumbnail ? (
                                    <img src={course.thumbnail} alt={course.title} />
                                ) : (
                                    <div className="placeholder-thumbnail">
                                        <BookOpen size={48} />
                                    </div>
                                )}
                                <span className={`difficulty-tag ${getDifficultyColor(course.difficulty)}`}>
                                    {course.difficulty}
                                </span>
                            </div>

                            <div className="course-content">
                                <span className="course-category">{course.category}</span>
                                <h3 className="course-title">{course.title}</h3>
                                <p className="course-description">{course.description}</p>

                                <div className="course-meta">
                                    <span><BookOpen size={16} /> {course.totalLessons} lessons</span>
                                    <span><Clock size={16} /> {course.duration || 'Self-paced'}</span>
                                </div>

                                <div className="course-footer">
                                    <div className="course-stats">
                                        <span><Users size={14} /> {course.enrolledCount}</span>
                                        <span><Star size={14} /> {course.rating.toFixed(1)}</span>
                                    </div>
                                    <span className="view-course">View Course →</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Courses;
