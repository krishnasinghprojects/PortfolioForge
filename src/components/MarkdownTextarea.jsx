import { useRef } from 'react'
import './MarkdownTextarea.css'

function MarkdownTextarea({ value, onChange, onKeyDown, placeholder, className }) {
  const textareaRef = useRef(null)

  return (
    <div className="markdown-textarea-container">
      <textarea
        ref={textareaRef}
        className={`markdown-textarea-enhanced ${className || ''}`}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        spellCheck={false}
      />
    </div>
  )
}

export default MarkdownTextarea