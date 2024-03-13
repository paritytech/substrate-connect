import { CheckCircle } from "lucide-react"

const range = (start: number, end: number) => {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

type StepIndicatorProps = {
  currentStep: number
  steps: number
}

export const StepIndicator = ({ currentStep, steps }: StepIndicatorProps) => (
  <div className="flex justify-center my-6 space-x-4">
    {range(1, Math.max(1, steps)).map((step) => (
      <div
        key={step}
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          currentStep >= step
            ? "bg-teal-500 text-white"
            : "bg-gray-200 text-gray-500"
        }`}
      >
        {currentStep > step ? <CheckCircle size="20" /> : step}
      </div>
    ))}
  </div>
)
