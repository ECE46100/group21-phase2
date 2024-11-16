import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UpdatePage from '../src/pages/update';

beforeEach(() => {
  localStorage.clear();
  jest.resetAllMocks();
  global.fetch = jest.fn();
});

window.alert = jest.fn();
const consoleSpy = jest.spyOn(console, 'log');

describe('UpdatePage Component', () => {
  test('renders correctly and shows initial UI elements', () => {
    render(
      <MemoryRouter>
        <UpdatePage />
      </MemoryRouter>
    );

    // Check for initial input field and button
    expect(screen.getByLabelText('Search for Package:')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  test('alerts if authentication token is missing on mount', () => {
    render(
      <MemoryRouter>
        <UpdatePage />
      </MemoryRouter>
    );
    expect(consoleSpy).toHaveBeenCalledWith('no token set while entered update');
    consoleSpy.mockRestore();
  });

  test('performs search and displays results', async () => {
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
    });

    render(
      <MemoryRouter>
        <UpdatePage />
      </MemoryRouter>
    );

    // Enter a search term and submit the form
    fireEvent.change(screen.getByLabelText('Search for Package:'), { target: { value: 'example' } });
    fireEvent.click(screen.getByText('Search'));

    // Wait for the packages to appear
    await waitFor(() => {
      expect(screen.getByText('example-package')).toBeInTheDocument();
      expect(screen.getByText('another-package')).toBeInTheDocument();
    });
  });

  test('handles pagination: next and previous pages', async () => {
    localStorage.setItem('authToken', 'mockAuthToken');

    // Mock fetch response for search with pagination
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          data: [{ ID: '1', Name: 'example-package', Version: '1.0.0' }],
        }),
      })
      .mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          data: [{ ID: '2', Name: 'another-package', Version: '2.0.1' }],
        }),
      })
      .mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          data: [{ ID: '1', Name: 'example-package', Version: '1.0.0' }],
        }),
      });

    render(
      <MemoryRouter>
        <UpdatePage />
      </MemoryRouter>
    );

    // Initial search
    fireEvent.change(screen.getByLabelText('Search for Package:'), { target: { value: 'example' } });
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByText('example-package')).toBeInTheDocument();
    });

    // Go to next page
    fireEvent.click(screen.getByText('Next Page'));
    await waitFor(() => {
      expect(screen.getByText('another-package')).toBeInTheDocument();
    });

    // Go back to previous page
    fireEvent.click(screen.getByText('Previous Page'));
    await waitFor(() => {
      expect(screen.getByText('example-package')).toBeInTheDocument();
    });
  });

  test('selects a package and displays the update form', async () => {
    localStorage.setItem('authToken', 'mockAuthToken');

    // Mock fetch response for search
    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => ({
        data: [{ ID: '1', Name: 'example-package', Version: '1.0.0' }],
      }),
    });

    render(
      <MemoryRouter>
        <UpdatePage />
      </MemoryRouter>
    );

    // Perform search and select a package
    fireEvent.change(screen.getByLabelText('Search for Package:'), { target: { value: 'example' } });
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      screen.getByText('example-package');
    });

    // Select package to display update form
    fireEvent.click(screen.getByText('Select'));
    expect(screen.getByText('Package Name (Pre-filled):')).toBeInTheDocument();
    expect(screen.getByText('Current Version (Pre-filled):')).toBeInTheDocument();
  });
});
