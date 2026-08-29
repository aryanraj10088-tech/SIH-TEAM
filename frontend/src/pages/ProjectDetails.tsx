<<<<<<< Updated upstream
﻿// import { useState, useEffect } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import axios from 'axios';
// import { UploadComponent } from '../components/UploadComponent';
// import { FileText, ArrowLeft, Loader2, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
// import { SummaryView } from '../components/SummaryView';
// import { LinkedInView } from '../components/LinkedInView';
// import { AdvisoryView } from '../components/AdvisoryView';
// import { GenerationConfigModal, GenerationConfig } from '../components/GenerationConfigModal';
// import { SourceEvidencePanel } from '../components/SourceEvidencePanel';



// interface Source {
//   _id: string;
//   originalName: string;
//   mimeType: string;
//   sizeBytes: number;
//   status: string;
//   createdAt: string;
// }

// interface Project {
//   _id: string;
//   title: string;
//   description: string;
//   createdAt: string;
// }

// interface GeneratedResult {
//   content: Record<string, unknown>;
//   audit: { status: string; groundedness_score?: number };
// }

// export const ProjectDetails = () => {
//   const { id } = useParams<{ id: string }>();
//   const [project, setProject] = useState<Project | null>(null);
//   const [sources, setSources] = useState<Source[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [generatingSourceId, setGeneratingSourceId] = useState<string | null>(null);
//   const [generatedResults, setGeneratedResults] = useState<Record<string, GeneratedResult> | null>(null);
//   const [isConfigOpen, setIsConfigOpen] = useState(false);
//   const [selectedSource, setSelectedSource] = useState<Source | null>(null);

//   const fetchProjectDetails = async () => {
//     try {
//       const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/projects/${id}`, {
//         withCredentials: true,
//       });
//       setProject(data.project);
//       setSources(data.sources);
//     } catch (err) {
//       setError('Failed to load project details');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProjectDetails();
//   }, [id]);

//   const generateContent = async (source: Source) => {
//     setGeneratingSourceId(source._id);
//     setError(null);
//     try {
//       const { data } = await axios.post(
//         `${import.meta.env.VITE_API_URL}/projects/${id}/generate`,
//         { sourceId: source._id, targetFormats: ['summary', 'linkedin'] },
//         { withCredentials: true }
//       );
//       setGeneratedResults(data.results);
//     } catch (err: any) {
//       setError(err.response?.data?.message || 'Content generation failed');
//     } finally {
//       setGeneratingSourceId(null);
//     }
//   };

//   const executeGeneration = async (config: GenerationConfig) => {
//   if (!selectedSource) return;
//   setGeneratingSourceId(selectedSource._id);
//   setIsConfigOpen(false);

//   try {
//     const { data } = await axios.post(
//       `${import.meta.env.VITE_API_URL}/projects/${id}/generate`,
//       {
//         sourceId: selectedSource._id,
//         ...config
//       },
//       { withCredentials: true }
//     );
//     setGeneratedResults(data.results);
//   } catch (err: any) {
//     setError(err.response?.data?.message || 'Content generation failed');
//   } finally {
//     setGeneratingSourceId(null);
//   }
// };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'PROCESSED': return <CheckCircle className="w-4 h-4 text-green-500" />;
//       case 'ERROR': return <AlertTriangle className="w-4 h-4 text-red-500" />;
//       default: return <Clock className="w-4 h-4 text-blue-500" />;
//     }
//   };

//   if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-500" /></div>;
//   if (error || !project) return <div className="p-8 text-red-500">{error || 'Project not found'}</div>;

//   return (
//     <div className="p-8 max-w-6xl mx-auto space-y-8">
//       <div>
//         <Link to="/projects" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4">
//           <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
//         </Link>
//         <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
//         <p className="text-gray-600 mt-2">{project.description || 'No description provided.'}</p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         <div className="lg:col-span-2">
//           <div className="bg-white border rounded-lg shadow-sm p-6">
//             <h2 className="text-lg font-bold mb-4">Source Documents</h2>

