/**
 * Configuration for API endpoints that works in both dev containers and local environments
 */

// Extend ImportMeta interface for Vite env
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Function to detect if we're running in a dev container or codespace
const isDevContainer = (): boolean => {
  // Check for common dev container environment variables
  return !!(
    process.env.CODESPACES || 
    process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN ||
    process.env.VSCODE_REMOTE_USER ||
    window.location.hostname.includes('github.dev') ||
    window.location.hostname.includes('codespaces') ||
    window.location.hostname.includes('gitpod')
  );
};

// Function to get the appropriate API base URL
const getApiBaseUrl = (): string => {
  // If API_BASE_URL is explicitly set in environment, use it
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // For GitHub Codespaces, construct the proper URL
  if (window.location.hostname.includes('github.dev')) {
    const currentUrl = window.location.hostname;
    // Replace the port number in the hostname from 3001 to 8000
    const backendUrl = currentUrl.replace('-3001.', '-8000.');
    return `https://${backendUrl}`;
  }

  // For other dev containers/codespaces, use the current hostname with port 8000
  if (isDevContainer()) {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    // If we're already on a forwarded port URL, construct the backend URL
    if (hostname.includes('github.dev') || hostname.includes('gitpod')) {
      // Extract the base URL pattern and replace port
      const backendHostname = hostname.replace(/3001|3000|5173/, '8000');
      return `${protocol}//${backendHostname}`;
    }
    
    return `${protocol}//${hostname}:8000`;
  }

  // For local development, use localhost
  return 'http://localhost:8000';
};

// Export the configuration
export const config = {
  apiBaseUrl: getApiBaseUrl(),
  isDevContainer: isDevContainer(),
  frontendPort: window.location.port || '3000',
  
  // Debugging info
  debug: {
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    port: window.location.port,
    href: window.location.href,
    computedApiUrl: getApiBaseUrl(),
    env: {
      codespaces: process.env.CODESPACES,
      githubCodespaces: process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN,
      vscodeRemoteUser: process.env.VSCODE_REMOTE_USER,
      viteApiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    }
  }
};

// Log configuration for debugging
console.log('Frontend Configuration:', config);

export default config;