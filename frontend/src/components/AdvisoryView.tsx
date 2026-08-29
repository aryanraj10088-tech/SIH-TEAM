// src/components/AdvisoryView.tsx
import { CheckSquare, List, AlertTriangle } from 'lucide-react';

export const AdvisoryView = ({ data }: { data: any }) => {
  const getBadgeColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800';
      case 'high': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-800';
      default: return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800';
    }
  };

  return (
    <div className="rounded-xl space-y-5">
      <div className="flex justify-between items-start pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{data.title || "Advisory Notice"}</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{data.executive_summary}</p>
        </div>
        <span className={`ml-4 flex-shrink-0 px-3 py-1 text-xs font-bold rounded-full border ${getBadgeColor(data.severity_level)}`}>
          {data.severity_level || 'Medium'} Severity
        </span>
      </div>

      <div className="space-y-5">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200 mb-3">
            <CheckSquare className="w-4 h-4 text-indigo-500" /> Key Recommendations
          </h3>
          <ul className="space-y-2 bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            {data.recommendations?.map((item: string, idx: number) => (
              <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2 leading-relaxed">
                <span className="font-bold text-indigo-500 flex-shrink-0 mt-0.5">•</span> {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200 mb-3">
            <List className="w-4 h-4 text-emerald-500" /> Operational Action Items
          </h3>
          <ul className="space-y-2 bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
            {data.action_items?.map((item: string, idx: number) => (
              <li key={idx} className="text-sm text-emerald-900 dark:text-emerald-300 flex gap-2 leading-relaxed">
                <span className="font-bold text-emerald-500 flex-shrink-0 mt-0.5">✓</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};