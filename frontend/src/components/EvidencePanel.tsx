import React, { useState } from 'react';

export interface Citation {
  chunk_id?: string;
  supporting_text: string;
  claim_supported?: string;
  source_name?: string;
}

interface EvidencePanelProps {
  citations?: Citation[];
  title?: string;
  compact?: boolean;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ citations, title = "Source Evidence", compact = false }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!citations || citations.length === 0) return null;

  return (
    <div className={`mt-2 mb-2 border border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800 rounded-lg overflow-hidden ${compact ? 'text-xs' : 'text-sm'}`}>
      <button 
        onClick={() => setExpanded(!expanded)} 
        className="w-full px-4 py-2 flex justify-between items-center bg-blue-100/50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
      >
        <span className="font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {title} ({citations.length} supported {citations.length === 1 ? 'claim' : 'claims'})
        </span>
        <svg className={`w-4 h-4 text-blue-600 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      
      {expanded && (
        <div className="p-4 space-y-3">
          {citations.map((cite, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 shadow-sm">
              {cite.claim_supported && (
                <div className="mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <strong className="text-gray-900 dark:text-gray-100 block text-xs uppercase tracking-wider mb-1">Generated Claim</strong>
                  <p className="text-gray-800 dark:text-gray-200">{cite.claim_supported}</p>
                </div>
              )}
              <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded border-l-2 border-blue-400">
                <strong className="text-gray-500 dark:text-gray-400 block text-xs uppercase tracking-wider mb-1">
                  Source Evidence {cite.chunk_id ? `(Chunk ID: ${cite.chunk_id})` : ''}
                </strong>
                <p className="text-gray-600 dark:text-gray-300 italic">"{cite.supporting_text}"</p>
              </div>
              {cite.source_name && (
                <p className="mt-2 text-xs text-gray-400 block text-right font-mono">Source: {cite.source_name}</p>
              )}
            </div>
          ))}
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            * This evidence was retrieved from the RAG pipeline during generation. It is read-only. Editing the content above will not automatically update these source references.
          </p>
        </div>
      )}
    </div>
  );
};
