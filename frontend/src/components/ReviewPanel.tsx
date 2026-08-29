import { useState } from 'react';
import { outputsApi } from '../api/outputs';
import { Check, X, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Comment {
  _id: string;
  userId: { name: string };
  text: string;
  createdAt: string;
}

interface ReviewPanelProps {
  outputId: string;
  status: string;
  comments: Comment[];
  onReviewAction: () => void;
}

export const ReviewPanel = ({ outputId, status, comments, onReviewAction }: ReviewPanelProps) => {
  const [note, setNote] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { role } = useAuth();
  
  const canReview = role === 'Reviewer' || role === 'Administrator';

  const handleReview = async (action: 'approve' | 'reject') => {
    if (!canReview) return;
    setSubmitting(true);
    try {
      await outputsApi.reviewOutput(outputId, action, note);
      onReviewAction();
      setNote('');
    } catch (err) {
      console.error(`Failed to ${action} output`, err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await outputsApi.addComment(outputId, commentText);
      setCommentText('');
      onReviewAction();
    } catch (err) {
      console.error('Failed to add comment', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-500" />
          Review & Comments
        </h3>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto space-y-4 max-h-[400px]">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-gray-300">{comment.userId?.name || 'Unknown'}</span>
                <span>{new Date(comment.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No comments yet.</p>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
        {/* Comment Form */}
        <form onSubmit={handleComment} className="flex gap-2 mb-4">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting || !commentText.trim()}
            className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Review Actions */}
        {canReview && status === 'PENDING_REVIEW' && (
          <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional approval/rejection note..."
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleReview('approve')}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition font-medium text-sm disabled:opacity-50"
              >
                <Check className="w-4 h-4" /> Approve
              </button>
              <button
                onClick={() => handleReview('reject')}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition font-medium text-sm disabled:opacity-50"
              >
                <X className="w-4 h-4" /> Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

