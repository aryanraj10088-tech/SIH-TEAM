import React from 'react';
import { API_URL } from '../api/outputs';

interface XThreadEditorProps {
  content: any;
  onChange: (key: string, value: any) => void;
  canEdit: boolean;
}

export const XThreadEditor: React.FC<XThreadEditorProps> = ({ content, onChange, canEdit }) => {
  const getCharColor = (len: number) => len > 280 ? 'text-red-500 font-bold' : 'text-gray-500';

  const handleTweetChange = (index: number, newText: string) => {
    const newTweets = [...(content.thread_tweets || [])];
    newTweets[index] = { ...newTweets[index], text: newText };
    onChange('thread_tweets', newTweets);
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

      <div className="space-y-4">
        <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg">Thread Body</h3>
        {(content.thread_tweets || []).map((tweet: any, index: number) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between mb-2">
              <span className="font-bold text-gray-700 dark:text-gray-300">Tweet {tweet.order || index + 1}</span>
              <span className={`text-xs ${getCharColor(tweet.text?.length || 0)}`}>
                {tweet.text?.length || 0} / 280
              </span>
            </div>
            <textarea
              value={tweet.text || ''}
              onChange={(e) => handleTweetChange(index, e.target.value)}
              disabled={!canEdit}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white mb-3"
            />
            {tweet.suggested_visual && (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-md text-sm border border-yellow-200 dark:border-yellow-700/50 mb-3">
                <span className="font-semibold text-yellow-800 dark:text-yellow-300">Suggested Visual: </span>
                <span className="text-yellow-700 dark:text-yellow-400">{tweet.suggested_visual}</span>
              </div>
            )}
            {(tweet.image_storage_key || tweet.image_data_url) && (
              <div className="mt-4">
                <div className="text-sm text-indigo-600 dark:text-indigo-400 flex items-center gap-2 mb-2 font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  AI Generated Visual Attached
                </div>
                <img 
                  src={tweet.image_data_url || `${API_URL}/outputs/image/serve?key=${encodeURIComponent(tweet.image_storage_key)}`}
                  alt="AI Generated"
                  className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 max-h-[300px] object-cover mt-2"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {renderTextarea(
        content.closing_tweet,
        (v) => onChange('closing_tweet', v),
        'Closing Tweet (CTA)'
      )}

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Suggested Hashtags</label>
        <div className="flex gap-2 flex-wrap">
          {(content.suggested_hashtags || []).map((tag: string, idx: number) => (
            <span key={idx} className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
