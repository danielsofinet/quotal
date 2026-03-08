"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function Demo() {
  const t = useTranslations("Landing.demo");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);

  async function handlePlay() {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
      } catch {
        // play() was interrupted — ignore
      }
    } else {
      video.pause();
    }
  }

  return (
    <section id="demo" className="py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="text-xs uppercase tracking-widest font-medium text-accent-light mb-3 block">
            {t("label")}
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary">
            {t("title")}
          </h2>
        </motion.div>

        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        >
          <div
            className="relative aspect-video rounded-xl landing-card overflow-hidden group cursor-pointer bg-surface"
            onClick={handlePlay}
          >
            {/* Poster image — shown until video starts */}
            {!started && (
              <img
                src="/demo-poster.png"
                alt="Quotal demo preview"
                className="absolute inset-0 w-full h-full object-cover z-[1]"
              />
            )}

            <video
              ref={videoRef}
              preload="auto"
              playsInline
              className="w-full h-full object-cover"
              onPlay={() => { setPlaying(true); setStarted(true); }}
              onPause={() => setPlaying(false)}
              onEnded={() => { setPlaying(false); setStarted(false); }}
            >
              <source src="/quotal-demo.mp4" type="video/mp4" />
            </video>

            {/* Play/pause overlay */}
            <div
              className={`absolute inset-0 z-[2] flex items-center justify-center transition-opacity duration-200 ${
                playing ? "opacity-0 group-hover:opacity-100" : "opacity-100"
              }`}
            >
              <div className={`w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all duration-200 ${
                playing ? "scale-90" : "group-hover:scale-105"
              }`}>
                {playing ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                    <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
                    <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
                  </svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white ml-1">
                    <path d="M8 5.14v13.72a1 1 0 001.5.86l11.14-6.86a1 1 0 000-1.72L9.5 4.28a1 1 0 00-1.5.86z" fill="currentColor" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-text-dim mt-4">{t("noSignup")}</p>
        </motion.div>
      </div>
    </section>
  );
}
