import React, { useState, useEffect } from 'react';
import PageLayout from './pageLayout';

const UpdatePage: React.FC = () => {
  const [packageName, setPackageName] = useState('ExamplePackage'); // Pre-filled for existing data
  const [currentVersion, setCurrentVersion] = useState('1.0.0'); // Example current version
  const [newVersion, setNewVersion] = useState('');
  const [description, setDescription] = useState('');
  const [debloat, setDebloat] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Retrieve auth token from localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
    } else {
      alert('Authentication token not found. Please log in.');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    if (!authToken) {
      alert('Authentication token is missing. Please log in.');
      return;
    }

    try {
      // Read the file content as base64
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]); // Get base64 data part
          }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });

      // Prepare the payload for the backend
      const payload = {
        metadata: {
          Name: packageName,
          Version: newVersion,
          ID: '123567192081501', // Replace with the actual package ID
        },
        data: {
          Name: packageName,
          Content: fileContent,
          debloat: debloat,
          JSProgram: `if (process.argv.length === 7) {
console.log('Success')
process.exit(0)
} else {
console.log('Failed')
process.exit(1)
}`,
        },
      };

      // Send the request to the backend
      const response = await fetch(`/package/123567192081501`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': authToken,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 200) {
        alert('Version updated successfully!');
      } else if (response.status === 400) {
        alert('Update failed: Missing fields or invalid data.');
      } else if (response.status === 403) {
        alert('Update failed: Authentication failed due to invalid or missing AuthenticationToken.');
      } else if (response.status === 404) {
        alert('Update failed: Package does not exist.');
      } else {
        alert('Update failed with an unknown error.');
      }
    } catch (error) {
      console.error('Error updating package:', error);
      alert('An error occurred while updating the package.');
    }
  };

  return (
    <PageLayout title="Update a Package">
      <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Package Name (Pre-filled):
            <input
              type="text"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              disabled
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            Current Version (Pre-filled):
            <input
              type="text"
              value={currentVersion}
              onChange={(e) => setCurrentVersion(e.target.value)}
              disabled
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            New Version:
            <input
              type="text"
              value={newVersion}
              onChange={(e) => setNewVersion(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            Description of Changes:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            Upload New Version File:
            <input
              type="file"
              onChange={handleFileChange}
              required
              style={{ display: 'block', marginTop: '5px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            <input
              type="checkbox"
              checked={debloat}
              onChange={(e) => setDebloat(e.target.checked)}
            />
            Enable Debloat
          </label>
        </div>

        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Update Package
        </button>
      </form>
    </PageLayout>
  );
};

export default UpdatePage;
