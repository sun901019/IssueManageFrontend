import { useState } from 'react';
import IssueBoard from '../components/IssueBoard';
import DashboardLayout from '../components/DashboardLayout';

export default function IssuesPage() {
  const [loading, setLoading] = useState(false);
  
  return (
    <DashboardLayout
      title={{
        icon: "bi bi-kanban",
        text: "問題管理看板",
        subtitle: "檢視並管理所有問題"
      }}
    >
      <IssueBoard />
    </DashboardLayout>
  );
} 