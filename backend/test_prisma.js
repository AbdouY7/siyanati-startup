const prisma = require('./src/prisma/client');

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, phone: true } });
  console.log(JSON.stringify(users, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
