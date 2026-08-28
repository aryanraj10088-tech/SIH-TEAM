// src/components/AdvisoryView.tsx
import { CheckSquare, List } from 'lucide-react';

export const AdvisoryView = ({ data }: { data: any }) => {
  const getBadgeColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <div className="flex justify-between items-start mb-4 pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{data.title || "Advisory Notice"}</h2>
          <p className="text-sm text-gray-600 mt-1">{data.executive_summary}</p>
        </div>
        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getBadgeColor(data.severity_level)}`}>
          {data.severity_level || 'Medium'} Severity
        </span>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
            <CheckSquare className="w-4 h-4 text-blue-600" /> Key Recommendations
          </h3>
          <ul className="space-y-2 bg-gray-50 p-4 rounded-lg">
            {data.recommendations?.map((item: string, idx: number) => (
              <li key={idx} className="text-sm text-gray-700 flex gap-2">
                <span className="font-bold text-blue-500">•</span> {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
            <List className="w-4 h-4 text-emerald-600" /> Operational Action Items
          </h3>
          <ul className="space-y-2 bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
            {data.action_items?.map((item: string, idx: number) => (
              <li key={idx} className="text-sm text-emerald-900 flex gap-2">
                <span className="font-bold text-emerald-600">✓</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};