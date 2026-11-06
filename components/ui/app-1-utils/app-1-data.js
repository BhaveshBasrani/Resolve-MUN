export const app1User = {
  name: "Resolve Secretariat",
  initials: "RM",
  avatar: "https://resolvemun.in/images/Logo.svg",
  role: "Command Center Admin",
  email: "resolve.mun@gmail.com",
};

export const app1Chart = [
  { week: "W1", opened: 12, completed: 8 },
  { week: "W2", opened: 28, completed: 22 },
  { week: "W3", opened: 45, completed: 39 },
  { week: "W4", opened: 68, completed: 58 },
  { week: "W5", opened: 92, completed: 81 },
  { week: "W6", opened: 135, completed: 118 },
  { week: "W7", opened: 184, completed: 162 },
  { week: "W8", opened: 254, completed: 231 },
];

export const app1ChartConfig = {
  opened: {
    label: "Applicants / Leads",
    color: "rgba(255, 255, 255, 0.4)",
  },
  completed: {
    label: "Confirmed & Verified",
    color: "#ffffff",
  },
};

export const app1Projects = [
  {
    id: "proj-1",
    name: "Individual Delegate Priority Round",
    description: "Personal details, matrix preferences, and UPI verification.",
    progress: 92,
    status: "In progress",
    dueDate: "27 Nov 2026",
    team: [
      { name: "Niveditt Basrani", initials: "NB", avatar: "" },
      { name: "Swayam Bakshi", initials: "SB", avatar: "" },
    ],
  },
  {
    id: "proj-2",
    name: "School Delegation Enrolment",
    description: "Institutional contingents, 6+ delegate rosters.",
    progress: 74,
    status: "In progress",
    dueDate: "27 Nov 2026",
    team: [
      { name: "Chaithra", initials: "CH", avatar: "" },
      { name: "Abhignya", initials: "AB", avatar: "" },
    ],
  },
  {
    id: "proj-3",
    name: "Organizing Committee Induction",
    description: "Salaried operations, delegate affairs, logistics & media.",
    progress: 88,
    status: "In review",
    dueDate: "20 Nov 2026",
    team: [
      { name: "Likith", initials: "LK", avatar: "" },
      { name: "Risheeth", initials: "RS", avatar: "" },
    ],
  },
  {
    id: "proj-4",
    name: "Background Guides & Matrix Release",
    description: "DISEC, UNHRC, UNSC, Lok Sabha, Comm X, IP dossiers.",
    progress: 98,
    status: "Planning",
    dueDate: "15 Nov 2026",
    team: [
      { name: "Executive Board", initials: "EB", avatar: "" },
    ],
  },
];

export const app1Activity = [
  {
    id: "act-1",
    person: { name: "System Watchdog", initials: "SW", avatar: "" },
    action: "synchronized verified delegate pass hashes into secure ledger",
    time: "2m ago",
  },
  {
    id: "act-2",
    person: { name: "Secretariat Check-In", initials: "SC", avatar: "" },
    action: "dispatched confirmation credentials to verified delegates",
    time: "14m ago",
  },
  {
    id: "act-3",
    person: { name: "Finance Desk", initials: "FD", avatar: "" },
    action: "validated UPI UTR settlement for institutional delegation",
    time: "45m ago",
  },
  {
    id: "act-4",
    person: { name: "Lead Beacon", initials: "LB", avatar: "" },
    action: "recorded Step 3 draft recovery signal from mobile registration",
    time: "1h ago",
  },
];

