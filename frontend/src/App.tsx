import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/home';
import UploadPage from './pages/upload';
import UpdatePage from './pages/update';
import RatingPage from './pages/rating';
import DownloadPage from './pages/download';
import ManageUsers from './pages/manageUsers';
import HistoryPage from './pages/history';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/update" element={<UpdatePage />} />
        <Route path="/rating" element={<RatingPage />} />
        <Route path="/download" element={<DownloadPage />} />
        <Route path="/manageUsers" element={<ManageUsers />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </Router>
  );
};

export default App;
