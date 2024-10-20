// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import Upload from './UploadPage';
import Update from './UpdatePage';
import Rating from './RatingPage';
import Download from './DownloadPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/update" element={<Update />} />
        <Route path="/rating" element={<Rating />} />
        <Route path="/download" element={<Download />} />
      </Routes>
    </Router>
  );
}

export default App;
