"use client";
import React, { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";

interface Option {
  id: number;
  label: string;
  value?: any;
}

interface GenericSearchableSelectProps {
  value: number;
  onChange: (value: number) => void;
  placeholder: string;
  options: Option[];
  className?: string;
  error?: boolean;
  direction?: "ltr" | "rtl";
  disabled?: boolean;
  allowZero?: boolean; // Allow 0 as a valid selection
}

const GenericSearchableSelect: React.FC<GenericSearchableSelectProps> = ({
  value,
  onChange,
  placeholder,
  options,
  className = "",
  error = false,
  direction = "ltr",
  disabled = false,
  allowZero = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = (value > 0 || (allowZero && value === 0)) ? options.find((option) => option.id === value) : null;

  const handleSelect = (option: Option) => {
    onChange(option.id);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm("");
      }
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full px-3 py-2 text-right border rounded-lg bg-white dark:bg-darkgray text-dark dark:text-white ${
          error ? "border-error" : "border-ld"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} flex items-center justify-between`}
        style={{ direction }}
      >
        <span className={selectedOption ? "text-dark dark:text-white" : "text-ld dark:text-white/70"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <Icon
          icon={isOpen ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear"}
          height={20}
          className="text-ld dark:text-white/70"
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-darkgray border border-ld rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-ld">
            <div className="relative">
              <Icon
                icon="solar:magnifer-bold"
                height={18}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ld dark:text-white/70"
              />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={placeholder}
                className="w-full pr-10 pl-3 py-2 border border-ld rounded-lg bg-white dark:bg-darkgray text-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ direction }}
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-ld dark:text-white/70 text-center">
                No results found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full px-4 py-2 text-right text-sm hover:bg-lightprimary dark:hover:bg-darkprimary transition-colors ${
                    value === option.id ? "bg-lightprimary dark:bg-darkprimary font-medium" : ""
                  }`}
                  style={{ direction }}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenericSearchableSelect;

