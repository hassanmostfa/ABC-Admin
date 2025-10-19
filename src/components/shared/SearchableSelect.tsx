"use client";
import React, { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useGetProductsQuery } from "@/store/api/productsApi";

interface SearchableSelectProps {
  value: number;
  onChange: (value: number) => void;
  placeholder: string;
  className?: string;
  showImage?: boolean;
  showSize?: boolean;
  type: 'product' | 'variant';
  parentProductId?: number; // For variant selection
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  placeholder,
  className = "",
  showImage = false,
  showSize = false,
  type,
  parentProductId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Trigger initial search if we have a value but no search term
  useEffect(() => {
    if (value > 0 && !searchTerm && !debouncedSearchTerm) {
      setDebouncedSearchTerm("");
    }
  }, [value, searchTerm, debouncedSearchTerm]);

  // Fetch products with search
  const { data: productsData, isLoading } = useGetProductsQuery({
    search: debouncedSearchTerm || (value > 0 ? "" : undefined),
    page: 1,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Get options based on type
  const getOptions = () => {
    if (type === 'product') {
      return productsData?.data?.map((product: any) => ({
        id: product.id,
        name: product.name_ar,
        image: product.image,
        size: undefined
      })) || [];
    } else if (type === 'variant' && parentProductId) {
      const parentProduct = productsData?.data?.find((p: any) => p.id === parentProductId);
      return parentProduct?.variants?.map((variant: any) => ({
        id: variant.id,
        name: variant.size || variant.name_ar || variant.name_en || variant.name,
        image: variant.image,
        size: variant.size
      })) || [];
    }
    return [];
  };

  const options = getOptions();
  const selectedOption = options.find((option) => option.id === value);

  // If we have a value but no selected option, it means the data is still loading
  const isValueLoading = value > 0 && !selectedOption && isLoading;

  const handleSelect = (option: typeof options[0]) => {
    onChange(option.id);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm("");
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Value Display */}
      <div
        className="flex items-center justify-between w-full py-2 px-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md cursor-pointer hover:border-primary dark:hover:border-primary transition-colors"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-2">
          {showImage && selectedOption?.image && (
            <img
              src={selectedOption.image}
              alt={selectedOption.name}
              className="w-6 h-6 object-cover rounded"
            />
          )}
          <span className="text-sm text-gray-900 dark:text-white">
            {selectedOption ? (
              <>
                {selectedOption.name}
                {showSize && selectedOption.size && (
                  <span className="text-gray-500 ml-2">({selectedOption.size})</span>
                )}
              </>
            ) : isValueLoading ? (
              <span className="text-gray-500">جاري التحميل...</span>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </span>
        </div>
        <Icon
          icon={isOpen ? "solar:alt-arrow-up-bold" : "solar:alt-arrow-down-bold"}
          height={16}
          className="text-gray-500"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Icon
                icon="solar:magnifer-bold"
                height={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`ابحث في ${placeholder}...`}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              />
              {isLoading && (
                <Icon
                  icon="solar:refresh-bold"
                  height={16}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin"
                />
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-2 text-sm text-gray-500 text-center">
                جاري البحث...
              </div>
            ) : options.length > 0 ? (
              options.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => handleSelect(option)}
                >
                  {showImage && option.image && (
                    <img
                      src={option.image}
                      alt={option.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {option.name}
                    </div>
                    {showSize && option.size && (
                      <div className="text-xs text-gray-500">
                        الحجم: {option.size}
                      </div>
                    )}
                  </div>
                  {value === option.id && (
                    <Icon
                      icon="solar:check-circle-bold"
                      height={16}
                      className="text-primary"
                    />
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500 text-center">
                {searchTerm ? "لا توجد نتائج" : "لا توجد عناصر"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
