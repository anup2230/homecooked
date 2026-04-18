export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  isProvider: boolean;
  distance?: string;
  location?: string;
  description?: string;
};

export type DeliveryOption = 'pickup' | 'drop-off';
export type ServiceType = 'prepped' | 'catering';

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
  deliveryOptions?: DeliveryOption[];
  serviceType?: ServiceType;
  'data-ai-hint'?: string;
  location?: [number, number];
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

export type Sale = {
  id: string;
  dishName: string;
  customerName: string;
  quantity: number;
  totalPrice: number;
  status: 'Pending Confirmation' | 'Preparing' | 'Ready for Pickup' | 'Completed' | 'Cancelled';
  orderDate: string;
}

export type Testimonial = {
  id: string;
  name: string;
  location: string;
  avatarUrl: string;
  comment: string;
};

export type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export type Conversation = {
  id: string;
  participants: User[];
  messages: Message[];
};

export type MonthlyRevenue = {
  month: string;
  revenue: number;
  orders: number;
};

export type TopDish = {
  name: string;
  revenue: number;
  unitsSold: number;
};
