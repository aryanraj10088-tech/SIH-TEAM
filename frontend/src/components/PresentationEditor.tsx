import React, { useState } from 'react';
import { EvidencePanel } from './EvidencePanel';

interface PresentationEditorProps {
  content: any;
  onChange: (key: string, value: any) => void;
  canEdit: boolean;
}

export const PresentationEditor: React.FC<PresentationEditorProps> = ({ content, onChange, canEdit }) => {
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Fallback getters for backward compatibility
  const getTitle = () => content.title || '';
  const getObjective = () => content.objective || '';
  const getTargetAudience = () => content.target_audience || '';
  const getOverallTakeaway = () => content.overall_takeaway || '';
  const getNarrativeStructure = () => content.narrative_structure || '';
  const getSlides = () => content.slides || [];
  const getDesignRecs = () => content.design_recommendations || {};

  const handleSlideChange = (index: number, field: string, value: any) => {
    const newSlides = [...getSlides()];
    newSlides[index] = { ...newSlides[index], [field]: value };
    onChange('slides', newSlides);
  };

  const handleDesignChange = (field: string, value: any) => {
    onChange('design_recommendations', { ...getDesignRecs(), [field]: value });
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

  const renderPreview = () => {
    const slides = getSlides();
    if (slides.length === 0) return <div className="text-center p-8 text-gray-500">No slides to preview.</div>;
    
    const slide = slides[currentSlideIndex];
    const layout = slide.layout?.toLowerCase() || 'single_column';
    const slideType = slide.slide_type?.toLowerCase() || 'content';

    return (
      <div className="flex flex-col items-center">
        {/* Slide Canvas */}
        <div className="w-full max-w-4xl aspect-[16/9] bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden flex flex-col relative text-gray-800">
          
          {/* Header */}
          <div className="px-10 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="text-3xl font-bold text-gray-900">{slide.title || 'Untitled Slide'}</h2>
            {slideType !== 'title' && <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">{slideType}</span>}
          </div>

          {/* Body */}
          <div className="flex-1 p-10 flex flex-col gap-6 overflow-y-auto">
            
            {slide.key_takeaway && (
              <div className="text-xl font-medium text-gray-700 mb-4 border-l-4 border-indigo-500 pl-4 py-1">
                {slide.key_takeaway}
              </div>
            )}

            <div className={`flex-1 ${
              layout === 'two_column' || layout === 'comparison' ? 'grid grid-cols-2 gap-8' : 
              layout === 'three_metric_cards' || layout === 'statistics' ? 'grid grid-cols-1 md:grid-cols-3 gap-6' : 
              'flex flex-col gap-6'
            }`}>
              
              {/* Bullet Points */}
              {slide.bullet_points && slide.bullet_points.length > 0 && (
                <div className="space-y-3">
                  <ul className="list-disc pl-6 space-y-3 text-lg text-gray-600 marker:text-indigo-500">
                    {slide.bullet_points.map((bp: string, idx: number) => (
                      <li key={idx}>{bp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Data Points */}
              {slide.data_points && slide.data_points.length > 0 && (
                <div className={`space-y-4 ${layout === 'statistics' || layout === 'three_metric_cards' ? 'col-span-full grid grid-cols-1 md:grid-cols-3 gap-6 space-y-0' : ''}`}>
                  {slide.data_points.map((dp: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 border border-gray-200 p-4 rounded-xl shadow-sm text-center flex flex-col justify-center">
                      {dp.availability === 'insufficient_source_data' ? (
                        <span className="text-sm font-semibold text-red-500 uppercase">Data Unavailable</span>
                      ) : (
                        <span className="text-4xl font-black text-indigo-600 mb-2">{dp.value || '—'}</span>
                      )}
                      <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{dp.label}</span>
                    </div>
                  ))}
                </div>
              )}
              
            </div>

            {/* Visual Suggestion Placeholder */}
            {slide.visual_suggestion && (
              <div className="mt-auto bg-gray-100 border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center text-gray-500">
                <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <span className="text-sm font-bold uppercase tracking-widest mb-1">AI Visual Suggestion</span>
                <span className="text-base text-gray-700 mb-2">{slide.visual_suggestion}</span>
                <span className="text-xs text-gray-400 font-medium bg-gray-200/50 px-3 py-1 rounded-full">(Image generation not included - insert your own asset here)</span>
              </div>
            )}
            
            {slide.content_warnings && slide.content_warnings.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                <strong>Warning:</strong> {slide.content_warnings.join(', ')}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-10 py-4 border-t border-gray-100 flex justify-between text-xs text-gray-400 font-medium">
            <span>{getTitle()}</span>
            <span>Slide {slide.slide_number || currentSlideIndex + 1}</span>
          </div>
        </div>

        {/* Slide Controls */}
        <div className="mt-6 flex items-center justify-center gap-6">
          <button 
            onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
            disabled={currentSlideIndex === 0}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-700 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {currentSlideIndex + 1} / {slides.length}
          </span>
          <button 
            onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
            disabled={currentSlideIndex === slides.length - 1}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-700 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>

        {/* Speaker Notes */}
        {slide.speaker_notes && (
          <div className="mt-8 w-full max-w-4xl bg-yellow-50 dark:bg-gray-800 border-l-4 border-yellow-400 dark:border-yellow-600 p-6 rounded-r-lg shadow-sm">
            <h3 className="text-sm font-bold text-yellow-800 dark:text-yellow-500 uppercase tracking-widest mb-2">Speaker Notes</h3>
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{slide.speaker_notes}</p>
          </div>
        )}
        
        {/* Source Reference */}
        {slide.source_reference && (
          <div className="mt-4 w-full max-w-4xl text-xs text-gray-500 text-center">
            Source: {slide.source_reference}
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
          Edit Content
        </button>
        <button
          onClick={() => setViewMode('preview')}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}
        >
          Slide Preview
        </button>
      </div>

      {viewMode === 'preview' ? (
        <div className="bg-gray-100 dark:bg-gray-900 p-4 md:p-8 rounded-xl border border-gray-200 dark:border-gray-800">
          {renderPreview()}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Presentation Info */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">Presentation Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput(getTitle(), (v) => onChange('title', v), 'Presentation Title')}
              {renderInput(getTargetAudience(), (v) => onChange('target_audience', v), 'Target Audience')}
            </div>
            {renderInput(getObjective(), (v) => onChange('objective', v), 'Objective')}
            {renderTextarea(getOverallTakeaway(), (v) => onChange('overall_takeaway', v), 'Overall Takeaway')}
            {renderTextarea(getNarrativeStructure(), (v) => onChange('narrative_structure', v), 'Narrative Structure')}
          </div>

          {/* Design Recommendations */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">Design Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput(getDesignRecs().presentation_style, (v) => handleDesignChange('presentation_style', v), 'Style')}
              {renderInput(getDesignRecs().typography_hierarchy, (v) => handleDesignChange('typography_hierarchy', v), 'Typography')}
              {renderInput(getDesignRecs().readability, (v) => handleDesignChange('readability', v), 'Readability')}
              {renderInput(getDesignRecs().visual_consistency, (v) => handleDesignChange('visual_consistency', v), 'Visual Consistency')}
            </div>
          </div>

          {/* Slides */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-xl border-b dark:border-gray-700 pb-2">Slides</h3>
            {getSlides().map((slide: any, index: number) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative">
                <div className="absolute -left-3 -top-3 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                  {slide.slide_number || index + 1}
                </div>
                
                <div className="mt-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Slide Title</label>
                      <input
                        type="text"
                        value={slide.title || ''}
                        onChange={(e) => handleSlideChange(index, 'title', e.target.value)}
                        disabled={!canEdit}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Slide Type</label>
                      <input
                        type="text"
                        value={slide.slide_type || ''}
                        onChange={(e) => handleSlideChange(index, 'slide_type', e.target.value)}
                        disabled={!canEdit}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Layout</label>
                      <input
                        type="text"
                        value={slide.layout || ''}
                        onChange={(e) => handleSlideChange(index, 'layout', e.target.value)}
                        disabled={!canEdit}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Key Takeaway</label>
                      <input
                        type="text"
                        value={slide.key_takeaway || ''}
                        onChange={(e) => handleSlideChange(index, 'key_takeaway', e.target.value)}
                        disabled={!canEdit}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  {/* Bullet Points edit */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Bullet Points</label>
                    <div className="space-y-2">
                      {(slide.bullet_points || []).map((bp: string, bpIndex: number) => (
                        <div key={bpIndex} className="flex gap-2">
                          <textarea
                            value={bp}
                            onChange={(e) => {
                              const newBp = [...(slide.bullet_points || [])];
                              newBp[bpIndex] = e.target.value;
                              handleSlideChange(index, 'bullet_points', newBp);
                            }}
                            disabled={!canEdit}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white min-h-[40px]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Data Points edit */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Data Points</label>
                    <div className="space-y-2">
                      {(slide.data_points || []).map((dp: any, dpIndex: number) => (
                        <div key={dpIndex} className="grid grid-cols-12 gap-2 bg-gray-50 dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="col-span-4">
                            <input
                              placeholder="Value (or empty if none)"
                              value={dp.value || ''}
                              onChange={(e) => {
                                const newDp = [...(slide.data_points || [])];
                                newDp[dpIndex] = { ...dp, value: e.target.value };
                                handleSlideChange(index, 'data_points', newDp);
                              }}
                              disabled={!canEdit}
                              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white"
                            />
                          </div>
                          <div className="col-span-5">
                            <input
                              placeholder="Label"
                              value={dp.label || ''}
                              onChange={(e) => {
                                const newDp = [...(slide.data_points || [])];
                                newDp[dpIndex] = { ...dp, label: e.target.value };
                                handleSlideChange(index, 'data_points', newDp);
                              }}
                              disabled={!canEdit}
                              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white"
                            />
                          </div>
                          <div className="col-span-3">
                            <select
                              value={dp.availability || 'available'}
                              onChange={(e) => {
                                const newDp = [...(slide.data_points || [])];
                                newDp[dpIndex] = { ...dp, availability: e.target.value };
                                handleSlideChange(index, 'data_points', newDp);
                              }}
                              disabled={!canEdit}
                              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white"
                            >
                              <option value="available">Available</option>
                              <option value="insufficient_source_data">Unavailable</option>
                            </select>
                          </div>
                        </div>
                      ))}
                      {(slide.data_points || []).length === 0 && (
                        <p className="text-sm text-gray-500 italic">No explicit data points for this slide.</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Visual Suggestion</label>
                      <textarea
                        value={slide.visual_suggestion || ''}
                        onChange={(e) => handleSlideChange(index, 'visual_suggestion', e.target.value)}
                        disabled={!canEdit}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white min-h-[80px]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Speaker Notes</label>
                      <textarea
                        value={slide.speaker_notes || ''}
                        onChange={(e) => handleSlideChange(index, 'speaker_notes', e.target.value)}
                        disabled={!canEdit}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white min-h-[80px]"
                      />
                    </div>
                  </div>
                  
                  {slide.source_reference && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Source Reference</label>
                      <input
                        type="text"
                        value={slide.source_reference || ''}
                        onChange={(e) => handleSlideChange(index, 'source_reference', e.target.value)}
                        disabled={!canEdit}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                  )}

                  <EvidencePanel citations={slide.citations} title="Slide Evidence" compact />

                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
