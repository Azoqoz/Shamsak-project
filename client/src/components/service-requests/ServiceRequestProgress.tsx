import React from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  Clock,
  UserCheck,
  Wrench,
  CheckCircle2,
  XCircle,
  CreditCard,
} from "lucide-react";
import { ServiceRequest } from "@shared/schema";

// Map of status to step number (1-indexed)
const STATUS_STEP_MAP = {
  pending: 1,
  assigned: 2,
  in_progress: 3,
  completed: 4,
  paid: 5,
  cancelled: -1, // Special case
};

interface ServiceRequestProgressProps {
  serviceRequest: ServiceRequest;
  className?: string;
}

const ServiceRequestProgress: React.FC<ServiceRequestProgressProps> = ({
  serviceRequest,
  className,
}) => {
  const { t } = useTranslation();
  const currentStep = STATUS_STEP_MAP[serviceRequest.status as keyof typeof STATUS_STEP_MAP] || 1;

  // If cancelled, we show a different UI
  if (serviceRequest.status === "cancelled") {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-center">
          <div className="bg-red-100 p-3 rounded-full">
            <XCircle className="h-6 w-6 text-red-500" />
          </div>
        </div>
        <p className="text-center text-red-500 font-medium">
          {t("serviceRequests.cancelled")}
        </p>
        <p className="text-center text-sm text-neutral-500">
          {t("serviceRequests.cancelledExplanation")}
        </p>
      </div>
    );
  }

  // Define the steps for the progress tracker
  const steps = [
    {
      label: t("serviceRequests.pending"),
      description: t("serviceRequests.pendingDescription"),
      icon: Clock,
      status: currentStep >= 1 ? "complete" : "upcoming",
    },
    {
      label: t("serviceRequests.assigned"),
      description: t("serviceRequests.assignedDescription"),
      icon: UserCheck,
      status: currentStep >= 2 ? "complete" : "upcoming",
    },
    {
      label: t("serviceRequests.inProgress"),
      description: t("serviceRequests.inProgressDescription"),
      icon: Wrench,
      status: currentStep >= 3 ? "complete" : "upcoming",
    },
    {
      label: t("serviceRequests.completed"),
      description: t("serviceRequests.completedDescription"),
      icon: CheckCircle2,
      status: currentStep >= 4 ? "complete" : "upcoming",
    },
    {
      label: t("serviceRequests.paid"),
      description: t("serviceRequests.paidDescription"),
      icon: CreditCard,
      status: currentStep >= 5 ? "complete" : "upcoming",
    },
  ];

  // Current active step (1-indexed)
  const activeStep = currentStep;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {/* Step circle with icon */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "rounded-full flex items-center justify-center w-10 h-10 mb-2",
                  index + 1 < activeStep
                    ? "bg-green-100"
                    : index + 1 === activeStep
                    ? "bg-primary text-white"
                    : "bg-neutral-100"
                )}
              >
                {index + 1 < activeStep ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <step.icon
                    className={cn(
                      "h-5 w-5",
                      index + 1 === activeStep
                        ? "text-white"
                        : "text-neutral-500"
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium text-center",
                  index + 1 <= activeStep
                    ? "text-primary"
                    : "text-neutral-500"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line between steps */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5",
                  index + 1 < activeStep
                    ? "bg-primary"
                    : "bg-neutral-100"
                )}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Description for the current step */}
      <div className="text-center px-4">
        <p className="text-sm text-neutral-600">
          {steps[activeStep - 1]?.description}
        </p>
      </div>
    </div>
  );
};

export default ServiceRequestProgress;