import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  const saltRounds = 10;

  // ── Admin ──────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin1234!', saltRounds);
  const admin = await db.user.upsert({
    where: { email: 'admin@homecooked.test' },
    update: {},
    create: { email: 'admin@homecooked.test', name: 'Admin User', passwordHash: adminHash, role: Role.ADMIN },
  });
  console.log('✅ Admin:', admin.email);

  // ── Buyers ─────────────────────────────────────────────────────────────────
  const buyerHash = await bcrypt.hash('Buyer1234!', saltRounds);
  for (let i = 1; i <= 3; i++) {
    const buyer = await db.user.upsert({
      where: { email: `buyer${i}@homecooked.test` },
      update: {},
      create: { email: `buyer${i}@homecooked.test`, name: `Buyer ${i}`, passwordHash: buyerHash, role: Role.BUYER },
    });
    console.log(`✅ Buyer: ${buyer.email}`);
  }

  // ── Cooks ──────────────────────────────────────────────────────────────────
  const cookHash = await bcrypt.hash('Cook1234!', saltRounds);

  const cook1 = await db.user.upsert({
    where: { email: 'cook1@homecooked.test' },
    update: {
      location: 'Mission District, SF',
      lat: 37.7599,
      lng: -122.4148,
    },
    create: {
      email: 'cook1@homecooked.test',
      name: 'Isabella Romano',
      passwordHash: cookHash,
      role: Role.COOK,
      location: 'Mission District, SF',
      lat: 37.7599,
      lng: -122.4148,
      cookProfile: {
        create: {
          kitchenName: "Nonna Isabella's Kitchen",
          description: 'Generations of family recipes from Southern Italy. Every dish is made with love and the freshest ingredients sourced from local markets.',
          cuisineTags: ['Italian', 'Dessert', 'Catering'],
          isVerified: true,
          acceptsOrders: true,
          avgRating: 4.9,
          totalOrders: 142,
          pickupNeighborhood: 'Mission District, SF',
          pickupLat: 37.7599,
          pickupLng: -122.4148,
        },
      },
    },
  });
  await db.cookProfile.update({
    where: { userId: cook1.id },
    data: {
      pickupNeighborhood: 'Mission District, SF',
      pickupLat: 37.7599,
      pickupLng: -122.4148,
      pickupAddress: '826 Valencia St, San Francisco, CA 94110',
    },
  }).catch(() => {}); // ignore if profile doesn't exist yet
  console.log('✅ Cook 1:', cook1.email);

  const cook2 = await db.user.upsert({
    where: { email: 'cook2@homecooked.test' },
    update: {
      location: 'Temescal, Oakland',
      lat: 37.8322,
      lng: -122.2669,
    },
    create: {
      email: 'cook2@homecooked.test',
      name: 'Jordan Kim',
      passwordHash: cookHash,
      role: Role.COOK,
      location: 'Temescal, Oakland',
      lat: 37.8322,
      lng: -122.2669,
      cookProfile: {
        create: {
          kitchenName: "Jordan's Healthy Kitchen",
          description: 'Healthy, hearty, and wholesome meals. Specializing in plant-based, gluten-free, and halal-certified dishes for every diet.',
          cuisineTags: ['Healthy', 'Vegan', 'Halal', 'Meal Prep'],
          isVerified: true,
          acceptsOrders: true,
          avgRating: 4.7,
          totalOrders: 89,
          pickupNeighborhood: 'Temescal, Oakland',
          pickupLat: 37.8322,
          pickupLng: -122.2669,
        },
      },
    },
  });
  await db.cookProfile.update({
    where: { userId: cook2.id },
    data: {
      pickupNeighborhood: 'Temescal, Oakland',
      pickupLat: 37.8322,
      pickupLng: -122.2669,
      pickupAddress: '4238 Telegraph Ave, Oakland, CA 94609',
    },
  }).catch(() => {});
  console.log('✅ Cook 2:', cook2.email);

  // ── Applicant ──────────────────────────────────────────────────────────────
  const applicantHash = await bcrypt.hash('Applicant1234!', saltRounds);
  const applicant = await db.user.upsert({
    where: { email: 'applicant@homecooked.test' },
    update: {},
    create: { email: 'applicant@homecooked.test', name: 'Kitchen Applicant', passwordHash: applicantHash, role: Role.BUYER },
  });
  const existingApp = await db.kitchenApplication.findUnique({ where: { userId: applicant.id } });
  if (!existingApp) {
    await db.kitchenApplication.create({
      data: { userId: applicant.id, kitchenName: "Applicant's Kitchen", description: 'I love cooking homemade food', cuisineTags: ['Mexican', 'Vegan'], status: 'PENDING' },
    });
  }
  console.log('✅ Applicant:', applicant.email);

  // ── Dishes ─────────────────────────────────────────────────────────────────
  const dishSeeds = [
    // Cook 1 — Nonna Isabella's Kitchen (Italian)
    {
      cookId: cook1.id,
      title: "Nonna's Famous Meatballs",
      description: 'Generations-old recipe for the most tender and flavorful meatballs, simmered in a slow-cooked tomato sauce. Served with fresh bread.',
      price: 22.00,
      imageUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800',
      category: 'Italian',
      cuisineTag: 'Italian',
      serviceType: 'PREPPED' as const,
      deliveryOptions: ['PICKUP', 'DROP_OFF'] as any[],
      dietary: [] as any[],
      ingredients: ['ground beef', 'pork', 'breadcrumbs', 'parmesan', 'tomato', 'basil'],
      allergens: ['gluten', 'dairy', 'eggs'],
      advanceNoticeHrs: 24,
      isAvailable: true,
    },
    {
      cookId: cook1.id,
      title: 'Tiramisu Classico',
      description: 'Espresso-soaked ladyfingers layered with whipped mascarpone and dusted with cocoa. A true Italian classic.',
      price: 9.50,
      imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800',
      category: 'Dessert',
      cuisineTag: 'Italian',
      serviceType: 'PREPPED' as const,
      deliveryOptions: ['PICKUP'] as any[],
      dietary: ['VEGETARIAN'] as any[],
      ingredients: ['mascarpone', 'ladyfingers', 'espresso', 'eggs', 'sugar', 'cocoa'],
      allergens: ['gluten', 'dairy', 'eggs'],
      advanceNoticeHrs: 24,
      isAvailable: true,
    },
    {
      cookId: cook1.id,
      title: 'Artisanal Charcuterie Board',
      description: 'A beautifully arranged platter of assorted cheeses, cured meats, olives, fruits, and nuts. Perfect for gatherings — feeds 6–8.',
      price: 95.00,
      imageUrl: 'https://images.unsplash.com/photo-1598114353383-a61625935706?w=800',
      category: 'Appetizer',
      cuisineTag: 'Italian',
      serviceType: 'CATERING' as const,
      deliveryOptions: ['PICKUP', 'DROP_OFF'] as any[],
      dietary: [] as any[],
      ingredients: ['prosciutto', 'salami', 'brie', 'cheddar', 'olives', 'grapes', 'walnuts'],
      allergens: ['dairy', 'nuts'],
      advanceNoticeHrs: 48,
      isAvailable: true,
    },
    {
      cookId: cook1.id,
      title: 'Homemade Lasagna (Feeds 4)',
      description: 'Rich beef and ricotta lasagna with hand-rolled pasta sheets and slow-simmered bolognese. Reheats beautifully.',
      price: 45.00,
      imageUrl: 'https://images.unsplash.com/photo-1619895092538-128341789043?w=800',
      category: 'Italian',
      cuisineTag: 'Italian',
      serviceType: 'PREPPED' as const,
      deliveryOptions: ['PICKUP', 'DROP_OFF'] as any[],
      dietary: [] as any[],
      ingredients: ['pasta', 'beef', 'ricotta', 'mozzarella', 'tomato', 'onion', 'garlic'],
      allergens: ['gluten', 'dairy', 'eggs'],
      advanceNoticeHrs: 48,
      isAvailable: true,
    },
    // Cook 2 — Jordan's Healthy Kitchen
    {
      cookId: cook2.id,
      title: "Vegan Lentil Shepherd's Pie",
      description: 'A hearty lentil and veggie stew topped with fluffy golden mashed sweet potatoes. Completely plant-based comfort food.',
      price: 16.00,
      imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800',
      category: 'Vegan',
      cuisineTag: 'Healthy',
      serviceType: 'PREPPED' as const,
      deliveryOptions: ['PICKUP'] as any[],
      dietary: ['VEGAN', 'GLUTEN_FREE'] as any[],
      ingredients: ['lentils', 'sweet potato', 'carrots', 'onion', 'peas', 'thyme'],
      allergens: [],
      advanceNoticeHrs: 24,
      isAvailable: true,
    },
    {
      cookId: cook2.id,
      title: 'Fresh Garden Quinoa Salad',
      description: 'Vibrant quinoa with cucumber, cherry tomatoes, bell peppers, chickpeas, and a zesty lemon-herb vinaigrette.',
      price: 14.50,
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
      category: 'Salad',
      cuisineTag: 'Healthy',
      serviceType: 'PREPPED' as const,
      deliveryOptions: ['PICKUP', 'DROP_OFF'] as any[],
      dietary: ['VEGAN', 'GLUTEN_FREE'] as any[],
      ingredients: ['quinoa', 'cucumber', 'tomato', 'bell pepper', 'chickpeas', 'lemon', 'herbs'],
      allergens: [],
      advanceNoticeHrs: 12,
      isAvailable: true,
    },
    {
      cookId: cook2.id,
      title: 'Halal Chicken & Rice Bowl',
      description: 'Tender halal-certified chicken thighs over fragrant basmati rice with garlic sauce and pickled vegetables.',
      price: 20.00,
      imageUrl: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800',
      category: 'Halal',
      cuisineTag: 'Middle Eastern',
      serviceType: 'PREPPED' as const,
      deliveryOptions: ['DROP_OFF'] as any[],
      dietary: ['HALAL'] as any[],
      ingredients: ['chicken', 'basmati rice', 'garlic', 'yogurt', 'pickled turnip', 'parsley'],
      allergens: ['dairy'],
      advanceNoticeHrs: 24,
      isAvailable: true,
    },
    {
      cookId: cook2.id,
      title: 'Weekly Meal Prep Pack (5 Days)',
      description: '5 balanced meals for the week: protein, complex carbs, and veggies. Vegan options available on request.',
      price: 75.00,
      imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
      category: 'Meal Prep',
      cuisineTag: 'Healthy',
      serviceType: 'PREPPED' as const,
      deliveryOptions: ['PICKUP', 'DROP_OFF'] as any[],
      dietary: ['GLUTEN_FREE'] as any[],
      ingredients: ['chicken', 'brown rice', 'broccoli', 'sweet potato', 'eggs', 'oats'],
      allergens: ['eggs'],
      advanceNoticeHrs: 48,
      isAvailable: true,
    },
  ];

  for (const dish of dishSeeds) {
    const existing = await db.dish.findFirst({ where: { cookId: dish.cookId, title: dish.title } });
    if (!existing) {
      await db.dish.create({ data: dish });
      console.log(`✅ Dish: ${dish.title}`);
    } else {
      console.log(`⏭  Exists: ${dish.title}`);
    }
  }

  console.log('\n✅ Seed complete!');
  console.log('Cook 1 (cook1@homecooked.test / Cook1234!) — Nonna Isabella\'s Kitchen — 4 Italian dishes');
  console.log('Cook 2 (cook2@homecooked.test / Cook1234!) — Jordan\'s Healthy Kitchen — 4 Healthy/Halal dishes');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
