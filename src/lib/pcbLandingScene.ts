import * as THREE from "three";

type Pointer = {
  x: number;
  y: number;
};

type NavTargetId = "about" | "projects" | "experience" | "contact";
type ComponentKind = "module" | "qfp" | "soic" | "can";

type TraceRoute = {
  points: Array<[number, number]>;
  width: number;
  targetId?: NavTargetId;
};

type InitOptions = {
  introDurationMs: number;
  flowSpeed: number;
  sceneOpacity: number;
  glowStrength: number;
  reducedMotion: boolean;
  mobile: boolean;
  interactionTarget?: HTMLElement;
  navElements?: Partial<Record<NavTargetId, HTMLAnchorElement>>;
  onActiveTargetChange?: (targetId: NavTargetId | null) => void;
  onPointerMove?: (pointer: Pointer) => void;
};

type NavVisual = {
  root: THREE.Object3D;
  materials: THREE.MeshPhysicalMaterial[];
};

type SceneController = {
  destroy: () => void;
  setActiveNavTarget: (targetId: string | null) => void;
};

type NavComponentSpec = {
  id: NavTargetId;
  label: string;
  ref: string;
  kind: ComponentKind;
  position: THREE.Vector3;
  bodySize: THREE.Vector3;
};

type PassiveSpec = {
  ref: string;
  x: number;
  z: number;
  w: number;
  d: number;
  rotation?: number;
};

type SmallChipSpec = {
  ref: string;
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  pins?: number;
  rotation?: number;
  kind: "power" | "soic" | "module" | "sot23";
};

type PadSpec = {
  x: number;
  z: number;
  w: number;
  h: number;
  rotation?: number;
};

type TestPointSpec = {
  x: number;
  z: number;
  kind: "ring" | "pad";
  label: string;
};

type TraceSegment = {
  material: THREE.MeshPhysicalMaterial;
  targetId?: NavTargetId;
  baseEmissive: number;
  phase: number;
};

type BoardMaps = {
  color: THREE.CanvasTexture | null;
  roughness: THREE.CanvasTexture | null;
};

const BOARD_OUTLINE: Array<[number, number]> = [
  [-5.42, -2.84],
  [4.72, -2.84],
  [5.56, -2.06],
  [5.56, 2.08],
  [4.8, 2.84],
  [-4.82, 2.84],
  [-5.68, 2.06],
  [-5.68, -2.08]
];

const BOARD_BOUNDS = {
  minX: -5.68,
  maxX: 5.56,
  minZ: -2.84,
  maxZ: 2.84
};

const NAV_COMPONENTS: NavComponentSpec[] = [
  {
    id: "about",
    label: "ABOUT",
    ref: "J1",
    kind: "module",
    position: new THREE.Vector3(-3.9, 0.18, 0.62),
    bodySize: new THREE.Vector3(2.88, 0.38, 2.7)
  },
  {
    id: "projects",
    label: "PROJECTS",
    ref: "U1",
    kind: "qfp",
    position: new THREE.Vector3(0.72, 0.2, 0.82),
    bodySize: new THREE.Vector3(1.84, 0.34, 1.84)
  },
  {
    id: "experience",
    label: "EXPERIENCE",
    ref: "U2",
    kind: "soic",
    position: new THREE.Vector3(3.25, 0.18, -0.82),
    bodySize: new THREE.Vector3(1.58, 0.28, 1.7)
  },
  {
    id: "contact",
    label: "CONTACT",
    ref: "C1",
    kind: "can",
    position: new THREE.Vector3(3.98, 0.26, 1.98),
    bodySize: new THREE.Vector3(1.52, 0.62, 1.52)
  }
];

const BOARD_ANCHORS = {
  aboutPinA: [-2.24, 1.62],
  aboutPinB: [-2.24, 1.16],
  aboutPinC: [-2.24, 0.7],
  aboutPinD: [-2.24, 0.24],
  aboutPinE: [-2.24, -0.22],
  aboutPinF: [-2.24, -0.68],
  aboutPinG: [-2.24, -1.14],
  aboutBus: [-1.56, 0.7],
  aboutLowerBus: [-1.66, -1.18],
  projectsWest: [-0.38, 0.72],
  projectsNorth: [0.72, 1.86],
  projectsEast: [1.82, 0.82],
  projectsSouth: [0.72, -0.34],
  projectsTopRailWest: [-0.12, 2.1],
  projectsTopRailEast: [1.44, 2.1],
  experienceWest: [2.3, -0.82],
  experienceNorth: [3.25, 0.26],
  experienceSouth: [3.25, -1.84],
  experienceEast: [4.18, -0.82],
  contactSouthA: [3.48, 1.26],
  contactSouthB: [4.64, 1.26],
  contactBus: [4.82, 1.92],
  rightGoldPadA: [3.78, 0.94],
  rightGoldPadB: [5.08, 0.94],
  supportRegulator: [-3.88, -0.84],
  supportDriver: [-1.66, -0.62],
  supportBottomModule: [0.58, -2.02],
  supportBottomSwitch: [-0.92, -2.18],
  supportBarrel: [4.08, -2.18],
  ledNode: [-4.86, -1.94],
  buttonNode: [-4.52, -2.4]
} as const;

type BoardAnchorId = keyof typeof BOARD_ANCHORS;

const SUPPORT_PASSIVES: PassiveSpec[] = [
  { ref: "C3", x: 0.16, z: 2.34, w: 0.28, d: 0.18, rotation: Math.PI / 2 },
  { ref: "C4", x: 0.74, z: 2.18, w: 0.28, d: 0.18, rotation: Math.PI / 2 },
  { ref: "C5", x: 1.26, z: 2.04, w: 0.28, d: 0.18, rotation: Math.PI / 2 },
  { ref: "R3", x: -0.88, z: 1.14, w: 0.24, d: 0.12, rotation: Math.PI / 2 },
  { ref: "R4", x: -0.88, z: 0.7, w: 0.24, d: 0.12, rotation: Math.PI / 2 },
  { ref: "R5", x: -0.88, z: 0.22, w: 0.24, d: 0.12, rotation: Math.PI / 2 },
  { ref: "C7", x: 0.42, z: -0.72, w: 0.28, d: 0.18 },
  { ref: "C8", x: 1.02, z: -0.72, w: 0.28, d: 0.18 },
  { ref: "R8", x: 2.08, z: 1.2, w: 0.22, d: 0.12 },
  { ref: "C10", x: 2.36, z: 1.2, w: 0.22, d: 0.12 },
  { ref: "R11", x: 2.08, z: 0.62, w: 0.22, d: 0.12 },
  { ref: "C11", x: 2.38, z: 0.62, w: 0.22, d: 0.12 },
  { ref: "C12", x: 2.22, z: -1.92, w: 0.28, d: 0.18 },
  { ref: "C13", x: 2.78, z: -1.92, w: 0.28, d: 0.18 },
  { ref: "C14", x: 3.34, z: -1.92, w: 0.28, d: 0.18 },
  { ref: "R14", x: 4.88, z: -0.28, w: 0.22, d: 0.12, rotation: Math.PI / 2 },
  { ref: "C15", x: 4.88, z: 0.28, w: 0.22, d: 0.12, rotation: Math.PI / 2 },
  { ref: "C16", x: 4.74, z: 1.54, w: 0.28, d: 0.18, rotation: Math.PI / 2 },
  { ref: "C17", x: 1.96, z: -0.08, w: 0.32, d: 0.18 },
  { ref: "R17", x: -3.28, z: -1.72, w: 0.28, d: 0.18 },
  { ref: "C18", x: -2.6, z: -2.06, w: 0.28, d: 0.18, rotation: Math.PI / 2 }
];

