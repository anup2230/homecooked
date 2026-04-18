// Plain JS seed - no TypeScript compilation needed
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const db = new PrismaClient();

async function main() {
  const saltRounds = 10;
  const results = { created: 0, skipped: 0 };

  // 1 ADMIN user
  const adminHash = await bcrypt.hash('Admin1234!', saltRounds);
  const admin = await db.user.upsert({
    where: { email: 'admin@homecooked.test' },
    update: {},
    create: {
      email: 'admin@homecooked.test',
      name: 'Admin User',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin:', admin.email, '(id:', admin.id + ')');
  results.created++;

  // 3 BUYER users
  const buyerHash = await bcrypt.hash('Buyer1234!', saltRounds);
  for (let i = 1; i <= 3; i++) {
    const buyer = await db.user.upsert({
      where: { email: `buyer${i}@homecooked.test` },
      update: {},
      create: {
        email: `buyer${i}@homecooked.test`,
        name: `Buyer ${i}`,
        passwordHash: buyerHash,
        role: 'BUYER',
      },
    });
    console.log(`✅ Buyer ${i}:`, buyer.email);
    results.created++;
  }

  // 2 COOK users with CookProfiles
  const cookHash = await bcrypt.hash('Cook1234!', saltRounds);
  for (let i = 1; i <= 2; i++) {
    const cook = await db.user.upsert({
      where: { email: `cook${i}@homecooked.test` },
      update: {},
      create: {
        email: `cook${i}@homecooked.test`,
        name: `Cook ${i}`,
        passwordHash: cookHash,
        role: 'COOK',
        cookProfile: {
          create: {
            kitchenName: `Cook ${i}'s Kitchen`,
            description: `Homemade dishes from Cook ${i}`,
            cuisineTags: ['Italian', 'American'],
            isVerified: true,
            acceptsOrders: true,
          },
        },
      },
      include: { cookProfile: true },
    });
    console.log(`✅ Cook ${i}:`, cook.email, '| Profile:', cook.cookProfile ? cook.cookProfile.kitchenName : 'none');
    results.created++;
  }

  // 1 applicant user with KitchenApplication (PENDING)
  const applicantHash = await bcrypt.hash('Applicant1234!', saltRounds);
  const applicant = await db.user.upsert({
    where: { email: 'applicant@homecooked.test' },
    update: {},
    create: {
      email: 'applicant@homecooked.test',
      name: 'Kitchen Applicant',
      passwordHash: applicantHash,
      role: 'BUYER',
    },
  });
  console.log('✅ Applicant:', applicant.email);
  results.created++;

  // KitchenApplication for applicant
  const existingApp = await db.kitchenApplication.findUnique({
    where: { userId: applicant.id },
  });
  if (!existingApp) {
    const app = await db.kitchenApplication.create({
      data: {
        userId: applicant.id,
        kitchenName: "Applicant's Kitchen",
        description: 'I love cooking homemade food',
        cuisineTags: ['Mexican', 'Vegan'],
        status: 'PENDING',
      },
    });
    console.log('✅ KitchenApplication created:', app.id);
    results.created++;
  } else {
    console.log('✅ KitchenApplication already exists:', existingApp.id, '(status:', existingApp.status + ')');
  }

  console.log('\n📊 Seed Summary:');
  console.log('  Users: 1 admin + 3 buyers + 2 cooks + 1 applicant = 7');
  console.log('  CookProfiles: 2');
  console.log('  KitchenApplications: 1 (PENDING)');
  console.log('\n✅ Seed complete!');

  // Print all user IDs for curl tests
  const allUsers = await db.user.findMany({
    where: {
      email: {
        in: [
          'admin@homecooked.test',
          'buyer1@homecooked.test',
          'buyer2@homecooked.test',
          'buyer3@homecooked.test',
          'cook1@homecooked.test',
          'cook2@homecooked.test',
          'applicant@homecooked.test',
        ]
      }
    },
    select: { id: true, email: true, role: true }
  });
  console.log('\n📋 User IDs:');
  allUsers.forEach(u => console.log(`  ${u.role.padEnd(5)} ${u.id} ${u.email}`));

  // Print application ID
  const app = await db.kitchenApplication.findUnique({ where: { userId: applicant.id } });
  if (app) {
    console.log('\n📋 Application ID:', app.id);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
