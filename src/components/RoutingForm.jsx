import { useState, useEffect } from 'react';
import { getTeams } from '../api/catalogs';
import { assignRouting } from '../api/documents';
import styles from './RoutingForm.module.css';

export default function RoutingForm({ documentId, onSuccess }) {
  const [teams, setTeams] = useState([]);
  const [steps, setSteps] = useState([{ teamId: '', days: '' }]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchTeams() {
      const data = await getTeams();
      setTeams(data);
    }
    fetchTeams();
  }, []);

  function updateStep(index, field, value) {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  }

  function addStep() {
    setSteps([...steps, { teamId: '', days: '' }]);
  }

  function removeStep(index) {
    setSteps(steps.filter((_, i) => i !== index));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    const parsedSteps = steps.map((step) => ({
      teamId: Number(step.teamId),
      days: Number(step.days),
    }));

    if (parsedSteps.some((step) => !step.teamId || !step.days)) {
      setError('Please complete all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await assignRouting(documentId, parsedSteps);
      setSteps([{ teamId: '', days: '' }]);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not assign routing');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 className={styles.title}>Assign routing</h3>

      {steps.map((step, index) => (
        <div key={index} className={styles.row}>
          <select
            className={styles.select}
            value={step.teamId}
            onChange={(e) => updateStep(index, 'teamId', e.target.value)}
            required
          >
            <option value="">Select a team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            placeholder="Days"
            className={styles.daysInput}
            value={step.days}
            onChange={(e) => updateStep(index, 'days', e.target.value)}
            required
          />
          {steps.length > 1 && (
            <button
              type="button"
              className={styles.removeButton}
              onClick={() => removeStep(index)}
              aria-label="Remove step"
            >
              ×
            </button>
          )}
        </div>
      ))}

      <button type="button" className={styles.addButton} onClick={addStep}>
        + Add another team
      </button>

      {error && <p className={styles.error}>{error}</p>}

      <div>
        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? 'Assigning...' : 'Assign routing'}
        </button>
      </div>
    </form>
  );
}
