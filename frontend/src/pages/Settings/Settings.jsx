import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { paymentApi, authApi } from '../../services/api';
import toast from 'react-hot-toast';
import './Settings.css';

export default function Settings() {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [subscription, setSubscription] = useState(null);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        businessName: user?.businessName || ''
    });

    useEffect(() => {
        loadSubscription();
    }, []);

    const loadSubscription = async () => {
        try {
            const res = await paymentApi.getSubscription();
            setSubscription(res.data.data);
        } catch (error) {
            console.error('Failed to load subscription:', error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authApi.updateProfile(formData);
            updateUser(res.data.data.user);
            toast.success('Profile updated!');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = async (planType) => {
        setLoading(true);
        try {
            const res = await paymentApi.createCheckout(planType);
            window.location.href = res.data.data.url;
        } catch (error) {
            toast.error('Failed to start checkout');
            setLoading(false);
        }
    };

    const handleManageBilling = async () => {
        setLoading(true);
        try {
            const res = await paymentApi.getPortal();
            window.location.href = res.data.data.url;
        } catch (error) {
            toast.error('Failed to open billing portal');
            setLoading(false);
        }
    };

    const plans = [
        {
            id: 'starter',
            name: 'Starter',
            price: '$19',
            interval: '/month',
            subscribers: '5,000',
            features: ['5,000 subscribers', '25,000 emails/day', 'Email sequences', 'Landing pages']
        },
        {
            id: 'growth',
            name: 'Growth',
            price: '$39',
            interval: '/month',
            subscribers: '25,000',
            features: ['25,000 subscribers', '125,000 emails/day', 'Everything in Starter', 'Priority support']
        },
        {
            id: 'lifetime',
            name: 'Lifetime',
            price: '$49',
            interval: ' once',
            subscribers: '2,000',
            features: ['2,000 subscribers', '10,000 emails/day', 'One-time payment', 'Lifetime access']
        }
    ];

    return (
        <div className="settings-page">
            <div className="page-header">
                <h1 className="page-title">Settings</h1>
            </div>

            {/* Profile Section */}
            <div className="settings-section">
                <h2>Profile</h2>
                <form onSubmit={handleUpdateProfile} className="profile-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Business Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.businessName}
                                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={user?.email}
                            disabled
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        Save Changes
                    </button>
                </form>
            </div>

            {/* Current Plan Section */}
            <div className="settings-section">
                <h2>Your Plan</h2>
                <div className="current-plan">
                    <div className="plan-status">
                        <span className="plan-name">{user?.plan?.type || 'Starter'}</span>
                        {subscription?.status === 'active' && (
                            <span className="badge badge-success">Active</span>
                        )}
                    </div>
                    <div className="plan-details">
                        <p>
                            <strong>{user?.plan?.subscriberLimit?.toLocaleString() || '5,000'}</strong> subscriber limit
                        </p>
                        <p>
                            <strong>{user?.plan?.dailySendLimit?.toLocaleString() || '25,000'}</strong> emails per day
                        </p>
                        {subscription?.currentPeriodEnd && (
                            <p className="text-sm text-gray">
                                Next billing: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                    {user?.stripeCustomerId && (
                        <button className="btn btn-secondary" onClick={handleManageBilling} disabled={loading}>
                            Manage Billing
                        </button>
                    )}
                </div>
            </div>

            {/* Upgrade Section */}
            <div className="settings-section">
                <h2>Upgrade Your Plan</h2>
                <div className="plans-grid">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`plan-card ${user?.plan?.type === plan.id ? 'current' : ''}`}
                        >
                            <div className="plan-header">
                                <h3>{plan.name}</h3>
                                <div className="plan-price">
                                    <span className="price">{plan.price}</span>
                                    <span className="interval">{plan.interval}</span>
                                </div>
                            </div>
                            <ul className="plan-features">
                                {plan.features.map((feature, i) => (
                                    <li key={i}>✓ {feature}</li>
                                ))}
                            </ul>
                            <button
                                className={`btn ${user?.plan?.type === plan.id ? 'btn-secondary' : 'btn-primary'}`}
                                onClick={() => handleUpgrade(plan.id)}
                                disabled={loading || user?.plan?.type === plan.id}
                            >
                                {user?.plan?.type === plan.id ? 'Current Plan' : 'Upgrade'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
