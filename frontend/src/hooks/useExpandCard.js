import { useCallback, useState } from "react";

/**
 * Encapsulates the "grow a clicked card to fill the screen" interaction.
 * Returns the current overlay state plus handlers to wire up to a
 * clickable card and a close button.
 */
export function useExpandCard() {
  const [expanded, setExpanded] = useState(null); // { client, top, left, width, height } | null
  const [filled, setFilled] = useState(false);
  const [gridVisible, setGridVisible] = useState(false);

  const openExpand = useCallback((e, client) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setGridVisible(false);
    setFilled(false);
    setExpanded({
      client,
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
    // Wait a frame so the browser paints the card-sized overlay first,
    // then flip to fullscreen so the size change actually transitions.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFilled(true);
      });
    });
  }, []);

  const handleTransitionEnd = useCallback(
    (e) => {
      if (e.propertyName !== "width") return;
      if (filled) setGridVisible(true);
    },
    [filled]
  );

  const closeExpand = useCallback(() => {
    setGridVisible(false);
    setFilled(false);
    setExpanded(null);
  }, []);

  const overlayStyle = expanded
    ? filled
      ? { top: 0, left: 0, width: "100vw", height: "100vh" }
      : {
          top: expanded.top,
          left: expanded.left,
          width: expanded.width,
          height: expanded.height,
        }
    : null;

  return {
    expanded,
    filled,
    gridVisible,
    overlayStyle,
    openExpand,
    closeExpand,
    handleTransitionEnd,
  };
}
