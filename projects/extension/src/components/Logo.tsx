import React from "react"

interface LogoProps {
  textSize?: "sm" | "base" | "lg" | "xl" | "2xl"
  cName?: string
}

const Logo = ({ textSize, cName }: LogoProps) => {
  const c = `${
    textSize ? `text-${textSize}` : ""
  } font-poppins font-semibold text-black drop-shadow-lg `
  return (
    <div className={cName ? c.concat(cName) : c}>
      substrate
      <span className="text-green-500 drop-shadow-lg">_</span>&nbsp;
      <span className="font-normal font-inter drop-shadow-lg">connect</span>
    </div>
  )
}

export default Logo
