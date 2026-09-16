import { useState, useEffect } from 'react';

function App() {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [version, setVersion] = useState("");
  const [status, setStatus] = useState("Success");

  useEffect(() => {
    fetch('/api/deployments')
      .then((res) => res.json())
      .then((data) => {
        setDeployments(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching deployments:', err);
        setLoading(false);
      });
  }, []);

  const handleDeploy = async (e) => {
    e.preventDefault();
    if (!version.trim()) return;

    try {
      await fetch("/api/deployments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: version.trim(), status }),
      });

      setVersion("");
      setStatus("Success");
      setShowForm(false);

      const res = await fetch("/api/deployments");
      setDeployments(await res.json());
    } catch (err) {
      console.error("Error creating deployment:", err);
    }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">⚡ DevOpsHub</div>

        <nav>
          <a className="active">Dashboard</a>
          <a>Deployments</a>
          <a>Services</a>
          <a>Servers</a>
          <a>Logs</a>
          <a>Settings</a>
        </nav>

        <div className="server-status">
          <span className="dot"></span>
          System Online
        </div>
      </aside>

      <main className="main">
        <header>
          <div>
            <p className="eyebrow">OVERVIEW</p>
            <h1>Dashboard</h1>
            <p className="subtitle">Monitor your infrastructure and deployments.</p>
          </div>

          <button className="deploy-btn" onClick={() => setShowForm(true)}>+ New Deployment</button>
        </header>

        {showForm && (
          <form className="panel deployment-form" onSubmit={handleDeploy}>
            <h2>New Deployment</h2>
            <input
              type="text"
              placeholder="Version e.g. v1.3.0"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
            </select>
            <button type="submit" className="deploy-btn">Deploy</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </form>
        )}
        <section className="stats">
          <div className="card">
            <span>Services</span>
            <strong>4</strong>
            <small className="success">All operational</small>
          </div>

          <div className="card">
            <span>Deployments</span>
            <strong>{deployments.length}</strong>
            <small>Live from DB</small>
          </div>

          <div className="card">
            <span>Uptime</span>
            <strong>99.9%</strong>
            <small className="success">Excellent</small>
          </div>

          <div className="card">
            <span>Server Load</span>
            <strong>32%</strong>
            <small>Normal</small>
          </div>
        </section>

        <section className="grid">
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Services</h2>
                <p>Current service health</p>
              </div>
              <span className="live">LIVE</span>
            </div>

            <div className="service">
              <div>
                <strong>API Server</strong>
                <span>Node.js · Port 5000</span>
              </div>
              <b className="healthy">● Healthy</b>
            </div>

            <div className="service">
              <div>
                <strong>PostgreSQL</strong>
                <span>Database · Port 5432</span>
              </div>
              <b className="healthy">● Healthy</b>
            </div>

            <div className="service">
              <div>
                <strong>Docker Engine</strong>
                <span>Container Runtime</span>
              </div>
              <b className="healthy">● Running</b>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Recent Deployments</h2>
                <p>Fetched from PostgreSQL</p>
              </div>
            </div>

            {loading ? (
              <p style={{ padding: '1rem', color: '#888' }}>Loading deployments...</p>
            ) : deployments.length === 0 ? (
              <p style={{ padding: '1rem', color: '#888' }}>No deployments found in database.</p>
            ) : (
              deployments.map((item) => (
                <div className="deployment" key={item.id || item.version}>
                  <div>
                    <strong>{item.version || item.tag || `Deployment #${item.id}`}</strong>
                    <span>{item.deployed_at ? new Date(item.deployed_at).toLocaleString() : 'Just now'}</span>
                  </div>
                  <b className={item.status === 'Failed' ? 'failed' : 'healthy'}>
                    {item.status === 'Failed' ? '✕ Failed' : '✓ Success'}
                  </b>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
