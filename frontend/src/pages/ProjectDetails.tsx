import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { AlertTriangle, ArrowLeft, CheckCircle, Clock, FileText, List, Loader2, Settings, Trash2 } from 'lucide-react';
import { UploadComponent } from '../components/UploadComponent';
import { SummaryView } from '../components/SummaryView';
import { LinkedInView } from '../components/LinkedInView';
import { AdvisoryView } from '../components/AdvisoryView';
import { GenerationConfigModal, type GenerationConfig } from '../components/GenerationConfigModal';
import { OutputList } from '../components/OutputList';
import { SourceEvidencePanel } from '../components/SourceEvidencePanel';
import { outputsApi } from '../api/outputs';

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

  const [generatingSourceId, setGeneratingSourceId] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);
  const [generatedResults, setGeneratedResults] = useState<Record<string, GeneratedResult> | null>(null);
  const [activeTab, setActiveTab] = useState<'sources' | 'outputs'>('sources');
  const [selectedSourceForGeneration, setSelectedSourceForGeneration] = useState<Source | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

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

  const executeGeneration = async (configFromModal: GenerationConfig) => {
    if (!selectedSourceForGeneration) return;
    const sourceId = selectedSourceForGeneration._id;
    setGeneratingSourceId(sourceId);
    setGenerationStatus('Analyzing Source Document...');
    setError(null);

    const { targetFormats, audience, tone, detailLevel, objective, language } = configFromModal;

    const attemptGeneration = async (retryCount = 0): Promise<void> => {
      try {
        if (retryCount > 0) {
          setGenerationStatus(`Waking up AI Service... (Attempt ${retryCount + 1}/3)`);
        } else {
          setGenerationStatus('Generating Outputs (Waiting for backend)...');
        }

        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/projects/${id}/generate`,
          {
            sourceId,
            targetFormats,
            audience,
            tone,
            detailLevel,
            objective,
            language,
          },
          { withCredentials: true, timeout: 120000 } // Wait up to 120s for Render free tier proxy
        );

        setGeneratedResults(data.results);
        setSelectedSourceForGeneration(null);
        setIsConfigOpen(false);
        setActiveTab('outputs');
      } catch (err: any) {
        // If timeout, 502, or 504, the AI service might be waking up
        const isNetworkError = !err.response || err.response.status === 504 || err.response.status === 502 || err.code === 'ECONNABORTED';
        if (isNetworkError && retryCount < 2) {
          setGenerationStatus('AI Service is starting up. Retrying in 10s...');
          await new Promise(resolve => setTimeout(resolve, 10000));
          return attemptGeneration(retryCount + 1);
        }
        throw err;
      }
    };

    try {
      await attemptGeneration();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Content generation failed');
    } finally {
      setGeneratingSourceId(null);
      setGenerationStatus(null);
      // setIsConfigOpen(false); // Only close on success, or user can manually close on error
    }
  };

  const deleteSource = async (sourceId: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/projects/${id}/sources/${sourceId}`, {
        withCredentials: true,
      });
      fetchProjectDetails();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete file');
    }
  };

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

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-500 dark:text-gray-400" /></div>;
  if (error || !project) return <div className="p-8 text-red-500">{error || 'Project not found'}</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <Link to="/projects" className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{project.description || 'No description provided.'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
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
                              onClick={() => {
                                setSelectedSourceForGeneration(source);
                                setIsConfigOpen(true);
                              }}
                              disabled={generatingSourceId !== null}
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
                <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Generated Outputs History</h2>
                <OutputList projectId={project._id} />
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

      {generatedResults && (
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm p-6 space-y-8 mt-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Just Generated: Content Review</h2>
          <div className="space-y-8">
            {Object.entries(generatedResults).map(([format, result]) => (
              <article key={format} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="font-bold capitalize text-gray-800 dark:text-gray-200">{format} Output</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Groundedness: {Math.round((result.audit.groundedness_score || 0) * 100)}%
                  </span>
                </div>

                <div className="p-4">
                  {format === 'summary' ? (
                    <SummaryView data={result.content as any} />
                  ) : format === 'linkedin' ? (
                    <LinkedInView data={result.content as any} />
                  ) : format === 'advisory' ? (
                    <AdvisoryView data={result.content as any} />
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 overflow-auto max-h-96">
                      {JSON.stringify(result.content, null, 2)}
                    </pre>
                  )}
                </div>

                <SourceEvidencePanel
                  audit={result.audit}
                  format={format}
                  outputStatus="DRAFT"
                  onSubmitForReview={async () => {
                    if (result._id) await outputsApi.submitForReview(result._id);
                  }}
                  onApprove={async (_, note) => {
                    if (result._id) await outputsApi.reviewOutput(result._id, 'approve', note);
                  }}
                  onReject={async (_, note) => {
                    if (result._id) await outputsApi.reviewOutput(result._id, 'reject', note);
                  }}
                />
              </article>
            ))}
          </div>
        </div>
      )}

      <GenerationConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onGenerate={executeGeneration}
        isGenerating={generatingSourceId !== null}
        generationStatus={generationStatus}
      />
    </div>
  );
};

export default ProjectDetails;
