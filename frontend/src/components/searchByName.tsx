import React, { useState, useEffect } from 'react';

interface PackageMetadata {
  ID: string;
  Name: string;
  Version: string;
}

const SearchByName: React.FC = () => {
  const [packageName, setPackageName] = useState('');
  const [results, setResults] = useState<PackageMetadata[]>([]);
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
      const requestBody = [{ Name: packageName }];

    //   const response = await fetch(`/packages?offset=${offset}`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'X-Authorization': authToken,
    //     },
    //     body: JSON.stringify(requestBody),
    //   });

    const response1 = JSON.stringify({
        status: 200,
        data: [
          {
            packageName: 'example-package',
            version: '1.0.0',
            description: 'Sample description for testing purposes.',
            fileUrl: 'https://example.com/uploads/example-package-v1.0.0.zip',
            uploadDate: '2024-11-03T14:30:00Z',
            debloatEnabled: true,
          },
          {
            packageName: 'another-package',
            version: '2.0.1',
            description: 'Another example package for testing.',
            fileUrl: 'https://example.com/uploads/another-package-v2.0.1.zip',
            uploadDate: '2024-11-02T10:15:00Z',
            debloatEnabled: false,
          },
        ],
        headers: {
          offset: '10',
        },
      });

      // Parse the response as JSON
      const response = JSON.parse(response1);

      if (response.status === 200) {
        const data: PackageMetadata[] = await response.json();
        setResults(data);
        const newOffset = parseInt(response.headers.get('offset') || '0', 10);
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

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>Search for Packages</h2>
      <form onSubmit={handleSearch}>
        <label>
          Package Name:
          <input
            type="text"
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', margin: '10px 0' }}
          />
        </label>
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Search
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {results.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Search Results</h3>
          <ul>
            {results.map((pkg) => (
              <li key={pkg.ID}>
                <strong>Name:</strong> {pkg.Name} | <strong>Version:</strong> {pkg.Version} | <strong>ID:</strong> {pkg.ID}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchByName;
