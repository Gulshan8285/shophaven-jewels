'use client';

import React, { useState, useRef } from 'react';
import { Play, Pause, Star, CheckCircle, Volume2, VolumeX } from 'lucide-react';

interface VideoReview {
  id: string;
  name: string;
  city: string;
  role: string;
  quote: string;
  videoSrc: string;
  product: string;
  rating: number;
}

const REVIEWS: VideoReview[] = [
  {
    id: 'rev-1',
    name: 'Pooja Sharma',
    city: 'Jaipur, Rajasthan',
    role: 'Customer Presence Review',
    quote: 'Ordered this Kundan Choker for a wedding. The 1-gram micro gold plating shine and weight are identical to real gold jewellery! No green marks on skin even after wearing for 12 hours.',
    videoSrc: '/videos/customer-review-1.mp4',
    product: 'Twinkling Graceful Kundan Choker Necklace Set',
    rating: 5,
  },
  {
    id: 'rev-2',
    name: 'Ananya Deshmukh',
    city: 'Pune, Maharashtra',
    role: 'Live Unboxing & Finish Review',
    quote: 'The unboxing experience was so luxurious in the red velvet box! The Lakshmi Temple Jhumkas have incredible micro carving. Fast delivery via BlueDart in just 2 days.',
    videoSrc: '/videos/customer-review-2.mp4',
    product: 'Traditional Lakshmi Temple Jhumki Earrings',
    rating: 5,
  },
];

export default function CustomerVideoReviews() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const handleTogglePlay = (id: string) => {
    const video = videoRefs.current[id];
    if (!video) return;

    if (playingId === id) {
      video.pause();
      setPlayingId(null);
    } else {
      // Pause any currently playing video
      if (playingId && videoRefs.current[playingId]) {
        videoRefs.current[playingId]?.pause();
      }
      video.play().catch(() => {});
      setPlayingId(id);
    }
  };

  const handleToggleMute = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const video = videoRefs.current[id];
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#e6e2d8] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] text-[#b91c1c] font-bold uppercase tracking-widest font-mono">
            <span className="w-2 h-2 rounded-full bg-[#b91c1c] animate-pulse" />
            <span>VIDEO TELEMETRY // REAL CUSTOMERS</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-ndot font-bold text-stone-950 tracking-wider mt-1">
            CUSTOMER PRESENCE &amp; UNBOXING REVIEWS
          </h3>
        </div>
        <p className="text-xs text-stone-500 font-mono">
          Watch verified buyers showcase their jewellery delivery &amp; real finish.
        </p>
      </div>

      {/* Video Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {REVIEWS.map((rev) => {
          const isCurrentPlaying = playingId === rev.id;

          return (
            <div
              key={rev.id}
              className="rounded-3xl border border-[#e6e2d8] bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow p-4 sm:p-5 flex flex-col sm:flex-row gap-5 font-mono"
            >
              
              {/* Smartphone 9:16 Video Reel Container */}
              <div
                onClick={() => handleTogglePlay(rev.id)}
                className="relative w-full sm:w-44 h-72 sm:h-64 rounded-2xl overflow-hidden bg-stone-950 shrink-0 cursor-pointer group shadow-inner"
              >
                <video
                  ref={(el) => {
                    videoRefs.current[rev.id] = el;
                  }}
                  src={rev.videoSrc}
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Overlay Play / Pause Button */}
                <div
                  className={`absolute inset-0 flex items-center justify-center transition-all ${
                    isCurrentPlaying
                      ? 'bg-black/10 opacity-0 group-hover:opacity-100'
                      : 'bg-black/40 opacity-100'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-md text-stone-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    {isCurrentPlaying ? (
                      <Pause className="w-5 h-5 fill-stone-950" />
                    ) : (
                      <Play className="w-5 h-5 fill-stone-950 ml-0.5" />
                    )}
                  </div>
                </div>

                {/* Sound control button */}
                <button
                  type="button"
                  onClick={(e) => handleToggleMute(e, rev.id)}
                  className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] hover:bg-black transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>

                {/* Badge */}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-bold text-[9px] uppercase tracking-wider">
                  ▶ VIDEO REEL
                </span>
              </div>

              {/* Review Details & Quote */}
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#b91c1c] bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                      [ {rev.role} ]
                    </span>
                    <div className="flex items-center text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-500" />
                      ))}
                    </div>
                  </div>

                  <h4 className="font-sans font-bold text-base text-stone-950 leading-tight">
                    {rev.name}
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    {rev.city} • Verified Buyer
                  </p>

                  <p className="text-xs text-stone-700 leading-relaxed italic bg-[#faf8f5] p-3 rounded-xl border border-[#e6e2d8]">
                    &ldquo;{rev.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                  <span className="text-stone-500 truncate max-w-[170px]" title={rev.product}>
                    Item: <strong>{rev.product}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle className="w-3 h-3" /> VERIFIED COD
                  </span>
                </div>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
