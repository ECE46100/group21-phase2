import React, { useState, useEffect } from 'react';
import PageLayout from './pageLayout';

interface PackageMetadata {
  ID: string;
  Name: string;
  Version: string;
}

interface RatingData {
  BusFactor: string,
  BusFactorLatency: string,
  Correctness: string,
  CorrectnessLatency: string,
  RampUp: string,
  RampUpLatency: string,
  ResponsiveMaintainer: string,
  ResponsiveMaintainerLatency: string,
  LicenseScore: string,
  LicenseScoreLatency: string,
  GoodPinningPractice: string,
  GoodPinningPracticeLatency: string,
  PullRequest: string,
  PullRequestLatency: string,
  NetScore: string,
  NetScoreLatency: string
}

const RatingPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [versionTerm, setVersionTerm] = useState(''); // For searching by version
  const [packages, setPackages] = useState<PackageMetadata[]>([]);
  const [ratingData, setRatingData] = useState<RatingData | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState<number>(0);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
    } else {
      console.log('No token set while entering rating');
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
    setRatingData(null); // Reset rating data

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
          setHasNextPage(false); // Regex searches don't support pagination
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
          setHasNextPage(data.length > 0);
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

  const fetchRating = async (versionId: string) => {
    setError(null);
    setRatingData(null);

    try {
      console.log(`in rating.tsx/fetchRating(), fetch endpoint : /package/${versionId}/rate`);
      const response = await fetch(`/package/${versionId}/rate`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': authToken || '',
        },
      });

      if (response.status === 200) {
        const data: RatingData = await response.json();
        console.log(`in rating.tsx/fetchRating(), ratingData.NetScore : ${data.NetScore}`);
        setRatingData(data);
      } else if (response.status === 400) {
        alert('There is missing field(s) in the PackageID');
      } else if (response.status === 403) {
        alert('Authentication failed due to invalid or missing AuthenticationToken.');
      } else if (response.status === 404) {
        alert('Package does not exist.');
      } else if (response.status === 500) {
        alert('The package rating system choked on at least one of the metrics.');
      }
    } catch (err) {
      console.error('Error fetching rating:', err);
      alert('An error occurred while fetching the rating.');
    }
  };

  const handleNextPage = () => {
    handleSearch(offset + 1);
  };

  const handlePreviousPage = () => {
    if (offset > 0) {
      handleSearch(offset - 1);
    }
  };

  return (
    <PageLayout title="Package Rating">
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
        <button
          type="submit"
          style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          Search
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>}

      {searchPerformed && (
        <div style={{ marginTop: '30px' }}>
          <h3>Search Results:</h3>
          {packages.length > 0 ? (
            <>
              <ul style={{ listStyleType: 'none', padding: '0' }}>
                {packages.map((pkg) => (
                  <li
                    key={pkg.ID}
                    style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}
                  >
                    <strong>{pkg.Name}</strong> (v{pkg.Version})
                    <button
                      onClick={() => fetchRating(pkg.ID)}
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
                      Get Rating
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

      {ratingData && (
        <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h3>Rating Details</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Overall Rating:</td>
                <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>{ratingData.NetScore}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold', textAlign: 'left', borderBottom: '1px solid #ddd' }}>BusFactor:</td>
                <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>{ratingData.BusFactor}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Correctness:</td>
                <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>{ratingData.Correctness}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold', textAlign: 'left', borderBottom: '1px solid #ddd' }}>RampUp:</td>
                <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>{ratingData.RampUp}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Responsive Maintainer:</td>
                <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>{ratingData.ResponsiveMaintainer}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold', textAlign: 'left', borderBottom: '1px solid #ddd' }}>License Score:</td>
                <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>{ratingData.LicenseScore}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Good Pinning Practice:</td>
                <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>{ratingData.GoodPinningPractice}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Pull Request:</td>
                <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>{ratingData.PullRequest}</td>
              </tr>
            </tbody>
          </table>
        </div>

      )}
    </PageLayout>
  );
};

export default RatingPage;
