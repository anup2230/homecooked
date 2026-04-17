import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ChefHat, ClipboardList, ShoppingBag } from 'lucide-react';

export default async function AdminOverviewPage() {
  const [totalUsers, totalCooks, pendingApplications, totalOrders] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: 'COOK' } }),
    db.kitchenApplication.count({ where: { status: 'PENDING' } }),
    db.order.count(),
  ]);

  const stats = [
    {
      label: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Cooks',
      value: totalCooks,
      icon: ChefHat,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Pending Applications',
      value: pendingApplications,
      icon: ClipboardList,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Total Orders',
      value: totalOrders,
      icon: ShoppingBag,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-500 mt-1">Platform stats at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.label}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
