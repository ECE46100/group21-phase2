// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import UploadPage from './UploadPage';
import UpdatePage from './UpdatePage';
import RatingPage from './RatingPage';
import DownloadPage from './DownloadPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/update" element={<UpdatePage />} />
        <Route path="/rating" element={<RatingPage />} />
        <Route path="/download" element={<DownloadPage />} />
      </Routes>
    </Router>
  );
};

export default App;
