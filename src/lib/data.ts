import type { User, Dish, Review, Order } from '@/lib/types';

export const mockUsers: User[] = [
  { id: 'user-1', name: 'Maria Garcia', avatarUrl: 'https://placehold.co/100x100.png', isProvider: true },
  { id: 'user-2', name: 'John Smith', avatarUrl: 'https://placehold.co/100x100.png', isProvider: true },
  { id: 'user-3', name: 'Nonna Isabella', avatarUrl: 'https://placehold.co/100x100.png', isProvider: true },
  { id: 'user-4', name: 'Chen Wang', avatarUrl: 'https://placehold.co/100x100.png', isProvider: true },
  { id: 'user-5', name: 'Alice Johnson', avatarUrl: 'https://placehold.co/100x100.png', isProvider: false },
];

export const mockDishes: Dish[] = [
  {
    id: 'dish-1',
    name: 'Classic Beef Lasagna',
    description: 'Layers of fresh pasta, rich bolognese sauce, creamy béchamel, and a blend of Italian cheeses. A true taste of home.',
    price: 18.50,
    imageUrl: 'https://placehold.co/600x400.png',
    provider: mockUsers[0],
    rating: 4.8,
    reviewCount: 45,
    category: 'Italian',
    'data-ai-hint': 'beef lasagna'
  },
  {
    id: 'dish-2',
    name: 'Vegan Lentil Shepherd\'s Pie',
    description: 'A hearty and flavorful lentil stew topped with fluffy, golden-brown mashed sweet potatoes. Comfort food at its best.',
    price: 16.00,
    imageUrl: 'https://placehold.co/600x400.png',
    provider: mockUsers[1],
    rating: 4.9,
    reviewCount: 32,
    category: 'British',
    dietary: ['vegan', 'gluten-free'],
    'data-ai-hint': 'shepherds pie'
  },
  {
    id: 'dish-3',
    name: 'Nonna\'s Famous Meatballs',
    description: 'Generations-old recipe for the most tender and flavorful meatballs, simmered in a slow-cooked tomato sauce.',
    price: 22.00,
    imageUrl: 'https://placehold.co/600x400.png',
    provider: mockUsers[2],
    rating: 5.0,
    reviewCount: 89,
    category: 'Italian',
    'data-ai-hint': 'italian meatballs'
  },
  {
    id: 'dish-4',
    name: 'Spicy Szechuan Mapo Tofu',
    description: 'Silky tofu in a fiery, aromatic sauce with fermented black beans and Szechuan peppercorns. Served with steamed rice.',
    price: 15.75,
    imageUrl: 'https://placehold.co/600x400.png',
    provider: mockUsers[3],
    rating: 4.7,
    reviewCount: 51,
    category: 'Chinese',
    dietary: ['vegetarian'],
    'data-ai-hint': 'mapo tofu'
  },
  {
    id: 'dish-5',
    name: 'Homestyle Chicken Pot Pie',
    description: 'Tender chicken and vegetables in a creamy sauce, all tucked into a flaky, buttery crust. A timeless classic.',
    price: 17.00,
    imageUrl: 'https://placehold.co/600x400.png',
    provider: mockUsers[0],
    rating: 4.8,
    reviewCount: 62,
    category: 'American',
    'data-ai-hint': 'chicken pot'
  },
  {
    id: 'dish-6',
    name: 'Fresh Garden Quinoa Salad',
    description: 'A vibrant mix of quinoa, cucumber, tomatoes, bell peppers, and a lemon-herb vinaigrette. Healthy and refreshing.',
    price: 14.50,
    imageUrl: 'https://placehold.co/600x400.png',
    provider: mockUsers[1],
    rating: 4.6,
    reviewCount: 25,
    category: 'Salad',
    dietary: ['vegan', 'gluten-free'],
    'data-ai-hint': 'quinoa salad'
  },
   {
    id: 'dish-7',
    name: 'Tiramisu Classico',
    description: 'Espresso-soaked ladyfingers layered with a whipped mixture of eggs, sugar, and mascarpone cheese, flavoured with cocoa.',
    price: 9.50,
    imageUrl: 'https://placehold.co/600x400.png',
    provider: mockUsers[2],
    rating: 4.9,
    reviewCount: 78,
    category: 'Dessert',
    'data-ai-hint': 'tiramisu dessert'
  },
  {
    id: 'dish-8',
    name: 'Hand-pulled Dan Dan Noodles',
    description: 'A classic Szechuan street food featuring spicy sauce, preserved vegetables, and minced pork over fresh noodles.',
    price: 16.50,
    imageUrl: 'https://placehold.co/600x400.png',
    provider: mockUsers[3],
    rating: 4.8,
    reviewCount: 66,
    category: 'Chinese',
    'data-ai-hint': 'dan dan'
  },
];

export const mockReviews: Review[] = [
  {
    id: 'review-1',
    dishId: 'dish-3',
    user: { name: 'David Lee', avatarUrl: 'https://placehold.co/100x100.png' },
    rating: 5,
    comment: 'Absolutely the best meatballs I have ever had. Tasted just like my own nonna\'s. Will be ordering again... and again!',
    date: '2024-05-18'
  },
  {
    id: 'review-2',
    dishId: 'dish-3',
    user: { name: 'Sarah Chen', avatarUrl: 'https://placehold.co/100x100.png' },
    rating: 5,
    comment: 'Incredible! The sauce is rich and the meatballs are so tender. A must-try.',
    date: '2024-05-16'
  },
  {
    id: 'review-3',
    dishId: 'dish-1',
    user: { name: 'Mike R.', avatarUrl: 'https://placehold.co/100x100.png' },
    rating: 4,
    comment: 'Very good lasagna, generous portion and very cheesy. Sauce was a little sweet for my taste but still delicious.',
    date: '2024-05-15'
  },
  {
    id: 'review-4',
    dishId: 'dish-4',
    user: { name: 'Emily White', avatarUrl: 'https://placehold.co/100x100.png' },
    rating: 5,
    comment: 'Perfect level of spice and the tofu was so silky. Authentic Szechuan flavor!',
    date: '2024-05-20'
  }
];

export const mockOrders: Order[] = [
  {
    id: 'order-1',
    dish: mockDishes[2],
    quantity: 2,
    totalPrice: 44.00,
    status: 'Completed',
    orderDate: '2024-05-18'
  },
  {
    id: 'order-2',
    dish: mockDishes[0],
    quantity: 1,
    totalPrice: 18.50,
    status: 'Completed',
    orderDate: '2024-05-10'
  },
  {
    id: 'order-3',
    dish: mockDishes[3],
    quantity: 1,
    totalPrice: 15.75,
    status: 'Ready for Pickup',
    orderDate: '2024-05-21'
  },
    {
    id: 'order-4',
    dish: mockDishes[6],
    quantity: 2,
    totalPrice: 19.00,
    status: 'Preparing',
    orderDate: '2024-05-22'
  }
]
