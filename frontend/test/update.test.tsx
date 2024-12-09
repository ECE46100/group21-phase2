import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import UpdatePage from '../src/pages/update'; // Adjust the path if necessary

beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
  global.fetch = jest.fn();
  localStorage.setItem('authToken', 'mockAuthToken123');
});
jest.spyOn(window, 'alert').mockImplementation(() => {}); // Mock alert

describe('UpdatePage Component', () => {
  test('renders the search form initially', () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    render(
      <MemoryRouter>
        <UpdatePage />
      </MemoryRouter>
    );

    expect(screen.getByText('Update a Package')).toBeInTheDocument();
    expect(screen.getByLabelText('Search by Name or Regex:')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  test('handles searching for packages successfully', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    const mockPackages = [
      { ID: 1, Name: 'example-package-1', Version: '1.0.0' },
      { ID: 2, Name: 'example-package-2', Version: '1.2.0' },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => mockPackages,
    });

    render(
      <MemoryRouter>
        <UpdatePage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Search by Name or Regex:'), {
      target: { value: 'example-package' },
    });
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByText('Search Results:')).toBeInTheDocument();
      expect(screen.getByText('example-package-1')).toBeInTheDocument();
      expect(screen.getByText('example-package-2')).toBeInTheDocument();
    });
  });

  test('handles selecting a package', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    const mockPackages = [
      { ID: 1, Name: 'example-package-1', Version: '1.0.0' },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => mockPackages,
    });

    render(
      <MemoryRouter>
        <UpdatePage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Search by Name or Regex:'), {
      target: { value: 'example-package' },
    });
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      fireEvent.click(screen.getByText('Select'));
    });

    expect(screen.getByLabelText('Package Name (Pre-filled):')).toHaveValue('example-package-1');
    expect(screen.getByLabelText('Current Version (Pre-filled):')).toHaveValue('1.0.0');
    expect(screen.getByLabelText('New Version:')).toBeInTheDocument();
  });

  test('handles providing a file for upload', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    const mockPackages = [
      { ID: 1, Name: 'example-package-1', Version: '1.0.0' },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => mockPackages,
    });

    render(
      <MemoryRouter>
        <UpdatePage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Search by Name or Regex:'), {
      target: { value: 'example-package' },
    });
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      fireEvent.click(screen.getByText('Select'));
    });

    const file = new File(['dummy content'], 'example.zip', { type: 'application/zip' });
    const fileInput = screen.getByLabelText('Upload New Version File:') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(fileInput.files![0]).toBe(file);
    expect(fileInput.files!.length).toBe(1);
  });

  test('handles providing a URL for update', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    const mockPackages = [
      { ID: 1, Name: 'example-package-1', Version: '1.0.0' },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => mockPackages,
    });

    render(
      <MemoryRouter>
        <UpdatePage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Search by Name or Regex:'), {
      target: { value: 'example-package' },
    });
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      fireEvent.click(screen.getByText('Select'));
    });

    const urlInput = screen.getByLabelText('Or Provide URL for the Update:');
    fireEvent.change(urlInput, { target: { value: 'https://example.com/package.zip' } });

    expect(urlInput).toHaveValue('https://example.com/package.zip');
  });

  test('handles updating a package successfully', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    const mockPackages = [
      { ID: 1, Name: 'example-package-1', Version: '1.0.0' },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => mockPackages,
    });

    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
    });

    render(
      <MemoryRouter>
        <UpdatePage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Search by Name or Regex:'), {
      target: { value: 'example-package' },
    });
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      fireEvent.click(screen.getByText('Select'));
    });

    fireEvent.change(screen.getByLabelText('New Version:'), { target: { value: '2.0.0' } });

    const urlInput = screen.getByLabelText('Or Provide URL for the Update:');
    fireEvent.change(urlInput, { target: { value: 'https://example.com/package.zip' } });

    fireEvent.click(screen.getByText('Update Package'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Version updated successfully!');
    });
  });

  test('handles error when updating a package fails', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    const mockPackages = [
      { ID: 1, Name: 'example-package-1', Version: '1.0.0' },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => mockPackages,
    });

    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 400,
      text: async () => 'Error message',
    });

    render(
      <MemoryRouter>
        <UpdatePage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Search by Name or Regex:'), {
      target: { value: 'example-package' },
    });
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      fireEvent.click(screen.getByText('Select'));
    });

    fireEvent.change(screen.getByLabelText('New Version:'), { target: { value: '2.0.0' } });

    const urlInput = screen.getByLabelText('Or Provide URL for the Update:');
    fireEvent.change(urlInput, { target: { value: 'https://example.com/package.zip' } });

    fireEvent.click(screen.getByText('Update Package'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Error updating package: Error message');
    });
  });
});
