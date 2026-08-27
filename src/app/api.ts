export const API_BASE = (() => {
  // Allow overriding via global variable set in index.html (window.__env__)
  // Example in index.html before loading app: <script>window.__env__ = { API_BASE: 'https://localhost:3001' };</script>
  const env = (window as any).__env__;
  if (env && env.API_BASE) return env.API_BASE;

  // Default to backend used in your curl examples
  return 'http://localhost:5291';
})();
