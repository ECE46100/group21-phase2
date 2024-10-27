import React from 'react';
import { Link } from 'react-router-dom';
import './home.css'; // Optional: For styling

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <header className="hero">
        <h1>Cool Website</h1>
        <p>ECE@Purdue's course in Software Engineering, offered by the inimitable Prof. James C. Davis and his colorful cast of quirky teaching assistants.</p>
      </header>

      <nav className="nav-links">
        <ul>
          <li><Link to="/upload">Upload</Link></li>
          <li><Link to="/update">Update</Link></li>
          <li><Link to="/rating">Rating</Link></li>
          <li><Link to="/download">Download</Link></li>
        </ul>
      </nav>

      <section className="Our goals">

      </section>

      <footer className="footer">
        <p>© ECE461 group21's Website. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
