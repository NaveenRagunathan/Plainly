import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { subscriberApi } from '../../services/api';
import toast from 'react-hot-toast';
import './Subscribers.css';

export default function SubscriberList() {
    const [subscribers, setSubscribers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState('lists');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newSubscriber, setNewSubscriber] = useState({ email: '', firstName: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [subsRes, statsRes] = await Promise.all([
                subscriberApi.list({ limit: 100 }),
                subscriberApi.getStats()
            ]);
            setSubscribers(subsRes.data.data.subscribers);
            setStats(statsRes.data.data);
        } catch (error) {
            toast.error('Failed to load subscribers');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubscriber = async (e) => {
        e.preventDefault();
        try {
            await subscriberApi.create(newSubscriber);
            toast.success('Subscriber added!');
            setShowAddModal(false);
            setNewSubscriber({ email: '', firstName: '' });
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add subscriber');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this subscriber?')) return;
        try {
            await subscriberApi.delete(id);
            toast.success('Subscriber deleted');
            loadData();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleExport = async () => {
        try {
            const res = await subscriberApi.export();
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = 'subscribers.csv';
            link.click();
            toast.success('Export downloaded!');
        } catch (error) {
            toast.error('Export failed');
        }
    };

    const filteredSubscribers = subscribers.filter(s =>
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.firstName?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '50vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="subscribers-page">
            {/* Tabs */}
            <div className="tabs-row">
                <button
                    className={`tab-btn ${tab === 'lists' ? 'active' : ''}`}
                    onClick={() => setTab('lists')}
                >
                    Lists
                </button>
                <button
                    className={`tab-btn ${tab === 'contacts' ? 'active' : ''}`}
                    onClick={() => setTab('contacts')}
                >
                    Contacts
                </button>
            </div>

            {/* Header */}
            <div className="page-header flex-between">
                <div>
                    <h1 className="page-title">
                        {tab === 'lists' ? 'Lists' : 'Contacts'}
                        <span className="count-badge">{stats?.total || 0}</span>
                    </h1>
                </div>
                <div className="flex gap-4">
                    <input
                        type="text"
                        className="form-input search-input"
                        placeholder="Search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button className="btn btn-secondary" onClick={handleExport}>
                        Export
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        Add Contact
                    </button>
                </div>
            </div>

            {/* Subscriber Table */}
            {filteredSubscribers.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <h3 className="empty-state-title">No subscribers yet</h3>
                    <p className="empty-state-text">Add your first subscriber to get started</p>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        Add Subscriber
                    </button>
                </div>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Name</th>
                            <th>Status</th>
                            <th>Tags</th>
                            <th>Joined</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSubscribers.map((sub) => (
                            <tr key={sub._id}>
                                <td>
                                    <a href={`mailto:${sub.email}`} className="subscriber-email">
                                        {sub.email}
                                    </a>
                                </td>
                                <td>{sub.firstName || '—'}</td>
                                <td>
                                    <span className={`badge badge-${sub.status === 'active' ? 'success' : 'gray'}`}>
                                        {sub.status}
                                    </span>
                                </td>
                                <td>
                                    {sub.tags.length > 0 ? (
                                        sub.tags.map(tag => (
                                            <span key={tag} className="tag">{tag}</span>
                                        ))
                                    ) : '—'}
                                </td>
                                <td className="text-sm text-gray">
                                    {new Date(sub.createdAt).toLocaleDateString()}
                                </td>
                                <td>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => handleDelete(sub._id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Add Subscriber Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Add Subscriber</h2>
                        <form onSubmit={handleAddSubscriber}>
                            <div className="form-group">
                                <label className="form-label">Email *</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={newSubscriber.email}
                                    onChange={(e) => setNewSubscriber({ ...newSubscriber, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">First Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newSubscriber.firstName}
                                    onChange={(e) => setNewSubscriber({ ...newSubscriber, firstName: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Add Subscriber
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
