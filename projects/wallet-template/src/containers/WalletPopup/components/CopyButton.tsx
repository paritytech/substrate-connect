import { Button, ButtonProps } from "@/components/ui/button"
import { CheckIcon, CopyIcon } from "lucide-react"
import { useState } from "react"
import { useDebounceCallback } from "usehooks-ts"

export namespace CopyButton {
  export interface Props extends ButtonProps {
    text: string
    copyResetDelayMs?: number
  }
}

const COPY_RESET_DELAY_MS = 2000

export const CopyButton: React.FC<CopyButton.Props> = ({
  text,
  onClick,
  copyResetDelayMs,
  ...props
}) => {
  const [isCopied, setIsCopied] = useState(false)
  const setIsCopiedDebounced = useDebounceCallback(
    setIsCopied,
    copyResetDelayMs ?? COPY_RESET_DELAY_MS,
  )

  const copy = () => {
    copyToClipboard(text)
    setIsCopied(true)
    setIsCopiedDebounced(false)
  }

  return (
    <Button
      variant={isCopied ? "ghost" : "outline"}
      size="sm"
      onClick={(e) => {
        copy()
        onClick?.(e)
      }}
      {...props}
    >
      {isCopied ? (
        <>
          <CheckIcon className="w-4 h-4 mr-2" />
          Copied
        </>
      ) : (
        <>
          <CopyIcon className="w-4 h-4 mr-2" />
          Copy JSON
        </>
      )}
    </Button>
  )
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}
