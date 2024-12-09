import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import UploadPage from '../src/pages/upload'; // Adjust the path if necessary

beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
  localStorage.setItem('authToken', 'mockAuthToken123');
  localStorage.setItem('userName', 'testuser');

  // Mock fetch globally for this test suite
  global.fetch = jest.fn();
  jest.spyOn(window, 'alert').mockImplementation(() => {}); // Mock alert
});

describe('UploadPage Component with Mocked useEffect and useState', () => {

  test('sets groupName and renders correctly without errors', async () => {
    const mockGroupName = 'mockGroupName';

    // Mock the fetch call for `/user/group`
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groupName: mockGroupName }),
    });

    render(
      <MemoryRouter>
        <UploadPage />
      </MemoryRouter>
    );

    // Wait for the useEffect to resolve and verify groupName is displayed
    await waitFor(() => {
      const nameElement = screen.getAllByText((content, element) =>
        element?.textContent?.includes(`Mark as Secret (Accessible only by group: ${mockGroupName})`) || false
      )[0];
      expect(nameElement).toBeInTheDocument();
    });
  });

  
  test('handles uploading a ZIP file successfully', async () => {
    const mockGroupName = 'mockGroupName';

    // Mock the fetch call for `/user/group`
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groupName: mockGroupName }),
    });

    render(
      <MemoryRouter>
        <UploadPage />
      </MemoryRouter>
    );

    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 201,
      json: async () => [{ ID: '1', Name: 'example-package', Version: '1.0.0' }],
    });

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

  test('handles providing a URL for upload successfully with isSecret checkbox checked', async () => {
    const mockGroupName = 'mockGroupName';

    // Mock the fetch call for `/user/group`
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groupName: mockGroupName }),
    });

    render(
      <MemoryRouter>
        <UploadPage />
      </MemoryRouter>
    );

    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 201,
      json: async () => [{ ID: '1', Name: 'example-package', Version: '1.0.0' }],
    });

    fireEvent.change(screen.getByLabelText('Package Name:'), { target: { value: 'example-package' } });
    fireEvent.change(screen.getByLabelText('Or Provide URL for the Package:'), {
      target: { value: 'https://example.com/package.zip' },
    });

    const isSecretCheckbox = screen.getByLabelText(/Mark as Secret/);
    fireEvent.click(isSecretCheckbox); // Mark as secret

    fireEvent.click(screen.getByText('Upload Package'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Package uploaded successfully!');
    });
  });

  test('displays error when neither ZIP file nor URL is provided', async () => {
    const mockGroupName = 'mockGroupName';

    // Mock the fetch call for `/user/group`
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groupName: mockGroupName }),
    });

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

  test('handles error when upload fails', async () => {
    const mockGroupName = 'mockGroupName';

    // Mock the fetch call for `/user/group`
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groupName: mockGroupName }),
    });
    render(
      <MemoryRouter>
        <UploadPage />
      </MemoryRouter>
    );

    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 400,
    });


    fireEvent.change(screen.getByLabelText('Package Name:'), { target: { value: 'example-package' } });
    fireEvent.change(screen.getByLabelText('Or Provide URL for the Package:'), {
      target: { value: 'https://example.com/package.zip' },
    });

    fireEvent.click(screen.getByText('Upload Package'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Upload failed: Missing fields or invalid data.');
    });
  });

  test('displays error for non-ZIP file uploads', async () => {
    const mockGroupName = 'mockGroupName';

    // Mock the fetch call for `/user/group`
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groupName: mockGroupName }),
    });
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

  test('handles providing a URL for upload successfully with isSecret checkbox checked', async () => {
    const mockGroupName = 'mockGroupName';

    // Mock the fetch call for `/user/group`
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groupName: mockGroupName }),
    });
    render(
      <MemoryRouter>
        <UploadPage />
      </MemoryRouter>
    );

    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 201,
      json: async () => [{ ID: '1', Name: 'example-package', Version: '1.0.0' }],
    });


    fireEvent.change(screen.getByLabelText('Package Name:'), { target: { value: 'example-package' } });
    fireEvent.change(screen.getByLabelText('Or Provide URL for the Package:'), {
      target: { value: 'https://example.com/package.zip' },
    });

    const isSecretCheckbox = screen.getByLabelText(/Mark as Secret/);
    fireEvent.click(isSecretCheckbox); // Mark as secret

    fireEvent.click(screen.getByText('Upload Package'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Package uploaded successfully!');
    });
  });

  test('handles uploading a ZIP file successfully with isSecret checkbox unchecked', async () => {
    const mockGroupName = 'mockGroupName';

    // Mock the fetch call for `/user/group`
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groupName: mockGroupName }),
    });
    render(
      <MemoryRouter>
        <UploadPage />
      </MemoryRouter>
    );
    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 201,
      json: async () => [{ ID: '1', Name: 'example-package', Version: '1.0.0' }],
    });


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

  test('handles providing a URL for upload successfully with isSecret checkbox checked', async () => {
    const mockGroupName = 'mockGroupName';

    // Mock the fetch call for `/user/group`
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groupName: mockGroupName }),
    });
    
    render(
      <MemoryRouter>
        <UploadPage />
      </MemoryRouter>
    );
    
    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 201,
      json: async () => [{ ID: '1', Name: 'example-package', Version: '1.0.0' }],
    });
    fireEvent.change(screen.getByLabelText('Package Name:'), { target: { value: 'example-package' } });
    fireEvent.change(screen.getByLabelText('Or Provide URL for the Package:'), {
      target: { value: 'https://example.com/package.zip' },
    });

    const isSecretCheckbox = screen.getByLabelText(/Mark as Secret/);
    fireEvent.click(isSecretCheckbox); // Mark as secret

    fireEvent.click(screen.getByText('Upload Package'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Package uploaded successfully!');
    });
  });
});