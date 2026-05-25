import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toggleSavePost } from "../../services/diagnosticService";
import {
  FiHeart,
  FiMessageCircle,
  FiSend,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { FaHeart, FaCar } from "react-icons/fa";
import { HiLocationMarker } from "react-icons/hi";
import { MdAccessTime } from "react-icons/md";
// Auth imports
import useAuthStore from "../../store/authStore";
import AuthRequiredModal from "../modals/AuthRequiredModal";

// ─── Image mini-carousel ───────────────────────────────────────────────────────
function PostImages({ images }) {
  const [idx, setIdx] = useState(0);
  if (!images?.length) return null;

  return (
    <div className="relative w-full h-[180px] bg-slate-100 rounded-xl overflow-hidden mb-3">
      <img
        src={images[idx]}
        alt="car"
        className="w-full h-full object-cover transition-opacity duration-300"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIdx((i) => (i - 1 + images.length) % images.length);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors">
            <FiChevronLeft size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIdx((i) => (i + 1) % images.length);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors">
            <FiChevronRight size={14} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all duration-200 ${i === idx ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Single comment ────────────────────────────────────────────────────────────
function Comment({ avatar, name, text, time }) {
  return (
    <div className="flex gap-2.5 py-2.5 border-b border-gray-50 last:border-0">
      <img
        src={avatar}
        alt={name}
        className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-[12px] font-semibold text-gray-800">
            {name}
          </span>
          <span className="text-[10px] text-gray-400">{time}</span>
        </div>
        <p className="text-[12px] text-gray-600 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

// ─── DiagnosticPostCard ────────────────────────────────────────────────────────
/**
 * Props: post (object from diagnosticPosts array)
 * post shape: { id, posted_at, user, title, car, car_images, tags, description }
 */
export default function DiagnosticPostCard({ post }) {
  const { user } = useAuthStore();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.saves_count || 0);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const handleLike = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    try {
      await toggleSavePost(post.id);
    } catch {
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    }
  };

  const toggleComments = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    navigate(`/diagnostic/${post.id}`);
  };

  const shortDesc =
    post.description.length > 120 && !expanded
      ? post.description.slice(0, 120) + "…"
      : post.description;

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.11)] transition-shadow duration-300 overflow-hidden flex flex-col">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <img
          src={post.user.profile_picture}
          alt={post.user.full_name}
          className="w-10 h-10 rounded-full object-cover border-2 border-blue-100 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-gray-900 truncate">
            {post.user.full_name}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <span className="flex items-center gap-0.5">
              <HiLocationMarker size={11} className="text-blue-400" />
              {post.user.wilaya}
            </span>
            <span>·</span>
            <span className="flex items-center gap-0.5">
              <MdAccessTime size={11} />
              {post.posted_at}
            </span>
          </div>
        </div>
        {/* Car badge */}
        <div className="shrink-0 flex items-center gap-1.5 bg-blue-50 text-blue-600 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
          <FaCar size={11} />
          <span>
            {post.car.brand} {post.car.model}
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-4 pb-3">
        <h3 className="text-[14px] font-bold text-gray-900 mb-2 leading-snug">
          {post.title}
        </h3>

        {/* Images */}
        <PostImages images={post.car_images} />

        {/* Description */}
        <p className="text-[12px] text-gray-600 leading-relaxed mb-2">
          {shortDesc}
          {post.description.length > 120 && (
            <button
              onClick={() => setExpanded((p) => !p)}
              className="ml-1 text-blue-500 font-medium hover:underline">
              {expanded ? "Voir moins" : "Voir plus"}
            </button>
          )}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>

        {/* Car details row */}
        <div className="flex items-center gap-2 text-[11px] text-gray-400 bg-gray-50 rounded-lg px-3 py-2 mb-3">
          <span className="font-semibold text-gray-600">
            {post.car.brand} {post.car.model} {post.car.year}
          </span>
          <span>·</span>
          <span>{post.car.engine}</span>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-1 px-4 pb-3 border-t border-gray-50 pt-3">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 active:scale-95
            ${liked ? "text-red-500 bg-red-50 hover:bg-red-100" : "text-gray-500 hover:bg-gray-100"}`}>
          {liked ? (
            <FaHeart size={13} className="text-red-500" />
          ) : (
            <FiHeart size={13} />
          )}
          <span>{likeCount}</span>
        </button>

        {/* Auth Modal */}
        <AuthRequiredModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        {/* Comment toggle */}
        <button
          onClick={toggleComments}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-gray-500 hover:bg-gray-100 transition-all duration-150 active:scale-95`}>
          <FiMessageCircle size={13} />
          <span>
            {post.comments_count || 0} commentaire{(post.comments_count || 0) !== 1 ? "s" : ""}
          </span>
        </button>
      </div>
    </div>
  );
}
