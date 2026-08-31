import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { outputsApi } from '../api/outputs';
import { useAuth } from '../context/AuthContext';
import { EvidencePanel } from '../components/EvidencePanel';
import { VersionHistory } from '../components/VersionHistory';
import { ReviewPanel } from '../components/ReviewPanel';
import { useNotifications } from '../context/NotificationContext';
import { ArrowLeft, Save, Send } from 'lucide-react';

export const OutputEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [output, setOutput] = useState<any>(null);
  const [editedContent, setEditedContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editNote, setEditNote] = useState('');
  const { role, user } = useAuth();
  const { lastUpdateTimestamp } = useNotifications();
  
  const fetchOutput = async () => {
    try {
      if (!id) return;
      const data = await outputsApi.getOutputById(id);
      setOutput(data);
      // Only set edited content if we haven't started editing yet, or to reset
      setEditedContent(data.content);
    } catch (err) {
      console.error('Failed to fetch output', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutput();
  }, [id, lastUpdateTimestamp]);

  const handleFieldChange = (key: string, value: any) => {
    setEditedContent((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleArrayChange = (key: string, index: number, value: string) => {
    setEditedContent((prev: any) => {
      const newArray = [...(prev[key] || [])];
      newArray[index] = value;
      return { ...prev, [key]: newArray };
    });
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await outputsApi.editContent(id, editedContent, editNote || 'Manual edit');
      setEditNote('');
      await fetchOutput();
    } catch (err) {
      console.error('Failed to save edit', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!id) return;
    if (!window.confirm('Submit this output for review?')) return;
    try {
      await outputsApi.submitForReview(id);
      await fetchOutput();
    } catch (err) {
      console.error('Failed to submit for review', err);
    }
  };

  const handleReviewAction = async () => {
    await fetchOutput();
    if (role === 'Reviewer') {
      navigate('/pending-reviews');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading output...</div>;
  if (!output) return <div className="p-8 text-center text-red-500">Output not found</div>;

  const isCreator = output.createdBy?._id === user?._id;
  const isOperator = role === 'Operator' && isCreator;
  const isAdmin = role === 'Administrator';
  const canEdit = (isOperator || isAdmin) && output.status !== 'APPROVED';
  
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to={`/projects/${output.projectId}`} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Project
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
              {output.format.replace('_', ' ')} Editor
            </h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 
              ${output.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                output.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                output.status === 'PENDING_REVIEW' ? 'bg-blue-100 text-blue-700' : 
                'bg-gray-100 text-gray-700'}`}
            >
              {output.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        
        {canEdit && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              <Save className="w-4 h-4" /> Save Draft
            </button>
            {output.status !== 'PENDING_REVIEW' && (
              <button
                onClick={handleSubmitForReview}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                <Send className="w-4 h-4" /> Submit for Review
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Content Fields</h2>
            <div className="space-y-6">
              {editedContent && Object.entries(editedContent).map(([key, value]) => {
                if (key === 'citations' || key === 'generated_images' || key === 'image_prompts') return null; // Handled separately or read-only

                if (typeof value === 'string') {
                  return (
                    <div key={key}>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize mb-2">
                        {key.replace('_', ' ')}
                      </label>
                      <textarea
                        value={value}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        disabled={!canEdit}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white disabled:opacity-75 min-h-[100px]"
                      />
                    </div>
                  );
                }

                if (Array.isArray(value) && typeof value[0] === 'string') {
                  return (
                    <div key={key}>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize mb-2">
                        {key.replace('_', ' ')}
                      </label>
                      <div className="space-y-3">
                        {value.map((item, idx) => (
                          <textarea
                            key={idx}
                            value={item}
                            onChange={(e) => handleArrayChange(key, idx, e.target.value)}
                            disabled={!canEdit}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white disabled:opacity-75 min-h-[80px]"
                          />
                        ))}
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>
            
            {canEdit && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Edit Note (Optional)
                 </label>
                 <input
                    type="text"
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    placeholder="Briefly describe what you changed..."
                    className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 dark:text-white"
                 />
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Version History</h2>
            <VersionHistory versions={output.versions} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ReviewPanel 
            outputId={output._id} 
            status={output.status} 
            comments={output.reviewerComments} 
            outputCreatorId={output.createdBy?._id}
            onReviewAction={handleReviewAction} 
          />
          <EvidencePanel 
            citations={output.content.citations || []} 
            // In a real app we'd fetch groundedness from AuditLog or store it in GeneratedOutput directly. 
            // For now it is omitted if not stored.
          />
        </div>
      </div>
    </div>
  );
};
