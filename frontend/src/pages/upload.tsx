import React, { useState } from 'react';
import PageLayout from './pageLayout';

const UploadPage: React.FC = () => {
  const [packageName, setPackageName] = useState('');
  const [version, setVersion] = useState('');
  const [description, setDescription] = useState('');
  const [debloat, setDebloat] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Package Data:', {
      packageName,
      version,
      description,
      debloat,
      file,
    });
    // Add logic to handle the file upload
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
              required
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
              onChange={() => setDebloat(!debloat)}
            />
            Enable Debloat
          </label>
        </div>

        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Upload Package
        </button>
      </form>
    </PageLayout>
  );
};

export default UploadPage;