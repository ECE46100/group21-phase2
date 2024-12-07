import React, { useState, useEffect, useCallback } from 'react';
import PageLayout from './pageLayout';

interface PackageMetadata {
  ID: string;
  Name: string;
}

interface HistoryEntry {
  User: string;
  Date: string;
  Version: string; // Include version information
}

const HistoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [packages, setPackages] = useState<PackageMetadata[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState<number>(0);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);
  const [selectedAction, setSelectedAction] = useState<'UPLOAD' | 'DOWNLOAD'>('UPLOAD');

  // Retrieve auth token from localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
    } else {
      console.log('No token set while entering history page.');
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
            const allData = (await response.json()) as PackageMetadata[]; // Explicitly cast the response to PackageMetadata[]
            const uniquePackages: PackageMetadata[] = Array.from(
              new Map(allData.map((pkg) => [pkg.Name, pkg])).values()
            ); // Deduplicate by Name
            setPackages(uniquePackages);
            setOffset(pageOffset);
            setSearchPerformed(true);
          } else {
            setError('Search failed with an unknown error.');
          }
          
      } else {
        // Search by name
        const requestBody = [{ Name: searchTerm }];
        const response = await fetch(`/packages?offset=${pageOffset}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Authorization': authToken,
          },
          body: JSON.stringify(requestBody),
        });

        if (response.status === 200) {
            const allData = (await response.json()) as PackageMetadata[]; // Explicitly cast the response to PackageMetadata[]
            const uniquePackages: PackageMetadata[] = Array.from(
              new Map(allData.map((pkg) => [pkg.Name, pkg])).values()
            ); // Deduplicate by Name
            setPackages(uniquePackages);
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

  const handleFetchHistory = async (packageName: string) => {
    if (!authToken) {
      alert('Authentication token is missing. Please log in.');
      return;
    }

    try {
      const endpoint =
        selectedAction === 'UPLOAD'
          ? `/uploadHistory/${encodeURIComponent(packageName)}`
          : `/downloadHistory/${encodeURIComponent(packageName)}`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': authToken,
        },
      });

      if (response.ok) {
        const data: HistoryEntry[] = await response.json();
        setHistory(data);
      } else {
        alert('Failed to fetch history. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      alert('An error occurred while fetching the history.');
    }
  };

  const handleNextPage = () => handleSearch(offset + 1);
  const handlePreviousPage = () => {
    if (offset > 0) {
      handleSearch(offset - 1);
    }
  };

  return (
    <PageLayout title="Package History">
      {/* Action Selector */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <label>
          <h3 style={{ marginBottom: '10px' }}>View History</h3>
          <select
            value={selectedAction}
            onChange={(e) => {
              const action = e.target.value as 'UPLOAD' | 'DOWNLOAD';
              setSelectedAction(action);
              setPackages([]);
              setSearchPerformed(false);
              setHistory([]);
            }}
            style={{
              padding: '8px',
              fontSize: '16px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              cursor: 'pointer',
              width: '500px', // Ensure this matches the form width
              maxWidth: '100%', // Responsive behavior
            }}
          >
            <option value="UPLOAD">Upload History</option>
            <option value="DOWNLOAD">Download History</option>
          </select>
        </label>
      </div>

      {/* Search Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(0);
        }}
        style={{
          maxWidth: '500px',
          margin: '30px auto',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #ddd',
          backgroundColor: '#f9f9f9',
        }}
      >
        <h3 style={{ marginBottom: '20px' }}>Search for a Package</h3>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Package Name or Regex:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '5px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              fontSize: '14px',
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Search
        </button>
      </form>

      {error && (
        <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>
          {error}
        </p>
      )}

      {/* Search Results */}
      {searchPerformed && (
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <h3>Available Packages</h3>
          {packages.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '15px',
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              {packages.map((pkg) => (
                <div
                  key={pkg.ID}
                  style={{
                    padding: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <strong>{pkg.Name}</strong>
                  <button
                    onClick={() => handleFetchHistory(pkg.Name)}
                    style={{
                      marginLeft: '10px',
                      padding: '8px 16px',
                      backgroundColor: '#28a745',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    View History
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>No packages found. Try a different search term.</p>
          )}
        </div>
      )}

    {/* History Display */}
    {history.length > 0 && (
    <div
        style={{
        marginTop: '30px',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        maxWidth: '600px',
        margin: '30px auto',
        }}
    >
        <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>{selectedAction} History</h3>
        <table
        style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '14px',
        }}
        >
        <thead>
            <tr style={{ backgroundColor: '#f2f2f2', borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>User</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Date</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Version</th>
            </tr>
        </thead>
        <tbody>
            {history.map((entry, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{entry.User}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                {new Date(entry.Date).toLocaleString()}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{entry.Version}</td>
            </tr>
            ))}
        </tbody>
        </table>
    </div>
    )}

    </PageLayout>
  );
};

export default HistoryPage;
