export type PcbHeroHotspot = {
  id: string;
  label: string;
  href: string;
  left: string;
  top: string;
  width: string;
  height: string;
};

export const debugPcbHotspots = false;

export const pcbHeroImage = {
  src: "/images/homepage-pcb-reference.png",
  width: 1481,
  height: 853
} as const;

// Hotspot rectangles are percentage-based against the board image.
// If a clickable region needs to move, adjust the left/top/width/height values here.
// If only the visible label text needs nudging, update the matching
// `.interactive-pcb-hero__label--<id>` rule in `src/components/InteractivePcbHero.css`.

export const pcbHeroHotspots: PcbHeroHotspot[] = [
  {
    id: "top-left-block",
    label: "Experience",
    href: "/experience",
    left: "7%",
    top: "8%",
    width: "31%",
    height: "38%"
  },
  {
    id: "center-mcu",
    label: "Projects",
    href: "/projects",
    left: "51%",
    top: "15%",
    width: "18%",
    height: "31%"
  },
  {
    id: "bottom-left-cluster",
    label: "About",
    href: "/about",
    left: "45%",
    top: "73%",
    width: "18%",
    height: "20%"
  },
  {
    id: "right-subsystem",
    label: "Contact",
    href: "/contact",
    left: "70%",
    top: "50%",
    width: "15%",
    height: "18%"
  }
];
