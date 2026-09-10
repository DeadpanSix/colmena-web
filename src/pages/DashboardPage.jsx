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
  RECEIVED: 'Recibido',
  IN_ROUTING: 'En turnado',
  PENDING_RESPONSE: 'Pend. respuesta',
  RESPONDED: 'Respondido',
  CANCELLED: 'Cancelado',
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
        label: 'Documentos',
        data: Object.values(data.byStatus),
        backgroundColor: '#378ADD',
      },
    ],
  };

  const originChartData = {
    labels: data.byOriginDepartment.map((d) => d.departmentName),
    datasets: [
      {
        label: 'Documentos',
        data: data.byOriginDepartment.map((d) => d.count),
        backgroundColor: '#1D9E75',
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
      <h1>Dashboard</h1>

      <div className={styles.metricsGrid}>
        <MetricCard label="Total documentos" value={data.totalDocuments} color="#E6F1FB" />
        <MetricCard label="Respondidos" value={data.byStatus.RESPONDED} color="#EAF3DE" />
        <MetricCard label="Cancelados" value={data.byStatus.CANCELLED} color="#FCEBEB" />
        <MetricCard label="Vencidos" value={data.overdueSteps} color="#FAEEDA" />
        <MetricCard label="Por vencer" value={data.dueSoonSteps} color="#FAEEDA" />
      </div>

      <h2>Documentos por estatus</h2>
      <div className={styles.chartContainer}>
        <Bar data={statusChartData} options={chartOptions} />
      </div>

      <h2>Documentos por procedencia</h2>
      <div className={styles.chartContainer}>
        <Bar data={originChartData} options={chartOptions} />
      </div>
    </div>
  );
}

function TeamDashboard({ data }) {
  return (
    <div>
      <h1>{data.teamName} Dashboard</h1>

      <div className={styles.metricsGrid}>
        <MetricCard label="Pendientes" value={data.pendingSteps} color="#E6F1FB" />
        <MetricCard label="Completados" value={data.completedSteps} color="#EAF3DE" />
        <MetricCard label="Vencidos" value={data.overdueSteps} color="#FCEBEB" />
        <MetricCard label="Por vencer" value={data.dueSoonSteps} color="#FAEEDA" />
      </div>

      <h2>Documentos</h2>
      <ul>
        {data.documents.map((doc) => (
          <li key={`${doc.documentId}-${doc.stepOrder}`}>
            {doc.folio} — {doc.title} — Step {doc.stepOrder} ({doc.stepStatus})
            {doc.isOverdue && ' — OVERDUE'}
            {doc.isDueSoon && ' — DUE SOON'}
          </li>
        ))}
      </ul>
    </div>
  );
}
