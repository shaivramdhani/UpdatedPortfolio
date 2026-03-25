import * as THREE from "three";

type Pointer = {
  x: number;
  y: number;
};

type NavTargetId = "projects" | "experience" | "personal" | "about" | "contact";

type TraceRoute = {
  points: Array<[number, number]>;
  width: number;
  startupDelay: number;
  startupDuration: number;
  ambient: boolean;
  ambientDelay?: number;
  ambientDuration?: number;
  targetId?: NavTargetId;
};

type StaticTraceRoute = {
  points: Array<[number, number]>;
  width: number;
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

type TraceUniforms = {
  uTime: { value: number };
  uStart: { value: number };
  uStartupDuration: { value: number };
  uAmbientStart: { value: number };
  uAmbientDuration: { value: number };
  uAmbientEnabled: { value: number };
  uGlowStrength: { value: number };
  uReducedMotion: { value: number };
  uHoverBoost: { value: number };
};

type TraceSegment = {
  copper: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshPhysicalMaterial>;
  core: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  halo: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  uniforms: TraceUniforms;
  targetId?: NavTargetId;
};

type BoardMaps = {
  color: THREE.CanvasTexture | null;
  roughness: THREE.CanvasTexture | null;
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
  position: THREE.Vector3;
  bodySize: THREE.Vector3;
};

const BOARD_OUTLINE: Array<[number, number]> = [
  [-4.66, -3.18],
  [4.66, -3.18],
  [5.58, -2.26],
  [5.58, 2.26],
  [4.66, 3.18],
  [-4.66, 3.18],
  [-5.58, 2.26],
  [-5.58, -2.26]
];

const BOARD_BOUNDS = {
  minX: -5.58,
  maxX: 5.58,
  minZ: -3.18,
  maxZ: 3.18
};

const NAV_COMPONENTS: NavComponentSpec[] = [
  {
    id: "projects",
    label: "PROJECTS",
    ref: "U1",
    position: new THREE.Vector3(0.0, 0.37, 0.08),
    bodySize: new THREE.Vector3(2.78, 0.34, 2.52)
  },
  {
    id: "experience",
    label: "EXPERIENCE",
    ref: "U2",
    position: new THREE.Vector3(2.64, 0.36, -0.74),
    bodySize: new THREE.Vector3(2.32, 0.34, 1.72)
  },
  {
    id: "personal",
    label: "PERSONAL",
    ref: "U4",
    position: new THREE.Vector3(2.84, 0.25, 1.56),
    bodySize: new THREE.Vector3(1.58, 0.22, 1.02)
  },
  {
    id: "about",
    label: "ABOUT",
    ref: "U3",
    position: new THREE.Vector3(-2.5, 0.24, -1.18),
    bodySize: new THREE.Vector3(1.74, 0.2, 0.88)
  },
  {
    id: "contact",
    label: "CONTACT",
    ref: "J1",
    position: new THREE.Vector3(-4.34, 0.32, 0.56),
    bodySize: new THREE.Vector3(1.08, 0.54, 1.44)
  }
];

const TRACE_ROUTES: TraceRoute[] = [
  {
    points: [
      [-4.96, 0.56],
      [-4.08, 0.56],
      [-4.08, 0.04],
      [-2.62, 0.04],
      [-1.02, 0.04]
    ],
    width: 0.26,
    startupDelay: 0.12,
    startupDuration: 1.18,
    ambient: true,
    ambientDelay: 5.1,
    ambientDuration: 10.4,
    targetId: "projects"
  },
  {
    points: [
      [-1.02, 0.04],
      [0.0, 0.04],
      [0.0, 1.12]
    ],
    width: 0.28,
    startupDelay: 0.82,
    startupDuration: 0.84,
    ambient: true,
    ambientDelay: 5.8,
    ambientDuration: 9.8,
    targetId: "projects"
  },
  {
    points: [
      [-1.02, 0.04],
      [-1.02, -1.18],
      [-2.5, -1.18]
    ],
    width: 0.18,
    startupDelay: 1.18,
    startupDuration: 0.86,
    ambient: true,
    ambientDelay: 7.1,
    ambientDuration: 11.4,
    targetId: "about"
  },
  {
    points: [
      [-1.02, 0.04],
      [0.98, 0.04],
      [0.98, -0.74],
      [2.64, -0.74]
    ],
    width: 0.22,
    startupDelay: 1.36,
    startupDuration: 1.02,
    ambient: true,
    ambientDelay: 6.4,
    ambientDuration: 10.6,
    targetId: "experience"
  },
  {
    points: [
      [0.0, 1.12],
      [0.0, 1.86],
      [2.16, 1.86],
      [2.16, 1.56]
    ],
    width: 0.18,
    startupDelay: 1.74,
    startupDuration: 0.98,
    ambient: true,
    ambientDelay: 7.6,
    ambientDuration: 11.8,
    targetId: "personal"
  },
  {
    points: [
      [0.98, -0.74],
      [3.58, -0.74],
      [3.58, -0.14]
    ],
    width: 0.14,
    startupDelay: 2.2,
    startupDuration: 0.86,
    ambient: false,
    targetId: "experience"
  },
  {
    points: [
      [-2.5, -1.18],
      [-2.5, -2.02],
      [-1.1, -2.02]
    ],
    width: 0.12,
    startupDelay: 1.92,
    startupDuration: 0.74,
    ambient: false,
    targetId: "about"
  },
  {
    points: [
      [2.16, 1.56],
      [3.72, 1.56],
      [3.72, 2.24]
    ],
    width: 0.12,
    startupDelay: 2.18,
    startupDuration: 0.78,
    ambient: false,
    targetId: "personal"
  },
  {
    points: [
      [-4.34, 1.06],
      [-4.34, 1.56],
      [-3.14, 1.56]
    ],
    width: 0.12,
    startupDelay: 0.34,
    startupDuration: 0.6,
    ambient: false,
    targetId: "contact"
  }
];

const STATIC_TRACE_ROUTES: StaticTraceRoute[] = [
  { points: [[-4.62, -1.52], [-3.84, -1.52], [-3.84, -0.52], [-2.94, -0.52]], width: 0.1 },
  { points: [[-4.44, -0.96], [-3.42, -0.96], [-3.42, -1.76], [-2.74, -1.76]], width: 0.08 },
  { points: [[-3.72, 2.26], [-2.54, 2.26], [-2.54, 1.64], [-1.48, 1.64]], width: 0.09 },
  { points: [[-2.1, 2.48], [-0.8, 2.48], [-0.8, 2.04], [0.84, 2.04]], width: 0.12 },
  { points: [[0.46, -2.46], [1.84, -2.46], [1.84, -1.98], [2.94, -1.98]], width: 0.1 },
  { points: [[2.34, -2.36], [3.38, -2.36], [3.38, -1.62], [4.12, -1.62]], width: 0.08 },
  { points: [[3.1, 0.42], [4.54, 0.42], [4.54, 1.18]], width: 0.1 },
  { points: [[2.28, 2.54], [3.12, 2.54], [3.12, 2.18], [4.32, 2.18]], width: 0.08 },
  { points: [[-0.82, -0.88], [-0.82, -1.74], [0.22, -1.74]], width: 0.08 },
  { points: [[0.82, 0.96], [1.68, 0.96], [1.68, 1.44]], width: 0.08 },
  { points: [[1.42, 0.54], [2.12, 0.54], [2.12, 1.04], [2.84, 1.04]], width: 0.1 },
  { points: [[-3.12, 0.84], [-2.26, 0.84], [-2.26, 1.28], [-1.62, 1.28]], width: 0.08 },
  { points: [[-4.92, 2.02], [-4.22, 2.02], [-4.22, 2.44]], width: 0.08 },
  { points: [[4.42, -0.32], [4.86, -0.32], [4.86, 0.62]], width: 0.08 },
  { points: [[-1.44, -2.54], [-0.32, -2.54], [-0.32, -2.2]], width: 0.08 },
  { points: [[-1.62, 1.92], [-1.62, 1.22], [-2.08, 1.22]], width: 0.07 },
  { points: [[1.62, 1.94], [1.62, 1.24], [1.18, 1.24]], width: 0.07 },
  { points: [[0.86, -1.22], [0.86, -1.78], [1.42, -1.78]], width: 0.07 },
  { points: [[2.56, -1.38], [2.56, -1.92], [3.08, -1.92]], width: 0.07 },
  { points: [[2.84, 0.24], [3.54, 0.24], [3.54, 0.82]], width: 0.07 },
  { points: [[-3.08, 0.34], [-3.08, 1.02], [-3.64, 1.02]], width: 0.07 },
  { points: [[-4.8, 0.02], [-4.8, -0.82], [-4.22, -0.82]], width: 0.07 },
  { points: [[4.42, 1.92], [4.42, 1.24], [4.84, 1.24]], width: 0.07 },
  { points: [[3.22, 2.58], [2.32, 2.58], [2.32, 2.16]], width: 0.07 },
  { points: [[-2.64, -2.54], [-2.64, -1.94], [-3.18, -1.94]], width: 0.07 },
  { points: [[-4.96, 1.9], [-4.1, 1.9], [-4.1, 1.16], [-3.42, 1.16]], width: 0.06 },
  { points: [[-4.52, 1.38], [-3.76, 1.38], [-3.76, 0.74], [-3.16, 0.74]], width: 0.05 },
  { points: [[-4.16, 0.28], [-3.24, 0.28], [-3.24, -0.22], [-2.64, -0.22]], width: 0.05 },
  { points: [[-3.56, -2.08], [-2.86, -2.08], [-2.86, -1.44], [-2.18, -1.44]], width: 0.06 },
  { points: [[-2.18, 2.74], [-1.34, 2.74], [-1.34, 2.18], [-0.58, 2.18]], width: 0.05 },
  { points: [[-0.34, 2.48], [0.42, 2.48], [0.42, 2.12], [1.24, 2.12]], width: 0.05 },
  { points: [[0.58, 2.34], [1.58, 2.34], [1.58, 1.96], [2.3, 1.96]], width: 0.06 },
  { points: [[1.22, 2.66], [2.18, 2.66], [2.18, 2.18], [3.04, 2.18]], width: 0.05 },
  { points: [[3.14, 2.52], [4.04, 2.52], [4.04, 1.98], [4.62, 1.98]], width: 0.05 },
  { points: [[4.46, 1.46], [3.8, 1.46], [3.8, 0.9], [3.08, 0.9]], width: 0.05 },
  { points: [[4.72, 0.34], [3.92, 0.34], [3.92, -0.32], [3.24, -0.32]], width: 0.06 },
  { points: [[4.34, -0.76], [3.46, -0.76], [3.46, -1.34], [2.82, -1.34]], width: 0.05 },
  { points: [[4.72, -1.82], [3.94, -1.82], [3.94, -2.26], [3.24, -2.26]], width: 0.05 },
  { points: [[2.24, -2.62], [1.32, -2.62], [1.32, -2.12], [0.62, -2.12]], width: 0.05 },
  { points: [[0.08, -2.62], [-0.74, -2.62], [-0.74, -2.14], [-1.58, -2.14]], width: 0.05 },
  { points: [[-1.98, -2.48], [-1.98, -1.86], [-1.18, -1.86]], width: 0.05 },
  { points: [[-0.46, -0.58], [0.3, -0.58], [0.3, -1.14], [0.94, -1.14]], width: 0.045 },
  { points: [[0.22, -0.22], [0.98, -0.22], [0.98, -0.86], [1.66, -0.86]], width: 0.045 },
  { points: [[1.36, 0.1], [2.02, 0.1], [2.02, -0.42], [2.74, -0.42]], width: 0.045 },
  { points: [[1.34, 0.72], [2.22, 0.72], [2.22, 1.22], [2.92, 1.22]], width: 0.045 },
  { points: [[-2.1, 0.42], [-1.34, 0.42], [-1.34, 0.96], [-0.62, 0.96]], width: 0.045 },
  { points: [[-2.42, -0.26], [-1.64, -0.26], [-1.64, -0.88], [-0.88, -0.88]], width: 0.045 },
  { points: [[-2.76, 1.54], [-2.02, 1.54], [-2.02, 1.04], [-1.32, 1.04]], width: 0.045 },
  { points: [[-3.94, 2.54], [-3.26, 2.54], [-3.26, 2.1], [-2.72, 2.1]], width: 0.05 },
  { points: [[-4.8, -2.06], [-4.04, -2.06], [-4.04, -1.46], [-3.36, -1.46]], width: 0.05 },
  { points: [[-4.96, -0.36], [-4.42, -0.36], [-4.42, 0.42], [-3.96, 0.42]], width: 0.045 }
];

const BOARD_THICKNESS = 0.18;
const BOARD_TOP_Y = BOARD_THICKNESS / 2;
const EMPTY_VECTOR = new THREE.Vector3();

const VIA_POSITIONS = [
  new THREE.Vector3(-4.08, BOARD_TOP_Y + 0.013, 0.04),
  new THREE.Vector3(-1.02, BOARD_TOP_Y + 0.013, 0.04),
  new THREE.Vector3(-1.02, BOARD_TOP_Y + 0.013, -1.18),
  new THREE.Vector3(0.98, BOARD_TOP_Y + 0.013, -0.74),
  new THREE.Vector3(0.0, BOARD_TOP_Y + 0.013, 1.86),
  new THREE.Vector3(2.16, BOARD_TOP_Y + 0.013, 1.56),
  new THREE.Vector3(3.58, BOARD_TOP_Y + 0.013, -0.74)
];

const AUX_VIA_POSITIONS = [
  new THREE.Vector3(-3.84, BOARD_TOP_Y + 0.013, -0.52),
  new THREE.Vector3(-3.42, BOARD_TOP_Y + 0.013, -1.76),
  new THREE.Vector3(-2.54, BOARD_TOP_Y + 0.013, 1.64),
  new THREE.Vector3(-0.8, BOARD_TOP_Y + 0.013, 2.04),
  new THREE.Vector3(1.84, BOARD_TOP_Y + 0.013, -1.98),
  new THREE.Vector3(3.38, BOARD_TOP_Y + 0.013, -1.62),
  new THREE.Vector3(4.54, BOARD_TOP_Y + 0.013, 1.18),
  new THREE.Vector3(3.12, BOARD_TOP_Y + 0.013, 2.18),
  new THREE.Vector3(0.22, BOARD_TOP_Y + 0.013, -1.74),
  new THREE.Vector3(1.68, BOARD_TOP_Y + 0.013, 1.44),
  new THREE.Vector3(2.12, BOARD_TOP_Y + 0.013, 1.04),
  new THREE.Vector3(-2.26, BOARD_TOP_Y + 0.013, 1.28),
  new THREE.Vector3(-4.22, BOARD_TOP_Y + 0.013, 2.44),
  new THREE.Vector3(4.86, BOARD_TOP_Y + 0.013, 0.62),
  new THREE.Vector3(-0.32, BOARD_TOP_Y + 0.013, -2.2),
  new THREE.Vector3(-1.62, BOARD_TOP_Y + 0.013, 1.22),
  new THREE.Vector3(1.62, BOARD_TOP_Y + 0.013, 1.24),
  new THREE.Vector3(0.86, BOARD_TOP_Y + 0.013, -1.78),
  new THREE.Vector3(2.56, BOARD_TOP_Y + 0.013, -1.92),
  new THREE.Vector3(3.54, BOARD_TOP_Y + 0.013, 0.82),
  new THREE.Vector3(-3.08, BOARD_TOP_Y + 0.013, 1.02),
  new THREE.Vector3(-4.8, BOARD_TOP_Y + 0.013, -0.82),
  new THREE.Vector3(4.42, BOARD_TOP_Y + 0.013, 1.24),
  new THREE.Vector3(2.32, BOARD_TOP_Y + 0.013, 2.16),
  new THREE.Vector3(-2.64, BOARD_TOP_Y + 0.013, -1.94),
  new THREE.Vector3(-4.1, BOARD_TOP_Y + 0.013, 1.16),
  new THREE.Vector3(-3.76, BOARD_TOP_Y + 0.013, 0.74),
  new THREE.Vector3(-3.24, BOARD_TOP_Y + 0.013, -0.22),
  new THREE.Vector3(-2.86, BOARD_TOP_Y + 0.013, -1.44),
  new THREE.Vector3(-1.34, BOARD_TOP_Y + 0.013, 2.18),
  new THREE.Vector3(0.42, BOARD_TOP_Y + 0.013, 2.12),
  new THREE.Vector3(1.58, BOARD_TOP_Y + 0.013, 1.96),
  new THREE.Vector3(2.18, BOARD_TOP_Y + 0.013, 2.18),
  new THREE.Vector3(4.04, BOARD_TOP_Y + 0.013, 1.98),
  new THREE.Vector3(3.8, BOARD_TOP_Y + 0.013, 0.9),
  new THREE.Vector3(3.92, BOARD_TOP_Y + 0.013, -0.32),
  new THREE.Vector3(3.46, BOARD_TOP_Y + 0.013, -1.34),
  new THREE.Vector3(3.94, BOARD_TOP_Y + 0.013, -2.26),
  new THREE.Vector3(1.32, BOARD_TOP_Y + 0.013, -2.12),
  new THREE.Vector3(-0.74, BOARD_TOP_Y + 0.013, -2.14),
  new THREE.Vector3(-1.98, BOARD_TOP_Y + 0.013, -1.86),
  new THREE.Vector3(0.3, BOARD_TOP_Y + 0.013, -1.14),
  new THREE.Vector3(0.98, BOARD_TOP_Y + 0.013, -0.86),
  new THREE.Vector3(2.02, BOARD_TOP_Y + 0.013, -0.42),
  new THREE.Vector3(2.22, BOARD_TOP_Y + 0.013, 1.22),
  new THREE.Vector3(-1.34, BOARD_TOP_Y + 0.013, 0.96),
  new THREE.Vector3(-1.64, BOARD_TOP_Y + 0.013, -0.88),
  new THREE.Vector3(-2.02, BOARD_TOP_Y + 0.013, 1.04),
  new THREE.Vector3(-3.26, BOARD_TOP_Y + 0.013, 2.1),
  new THREE.Vector3(-4.04, BOARD_TOP_Y + 0.013, -1.46),
  new THREE.Vector3(-4.42, BOARD_TOP_Y + 0.013, 0.42)
];

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
      return;
    }
    shape.lineTo(x, z);
  });
  shape.closePath();
  return shape;
}

