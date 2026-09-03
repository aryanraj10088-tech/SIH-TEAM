import React, { useState } from 'react';
import { EvidencePanel } from './EvidencePanel';

interface LinkedInEditorProps {
  content: any;
  onChange: (key: string, value: any) => void;
  canEdit: boolean;
}

export const LinkedInEditor: React.FC<LinkedInEditorProps> = ({ content, onChange, canEdit }) => {
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    details: true,
    content: true,
    evidence: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // -------------------------------------------------------------
  // FALLBACK GETTERS (Backward Compatibility)
  // -------------------------------------------------------------
  const getHook = () => content.hook || '';
  const getBody = () => content.body || '';
  const getHashtags = () => content.hashtags || [];
  const getCitations = () => content.citations || [];
  const getImagePrompts = () => content.image_prompts || [];
  const getWarnings = () => content.content_warnings || [];

  // Length guidance calculations
  const hookLength = getHook().length;
  const bodyLength = getBody().length;

  const getLengthGuide = (len: number, min: number, max: number) => {
    if (len === 0) return { label: 'Empty', color: 'text-gray-400' };
    if (len < min) return { label: 'Concise', color: 'text-green-600 dark:text-green-400' };
    if (len <= max) return { label: 'Moderate', color: 'text-yellow-600 dark:text-yellow-400' };
    return { label: 'Long', color: 'text-red-600 dark:text-red-400' };
  };

  const hookGuide = getLengthGuide(hookLength, 100, 200);
  const bodyGuide = getLengthGuide(bodyLength, 800, 1500);

  // -------------------------------------------------------------
  // EDIT HANDLERS
  // -------------------------------------------------------------
  const handleHashtagsChange = (value: string) => {
    // split by space or comma, add # if missing
    const tags = value.split(/[\s,]+/).filter(Boolean).map(t => t.startsWith('#') ? t : `#${t}`);
    // deduplicate
    onChange('hashtags', Array.from(new Set(tags)));
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
        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 dark:text-white disabled:opacity-75"
      />
    </div>
  );

  const renderTextarea = (value: string, onChangeText: (v: string) => void, label: string, guide?: {label: string, color: string}) => (
    <div className="mb-4">
      <div className="flex justify-between items-end mb-1">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
        {guide && <span className={`text-xs font-bold uppercase tracking-wider ${guide.color}`}>{guide.label} ({value?.length || 0} chars)</span>}
      </div>
      <textarea
        value={value || ''}
        onChange={(e) => onChangeText(e.target.value)}
        disabled={!canEdit}
        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 dark:text-white disabled:opacity-75 min-h-[120px] whitespace-pre-wrap"
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
      
      {/* Post Details */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <SectionHeader title="Post Details" sectionId="details" />
        {expandedSections.details && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput(content.target_audience || '', (v) => onChange('target_audience', v), 'Target Audience', 'e.g. Technology Professionals')}
            {renderInput(content.tone || '', (v) => onChange('tone', v), 'Tone', 'e.g. Educational')}
            {renderInput(content.communication_objective || '', (v) => onChange('communication_objective', v), 'Objective', 'e.g. Raise awareness')}
            {renderInput(content.language || '', (v) => onChange('language', v), 'Language', 'e.g. English')}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <SectionHeader title="Post Content" sectionId="content" />
        {expandedSections.content && (
          <div className="p-6 space-y-4">
            {renderTextarea(getHook(), (v) => onChange('hook', v), 'Hook', hookGuide)}
            {renderTextarea(getBody(), (v) => onChange('body', v), 'Body', bodyGuide)}
            {renderInput(content.call_to_action || '', (v) => onChange('call_to_action', v), 'Call to Action (Optional)', 'e.g. Read the full report')}
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Hashtags (space separated)</label>
              <input
                type="text"
                value={getHashtags().join(' ')}
                onChange={(e) => handleHashtagsChange(e.target.value)}
                disabled={!canEdit}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-blue-600 dark:text-blue-400 font-mono disabled:opacity-75"
              />
            </div>
          </div>
        )}
      </div>

      {/* Source Evidence */}
      {getCitations().length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
          <SectionHeader title="Source Evidence" sectionId="evidence" count={getCitations().length} />
          {expandedSections.evidence && (
            <div className="p-6">
              <EvidencePanel citations={getCitations()} title="Post Evidence" />
            </div>
          )}
        </div>
      )}

      {/* Image Prompts */}
      {getImagePrompts().length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
          <SectionHeader title="Image Prompts" sectionId="images" count={getImagePrompts().length} />
          {expandedSections.images && (
            <div className="p-6 space-y-3">
              {getImagePrompts().map((prompt: string, idx: number) => (
                <div key={idx} className="p-3 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg text-sm text-purple-900 dark:text-purple-300 italic">
                  {prompt}
                </div>
              ))}
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
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden font-sans">
        
        {/* LinkedIn Header Mock */}
        <div className="flex items-center p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 mr-4 flex-shrink-0"></div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Official Organization</h3>
            <p className="text-xs text-gray-500">Just now • 🌐</p>
          </div>
        </div>

        {/* Post Content */}
        <div className="p-4 text-gray-900 dark:text-gray-100 text-sm md:text-base whitespace-pre-wrap leading-relaxed">
          {/* Hook */}
          {getHook() && <p className="font-bold mb-4">{getHook()}</p>}
          
          {/* Body */}
          {getBody() && <p className="mb-4 opacity-90">{getBody()}</p>}
          
          {/* CTA */}
          {content.call_to_action && <p className="mb-4 font-semibold text-blue-600 dark:text-blue-400">👉 {content.call_to_action}</p>}
          
          {/* Hashtags */}
          {getHashtags().length > 0 && (
            <p className="text-blue-600 dark:text-blue-400 font-medium">
              {getHashtags().join(' ')}
            </p>
          )}
        </div>

        {/* Meta / Placeholder Image */}
        <div className="bg-gray-100 dark:bg-gray-800 h-64 w-full flex items-center justify-center border-t border-gray-200 dark:border-gray-700">
          {getImagePrompts().length > 0 ? (
            <p className="text-gray-400 dark:text-gray-500 italic text-sm text-center px-6">
              [ Generative Visual Attached ]
            </p>
          ) : (
            <p className="text-gray-400 dark:text-gray-500 italic text-sm">
              [ No Visual ]
            </p>
          )}
        </div>
      </div>

      {/* Metadata tags */}
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        {content.target_audience && <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-500">Audience: {content.target_audience}</span>}
        {content.tone && <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-500">Tone: {content.tone}</span>}
        {content.communication_objective && <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-500">Goal: {content.communication_objective}</span>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* View Toggles */}
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit mx-auto md:mx-0">
        <button
          onClick={() => setViewMode('edit')}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${viewMode === 'edit' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}
        >
          Edit Mode
        </button>
        <button
          onClick={() => setViewMode('preview')}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}
        >
          Post Preview
        </button>
      </div>

      <div className="transition-all duration-300">
        {viewMode === 'edit' && renderEditMode()}
        {viewMode === 'preview' && renderPreviewMode()}
      </div>
    </div>
  );
};
