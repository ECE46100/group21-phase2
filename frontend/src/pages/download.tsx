import React, { useState, useEffect } from 'react';
import PageLayout from './pageLayout';

interface PackageMetadata {
  ID: string;
  Name: string;
  Version: string;
}

const DownloadPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [packages, setPackages] = useState<PackageMetadata[]>([]);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState<number>(0);

  // Retrieve auth token from localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
    } else {
      alert('Authentication token not found. Please log in.');
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!authToken) {
      alert('Authentication token is missing. Please log in.');
      return;
    }

    try {
      const requestBody = [{ Name: searchTerm }];

      
      // const response = await fetch(/packages?offset=${offset}, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'X-Authorization': authToken,
      //   },
      //   body: JSON.stringify(requestBody),
      // });


      // Simulate response data
      const response1 = JSON.stringify({
        status: 200,
        data: [
          {
            Name: 'example-package',
            Version: '1.0.0',
            ID: '1',
          },
          {
            Name: 'another-package',
            Version: '2.0.1',
            ID: '2',
          },
        ],
        headers: {
          offset: '10',
        },
      });

      // Parse the response as JSON
      const response = JSON.parse(response1);

      if (response.status === 200) {
        const data: PackageMetadata[] = response.data;
        setPackages(data);
        const newOffset = parseInt(response.headers.offset || '0', 10);
        setOffset(newOffset);
      } else if (response.status === 400) {
        setError('Search failed: Missing fields or invalid query.');
      } else if (response.status === 403) {
        setError('Search failed: Authentication failed due to invalid or missing AuthenticationToken.');
      } else if (response.status === 413) {
        setError('Search failed: Too many packages returned.');
      } else {
        setError('Search failed with an unknown error.');
      }
    } catch (err) {
      console.error('Error during search:', err);
      setError('An error occurred while searching for packages.');
    }
  };

  const handleDownload = async (packageId: string) => {
    if (!authToken) {
      alert('Authentication token is missing. Please log in.');
      return;
    }

    try {
      const response = await fetch(`/packages/${packageId}`, {
        method: 'GET',
        headers: {
          'X-Authorization': authToken,
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        const content = data.data.Content;

        // Create a download link for the package content
        const link = document.createElement('a');
        link.href = `data:application/zip;base64,${content}`;
        link.download = `${data.metadata.Name}-v${data.metadata.Version}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (response.status === 400) {
        alert('Download failed: Missing fields or improperly formed request.');
      } else if (response.status === 403) {
        alert('Download failed: Authentication failed due to invalid or missing AuthenticationToken.');
      } else if (response.status === 404) {
        alert('Download failed: Package does not exist.');
      } else {
        alert('Download failed with an unknown error.');
      }
    } catch (err) {
      console.error('Error during download:', err);
      alert('An error occurred while downloading the package.');
    }
  };

  return (
    <PageLayout title="Download a Package">
      <form onSubmit={handleSearch} style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Search for Package:
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>

        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Search
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginTop: '30px' }}>
        <h3>Available Packages:</h3>
        {packages.length > 0 ? (
          <ul style={{ listStyleType: 'none', padding: '0' }}>
            {packages.map((pkg) => (
              <li key={pkg.ID} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <strong>{pkg.Name}</strong> (v{pkg.Version})
                <button
                  onClick={() => {handleDownload(pkg.ID); console.log(pkg.ID)}}
                  style={{ marginLeft: '15px', padding: '5px 10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Download
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No packages found. Try a different search term.</p>
        )}
      </div>
    </PageLayout>
  );
};

export default DownloadPage;
