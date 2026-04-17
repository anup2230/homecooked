'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: 'BUYER' | 'COOK' | 'ADMIN';
  createdAt: Date;
  cookProfile: { isVerified: boolean } | null;
};

const roleColors: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  COOK: 'bg-green-100 text-green-700',
  BUYER: 'bg-blue-100 text-blue-700',
};

export function UsersTable({ users }: { users: User[] }) {
  const [userData, setUserData] = useState(users);
  const [updating, setUpdating] = useState<string | null>(null);

  async function handleRoleChange(userId: string, newRole: string) {
    setUpdating(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setUserData((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, role: newRole as User['role'] } : u
          )
        );
      }
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Verified Cook</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Change Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {userData.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.name ?? '—'}
              </TableCell>
              <TableCell className="text-gray-600">{user.email}</TableCell>
              <TableCell>
                <Badge className={roleColors[user.role] ?? ''} variant="secondary">
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                {user.cookProfile ? (
                  user.cookProfile.isVerified ? (
                    <span className="text-green-600 text-sm font-medium">✓ Verified</span>
                  ) : (
                    <span className="text-gray-400 text-sm">Unverified</span>
                  )
                ) : (
                  <span className="text-gray-300 text-sm">—</span>
                )}
              </TableCell>
              <TableCell className="text-gray-500 text-sm">
                {new Date(user.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onValueChange={(val) => handleRoleChange(user.id, val)}
                  disabled={updating === user.id}
                >
                  <SelectTrigger className="w-32 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUYER">BUYER</SelectItem>
                    <SelectItem value="COOK">COOK</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
          {userData.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                No users found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
