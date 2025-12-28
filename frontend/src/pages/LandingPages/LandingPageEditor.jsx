import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { landingPageApi, sequenceApi } from '../../services/api';
import toast from 'react-hot-toast';
import './LandingPages.css';

export default function LandingPageEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = !id;

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [sequences, setSequences] = useState([]);

    const [page, setPage] = useState({
        slug: '',
        template: 'minimal',
        headline: '',
        subheadline: '',
        buttonText: 'Subscribe',
        collectFirstName: true,
        assignTag: '',
        assignSequence: '',
        successMessage: "Thanks for subscribing! Check your inbox.",
        socialProof: ''
    });

    useEffect(() => {
        loadSequences();
        if (id) loadPage();
    }, [id]);

    const loadSequences = async () => {
        try {
            const res = await sequenceApi.list();
            setSequences(res.data.data.sequences);
        } catch (error) {
            console.error('Failed to load sequences');
        }
    };

    const loadPage = async () => {
        try {
            const res = await landingPageApi.get(id);
            setPage(res.data.data.landingPage);
        } catch (error) {
            toast.error('Failed to load page');
            navigate('/growth');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!page.slug.trim() || !page.headline.trim()) {
            toast.error('Please fill in slug and headline');
            return;
        }

        setSaving(true);
        try {
            if (isNew) {
                const res = await landingPageApi.create(page);
                toast.success('Landing page created!');
                navigate(`/growth/${res.data.data.landingPage._id}`);
            } else {
                await landingPageApi.update(id, page);
                toast.success('Saved!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
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
        <div className="landing-page-editor">
            <div className="editor-header">
                <button className="btn btn-secondary" onClick={() => navigate('/growth')}>
                    ← Back
                </button>
                <h1>{isNew ? 'Create Landing Page' : 'Edit Landing Page'}</h1>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                </button>
            </div>

            <div className="editor-grid">
                {/* Form */}
                <div className="editor-form card">
                    <div className="form-group">
                        <label className="form-label">Page URL Slug</label>
                        <div className="input-prefix">
                            <span>plainly.email/</span>
                            <input
                                type="text"
                                className="form-input"
                                value={page.slug}
                                onChange={(e) => setPage({ ...page, slug: e.target.value })}
                                placeholder="my-newsletter"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Template</label>
                        <select
                            className="form-select"
                            value={page.template}
                            onChange={(e) => setPage({ ...page, template: e.target.value })}
                        >
                            <option value="minimal">Minimal</option>
                            <option value="side-by-side">Side by Side</option>
                            <option value="hero">Full Width Hero</option>
                            <option value="two-column">Two Column</option>
                            <option value="video">Video Embed</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Headline</label>
                        <input
                            type="text"
                            className="form-input"
                            value={page.headline}
                            onChange={(e) => setPage({ ...page, headline: e.target.value })}
                            placeholder="Get my BEST updates delivered to your inbox"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Subheadline (optional)</label>
                        <input
                            type="text"
                            className="form-input"
                            value={page.subheadline}
                            onChange={(e) => setPage({ ...page, subheadline: e.target.value })}
                            placeholder="Join 1,000+ readers getting weekly tips"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Button Text</label>
                        <input
                            type="text"
                            className="form-input"
                            value={page.buttonText}
                            onChange={(e) => setPage({ ...page, buttonText: e.target.value })}
                            placeholder="Subscribe"
                        />
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={page.collectFirstName}
                                onChange={(e) => setPage({ ...page, collectFirstName: e.target.checked })}
                            />
                            Collect first name
                        </label>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Tag new subscribers</label>
                        <input
                            type="text"
                            className="form-input"
                            value={page.assignTag}
                            onChange={(e) => setPage({ ...page, assignTag: e.target.value })}
                            placeholder="landing-page"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Add to sequence</label>
                        <select
                            className="form-select"
                            value={page.assignSequence || ''}
                            onChange={(e) => setPage({ ...page, assignSequence: e.target.value || null })}
                        >
                            <option value="">None</option>
                            {sequences.map((seq) => (
                                <option key={seq._id} value={seq._id}>{seq.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Social proof (optional)</label>
                        <input
                            type="text"
                            className="form-input"
                            value={page.socialProof}
                            onChange={(e) => setPage({ ...page, socialProof: e.target.value })}
                            placeholder="Join 1,247 readers"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Success message</label>
                        <input
                            type="text"
                            className="form-input"
                            value={page.successMessage}
                            onChange={(e) => setPage({ ...page, successMessage: e.target.value })}
                            placeholder="Thanks for subscribing!"
                        />
                    </div>
                </div>

                {/* Preview */}
                <div className="page-preview">
                    <h3>Preview</h3>
                    <div className="preview-frame">
                        <div className="preview-content">
                            <h2>{page.headline || 'Your Headline'}</h2>
                            {page.subheadline && <p>{page.subheadline}</p>}
                            {page.socialProof && <p className="social-proof">{page.socialProof}</p>}
                            <div className="preview-form">
                                {page.collectFirstName && (
                                    <input type="text" placeholder="First name" disabled />
                                )}
                                <input type="email" placeholder="Email" disabled />
                                <button className="btn btn-primary">{page.buttonText || 'Subscribe'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
