import { useForm, SubmitHandler } from "react-hook-form"
import { rpc } from "../api"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Layout2 } from "@/components/Layout2"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowLeft, EyeOffIcon, EyeIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { Header } from "../components"

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters long"),
    newPasswordConfirm: z.string(),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    message: "New password and confirm new password must match",
    path: ["newPasswordConfirm"],
  })

type FormFields = z.infer<typeof changePasswordSchema>

export const ChangePassword = () => {
  const navigate = useNavigate()

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)

  const form = useForm<FormFields>({
    resolver: zodResolver(changePasswordSchema),
  })
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
    control,
    setError,
  } = form

  const onSubmit: SubmitHandler<FormFields> = async ({
    currentPassword,
    newPassword,
  }) => {
    try {
      await rpc.client.changePassword(currentPassword, newPassword)
      reset()
      navigate("/debug")
    } catch {
      setError("currentPassword", {
        type: "server",
        message: "Current password is incorrect",
      })
    }
  }

  return (
    <Layout2>
      <Header />
      <Form {...form}>
        <Card className="flex flex-col flex-grow w-full max-w-md shadow-none">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Use this form to securely update your password.
            </CardDescription>
          </CardHeader>
          <form className="relative grow" onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="content-center flex-grow">
              <FormField
                control={control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem className="grid gap-2 mb-4">
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showCurrentPassword ? "text" : "password"}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                          variant="ghost"
                          size="sm"
                          aria-label="Toggle current password visibility"
                        >
                          {showCurrentPassword ? (
                            <EyeOffIcon className="w-4 h-4" />
                          ) : (
                            <EyeIcon className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem className="grid gap-2 mb-4">
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showNewPassword ? "text" : "password"}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                          variant="ghost"
                          size="sm"
                          aria-label="Toggle new password visibility"
                        >
                          {showCurrentPassword ? (
                            <EyeOffIcon className="w-4 h-4" />
                          ) : (
                            <EyeIcon className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="newPasswordConfirm"
                render={({ field }) => (
                  <FormItem className="grid gap-2 mb-4">
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirmNewPassword ? "text" : "password"}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          onClick={() =>
                            setShowConfirmNewPassword(!showConfirmNewPassword)
                          }
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                          variant="ghost"
                          size="sm"
                          aria-label="Toggle confirm new password visibility"
                        >
                          {showCurrentPassword ? (
                            <EyeOffIcon className="w-4 h-4" />
                          ) : (
                            <EyeIcon className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col flex-grow space-y-4">
              <Button
                type="submit"
                className={cn(
                  "w-full py-3",
                  "text-lg text-background",
                  "bg-emerald-600 hover:bg-emerald-700",
                )}
              >
                Submit
              </Button>
              <Button
                type="button"
                disabled={isSubmitting}
                autoFocus
                className={cn(
                  "w-full py-3",
                  "text-lg text-emerald-700",
                  "bg-emerald-100 hover:bg-emerald-200",
                )}
                onClick={() => navigate("/debug")}
              >
                <ArrowLeft
                  className="w-5 h-5 mr-2 text-emerald-500"
                  aria-hidden="true"
                />
                Go Back
              </Button>
            </CardFooter>
          </form>
        </Card>
      </Form>
    </Layout2>
  )
}
