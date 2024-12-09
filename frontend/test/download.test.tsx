import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // Import MemoryRouter
import DownloadPage from '../src/pages/download';

beforeEach(() => {
  localStorage.clear();
  jest.resetAllMocks();
  global.fetch = jest.fn();
});

jest.clearAllMocks();
window.alert = jest.fn(); // Mock alert

describe('DownloadPage Component', () => {
  test('renders correctly and shows initial UI elements', () => {
    render(
      <MemoryRouter>
        <DownloadPage />
      </MemoryRouter>
    );

    // Check for input fields and buttons
    expect(screen.getByText('Search by Name or Regex:')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., 1.2.3 or *')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  test('updates input fields correctly on change', () => {
    render(
      <MemoryRouter>
        <DownloadPage />
      </MemoryRouter>
    );

    const nameInput = screen.getByRole('textbox', { name: /search by name or regex:/i });
    const versionInput = screen.getByPlaceholderText('e.g., 1.2.3 or *');

    fireEvent.change(nameInput, { target: { value: 'example-package' } });
    fireEvent.change(versionInput, { target: { value: '1.0.0' } });

    expect(nameInput).toHaveValue('example-package');
    expect(versionInput).toHaveValue('1.0.0');
  });

  test('handles successful search with packages returned', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    render(
      <MemoryRouter>
        <DownloadPage />
      </MemoryRouter>
    );

    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => [
        { ID: '1', Name: 'example-package', Version: '1.0.0' },
        { ID: '2', Name: 'another-package', Version: '2.0.0' },
      ],
    });
    

    fireEvent.change(screen.getByRole('textbox', { name: /search by name or regex:/i }), {
      target: { value: 'example-package' },
    });
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByText('Available Packages:')).toBeInTheDocument();
      expect(screen.getByText('example-package')).toBeInTheDocument();
      expect(screen.getByText('another-package')).toBeInTheDocument();
    });
  });

  test('handles no packages found during regex search', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    render(
      <MemoryRouter>
        <DownloadPage />
      </MemoryRouter>
    );

    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 404,
    });

    // search by name&version
    // fireEvent.change(screen.getByRole('textbox', { name: /search by name or regex:/i }), {
    //   target: { value: 'nonexistent-package' },
    // });
    // fireEvent.click(screen.getByText('Search'));
    // await waitFor(() => {
    //   expect(screen.getByText('Search failed with an unknown error.')).toBeInTheDocument();
    // });

    // search by regex
    fireEvent.change(screen.getByRole('textbox', { name: /search by name or regex:/i }), {
      target: { value: '.*' },
    });
    fireEvent.click(screen.getByText('Search'));
    await waitFor(() => {
      expect(screen.getByText('No packages found with the given regex.')).toBeInTheDocument();
    });
  });

  test('handles no packages found during name search', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    render(
      <MemoryRouter>
        <DownloadPage />
      </MemoryRouter>
    );

    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 404,
    });

    // search by name&version
    fireEvent.change(screen.getByRole('textbox', { name: /search by name or regex:/i }), {
      target: { value: 'nonexistent-package' },
    });
    fireEvent.click(screen.getByText('Search'));
    await waitFor(() => {
      expect(screen.getByText('Search failed with an unknown error.')).toBeInTheDocument();
    });
  });

  test('handles error during search', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    render(
      <MemoryRouter>
        <DownloadPage />
      </MemoryRouter>
    );

    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

    fireEvent.change(screen.getByRole('textbox', { name: /search by name or regex:/i }), {
      target: { value: 'example-package' },
    });
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByText('An error occurred while searching for packages.')).toBeInTheDocument();
    });
  });

  test('handles package download success', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    render(
      <MemoryRouter>
        <DownloadPage />
      </MemoryRouter>
    );

    const packages = [{ ID: '1', Name: 'example-package', Version: '1.0.0' }];
    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => packages,
    });

    fireEvent.change(screen.getByRole('textbox', { name: /search by name or regex:/i }), {
      target: { value: 'example-package' },
    });
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByText('example-package')).toBeInTheDocument();
    });

    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => ({
        data: { Content: 'mockBase64Content' },
        metadata: { Name: 'example-package', Version: '1.0.0' },
      }),
    });

    fireEvent.click(screen.getByText('Download'));

    await waitFor(() => {
      expect(window.alert).not.toHaveBeenCalled();
    });
  });

  test('handles package download failure', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    render(
      <MemoryRouter>
        <DownloadPage />
      </MemoryRouter>
    );

    const packages = [{ ID: '1', Name: 'example-package', Version: '1.0.0' }];
    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => packages,
    });

    fireEvent.change(screen.getByRole('textbox', { name: /search by name or regex:/i }), {
      target: { value: 'example-package' },
    });
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByText('example-package')).toBeInTheDocument();
    });

    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 404,
    });

    fireEvent.click(screen.getByText('Download'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Download failed: Package does not exist.');
    });
  });
});
