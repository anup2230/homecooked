import { db } from '@/lib/db';
import { ApplicationsTable } from './applications-table';

export default async function AdminApplicationsPage() {
  const applications = await db.kitchenApplication.findMany({
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Kitchen Applications</h1>
        <p className="text-gray-500 mt-1">Review and approve cook applications</p>
      </div>
      <ApplicationsTable applications={applications} />
    </div>
  );
}