//             {sources.length === 0 ? (
//               <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
//                 No sources uploaded yet.
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {sources.map(source => (
//                   <div key={source._id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
//                     <div className="flex items-center space-x-3">
//                       <FileText className="w-5 h-5 text-blue-500" />
//                       <div>
//                         <p className="font-medium text-sm text-gray-900">{source.originalName}</p>
//                         <p className="text-xs text-gray-500">
//                           {(source.sizeBytes / 1024 / 1024).toFixed(2)} MB â€¢ {new Date(source.createdAt).toLocaleString()}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       {source.mimeType === 'application/pdf' && (
//                         <button
//                           type="button"
//                           onClick={setSelectedSource(source); setIsConfigOpen(true);]}
//                           disabled={generatingSourceId !== null}
//                           className="text-xs font-medium text-white px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
//                         >
//                           {generatingSourceId === source._id ? 'Generating...' : 'Generate'}
//                         </button>
//                       )}
//                       <span className="text-xs font-medium text-gray-600 px-2 py-1 bg-gray-100 rounded-full flex items-center">
//                         {getStatusIcon(source.status)}
//                         <span className="ml-1">{source.status}</span>
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="lg:col-span-1">
//           <div className="bg-white border rounded-lg shadow-sm p-6">
//             <h2 className="text-lg font-bold mb-4">Upload Source</h2>
//             <UploadComponent projectId={project._id} onUploadSuccess={fetchProjectDetails} />
//           </div>
//         </div>
//       </div>

//       {generatedResults && (
//         <div className="bg-white border rounded-lg shadow-sm p-6">
//           <h2 className="text-lg font-bold mb-4">Generated Content</h2>
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {Object.entries(generatedResults).map(([format, result]) => (
//               <article key={format} className="border rounded-md p-4">
//                 <div className="flex items-center justify-between mb-3">
//                   <h3 className="font-semibold capitalize">{format}</h3>
//                   <span className="text-xs text-gray-500">
//                     Groundedness: {Math.round((result.audit.groundedness_score || 0) * 100)}%
//                   </span>
//                 </div>
//                 {/* <pre className="whitespace-pre-wrap text-sm text-gray-700 overflow-auto max-h-96">
//                   {JSON.stringify(result.content, null, 2)}
//                 </pre> */}

//                 <div className="mt-4">
//                     {format === 'summary' ? (
//                         <SummaryView data={result.content} />
//                           ) : format === 'linkedin' ? (
//                               <LinkedInView data={result.content} />
//                          ) : (
//                             /* Fallback for any other future formats like 'video_script' */
//                            <pre className="whitespace-pre-wrap text-sm text-gray-700 overflow-auto max-h-96">
//                               {JSON.stringify(result.content, null, 2)}
//                            </pre>
//                           )}
//                 </div>
//               </article>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };


import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
=======
﻿import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
>>>>>>> Stashed changes
import axios from 'axios';
import { AlertTriangle, ArrowLeft, CheckCircle, Clock, FileText, List, Loader2, Settings, Trash2 } from 'lucide-react';
import { UploadComponent } from '../components/UploadComponent';
<<<<<<< Updated upstream
import { FileText, ArrowLeft, Loader2, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

import { SummaryView } from '../components/SummaryView';
import { LinkedInView } from '../components/LinkedInView';
import { AdvisoryView } from '../components/AdvisoryView';
import { GenerationConfigModal } from '../components/GenerationConfigModal';
import type { GenerationConfig } from '../components/GenerationConfigModal';
import { SourceEvidencePanel } from '../components/SourceEvidencePanel';
=======
import { SummaryView } from '../components/SummaryView';
import { LinkedInView } from '../components/LinkedInView';
import { AdvisoryView } from '../components/AdvisoryView';
import { GenerationConfig, type GenerationConfigParams } from '../components/GenerationConfig';
import { OutputList } from '../components/OutputList';
>>>>>>> Stashed changes

interface Source {
  _id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  status: string;
  createdAt: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
}

interface GeneratedResult {
  content: Record<string, unknown>;
  audit: { status: string; groundedness_score?: number; chunks_used?: string[] };
}

export const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New States for Phase 4/5
  const [generatingSourceId, setGeneratingSourceId] = useState<string | null>(null);
  const [generatedResults, setGeneratedResults] = useState<Record<string, GeneratedResult> | null>(null);
<<<<<<< Updated upstream
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
=======
  const [activeTab, setActiveTab] = useState<'sources' | 'outputs'>('sources');
  const [selectedSourceForGeneration, setSelectedSourceForGeneration] = useState<Source | null>(null);
>>>>>>> Stashed changes

  const fetchProjectDetails = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/projects/${id}`, {
        withCredentials: true,
      });
      setProject(data.project);
      setSources(data.sources);
    } catch (err) {
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

<<<<<<< Updated upstream
  // Updated Generation execution that uses the Modal configuration
  const executeGeneration = async (config: GenerationConfig) => {
    if (!selectedSource) return;
    setGeneratingSourceId(selectedSource._id);
    setIsConfigOpen(false); // Close modal when starting
    setError(null);

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/projects/${id}/generate`,
        {
          sourceId: selectedSource._id,
          ...config
=======
  const executeGeneration = async (config: GenerationConfigParams, formats: string[]) => {
    if (!selectedSourceForGeneration) return;
    setGeneratingSourceId(selectedSourceForGeneration._id);
    setGenerationError(null);

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/generation`,
        {
          projectId: id,
          sourceId: selectedSourceForGeneration._id,
          targetFormats: formats,
          config,
>>>>>>> Stashed changes
        },
        { withCredentials: true }
      );

      setGeneratedResults(data.results);
<<<<<<< Updated upstream
=======
      setSelectedSourceForGeneration(null);
      setActiveTab('outputs');
>>>>>>> Stashed changes
    } catch (err: any) {
      setError(err.response?.data?.message || 'Content generation failed');
    } finally {
      setGeneratingSourceId(null);
    }
  };

<<<<<<< Updated upstream
=======
  const deleteSource = async (sourceId: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    setGenerationError(null);
    setFetchError(null);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/projects/${id}/sources/${sourceId}`, {
        withCredentials: true,
      });
      fetchProjectDetails();
    } catch (err: any) {
      setGenerationError(err.response?.data?.message || 'Failed to delete file');
    }
  };

>>>>>>> Stashed changes
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PROCESSED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'ERROR':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-500" /></div>;
  if (error || !project) return <div className="p-8 text-red-500">{error || 'Project not found'}</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <Link to="/projects" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
        <p className="text-gray-600 mt-2">{project.description || 'No description provided.'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
<<<<<<< Updated upstream
          <div className="bg-white border rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">Source Documents</h2>

            {sources.length === 0 ? (
              <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                No sources uploaded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {sources.map(source => (
                  <div key={source._id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-sm text-gray-900">{source.originalName}</p>
                        <p className="text-xs text-gray-500">
                          {(source.sizeBytes / 1024 / 1024).toFixed(2)} MB â€¢ {new Date(source.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {source.mimeType === 'application/pdf' && (
                        <button
                          type="button"
                          // FIXED: Proper arrow function to set state and open modal
                          onClick={() => {
                            setSelectedSource(source);
                            setIsConfigOpen(true);
                          }}
                          disabled={generatingSourceId !== null}
                          className="text-xs font-medium text-white px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          {generatingSourceId === source._id ? 'Generating...' : 'Generate'}
                        </button>
                      )}
                      <span className="text-xs font-medium text-gray-600 px-2 py-1 bg-gray-100 rounded-full flex items-center">
                        {getStatusIcon(source.status)}
                        <span className="ml-1">{source.status}</span>
                      </span>
                    </div>
=======
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm p-6">
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('sources')}
                  className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === 'sources'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Sources
                </button>
                <button
                  onClick={() => setActiveTab('outputs')}
                  className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === 'outputs'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <List className="w-4 h-4" />
                  Generated Outputs
                </button>
              </nav>
            </div>

            {activeTab === 'sources' ? (
              <>
                <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Source Documents</h2>

                {sources.length === 0 ? (
                  <div className="text-center p-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                    No sources uploaded yet.
>>>>>>> Stashed changes
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sources.map((source) => (
                      <div key={source._id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                          <div>
                            <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{source.originalName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {(source.sizeBytes / 1024 / 1024).toFixed(2)} MB • {new Date(source.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {source.mimeType === 'application/pdf' && (
                            <button
                              type="button"
                              onClick={() => setSelectedSourceForGeneration(source)}
                              disabled={generatingSourceId !== null || selectedSourceForGeneration?._id === source._id}
                              className="text-xs font-medium text-indigo-700 dark:text-indigo-300 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 disabled:opacity-50 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 transition-colors"
                            >
                              <Settings className="w-3 h-3" />
                              Configure
                            </button>
                          )}
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center">
                            {getStatusIcon(source.status)}
                            <span className="ml-1">{source.status}</span>
                          </span>
                          <button
                            onClick={() => deleteSource(source._id)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                            title="Delete file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div>
                <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Generated Outputs</h2>
                <OutputList projectId={project._id} />
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">Upload Source</h2>
            <UploadComponent projectId={project._id} onUploadSuccess={fetchProjectDetails} />
          </div>
        </div>
      </div>

<<<<<<< Updated upstream
      {/* FIXED: Phase 5 Rendering Block with AdvisoryView and SourceEvidencePanel */}
=======
      {selectedSourceForGeneration && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Configure Generation for: {selectedSourceForGeneration.originalName}</h2>
            <button onClick={() => setSelectedSourceForGeneration(null)} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium">Cancel</button>
          </div>
          <GenerationConfig
            onGenerate={executeGeneration}
            loading={generatingSourceId === selectedSourceForGeneration._id}
          />
        </div>
      )}

>>>>>>> Stashed changes
      {generatedResults && (
        <div className="bg-white border rounded-lg shadow-sm p-6 space-y-8 mt-8">
          <h2 className="text-lg font-bold">Generated Content Review</h2>
          <div className="space-y-8">
            {Object.entries(generatedResults).map(([format, result]) => (
<<<<<<< Updated upstream
              <article key={format} className="border rounded-xl overflow-hidden shadow-sm">

                {/* Header for the specific output format */}
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                  <h3 className="font-bold capitalize text-gray-800">{format} Output</h3>
=======
              <article key={format} className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold capitalize text-gray-900 dark:text-white">{format}</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Groundedness: {Math.round((result.audit.groundedness_score || 0) * 100)}%
                  </span>
                </div>

                <div className="mt-4">
                  {format === 'summary' ? (
                    <SummaryView data={result.content as any} />
                  ) : format === 'linkedin' ? (
                    <LinkedInView data={result.content as any} />
                  ) : format === 'advisory' ? (
                    <AdvisoryView data={result.content as any} />
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 overflow-auto max-h-96 bg-gray-50 p-4 rounded-md border">
                      {JSON.stringify(result.content, null, 2)}
                    </pre>
                  )}
>>>>>>> Stashed changes
                </div>

                {/* Dynamic Component Router */}
                <div className="p-4">
                  {format === 'summary' ? (
                    <SummaryView data={result.content} />
                  ) : format === 'linkedin' ? (
                    <LinkedInView data={result.content} />
                  ) : format === 'advisory' ? (
                    <AdvisoryView data={result.content} />
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 overflow-auto max-h-96">
                      {JSON.stringify(result.content, null, 2)}
                    </pre>
                  )}
                </div>

                {/* The new Phase 5 Evidence & Approval Panel at the bottom of each block */}
                <SourceEvidencePanel
                  audit={result.audit}
                  format={format}
                  onApprove={(fmt, note) => console.log(`Approved ${fmt}: ${note}`)}
                  onReject={(fmt, note) => console.log(`Rejected ${fmt}: ${note}`)}
                />

              </article>
            ))}
          </div>
        </div>
      )}

      {/* FIXED: Added the Modal component so it actually renders on screen */}
      <GenerationConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onGenerate={executeGeneration}
        isGenerating={generatingSourceId !== null}
      />

    </div>
  );
};

export default ProjectDetails;
