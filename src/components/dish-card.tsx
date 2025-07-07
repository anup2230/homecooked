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
      <Card className="h-full flex flex-col transition-all duration-200 ease-in-out group-hover:shadow-xl">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full overflow-hidden">
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
        <CardContent className="p-4 flex-grow">
          <Badge variant="secondary" className="mb-2">{dish.category}</Badge>
          <CardTitle className="text-lg font-headline leading-tight mb-2">{dish.name}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={dish.provider.avatarUrl} alt={dish.provider.name} />
              <AvatarFallback>{dish.provider.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{dish.provider.name}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 flex justify-between items-center">
          <p className="text-xl font-bold text-primary">${dish.price.toFixed(2)}</p>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="font-medium">{dish.rating.toFixed(1)}</span>
            <span className="text-muted-foreground text-sm">({dish.reviewCount})</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
