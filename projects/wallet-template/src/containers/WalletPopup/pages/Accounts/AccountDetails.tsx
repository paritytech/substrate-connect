import { ArrowLeft, CheckIcon, ClipboardIcon } from "lucide-react"
import * as clipboard from "@zag-js/clipboard"
import { useMachine, normalizeProps } from "@zag-js/react"
import React, { useId } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Layout2 } from "@/components/Layout2"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BottomNavBar, Header } from "../../components"

export const AccountDetails: React.FC = () => {
  const navigate = useNavigate()
  const { accountId } = useParams<{ accountId: string }>()
  const [state, send] = useMachine(
    clipboard.machine({
      id: useId(),
      value: accountId,
    }),
  )

  const api = clipboard.connect(state, send, normalizeProps)

  if (!accountId) {
    return null
  }

  return (
    <Layout2>
      <Header />
      <Card className="bg-card text-card-foreground border-border grow">
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription className="text-muted-foreground">
            Click the button to copy the address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="p-4 space-y-1 rounded-lg bg-muted text-muted-foreground">
            <p
              className="font-mono text-sm break-all"
              aria-label="Account Address"
            >
              {accountId}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="flex items-center mt-2"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
          <Button
            className={`mt-2 flex items-center`}
            aria-label="Copy to clipboard"
            {...api.triggerProps}
          >
            {api.isCopied ? (
              <CheckIcon className="w-5 h-5 mr-2" />
            ) : (
              <ClipboardIcon className="w-5 h-5 mr-2" />
            )}
            {api.isCopied ? "Copied" : "Copy"}
          </Button>
        </CardFooter>
      </Card>

      <BottomNavBar currentItem="home" />
    </Layout2>
  )
}
