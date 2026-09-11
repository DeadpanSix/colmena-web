import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getDocumentById,
  completeRoutingStep,
  respondToDocument,
  cancelDocument,
} from '../api/documents';
import RoutingForm from '../components/RoutingForm';

export default function DocumentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stepComment, setStepComment] = useState('');
  const [responseContent, setResponseContent] = useState('');
  const [actionError, setActionError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function fetchDocument() {
    try {
      const data = await getDocumentById(id);
      setDocument(data);
    } catch (err) {
      setError('Could not load document');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchDocument();
  }, [id]);

  if (isLoading) return <p>Loading document...</p>;
  if (error) return <p>{error}</p>;

  const nextPendingStep = document.routingSteps.find((step) => step.status === 'PENDING');
  const canCompleteStep = nextPendingStep && nextPendingStep.teamId === user.teamId;
  const isUploader = document.uploadedBy.id === user.id;
  const canRespond = document.status === 'PENDING_RESPONSE' && isUploader;
  const canCancel = !['RESPONDED', 'CANCELLED'].includes(document.status) && isUploader;
  const canAssignRouting =
    user.role === 'ADMIN' && !['CANCELLED', 'RESPONDED'].includes(document.status);

  async function handleCompleteStep(event) {
    event.preventDefault();
    setActionError(null);
    setIsSubmitting(true);
    try {
      await completeRoutingStep(document.id, nextPendingStep.order, stepComment);
      setStepComment('');
      await fetchDocument();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Could not complete step');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRespond(event) {
    event.preventDefault();
    setActionError(null);
    setIsSubmitting(true);
    try {
      await respondToDocument(document.id, responseContent);
      setResponseContent('');
      await fetchDocument();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Could not submit response');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancel() {
    setActionError(null);
    setIsSubmitting(true);
    try {
      await cancelDocument(document.id);
      await fetchDocument();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Could not cancel document');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <h1>{document.folio}</h1>
      <p><strong>Title:</strong> {document.title}</p>
      <p><strong>Type:</strong> {document.documentType.name}</p>
      <p><strong>Origin:</strong> {document.originDepartment.name}</p>
      <p><strong>Uploaded by:</strong> {document.uploadedBy.name}</p>
      <p><strong>Status:</strong> {document.status}</p>

      {actionError && <p style={{ color: 'red' }}>{actionError}</p>}

      <h2>Routing</h2>
      <ul>
        {document.routingSteps.map((step) => (
          <li key={step.id}>
            <p>Step {step.order}: {step.team.name} — {step.status}</p>
            <p>Deadline: {new Date(step.deadline).toLocaleString()}</p>
            {step.comment && <p>Comment: {step.comment}</p>}
            {step.completedBy && <p>Completed by: {step.completedBy.name}</p>}
          </li>
        ))}
      </ul>

      {canAssignRouting && (
        <RoutingForm documentId={document.id} onSuccess={fetchDocument} />
      )}

      {canCompleteStep && (
        <form onSubmit={handleCompleteStep}>
          <h3>Complete step {nextPendingStep.order} ({nextPendingStep.team.name})</h3>
          <textarea
            value={stepComment}
            onChange={(e) => setStepComment(e.target.value)}
            placeholder="Your comment"
            required
          />
          <button type="submit" disabled={isSubmitting}>Complete step</button>
        </form>
      )}

      {document.response && (
        <div>
          <h2>Response</h2>
          <p>{document.response.content}</p>
        </div>
      )}

      {canRespond && (
        <form onSubmit={handleRespond}>
          <h3>Submit final response</h3>
          <textarea
            value={responseContent}
            onChange={(e) => setResponseContent(e.target.value)}
            placeholder="Response content"
            required
          />
          <button type="submit" disabled={isSubmitting}>Submit response</button>
        </form>
      )}

      {canCancel && (
        <button onClick={handleCancel} disabled={isSubmitting}>
          Cancel document
        </button>
      )}
    </div>
  );
}
