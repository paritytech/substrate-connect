import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { useState, useEffect } from "react"
import "./App.css"

import { getSmoldotExtensionProviders } from "@substrate/smoldot-discovery"
import type { ProviderDetail } from "@substrate/discovery"

function App() {
  const [providerDetails, setProviderDetails] = useState<ProviderDetail[]>([])

  useEffect(() => {
    setProviderDetails(getSmoldotExtensionProviders())
  }, [])

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Provider Details</CardTitle>
          <CardDescription>List of Smoldot Extension Providers</CardDescription>
        </CardHeader>
        <CardContent>
          {providerDetails.map((provider, index) => (
            <div key={index} className="flex items-center mb-4 space-x-4">
              <Avatar>
                <AvatarImage
                  src={provider.info.icon}
                  alt={provider.info.name}
                />
                <AvatarFallback>{provider.info.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{provider.info.name}</h3>
                <p>
                  <strong>UUID:</strong> {provider.info.uuid}
                </p>
                <p>
                  <strong>RDNS:</strong> {provider.info.rdns}
                </p>
                <p>
                  <strong>Kind:</strong> {provider.kind}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  )
}

export default App
