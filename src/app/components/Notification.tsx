// components/Notification.tsx
import React from "react";
import { NotificationState } from "@/types";

interface NotificationProps {
  notification: NotificationState;
}

const Notification: React.FC<NotificationProps> = ({ notification }) => {
  if (!notification.show) return null;

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "ℹ️";
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case "success":
        return "border-l-green-500";
      case "error":
        return "border-l-red-500";
      case "warning":
        return "border-l-yellow-500";
      case "info":
        return "border-l-blue-500";
      default:
        return "border-l-blue-500";
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case "success":
        return "bg-green-50";
      case "error":
        return "bg-red-50";
      case "warning":
        return "bg-yellow-50";
      case "info":
        return "bg-blue-50";
      default:
        return "bg-blue-50";
    }
  };

  return (
    <div
      className={`fixed top-6 right-6 z-50 transform transition-all duration-300 ${
        notification.show
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`glass-container p-4 min-w-[300px] max-w-md border-l-4 ${getBorderColor()} ${getBackgroundColor()}`}
      >
        <div className="flex items-start gap-3">
          <span className="text-xl">{getIcon()}</span>
          <div className="flex-1">
            <p className="text-gray-800 font-medium">{notification.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;
