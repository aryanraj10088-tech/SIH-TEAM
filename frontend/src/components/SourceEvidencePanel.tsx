// src/components/SourceEvidencePanel.tsx
import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, MessageSquare } from 'lucide-react';

interface Props {
  audit: { status: string; groundedness_score?: number; chunks_used?: string[] };
  format: string;
  onApprove: (format: string, comment: string) => void;
  onReject: (format: string, comment: string) => void;
}

export const SourceEvidencePanel: React.FC<Props> = ({ audit, format, onApprove, onReject }) => {
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'APPROVED' | 'REJECTED'>('DRAFT');

  const handleAction = (type: 'APPROVE' | 'REJECT') => {
    if (type === 'APPROVE') {
      setStatus('APPROVED');
      onApprove(format, comment);
    } else {
      setStatus('REJECTED');
      onReject(format, comment);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800/60 border-t border-gray-200 dark:border-gray-700 p-4 rounded-b-xl flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Groundedness Audit Trail */}
      <div className="flex items-center gap-3">
        <ShieldCheck className={`w-5 h-5 ${audit.groundedness_score && audit.groundedness_score >= 0.8 ? 'text-green-500' : 'text-amber-500'}`} />
        <div>
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Audit Verification</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Groundedness: <span className="font-bold text-gray-800 dark:text-gray-200">{Math.round((audit.groundedness_score || 0) * 100)}%</span>
          </p>
        </div>
      </div>

      {/* Reviewer Comment & Approval Actions */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className="relative flex-1 md:w-64">
          <input
            type="text"
            placeholder="Add reviewer notes..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
          />
          <MessageSquare className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
        </div>

        <button
          onClick={() => handleAction('APPROVE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
            status === 'APPROVED' ? 'bg-green-700 text-white' : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          <CheckCircle2 size={14} /> {status === 'APPROVED' ? 'Approved' : 'Approve'}
        </button>

        <button
          onClick={() => handleAction('REJECT')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
            status === 'REJECTED' ? 'bg-red-700 text-white' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40'
          }`}
        >
          <XCircle size={14} /> Reject
        </button>
      </div>
    </div>
  );
};