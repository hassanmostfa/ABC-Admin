"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Icon } from "@iconify/react";

type NotificationType = "success" | "error" | "warning" | "info";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  showNotification: (
    type: NotificationType,
    title: string,
    message: string,
    duration?: number
  ) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (
    type: NotificationType,
    title: string,
    message: string,
    duration: number = 3000
  ) => {
    const id = Math.random().toString(36).substring(7);
    setNotification({ id, type, title, message, duration });

    if (duration > 0) {
      setTimeout(() => {
        setNotification(null);
      }, duration);
    }
  };

  const hideNotification = () => {
    setNotification(null);
  };

  const getIcon = () => {
    switch (notification?.type) {
      case "success":
        return "solar:check-circle-bold";
      case "error":
        return "solar:close-circle-bold";
      case "warning":
        return "solar:danger-triangle-bold";
      case "info":
        return "solar:info-circle-bold";
      default:
        return "solar:info-circle-bold";
    }
  };

  const getColors = () => {
    switch (notification?.type) {
      case "success":
        return {
          bg: "bg-lightsuccess dark:bg-darksuccess",
          text: "text-success",
          iconBg: "bg-success",
        };
      case "error":
        return {
          bg: "bg-lighterror dark:bg-darkerror",
          text: "text-error",
          iconBg: "bg-error",
        };
      case "warning":
        return {
          bg: "bg-lightwarning dark:bg-darkwarning",
          text: "text-warning",
          iconBg: "bg-warning",
        };
      case "info":
        return {
          bg: "bg-lightinfo dark:bg-darkinfo",
          text: "text-info",
          iconBg: "bg-info",
        };
      default:
        return {
          bg: "bg-lightinfo dark:bg-darkinfo",
          text: "text-info",
          iconBg: "bg-info",
        };
    }
  };

  const colors = getColors();

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}

      {/* Notification Overlay */}
      {notification && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={hideNotification}
          />

          {/* Notification Card */}
          <div className="relative bg-white dark:bg-darkgray rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300">
            {/* Icon Section */}
            <div className="flex flex-col items-center pt-8 pb-6 px-6">
              <div
                className={`h-20 w-20 rounded-full ${colors.iconBg} flex items-center justify-center mb-6 animate-bounce`}
              >
                <Icon icon={getIcon()} height={40} className="text-white" />
              </div>

              {/* Title */}
              <h3 className={`text-2xl font-bold ${colors.text} mb-3 text-center`}>
                {notification.title}
              </h3>

              {/* Message */}
              <p className="text-base text-ld dark:text-white/80 text-center leading-relaxed">
                {notification.message}
              </p>
            </div>

            {/* Action Buttons */}
            <div className={`${colors.bg} px-6 py-4 rounded-b-2xl`}>
              <button
                onClick={hideNotification}
                className={`w-full py-3 rounded-lg ${colors.iconBg} text-white font-semibold hover:opacity-90 transition-opacity`}
              >
                حسناً
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

