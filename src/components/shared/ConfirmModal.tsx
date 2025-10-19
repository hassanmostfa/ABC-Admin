"use client";
import React from "react";
import { Icon } from "@iconify/react";
import { Spinner } from "flowbite-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  type?: "danger" | "warning" | "info";
}

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  isLoading = false,
  type = "danger",
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case "danger":
        return {
          iconBg: "bg-error",
          icon: "solar:danger-circle-bold",
          confirmBtn: "bg-error hover:bg-error/90",
        };
      case "warning":
        return {
          iconBg: "bg-warning",
          icon: "solar:danger-triangle-bold",
          confirmBtn: "bg-warning hover:bg-warning/90",
        };
      case "info":
        return {
          iconBg: "bg-info",
          icon: "solar:info-circle-bold",
          confirmBtn: "bg-info hover:bg-info/90",
        };
      default:
        return {
          iconBg: "bg-error",
          icon: "solar:danger-circle-bold",
          confirmBtn: "bg-error hover:bg-error/90",
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white dark:bg-darkgray rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300">
        {/* Icon Section */}
        <div className="flex flex-col items-center pt-8 pb-6 px-6">
          <div
            className={`h-20 w-20 rounded-full ${colors.iconBg} flex items-center justify-center mb-6 animate-pulse`}
          >
            <Icon icon={colors.icon} height={40} className="text-white" />
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-dark dark:text-white mb-3 text-center">
            {title}
          </h3>

          {/* Message */}
          <p className="text-base text-ld dark:text-white/80 text-center leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 rounded-lg border border-ld text-dark dark:text-white font-semibold hover:bg-lightgray dark:hover:bg-darkgray transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-3 rounded-lg ${colors.confirmBtn} text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {isLoading ? (
              <>
                <Spinner size="sm" />
                جاري الحذف...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

