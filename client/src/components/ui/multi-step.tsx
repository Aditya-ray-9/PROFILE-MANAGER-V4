import { cn } from "@/lib/utils";

interface Step {
  title: string;
  description?: string;
}

interface MultiStepProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export default function MultiStep({ steps, currentStep, className }: MultiStepProps) {
  return (
    <div className={cn("flex items-center", className)}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center relative">
          {/* Step Circle */}
          <div 
            className={cn(
              "rounded-full h-8 w-8 flex items-center justify-center",
              index <= currentStep
                ? "bg-neon-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            )}
          >
            {index + 1}
          </div>
          
          {/* Step Label */}
          <div className="absolute top-0 -ml-4 text-xs font-medium mt-10 w-16 text-center">
            <span
              className={cn(
                index <= currentStep
                  ? "text-neon-500"
                  : "text-gray-500 dark:text-gray-400"
              )}
            >
              {step.title}
            </span>
          </div>
          
          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div 
              className={cn(
                "flex-auto border-t-2 mx-2",
                index < currentStep
                  ? "border-neon-500"
                  : "border-gray-200 dark:border-gray-700"
              )}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
}
