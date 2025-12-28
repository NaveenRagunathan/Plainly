import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Onboarding() {
    const [step, setStep] = useState(1);
    const [creatorType, setCreatorType] = useState('');
    const [listSize, setListSize] = useState('');
    const [loading, setLoading] = useState(false);
    const { updateUser } = useAuth();
    const navigate = useNavigate();

    const creatorTypes = [
        { id: 'newsletter', label: 'Newsletter', icon: '📧' },
        { id: 'course', label: 'Course', icon: '📚' },
        { id: 'community', label: 'Community', icon: '👥' },
        { id: 'products', label: 'Products', icon: '🛍️' }
    ];

    const listSizes = [
        { id: '0', label: "I'm just starting" },
        { id: '1-500', label: '1 - 500' },
        { id: '500-2000', label: '500 - 2,000' },
        { id: '2000+', label: '2,000+' }
    ];

    const handleNext = () => {
        if (step === 1 && creatorType) {
            setStep(2);
        }
    };

    const handleComplete = async () => {
        if (!listSize) return;

        setLoading(true);
        try {
            const res = await authApi.updateOnboarding({ creatorType, listSize });
            updateUser(res.data.data.user);
            toast.success("You're all set!");
            navigate('/dashboard');
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <div className="auth-logo">✉️ Plainly</div>
                    <p>Let's personalize your experience</p>
                </div>

                {step === 1 && (
                    <div className="onboarding-step">
                        <h2>What do you create?</h2>
                        <div className="option-grid">
                            {creatorTypes.map((type) => (
                                <button
                                    key={type.id}
                                    className={`option-btn ${creatorType === type.id ? 'selected' : ''}`}
                                    onClick={() => setCreatorType(type.id)}
                                >
                                    <span>{type.icon}</span>
                                    {type.label}
                                </button>
                            ))}
                        </div>
                        <button
                            className="btn btn-primary btn-full mt-6"
                            onClick={handleNext}
                            disabled={!creatorType}
                        >
                            Continue
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="onboarding-step">
                        <h2>How big is your email list?</h2>
                        <div className="option-grid">
                            {listSizes.map((size) => (
                                <button
                                    key={size.id}
                                    className={`option-btn ${listSize === size.id ? 'selected' : ''}`}
                                    onClick={() => setListSize(size.id)}
                                >
                                    {size.label}
                                </button>
                            ))}
                        </div>
                        <button
                            className="btn btn-primary btn-full mt-6"
                            onClick={handleComplete}
                            disabled={!listSize || loading}
                        >
                            {loading ? <span className="spinner" /> : 'Get Started'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
