const cron = require("node-cron");
const prisma = require("../prisma/client");

const initCronJobs = () => {
  console.log("Initializing cron jobs...");

  // Run every day at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("[CRON] Running daily subscription expiration check...");
    try {
      const now = new Date();
      
      // Find all active subscriptions that have expired
      const expiredSubscriptions = await prisma.subscription.findMany({
        where: {
          status: "active",
          expires_at: {
            lt: now,
          },
        },
      });

      if (expiredSubscriptions.length === 0) {
        console.log("[CRON] No expired subscriptions found today.");
        return;
      }

      console.log(`[CRON] Found ${expiredSubscriptions.length} expired subscriptions. Processing...`);

      for (const sub of expiredSubscriptions) {
        await prisma.$transaction(async (tx) => {
          // Update subscription status
          await tx.subscription.update({
            where: { id: sub.id },
            data: { status: "expired" },
          });

          // Freeze profile
          if (sub.subscriber_type === "store") {
            await tx.storeProfile.update({
              where: { id: sub.subscriber_id },
              data: { is_frozen: true },
            });
          } else if (sub.subscriber_type === "professional") {
            await tx.professionalProfile.update({
              where: { id: sub.subscriber_id },
              data: { is_frozen: true },
            });
          }

          // Optional: Create notification for user
          // First find the user_id for the profile
          let userId = null;
          if (sub.subscriber_type === "store") {
            const store = await tx.storeProfile.findUnique({ where: { id: sub.subscriber_id } });
            userId = store?.user_id;
          } else if (sub.subscriber_type === "professional") {
            const pro = await tx.professionalProfile.findUnique({ where: { id: sub.subscriber_id } });
            userId = pro?.user_id;
          }

          if (userId) {
            await tx.notification.create({
              data: {
                user_id: userId,
                title: "Abonnement Expiré",
                content: "Votre abonnement a expiré. Votre profil est désormais masqué. Veuillez renouveler votre abonnement pour continuer à utiliser la plateforme.",
                type: "subscription_expired",
              },
            });
          }
        });
      }

      console.log("[CRON] Successfully processed expired subscriptions.");
    } catch (error) {
      console.error("[CRON] Error running subscription expiration check:", error);
    }
  });
};

module.exports = { initCronJobs };
