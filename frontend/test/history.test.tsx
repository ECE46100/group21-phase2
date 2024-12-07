import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // Import MemoryRouter
import HistoryPage from '../src/pages/history';

beforeEach(() => {
    localStorage.clear();
    jest.resetAllMocks();
    global.fetch = jest.fn();
});

jest.spyOn(window, 'alert').mockImplementation(() => { }); // Mock alert

describe('HistoryPage Component', () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    test('renders correctly and shows initial UI elements', () => {
        render(
            <MemoryRouter>
                <HistoryPage />
            </MemoryRouter>
        );

        // Check for the dropdown, search input, and button
        expect(screen.getByText('View History')).toBeInTheDocument();
        expect(screen.getByText('Upload History')).toBeInTheDocument();
        expect(screen.getByText('Download History')).toBeInTheDocument();
        expect(screen.getByText('Search')).toBeInTheDocument();
    });

    test('handles package search successfully', async () => {
        localStorage.setItem('authToken', 'mockAuthToken123');
        localStorage.setItem('userName', 'testuser');
        render(
            <MemoryRouter>
                <HistoryPage />
            </MemoryRouter>
        );

        const mockPackages = [
            { ID: '1', Name: 'example-package-1' },
            { ID: '2', Name: 'example-package-2' },
        ];

        (fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: async () => mockPackages,
        });

        
        fireEvent.change(screen.getByRole('textbox'), {
            target: { value: 'example-package' },
        });
        fireEvent.click(screen.getByText('Search'));

        await waitFor(() => {
            expect(screen.getByText('example-package-1')).toBeInTheDocument();
            expect(screen.getByText('example-package-2')).toBeInTheDocument();
        });
    });

    test('handles fetching upload history successfully', async () => {
        // Set up mock localStorage
        localStorage.setItem('authToken', 'mockAuthToken123');
        localStorage.setItem('userName', 'testuser');
    
        render(
            <MemoryRouter>
                <HistoryPage />
            </MemoryRouter>
        );
    
        const mockPackages = [
            { ID: '1', Name: 'example-package-1' },
            { ID: '2', Name: 'example-package-2' },
            { ID: '3', Name: 'example-package-3' },
            { ID: '4', Name: 'example-package-4' },
        ];
    
        const mockHistory = [
            { User: 'user1', Date: '2023-12-01T10:00:00Z', Version: '1.0.0' },
            { User: 'user2', Date: '2023-12-02T12:00:00Z', Version: '1.1.0' },
        ];
    
        // Mock the first API call for package search
        (fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: async () => mockPackages,
        });
    
        fireEvent.change(screen.getByRole('textbox'), {
            target: { value: 'example-package' },
        });
        await act(async () => {
            fireEvent.click(screen.getByText('Search'));
        });
        
        // Mock the second API call for fetching the history
        (fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: async () => mockHistory,
        });
    
        await act(async () => {
            const viewHistoryButtons = screen.getAllByRole('button', { name: /View History/i });
            expect(viewHistoryButtons).toHaveLength(4); 
            fireEvent.click(viewHistoryButtons[1]);
        });
        await (async () => {
            expect(window.alert).not.toHaveBeenCalled();
            expect(screen.getByText('user1')).toBeInTheDocument();
            expect(screen.getByText('user2')).toBeInTheDocument();
            expect(screen.getByText('1.0.0')).toBeInTheDocument();
            expect(screen.getByText('1.1.0')).toBeInTheDocument();
        });
    });

    test('displays error when search API fails', async () => {
        localStorage.setItem('authToken', 'mockAuthToken123');
        localStorage.setItem('userName', 'testuser');
        render(
            <MemoryRouter>
                <HistoryPage />
            </MemoryRouter>
        );

        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        fireEvent.change(screen.getByRole('textbox'), {
            target: { value: 'example-package' },
        });
        fireEvent.click(screen.getByText('Search'));

        await waitFor(() => {
            expect(screen.getByText('An error occurred while searching for packages.')).toBeInTheDocument();
        });
    });

    test('displays error when fetching history fails', async () => {
        localStorage.setItem('authToken', 'mockAuthToken123');
        localStorage.setItem('userName', 'testuser');
        render(
            <MemoryRouter>
                <HistoryPage />
            </MemoryRouter>
        );
        const mockPackages = [
            { ID: '1', Name: 'example-package-1' },
            { ID: '2', Name: 'example-package-2' },
        ];

        // Mock the first API call for package search
        (fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: async () => mockPackages,
        });
    
        fireEvent.change(screen.getByRole('textbox'), {
            target: { value: 'example-package' },
        });
        fireEvent.click(screen.getByText('Search'));
    
        await waitFor(() => {
            expect(screen.getByText('example-package-1')).toBeInTheDocument();
            expect(screen.getByText('example-package-2')).toBeInTheDocument();
        });

        (fetch as jest.Mock).mockResolvedValueOnce({
            status: 500,
        });
    
        const viewHistoryButtons = screen.getAllByText('View History'); // Gets all "View History" buttons
        fireEvent.click(viewHistoryButtons[1]); // click first 1


        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Failed to fetch history. Please try again.');
        });
    });
});
