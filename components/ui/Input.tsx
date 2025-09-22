import React, { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const baseStyles = 'px-4 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-black w-full'
    const errorStyles = error ? 'border-red focus:ring-red' : ''
    const combinedClassName = `${baseStyles} ${errorStyles} ${className}`
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={props.id} className="block text-sm font-medium mb-1">
            {label}
          </label>
        )}
        <input ref={ref} className={combinedClassName} {...props} />
        {error && <p className="text-red text-sm mt-1">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
