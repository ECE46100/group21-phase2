import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import UploadPage from '../src/pages/upload'; // Adjust the path if necessary

beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
  global.fetch = jest.fn();
  localStorage.setItem('authToken', 'mockAuthToken123');
});
jest.spyOn(window, 'alert').mockImplementation(() => {}); // Mock alert

describe('UploadPage Component', () => {
  test('renders the upload form', () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    render(
      <MemoryRouter>
        <UploadPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Upload a Package')).toBeInTheDocument();
    expect(screen.getByLabelText('Package Name:')).toBeInTheDocument();
    expect(screen.getByLabelText('Upload ZIP File:')).toBeInTheDocument();
    expect(screen.getByLabelText('Or Provide URL for the Package:')).toBeInTheDocument();
    expect(screen.getByText('Upload Package')).toBeInTheDocument();
  });

  test('handles uploading a ZIP file successfully', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 201,
      json: async () => [{ ID: '1', Name: 'example-package', Version: '1.0.0' }],
    });

    render(
      <MemoryRouter>
        <UploadPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Package Name:'), { target: { value: 'example-package' } });

    const file = new File(['dummy content'], 'example.zip', { type: 'application/zip' });
    const fileInput = screen.getByLabelText('Upload ZIP File:') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(fileInput.files![0]).toBe(file);
    expect(fileInput.files!.length).toBe(1);

    fireEvent.click(screen.getByText('Upload Package'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Package uploaded successfully!');
    });
  });

  test('handles providing a URL for upload successfully', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 201,
      json: async () => [{ ID: '1', Name: 'example-package', Version: '1.0.0' }],
    });

    render(
      <MemoryRouter>
        <UploadPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Package Name:'), { target: { value: 'example-package' } });
    fireEvent.change(screen.getByLabelText('Or Provide URL for the Package:'), {
      target: { value: 'https://example.com/package.zip' },
    });

    fireEvent.click(screen.getByText('Upload Package'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Package uploaded successfully!');
    });
  });

  test('displays error when neither ZIP file nor URL is provided', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    render(
      <MemoryRouter>
        <UploadPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Package Name:'), { target: { value: 'example-package' } });

    fireEvent.click(screen.getByText('Upload Package'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Please provide either a ZIP file or a URL for the upload.');
    });
  });

  test('displays error for non-ZIP file uploads', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    render(
      <MemoryRouter>
        <UploadPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Package Name:'), { target: { value: 'example-package' } });

    const file = new File(['dummy content'], 'example.txt', { type: 'text/plain' });
    const fileInput = screen.getByLabelText('Upload ZIP File:') as HTMLInputElement;

    await waitFor(() => {
      fireEvent.change(fileInput, { target: { files: [file] } });
      expect(window.alert).toHaveBeenCalledWith('Please select a ZIP file.');
    });
    await waitFor(() => {
      fireEvent.click(screen.getByText('Upload Package'));
      expect(window.alert).toHaveBeenCalledWith('Please provide either a ZIP file or a URL for the upload.');
    });

  });

  test('handles error when upload fails', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 400,
    });

    render(
      <MemoryRouter>
        <UploadPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Package Name:'), { target: { value: 'example-package' } });
    fireEvent.change(screen.getByLabelText('Or Provide URL for the Package:'), {
      target: { value: 'https://example.com/package.zip' },
    });

    fireEvent.click(screen.getByText('Upload Package'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Upload failed: Missing fields or invalid data.');
    });
  });
});
