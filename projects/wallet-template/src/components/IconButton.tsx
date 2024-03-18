import { ButtonHTMLAttributes } from "react"

export const IconButton: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({
  onClick,
  children,
  className,
}) => (
  <button
    onClick={onClick}
    className={`text-gray-600 mx-2 hover:text-gray-500 ${className}`}
  >
    {children}
  </button>
)
