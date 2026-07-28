import React from "react";
import "./styles/montage.css";

import LoadingScreen from "./components/LoadingScreen";
import Header from "./components/Header";
import Hero from "./components/Hero";
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

export default function MontagePage() {
  const {
    expanded,
    filled,
    gridVisible,
    overlayStyle,
    openExpand,
    closeExpand,
    handleTransitionEnd,
  } = useExpandCard();

  useReveal();

  return (
    <div className="montage-root">
      <LoadingScreen />
      <Header />
      <Hero />
      <TrustedByReel />
      <WorkCarousel onCardOpen={openExpand} />
      <ExpandOverlay
        expanded={expanded}
        filled={filled}
        gridVisible={gridVisible}
        overlayStyle={overlayStyle}
        onTransitionEnd={handleTransitionEnd}
        onClose={closeExpand}
      />
      <About />
      <Skills />
      <Platforms />
      <Reviews />
      <Footer />
    </div>
  );
}