function createChipLabelTexture(label: string, ref: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#20252b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(246,248,240,0.14)";
  ctx.lineWidth = 3;
  ctx.strokeRect(32, 32, canvas.width - 64, canvas.height - 64);

  ctx.strokeStyle = "rgba(246,248,240,0.05)";
  ctx.lineWidth = 1;
  ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);

  ctx.fillStyle = "rgba(238,242,232,0.66)";
  ctx.font = label.length > 9 ? "600 22px IBM Plex Mono, monospace" : "600 24px IBM Plex Mono, monospace";
  ctx.fillText(label, 72, 106);

  ctx.fillStyle = "rgba(220,226,210,0.42)";
  ctx.font = "500 13px IBM Plex Mono, monospace";
  ctx.fillText(ref, 74, 140);
  ctx.fillText("NAV", 74, 160);
  ctx.fillText("LOT 03", 74, 180);

  ctx.strokeStyle = "rgba(230,234,223,0.2)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(74, 200);
  ctx.lineTo(136, 200);
  ctx.stroke();

  ctx.fillStyle = "rgba(220,226,210,0.22)";
  ctx.fillRect(72, 214, 86, 4);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function createBoardMaps(): BoardMaps {
  const canvas = document.createElement("canvas");
  canvas.width = 2200;
  canvas.height = 1440;
  const ctx = canvas.getContext("2d");
  const roughnessCanvas = document.createElement("canvas");
  roughnessCanvas.width = 2200;
  roughnessCanvas.height = 1440;
  const roughCtx = roughnessCanvas.getContext("2d");

  if (!ctx || !roughCtx) {
    return { color: null, roughness: null };
  }

  ctx.fillStyle = "#456a36";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const broadGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  broadGradient.addColorStop(0, "rgba(255,255,255,0.05)");
  broadGradient.addColorStop(0.45, "rgba(255,255,255,0.015)");
  broadGradient.addColorStop(1, "rgba(0,0,0,0.06)");
  ctx.fillStyle = broadGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.016)";
  for (let i = 0; i < 680; i += 1) {
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
  }

  ctx.strokeStyle = "rgba(246,250,245,0.4)";
  ctx.lineWidth = 5;
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

  ctx.strokeStyle = "rgba(16,44,24,0.14)";
  ctx.lineWidth = 10;
  ctx.beginPath();
  BOARD_OUTLINE.forEach(([x, z], index) => {
    const scaleX = x * 0.965;
    const scaleZ = z * 0.955;
    const point = pointToCanvas(scaleX, scaleZ, canvas);
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.closePath();
  ctx.stroke();

  const silk = "rgba(244,247,239,0.82)";
  const silkSoft = "rgba(244,247,239,0.42)";
  ctx.strokeStyle = silkSoft;
  ctx.lineWidth = 3;

  NAV_COMPONENTS.forEach((component) => {
    if (component.id === "contact") return;
    const center = pointToCanvas(component.position.x, component.position.z, canvas);
    const width = (component.bodySize.x / (BOARD_BOUNDS.maxX - BOARD_BOUNDS.minX)) * canvas.width;
    const height = (component.bodySize.z / (BOARD_BOUNDS.maxZ - BOARD_BOUNDS.minZ)) * canvas.height;
    ctx.strokeRect(center.x - width / 2 - 26, center.y - height / 2 - 26, width + 52, height + 52);
    ctx.strokeRect(center.x - width / 2 - 10, center.y - height / 2 - 10, width + 20, height + 20);

    ctx.fillStyle = silk;
    ctx.font = "600 24px IBM Plex Mono, monospace";
    ctx.fillText(component.ref, center.x - width / 2 - 4, center.y - height / 2 - 38);
    ctx.font = "500 15px IBM Plex Mono, monospace";
    ctx.fillText(component.label, center.x - width / 2 - 4, center.y + height / 2 + 34);
  });

  const contact = NAV_COMPONENTS.find((component) => component.id === "contact");
  if (contact) {
    const center = pointToCanvas(contact.position.x, contact.position.z, canvas);
    ctx.strokeStyle = silkSoft;
    ctx.strokeRect(center.x - 88, center.y - 124, 160, 248);
    ctx.fillStyle = silk;
    ctx.font = "600 24px IBM Plex Mono, monospace";
    ctx.fillText(contact.ref, center.x - 92, center.y - 138);
    ctx.font = "500 15px IBM Plex Mono, monospace";
    ctx.fillText(contact.label, center.x - 94, center.y + 126);
  }

  const boardText = pointToCanvas(-4.46, 2.56, canvas);
  ctx.fillStyle = "rgba(245,247,241,0.72)";
  ctx.font = "600 38px IBM Plex Mono, monospace";
  ctx.fillText("SHAIV RAMDHANI", boardText.x, boardText.y);
  ctx.font = "500 26px IBM Plex Mono, monospace";
  ctx.fillText("PORTFOLIO BOARD", boardText.x, boardText.y + 46);

  const helperText = pointToCanvas(3.82, 2.56, canvas);
  ctx.textAlign = "right";
  ctx.font = "500 24px IBM Plex Mono, monospace";
  ctx.fillStyle = "rgba(245,247,241,0.58)";
  ctx.fillText("SELECT A COMPONENT", helperText.x, helperText.y);
  ctx.textAlign = "left";

  const copperColor = "rgba(182, 145, 69, 0.26)";
  ctx.strokeStyle = copperColor;
  ctx.lineWidth = 8;
  TRACE_ROUTES.forEach((route) => {
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

  ctx.lineWidth = 4;
  STATIC_TRACE_ROUTES.forEach((route) => {
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

  ctx.fillStyle = "rgba(181, 142, 74, 0.38)";
  VIA_POSITIONS.forEach((via) => {
    const point = pointToCanvas(via.x, via.z, canvas);
    ctx.beginPath();
    ctx.arc(point.x, point.y, 12, 0, Math.PI * 2);
    ctx.fill();
  });
  AUX_VIA_POSITIONS.forEach((via) => {
    const point = pointToCanvas(via.x, via.z, canvas);
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
    ctx.fill();
  });

  const silkscreenBoxes = [
    { x: -3.88, z: -1.28, w: 0.78, h: 0.54, ref: "U6" },
    { x: -3.54, z: 2.02, w: 0.92, h: 0.42, ref: "RN1" },
    { x: 1.18, z: -2.18, w: 0.96, h: 0.42, ref: "REG1" },
    { x: 4.22, z: 0.92, w: 0.54, h: 0.96, ref: "J2" },
    { x: 3.48, z: -1.88, w: 0.82, h: 0.42, ref: "Y1" },
    { x: 3.82, z: 2.02, w: 0.66, h: 0.42, ref: "TPX" },
    { x: -1.42, z: 1.56, w: 0.58, h: 0.32, ref: "C21" },
    { x: 1.42, z: 1.58, w: 0.58, h: 0.32, ref: "C22" },
    { x: 0.98, z: -1.64, w: 0.58, h: 0.32, ref: "C31" },
    { x: 2.72, z: -1.74, w: 0.68, h: 0.34, ref: "RN2" },
    { x: -4.24, z: -0.88, w: 0.46, h: 0.3, ref: "U7" }
  ];

  const denseReferences = [
    { x: -4.78, z: 1.96, ref: "R12" },
    { x: -4.44, z: 1.52, ref: "C14" },
    { x: -3.96, z: 0.96, ref: "R17" },
    { x: -3.54, z: 0.46, ref: "C19" },
    { x: -3.16, z: -0.12, ref: "FB1" },
    { x: -3.64, z: -1.62, ref: "C24" },
    { x: -2.84, z: -2.18, ref: "R31" },
    { x: -1.96, z: 2.42, ref: "C7" },
    { x: -0.78, z: 2.34, ref: "R6" },
    { x: 0.56, z: 2.24, ref: "C11" },
    { x: 1.92, z: 2.26, ref: "U8" },
    { x: 3.18, z: 2.34, ref: "RN4" },
    { x: 4.26, z: 1.74, ref: "C42" },
    { x: 4.36, z: 0.56, ref: "L1" },
    { x: 4.08, z: -0.78, ref: "R48" },
    { x: 3.62, z: -1.88, ref: "Y1" },
    { x: 2.12, z: -2.34, ref: "C53" },
    { x: 0.82, z: -2.34, ref: "R52" },
    { x: -0.54, z: -2.32, ref: "D1" },
    { x: -1.84, z: -2.18, ref: "C39" },
    { x: 2.94, z: 0.96, ref: "R61" },
    { x: 1.76, z: -0.26, ref: "U9" },
    { x: 0.34, z: -1.06, ref: "R63" },
    { x: -1.12, z: 0.84, ref: "C27" }
  ];

  const fiducials = [
    { x: -5.04, z: -2.6, label: "FD1" },
    { x: 5.0, z: -2.58, label: "FD2" },
    { x: -5.0, z: 2.56, label: "FD3" }
  ];

  const navFootprints = [
    { component: "projects", refPrefix: "C", coords: [[-1.52, 1.86], [-1.18, 1.86], [-0.84, 1.86], [-0.5, 1.86], [1.52, 1.86], [1.18, 1.86], [0.84, 1.86], [0.5, 1.86]] },
    { component: "experience", refPrefix: "R", coords: [[1.8, -1.9], [2.1, -1.9], [2.4, -1.9], [2.7, -1.9], [3.0, -1.9], [3.3, -1.9]] },
    { component: "personal", refPrefix: "C", coords: [[2.28, 2.02], [2.58, 2.02], [2.88, 2.02], [3.18, 2.02]] },
    { component: "about", refPrefix: "R", coords: [[-3.08, -1.64], [-2.78, -1.64], [-2.48, -1.64], [-2.18, -1.64]] }
  ];

  ctx.strokeStyle = silkSoft;
  ctx.lineWidth = 2.5;
  ctx.fillStyle = silk;
  ctx.font = "500 20px IBM Plex Mono, monospace";
  silkscreenBoxes.forEach((box) => {
    const center = pointToCanvas(box.x, box.z, canvas);
    const width = (box.w / (BOARD_BOUNDS.maxX - BOARD_BOUNDS.minX)) * canvas.width;
    const height = (box.h / (BOARD_BOUNDS.maxZ - BOARD_BOUNDS.minZ)) * canvas.height;
    ctx.strokeRect(center.x - width / 2, center.y - height / 2, width, height);
    ctx.fillText(box.ref, center.x - width / 2, center.y - height / 2 - 10);
  });

  const testPadLabels = [
    { x: -4.62, z: -2.42, label: "TP1" },
    { x: -4.46, z: -1.86, label: "TP2" },
    { x: 4.62, z: -1.12, label: "TP3" },
    { x: 4.28, z: 2.42, label: "TP4" }
  ];
  ctx.font = "500 18px IBM Plex Mono, monospace";
  testPadLabels.forEach((item) => {
    const point = pointToCanvas(item.x, item.z, canvas);
    ctx.fillText(item.label, point.x, point.y);
  });

  ctx.font = "500 15px IBM Plex Mono, monospace";
  denseReferences.forEach((item) => {
    const point = pointToCanvas(item.x, item.z, canvas);
    ctx.fillText(item.ref, point.x, point.y);
  });

  fiducials.forEach((item) => {
    const point = pointToCanvas(item.x, item.z, canvas);
    ctx.beginPath();
    ctx.arc(point.x, point.y, 11, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillText(item.label, point.x + 16, point.y + 4);
  });

  ctx.font = "500 13px IBM Plex Mono, monospace";
  navFootprints.forEach((group, groupIndex) => {
    group.coords.forEach(([x, z], index) => {
      const point = pointToCanvas(x, z, canvas);
      ctx.fillText(`${group.refPrefix}${groupIndex * 10 + index + 1}`, point.x, point.y);
    });
  });

  roughCtx.fillStyle = "rgb(138,138,138)";
  roughCtx.fillRect(0, 0, roughnessCanvas.width, roughnessCanvas.height);
  for (let i = 0; i < 1800; i += 1) {
    const value = 120 + Math.floor(Math.random() * 18);
    roughCtx.fillStyle = `rgb(${value},${value},${value})`;
    roughCtx.fillRect(
      Math.random() * roughnessCanvas.width,
      Math.random() * roughnessCanvas.height,
      1,
      1
    );
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  const roughness = new THREE.CanvasTexture(roughnessCanvas);
  roughness.colorSpace = THREE.NoColorSpace;
  roughness.anisotropy = 4;

  return { color: texture, roughness };
}

function makeFlowMaterial(
  glowStrength: number,
  reducedMotion: boolean,
  variant: "core" | "halo"
) {
  const isCore = variant === "core";

  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: isCore ? THREE.NormalBlending : THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uStart: { value: 0 },
      uStartupDuration: { value: 1 },
      uAmbientStart: { value: 5 },
      uAmbientDuration: { value: 10 },
      uAmbientEnabled: { value: 0 },
      uGlowStrength: { value: glowStrength },
      uReducedMotion: { value: reducedMotion ? 1 : 0 },
      uHoverBoost: { value: 0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uStart;
      uniform float uStartupDuration;
      uniform float uAmbientStart;
      uniform float uAmbientDuration;
      uniform float uAmbientEnabled;
      uniform float uGlowStrength;
      uniform float uReducedMotion;
      uniform float uHoverBoost;
      varying vec2 vUv;

      float pulseBand(float center, float width) {
        float delta = fract(center - vUv.x + 1.0);
        float front = smoothstep(width, 0.0, delta);
        float body = smoothstep(width + 0.22, 0.02, delta);
        float tail = smoothstep(width + 0.4, 0.08, delta);
        float lateral = smoothstep(0.0, 0.36, 0.5 - abs(vUv.y - 0.5));
        return clamp((body * 0.48 + tail * 0.42 + front * 0.75) * lateral * 2.0, 0.0, 1.0);
      }

      void main() {
        float energy = 0.0;

        if (uStartupDuration > 0.0) {
          float startup = clamp((uTime - uStart) / uStartupDuration, 0.0, 1.0);
          float head = startup * 1.12 - 0.06;
          float startupFlow = pulseBand(head, 0.06);
          float settled = smoothstep(0.6, 1.0, startup) * 0.16;
          energy = max(energy, startupFlow + settled);
        }

        if (uAmbientEnabled > 0.5) {
          float ambientTime = max(0.0, uTime - uAmbientStart);
          float cycle = fract(ambientTime / max(uAmbientDuration, 0.001));
          float ambientFlow = pulseBand(cycle, 0.1) * 0.82;
          energy = max(energy, ambientFlow + 0.12);
        }

        if (uHoverBoost > 0.0) {
          energy = max(energy, 0.28 + uHoverBoost * 0.36);
        }

        if (uReducedMotion > 0.5) {
          energy = max(energy, 0.14 + uHoverBoost * 0.18);
        }

        vec3 baseColor = vec3(0.72, 0.97, 0.74);
        vec3 highlightColor = vec3(0.97, 1.0, 0.93);
        vec3 color = mix(baseColor, highlightColor, smoothstep(0.18, 1.0, energy));

        float lateral = smoothstep(0.0, ${isCore ? "0.46" : "0.5"}, 0.5 - abs(vUv.y - 0.5));
        float opacity = energy * lateral * (${isCore ? "0.72" : "0.2"} + uGlowStrength * ${isCore ? "0.08" : "0.12"});
        gl_FragColor = vec4(color, opacity);
      }
    `
  });
}

function addBoard(scene: THREE.Scene, mobile: boolean) {
  const boardShape = makeBoardShape();
  const geometry = new THREE.ExtrudeGeometry(boardShape, {
    depth: BOARD_THICKNESS,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.03,
    bevelThickness: 0.018,
    curveSegments: 4
  });
  geometry.rotateX(Math.PI / 2);
  geometry.translate(0, -BOARD_THICKNESS / 2, 0);

  const maps = createBoardMaps();
  const topMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#456a36"),
    roughness: 0.62,
    metalness: 0.02,
    clearcoat: 0.12,
    clearcoatRoughness: 0.72,
    sheen: 0.04,
    sheenRoughness: 0.78,
    map: maps.color ?? undefined,
    roughnessMap: maps.roughness ?? undefined
  });
  const sideMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#314726"),
    roughness: 0.84,
    metalness: 0.01,
    clearcoat: 0.04,
    clearcoatRoughness: 0.9
  });

  const board = new THREE.Mesh(geometry, [topMaterial, sideMaterial]);
  board.castShadow = !mobile;
  board.receiveShadow = true;
  scene.add(board);

  const edge = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry, 26),
    new THREE.LineBasicMaterial({ color: 0xf3fbf1, transparent: true, opacity: 0.42 })
  );
  scene.add(edge);

  return board;
}

function addMountingHoles(scene: THREE.Scene) {
  const ringMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#b79147"),
    metalness: 0.5,
    roughness: 0.34
  });
  const coreMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#102314"),
    metalness: 0.16,
    roughness: 0.8
  });

  [
    new THREE.Vector3(-4.62, BOARD_TOP_Y + 0.01, -2.26),
    new THREE.Vector3(4.62, BOARD_TOP_Y + 0.01, -2.26),
    new THREE.Vector3(-4.62, BOARD_TOP_Y + 0.01, 2.26),
    new THREE.Vector3(4.62, BOARD_TOP_Y + 0.01, 2.26)
  ].forEach((position) => {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.03, 28), ringMaterial);
    ring.position.set(position.x, BOARD_TOP_Y + 0.015, position.z);
    scene.add(ring);

    const washer = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.018, 24),
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#173422"),
        roughness: 0.9,
        metalness: 0.04
      })
    );
    washer.position.set(position.x, BOARD_TOP_Y + 0.005, position.z);
    scene.add(washer);

    const core = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, BOARD_THICKNESS + 0.05, 20),
      coreMaterial
    );
    core.position.set(position.x, 0, position.z);
    scene.add(core);

    const keepout = new THREE.Mesh(
      new THREE.RingGeometry(0.31, 0.38, 28),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#e9eee1"),
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide
      })
    );
    keepout.rotation.x = -Math.PI / 2;
    keepout.position.set(position.x, BOARD_TOP_Y + 0.008, position.z);
    scene.add(keepout);

    const annulus = new THREE.Mesh(
      new THREE.RingGeometry(0.2, 0.26, 28),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#f1f4e8"),
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide
      })
    );
    annulus.rotation.x = -Math.PI / 2;
    annulus.position.set(position.x, BOARD_TOP_Y + 0.009, position.z);
    scene.add(annulus);
  });
}

function addCopperPads(scene: THREE.Scene) {
  const padMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#b89146"),
    roughness: 0.24,
    metalness: 0.74
  });

  const pads = [
    { position: new THREE.Vector3(-2.94, BOARD_TOP_Y + 0.012, -1.18), size: [0.15, 0.34] },
    { position: new THREE.Vector3(-2.08, BOARD_TOP_Y + 0.012, -1.18), size: [0.15, 0.34] },
    { position: new THREE.Vector3(2.64, BOARD_TOP_Y + 0.012, -1.48), size: [0.18, 0.42] },
    { position: new THREE.Vector3(2.64, BOARD_TOP_Y + 0.012, -0.08), size: [0.18, 0.42] },
    { position: new THREE.Vector3(2.36, BOARD_TOP_Y + 0.012, 1.56), size: [0.12, 0.28] },
    { position: new THREE.Vector3(3.34, BOARD_TOP_Y + 0.012, 1.56), size: [0.12, 0.28] }
  ];

  pads.forEach((pad) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(pad.size[0], pad.size[1]),
      padMaterial
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.copy(pad.position);
    scene.add(mesh);
  });

  const qfpFanoutPads = [
    [-1.46, 1.46], [-1.12, 1.46], [-0.78, 1.46], [-0.44, 1.46],
    [0.44, 1.46], [0.78, 1.46], [1.12, 1.46], [1.46, 1.46],
    [-1.46, -1.3], [-1.12, -1.3], [-0.78, -1.3], [-0.44, -1.3],
    [0.44, -1.3], [0.78, -1.3], [1.12, -1.3], [1.46, -1.3]
  ];

  qfpFanoutPads.forEach(([x, z]) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.22), padMaterial);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, BOARD_TOP_Y + 0.012, z);
    scene.add(mesh);
  });
}

function addConnector(scene: THREE.Scene, mobile: boolean, visuals: Map<NavTargetId, NavVisual>) {
  const housingMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#e8e1c9"),
    roughness: 0.58,
    metalness: 0.02,
    clearcoat: 0.05,
    clearcoatRoughness: 0.82,
    emissive: new THREE.Color("#000000"),
    emissiveIntensity: 0
  });
  const metalMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#bea05c"),
    roughness: 0.22,
    metalness: 0.72,
    emissive: new THREE.Color("#000000"),
    emissiveIntensity: 0
  });

  const connectorGroup = new THREE.Group();

  const housing = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.28, 1.16), housingMaterial);
  housing.position.set(-4.34, 0.18, 0.56);
  housing.castShadow = !mobile;
  housing.receiveShadow = true;
  connectorGroup.add(housing);

  const cavity = new THREE.Mesh(
    new THREE.BoxGeometry(0.74, 0.26, 0.88),
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#212523"),
      roughness: 0.94,
      metalness: 0.02
    })
  );
  cavity.position.set(-4.34, 0.19, 0.56);
  connectorGroup.add(cavity);

  for (let i = 0; i < 5; i += 1) {
    const pin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.2), metalMaterial);
    pin.position.set(-4.48 + i * 0.07, BOARD_TOP_Y + 0.036, 0.16 + i * 0.16);
    connectorGroup.add(pin);
  }

  scene.add(connectorGroup);
  connectorGroup.userData.navTargetId = "contact";
  visuals.set("contact", { root: connectorGroup, materials: [housingMaterial, metalMaterial] });
}

function addLabeledChip(
  scene: THREE.Scene,
  mobile: boolean,
  visuals: Map<NavTargetId, NavVisual>,
  spec: NavComponentSpec,
  kind: "qfp" | "qfn" | "soic" | "module"
) {
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(kind === "module" ? "#dce3d7" : "#151b22"),
    roughness: kind === "module" ? 0.68 : 0.74,
    metalness: kind === "module" ? 0.04 : 0.14,
    clearcoat: kind === "module" ? 0.04 : 0.08,
    clearcoatRoughness: kind === "module" ? 0.86 : 0.78,
    emissive: new THREE.Color("#000000"),
    emissiveIntensity: 0
  });

  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(spec.bodySize.x, spec.bodySize.y, spec.bodySize.z), bodyMaterial);
  body.castShadow = !mobile;
  body.receiveShadow = true;
  group.add(body);

  const topTexture = createChipLabelTexture(spec.label, spec.ref);
  const topMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(kind === "module" ? "#edf2e9" : "#202932"),
    roughness: kind === "module" ? 0.82 : 0.92,
    metalness: 0.03,
    map: topTexture ?? undefined,
    emissive: new THREE.Color("#000000"),
    emissiveIntensity: 0
  });

  const topInset = new THREE.Mesh(
    new THREE.BoxGeometry(spec.bodySize.x * 0.84, 0.012, spec.bodySize.z * 0.76),
    topMaterial
  );
  topInset.position.y = spec.bodySize.y / 2 + 0.01;
  group.add(topInset);

  const dot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.012, 18),
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(kind === "module" ? "#5c6758" : "#e7ebde"),
      roughness: 0.62,
      metalness: 0.04
    })
  );
  dot.rotation.x = Math.PI / 2;
  dot.position.set(-spec.bodySize.x * 0.3, spec.bodySize.y / 2 + 0.014, -spec.bodySize.z * 0.24);
  group.add(dot);

  const pinMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#bea05c"),
    roughness: 0.2,
    metalness: 0.78,
    emissive: new THREE.Color("#000000"),
    emissiveIntensity: 0
  });

  if (kind === "qfp") {
    const counts = { horizontal: 9, vertical: 9 };
    for (let i = 0; i < counts.horizontal; i += 1) {
      const offset = (-((counts.horizontal - 1) / 2) + i) * 0.22;
      const north = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.018, 0.15), pinMaterial);
      north.position.set(offset, -spec.bodySize.y / 2 + 0.012, -spec.bodySize.z / 2 - 0.048);
      const south = north.clone();
      south.position.z = spec.bodySize.z / 2 + 0.048;
      group.add(north, south);
    }
    for (let i = 0; i < counts.vertical; i += 1) {
      const offset = (-((counts.vertical - 1) / 2) + i) * 0.22;
      const west = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.018, 0.05), pinMaterial);
      west.position.set(-spec.bodySize.x / 2 - 0.048, -spec.bodySize.y / 2 + 0.012, offset);
      const east = west.clone();
      east.position.x = spec.bodySize.x / 2 + 0.048;
      group.add(west, east);
    }
  } else if (kind === "qfn") {
    for (let i = 0; i < 7; i += 1) {
      const offset = (-3 + i) * 0.24;
      const north = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.016, 0.11), pinMaterial);
      north.position.set(offset, -spec.bodySize.y / 2 + 0.011, -spec.bodySize.z / 2 - 0.03);
      const south = north.clone();
      south.position.z = spec.bodySize.z / 2 + 0.03;
      group.add(north, south);
    }
  } else if (kind === "soic") {
    for (let i = 0; i < 4; i += 1) {
      const offset = (-1.5 + i) * 0.28;
      const west = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.018, 0.05), pinMaterial);
      west.position.set(-spec.bodySize.x / 2 - 0.04, -spec.bodySize.y / 2 + 0.012, offset);
      const east = west.clone();
      east.position.x = spec.bodySize.x / 2 + 0.04;
      group.add(west, east);
    }
  } else {
    const shield = new THREE.Mesh(
      new THREE.BoxGeometry(spec.bodySize.x * 0.56, 0.02, spec.bodySize.z * 0.52),
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#bfc9bb"),
        roughness: 0.34,
        metalness: 0.62,
        emissive: new THREE.Color("#000000"),
        emissiveIntensity: 0
      })
    );
    shield.position.y = spec.bodySize.y / 2 + 0.015;
    group.add(shield);
  }

  group.position.copy(spec.position);
  group.userData.navTargetId = spec.id;
  scene.add(group);

  visuals.set(spec.id, { root: group, materials: [bodyMaterial, topMaterial, pinMaterial] });
}

function addSupportingPassives(scene: THREE.Scene, mobile: boolean) {
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#ddd7c5"),
    roughness: 0.56,
    metalness: 0.02
  });
  const capMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#bda15c"),
    roughness: 0.24,
    metalness: 0.68
  });

  const passives = [
    { x: -1.0, z: 1.46, w: 0.44, d: 0.2 },
    { x: -0.32, z: 1.46, w: 0.44, d: 0.2 },
    { x: 1.84, z: -1.76, w: 0.42, d: 0.18 },
    { x: 2.34, z: -1.76, w: 0.42, d: 0.18 },
    { x: 3.48, z: 1.1, w: 0.36, d: 0.18 },
    { x: 3.48, z: 1.48, w: 0.36, d: 0.18 },
    { x: -3.68, z: -0.52, w: 0.34, d: 0.16 },
    { x: -3.68, z: -0.84, w: 0.34, d: 0.16 },
    { x: -3.68, z: -1.16, w: 0.34, d: 0.16 },
    { x: -2.92, z: 2.22, w: 0.34, d: 0.16 },
    { x: -2.48, z: 2.22, w: 0.34, d: 0.16 },
    { x: 0.96, z: -2.26, w: 0.34, d: 0.16 },
    { x: 1.36, z: -2.26, w: 0.34, d: 0.16 },
    { x: 4.18, z: 1.2, w: 0.32, d: 0.16 },
    { x: 4.18, z: 1.54, w: 0.32, d: 0.16 },
    { x: -4.32, z: 1.72, w: 0.22, d: 0.12 },
    { x: -4.08, z: 1.72, w: 0.22, d: 0.12 },
    { x: -3.82, z: 1.72, w: 0.22, d: 0.12 },
    { x: -4.26, z: 1.42, w: 0.18, d: 0.1 },
    { x: -3.98, z: 1.42, w: 0.18, d: 0.1 },
    { x: -3.7, z: 1.42, w: 0.18, d: 0.1 },
    { x: -3.12, z: 0.64, w: 0.24, d: 0.12 },
    { x: -2.84, z: 0.64, w: 0.24, d: 0.12 },
    { x: -2.56, z: 0.64, w: 0.24, d: 0.12 },
    { x: -2.94, z: -0.14, w: 0.22, d: 0.11 },
    { x: -2.66, z: -0.14, w: 0.22, d: 0.11 },
    { x: -2.38, z: -0.14, w: 0.22, d: 0.11 },
    { x: -2.02, z: -1.84, w: 0.2, d: 0.1 },
    { x: -1.76, z: -1.84, w: 0.2, d: 0.1 },
    { x: -1.5, z: -1.84, w: 0.2, d: 0.1 },
    { x: -0.54, z: -2.22, w: 0.18, d: 0.1 },
    { x: -0.26, z: -2.22, w: 0.18, d: 0.1 },
    { x: 0.02, z: -2.22, w: 0.18, d: 0.1 },
    { x: 0.34, z: -2.22, w: 0.18, d: 0.1 },
    { x: 0.74, z: 2.06, w: 0.2, d: 0.1 },
    { x: 1.02, z: 2.06, w: 0.2, d: 0.1 },
    { x: 1.3, z: 2.06, w: 0.2, d: 0.1 },
    { x: 1.58, z: 2.06, w: 0.2, d: 0.1 },
    { x: 2.34, z: 2.12, w: 0.22, d: 0.11 },
    { x: 2.64, z: 2.12, w: 0.22, d: 0.11 },
    { x: 2.94, z: 2.12, w: 0.22, d: 0.11 },
    { x: 3.96, z: 1.98, w: 0.18, d: 0.1 },
    { x: 4.2, z: 1.98, w: 0.18, d: 0.1 },
    { x: 4.44, z: 1.98, w: 0.18, d: 0.1 },
    { x: 4.04, z: 0.58, w: 0.2, d: 0.1 },
    { x: 4.3, z: 0.58, w: 0.2, d: 0.1 },
    { x: 4.56, z: 0.58, w: 0.2, d: 0.1 },
    { x: 4.02, z: -0.54, w: 0.2, d: 0.1 },
    { x: 4.3, z: -0.54, w: 0.2, d: 0.1 },
    { x: 4.58, z: -0.54, w: 0.2, d: 0.1 },
    { x: 3.52, z: -2.04, w: 0.22, d: 0.11 },
    { x: 3.8, z: -2.04, w: 0.22, d: 0.11 },
    { x: 4.08, z: -2.04, w: 0.22, d: 0.11 },
    { x: 2.68, z: -0.22, w: 0.22, d: 0.1 },
    { x: 2.96, z: -0.22, w: 0.22, d: 0.1 },
    { x: 2.68, z: 0.18, w: 0.22, d: 0.1 },
    { x: 2.96, z: 0.18, w: 0.22, d: 0.1 },
    { x: -1.82, z: 2.18, w: 0.16, d: 0.09 },
    { x: -1.6, z: 2.18, w: 0.16, d: 0.09 },
    { x: -1.38, z: 2.18, w: 0.16, d: 0.09 },
    { x: -1.16, z: 2.18, w: 0.16, d: 0.09 },
    { x: -0.1, z: 2.2, w: 0.16, d: 0.09 },
    { x: 0.12, z: 2.2, w: 0.16, d: 0.09 },
    { x: 0.34, z: 2.2, w: 0.16, d: 0.09 },
    { x: 0.56, z: 2.2, w: 0.16, d: 0.09 },
    { x: 1.82, z: 2.2, w: 0.16, d: 0.09 },
    { x: 2.04, z: 2.2, w: 0.16, d: 0.09 },
    { x: 2.26, z: 2.2, w: 0.16, d: 0.09 },
    { x: 2.48, z: 2.2, w: 0.16, d: 0.09 },
    { x: 3.16, z: 1.76, w: 0.16, d: 0.09 },
    { x: 3.38, z: 1.76, w: 0.16, d: 0.09 },
    { x: 3.6, z: 1.76, w: 0.16, d: 0.09 },
    { x: 3.82, z: 1.76, w: 0.16, d: 0.09 },
    { x: 3.12, z: 0.62, w: 0.16, d: 0.09 },
    { x: 3.34, z: 0.62, w: 0.16, d: 0.09 },
    { x: 3.56, z: 0.62, w: 0.16, d: 0.09 },
    { x: -4.84, z: 0.12, w: 0.2, d: 0.11 },
    { x: -4.84, z: -0.18, w: 0.2, d: 0.11 },
    { x: -4.84, z: -0.48, w: 0.2, d: 0.11 },
    { x: -4.84, z: -0.78, w: 0.2, d: 0.11 },
    { x: -3.28, z: -2.18, w: 0.16, d: 0.09 },
    { x: -3.06, z: -2.18, w: 0.16, d: 0.09 },
    { x: -2.84, z: -2.18, w: 0.16, d: 0.09 },
    { x: 1.22, z: -2.4, w: 0.16, d: 0.09 },
    { x: 1.44, z: -2.4, w: 0.16, d: 0.09 },
    { x: 1.66, z: -2.4, w: 0.16, d: 0.09 },
    { x: 1.88, z: -2.4, w: 0.16, d: 0.09 }
  ];

  passives.forEach((passive) => {
    const body = new THREE.Mesh(new THREE.BoxGeometry(passive.w, 0.07, passive.d), bodyMaterial);
    body.position.set(passive.x, 0.125, passive.z);
    body.castShadow = !mobile;
    body.receiveShadow = true;
    scene.add(body);

    const capA = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.072, passive.d + 0.016), capMaterial);
    capA.position.set(passive.x - passive.w / 2 - 0.02, 0.125, passive.z);
    const capB = capA.clone();
    capB.position.x = passive.x + passive.w / 2 + 0.03;
    scene.add(capA, capB);
  });

  const can = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.08, 0.48),
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#cad0d2"),
      roughness: 0.2,
      metalness: 0.78
    })
  );
  can.position.set(-0.02, 0.13, -1.86);
  can.castShadow = !mobile;
  can.receiveShadow = true;
  scene.add(can);

  const capBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.28, 28),
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#26313a"),
      roughness: 0.4,
      metalness: 0.16
    })
  );
  capBody.position.set(3.82, 0.21, 1.62);
  capBody.castShadow = !mobile;
  capBody.receiveShadow = true;
  scene.add(capBody);

  const capTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.02, 24),
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#d5d8da"),
      roughness: 0.18,
      metalness: 0.62
    })
  );
  capTop.position.set(3.82, 0.36, 1.62);
  scene.add(capTop);
}

function addVias(scene: THREE.Scene) {
  const viaMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#c7b27b"),
    roughness: 0.28,
    metalness: 0.66
  });

  VIA_POSITIONS.forEach((via) => {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.072, 0.016, 20), viaMaterial);
    ring.position.copy(via);
    scene.add(ring);

    const drill = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026, 0.026, 0.022, 18),
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#173422"),
        roughness: 0.88,
        metalness: 0.04
      })
    );
    drill.position.copy(via);
    drill.position.y += 0.001;
    scene.add(drill);
  });

  AUX_VIA_POSITIONS.forEach((via) => {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.014, 18), viaMaterial);
    ring.position.copy(via);
    scene.add(ring);

    const drill = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.02, 16),
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#173422"),
        roughness: 0.88,
        metalness: 0.04
      })
    );
    drill.position.copy(via);
    drill.position.y += 0.001;
    scene.add(drill);
  });
}

function addShadowCatcher(scene: THREE.Scene) {
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 14),
    new THREE.ShadowMaterial({ opacity: 0.22 })
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -0.48;
  plane.receiveShadow = true;
  scene.add(plane);
}

function createSegmentPlane<TMaterial extends THREE.Material>(
  length: number,
  width: number,
  material: TMaterial
) {
  const geometry = new THREE.PlaneGeometry(length, width, 1, 1);
  geometry.rotateX(-Math.PI / 2);
  return new THREE.Mesh(geometry, material);
}

function addStaticCopper(scene: THREE.Scene) {
  STATIC_TRACE_ROUTES.forEach((route) => {
    route.points.slice(0, -1).forEach((point, index) => {
      const next = route.points[index + 1];
      const start = new THREE.Vector3(point[0], BOARD_TOP_Y + 0.013, point[1]);
      const end = new THREE.Vector3(next[0], BOARD_TOP_Y + 0.013, next[1]);
      const vector = new THREE.Vector3().subVectors(end, start);
      const length = vector.length();
      const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      const angle = Math.atan2(vector.z, vector.x);

      const copper = createSegmentPlane(
        length,
        route.width,
        new THREE.MeshPhysicalMaterial({
          color: new THREE.Color("#b89045"),
          roughness: 0.28,
          metalness: 0.78,
          emissive: new THREE.Color("#112719"),
          emissiveIntensity: 0.03,
          clearcoat: 0.02,
          clearcoatRoughness: 0.82
        })
      );
      copper.position.copy(center);
      copper.rotation.y = -angle;
      scene.add(copper);
    });
  });
}

function addTraces(scene: THREE.Scene, options: InitOptions) {
  const segments: TraceSegment[] = [];

  TRACE_ROUTES.forEach((route) => {
    route.points.slice(0, -1).forEach((point, index) => {
      const next = route.points[index + 1];
      const start = new THREE.Vector3(point[0], BOARD_TOP_Y + 0.014, point[1]);
      const end = new THREE.Vector3(next[0], BOARD_TOP_Y + 0.014, next[1]);
      const vector = new THREE.Vector3().subVectors(end, start);
      const length = vector.length();
      const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      const angle = Math.atan2(vector.z, vector.x);

      const copperMaterial = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#b89045"),
        roughness: 0.24,
        metalness: 0.82,
        emissive: new THREE.Color("#173626"),
        emissiveIntensity: 0.06,
        clearcoat: 0.04,
        clearcoatRoughness: 0.72
      });
      const copper = createSegmentPlane(length, route.width, copperMaterial);
      copper.position.copy(center);
      copper.rotation.y = -angle;
      copper.receiveShadow = true;
      scene.add(copper);

      const coreMaterial = makeFlowMaterial(options.glowStrength, options.reducedMotion, "core");
      coreMaterial.uniforms.uStart.value = route.startupDelay;
      coreMaterial.uniforms.uStartupDuration.value = route.startupDuration;
      coreMaterial.uniforms.uAmbientStart.value = route.ambientDelay ?? 999;
      coreMaterial.uniforms.uAmbientDuration.value = (route.ambientDuration ?? 10) / options.flowSpeed;
      coreMaterial.uniforms.uAmbientEnabled.value = route.ambient ? 1 : 0;

      const haloMaterial = makeFlowMaterial(options.glowStrength, options.reducedMotion, "halo");
      haloMaterial.uniforms.uStart.value = route.startupDelay;
      haloMaterial.uniforms.uStartupDuration.value = route.startupDuration;
      haloMaterial.uniforms.uAmbientStart.value = route.ambientDelay ?? 999;
      haloMaterial.uniforms.uAmbientDuration.value = (route.ambientDuration ?? 10) / options.flowSpeed;
      haloMaterial.uniforms.uAmbientEnabled.value = route.ambient ? 1 : 0;

      const core = createSegmentPlane(length, route.width * 0.68, coreMaterial);
      core.position.set(center.x, BOARD_TOP_Y + 0.021, center.z);
      core.rotation.y = -angle;
      scene.add(core);

      const halo = createSegmentPlane(length, route.width * 1.08, haloMaterial);
      halo.position.set(center.x, BOARD_TOP_Y + 0.023, center.z);
      halo.rotation.y = -angle;
      scene.add(halo);

      segments.push({
        copper,
        core,
        halo,
        uniforms: coreMaterial.uniforms as TraceUniforms,
        targetId: route.targetId
      });
    });
  });

  return segments;
}

function addNavigationComponents(scene: THREE.Scene, mobile: boolean) {
  const visuals = new Map<NavTargetId, NavVisual>();

  addConnector(scene, mobile, visuals);
  addLabeledChip(scene, mobile, visuals, NAV_COMPONENTS[0], "qfp");
  addLabeledChip(scene, mobile, visuals, NAV_COMPONENTS[1], "qfn");
  addLabeledChip(scene, mobile, visuals, NAV_COMPONENTS[2], "module");
  addLabeledChip(scene, mobile, visuals, NAV_COMPONENTS[3], "soic");
  addSupportingPassives(scene, mobile);

  return visuals;
}

function addSupportICs(scene: THREE.Scene, mobile: boolean) {
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#171f27"),
    roughness: 0.7,
    metalness: 0.12
  });
  const pinMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#bea05c"),
    roughness: 0.22,
    metalness: 0.76
  });

  const chips = [
    { x: -3.88, y: 0.2, z: -1.28, sx: 0.72, sy: 0.2, sz: 0.44 },
    { x: -3.52, y: 0.16, z: 2.0, sx: 0.9, sy: 0.16, sz: 0.34 },
    { x: 1.18, y: 0.18, z: -2.18, sx: 0.88, sy: 0.18, sz: 0.36 },
    { x: -4.24, y: 0.18, z: -0.84, sx: 0.42, sy: 0.16, sz: 0.28 },
    { x: 2.72, y: 0.18, z: -1.74, sx: 0.62, sy: 0.16, sz: 0.28 },
    { x: -4.04, y: 0.16, z: 1.52, sx: 0.52, sy: 0.16, sz: 0.3 },
    { x: -3.18, y: 0.16, z: 0.54, sx: 0.54, sy: 0.16, sz: 0.32 },
    { x: -2.56, y: 0.16, z: -0.06, sx: 0.48, sy: 0.16, sz: 0.28 },
    { x: 0.02, y: 0.16, z: -2.14, sx: 0.56, sy: 0.16, sz: 0.3 },
    { x: 1.12, y: 0.16, z: 2.18, sx: 0.58, sy: 0.16, sz: 0.32 },
    { x: 2.1, y: 0.16, z: 2.06, sx: 0.52, sy: 0.16, sz: 0.28 },
    { x: 3.96, y: 0.16, z: 0.52, sx: 0.56, sy: 0.16, sz: 0.3 },
    { x: 4.1, y: 0.16, z: -0.56, sx: 0.52, sy: 0.16, sz: 0.28 },
    { x: 3.64, y: 0.16, z: -2.06, sx: 0.66, sy: 0.16, sz: 0.28 },
    { x: -0.48, y: 0.16, z: 2.08, sx: 0.42, sy: 0.15, sz: 0.24 },
    { x: 3.18, y: 0.16, z: 1.98, sx: 0.44, sy: 0.15, sz: 0.24 },
    { x: -1.98, y: 0.16, z: 2.1, sx: 0.38, sy: 0.14, sz: 0.22 },
    { x: 0.82, y: 0.16, z: 2.08, sx: 0.4, sy: 0.14, sz: 0.22 },
    { x: 3.44, y: 0.16, z: 1.08, sx: 0.4, sy: 0.14, sz: 0.22 },
    { x: -3.28, y: 0.16, z: -1.92, sx: 0.38, sy: 0.14, sz: 0.22 }
  ];

  chips.forEach((chip) => {
    const body = new THREE.Mesh(new THREE.BoxGeometry(chip.sx, chip.sy * 0.82, chip.sz), bodyMaterial);
    body.position.set(chip.x, chip.y, chip.z);
    body.castShadow = !mobile;
    body.receiveShadow = true;
    scene.add(body);

    const pinCount = chip.sx > 0.7 ? 5 : 4;
    for (let i = 0; i < pinCount; i += 1) {
      const pin = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.018, 0.04), pinMaterial);
      pin.position.set(
        chip.x - chip.sx / 2 - 0.04,
        BOARD_TOP_Y + 0.012,
        chip.z - ((pinCount - 1) * 0.08) / 2 + i * 0.08
      );
      const pinB = pin.clone();
      pinB.position.x = chip.x + chip.sx / 2 + 0.04;
      scene.add(pin, pinB);
    }
  });

  const regulators = [
    { x: -4.24, z: -0.84 },
    { x: 4.12, z: 0.92 },
    { x: 3.18, z: -2.18 }
  ];
  regulators.forEach((reg) => {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.1, 0.28), bodyMaterial);
    body.position.set(reg.x, 0.13, reg.z);
    scene.add(body);
    const tab = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.018, 0.22), pinMaterial);
    tab.position.set(reg.x + 0.18, BOARD_TOP_Y + 0.012, reg.z);
    scene.add(tab);
  });
}

function addDecouplingClusters(scene: THREE.Scene, mobile: boolean) {
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#ded7c6"),
    roughness: 0.54,
    metalness: 0.02
  });
  const capMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#bca25f"),
    roughness: 0.24,
    metalness: 0.68
  });

  const clusters = [
    { positions: [[-1.42, 1.56], [-1.12, 1.56], [-0.82, 1.56], [-1.12, 1.88]] },
    { positions: [[1.18, 1.58], [1.48, 1.58], [1.78, 1.58], [1.48, 1.9]] },
    { positions: [[0.98, -1.64], [1.28, -1.64], [1.58, -1.64]] },
    { positions: [[2.36, -1.84], [2.66, -1.84], [2.96, -1.84]] },
    { positions: [[-0.86, 1.92], [-0.56, 1.92], [-0.26, 1.92]] },
    { positions: [[2.18, 1.86], [2.48, 1.86], [2.78, 1.86]] },
    { positions: [[3.42, -0.18], [3.72, -0.18], [4.02, -0.18]] },
    { positions: [[-3.92, 1.18], [-3.62, 1.18], [-3.32, 1.18]] },
    { positions: [[-1.94, 2.18], [-1.64, 2.18], [-1.34, 2.18]] },
    { positions: [[0.74, 2.16], [1.04, 2.16], [1.34, 2.16]] },
    { positions: [[3.18, 1.36], [3.48, 1.36], [3.78, 1.36]] }
  ];

  clusters.forEach((cluster) => {
    cluster.positions.forEach(([x, z]) => {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.12), bodyMaterial);
      body.position.set(x, 0.12, z);
      body.castShadow = !mobile;
      body.receiveShadow = true;
      scene.add(body);

      const endA = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.062, 0.136), capMaterial);
      endA.position.set(x - 0.125, 0.12, z);
      const endB = endA.clone();
      endB.position.x = x + 0.15;
      scene.add(endA, endB);
    });
  });
}

function addResistorNetworks(scene: THREE.Scene, mobile: boolean) {
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#20252c"),
    roughness: 0.74,
    metalness: 0.08
  });
  const pinMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#bda15e"),
    roughness: 0.22,
    metalness: 0.76
  });

  const packs = [
    { x: -2.78, z: 2.24, count: 4 },
    { x: 2.74, z: -1.74, count: 5 },
    { x: 3.88, z: 1.36, count: 4 },
    { x: -3.86, z: 1.88, count: 4 },
    { x: 0.16, z: -2.02, count: 4 }
  ];

  packs.forEach((pack) => {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.08, 0.18), bodyMaterial);
    body.position.set(pack.x, 0.12, pack.z);
    body.castShadow = !mobile;
    body.receiveShadow = true;
    scene.add(body);

    for (let i = 0; i < pack.count; i += 1) {
      const offset = (-((pack.count - 1) / 2) + i) * 0.12;
      const pinNorth = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.014, 0.06), pinMaterial);
      pinNorth.position.set(pack.x + offset, BOARD_TOP_Y + 0.012, pack.z - 0.13);
      const pinSouth = pinNorth.clone();
      pinSouth.position.z = pack.z + 0.13;
      scene.add(pinNorth, pinSouth);
    }
  });
}

function addTestPadsAndHeaders(scene: THREE.Scene) {
  const copper = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#b89146"),
    roughness: 0.22,
    metalness: 0.8
  });
  const plastic = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#20241d"),
    roughness: 0.84,
    metalness: 0.02
  });

  [
    [-4.62, -2.42],
    [-4.46, -1.86],
    [4.62, -1.12],
    [4.28, 2.42],
    [-4.18, 2.38],
    [3.82, -2.38],
    [0.18, 2.48]
  ].forEach(([x, z]) => {
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.014, 18), copper);
    pad.position.set(x, BOARD_TOP_Y + 0.01, z);
    scene.add(pad);
  });

  const header = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.86), plastic);
  header.position.set(4.76, 0.18, 0.88);
  scene.add(header);
  for (let i = 0; i < 4; i += 1) {
    const pin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), copper);
    pin.position.set(4.76, BOARD_TOP_Y + 0.05, 0.58 + i * 0.18);
    scene.add(pin);
  }

  const edgeHeader = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.2, 0.28), plastic);
  edgeHeader.position.set(0.58, 0.16, 2.74);
  scene.add(edgeHeader);
  for (let i = 0; i < 10; i += 1) {
    const pin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), copper);
    pin.position.set(-0.1 + i * 0.15, BOARD_TOP_Y + 0.05, 2.74);
    scene.add(pin);
  }

  const testLoopMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#d5dbcf"),
    roughness: 0.72,
    metalness: 0.05
  });
  [
    [-4.98, 1.72],
    [-4.98, 0.9],
    [-4.98, 0.08],
    [4.88, 1.34],
    [4.88, 0.4],
    [4.88, -0.54]
  ].forEach(([x, z]) => {
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 10, 18), testLoopMaterial);
    loop.rotation.x = Math.PI / 2;
    loop.position.set(x, BOARD_TOP_Y + 0.05, z);
    scene.add(loop);
  });
}

function addFootprintOverlays(scene: THREE.Scene) {
  const silkMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color("#eef5e6"),
    transparent: true,
    opacity: 0.16,
    side: THREE.DoubleSide
  });
  const copperMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#b89045"),
    roughness: 0.26,
    metalness: 0.8
  });

  const footprintRects = [
    { x: 0, z: 0.08, w: 3.24, h: 2.96 },
    { x: 2.64, z: -0.74, w: 2.72, h: 2.06 },
    { x: -2.5, z: -1.18, w: 2.12, h: 1.18 },
    { x: 2.84, z: 1.56, w: 1.92, h: 1.26 }
  ];

  footprintRects.forEach((rect) => {
    const outline = new THREE.Mesh(new THREE.PlaneGeometry(rect.w, rect.h), silkMaterial);
    outline.rotation.x = -Math.PI / 2;
    outline.position.set(rect.x, BOARD_TOP_Y + 0.004, rect.z);
    scene.add(outline);
  });

  const localPads = [
    [-3.24, -1.18, 0.08, 0.24], [-3.0, -1.18, 0.08, 0.24], [-2.76, -1.18, 0.08, 0.24], [-2.52, -1.18, 0.08, 0.24],
    [1.84, -1.72, 0.08, 0.2], [2.06, -1.72, 0.08, 0.2], [2.28, -1.72, 0.08, 0.2], [2.5, -1.72, 0.08, 0.2],
    [3.08, 1.92, 0.08, 0.18], [3.3, 1.92, 0.08, 0.18], [3.52, 1.92, 0.08, 0.18]
  ];

  localPads.forEach(([x, z, w, h]) => {
    const pad = new THREE.Mesh(new THREE.PlaneGeometry(w, h), copperMaterial);
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(x, BOARD_TOP_Y + 0.012, z);
    scene.add(pad);
  });
}

function updateNavVisuals(
  visuals: Map<NavTargetId, NavVisual>,
  activeTargetId: NavTargetId | null,
  elapsed: number,
  reducedMotion: boolean
) {
  visuals.forEach((visual, id) => {
    const intensity = activeTargetId === id ? 0.24 : 0.015;
    const pulse = reducedMotion ? 0 : Math.sin(elapsed * 1.2 + id.length) * 0.015;
    visual.materials.forEach((material) => {
      material.emissive.set("#dbf7db");
      material.emissiveIntensity = Math.max(0, intensity + pulse);
    });
  });
}

function getProjectedBounds(
  object: THREE.Object3D,
  camera: THREE.Camera,
  host: HTMLElement
) {
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
  const padding = 6;
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
      targetId === "projects" ||
      targetId === "experience" ||
      targetId === "personal" ||
      targetId === "about" ||
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
  renderer.shadowMap.enabled = !options.mobile && !options.reducedMotion;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, options.mobile ? 1.1 : 1.5));
  renderer.setSize(host.clientWidth, host.clientHeight);
  renderer.domElement.style.opacity = String(options.sceneOpacity);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const raycaster = new THREE.Raycaster();
  const normalizedPointer = new THREE.Vector2();

  const aspect = host.clientWidth / host.clientHeight;
  const frustum = options.mobile ? 8.8 : 7.8;
  const camera = new THREE.OrthographicCamera(
    (-frustum * aspect) / 2,
    (frustum * aspect) / 2,
    frustum / 2,
    -frustum / 2,
    0.1,
    50
  );
  camera.position.set(0.0, 10.8, 0.85);
  camera.lookAt(0.0, 0.0, 0.0);

  const ambient = new THREE.HemisphereLight(0xf7fbf2, 0x798570, 1.18);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 1.65);
  key.position.set(1.2, 10.4, 1.4);
  key.castShadow = false;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xe5eee1, 0.72);
  fill.position.set(-2.8, 8.2, -0.8);
  scene.add(fill);

  const rim = new THREE.PointLight(0xf7ffef, 0.24, 18);
  rim.position.set(3.2, 6.8, -1.4);
  scene.add(rim);

  const bounce = new THREE.PointLight(0xd6eed4, 0.12, 14);
  bounce.position.set(-1.8, 2.8, 1.2);
  scene.add(bounce);

  addShadowCatcher(scene);
  addBoard(scene, options.mobile);
  addMountingHoles(scene);
  addCopperPads(scene);
  addStaticCopper(scene);
  addVias(scene);
  const visuals = addNavigationComponents(scene, options.mobile);
  addSupportICs(scene, options.mobile);
  addDecouplingClusters(scene, options.mobile);
  addResistorNetworks(scene, options.mobile);
  addTestPadsAndHeaders(scene);
  addFootprintOverlays(scene);
  const traceSegments = addTraces(scene, options);

  const interactionTarget = options.interactionTarget ?? host;
  const pointer = { x: 0, y: 0 };
  const boardOffset = new THREE.Vector3();
  const lookTarget = new THREE.Vector3(0.0, 0.04, 0.12);
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, options.mobile ? 1.1 : 1.5));
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
      segment.uniforms.uTime.value = elapsed;
      segment.uniforms.uHoverBoost.value = currentActiveTargetId === segment.targetId ? 1 : 0;
      const highlight = currentActiveTargetId === segment.targetId ? 0.42 : segment.targetId ? 0.18 : 0.1;
      const ambientPulse = options.reducedMotion ? 0 : Math.sin(elapsed * 0.5 + (segment.targetId?.length ?? 0)) * 0.015;
      segment.copper.material.emissiveIntensity = highlight + ambientPulse;
    });

    updateNavVisuals(visuals, currentActiveTargetId, elapsed, options.reducedMotion);

    if (!options.reducedMotion && !options.mobile) {
      boardOffset.x += ((pointer.x * 0.06) - boardOffset.x) * 0.05;
      boardOffset.z += ((pointer.y * 0.04) - boardOffset.z) * 0.05;
      camera.position.x += ((0.0 + pointer.x * 0.04) - camera.position.x) * 0.04;
      camera.position.z += ((0.85 + pointer.y * 0.03) - camera.position.z) * 0.04;
    } else {
      boardOffset.lerp(EMPTY_VECTOR, 0.08);
    }

    lookTarget.x = 0.0 + boardOffset.x;
    lookTarget.z = 0.0 + boardOffset.z;
    camera.lookAt(lookTarget);
    syncNavElements();

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();

  return {
    setActiveNavTarget(targetId) {
      if (
        targetId === "projects" ||
        targetId === "experience" ||
        targetId === "personal" ||
        targetId === "about" ||
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
