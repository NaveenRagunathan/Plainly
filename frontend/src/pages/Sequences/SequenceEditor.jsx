import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sequenceApi } from '../../services/api';
import toast from 'react-hot-toast';
import './Sequences.css';

export default function SequenceEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = !id;

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [sequence, setSequence] = useState({
        name: '',
        steps: [],
        isActive: false
    });
    const [editingStep, setEditingStep] = useState(null);

    useEffect(() => {
        if (id) loadSequence();
    }, [id]);

    const loadSequence = async () => {
        try {
            const res = await sequenceApi.get(id);
            setSequence(res.data.data.sequence);
        } catch (error) {
            toast.error('Failed to load sequence');
            navigate('/automations');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!sequence.name.trim()) {
            toast.error('Please enter a name');
            return;
        }

        setSaving(true);
        try {
            if (isNew) {
                const res = await sequenceApi.create(sequence);
                toast.success('Automation created!');
                navigate(`/automations/${res.data.data.sequence._id}`);
            } else {
                await sequenceApi.update(id, sequence);
                toast.success('Saved!');
            }
        } catch (error) {
            toast.error('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleAddStep = () => {
        setEditingStep({
            order: sequence.steps.length,
            subject: '',
            body: '',
            delayHours: 24,
            isNew: true
        });
    };

    const handleSaveStep = async () => {
        if (!editingStep.subject.trim() || !editingStep.body.trim()) {
            toast.error('Please fill in subject and body');
            return;
        }

        if (editingStep.isNew) {
            // Add new step
            if (isNew) {
                setSequence({
                    ...sequence,
                    steps: [...sequence.steps, { ...editingStep, order: sequence.steps.length }]
                });
            } else {
                try {
                    await sequenceApi.addStep(id, editingStep);
                    toast.success('Step added!');
                    loadSequence();
                } catch (error) {
                    toast.error('Failed to add step');
                }
            }
        } else {
            // Update existing step
            if (isNew) {
                const steps = [...sequence.steps];
                steps[editingStep.order] = editingStep;
                setSequence({ ...sequence, steps });
            } else {
                try {
                    await sequenceApi.updateStep(id, editingStep._id, editingStep);
                    toast.success('Step updated!');
                    loadSequence();
                } catch (error) {
                    toast.error('Failed to update step');
                }
            }
        }
        setEditingStep(null);
    };

    const handleDeleteStep = async (step) => {
        if (!confirm('Delete this step?')) return;

        if (isNew) {
            setSequence({
                ...sequence,
                steps: sequence.steps.filter((_, i) => i !== step.order)
            });
        } else {
            try {
                await sequenceApi.deleteStep(id, step._id);
                toast.success('Step deleted');
                loadSequence();
            } catch (error) {
                toast.error('Failed to delete step');
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
        <div className="sequence-editor">
            <div className="editor-header">
                <button className="btn btn-secondary" onClick={() => navigate('/automations')}>
                    ← Back
                </button>
                <h1>{isNew ? 'Create Automation' : 'Edit Automation'}</h1>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                </button>
            </div>

            <div className="editor-form">
                <div className="form-group">
                    <label className="form-label">Automation Name</label>
                    <input
                        type="text"
                        className="form-input"
                        value={sequence.name}
                        onChange={(e) => setSequence({ ...sequence, name: e.target.value })}
                        placeholder="e.g., Welcome Series"
                    />
                </div>

                <div className="steps-section">
                    <h2>Email Steps</h2>

                    {sequence.steps.length === 0 ? (
                        <div className="empty-steps">
                            <p>No steps yet. Add your first email to the sequence.</p>
                        </div>
                    ) : (
                        <div className="steps-list">
                            {sequence.steps.map((step, index) => (
                                <div key={step._id || index} className="step-card">
                                    <div className="step-number">{index + 1}</div>
                                    <div className="step-content">
                                        <div className="step-delay">
                                            {index === 0 ? 'Immediately' : `Wait ${step.delayHours} hours`}
                                        </div>
                                        <div className="step-subject">{step.subject}</div>
                                        <div className="step-preview">{step.body.slice(0, 100)}...</div>
                                    </div>
                                    <div className="step-actions">
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => setEditingStep({ ...step, isNew: false })}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleDeleteStep(step)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <button className="btn btn-outline add-step-btn" onClick={handleAddStep}>
                        + Add Email Step
                    </button>
                </div>
            </div>

            {/* Step Editor Modal */}
            {editingStep && (
                <div className="modal-overlay" onClick={() => setEditingStep(null)}>
                    <div className="modal step-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingStep.isNew ? 'Add Email Step' : 'Edit Email Step'}</h2>

                        <div className="form-group">
                            <label className="form-label">Delay (hours after previous)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={editingStep.delayHours}
                                onChange={(e) => setEditingStep({ ...editingStep, delayHours: Number(e.target.value) })}
                                min={0}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Subject Line</label>
                            <input
                                type="text"
                                className="form-input"
                                value={editingStep.subject}
                                onChange={(e) => setEditingStep({ ...editingStep, subject: e.target.value })}
                                placeholder="Welcome to my newsletter!"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Body (Plain Text)</label>
                            <textarea
                                className="form-textarea"
                                value={editingStep.body}
                                onChange={(e) => setEditingStep({ ...editingStep, body: e.target.value })}
                                placeholder="Hey {first_name},

Thanks for subscribing!

..."
                                rows={10}
                            />
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setEditingStep(null)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleSaveStep}>
                                {editingStep.isNew ? 'Add Step' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
