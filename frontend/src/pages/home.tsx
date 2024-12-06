import React from 'react';
import { Link } from 'react-router-dom';
import Login from '../components/login';
import '../assets/css/home.css'; // Optional: For styling

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <header className="hero">
        <h1>Home</h1>
      </header>

      <nav className="nav-links">
        <ul>
          <li><Link to="/upload">Upload</Link></li>
          <li><Link to="/update">Update</Link></li>
          <li><Link to="/rating">Rating</Link></li>
          <li><Link to="/download">Download</Link></li>
          <li><Link to="/manageUsers">Users</Link></li>
          <li><Link to="/history">History</Link></li>
        </ul>
      </nav>

      <Login /> {/* Use the login component here */}

      <section className="Our goals">

      </section>

      <footer className="footer">
        <p>© ECE461 group21's Website. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
