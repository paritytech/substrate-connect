import React, { useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { CheckCircle, UploadIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

type FormFields = {
  rawChainSpec: string
}

const formSchema = z.object({
  rawChainSpec: z
    .string({ required_error: "Raw Chain Spec is required" })
    .min(1, "Chain Spec is empty")
    .trim(),
})

export namespace AddChainSpec {
  export type Props = {
    addChainSpec: (rawChainSpec: string) => Promise<void>
  }
}

type InputMethod = "upload" | "paste" | (string & {})

export const AddChainSpec: React.FC<AddChainSpec.Props> = ({
  addChainSpec,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rawChainSpec: "",
    },
  })
  const {
    handleSubmit,
    formState: { isSubmitting, errors, isSubmitted, isSubmitSuccessful },
  } = form
  const [inputMethod, setInputMethod] = useState<InputMethod>("paste")

  const onSubmit: SubmitHandler<FormFields> = async ({
    rawChainSpec: chainSpec,
  }) => {
    await addChainSpec(chainSpec)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allow a Chain Spec</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 mb-4">
              <RadioGroup
                value={inputMethod}
                onValueChange={setInputMethod}
                className="mb-4"
              >
                <div className="flex items-center mb-2">
                  <RadioGroupItem value="paste" />
                  <Label className="ml-2 text-foreground">
                    Paste Chain Spec JSON
                  </Label>
                </div>
                <div className="flex items-center">
                  <RadioGroupItem value="upload" />
                  <Label className="ml-2 text-foreground">
                    Upload Chain Spec File
                  </Label>
                </div>
              </RadioGroup>
              {inputMethod === "paste" && (
                <FormField
                  control={form.control}
                  name="rawChainSpec"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paste Chain Spec JSON</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste your chainspec JSON here..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {inputMethod === "upload" && (
                <FormField
                  control={form.control}
                  name="rawChainSpec"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>Upload Chain Spec File</FormLabel>
                      <FormControl>
                        <Input
                          {...fieldProps}
                          type="file"
                          onChange={async (event) =>
                            onChange(
                              event.target.files &&
                                (await event.target.files[0].text()),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                <UploadIcon className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </div>
          </form>
        </Form>
        {isSubmitted && isSubmitSuccessful && (
          <p className="mt-2 text-center text-primary">
            <CheckCircle className="inline-block mr-2" />
            Chain specification submitted successfully.
          </p>
        )}
        {isSubmitted && !isSubmitSuccessful && errors && (
          <p className="mt-2 text-center text-destructive">
            Error submitting chain specification.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
