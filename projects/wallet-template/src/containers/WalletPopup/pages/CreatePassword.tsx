import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

import { type SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { Layout2 } from "@/components/Layout2"
import { useNavigate } from "react-router-dom"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Navigate } from "react-router-dom"

import { rpc } from "../api"
import { useKeyring } from "../hooks"

const FormSchema = z
  .object({
    password: z
      .string({ required_error: "You must specify a password" })
      .min(6, "Password must have at least 6 characters"),
    confirmPassword: z.string({
      required_error: "Confirm Password is required",
    }),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "The passwords do not match",
      })
    }
  })

export const CreatePassword = () => {
  const navigate = useNavigate()
  const keyring = useKeyring()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isSubmitSuccessful },
  } = form

  const onSubmit: SubmitHandler<z.infer<typeof FormSchema>> = async ({
    password,
  }) => {
    await rpc.client.createPassword(password)
    await keyring.refresh()
    reset()
  }

  return (
    <Layout2>
      {isSubmitSuccessful && <Navigate to="/accounts" replace={true} />}
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="flex flex-col flex-grow w-full max-w-md min-h-full rounded-none lg:rounded">
            <CardHeader className="text-center">
              <CardTitle className="mt-6 text-2xl font-extrabold">
                Create Password<span className="text-primary">_</span>
                <br />
              </CardTitle>
              <CardDescription className="mt-2 text-sm">
                We recommend creating a strong password that is at least 6
                characters long and includes a mix of uppercase and lowercase
                letters, numbers, and special characters.
              </CardDescription>
            </CardHeader>
            <CardContent className="content-center flex-grow">
              <FormField
                control={control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem className="grid w-full max-w-sm items-center gap-1.5 my-4">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    {fieldState.invalid && fieldState.error?.message && (
                      <span className="text-xs text-red-500">
                        {fieldState.error?.message}
                      </span>
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <FormItem className="grid w-full max-w-sm items-center gap-1.5 my-4">
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    {fieldState.invalid && fieldState.error?.message && (
                      <span className="text-xs text-red-500">
                        {fieldState.error?.message}
                      </span>
                    )}
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
                Create Wallet
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
                onClick={() => navigate("/welcome")}
              >
                <ArrowLeft
                  className="w-5 h-5 mr-2 text-emerald-500"
                  aria-hidden="true"
                />
                Go Back
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </Layout2>
  )
}
