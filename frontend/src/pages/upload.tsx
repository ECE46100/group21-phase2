import React, { useState, useEffect, useRef } from 'react';
import PageLayout from './pageLayout';

const UploadPage: React.FC = () => {
  const [packageName, setPackageName] = useState<string>('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [description, setDescription] = useState<string>('');
  const [debloat, setDebloat] = useState<boolean>(false);
  const [url, setUrl] = useState<string>('');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
    } else {
      console.log('No token set while entering upload');
    }
  }, []);

  const handleUploadMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const method = e.target.value as 'file' | 'url';
    setUploadMethod(method);

    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear file input
    }

    if (method === 'file') {
      setUrl(''); // Clear URL input
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authToken) {
      alert('Authentication token is missing. Please log in.');
      return;
    }

    try {
      let payload: any = null;

      if (uploadMethod === 'file') {
        const fileInput = fileInputRef.current;

        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
          alert('Please select a ZIP file to upload.');
          return;
        }

        const file = fileInput.files[0];
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

        payload = {
          Content: fileContent,
          JSProgram: `if (process.argv.length === 7) {
console.log('Success')
process.exit(0)
} else {
console.log('Failed')
process.exit(1)
}`,
          debloat,
          Name: packageName,
        };
      } else if (uploadMethod === 'url') {
        if (!url) {
          alert('Please provide a valid URL.');
          return;
        }

        payload = {
          URL: url,
          JSProgram: `if (process.argv.length === 7) {
console.log('Success')
process.exit(0)
} else {
console.log('Failed')
process.exit(1)
}`,
        };
      }

      console.log('Payload:', payload);

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
        alert('Upload failed: Authentication failed.');
      } else if (response.status === 409) {
        alert('Upload failed: Package already exists.');
      } else if (response.status === 424) {
        alert('Upload failed: Package is disqualified due to rating.');
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
            Upload Method:
            <select
              value={uploadMethod}
              onChange={handleUploadMethodChange}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            >
              <option value="file">Upload ZIP File</option>
              <option value="url">Upload via URL</option>
            </select>
          </label>
        </div>

        {uploadMethod === 'file' ? (
          <div style={{ marginBottom: '15px' }}>
            <label>
              Upload File:
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'block', marginTop: '5px' }}
              />
            </label>
          </div>
        ) : (
          <div style={{ marginBottom: '15px' }}>
            <label>
              Package URL:
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </label>
          </div>
        )}

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
            <input
              type="checkbox"
              checked={debloat}
              onChange={(e) => setDebloat(e.target.checked)}
              style={{ marginRight: '5px' }}
            />
            Enable Debloat
          </label>
        </div>

        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Upload Package
        </button>
      </form>
    </PageLayout>
  );
};

export default UploadPage;
