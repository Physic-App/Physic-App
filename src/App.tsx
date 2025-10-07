// React imports
import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context providers
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Navbar from './components/Navigation/Navbar';
import ToastContainer from './components/Toast/ToastContainer';

// Hooks and services
import { useToast } from './hooks/useToast';
import { apiService } from './services/api';
import { fetchUserData } from './services/data';

// Types
import { User } from './types';

// Lazy load page components for better performance
const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Simulator = lazy(() => import('./pages/Simulator'));
const LightSimulator = lazy(() => import('./pages/LightSimulator'));
const ForceSimulator = lazy(() => import('./pages/ForceSimulator'));
const ElectricitySimulator = lazy(() => import('./pages/ElectricitySimulator'));
const Chapters = lazy(() => import('./pages/Chapters'));
const Topic = lazy(() => import('./pages/Topic'));
const Auth = lazy(() => import('./pages/Auth'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Chatbot = lazy(() => import('./pages/Chatbot'));

// Loading spinner component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading PhysicsFlow...</p>
    </div>
  </div>
);

// Demo user data - fallback when database is unavailable
const DEMO_USER_DATA: User = {
  id: 'demo-user',
  name: "Demo User",
  email: "demo@physicsflow.com",
  streak: 7,
  completedChapters: 5,
  totalChapters: 8,
  studyTime: 24,
  averageScore: 0,
  achievements: 12,
  lastTopic: {
    chapter: "Physics",
    topic: "Force and Pressure",
    progress: 60
  }
};

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Main App Content Component
function AppContent() {
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toasts, showToast, removeToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Initialize MathJax for mathematical expressions
    if (window.MathJax) {
      window.MathJax.typesetPromise?.();
    }

    // Load user data from database with fallback to demo data
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        const dbUser = await fetchUserData();
        if (dbUser) {
          setUserData(dbUser);
        } else {
          // Use demo data as fallback
          await new Promise(resolve => setTimeout(resolve, 500));
          setUserData(DEMO_USER_DATA);
        }
    } catch {
      showToast('Failed to load user data. Using demo mode.', 'warning');
      setUserData(DEMO_USER_DATA);
    } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [showToast]);

  const handleLogout = async () => {
    try {
      await apiService.logout();
      setUserData(null);
      showToast('Logged out successfully!', 'success');
    } catch {
      showToast('Logout failed. Please try again.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PhysicsFlow...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App font-nunito bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Landing Page - Show when not authenticated */}
            <Route path="/" element={
              user ? (
                <Navigate to="/app" replace />
              ) : (
                <Landing />
              )
            } />
            
            {/* Auth Routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            
            {/* Protected App Routes */}
            <Route path="/app" element={
              <ProtectedRoute>
                <div>
                  <Navbar onLogout={handleLogout} />
                  <Dashboard userData={userData} />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/app/simulator" element={
              <ProtectedRoute>
                <div>
                  <Navbar onLogout={handleLogout} />
                  <Simulator />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/app/simulator/light" element={
              <ProtectedRoute>
                <div>
                  <Navbar onLogout={handleLogout} />
                  <LightSimulator />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/app/simulator/force" element={
              <ProtectedRoute>
                <div>
                  <Navbar onLogout={handleLogout} />
                  <ForceSimulator />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/app/simulator/electricity" element={
              <ProtectedRoute>
                <div>
                  <Navbar onLogout={handleLogout} />
                  <ElectricitySimulator />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/app/chapters" element={
              <ProtectedRoute>
                <div>
                  <Navbar onLogout={handleLogout} />
                  <Chapters />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/app/chapters/:chapterId" element={
              <ProtectedRoute>
                <div>
                  <Navbar onLogout={handleLogout} />
                  <Topic />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/app/chapters/:chapterId/topics/:topicId" element={
              <ProtectedRoute>
                <div>
                  <Navbar onLogout={handleLogout} />
                  <Topic />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/app/topics/:topicId" element={
              <ProtectedRoute>
                <div>
                  <Navbar onLogout={handleLogout} />
                  <Topic />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/app/chatbot" element={
              <ProtectedRoute>
                <div>
                  <Navbar onLogout={handleLogout} />
                  <Chatbot />
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

// Main App Component with Providers
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;