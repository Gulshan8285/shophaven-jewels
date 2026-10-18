'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Play, Pause, Volume2, VolumeX, ArrowRight, ShieldCheck, Truck, Banknote } from 'lucide-react';

interface VideoTrack {
  id: string;
  title: string;
  src: string;
}

const VIDEOS: VideoTrack[] = [
  {
    id: 'model-wearing',
    title: 'Model Looks',
    src: '/videos/model-wearing-jewellery.mp4',
  },
  {
    id: 'gold-commercial',
    title: 'Gold & Kundan',
    src: '/videos/gold-jewellery-commercial.mp4',
  },
  {
    id: 'diamond-commercial',
    title: 'Diamond Sparkle',
    src: '/videos/diamond-jewellery-commercial.mp4',
  },
  {
    id: 'brand-ad',
    title: 'Atelier Film',
    src: '/videos/jewellery-brand-ad.mp4',
  },
];

export default function HeroVideoShowcase() {
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeTrack = VIDEOS[activeTrackIndex];

  const handleSelectTrack = (index: number) => {
    setActiveTrackIndex(index);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border border-stone-800 bg-stone-950 text-white min-h-[460px] sm:min-h-[520px] flex flex-col justify-between shadow-2xl">
      
      {/* Background Video Player */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          key={activeTrack.src}
          src={activeTrack.src}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover object-center opacity-45 mix-blend-screen scale-100 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-stone-950/40" />
      </div>

      {/* Top Floating Video Controls & Track Switcher Tabs */}
      <div className="relative z-10 p-3 sm:p-5 flex items-center justify-between gap-2 border-b border-white/10 font-mono text-xs">
        
        {/* Minimal Clean Track Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1">
          {VIDEOS.map((track, idx) => {
            const isSelected = activeTrackIndex === idx;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => handleSelectTrack(idx)}
                className={`px-3 py-1.5 rounded-full font-bold text-[10px] sm:text-[11px] uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-400 text-stone-950 shadow-md scale-102'
                    : 'bg-white/10 hover:bg-white/20 text-stone-300 border border-white/10'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-stone-950 animate-ping' : 'bg-amber-400'}`} />
                <span>{track.title}</span>
              </button>
            );
          })}
        </div>

        {/* Video Playback Controls (Play/Pause & Sound) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={togglePlay}
            className="p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white transition-colors cursor-pointer"
            title={isPlaying ? 'Pause video' : 'Play video'}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white transition-colors cursor-pointer"
            title={isMuted ? 'Unmute sound' : 'Mute sound'}
            aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Center Hero Content (Streamlined & Clean - No Excessive Text) */}
      <div className="relative z-10 p-5 sm:p-10 lg:p-12 max-w-2xl space-y-4 sm:space-y-5">
        
        {/* Simple Atelier Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 font-mono text-[10px] sm:text-[11px] tracking-wider uppercase text-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 glyph-pulse" />
          <span>FASHION JEWELLERY • KARIGAR DIRECT</span>
        </div>

        {/* Clean Elegant Headline */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-sans font-extrabold tracking-tight leading-[1.1] text-white">
          Royal Heritage Jewellery. <br />
          <span className="text-amber-400 font-serif italic font-normal">
            1-Gram Micro Gold Plated.
          </span>
        </h1>

        {/* Short, Easy-to-Read Description */}
        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-md">
          Handcrafted Kundan, Polki, and Temple pieces set in hypoallergenic brass alloy with anti-tarnish protective finish.
        </p>

        {/* Clean CTAs */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1 font-mono">
          <Link
            href="/shop"
            className="px-6 sm:px-7 py-3 rounded-full bg-white hover:bg-stone-100 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <span>EXPLORE ALL SHOP</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/shop?sort=bestseller"
            className="px-5 sm:px-6 py-3 rounded-full bg-white/15 backdrop-blur-md hover:bg-white/25 text-white font-bold text-xs uppercase tracking-wider border border-white/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>BESTSELLERS</span>
          </Link>
        </div>

        {/* Simple Trust Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 text-[10px] sm:text-[11px] font-mono text-stone-300">
          <span className="flex items-center gap-1.5 bg-black/40 border border-white/10 px-2.5 py-1 rounded-full">
            <Truck className="w-3 h-3 text-amber-400" /> Free Shipping &gt; ₹499
          </span>
          <span className="flex items-center gap-1.5 bg-black/40 border border-white/10 px-2.5 py-1 rounded-full">
            <Banknote className="w-3 h-3 text-amber-400" /> Cash on Delivery
          </span>
          <span className="flex items-center gap-1.5 bg-black/40 border border-white/10 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3 h-3 text-amber-400" /> Anti-Tarnish Finish
          </span>
        </div>

      </div>

      {/* Bottom Status Ticker */}
      <div className="relative z-10 px-5 py-2 bg-black/40 backdrop-blur-md border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-stone-400">
        <span>✨ 100% Eco-Brass • Nickel &amp; Lead Free</span>
        <span className="hidden sm:inline">Jaipur Johari Bazaar &amp; Rajkot Goldcraft</span>
      </div>

    </div>
  );
}
