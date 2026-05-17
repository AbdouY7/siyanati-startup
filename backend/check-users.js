const prisma = require('./src/prisma/client');
async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true }, take: 5 });
  console.log(JSON.stringify(users, null, 2));
  await prisma.$disconnect();
}
main().catch(console.error);
