import { redirect } from 'next/navigation';

// This is the index page for /dashboard
// We redirect to the overview page as the default dashboard view
// The actual navigation between dashboard pages is handled by the app-sidebar.tsx component
export default function Dashboard() {
  redirect('/dashboard/overview');
}
