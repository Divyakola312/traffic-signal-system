import React, { useState } from 'react';
import LoginPage from './components/LoginPage';
import UploadPage from './components/UploadPage';
import AnalyticsPage from './components/AnalyticsPage';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [uploadedVideos, setUploadedVideos] = useState({
    north: null,
    south: null,
    east: null,
    west: null
  });

  const handleLogin = () => {
    if (username && password) {
      setCurrentPage('upload');
    }
  };

  const handleLogout = () => {
    setCurrentPage('login');
    setUsername('');
    setPassword('');
    setUploadedVideos({
      north: null,
      south: null,
      east: null,
      west: null
    });
  };

  const handleVideoUpload = (lane, file) => {
    if (file && file.type.startsWith('video/')) {
      setUploadedVideos(prev => ({
        ...prev,
        [lane]: URL.createObjectURL(file)
      }));
    }
  };

  const startAnalysis = () => {
    // Check if at least one video is uploaded
    const hasVideo = Object.values(uploadedVideos).some(video => video !== null);
    if (hasVideo) {
      setCurrentPage('analytics');
    }
  };

  const handleBackToUpload = () => {
    setCurrentPage('upload');
    setUploadedVideos({
      north: null,
      south: null,
      east: null,
      west: null
    });
  };

  return (
    <div className="App">
      {currentPage === 'login' && (
        <LoginPage
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          handleLogin={handleLogin}
        />
      )}
      
      {currentPage === 'upload' && (
        <UploadPage
          uploadedVideos={uploadedVideos}
          handleVideoUpload={handleVideoUpload}
          startAnalysis={startAnalysis}
          handleLogout={handleLogout}
        />
      )}
      
      {currentPage === 'analytics' && (
        <AnalyticsPage
          uploadedVideos={uploadedVideos}
          handleBackToUpload={handleBackToUpload}
          handleLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;