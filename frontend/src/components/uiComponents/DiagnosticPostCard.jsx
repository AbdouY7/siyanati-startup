import React, { useState, useRef, useEffect } from "react";
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
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(
    Math.floor(Math.random() * 18) + 3,
  );
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef(null);

  // Seed some mock comments per post
  const [comments, setComments] = useState(() => {
    const seeds = [
      {
        avatar: "https://randomuser.me/api/portraits/men/22.jpg",
        name: "Bilal Hamza",
        text: "Ça ressemble à un problème de bobine d'allumage, vérifies les codes erreur d'abord.",
        time: "1h",
      },
      {
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        name: "Sara Ouali",
        text: "Même problème avec ma Golf, c'était la sonde lambda.",
        time: "3h",
      },
    ];
    return seeds.slice(0, 1 + (post.id.charCodeAt(post.id.length - 1) % 2));
  });

  const handleLike = () => {
    setLiked((p) => !p);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const handleComment = () => {
    const text = commentText.trim();
    if (!text) return;
    setComments((prev) => [
      ...prev,
      {
        avatar: "https://randomuser.me/api/portraits/men/55.jpg",
        name: "Moi",
        text,
        time: "à l'instant",
      },
    ]);
    setCommentText("");
  };

  const toggleComments = () => {
    setShowComments((p) => !p);
    if (!showComments) setTimeout(() => inputRef.current?.focus(), 150);
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

        {/* Comment toggle */}
        <button
          onClick={toggleComments}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 active:scale-95
            ${showComments ? "text-blue-600 bg-blue-50 hover:bg-blue-100" : "text-gray-500 hover:bg-gray-100"}`}>
          <FiMessageCircle size={13} />
          <span>
            {comments.length} commentaire{comments.length !== 1 ? "s" : ""}
          </span>
        </button>
      </div>

      {/* ── Comments section ── */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-gray-50">
          {/* Existing comments */}
          <div className="mb-3 max-h-[180px] overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-[12px] text-gray-400 text-center py-4">
                Soyez le premier à commenter
              </p>
            ) : (
              comments.map((c, i) => <Comment key={i} {...c} />)
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
            <img
              src="https://randomuser.me/api/portraits/men/55.jpg"
              alt="me"
              className="w-6 h-6 rounded-full object-cover shrink-0"
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="Écrire un commentaire…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
              className="flex-1 bg-transparent text-[12px] text-gray-700 placeholder-gray-400 outline-none"
            />
            <button
              onClick={handleComment}
              disabled={!commentText.trim()}
              className="text-blue-500 disabled:text-gray-300 hover:text-blue-700 transition-colors active:scale-90">
              <FiSend size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