const SUPPORT_CHIPS: SmallChipSpec[] = [
  { ref: "Q1", x: -3.94, z: -0.86, w: 0.92, d: 0.72, h: 0.18, kind: "power" },
  { ref: "U5", x: -1.68, z: -0.62, w: 1.12, d: 0.92, h: 0.16, pins: 4, kind: "soic" },
  { ref: "Q2", x: -0.92, z: -2.16, w: 0.72, d: 0.42, h: 0.12, kind: "sot23" },
  { ref: "U6", x: 0.58, z: -2.02, w: 2.0, d: 1.18, h: 0.28, kind: "module" },
  { ref: "Q3", x: 1.42, z: 2.18, w: 0.54, d: 0.82, h: 0.15, kind: "power", rotation: Math.PI / 2 }
];

const TEST_POINTS: TestPointSpec[] = [
  { label: "TP1", x: -4.76, z: -2.46, kind: "pad" },
  { label: "TP2", x: 3.78, z: 0.94, kind: "ring" },
  { label: "TP3", x: 5.08, z: 0.94, kind: "ring" }
];

const EXTRA_COPPER_PADS: PadSpec[] = [
  { x: -4.54, z: -2.4, w: 0.14, h: 0.18 },
  { x: -4.72, z: -1.82, w: 0.16, h: 0.22 },
  { x: 4.92, z: -2.18, w: 0.22, h: 0.48 },
  { x: 4.48, z: -2.18, w: 0.18, h: 0.22 },
  { x: -1.96, z: -2.18, w: 0.16, h: 0.22 },
  { x: -1.28, z: -2.18, w: 0.16, h: 0.22 }
];

const VIA_POINTS: Array<[number, number]> = [
  anchor("aboutBus"),
  anchor("projectsWest"),
  anchor("projectsEast"),
  anchor("projectsNorth"),
  anchor("experienceWest"),
  anchor("experienceSouth"),
  anchor("contactBus"),
  anchor("rightGoldPadA"),
  anchor("rightGoldPadB"),
  anchor("supportDriver"),
  anchor("supportBottomModule")
];

const AUX_VIA_POINTS: Array<[number, number]> = [
  anchor("aboutLowerBus"),
  anchor("projectsSouth"),
  anchor("supportRegulator"),
  anchor("supportBarrel")
];

const TRACE_ROUTES: TraceRoute[] = [
  {
    points: [anchor("aboutBus"), [-0.92, 0.7], anchor("projectsWest")],
    width: 0.12,
    targetId: "about"
  },
  {
    points: [anchor("aboutPinA"), [-1.42, 1.62], [-1.42, 1.92], anchor("projectsTopRailWest")],
    width: 0.11,
    targetId: "about"
  },
  {
    points: [anchor("projectsWest"), [0.18, 0.72], anchor("projectsEast")],
    width: 0.14,
    targetId: "projects"
  },
  {
    points: [anchor("projectsNorth"), [0.72, 2.1], anchor("projectsTopRailEast")],
    width: 0.12,
    targetId: "projects"
  },
  {
    points: [anchor("projectsEast"), [2.18, 0.82], anchor("experienceWest")],
    width: 0.12,
    targetId: "experience"
  },
  {
    points: [anchor("projectsEast"), [2.18, 0.34], anchor("experienceNorth")],
    width: 0.1,
    targetId: "experience"
  },
  {
    points: [anchor("experienceNorth"), [4.34, 0.26], [4.34, 1.26], anchor("contactSouthB")],
    width: 0.11,
    targetId: "contact"
  },
  {
    points: [anchor("projectsTopRailEast"), [2.62, 2.1], [2.62, 1.26], anchor("contactSouthA")],
    width: 0.11,
    targetId: "contact"
  }
];

const STATIC_TRACE_ROUTES: TraceRoute[] = [
  { points: [anchor("aboutPinB"), [-1.56, 1.16], anchor("aboutBus")], width: 0.08 },
  { points: [anchor("aboutPinC"), [-1.76, 0.7], anchor("aboutBus")], width: 0.08 },
  { points: [anchor("aboutPinD"), [-1.76, 0.24], [-1.16, 0.24], anchor("projectsWest")], width: 0.08 },
  { points: [anchor("aboutPinE"), [-1.56, -0.22], [-1.56, -0.34], anchor("projectsSouth")], width: 0.08 },
  { points: [anchor("aboutPinF"), [-1.66, -0.68], anchor("aboutLowerBus")], width: 0.08 },
  { points: [anchor("aboutPinG"), [-2.12, -1.14], [-2.12, -1.72], [-3.28, -1.72]], width: 0.08 },
  { points: [anchor("projectsNorth"), [0.18, 1.86], [0.18, 2.34]], width: 0.07 },
  { points: [anchor("projectsNorth"), [1.18, 1.86], [1.18, 2.18]], width: 0.07 },
  { points: [anchor("projectsSouth"), [0.42, -0.34], [0.42, -0.72]], width: 0.08 },
  { points: [anchor("projectsSouth"), [1.02, -0.34], [1.02, -0.72]], width: 0.08 },
  { points: [anchor("projectsSouth"), [0.72, -1.26], [0.72, -2.02], anchor("supportBottomModule")], width: 0.08 },
  { points: [anchor("projectsSouth"), [-0.92, -0.34], [-0.92, -1.62], anchor("supportBottomSwitch")], width: 0.08 },
  { points: [anchor("projectsWest"), [-1.2, 0.72], [-1.2, -0.62], anchor("supportDriver")], width: 0.08 },
  { points: [anchor("aboutLowerBus"), [-3.88, -1.18], anchor("supportRegulator")], width: 0.08 },
  { points: [anchor("supportRegulator"), [-4.72, -0.86], [-4.72, -1.82]], width: 0.08 },
  { points: [anchor("ledNode"), [-4.72, -1.94], [-4.72, -1.82]], width: 0.08 },
  { points: [anchor("buttonNode"), [-4.18, -2.4], [-4.18, -1.82], [-4.72, -1.82]], width: 0.08 },
  { points: [anchor("experienceSouth"), [3.25, -2.18], anchor("supportBarrel")], width: 0.08 },
  { points: [anchor("experienceEast"), [4.88, -0.82], [4.88, -0.28]], width: 0.08 },
  { points: [anchor("contactSouthA"), [3.48, 0.94], anchor("rightGoldPadA")], width: 0.08 },
  { points: [anchor("contactSouthB"), [4.64, 0.94], anchor("rightGoldPadB")], width: 0.08 },
  { points: [anchor("contactBus"), [4.82, 1.54]], width: 0.08 }
];

