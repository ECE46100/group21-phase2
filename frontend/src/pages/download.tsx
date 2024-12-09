import React, { useState, useEffect } from 'react';
import PageLayout from './pageLayout';

interface PackageMetadata {
  ID: string;
  Name: string;
  Version: string;
}

const DownloadPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [versionTerm, setVersionTerm] = useState(''); // For searching by version
  const [packages, setPackages] = useState<PackageMetadata[]>([]);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState<number>(0);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);

  // Retrieve auth token from localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
    } else {
      console.log('No token set while entering download page.');
    }
  }, []);

  const isRegexSearch = (term: string): boolean => {
    const regexSpecialChars = /[.*+?^${}()|[\]\\]/;
    return regexSpecialChars.test(term);
  };

  const handleSearch = async (pageOffset: number = 0) => {
    setError(null);
    setSearchPerformed(false);
    setPackages([]);

    if (!authToken) {
      alert('Authentication token is missing. Please log in.');
      return;
    }

    try {
      if (isRegexSearch(searchTerm)) {
        // Search with regex
        const requestBody = { RegEx: searchTerm };
        const response = await fetch('/package/byRegEx', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Authorization': authToken,
          },
          body: JSON.stringify(requestBody),
        });

        if (response.status === 200) {
          const data: PackageMetadata[] = await response.json();
          setPackages(data);
          setHasNextPage(false); // Pagination is not applicable for regex searches
          setSearchPerformed(true);
        } else if (response.status === 404) {
          setPackages([]);
          setError('No packages found with the given regex.');
        } else {
          setError('Search failed with an unknown error.');
        }
      } else {
        // Search by name and version
        const requestBody = [
          { Name: searchTerm, Version: versionTerm ? versionTerm : '*' },
        ];
        const response = await fetch(`/packages?offset=${pageOffset}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Authorization': authToken,
          },
          body: JSON.stringify(requestBody),
        });

        if (response.status === 200) {
          const allData = await response.json();
          const data: PackageMetadata[] = allData;
          setPackages(data);
          setOffset(pageOffset);
          setSearchPerformed(true);
          setHasNextPage(data.length > 0); // Set next page availability
        } else {
          setError('Search failed with an unknown error.');
        }
      }
    } catch (err) {
      console.error('Error during search:', err);
      setError('An error occurred while searching for packages.');
    }
  };

  const handleNextPage = () => handleSearch(offset + 1);
  const handlePreviousPage = () => {
    if (offset > 0) {
      handleSearch(offset - 1);
    }
  };

  const handleDownload = async (versionId: string) => {
    if (!authToken) {
      console.log('In download.tsx/handleDownload(), no auth token');
      return;
    }

    try {
      console.log(`In download.tsx/handleDownload(), to download versionID = ${versionId}`);
      const response = await fetch(`/package/${versionId}`, {
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
        alert('There is missing field(s) in the PackageID or it is formed improperly, or is invalid.');
      } else if (response.status === 403) {
        alert('Authentication failed due to invalid or missing AuthenticationToken.');
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
      {/* Search Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(0); }} style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Search by Name or Regex:
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>
        {!isRegexSearch(searchTerm) && (
          <div style={{ marginBottom: '15px' }}>
            <label>
              Version (Optional):
              <input
                type="text"
                value={versionTerm}
                onChange={(e) => setVersionTerm(e.target.value)}
                placeholder="e.g., 1.2.3 or *"
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </label>
          </div>
        )}
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Search
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Search Results */}
      {searchPerformed && (
        <div style={{ marginTop: '30px' }}>
          <h3>Available Packages:</h3>
          {packages.length > 0 ? (
            <>
              <ul style={{ listStyleType: 'none', padding: '0' }}>
                {packages.map((pkg) => (
                  <li key={pkg.ID} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                    <strong>{pkg.Name}</strong> (v{pkg.Version})
                    <button
                      onClick={() => {handleDownload(pkg.ID); console.log(`download pkg.ID = ${pkg.ID}`);}}
                      style={{ marginLeft: '15px', padding: '5px 10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Download
                    </button>
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
                <button onClick={handlePreviousPage} disabled={offset === 0} style={{ padding: '8px 16px', marginRight: '10px', cursor: 'pointer' }}>
                  Previous Page
                </button>
                <span style={{ margin: '0 15px' }}>Current Page: {offset + 1}</span>
                <button onClick={handleNextPage} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                  Next Page
                </button>
              </div>
            </>
          ) : (
            <p style={{ marginTop: '20px' }}>No packages found. Try a different search term.</p>
          )}
        </div>
      )}
    </PageLayout>
  );
};

export default DownloadPage;
