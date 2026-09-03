import React, { useState } from 'react';
import { EvidencePanel } from './EvidencePanel';

interface AdvisoryEditorProps {
  content: any;
  onChange: (key: string, value: any) => void;
  canEdit: boolean;
}

export const AdvisoryEditor: React.FC<AdvisoryEditorProps> = ({ content, onChange, canEdit }) => {
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    details: true,
    situation: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // -------------------------------------------------------------
  // FALLBACK GETTERS & NORMALIZERS (Backward Compatibility)
  // -------------------------------------------------------------
  
  const getTitle = () => content.title || '';
  const getSeverity = () => content.severity_level || 'Not specified in source';
  const getExecSummary = () => content.executive_summary || '';
  
  // Normalize recommendations: map old string[] to new object[]
  const getRecommendations = () => {
    const recs = content.recommendations || [];
    return recs.map((r: any) => {
      if (typeof r === 'string') {
        return { recommendation: r, priority: 'Not specified', rationale: '', responsible_role: 'Not specified', source_reference: '' };
      }
      return r;
    });
  };

  // Normalize action items: map old string[] to new object[]
  const getActionItems = () => {
    const items = content.action_items || [];
    return items.map((a: any) => {
      if (typeof a === 'string') {
        return { action: a, priority: 'Not specified', responsible_role: 'Not specified', timeframe: 'Not specified', status: 'Pending', rationale: '' };
      }
      return a;
    });
  };

  const getImpact = () => content.potential_impact || {};
  const getKeyFindings = () => content.key_findings || [];
  const getAudienceGuidance = () => content.audience_guidance || [];
  const getSources = () => content.sources || [];
  const getWarnings = () => content.content_warnings || [];

  // -------------------------------------------------------------
  // UPDATE HANDLERS
  // -------------------------------------------------------------

  const handleImpactChange = (field: string, value: any) => {
    onChange('potential_impact', { ...getImpact(), [field]: value });
  };

  const handleArrayChange = (field: string, index: number, subField: string, value: any) => {
    const array = [...(content[field] || [])];
    if (typeof array[index] === 'string') {
      // should already be normalized, but just in case
      array[index] = { [subField === 'action' || subField === 'recommendation' ? subField : 'text']: array[index] };
    }
    array[index] = { ...array[index], [subField]: value };
    onChange(field, array);
  };

  const renderTextarea = (value: string, onChangeText: (v: string) => void, label: string) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <textarea
        value={value || ''}
        onChange={(e) => onChangeText(e.target.value)}
        disabled={!canEdit}
        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-gray-900 dark:text-white disabled:opacity-75 min-h-[80px]"
      />
    </div>
  );

  const renderInput = (value: string, onChangeText: (v: string) => void, label: string) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChangeText(e.target.value)}
        disabled={!canEdit}
        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-gray-900 dark:text-white disabled:opacity-75"
      />
    </div>
  );

  const SectionHeader = ({ title, sectionId, count }: { title: string, sectionId: string, count?: number }) => (
    <button 
      onClick={() => toggleSection(sectionId)} 
      className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
    >
      <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
        {title} {count !== undefined && <span className="text-sm font-normal text-gray-500 ml-2">({count})</span>}
      </h3>
      <svg className={`w-5 h-5 transform transition-transform ${expandedSections[sectionId] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
    </button>
  );

  const renderEditMode = () => (
    <div className="space-y-6">
      
      {/* Details */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <SectionHeader title="Advisory Details" sectionId="details" />
        {expandedSections.details && (
          <div className="p-6 space-y-4">
            {renderInput(getTitle(), (v) => onChange('title', v), 'Title')}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput(getSeverity(), (v) => onChange('severity_level', v), 'Severity Level')}
              {renderInput(content.status || '', (v) => onChange('status', v), 'Status')}
              {renderInput(content.issue_category || '', (v) => onChange('issue_category', v), 'Issue Category')}
              {renderInput(content.target_audience || '', (v) => onChange('target_audience', v), 'Target Audience')}
              {renderInput(content.geographic_scope || '', (v) => onChange('geographic_scope', v), 'Geographic Scope')}
              {renderInput(content.issued_date || '', (v) => onChange('issued_date', v), 'Issued Date')}
              {renderInput(content.valid_until || '', (v) => onChange('valid_until', v), 'Valid Until')}
              {renderInput(content.advisory_id || '', (v) => onChange('advisory_id', v), 'Advisory ID')}
            </div>
          </div>
        )}
      </div>

      {/* Situation & Summary */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <SectionHeader title="Situation & Summary" sectionId="situation" />
        {expandedSections.situation && (
          <div className="p-6 space-y-4">
            {renderTextarea(content.situation_issue || '', (v) => onChange('situation_issue', v), 'Situation / Issue')}
            {renderTextarea(getExecSummary(), (v) => onChange('executive_summary', v), 'Executive Summary')}
            {renderTextarea(content.overall_message || '', (v) => onChange('overall_message', v), 'Overall Message')}
          </div>
        )}
      </div>

      {/* Key Findings */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <SectionHeader title="Key Findings" sectionId="findings" count={getKeyFindings().length} />
        {expandedSections.findings && (
          <div className="p-6 space-y-4">
            {getKeyFindings().map((f: any, idx: number) => (
              <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                {renderTextarea(f.finding || '', (v) => handleArrayChange('key_findings', idx, 'finding', v), `Finding ${idx + 1}`)}
                {renderInput(f.source_reference || '', (v) => handleArrayChange('key_findings', idx, 'source_reference', v), 'Source Reference')}
                <EvidencePanel citations={f.citations} title="Finding Evidence" compact />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Impact */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <SectionHeader title="Potential Impact" sectionId="impact" />
        {expandedSections.impact && (
          <div className="p-6 space-y-4">
            {renderTextarea(getImpact().operational_impact || '', (v) => handleImpactChange('operational_impact', v), 'Operational Impact')}
            {renderTextarea(getImpact().potential_consequences || '', (v) => handleImpactChange('potential_consequences', v), 'Potential Consequences')}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput((getImpact().affected_groups || []).join(', '), (v) => handleImpactChange('affected_groups', v.split(', ')), 'Affected Groups (comma separated)')}
              {renderInput(getImpact().urgency || '', (v) => handleImpactChange('urgency', v), 'Urgency')}
            </div>
            {renderTextarea((getImpact().risk_factors || []).join('\n'), (v) => handleImpactChange('risk_factors', v.split('\n')), 'Risk Factors (one per line)')}
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <SectionHeader title="Recommendations" sectionId="recommendations" count={getRecommendations().length} />
        {expandedSections.recommendations && (
          <div className="p-6 space-y-4">
            {getRecommendations().map((r: any, idx: number) => (
              <div key={idx} className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/50">
                {renderTextarea(r.recommendation || '', (v) => handleArrayChange('recommendations', idx, 'recommendation', v), `Recommendation ${idx + 1}`)}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {renderInput(r.priority || '', (v) => handleArrayChange('recommendations', idx, 'priority', v), 'Priority')}
                  {renderInput(r.responsible_role || '', (v) => handleArrayChange('recommendations', idx, 'responsible_role', v), 'Responsible Role')}
                  {renderInput(r.source_reference || '', (v) => handleArrayChange('recommendations', idx, 'source_reference', v), 'Source Ref')}
                </div>
                {renderTextarea(r.rationale || '', (v) => handleArrayChange('recommendations', idx, 'rationale', v), 'Rationale')}
                <EvidencePanel citations={r.citations} title="Source Context for Recommendation" compact />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Items */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <SectionHeader title="Action Items" sectionId="actions" count={getActionItems().length} />
        {expandedSections.actions && (
          <div className="p-6 space-y-4">
            {getActionItems().map((a: any, idx: number) => (
              <div key={idx} className="p-4 bg-fuchsia-50 dark:bg-fuchsia-900/10 rounded-lg border border-fuchsia-100 dark:border-fuchsia-900/50">
                {renderInput(a.action || '', (v) => handleArrayChange('action_items', idx, 'action', v), `Action Item ${idx + 1}`)}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {renderInput(a.priority || '', (v) => handleArrayChange('action_items', idx, 'priority', v), 'Priority')}
                  {renderInput(a.responsible_role || '', (v) => handleArrayChange('action_items', idx, 'responsible_role', v), 'Responsible Role')}
                  {renderInput(a.timeframe || '', (v) => handleArrayChange('action_items', idx, 'timeframe', v), 'Timeframe')}
                  {renderInput(a.status || '', (v) => handleArrayChange('action_items', idx, 'status', v), 'Status')}
                </div>
                {renderInput(a.rationale || '', (v) => handleArrayChange('action_items', idx, 'rationale', v), 'Rationale')}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audience Guidance */}
      {getAudienceGuidance().length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
          <SectionHeader title="Audience Guidance" sectionId="audience" count={getAudienceGuidance().length} />
          {expandedSections.audience && (
            <div className="p-6 space-y-4">
              {getAudienceGuidance().map((ag: any, idx: number) => (
                <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  {renderInput(ag.audience || '', (v) => handleArrayChange('audience_guidance', idx, 'audience', v), 'Audience')}
                  {renderTextarea(ag.guidance || '', (v) => handleArrayChange('audience_guidance', idx, 'guidance', v), 'Guidance')}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sources & Warnings */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <SectionHeader title="Sources & Warnings" sectionId="sources" />
        {expandedSections.sources && (
          <div className="p-6 space-y-4">
            <h4 className="font-bold text-gray-800 dark:text-gray-200">Sources</h4>
            {getSources().map((s: any, idx: number) => (
              <div key={idx} className="flex gap-4">
                <input type="text" value={s.reference || ''} disabled className="flex-1 px-3 py-2 bg-gray-100 rounded" placeholder="Reference" />
                <input type="text" value={s.url_or_location || ''} disabled className="flex-1 px-3 py-2 bg-gray-100 rounded" placeholder="Location" />
              </div>
            ))}
            
            <h4 className="font-bold text-red-600 dark:text-red-400 mt-6">Content Warnings</h4>
            {getWarnings().length === 0 ? <p className="text-sm text-gray-500">No warnings.</p> : (
              <ul className="list-disc pl-5 text-sm text-red-600 space-y-1">
                {getWarnings().map((w: string, idx: number) => <li key={idx}>{w}</li>)}
              </ul>
            )}
          </div>
        )}
      </div>

    </div>
  );

  const getSeverityStyle = (severity: string) => {
    const s = severity.toLowerCase();
    if (s.includes('critical')) return 'bg-red-600 text-white shadow-red-200 dark:shadow-red-900/50';
    if (s.includes('high')) return 'bg-orange-500 text-white shadow-orange-200 dark:shadow-orange-900/50';
    if (s.includes('medium')) return 'bg-yellow-400 text-gray-900 shadow-yellow-100 dark:shadow-yellow-900/20';
    if (s.includes('low')) return 'bg-blue-400 text-white shadow-blue-100 dark:shadow-blue-900/20';
    return 'bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-200';
  };

  const renderPreviewMode = () => (
    <div className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg max-w-5xl mx-auto text-gray-900 dark:text-gray-100 font-sans">
      
      {/* Header */}
      <div className="border-b-4 border-gray-900 dark:border-gray-100 pb-6 mb-8 flex flex-col gap-4">
        <div className="flex justify-between items-start gap-4">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight flex-1">
            {getTitle() || 'OPERATIONAL ADVISORY'}
          </h1>
          <div className={`px-4 py-2 font-bold uppercase tracking-widest text-sm md:text-base rounded shadow-sm ${getSeverityStyle(getSeverity())}`}>
            SEVERITY: {getSeverity()}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
          {content.advisory_id && <div><span className="block text-xs text-gray-400 dark:text-gray-500">Advisory ID</span>{content.advisory_id}</div>}
          {content.issued_date && <div><span className="block text-xs text-gray-400 dark:text-gray-500">Issued</span><span className={content.issued_date.includes('Not specified') ? 'italic font-normal opacity-70' : ''}>{content.issued_date}</span></div>}
          {content.valid_until && <div><span className="block text-xs text-gray-400 dark:text-gray-500">Valid Until</span><span className={content.valid_until.includes('Not specified') ? 'italic font-normal opacity-70' : ''}>{content.valid_until}</span></div>}
          {content.status && <div><span className="block text-xs text-gray-400 dark:text-gray-500">Status</span>{content.status}</div>}
          {content.issue_category && <div><span className="block text-xs text-gray-400 dark:text-gray-500">Category</span>{content.issue_category}</div>}
          {content.geographic_scope && <div><span className="block text-xs text-gray-400 dark:text-gray-500">Scope</span>{content.geographic_scope}</div>}
        </div>
      </div>

      {/* Exec Summary & Situation */}
      <div className="space-y-6 mb-10">
        <div>
          <h2 className="text-xl font-bold uppercase border-b-2 border-gray-200 dark:border-gray-700 pb-2 mb-4 text-indigo-700 dark:text-indigo-400">Executive Summary</h2>
          <p className="text-lg leading-relaxed">{getExecSummary()}</p>
        </div>
        {content.situation_issue && (
          <div>
            <h2 className="text-xl font-bold uppercase border-b-2 border-gray-200 dark:border-gray-700 pb-2 mb-4 text-indigo-700 dark:text-indigo-400">Situation / Issue</h2>
            <p className="leading-relaxed">{content.situation_issue}</p>
          </div>
        )}
      </div>

      {/* Key Findings */}
      {getKeyFindings().length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold uppercase border-b-2 border-gray-200 dark:border-gray-700 pb-2 mb-4 text-indigo-700 dark:text-indigo-400">Key Findings</h2>
          <div className="space-y-6">
            {getKeyFindings().map((f: any, idx: number) => (
              <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="font-semibold text-lg">{f.finding}</p>
                {f.source_reference && <p className="text-sm text-gray-500 mt-2">Source: {f.source_reference}</p>}
                <EvidencePanel citations={f.citations} title="Finding Evidence" compact />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Impact */}
      {Object.keys(getImpact()).length > 0 && (
        <div className="mb-10 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold uppercase mb-4 text-indigo-700 dark:text-indigo-400">Impact Assessment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {getImpact().operational_impact && <div><strong className="block mb-1">Operational Impact:</strong> {getImpact().operational_impact}</div>}
            {getImpact().potential_consequences && <div><strong className="block mb-1">Potential Consequences:</strong> {getImpact().potential_consequences}</div>}
            {getImpact().affected_groups?.length > 0 && <div><strong className="block mb-1">Affected Groups:</strong> {getImpact().affected_groups.join(', ')}</div>}
            {getImpact().urgency && <div><strong className="block mb-1">Urgency:</strong> {getImpact().urgency}</div>}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {getRecommendations().length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold uppercase border-b-2 border-gray-200 dark:border-gray-700 pb-2 mb-4 text-indigo-700 dark:text-indigo-400">Recommendations</h2>
          <div className="space-y-4">
            {getRecommendations().map((r: any, idx: number) => (
              <div key={idx} className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg">
                <div className="flex gap-2 items-center mb-2">
                  <span className="font-bold text-blue-800 dark:text-blue-300">{idx + 1}.</span>
                  {r.priority && !r.priority.includes('Not specified') && <span className="text-xs font-bold bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded uppercase">{r.priority} Priority</span>}
                  {r.responsible_role && !r.responsible_role.includes('Not specified') && <span className="text-xs font-semibold text-gray-500">For: {r.responsible_role}</span>}
                </div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{r.recommendation}</p>
                {r.rationale && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">{r.rationale}</p>}
                {r.source_reference && <p className="text-sm mt-3 text-gray-500">Source: {r.source_reference}</p>}
                <EvidencePanel citations={r.citations} title="Source Context for Recommendation" compact />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Items */}
      {getActionItems().length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold uppercase border-b-2 border-gray-200 dark:border-gray-700 pb-2 mb-4 text-indigo-700 dark:text-indigo-400">Action Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-600">
                  <th className="p-3">Action</th>
                  <th className="p-3 w-32">Priority</th>
                  <th className="p-3 w-40">Responsible</th>
                  <th className="p-3 w-32">Timeframe</th>
                  <th className="p-3 w-24">Status</th>
                </tr>
              </thead>
              <tbody>
                {getActionItems().map((a: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="p-3 font-medium">{a.action}</td>
                    <td className="p-3"><span className={a.priority?.includes('Not specified') ? 'opacity-50 italic' : 'font-semibold'}>{a.priority}</span></td>
                    <td className="p-3"><span className={a.responsible_role?.includes('Not specified') ? 'opacity-50 italic' : ''}>{a.responsible_role}</span></td>
                    <td className="p-3"><span className={a.timeframe?.includes('Not specified') ? 'opacity-50 italic' : ''}>{a.timeframe}</span></td>
                    <td className="p-3 font-semibold text-gray-600 dark:text-gray-400">{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sources & Warnings */}
      <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800 text-sm">
        {getSources().length > 0 && (
          <div className="mb-4">
            <h3 className="font-bold uppercase text-gray-500 mb-2">Sources / References</h3>
            <ul className="list-decimal pl-5 text-gray-600 dark:text-gray-400 space-y-1">
              {getSources().map((s: any, idx: number) => (
                <li key={idx}>{s.reference} {s.url_or_location && `(${s.url_or_location})`}</li>
              ))}
            </ul>
          </div>
        )}
        
        {getWarnings().length > 0 && (
          <div className="mt-6 p-4 border border-red-200 bg-red-50 dark:bg-red-900/10 rounded-lg">
            <h3 className="font-bold uppercase text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              Content Warnings
            </h3>
            <ul className="list-disc pl-5 text-red-600 dark:text-red-400 space-y-1">
              {getWarnings().map((w: string, idx: number) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

    </div>
  );

  return (
    <div className="space-y-6">
      {/* View Toggles */}
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit mx-auto md:mx-0">
        <button
          onClick={() => setViewMode('edit')}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${viewMode === 'edit' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}
        >
          Edit Mode
        </button>
        <button
          onClick={() => setViewMode('preview')}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}
        >
          Advisory Preview
        </button>
      </div>

      <div className="transition-all duration-300">
        {viewMode === 'edit' && renderEditMode()}
        {viewMode === 'preview' && renderPreviewMode()}
      </div>
    </div>
  );
};
