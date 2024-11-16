import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RatingPage from '../src/pages/rating';

beforeEach(() => {
  localStorage.clear();
  jest.resetAllMocks();
  global.fetch = jest.fn();
});

window.alert = jest.fn();
const consoleSpy = jest.spyOn(console, 'log');

describe('RatingPage Component', () => {
  test('renders correctly and shows initial UI elements', () => {
    render(
      <MemoryRouter>
        <RatingPage />
      </MemoryRouter>
    );

    // Check for input field and button
    expect(screen.getByLabelText('Search for Package:')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  test('alerts if authentication token is missing on mount', () => {
    render(
      <MemoryRouter>
        <RatingPage />
      </MemoryRouter>
    );

    // Check console message
    expect(consoleSpy).toHaveBeenCalledWith('no token set while entered rating');
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
    });

    render(
      <MemoryRouter>
        <RatingPage />
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

  test('fetches and displays rating data for a package', async () => {
    localStorage.setItem('authToken', 'mockAuthToken');

    // Mock fetch response for search
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
          overall: 4.5,
          dependencyPinning: 4.0,
          codeReviewMetric: 4.2,
        }),
      });

    render(
      <MemoryRouter>
        <RatingPage />
      </MemoryRouter>
    );

    // Enter a search term and submit the form
    fireEvent.change(screen.getByLabelText('Search for Package:'), { target: { value: 'example' } });
    fireEvent.click(screen.getByText('Search'));

    // Wait for search results
    await waitFor(() => {
      expect(screen.getByText('example-package')).toBeInTheDocument();
    });

    // Click on "Get Rating" button
    fireEvent.click(screen.getByText('Get Rating'));

    // Wait for rating data to appear
    await waitFor(() => {
      expect(screen.getByText('Rating Details')).toBeInTheDocument();
      expect(screen.getByText('Overall Rating:')).toBeInTheDocument();
      expect(screen.getByText('4.5 / 5')).toBeInTheDocument();
    });
  });

  test('handles pagination: next and previous pages', async () => {
    localStorage.setItem('authToken', 'mockAuthToken');

    // Mock fetch response for pagination
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          data: [{ ID: '1', Name: 'package-page-1', Version: '1.0.0' }],
        }),
      })
      .mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          data: [{ ID: '2', Name: 'package-page-2', Version: '2.0.1' }],
        }),
      });

    render(
      <MemoryRouter>
        <RatingPage />
      </MemoryRouter>
    );

    // First search
    fireEvent.change(screen.getByLabelText('Search for Package:'), { target: { value: 'package' } });
    fireEvent.click(screen.getByText('Search'));

    // Wait for first page result
    await waitFor(() => {
      expect(screen.getByText('package-page-1')).toBeInTheDocument();
    });

    // Click "Next Page"
    fireEvent.click(screen.getByText('Next Page'));

    // Wait for second page result
    await waitFor(() => {
      expect(screen.getByText('package-page-2')).toBeInTheDocument();
    });

    // Click "Previous Page"
    fireEvent.click(screen.getByText('Previous Page'));

    // Wait for first page result again
    await waitFor(() => {
      expect(screen.getByText('package-page-1')).toBeInTheDocument();
    });
  });
});
