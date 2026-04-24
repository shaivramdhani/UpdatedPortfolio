---
title: "Drone Detection Prototype"
summary: "Rapid hardware prototype for detecting likely drone activity by monitoring RF energy patterns in the 2.4 GHz and 5.8 GHz ISM bands."
role: "Electrical design, RF signal chain, embedded firmware"
date: "2026-03"
featured: true
tags: ["RF", "PCB", "Signal Processing", "Embedded"]
tools: ["Altium", "STM32", "Analog Design"]
thumbnail: "/project-observability.svg"
heroImage: "/project-observability.svg"
links:
  github: ""
  demo: ""
  article: ""
---

## Overview

Developed over a short hackathon timeframe, this project explored whether a **low-complexity hardware system** could detect nearby drone activity by monitoring RF energy in the 2.4 GHz and 5.8 GHz ISM bands.

The focus was on rapidly building and validating a working signal chain, while gaining hands-on experience with RF system behavior, analog front-end design, and noisy real-world signals.

---

## Problem

Consumer drones communicate over standard ISM bands (2.4 GHz and 5.8 GHz), but their signals are difficult to distinguish from background WiFi, Bluetooth, and other interference.

The goal was to determine whether a **resource-constrained embedded system** could identify *likely* drone presence using:
- limited-bandwidth sensing (not full SDR)
- minimal processing resources
- no protocol-level decoding

---

## Constraints

- **Time-constrained development:** Designed and built within a hackathon window  
- **RF complexity vs. cost:** Full SDR approaches were not feasible  
- **Noisy RF environment:** Significant interference from WiFi and Bluetooth  
- **Limited processing:** MCU-based system (no FPGA or high-end DSP)  
- **Board-level limitations:** Practical PCB layout without full RF stackup control  

---

## My contribution

- Designed the **RF signal chain** from antenna to ADC, including filtering, amplification, and detection stages  
- Selected RF components (bandpass filters, LNAs, power detector) based on expected signal levels and bandwidth constraints  
- Designed and routed a **multi-layer PCB in Altium**, focusing on grounding, short RF paths, and analog/digital separation  
- Implemented **STM32 firmware** for signal sampling and basic detection logic  
- Developed simple **time-domain heuristics** to identify bursty RF activity  
- Debugged issues related to noise coupling, unstable readings, and layout sensitivity  

---

## Technical decisions

### Signal chain architecture

A simplified power-detection approach was used instead of full RF demodulation:

Antenna → Bandpass Filter (2.4 / 5.8 GHz) → LNA → RF Power Detector → RC Filter → ADC (STM32)

This trades information for simplicity:
- no frequency resolution within the band  
- no protocol awareness  
- significantly lower cost and complexity  

---

### Temporal filtering and burst detection

Raw output from the RF power detector was noisy and captured rapid fluctuations that were not useful for identifying transmission patterns.

To address this, I introduced an **RC low-pass filtering stage** after the detector with a time constant of approximately **2.2 ms**.

- Suppresses high-frequency noise and very short spikes  
- Preserves millisecond-scale burst envelopes associated with RF transmissions  
- Produces a smoother signal for threshold-based detection in firmware  

This effectively converts the signal into a **time-averaged envelope**, making it easier to:
- detect sustained activity  
- identify burst-like behavior  

Tradeoff:
- reduced sensitivity to very short-duration events  
- improved overall stability and robustness of detection  

---

### Band separation

Used separate filtering paths for 2.4 GHz and 5.8 GHz to:
- reduce out-of-band interference  
- independently monitor both communication bands  

---

### Embedded processing

The STM32 handles:
- ADC sampling of detected RF power  
- simple filtering and thresholding  
- event detection based on temporal behavior  

Chose MCU-based processing to keep:
- development time short  
- system complexity low  
- power usage reasonable  

---

### PCB design tradeoffs

- Prioritized short RF traces and solid ground reference  
- Separated analog and digital return paths where possible  
- Did not implement full impedance-controlled RF design due to time constraints  

---

## Results

### What worked

- Detected clear increases in RF activity in both ISM bands  
- Observed distinct burst patterns different from baseline noise  
- Demonstrated that a **low-complexity analog front-end + MCU** can provide useful signal awareness  

---

### What didn’t

- Could not reliably distinguish drones from WiFi or other RF sources  
- Detection performance varied significantly with environment  
- Lack of spectral information limited classification capability  

---

### Key takeaways

- RF detection without frequency-domain information is inherently ambiguous  
- Analog front-end design and PCB layout strongly impact signal quality  
- Simple architectures can still extract useful features when the problem is framed correctly  
- This project served as a **first hands-on exploration of RF system design**, particularly in dealing with noisy signals and imperfect measurements  

---

## Future improvements

- Add frequency-domain capability (SDR or mixer-based front-end)  
- Improve classification using recorded RF datasets  
- Refine RF layout with controlled impedance and shielding  
- Add logging and visualization for offline analysis  