export type ProjectAsset = {
  src: string;
  kind: "image" | "video";
  label: string;
  description: string;
  alt: string;
  caption?: string;
  poster?: string;
};

const assetRoot = "/images/projects/enph-253";

export const enph253Project = {
  descriptor: "Custom motor electronics, mixed-signal sensing, PCB design & embedded hardware integration",
  course: "UBC ENPH 253 — Introduction to Instrument Design, Summer 2026",
  opening:
    "My team and I built an autonomous rover for a two-minute Mars habitat challenge. I focused on the electrical system: custom motor-control boards, PCB integration, power distribution, modulated IR sensing, actuator electronics, and the hands-on work of bringing the hardware together and debugging it on the robot.",
  ownership:
    "Team project · My focus: electrical design, PCB integration, sensing, actuator electronics, bring-up, testing and debugging",
  highlights: [
    { value: "5×", label: "Brushed DC motor channels" },
    { value: "3×", label: "Core custom PCBs" },
    { value: "2×", label: "ESP32 controllers" },
    { value: "1 / 10 kHz", label: "IR beacon frequencies" },
    { value: "3 types", label: "Stepper, servo & DC actuation" },
    { value: "I2C + UART", label: "Embedded interfaces" }
  ],
  sectionLinks: [
    { href: "#mission", label: "Mission" },
    { href: "#test-run", label: "Test run" },
    { href: "#architecture", label: "Architecture" },
    { href: "#motor-drive", label: "Motor drive" },
    { href: "#ir-receiver", label: "IR receiver" },
    { href: "#power-integration", label: "Power & signal" },
    { href: "#bring-up", label: "Bring-up" },
    { href: "#result", label: "Outcome" }
  ],
  challenge: {
    paragraphs: [
      "The course challenge was to build a fully autonomous, battery-powered rover for a two-minute mission on an approximately 8 ft × 8 ft field. Starting from one corner, the robot had to cross ramps and uneven terrain before completing a mix of navigation, object-handling, and construction tasks.",
      "The mission combined five distinct objectives: reach the habitat site, assemble a habitat, build a radio mast, uncover a solar panel, and collect mineral samples. That variety drove our mecanum chassis and multi-actuator design. My job was to make the electrical pieces behave as one system while the rover was moving, vibrating, and drawing rapidly changing current."
    ],
    tasks: [
      {
        title: "Traverse rough terrain",
        body: "Leave the start zone and cross ramps and uneven transitions to reach the habitat site."
      },
      {
        title: "Assemble the habitat",
        body: "Position and assemble pre-made modules inside the designated colony building area."
      },
      {
        title: "Build the radio tower",
        body: "Handle and nest the mast segments together inside the tower build area."
      },
      {
        title: "Activate the solar array",
        body: "Find the solar panel using its modulated IR beacon, then remove the protective cover."
      },
      {
        title: "Collect mineral samples",
        body: "Search the field for mineral targets and retrieve them for future manufacturing."
      }
    ]
  },
  testRun: {
    title: "A full-system test on the physical course",
    body:
      "This two-minute recording puts the electrical work in context. Away from the bench, locomotion, sensing, communication, power delivery, and mechanism timing all had to hold together as one autonomous system.",
    details: ["≈ 2 minute run", "Physical course", "Integrated hardware"]
  },
  architectureCopy: {
    intro:
      "I distributed the electronics across custom PCBs instead of wiring the rover entirely from loose development modules. The hardest part was not connecting one sensor or motor; it was moving power, commands, and measurements reliably through a compact, electrically noisy machine.",
    note:
      "This system map shows how I organized the electrical design around three domains: high-current actuation, embedded control, and sensing."
  },
  motorDrive: {
    intro:
      "The rover used five brushed DC motor channels, including the mecanum drivetrain. Because the course rules did not allow us to rely on a ready-made H-bridge module, I worked through the MOSFET power stage, PCB layout, board bring-up, and component-level fault finding.",
    design:
      "I had to translate low-voltage PWM into dependable high-side and low-side switching while thinking about motor current, switching transients, and shoot-through. That pushed me to pay much closer attention to gate drive, bulk and local decoupling, motor-noise suppression, connector ratings, and the geometry of high-current copper paths.",
    integration:
      "Once the design became a real board, placement and wiring mattered just as much as the schematic. MOSFET spacing, connector position, return-current paths, and the board's location beside the drivetrain all affected how practical the design was to assemble and debug.",
    topics: [
      "High-side / low-side gate drive",
      "PWM switching behaviour",
      "Current & return paths",
      "Bulk and local decoupling",
      "Motor-terminal suppression",
      "Trace width & connector current"
    ]
  },
  irReceiver: {
    intro:
      "One task required the rover to find a solar panel using an IR beacon modulated at either 1 kHz or 10 kHz. I could not treat that as a simple light-versus-dark measurement because ambient light and electrical noise would make a raw threshold unreliable.",
    processing:
      "I used a phototransistor with analog filtering and amplification to condition the signal before it reached an ESP32 ADC. In firmware, a Goertzel-based calculation looked specifically at the two expected frequencies, giving the robot a much more useful signal for alignment than total light intensity alone.",
    integration:
      "This part of the project taught me that the analog circuit, sampling window, detection latency, sensor position, and mechanical alignment all had to be tuned together. A clean signal on the bench only became useful when it produced repeatable behaviour on the assembled rover.",
    considerations: [
      "ADC sampling rate & window length",
      "Ambient-light rejection",
      "1 kHz / 10 kHz discrimination",
      "Detection latency",
      "Physical sensor placement",
      "Repeatable panel alignment"
    ]
  },
  powerIntegration: {
    intro:
      "I was placing sensitive analog and digital electronics beside brushed motors, a stepper driver, servos, DC actuators, and switching regulators. That made power distribution, signal integrity, and physical packaging part of the same problem.",
    noisyLoads: ["5× brushed DC motors", "Stepper driver", "Servos", "DC actuators", "Switching regulators"],
    sensitiveSignals: ["IR analog front end", "ESP32 ADC", "I2C IMU", "Line sensors", "Limit switches"],
    practices: [
      "Local decoupling at active devices",
      "Bulk capacitance near dynamic loads",
      "Short, deliberate high-current return paths",
      "Motor-terminal noise suppression",
      "Power and signal routing separation",
      "Serviceable connectors and strain relief"
    ],
    wiring:
      "During integration, I repeatedly recrimped and reorganized wiring so the robot was easier to service and less likely to fail when handled. It reinforced a simple lesson: on a moving robot, a connector or wire that cannot survive normal use is still an electrical design problem."
  },
  stepper: {
    intro:
      "I used a DRV8425-based stepper stage for the vertical mechanism. When the first commands produced no motion, I stopped treating it as a software problem and started measuring the driver directly.",
    probes: ["Supply rails", "FAULT", "ENABLE", "STEP", "DIR", "Charge pump / boosted rail"],
    resolution:
      "By probing the control pins and supply nodes, I found issues around the FAULT / ENABLE configuration and charge-pump circuitry. I reworked the board, corrected the hardware, and then confirmed that the driver could move the stepper.",
    integration:
      "After bring-up, I integrated the stage with a lower limit switch for homing, STEP / DIR control, and adjustable travel limits. The biggest lesson was to verify every layer—from the command waveform to the driver's internal supply—before blaming the mechanism."
  },
  sensors: {
    intro:
      "Two ESP32 controllers tied the drivetrain and mechanisms to the rover's navigation and safety sensors. I kept the interfaces conventional and easy to inspect: ADC for the IR receiver, I2C for the IMU, UART between controllers, and digital inputs for reflectance sensors and switches.",
    integrations: ["Reflectance / line sensing", "MPU-6050 over I2C", "Ultrasonic / distance sensing", "Limit switches", "ESP32 ADC", "Controller UART"],
    imuTitle: "IMU case study · separating bus integrity from software",
    imu:
      "Late in integration, the MPU-6050 began failing in a way that looked electrical. I moved the sensor, inspected SDA and SCL, noticed that probing could disturb the bus, switched to a 10× probe, added local decoupling, and tracked both read failures and bus health. The final cause turned out to be software rather than the physical I2C bus.",
    imuLesson:
      "The electrical investigation was still valuable because it let me rule out the suspected hardware causes with evidence instead of assuming that the last change had fixed the problem."
  },
  testability: {
    intro:
      "I could only bring the rover up efficiently when its internal state was visible. I tested one actuator or sensor at a time, checked rails and waveforms with a DMM and oscilloscope, and used live telemetry while the assembled robot was moving.",
    tools: ["Oscilloscope", "DMM", "Bench tests", "Live telemetry", "Adjustable thresholds", "Isolated actuator tests", "Sensor diagnostics"],
    telemetry:
      "I treated telemetry as a hardware tool. Seeing ADC readings, sensor states, IMU health, motor parameters, and manual actuator controls made it much faster to turn a vague system symptom into a specific probe point and a repeatable test."
  },
  finalIntegration: {
    intro:
      "The finished electrical system connected mecanum drive, IR alignment, line sensing, IMU heading, a vertical stepper mechanism, servos, limit switches, and distance sensors in one autonomous rover.",
    changes: [
      "Improved sensor mounting and positioning",
      "Recrimped and reorganized wiring",
      "Improved mechanical actuation of limit switches",
      "Added or revised local decoupling",
      "Made alignment thresholds adjustable",
      "Reduced nonessential communication during autonomous operation"
    ],
    close:
      "Near the end, my work was less about adding features and more about removing ambiguity: firmer connections, repeatable sensor geometry, cleaner power behaviour, and measurements that made failures easier to diagnose."
  },
  outcome: {
    intro:
      "The project resulted in an integrated autonomous rover and a set of custom electronics that I could bring up, repair, and refine under real system constraints. More importantly, it changed how I approach electrical design: I now think about test points, current return paths, connectors, sensor placement, and failure modes from the start.",
    items: [
      { title: "Integrated rover", body: "I brought the motor, sensing, control, and actuator electronics together on the physical platform." },
      { title: "Custom hardware", body: "I gained practical experience designing and integrating custom motor-driver and controller PCBs." },
      { title: "Measured debugging", body: "I used scope, DMM, and telemetry data to isolate faults instead of relying on trial and error." }
    ]
  },
  architecture: {
    source: {
      label: "Power input & distribution",
      nodes: ["Battery / main power", "Protection / fuse", "High-current distribution", "Regulated logic rails"]
    },
    branches: [
      {
        label: "Actuation",
        interface: "High-current paths · PWM · STEP / DIR · servo PWM",
        nodes: ["Custom brushed DC motor channels", "DRV8425 stepper stage", "Servo & DC actuators"]
      },
      {
        label: "Control",
        interface: "Regulated logic power · controller UART",
        nodes: ["ESP32 controller #1", "ESP32 controller #2"]
      },
      {
        label: "Sensing",
        interface: "ADC · I2C · digital inputs",
        nodes: ["IR analog front end", "Reflectance sensors", "Distance sensors", "MPU-6050 IMU", "Limit switches"]
      }
    ]
  },
  interfaces: [
    { signal: "PWM", purpose: "Brushed DC motor control" },
    { signal: "STEP / DIR", purpose: "Vertical stepper mechanism" },
    { signal: "Servo PWM", purpose: "Mechanism actuation" },
    { signal: "ADC", purpose: "IR receiver acquisition" },
    { signal: "I2C", purpose: "MPU-6050 heading data" },
    { signal: "UART", purpose: "Controller-to-controller communication" },
    { signal: "Digital I/O", purpose: "Line sensors & limit switches" }
  ],
  irSignalChain: [
    "Modulated IR beacon",
    "Phototransistor",
    "Analog filtering & gain",
    "ESP32 ADC",
    "Goertzel frequency estimate",
    "Alignment decision"
  ],
  debugCases: [
    {
      label: "Case 01 · Motor power stage",
      title: "H-bridge power short",
      symptom: "A motor-driver board developed a severe VCC-to-ground short and repeatedly opened the system fuse.",
      investigation:
        "I disconnected the load, checked resistance across the power rails, and isolated sections of the bridge until I found the damaged devices.",
      rootCause:
        "I confirmed that MOSFETs in one bridge had shorted. Accidental contact at an exposed high-current node was a plausible trigger, but I could not prove it conclusively.",
      resolution:
        "I removed and tested the failed parts, repaired the bridge, and inspected the nearby mechanical and electrical contact points before powering it again.",
      lesson: "Separate what I measured from what I only suspect."
    },
    {
      label: "Case 02 · Actuator bring-up",
      title: "Stepper fault & charge pump",
      symptom: "The vertical stepper mechanism did not move during initial board bring-up.",
      investigation:
        "I probed the supply rails, FAULT, ENABLE, STEP, DIR, and charge-pump behaviour directly at the driver.",
      rootCause:
        "The hardware configuration around FAULT / ENABLE and the charge-pump circuitry was preventing correct operation.",
      resolution:
        "I reworked the PCB, corrected the hardware issues, and verified motion before adding homing and travel limits.",
      lesson: "A valid command waveform does not prove that the power stage is ready to switch."
    },
    {
      label: "Case 03 · Sensor integration",
      title: "Intermittent IMU behaviour",
      symptom: "Late-stage heading failures initially looked like an I2C signal-integrity problem.",
      investigation:
        "I relocated the IMU, inspected SDA and SCL on the oscilloscope, changed to a 10× probe after noticing probe interaction, added local decoupling, and tracked read failures.",
      rootCause:
        "The final cause was software rather than the physical bus.",
      resolution:
        "The measurements let me rule out the suspected electrical causes and redirect the investigation toward firmware.",
      lesson: "Good instrumentation narrows the fault domain, even when my first hypothesis is wrong."
    }
  ],
  takeaways: [
    {
      title: "I now design around failure modes",
      body: "High-current electromechanical hardware exposed problems that isolated logic-circuit testing could not."
    },
    {
      title: "I measure before I guess",
      body: "PWM, I2C, fault-signal, and rail measurements narrowed faults faster than blind code or component changes."
    },
    {
      title: "Hardware and firmware have to be debugged together",
      body: "Several failures only became understandable after I paired electrical measurements with firmware instrumentation."
    },
    {
      title: "Mixed-signal integration needs deliberate boundaries",
      body: "Motor PWM, switching regulators, and actuators had to coexist with a comparatively sensitive IR and ADC signal chain."
    },
    {
      title: "Mechanical reliability is electrical reliability",
      body: "Connector movement, sensor position, and limit-switch actuation can all look like circuit or firmware faults."
    }
  ],
  assets: {
    robotHero: {
      src: `${assetRoot}/robot-hero.webp`,
      kind: "image",
      label: "Integrated autonomous rover",
      description: "Top-down view of the completed rover.",
      alt: "Top-down view of the autonomous Mars habitat rover and its integrated electronics",
      caption: "Integrated rover — the custom electronics, mecanum drivetrain, vertical mechanism, sensors, and wiring installed on the final platform."
    },
    competitionField: {
      src: `${assetRoot}/competition-field.svg`,
      kind: "image",
      label: "Mars habitat mission field",
      description: "Simplified field plan showing terrain, task stations, obstacles, and mineral samples.",
      alt: "Simplified top-down plan of the Mars habitat challenge field, showing the start zone, rough terrain, solar panel, radio tower, habitat area, mineral samples, and obstacles",
      caption: "Mission field, redrawn from the course map — a compact terrain and manipulation challenge; schematic only and not to scale."
    },
    fullRunVideo: {
      src: `${assetRoot}/robot-full-run.mp4`,
      kind: "video",
      label: "Full rover test run",
      description: "Two-minute test run of the integrated rover on the physical course.",
      alt: "Full test run of the autonomous Mars habitat rover operating on the physical course",
      caption: "Full test run — the integrated autonomous rover operating on the physical course.",
      poster: `${assetRoot}/robot-full-run-poster.webp`
    },
    motherboardPcb: {
      src: `${assetRoot}/motherboard-pcb.webp`,
      kind: "image",
      label: "Motherboard PCB",
      description: "3D board render of the central robot motherboard.",
      alt: "Three-dimensional render of the custom rover motherboard PCB",
      caption: "Custom motherboard — the central board organized the two ESP32 controllers, sensor interfaces, actuator connections, and system wiring."
    },
    frontMotorDriverPcb: {
      src: `${assetRoot}/front-motor-driver-pcb.webp`,
      kind: "image",
      label: "Front motor-driver PCB",
      description: "3D board render of the front motor-driver board.",
      alt: "Three-dimensional render of the custom front motor-driver PCB",
      caption: "Front motor-driver board — one of the custom MOSFET-based power boards used for the mecanum drivetrain."
    },
    backMotorDriverPcb: {
      src: `${assetRoot}/back-motor-driver-pcb.webp`,
      kind: "image",
      label: "Back motor-driver PCB",
      description: "3D board render of the back motor-driver board.",
      alt: "Three-dimensional render of the custom back motor-driver PCB",
      caption: "Back motor-driver board — a second custom board arranged around the rear drivetrain connections and high-current paths."
    },
    hbridgeSchematic: {
      src: `${assetRoot}/hbridge-schematic.webp`,
      kind: "image",
      label: "H-bridge schematic",
      description: "MOSFET H-bridge schematic for the brushed DC motors.",
      alt: "MOSFET H-bridge schematic used for brushed DC motor control",
      caption: "Motor power stage — discrete MOSFET H-bridges converted PWM control into bidirectional brushed-motor drive."
    },
    irSchematic: {
      src: `${assetRoot}/ir-schematic.webp`,
      kind: "image",
      label: "IR receiver schematic",
      description: "Analog filtering and amplification ahead of the ESP32 ADC.",
      alt: "Analog schematic for the modulated infrared receiver",
      caption: "IR receiver — analog conditioning prepared the phototransistor signal for frequency-selective processing on the ESP32."
    },
    stepperSchematic: {
      src: `${assetRoot}/stepper-schematic.webp`,
      kind: "image",
      label: "Stepper-driver schematic",
      description: "DRV8425-based stepper stage for the vertical mechanism.",
      alt: "DRV8425-based stepper-driver schematic",
      caption: "Stepper stage — the DRV8425 controlled the vertical mechanism through STEP and DIR commands."
    }
  } satisfies Record<string, ProjectAsset>
} as const;
