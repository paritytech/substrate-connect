import React from "react"

interface LogoProps {
  textSize?: "sm" | "base" | "lg" | "xl" | "2xl"
  cName?: string
}

const Logo = ({ textSize, cName }: LogoProps) => {
  const c = `${
    textSize ? `text-${textSize}` : ""
  } font-poppins font-semibold text-black `
  return (
    <div className={cName ? c.concat(cName) : c}>
      substrate
      <span className="text-green-500">_</span>&nbsp;
      <span className="font-normal font-inter">connect</span>
    </div>
  )
}

export default Logo
