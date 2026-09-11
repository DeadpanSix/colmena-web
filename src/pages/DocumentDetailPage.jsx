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
import styles from './DocumentDetailPage.module.css';

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
      <div className={styles.header}>
        <h1 className={styles.folio}>{document.folio}</h1>
        <div className={styles.metaGrid}>
          <div>
            <p className={styles.metaLabel}>Title</p>
            <p className={styles.metaValue}>{document.title}</p>
          </div>
          <div>
            <p className={styles.metaLabel}>Type</p>
            <p className={styles.metaValue}>{document.documentType.name}</p>
          </div>
          <div>
            <p className={styles.metaLabel}>Origin</p>
            <p className={styles.metaValue}>{document.originDepartment.name}</p>
          </div>
          <div>
            <p className={styles.metaLabel}>Uploaded by</p>
            <p className={styles.metaValue}>{document.uploadedBy.name}</p>
          </div>
          <div>
            <p className={styles.metaLabel}>Status</p>
            <span className={`${styles.status} ${styles[STATUS_CLASSES[document.status]]}`}>
              {STATUS_LABELS[document.status]}
            </span>
          </div>
        </div>
      </div>

      {actionError && <p className={styles.actionError}>{actionError}</p>}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Routing</h2>
        <div className={styles.stepsList}>
          {document.routingSteps.map((step) => (
            <div
              key={step.id}
              className={`${styles.stepCard} ${
                step.status === 'COMPLETED' ? styles.stepCardCompleted : styles.stepCardPending
              }`}
            >
              <div className={styles.stepHeader}>
                <p className={styles.stepTitle}>
                  Step {step.order}: {step.team.name}
                </p>
                <span
                  className={`${styles.status} ${
                    step.status === 'COMPLETED' ? styles.statusResponded : styles.statusInRouting
                  }`}
                >
                  {step.status === 'COMPLETED' ? 'Completed' : 'Pending'}
                </span>
              </div>
              <p className={styles.stepMeta}>
                Deadline: {new Date(step.deadline).toLocaleString()}
              </p>
              {step.completedBy && (
                <p className={styles.stepMeta}>Completed by: {step.completedBy.name}</p>
              )}
              {step.comment && <p className={styles.stepComment}>{step.comment}</p>}
            </div>
          ))}
        </div>
      </div>

      {canAssignRouting && (
        <div className={styles.section}>
          <div className={styles.formCard}>
            <RoutingForm documentId={document.id} onSuccess={fetchDocument} />
          </div>
        </div>
      )}

      {canCompleteStep && (
        <div className={styles.section}>
          <div className={styles.formCard}>
            <h3 className={styles.sectionTitle}>
              Complete step {nextPendingStep.order} ({nextPendingStep.team.name})
            </h3>
            <form onSubmit={handleCompleteStep}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="stepComment">Comment</label>
                <textarea
                  id="stepComment"
                  className={styles.textarea}
                  value={stepComment}
                  onChange={(e) => setStepComment(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className={styles.button} disabled={isSubmitting}>
                Complete step
              </button>
            </form>
          </div>
        </div>
      )}

      {document.response && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Response</h2>
          <div className={styles.responseCard}>
            <p className={styles.responseText}>{document.response.content}</p>
          </div>
        </div>
      )}

      {canRespond && (
        <div className={styles.section}>
          <div className={styles.formCard}>
            <h3 className={styles.sectionTitle}>Submit final response</h3>
            <form onSubmit={handleRespond}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="responseContent">Response</label>
                <textarea
                  id="responseContent"
                  className={styles.textarea}
                  value={responseContent}
                  onChange={(e) => setResponseContent(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className={styles.button} disabled={isSubmitting}>
                Submit response
              </button>
            </form>
          </div>
        </div>
      )}

      {canCancel && (
        <button onClick={handleCancel} className={styles.dangerButton} disabled={isSubmitting}>
          Cancel document
        </button>
      )}
    </div>
  );
}
