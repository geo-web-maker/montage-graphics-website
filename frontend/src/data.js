// Static content for the Montage Graphics page.
// Keeping this separate from components makes copy edits (client names,
// skill percentages, review text, etc.) a one-file change.

export const CLIENT_WORK_COUNTS = { broach: 6, hma: 4, mei: 3, rehoboth: 8 };

export const WORK_CARDS = [
  { client: "broach", label: "Broach" },
  { client: "hma", label: "HMA Burgeria" },
  { client: "mei", label: "MEI Contabilidade" },
  { client: "rehoboth", label: "Rehoboth Farms" },
  { client: "broach", label: "Broach" },
  { client: "hma", label: "HMA Burgeria" },
  { client: "mei", label: "MEI Contabilidade" },
  { client: "rehoboth", label: "Rehoboth Farms" },
];

export const REEL_ITEMS = [
  "Broach",
  "HMA Burgeria",
  "MEI Contabilidade",
  "Rehoboth Farms",
  "Kampala Fresh",
];

export const SKILLS = [
  { name: "Photoshop", pct: 95, motion: false },
  { name: "Illustrator", pct: 85, motion: false },
  { name: "After Effects", pct: 90, motion: true },
  { name: "Cinema 4D", pct: 88, motion: true },
  { name: "Figma", pct: 75, motion: false },
];

export const PLATFORMS = [
  { prefix: "Be", suffix: "hance" },
  { prefix: "Free", suffix: "pik" },
  { prefix: "Can", suffix: "va" },
  { prefix: "Adobe ", suffix: "Stock", boldSuffix: true },
  { prefix: "Shutter", suffix: "stock" },
];

export const REVIEWS = [
  {
    quote:
      "An excellent professional — very meticulous with the work we agreed on. He understood exactly what we needed and helped a lot.",
    who: "Matheus Gobetti",
    role: "Web designer",
  },
  {
    quote:
      "Fast turnaround on our weekly flyers and the templates meant our own team could keep the system going without him.",
    who: "Local client",
    role: "Restaurant owner",
  },
];

export const CONTACT = {
  email: "montagegraphics@gmail.com",
  whatsapp: "+256 763675577 / +256 793740538",
};
