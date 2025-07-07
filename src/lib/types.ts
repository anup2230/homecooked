export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  isProvider: boolean;
};

export type Dish = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  provider: User;
  rating: number;
  reviewCount: number;
  category: string;
  dietary?: ('vegetarian' | 'vegan' | 'gluten-free')[];
  'data-ai-hint'?: string;
};

export type Review = {
  id: string;
  dishId: string;
  user: {
    name: string;
    avatarUrl: string;
  };
  rating: number;
  comment: string;
  date: string;
};

export type Order = {
  id: string;
  dish: Dish;
  quantity: number;
  totalPrice: number;
  status: 'Pending Confirmation' | 'Preparing' | 'Ready for Pickup' | 'Completed' | 'Cancelled';
  orderDate: string;
};
