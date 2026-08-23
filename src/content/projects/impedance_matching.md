---
title: "Intro to Impedance Matching Part 1"
summary: "A starter hands-on measurement project using the Analog Discovery 3 to characterize a complex RC impedance from transfer-function data before moving toward Smith chart matching."
role: "Measurement setup, impedance extraction, data analysis"
date: "2026-04"
featured: true
showOnProjectsPage: false
tags: ["RF", "Analog Discovery 3","Impedance Measurement","Smith Chart", "Signal Integrity" ]
tools: ["Analog Discovery 3", "WaveForms", "Python","Network Analyzer"]
thumbnail: "/images/projects/powerboard/powerboard-front.webp"
links:
  github: ""
  demo: ""
  article: ""
---

## Overview

This project started because I wanted to make transmission line theory and Smith charts feel less abstract. I had been learning about reflection coefficient, impedance matching, and VNAs, but I wanted to connect those ideas to measurements I could actually make with the tools I own.

The long-term goal is to measure a complex RC load, plot its impedance on a Smith chart, and design a matching network. Phase 1 is just the foundation: proving that I can measure impedance reliably with the Analog Discovery 3 before trying to match anything.

[PLACEHOLDER: hero image of Analog Discovery 3 measurement setup]

## Phase 1: Measurement validation

For the first phase, I used the AD3 as a simple impedance measurement setup instead of treating it like a black-box instrument. The circuit is a voltage divider:

```text
AD3 Wavegen W1 ── Rref ── DUT ── GND
                       │      │
                     CH1    CH2
```


The DUT is the device under test. I used a 10 kΩ resistor as the reference resistor because that was what I had available. The Network Analyzer measures the transfer function:

H(f) = V_DUT / V_in

From the voltage divider relationship, I calculate impedance with:

Z_DUT = R_ref · H / (1 - H)

This lets me turn AD3 magnitude and phase data into complex impedance.

[PLACEHOLDER: diagram or photo of voltage-divider measurement setup]

## Initial checks

Before measuring an RC load, I tested known resistors to check that the setup made sense.

With a 10 kΩ reference resistor and a 10 kΩ DUT, the expected voltage ratio is 0.5, or about -6 dB with near-zero phase. I also tested 1 kΩ and 22 kΩ loads to make sure the method worked across different impedance values.

[PLACEHOLDER: Network Analyzer screenshot for 10 kΩ DUT showing about -6 dB gain and near 0° phase]

[PLACEHOLDER: Network Analyzer screenshots for 1 kΩ and 22 kΩ resistor checks]

These tests are not the exciting part of the project, but they are important. If I cannot recover simple resistor values, then I cannot trust any later Smith chart or matching-network work.

## Capacitor and RC load

After the resistor checks, I measured a capacitor and then a series RC load. This is where the measurement becomes complex-valued instead of just resistive.

For a capacitor:

Z_C = 1 / (jωC)

So I expect the impedance magnitude to fall as frequency increases and the phase to show capacitive behavior.

For the series RC load:

Z_RC = R + 1 / (jωC)

That gives the kind of complex impedance I eventually want to match.

[PLACEHOLDER: Network Analyzer screenshot for capacitor DUT]

[PLACEHOLDER: Network Analyzer screenshot for series RC load]

[PLACEHOLDER: Impedance Analyzer screenshot for series RC load as a sanity check]

## Data and analysis

For the real analysis, I exported Network Analyzer data with:

frequency
gain magnitude or gain in dB
phase in degrees

Then I processed it in Python by converting gain and phase into a complex transfer function, calculating Z_DUT, and plotting the real and imaginary impedance versus frequency.

[PLACEHOLDER: plot of calculated impedance for resistor validation]

[PLACEHOLDER: plot of calculated real and imaginary impedance for series RC load]

## What I learned

The biggest lesson from Phase 1 was that the measurement setup is part of the circuit. The reference resistor, grounding, channel placement, and phase measurement all affect the result.

This phase also helped me understand why starting with boring known components matters. A resistor check is not flashy, but it tells me whether the setup is lying before I try to do anything more complicated.

## Next steps

The next phase is the more interesting part of the project: using the measured complex impedance to design and test a matching network.

Planned next steps:

measure final RC load
calculate reflection coefficient
plot impedance on a Smith chart
design an L matching network
test whether the match improves the input impedance
compare calculated, simulated, and measured results

The final goal is to show the full chain:

measured transfer function
→ calculated complex impedance
→ Smith chart interpretation
→ matching network design
→ measured improvement
