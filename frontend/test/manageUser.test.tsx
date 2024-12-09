import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import ManageUsers from '../src/pages/manageUsers'; // Adjust the path based on your file structure

beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
  global.fetch = jest.fn();
  localStorage.setItem('authToken', 'mockAuthToken123');
  localStorage.setItem('userName', 'adminUser');
});
jest.spyOn(window, 'alert').mockImplementation(() => { }); // Mock alert

describe('ManageUsers Component', () => {

  test('renders the Create User form by default', () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    render(
      <MemoryRouter>
        <ManageUsers />
      </MemoryRouter>
    );

    expect(screen.getByText('Manage Users')).toBeInTheDocument();
    expect(screen.getByText('Delete User')).toBeInTheDocument();
    expect(screen.getByText('Create User Group')).toBeInTheDocument();
    expect(screen.getByText('Username:')).toBeInTheDocument();
    expect(screen.getByText('Password:')).toBeInTheDocument();
    expect(screen.getByText('Permissions:')).toBeInTheDocument();
    expect(screen.getByText('Assign User Group:')).toBeInTheDocument();
  });

  test('switches to Delete User mode and shows the delete form', () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    render(
      <MemoryRouter>
        <ManageUsers />
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByText('Delete User')[0]);

    expect(screen.getAllByText('Delete User')[1]).toHaveStyle('background-color: #dc3545');
    expect(screen.getByText('Username to Delete:')).toBeInTheDocument();
  });

  test('switches to Create User Group mode and shows the user group creation form', () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    render(
      <MemoryRouter>
        <ManageUsers />
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByText('Create User Group')[0]);

    expect(screen.getAllByText('Create User Group')[1]).toHaveStyle('background-color: #28a745');
    expect(screen.getByText('Group Name:')).toBeInTheDocument();
    expect(screen.getByText('Description (Optional):')).toBeInTheDocument();
  });

  test('handles creating a new user successfully', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    render(
      <MemoryRouter>
        <ManageUsers />
      </MemoryRouter>
    );
  
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });
  
    fireEvent.change(screen.getByLabelText('Username:'), { target: { value: 'newUser' } });
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'password123' } });
    fireEvent.click(screen.getAllByText('Create User')[1]);
  
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('New user "newUser" created successfully.');
    });
  });

  test('handles deleting a user successfully', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    render(
      <MemoryRouter>
        <ManageUsers />
      </MemoryRouter>
    );
  
    fireEvent.click(screen.getByText('Delete User'));
  
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });
  
    fireEvent.change(screen.getByLabelText('Username to Delete:'), { target: { value: 'userToDelete' } });
    fireEvent.click(screen.getAllByText('Delete User')[1]);
  
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('User "userToDelete" deleted successfully.');
    });
  });

  test('handles creating a new user group successfully', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    render(
      <MemoryRouter>
        <ManageUsers />
      </MemoryRouter>
    );
  
    fireEvent.click(screen.getByText('Create User Group'));
  
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });
  
    fireEvent.change(screen.getByLabelText('Group Name:'), { target: { value: 'newGroup' } });
    fireEvent.change(screen.getByLabelText('Description (Optional):'), { target: { value: 'A new user group' } });
    fireEvent.click(screen.getAllByText('Create User Group')[1]);
  
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('User group "newGroup" created successfully.');
    });
  });

  test('handles error when creating a user fails', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    render(
      <MemoryRouter>
        <ManageUsers />
      </MemoryRouter>
    );

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      text: async () => 'User creation error',
    });

    fireEvent.change(screen.getByLabelText('Username:'), { target: { value: 'newUser' } });
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'password123' } });
    fireEvent.click(screen.getAllByText('Create User')[1]);

    await waitFor(() => {
      expect(screen.getByText('Failed to create user: User creation error')).toBeInTheDocument();
    });
  });

  test('handles error when deleting a user fails', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    render(
      <MemoryRouter>
        <ManageUsers />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Delete User'));

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      text: async () => 'User deletion error',
    });

    fireEvent.change(screen.getByLabelText('Username to Delete:'), { target: { value: 'userToDelete' } });
    fireEvent.click(screen.getAllByText('Delete User')[1]);

    await waitFor(() => {
      expect(screen.getByText('Failed to delete user: User deletion error')).toBeInTheDocument();
    });
  });

  test('handles error when creating a user group fails', async () => {
    localStorage.setItem('authToken', 'mockAuthToken123');
    localStorage.setItem('userName', 'testuser');
    render(
      <MemoryRouter>
        <ManageUsers />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Create User Group'));

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      text: async () => 'User group creation error',
    });

    fireEvent.change(screen.getByLabelText('Group Name:'), { target: { value: 'newGroup' } });
    fireEvent.change(screen.getByLabelText('Description (Optional):'), { target: { value: 'A new user group' } });
    fireEvent.click(screen.getAllByText('Create User Group')[1]);

    await waitFor(() => {
      expect(screen.getByText('Failed to create user group: User group creation error')).toBeInTheDocument();
    });
  });

});
