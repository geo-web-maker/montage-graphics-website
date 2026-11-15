import React, { useEffect, useState } from "react";
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
import { getClients } from "./api/client";

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

  // Lifted up from WorkCarousel so the loading screen's exit can be
  // tied to the same fetch that fills the carousel — it now waits for
  // `clientsReady` instead of leaving on a blind fixed timer.
  const [clients, setClients] = useState([]);
  const [clientsReady, setClientsReady] = useState(false);

  useEffect(() => {
    getClients()
      .then(setClients)
      .catch((err) => console.error(err))
      .finally(() => setClientsReady(true));
  }, []);

  return (
    <div className="montage-root">
      <LoadingScreen ready={clientsReady} />
      <Header />
      <Hero />
      <TrustedByReel />
      <WorkCarousel clients={clients} onCardOpen={openExpand} />
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
