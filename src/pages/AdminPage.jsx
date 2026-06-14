import React, { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, Save, LogOut, Upload, Eye, EyeOff, Database } from 'lucide-react'
import { isSupabaseReady, supabase } from '../lib/supabase'
import { fallbackProfile, fallbackProjects, projectImage } from '../data/fallback'

function AdminPage() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [profile, setProfile] = useState(fallbackProfile)
  const [projects, setProjects] = useState([])
  const [form, setForm] = useState(emptyProject())

  useEffect(() => {
    if (!isSupabaseReady) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession))
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) loadAdminData()
  }, [session])

  const visibleProjects = useMemo(() => {
    if (projects.length > 0) return projects
    return fallbackProjects
  }, [projects])

  async function loadAdminData() {
    const [{ data: profileData, error: profileError }, { data: projectData, error: projectError }] = await Promise.all([
      supabase.from('profile').select('*').order('updated_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('projects').select('*').order('created_at', { ascending: false })
    ])

    if (profileError) setMessage(profileError.message)
    if (projectError) setMessage(projectError.message)
    if (profileData) setProfile({ ...fallbackProfile, ...profileData })
    setProjects(projectData || [])
  }

  async function login(event) {
    event.preventDefault()
    setMessage('Login...')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setMessage(error ? error.message : 'Berhasil login.')
  }

  async function saveProfileToDb(nextProfile = profile) {
    const payload = {
      name: nextProfile.name || '',
      title: nextProfile.title || '',
      bio: nextProfile.bio || '',
      photo_url: nextProfile.photo_url || '',
      contact_email: nextProfile.contact_email || '',
      contact_phone: nextProfile.contact_phone || '',
      github_url: nextProfile.github_url || '',
      linkedin_url: nextProfile.linkedin_url || '',
      instagram_url: nextProfile.instagram_url || ''
    }

    let result
    if (nextProfile.id) {
      result = await supabase.from('profile').update(payload).eq('id', nextProfile.id).select().single()
    } else {
      result = await supabase.from('profile').insert(payload).select().single()
    }

    if (result.data) {
      const savedProfile = { ...fallbackProfile, ...result.data }
      setProfile(savedProfile)
      return savedProfile
    }

    throw result.error || new Error('Gagal menyimpan profile.')
  }

  async function saveProfile(event) {
    event.preventDefault()
    try {
      await saveProfileToDb(profile)
      setMessage('Profile berhasil disimpan. Refresh halaman public kalau belum berubah.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function uploadFile(file, folder) {
    if (!file) return ''
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${crypto.randomUUID()}.${fileExt}`
    const { error } = await supabase.storage.from('portfolio').upload(fileName, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from('portfolio').getPublicUrl(fileName)
    return data.publicUrl
  }

  async function uploadProfilePhoto(event) {
    try {
      const file = event.target.files?.[0]
      if (!file) return
      setMessage('Upload dan simpan foto profile...')
      const publicUrl = await uploadFile(file, 'profile')
      const nextProfile = { ...profile, photo_url: publicUrl }
      setProfile(nextProfile)
      await saveProfileToDb(nextProfile)
      setMessage('Foto profile berhasil diupload dan langsung disimpan.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      event.target.value = ''
    }
  }

  async function uploadProjectImage(event) {
    try {
      const file = event.target.files?.[0]
      if (!file) return
      setMessage('Upload gambar project...')
      const publicUrl = await uploadFile(file, 'projects')
      setForm((current) => ({ ...current, image_url: publicUrl }))
      setMessage('Gambar berhasil diupload. Klik Tambah Project.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      event.target.value = ''
    }
  }

  async function createProject(event) {
    event.preventDefault()
    const payload = projectPayload(form)
    const { error } = await supabase.from('projects').insert(payload)
    setMessage(error ? error.message : 'Project berhasil ditambahkan.')
    if (!error) {
      setForm(emptyProject())
      loadAdminData()
    }
  }

  async function saveFallbackProject(project) {
    const { error } = await supabase.from('projects').insert(projectPayload(project))
    setMessage(error ? error.message : 'Project bawaan berhasil disimpan ke database. Sekarang bisa dipublish/unpublish/hapus.')
    if (!error) loadAdminData()
  }

  async function toggleProject(project) {
    if (project.is_fallback) return setMessage('Project bawaan harus disimpan ke database dulu.')
    const { error } = await supabase.from('projects').update({ is_published: !project.is_published }).eq('id', project.id)
    setMessage(error ? error.message : 'Status project diubah.')
    if (!error) loadAdminData()
  }

  async function deleteProject(project) {
    if (project.is_fallback) return setMessage('Project bawaan belum ada di database. Simpan ke database dulu kalau mau dikelola.')
    const ok = confirm('Hapus project ini?')
    if (!ok) return
    const { error } = await supabase.from('projects').delete().eq('id', project.id)
    setMessage(error ? error.message : 'Project dihapus.')
    if (!error) loadAdminData()
  }

  if (!isSupabaseReady) return <AdminShell><p className="muted">ENV Supabase belum ada. Isi file .env dulu.</p></AdminShell>

  if (!session) {
    return (
      <AdminShell>
        <form className="admin-panel glass" onSubmit={login}>
          <p className="section-label">Admin Login</p>
          <h1>Masuk dulu</h1>
          <input type="email" placeholder="Email admin Supabase" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="btn primary" type="submit">Login</button>
          {message && <p className="muted">{message}</p>}
        </form>
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <div className="admin-header">
        <div>
          <p className="section-label">Private Page</p>
          <h1>Admin Portfolio</h1>
        </div>
        <button className="btn ghost" onClick={() => supabase.auth.signOut()}><LogOut size={18} /> Logout</button>
      </div>

      {message && <div className="notice glass">{message}</div>}

      <section className="admin-grid">
        <form className="admin-panel glass" onSubmit={saveProfile}>
          <h2>Edit Profile</h2>
          <div className="admin-photo-preview">
            <img src={profile.photo_url || fallbackProfile.photo_url} alt="Preview profile" />
            <label className="upload-label"><Upload size={18} /> Upload foto profile<input type="file" accept="image/*" onChange={uploadProfilePhoto} /></label>
          </div>
          <input value={profile.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Nama" />
          <input value={profile.title || ''} onChange={(e) => setProfile({ ...profile, title: e.target.value })} placeholder="Title" />
          <textarea value={profile.bio || ''} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Bio" />
          <input value={profile.photo_url || ''} onChange={(e) => setProfile({ ...profile, photo_url: e.target.value })} placeholder="Photo URL" />
          <input value={profile.contact_email || ''} onChange={(e) => setProfile({ ...profile, contact_email: e.target.value })} placeholder="Email kontak, kosongkan kalau mau disembunyikan" />
          <input value={profile.contact_phone || ''} onChange={(e) => setProfile({ ...profile, contact_phone: e.target.value })} placeholder="Nomor WhatsApp, contoh: 083151960290" />
          <input value={profile.github_url || ''} onChange={(e) => setProfile({ ...profile, github_url: e.target.value })} placeholder="GitHub URL/username, contoh: https://github.com/Main4jaa atau Main4jaa" />
          <input value={profile.linkedin_url || ''} onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })} placeholder="LinkedIn URL/username, contoh: https://linkedin.com/in/username" />
          <input value={profile.instagram_url || ''} onChange={(e) => setProfile({ ...profile, instagram_url: e.target.value })} placeholder="Instagram URL/username, contoh: https://instagram.com/username atau @username" />
          <button className="btn primary" type="submit"><Save size={18} /> Simpan Profile</button>
        </form>

        <form className="admin-panel glass" onSubmit={createProject}>
          <h2>Tambah Project</h2>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Judul project" required />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi" />
          <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Image URL" />
          <label className="upload-label"><Upload size={18} /> Upload gambar project<input type="file" accept="image/*" onChange={uploadProjectImage} /></label>
          <input value={form.tech_stack} onChange={(e) => setForm({ ...form, tech_stack: e.target.value })} placeholder="Tech stack, pisahkan dengan koma" />
          <input value={form.demo_url} onChange={(e) => setForm({ ...form, demo_url: e.target.value })} placeholder="Demo URL" />
          <input value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} placeholder="GitHub URL" />
          <label className="checkbox-row"><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} /> Tampilkan di public</label>
          <button className="btn primary" type="submit"><Plus size={18} /> Tambah Project</button>
        </form>
      </section>

      <section className="section admin-list-section">
        <div className="admin-list-title">
          <div>
            <p className="section-label">Database</p>
            <h2>Project Tersimpan</h2>
          </div>
          <p className="muted">Project yang statusnya Public akan muncul di halaman portfolio umum.</p>
        </div>

        <div className="admin-project-list">
          {visibleProjects.map((project) => (
            <div className="admin-project-item glass" key={project.id}>
              <img src={project.image_url || projectImage} alt={project.title} />
              <div>
                <h3>{project.title}</h3>
                <p className="muted">{project.description}</p>
                <p className="muted">Status: {project.is_fallback ? 'Project bawaan, belum masuk database' : project.is_published ? 'Public' : 'Draft'}</p>
              </div>
              <div className="admin-item-actions">
                {project.is_fallback ? (
                  <button className="btn primary" onClick={() => saveFallbackProject(project)}><Database size={18} /> Simpan ke DB</button>
                ) : (
                  <button className="btn ghost" onClick={() => toggleProject(project)}>{project.is_published ? <EyeOff size={18} /> : <Eye size={18} />} {project.is_published ? 'Unpublish' : 'Publish'}</button>
                )}
                <button className="btn danger" onClick={() => deleteProject(project)}><Trash2 size={18} /> Hapus</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  )
}

function AdminShell({ children }) {
  return (
    <main>
      <div className="bg-orb orb-one" />
      <div className="bg-orb orb-two" />
      <nav className="nav glass fade-down">
        <a className="brand" href="/">Fathir<span>.</span></a>
        <div className="nav-links"><a href="/">Public Portfolio</a></div>
      </nav>
      <section className="section admin-page">{children}</section>
    </main>
  )
}

function emptyProject() {
  return {
    title: '',
    description: '',
    image_url: '',
    tech_stack: '',
    demo_url: '',
    github_url: '',
    is_published: true
  }
}

function projectPayload(project) {
  return {
    title: project.title || '',
    description: project.description || '',
    image_url: project.image_url || '',
    tech_stack: Array.isArray(project.tech_stack)
      ? project.tech_stack
      : String(project.tech_stack || '').split(',').map((item) => item.trim()).filter(Boolean),
    demo_url: project.demo_url || '',
    github_url: project.github_url || '',
    is_published: project.is_published !== false
  }
}

export default AdminPage
