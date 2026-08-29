// src/components/VideoScriptView.tsx
import { Clapperboard, Eye, Film, Globe2, Users } from 'lucide-react';

interface Scene {
  scene_number: number;
  narration: string;
  visual_prompt: string;
  editing_notes?: string;
  citations?: { chunk_id: string; supporting_text: string }[];
}

interface VideoScriptData {
  title?: string;
  target_audience?: string;
  global_pacing?: string;
  scenes?: Scene[];
}

export const VideoScriptView = ({ data }: { data: VideoScriptData }) => {
  if (!data || !data.scenes) {
    return (
      <div className="p-4 text-gray-500 dark:text-gray-400 text-sm">
        No video script data available.
      </div>
    );
  }

  return (
    <div className="rounded-xl space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <Film className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{data.title || 'Video Script'}</h2>
        </div>
        <div className="flex flex-wrap gap-4 mt-3">
          {data.target_audience && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-medium">Audience:</span> {data.target_audience}
            </div>
          )}
          {data.global_pacing && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <Globe2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-medium">Pacing:</span> {data.global_pacing}
            </div>
          )}
        </div>
      </div>

      {/* Scenes */}
      <div className="space-y-5">
        {data.scenes.map((scene) => (
          <div
            key={scene.scene_number}
            className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Scene header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                <Clapperboard className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white text-sm">Scene {scene.scene_number}</span>
            </div>

            <div className="p-4 space-y-4">
              {/* Narration */}
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">🎙 Narration</p>
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                  {scene.narration}
                </p>
              </div>

              {/* Visual Prompt */}
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  <Eye className="w-3.5 h-3.5 inline mr-1" />Visual Direction
                </p>
                <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/30 italic">
                  {scene.visual_prompt}
                </p>
              </div>

              {/* Editing Notes */}
              {scene.editing_notes && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">✂️ Editing Notes</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30 leading-relaxed">
                    {scene.editing_notes}
                  </p>
                </div>
              )}

              {/* Citations */}
              {scene.citations && scene.citations.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">📎 Source Citations</p>
                  <div className="space-y-1.5">
                    {scene.citations.map((c, idx) => (
                      <div key={idx} className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/60 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Chunk #{c.chunk_id}: </span>
                        "{c.supporting_text}"
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
