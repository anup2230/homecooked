/**
 * seed.demo.ts — rich demo data for showcasing the platform
 *
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.demo.ts
 * Or via:   npm run seed:demo
 *
 * Safe to re-run — skips already-seeded cooks/dishes, and only adds orders
 * if a cook has fewer than 5 completed ones.
 */

import { PrismaClient, Role, OrderStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

function daysAgo(n: number, jitterHrs = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(d.getHours() - Math.floor(Math.random() * jitterHrs));
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(14, 0, 0, 0);
  return d;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── Review content pool ──────────────────────────────────────────────────────
const REVIEW_COMMENTS = [
  'Absolutely delicious! Tasted just like my grandmother used to make.',
  "Best home-cooked meal I've had in years. Will definitely order again.",
  'Fresh ingredients, generous portions, and great packaging. Highly recommend!',
  'My whole family loved it. The flavors were out of this world.',
  'Worth every penny -- so much better than any restaurant version.',
  'Pickup was smooth and the food was still warm. Amazing quality.',
  'Authentic and incredibly flavorful. This is exactly what I was looking for.',
  "Wow. Just wow. I've already placed my next order.",
  'The packaging was thoughtful and everything tasted genuinely homemade.',
  'Exceeded my expectations. The care that went into this is so obvious.',
  "Huge portions and incredibly flavorful. My new go-to for meal prep.",
  "Five stars isn't enough. Came back the following week.",
  'Super easy pickup experience and the food was phenomenal.',
  "Ordered for a dinner party -- every single guest asked for the cook's contact.",
  "The spices were perfectly balanced. I've been craving this since I picked it up.",
];

const MESSAGE_PAIRS = [
  ["Hi! Just confirmed my order — so excited!", "Thanks! I'll have everything ready. See you at pickup! 🙌"],
  ["Quick question — can I add extra sauce?", "Absolutely! I'll throw in a couple extra containers for you."],
  ["Any parking near the pickup spot?", "Yes — street parking on the side street is usually easy. I'll text when it's ready!"],
  ["First time ordering, any tips?", "Bring a bag to carry! Everything is packaged separately to stay fresh. Enjoy 😊"],
  ["Can I pick up 30 mins early?", "Sure, I'll have it ready. Just ring the bell when you arrive!"],
];

// ─── Cook definitions ─────────────────────────────────────────────────────────
const COOK_SEEDS = [
  {
    email: 'cook3@homecooked.test',
    name: 'María Sánchez',
    location: 'Boyle Heights, LA',
    lat: 34.0340,
    lng: -118.2076,
    profile: {
      kitchenName: "María's Mexican Kitchen",
      description:
        'Authentic Mexico City street food and family recipes passed down three generations. Specializing in tamales, mole, and handmade tortillas.',
      cuisineTags: ['Mexican', 'Street Food', 'Catering'],
      isVerified: true,
      acceptsOrders: true,
      avgRating: 4.8,
      totalOrders: 0,
      pickupNeighborhood: 'Boyle Heights, LA',
      pickupLat: 34.0340,
      pickupLng: -118.2076,
      pickupAddress: '2134 E 4th St, Los Angeles, CA 90033',
      isDraft: false,
      cancellationPolicy: 'No refunds within 24 hours of pickup.',
    },
    dishes: [
      {
        title: 'Red Mole Chicken Tamales (1 dozen)',
        description: 'Hand-wrapped corn masa tamales filled with slow-cooked chicken in rich red mole sauce.',
        price: 28.00,
        imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
        category: 'Mexican', cuisineTag: 'Mexican', serviceType: 'PREPPED',
        deliveryOptions: ['PICKUP', 'DROP_OFF'], dietary: [],
        ingredients: ['masa', 'chicken', 'dried chili', 'tomato', 'corn husks'],
        allergens: ['gluten'], advanceNoticeHrs: 48, isAvailable: true,
      },
      {
        title: 'Chicken Mole Negro',
        description: 'Slow-cooked chicken in a complex 30-ingredient mole negro. Served with rice and warm tortillas.',
        price: 24.00,
        imageUrl: 'https://images.unsplash.com/photo-1624300629298-e9de39c13be5?w=800',
        category: 'Mexican', cuisineTag: 'Mexican', serviceType: 'PREPPED',
        deliveryOptions: ['PICKUP', 'DROP_OFF'], dietary: [],
        ingredients: ['chicken', 'dried chilis', 'dark chocolate', 'spices', 'tortillas', 'rice'],
        allergens: ['gluten', 'nuts'], advanceNoticeHrs: 48, isAvailable: true,
      },
      {
        title: 'Taco Party Pack (feeds 10)',
        description: 'Everything for a taco feast — carne asada, al pastor, fresh tortillas, and all the toppings.',
        price: 120.00,
        imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800',
        category: 'Mexican', cuisineTag: 'Mexican', serviceType: 'CATERING',
        deliveryOptions: ['PICKUP', 'DROP_OFF'], dietary: [],
        ingredients: ['beef', 'pork', 'tortillas', 'onion', 'cilantro', 'salsa'],
        allergens: ['gluten'], advanceNoticeHrs: 72, isAvailable: true,
      },
      {
        title: 'Churros with Chocolate Sauce',
        description: 'Crispy fried churros dusted with cinnamon sugar, served with rich dark chocolate dipping sauce.',
        price: 12.00,
        imageUrl: 'https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?w=800',
        category: 'Dessert', cuisineTag: 'Mexican', serviceType: 'PREPPED',
        deliveryOptions: ['PICKUP'], dietary: ['VEGETARIAN'],
        ingredients: ['flour', 'eggs', 'butter', 'cinnamon', 'sugar', 'dark chocolate'],
        allergens: ['gluten', 'dairy', 'eggs'], advanceNoticeHrs: 24, isAvailable: true,
      },
    ],
  },
  {
    email: 'cook4@homecooked.test',
    name: 'Kenji Tanaka',
    location: 'Japantown, SF',
    lat: 37.7850,
    lng: -122.4317,
    profile: {
      kitchenName: "Kenji's Bento & Ramen",
      description:
        'Tokyo-trained home cook bringing authentic Japanese comfort food to the Bay. From tonkotsu ramen to onigiri and handcrafted bento boxes.',
      cuisineTags: ['Japanese', 'Ramen', 'Bento', 'Meal Prep'],
      isVerified: true,
      acceptsOrders: true,
      avgRating: 4.9,
      totalOrders: 0,
      pickupNeighborhood: 'Japantown, SF',
      pickupLat: 37.7850,
      pickupLng: -122.4317,
      pickupAddress: '1737 Post St, San Francisco, CA 94115',
      isDraft: false,
      cancellationPolicy: 'Cancellations accepted up to 48 hours before pickup.',
    },
    dishes: [
      {
        title: 'Tonkotsu Ramen Kit (for 2)',
        description: 'Rich milky pork-bone broth simmered 12 hours. Comes with chashu pork, soft-boiled egg, nori, and fresh noodles.',
        price: 38.00,
        imageUrl: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800',
        category: 'Japanese', cuisineTag: 'Japanese', serviceType: 'PREPPED',
        deliveryOptions: ['PICKUP'], dietary: [],
        ingredients: ['pork bones', 'ramen noodles', 'chashu', 'soft egg', 'nori', 'scallions'],
        allergens: ['gluten', 'eggs', 'soy'], advanceNoticeHrs: 24, isAvailable: true,
      },
      {
        title: 'Deluxe Bento Box',
        description: 'Beautiful bento with teriyaki chicken, tamagoyaki, steamed rice, pickles, and seasonal sides.',
        price: 18.00,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
        category: 'Japanese', cuisineTag: 'Japanese', serviceType: 'PREPPED',
        deliveryOptions: ['PICKUP', 'DROP_OFF'], dietary: [],
        ingredients: ['chicken', 'rice', 'egg', 'pickles', 'edamame', 'soy sauce'],
        allergens: ['gluten', 'eggs', 'soy'], advanceNoticeHrs: 24, isAvailable: true,
      },
      {
        title: 'Mochi Ice Cream Assortment (6 pc)',
        description: 'Handmade mochi in six flavors: matcha, strawberry, black sesame, mango, red bean, and vanilla.',
        price: 22.00,
        imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800',
        category: 'Dessert', cuisineTag: 'Japanese', serviceType: 'PREPPED',
        deliveryOptions: ['PICKUP'], dietary: ['VEGETARIAN', 'GLUTEN_FREE'],
        ingredients: ['mochiko', 'ice cream', 'matcha', 'strawberry', 'red bean'],
        allergens: ['dairy'], advanceNoticeHrs: 48, isAvailable: true,
      },
      {
        title: 'Sushi Platter (30 pc)',
        description: 'Chef-assembled platter with nigiri and rolls — salmon, tuna, yellowtail, shrimp, and veggie options.',
        price: 85.00,
        imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
        category: 'Japanese', cuisineTag: 'Japanese', serviceType: 'CATERING',
        deliveryOptions: ['PICKUP'], dietary: [],
        ingredients: ['sushi rice', 'salmon', 'tuna', 'yellowtail', 'nori', 'avocado'],
        allergens: ['gluten', 'soy', 'fish'], advanceNoticeHrs: 48, isAvailable: true,
      },
    ],
  },
  {
    email: 'cook5@homecooked.test',
    name: 'Priya Sharma',
    location: 'Fremont, CA',
    lat: 37.5485,
    lng: -121.9886,
    profile: {
      kitchenName: "Priya's South Indian Kitchen",
      description:
        'Authentic South Indian cooking — dosas, curries, biryanis, and desserts made with freshly ground spices. Vegetarian and vegan options always available.',
      cuisineTags: ['Indian', 'South Indian', 'Vegetarian', 'Vegan'],
      isVerified: true,
      acceptsOrders: true,
      avgRating: 4.9,
      totalOrders: 0,
      pickupNeighborhood: 'Fremont, CA',
      pickupLat: 37.5485,
      pickupLng: -121.9886,
      pickupAddress: '39150 Fremont Blvd, Fremont, CA 94538',
      isDraft: false,
      cancellationPolicy: 'Please cancel at least 24 hours in advance.',
    },
    dishes: [
      {
        title: 'Masala Dosa with Chutneys',
        description: 'Crispy fermented rice crepe filled with spiced potato masala. Served with coconut chutney, tomato chutney, and sambar.',
        price: 14.00,
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800',
        category: 'Indian', cuisineTag: 'South Indian', serviceType: 'PREPPED',
        deliveryOptions: ['PICKUP'], dietary: ['VEGAN', 'GLUTEN_FREE'],
        ingredients: ['rice', 'lentils', 'potato', 'mustard seeds', 'curry leaves', 'coconut'],
        allergens: [], advanceNoticeHrs: 24, isAvailable: true,
      },
      {
        title: 'Chicken Biryani (serves 2)',
        description: 'Fragrant basmati rice layered with spiced chicken, caramelized onions, saffron, and fresh mint. A true celebration dish.',
        price: 26.00,
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03246963d51a?w=800',
        category: 'Indian', cuisineTag: 'Indian', serviceType: 'PREPPED',
        deliveryOptions: ['PICKUP', 'DROP_OFF'], dietary: ['HALAL'],
        ingredients: ['basmati rice', 'chicken', 'onion', 'saffron', 'ghee', 'spices'],
        allergens: ['dairy'], advanceNoticeHrs: 24, isAvailable: true,
      },
      {
        title: 'South Indian Thali (vegetarian)',
        description: 'A full thali — dal, sambar, two sabzis, rice, roti, pickle, papad, and kheer. One very generous serving.',
        price: 19.00,
        imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
        category: 'Indian', cuisineTag: 'South Indian', serviceType: 'PREPPED',
        deliveryOptions: ['PICKUP'], dietary: ['VEGETARIAN'],
        ingredients: ['rice', 'dal', 'vegetables', 'roti', 'yogurt', 'pickles'],
        allergens: ['gluten', 'dairy'], advanceNoticeHrs: 24, isAvailable: true,
      },
      {
        title: 'Gulab Jamun (12 pcs)',
        description: 'Soft milk-solid dumplings soaked in rose-cardamom sugar syrup. A beloved Indian dessert, best served warm.',
        price: 11.00,
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800',
        category: 'Dessert', cuisineTag: 'Indian', serviceType: 'PREPPED',
        deliveryOptions: ['PICKUP', 'DROP_OFF'], dietary: ['VEGETARIAN'],
        ingredients: ['milk powder', 'flour', 'sugar', 'rose water', 'cardamom'],
        allergens: ['gluten', 'dairy'], advanceNoticeHrs: 24, isAvailable: true,
      },
    ],
  },
];

// ─── Extra buyers ─────────────────────────────────────────────────────────────
const BUYER_SEEDS = [
  { email: 'buyer4@homecooked.test', name: 'Sarah Chen' },
  { email: 'buyer5@homecooked.test', name: 'Marcus Williams' },
  { email: 'buyer6@homecooked.test', name: 'Aisha Patel' },
  { email: 'buyer7@homecooked.test', name: 'Tom Nakamura' },
  { email: 'buyer8@homecooked.test', name: 'Gabriela Torres' },
  { email: 'buyer9@homecooked.test', name: 'David Kim' },
  { email: 'buyer10@homecooked.test', name: 'Emma Osei' },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const cookHash  = await bcrypt.hash('Cook1234!', 10);
  const buyerHash = await bcrypt.hash('Buyer1234!', 10);

  // ── 1. Extra buyers ────────────────────────────────────────────────────────
  const buyers = [];
  for (const b of BUYER_SEEDS) {
    const user = await db.user.upsert({
      where: { email: b.email },
      update: {},
      create: { ...b, passwordHash: buyerHash, role: Role.BUYER },
    });
    buyers.push(user);
    console.log('✅ Buyer:', user.email);
  }
  // Pull in original 3 buyers too
  for (let i = 1; i <= 3; i++) {
    const u = await db.user.findUnique({ where: { email: `buyer${i}@homecooked.test` } });
    if (u) buyers.push(u);
  }

  // ── 2. Cooks + dishes ─────────────────────────────────────────────────────
  const cookDishMap: { cook: any; dishes: any[] }[] = [];

  for (const seed of COOK_SEEDS) {
    const cook = await db.user.upsert({
      where: { email: seed.email },
      update: { location: seed.location, lat: seed.lat, lng: seed.lng },
      create: {
        email: seed.email,
        name: seed.name,
        passwordHash: cookHash,
        role: Role.COOK,
        location: seed.location,
        lat: seed.lat,
        lng: seed.lng,
        cookProfile: { create: seed.profile },
      },
    });
    await db.cookProfile.update({ where: { userId: cook.id }, data: seed.profile }).catch(() => {});
    console.log('✅ Cook:', cook.email);

    const dishes: any[] = [];
    for (const d of seed.dishes) {
      const existing = await db.dish.findFirst({ where: { cookId: cook.id, title: d.title } });
      if (existing) {
        console.log('  ⏭  Dish exists:', d.title);
        dishes.push(existing);
      } else {
        const created = await db.dish.create({ data: { ...d, cookId: cook.id } as any });
        console.log('  ✅ Dish:', d.title);
        dishes.push(created);
      }
    }
    cookDishMap.push({ cook, dishes });
  }

  // Also pull in original cook1 / cook2 and their dishes
  for (const email of ['cook1@homecooked.test', 'cook2@homecooked.test']) {
    const cook = await db.user.findUnique({ where: { email } });
    if (!cook) continue;
    await db.cookProfile.update({ where: { userId: cook.id }, data: { isDraft: false } }).catch(() => {});
    const dishes = await db.dish.findMany({ where: { cookId: cook.id } });
    if (dishes.length) cookDishMap.push({ cook, dishes });
  }

  // ── 3. Pickup slots ────────────────────────────────────────────────────────
  const SLOTS = [
    { label: 'Saturday morning',   dayOfWeek: 6, startTime: '10:00', endTime: '12:00', maxOrders: 6 },
    { label: 'Saturday afternoon', dayOfWeek: 6, startTime: '14:00', endTime: '16:00', maxOrders: 6 },
    { label: 'Sunday morning',     dayOfWeek: 0, startTime: '10:00', endTime: '12:00', maxOrders: 4 },
    { label: 'Wednesday evening',  dayOfWeek: 3, startTime: '18:00', endTime: '20:00', maxOrders: 4 },
  ];
  for (const { cook } of cookDishMap) {
    const existing = await db.pickupSlot.count({ where: { cookId: cook.id } });
    if (existing === 0) {
      for (const slot of SLOTS.slice(0, 2)) {
        await db.pickupSlot.create({ data: { cookId: cook.id, ...slot, isActive: true } });
      }
      console.log('✅ Pickup slots:', cook.name);
    }
  }

  // ── 4. Completed order history ─────────────────────────────────────────────
  let totalOrders = 0;

  for (const { cook, dishes } of cookDishMap) {
    const existingCompleted = await db.order.count({
      where: { cookId: cook.id, status: OrderStatus.COMPLETED },
    });
    if (existingCompleted >= 5) {
      console.log('⏭  Orders exist for:', cook.name);
    } else {
      const toCreate = randInt(10, 15);
      for (let i = 0; i < toCreate; i++) {
        const buyer   = pick(buyers);
        const dish    = pick(dishes);
        const qty     = randInt(1, 3);
        const daysBack = randInt(2, 75);
        const pickupAt = daysAgo(daysBack, 4);
        const createdAt = new Date(pickupAt);
        createdAt.setDate(createdAt.getDate() - randInt(1, 3));

        const order = await db.order.create({
          data: {
            buyerId:  buyer.id,
            cookId:   cook.id,
            dishId:   dish.id,
            quantity: qty,
            totalPrice: Math.round(dish.price * qty * 100) / 100,
            status:   OrderStatus.COMPLETED,
            pickupTime: pickupAt,
            confirmedPickupAddress: cook.location ?? '',
            createdAt,
            updatedAt: pickupAt,
          },
        });

        // ~85% chance of a review
        if (Math.random() > 0.15) {
          const rating  = Math.random() > 0.1 ? 5 : 4;
          await db.review.upsert({
            where: { orderId: order.id },
            update: {},
            create: {
              orderId:    order.id,
              reviewerId: buyer.id,
              cookId:     cook.id,
              dishId:     dish.id,
              rating,
              comment: pick(REVIEW_COMMENTS),
            },
          });
        }
        totalOrders++;
      }
      console.log(`✅ Completed orders seeded for: ${cook.name}`);
    }

    // ── 5. Active pipeline (PENDING → READY) ────────────────────────────────
    const existingActive = await db.order.count({
      where: { cookId: cook.id, status: { in: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY] } },
    });
    if (existingActive === 0) {
      const activeStatuses = [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.PENDING];
      for (const status of activeStatuses.slice(0, randInt(2, 3))) {
        const buyer   = pick(buyers);
        const dish    = pick(dishes);
        const qty     = randInt(1, 2);
        const pickupAt = daysFromNow(randInt(1, 6));

        const order = await db.order.create({
          data: {
            buyerId:   buyer.id,
            cookId:    cook.id,
            dishId:    dish.id,
            quantity:  qty,
            totalPrice: Math.round(dish.price * qty * 100) / 100,
            status,
            pickupTime: pickupAt,
            notes: Math.random() > 0.5 ? 'Please pack sauces separately.' : undefined,
            createdAt: daysAgo(1),
            updatedAt: new Date(),
          },
        });

        // Message thread
        const [buyerMsg, cookMsg] = pick(MESSAGE_PAIRS);
        await db.message.createMany({
          data: [
            { orderId: order.id, senderId: buyer.id, recipientId: cook.id, body: buyerMsg, readAt: new Date(), createdAt: daysAgo(1) },
            { orderId: order.id, senderId: cook.id,  recipientId: buyer.id, body: cookMsg,  readAt: new Date(), createdAt: daysAgo(1) },
          ],
        });
        totalOrders++;
      }
    }
  }

  // ── 6. Recompute ratings & order counts ───────────────────────────────────
  console.log('\n📊 Recomputing cook stats...');
  for (const { cook } of cookDishMap) {
    const orderCount = await db.order.count({ where: { cookId: cook.id } });
    const reviews    = await db.review.findMany({ where: { cookId: cook.id }, select: { rating: true } });
    const avgRating  = reviews.length
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : null;
    await db.cookProfile.update({
      where: { userId: cook.id },
      data: { totalOrders: orderCount, ...(avgRating != null ? { avgRating } : {}) },
    }).catch(() => {});
    console.log(`  ${cook.name}: ${orderCount} orders, ${avgRating ?? '–'} ★`);
  }

  console.log(`\n✅ Demo seed complete — ${totalOrders} new orders created.`);
  console.log('\nLogin credentials:');
  console.log('  Buyers:  buyer1–buyer10@homecooked.test  /  Buyer1234!');
  console.log('  Cook 1 (Italian):        cook1@homecooked.test  /  Cook1234!');
  console.log('  Cook 2 (Healthy/Halal):  cook2@homecooked.test  /  Cook1234!');
  console.log('  Cook 3 (Mexican/LA):     cook3@homecooked.test  /  Cook1234!');
  console.log('  Cook 4 (Japanese/SF):    cook4@homecooked.test  /  Cook1234!');
  console.log('  Cook 5 (South Indian):   cook5@homecooked.test  /  Cook1234!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
