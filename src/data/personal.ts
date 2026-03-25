export type PersonalSection = {
  title: string;
  summary: string;
  highlights: string[];
  placeholder?: boolean;
};

export const personalSections: PersonalSection[] = [
  {
    title: "Community & Involvement",
    summary:
      "I am an Engineering Physics student at UBC and stay involved in student communities that are close to engineering, execution, and team operations.",
    highlights: [
      "Involved with UBC Thunderbots",
      "Operations Coordinator at Student Energy UBC"
    ]
  },
  {
    title: "Mentoring & Teaching",
    summary:
      "I work as an IB Tutor for Physics SL and Chemistry HL. Teaching keeps me precise with fundamentals and helps me explain technical ideas clearly without overcomplicating them.",
    highlights: [
      "IB Tutor for Physics SL",
      "IB Tutor for Chemistry HL"
    ]
  },
  {
    title: "Athletics & Discipline",
    summary:
      "I am an endurance athlete and completed an Ironman 70.3 while balancing academics. That commitment is a practical reminder that long-term progress usually comes from consistency rather than intensity alone.",
    highlights: [
      "Endurance athlete",
      "Completed an Ironman 70.3 while managing coursework"
    ]
  },
  {
    title: "Interests / Outside Engineering",
    summary:
      "Outside class and project work, most of my time goes toward structured commitments rather than a long list of separate hobbies. Right now that mainly means student involvement, tutoring, and endurance training.",
    highlights: [
      "Student involvement at UBC",
      "Tutoring and endurance training are the main recurring commitments I keep outside coursework"
    ]
  },
  {
    title: "Future Volunteering or Clubs",
    summary:
      "Placeholder for future volunteer work, clubs, or community commitments that are worth highlighting once there is enough detail to present them clearly.",
    highlights: [
      "Add meaningful volunteering once the role, scope, and contribution are clear",
      "Add other clubs or long-term commitments only if they strengthen the professional picture"
    ],
    placeholder: true
  }
];
