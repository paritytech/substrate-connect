import { useKeyring } from "../hooks"
import { Layout2 } from "@/components/Layout2"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { EyeIcon, EyeOffIcon, LayersIcon } from "lucide-react"
import { useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { cn } from "@/lib/utils"

type FormInputs = {
  password: string
}

export const UnlockKeyring = () => {
  const { unlock } = useKeyring()
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>()
  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    try {
      await unlock(data.password)
    } catch (e) {
      setError("password", { message: "Wrong password" })
    }
  }

  return (
    <Layout2>
      <div
        className={cn(
          "flex flex-col items-center justify-center",
          "h-full px-4 py-12 space-y-8",
          "bg-foreground text-primary-foreground",
        )}
      >
        <CardHeader className="text-center">
          <CardTitle className="mt-6 text-2xl leading-4">
            <span className="pl-4 font-semibold">
              substrate
              <span className="text-primary">_</span>
            </span>
            <br />
            <span className="text-5xl font-extrabold text-primary">
              Connect
            </span>
          </CardTitle>
        </CardHeader>

        <main className="w-full max-w-sm p-8 mx-auto border rounded-lg shadow-md border-opacity-20">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  disabled={isSubmitting}
                  className={cn(
                    "pr-10 text-foreground",
                    errors.password
                      ? "focus:ring-destructive border-destructive"
                      : "focus:ring-primary",
                  )}
                  placeholder="Enter your password"
                  {...register("password", {
                    required: true,
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive-foreground">Invalid Password</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              Unlock Wallet
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button
              variant="link"
              className="text-muted/80 hover:text-muted/60"
            >
              <LayersIcon className="w-5 h-5 mr-2" />
              Access Networks
            </Button>
          </div>
        </main>

        <footer className="text-xs text-center text-muted/90">
          <p>Zero-friction</p>
          <p>In-browser</p>
          <p>Embeddable Light-clients</p>
        </footer>
      </div>
    </Layout2>
  )
}
