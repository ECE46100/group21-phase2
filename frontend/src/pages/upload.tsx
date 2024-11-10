import React, { useState, useEffect } from 'react';
import PageLayout from './pageLayout';

const UploadPage: React.FC = () => {
  const [packageName, setPackageName] = useState('');
  const [version, setVersion] = useState('');
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
      console.log('no token set while entered upload');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];

      const isZipFile = selectedFile.type === 'application/zip' || selectedFile.name.endsWith('.zip');

      if (!isZipFile) {
        alert('Please select a ZIP file.');
        e.target.value = '';
        setFile(null);
      } else {
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert('Please select a file to upload.'); // impossible
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
        Content: fileContent,
        JSProgram: `if (process.argv.length === 7) {
console.log('Success')
process.exit(0)
} else {
console.log('Failed')
process.exit(1)
}`,
        debloat: debloat,
        Name: packageName,
        Version: version,
      };

      // Send the request to the backend
      const response = await fetch('/package', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': authToken,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 201) {
        const responseData = await response.json();
        alert(`Package uploaded successfully! ID: ${responseData.metadata.ID}`);
      } else if (response.status === 400) {
        alert('Upload failed: Missing fields or invalid data.');
      } else if (response.status === 403) {
        alert('Upload failed: Authentication failed due to invalid or missing AuthenticationToken.');
      } else if (response.status === 409) {
        alert('Upload failed: Package already exists.');
      } else if (response.status === 424) {
        alert('Upload failed: Package did not meet the required rating.');
      } else {
        alert('Upload failed with an unknown error.');
      }
    } catch (error) {
      console.error('Error uploading package:', error);
      alert('An error occurred while uploading the package.');
    }
  };

  return (
<PageLayout title="Upload a Package">
  <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
    <div style={{ marginBottom: '15px' }}>
      <label>
        Package Name:
        <input
          type="text"
          value={packageName}
          onChange={(e) => setPackageName(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </label>
    </div>

    <div style={{ marginBottom: '15px' }}>
      <label>
        Version:
        <input
          type="text"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </label>
    </div>

    <div style={{ marginBottom: '15px' }}>
      <label>
        Description:
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </label>
    </div>

    <div style={{ marginBottom: '15px' }}>
      <label>
        Upload File:
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
          style={{ marginRight: '5px' }}
        />
        Enable Debloat
      </label>
    </div>

    <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>
      Upload Package
    </button>
  </form>
</PageLayout>

  );
};

export default UploadPage;
