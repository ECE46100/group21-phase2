import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from './pageLayout';

interface UserGroup {
  ID: number;
  name: string;
  description?: string;
}

enum Modes {
  CREATE_USER = 'Create User',
  DELETE_USER = 'Delete User',
  CREATE_USER_GROUP = 'Create User Group',
}

const ManageUsers: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<Modes>(Modes.CREATE_USER);

  // Shared States
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const navigate = useNavigate();

  // Create User States
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [uploadPerm, setUploadPerm] = useState(false);
  const [downloadPerm, setDownloadPerm] = useState(false);
  const [searchPerm, setSearchPerm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [selectedUserGroup, setSelectedUserGroup] = useState<string | null>(null);

  // Delete User States
  const [usernameToDelete, setUsernameToDelete] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Create User Group States
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');

  // Fetch user groups for dropdowns
  const fetchUserGroups = useCallback(async () => {
    if (!authToken) return;
    try {
      const response = await fetch('/allUserGroups', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': authToken || '',
        },
      });

      if (response.status === 200) {
        const groups = await response.json();
        setUserGroups(groups);
      } else {
        console.error('Failed to fetch user groups');
      }
    } catch (error) {
      console.error('Error fetching user groups:', error);
    }
  }, [authToken]);

  // Handle token and fetch user groups
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
    } else {
      alert('Please log in first');
      navigate('/');
    }
    const userName = localStorage.getItem('userName');
    if (userName) {
      setCurrentUserName(userName);
    } else {
      alert('Please log in first');
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    if (authToken) fetchUserGroups();
  }, [authToken, fetchUserGroups]);

  // Create User Handler
  const handleCreateUser = async () => {
    try {
      const payload = {
        username: newUsername,
        password: newPassword,
        uploadPerm,
        downloadPerm,
        searchPerm,
        adminPerm: isAdmin,
        userGroup: selectedUserGroup || '',
      };

      const response = await fetch('/createUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': authToken || '',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(`New user "${newUsername}" created successfully.`);
        setNotification(null);
        setNewUsername('');
        setNewPassword('');
        setUploadPerm(false);
        setDownloadPerm(false);
        setSearchPerm(false);
        setIsAdmin(false);
        setSelectedUserGroup(null);
      } else {
        const errorMsg = await response.text();
        setNotification(`Failed to create user: ${errorMsg}`);
      }
    } catch (err) {
      console.error('Error creating user:', err);
      setNotification('An error occurred while creating the user.');
    }
  };

  // Delete User Handler
  const handleDeleteUser = async () => {
    if (!usernameToDelete) {
      setNotification('Please enter a username to delete.');
      return;
    }

    try {
      const response = await fetch('/deleteUser', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUserName, deleteName: usernameToDelete }),
      });

      if (response.ok) {
        alert(`User "${usernameToDelete}" deleted successfully.`);
        setNotification(null);
        setUsernameToDelete(''); // Reset the field after deletion
      } else {
        const errorMsg = await response.text();
        setNotification(`Failed to delete user: ${errorMsg}`);
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setNotification('An error occurred while deleting the user.');
    }
  };

  // Create User Group Handler
  const handleCreateUserGroup = async () => {
    try {
      const payload = {
        name: newGroupName,
        description: newGroupDescription,
      };

      const response = await fetch('/createUserGroup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': authToken || '',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(`User group "${newGroupName}" created successfully.`);
        setNotification(null);
        setNewGroupName('');
        setNewGroupDescription('');
        fetchUserGroups(); // Refresh groups
      } else {
        const errorMsg = await response.text();
        setNotification(`Failed to create user group: ${errorMsg}`);
      }
    } catch (err) {
      console.error('Error creating user group:', err);
      setNotification('An error occurred while creating the user group.');
    }
  };

  return (
    <PageLayout title="Manage Users">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '15px', maxWidth: '600px', width: '100%' }}>
          <button
            onClick={() => setCurrentMode(Modes.CREATE_USER)}
            style={{
              flex: 1,
              padding: '10px 20px',
              backgroundColor: currentMode === Modes.CREATE_USER ? '#007bff' : '#f0f0f0',
              color: currentMode === Modes.CREATE_USER ? '#fff' : '#333',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Create User
          </button>
          <button
            onClick={() => setCurrentMode(Modes.DELETE_USER)}
            style={{
              flex: 1,
              padding: '10px 20px',
              backgroundColor: currentMode === Modes.DELETE_USER ? '#dc3545' : '#f0f0f0',
              color: currentMode === Modes.DELETE_USER ? '#fff' : '#333',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Delete User
          </button>
          <button
            onClick={() => setCurrentMode(Modes.CREATE_USER_GROUP)}
            style={{
              flex: 1,
              padding: '10px 20px',
              backgroundColor: currentMode === Modes.CREATE_USER_GROUP ? '#28a745' : '#f0f0f0',
              color: currentMode === Modes.CREATE_USER_GROUP ? '#fff' : '#333',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Create User Group
          </button>
        </div>
      </div>

      {notification && <p style={{ color: 'red' }}>{notification}</p>}

      {currentMode === Modes.CREATE_USER && (
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="username" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                Username:
              </label>
              <input
                id="username"
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="password" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                Password:
              </label>
              <input
                id="password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Permissions:</label>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="checkbox"
                  checked={uploadPerm}
                  onChange={(e) => setUploadPerm(e.target.checked)}
                />
                Upload Permission
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="checkbox"
                  checked={downloadPerm}
                  onChange={(e) => setDownloadPerm(e.target.checked)}
                />
                Download Permission
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="checkbox"
                  checked={searchPerm}
                  onChange={(e) => setSearchPerm(e.target.checked)}
                />
                Search Permission
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="checkbox"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                />
                Is Admin
              </label>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Assign User Group:</label>
              <select
                value={selectedUserGroup || ''}
                onChange={(e) => setSelectedUserGroup(e.target.value || null)}
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
              >
                <option value="">None</option>
                {userGroups.map((group) => (
                  <option key={group.ID} value={group.name}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleCreateUser}
              style={{
                padding: '12px 20px',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginTop: '20px',
              }}
            >
              Create User
            </button>
          </form>
        </div>
      )}

      {currentMode === Modes.DELETE_USER && (
        <div
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <form
            onSubmit={(e) => e.preventDefault()}
            style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="usernameToDelete" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                Username to Delete:
              </label>
              <input
                id="usernameToDelete"
                type="text"
                value={usernameToDelete}
                onChange={(e) => setUsernameToDelete(e.target.value)}
                required
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
              />
            </div>
            <button
              onClick={handleDeleteUser}
              style={{
                padding: '12px 20px',
                backgroundColor: '#dc3545',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginTop: '10px',
              }}
            >
              Delete User
            </button>
          </form>
        </div>
      )}

      {currentMode === Modes.CREATE_USER_GROUP && (
        <div
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <form
            onSubmit={(e) => e.preventDefault()}
            style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="groupName" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                Group Name:
              </label>
              <input
                id="groupName"
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                required
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="groupDescription" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                Description (Optional):
              </label>
              <input
                id="groupDescription"
                type="text"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
              />
            </div>
            <button
              onClick={handleCreateUserGroup}
              style={{
                padding: '12px 20px',
                backgroundColor: '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginTop: '10px',
              }}
            >
              Create User Group
            </button>
          </form>
        </div>
      )}

    </PageLayout>
  );
};

export default ManageUsers;
