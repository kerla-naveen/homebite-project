const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@homebite.com' },
    update: {},
    create: {
      name: 'HomeBite Admin',
      email: 'admin@homebite.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isEmailVerified: true,
    },
  });
  console.log('Admin created:', admin.email);

  // Create categories
  const categories = [
    { name: 'Tiffin & Lunch Box', slug: 'tiffin-lunch-box', sortOrder: 1 },
    { name: 'Biryani & Rice', slug: 'biryani-rice', sortOrder: 2 },
    { name: 'Snacks & Starters', slug: 'snacks-starters', sortOrder: 3 },
    { name: 'Sweets & Desserts', slug: 'sweets-desserts', sortOrder: 4 },
    { name: 'Rotis & Parathas', slug: 'rotis-parathas', sortOrder: 5 },
    { name: 'Beverages', slug: 'beverages', sortOrder: 6 },
    { name: 'Pickles & Chutneys', slug: 'pickles-chutneys', sortOrder: 7 },
    { name: 'Cakes & Bakes', slug: 'cakes-bakes', sortOrder: 8 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`${categories.length} categories seeded`);

  // Create a test customer
  const customerPassword = await bcrypt.hash('Customer@123', 10);
  await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      name: 'Test Customer',
      email: 'customer@test.com',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
    },
  });

  // Create a test vendor user
  const vendorPassword = await bcrypt.hash('Vendor@123', 10);
  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@test.com' },
    update: {},
    create: {
      name: 'Priya Sharma',
      email: 'vendor@test.com',
      passwordHash: vendorPassword,
      role: 'VENDOR',
    },
  });

  // Onboard and approve vendor
  const category = await prisma.category.findFirst({ where: { slug: 'tiffin-lunch-box' } });
  const vendor = await prisma.vendor.upsert({
    where: { userId: vendorUser.id },
    update: {},
    create: {
      userId: vendorUser.id,
      businessName: "Priya's Home Kitchen",
      description: 'Authentic home-cooked meals made with love. Daily tiffin service available.',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
      status: 'APPROVED',
      isAcceptingOrders: true,
      approvedAt: new Date(),
    },
  });

  // Add food items
  if (category) {
    const items = [
      { name: 'Veg Tiffin Box', description: '2 Rotis, 1 Sabzi, Dal, Rice, Pickle', price: 80, dietaryTag: 'VEG' },
      { name: 'Chicken Biryani', description: 'Hyderabadi style dum biryani with raita', price: 150, dietaryTag: 'NON_VEG' },
      { name: 'Paneer Butter Masala + 3 Rotis', description: 'Rich creamy paneer curry', price: 120, dietaryTag: 'VEG' },
    ];

    for (const item of items) {
      await prisma.foodItem.create({
        data: {
          vendorId: vendor.id,
          categoryId: category.id,
          name: item.name,
          description: item.description,
          price: item.price,
          dietaryTag: item.dietaryTag,
          isAvailable: true,
        },
      }).catch(() => {}); // Ignore duplicates
    }
  }

  console.log('Seed complete!');
  console.log('\nTest credentials:');
  console.log('  Admin:    admin@homebite.com / Admin@123');
  console.log('  Customer: customer@test.com  / Customer@123');
  console.log('  Vendor:   vendor@test.com    / Vendor@123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
