import React, { useState, useEffect } from 'react';
import PageLayout from './pageLayout';

interface PackageMetadata {
  ID: string;
  Name: string;
  Version: string;
}

interface RatingData {
  overall: number;
  dependencyPinning: number;
  codeReviewMetric: number;
}

const RatingPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [packages, setPackages] = useState<PackageMetadata[]>([]);
  const [ratingData, setRatingData] = useState<RatingData | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  // check if Search performed
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);

  // Retrieve auth token from localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
    } else {
      console.log('no token set while entered rating');
    }
  }, []);

  // Fetch packages based on search term and offset (pagination)
  const handleSearch = async (page = 0) => {
    setError(null);
    setPackages([]);
    setRatingData(null); // Reset rating data on new search

    if (!authToken) {
      alert('Authentication token is missing. Please log in.');
      return;
    }

    try {
      const requestBody = [{ Name: searchTerm }];
      
      const response = await fetch(`/packages?offset=${page}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': authToken,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.status === 200) {
        const allData= await response.json();
        const data: PackageMetadata[]  = allData.data
        setPackages(data);
        setOffset(page);
        setSearchPerformed(true);
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

  // Fetch rating for a specific package
  const fetchRating = async (packageId: string) => {
    setError(null);
    setRatingData(null);

    try {
      const response = await fetch(`/ratings?packageId=${encodeURIComponent(packageId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // TODO : CHECK YML SPEC for proper parsing of response
        const data: RatingData = await response.json();
        setRatingData(data);
      } else {
        setError('Failed to fetch rating. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching rating:', err);
      setError('An error occurred while fetching the rating.');
    }
  };

  const handleNextPage = () => {
    handleSearch(offset + 1); // Move to the next page
  };

  const handlePreviousPage = () => {
    if (offset > 0) handleSearch(offset - 1); // Move to the previous page if possible
  };

  return (
    <PageLayout title="Package Rating">
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(0); }} style={{ maxWidth: '500px', margin: '0 auto' }}>
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
                  <li key={pkg.ID} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                    <strong>{pkg.Name}</strong>
                    <button
                      onClick={() => fetchRating(pkg.ID)}
                      style={{ marginLeft: '15px', padding: '5px 10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
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
          <p><strong>Overall Rating:</strong> {ratingData.overall} / 5</p>
          <p><strong>Dependency Pinning:</strong> {ratingData.dependencyPinning.toFixed(2)}</p>
          <p><strong>Code Review Metric:</strong> {ratingData.codeReviewMetric.toFixed(2)}</p>
        </div>
      )}
    </PageLayout>
  );
};

export default RatingPage;