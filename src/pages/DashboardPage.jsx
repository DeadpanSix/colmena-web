import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { getSummary, getTeamDashboard } from '../api/dashboard';
import styles from './DashboardPage.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const STATUS_LABELS = {
  RECEIVED: 'Received',
  IN_ROUTING: 'In routing',
  PENDING_RESPONSE: 'Pending response',
  RESPONDED: 'Responded',
  CANCELLED: 'Cancelled',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const result =
          user.role === 'ADMIN' ? await getSummary() : await getTeamDashboard(user.teamId);
        setData(result);
      } catch (err) {
        setError('Could not load dashboard');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboard();
  }, [user]);

  if (isLoading) return <p>Loading dashboard...</p>;
  if (error) return <p>{error}</p>;

  if (user.role === 'ADMIN') {
    return <AdminSummary data={data} />;
  }

  return <TeamDashboard data={data} />;
}

function MetricCard({ label, value, color }) {
  return (
    <div className={styles.metricCard} style={{ background: color }}>
      <p className={styles.metricLabel}>{label}</p>
      <p className={styles.metricValue}>{value}</p>
    </div>
  );
}

function AdminSummary({ data }) {
  const statusChartData = {
    labels: Object.keys(data.byStatus).map((key) => STATUS_LABELS[key] || key),
    datasets: [
      {
        label: 'Documents',
        data: Object.values(data.byStatus),
        backgroundColor: '#378ADD',
        borderRadius: 4,
      },
    ],
  };

  const originChartData = {
    labels: data.byOriginDepartment.map((d) => d.departmentName),
    datasets: [
      {
        label: 'Documents',
        data: data.byOriginDepartment.map((d) => d.count),
        backgroundColor: '#1D9E75',
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  return (
    <div>
      <h1 className={styles.title}>Dashboard</h1>

      <div className={styles.metricsGrid}>
        <MetricCard label="Total documents" value={data.totalDocuments} color="#E6F1FB" />
        <MetricCard label="Responded" value={data.byStatus.RESPONDED} color="#EAF3DE" />
        <MetricCard label="Cancelled" value={data.byStatus.CANCELLED} color="#FCEBEB" />
        <MetricCard label="Overdue" value={data.overdueSteps} color="#FCEBEB" />
        <MetricCard label="Due soon" value={data.dueSoonSteps} color="#FAEEDA" />
      </div>

      <h2 className={styles.sectionTitle}>Documents by status</h2>
      <div className={styles.chartCard}>
        <div className={styles.chartWrapper}>
          <Bar data={statusChartData} options={chartOptions} />
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Documents by origin department</h2>
      <div className={styles.chartCard}>
        <div className={styles.chartWrapper}>
          <Bar data={originChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}

function TeamDashboard({ data }) {
  return (
    <div>
      <h1 className={styles.title}>{data.teamName} dashboard</h1>

      <div className={styles.metricsGrid}>
        <MetricCard label="Pending" value={data.pendingSteps} color="#E6F1FB" />
        <MetricCard label="Completed" value={data.completedSteps} color="#EAF3DE" />
        <MetricCard label="Overdue" value={data.overdueSteps} color="#FCEBEB" />
        <MetricCard label="Due soon" value={data.dueSoonSteps} color="#FAEEDA" />
      </div>

      <h2 className={styles.sectionTitle}>Documents</h2>
      <div className={styles.documentsList}>
        {data.documents.length === 0 ? (
          <p className={styles.emptyState}>No documents assigned to your team yet.</p>
        ) : (
          data.documents.map((doc) => (
            <div key={`${doc.documentId}-${doc.stepOrder}`} className={styles.documentRow}>
              <div className={styles.documentInfo}>
                <span className={styles.documentFolio}>{doc.folio}</span>
                <span className={styles.documentTitle}>{doc.title}</span>
              </div>
              {doc.isOverdue && <span className={`${styles.flag} ${styles.flagOverdue}`}>Overdue</span>}
              {doc.isDueSoon && <span className={`${styles.flag} ${styles.flagDueSoon}`}>Due soon</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
