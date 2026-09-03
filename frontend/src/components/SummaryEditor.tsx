import React, { useState } from 'react';
import { EvidencePanel } from './EvidencePanel';

interface SummaryEditorProps {
  content: any;
  onChange: (key: string, value: any) => void;
  canEdit: boolean;
}

export const SummaryEditor: React.FC<SummaryEditorProps> = ({ content, onChange, canEdit }) => {
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    details: true,
    overview: true,
    key_points: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // -------------------------------------------------------------
  // FALLBACK GETTERS (Backward Compatibility)
  // -------------------------------------------------------------
  const getHeadline = () => content.headline || '';
  const getOverview = () => content.executive_overview || '';
  const getKeyPoints = () => content.key_points || [];
  
  // Normalize action items: map old string[] to new object[]
  const getActionItems = () => {
    const items = content.action_items || [];
    return items.map((a: any) => {
      if (typeof a === 'string') {
        return { action: a, priority: 'Not specified', responsible_role: 'Not specified', timeframe: 'Not specified', rationale: '' };
      }
      return a;
    });
  };

  const getCitations = () => content.citations || [];
  const getWarnings = () => content.content_warnings || [];

  // Length guidance
  const wordsCount = (text: string) => text ? text.split(/\s+/).filter(Boolean).length : 0;
  const totalWords = wordsCount(getHeadline()) + wordsCount(getOverview()) + getKeyPoints().reduce((acc: number, kp: string) => acc + wordsCount(kp), 0);
  const readingTime = Math.max(1, Math.ceil(totalWords / 200));

  // -------------------------------------------------------------
  // EDIT HANDLERS
  // -------------------------------------------------------------
  const handleArrayChange = (field: string, index: number, value: any) => {
    const array = [...(content[field] || [])];
    array[index] = value;
    onChange(field, array);
  };

  const handleActionItemChange = (index: number, subField: string, value: any) => {
    const array = [...getActionItems()];
    array[index] = { ...array[index], [subField]: value };
    onChange('action_items', array);
  };

  const addArrayItem = (field: string, defaultValue: any) => {
    const array = [...(content[field] || []), defaultValue];
    onChange(field, array);
  };

  const removeArrayItem = (field: string, index: number) => {
    const array = [...(content[field] || [])];
    array.splice(index, 1);
    onChange(field, array);
  };

  const renderInput = (value: string, onChangeText: (v: string) => void, label: string, placeholder?: string) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChangeText(e.target.value)}
        placeholder={placeholder}
        disabled={!canEdit}
        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all text-gray-900 dark:text-white disabled:opacity-75"
      />
    </div>
  );

  const renderTextarea = (value: string, onChangeText: (v: string) => void, label: string) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <textarea
        value={value || ''}
        onChange={(e) => onChangeText(e.target.value)}
        disabled={!canEdit}
        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all text-gray-900 dark:text-white disabled:opacity-75 min-h-[100px]"
      />
    </div>
  );

  const SectionHeader = ({ title, sectionId, count }: { title: string, sectionId: string, count?: number }) => (
    <button 
      onClick={() => toggleSection(sectionId)} 
      className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition border-b border-gray-200 dark:border-gray-700"
    >
      <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
        {title} {count !== undefined && <span className="text-sm font-normal text-gray-500 ml-2">({count})</span>}
      </h3>
      <svg className={`w-5 h-5 transform transition-transform ${expandedSections[sectionId] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
    </button>
  );

  const renderEditMode = () => (
    <div className="space-y-6">
      
      {/* Overview Stats */}
      <div className="flex gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-xl">
        <div className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 flex-1">
          <span className="block text-2xl font-black">{getKeyPoints().length}</span> Key Points
        </div>
        <div className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 flex-1">
          <span className="block text-2xl font-black">{getActionItems().length}</span> Action Items
        </div>
        <div className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 flex-1">
          <span className="block text-2xl font-black">~{readingTime}m</span> Est. Reading Time
        </div>
      </div>

      {/* Summary Details */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <SectionHeader title="Summary Details" sectionId="details" />
        {expandedSections.details && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderInput(content.target_audience || '', (v) => onChange('target_audience', v), 'Target Audience', 'e.g. Decision Makers')}
            {renderInput(content.communication_objective || '', (v) => onChange('communication_objective', v), 'Objective', 'e.g. Briefing')}
            {renderInput(content.level_of_detail || '', (v) => onChange('level_of_detail', v), 'Level of Detail', 'e.g. Concise')}
          </div>
        )}
      </div>

      {/* Executive Overview */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <SectionHeader title="Executive Overview" sectionId="overview" />
        {expandedSections.overview && (
          <div className="p-6 space-y-4">
            {renderInput(getHeadline(), (v) => onChange('headline', v), 'Headline')}
            {renderTextarea(getOverview(), (v) => onChange('executive_overview', v), 'Executive Overview')}
          </div>
        )}
      </div>

      {/* Key Points */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <SectionHeader title="Key Points" sectionId="key_points" count={getKeyPoints().length} />
        {expandedSections.key_points && (
          <div className="p-6 space-y-3">
            {getKeyPoints().map((kp: string, idx: number) => (
              <div key={idx} className="flex gap-2 items-start">
                <span className="font-bold text-gray-400 mt-2">{idx + 1}.</span>
                <textarea
                  value={kp}
                  onChange={(e) => handleArrayChange('key_points', idx, e.target.value)}
                  disabled={!canEdit}
                  className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                {canEdit && (
                  <button onClick={() => removeArrayItem('key_points', idx)} className="text-red-500 hover:text-red-700 p-2">✕</button>
                )}
              </div>
            ))}
            {canEdit && (
              <button onClick={() => addArrayItem('key_points', '')} className="text-emerald-600 font-semibold text-sm hover:underline">+ Add Key Point</button>
            )}
          </div>
        )}
      </div>

      {/* Action Items */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <SectionHeader title="Action Items" sectionId="actions" count={getActionItems().length} />
        {expandedSections.actions && (
          <div className="p-6 space-y-4">
            {getActionItems().map((a: any, idx: number) => (
              <div key={idx} className="p-4 bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/50 rounded-lg relative">
                {canEdit && (
                  <button onClick={() => removeArrayItem('action_items', idx)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-bold">✕</button>
                )}
                {renderInput(a.action || '', (v) => handleActionItemChange(idx, 'action', v), `Action Item ${idx + 1}`)}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {renderInput(a.priority || '', (v) => handleActionItemChange(idx, 'priority', v), 'Priority')}
                  {renderInput(a.responsible_role || '', (v) => handleActionItemChange(idx, 'responsible_role', v), 'Responsible Role')}
                  {renderInput(a.timeframe || '', (v) => handleActionItemChange(idx, 'timeframe', v), 'Timeframe')}
                </div>
                {renderInput(a.rationale || '', (v) => handleActionItemChange(idx, 'rationale', v), 'Rationale')}
              </div>
            ))}
            {canEdit && (
              <button onClick={() => addArrayItem('action_items', {action: ''})} className="text-emerald-600 font-semibold text-sm hover:underline">+ Add Action Item</button>
            )}
          </div>
        )}
      </div>

      {/* Source Evidence */}
      {getCitations().length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
          <SectionHeader title="Source Evidence" sectionId="evidence" count={getCitations().length} />
          {expandedSections.evidence && (
            <div className="p-6">
              <EvidencePanel citations={getCitations()} title="Summary Evidence" />
            </div>
          )}
        </div>
      )}

      {/* Content Warnings */}
      {getWarnings().length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/50 rounded-xl overflow-hidden shadow-sm">
          <SectionHeader title="Content Warnings" sectionId="warnings" count={getWarnings().length} />
          {expandedSections.warnings && (
            <div className="p-6">
              <ul className="list-disc pl-5 text-sm text-red-600 dark:text-red-400 space-y-1">
                {getWarnings().map((w: string, idx: number) => <li key={idx}>{w}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

    </div>
  );

  const renderPreviewMode = () => (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 p-8 md:p-12 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl font-serif text-gray-900 dark:text-gray-100 leading-relaxed">
      
      {/* Header */}
      <div className="border-b-4 border-gray-900 dark:border-gray-100 pb-8 mb-8 text-center">
        <h3 className="uppercase tracking-widest text-xs font-bold text-gray-500 dark:text-gray-400 mb-4 font-sans">
          Executive Briefing
        </h3>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight font-sans">
          {getHeadline() || 'EXECUTIVE SUMMARY'}
        </h1>
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs font-sans uppercase tracking-wider text-gray-600 dark:text-gray-400">
          {content.target_audience && <span>Audience: <strong className="text-gray-900 dark:text-gray-100">{content.target_audience}</strong></span>}
          {content.communication_objective && <span>Objective: <strong className="text-gray-900 dark:text-gray-100">{content.communication_objective}</strong></span>}
          {content.level_of_detail && <span>Detail: <strong className="text-gray-900 dark:text-gray-100">{content.level_of_detail}</strong></span>}
        </div>
      </div>

      {/* Overview */}
      {getOverview() && (
        <div className="mb-10">
          <h2 className="text-xl font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-4 font-sans border-b border-gray-200 dark:border-gray-700 pb-2">Executive Overview</h2>
          <p className="text-lg">{getOverview()}</p>
        </div>
      )}

      {/* Key Points */}
      {getKeyPoints().length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-4 font-sans border-b border-gray-200 dark:border-gray-700 pb-2">Key Findings</h2>
          <ul className="list-disc pl-6 space-y-3">
            {getKeyPoints().map((kp: string, idx: number) => (
              <li key={idx} className="text-base md:text-lg pl-2">{kp}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Items */}
      {getActionItems().length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-4 font-sans border-b border-gray-200 dark:border-gray-700 pb-2">Action Items</h2>
          <div className="space-y-6 font-sans">
            {getActionItems().map((a: any, idx: number) => (
              <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-lg">{a.action}</h4>
                  {a.priority && !a.priority.includes('Not specified') && (
                    <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-2 py-1 rounded">
                      {a.priority}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {a.responsible_role && !a.responsible_role.includes('Not specified') && <div><strong className="text-gray-700 dark:text-gray-300">Responsible:</strong> {a.responsible_role}</div>}
                  {a.timeframe && !a.timeframe.includes('Not specified') && <div><strong className="text-gray-700 dark:text-gray-300">Timeframe:</strong> {a.timeframe}</div>}
                </div>
                {a.rationale && <p className="text-sm italic">{a.rationale}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata Bottom */}
      <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 font-sans text-sm text-gray-500 dark:text-gray-400">
        <p>Total Words: {totalWords} • Estimated Reading Time: {readingTime} min</p>
        
        {/* Warnings */}
        {getWarnings().length > 0 && (
          <div className="mt-6 p-4 border border-red-200 bg-red-50 dark:bg-red-900/10 rounded-lg">
            <h3 className="font-bold uppercase text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              Intelligence Gaps / Content Warnings
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
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${viewMode === 'edit' ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}
        >
          Edit Mode
        </button>
        <button
          onClick={() => setViewMode('preview')}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}
        >
          Briefing Preview
        </button>
      </div>

      <div className="transition-all duration-300">
        {viewMode === 'edit' && renderEditMode()}
        {viewMode === 'preview' && renderPreviewMode()}
      </div>
    </div>
  );
};
