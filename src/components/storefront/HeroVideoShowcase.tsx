'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Play, Pause, Volume2, VolumeX, ArrowRight } from 'lucide-react';

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

  // Guarantee mobile autoplay by forcing native muted property on mount and track switch
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.defaultMuted = true;
    video.muted = isMuted;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Fallback if browser requires muted touch interaction
          video.muted = true;
          video.play().catch(() => {});
        });
    }
  }, [activeTrack.src, isMuted]);

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
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border border-stone-800 bg-stone-950 text-white min-h-[460px] sm:min-h-[520px] flex flex-col justify-between shadow-2xl">
      
      {/* Background Video Player (Optimized for Mobile Autoplay & High Visibility) */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-stone-950">
        <video
          ref={videoRef}
          key={activeTrack.src}
          src={activeTrack.src}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-center opacity-65 sm:opacity-55 scale-100 transition-opacity duration-700 pointer-events-none"
        />
        {/* Soft Vignette Overlay ensuring text readability while keeping video crystal clear */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/65 to-stone-950/20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/50 pointer-events-none" />
      </div>

      {/* Top Floating Video Controls & Track Switcher Tabs */}
      <div className="relative z-10 p-3 sm:p-5 flex items-center justify-between gap-2 border-b border-white/10 font-mono text-xs">
        
        {/* Track Pills */}
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

      {/* Center Hero Content (Streamlined, No Text Clutter, Exact Laptop Font) */}
      <div className="relative z-10 p-5 sm:p-10 lg:p-12 max-w-2xl space-y-4 sm:space-y-5">
        
        {/* Status Pill (Preserved as requested: 'ऊपर का तो रहने दो') */}
        <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 font-mono text-[10px] sm:text-[11px] tracking-wider uppercase text-white shadow-sm">
          <span className="w-2 h-2 rounded-full bg-amber-400 glyph-pulse" />
          <span>PREMIUM ARTIFICIAL &amp; FASHION JEWELLERY // 0% BROKERAGE</span>
        </div>

        {/* Bold Headline with Consistent Silkscreen Pixel Font on both Phone & Laptop */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-sans font-extrabold tracking-tight leading-[1.08] text-white">
          ROYAL HERITAGE. <br />
          DIRECT FROM ATELIER. <br />
          <span className="text-amber-400 font-ndot text-xl sm:text-3xl lg:text-4xl tracking-wide block mt-1.5">
            1-GRAM MICRO GOLD FINISH.
          </span>
        </h1>

        {/* Clean, Concise Description */}
        <p className="text-xs sm:text-sm text-stone-200 leading-relaxed max-w-lg font-mono">
          Handcrafted imitation Kundan chokers, temple Lakshmi jhumkas, and royal Rajwadi kadas. 100% hypoallergenic brass alloy with anti-tarnish protective lacquer. Zero showroom markup.
        </p>

        {/* Single Luxury Primary CTA Button */}
        <div className="pt-2 font-mono">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-stone-100 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-xl transition-all active:scale-95 cursor-pointer"
          >
            <span>EXPLORE JEWELLERY ARCHIVE</span>
            <ArrowRight className="w-4 h-4 text-stone-950" />
          </Link>
        </div>

      </div>

      {/* Bottom Status Ticker */}
      <div className="relative z-10 px-5 py-2.5 bg-black/50 backdrop-blur-md border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-stone-400">
        <span>✨ 100% Eco-Brass • Nickel &amp; Lead Free</span>
        <span className="hidden sm:inline">Jaipur Johari Bazaar &amp; Rajkot Goldcraft</span>
      </div>

    </div>
  );
}
