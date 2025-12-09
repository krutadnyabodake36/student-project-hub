import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateProject from './pages/CreateProject';
import ProjectDetails from './pages/ProjectDetails';
import Profile from './pages/Profile';
import Teams from './pages/Teams';
import EditProject from './pages/EditProject';
import UserProfile from './pages/UserProfile';
import Messages from './pages/Messages';
import TeamPost from './pages/TeamPost';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return !isAuthenticated ? children : <Navigate to="/" />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes - Everyone can see */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/project/:id" element={<ProjectDetails />} />
      <Route path="/user/:id" element={<UserProfile />} />
      <Route path="/team-posts" element={<TeamPost />} />
      <Route path="/teams" element={<Teams />} />
      
      {/* Auth Routes - Only for non-logged in users */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />
      
      {/* Protected Routes - Only for logged in users */}
      <Route 
        path="/my-projects" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/messages/:userId?" 
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/create-project" 
        element={
          <ProtectedRoute>
            <CreateProject />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/edit-project/:id" 
        element={
          <ProtectedRoute>
            <EditProject />
          </ProtectedRoute>
        } 
      />
      
      {/* teams route handled above as public */}

      {/* Redirect old routes */}
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      
      {/* Optional: Old Home/Landing page */}
      <Route path="/about" element={<Home />} />
      
      {/* 404 - Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#363636',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
