import { useState, useMemo, useEffect } from 'react'
import { User, Briefcase, Zap, Award, Trophy, Link, GraduationCap, Mail, MapPin, Plus, Trash2, Save, Edit2, FileText } from 'lucide-react'
import BlogEditor from './BlogEditor'
import ConfirmDialog from './ConfirmDialog'
import LoadingSpinner from './LoadingSpinner'
import CustomMarkdownParser from './CustomMarkdownParser'
import './InteractiveEditor.css'

const sections = [
  { id: 'about', label: 'About', icon: User },
  { id: 'projects', label: 'Projects', icon: Briefcase },
  { id: 'skills', label: 'Skills', icon: Zap },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'badges', label: 'Badges', icon: Trophy },
  { id: 'social', label: 'Social', icon: Link },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'contact', label: 'Contact', icon: Mail },
  { id: 'journey', label: 'Journey', icon: MapPin }
]

function InteractiveEditor({ data, setData, onSave, saving }) {
  const [activeSection, setActiveSection] = useState('about')
  const [selectedProject, setSelectedProject] = useState(0)
  const [selectedSkillCategory, setSelectedSkillCategory] = useState(Object.keys(data.skills)[0] || '')
  const [selectedCertCategory, setSelectedCertCategory] = useState(Object.keys(data.certificates)[0] || '')
  const [selectedBadgeCategory, setSelectedBadgeCategory] = useState(Object.keys(data.badges)[0] || '')
  const [selectedEducation, setSelectedEducation] = useState(0)
  const [selectedSocial, setSelectedSocial] = useState(0)
  const [selectedContact, setSelectedContact] = useState(0)
  const [selectedJourney, setSelectedJourney] = useState(0)
  const [isAdding, setIsAdding] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryName, setCategoryName] = useState('')
  const [editingField, setEditingField] = useState(null)
  const [editingValue, setEditingValue] = useState('')
  const [blogEditorOpen, setBlogEditorOpen] = useState(false)
  const [currentProject, setCurrentProject] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'danger' })
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Initialize custom markdown parser
  const markdownParser = useMemo(() => new CustomMarkdownParser(), [])

  // Cleanup body class on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('sidebar-open')
    }
  }, [])

  // Notification system
  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div')
    notification.className = `glassmorphic-notification ${type}`
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon ${type}"></div>
        <div class="notification-text">${message}</div>
      </div>
    `
    document.body.appendChild(notification)

    // Auto remove notification
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.classList.add('fade-out')
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification)
          }
        }, 300)
      }
    }, 3000)
  }

  // Double-click editing functionality
  const handleDoubleClick = (field, currentValue) => {
    setEditingField(field)
    setEditingValue(currentValue)
  }

  const handleEditSubmit = (field, newValue) => {
    if (field.includes('.')) {
      updateData(field, newValue)
    }
    setEditingField(null)
    setEditingValue('')
  }

  const updateData = (path, value) => {
    setData(prev => {
      const newData = { ...prev }
      const keys = path.split('.')
      let current = newData
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value
      return newData
    })
  }

  const addProject = () => {
    const newIndex = data.projects.length
    setData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        name: 'New Project',
        url: '',
        imgSrc: '',
        imgAlt: '',
        tech: [],
        description: '',
        blogContent: ''
      }]
    }))
    setSelectedProject(newIndex)
  }

  const deleteProject = (index) => {
    const projectName = data.projects[index]?.name || 'this project'
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Project',
      message: `Are you sure you want to delete "${projectName}"? This action cannot be undone.`,
      type: 'delete',
      onConfirm: () => {
        setData(prev => ({
          ...prev,
          projects: prev.projects.filter((_, i) => i !== index)
        }))
        setSelectedProject(Math.max(0, index - 1))
      }
    })
  }

  const addTech = (projectIndex) => {
    if (isAdding) return
    setIsAdding(true)

    setData(prev => {
      const newProjects = [...prev.projects]
      if (newProjects[projectIndex] && newProjects[projectIndex].tech) {
        newProjects[projectIndex].tech.push({ imgSrc: '', alt: 'New Tech' })
      }
      return { ...prev, projects: newProjects }
    })

    setTimeout(() => setIsAdding(false), 300)
  }

  const updateProject = (index, field, value) => {
    setData(prev => {
      const newProjects = [...prev.projects]
      newProjects[index][field] = value
      return { ...prev, projects: newProjects }
    })
  }

  const updateTech = (projectIndex, techIndex, field, value) => {
    setData(prev => {
      const newProjects = [...prev.projects]
      newProjects[projectIndex].tech[techIndex][field] = value
      return { ...prev, projects: newProjects }
    })
  }

  const addSkillCategory = () => {
    let categoryName = 'New Category'
    let counter = 1
    while (data.skills[categoryName]) {
      categoryName = `New Category ${counter}`
      counter++
    }
    setData(prev => ({
      ...prev,
      skills: { ...prev.skills, [categoryName]: [] }
    }))
    setSelectedSkillCategory(categoryName)
  }

  const addSkill = (category) => {
    setData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: [...prev.skills[category], { name: 'New Skill', imgSrc: '', alt: '' }]
      }
    }))
  }

  const updateSkill = (category, index, field, value) => {
    setData(prev => {
      const newSkills = [...prev.skills[category]]
      newSkills[index][field] = value
      return {
        ...prev,
        skills: { ...prev.skills, [category]: newSkills }
      }
    })
  }

  // Category management functions
  const renameCategory = (type, oldName, newName) => {
    if (!newName.trim() || oldName === newName) return

    setData(prev => {
      const newData = { ...prev }
      const categories = { ...newData[type] }

      // Create new category with new name
      categories[newName] = categories[oldName]
      // Delete old category
      delete categories[oldName]

      newData[type] = categories
      return newData
    })

    // Update selected category
    if (type === 'skills') setSelectedSkillCategory(newName)
    if (type === 'certificates') setSelectedCertCategory(newName)
    if (type === 'badges') setSelectedBadgeCategory(newName)
  }

  const deleteCategory = (type, categoryName) => {
    const itemCount = data[type][categoryName]?.length || 0
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Category',
      message: `Are you sure you want to delete the "${categoryName}" category${itemCount > 0 ? ` and all ${itemCount} items in it` : ''}? This action cannot be undone.`,
      type: 'delete',
      onConfirm: () => {
        setData(prev => {
          const newData = { ...prev }
          const categories = { ...newData[type] }
          delete categories[categoryName]
          newData[type] = categories
          return newData
        })

        // Update selected category to first available or empty
        const remainingCategories = Object.keys(data[type]).filter(cat => cat !== categoryName)
        if (type === 'skills') setSelectedSkillCategory(remainingCategories[0] || '')
        if (type === 'certificates') setSelectedCertCategory(remainingCategories[0] || '')
        if (type === 'badges') setSelectedBadgeCategory(remainingCategories[0] || '')
      }
    })
  }

  // Blog editor functions
  const openBlogEditor = (projectIndex) => {
    setCurrentProject({ ...data.projects[projectIndex], index: projectIndex })
    setBlogEditorOpen(true)
  }

  const closeBlogEditor = () => {
    setBlogEditorOpen(false)
    setCurrentProject(null)
  }

  const saveBlogContent = async (content) => {
    if (currentProject) {
      setLoading(true)
      try {
        updateProject(currentProject.index, 'blogContent', content)

        // Show success notification
        showNotification('Blog content saved successfully!', 'success')
      } catch (error) {
        console.error('Error saving blog content:', error)
        // Show error notification
        showNotification('Failed to save blog content', 'error')
      } finally {
        setLoading(false)
      }
    }
  }

  const toggleSidebar = () => {
    const newState = !sidebarOpen
    setSidebarOpen(newState)
    // Prevent body scroll when sidebar is open on mobile
    if (newState) {
      document.body.classList.add('sidebar-open')
    } else {
      document.body.classList.remove('sidebar-open')
    }
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
    document.body.classList.remove('sidebar-open')
  }

  return (
    <>
      <div className="interactive-editor">
        {/* Mobile Sidebar Overlay */}
        <div
          className={`mobile-sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
          onClick={closeSidebar}
        />

        {/* Mobile Toggle Button */}
        <button
          className="mobile-sidebar-toggle"
          onClick={toggleSidebar}
        >
          ☰
        </button>

        <div className={`editor-sidebar ${sidebarOpen ? 'open' : ''}`}>
          {/* Mobile Close Button */}
          <button
            className="sidebar-close-btn"
            onClick={closeSidebar}
          >
            ×
          </button>

          <div className="logo-section">
            <h2>Portfolio Editor</h2>
          </div>

          <div className="section-nav">
            {sections.map(section => (
              <button
                key={section.id}
                className={`section-btn ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection(section.id)
                  closeSidebar() // Close sidebar on mobile after selection
                }}
              >
                <section.icon size={20} />
                <span className="label">{section.label}</span>
              </button>
            ))}
          </div>

          <button className="save-button" onClick={onSave} disabled={saving}>
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save to Database'}</span>
          </button>
        </div>

        <div className="editor-main">
          {activeSection === 'about' && (
            <div className="section-content fade-in">
              <h1 className="section-title">About Section</h1>

              <div className="input-group">
                <label>Greeting</label>
                <input
                  type="text"
                  value={data.about.greeting}
                  onChange={(e) => updateData('about.greeting', e.target.value)}
                  placeholder="Hi, I'm Krishna Singh"
                />
              </div>

              <div className="input-group">
                <label>Title</label>
                <input
                  type="text"
                  value={data.about.title}
                  onChange={(e) => updateData('about.title', e.target.value)}
                  placeholder="Full Stack Software Developer"
                />
              </div>

              <div className="input-group">
                <label>Description</label>
                <textarea
                  value={data.about.description}
                  onChange={(e) => updateData('about.description', e.target.value)}
                  placeholder="Your description..."
                  rows={6}
                />
              </div>
            </div>
          )}

          {activeSection === 'projects' && (
            <div className="section-content fade-in">
              <div className="section-header">
                <h1 className="section-title">Projects</h1>
                <button className="add-btn" onClick={addProject}>
                  <Plus size={16} />
                  Add Project
                </button>
              </div>

              {data.projects.length > 0 && (
                <div className="projects-layout">
                  <div className="projects-list">
                    {data.projects.map((project, index) => (
                      <div
                        key={index}
                        className={`project-item ${selectedProject === index ? 'active' : ''}`}
                        onClick={() => setSelectedProject(index)}
                      >
                        <span className="project-name">{project.name || 'Untitled'}</span>
                        <button
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteProject(index)
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {data.projects[selectedProject] && (
                    <div className="project-editor slide-in">
                      <div className="input-group">
                        <label>Project Name</label>
                        <input
                          type="text"
                          value={data.projects[selectedProject].name}
                          onChange={(e) => updateProject(selectedProject, 'name', e.target.value)}
                        />
                      </div>

                      <div className="input-group">
                        <label>URL</label>
                        <input
                          type="text"
                          value={data.projects[selectedProject].url}
                          onChange={(e) => updateProject(selectedProject, 'url', e.target.value)}
                        />
                      </div>

                      <div className="input-group">
                        <label>Image URL</label>
                        <div className="image-input-group">
                          <input
                            type="text"
                            value={data.projects[selectedProject].imgSrc}
                            onChange={(e) => updateProject(selectedProject, 'imgSrc', e.target.value)}
                            placeholder="Enter image URL"
                          />
                          {data.projects[selectedProject].imgSrc && (
                            <div className="image-preview">
                              <img
                                src={data.projects[selectedProject].imgSrc}
                                alt="Project preview"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  e.target.nextSibling.style.display = 'flex'
                                }}
                                onLoad={(e) => {
                                  e.target.style.display = 'block'
                                  e.target.nextSibling.style.display = 'none'
                                }}
                              />
                              <div className="image-error" style={{ display: 'none' }}>
                                <span>Invalid image URL</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="input-group">
                        <label>Description</label>
                        <textarea
                          value={data.projects[selectedProject].description}
                          onChange={(e) => updateProject(selectedProject, 'description', e.target.value)}
                          rows={4}
                        />
                      </div>

                      <div className="tech-section">
                        <div className="tech-header">
                          <label>Technologies</label>
                          <button className="add-tech-btn" onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            addTech(selectedProject)
                          }} disabled={isAdding}>
                            <Plus size={14} />
                            Add Tech
                          </button>
                        </div>
                        <div className="tech-grid">
                          {data.projects[selectedProject].tech.map((tech, techIndex) => (
                            <div key={techIndex} className="tech-item">
                              <input
                                type="text"
                                value={tech.alt}
                                onChange={(e) => updateTech(selectedProject, techIndex, 'alt', e.target.value)}
                                placeholder="Tech name"
                              />
                              <input
                                type="text"
                                value={tech.imgSrc}
                                onChange={(e) => updateTech(selectedProject, techIndex, 'imgSrc', e.target.value)}
                                placeholder="Icon URL"
                              />
                              <button
                                className="delete-btn"
                                onClick={() => {
                                  setData(prev => {
                                    const newProjects = [...prev.projects]
                                    newProjects[selectedProject].tech = newProjects[selectedProject].tech.filter((_, i) => i !== techIndex)
                                    return { ...prev, projects: newProjects }
                                  })
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="input-group">
                        <div className="blog-editor-section">
                          <label>Blog Content</label>
                          <div className="blog-content-preview">
                            {data.projects[selectedProject].blogContent && data.projects[selectedProject].blogContent.trim() ? (
                              <div className="blog-preview-text">
                                <div className="blog-preview-header">
                                  <span className="blog-status-badge available">Blog Content Available</span>
                                  <span className="blog-char-count">{data.projects[selectedProject].blogContent.length} characters</span>
                                </div>
                                <div className="blog-preview-snippet">
                                  <div className="snippet-header">Preview:</div>
                                  <div
                                    className="snippet-content blog-content"
                                    dangerouslySetInnerHTML={{
                                      __html: markdownParser.parse(
                                        data.projects[selectedProject].blogContent
                                          .replace(/\\n/g, '\n')
                                          .replace(/\\"/g, '"')
                                          .replace(/\\'/g, "'")
                                          .substring(0, 300)
                                      ) + (data.projects[selectedProject].blogContent.length > 300 ? '<p><em>...and more</em></p>' : '')
                                    }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="blog-preview-empty">
                                <div className="empty-blog-icon"></div>
                                <p>No blog content yet</p>
                                <span>Click "Edit Blog" to start writing your project story</span>
                              </div>
                            )}
                            <button
                              type="button"
                              className="blog-edit-btn"
                              onClick={() => openBlogEditor(selectedProject)}
                              disabled={loading}
                            >
                              <FileText size={16} />
                              {loading ? 'Loading...' : 'Edit Blog'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeSection === 'skills' && (
            <div className="section-content fade-in">
              <div className="section-header">
                <h1 className="section-title">Skills</h1>
                <button className="add-btn" onClick={addSkillCategory}>
                  <Plus size={16} />
                  Add Category
                </button>
              </div>

              {Object.keys(data.skills).length > 0 && (
                <div className="skills-layout">
                  <div className="category-tabs">
                    {Object.keys(data.skills).map(category => (
                      <div key={category} className="category-tab-container">
                        <button
                          className={`category-tab ${selectedSkillCategory === category ? 'active' : ''}`}
                          onClick={() => setSelectedSkillCategory(category)}
                        >
                          {editingCategory === `skills-${category}` ? (
                            <input
                              type="text"
                              value={categoryName}
                              onChange={(e) => setCategoryName(e.target.value)}
                              onBlur={() => {
                                renameCategory('skills', category, categoryName)
                                setEditingCategory(null)
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  renameCategory('skills', category, categoryName)
                                  setEditingCategory(null)
                                }
                                if (e.key === 'Escape') {
                                  setEditingCategory(null)
                                  setCategoryName('')
                                }
                              }}
                              className="category-rename-input"
                              autoFocus
                            />
                          ) : (
                            <span
                              className="category-name editable-category"
                              onDoubleClick={(e) => {
                                e.stopPropagation()
                                setEditingCategory(`skills-${category}`)
                                setCategoryName(category)
                              }}
                              title="Double-click to edit"
                            >
                              {category}
                            </span>
                          )}
                        </button>
                        <div className="category-actions">
                          <button
                            className="category-delete-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteCategory('skills', category)
                            }}
                            title="Delete category"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedSkillCategory && data.skills[selectedSkillCategory] && (
                    <div className="skills-editor slide-in">
                      <button className="add-btn" onClick={() => addSkill(selectedSkillCategory)}>
                        <Plus size={16} />
                        Add Skill
                      </button>
                      <div className="skills-grid">
                        {data.skills[selectedSkillCategory].map((skill, index) => (
                          <div key={index} className="skill-item">
                            <div className="skill-preview">
                              {skill.imgSrc ? (
                                <img
                                  src={skill.imgSrc}
                                  alt={skill.name}
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                    e.target.nextSibling.style.display = 'flex'
                                  }}
                                  onLoad={(e) => {
                                    e.target.style.display = 'block'
                                    e.target.nextSibling.style.display = 'none'
                                  }}
                                />
                              ) : null}
                              <div className="image-placeholder" style={{ display: skill.imgSrc ? 'none' : 'flex' }}>
                                <span>No Icon</span>
                              </div>
                            </div>
                            <input
                              type="text"
                              value={skill.name}
                              onChange={(e) => updateSkill(selectedSkillCategory, index, 'name', e.target.value)}
                              placeholder="Skill name"
                            />
                            <input
                              type="text"
                              value={skill.imgSrc}
                              onChange={(e) => updateSkill(selectedSkillCategory, index, 'imgSrc', e.target.value)}
                              placeholder="Icon URL"
                            />
                            <button
                              className="delete-btn"
                              onClick={() => {
                                setData(prev => ({
                                  ...prev,
                                  skills: {
                                    ...prev.skills,
                                    [selectedSkillCategory]: prev.skills[selectedSkillCategory].filter((_, i) => i !== index)
                                  }
                                }))
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeSection === 'certificates' && (
            <div className="section-content fade-in">
              <div className="section-header">
                <h1 className="section-title">Certificates</h1>
                <button className="add-btn" onClick={() => {
                  let categoryName = 'New Category'
                  let counter = 1
                  while (data.certificates[categoryName]) {
                    categoryName = `New Category ${counter}`
                    counter++
                  }
                  setData(prev => ({
                    ...prev,
                    certificates: { ...prev.certificates, [categoryName]: [] }
                  }))
                  setSelectedCertCategory(categoryName)
                }}>
                  <Plus size={16} />
                  Add Category
                </button>
              </div>

              {Object.keys(data.certificates).length > 0 && (
                <div className="skills-layout">
                  <div className="category-tabs">
                    {Object.keys(data.certificates).map(category => (
                      <div key={category} className="category-tab-container">
                        <button
                          className={`category-tab ${selectedCertCategory === category ? 'active' : ''}`}
                          onClick={() => setSelectedCertCategory(category)}
                        >
                          {editingCategory === `certificates-${category}` ? (
                            <input
                              type="text"
                              value={categoryName}
                              onChange={(e) => setCategoryName(e.target.value)}
                              onBlur={() => {
                                renameCategory('certificates', category, categoryName)
                                setEditingCategory(null)
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  renameCategory('certificates', category, categoryName)
                                  setEditingCategory(null)
                                }
                                if (e.key === 'Escape') {
                                  setEditingCategory(null)
                                  setCategoryName('')
                                }
                              }}
                              className="category-rename-input"
                              autoFocus
                            />
                          ) : (
                            <span
                              className="category-name editable-category"
                              onDoubleClick={(e) => {
                                e.stopPropagation()
                                setEditingCategory(`certificates-${category}`)
                                setCategoryName(category)
                              }}
                              title="Double-click to edit"
                            >
                              {category}
                            </span>
                          )}
                        </button>
                        <div className="category-actions">
                          <button
                            className="category-delete-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteCategory('certificates', category)
                            }}
                            title="Delete category"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedCertCategory && data.certificates[selectedCertCategory] && (
                    <div className="certificates-editor slide-in">
                      <button className="add-btn" onClick={() => {
                        setData(prev => ({
                          ...prev,
                          certificates: {
                            ...prev.certificates,
                            [selectedCertCategory]: [...prev.certificates[selectedCertCategory], { imgSrc: '', imgAlt: 'New Certificate' }]
                          }
                        }))
                      }}>
                        <Plus size={16} />
                        Add Certificate
                      </button>
                      <div className="certificates-grid">
                        {data.certificates[selectedCertCategory].map((cert, index) => (
                          <div key={index} className="certificate-card">
                            <div className="certificate-preview">
                              {cert.imgSrc ? (
                                <img
                                  src={cert.imgSrc}
                                  alt={cert.imgAlt}
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                    e.target.nextSibling.style.display = 'flex'
                                  }}
                                  onLoad={(e) => {
                                    e.target.style.display = 'block'
                                    e.target.nextSibling.style.display = 'none'
                                  }}
                                />
                              ) : null}
                              <div className="placeholder" style={{ display: cert.imgSrc ? 'none' : 'flex' }}>
                                No Image
                              </div>
                            </div>
                            <div className="certificate-inputs">
                              <input
                                type="text"
                                value={cert.imgAlt}
                                onChange={(e) => {
                                  setData(prev => {
                                    const newCerts = [...prev.certificates[selectedCertCategory]]
                                    newCerts[index].imgAlt = e.target.value
                                    return {
                                      ...prev,
                                      certificates: { ...prev.certificates, [selectedCertCategory]: newCerts }
                                    }
                                  })
                                }}
                                placeholder="Certificate name"
                              />
                              <input
                                type="text"
                                value={cert.imgSrc}
                                onChange={(e) => {
                                  setData(prev => {
                                    const newCerts = [...prev.certificates[selectedCertCategory]]
                                    newCerts[index].imgSrc = e.target.value
                                    return {
                                      ...prev,
                                      certificates: { ...prev.certificates, [selectedCertCategory]: newCerts }
                                    }
                                  })
                                }}
                                placeholder="Image URL"
                              />
                              <button className="delete-btn" onClick={() => {
                                setData(prev => ({
                                  ...prev,
                                  certificates: {
                                    ...prev.certificates,
                                    [selectedCertCategory]: prev.certificates[selectedCertCategory].filter((_, i) => i !== index)
                                  }
                                }))
                              }}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeSection === 'badges' && (
            <div className="section-content fade-in">
              <div className="section-header">
                <h1 className="section-title">Badges</h1>
                <button className="add-btn" onClick={() => {
                  let categoryName = 'New Category'
                  let counter = 1
                  while (data.badges[categoryName]) {
                    categoryName = `New Category ${counter}`
                    counter++
                  }
                  setData(prev => ({
                    ...prev,
                    badges: { ...prev.badges, [categoryName]: [] }
                  }))
                  setSelectedBadgeCategory(categoryName)
                }}>
                  <Plus size={16} />
                  Add Category
                </button>
              </div>

              {Object.keys(data.badges).length > 0 && (
                <div className="skills-layout">
                  <div className="category-tabs">
                    {Object.keys(data.badges).map(category => (
                      <div key={category} className="category-tab-container">
                        <button
                          className={`category-tab ${selectedBadgeCategory === category ? 'active' : ''}`}
                          onClick={() => setSelectedBadgeCategory(category)}
                        >
                          {editingCategory === `badges-${category}` ? (
                            <input
                              type="text"
                              value={categoryName}
                              onChange={(e) => setCategoryName(e.target.value)}
                              onBlur={() => {
                                renameCategory('badges', category, categoryName)
                                setEditingCategory(null)
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  renameCategory('badges', category, categoryName)
                                  setEditingCategory(null)
                                }
                                if (e.key === 'Escape') {
                                  setEditingCategory(null)
                                  setCategoryName('')
                                }
                              }}
                              className="category-rename-input"
                              autoFocus
                            />
                          ) : (
                            <span
                              className="category-name editable-category"
                              onDoubleClick={(e) => {
                                e.stopPropagation()
                                setEditingCategory(`badges-${category}`)
                                setCategoryName(category)
                              }}
                              title="Double-click to edit"
                            >
                              {category}
                            </span>
                          )}
                        </button>
                        <div className="category-actions">
                          <button
                            className="category-delete-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteCategory('badges', category)
                            }}
                            title="Delete category"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedBadgeCategory && data.badges[selectedBadgeCategory] && (
                    <div className="badges-editor slide-in">
                      <button className="add-btn" onClick={() => {
                        setData(prev => ({
                          ...prev,
                          badges: {
                            ...prev.badges,
                            [selectedBadgeCategory]: [...prev.badges[selectedBadgeCategory], { imgSrc: '', imgAlt: 'New Badge' }]
                          }
                        }))
                      }}>
                        <Plus size={16} />
                        Add Badge
                      </button>
                      <div className="badges-grid">
                        {data.badges[selectedBadgeCategory].map((badge, index) => (
                          <div key={index} className="badge-card">
                            <div className="badge-preview">
                              {badge.imgSrc ? (
                                <img
                                  src={badge.imgSrc}
                                  alt={badge.imgAlt}
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                    e.target.nextSibling.style.display = 'flex'
                                  }}
                                  onLoad={(e) => {
                                    e.target.style.display = 'block'
                                    e.target.nextSibling.style.display = 'none'
                                  }}
                                />
                              ) : null}
                              <div className="placeholder" style={{ display: badge.imgSrc ? 'none' : 'flex' }}>
                                No Image
                              </div>
                            </div>
                            <div className="badge-inputs">
                              <input
                                type="text"
                                value={badge.imgAlt}
                                onChange={(e) => {
                                  setData(prev => {
                                    const newBadges = [...prev.badges[selectedBadgeCategory]]
                                    newBadges[index].imgAlt = e.target.value
                                    return {
                                      ...prev,
                                      badges: { ...prev.badges, [selectedBadgeCategory]: newBadges }
                                    }
                                  })
                                }}
                                placeholder="Badge name"
                              />
                              <input
                                type="text"
                                value={badge.imgSrc}
                                onChange={(e) => {
                                  setData(prev => {
                                    const newBadges = [...prev.badges[selectedBadgeCategory]]
                                    newBadges[index].imgSrc = e.target.value
                                    return {
                                      ...prev,
                                      badges: { ...prev.badges, [selectedBadgeCategory]: newBadges }
                                    }
                                  })
                                }}
                                placeholder="Image URL"
                              />
                              <button className="delete-btn" onClick={() => {
                                setData(prev => ({
                                  ...prev,
                                  badges: {
                                    ...prev.badges,
                                    [selectedBadgeCategory]: prev.badges[selectedBadgeCategory].filter((_, i) => i !== index)
                                  }
                                }))
                              }}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeSection === 'social' && (
            <div className="section-content fade-in">
              <div className="section-content fade-in">
                <div className="section-header">
                  <h1 className="section-title">Social Links</h1>
                  <button className="add-btn" onClick={() => {
                    const newIndex = data.social.length
                    setData(prev => ({
                      ...prev,
                      social: [...prev.social, { name: 'New Platform', url: '', imgSrc: '', alt: '', width: 40 }]
                    }))
                    setSelectedSocial(newIndex)
                  }}>
                    <Plus size={16} />
                    Add Social Link
                  </button>
                </div>

                {data.social.length > 0 && (
                  <div className="projects-layout">
                    <div className="projects-list">
                      {data.social.map((social, index) => (
                        <div
                          key={index}
                          className={`project-item ${selectedSocial === index ? 'active' : ''}`}
                          onClick={() => setSelectedSocial(index)}
                        >
                          <span className="project-name">{social.name || 'Untitled'}</span>
                          <button
                            className="delete-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              setData(prev => ({
                                ...prev,
                                social: prev.social.filter((_, i) => i !== index)
                              }))
                              setSelectedSocial(Math.max(0, index - 1))
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {data.social[selectedSocial] && (
                      <div className="project-editor slide-in">
                        <div className="input-group">
                          <label>Platform Name</label>
                          <input
                            type="text"
                            value={data.social[selectedSocial].name}
                            onChange={(e) => {
                              setData(prev => {
                                const newSocial = [...prev.social]
                                newSocial[selectedSocial].name = e.target.value
                                return { ...prev, social: newSocial }
                              })
                            }}
                          />
                        </div>

                        <div className="input-group">
                          <label>Profile URL</label>
                          <input
                            type="text"
                            value={data.social[selectedSocial].url}
                            onChange={(e) => {
                              setData(prev => {
                                const newSocial = [...prev.social]
                                newSocial[selectedSocial].url = e.target.value
                                return { ...prev, social: newSocial }
                              })
                            }}
                          />
                        </div>

                        <div className="input-group">
                          <label>Icon URL</label>
                          <div className="icon-input-group">
                            <input
                              type="text"
                              value={data.social[selectedSocial].imgSrc}
                              onChange={(e) => {
                                setData(prev => {
                                  const newSocial = [...prev.social]
                                  newSocial[selectedSocial].imgSrc = e.target.value
                                  return { ...prev, social: newSocial }
                                })
                              }}
                            />
                            {data.social[selectedSocial].imgSrc && (
                              <div className="icon-preview">
                                <img
                                  src={data.social[selectedSocial].imgSrc}
                                  alt="Icon preview"
                                  onError={(e) => e.target.style.display = 'none'}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="input-group">
                          <label>Alt Text</label>
                          <input
                            type="text"
                            value={data.social[selectedSocial].alt}
                            onChange={(e) => {
                              setData(prev => {
                                const newSocial = [...prev.social]
                                newSocial[selectedSocial].alt = e.target.value
                                return { ...prev, social: newSocial }
                              })
                            }}
                          />
                        </div>

                        <div className="input-group">
                          <label>Icon Width (px)</label>
                          <input
                            type="number"
                            value={data.social[selectedSocial].width}
                            onChange={(e) => {
                              setData(prev => {
                                const newSocial = [...prev.social]
                                newSocial[selectedSocial].width = parseInt(e.target.value) || 40
                                return { ...prev, social: newSocial }
                              })
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'education' && (
            <div className="section-content fade-in">
              <div className="section-header">
                <h1 className="section-title">Education</h1>
                <button className="add-btn" onClick={() => {
                  const newIndex = data.education.length
                  setData(prev => ({
                    ...prev,
                    education: [...prev.education, { period: '', degree: '', institution: '', percentage: null }]
                  }))
                  setSelectedEducation(newIndex)
                }}>
                  <Plus size={16} />
                  Add Education
                </button>
              </div>

              <div className="projects-layout">
                <div className="projects-list">
                  {data.education.map((edu, index) => (
                    <div
                      key={index}
                      className={`project-item ${selectedEducation === index ? 'active' : ''}`}
                      onClick={() => setSelectedEducation(index)}
                    >
                      <div>
                        <div className="project-name">{edu.degree || 'Untitled'}</div>
                        <div className="project-subtitle">{edu.period}</div>
                      </div>
                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          setData(prev => ({
                            ...prev,
                            education: prev.education.filter((_, i) => i !== index)
                          }))
                          setSelectedEducation(Math.max(0, index - 1))
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {data.education[selectedEducation] && (
                  <div className="project-editor slide-in">
                    <div className="input-group">
                      <label>Period</label>
                      <input
                        type="text"
                        value={data.education[selectedEducation].period}
                        onChange={(e) => {
                          setData(prev => {
                            const newEducation = [...prev.education]
                            newEducation[selectedEducation].period = e.target.value
                            return { ...prev, education: newEducation }
                          })
                        }}
                        placeholder="2024-2028"
                      />
                    </div>

                    <div className="input-group">
                      <label>Degree</label>
                      <input
                        type="text"
                        value={data.education[selectedEducation].degree}
                        onChange={(e) => {
                          setData(prev => {
                            const newEducation = [...prev.education]
                            newEducation[selectedEducation].degree = e.target.value
                            return { ...prev, education: newEducation }
                          })
                        }}
                        placeholder="Bachelor of Technology"
                      />
                    </div>

                    <div className="input-group">
                      <label>Institution</label>
                      <input
                        type="text"
                        value={data.education[selectedEducation].institution}
                        onChange={(e) => {
                          setData(prev => {
                            const newEducation = [...prev.education]
                            newEducation[selectedEducation].institution = e.target.value
                            return { ...prev, education: newEducation }
                          })
                        }}
                        placeholder="University Name"
                      />
                    </div>

                    <div className="input-group">
                      <label>Percentage (optional)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={data.education[selectedEducation].percentage || ''}
                        onChange={(e) => {
                          setData(prev => {
                            const newEducation = [...prev.education]
                            newEducation[selectedEducation].percentage = e.target.value ? parseFloat(e.target.value) : null
                            return { ...prev, education: newEducation }
                          })
                        }}
                        placeholder="91.4"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'contact' && (
            <div className="section-content fade-in">
              <h1 className="section-title">Contact Information</h1>

              <div className="input-group">
                <label>Section Title</label>
                <input
                  type="text"
                  value={data.contact.title}
                  onChange={(e) => updateData('contact.title', e.target.value)}
                  placeholder="Contact Me"
                />
              </div>

              <div className="input-group">
                <label>Button Text</label>
                <input
                  type="text"
                  value={data.contact.button.text}
                  onChange={(e) => updateData('contact.button.text', e.target.value)}
                  placeholder="Send an Email"
                />
              </div>

              <div className="input-group">
                <label>Button URL</label>
                <input
                  type="text"
                  value={data.contact.button.url}
                  onChange={(e) => updateData('contact.button.url', e.target.value)}
                  placeholder="mailto:email@example.com"
                />
              </div>

              <div className="section-header">
                <h2 style={{ color: 'var(--text-color)', margin: 0 }}>Contact Information Items</h2>
                <button className="add-btn" onClick={() => {
                  const newIndex = data.contact.info.length
                  setData(prev => ({
                    ...prev,
                    contact: {
                      ...prev.contact,
                      info: [...prev.contact.info, { text: 'New Contact Info', url: '' }]
                    }
                  }))
                  setSelectedContact(newIndex)
                }}>
                  <Plus size={16} />
                  Add Info
                </button>
              </div>

              <div className="projects-layout">
                <div className="projects-list">
                  {data.contact.info.map((info, index) => (
                    <div
                      key={index}
                      className={`project-item ${selectedContact === index ? 'active' : ''}`}
                      onClick={() => setSelectedContact(index)}
                    >
                      <span className="project-name">{info.text || 'Untitled'}</span>
                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          setData(prev => ({
                            ...prev,
                            contact: {
                              ...prev.contact,
                              info: prev.contact.info.filter((_, i) => i !== index)
                            }
                          }))
                          setSelectedContact(Math.max(0, index - 1))
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {data.contact.info[selectedContact] && (
                  <div className="project-editor slide-in">
                    <div className="input-group">
                      <label>Text</label>
                      <input
                        type="text"
                        value={data.contact.info[selectedContact].text}
                        onChange={(e) => {
                          setData(prev => {
                            const newInfo = [...prev.contact.info]
                            newInfo[selectedContact].text = e.target.value
                            return {
                              ...prev,
                              contact: { ...prev.contact, info: newInfo }
                            }
                          })
                        }}
                        placeholder="Name: Krishna Singh"
                      />
                    </div>

                    <div className="input-group">
                      <label>URL (optional)</label>
                      <input
                        type="text"
                        value={data.contact.info[selectedContact].url || ''}
                        onChange={(e) => {
                          setData(prev => {
                            const newInfo = [...prev.contact.info]
                            newInfo[selectedContact].url = e.target.value
                            return {
                              ...prev,
                              contact: { ...prev.contact, info: newInfo }
                            }
                          })
                        }}
                        placeholder="mailto:email@example.com"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'journey' && (
            <div className="section-content fade-in">
              <div className="section-header">
                <h1 className="section-title">Developer Journey</h1>
                <button className="add-btn" onClick={() => {
                  const newIndex = data.journey.length
                  setData(prev => ({
                    ...prev,
                    journey: [...prev.journey, {
                      year: 'New Phase',
                      duration: '',
                      title: 'New Journey Entry',
                      subtitle: '',
                      summary: '',
                      sections: []
                    }]
                  }))
                  setSelectedJourney(newIndex)
                }}>
                  <Plus size={16} />
                  Add Journey Entry
                </button>
              </div>

              <div className="journey-cards">
                {data.journey.map((journey, index) => (
                  <div
                    key={index}
                    className={`journey-card ${selectedJourney === index ? 'active' : ''}`}
                    onClick={() => setSelectedJourney(index)}
                  >
                    <div className="journey-header">
                      <h3>{journey.year}</h3>
                      <span className="journey-duration">{journey.duration}</span>
                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          setData(prev => ({
                            ...prev,
                            journey: prev.journey.filter((_, i) => i !== index)
                          }))
                          setSelectedJourney(Math.max(0, index - 1))
                        }}
                      >
                        ×
                      </button>
                    </div>
                    <h4>{journey.title}</h4>
                    <p>{journey.subtitle}</p>
                    <div className="journey-summary">{journey.summary}</div>
                  </div>
                ))}
              </div>

              {data.journey[selectedJourney] && (
                <div className="journey-editor slide-in">
                  <div className="input-group">
                    <label>Year/Phase</label>
                    <input
                      type="text"
                      value={data.journey[selectedJourney].year}
                      onChange={(e) => {
                        setData(prev => {
                          const newJourney = [...prev.journey]
                          newJourney[selectedJourney].year = e.target.value
                          return { ...prev, journey: newJourney }
                        })
                      }}
                      placeholder="Back to Square One"
                    />
                  </div>

                  <div className="input-group">
                    <label>Duration</label>
                    <input
                      type="text"
                      value={data.journey[selectedJourney].duration}
                      onChange={(e) => {
                        setData(prev => {
                          const newJourney = [...prev.journey]
                          newJourney[selectedJourney].duration = e.target.value
                          return { ...prev, journey: newJourney }
                        })
                      }}
                      placeholder="May 2024"
                    />
                  </div>

                  <div className="input-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={data.journey[selectedJourney].title}
                      onChange={(e) => {
                        setData(prev => {
                          const newJourney = [...prev.journey]
                          newJourney[selectedJourney].title = e.target.value
                          return { ...prev, journey: newJourney }
                        })
                      }}
                      placeholder="Retracing the Steps"
                    />
                  </div>

                  <div className="input-group">
                    <label>Subtitle</label>
                    <input
                      type="text"
                      value={data.journey[selectedJourney].subtitle}
                      onChange={(e) => {
                        setData(prev => {
                          const newJourney = [...prev.journey]
                          newJourney[selectedJourney].subtitle = e.target.value
                          return { ...prev, journey: newJourney }
                        })
                      }}
                      placeholder="12th Completed - Back to JAVA The Base"
                    />
                  </div>

                  <div className="input-group">
                    <label>Summary</label>
                    <textarea
                      value={data.journey[selectedJourney].summary}
                      onChange={(e) => {
                        setData(prev => {
                          const newJourney = [...prev.journey]
                          newJourney[selectedJourney].summary = e.target.value
                          return { ...prev, journey: newJourney }
                        })
                      }}
                      placeholder="Brief summary of this journey phase..."
                      rows={3}
                    />
                  </div>

                  <div className="sections-editor">
                    <div className="tech-header">
                      <label>Journey Sections</label>
                      <button className="add-tech-btn" onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (isAdding) return
                        setIsAdding(true)

                        setData(prev => {
                          const newJourney = [...prev.journey]
                          if (newJourney[selectedJourney] && newJourney[selectedJourney].sections) {
                            newJourney[selectedJourney].sections.push({
                              title: 'New Section',
                              content: '',
                              type: 'paragraph'
                            })
                          }
                          return { ...prev, journey: newJourney }
                        })

                        setTimeout(() => setIsAdding(false), 300)
                      }} disabled={isAdding}>
                        <Plus size={14} />
                        Add Section
                      </button>
                    </div>

                    {data.journey[selectedJourney].sections.map((section, sectionIndex) => (
                      <div key={sectionIndex} className="section-item">
                        <div className="section-controls">
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) => {
                              setData(prev => {
                                const newJourney = [...prev.journey]
                                newJourney[selectedJourney].sections[sectionIndex].title = e.target.value
                                return { ...prev, journey: newJourney }
                              })
                            }}
                            placeholder="Section title"
                          />
                          <select
                            value={section.type}
                            onChange={(e) => {
                              setData(prev => {
                                const newJourney = [...prev.journey]
                                newJourney[selectedJourney].sections[sectionIndex].type = e.target.value
                                return { ...prev, journey: newJourney }
                              })
                            }}
                          >
                            <option value="paragraph">Paragraph</option>
                            <option value="list">List</option>
                          </select>
                          <button
                            className="delete-btn"
                            onClick={() => {
                              setData(prev => {
                                const newJourney = [...prev.journey]
                                newJourney[selectedJourney].sections = newJourney[selectedJourney].sections.filter((_, i) => i !== sectionIndex)
                                return { ...prev, journey: newJourney }
                              })
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <textarea
                          value={section.content}
                          onChange={(e) => {
                            setData(prev => {
                              const newJourney = [...prev.journey]
                              newJourney[selectedJourney].sections[sectionIndex].content = e.target.value
                              return { ...prev, journey: newJourney }
                            })
                          }}
                          placeholder="Section content..."
                          rows={4}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      <BlogEditor
        isOpen={blogEditorOpen}
        onClose={closeBlogEditor}
        projectData={currentProject}
        onSave={saveBlogContent}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText={confirmDialog.type === 'delete' ? 'Delete' : 'Confirm'}
      />

      {loading && <LoadingSpinner overlay text="Processing..." />}
    </>
  )
}

export default InteractiveEditor