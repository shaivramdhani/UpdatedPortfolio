export type PowerboardAsset = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

const assetRoot = "/images/projects/powerboard";

export const powerboardProject = {
  organization: "UBC Thunderbots",
  descriptor: "Four-layer power distribution and high-voltage PCB redesign for an autonomous soccer robot",
  opening:
    "I worked on a layout-focused redesign of the board that distributes power across the robot and supports its high-voltage kick and chip system. The revision had to combine multiple regulated rails, an isolated high-voltage domain, embedded interfaces, and new support circuitry within changing mechanical constraints.",
  ownership:
    "My scope: PCB layout redesign, integration of new schematic blocks, connector and interface routing, isolation-aware placement, and planning for board bring-up and validation.",
  statusItems: [
    { label: "System input", value: "24 V battery" },
    { label: "Power domains", value: "5 regulated rails" },
    { label: "Board stackup", value: "4 layers" }
  ],
  sectionLinks: [
    { href: "#challenge", label: "Challenge" },
    { href: "#architecture", label: "Power tree" },
    { href: "#isolation", label: "Isolation" },
    { href: "#flyback", label: "Flyback" },
    { href: "#new-circuits", label: "New circuits" },
    { href: "#testability", label: "Testability" },
    { href: "#pcb-layout", label: "PCB" },
    { href: "#lessons", label: "Lessons" }
  ],
  challenge: {
    intro:
      "The existing powerboard needed a new revision for both electrical and mechanical reasons. Switching-converter noise concerns—especially around the flyback stage—made layout a central design problem, while robot packaging changes required several connectors to move.",
    body:
      "The previous revision also exposed too few useful test nodes. The redesign therefore had to do more than fit the circuits: it needed to make power conversion, isolation, and system interfaces easier to inspect during bring-up.",
    constraints: [
      "Fit updated connector locations and robot geometry",
      "Maintain separation between low- and high-voltage domains",
      "Route multiple regulated rails and communication interfaces",
      "Improve access to converter and feedback test nodes",
      "Reuse proven portions of the previous design where practical",
      "Support a prototype-first validation workflow"
    ]
  },
  powerArchitecture: {
    intro:
      "A 24 V robot battery feeds a mixed-voltage power tree. The board combines conventional low-voltage rails for control electronics with isolated support power and a flyback stage for the capacitor-charging system.",
    source: "24 V battery input",
    branches: [
      {
        label: "Robot power",
        purpose: "Non-isolated distribution",
        nodes: ["12 V buck rail", "5.3 V buck rail", "3.3 V LDO rail"]
      },
      {
        label: "HV control",
        purpose: "Galvanically isolated support",
        nodes: ["Isolated 12 V → 15 V DC/DC", "Isolated gate-drive supply", "Isolated feedback path"]
      },
      {
        label: "Kick / chip energy",
        purpose: "Capacitor charging",
        nodes: ["Flyback converter", "240 V design rail", "Kick and chip capacitors"]
      }
    ]
  },
  isolation: {
    intro:
      "The high-voltage capacitor-charging circuitry and the low-voltage controller cannot share an unrestricted electrical domain. The design therefore uses galvanic isolation at the power, drive, and measurement boundaries.",
    lowVoltage: ["MCU and logic", "USB-to-UART", "Power monitoring", "Robot communication interfaces"],
    boundary: ["Flyback transformer", "Isolated 12 V → 15 V converter", "Isolated gate drivers", "Isolated feedback amplifier"],
    highVoltage: ["Flyback power stage", "240 V rail", "Kick / chip capacitor outputs", "High-voltage feedback node"],
    note:
      "On the four-layer PCB, power and ground regions were split between the high- and low-voltage domains so that copper geometry supported the intended isolation architecture."
  },
  flyback: {
    intro:
      "The flyback converter was the main layout focus because it creates the high-voltage rail used to charge the kick and chip capacitors. Fast switching edges and pulsed current paths make physical placement and loop geometry part of converter behaviour.",
    body:
      "The redesign focused on reducing high-current loop area, improving placement around switching nodes, and making the primary-side circuit easier to probe. Possible snubber changes and primary-side noise remained characterization tasks rather than claimed results.",
    quote:
      "For a switching converter, the schematic defines the connections; the PCB determines the physical current loops that actually switch.",
    priorities: [
      "Keep high-current switching loops compact",
      "Place critical components around the flyback stage deliberately",
      "Separate switching nodes from sensitive control and feedback paths",
      "Preserve the isolation boundary in copper and placement",
      "Expose relevant nodes for oscilloscope measurements",
      "Leave room for measurement-led iteration"
    ]
  },
  addedCircuitsIntro:
    "The redesign incorporated three new functional blocks while retaining and rerouting existing board functions where practical.",
  addedCircuits: [
    {
      title: "High-voltage feedback",
      body: "Added an isolated-amplifier feedback path so the low-voltage controller could observe the high-voltage domain without removing galvanic isolation."
    },
    {
      title: "Dribbler motor drive",
      body: "Integrated a dribbler motor-driver block using isolated gate-drive circuitry alongside the existing power functions."
    },
    {
      title: "Automatic flashing",
      body: "Added USB-to-UART auto-flashing circuitry to reduce friction during firmware deployment and debugging."
    }
  ],
  interfaces: [
    { signal: "UART", purpose: "Flashing and debug" },
    { signal: "I2C", purpose: "Power monitoring" },
    { signal: "SPI", purpose: "High-voltage sensing interface" },
    { signal: "Test points", purpose: "Rail and converter access" }
  ],
  testability: {
    intro:
      "Testability was treated as a board-level requirement. Additional headers and test points were added so bring-up could isolate individual converters, feedback paths, and ground domains instead of treating the board as one opaque system.",
    improvements: [
      "Added access to flyback and buck-converter nodes",
      "Made critical rails easier to probe",
      "Added debug and programming access",
      "Kept prototype circuitry accessible for rework"
    ],
    plannedChecks: [
      "Bring up low-voltage rails before enabling the high-voltage stage",
      "Check separation between isolated ground domains",
      "Measure flyback switching behaviour and primary-side noise",
      "Verify the isolated high-voltage feedback path",
      "Evaluate whether snubber changes are required",
      "Confirm system interfaces after mechanical integration"
    ]
  },
  pcb: {
    intro:
      "The resulting four-layer layout combines power conversion, embedded control, isolated sensing, motor-drive support, communication interfaces, and high-voltage capacitor connections on one mechanically constrained board.",
    body:
      "The front render shows the dense low-voltage control and conversion circuitry alongside clearly marked high-voltage outputs. The back render exposes the larger power components and makes the physical separation between functional regions easier to see. This revision was designed to support prototype validation; the renders do not by themselves establish electrical performance."
  },
  lessons: [
    {
      title: "Layout is part of the converter",
      body: "Switching-loop area, placement, and return paths influence flyback behaviour just as much as the schematic connections."
    },
    {
      title: "Isolation must be physical",
      body: "Galvanic isolation has to remain visible in power routing, ground regions, component placement, and measurement interfaces."
    },
    {
      title: "Design for bring-up",
      body: "Test points and accessible internal nodes reduce the time between observing a bad rail and finding the relevant circuit."
    },
    {
      title: "Mechanical changes propagate",
      body: "Moving connectors affects routing, current paths, serviceability, and how the board integrates with the complete robot."
    },
    {
      title: "Integrate interfaces deliberately",
      body: "UART, I2C, SPI, sensing, and power routing have different constraints even when they share the same PCB."
    },
    {
      title: "Prototype around uncertainty",
      body: "Reusing stable circuitry while exposing new blocks for measurement made the next validation steps clearer and lower risk."
    }
  ],
  outcome:
    "The redesign produced a prototype-ready board revision with the new feedback, motor-drive, auto-flashing, connector, and test-access changes integrated. The next engineering stage is measured bring-up of the rails, isolation boundary, flyback switching behaviour, and high-voltage feedback—not an assumption that the layout alone guarantees performance.",
  assets: {
    cover: {
      src: `${assetRoot}/powerboard-cover.webp`,
      alt: "Populated Thunderbots powerboard surrounded by the robot's motor electronics",
      caption: "Populated powerboard — Assembled hardware with the surrounding Thunderbots motor electronics.",
      width: 2400,
      height: 1808
    },
    front: {
      src: `${assetRoot}/powerboard-front.webp`,
      alt: "Front-side 3D render of the Thunderbots power distribution and high-voltage PCB",
      caption:
        "Front-side board render — Mixed-voltage conversion, embedded control, isolated sensing, and kick / chip connections integrated on the four-layer PCB.",
      width: 2178,
      height: 1140
    },
    back: {
      src: `${assetRoot}/powerboard-back.webp`,
      alt: "Back-side 3D render of the Thunderbots power distribution and high-voltage PCB",
      caption:
        "Back-side board render — Power components, high-voltage markings, connectors, and the reverse-side routing regions.",
      width: 1932,
      height: 820
    }
  }
} as const;
