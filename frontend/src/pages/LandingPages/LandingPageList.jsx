import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { landingPageApi } from '../../services/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import './LandingPages.css';

export default function LandingPageList() {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('smart-pages');

    useEffect(() => {
        loadPages();
    }, []);

    const loadPages = async () => {
        try {
            const res = await landingPageApi.list();
            setPages(res.data.data.landingPages);
        } catch (error) {
            toast.error('Failed to load pages');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this landing page?')) return;
        try {
            await landingPageApi.delete(id);
            toast.success('Page deleted');
            loadPages();
        } catch (error) {
            toast.error('Failed to delete');
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
        <div className="landing-pages">
            {/* Tabs */}
            <div className="tabs-row">
                <button
                    className={`tab-btn ${tab === 'smart-pages' ? 'active' : ''}`}
                    onClick={() => setTab('smart-pages')}
                >
                    Smart Pages
                </button>
                <button
                    className={`tab-btn ${tab === 'forms' ? 'active' : ''}`}
                    onClick={() => setTab('forms')}
                >
                    Forms
                </button>
                <button
                    className={`tab-btn ${tab === 'referrals' ? 'active' : ''}`}
                    onClick={() => setTab('referrals')}
                >
                    Referrals Campaign
                </button>
            </div>

            <div className="page-header flex-between">
                <div>
                    <h1 className="page-title">
                        Smart Pages
                        <span className="count-badge">{pages.length}</span>
                    </h1>
                    <p className="text-sm text-gray mt-2">
                        <a href="#" className="text-primary">Upgrade</a> to create more Smart Pages!
                    </p>
                </div>
                <Link to="/growth/new" className="btn btn-outline">
                    Create Smart Page ▾
                </Link>
            </div>

            {pages.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📄</div>
                    <h3 className="empty-state-title">No landing pages yet</h3>
                    <p className="empty-state-text">Create your first page to start collecting subscribers</p>
                    <Link to="/growth/new" className="btn btn-primary">
                        Create Landing Page
                    </Link>
                </div>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>List</th>
                            <th>Created</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {pages.map((page) => (
                            <tr key={page._id}>
                                <td>
                                    <Link to={`/growth/${page._id}`} className="page-title-link">
                                        {page.headline}
                                    </Link>
                                    <div className="text-sm text-gray">{page.template}</div>
                                </td>
                                <td className="text-sm">
                                    {page.assignTag || 'No tag'}
                                </td>
                                <td className="text-sm text-gray">
                                    {dayjs(page.createdAt).format('MMM DD, YYYY h:mm a')}
                                </td>
                                <td>
                                    <div className="flex gap-2">
                                        <a
                                            href={`/p/${page.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-secondary btn-sm"
                                        >
                                            Promote ▾
                                        </a>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleDelete(page._id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