const BOARD_THICKNESS = 0.18;
const BOARD_TOP_Y = BOARD_THICKNESS / 2;
const EMPTY_VECTOR = new THREE.Vector3();

const BOARD_GREEN = "#72955b";
const BOARD_GREEN_SIDE = "#4e6740";
const BOARD_FRAME = "#435a36";
const BOARD_SURFACE_SHADE = "rgba(255, 255, 255, 0.06)";
const COPPER_COLOR = "#e9c857";
const COPPER_TRACE = "rgba(164, 142, 57, 0.72)";
const COPPER_DIM = "rgba(196, 171, 78, 0.48)";
const SILK_COLOR = "#eeefe5";
const SILK_SOFT = "rgba(238, 239, 229, 0.62)";
const CHIP_BODY_COLOR = "#454545";
const CHIP_TOP_COLOR = "#5a5a5a";
const CHIP_LABEL_LIGHT = "#f6f6ef";
const CREAM_PART = "#f7f4e7";
const VIA_RING_COLOR = "#e9cd59";
const VIA_DRILL_COLOR = "#4c6a3f";

const BOARD_LAYER_Y = {
  silkscreen: BOARD_TOP_Y + 0.003,
  copper: BOARD_TOP_Y + 0.01,
  via: BOARD_TOP_Y + 0.012,
  component: BOARD_TOP_Y + 0.016
} as const;

const RENDER_ORDER = {
  board: 1,
  silkscreen: 6,
  copper: 10,
  via: 12,
  component: 18
} as const;

function anchor(id: BoardAnchorId): [number, number] {
  const [x, z] = BOARD_ANCHORS[id];
  return [x, z];
}

function pointToCanvas(x: number, z: number, canvas: HTMLCanvasElement) {
  const u = (x - BOARD_BOUNDS.minX) / (BOARD_BOUNDS.maxX - BOARD_BOUNDS.minX);
  const v = 1 - (z - BOARD_BOUNDS.minZ) / (BOARD_BOUNDS.maxZ - BOARD_BOUNDS.minZ);
  return { x: u * canvas.width, y: v * canvas.height };
}

function makeBoardShape() {
  const shape = new THREE.Shape();
  BOARD_OUTLINE.forEach(([x, z], index) => {
    if (index === 0) {
      shape.moveTo(x, z);
    } else {
      shape.lineTo(x, z);
    }
  });
  shape.closePath();
  return shape;
}

function setStableTopLayerMesh(
  mesh: THREE.Mesh,
  renderOrder: number,
  polygonOffsetFactor: number,
  polygonOffsetUnits: number
) {
  mesh.renderOrder = renderOrder;
  if ("polygonOffset" in mesh.material) {
    const material = mesh.material as THREE.Material & {
      polygonOffset?: boolean;
      polygonOffsetFactor?: number;
      polygonOffsetUnits?: number;
    };
    material.polygonOffset = true;
    material.polygonOffsetFactor = polygonOffsetFactor;
    material.polygonOffsetUnits = polygonOffsetUnits;
  }
}

function createComponentLabelTexture(label: string, ref: string, light = false) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 700;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = light ? "#ededdf" : CHIP_TOP_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = light ? "rgba(74, 74, 58, 0.15)" : "rgba(245, 244, 231, 0.09)";
  ctx.lineWidth = 4;
  ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

  ctx.fillStyle = light ? "rgba(78, 69, 42, 0.78)" : "rgba(245, 244, 231, 0.7)";
  ctx.font = "600 34px IBM Plex Mono, monospace";
  ctx.textAlign = "left";
  ctx.fillText(ref, 74, 110);

  ctx.font = "700 114px IBM Plex Mono, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = light ? "rgba(58, 54, 41, 0.94)" : CHIP_LABEL_LIGHT;
  ctx.fillText(label, canvas.width / 2, canvas.height / 2 + 18);

  ctx.font = "500 28px IBM Plex Mono, monospace";
  ctx.textAlign = "left";
  ctx.fillStyle = light ? "rgba(78, 69, 42, 0.68)" : "rgba(245, 244, 231, 0.46)";
  ctx.fillText("TOP VIEW", 74, canvas.height - 80);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

