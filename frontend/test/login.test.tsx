import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../src/components/login';

beforeEach(() => {
  localStorage.clear();
  jest.resetAllMocks();
  global.fetch = jest.fn();
});

jest.clearAllMocks();
window.alert = jest.fn(); // Mock alert

describe('Login Component', () => {
  test('renders correctly and shows initial UI elements', () => {
    render(<Login />);

    // Check for input fields and buttons
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  test('updates input fields correctly on change', () => {
    render(<Login />);

    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('password123');
  });

  test('successful login sets auth token and displays welcome message', async () => {
    render(<Login />);

    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      text: async () => 'mockAuthToken123', //since backend just do res.status(200).send(token) instead of sending a json
    });

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Login successful!');
      expect(localStorage.getItem('authToken')).toBe('mockAuthToken123');
      expect(localStorage.getItem('userName')).toBe('testuser');
    });

    expect(screen.getByText('Welcome, testuser!')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('shows error if login fails due to invalid credentials', async () => {
    render(<Login />);

    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 401,
    });

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
    });
  });

  test('successful sign-up shows success alert and clears fields', async () => {
    render(<Login />);

    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');

    // Mock the sign-up API call response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(passwordInput, { target: { value: 'newpassword' } });

    fireEvent.click(screen.getByText('Sign Up'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Account created successfully! Please log in.');
    });

    expect(usernameInput).toHaveValue('');
    expect(passwordInput).toHaveValue('');
  });

  test('successful logout removes auth token and resets form', () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');

    render(<Login />);

    fireEvent.click(screen.getByText('Logout'));

    expect(window.alert).toHaveBeenCalledWith('Logged out successfully!');
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('userName')).toBeNull();
    expect(screen.getByPlaceholderText('Username')).toHaveValue('');
    expect(screen.getByPlaceholderText('Password')).toHaveValue('');
  });

  test('shows network error on login failure due to server issues', async () => {
    render(<Login />);

    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText('Network error. Please try again later.')).toBeInTheDocument();
    });
  });
});
