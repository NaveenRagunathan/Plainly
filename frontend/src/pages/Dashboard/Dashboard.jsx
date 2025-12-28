import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler
} from 'chart.js';
import { analyticsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler
);

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [growth, setGrowth] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [overviewRes, growthRes] = await Promise.all([
                analyticsApi.overview(),
                analyticsApi.growth(30)
            ]);
            setStats(overviewRes.data.data);
            setGrowth(growthRes.data.data.growth);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const chartData = {
        labels: growth.map(g => {
            const date = new Date(g.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        datasets: [{
            label: 'Total Subscribers',
            data: growth.map(g => g.total),
            borderColor: '#E74C3C',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#E74C3C'
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#333',
                padding: 12,
                cornerRadius: 8
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#9E9E9E', font: { size: 11 } }
            },
            y: {
                grid: { color: '#F5F5F5' },
                ticks: { color: '#9E9E9E', font: { size: 11 } },
                beginAtZero: true
            }
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '50vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="engaged-count">
                    Engaged Subscribers: <strong>{stats?.subscribers?.active || 0}</strong>
                </p>
            </div>

            {/* Stats Row */}
            <div className="stats-section">
                <div className="flex-between mb-4">
                    <h2 className="section-title">Your email stats</h2>
                    <select className="form-select" style={{ width: 'auto' }}>
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                    </select>
                </div>

                <div className="grid grid-cols-4">
                    <div className="stat-card stat-card-primary">
                        <div className="stat-card-label">Total contacts</div>
                        <div className="stat-card-value">{stats?.subscribers?.total || 0}</div>
                        <div className="stat-card-change positive">
                            +{stats?.subscribers?.newLast7Days || 0} from last 7 days
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-label">New contacts</div>
                        <div className="stat-card-value">{stats?.subscribers?.newLast7Days || 0}</div>
                        <div className="stat-card-change neutral">from last 7 days</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-label">Open rate</div>
                        <div className="stat-card-value">{stats?.emails?.avgOpenRate || 0}%</div>
                        <div className="stat-card-change neutral">no change from last 7 days</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-label">Click rate</div>
                        <div className="stat-card-value">{stats?.emails?.avgClickRate || 0}%</div>
                        <div className="stat-card-change neutral">no change from last 7 days</div>
                    </div>
                </div>
            </div>

            {/* Growth Chart */}
            <div className="chart-section">
                <h2 className="section-title">Total contacts</h2>
                <div className="chart-container">
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h2 className="section-title">Quick actions</h2>
                <div className="grid grid-cols-3">
                    <Link to="/emails/new" className="action-card">
                        <span className="action-icon">✉️</span>
                        <span className="action-label">Send a broadcast</span>
                    </Link>
                    <Link to="/automations/new" className="action-card">
                        <span className="action-icon">⚡</span>
                        <span className="action-label">Create automation</span>
                    </Link>
                    <Link to="/growth/new" className="action-card">
                        <span className="action-icon">📄</span>
                        <span className="action-label">Create landing page</span>
                    </Link>
                </div>
            </div>

            {/* Plan Usage */}
            <div className="plan-section">
                <h2 className="section-title">Your plan</h2>
                <div className="plan-card">
                    <div className="plan-info">
                        <span className="plan-badge">{stats?.plan?.type}</span>
                        <span className="plan-usage">
                            {stats?.plan?.subscriberUsage} / {stats?.plan?.subscriberLimit} subscribers
                        </span>
                    </div>
                    <div className="plan-bar">
                        <div
                            className="plan-bar-fill"
                            style={{
                                width: `${Math.min((stats?.plan?.subscriberUsage / stats?.plan?.subscriberLimit) * 100, 100)}%`
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
