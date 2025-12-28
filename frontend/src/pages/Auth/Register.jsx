import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        plan: 'starter'
    });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await register(formData);
            toast.success('Account created!');
            navigate('/onboarding');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <div className="auth-logo">✉️ Plainly</div>
                    <h1>Create your account</h1>
                    <p>Start sending emails in minutes</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Your name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="At least 6 characters"
                            minLength={6}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Choose your plan</label>
                        <div className="plan-options">
                            <label className={`plan-option ${formData.plan === 'starter' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="plan"
                                    value="starter"
                                    checked={formData.plan === 'starter'}
                                    onChange={handleChange}
                                />
                                <div className="plan-content">
                                    <span className="plan-name">Starter</span>
                                    <span className="plan-price">$19/mo</span>
                                    <span className="plan-desc">Up to 5,000 subscribers</span>
                                </div>
                            </label>

                            <label className={`plan-option ${formData.plan === 'growth' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="plan"
                                    value="growth"
                                    checked={formData.plan === 'growth'}
                                    onChange={handleChange}
                                />
                                <div className="plan-content">
                                    <span className="plan-name">Growth</span>
                                    <span className="plan-price">$39/mo</span>
                                    <span className="plan-desc">Up to 25,000 subscribers</span>
                                </div>
                            </label>

                            <label className={`plan-option ${formData.plan === 'lifetime' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="plan"
                                    value="lifetime"
                                    checked={formData.plan === 'lifetime'}
                                    onChange={handleChange}
                                />
                                <div className="plan-content">
                                    <span className="plan-name">Lifetime</span>
                                    <span className="plan-price">$49 once</span>
                                    <span className="plan-desc">Up to 2,000 subscribers</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? <span className="spinner" /> : 'Create account'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
