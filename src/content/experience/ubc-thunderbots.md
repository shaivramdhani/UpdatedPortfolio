---
organization: "UBC Thunderbots"
title: "Electrical Engineer"
timeframe: "2025 to present"
location: "Vancouver, BC"
featured: true
summary: "Designed, tested and debugged electronics for fully autonomous soccer playing robots."
---
- Redesigned the power distribution board featuring galvanic isolation between low-voltage (3.3V–24V) and high-voltage (240V) domains, addressing safety, noise coupling, and creepage/clearance constraints
- Designed motor driver circuitry using low-side MOSFET topology, including flyback protection and switching considerations under inductive loads
- Developed multi-layer PCB layouts integrating power and communication buses (SPI, I2C, UART), with attention to grounding strategy, return paths, and signal integrity
- Debugged SPI communication chain (Raspberry Pi → UI board → motor controllers) using oscilloscopes/logic analyzers, identifying and resolving noise and timing-related issues
- Designed power delivery and decoupling strategies to maintain stable operation under dynamic motor loads
- Iterated on hardware revisions based on real-world testing, improving reliability of communication and power systems
- Developed firmware in C for an ESP32 to test and debug high voltage charging and autodischarge