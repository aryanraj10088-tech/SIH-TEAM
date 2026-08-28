// import { Copy } from 'lucide-react';

// export const LinkedInView = ({ data }: { data: any }) => {

//   const handleCopy = () => {
//     const fullText = `${data.post_text}\n\n${data.hashtags.join(' ')}`;
//     navigator.clipboard.writeText(fullText);
//     alert("Copied to clipboard!");
//   };

//   return (
//     <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-xl font-bold text-blue-700">LinkedIn Post</h2>
//         <button
//           onClick={handleCopy}
//           className="flex items-center gap-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-md transition"
//         >
//           <Copy size={16} /> Copy Text
//         </button>
//       </div>

//       {/* Render the JSON text string with proper whitespace */}
//       <div className="whitespace-pre-wrap text-gray-800 text-base leading-relaxed mb-6">
//         {data.post_text}
//       </div>

//       <div className="text-blue-600 font-medium mb-6">
//         {data.hashtags.join(' ')}
//       </div>

//       {/* Automatically render the two generated images */}
//       <div className="grid grid-cols-2 gap-4">
//         {data.generated_images?.map((url: string, index: number) => (
//           <div key={index} className="relative group overflow-hidden rounded-lg shadow-md aspect-square">
//             <img
//               src={url}
//               alt={`Generated graphic ${index + 1}`}
//               className="w-full h-full object-cover transform group-hover:scale-105 transition duration-300"
//             />
//             <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition duration-300"></div>
//           </div>
//         ))}
//       </div>
//       <p className="text-xs text-gray-400 mt-4 text-center">Images generated dynamically based on context.</p>
//     </div>
//   );
// };





import { Copy } from 'lucide-react';

export const LinkedInView = ({ data }: { data: any }) => {

  // Safely grab the text whatever the AI decided to name the key
  const mainText = data.post_text || data.text || data.content || "";
  const hashtags = data.hashtags || [];
  const imagePrompts = data.image_prompts || [];

  const handleCopy = () => {
    const fullText = `${mainText}\n\n${hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullText);
    alert("Copied to clipboard!");
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-blue-700">LinkedIn Post</h2>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-md transition"
        >
          <Copy size={16} /> Copy Text
        </button>
      </div>

      {/* Main Post Text */}
      <div className="whitespace-pre-wrap text-gray-800 text-base leading-relaxed mb-6">
        {mainText}
      </div>

      {/* Hashtags */}
      <div className="text-blue-600 font-medium mb-6">
        {hashtags.join(' ')}
      </div>

      {/* Dynamic Image Generation directly in React */}
      {imagePrompts.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {imagePrompts.map((prompt: string, index: number) => {
            // Convert the text prompt into a URL-safe string
            const safePrompt = encodeURIComponent(prompt);
            const imageUrl = `https://image.pollinations.ai/prompt/${safePrompt}?width=1080&height=1080&nologo=true`;

            return (
              <div key={index} className="relative group overflow-hidden rounded-lg shadow-md aspect-square bg-gray-100 flex items-center justify-center">
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

      <p className="text-xs text-gray-400 mt-4 text-center">Images generated dynamically based on context.</p>
    </div>
  );
};
