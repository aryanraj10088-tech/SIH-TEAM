import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { UploadComponent } from '../components/UploadComponent';
import { FileText, ArrowLeft, Loader2, CheckCircle, Clock, AlertTriangle, Trash2, Settings } from 'lucide-react';
import { SummaryView } from '../components/SummaryView';
import { LinkedInView } from '../components/LinkedInView';
import { AdvisoryView } from '../components/AdvisoryView';
import { GenerationConfig, type GenerationConfigParams } from '../components/GenerationConfig';



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
  audit: { status: string; groundedness_score?: number };
}

export const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatingSourceId, setGeneratingSourceId] = useState<string | null>(null);
  const [generatedResults, setGeneratedResults] = useState<Record<string, GeneratedResult> | null>(null);

  const fetchProjectDetails = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/projects/${id}`, {
        withCredentials: true,
      });
      setProject(data.project);
      setSources(data.sources);
    } catch (err) {
      setFetchError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const [selectedSourceForGeneration, setSelectedSourceForGeneration] = useState<Source | null>(null);

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
          config
        },
        { withCredentials: true }
      );
      setGeneratedResults(data.results);
      setSelectedSourceForGeneration(null);
    } catch (err: any) {
      setGenerationError(err.response?.data?.message || 'Content generation failed');
    } finally {
      setGeneratingSourceId(null);
    }
  };

  const deleteSource = async (sourceId: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    
    setError(null);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/projects/${id}/sources/${sourceId}`, {
        withCredentials: true,
      });
      fetchProjectDetails();
    } catch (err: any) {
      setGenerationError(err.response?.data?.message || 'Failed to delete file');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PROCESSED': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'ERROR': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-500" /></div>;
  if (fetchError || !project) return <div className="p-8 text-red-500">{fetchError || 'Project not found'}</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <Link to="/projects" className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{project.description || 'No description provided.'}</p>
      </div>

      {generationError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-md flex items-start">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <p className="text-sm text-red-700">{generationError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Source Documents</h2>
            
            {sources.length === 0 ? (
              <div className="text-center p-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                No sources uploaded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {sources.map(source => (
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
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Upload Source</h2>
            <UploadComponent projectId={project._id} onUploadSuccess={fetchProjectDetails} />
          </div>
        </div>
      </div>

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

      {generatedResults && (
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm p-6 mt-8">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Generated Content</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(generatedResults).map(([format, result]) => (
              <article key={format} className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold capitalize text-gray-900 dark:text-white">{format}</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Groundedness: {Math.round((result.audit.groundedness_score || 0) * 100)}%
                  </span>
                </div>
                {/* <pre className="whitespace-pre-wrap text-sm text-gray-700 overflow-auto max-h-96">
                  {JSON.stringify(result.content, null, 2)}
                </pre> */}

                <div className="mt-4">
                    {format === 'summary' ? (
                        <SummaryView data={result.content as any} />
                          ) : format === 'linkedin' ? (
                              <LinkedInView data={result.content as any} />
                          ) : format === 'advisory' ? (
                              <AdvisoryView data={result.content as any} />
                         ) : (
                            /* Fallback for any other future formats like 'video_script' */
                           <pre className="whitespace-pre-wrap text-sm text-gray-700 overflow-auto max-h-96 bg-gray-50 p-4 rounded-md border">
                              {JSON.stringify(result.content, null, 2)}
                           </pre>
                          )}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
