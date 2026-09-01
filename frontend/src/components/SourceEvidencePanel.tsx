// src/components/SourceEvidencePanel.tsx
import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  audit: { status: string; groundedness_score?: number; chunks_used?: string[] };
  format: string;
  outputStatus?: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  outputCreatorId?: string;
  onSubmitForReview?: (format: string) => void;
  onApprove?: (format: string, comment: string) => void;
  onReject?: (format: string, comment: string) => void;
}

export const SourceEvidencePanel: React.FC<Props> = ({ 
  audit, 
  format, 
  outputStatus = 'DRAFT', 
  outputCreatorId,
  onSubmitForReview,
  onApprove, 
  onReject 
}) => {
  const [comment, setComment] = useState('');
  const [localStatus, setLocalStatus] = useState(outputStatus);
  const { role, accountType, user } = useAuth();

  const handleAction = (type: 'APPROVE' | 'REJECT' | 'SUBMIT') => {
    if (type === 'APPROVE') {
      setLocalStatus('APPROVED');
      onApprove && onApprove(format, comment);
    } else if (type === 'REJECT') {
      setLocalStatus('REJECTED');
      onReject && onReject(format, comment);
    } else if (type === 'SUBMIT') {
      setLocalStatus('PENDING_REVIEW');
      onSubmitForReview && onSubmitForReview(format);
    }
  };

  const isCreator = outputCreatorId ? user?._id === outputCreatorId : false;
  const isReviewer = (role === 'Reviewer' || role === 'Administrator') && !isCreator;
  const isOperator = role === 'Operator' || role === 'Administrator';
  const isOrganization = accountType === 'ORGANIZATION';

  return (
    <div className="bg-gray-50 dark:bg-gray-800/60 border-t border-gray-200 dark:border-gray-700 p-4 rounded-b-xl flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Groundedness Audit Trail */}
      <div className="flex items-center gap-3">
        <ShieldCheck className={`w-5 h-5 ${audit.groundedness_score && audit.groundedness_score >= 0.8 ? 'text-green-500' : 'text-amber-500'}`} />
        <div>
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Audit Verification &nbsp;
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              localStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
              localStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
              localStatus === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-200 text-gray-800'
            }`}>
              {localStatus.replace('_', ' ')}
            </span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Groundedness: <span className="font-bold text-gray-800 dark:text-gray-200">{Math.round((audit.groundedness_score || 0) * 100)}%</span>
          </p>
        </div>
      </div>

      {/* Reviewer Comment & Approval Actions */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        {(isReviewer || isOperator) && (
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Add notes or feedback..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
            <MessageSquare className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
          </div>
        )}

        {isOperator && isOrganization && (localStatus === 'DRAFT' || localStatus === 'REJECTED') && (
          <button
            onClick={() => handleAction('SUBMIT')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors bg-blue-600 text-white hover:bg-blue-700"
          >
            <Send size={14} /> Submit
          </button>
        )}

        {isReviewer && localStatus === 'PENDING_REVIEW' && (
          <>
            <button
              onClick={() => handleAction('APPROVE')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors bg-green-600 text-white hover:bg-green-700"
            >
              <CheckCircle2 size={14} /> Approve
            </button>

            <button
              onClick={() => handleAction('REJECT')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40"
            >
              <XCircle size={14} /> Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
};