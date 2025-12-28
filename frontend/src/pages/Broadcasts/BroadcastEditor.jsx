import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { broadcastApi, subscriberApi } from '../../services/api';
import toast from 'react-hot-toast';
import './Broadcasts.css';

export default function BroadcastEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = !id;

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [tags, setTags] = useState([]);
    const [previewCount, setPreviewCount] = useState(null);

    const [broadcast, setBroadcast] = useState({
        subject: '',
        body: '',
        recipients: {
            tags: [],
            excludeInSequence: false
        },
        abTest: {
            enabled: false,
            testPercent: 20,
            winningMetric: 'opens',
            waitHours: 4
        },
        subjectB: ''
    });

    useEffect(() => {
        loadTags();
        if (id) loadBroadcast();
    }, [id]);

    const loadTags = async () => {
        try {
            const res = await subscriberApi.getStats();
            setTags(res.data.data.tags || []);
        } catch (error) {
            console.error('Failed to load tags');
        }
    };

    const loadBroadcast = async () => {
        try {
            const res = await broadcastApi.get(id);
            setBroadcast(res.data.data.broadcast);
        } catch (error) {
            toast.error('Failed to load email');
            navigate('/emails');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!broadcast.subject.trim() || !broadcast.body.trim()) {
            toast.error('Please fill in subject and body');
            return;
        }

        setSaving(true);
        try {
            if (isNew) {
                const res = await broadcastApi.create(broadcast);
                toast.success('Email saved as draft');
                navigate(`/emails/${res.data.data.broadcast._id}`);
            } else {
                await broadcastApi.update(id, broadcast);
                toast.success('Saved!');
            }
        } catch (error) {
            toast.error('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleSend = async () => {
        // Validate first
        if (!broadcast.subject.trim() || !broadcast.body.trim()) {
            toast.error('Please fill in subject and body before sending');
            return;
        }

        // Simple confirmation using browser confirm (wrapped in try-catch)
        let confirmed = true;
        try {
            confirmed = window.confirm('Send this email now to all matching subscribers?');
        } catch (e) {
            // If confirm fails, proceed anyway
            console.warn('Confirm dialog failed:', e);
        }

        if (!confirmed) return;

        setSaving(true);
        try {
            let broadcastId = id;

            // If new, create first
            if (isNew) {
                const res = await broadcastApi.create(broadcast);
                broadcastId = res.data.data.broadcast._id;
                toast.success('Email created!');
            } else {
                // Update existing
                await broadcastApi.update(id, broadcast);
            }

            // Now send
            const sendRes = await broadcastApi.send(broadcastId);
            console.log('Send response:', sendRes);
            toast.success(`Email sent to ${sendRes.data.data.recipientCount || 'all'} subscribers!`);
            navigate('/emails');
        } catch (error) {
            console.error('Send error:', error);
            const message = error.response?.data?.message || 'Failed to send email';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handlePreview = async () => {
        try {
            if (!id) {
                // For new broadcasts, show approximate count
                const res = await subscriberApi.getStats();
                setPreviewCount(res.data.data.active);
            } else {
                const res = await broadcastApi.preview(id);
                setPreviewCount(res.data.data.count);
            }
        } catch (error) {
            toast.error('Failed to get preview');
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '50vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    const isSent = broadcast.status === 'sent' || broadcast.status === 'sending';

    return (
        <div className="broadcast-editor">
            <div className="editor-header">
                <button className="btn btn-secondary" onClick={() => navigate('/emails')}>
                    ← Back
                </button>
                <h1>{isNew ? 'New Email' : 'Edit Email'}</h1>
                <div className="flex gap-2">
                    {!isSent && (
                        <>
                            <button className="btn btn-secondary" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Draft'}
                            </button>
                            <button className="btn btn-primary" onClick={handleSend}>
                                Send Now
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="editor-content">
                {/* Email Composer - Like SendFox */}
                <div className="email-composer">
                    <div className="composer-header">
                        <span className="composer-label">New Message</span>
                    </div>

                    <div className="composer-row">
                        <span className="row-label">From Name:</span>
                        <span className="row-value">Your Name</span>
                    </div>

                    <div className="composer-row">
                        <span className="row-label">To:</span>
                        <span className="row-value">
                            {broadcast.recipients.tags?.length > 0
                                ? `Subscribers with tags: ${broadcast.recipients.tags.join(', ')}`
                                : 'All subscribers'
                            }
                            {previewCount !== null && ` (${previewCount} recipients)`}
                        </span>
                        <button className="btn btn-sm" onClick={handlePreview}>Preview</button>
                    </div>

                    <div className="composer-row">
                        <span className="row-label">Subject:</span>
                        <input
                            type="text"
                            className="subject-input"
                            value={broadcast.subject}
                            onChange={(e) => setBroadcast({ ...broadcast, subject: e.target.value })}
                            placeholder="My first email"
                            disabled={isSent}
                        />
                    </div>

                    <div className="composer-body">
                        <textarea
                            className="body-textarea"
                            value={broadcast.body}
                            onChange={(e) => setBroadcast({ ...broadcast, body: e.target.value })}
                            placeholder="Hope you're having a great day.

I'm curious to check in with you, so I want to know...

How's your day going?

That's it. Nothing to sell or buy. Just wanted to hear from you.

Be great,
Your Name"
                            disabled={isSent}
                        />
                    </div>

                    <div className="composer-footer">
                        <button className="btn btn-secondary btn-sm">Code Your Own</button>
                        <button className="btn btn-secondary btn-sm">Email Generator</button>
                        <button className="btn btn-secondary btn-sm">Templates</button>
                        <button className="btn btn-secondary btn-sm">Tags (0)</button>
                        <button className="btn btn-secondary btn-sm">Preview</button>
                        <button className="btn btn-secondary btn-sm">Test</button>
                    </div>
                </div>

                {/* A/B Testing Section */}
                {!isSent && (
                    <div className="ab-section">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={broadcast.abTest?.enabled}
                                onChange={(e) => setBroadcast({
                                    ...broadcast,
                                    abTest: { ...broadcast.abTest, enabled: e.target.checked }
                                })}
                            />
                            Enable A/B Testing (subject lines only)
                        </label>

                        {broadcast.abTest?.enabled && (
                            <div className="ab-options">
                                <div className="form-group">
                                    <label className="form-label">Subject B</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={broadcast.subjectB}
                                        onChange={(e) => setBroadcast({ ...broadcast, subjectB: e.target.value })}
                                        placeholder="Alternative subject line"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Test Percentage</label>
                                    <select
                                        className="form-select"
                                        value={broadcast.abTest.testPercent}
                                        onChange={(e) => setBroadcast({
                                            ...broadcast,
                                            abTest: { ...broadcast.abTest, testPercent: Number(e.target.value) }
                                        })}
                                    >
                                        <option value={10}>10%</option>
                                        <option value={20}>20%</option>
                                        <option value={30}>30%</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