function createBoardMaps(): BoardMaps {
  const canvas = document.createElement("canvas");
  canvas.width = 2400;
  canvas.height = 1440;
  const ctx = canvas.getContext("2d");
  const roughnessCanvas = document.createElement("canvas");
  roughnessCanvas.width = 2400;
  roughnessCanvas.height = 1440;
  const roughCtx = roughnessCanvas.getContext("2d");

  if (!ctx || !roughCtx) {
    return { color: null, roughness: null };
  }

  ctx.fillStyle = BOARD_GREEN;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = BOARD_SURFACE_SHADE;
  ctx.fillRect(canvas.width * 0.16, canvas.height * 0.08, canvas.width * 0.18, canvas.height * 0.82);
  ctx.fillRect(canvas.width * 0.48, canvas.height * 0.2, canvas.width * 0.18, canvas.height * 0.48);
  ctx.fillRect(canvas.width * 0.74, canvas.height * 0.16, canvas.width * 0.14, canvas.height * 0.66);

  ctx.strokeStyle = BOARD_FRAME;
  ctx.lineWidth = 7;
  ctx.beginPath();
  BOARD_OUTLINE.forEach(([x, z], index) => {
    const point = pointToCanvas(x, z, canvas);
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  BOARD_OUTLINE.forEach(([x, z], index) => {
    const point = pointToCanvas(x * 0.98, z * 0.975, canvas);
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = SILK_SOFT;
  ctx.lineWidth = 2.4;
  ctx.fillStyle = SILK_COLOR;

  NAV_COMPONENTS.forEach((component) => {
    const center = pointToCanvas(component.position.x, component.position.z, canvas);

    if (component.id === "contact") {
      ctx.beginPath();
      ctx.arc(center.x, center.y, 126, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = "600 20px IBM Plex Mono, monospace";
      ctx.fillText(component.ref, center.x - 72, center.y - 152);
      ctx.font = "500 15px IBM Plex Mono, monospace";
      ctx.fillText(component.label, center.x - 72, center.y + 156);
      return;
    }

    const width = (component.bodySize.x / (BOARD_BOUNDS.maxX - BOARD_BOUNDS.minX)) * canvas.width;
    const height = (component.bodySize.z / (BOARD_BOUNDS.maxZ - BOARD_BOUNDS.minZ)) * canvas.height;

    ctx.strokeRect(center.x - width / 2 - 18, center.y - height / 2 - 18, width + 36, height + 36);

    ctx.font = "600 20px IBM Plex Mono, monospace";
    ctx.fillText(component.ref, center.x - width / 2 - 8, center.y - height / 2 - 30);
    ctx.font = "500 15px IBM Plex Mono, monospace";
    ctx.fillText(component.label, center.x - width / 2 - 8, center.y + height / 2 + 28);
  });

  ctx.strokeStyle = COPPER_TRACE;
  ctx.lineCap = "round";
  STATIC_TRACE_ROUTES.forEach((route) => {
    ctx.lineWidth = Math.max(3, route.width * 26);
    ctx.beginPath();
    route.points.forEach(([x, z], index) => {
      const point = pointToCanvas(x, z, canvas);
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
  });

  ctx.strokeStyle = COPPER_DIM;
  TRACE_ROUTES.forEach((route) => {
    ctx.lineWidth = Math.max(4, route.width * 28);
    ctx.beginPath();
    route.points.forEach(([x, z], index) => {
      const point = pointToCanvas(x, z, canvas);
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
  });

  ctx.fillStyle = "rgba(232, 200, 87, 0.58)";
  [...VIA_POINTS, ...AUX_VIA_POINTS].forEach(([x, z]) => {
    const point = pointToCanvas(x, z, canvas);
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
    ctx.fill();
  });

  const supportRefs = [
    { ref: "Q1", x: -3.94, z: -0.86 },
    { ref: "U5", x: -1.68, z: -0.62 },
    { ref: "U6", x: 0.58, z: -2.02 },
    { ref: "Q3", x: 1.42, z: 2.18 },
    { ref: "J3", x: 4.08, z: -2.18 }
  ];

  ctx.font = "500 14px IBM Plex Mono, monospace";
  supportRefs.forEach((item) => {
    const point = pointToCanvas(item.x, item.z, canvas);
    ctx.fillText(item.ref, point.x - 24, point.y - 22);
  });

  TEST_POINTS.forEach((point) => {
    const canvasPoint = pointToCanvas(point.x, point.z, canvas);
    ctx.fillText(point.label, canvasPoint.x + 14, canvasPoint.y + 4);
  });

  ctx.fillStyle = "rgba(245, 247, 241, 0.8)";
  ctx.font = "600 28px IBM Plex Mono, monospace";
  const titlePoint = pointToCanvas(-4.96, 2.42, canvas);
  ctx.fillText("SHAIV RAMDHANI", titlePoint.x, titlePoint.y);
  ctx.font = "500 18px IBM Plex Mono, monospace";
  ctx.fillText("PORTFOLIO CONTROL BOARD  REV A", titlePoint.x, titlePoint.y + 32);

  roughCtx.fillStyle = "rgb(176,176,176)";
  roughCtx.fillRect(0, 0, roughnessCanvas.width, roughnessCanvas.height);
  for (let i = 0; i < 220; i += 1) {
    const value = 162 + Math.floor(Math.random() * 10);
    roughCtx.fillStyle = `rgb(${value},${value},${value})`;
    roughCtx.fillRect(
      Math.random() * roughnessCanvas.width,
      Math.random() * roughnessCanvas.height,
      28 + Math.random() * 84,
      18 + Math.random() * 56
    );
  }

  const color = new THREE.CanvasTexture(canvas);
  color.colorSpace = THREE.SRGBColorSpace;
  color.anisotropy = 8;
  color.minFilter = THREE.LinearMipmapLinearFilter;
  color.magFilter = THREE.LinearFilter;
  color.generateMipmaps = true;
  color.needsUpdate = true;

  const roughness = new THREE.CanvasTexture(roughnessCanvas);
  roughness.anisotropy = 8;
  roughness.minFilter = THREE.LinearMipmapLinearFilter;
  roughness.magFilter = THREE.LinearFilter;
  roughness.generateMipmaps = true;
  roughness.needsUpdate = true;

  return { color, roughness };
}

function createSegmentPlane<TMaterial extends THREE.Material>(length: number, width: number, material: TMaterial) {
  const geometry = new THREE.PlaneGeometry(length, width, 1, 1);
  geometry.rotateX(-Math.PI / 2);
  return new THREE.Mesh(geometry, material);
}

function addShadowCatcher(scene: THREE.Scene) {
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(20, 14), new THREE.ShadowMaterial({ opacity: 0.05 }));
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -0.5;
  plane.receiveShadow = false;
  scene.add(plane);
}

function addBoard(scene: THREE.Scene) {
  const maps = createBoardMaps();
  const geometry = new THREE.ShapeGeometry(makeBoardShape());
  geometry.rotateX(-Math.PI / 2);

  const underside = new THREE.Mesh(
    geometry,
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(BOARD_GREEN_SIDE),
      roughness: 0.96,
      metalness: 0.02
    })
  );
  underside.position.y = 0;
  underside.renderOrder = RENDER_ORDER.board;
  scene.add(underside);

  const board = new THREE.Mesh(
    geometry,
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(BOARD_GREEN),
      roughness: 0.88,
      metalness: 0.04,
      map: maps.color ?? undefined,
      roughnessMap: maps.roughness ?? undefined
    })
  );
  board.position.y = BOARD_TOP_Y;
  board.renderOrder = RENDER_ORDER.board;
  scene.add(board);
}

function addMountingHoles(scene: THREE.Scene) {
  const ringMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(VIA_RING_COLOR),
    roughness: 0.26,
    metalness: 0.68
  });
  const drillMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(VIA_DRILL_COLOR),
    roughness: 1,
    metalness: 0
  });

  [
    [-5.02, -2.08],
    [3.78, 0.94],
    [5.08, 0.94]
  ].forEach(([x, z]) => {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 22), ringMaterial);
    ring.position.set(x, BOARD_LAYER_Y.via, z);
    ring.renderOrder = RENDER_ORDER.via;
    scene.add(ring);

    const drill = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 20), drillMaterial);
    drill.position.set(x, BOARD_LAYER_Y.via + 0.001, z);
    scene.add(drill);
  });
}

function addVias(scene: THREE.Scene) {
  const ringMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(VIA_RING_COLOR),
    roughness: 0.28,
    metalness: 0.62
  });
  const drillMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(VIA_DRILL_COLOR),
    roughness: 1,
    metalness: 0
  });

  VIA_POINTS.forEach(([x, z]) => {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.015, 20), ringMaterial);
    ring.position.set(x, BOARD_LAYER_Y.via, z);
    ring.renderOrder = RENDER_ORDER.via;
    scene.add(ring);

    const drill = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.02, 18), drillMaterial);
    drill.position.set(x, BOARD_LAYER_Y.via + 0.001, z);
    scene.add(drill);
  });

  AUX_VIA_POINTS.forEach(([x, z]) => {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.014, 18), ringMaterial);
    ring.position.set(x, BOARD_LAYER_Y.via, z);
    ring.renderOrder = RENDER_ORDER.via;
    scene.add(ring);

    const drill = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.018, 16), drillMaterial);
    drill.position.set(x, BOARD_LAYER_Y.via + 0.001, z);
    scene.add(drill);
  });
}

