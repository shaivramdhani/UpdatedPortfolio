export type BikeProjectAsset = {
  src: string;
  alt: string;
  label: string;
  description: string;
  caption?: string;
  kind: "image" | "video";
};

const assetRoot = "/images/projects/bike-computer";

export const bikeComputerProject = {
  eyebrow: "Independent hardware project · 2026",
  descriptor:
    "Designing a rechargeable custom PCB for GNSS ride logging, outdoor data display, low-power operation, onboard storage, and BLE connectivity.",
  opening:
    "I am designing a custom bike computer around a single-cell Li-ion battery, an nRF52840-based MCU/BLE module, GNSS, barometric altitude sensing, SPI flash, and a reflective memory LCD. The goal is to take the embedded system from schematic through PCB bring-up and firmware while treating battery life, RF integration, testability, and data integrity as first-class design constraints.",
  currentStatus:
    "Schematic finalization. Major subsystems are designed, and I am completing MCU integration, physical controls, battery monitoring, debug access, and bring-up test points before beginning PCB layout.",
  ownership:
    "Current work covers product-level requirements, system architecture, component and interface selection, schematic capture, power budgeting, and validation planning. PCB fabrication, firmware completion, and measured performance are future stages.",
  statusItems: [
    { label: "Project stage", value: "Schematic finalization" },
    { label: "Hardware scope", value: "Custom battery-powered PCB" },
    { label: "Next gate", value: "Schematic review + ERC" }
  ],
  takeaways: [
    "Power-path charging",
    "Low-IQ regulation",
    "GNSS + BLE integration",
    "Multi-bus architecture",
    "RF-aware placement",
    "Designed-for-debug bring-up"
  ],
  sectionLinks: [
    { href: "#goals", label: "Goals" },
    { href: "#architecture", label: "Architecture" },
    { href: "#hardware", label: "Hardware" },
    { href: "#power", label: "Power" },
    { href: "#requirements", label: "Requirements" },
    { href: "#bring-up", label: "Bring-up" },
    { href: "#progress", label: "Progress" },
    { href: "#validation", label: "Validation" }
  ],
  goals: {
    intro:
      "I scoped V1 around the parts of a commercial cycling computer that are most useful for embedded hardware and firmware learning: sensing, energy management, storage, outdoor display behavior, radio connectivity, and robust data capture.",
    v1: [
      "GNSS ride logging at 1 Hz",
      "Live speed, distance, and elapsed time",
      "Barometric altitude and cumulative elevation gain",
      "Physical-button user interface",
      "Reflective memory LCD",
      "Local nonvolatile ride storage",
      "BLE ride transfer through a custom GATT service",
      "USB-C charging for a single-cell Li-ion / LiPo battery",
      "Breadcrumb-style course following and off-course indication",
      "Battery monitoring"
    ],
    stretch:
      "Receive heart-rate data through the standard BLE Heart Rate Service after the core logging and transfer path is stable.",
    excluded: ["Full map rendering", "Complex turn-by-turn routing", "Training analytics", "Garmin-scale application features"],
    scopeNote:
      "Those features are intentionally outside V1. Keeping the application surface narrow protects the core goal: reaching real custom hardware with a credible power, sensing, storage, and bring-up story."
  },
  architecture: {
    source: ["USB-C", "ESD / protection", "BQ24074 charger + power path"],
    battery: "Single-cell Li-ion / LiPo",
    rails: [
      {
        voltage: "3.3 V",
        label: "Low-power system rail",
        detail: "Buck-boost architecture under final part review"
      },
      {
        voltage: "5 V",
        label: "Dedicated display rail",
        detail: "Boost architecture; final device not yet committed"
      }
    ],
    controller: {
      title: "NINA-B306-00B",
      detail: "nRF52840 MCU + BLE"
    },
    peripherals: [
      { bus: "UART", part: "SAM-M10Q", purpose: "GNSS position and time" },
      { bus: "I²C", part: "LPS22DF", purpose: "Barometric altitude" },
      { bus: "SPI", part: "W25Q128JV", purpose: "Ride-log storage" },
      { bus: "SPI + GPIO", part: "LS027B7DH01", purpose: "Reflective memory LCD" }
    ],
    support: [
      { signal: "GPIO", purpose: "Physical controls + LCD EXTCOMIN" },
      { signal: "ADC", purpose: "Switched battery-voltage divider" },
      { signal: "SWD", purpose: "Programming, reset, and debug" },
      { signal: "Status", purpose: "Charger CHG / PGOOD inputs" },
      { signal: "USB", purpose: "D+ / D− retained pending final scope decision" },
      { signal: "Test", purpose: "Power rails and useful communication nodes" }
    ],
    note:
      "This is the intended architecture at schematic finalization. It documents design direction, not implemented firmware or a validated PCB."
  },
  hardwareDecisions: [
    {
      category: "MCU + BLE",
      part: "u-blox NINA-B306-00B",
      title: "Integrated radio keeps revision one achievable",
      body:
        "The NINA-B306 combines an nRF52840 Cortex-M4F platform, BLE radio, and antenna in one module. That reduces first-revision RF risk compared with implementing a discrete 2.4 GHz antenna and matching network.",
      points: [
        "MCU and BLE share one qualified module",
        "Antenna keepout and edge placement still constrain PCB floorplanning",
        "SWDIO, SWDCLK, reset, 3.3 V, and ground are being exposed for bring-up",
        "Focused RF projects can cover antenna design without making this board depend on a first discrete 2.4 GHz implementation"
      ]
    },
    {
      category: "GNSS",
      part: "u-blox SAM-M10Q",
      title: "Integrated antenna, with placement still treated as RF design",
      body:
        "UART was selected for a direct bring-up and debug path. V1 does not need every optional interface, and backup-supply support remains an evaluated option rather than an automatic addition.",
      points: [
        "Integrated GNSS antenna reduces external RF circuitry",
        "Module antenna and ground-plane guidance will drive early floorplanning",
        "UART test access is planned before layout",
        "Optional features are included only when they justify their power and routing cost"
      ]
    },
    {
      category: "Display",
      part: "LS027B7DH01 memory LCD",
      title: "Sunlight readability without e-ink update behavior",
      body:
        "A reflective memory LCD provides very low static/display power while remaining responsive enough for changing ride metrics. That combination is a better fit than e-ink for this UI.",
      points: [
        "SPI-style serial interface",
        "MCU GPIO provides EXTCOMIN polarity switching",
        "Dedicated display power rail",
        "FPC connector integrated at the board boundary"
      ]
    },
    {
      category: "Altitude",
      part: "ST LPS22DF",
      title: "Interface bandwidth matched to the sensor",
      body:
        "The barometer provides altitude and elevation data without relying exclusively on noisier GNSS altitude. I²C is sufficient for its low data rate, saves MCU pins, and simplifies routing.",
      points: [
        "I²C selected instead of unnecessary SPI bandwidth",
        "Local decoupling and bus pull-ups included in the schematic",
        "Preserves pins for display, storage, controls, and debug",
        "Enclosure and layout must expose the pressure port to ambient air"
      ]
    },
    {
      category: "Storage",
      part: "Winbond W25Q128JVSIQ",
      title: "Local ride data before transfer",
      body:
        "SPI NOR flash provides nonvolatile storage for ride logs before BLE transfer or later export. The hardware selection is complete; storage management and robust ride-file handling remain firmware work.",
      points: [
        "Dedicated chip select on the SPI bus",
        "Data integrity is a system requirement, not an assumed property",
        "Shutdown behavior must not corrupt an active ride file",
        "No claim of completed GPX logging or BLE file transfer"
      ]
    }
  ],
  power: {
    intro:
      "Power architecture is a primary design constraint, not a support circuit added after the digital design. USB-C feeds protected 5 V input power into a BQ24074 charger with power-path management, allowing the system load and battery charge path to be treated explicitly.",
    details: [
      "Single-cell Li-ion / LiPo energy storage",
      "USB-C 5 V input with ESD / transient protection",
      "BQ24074RGTR charger with programmable current and power-path management",
      "Low-quiescent-current 3.3 V system regulation",
      "Dedicated boosted rail for the memory LCD",
      "Battery-voltage measurement into the MCU",
      "Charger CHG / PGOOD status monitoring where applicable",
      "Intentional physical power and off-state behavior"
    ],
    regulatorReason:
      "A Li-ion cell moves above and below the 3.3 V system rail as it discharges, so a buck-boost topology is attractive. The selection priority is low quiescent current across real operating modes—not output-current capability the board does not need.",
    selectionNote:
      "The final 3.3 V regulator and 5 V boost device are not named here because schematic finalization has not yet established both choices. The architecture and selection criteria are defined; final part commitment is still open."
  },
  powerBudget: {
    rows: [
      { mode: "Deep sleep", current: "20–100 µA" },
      { mode: "Idle UI", current: "2–3 mA" },
      { mode: "Ride", current: "12–15 mA" },
      { mode: "Ride + BLE advertising", current: "14–18 mA" },
      { mode: "BLE transfer burst", current: "12–20 mA" }
    ],
    targets: [
      { label: "Ride mode", value: "<25 mA" },
      { label: "Idle", value: "<2 mA" },
      { label: "Sleep", value: "<100 µA" },
      { label: "Measured ride battery life", value: "≥12 hours" }
    ],
    caveat:
      "All values above are pre-hardware estimates, not measurements. The budget is a design tool rather than a post-build calculation. The preliminary 2–3 mA idle estimate currently exceeds the <2 mA target, creating a concrete optimization problem for hardware and firmware bring-up."
  },
  interfaces: [
    { signal: "UART", destination: "SAM-M10Q GNSS", rationale: "Simple bring-up and readable debug path" },
    { signal: "I²C", destination: "LPS22DF barometer", rationale: "Adequate bandwidth with fewer pins" },
    { signal: "SPI", destination: "W25Q128JV flash", rationale: "Local high-capacity ride-log storage" },
    { signal: "SPI + GPIO", destination: "Memory LCD", rationale: "Serial pixels, chip select, and EXTCOMIN control" },
    { signal: "GPIO", destination: "Physical buttons", rationale: "Defined boot states and responsive input" },
    { signal: "ADC", destination: "Battery divider", rationale: "Battery telemetry without continuous divider loss" },
    { signal: "SWD", destination: "NINA / nRF52840", rationale: "Programming, breakpoints, and fault isolation" },
    { signal: "BLE", destination: "Phone / sensors", rationale: "Ride transfer and future heart-rate input" },
    { signal: "USB device", destination: "Future host connection", rationale: "Optional debug, firmware, serial, or file transfer" }
  ],
  requirements: [
    { area: "GNSS logging", target: "1 Hz with no dropped samples", validation: "Timestamp and sequence audit over a reference route" },
    { area: "Position accuracy", target: "±5 m versus reference device", validation: "Repeated known-route comparison" },
    { area: "Elevation gain", target: "<10% error versus reference", validation: "Barometer log comparison over repeated route" },
    { area: "UI response", target: "<100 ms", validation: "Button event to display-update timing" },
    { area: "Boot", target: "<3 s to usable state", validation: "Power-on timing across repeated starts" },
    { area: "BLE transfer", target: "≥100 kB, CRC-valid, no corruption", validation: "Known payload transfer and hash / CRC comparison" },
    { area: "Off-course", target: "~20 m for 5 consecutive seconds", validation: "Injected and field route-deviation cases" },
    { area: "Ride current", target: "<25 mA", validation: "Bench current profile in defined ride mode" },
    { area: "Idle current", target: "<2 mA", validation: "Bench current profile in defined idle mode" },
    { area: "Sleep current", target: "<100 µA", validation: "Low-current measurement after confirmed sleep entry" },
    { area: "Ride battery life", target: "≥12 h", validation: "Controlled full-charge runtime test" },
    { area: "Shutdown integrity", target: "No ride-file corruption", validation: "Repeated power interruption during file activity" }
  ],
  bringup: {
    intro:
      "A major focus before layout is making the first PCB revision diagnosable. Beyond connecting the functional blocks, I am adding programming access, rail test points, communication test points, battery telemetry, and defined boot states so failures can be isolated during bring-up.",
    groups: [
      {
        title: "Program + control",
        items: ["SWDIO", "SWDCLK", "Reset", "3.3 V reference", "Ground reference", "Intentional boot-state pulls"]
      },
      {
        title: "Power visibility",
        items: ["USB input", "Battery node", "3.3 V rail", "Display rail", "Battery ADC", "CHG / PGOOD status"]
      },
      {
        title: "Interface access",
        items: ["GNSS UART", "Useful SPI nodes", "Useful I²C nodes", "USB D+ / D− decision", "Physical control inputs", "Accessible ground points"]
      },
      {
        title: "Layout constraints",
        items: ["Local decoupling", "USB protection", "BLE antenna keepout", "GNSS ground guidance", "Short power loops", "Pressure-port exposure"]
      }
    ]
  },
  progress: [
    {
      state: "Completed / largely designed",
      items: [
        "Overall system architecture and V1 requirements",
        "Preliminary mode-based power budget",
        "USB-C charging and power-path architecture",
        "3.3 V and display power architecture",
        "Memory LCD, barometer, SPI flash, and GNSS schematics",
        "Major component selection"
      ]
    },
    {
      state: "Currently finalizing",
      items: [
        "NINA-B306 MCU integration and physical buttons",
        "Power-button and off-state behavior",
        "Battery-voltage ADC measurement",
        "Charger status connections",
        "SWD interface and test points",
        "Final USB functionality",
        "Schematic review and ERC"
      ]
    },
    {
      state: "Next",
      items: [
        "PCB floorplanning and RF module placement",
        "Power layout, routing, and DRC review",
        "Fabrication and assembly",
        "Staged power and interface bring-up",
        "Peripheral firmware, logging, and BLE transfer",
        "Field testing and measured current characterization"
      ]
    }
  ],
  validation: [
    {
      area: "Power",
      items: ["Deep-sleep current", "Idle current", "GNSS tracking current", "BLE advertising current", "BLE file-transfer current", "Real battery runtime"]
    },
    {
      area: "GNSS",
      items: ["Time to first fix", "Track deviation versus reference", "Dropout rate", "Repeated known-route comparison"]
    },
    {
      area: "Altitude",
      items: ["Stationary pressure / altitude noise", "Drift", "Elevation gain versus reference"]
    },
    {
      area: "BLE",
      items: ["Transfer throughput", "100 kB+ file integrity", "CRC verification", "Reconnect behavior"]
    },
    {
      area: "System",
      items: ["Boot time", "Button latency", "Dropped logging samples", "Safe-shutdown corruption testing"]
    }
  ],
  lessons: [
    {
      title: "Requirements before routing",
      body: "Translate product ideas into electrical and system targets that can be checked after assembly."
    },
    {
      title: "Mode-based power design",
      body: "Use a power budget before fabrication to identify which rails, peripherals, and firmware states deserve optimization."
    },
    {
      title: "Topology follows the battery",
      body: "Select regulation around Li-ion discharge range and quiescent current instead of headline output current."
    },
    {
      title: "Power path is system behavior",
      body: "Treat charging, system load sharing, and the off state as operating modes rather than a charger-IC black box."
    },
    {
      title: "Interfaces have tradeoffs",
      body: "Choose SPI, I²C, UART, GPIO, and ADC from bandwidth, pin-count, power, routing, and debug needs."
    },
    {
      title: "Integrated RF still shapes layout",
      body: "Plan module edge placement, antenna keepouts, ground guidance, and nearby circuitry before dense routing begins."
    },
    {
      title: "First revisions need observability",
      body: "Add programming access, test points, telemetry, and known boot states while the schematic is still flexible."
    },
    {
      title: "Failure modes cross domains",
      body: "Power loss, flash writes, BLE transfer, and ride-file structure must be designed together to prevent data corruption."
    },
    {
      title: "Scope protects completion",
      body: "Defer maps and analytics so the project can reach PCB fabrication, bring-up, and measured field behavior."
    }
  ],
  finalNote:
    "The next meaningful proof points are a reviewed schematic, a layout that respects the power and antenna constraints, and a staged bring-up plan. Results will be added only after the board exists and the measurements have been performed.",
  assets: {
    systemOverview: {
      kind: "image",
      src: `${assetRoot}/system-overview.webp`,
      alt: "Planned bike computer system architecture or future PCB render",
      label: "Bike computer block diagram / schematic overview / future PCB render",
      description: "Replace with the project-level architecture graphic or an honest PCB render after layout is complete."
    },
    powerSchematic: {
      kind: "image",
      src: `${assetRoot}/power-architecture.webp`,
      alt: "USB-C charging and power regulation schematic",
      label: "USB-C + charger + regulator schematic",
      description: "Export the reviewed USB-C, BQ24074, 3.3 V, and display-rail schematic here."
    },
    lcdSchematic: {
      kind: "image",
      src: `${assetRoot}/memory-lcd-schematic.webp`,
      alt: "LS027B7DH01 memory LCD interface schematic",
      label: "Memory LCD schematic",
      description: "Add the display connector, serial interface, EXTCOMIN, and power-rail schematic view."
    },
    gnssSchematic: {
      kind: "image",
      src: `${assetRoot}/gnss-schematic-placement.webp`,
      alt: "SAM-M10Q GNSS schematic and planned PCB placement",
      label: "SAM-M10Q schematic and eventual PCB placement",
      description: "Replace with the reviewed GNSS sheet, then add the antenna-aware layout view."
    },
    mcuSchematic: {
      kind: "image",
      src: `${assetRoot}/nina-b306-schematic.webp`,
      alt: "NINA-B306 MCU and debug interface schematic",
      label: "NINA-B306 schematic",
      description: "Add the completed MCU, SWD, status, control, and optional USB connections."
    },
    pcbLayout: {
      kind: "image",
      src: `${assetRoot}/pcb-layout.webp`,
      alt: "Bike computer PCB layout",
      label: "PCB layout — add after layout is complete",
      description: "Reserved for the real top and bottom layout once placement and routing are complete."
    },
    bringupPhoto: {
      kind: "image",
      src: `${assetRoot}/bench-bringup.webp`,
      alt: "Assembled bike computer PCB during bench bring-up",
      label: "Assembled PCB / bench bring-up photo",
      description: "Reserved for a real assembly and staged power-up photo after fabrication."
    },
    validationPlots: {
      kind: "image",
      src: `${assetRoot}/validation-plots.webp`,
      alt: "Bike computer power and ride-comparison measurements",
      label: "Power measurements / ride comparison plots",
      description: "Reserved for measured current profiles, GNSS comparisons, and runtime results."
    }
  }
} as const;
