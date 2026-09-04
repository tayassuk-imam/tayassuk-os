export const projects = [
  {
    id: 'garage-management-system',
    name: 'Garage Management System',
    description: 'Database-driven garage management web app with authentication, vehicle, customer, billing and payment workflows.',
    role: 'Solo Developer',
    status: 'Working / Live',
    technologies: ['PHP', 'MySQL', 'HTML', 'CSS', 'JavaScript'],
    liveUrl: 'https://garage-management.infinityfree.io/garage_management/',
    githubUrl: '',
    image: './assets/projects/garage-management-system.jpg',
    featured: true,
    category: 'Web Application',
    dates: 'Current Project',
    problem: 'Build a practical database-driven system for managing garage operations.',
    intervention: 'Designed and developed the web interface, authentication flow, management modules, billing and payment features, search, updates, deletion, reporting, and relational database operations.',
    outcome: 'A working garage management web application deployed online for demonstration.'
  }
];

// Future projects are added here only. The UI reads this array automatically.
export const futureProjects = [
  { slot: 1, label: 'Future Project', status: 'Available' },
  { slot: 2, label: 'Future Project', status: 'Available' },
  { slot: 3, label: 'Future Project', status: 'Available' }
];
