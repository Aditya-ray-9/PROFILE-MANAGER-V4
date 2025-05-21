import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  message: string;
  description?: string;
  icon: string;
  actionLabel: string;
  onAction?: () => void;
}

export default function EmptyState({
  message,
  description = "Get started by creating a new profile. You can add personal information, documents, and more.",
  icon,
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <div className="py-16 flex flex-col items-center text-center">
      <div className="h-20 w-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
        <i className={`${icon} text-3xl text-gray-400 dark:text-gray-500`}></i>
      </div>
      <h3 className="text-lg font-medium mb-1">{message}</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-4">
        {description}
      </p>
      {onAction ? (
        <Button onClick={onAction}>
          <i className="ri-add-line mr-2"></i>
          {actionLabel}
        </Button>
      ) : (
        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          {actionLabel}
        </div>
      )}
    </div>
  );
}
