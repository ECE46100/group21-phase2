// src/login.tsx
import React, { useState } from 'react';
import './login.css'; // Optional: For styling

interface AuthForm {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<AuthForm>({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle login with GET request to /user/login
  const handleLogin = async () => {
    try {
      console.log('Attempting login with:', formData);

      // Create query parameters
      const queryParams = new URLSearchParams({
        username: formData.username,
        password: formData.password,
      });

      const response = await fetch(`http://localhost:5000/user/login?${queryParams}`, {
        method: 'GET',
      });

      if (response.ok) {
        const { token } = await response.json();
        alert('Login successful!');
        setIsLoggedIn(true);
        localStorage.setItem('authToken', token); // Store the token
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to login.');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    }
  };

  // Handle sign-up with POST request to /user
  const handleSignUp = async () => {
    try {
      console.log('Attempting sign-up with:', formData);
      const response = await fetch('http://localhost:5000/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Account created successfully! Please log in.');
        setFormData({ username: '', password: '' });
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create account.');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    }
  };

  // Handle logout with GET request to /logout
  const handleLogout = async () => {
    try {
      console.log('Attempting logout...');
      const response = await fetch('http://localhost:5000/logout', {
        method: 'GET',
      });

      if (response.ok) {
        alert('Logged out successfully!');
        setIsLoggedIn(false);
        setFormData({ username: '', password: '' });
        localStorage.removeItem('authToken'); // Clear the token
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to logout.');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    }
  };

  return (
    <div className="login-block">
      {isLoggedIn ? (
        <div>
          <h2>Welcome, {formData.username}!</h2>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <form onSubmit={(e) => e.preventDefault()}>
          <h2>User Login / Sign Up</h2>
          <div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <div className="button-group">
            <button type="button" onClick={handleLogin}>
              Login
            </button>
            <button type="button" onClick={handleSignUp}>
              Sign Up
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Login;
