import './LoadingSpinner.css'

function LoadingSpinner({ size = 'medium', text = 'Loading...', overlay = false }) {
  const Component = overlay ? 'div' : 'span'
  const className = overlay ? 'loading-overlay' : 'loading-inline'
  
  return (
    <Component className={className}>
      <div className={`loading-spinner ${size}`}>
        <div className="spinner-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        {text && <span className="loading-text">{text}</span>}
      </div>
    </Component>
  )
}

export default LoadingSpinner