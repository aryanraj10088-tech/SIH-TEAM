import React, { useState } from 'react';
import { EvidencePanel } from './EvidencePanel';

interface VideoEditorProps {
  content: any;
  onChange: (key: string, value: any) => void;
  canEdit: boolean;
}

export const VideoEditor: React.FC<VideoEditorProps> = ({ content, onChange, canEdit }) => {
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'script'>('edit');
  const [expandedScenes, setExpandedScenes] = useState<Record<number, boolean>>({});
  const [expandedMeta, setExpandedMeta] = useState(true);

  const toggleScene = (idx: number) => setExpandedScenes(prev => ({ ...prev, [idx]: !prev[idx] }));

  // Fallback getters for robust backward compatibility
  const getScenes = () => content.scenes || [];
  const getTitle = () => content.title || '';
  const getObjective = () => content.objective || '';
  const getTargetAudience = () => content.target_audience || '';
  const getTone = () => content.tone || '';
  const getLanguage = () => content.language || '';
  const getOverallMessage = () => content.overall_message || '';
  const getGlobalPacing = () => content.global_pacing || '';
  const getContentWarnings = () => content.content_warnings || [];

  const handleSceneChange = (index: number, field: string, value: any) => {
    const newScenes = [...getScenes()];
    newScenes[index] = { ...newScenes[index], [field]: value };
    onChange('scenes', newScenes);
  };

  // Helper to parse duration string/int to total seconds for calculation
  const parseDurationSeconds = (dur: any): number => {
    if (typeof dur === 'number') return dur;
    if (!dur) return 0;
    const s = String(dur).toLowerCase();
    const match = s.match(/(\d+)\s*(s|sec|m|min)?/g);
    if (!match) return 0;
    let total = 0;
    for (const m of match) {
      const val = parseFloat(m);
      if (m.includes('m')) total += val * 60;
      else total += val; // Default to seconds
    }
    return total;
  };

  const formatDuration = (totalSeconds: number): string => {
    if (totalSeconds === 0) return 'Unknown';
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (m > 0) return `${m}m ${s > 0 ? s + 's' : ''}`;
    return `${s}s`;
  };

  const calculateTotalDuration = () => {
    const scenes = getScenes();
    let total = 0;
    let hasMissing = false;
    for (const s of scenes) {
      const dur = parseDurationSeconds(s.duration);
      if (dur === 0) hasMissing = true;
      total += dur;
    }
    return { total, hasMissing };
  };

  const durationData = calculateTotalDuration();

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

  const renderEditMode = () => (
    <div className="space-y-6">
      
      {/* Video Metadata Panel */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        <button 
          onClick={() => setExpandedMeta(!expandedMeta)} 
          className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">Video Details & Pacing</h3>
          <svg className={`w-5 h-5 transform transition-transform ${expandedMeta ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>
        
        {expandedMeta && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput(getTitle(), (v) => onChange('title', v), 'Video Title')}
              {renderInput(getTargetAudience(), (v) => onChange('target_audience', v), 'Target Audience')}
              {renderInput(getLanguage(), (v) => onChange('language', v), 'Language')}
              {renderInput(getTone(), (v) => onChange('tone', v), 'Tone')}
            </div>
            {renderInput(getObjective(), (v) => onChange('objective', v), 'Objective')}
            {renderTextarea(getOverallMessage(), (v) => onChange('overall_message', v), 'Overall Message')}
            {renderTextarea(getGlobalPacing(), (v) => onChange('global_pacing', v), 'Global Pacing')}
            
            {getContentWarnings().length > 0 && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800/50">
                <span className="font-bold block mb-1">Content Warnings (Global):</span>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {getContentWarnings().map((w: string, idx: number) => <li key={idx}>{w}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scenes Panel */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-800 dark:text-gray-200 text-xl border-b dark:border-gray-700 pb-2 flex items-center justify-between">
          <span>Scenes ({getScenes().length})</span>
          <span className="text-sm font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 px-3 py-1 rounded-full">
            Est. Duration: {formatDuration(durationData.total)} {durationData.hasMissing && '(Incomplete)'}
          </span>
        </h3>
        
        {getScenes().map((scene: any, index: number) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <button 
              onClick={() => toggleScene(index)} 
              className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                  {scene.scene_number || index + 1}
                </span>
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  {scene.scene_title || `Scene ${index + 1}`}
                </span>
                {scene.duration && (
                  <span className="text-xs font-semibold text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                    {scene.duration}
                  </span>
                )}
              </div>
              <svg className={`w-5 h-5 transform transition-transform ${expandedScenes[index] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            
            {expandedScenes[index] && (
              <div className="p-6 space-y-4 border-t border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput(scene.scene_title || '', (v) => handleSceneChange(index, 'scene_title', v), 'Scene Title')}
                  {renderInput(scene.duration || '', (v) => handleSceneChange(index, 'duration', v), 'Duration (e.g. 8s)')}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Visual Description (What appears in scene)</label>
                    <textarea
                      value={scene.visual_description || ''}
                      onChange={(e) => handleSceneChange(index, 'visual_description', e.target.value)}
                      disabled={!canEdit}
                      className="w-full px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white min-h-[80px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Visual Prompt (For AI generation)</label>
                    <textarea
                      value={scene.visual_prompt || ''}
                      onChange={(e) => handleSceneChange(index, 'visual_prompt', e.target.value)}
                      disabled={!canEdit}
                      className="w-full px-4 py-2 bg-fuchsia-50 dark:bg-fuchsia-900/20 border border-fuchsia-200 dark:border-fuchsia-800 rounded-lg focus:ring-2 focus:ring-fuchsia-500 text-gray-900 dark:text-white min-h-[80px]"
                    />
                  </div>
                </div>

                {renderTextarea(scene.narration || '', (v) => handleSceneChange(index, 'narration', v), 'Narration (Spoken script)')}
                {renderTextarea(scene.subtitles || '', (v) => handleSceneChange(index, 'subtitles', v), 'Subtitles')}
                {renderTextarea(scene.on_screen_text || '', (v) => handleSceneChange(index, 'on_screen_text', v), 'On-Screen Text')}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {renderInput(scene.transition || '', (v) => handleSceneChange(index, 'transition', v), 'Transition')}
                  {renderInput(scene.audio_direction || '', (v) => handleSceneChange(index, 'audio_direction', v), 'Audio Direction')}
                  {renderInput(scene.source_reference || '', (v) => handleSceneChange(index, 'source_reference', v), 'Source Reference')}
                </div>
                
                {renderTextarea(scene.editing_notes || '', (v) => handleSceneChange(index, 'editing_notes', v), 'Editing Notes')}
                
                {(scene.content_warnings || []).length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                    <strong>Warning:</strong> {(scene.content_warnings || []).join(', ')}
                  </div>
                )}
                
                <EvidencePanel citations={scene.citations} title="Scene Evidence" compact />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderScriptMode = () => (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm max-w-4xl mx-auto font-serif">
      <div className="text-center mb-10 border-b pb-8">
        <h1 className="text-3xl font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-4">VIDEO SCRIPT</h1>
        <h2 className="text-xl text-gray-600 dark:text-gray-300">{getTitle()}</h2>
        <div className="mt-4 text-sm text-gray-500 uppercase tracking-wider flex justify-center gap-6">
          <span>Target: {getTargetAudience() || 'General'}</span>
          <span>Est. Time: {formatDuration(durationData.total)}</span>
        </div>
      </div>
      
      <div className="space-y-12">
        {getScenes().map((scene: any, idx: number) => (
          <div key={idx} className="flex flex-col md:flex-row gap-6 relative">
            <div className="md:w-1/3 flex flex-col gap-2">
              <div className="font-bold text-gray-800 dark:text-gray-200 border-b border-gray-300 dark:border-gray-600 pb-1 uppercase tracking-wide text-sm">
                SCENE {scene.scene_number || idx + 1}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-sans">
                <strong>VISUAL:</strong> {scene.visual_description || scene.visual_prompt || '—'}
              </div>
              {scene.on_screen_text && (
                <div className="text-sm text-gray-600 dark:text-gray-400 font-sans">
                  <strong>TEXT:</strong> "{scene.on_screen_text}"
                </div>
              )}
            </div>
            
            <div className="md:w-2/3 pl-0 md:pl-6 md:border-l border-gray-200 dark:border-gray-700">
              <div className="font-bold text-gray-900 dark:text-white mb-2 tracking-wide">
                NARRATOR
              </div>
              <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {scene.narration || '[No narration]'}
              </p>
              {scene.audio_direction && (
                <p className="mt-4 text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-sans">
                  [{scene.audio_direction}]
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStoryboardPreview = () => (
    <div className="space-y-10">
      <div className="text-center bg-gray-100 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{getTitle() || 'Video Storyboard'}</h2>
        <div className="flex items-center justify-center gap-4 text-sm font-semibold text-gray-500">
          <span>{getScenes().length} Scenes</span>
          <span>•</span>
          <span>{formatDuration(durationData.total)} Total</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {getScenes().map((scene: any, idx: number) => (
          <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="font-bold text-lg text-gray-900 dark:text-white">
                <span className="text-indigo-600 mr-2">{scene.scene_number || idx + 1}.</span>
                {scene.scene_title || `Scene ${idx + 1}`}
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                {scene.duration || '—'}
              </div>
            </div>
            
            {/* Visual Area */}
            <div className="aspect-video bg-gray-200 dark:bg-gray-800 relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 m-4 rounded-lg">
                <p className="text-sm italic">{scene.visual_description || scene.visual_prompt || 'Visual placeholder'}</p>
              </div>
              {scene.on_screen_text && (
                <div className="absolute inset-x-0 top-8 text-center px-8">
                  <span className="bg-black/50 backdrop-blur-sm text-white font-bold text-xl px-4 py-2 rounded-lg drop-shadow-md">
                    {scene.on_screen_text}
                  </span>
                </div>
              )}
              {scene.subtitles && (
                <div className="absolute inset-x-0 bottom-6 text-center px-8 z-10">
                  <span className="bg-black/75 text-white font-semibold text-sm md:text-base px-3 py-1 rounded shadow-lg">
                    {scene.subtitles}
                  </span>
                </div>
              )}
            </div>

            {/* Narration & Notes */}
            <div className="p-5 flex-1 flex flex-col gap-4">
              <div>
                <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest block mb-1">Narration</span>
                <p className="text-gray-800 dark:text-gray-200 text-sm">{scene.narration || '—'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                {scene.transition && (
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Transition</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{scene.transition}</span>
                  </div>
                )}
                {scene.audio_direction && (
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Audio</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{scene.audio_direction}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
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
          onClick={() => setViewMode('script')}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${viewMode === 'script' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}
        >
          Script View
        </button>
        <button
          onClick={() => setViewMode('preview')}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}
        >
          Storyboard Preview
        </button>
      </div>

      <div className="transition-all duration-300">
        {viewMode === 'edit' && renderEditMode()}
        {viewMode === 'script' && renderScriptMode()}
        {viewMode === 'preview' && renderStoryboardPreview()}
      </div>
    </div>
  );
};
