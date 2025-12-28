import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sequenceApi } from '../../services/api';
import toast from 'react-hot-toast';
import './Sequences.css';

export default function SequenceList() {
    const [sequences, setSequences] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSequences();
    }, []);

    const loadSequences = async () => {
        try {
            const res = await sequenceApi.list();
            setSequences(res.data.data.sequences);
        } catch (error) {
            toast.error('Failed to load sequences');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this automation? Subscribers will be removed from it.')) return;
        try {
            await sequenceApi.delete(id);
            toast.success('Automation deleted');
            loadSequences();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleToggle = async (id, isActive) => {
        try {
            await sequenceApi.update(id, { isActive: !isActive });
            toast.success(isActive ? 'Automation paused' : 'Automation activated');
            loadSequences();
        } catch (error) {
            toast.error('Failed to update');
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
        <div className="sequences-page">
            <div className="page-header flex-between">
                <div>
                    <h1 className="page-title">
                        Automations
                        <span className="count-badge">{sequences.length}</span>
                    </h1>
                    {sequences.length === 0 && (
                        <p className="text-sm text-gray mt-2">
                            <a href="#" className="text-primary">Upgrade</a> to create automations!
                        </p>
                    )}
                </div>
                <div className="flex gap-4">
                    <input
                        type="text"
                        className="form-input search-input"
                        placeholder="Search"
                    />
                    <Link to="/automations/new" className="btn btn-primary">
                        Create Automation Series ▾
                    </Link>
                </div>
            </div>

            {sequences.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🐱</div>
                    <h3 className="empty-state-title">You don't have any active automations</h3>
                    <p className="empty-state-text">Create your first automation to start growing</p>
                    <Link to="/automations/new" className="btn btn-primary">
                        Create Automation
                    </Link>
                </div>
            ) : (
                <div className="sequence-list">
                    {sequences.map((seq) => (
                        <div key={seq._id} className="sequence-card">
                            <div className="sequence-info">
                                <Link to={`/automations/${seq._id}`} className="sequence-name">
                                    {seq.name}
                                </Link>
                                <div className="sequence-meta">
                                    <span>{seq.steps.length} steps</span>
                                    <span>•</span>
                                    <span>{seq.stats.currentlyActive} active</span>
                                    <span>•</span>
                                    <span>{seq.stats.completed} completed</span>
                                </div>
                            </div>
                            <div className="sequence-actions">
                                <span className={`badge ${seq.isActive ? 'badge-success' : 'badge-gray'}`}>
                                    {seq.isActive ? 'Active' : 'Paused'}
                                </span>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => handleToggle(seq._id, seq.isActive)}
                                >
                                    {seq.isActive ? 'Pause' : 'Activate'}
                                </button>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => handleDelete(seq._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
