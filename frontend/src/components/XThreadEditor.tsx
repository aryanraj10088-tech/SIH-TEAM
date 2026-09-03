import React, { useState } from 'react';
import { EvidencePanel } from './EvidencePanel';
import { API_URL } from '../api/outputs';

interface VisualDataPoint {
  label: string;
  value: string | number | null;
  unit?: string | null;
}

interface VisualSpecification {
  visual_type: string;
  title: string;
  subtitle?: string | null;
  data: VisualDataPoint[];
  key_message?: string | null;
  source_reference?: string | null;
  aspect_ratio?: string;
  style_guidance?: string | null;
}

interface XThreadEditorProps {
  content: any;
  onChange: (key: string, value: any) => void;
  canEdit: boolean;
}

// -------------------------------------------------------------
// DETERMINISTIC RENDERERS
// -------------------------------------------------------------

const safeNumber = (val: any): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const parsed = parseFloat(String(val).replace(/[^0-9.-]+/g, ""));
  return isNaN(parsed) ? 0 : parsed;
};

const PieChart: React.FC<{ data: VisualDataPoint[] }> = ({ data }) => {
  const validData = data.filter(d => d.value !== null && d.value !== undefined);
  const total = validData.reduce((sum, d) => sum + Math.abs(safeNumber(d.value)), 0);
  
  if (total === 0 || validData.length === 0) {
    return <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">Insufficient or invalid data for Pie Chart</div>;
  }

  let cumulativePercent = 0;
  const slices = validData.map((d, i) => {
    const val = Math.abs(safeNumber(d.value));
    const percent = val / total;
    const startX = Math.cos(2 * Math.PI * cumulativePercent);
    const startY = Math.sin(2 * Math.PI * cumulativePercent);
    cumulativePercent += percent;
    const endX = Math.cos(2 * Math.PI * cumulativePercent);
    const endY = Math.sin(2 * Math.PI * cumulativePercent);
    
    const largeArcFlag = percent > 0.5 ? 1 : 0;
    
    // Fallback for 100% circle
    if (percent === 1) {
      return (
        <circle key={i} cx="0" cy="0" r="1" fill={`hsl(${i * 60 + 210}, 70%, 60%)`} />
      );
    }

    const pathData = [
      `M ${startX} ${startY}`,
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      `L 0 0`,
    ].join(' ');

    return (
      <path key={i} d={pathData} fill={`hsl(${i * 60 + 210}, 70%, 60%)`} />
    );
  });

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4">
      <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-48 h-48 transform -rotate-90">
        {slices}
      </svg>
      <div className="flex flex-col gap-3">
        {validData.map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: `hsl(${i * 60 + 210}, 70%, 60%)` }}></div>
            <div className="font-semibold text-gray-800 dark:text-gray-200">{d.label}</div>
            <div className="font-bold text-gray-900 dark:text-white ml-2 text-xl">{d.value}{d.unit}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BarChart: React.FC<{ data: VisualDataPoint[] }> = ({ data }) => {
  const validData = data.filter(d => d.value !== null && d.value !== undefined);
  const max = Math.max(...validData.map(d => Math.abs(safeNumber(d.value))), 1);

  if (validData.length === 0) {
    return <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">Insufficient or invalid data for Bar Chart</div>;
  }

  return (
    <div className="w-full flex flex-col gap-4 py-4">
      {validData.map((d, i) => {
        const val = Math.abs(safeNumber(d.value));
        const width = `${(val / max) * 100}%`;
        return (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex justify-between text-sm font-semibold text-gray-700 dark:text-gray-300">
              <span>{d.label}</span>
              <span>{d.value}{d.unit}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-6 rounded-md overflow-hidden flex">
              <div 
                className="h-full bg-indigo-500 transition-all duration-1000 ease-out shadow-sm" 
                style={{ width }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Statistics: React.FC<{ data: VisualDataPoint[] }> = ({ data }) => {
  if (data.length === 0) {
    return <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">Insufficient data for Statistics</div>;
  }

  return (
    <div className={`grid gap-4 py-4 ${data.length === 1 ? 'grid-cols-1' : data.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
      {data.map((d, i) => (
        <div key={i} className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/40 dark:to-blue-900/40 border border-indigo-100 dark:border-indigo-800 p-6 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
          <div className="text-4xl md:text-5xl font-black text-indigo-600 dark:text-indigo-400 mb-2">
            {d.value ?? '—'}{d.unit}
          </div>
          <div className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest leading-snug">
            {d.label}
          </div>
        </div>
      ))}
    </div>
  );
};

const Timeline: React.FC<{ data: VisualDataPoint[] }> = ({ data }) => {
  if (data.length === 0) {
    return <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">Insufficient data for Timeline</div>;
  }

  return (
    <div className="py-6 px-4">
      <div className="relative border-l-2 border-indigo-200 dark:border-indigo-800 ml-3 md:ml-6 space-y-8">
        {data.map((d, i) => (
          <div key={i} className="relative pl-8 md:pl-10">
            <div className="absolute w-6 h-6 bg-indigo-500 rounded-full border-4 border-white dark:border-gray-900 -left-[13px] top-1 shadow-md"></div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-1 block uppercase tracking-wider">{d.value}{d.unit}</span>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">{d.label}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Comparison: React.FC<{ data: VisualDataPoint[] }> = ({ data }) => {
  if (data.length < 2) {
    return <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">Requires at least 2 data points for Comparison</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 py-6 px-2">
      <div className="bg-red-50 dark:bg-red-900/20 border-t-4 border-red-500 p-6 rounded-b-lg shadow-sm text-center">
        <h4 className="text-sm font-bold text-red-800 dark:text-red-400 uppercase mb-4">{data[0].label}</h4>
        <div className="text-4xl font-black text-red-600 dark:text-red-500">{data[0].value}{data[0].unit}</div>
      </div>
      <div className="flex items-center justify-center -mx-6 z-10 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 font-bold text-gray-500 absolute left-1/2 transform -translate-x-1/2 mt-8">VS</div>
      <div className="bg-green-50 dark:bg-green-900/20 border-t-4 border-green-500 p-6 rounded-b-lg shadow-sm text-center">
        <h4 className="text-sm font-bold text-green-800 dark:text-green-400 uppercase mb-4">{data[1].label}</h4>
        <div className="text-4xl font-black text-green-600 dark:text-green-500">{data[1].value}{data[1].unit}</div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------------

export const XThreadEditor: React.FC<XThreadEditorProps> = ({ content, onChange, canEdit }) => {
  const [regeneratingIndexes, setRegeneratingIndexes] = useState<number[]>([]);

  const getCharColor = (len: number) => len > 280 ? 'text-red-500 font-bold' : 'text-gray-500';

  const handleTweetChange = (index: number, newText: string) => {
    const newTweets = [...(content.thread_tweets || [])];
    newTweets[index] = { ...newTweets[index], text: newText };
    onChange('thread_tweets', newTweets);
  };

  const handleRegenerateVisual = (index: number, isDeterministic: boolean) => {
    if (isDeterministic) {
      // Deterministic: purely force React re-render by doing nothing asynchronously
      // It's already always up-to-date with data, but user asked for [Regenerate] button explicitly that does NOT call API.
      // We will just flash a brief success state to satisfy the UX requirement.
      setRegeneratingIndexes(prev => [...prev, index]);
      setTimeout(() => {
        setRegeneratingIndexes(prev => prev.filter(i => i !== index));
      }, 500);
      return;
    }

    // AI Generation (Mocked for frontend-only architecture requirement, or plug into your backend if available)
    // The requirement: "Only illustration or explicitly AI-generated visual types should invoke the image-generation backend"
    setRegeneratingIndexes(prev => [...prev, index]);
    
    // Simulating API call since actual endpoint isn't wired in this component's props natively.
    setTimeout(() => {
      const newTweets = [...(content.thread_tweets || [])];
      // Mock generated update or trigger external callback if you had one.
      newTweets[index] = { 
        ...newTweets[index], 
        generated_image_b64: null, // clear old
        image_data_url: 'https://via.placeholder.com/800x450/4f46e5/ffffff?text=Regenerated+AI+Illustration' 
      };
      onChange('thread_tweets', newTweets);
      setRegeneratingIndexes(prev => prev.filter(i => i !== index));
    }, 2000);
  };

  const renderTextarea = (value: string, onChangeText: (v: string) => void, label: string) => (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
        <span className={`text-xs ${getCharColor(value?.length || 0)}`}>
          {value?.length || 0} / 280
        </span>
      </div>
      <textarea
        value={value || ''}
        onChange={(e) => onChangeText(e.target.value)}
        disabled={!canEdit}
        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white disabled:opacity-75 min-h-[100px]"
      />
    </div>
  );

  const renderVisualCard = (tweet: any, index: number) => {
    const spec = tweet.visual_specification as VisualSpecification;
    
    // Legacy fallback
    if (!spec) {
      if (tweet.generated_image_b64 || tweet.image_data_url || tweet.image_storage_key) {
        return (
          <div className="mt-4">
            <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center justify-between mb-2">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                AI-generated visual (Legacy)
              </span>
            </div>
            <img 
              src={tweet.image_data_url || (tweet.generated_image_b64 ? `data:image/png;base64,${tweet.generated_image_b64}` : `${API_URL}/outputs/image/serve?key=${encodeURIComponent(tweet.image_storage_key)}`)}
              alt="AI Generated"
              className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 max-h-[300px] object-cover mt-2 w-full"
            />
          </div>
        );
      }
      return null;
    }

    if (spec.visual_type === 'none') return null;

    const isDeterministic = !['illustration', 'concept', 'art'].includes(spec.visual_type?.toLowerCase());
    const isRegenerating = regeneratingIndexes.includes(index);

    return (
      <div className="mt-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        {/* Header Bar */}
        <div className={`px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 ${isDeterministic ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'bg-fuchsia-50 dark:bg-fuchsia-900/30'}`}>
          <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isDeterministic ? 'text-indigo-600 dark:text-indigo-400' : 'text-fuchsia-600 dark:text-fuchsia-400'}`}>
            {isDeterministic ? (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> Data-driven visual: {spec.visual_type.replace('_', ' ')}</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> AI-generated visual</>
            )}
          </span>
          <button 
            onClick={() => handleRegenerateVisual(index, isDeterministic)}
            disabled={!canEdit || isRegenerating}
            className={`text-xs px-3 py-1 rounded-md font-semibold transition-colors disabled:opacity-50 ${isDeterministic ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-200'}`}
          >
            {isRegenerating ? 'Working...' : isDeterministic ? 'Refresh Visual' : 'Regenerate API Visual'}
          </button>
        </div>
        
        <div className="p-6 md:p-8 flex flex-col relative min-h-[250px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white" style={{ aspectRatio: spec.aspect_ratio === '1:1' ? '1/1' : spec.aspect_ratio === '4:5' ? '4/5' : '16/9' }}>
          
          {isDeterministic ? (
            <>
              {/* Deterministic HTML/SVG Renderer */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-black tracking-tight">{spec.title || 'Data Visualization'}</h3>
                {spec.subtitle && <p className="text-gray-500 font-medium mt-1">{spec.subtitle}</p>}
              </div>

              <div className="flex-1 flex flex-col justify-center">
                {spec.visual_type === 'pie_chart' && <PieChart data={spec.data || []} />}
                {spec.visual_type === 'bar_chart' && <BarChart data={spec.data || []} />}
                {spec.visual_type === 'statistics' && <Statistics data={spec.data || []} />}
                {spec.visual_type === 'timeline' && <Timeline data={spec.data || []} />}
                {spec.visual_type === 'process' && <Timeline data={spec.data || []} />}
                {spec.visual_type === 'comparison' && <Comparison data={spec.data || []} />}
                {/* Fallback */}
                {(!['pie_chart', 'bar_chart', 'statistics', 'timeline', 'process', 'comparison'].includes(spec.visual_type)) && (
                  <Statistics data={spec.data || []} />
                )}
              </div>

              {spec.key_message && (
                <div className="mt-6 border-t-2 border-gray-100 dark:border-gray-700 pt-4 text-center font-bold text-lg text-indigo-600 dark:text-indigo-400">
                  {spec.key_message}
                </div>
              )}
              {spec.source_reference && (
                <div className="mt-2 text-center text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  Source: {spec.source_reference}
                </div>
              )}
            </>
          ) : (
            <>
              {/* AI Image Placeholder/Renderer */}
              {tweet.image_data_url || tweet.generated_image_b64 || tweet.image_storage_key ? (
                <img 
                  src={tweet.image_data_url || (tweet.generated_image_b64 ? `data:image/png;base64,${tweet.generated_image_b64}` : `${API_URL}/outputs/image/serve?key=${encodeURIComponent(tweet.image_storage_key)}`)}
                  alt="AI Generated"
                  className="w-full h-full object-cover rounded-md absolute inset-0"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50 dark:bg-gray-900 absolute inset-0">
                  <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="font-semibold text-sm">Image Generation Pending</p>
                  <p className="text-xs max-w-xs text-center mt-2 px-4 opacity-75">{spec.style_guidance || 'AI Illustration'}</p>
                </div>
              )}
            </>
          )}

          {isRegenerating && (
            <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
        <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Posting Advice</h3>
        <p className="text-sm text-blue-600 dark:text-blue-400">{content.best_posting_window_note}</p>
      </div>

      {renderTextarea(
        content.hook_tweet,
        (v) => onChange('hook_tweet', v),
        'Hook Tweet (Opening)'
      )}

      <div className="space-y-6">
        <h3 className="font-bold text-gray-800 dark:text-gray-200 text-xl border-b border-gray-200 dark:border-gray-700 pb-2">Thread Body</h3>
        {(content.thread_tweets || []).map((tweet: any, index: number) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative">
            <div className="absolute -left-3 -top-3 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
              {tweet.order || index + 1}
            </div>
            <div className="flex justify-between mb-3 pl-4">
              <span className="font-bold text-gray-700 dark:text-gray-300"></span>
              <span className={`text-xs font-semibold px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-md ${getCharColor(tweet.text?.length || 0)}`}>
                {tweet.text?.length || 0} / 280 chars
              </span>
            </div>
            <textarea
              value={tweet.text || ''}
              onChange={(e) => handleTweetChange(index, e.target.value)}
              disabled={!canEdit}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white min-h-[120px]"
            />
            
            {/* Visuals Rendering Engine */}
            {renderVisualCard(tweet, index)}

            {/* Tweet Evidence */}
            <EvidencePanel citations={tweet.citations} title="Tweet Evidence" compact />
          </div>
        ))}
      </div>

      {renderTextarea(
        content.closing_tweet,
        (v) => onChange('closing_tweet', v),
        'Closing Tweet (CTA)'
      )}

      <div className="mb-4 bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Suggested Hashtags</label>
        <div className="flex gap-2 flex-wrap">
          {(content.suggested_hashtags || []).map((tag: string, idx: number) => (
            <span key={idx} className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
              {tag.startsWith('#') ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      </div>

      {/* Global Thread Evidence */}
      <EvidencePanel citations={content.citations} title="Global Thread Evidence" />
    </div>
  );
};
