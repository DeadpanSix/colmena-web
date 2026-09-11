import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocumentTypes, getDepartments } from '../api/catalogs';
import { createDocument } from '../api/documents';

export default function CreateDocumentPage() {
  const navigate = useNavigate();

  const [documentTypes, setDocumentTypes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true);

  const [title, setTitle] = useState('');
  const [documentTypeId, setDocumentTypeId] = useState('');
  const [originDepartmentId, setOriginDepartmentId] = useState('');
  const [file, setFile] = useState(null);

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchCatalogs() {
      try {
        const [types, depts] = await Promise.all([getDocumentTypes(), getDepartments()]);
        setDocumentTypes(types);
        setDepartments(depts);
      } catch (err) {
        setError('Could not load form data');
      } finally {
        setIsLoadingCatalogs(false);
      }
    }

    fetchCatalogs();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (!file) {
      setError('Please select a file');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('documentTypeId', documentTypeId);
    formData.append('originDepartmentId', originDepartmentId);
    formData.append('file', file);

    try {
      const document = await createDocument(formData);
      navigate(`/documents/${document.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create document');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingCatalogs) {
    return <p>Loading form...</p>;
  }

  return (
    <div>
      <h1>Create document</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="documentType">Document type</label>
          <select
            id="documentType"
            value={documentTypeId}
            onChange={(e) => setDocumentTypeId(e.target.value)}
            required
          >
            <option value="">Select a type</option>
            {documentTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="originDepartment">Origin department</label>
          <select
            id="originDepartment"
            value={originDepartmentId}
            onChange={(e) => setOriginDepartmentId(e.target.value)}
            required
          >
            <option value="">Select a department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="file">File (PDF, JPG, or PNG)</label>
          <input
            id="file"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create document'}
        </button>
      </form>
    </div>
  );
}
