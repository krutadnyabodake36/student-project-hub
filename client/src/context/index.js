// Central re-exports for the auth context.
// Import from `src/context` to avoid filename/case issues on Windows.
export { AuthProvider } from './AuthContext.jsx';
export { AuthContext, useAuth } from './authContextHook.js';
