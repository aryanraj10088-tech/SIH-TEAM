import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export interface GenerationConfigParams {
  audience?: string;
  tone?: string;
  language?: string;
  detail?: string;
  objective?: string;
}

interface Props {
  onGenerate: (config: GenerationConfigParams, formats: string[]) => void;
  loading: boolean;
}

export const GenerationConfig = ({ onGenerate, loading }: Props) => {
  const [formats, setFormats] = useState<string[]>(['summary', 'linkedin']);
  const [config, setConfig] = useState<GenerationConfigParams>({
    audience: 'General',
    tone: 'Professional',
    language: 'English',
    detail: 'Medium',
    objective: ''
  });

  const handleFormatToggle = (format: string) => {
    setFormats(prev => 
      prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format]
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generation Settings</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Formats</label>
          <div className="flex gap-4">
            {['summary', 'linkedin', 'advisory'].map(f => (
              <label key={f} className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={formats.includes(f)}
                  onChange={() => handleFormatToggle(f)}
                  className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{f}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Audience</label>
            <select 
              value={config.audience} 
              onChange={e => setConfig({...config, audience: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border outline-none"
            >
              <option>General</option>
              <option>Technical</option>
              <option>Executive</option>
              <option>Public</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tone</label>
            <select 
              value={config.tone} 
              onChange={e => setConfig({...config, tone: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border outline-none"
            >
              <option>Professional</option>
              <option>Urgent</option>
              <option>Neutral</option>
              <option>Engaging</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
            <select 
              value={config.language} 
              onChange={e => setConfig({...config, language: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border outline-none"
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Tamil</option>
              <option>Telugu</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Detail Level</label>
            <select 
              value={config.detail} 
              onChange={e => setConfig({...config, detail: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border outline-none"
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Objective</label>
          <textarea 
            value={config.objective} 
            onChange={e => setConfig({...config, objective: e.target.value})}
            placeholder="What is the goal of this generation?"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border outline-none"
            rows={3}
          />
        </div>

        <button
          onClick={() => onGenerate(config, formats)}
          disabled={loading || formats.length === 0}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate Content'}
        </button>
      </div>
    </div>
  );
};
