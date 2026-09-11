import { useState, useEffect } from 'react';
import { getTeams } from '../api/catalogs';
import { assignRouting } from '../api/documents';

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
      <h3>Assign routing</h3>
      {steps.map((step, index) => (
        <div key={index}>
          <select
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
            value={step.days}
            onChange={(e) => updateStep(index, 'days', e.target.value)}
            required
          />
          {steps.length > 1 && (
            <button type="button" onClick={() => removeStep(index)}>
              Remove
            </button>
          )}
        </div>
      ))}

      <button type="button" onClick={addStep}>
        Add another team
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Assigning...' : 'Assign routing'}
      </button>
    </form>
  );
}
