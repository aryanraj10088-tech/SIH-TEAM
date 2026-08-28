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
    <div className="bg-gray-50 border-t p-4 rounded-b-lg flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Groundedness Audit Trail */}
      <div className="flex items-center gap-3">
        <ShieldCheck className={`w-5 h-5 ${audit.groundedness_score && audit.groundedness_score >= 0.8 ? 'text-green-600' : 'text-amber-500'}`} />
        <div>
          <p className="text-xs font-semibold text-gray-700">Audit Verification</p>
          <p className="text-xs text-gray-500">
            Groundedness: <span className="font-bold">{Math.round((audit.groundedness_score || 0) * 100)}%</span>
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
            className="w-full text-xs pl-8 pr-3 py-1.5 border rounded-md bg-white"
          />
          <MessageSquare className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
        </div>

        <button
          onClick={() => handleAction('APPROVE')}
          className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 ${
            status === 'APPROVED' ? 'bg-green-700 text-white' : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          <CheckCircle2 size={14} /> {status === 'APPROVED' ? 'Approved' : 'Approve'}
        </button>

        <button
          onClick={() => handleAction('REJECT')}
          className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 ${
            status === 'REJECTED' ? 'bg-red-700 text-white' : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
          }`}
        >
          <XCircle size={14} /> Reject
        </button>
      </div>
    </div>
  );
};