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
    <div className={cn("relative pt-6 pb-8", className)}>
      <div className="flex items-center justify-center w-full">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center relative" style={{ width: `${100 / steps.length}%` }}>
            {/* Step Circle */}
            <div 
              className={cn(
                "rounded-full h-8 w-8 flex items-center justify-center z-10",
                index <= currentStep
                  ? "bg-neon-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              )}
            >
              {index + 1}
            </div>
            
            {/* Step Label - Now positioned below with enough spacing */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium w-24 text-center">
              <span
                className={cn(
                  index <= currentStep
                    ? "text-neon-500 font-semibold"
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
                  "flex-auto border-t-2 w-full",
                  index < currentStep
                    ? "border-neon-500"
                    : "border-gray-200 dark:border-gray-700"
                )}
              ></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
