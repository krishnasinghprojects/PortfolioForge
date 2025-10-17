import { useState, useEffect, useMemo } from 'react'
import { X, Eye, EyeOff, Save } from 'lucide-react'
import CustomMarkdownParser from './CustomMarkdownParser'
import MarkdownTextarea from './MarkdownTextarea'
import './BlogEditor.css'

function BlogEditor({ isOpen, onClose, projectData, onSave }) {
  const [content, setContent] = useState('')
  const [showPreview, setShowPreview] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Initialize custom markdown parser
  const markdownParser = useMemo(() => new CustomMarkdownParser(), [])
  
  // Parse markdown content for preview
  const parsedContent = useMemo(() => {
    if (!content.trim()) return ''
    return markdownParser.parse(content)
  }, [content, markdownParser])

  useEffect(() => {
    if (isOpen && projectData) {
      // Handle markdown string with escape characters
      const blogContent = projectData.blogContent || ''
      
      // Check if content is already properly formatted or needs unescaping
      let unescapedContent = blogContent
      
      // Only unescape if it contains escaped characters
      if (blogContent.includes('\\n') || blogContent.includes('\\"') || blogContent.includes("\\'")) {
        unescapedContent = blogContent
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/\\'/g, "'")
          .replace(/\\\\/g, '\\')
      }
      
      setContent(unescapedContent)
    }
  }, [isOpen, projectData])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Save content as-is (no need to escape for JSON storage)
      await onSave(content)
    } catch (error) {
      console.error('Error saving blog content:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e) => {
    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.target.selectionStart
      const end = e.target.selectionEnd
      const newContent = content.substring(0, start) + '  ' + content.substring(end)
      setContent(newContent)
      
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2
      }, 0)
    }
    
    // Save with Ctrl+S
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault()
      handleSave()
    }
  }

  if (!isOpen) return null

  return (
    <div className="blog-editor-overlay">
      <div className="blog-editor-container">
        <div className="blog-editor-header">
          <div className="blog-editor-title">
            <h2>Blog Editor - {projectData?.name || 'Project'}</h2>
            <p>Write your blog content in Markdown format</p>
          </div>
          <div className="blog-editor-actions">
            <button
              className="preview-toggle-btn"
              onClick={() => setShowPreview(!showPreview)}
              title={showPreview ? 'Hide Preview' : 'Show Preview'}
            >
              {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <button
              className="save-btn"
              onClick={handleSave}
              disabled={saving}
              title="Save (Ctrl+S)"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              className="close-btn"
              onClick={onClose}
              title="Close Editor"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className={`blog-editor-content ${showPreview ? 'split-view' : 'full-editor'}`}>
          <div className="editor-panel">
            <div className="editor-toolbar">
              <span>Markdown Editor</span>
              <div className="editor-shortcuts">
                <span>Ctrl+S to save</span>
                <span>Tab for indent</span>
              </div>
            </div>
            <MarkdownTextarea
              className="blog-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`# ${projectData?.name || 'Project Title'}

## Overview
Write a brief overview of your project here.

## Features
- Feature 1: Description
- Feature 2: Description
- Feature 3: Description

## Technical Implementation

### Frontend
Describe the frontend technologies and implementation.

### Backend
Describe the backend architecture and technologies.

\`\`\`javascript
// Code example
const example = {
  technology: 'React',
  purpose: 'User Interface'
}
\`\`\`

## Challenges & Solutions
Describe any challenges you faced and how you solved them.

## Results & Impact
Explain the results and impact of your project.

## Future Enhancements
- Enhancement 1
- Enhancement 2

## Conclusion
Wrap up your blog post with key takeaways.`}
            />
          </div>

          {showPreview && (
            <div className="preview-panel">
              <div className="preview-toolbar">
                <span>Live Preview</span>
                <div className="preview-info">
                  <span>{content.length} characters</span>
                  <span>{content.split('\n').length} lines</span>
                </div>
              </div>
              <div className="preview-content blog-content">
                {parsedContent ? (
                  <div 
                    className="custom-markdown-preview"
                    dangerouslySetInnerHTML={{ __html: parsedContent }}
                  />
                ) : (
                  <div className="preview-empty">
                    <p>Start writing to see the preview...</p>
                    <div className="markdown-features">
                      <h4>Supported Features:</h4>
                      <ul>
                        <li><strong>Images with width:</strong> ![alt](url "width:300px")</li>
                        <li><strong>Glass button links:</strong> [Text](url)</li>
                        <li><strong>Code blocks:</strong> ```language</li>
                        <li><strong>All standard markdown</strong></li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BlogEditor