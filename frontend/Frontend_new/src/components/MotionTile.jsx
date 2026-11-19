import React, { useEffect, useRef, useState } from "react";

// Cloudinary delivers a transformed copy of the uploaded video, so the browser
// gets a small H.264 MP4 (works everywhere) instead of the raw export, plus a
// poster frame generated from the same file. Non-Cloudinary URLs pass through.
const VIDEO_MARK = "/video/upload/";
const isCloudinaryVideo = (url) => typeof url === "string" && url.startsWith("https://res.cloudinary.com/") && url.includes(VIDEO_MARK);
const withTransform = (url, transform, ext) =>
  isCloudinaryVideo(url) ? url.replace(VIDEO_MARK, `${VIDEO_MARK}${transform}/`).replace(/\.\w+$/, `.${ext}`) : url;

export const videoSrc = (url) => withTransform(url, "c_limit,w_1280,f_mp4,vc_h264,q_auto", "mp4");
export const videoPoster = (url) => (isCloudinaryVideo(url) ? withTransform(url, "so_0,c_limit,w_1280,f_jpg,q_auto", "jpg") : undefined);

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

/**
 * A motion-graphics piece inside the masonry set. Behaves like a looping GIF (muted, inline, loops)
 * but only plays while it is on screen, so a set full of videos does not decode them all at once.
 * Visitors get play/pause and a sound toggle. Reduced-motion visitors see the poster and press play.
 */
export default function MotionTile({ item, name, index }) {
  const wrap = useRef(null);
  const video = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);
  const userPaused = useRef(false);
  const visible = useRef(false);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = wrap.current;
    const v = video.current;
    if (!el || !v || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
        if (entry.isIntersecting && !userPaused.current && !reduced.current) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const toggle = (e) => {
    e.stopPropagation();
    const v = video.current;
    if (!v) return;
    if (v.paused) { userPaused.current = false; v.play().catch(() => {}); }
    else { userPaused.current = true; v.pause(); }
  };
  const toggleSound = (e) => {
    e.stopPropagation();
    const v = video.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted && v.paused) { userPaused.current = false; v.play().catch(() => {}); }
  };

  const label = item.caption || `${name} motion piece ${index + 1}`;
  if (failed) return <a className="motion-fallback" href={item.image_url} target="_blank" rel="noopener noreferrer">▶ Watch “{label}”</a>;

  return (
    <div
      className="motion"
      ref={wrap}
      style={item.width && item.height ? { aspectRatio: `${item.width} / ${item.height}` } : undefined}
    >
      <video
        ref={video}
        src={videoSrc(item.image_url)}
        poster={videoPoster(item.image_url)}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setFailed(true)}
        onClick={toggle}
      />
      <span className="motion-badge mono" aria-hidden="true">MOTION{item.duration ? ` · ${fmt(item.duration)}` : ""}</span>
      <div className="motion-ctl">
        <button type="button" onClick={toggle} aria-label={playing ? `Pause ${label}` : `Play ${label}`}>{playing ? "❚❚" : "▶"}</button>
        <button type="button" onClick={toggleSound} aria-label={muted ? `Turn sound on for ${label}` : `Mute ${label}`} aria-pressed={!muted}>{muted ? "🔇" : "🔊"}</button>
      </div>
    </div>
  );
}
