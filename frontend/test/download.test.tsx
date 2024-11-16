import React from 'react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import DownloadPage from '../src/pages/download';

beforeEach(() => {
  localStorage.clear();
  jest.resetAllMocks();
  global.fetch = jest.fn();
});

window.alert = jest.fn();
const consoleSpy = jest.spyOn(console, 'log');

describe('DownloadPage Component', () => {
  test('renders correctly and shows initial UI elements', () => {
    render(
      <MemoryRouter>
        <DownloadPage />
      </MemoryRouter>
    );

    // Check for initial input field and button
    expect(screen.getByLabelText('Search for Package:')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  test('alerts if authentication token is missing on mount', () => {
    render(
      <MemoryRouter>
        <DownloadPage />
      </MemoryRouter>
    );
    expect(consoleSpy).toHaveBeenCalledWith('no token set while entered download');
    consoleSpy.mockRestore();
  });

  test('performs search and displays results', async () => {
    // Set the auth token in localStorage
    localStorage.setItem('authToken', 'mockAuthToken');

    // Mock fetch response for search
    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => ({
        data: [
          { ID: '1', Name: 'example-package', Version: '1.0.0' },
          { ID: '2', Name: 'another-package', Version: '2.0.1' },
        ],
      }),
      headers: {
        get: jest.fn(() => '10'),
      },
    });

    render(
      <MemoryRouter>
        <DownloadPage />
      </MemoryRouter>
    );

    await act(async () => {
      // Enter a search term and submit the form
      fireEvent.change(screen.getByLabelText('Search for Package:'), { target: { value: 'example' } });
      fireEvent.click(screen.getByText('Search'));
    });

    // Wait for the packages to appear
    await waitFor(() => {
      expect(screen.getByText('example-package')).toBeInTheDocument();
      expect(screen.getByText('another-package')).toBeInTheDocument();
    });
  });

  test('the case when response.status is 403', async () => {
    localStorage.setItem('authToken', 'mockAuthToken');

    // Mock fetch response with 403 error
    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 403,
      json: async () => ({ error: 'Authentication failed' }),
    });

    render(
      <MemoryRouter>
        <DownloadPage />
      </MemoryRouter>
    );

    await act(async () => {
      // Enter a search term and submit the form
      fireEvent.change(screen.getByLabelText('Search for Package:'), { target: { value: 'example' } });
      fireEvent.click(screen.getByText('Search'));
    });

    // Wait for error message
    await waitFor(() => {
      expect(
        screen.getByText('Search failed: Authentication failed due to invalid or missing AuthenticationToken.')
      ).toBeInTheDocument();
    });
  });

  // test('handles download button click', async () => {
  //   localStorage.setItem('authToken', 'mockAuthToken');

  //   // Mock fetch response for download
  //   (fetch as jest.Mock).mockResolvedValueOnce({
  //     status: 200,
  //     json: async () => ({
  //       data: { Content: 'base64content' },
  //       metadata: { Name: 'example-package', Version: '1.0.0' },
  //     }),
  //   });

  //   render(
  //     <MemoryRouter>
  //       <DownloadPage />
  //     </MemoryRouter>
  //   );

  //   await act(async () => {
  //     // Set state with mock data directly for simplicity
  //     fireEvent.change(screen.getByLabelText('Search for Package:'), { target: { value: 'example' } });
  //     fireEvent.click(screen.getByText('Search'));
  //   });

  //   // Mock the package display
  //   await waitFor(() => {
  //     expect(screen.getByText('example-package')).toBeInTheDocument();
  //   });

  //   // Simulate click on download button
  //   const downloadButton = screen.getByText('Download');
  //   fireEvent.click(downloadButton);

  //   await waitFor(() => {
  //     expect(fetch).toHaveBeenCalledWith('/packages/1', expect.anything());
  //   });
  // });
});
