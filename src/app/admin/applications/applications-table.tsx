'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

type Application = {
  id: string;
  kitchenName: string;
  description: string | null;
  cuisineTags: string[];
  permitNumber: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes: string | null;
  createdAt: Date;
  user: { name: string | null; email: string | null };
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export function ApplicationsTable({ applications }: { applications: Application[] }) {
  const [data, setData] = useState(applications);
  const [dialog, setDialog] = useState<{
    open: boolean;
    appId: string;
    action: 'APPROVED' | 'REJECTED';
  } | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  function openDialog(appId: string, action: 'APPROVED' | 'REJECTED') {
    setNotes('');
    setDialog({ open: true, appId, action });
  }

  async function handleSubmit() {
    if (!dialog) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/applications/${dialog.appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: dialog.action, adminNotes: notes || undefined }),
      });

      if (res.ok) {
        setData((prev) =>
          prev.map((a) =>
            a.id === dialog.appId
              ? { ...a, status: dialog.action, adminNotes: notes || null }
              : a
          )
        );
        setDialog(null);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Applicant</TableHead>
              <TableHead>Kitchen Name</TableHead>
              <TableHead>Cuisine Tags</TableHead>
              <TableHead>Permit #</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((app) => (
              <TableRow key={app.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900">{app.user.name ?? '—'}</p>
                    <p className="text-xs text-gray-500">{app.user.email}</p>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{app.kitchenName}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {app.cuisineTags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {app.cuisineTags.length === 0 && (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">
                  {app.permitNumber ?? '—'}
                </TableCell>
                <TableCell>
                  <Badge
                    className={statusColors[app.status] ?? ''}
                    variant="secondary"
                  >
                    {app.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-500 text-sm">
                  {new Date(app.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {app.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="h-7 text-xs bg-green-600 hover:bg-green-700"
                        onClick={() => openDialog(app.id, 'APPROVED')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 text-xs"
                        onClick={() => openDialog(app.id, 'REJECTED')}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                  {app.status !== 'PENDING' && app.adminNotes && (
                    <p className="text-xs text-gray-500 max-w-[150px] truncate" title={app.adminNotes}>
                      {app.adminNotes}
                    </p>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                  No applications yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {dialog && (
        <Dialog open={dialog.open} onOpenChange={(open) => !open && setDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialog.action === 'APPROVED' ? 'Approve' : 'Reject'} Application
              </DialogTitle>
              <DialogDescription>
                {dialog.action === 'APPROVED'
                  ? 'This will set the user role to COOK and create a CookProfile.'
                  : 'The application will be marked as rejected.'}
              </DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Admin Notes (optional)
              </label>
              <Input
                placeholder="Add a note..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialog(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className={
                  dialog.action === 'APPROVED'
                    ? 'bg-green-600 hover:bg-green-700'
                    : ''
                }
                variant={dialog.action === 'REJECTED' ? 'destructive' : 'default'}
              >
                {loading ? 'Saving...' : dialog.action === 'APPROVED' ? 'Approve' : 'Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
