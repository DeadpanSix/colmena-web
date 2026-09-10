import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDocuments } from '../api/documents';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const data = await getDocuments();
        setDocuments(data);
      } catch (err) {
        setError('Could not load documents');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDocuments();
  }, []);

  if (isLoading) {
    return <p>Loading documents...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Documents</h1>
      <table>
        <thead>
          <tr>
            <th>Folio</th>
            <th>Title</th>
            <th>Type</th>
            <th>Origin</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.folio}</td>
              <td>
                <Link to={`/documents/${doc.id}`}>{doc.title}</Link>
              </td>
              <td>{doc.documentType.name}</td>
              <td>{doc.originDepartment.name}</td>
              <td>{doc.status}</td>
              <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
