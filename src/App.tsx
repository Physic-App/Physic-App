import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navigation/Navbar';
import ToastContainer from './components/Toast/ToastContainer';
import Dashboard from './pages/Dashboard';
import Chapters from './pages/Chapters';
import Topic from './pages/Topic';
import { useToast } from './hooks/useToast';
import { User } from './types';
import { apiService } from './services/api';

function App() {
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toasts, showToast, removeToast } = useToast();

  // Sample user data - replace with API call
  const sampleUserData: User = {
    id: '1',
    name: "Arjun Kumar",
    email: "arjun.kumar@example.com",
    streak: 7,
    completedChapters: 5,
    totalChapters: 8,
    studyTime: 24,
    averageScore: 85,
    achievements: 12,
    lastTopic: {
      chapter: "Algebra",
      topic: "Quadratic Equations",
      progress: 60
    }
  };

  useEffect(() => {
    // Initialize MathJax if available
    if (window.MathJax) {
      window.MathJax.typesetPromise?.();
    }

    // Simulate loading user data
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, you would call:
        // const userData = await apiService.getUserData();
        // setUserData(userData);
        
        // For demo purposes, using sample data
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        setUserData(sampleUserData);
        
      } catch (error) {
        console.error('Failed to load user data:', error);
        showToast('Failed to load user data. Please try again.', 'error');
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
      // In a real app, redirect to login page
    } catch (error) {
      console.error('Logout failed:', error);
      showToast('Logout failed. Please try again.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading MathMentor...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="App font-nunito bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
          <Navbar onLogout={handleLogout} />
          <ToastContainer toasts={toasts} onRemove={removeToast} />
          
          <main>
            <Routes>
              <Route path="/" element={<Dashboard userData={userData} />} />
              <Route path="/chapters" element={<Chapters />} />
              <Route path="/chapters/:chapterId" element={<Topic />} />
              <Route path="/topics/:topicId" element={<Topic />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;