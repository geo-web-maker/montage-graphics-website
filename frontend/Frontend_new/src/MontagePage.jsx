import React, { useEffect, useRef, useState } from "react";
import "./styles/montage.css";

import LoadingScreen from "./components/LoadingScreen";
import Header from "./components/Header";
import Hero from "./components/Hero";
import StudioTimeline from "./components/StudioTimeline";
import TrustedByReel from "./components/TrustedByReel";
import WorkCarousel from "./components/WorkCarousel";
import ExpandOverlay from "./components/ExpandOverlay";
import About from "./components/About";
import Skills from "./components/Skills";
import Platforms from "./components/Platforms";
import Reviews from "./components/Reviews";
import Footer from "./components/Footer";
import { useExpandCard } from "./hooks/useExpandCard";
import { useReveal } from "./hooks/useReveal";
import { useEditBay } from "./hooks/useEditBay";
import { getClients, getSiteContent, getSkills } from "./api/client";

export default function MontagePage() {
  const rootRef = useRef(null);
  const { expanded, filled, gridVisible, overlayStyle, openExpand, closeExpand, handleTransitionEnd } = useExpandCard();

  useReveal();
  useEditBay(rootRef);

  // One fetch for the whole page; the loader leaves when it settles.
  const [clients, setClients] = useState([]);
  const [ready, setReady] = useState(false);
  const [skills, setSkills] = useState([]);
  const [content, setContent] = useState(null);

  useEffect(() => {
    Promise.allSettled([getClients(), getSiteContent(), getSkills()])
      .then(([c, siteContent, skillData]) => {
        if (c.status === "fulfilled") setClients(c.value);
        if (siteContent.status === "fulfilled") setContent(siteContent.value);
        if (skillData.status === "fulfilled") setSkills(skillData.value);
      })
      .finally(() => setReady(true));
  }, []);

  return (
    <div className="montage-root" ref={rootRef}>
      <LoadingScreen ready={ready} />
      <Header />
      <main id="top">
        <Hero content={content} />
        <StudioTimeline stats={content?.stats} />
        <TrustedByReel clients={clients} />
        <WorkCarousel clients={clients} ready={ready} onCardOpen={openExpand} />
        <About content={content} />
        <Skills skills={skills} />
        <Platforms platforms={content?.platforms} />
        {content?.modules?.reviews !== false && <Reviews />}
      </main>
      <Footer content={content} />
      <ExpandOverlay
        expanded={expanded}
        filled={filled}
        gridVisible={gridVisible}
        overlayStyle={overlayStyle}
        onTransitionEnd={handleTransitionEnd}
        onClose={closeExpand}
      />
    </div>
  );
}
