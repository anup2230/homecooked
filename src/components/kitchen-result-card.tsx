import type { User, Dish } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DishCard } from '@/components/dish-card';
import { MapPin } from 'lucide-react';

interface KitchenResultCardProps {
  provider: User;
  dishes: Dish[];
}

export function KitchenResultCard({ provider, dishes }: KitchenResultCardProps) {
  const providerDishes = dishes.slice(0, 4);

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-16 w-16 border-2 border-primary">
          <AvatarImage src={provider.avatarUrl} alt={provider.name} />
          <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold font-headline">{provider.name}'s Kitchen</h2>
          {provider.location && (
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1.5" />
              <span>{provider.location}</span>
            </div>
          )}
        </div>
      </div>

      {providerDishes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {providerDishes.map(dish => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground italic">
          {provider.name} doesn't have any dishes listed at the moment.
        </p>
      )}
    </div>
  );
}
