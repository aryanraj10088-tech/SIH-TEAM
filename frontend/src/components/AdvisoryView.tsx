import { Shield, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface AdvisoryResult {
  title?: string;
  severity_level?: string;
  executive_summary?: string;
  recommendations?: string[];
  action_items?: string[];
}

export const AdvisoryView = ({ data }: { data: AdvisoryResult }) => {
  if (!data) return null;
  const getRiskColor = (level: string) => {
    if (!level) return 'text-gray-700 bg-gray-50 border-gray-200';
    switch (level.toLowerCase()) {
      case 'high': return 'text-red-700 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-600" />
          {data.title || 'Advisory Report'}
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskColor(data.severity_level || '')} uppercase tracking-wider`}>
          {data.severity_level || 'UNKNOWN'} RISK
        </span>
      </div>
      
      <div className="p-6 space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-blue-500" />
            Executive Summary
          </h4>
          <p className="text-sm text-gray-600 leading-relaxed bg-blue-50 rounded-md p-3 border border-blue-100">
            {data.executive_summary || 'No summary provided.'}
          </p>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Recommendations
          </h4>
          <ul className="space-y-3 mt-2">
            {(data.recommendations || []).map((a, i) => (
              <li key={i} className="bg-orange-50 border border-orange-100/50 rounded-lg p-3.5 flex gap-3 items-start shadow-sm hover:shadow-md transition duration-300">
                <span className="bg-orange-100 text-orange-600 rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0 text-sm mt-0.5">•</span>
                <span className="text-gray-800 text-sm font-medium pt-0.5 leading-relaxed">{a}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Action Items
          </h4>
          <ul className="space-y-3 mt-2">
            {(data.action_items || []).map((a, i) => (
              <li key={i} className="bg-green-50 border border-green-100/50 rounded-lg p-3.5 flex gap-3 items-start shadow-sm hover:shadow-md transition duration-300">
                <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0 text-sm mt-0.5">→</span>
                <span className="text-gray-800 text-sm font-medium pt-0.5 leading-relaxed">{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
