import React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Mail, Phone, ExternalLink, Code2, ArrowRight, Github, Linkedin, Instagram } from 'lucide-react'
import { isSupabaseReady, supabase } from '../lib/supabase'
import { fallbackProfile, fallbackProjects, profileImage, projectImage } from '../data/fallback'

function PublicPortfolio() {
  const [profile, setProfile] = useState(fallbackProfile)
  const [projects, setProjects] = useState(fallbackProjects)
  const featuredProject = projects[0] || fallbackProjects[0]

  useEffect(() => {
    async function loadData() {
      if (!isSupabaseReady) return

      const [{ data: profileData }, { data: projectData }] = await Promise.all([
        supabase.from('profile').select('*').order('updated_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('projects').select('*').eq('is_published', true).order('created_at', { ascending: false })
      ])

      if (profileData) setProfile({ ...fallbackProfile, ...profileData })
      if (projectData?.length) setProjects(projectData)
      if (projectData && projectData.length === 0) setProjects([])
    }

    loadData()
  }, [])

  const contactItems = useMemo(() => {
    const email = cleanText(profile.contact_email)
    const phone = cleanText(profile.contact_phone)
    const github = socialLink(profile.github_url, 'github')
    const linkedin = socialLink(profile.linkedin_url, 'linkedin')
    const instagram = socialLink(profile.instagram_url, 'instagram')

    return [
      email && {
        label: email,
        href: `mailto:${email}`,
        icon: <Mail size={20} />,
        external: false
      },
      phone && {
        label: phone,
        href: whatsappLink(phone),
        icon: <Phone size={20} />,
        external: true
      },
      github && {
        label: 'GitHub',
        href: github,
        icon: <Github size={20} />,
        external: true
      },
      linkedin && {
        label: 'LinkedIn',
        href: linkedin,
        icon: <Linkedin size={20} />,
        external: true
      },
      instagram && {
        label: 'Instagram',
        href: instagram,
        icon: <Instagram size={20} />,
        external: true
      }
    ].filter(Boolean)
  }, [profile])

  return (
    <main>
      <div className="bg-orb orb-one" />
      <div className="bg-orb orb-two" />

      <nav className="nav glass fade-down">
        <a className="brand" href="#home">Fathir<span>.</span></a>
        <div className="nav-links">
          <a href="#about">Tentang</a>
          <a href="#skills">Skill</a>
          <a href="#projects">Projek</a>
          <a href="#contact">Kontak</a>
        </div>
      </nav>

      <section id="home" className="hero section">
        <div className="hero-copy fade-up">
          <p className="eyebrow">{profile.title || fallbackProfile.title}</p>
          <h1>Halo, saya <span>{profile.name || 'Fathir Afif'}</span></h1>
          <p className="lead">{profile.bio || fallbackProfile.bio}</p>

          <div className="hero-actions">
            <a className="btn primary" href={featuredProject.demo_url || '#projects'} target="_blank" rel="noreferrer">
              Lihat Projek <ExternalLink size={18} />
            </a>
            <a className="btn ghost" href="#contact">
              Hubungi Saya <ArrowRight size={18} />
            </a>
          </div>
        </div>

        <div className="portrait-wrap fade-up delay-1">
          <div className="portrait-glow" />
          <img className="portrait" src={profile.photo_url || profileImage} alt={`Foto ${profile.name || 'Fathir Afif'}`} />
          <div className="floating-card card-one"><Code2 size={18} /> React + Vite</div>
          <div className="floating-card card-two">Available for project</div>
        </div>
      </section>

      <section id="about" className="section split reveal">
        <div>
          <p className="section-label">Tentang Saya</p>
          <h2>Membangun website yang cepat, rapi, dan interaktif.</h2>
        </div>

        <p className="muted">
          Saya suka mengubah ide menjadi produk digital yang terlihat profesional.
          Portfolio ini dibuat dengan React + Vite, Supabase, efek animasi CSS,
          layout glassmorphism, dan desain responsif untuk desktop maupun mobile.
        </p>
      </section>

      <section id="skills" className="section reveal">
        <p className="section-label">Bahasa & Tools</p>
        <h2>Tech stack yang digunakan</h2>

        <div className="skills-grid">
          {['HTML', 'CSS', 'JavaScript', 'React', 'Vite', 'Supabase', 'GitHub', 'UI Animation'].map((skill, i) => (
            <div className="skill-card" style={{ '--i': i }} key={skill}>{skill}</div>
          ))}
        </div>
      </section>

      <section id="projects" className="section reveal">
        <p className="section-label">Featured Project</p>
        <div className="projects-list">
          {projects.length === 0 && <p className="muted">Belum ada project yang dipublish.</p>}
          {projects.map((project) => (
            <article className="project-card glass" key={project.id}>
              <div className="project-image-wrap">
                <img src={project.image_url || projectImage} alt={project.title} className="project-image" />
              </div>

              <div className="project-content">
                <h2>{project.title}</h2>
                <p className="muted">{project.description}</p>
                {!!project.tech_stack?.length && (
                  <div className="tech-list">
                    {project.tech_stack.map((tech) => <span key={tech}>{tech}</span>)}
                  </div>
                )}
                <div className="project-actions">
                  {project.demo_url && <a className="btn primary" href={project.demo_url} target="_blank" rel="noreferrer">Live Demo <ExternalLink size={18} /></a>}
                  {project.github_url && <a className="btn ghost" href={project.github_url} target="_blank" rel="noreferrer">GitHub</a>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="section contact reveal">
        <p className="section-label">Kontak</p>
        <h2>Mari terhubung</h2>

        {contactItems.length > 0 ? (
          <div className="contact-grid">
            {contactItems.map((item) => (
              <a
                className="contact-card"
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                key={item.href}
              >
                {item.icon} {item.label}
              </a>
            ))}
          </div>
        ) : (
          <p className="muted contact-empty">Kontak belum ditambahkan.</p>
        )}
      </section>

      <footer>© {new Date().getFullYear()} Fathir Afif. Built with React + Vite + Supabase.</footer>
    </main>
  )
}

function cleanText(value) {
  return String(value || '').trim()
}

function withHttps(value) {
  const text = cleanText(value)
  if (!text) return ''
  if (text.startsWith('http://') || text.startsWith('https://')) return text
  return `https://${text}`
}

function usernameOnly(value) {
  return cleanText(value).replace(/^@/, '').replace(/^\/+/, '')
}

function socialLink(value, type) {
  const text = cleanText(value)
  if (!text) return ''
  if (text.startsWith('http://') || text.startsWith('https://')) return text

  if (type === 'instagram') return `https://instagram.com/${usernameOnly(text)}`
  if (type === 'github') return `https://github.com/${usernameOnly(text)}`
  if (type === 'linkedin') {
    const clean = usernameOnly(text)
    if (clean.includes('linkedin.com')) return withHttps(clean)
    return `https://www.linkedin.com/in/${clean}`
  }

  return withHttps(text)
}

function whatsappLink(value) {
  const phone = cleanText(value)
  const digits = phone.replace(/[^\d]/g, '')
  if (!digits) return '#contact'
  const normalized = digits.startsWith('0') ? `62${digits.slice(1)}` : digits
  return `https://wa.me/${normalized}`
}

export default PublicPortfolio
