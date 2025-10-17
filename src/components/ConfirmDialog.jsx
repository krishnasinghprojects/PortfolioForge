import { X, AlertTriangle, Trash2, Info } from 'lucide-react'
import './ConfirmDialog.css'

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, type = 'danger', confirmText = 'Confirm', cancelText = 'Cancel' }) {
  if (!isOpen) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle size={24} className="danger-icon" />
      case 'delete':
        return <Trash2 size={24} className="delete-icon" />
      case 'info':
        return <Info size={24} className="info-icon" />
      default:
        return <AlertTriangle size={24} className="danger-icon" />
    }
  }

  return (
    <div className="confirm-dialog-overlay" onClick={handleOverlayClick}>
      <div className="confirm-dialog-container glassmorphic">
        <div className="confirm-dialog-header">
          <div className="confirm-dialog-icon">
            {getIcon()}
          </div>
          <button className="confirm-dialog-close glassmorphic-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="confirm-dialog-content">
          <h3 className="confirm-dialog-title">{title}</h3>
          <p className="confirm-dialog-message">{message}</p>
        </div>
        
        <div className="confirm-dialog-actions">
          <button 
            className="confirm-dialog-btn cancel-btn glassmorphic-btn" 
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button 
            className={`confirm-dialog-btn confirm-btn glassmorphic-btn ${type}`} 
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog