import type { User, Dish, Review, Order, Testimonial, Sale, Conversation, Message } from '@/lib/types';

export const mockUsers: User[] = [
  { id: 'user-1', name: 'Maria Garcia', avatarUrl: 'https://placehold.co/100x100.png', isProvider: true, distance: 'Approx. 1.2 miles away', location: 'San Francisco, CA', description: 'Specializing in authentic Spanish tapas and paella, made with love.' },
  { id: 'user-2', name: 'John Smith', avatarUrl: 'https://placehold.co/100x100.png', isProvider: true, distance: 'Approx. 3.5 miles away', location: 'Richmond, CA', description: 'Healthy, hearty, and wholesome meals. Vegan and gluten-free options available!' },
  { id: 'user-3', name: 'Nonna Isabella', avatarUrl: 'https://placehold.co/100x100.png', isProvider: true, distance: 'Approx. 0.8 miles away', location: 'San Francisco, CA', description: 'Generations of family recipes. Every dish is made with love and the freshest ingredients.' },
  { id: 'user-4', name: 'Chen Wang', avatarUrl: 'https://placehold.co/100x100.png', isProvider: true, distance: 'Approx. 4.1 miles away', location: 'San Leandro, CA', description: 'Authentic Szechuan cuisine that brings the heat. Not for the faint of heart!' },
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
    name: 'Priya S.',
    location: 'Austin, TX',
    avatarUrl: 'https://placehold.co/100x100.png',
    comment: 'I moved from India six months ago and was desperately missing my mom\'s cooking. Finding authentic, homemade dal makhani on here was a miracle! It tasted just like home.'
  },
  {
    id: 'testimonial-2',
    name: 'Mateo R.',
    location: 'Chicago, IL',
    avatarUrl: 'https://placehold.co/100x100.png',
    comment: 'I never thought I\'d find real Spanish paella in the Midwest. Maria\'s kitchen is a gem. It’s amazing to connect with my culture through food, even when I\'m miles away from Spain.'
  },
  {
    id: 'testimonial-3',
    name: 'Aisha B.',
    location: 'Seattle, WA',
    avatarUrl: 'https://placehold.co/100x100.png',
    comment: 'As a student from Nigeria, finding jollof rice that tastes right is tough. Homecooked connected me with a local cook who makes it perfectly. It\'s more than just a meal; it\'s a connection to my roots.'
  },
];

const loggedInUserId = 'user-3'; // Mocking Nonna Isabella as logged in user

export const mockMessages: Message[] = [
    { id: 'msg-1', senderId: 'user-5', text: 'Hi Nonna! I was wondering if the meatballs contain any nuts? My son has an allergy.', timestamp: '10:30 AM' },
    { id: 'msg-2', senderId: loggedInUserId, text: 'Ciao Alice! No, there are no nuts in the meatballs. The recipe is completely nut-free.', timestamp: '10:32 AM' },
    { id: 'msg-3', senderId: 'user-5', text: 'That\'s wonderful to hear! Thank you so much for the quick reply. I\'ll place an order now.', timestamp: '10:33 AM' },
    { id: 'msg-4', senderId: 'user-6', text: 'Hello! I saw your Tiramisu, it looks amazing! Is it possible to order a larger one for a party?', timestamp: 'Yesterday' },
    { id: 'msg-5', senderId: loggedInUserId, text: 'Hi David! Absolutely, I can make a larger format Tiramisu. How many people are you expecting?', timestamp: 'Yesterday' },
];

export const mockConversations: Conversation[] = [
    {
        id: 'conv-1',
        participants: [mockUsers.find(u => u.id === 'user-5')!, mockUsers.find(u => u.id === loggedInUserId)!],
        messages: [mockMessages[0], mockMessages[1], mockMessages[2]],
    },
    {
        id: 'conv-2',
        participants: [mockUsers.find(u => u.id === 'user-6')!, mockUsers.find(u => u.id === loggedInUserId)!],
        messages: [mockMessages[3], mockMessages[4]],
    },
    {
        id: 'conv-3',
        participants: [mockUsers.find(u => u.id === 'user-1')!, mockUsers.find(u => u.id === loggedInUserId)!],
        messages: [{id: 'msg-6', senderId: 'user-1', text: 'Just wanted to say I loved the Paella. Reminded me of my home in Valencia!', timestamp: '3 days ago'}],
    },
];
