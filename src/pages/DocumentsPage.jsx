import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDocuments } from '../api/documents';
import styles from './DocumentsPage.module.css';

const STATUS_LABELS = {
  RECEIVED: 'Received',
  IN_ROUTING: 'In routing',
  PENDING_RESPONSE: 'Pending response',
  RESPONDED: 'Responded',
  CANCELLED: 'Cancelled',
};

const STATUS_CLASSES = {
  RECEIVED: 'statusReceived',
  IN_ROUTING: 'statusInRouting',
  PENDING_RESPONSE: 'statusPendingResponse',
  RESPONDED: 'statusResponded',
  CANCELLED: 'statusCancelled',
};

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
      <div className={styles.header}>
        <h1 className={styles.title}>Documents</h1>
        <Link to="/documents/new" className={styles.createButton}>
          Create new document
        </Link>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
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
                  <Link to={`/documents/${doc.id}`} className={styles.link}>
                    {doc.title}
                    <span className={styles.linkIcon}>→</span>
                  </Link>
                </td>
                <td>{doc.documentType.name}</td>
                <td>{doc.originDepartment.name}</td>
                <td>
                  <span className={`${styles.status} ${styles[STATUS_CLASSES[doc.status]]}`}>
                    {STATUS_LABELS[doc.status]}
                  </span>
                </td>
                <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
