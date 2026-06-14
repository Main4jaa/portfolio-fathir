import profileImage from '../assets/profile.jpeg'
import projectImage from '../assets/project.png'

export const fallbackProfile = {
  name: 'Fathir Afif',
  title: 'Web Developer',
  bio: 'Web developer yang fokus membuat tampilan website modern, responsif, dan nyaman digunakan.',
  photo_url: profileImage,
  contact_email: 'fathirafifm@gmail.com',
  contact_phone: '083151960290',
  github_url: 'https://github.com/Main4jaa',
  linkedin_url: '',
  instagram_url: ''
}

export const fallbackProjects = [
  {
    id: 'fallback-capstone',
    title: 'Capstone Project',
    description: 'Website yang saya kembangkan dan sudah dideploy menggunakan Vercel. Dibangun dengan fokus pada tampilan modern, responsif, dan pengalaman pengguna yang nyaman.',
    image_url: projectImage,
    tech_stack: ['React', 'Vite', 'Vercel'],
    demo_url: 'https://capstone-project-fu5e.vercel.app/',
    github_url: '',
    is_published: true,
    is_fallback: true
  }
]

export { profileImage, projectImage }