function addPad(scene: THREE.Scene, spec: PadSpec, material: THREE.MeshPhysicalMaterial) {
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(spec.w, spec.h), material);
  pad.rotation.x = -Math.PI / 2;
  pad.rotation.z = spec.rotation ?? 0;
  pad.position.set(spec.x, BOARD_LAYER_Y.copper, spec.z);
  setStableTopLayerMesh(pad, RENDER_ORDER.copper, -1, -3);
  scene.add(pad);
}

function addCopperPads(scene: THREE.Scene) {
  const copperMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(COPPER_COLOR),
    roughness: 0.24,
    metalness: 0.82
  });

  const pads: PadSpec[] = [];

  for (let i = 0; i < 7; i += 1) {
    const z = 1.62 - i * 0.46;
    pads.push({ x: -2.18, z, w: 0.22, h: 0.14 });
  }

  for (let i = 0; i < 8; i += 1) {
    const offset = -0.77 + i * 0.22;
    pads.push({ x: 0.72 + offset, z: -0.18, w: 0.08, h: 0.18 });
    pads.push({ x: 0.72 + offset, z: 1.82, w: 0.08, h: 0.18 });
    pads.push({ x: -0.28, z: 0.82 + offset, w: 0.18, h: 0.08, rotation: Math.PI / 2 });
    pads.push({ x: 1.72, z: 0.82 + offset, w: 0.18, h: 0.08, rotation: Math.PI / 2 });
  }

  for (let i = 0; i < 6; i += 1) {
    const offset = -0.6 + i * 0.24;
    pads.push({ x: 2.42, z: -0.82 + offset, w: 0.18, h: 0.08, rotation: Math.PI / 2 });
    pads.push({ x: 4.08, z: -0.82 + offset, w: 0.18, h: 0.08, rotation: Math.PI / 2 });
  }

  pads.push({ x: 3.48, z: 1.26, w: 0.22, h: 0.18 });
  pads.push({ x: 4.64, z: 1.26, w: 0.22, h: 0.18 });
  pads.push(...EXTRA_COPPER_PADS);

  pads.forEach((pad) => addPad(scene, pad, copperMaterial));
}

function addRouteMeshes(
  scene: THREE.Scene,
  routes: TraceRoute[],
  interactive = false
) {
  const segments: TraceSegment[] = [];

  routes.forEach((route) => {
    route.points.slice(0, -1).forEach((point, index) => {
      const next = route.points[index + 1];
      const start = new THREE.Vector3(point[0], BOARD_LAYER_Y.copper, point[1]);
      const end = new THREE.Vector3(next[0], BOARD_LAYER_Y.copper, next[1]);
      const vector = new THREE.Vector3().subVectors(end, start);
      const length = vector.length();
      const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      const angle = Math.atan2(vector.z, vector.x);

      const material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(COPPER_COLOR),
        roughness: 0.24,
        metalness: 0.82,
        emissive: new THREE.Color("#000000"),
        emissiveIntensity: interactive ? 0.015 : 0
      });

      const mesh = createSegmentPlane(length, route.width, material);
      mesh.position.copy(center);
      mesh.rotation.y = -angle;
      setStableTopLayerMesh(mesh, RENDER_ORDER.copper, -1, interactive ? -4 : -3);
      scene.add(mesh);

      if (interactive) {
        segments.push({
          material,
          targetId: route.targetId,
          baseEmissive: 0.015,
          phase: index * 0.35 + (route.targetId?.length ?? 1)
        });
      }
    });
  });

  return segments;
}

function addStaticCopper(scene: THREE.Scene) {
  addRouteMeshes(scene, STATIC_TRACE_ROUTES);
}

function addTraces(scene: THREE.Scene) {
  return addRouteMeshes(scene, TRACE_ROUTES, true);
}

function addPassiveComponents(scene: THREE.Scene) {
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(CREAM_PART),
    roughness: 0.86,
    metalness: 0.02
  });
  const endMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(COPPER_COLOR),
    roughness: 0.24,
    metalness: 0.74
  });

  SUPPORT_PASSIVES.forEach((passive) => {
    const group = new THREE.Group();

    const body = new THREE.Mesh(new THREE.BoxGeometry(passive.w, 0.06, passive.d), bodyMaterial);
    body.position.set(0, BOARD_LAYER_Y.component + 0.03, 0);
    const endA = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.062, passive.d + 0.02), endMaterial);
    endA.position.set(-passive.w / 2 - 0.02, BOARD_LAYER_Y.component + 0.03, 0);
    const endB = endA.clone();
    endB.position.x = passive.w / 2 + 0.02;

    group.add(body, endA, endB);
    group.position.set(passive.x, 0, passive.z);
    group.rotation.y = passive.rotation ?? 0;
    scene.add(group);
  });
}

function addSmallSupportChips(scene: THREE.Scene) {
  const darkBody = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(CHIP_BODY_COLOR),
    roughness: 0.94,
    metalness: 0.04
  });
  const lighterBody = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#3a3a3a"),
    roughness: 0.96,
    metalness: 0.02
  });
  const shieldBody = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#2f2f2f"),
    roughness: 0.8,
    metalness: 0.08
  });
  const metalMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(COPPER_COLOR),
    roughness: 0.24,
    metalness: 0.78
  });

  SUPPORT_CHIPS.forEach((chip) => {
    const group = new THREE.Group();

    if (chip.kind === "module") {
      const body = new THREE.Mesh(new THREE.BoxGeometry(chip.w, chip.h, chip.d), shieldBody);
      body.position.y = BOARD_LAYER_Y.component + chip.h / 2;
      group.add(body);

      const sideTab = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, chip.d * 0.7), metalMaterial);
      sideTab.position.set(chip.w / 2 + 0.05, BOARD_LAYER_Y.component + 0.02, 0);
      group.add(sideTab);
    } else {
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(chip.w, chip.h, chip.d),
        chip.kind === "power" ? lighterBody : darkBody
      );
      body.position.y = BOARD_LAYER_Y.component + chip.h / 2;
      group.add(body);

      if (chip.kind === "power") {
        const tab = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, chip.d * 0.44), metalMaterial);
        tab.position.set(chip.w / 2 + 0.12, BOARD_LAYER_Y.component + 0.018, 0);
        group.add(tab);
      }

      if (chip.kind === "soic" && chip.pins) {
        for (let i = 0; i < chip.pins; i += 1) {
          const offset = (-((chip.pins - 1) / 2) + i) * 0.22;
          const west = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.016, 0.05), metalMaterial);
          west.position.set(-chip.w / 2 - 0.04, BOARD_LAYER_Y.component + 0.012, offset);
          const east = west.clone();
          east.position.x = chip.w / 2 + 0.04;
          group.add(west, east);
        }
      }

      if (chip.kind === "sot23") {
        for (let i = 0; i < 2; i += 1) {
          const pin = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.016, 0.04), metalMaterial);
          pin.position.set(-chip.w / 2 - 0.03, BOARD_LAYER_Y.component + 0.012, -0.09 + i * 0.18);
          const mate = pin.clone();
          mate.position.x = chip.w / 2 + 0.03;
          group.add(pin, mate);
        }
        const lower = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.016, 0.05), metalMaterial);
        lower.position.set(0, BOARD_LAYER_Y.component + 0.012, chip.d / 2 + 0.05);
        group.add(lower);
      }
    }

    group.position.set(chip.x, 0, chip.z);
    group.rotation.y = chip.rotation ?? 0;
    scene.add(group);
  });
}

