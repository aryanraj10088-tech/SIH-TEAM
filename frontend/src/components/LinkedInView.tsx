import { Copy, ExternalLink } from 'lucide-react';

export const LinkedInView = ({ data }: { data: any }) => {
  const mainText = data.post_text || data.text || data.content || "";
  const hashtags = data.hashtags || [];
  const imagePrompts = data.image_prompts || [];

  const handleCopy = () => {
    const fullText = `${mainText}\n\n${hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullText);
  };

  return (
    <div className="rounded-xl space-y-5">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <ExternalLink className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">LinkedIn Post</h2>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-1.5 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
        >
          <Copy size={14} /> Copy Text
        </button>
      </div>

      {/* Main Post Text */}
      <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 text-base leading-relaxed bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        {mainText}
      </div>

      {/* Hashtags */}
      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {hashtags.map((tag: string, idx: number) => (
            <span key={idx} className="text-sm text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg border border-blue-100 dark:border-blue-800/40">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Dynamic Image Generation */}
      {imagePrompts.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {imagePrompts.map((prompt: string, index: number) => {
            const safePrompt = encodeURIComponent(prompt);
            const imageUrl = `https://image.pollinations.ai/prompt/${safePrompt}?width=1080&height=1080&nologo=true`;
            return (
              <div key={index} className="relative group overflow-hidden rounded-xl shadow-md aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt={`Generated graphic ${index + 1}`}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500 text-center">Images generated dynamically based on context.</p>
    </div>
  );
};
