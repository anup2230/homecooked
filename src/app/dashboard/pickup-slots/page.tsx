"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Pickup slots are now managed per-dish on the Edit Profile page.
export default function PickupSlotsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/profile/edit/dishes');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