function addUtilityParts(scene: THREE.Scene) {
  const copper = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(COPPER_COLOR),
    roughness: 0.22,
    metalness: 0.8
  });
  const darkPlastic = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#343434"),
    roughness: 0.94,
    metalness: 0.04
  });
  const greyPlastic = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#8e8d88"),
    roughness: 0.9,
    metalness: 0.02
  });

  const ledBody = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.18, 0.34, 6, 12),
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#59c746"),
      roughness: 0.32,
      transmission: 0.18,
      thickness: 0.2,
      metalness: 0
    })
  );
  ledBody.rotation.z = Math.PI / 2;
  ledBody.position.set(-4.96, 0.28, -1.98);
  scene.add(ledBody);

  const ledPad = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.014, 18), copper);
  ledPad.position.set(-4.6, BOARD_LAYER_Y.copper, -1.98);
  ledPad.renderOrder = RENDER_ORDER.copper;
  scene.add(ledPad);

  const buttonBody = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.18, 0.34), greyPlastic);
  buttonBody.position.set(-4.54, 0.18, -2.42);
  scene.add(buttonBody);

  const buttonTop = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 18), darkPlastic);
  buttonTop.position.set(-4.54, 0.26, -2.42);
  scene.add(buttonTop);

  const barrel = new THREE.Group();
  const barrelBody = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.98, 22), darkPlastic);
  barrelBody.rotation.z = Math.PI / 2;
  barrel.add(barrelBody);

  const barrelTip = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.16), copper);
  barrelTip.position.set(0.58, 0, 0);
  barrel.add(barrelTip);

  barrel.position.set(4.08, 0.22, -2.18);
  scene.add(barrel);

  TEST_POINTS.forEach((point) => {
    if (point.kind === "ring") {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.026, 10, 20), copper);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(point.x, BOARD_TOP_Y + 0.05, point.z);
      scene.add(ring);
      return;
    }

    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.014, 18), copper);
    pad.position.set(point.x, BOARD_LAYER_Y.copper, point.z);
    pad.renderOrder = RENDER_ORDER.copper;
    scene.add(pad);
  });
}

function addAboutModule(scene: THREE.Scene, visuals: Map<NavTargetId, NavVisual>, spec: NavComponentSpec) {
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#5c5c5c"),
    roughness: 0.92,
    metalness: 0.04,
    emissive: new THREE.Color("#000000"),
    emissiveIntensity: 0
  });
  const insertMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#666666"),
    roughness: 0.96,
    metalness: 0.02,
    emissive: new THREE.Color("#000000"),
    emissiveIntensity: 0
  });
  const ceramicMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#f5f2e9"),
    roughness: 0.86,
    metalness: 0.02
  });
  const metalMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(COPPER_COLOR),
    roughness: 0.24,
    metalness: 0.76,
    emissive: new THREE.Color("#000000"),
    emissiveIntensity: 0
  });

  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(spec.bodySize.x, spec.bodySize.y, spec.bodySize.z), bodyMaterial);
  body.position.y = spec.bodySize.y / 2;
  group.add(body);

  const insert = new THREE.Mesh(new THREE.BoxGeometry(spec.bodySize.x * 0.82, 0.014, spec.bodySize.z * 0.82), insertMaterial);
  insert.position.y = spec.bodySize.y + 0.009;
  group.add(insert);

  const labelTexture = createComponentLabelTexture(spec.label, spec.ref);
  const labelPlate = new THREE.Mesh(
    new THREE.BoxGeometry(spec.bodySize.x * 0.64, 0.012, spec.bodySize.z * 0.52),
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#686868"),
      roughness: 0.92,
      metalness: 0.04,
      map: labelTexture ?? undefined,
      emissive: new THREE.Color("#000000"),
      emissiveIntensity: 0
    })
  );
  labelPlate.position.set(-0.12, spec.bodySize.y + 0.02, 0.18);
  group.add(labelPlate);

  for (let i = 0; i < 7; i += 1) {
    const z = 0.92 - i * 0.46;

    const ceramic = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.08, 0.14), ceramicMaterial);
    ceramic.position.set(spec.bodySize.x / 2 - 0.02, 0.07, z);
    group.add(ceramic);

    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.082, 0.14), metalMaterial);
    tip.position.set(spec.bodySize.x / 2 + 0.44, 0.07, z);
    group.add(tip);
  }

  group.position.copy(spec.position);
  group.userData.navTargetId = spec.id;
  scene.add(group);

  visuals.set(spec.id, {
    root: group,
    materials: [bodyMaterial, insertMaterial, metalMaterial]
  });
}

function addRectChip(
  scene: THREE.Scene,
  visuals: Map<NavTargetId, NavVisual>,
  spec: NavComponentSpec
) {
  const lightTop = spec.id === "experience";
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(lightTop ? "#4b4b4b" : CHIP_BODY_COLOR),
    roughness: 0.94,
    metalness: 0.04,
    emissive: new THREE.Color("#000000"),
    emissiveIntensity: 0
  });
  const topMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(lightTop ? "#5f5f5f" : CHIP_TOP_COLOR),
    roughness: 0.95,
    metalness: 0.04,
    map: createComponentLabelTexture(spec.label, spec.ref, false) ?? undefined,
    emissive: new THREE.Color("#000000"),
    emissiveIntensity: 0
  });
  const pinMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(COPPER_COLOR),
    roughness: 0.24,
    metalness: 0.76,
    emissive: new THREE.Color("#000000"),
    emissiveIntensity: 0
  });

  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(spec.bodySize.x, spec.bodySize.y, spec.bodySize.z), bodyMaterial);
  body.position.y = spec.bodySize.y / 2;
  group.add(body);

  const topInset = new THREE.Mesh(
    new THREE.BoxGeometry(spec.bodySize.x * 0.8, 0.012, spec.bodySize.z * 0.76),
    topMaterial
  );
  topInset.position.y = spec.bodySize.y + 0.01;
  group.add(topInset);

  const marker = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.012, 18),
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(SILK_COLOR),
      roughness: 0.9,
      metalness: 0.02
    })
  );
  marker.rotation.x = Math.PI / 2;
  marker.position.set(-spec.bodySize.x * 0.28, spec.bodySize.y + 0.014, -spec.bodySize.z * 0.24);
  group.add(marker);

  if (spec.kind === "qfp") {
    for (let i = 0; i < 8; i += 1) {
      const offset = -0.77 + i * 0.22;
      const north = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.018, 0.16), pinMaterial);
      north.position.set(offset, 0.02, -spec.bodySize.z / 2 - 0.06);
      const south = north.clone();
      south.position.z = spec.bodySize.z / 2 + 0.06;
      group.add(north, south);

      const west = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.018, 0.05), pinMaterial);
      west.position.set(-spec.bodySize.x / 2 - 0.06, 0.02, offset);
      const east = west.clone();
      east.position.x = spec.bodySize.x / 2 + 0.06;
      group.add(west, east);
    }
  } else {
    for (let i = 0; i < 6; i += 1) {
      const offset = -0.6 + i * 0.24;
      const west = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.018, 0.05), pinMaterial);
      west.position.set(-spec.bodySize.x / 2 - 0.05, 0.02, offset);
      const east = west.clone();
      east.position.x = spec.bodySize.x / 2 + 0.05;
      group.add(west, east);
    }
  }

  group.position.copy(spec.position);
  group.userData.navTargetId = spec.id;
  scene.add(group);

  visuals.set(spec.id, {
    root: group,
    materials: [bodyMaterial, topMaterial, pinMaterial]
  });
}

