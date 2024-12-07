import React, { useState, useEffect } from 'react';
import PageLayout from './pageLayout';

interface PackageMetadata {
  ID: string;
  Name: string;
  Version: string;
}

const UploadPage: React.FC = () => {
  const [packageName, setPackageName] = useState<string>('');
  const [debloat, setDebloat] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>(''); // URL-based upload
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isSecret, setIsSecret] = useState<boolean>(false); // Secret checkbox state
  const [groupName, setGroupName] = useState<string>(''); // User group name

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);

      // Fetch user's group name from the server using the token
      fetch('/user/group', {
        headers: {
          'X-Authorization': token,
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Failed to fetch user group');
          }
        })
        .then((data) => setGroupName(data.groupName))
        .catch((error) => console.error('Error fetching group name:', error));
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
        setUrl(''); // Clear URL input when a file is selected
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authToken) {
      alert('Authentication token is missing. Please log in.');
      return;
    }

    if (!file && !url) {
      alert('Please provide either a ZIP file or a URL for the upload.');
      return;
    }

    try {
      let payload: any = {
        Name: packageName,
        debloat,
        JSProgram: `if (process.argv.length === 7) {
console.log('Success')
process.exit(0)
} else {
console.log('Failed')
process.exit(1)
}`,
        accessLevel: isSecret ? groupName : 'public', // Set access level based on secret checkbox
      };

      if (file) {
        const fileContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result.split(',')[1]); // Extract base64 content
            }
          };
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        });

        payload.Content = fileContent;
      } else if (url) {
        payload.URL = url;
      }

      console.log('Payload:', payload); // Debug log

      const response = await fetch('/package', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': authToken,
        },
        body: JSON.stringify(payload),
      });


      console.log('Response:', response); // Debug log

      if (response.status === 201) {
        const responseData: PackageMetadata[] = await response.json();
        console.log(responseData);
        alert(`Package uploaded successfully!`);
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
            Upload ZIP File:
            <input
              type="file"
              onChange={(e) => handleFileChange(e)}
              ref={(input) => {
                if (url) {
                  input && (input.value = ''); // Clear file input if URL is set
                }
              }}
              style={{ display: 'block', marginTop: '5px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            Or Provide URL for the Package:
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setFile(null); // Clear file state if URL is set
              }}
              placeholder="https://example.com/package.zip"
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
            />
            Enable Debloat
          </label>
        </div>

        <div>
          <label>
            <input type="checkbox" checked={isSecret} onChange={(e) => setIsSecret(e.target.checked)} />
            Mark as Secret (Accessible only by group: {groupName || 'Fetching...'})
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
