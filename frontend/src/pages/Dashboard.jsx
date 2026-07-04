import { useLocation, Navigate } from 'react-router-dom';

export default function Dashboard() {
  const location = useLocation();
  const repoData = location.state?.repoData;
  const repoUrl = location.state?.repoUrl;

  if (!repoData || !repoUrl) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-bg-canvas text-text-primary p-8 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="text-text-secondary mb-8">
          Repository analyzed successfully. Analysis features will be built in the next phase.
        </p>
        
        <div className="bg-bg-card border border-border-default rounded-xl p-6 text-left shadow-sm">
          <h2 className="text-xl font-semibold mb-2 text-accent">Repository Details</h2>
          <pre className="bg-bg-subtle p-4 rounded-md overflow-x-auto text-sm border border-border-default/50">
            {JSON.stringify({ repoUrl, ...repoData }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
