export const bikeComputerProject = {
  eyebrow: "Independent hardware project · 2026",
  descriptor:
    "A routed, rechargeable custom PCB for GNSS ride logging, outdoor data display, onboard storage, BLE connectivity, and explicit low-power operation.",
  opening:
    "I designed and routed a custom bike computer around a single-cell Li-ion battery, an nRF52840-based MCU/BLE module, GNSS, barometric altitude sensing, SPI flash, and a reflective memory LCD. The project has moved from architecture and schematic capture through PCB layout and is now in hardware bring-up and subsystem testing, with battery life, RF integration, testability, and data integrity treated as first-class constraints.",
  currentStatus:
    "PCB design and routing are complete. I am now in the testing phase: bringing up the power rails and programming interface first, then checking the GNSS, barometer, flash, display, controls, and BLE path before field validation.",
  ownership:
    "I own the product requirements, system architecture, component and interface selection, schematic capture, power budgeting, PCB floorplanning and routing, design-for-test decisions, bring-up, and validation planning. Firmware integration and measured power and field performance remain in progress.",
  statusItems: [
    { label: "Project stage", value: "Board bring-up + testing" },
    { label: "PCB status", value: "Layout and routing complete" },
    { label: "Current gate", value: "Power + interface validation" }
  ],
  takeaways: [
    "Power-path charging",
    "Low-IQ regulation",
    "GNSS + BLE integration",
    "Multi-bus architecture",
    "RF-aware PCB layout",
    "Designed-for-debug bring-up"
  ],
  sectionLinks: [
    { href: "#goals", label: "Goals" },
    { href: "#architecture", label: "Architecture" },
    { href: "#hardware", label: "Hardware" },
    { href: "#layout", label: "PCB layout" },
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
        detail: "Regulated rail for the MCU, GNSS, barometer, and flash"
      },
      {
        voltage: "5 V",
        label: "Dedicated display rail",
        detail: "Boosted rail dedicated to the memory LCD"
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
      { signal: "USB", purpose: "D+ / D− routed between the connector and MCU" },
      { signal: "Test", purpose: "Power rails and key communication nodes" }
    ],
    note:
      "This simplified block diagram reflects the completed PCB architecture. It intentionally omits component-level schematic detail; subsystem operation and performance are still being validated."
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
        "The module was placed at the board edge with its antenna keepout protected from copper and nearby components",
        "SWDIO, SWDCLK, reset, 3.3 V, and ground are exposed for bring-up",
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
        "Module antenna and ground-plane guidance drove its board-edge floorplanning",
        "UART test access was retained in the routed design",
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
        "FPC connector placed at the board boundary to simplify the display connection"
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
        "The pressure-port area was kept clear so the enclosure can expose it to ambient air"
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
  layout: {
    intro:
      "Once the schematic was complete, I treated placement and routing as part of the electrical design rather than a mechanical cleanup step. The board was floorplanned around the two antenna modules, the charger and regulator current loops, connector access, sensor constraints, and a bring-up sequence that would still work if one subsystem failed.",
    decisions: [
      {
        title: "RF-aware floorplanning",
        body:
          "The BLE and GNSS modules were placed at board edges and their antenna regions were kept free of copper, routing, and tall components. Noisy power circuitry and high-activity digital nets were kept away from those regions."
      },
      {
        title: "Compact power paths",
        body:
          "USB input protection, charging, battery, and regulation were grouped to keep the important current loops short. Power traces were sized for their loads, with local input and output capacitors placed close to the devices they support."
      },
      {
        title: "Continuous return paths",
        body:
          "Signal routing was planned over solid ground wherever possible so return currents do not have to cross plane gaps. Vias tie the ground regions together and provide short returns near layer transitions and decoupling components."
      },
      {
        title: "Interface-first routing",
        body:
          "USB D+ and D− were routed together, while SPI clocks and other timing-sensitive paths were kept direct. Lower-speed I²C, UART, button, and status nets were routed after the constrained power, RF, and clock paths."
      },
      {
        title: "Mechanical placement",
        body:
          "USB-C, the memory-LCD connector, battery connection, buttons, and debug access were positioned around how the assembled device will be reached and tested. The barometer pressure port was given a clear path to ambient air."
      },
      {
        title: "Designed for bring-up",
        body:
          "Programming, reset, ground, rail, charger-status, and communication access points were preserved after routing. This supports staged testing instead of requiring the full board to work before any diagnosis is possible."
      }
    ],
    routingOrder: [
      "Lock connectors, antennas, and mechanical constraints",
      "Place regulators and local decoupling around short current loops",
      "Protect antenna keepouts and ground continuity",
      "Route power, USB, clocks, and critical buses first",
      "Complete low-speed control and status routing",
      "Add test access, ground stitching, and run final design-rule checks"
    ],
    outcome:
      "The completed layout is now the hardware under test. Performance claims remain open until rail behavior, programming, peripheral communication, current consumption, and RF/GNSS operation have been measured."
  },
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
    implementationNote:
      "The selected regulators and their required passives were placed as compact functional groups. Input and output capacitors sit close to their pins, and the current-carrying paths were routed before lower-priority digital signals so the power layout was not forced through leftover space."
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
      "These values are design estimates and targets, not published measurements. They defined the hardware and firmware test cases now being run. The preliminary 2–3 mA idle estimate exceeds the <2 mA target, so idle-state optimization remains a specific bring-up task."
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
      "The completed PCB was designed to make revision-one failures diagnosable. Programming access, rail and communication test points, battery telemetry, and defined boot states let me bring up one domain at a time and isolate faults without depending on the entire system working.",
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
        items: ["GNSS UART", "Useful SPI nodes", "Useful I²C nodes", "USB D+ / D−", "Physical control inputs", "Accessible ground points"]
      },
      {
        title: "Board-level checks",
        items: ["Local decoupling", "USB protection", "BLE antenna keepout", "GNSS ground guidance", "Short power loops", "Pressure-port clearance"]
      }
    ]
  },
  progress: [
    {
      state: "Design complete",
      items: [
        "Overall system architecture and V1 requirements",
        "Preliminary mode-based power budget",
        "Full subsystem schematics and component selection",
        "PCB floorplanning and component placement",
        "Power, USB, communication, and control routing",
        "Antenna keepouts, test access, and design-rule review"
      ]
    },
    {
      state: "Testing now",
      items: [
        "Visual inspection and rail checks",
        "SWD programming and reset behavior",
        "Charging, power-path, and battery monitoring",
        "GNSS UART and barometer I²C communication",
        "SPI flash and memory-LCD interfaces",
        "Buttons, charger status, and BLE connectivity",
        "Mode-by-mode current measurement"
      ]
    },
    {
      state: "Next",
      items: [
        "Close issues found during subsystem testing",
        "Integrate ride logging and display firmware",
        "Validate storage integrity and BLE transfer",
        "Run GNSS and altitude comparisons on reference routes",
        "Measure sleep, idle, ride, and transfer current",
        "Complete controlled runtime and field testing"
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
      body: "Resolve module edge placement, antenna keepouts, ground guidance, and nearby circuitry before dense routing begins."
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
    "The schematic and routed PCB are complete; the evidence still being developed is measured behavior. I am now testing power, programming, peripheral interfaces, current consumption, storage integrity, BLE transfer, and field performance before presenting any target as achieved."
} as const;
