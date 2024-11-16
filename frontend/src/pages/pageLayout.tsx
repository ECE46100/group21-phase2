import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/pageLayout.css'; // Shared CSS for all pages

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, children }) => {
  return (
    <div className="page-container">
      <header className="hero">
        <div className="back-button-container">
          <Link to="/" className="back-button">
            &larr; Home
          </Link>
        </div>
        <h1>{title}</h1>
      </header>
      <main className="content">{children}</main>
      <footer className="footer">
        <p>© 2024 My Website. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PageLayout;
