const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
async function main() { 
  console.log("Stores:", await prisma.storeProfile.findMany({ select: { id: true, user_id: true, status: true, is_frozen: true } })); 
  console.log("ProfessionalStores:", await prisma.professionalStore.findMany({ select: { id: true, status: true } })); 
} 
main().then(()=>prisma.$disconnect());
