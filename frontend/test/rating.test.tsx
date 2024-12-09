import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import RatingPage from '../src/pages/rating'; // Adjust the path to your actual file

beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
  localStorage.setItem('authToken', 'mockAuthToken123');
  global.fetch = jest.fn();
});
jest.spyOn(window, 'alert').mockImplementation(() => { }); // Mock alert

describe('RatingPage Component', () => {

  test('renders correctly and performs package search', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    const mockPackages = [
      { ID: '1', Name: 'example-package-1', Version: '1.0.0' },
      { ID: '2', Name: 'example-package-2', Version: '2.0.0' },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => mockPackages,
    });

    render(
      <MemoryRouter>
        <RatingPage />
      </MemoryRouter>
    );

    // Simulate user input and search
    await act(async () => {
      fireEvent.change(screen.getByRole('textbox', { name: /search by name or regex:/i }), {
        target: { value: 'example-package' },
      });
      fireEvent.click(screen.getByText('Search'));
    });

    // Assert search results
    await waitFor(() => {
      expect(screen.getByText('example-package-1')).toBeInTheDocument();
      expect(screen.getByText('example-package-2')).toBeInTheDocument();
    });
  });

  test('fetches and displays package rating data', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    const mockPackages = [
      { ID: '1', Name: 'example-package-1', Version: '1.0.0' },
    ];

    const mockRatingData = {
      BusFactor: '0.8',
      BusFactorLatency: '0.01',
      Correctness: '0.9',
      CorrectnessLatency: '0.02',
      RampUp: '0.7',
      RampUpLatency: '0.02',
      ResponsiveMaintainer: '1.0',
      ResponsiveMaintainerLatency: '0.03',
      LicenseScore: '0.85',
      LicenseScoreLatency: '0.01',
      GoodPinningPractice: '0.9',
      GoodPinningPracticeLatency: '0.01',
      PullRequest: '0.7',
      PullRequestLatency: '0.02',
      NetScore: '0.88',
      NetScoreLatency: '0.01',
    };

    // Mock package search response
    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => mockPackages,
    });

    render(
      <MemoryRouter>
        <RatingPage />
      </MemoryRouter>
    );

    // Simulate user input and search
    fireEvent.change(screen.getByRole('textbox', { name: /search by name or regex:/i }), {
      target: { value: 'example-package' },
    });
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByText('example-package-1')).toBeInTheDocument();
    });

    // Mock rating API response
    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => mockRatingData,
    });

    fireEvent.click(screen.getByText('Get Rating'));

    // Assert rating data is displayed
    await waitFor(() => {
      expect(screen.getByText('BusFactor:')).toBeInTheDocument();
      expect(screen.getByText('Correctness:')).toBeInTheDocument();
      expect(screen.getByText('RampUp:')).toBeInTheDocument();
    });
  });

  test('shows error if search with name fails 404', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 404,
    });

    render(
      <MemoryRouter>
        <RatingPage />
      </MemoryRouter>
    );

    await act(async () => {
      fireEvent.change(screen.getByRole('textbox', { name: /search by name or regex:/i }), {
        target: { value: 'nonexistent-package' },
      });
      fireEvent.click(screen.getByText('Search'));
    });


    await waitFor(() => {
      expect(screen.getByText('No package found.')).toBeInTheDocument();
    });
  });

  test('shows error if search with regex fails 404', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 404,
    });

    render(
      <MemoryRouter>
        <RatingPage />
      </MemoryRouter>
    );

    await act(async () => {
      fireEvent.change(screen.getByRole('textbox', { name: /search by name or regex:/i }), {
        target: { value: '.*' },
      });
      fireEvent.click(screen.getByText('Search'));
    });


    await waitFor(() => {
      expect(screen.getByText('No packages found with the given regex.')).toBeInTheDocument();
    });
  });

  test('shows error if search with name fails 500', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 500,
    });

    render(
      <MemoryRouter>
        <RatingPage />
      </MemoryRouter>
    );

    await act(async () => {
      fireEvent.change(screen.getByRole('textbox', { name: /search by name or regex:/i }), {
        target: { value: 'nonexistent-package' },
      });
      fireEvent.click(screen.getByText('Search'));
    });


    await waitFor(() => {
      expect(screen.getByText('Search failed with an unknown error.')).toBeInTheDocument();
    });
  });

  test('shows error if search with regex fails 500', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 500,
    });

    render(
      <MemoryRouter>
        <RatingPage />
      </MemoryRouter>
    );

    await act(async () => {
      fireEvent.change(screen.getByRole('textbox', { name: /search by name or regex:/i }), {
        target: { value: '.*' },
      });
      fireEvent.click(screen.getByText('Search'));
    });


    await waitFor(() => {
      expect(screen.getByText('Search failed with an unknown error.')).toBeInTheDocument();
    });
  });

  test('shows error if rating fetch fails', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    const mockPackages = [
      { ID: '1', Name: 'example-package-1', Version: '1.0.0' },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => mockPackages,
    });

    render(
      <MemoryRouter>
        <RatingPage />
      </MemoryRouter>
    );
    await act(async () => {
      fireEvent.change(screen.getByRole('textbox', { name: /search by name or regex:/i }), {
        target: { value: 'example-package' },
      });
      fireEvent.click(screen.getByText('Search'));
    });

    await waitFor(() => {
      expect(screen.getByText('example-package-1')).toBeInTheDocument();
    });

    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 500,
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Get Rating'));
    });


    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('The package rating system choked on at least one of the metrics.');
    });
  });
});
