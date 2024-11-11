import React, { useState } from 'react';
import '../assets/css/login.css';

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

  // Handle login with PUT request to /authenticate
  const handleLogin = async () => {
    setError(null); // Reset any previous errors
    try {
      console.log('Attempting login with:', formData);

      // Prepare the request body
      const requestBody = {
        User: {
          name: formData.username,
          isAdmin: false,
        },
        Secret: {
          password: formData.password,
        },
      };

      const response = await fetch('http://localhost:5000/authenticate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // if (true) {
      //   const token  = "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      if (response.status === 200) {
        console.log(response);
        const allData= await response.json();
        const token = allData.token;
        alert('Login successful!');
        setIsLoggedIn(true);
        localStorage.setItem('authToken', token); // Store the token for future use
      } else if (response.status === 400) {
        setError('Missing fields or improperly formed request.');
      } else if (response.status === 401) {
        setError('Invalid username or password.');
      } else if (response.status === 501) {
        setError('Authentication not supported by the system.');
      } else {
        setError('Failed to login due to an unknown error.');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError('Network error. Please try again later.');
    }
  };

  // Handle sign-up logic (kept as-is)
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

  // Handle logout logic (kept as-is)
  const handleLogout = async () => {
    try {
      
      alert('Logged out successfully!');
      setIsLoggedIn(false);
      setFormData({ username: '', password: '' });
      localStorage.removeItem('authToken'); // Clear the token
      console.log('Attempting logout...');
      // const response = await fetch('http://localhost:5000/logout', {
      //   method: 'GET',
      // });

      // if (response.ok) {
      //   alert('Logged out successfully!');
      //   setIsLoggedIn(false);
      //   setFormData({ username: '', password: '' });
      //   localStorage.removeItem('authToken'); // Clear the token
      // } else {
      //   const errorData = await response.json();
      //   setError(errorData.message || 'Failed to logout.');
      // }
    } catch (err) {
      setError('Network error. Please try again later.');
    }
  };

  return (
    <div className="login-block">
      {localStorage.getItem('authToken') ? (
        <div>
          <h2>Welcome, {formData.username}!</h2>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <form onSubmit={(e) => e.preventDefault()}>
          <h2>User Login</h2>
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
