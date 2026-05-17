const prisma = require('./src/prisma/client');
async function main() {
  const user = await prisma.user.findUnique({ 
    where: { email: 'customer@test.com' },
    include: { client_profile: true }
  });
  console.log(JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
    has_client_profile: !!user.client_profile,
    client_profile: user.client_profile,
    password_hash_prefix: user.password_hash.substring(0, 10)
  }, null, 2));
}
main().catch(console.error);