function addContactCan(scene: THREE.Scene, visuals: Map<NavTargetId, NavVisual>, spec: NavComponentSpec) {
  const group = new THREE.Group();
  const sleeveMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#232323"),
    roughness: 0.84,
    metalness: 0.08,
    emissive: new THREE.Color("#000000"),
    emissiveIntensity: 0
  });
  const topMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#f1f1ef"),
    roughness: 0.58,
    metalness: 0.06,
    map: createComponentLabelTexture("CONTACT", spec.ref, true) ?? undefined,
    emissive: new THREE.Color("#000000"),
    emissiveIntensity: 0
  });
  const pinMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(COPPER_COLOR),
    roughness: 0.24,
    metalness: 0.78,
    emissive: new THREE.Color("#000000"),
    emissiveIntensity: 0
  });

  const canBody = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.76, 0.58, 36), sleeveMaterial);
  canBody.position.y = 0.29;
  group.add(canBody);

  const canTop = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.09, 36), topMaterial);
  canTop.position.y = 0.58;
  group.add(canTop);

  const sheen = new THREE.Mesh(
    new THREE.RingGeometry(0.52, 0.68, 34),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color("#ffffff"),
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide
    })
  );
  sheen.rotation.x = -Math.PI / 2;
  sheen.position.y = 0.626;
  group.add(sheen);

  const leadA = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.24), pinMaterial);
  leadA.position.set(-0.5, 0.02, -0.72);
  const leadB = leadA.clone();
  leadB.position.x = 0.5;
  group.add(leadA, leadB);

  group.position.copy(spec.position);
  group.userData.navTargetId = spec.id;
  scene.add(group);

  visuals.set(spec.id, {
    root: group,
    materials: [sleeveMaterial, topMaterial, pinMaterial]
  });
}

function addNavigationComponents(scene: THREE.Scene) {
  const visuals = new Map<NavTargetId, NavVisual>();

  addAboutModule(scene, visuals, NAV_COMPONENTS[0]);
  addRectChip(scene, visuals, NAV_COMPONENTS[1]);
  addRectChip(scene, visuals, NAV_COMPONENTS[2]);
  addContactCan(scene, visuals, NAV_COMPONENTS[3]);

  return visuals;
}

function updateNavVisuals(
  visuals: Map<NavTargetId, NavVisual>,
  activeTargetId: NavTargetId | null,
  elapsed: number,
  reducedMotion: boolean,
  glowStrength: number
) {
  visuals.forEach((visual, id) => {
    const base = activeTargetId === id ? 0.045 * glowStrength : 0;
    const pulse = reducedMotion ? 0 : Math.sin(elapsed * 1.1 + id.length) * 0.004 * glowStrength;
    visual.materials.forEach((material) => {
      material.emissive.set("#f1f4df");
      material.emissiveIntensity = Math.max(0, base + pulse);
    });
  });
}

function getProjectedBounds(object: THREE.Object3D, camera: THREE.Camera, host: HTMLElement) {
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) return null;

  const corners = [
    new THREE.Vector3(box.min.x, box.min.y, box.min.z),
    new THREE.Vector3(box.min.x, box.min.y, box.max.z),
    new THREE.Vector3(box.min.x, box.max.y, box.min.z),
    new THREE.Vector3(box.min.x, box.max.y, box.max.z),
    new THREE.Vector3(box.max.x, box.min.y, box.min.z),
    new THREE.Vector3(box.max.x, box.min.y, box.max.z),
    new THREE.Vector3(box.max.x, box.max.y, box.min.z),
    new THREE.Vector3(box.max.x, box.max.y, box.max.z)
  ];

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  corners.forEach((corner) => {
    const projected = corner.project(camera);
    minX = Math.min(minX, projected.x);
    minY = Math.min(minY, projected.y);
    maxX = Math.max(maxX, projected.x);
    maxY = Math.max(maxY, projected.y);
  });

  const width = host.clientWidth;
  const height = host.clientHeight;
  const padding = 8;
  const left = ((minX + 1) / 2) * width - padding;
  const right = ((maxX + 1) / 2) * width + padding;
  const top = ((1 - maxY) / 2) * height - padding;
  const bottom = ((1 - minY) / 2) * height + padding;

  return {
    left: Math.max(0, left),
    top: Math.max(0, top),
    width: Math.max(44, Math.min(width, right) - Math.max(0, left)),
    height: Math.max(44, Math.min(height, bottom) - Math.max(0, top))
  };
}

function findNavTargetId(object: THREE.Object3D | null): NavTargetId | null {
  let current: THREE.Object3D | null = object;

  while (current) {
    const targetId = current.userData.navTargetId;
    if (
      targetId === "about" ||
      targetId === "projects" ||
      targetId === "experience" ||
      targetId === "contact"
    ) {
      return targetId;
    }
    current = current.parent;
  }

  return null;
}

