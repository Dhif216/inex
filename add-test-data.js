import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addTestData() {
  console.log('Adding test pickup data...\n');

  const today = new Date();
  today.setHours(10, 0, 0, 0);

  const pickups = [
    {
      referenceNumber: 'REF-001',
      company: 'Acme Corporation',
      scheduledDate: today,
      goodsDescription: 'Steel pipes - 100 units',
      status: 'PENDING',
    },
    {
      referenceNumber: 'REF-002',
      company: 'Global Logistics Ltd',
      scheduledDate: today,
      goodsDescription: 'Electronic components',
      status: 'PENDING',
    },
    {
      referenceNumber: 'REF-003',
      company: 'Nordic Transport AS',
      scheduledDate: today,
      goodsDescription: 'Wooden pallets - 50 pcs',
      status: 'RESERVED',
      truckPlate: 'ABC-123',
      driverName: 'John Driver',
    },
    {
      referenceNumber: 'REF-004',
      company: 'Baltic Shipping Co',
      scheduledDate: today,
      goodsDescription: 'Machinery parts',
      status: 'PENDING',
    },
  ];

  for (const pickup of pickups) {
    try {
      const created = await prisma.pickup.create({
        data: pickup,
      });
      console.log(`✓ Created pickup: ${created.referenceNumber} - ${created.company}`);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`  Already exists: ${pickup.referenceNumber}`);
      } else {
        console.error(`✗ Error creating ${pickup.referenceNumber}:`, error.message);
      }
    }
  }

  console.log('\n✅ Test data added successfully!\n');
  console.log('You can now test:');
  console.log('1. Driver Portal: http://localhost:3000/');
  console.log('   - Try reserving REF-001 or REF-002');
  console.log('   - Use any truck plate (e.g., XYZ-789)');
  console.log('\n2. Admin Dashboard: http://localhost:3000/admin');
  console.log('   - View today\'s pickups');
  console.log('   - Confirm loading for REF-003');
  console.log('   - Generate PDF');

  await prisma.$disconnect();
}

addTestData().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
