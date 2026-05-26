import { useEffect, useMemo, useState } from "react";
import { RiLoader4Line, RiStarFill, RiStarLine } from "react-icons/ri";
import useAuthStore from "../../store/authStore";
import { getReviews } from "../../services/reviewService";
import { getImageUrl } from "../../utils/imageUtils";

const renderStars = (rating) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) =>
      star <= rating ? (
        <RiStarFill key={star} className="text-[#f59e0b]" />
      ) : (
        <RiStarLine key={star} className="text-[#cbd5e1]" />
      ),
    )}
  </div>
);

export default function ReviewsPro() {
  const { user } = useAuthStore();
  const profile = user?.store_profile;
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getReviews({
          target_id: profile.id,
          target_type: "store",
          limit: 10,
        });
        setReviews(data.reviews || []);
      } catch (err) {
        setError("Impossible de charger les avis.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [profile?.id]);

  const stats = useMemo(() => {
    const counts = [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count: reviews.filter((review) => review.rating === rating).length,
    }));

    return {
      average: Number(profile?.rating_avg || 0),
      total: profile?.rating_count || reviews.length,
      counts,
    };
  }, [profile?.rating_avg, profile?.rating_count, reviews]);

  return (
    <div className="px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1f1f1f]">
          Avis et notes
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          Consultez les notes et commentaires des clients.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#e9effd] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-[#6b7280]">Note moyenne</p>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-4xl font-bold text-[#1f1f1f]">
              {stats.average.toFixed(1)}
            </span>
            <span className="pb-1 text-sm text-[#6b7280]">/ 5</span>
          </div>
          <div className="mt-3">{renderStars(Math.round(stats.average))}</div>
        </div>

        <div className="rounded-2xl border border-[#e9effd] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-[#6b7280]">Total des avis</p>
          <p className="mt-3 text-4xl font-bold text-[#1f1f1f]">
            {stats.total}
          </p>
          <p className="mt-2 text-sm text-[#9ca3af]">avis verifies visibles</p>
        </div>

        <div className="rounded-2xl border border-[#e9effd] bg-white p-6 shadow-sm lg:col-span-2">
          <p className="mb-3 text-sm font-semibold text-[#6b7280]">
            Repartition
          </p>
          <div className="space-y-2">
            {[...stats.counts].reverse().map((row) => {
              const width = reviews.length
                ? `${(row.count / reviews.length) * 100}%`
                : "0%";
              return (
                <div key={row.rating} className="flex items-center gap-3">
                  <span className="w-10 text-xs font-semibold text-[#6b7280]">
                    {row.rating} etoiles
                  </span>
                  <div className="h-2 flex-1 rounded-full bg-[#e9effd]">
                    <div
                      className="h-full rounded-full bg-[#f59e0b]"
                      style={{ width }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs text-[#6b7280]">
                    {row.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-[#e9effd] bg-white shadow-sm">
        <div className="border-b border-[#e9effd] px-6 py-4">
          <h2 className="text-base font-bold text-[#1f1f1f]">
            Commentaires clients
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RiLoader4Line className="animate-spin text-2xl text-[#2563eb]" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-[#9ca3af]">
            Aucun avis pour le moment.
          </p>
        ) : (
          <div className="divide-y divide-[#e9effd]">
            {reviews.map((review) => {
              const author = review.author?.client_profile;
              const name = author?.full_name || "Client";
              const avatar = getImageUrl(author?.avatar_url || author?.profilePicUrl || review.author?.avatar_url || review.author?.profile_picture);
              return (
                <div key={review.id} className="px-6 py-5">
                  <div className="flex items-start gap-4">
                    {avatar ? (
                      <img src={avatar} alt={name} className="h-11 w-11 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2563eb]/10 font-bold text-[#2563eb]">
                        {name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[#1f1f1f]">{name}</p>
                          <p className="text-xs text-[#9ca3af]">
                            {new Date(review.created_at).toLocaleDateString(
                              "fr-FR",
                            )}
                          </p>
                        </div>
                        {renderStars(review.rating)}
                      </div>
                      <p className="mt-3 rounded-xl bg-[#f8fafc] p-4 text-sm leading-relaxed text-[#4b5563]">
                        {review.comment || "Aucun commentaire."}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
