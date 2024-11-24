import React, { useState, useEffect } from 'react';
import PageLayout from './pageLayout';

interface PackageMetadata {
  ID: string;
  Name: string;
  Version: string;
}

const UpdatePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [versionTerm, setVersionTerm] = useState(''); // For searching by version (only for name-based search)
  const [packages, setPackages] = useState<PackageMetadata[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PackageMetadata | null>(null);
  const [newVersion, setNewVersion] = useState('');
  const [description, setDescription] = useState('');
  const [debloat, setDebloat] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>(''); // For URL-based updates
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [offset, setOffset] = useState<number>(0);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);

  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);

  // Retrieve auth token from localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
    } else {
      console.log('No token set while entering update');
    }
  }, []);

  const isRegexSearch = (term: string): boolean => {
    const regexSpecialChars = /[.*+?^${}()|[\]\\]/;
    return regexSpecialChars.test(term);
  };

  const handleSearch = async (pageOffset: number = 0) => {
    setError(null);

    if (!authToken) {
      alert('Authentication token is missing. Please log in.');
      return;
    }

    try {
      if (isRegexSearch(searchTerm)) {
        // Search with regex
        const requestBody = { RegEx: searchTerm };
        console.log(`searching with regex, RegEx : ${searchTerm}`);
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
          alert('No packages found with the given regex.');
        } else {
          setError('Search failed with an unknown error.');
        }
      } else {
        // Search by name and version
        const requestBody = [
          { Name: searchTerm, Version: versionTerm ? versionTerm : '*' },
        ];
        console.log(`searching with name, requestbody : ${searchTerm}, ${versionTerm? versionTerm:'*'}`);
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
          const data: PackageMetadata[] = allData.data;
          setPackages(data);

          setOffset(pageOffset);
          setSearchPerformed(true);
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

  const handleSelectPackage = (pkg: PackageMetadata) => {
    setSelectedPackage(pkg);
    setNewVersion(pkg.Version);
  };

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
        setUrl(''); // Clear URL when a file is selected
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authToken || !selectedPackage) {
      alert('Authentication token is missing or no package selected. Please log in or select a package.');
      return;
    }

    try {
      let payload: any = {
        metadata: {
          Name: selectedPackage.Name,
          Version: newVersion,
          ID: selectedPackage.ID,
        },
        data: {},
      };

      if (file) {
        const fileContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result.split(',')[1]);
            }
          };
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        });

        payload.data = {
          Content: fileContent,
          Name: selectedPackage.Name,
          debloat: debloat,
        };
      } else if (url) {
        payload.data = {
          URL: url,
          Name: selectedPackage.Name,
          JSProgram: `if (process.argv.length === 7) {
            console.log('Success');
            process.exit(0);
          } else {
            console.log('Failed');
            process.exit(1);
          }`,
        };
      } else {
        alert('Please provide either a file or a URL for the update.');
        return;
      }

      const response = await fetch(`/package/${selectedPackage.ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': authToken,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 200) {
        alert('Version updated successfully!');
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
      {/* Search Section */}
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

      {searchPerformed && (
        <div style={{ marginTop: '30px' }}>
          <h3>Search Results:</h3>
          {Array.isArray(packages) && packages.length > 0 ? ( // Add explicit Array.isArray check
            <ul style={{ listStyleType: 'none', padding: '0' }}>
              {packages.map((pkg) => (
                <li
                  key={pkg.ID}
                  style={{
                    marginBottom: '15px',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: '#f9f9f9',
                  }}
                >
                  <strong>{pkg.Name}</strong> (v{pkg.Version})
                  <button
                    onClick={() => handleSelectPackage(pkg)}
                    style={{
                      marginLeft: '15px',
                      padding: '5px 10px',
                      backgroundColor: '#28a745',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Select
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No packages found. Try a different search term.</p>
          )}

          {/* Pagination Controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '20px',
            }}
          >
            <button
              onClick={handlePreviousPage}
              disabled={offset === 0}
              style={{
                padding: '8px 16px',
                marginRight: '10px',
                cursor: 'pointer',
              }}
            >
              Previous Page
            </button>
            <span style={{ margin: '0 15px' }}>Current Page: {offset + 1}</span>
            <button
              onClick={handleNextPage}
              disabled={!hasNextPage}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
              }}
            >
              Next Page
            </button>
          </div>
        </div>
      )}


      {/* Update Form */}
      {selectedPackage && (
        <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '30px auto' }}>
          <div style={{ marginBottom: '15px' }}>
            <label>
              Package Name (Pre-filled):
              <input
                type="text"
                value={selectedPackage.Name}
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
                value={selectedPackage.Version}
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
                style={{ display: 'block', marginTop: '5px' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>
              Or Provide URL for the Update:
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setFile(null);
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
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Update Package
          </button>
        </form>
      )}
    </PageLayout>
  );
};

export default UpdatePage;
