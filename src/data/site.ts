export const site = {
  name: "Shaiv Ramdhani",
  title: "Engineering Physics student focused on electrical hardware and PCB design.",
headline:
  "I’m an Engineering Physics student at the University of British Columbia focused on electrical hardware design, with an emphasis on PCB design and real-world system behavior.",
summary:
  "I am building toward electrical hardware and systems engineering through technical coursework and hands-on design work, including developing electrical systems for autonomous robots with UBC Thunderbots. My work focuses on designing systems that perform reliably under real-world constraints, where layout, parasitics, and physical effects directly impact performance.\n\nEngineering Physics combines electrical, mechanical, and software engineering with a strong foundation in physics and mathematics, allowing me to approach hardware design from first principles and better understand electromagnetic effects, signal integrity, and non-ideal behavior.\n\nI am particularly interested in PCB design, RF systems, low-power electronics, and high-voltage applications.",
location: "Vancouver, BC",
  availability: "Open to electrical engineering internships",
  email: "shaiv.ramdhani@gmail.com",
  resume: {
    label: "View Resume (Placeholder)",
    href: "/resume/shaiv-ramdhani-resume-placeholder.txt",
    placeholder: true
  },
  placeholderContent: true,
  navigation: [
    { label: "About", href: "/about" },
    { label: "Projects", href: "/projects" },
    { label: "Experience", href: "/experience" },
    { label: "Contact", href: "/contact" }
  ],
  socialLinks: [
    { label: "GitHub", href: "https://github.com/shaivramdhani" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/shaivramdhani" },
    { label: "Email", href: "mailto:shaiv.ramdhani@gmail.com" }
  ],
  callsToAction: {
    primary: { label: "View Projects", href: "/projects" },
    secondary: { label: "Contact", href: "/contact" }
  }
} as const;
