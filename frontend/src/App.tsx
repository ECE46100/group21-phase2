import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/home';
import UploadPage from './pages/upload';
import UpdatePage from './pages/update';
import RatingPage from './pages/rating';
import DownloadPage from './pages/download';

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
