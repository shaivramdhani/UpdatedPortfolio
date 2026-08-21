export type RfProjectAsset = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

const assetRoot = "/images/projects/rf-drone-detection";

export const rfDroneProject = {
  competition: "Design competition prototype",
  descriptor: "RF front-end prototype exploring detection of signals associated with common drone communication bands",
  opening:
    "For a design competition, I developed the electrical architecture for a compact receiver concept that could observe RF energy in frequency regions commonly used by drone communication links. I designed the path from the antenna through RF gain and filtering to logarithmic power detection and an MCU-readable output, then translated the system into a custom PCB.",
  ownership:
    "My scope: electrical architecture, component selection, schematic capture, and the first PCB layout iteration. The project was a prototype exploration—not a validated drone-identification system or production receiver.",
  statusItems: [
    { label: "Project stage", value: "Competition prototype" },
    { label: "Primary focus", value: "RF + analog hardware" },
    { label: "Layout goal", value: "Designed toward 50 Ω" }
  ],
  sectionLinks: [
    { href: "#signal-chain", label: "Signal chain" },
    { href: "#rf-layout", label: "RF layout" },
    { href: "#front-end", label: "Front end" },
    { href: "#detection", label: "Detection" },
    { href: "#power", label: "Power" },
    { href: "#pcb", label: "PCB" },
    { href: "#lessons", label: "Lessons" }
  ],
  signalChain: [
    "U.FL antenna",
    "PGA-103+ RF gain",
    "Mini-Circuits filters",
    "AD8318 log detector",
    "MCU ADC"
  ],
  signalChainCopy: [
    "The design goal was to turn a small, high-frequency antenna signal into a low-frequency measurement that a conventional microcontroller could read. Because RF behaviour depends on interconnect geometry and return paths, the signal could not be treated like an ordinary low-frequency analog input.",
    "The gain stage raises the incoming signal level, the filters limit which parts of the spectrum reach the detector, and the AD8318 converts RF input level into an analog voltage. The MCU can then sample that voltage instead of attempting to digitize a multi-gigahertz waveform directly."
  ],
  supportBlocks: [
    { label: "RF interfaces", value: "U.FL antenna connections" },
    { label: "Detection output", value: "Low-frequency analog voltage" },
    { label: "Supporting systems", value: "5 V / 3.3 V rails + radio module" }
  ],
  logDetectorCallout: {
    title: "Why a logarithmic detector?",
    body:
      "Directly sampling GHz-frequency RF would require substantially faster and more complex hardware. A logarithmic detector instead produces a low-frequency voltage related to received RF power, allowing a conventional MCU ADC to observe changes in signal level."
  },
  rfLayout: {
    intro:
      "This was my first time experimenting with controlled-impedance and impedance-matched RF traces on a PCB. I designed toward the 50 Ω interconnect convention used by the selected RF components, without claiming that the finished geometry was verified with a VNA.",
    detail:
      "The layout exercise changed how I thought about a connection on a board. Trace width, stackup, dielectric thickness, copper geometry, and the nearby ground reference all influence characteristic impedance. Pads, connectors, branches, and routing changes can add discontinuities, while longer routes make placement decisions increasingly important as frequency rises.",
    quote:
      "One of the biggest changes from my previous PCB work was realizing that at RF frequencies, a PCB trace is no longer just a wire. Its geometry and return path become part of the circuit.",
    practices: [
      "Design RF interconnects around a target geometry and board stackup",
      "Keep a continuous ground reference beneath the RF path",
      "Use short, direct connections between RF components",
      "Reduce abrupt branches and routing discontinuities",
      "Separate sensitive RF sections from switching power where practical",
      "Place local decoupling close to the devices it supports"
    ]
  },
  frontEnd: {
    intro:
      "The receiver begins at a U.FL antenna interface. The coupled RF signal enters a PGA-103+ gain stage, followed by its bias and support network before continuing into the filtering section.",
    body:
      "This portion of the schematic established the transition from the external RF connection into the on-board signal path. Placement and routing around the connector, coupling component, amplifier, and grounded support components were therefore part of the electrical design—not just a packaging step.",
    details: ["U.FL antenna input", "RF / AC coupling", "PGA-103+ gain stage", "Bias and local support circuitry"]
  },
  detection: {
    intro:
      "Mini-Circuits filter components were placed ahead of an AD8318 logarithmic RF detector. The network was intended to make the receiver more selective to frequency regions of interest rather than allowing a broadband detector to respond equally to every nearby RF source.",
    body:
      "The AD8318 converts RF input level into an analog output voltage suitable for the MCU interface. The schematic defines the intended filtering and detection architecture; it does not establish measured filter response, calibrated detector accuracy, or a validated drone-detection range."
  },
  power: {
    flow: ["Battery input", "5 V switching regulator", "3.3 V LDO"],
    intro:
      "The power architecture generates a 5 V rail with a switching regulator, then derives 3.3 V through a linear regulator. Separate rails let the RF / analog and digital sections receive the voltages required by their selected components.",
    note:
      "RF circuits make local decoupling and power-supply noise particularly important because unwanted supply noise can couple into sensitive portions of the receiver. This first revision included local bypass components, but the supply network was not professionally characterized as an RF-quiet design."
  },
  embedded: {
    intro:
      "The MCU receives the detector's low-frequency analog output and provides a path for basic processing or communication of detection information. A separate radio module and U.FL connection support wireless communication, while an SWD header provides programming and debug access.",
    note:
      "The page intentionally does not claim signal classification, direction finding, protocol decoding, or drone identification; the documented work is the electrical interface and PCB prototype."
  },
  pcb: {
    intro:
      "The board brings the RF input, gain stage, filters, logarithmic detector, MCU, auxiliary wireless module, power supplies, and programming interface into one layout.",
    body:
      "Component placement reflects an attempt to keep the RF path relatively direct and to place it away from switching power and digital circuitry where practical. It should be read as a first RF-layout iteration rather than a production-optimized or impedance-verified board.",
    blocks: [
      "RF input and front-end circuitry",
      "Mini-Circuits RF filters",
      "AD8318 logarithmic detector",
      "MCU and analog detector input",
      "Auxiliary wireless module",
      "5 V / 3.3 V power supplies",
      "Programming and debug interface"
    ]
  },
  lessons: [
    {
      title: "Controlled-impedance routing",
      body: "My first practical exposure to laying out traces around a target characteristic impedance instead of treating them as ideal wires."
    },
    {
      title: "RF return paths",
      body: "Learned why a close, uninterrupted ground reference is critical to the behaviour of a high-frequency interconnect."
    },
    {
      title: "Physical placement",
      body: "At GHz frequencies, routing distance, pads, connectors, and component placement become meaningful circuit parameters."
    },
    {
      title: "Logarithmic RF detection",
      body: "Learned how a log detector compresses a wide RF input range into an analog signal that a conventional MCU can measure."
    },
    {
      title: "Filtering before detection",
      body: "Learned why selectivity has to occur ahead of a broadband detector when the architecture needs sensitivity to particular frequency regions."
    },
    {
      title: "Power integrity",
      body: "Gained a better appreciation for local decoupling and for separating noisy switching circuitry from sensitive analog and RF paths."
    }
  ],
  reflection:
    "This project was an introduction to RF PCB design rather than a complete RF engineering exercise. It showed me how much additional characterization—such as VNA measurements, gain and loss measurements, detector calibration, and real-world RF testing—would be required to turn the concept into a robust receiver.",
  assets: {
    pcb: {
      src: `${assetRoot}/pcb-implementation.webp`,
      alt: "Top-down 3D render of the RF receiver prototype PCB",
      caption:
        "PCB implementation — First layout iteration integrating the RF, analog, digital, and power sections.",
      width: 1902,
      height: 1284
    },
    digitalInterface: {
      src: `${assetRoot}/digital-interface.webp`,
      alt: "Schematic of the MCU, radio module, analog detector input, and SWD interface",
      caption: "Digital interface — MCU, radio module, analog detector input, and SWD programming interface.",
      width: 1740,
      height: 1102
    },
    filteringDetection: {
      src: `${assetRoot}/filtering-detection.webp`,
      alt: "Schematic of the Mini-Circuits filtering network and AD8318 logarithmic detector",
      caption: "Filtering and RF detection — Frequency-selective front end feeding the AD8318 logarithmic detector.",
      width: 1662,
      height: 774
    },
    rfFrontEnd: {
      src: `${assetRoot}/rf-front-end.webp`,
      alt: "Schematic of the U.FL antenna input and PGA-103+ RF gain stage",
      caption: "RF front end — U.FL antenna input, RF gain stage, and interface into the filtering network.",
      width: 1624,
      height: 698
    },
    powerArchitecture: {
      src: `${assetRoot}/power-architecture.webp`,
      alt: "Schematic of the battery input, 5 volt switching regulator, and 3.3 volt linear regulator",
      caption: "Power architecture — Battery input with 5 V switching regulation and a 3.3 V linear rail.",
      width: 1494,
      height: 988
    }
  }
} as const;
