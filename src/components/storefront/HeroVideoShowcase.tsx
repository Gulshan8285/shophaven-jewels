'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Play, Pause, Volume2, VolumeX, Sparkles, ArrowRight, ShieldCheck, Truck, RotateCcw, Banknote } from 'lucide-react';

interface VideoTrack {
  id: string;
  title: string;
  badge: string;
  src: string;
  tagline: string;
}

const VIDEOS: VideoTrack[] = [
  {
    id: 'model-wearing',
    title: 'Model Wearing Showcase',
    badge: 'NEW REEL',
    src: '/videos/model-wearing-jewellery.mp4',
    tagline: 'See how our 1-gram gold-plated Kundan and heritage chokers drape in real lighting.',
  },
  {
    id: 'gold-commercial',
    title: 'Gold & Kundan Commercial',
    badge: 'POPULAR',
    src: '/videos/gold-jewellery-commercial.mp4',
    tagline: 'High-density brass with 22K micro lacquer coating for zero tarnish.',
  },
  {
    id: 'diamond-commercial',
    title: 'Diamond & Crystal Sparkle',
    badge: 'AAA GRADE',
    src: '/videos/diamond-jewellery-commercial.mp4',
    tagline: 'European-cut Austrian cubic zirconia set by master setting artisans.',
  },
  {
    id: 'brand-ad',
    title: 'Atelier Brand Film',
    badge: 'KARIGAR GUILD',
    src: '/videos/jewellery-brand-ad.mp4',
    tagline: 'Direct from Johari Bazaar and Rajkot goldsmiths with zero retail showroom rent.',
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
    <div className="relative rounded-3xl overflow-hidden border border-stone-800 bg-stone-950 text-white min-h-[520px] sm:min-h-[600px] flex flex-col justify-between shadow-2xl">
      
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
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/40" />
      </div>

      {/* Top Floating Video Controls & Track Switcher Tabs */}
      <div className="relative z-10 p-4 sm:p-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 font-mono text-xs">
        
        {/* Track Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {VIDEOS.map((track, idx) => {
            const isSelected = activeTrackIndex === idx;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => handleSelectTrack(idx)}
                className={`px-3 py-1.5 rounded-full font-bold text-[11px] uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-400 text-stone-950 shadow-md scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-stone-300 border border-white/10'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-stone-950 animate-ping' : 'bg-amber-400'}`} />
                <span>{track.title}</span>
                <span className={`text-[8px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-stone-950/20 text-stone-950' : 'bg-white/10 text-amber-300'}`}>
                  {track.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Video Playback Controls (Play/Pause & Sound) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={togglePlay}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white transition-colors cursor-pointer"
            title={isPlaying ? 'Pause video' : 'Play video'}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white transition-colors cursor-pointer"
            title={isMuted ? 'Unmute sound' : 'Mute sound'}
            aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Center Hero Content */}
      <div className="relative z-10 p-6 sm:p-12 lg:p-16 max-w-2xl space-y-6">
        
        {/* Status Glyph Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 font-mono text-[11px] tracking-wider uppercase text-white shadow-sm">
          <span className="w-2 h-2 rounded-full bg-amber-400 glyph-pulse" />
          <span>PREMIUM ARTIFICIAL & FASHION JEWELLERY // 0% BROKERAGE</span>
        </div>

        {/* Bold Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-sans font-extrabold tracking-tight leading-[1.05] text-white">
          ROYAL HERITAGE. <br />
          DIRECT FROM ATELIER. <br />
          <span className="text-amber-400 font-ndot text-2xl sm:text-4xl lg:text-5xl tracking-normal">
            1-GRAM MICRO GOLD FINISH.
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-lg font-mono">
          Handcrafted imitation Kundan chokers, temple Lakshmi jhumkas, and royal Rajwadi kadas. 100% hypoallergenic brass alloy with anti-tarnish protective lacquer. Zero showroom markup. 100% Cash on Delivery nationwide.
        </p>

        {/* Track tagline preview */}
        <div className="text-[11px] font-mono text-amber-300 bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded-xl max-w-md">
          <strong>Now Playing:</strong> {activeTrack.tagline}
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-3 pt-1 font-mono">
          <Link
            href="/shop"
            className="px-8 py-3.5 rounded-full bg-white hover:bg-stone-100 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-xl transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <span>EXPLORE JEWELLERY ARCHIVE</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/category/necklaces-chokers"
            className="px-7 py-3.5 rounded-full bg-white/15 backdrop-blur-md hover:bg-white/25 text-white font-bold text-xs uppercase tracking-wider border border-white/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>KUNDAN CHOKERS</span>
          </Link>
        </div>

        {/* Value Metric Badges */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-3 text-[10px] sm:text-[11px] font-mono text-stone-300">
          <span className="flex items-center gap-1.5 bg-black/40 border border-white/10 px-3 py-1 rounded-full">
            <Truck className="w-3.5 h-3.5 text-amber-400" /> [ FREE DELIVERY &gt; ₹499 ]
          </span>
          <span className="flex items-center gap-1.5 bg-black/40 border border-white/10 px-3 py-1 rounded-full">
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> [ 7-DAY SAFE RETURNS ]
          </span>
          <span className="flex items-center gap-1.5 bg-black/40 border border-white/10 px-3 py-1 rounded-full">
            <Banknote className="w-3.5 h-3.5 text-amber-400" /> [ CASH ON DELIVERY ]
          </span>
        </div>

      </div>

      {/* Bottom Subtle Status Bar */}
      <div className="relative z-10 px-6 py-2.5 bg-black/50 backdrop-blur-md border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-stone-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>ANTI-TARNISH NANO LACQUER COATING • 100% LEAD &amp; NICKEL FREE</span>
        </span>
        <span className="hidden sm:inline text-stone-500">
          JAIPUR JOHARI BAZAAR // RAJKOT GOLDCRAFT DIRECT
        </span>
      </div>

    </div>
  );
}
