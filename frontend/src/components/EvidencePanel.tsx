import { FileText, BookOpen } from 'lucide-react';

interface Citation {
  chunk_id: string;
  supporting_text: string;
}

interface EvidencePanelProps {
  citations: Citation[];
  groundednessScore?: number;
}

export const EvidencePanel = ({ citations, groundednessScore }: EvidencePanelProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-500" />
          Source Evidence
        </h3>
        {groundednessScore !== undefined && (
          <div className="mt-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">Groundedness Score: </span>
            <span className={`font-medium ${groundednessScore > 0.8 ? 'text-green-600' : 'text-yellow-600'}`}>
              {Math.round(groundednessScore * 100)}%
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto space-y-4 max-h-[600px]">
        {!citations || citations.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            No citations available for this output.
          </p>
        ) : (
          citations.map((citation, idx) => (
            <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {citation.chunk_id.substring(0, 8)}...
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic border-l-2 border-indigo-300 dark:border-indigo-700 pl-3">
                "{citation.supporting_text}"
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

