const prisma = require('./src/prisma/client');

async function test() {
  try {
    const parts = await prisma.part.findMany({
      where: {
        OR: [
          { seller_id: 'fake-id' },
          { is_active: true, is_verified: true },
        ],
      },
      include: {
        category: true,
        compatibilities: {
          include: {
            brand: { select: { id: true, name: true, logo_url: true } },
            model: {
              select: { id: true, name: true, year_start: true, year_end: true },
            },
          },
        },
      },
    });
    console.log('Success:', parts.length);
  } catch (err) {
    console.error('Prisma Error:', err);
  }
}

test();
