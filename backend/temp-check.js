const prisma = require('./src/prisma/client');

async function run() {
  const stores = await prisma.storeProfile.findMany({ select: { documents: true, images: true } });
  console.log('Stores:', JSON.stringify(stores, null, 2));
  
  const pros = await prisma.professionalProfile.findMany({ select: { documents: true } });
  console.log('Pros:', JSON.stringify(pros, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
