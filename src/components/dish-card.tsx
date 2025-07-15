import Image from 'next/image';
import Link from 'next/link';
import type { Dish } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface DishCardProps {
  dish: Dish;
}

export function DishCard({ dish }: DishCardProps) {
  return (
    <Link href={`/dishes/${dish.id}`} className="block overflow-hidden rounded-lg group">
      <Card className="h-full flex flex-col transition-all duration-200 ease-in-out group-hover:shadow-xl border-0 shadow-none hover:shadow-none">
        <CardHeader className="p-0">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg">
            <Image
              src={dish.imageUrl}
              alt={dish.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
              data-ai-hint={dish['data-ai-hint']}
            />
          </div>
        </CardHeader>
        <CardContent className="p-2 flex-grow">
          <p className="text-base font-semibold text-foreground">${dish.price.toFixed(2)}</p>
          <p className="text-sm text-foreground truncate">{dish.name}</p>
          <p className="text-xs text-muted-foreground">{dish.provider.location}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
