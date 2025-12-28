import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { broadcastApi } from '../../services/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import './Broadcasts.css';

export default function BroadcastList() {
    const [broadcasts, setBroadcasts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBroadcasts();
    }, []);

    const loadBroadcasts = async () => {
        try {
            const res = await broadcastApi.list();
            setBroadcasts(res.data.data.broadcasts);
        } catch (error) {
            toast.error('Failed to load emails');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this email?')) return;
        try {
            await broadcastApi.delete(id);
            toast.success('Email deleted');
            loadBroadcasts();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleSend = async (id) => {
        if (!confirm('Send this email now?')) return;
        try {
            const res = await broadcastApi.send(id);
            toast.success(`Sent to ${res.data.data.recipientCount} subscribers!`);
            loadBroadcasts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            draft: 'badge-gray',
            scheduled: 'badge-warning',
            sending: 'badge-primary',
            sent: 'badge-success'
        };
        return badges[status] || 'badge-gray';
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '50vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="broadcasts-page">
            <div className="page-header flex-between">
                <h1 className="page-title">Emails</h1>
                <Link to="/emails/new" className="btn btn-primary">
                    New Email
                </Link>
            </div>

            {broadcasts.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">✉️</div>
                    <h3 className="empty-state-title">No emails yet</h3>
                    <p className="empty-state-text">Send your first broadcast to your subscribers</p>
                    <Link to="/emails/new" className="btn btn-primary">
                        Create Email
                    </Link>
                </div>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Status</th>
                            <th>Stats</th>
                            <th>Date</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {broadcasts.map((broadcast) => (
                            <tr key={broadcast._id}>
                                <td>
                                    <Link to={`/emails/${broadcast._id}`} className="broadcast-subject">
                                        {broadcast.subject}
                                    </Link>
                                </td>
                                <td>
                                    <span className={`badge ${getStatusBadge(broadcast.status)}`}>
                                        {broadcast.status}
                                    </span>
                                </td>
                                <td className="text-sm">
                                    {broadcast.status === 'sent' ? (
                                        <span>
                                            {broadcast.stats.sent} sent • {broadcast.stats.opened} opens • {broadcast.stats.clicked} clicks
                                        </span>
                                    ) : (
                                        <span className="text-gray">—</span>
                                    )}
                                </td>
                                <td className="text-sm text-gray">
                                    {broadcast.sentAt
                                        ? dayjs(broadcast.sentAt).format('MMM D, YYYY h:mm A')
                                        : broadcast.scheduledAt
                                            ? `Scheduled: ${dayjs(broadcast.scheduledAt).format('MMM D, YYYY h:mm A')}`
                                            : 'Draft'
                                    }
                                </td>
                                <td>
                                    <div className="flex gap-2">
                                        {broadcast.status === 'draft' && (
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleSend(broadcast._id)}
                                            >
                                                Send
                                            </button>
                                        )}
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleDelete(broadcast._id)}
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