export function initPcbLandingScene(host: HTMLElement, options: InitOptions): SceneController {
  const renderer = new THREE.WebGLRenderer({
    antialias: !options.mobile,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, options.mobile ? 1.1 : 1.45));
  renderer.setSize(host.clientWidth, host.clientHeight);
  renderer.domElement.style.opacity = String(options.sceneOpacity);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const raycaster = new THREE.Raycaster();
  const normalizedPointer = new THREE.Vector2();

  const aspect = host.clientWidth / host.clientHeight;
  const frustum = options.mobile ? 8.7 : 7.9;
  const camera = new THREE.OrthographicCamera(
    (-frustum * aspect) / 2,
    (frustum * aspect) / 2,
    frustum / 2,
    -frustum / 2,
    0.1,
    50
  );
  camera.position.set(0, 11, 0.18);
  camera.lookAt(0, 0, 0);

  const ambient = new THREE.HemisphereLight(0xf3f0e5, 0x556747, 1.16);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xf9f7f0, 0.5);
  key.position.set(0.8, 9.8, 0.24);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xd9dfd1, 0.16);
  fill.position.set(-2.2, 7.6, -0.8);
  scene.add(fill);

  addShadowCatcher(scene);
  addBoard(scene);
  addMountingHoles(scene);
  addCopperPads(scene);
  addStaticCopper(scene);
  addVias(scene);
  const visuals = addNavigationComponents(scene);
  addPassiveComponents(scene);
  addSmallSupportChips(scene);
  addUtilityParts(scene);
  const traceSegments = addTraces(scene);

  const interactionTarget = options.interactionTarget ?? host;
  const pointer = { x: 0, y: 0 };
  const boardOffset = new THREE.Vector3();
  const lookTarget = new THREE.Vector3(0, 0.04, 0.08);
  let forcedTargetId: NavTargetId | null = null;
  let pointerTargetId: NavTargetId | null = null;
  let currentActiveTargetId: NavTargetId | null = null;
  let destroyed = false;
  const startTime = performance.now();

  const interactiveRoots = Array.from(visuals.values()).map((visual) => visual.root);

  const updateActiveTarget = () => {
    const next = forcedTargetId ?? pointerTargetId;
    if (next === currentActiveTargetId) return;
    currentActiveTargetId = next;
    options.onActiveTargetChange?.(currentActiveTargetId);
  };

  const syncNavElements = () => {
    if (!options.navElements) return;

    (Object.entries(options.navElements) as Array<[NavTargetId, HTMLAnchorElement | undefined]>).forEach(
      ([targetId, element]) => {
        if (!element) return;
        const visual = visuals.get(targetId);
        if (!visual) return;
        const bounds = getProjectedBounds(visual.root, camera, host);
        if (!bounds) return;
        element.style.left = `${bounds.left}px`;
        element.style.top = `${bounds.top}px`;
        element.style.width = `${bounds.width}px`;
        element.style.height = `${bounds.height}px`;
      }
    );
  };

  const pickTargetAtClientPoint = (clientX: number, clientY: number) => {
    const bounds = host.getBoundingClientRect();
    normalizedPointer.x = ((clientX - bounds.left) / bounds.width) * 2 - 1;
    normalizedPointer.y = -(((clientY - bounds.top) / bounds.height) * 2 - 1);
    raycaster.setFromCamera(normalizedPointer, camera);
    const intersection = raycaster.intersectObjects(interactiveRoots, true)[0];
    return findNavTargetId(intersection?.object ?? null);
  };

  const handlePointerMove = (event: PointerEvent) => {
    const bounds = interactionTarget.getBoundingClientRect();
    pointer.x = (event.clientX - bounds.left) / bounds.width - 0.5;
    pointer.y = (event.clientY - bounds.top) / bounds.height - 0.5;
    pointerTargetId = pickTargetAtClientPoint(event.clientX, event.clientY);
    updateActiveTarget();
    interactionTarget.style.cursor = pointerTargetId ? "pointer" : "default";
    options.onPointerMove?.({ x: pointer.x + 0.5, y: pointer.y + 0.5 });
  };

  const handlePointerLeave = () => {
    pointer.x = 0;
    pointer.y = 0;
    pointerTargetId = null;
    updateActiveTarget();
    interactionTarget.style.cursor = "default";
    options.onPointerMove?.({ x: 0.74, y: 0.34 });
  };

  const handleClick = (event: MouseEvent) => {
    if ((event.target as HTMLElement | null)?.closest("[data-nav-target]")) return;
    const targetId = pickTargetAtClientPoint(event.clientX, event.clientY);
    const href = targetId ? options.navElements?.[targetId]?.href : null;
    if (!href) return;
    window.location.assign(href);
  };

  interactionTarget.addEventListener("pointermove", handlePointerMove, { passive: true });
  interactionTarget.addEventListener("pointerleave", handlePointerLeave, { passive: true });
  interactionTarget.addEventListener("click", handleClick);

  const resize = () => {
    if (!host.isConnected) return;
    const width = host.clientWidth;
    const height = host.clientHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, options.mobile ? 1.1 : 1.45));
    renderer.setSize(width, height, false);
    const nextAspect = width / height;
    camera.left = (-frustum * nextAspect) / 2;
    camera.right = (frustum * nextAspect) / 2;
    camera.top = frustum / 2;
    camera.bottom = -frustum / 2;
    camera.updateProjectionMatrix();
    syncNavElements();
  };

  window.addEventListener("resize", resize);

  const animate = () => {
    if (destroyed) return;

    const elapsed = (performance.now() - startTime) / 1000;

    traceSegments.forEach((segment) => {
      const highlight = currentActiveTargetId === segment.targetId ? 0.12 * options.glowStrength : 0;
      const pulse = options.reducedMotion ? 0 : Math.sin(elapsed * (0.8 + options.flowSpeed * 0.35) + segment.phase) * 0.01;
      segment.material.emissive.set("#e4e3bf");
      segment.material.emissiveIntensity = Math.max(0, segment.baseEmissive + highlight + pulse);
    });

    updateNavVisuals(visuals, currentActiveTargetId, elapsed, options.reducedMotion, options.glowStrength);

    if (!options.reducedMotion && !options.mobile) {
      boardOffset.x += ((pointer.x * 0.02) - boardOffset.x) * 0.05;
      boardOffset.z += ((pointer.y * 0.018) - boardOffset.z) * 0.05;
      camera.position.x += ((pointer.x * 0.016) - camera.position.x) * 0.04;
      camera.position.z += ((0.18 + pointer.y * 0.01) - camera.position.z) * 0.04;
    } else {
      boardOffset.lerp(EMPTY_VECTOR, 0.08);
    }

    lookTarget.x = boardOffset.x;
    lookTarget.z = boardOffset.z;
    camera.lookAt(lookTarget);

    syncNavElements();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();

  return {
    setActiveNavTarget(targetId) {
      if (
        targetId === "about" ||
        targetId === "projects" ||
        targetId === "experience" ||
        targetId === "contact"
      ) {
        forcedTargetId = targetId;
        updateActiveTarget();
        return;
      }

      forcedTargetId = null;
      updateActiveTarget();
    },
    destroy() {
      destroyed = true;
      window.removeEventListener("resize", resize);
      interactionTarget.removeEventListener("pointermove", handlePointerMove);
      interactionTarget.removeEventListener("pointerleave", handlePointerLeave);
      interactionTarget.removeEventListener("click", handleClick);
      renderer.dispose();
      host.innerHTML = "";
    }
  };
}
