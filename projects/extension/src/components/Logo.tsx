import * as React from "react"

interface LogoProps {
  textSize?: "sm" | "base" | "lg" | "xl" | "2xl"
}

const Logo = ({ textSize }: LogoProps) => {
  return (
    <div
      className={`${
        textSize ? `text-${textSize}` : ""
      } font-semibold text-black font-poppins drop-shadow-lg`}
    >
      substrate
      <span className="text-green-500 drop-shadow-lg">_</span>&nbsp;
      <span className="font-normal font-inter drop-shadow-lg">connect</span>
    </div>
  )
}

export default Logo
