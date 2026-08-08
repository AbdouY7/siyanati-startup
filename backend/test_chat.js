const prisma = require('./src/prisma/client');
async function test() {
  try {
    const user = await prisma.user.findFirst();
    const otherUser = await prisma.user.findFirst({ where: { id: { not: user.id } }});
    console.log("User 1:", user.id);
    console.log("User 2:", otherUser.id);
    
    // Test getOrCreate
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { participant_one_id: user.id, participant_two_id: otherUser.id },
          { participant_one_id: otherUser.id, participant_two_id: user.id }
        ]
      }
    });
    console.log("Existing conv:", conversation ? conversation.id : null);
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participant_one_id: user.id,
          participant_two_id: otherUser.id
        }
      });
      console.log("Created conv:", conversation.id);
    }
    
    console.log("Fetching full conversation...");
    const fullConversation = await prisma.conversation.findUnique({
      where: { id: conversation.id },
      include: {
        participant_one: { select: { id: true, email: true, role: true, professional_profile: { select: { full_name: true, avatar_url: true } }, client_profile: { select: { full_name: true, avatar_url: true } }, store_profile: { select: { store_name: true, logo_url: true } } } },
        participant_two: { select: { id: true, email: true, role: true, professional_profile: { select: { full_name: true, avatar_url: true } }, client_profile: { select: { full_name: true, avatar_url: true } }, store_profile: { select: { store_name: true, logo_url: true } } } },
        messages: { orderBy: { created_at: "desc" }, take: 1 }
      }
    });
    console.log("Success! Full conv:", fullConversation.id);
  } catch (err) {
    console.error("Prisma error:", err);
  } finally {
    prisma.$disconnect();
  }
}
test();
