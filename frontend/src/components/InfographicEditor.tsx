import React, { useState } from 'react';
import { EvidencePanel } from './EvidencePanel';

interface InfographicEditorProps {
  content: any;
  onChange: (key: string, value: any) => void;
  canEdit: boolean;
}

export const InfographicEditor: React.FC<InfographicEditorProps> = ({ content, onChange, canEdit }) => {
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  // fallback getters for backward compatibility
  const getTitle = () => content.title || '';
  const getCoreTakeaway = () => content.core_takeaway || content.main_message || '';
  const getSections = () => content.sections || [];
  const getLayout = () => content.layout || { orientation: 'portrait', type: 'cards', structure: '' };

  const handleSectionChange = (index: number, field: string, value: any) => {
    const newSections = [...getSections()];
    newSections[index] = { ...newSections[index], [field]: value };
    onChange('sections', newSections);
  };

  const renderTextarea = (value: string, onChangeText: (v: string) => void, label: string) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <textarea
        value={value || ''}
        onChange={(e) => onChangeText(e.target.value)}
        disabled={!canEdit}
        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all text-gray-900 dark:text-white disabled:opacity-75 min-h-[60px]"
      />
    </div>
  );

  const renderPreview = () => {
    const layoutType = getLayout().type?.toLowerCase() || 'cards';
    
    return (
      <div className={`p-8 bg-white border shadow-sm ${getLayout().orientation === 'landscape' ? 'max-w-5xl' : 'max-w-2xl'} mx-auto font-sans text-gray-800`}>
        <div className="text-center mb-10 border-b pb-6">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{getTitle()}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{getCoreTakeaway()}</p>
        </div>

        {/* Semantic Layout Rendering based on type */}
        <div className={`
          ${layoutType === 'cards' || layoutType === 'statistics' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : ''}
          ${layoutType === 'timeline' || layoutType === 'process' ? 'space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent' : ''}
          ${layoutType === 'comparison' ? 'grid grid-cols-2 gap-8 divide-x divide-gray-200' : 'space-y-6'}
        `}>
          {getSections().map((section: any, idx: number) => (
            <div key={idx} className={`
              relative p-6 rounded-xl border bg-gray-50 
              ${(layoutType === 'timeline' || layoutType === 'process') ? 'md:w-5/12 ml-10 md:ml-0 md:even:ml-auto' : ''}
            `}>
              {(layoutType === 'timeline' || layoutType === 'process') && (
                <div className="absolute left-[-2rem] md:left-[-3rem] top-6 w-6 h-6 rounded-full bg-indigo-500 border-4 border-white shadow"></div>
              )}
              
              <h3 className="text-xl font-bold text-indigo-700 mb-2">
                {section.section_number ? `${section.section_number}. ` : ''}{section.title}
              </h3>
              {section.main_message && <p className="font-semibold text-gray-700 mb-4">{section.main_message}</p>}
              
              {/* Support old data_points (string[]) and new key_data_points (object[]) */}
              {(section.key_data_points || section.data_points || []).length > 0 && (
                <div className="mb-4 space-y-3">
                  {(section.key_data_points || section.data_points).map((dp: any, dpIdx: number) => {
                    if (typeof dp === 'string') {
                      return <div key={dpIdx} className="bg-white p-3 rounded shadow-sm border border-gray-100 text-sm">{dp}</div>;
                    }
                    return (
                      <div key={dpIdx} className="bg-white p-3 rounded shadow-sm border border-gray-100">
                        <div className="flex items-end gap-2 mb-1">
                          <span className="text-2xl font-black text-indigo-600">{dp.value}</span>
                          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{dp.label}</span>
                        </div>
                        <p className="text-sm text-gray-600">{dp.context_explanation}</p>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {section.supporting_explanation && <p className="text-sm text-gray-600 mb-4">{section.supporting_explanation}</p>}
              
              <div className="flex gap-2 items-center text-xs font-medium text-teal-700 bg-teal-50 px-3 py-2 rounded-md">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Visual Rec: {section.recommended_visual_type || 'icon'} ({section.visual_metaphor || 'N/A'})
              </div>
            </div>
          ))}
        </div>

        {/* Sources Footer */}
        {content.sources && content.sources.length > 0 && (
          <div className="mt-12 pt-6 border-t border-gray-200 text-xs text-gray-500">
            <h4 className="font-bold uppercase tracking-widest mb-2">Sources</h4>
            <ul className="space-y-1">
              {content.sources.map((src: any, idx: number) => (
                <li key={idx}>[{idx + 1}] {src.reference} - {src.url_or_location}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit mb-6">
        <button
          onClick={() => setViewMode('edit')}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${viewMode === 'edit' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}
        >
          Edit Data
        </button>
        <button
          onClick={() => setViewMode('preview')}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}
        >
          Visual Preview
        </button>
      </div>

      {viewMode === 'preview' ? (
        <div className="bg-gray-50 dark:bg-gray-900 p-4 md:p-8 rounded-xl overflow-x-auto border border-gray-200 dark:border-gray-700">
          {renderPreview()}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main Info */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">Basic Information</h3>
            {renderTextarea(getTitle(), (v) => onChange('title', v), 'Infographic Title')}
            {renderTextarea(getCoreTakeaway(), (v) => {
              if (content.core_takeaway !== undefined) onChange('core_takeaway', v);
              else onChange('main_message', v); // backward compatibility
            }, 'Core Takeaway Message')}
          </div>

          {/* Sections */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-xl border-b dark:border-gray-700 pb-2">Sections</h3>
            {getSections().map((section: any, index: number) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative">
                <div className="absolute -left-3 -top-3 w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold shadow-md">
                  {section.section_number || index + 1}
                </div>
                
                <div className="mt-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Section Title</label>
                      <input
                        type="text"
                        value={section.title || ''}
                        onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                        disabled={!canEdit}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Visual Metaphor</label>
                      <input
                        type="text"
                        value={section.visual_metaphor || ''}
                        onChange={(e) => handleSectionChange(index, 'visual_metaphor', e.target.value)}
                        disabled={!canEdit}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {section.main_message !== undefined && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Main Message</label>
                      <textarea
                        value={section.main_message || ''}
                        onChange={(e) => handleSectionChange(index, 'main_message', e.target.value)}
                        disabled={!canEdit}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white min-h-[60px]"
                      />
                    </div>
                  )}
                  
                  {/* Handle Data Points edit */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Key Data Points</label>
                    <div className="space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                      {(section.key_data_points || section.data_points || []).map((dp: any, dpIndex: number) => (
                        <div key={dpIndex} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                          {typeof dp === 'string' ? (
                            <textarea
                              value={dp}
                              onChange={(e) => {
                                const newDp = [...(section.data_points || [])];
                                newDp[dpIndex] = e.target.value;
                                handleSectionChange(index, 'data_points', newDp);
                              }}
                              disabled={!canEdit}
                              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white"
                            />
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              <input 
                                placeholder="Value (e.g. 40%)"
                                value={dp.value || ''} 
                                onChange={(e) => {
                                  const newDp = [...(section.key_data_points || [])];
                                  newDp[dpIndex] = { ...dp, value: e.target.value };
                                  handleSectionChange(index, 'key_data_points', newDp);
                                }}
                                disabled={!canEdit}
                                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm font-bold text-gray-900 dark:text-white"
                              />
                              <input 
                                placeholder="Label"
                                value={dp.label || ''} 
                                onChange={(e) => {
                                  const newDp = [...(section.key_data_points || [])];
                                  newDp[dpIndex] = { ...dp, label: e.target.value };
                                  handleSectionChange(index, 'key_data_points', newDp);
                                }}
                                disabled={!canEdit}
                                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white"
                              />
                              <textarea 
                                placeholder="Context / Explanation"
                                value={dp.context_explanation || ''} 
                                onChange={(e) => {
                                  const newDp = [...(section.key_data_points || [])];
                                  newDp[dpIndex] = { ...dp, context_explanation: e.target.value };
                                  handleSectionChange(index, 'key_data_points', newDp);
                                }}
                                disabled={!canEdit}
                                className="col-span-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <EvidencePanel citations={section.citations} title="Section Evidence" compact />

                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
