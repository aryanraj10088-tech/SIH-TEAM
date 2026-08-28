import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { UploadComponent } from '../components/UploadComponent';
import { FileText, ArrowLeft, Loader2, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { SummaryView } from '../components/SummaryView';
import { LinkedInView } from '../components/LinkedInView';



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
  const [error, setError] = useState<string | null>(null);
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
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const generateContent = async (source: Source) => {
    setGeneratingSourceId(source._id);
    setError(null);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/projects/${id}/generate`,
        { sourceId: source._id, targetFormats: ['summary', 'linkedin'] },
        { withCredentials: true }
      );
      setGeneratedResults(data.results);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Content generation failed');
    } finally {
      setGeneratingSourceId(null);
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
                          {(source.sizeBytes / 1024 / 1024).toFixed(2)} MB • {new Date(source.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {source.mimeType === 'application/pdf' && (
                        <button
                          type="button"
                          onClick={() => generateContent(source)}
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
                  </div>
                ))}
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

      {generatedResults && (
        <div className="bg-white border rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">Generated Content</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(generatedResults).map(([format, result]) => (
              <article key={format} className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold capitalize">{format}</h3>
                  <span className="text-xs text-gray-500">
                    Groundedness: {Math.round((result.audit.groundedness_score || 0) * 100)}%
                  </span>
                </div>
                {/* <pre className="whitespace-pre-wrap text-sm text-gray-700 overflow-auto max-h-96">
                  {JSON.stringify(result.content, null, 2)}
                </pre> */}

                <div className="mt-4">
                    {format === 'summary' ? (
                        <SummaryView data={result.content} />
                          ) : format === 'linkedin' ? (
                              <LinkedInView data={result.content} />
                         ) : (
                            /* Fallback for any other future formats like 'video_script' */
                           <pre className="whitespace-pre-wrap text-sm text-gray-700 overflow-auto max-h-96">
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
