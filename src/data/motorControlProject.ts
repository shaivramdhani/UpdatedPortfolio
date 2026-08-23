export type MotorControlAsset = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

const assetRoot = "/images/projects/motor-speed-control";

export const motorControlProject = {
  eyebrow: "UBC ENPH 259 · Final laboratory project · 2025",
  descriptor:
    "Closed-loop speed regulation built from optical sensing, discrete timing logic, an 8-bit measurement path, analog feedback, and transistor motor drive.",
  opening:
    "I implemented and tested a course-specified mixed-signal controller that measured a DC motor's shaft speed, held the result as an 8-bit value, converted it back to an analog feedback voltage, and adjusted the motor drive toward a potentiometer setpoint—without using a microcontroller.",
  ownership:
    "Individual lab project · My work: breadboard implementation, subsystem validation, circuit analysis, instrumentation, integration, measurement-driven modifications, and fault isolation.",
  statusItems: [
    { label: "Optical feedback", value: "10 pulses / rev" },
    { label: "Measurement window", value: "0.2 s" },
    { label: "Speed representation", value: "8-bit" },
    { label: "Estimated test span", value: "1200–3300 RPM" }
  ],
  sectionLinks: [
    { href: "#challenge", label: "Challenge" },
    { href: "#architecture", label: "Signal chain" },
    { href: "#timing", label: "Timing" },
    { href: "#mixed-signal", label: "DAC feedback" },
    { href: "#controller", label: "PI control" },
    { href: "#debugging", label: "Debugging" },
    { href: "#results", label: "Results" },
    { href: "#lessons", label: "Lessons" }
  ],
  challenge: {
    intro:
      "The challenge was to close a motor-speed feedback loop using a chain of analog and digital building blocks. A potentiometer defined the target speed, while an optical sensor and slotted disk converted rotation into pulses that the circuit could measure.",
    detail:
      "The architecture was supplied for the final lab; the engineering work was in turning it into a functioning physical system, proving each stage with measurements, and separating wiring, instrumentation, control, power, and motor faults during integration.",
    constraints: [
      {
        title: "No firmware abstraction",
        body: "Timing, counting, memory, conversion, and feedback were all visible as voltages or digital states on the breadboard."
      },
      {
        title: "Mixed-signal boundaries",
        body: "Sensor pulses had to become reliable logic, then an 8-bit result had to become a stable analog feedback voltage."
      },
      {
        title: "Real electromechanical load",
        body: "The motor introduced current demand, component variation, noise, and failure modes that isolated signal tests did not reveal."
      }
    ]
  },
  architecture: {
    intro:
      "The control loop deliberately crosses the analog–digital boundary twice: rotation becomes pulses for counting, then the latched count becomes an analog voltage for comparison with the setpoint.",
    signalChain: [
      "Motor + slotted disk",
      "Optical pulse sensor",
      "Logic conditioning",
      "8-bit counter",
      "8-bit D register",
      "R–2R DAC + buffer",
      "PI error amplifier",
      "BJT motor drive"
    ],
    branches: [
      {
        label: "Measurement",
        body: "Ten optical pulses per shaft revolution encoded speed as a pulse frequency."
      },
      {
        label: "Sample and hold",
        body: "A 5 Hz timing chain latched the count every 0.2 s, then reset the counter for the next window."
      },
      {
        label: "Feedback control",
        body: "The DAC voltage represented measured speed; the error amplifier compared it with the user-set target and drove the BJT stage."
      }
    ],
    note:
      "The loop closes physically through the motor: drive changes shaft speed, which changes the optical pulse rate and therefore the next feedback measurement."
  },
  timing: {
    intro:
      "The speed measurement only works if the previous count is saved before the counter is cleared. I used a delayed reset path so the register captured a stable value first, followed by a narrow reset pulse for the next measurement window.",
    sequence: [
      { step: "01", title: "Count", body: "Accumulate optical pulses during the 0.2 s window." },
      { step: "02", title: "Latch", body: "Clock the 8-bit D register to preserve the measured count." },
      { step: "03", title: "Delay", body: "Use the RC and Schmitt-trigger path to separate latch and reset edges." },
      { step: "04", title: "Reset", body: "Clear the counter and begin the next independent measurement." }
    ],
    measurements: [
      { value: "11 ± 1 µs", label: "Calculated RC delay" },
      { value: "12 ± 3 µs", label: "Measured delay" },
      { value: "10 counts", label: "50 Hz input over 0.2 s" }
    ],
    validation:
      "The calculated and measured delay intervals overlapped. A separate 50 Hz bench input produced a stored count of 10 in each 0.2 s window, confirming the counter, register, and timing relationship before motor integration."
  },
  mixedSignal: {
    intro:
      "The latched binary count had to become an analog feedback level before it could be compared with the potentiometer setpoint. An 8-bit R–2R ladder performed the conversion and a voltage follower prevented the next stage from loading the ladder.",
    equation: "Vfeedback = (count / 255) × 5 V",
    validationTitle: "A known digital input produced the expected analog output",
    validation:
      "With a stored count of 10, the ideal DAC output is approximately 196 mV. I measured about 200 mV and confirmed that the buffer output matched the ladder output, providing an end-to-end check of the digital-to-analog bridge.",
    values: [
      { label: "Test count", value: "10" },
      { label: "Calculated", value: "196 mV" },
      { label: "Observed", value: "≈ 200 mV" }
    ]
  },
  controller: {
    intro:
      "The error amplifier combined proportional and integral action. The proportional path responded immediately to a speed error, while the capacitor accumulated persistent error so the drive could continue correcting toward the setpoint.",
    equation: "Vout = Vset + (1/RC)∫(Vset − Vfeedback)dt + (R7/R6)(Vset − Vfeedback)",
    test:
      "I tested the stage around a 1 V setpoint using a 1 Hz square-wave input that alternated between 0 V and 2 V. The output showed the expected immediate steps and linear ramps, making the proportional and integral contributions visible on the oscilloscope.",
    limitation:
      "The waveform gradually drifted into the positive rail. I attributed that behavior to small DC mismatch being continually integrated. Rather than treating the clipped waveform as a clean pass, I documented the limitation and used the pre-saturation region to validate the intended response."
  },
  debugging: {
    intro:
      "The most valuable part of the project was learning to localize faults in a long mixed-signal chain. I stopped treating the controller as one circuit and verified boundaries one at a time with the oscilloscope, logic analyzer, and controlled test inputs.",
    cases: [
      {
        title: "An invisible reset pulse",
        symptom: "The reset generator appeared to produce no output.",
        investigation: "I reviewed the expected RC timescale and changed the oscilloscope time base instead of immediately rewiring the circuit.",
        outcome: "The pulse was present but much narrower than the original viewing window."
      },
      {
        title: "Random latched values",
        symptom: "The register output fluctuated instead of holding the expected count.",
        investigation: "I probed the counter outputs, then the register inputs, and compared the two sides of their interconnect.",
        outcome: "The measurements isolated a wiring error between the counter and register."
      },
      {
        title: "A sensor pulse below threshold",
        symptom: "The motor sensor signal did not reliably toggle the Schmitt-trigger input.",
        investigation: "I scoped the sensor waveform and found that its low level did not cross the inverter threshold.",
        outcome: "I tested a comparator near 2.6 V and added the required pull-up for its open-collector output; the final replacement motor produced a usable signal without that extra stage."
      },
      {
        title: "Every block passed, but the loop failed",
        symptom: "Timing, counting, conversion, and error amplification worked independently, yet the integrated system did not regulate speed.",
        investigation: "I repeated subsystem tests, verified the powered instrument could supply the motor current, then substituted a known-good motor.",
        outcome: "The controller ran and followed the setpoint with the alternate motor, identifying the original motor as the system-level fault."
      }
    ]
  },
  results: {
    intro:
      "With the replacement motor, increasing the potentiometer setpoint increased the latched count and the DAC feedback voltage followed the setpoint. Using ten sensor pulses per revolution and a 0.2 s window, each count corresponded to 30 RPM.",
    formula: "Estimated speed = count × 5 windows/s × 60 s/min ÷ 10 pulses/rev = count × 30 RPM",
    samples: [
      { setpoint: "0.7 V", count: "40", speed: "1200 RPM" },
      { setpoint: "0.9 V", count: "50", speed: "1500 RPM" },
      { setpoint: "1.1 V", count: "60", speed: "1800 RPM" },
      { setpoint: "1.3 V", count: "70", speed: "2100 RPM" },
      { setpoint: "1.5 V", count: "80", speed: "2400 RPM" },
      { setpoint: "1.7 V", count: "90", speed: "2700 RPM" },
      { setpoint: "1.9 V", count: "100", speed: "3000 RPM" },
      { setpoint: "2.1 V", count: "110", speed: "3300 RPM" }
    ],
    limitation:
      "The reported RPM values are calculated from the optical count rather than verified with an independent tachometer. Around a count of 110, the system stopped recovering cleanly when the setpoint was reduced, so I treat 3300 RPM as the observed edge of this prototype's useful range—not a guaranteed closed-loop specification."
  },
  lessons: [
    {
      title: "Validate interfaces, not only blocks",
      body: "A counter and register can both work independently while the wiring between them still fails. Boundary measurements made that distinction clear."
    },
    {
      title: "Measurement settings are part of the experiment",
      body: "A signal can appear absent when the time base, trigger, threshold, or probe point does not match the phenomenon being tested."
    },
    {
      title: "Substitution is a legitimate diagnostic tool",
      body: "Replacing the motor with a known-good unit narrowed a system-wide failure faster than continuing to rework already-validated control blocks."
    },
    {
      title: "Document the edge of validity",
      body: "The high-speed recovery problem and integrator drift are part of the engineering result because they define where the prototype still needs refinement."
    }
  ],
  assets: {
    circuitPhoto: {
      src: `${assetRoot}/circuit-photo.webp`,
      alt: "Breadboard implementation of the mixed-signal motor speed controller",
      caption: "Final breadboard implementation — the timing logic, counter, register, DAC, analog controller, and motor-drive stages were integrated across four breadboards.",
      width: 1350,
      height: 1800
    },
    schematic: {
      src: `${assetRoot}/system-schematic.png`,
      alt: "Complete schematic for the closed-loop mixed-signal motor speed controller",
      caption: "System schematic — optical speed sensing, timed counting and storage, R–2R feedback conversion, PI error amplification, and transistor motor drive. Expand to inspect the signal path.",
      width: 632,
      height: 414
    },
    delayMeasurement: {
      src: `${assetRoot}/delay-measurement.webp`,
      alt: "Oscilloscope measurement comparing the delayed and undelayed timing edges",
      caption: "Timing validation — the measured RC / Schmitt-trigger delay was 12 ± 3 µs, overlapping the calculated 11 ± 1 µs interval.",
      width: 1600,
      height: 1041
    },
    piResponse: {
      src: `${assetRoot}/pi-response.webp`,
      alt: "Oscilloscope capture showing proportional steps and integral ramps from the error amplifier",
      caption: "Error-amplifier bench test — the output shows an immediate proportional step and a linear integral ramp before accumulated offset drives it toward saturation.",
      width: 1600,
      height: 1040
    },
    setpointTracking: {
      src: `${assetRoot}/setpoint-tracking.webp`,
      alt: "Oscilloscope capture showing DAC feedback voltage tracking the motor speed setpoint",
      caption: "Closed-loop behavior — DAC feedback and the potentiometer setpoint tracked closely during the working portion of the final test.",
      width: 1600,
      height: 1041
    },
    latchedCount: {
      src: `${assetRoot}/latched-count.webp`,
      alt: "Logic analyzer showing a latched eight-bit motor speed count of 110",
      caption: "Digital speed measurement — the logic-analyzer bus shows the 8-bit register holding a count of 110 near the upper end of the tested range.",
      width: 1600,
      height: 1041
    }
  } satisfies Record<string, MotorControlAsset>
} as const;
