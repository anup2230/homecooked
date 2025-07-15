import type { User, Dish, Review, Order, Testimonial, Sale } from '@/lib/types';

export const mockUsers: User[] = [
  { id: 'user-1', name: 'Maria Garcia', avatarUrl: 'https://placehold.co/100x100.png', isProvider: true, distance: 'Approx. 1.2 miles away', location: 'San Francisco, CA' },
  { id: 'user-2', name: 'John Smith', avatarUrl: 'https://placehold.co/100x100.png', isProvider: true, distance: 'Approx. 3.5 miles away', location: 'Richmond, CA' },
  { id: 'user-3', name: 'Nonna Isabella', avatarUrl: 'https://placehold.co/100x100.png', isProvider: true, distance: 'Approx. 0.8 miles away', location: 'San Francisco, CA' },
  { id: 'user-4', name: 'Chen Wang', avatarUrl: 'https://placehold.co/100x100.png', isProvider: true, distance: 'Approx. 4.1 miles away', location: 'San Leandro, CA' },
  { id: 'user-5', name: 'Alice Johnson', avatarUrl: 'https://placehold.co/100x100.png', isProvider: false, location: 'Daly City, CA' },
  { id: 'user-6', name: 'David Lee', avatarUrl: 'https://placehold.co/100x100.png', isProvider: false, location: 'Sacramento, CA' },
  { id: 'user-7', name: 'Sarah Chen', avatarUrl: 'https://placehold.co/100x100.png', isProvider: false, location: 'San Francisco, CA' },

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
    'data-ai-hint': 'beef lasagna',
    deliveryOptions: ['pickup', 'drop-off'],
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
    'data-ai-hint': 'shepherds pie',
    deliveryOptions: ['pickup'],
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
    'data-ai-hint': 'italian meatballs',
    deliveryOptions: ['pickup', 'drop-off'],
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
    'data-ai-hint': 'mapo tofu',
    deliveryOptions: ['drop-off'],
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
    'data-ai-hint': 'chicken pot',
    deliveryOptions: ['pickup'],
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
    'data-ai-hint': 'quinoa salad',
    deliveryOptions: ['pickup', 'drop-off'],
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
    'data-ai-hint': 'tiramisu dessert',
    deliveryOptions: ['pickup'],
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
    'data-ai-hint': 'dan dan',
    deliveryOptions: ['drop-off'],
  },
  {
    id: 'dish-9',
    name: 'Homemade Cookies By The Dozen',
    description: '(Food Handler Certified)',
    price: 18.00,
    imageUrl: 'https://images.unsplash.com/photo-1598114353383-a61625935706?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    provider: mockUsers[2],
    rating: 4.9,
    reviewCount: 102,
    category: 'Dessert',
    'data-ai-hint': 'chocolate cookies',
    deliveryOptions: ['pickup', 'drop-off'],
  },
  {
    id: 'dish-10',
    name: 'HOMEMADE INDIAN VEGETARIAN FOOD!!',
    description: 'Dal Makhani',
    price: 12.00,
    imageUrl: 'https://images.unsplash.com/photo-1589647363585-f4a7d38779df?q=80&w=2960&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    provider: mockUsers[0],
    rating: 4.7,
    reviewCount: 45,
    category: 'Indian',
    'data-ai-hint': 'indian food',
    deliveryOptions: ['pickup'],
  },
    {
    id: 'dish-11',
    name: 'Specials Home Cooked Fresh Halal Food',
    description: 'Chicken and Rice',
    price: 20.00,
    imageUrl: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    provider: mockUsers[1],
    rating: 4.8,
    reviewCount: 55,
    category: 'Halal',
    'data-ai-hint': 'halal food',
    deliveryOptions: ['drop-off'],
  },
   {
    id: 'dish-12',
    name: 'Birria Cheeto balls',
    description: 'Spicy and cheesy',
    price: 20.00,
    imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?q=80&w=2864&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    provider: mockUsers[3],
    rating: 4.9,
    reviewCount: 91,
    category: 'Mexican',
    'data-ai-hint': 'spicy food',
    deliveryOptions: ['pickup'],
  },
];

export const mockReviews: Review[] = [
  {
    id: 'review-1',
    dishId: 'dish-3',
    user: { name: mockUsers[5].name, avatarUrl: mockUsers[5].avatarUrl },
    rating: 5,
    comment: 'Absolutely the best meatballs I have ever had. Tasted just like my own nonna\'s. Will be ordering again... and again!',
    date: '2024-05-18'
  },
  {
    id: 'review-2',
    dishId: 'dish-3',
    user: { name: mockUsers[6].name, avatarUrl: mockUsers[6].avatarUrl },
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
];

export const mockSales: Sale[] = [
  {
    id: 'order-1',
    dishName: mockDishes[2].name,
    customerName: 'David Lee',
    quantity: 2,
    totalPrice: 44.00,
    status: 'Completed',
    orderDate: '2024-05-18'
  },
  {
    id: 'order-3',
    dishName: mockDishes[6].name,
    customerName: 'Alice Johnson',
    quantity: 1,
    totalPrice: 9.50,
    status: 'Ready for Pickup',
    orderDate: '2024-05-21'
  },
   {
    id: 'order-4',
    dishName: mockDishes[2].name,
    customerName: 'Sarah Chen',
    quantity: 1,
    totalPrice: 22.00,
    status: 'Preparing',
    orderDate: '2024-05-22'
  }
]

export const mockTestimonials: Testimonial[] = [
  {
    id: 'testimonial-1',
    name: 'Jessica P.',
    location: 'Brooklyn, NY',
    avatarUrl: 'https://placehold.co/100x100.png',
    comment: 'Homecooked is a game-changer! I ordered Nonna Isabella\'s meatballs and it was like a hug in a bowl. So easy to order and support local cooks.'
  },
  {
    id: 'testimonial-2',
    name: 'Tom L.',
    location: 'Queens, NY',
    avatarUrl: 'https://placehold.co/100x100.png',
    comment: 'I love the variety. The Mapo Tofu was incredible and had that authentic kick I\'ve been looking for. Way better than takeout.'
  },
  {
    id: 'testimonial-3',
    name: 'Maria G.',
    location: 'Manhattan, NY',
    avatarUrl: 'https://placehold.co/100x100.png',
    comment: 'As a busy professional, I barely have time to cook. Homecooked lets me enjoy a real, comforting meal without the hassle. The Pot Pie was amazing!'
  },
];
