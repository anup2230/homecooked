import { db } from '@/lib/db';
import { UsersTable } from './users-table';

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      cookProfile: {
        select: { isVerified: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 mt-1">Manage user roles and permissions</p>
      </div>
      <UsersTable users={users} />
    </div>
  );
}
