// Skill categories shown in the dashboard Skills card (editable).
// NOTE: the percentages for Java, Python, Database Design, VS Code,
// Git & GitHub, XAMPP and Microsoft Office are placeholders - set your own.
export const skillCategories = [
  { id: 'programming', label: 'Programming', items: [
    { name: 'C / C++', level: 72 },
    { name: 'Java', level: 40 },
    { name: 'Python', level: 55 }
  ]},
  { id: 'webdev', label: 'Web Dev', items: [
    { name: 'HTML', level: 78 },
    { name: 'CSS', level: 78 },
    { name: 'JavaScript', level: 60 },
    { name: 'PHP', level: 65 }
  ]},
  { id: 'database', label: 'Database', items: [
    { name: 'MySQL', level: 74 },
    { name: 'SQL', level: 74 },
    { name: 'Database Design', level: 68 }
  ]},
  { id: 'tools', label: 'Tools', items: [
    { name: 'VS Code', level: 85 },
    { name: 'Git & GitHub', level: 60 },
    { name: 'XAMPP', level: 80 },
    { name: 'Microsoft Office', level: 75 }
  ]}
];
