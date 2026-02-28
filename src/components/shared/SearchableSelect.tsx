"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import { useGetProductByIdQuery, useGetProductsQuery } from "@/store/api/productsApi";
import { useGetAllCategoriesQuery } from "@/store/api/categoriesApi";
import { useGetSubcategoriesQuery } from "@/store/api/subcategoriesApi";
import { useTranslation } from "react-i18next";

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
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const searchPlaceholder = isArabic ? `ابحث في ${placeholder}...` : `Search ${placeholder}...`;
  const allCategoriesLabel = isArabic ? "كل الأقسام" : "All Categories";
  const allSubcategoriesLabel = isArabic ? "كل الأقسام الفرعية" : "All Subcategories";
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState(0);
  const [subcategoryFilter, setSubcategoryFilter] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentPage(1);
  }, [debouncedSearchTerm, categoryFilter, subcategoryFilter, isOpen]);

  // Fetch products with search + pagination + filters
  const {
    data: productsData,
    isLoading,
    isFetching,
  } = useGetProductsQuery(
    {
      search: debouncedSearchTerm || undefined,
      page: currentPage,
      per_page: 18,
      category_id: type === "product" ? (categoryFilter || undefined) : undefined,
      subcategory_id: type === "product" ? (subcategoryFilter || undefined) : undefined,
    },
    { skip: type !== "product" }
  );

  const {
    data: selectedProductData,
    isLoading: isLoadingSelectedProduct,
  } = useGetProductByIdQuery(value, { skip: type !== "product" || value <= 0 });

  const {
    data: parentProductData,
    isLoading: isLoadingParentProduct,
  } = useGetProductByIdQuery(parentProductId || 0, { skip: type !== "variant" || !parentProductId });

  const { data: categoriesData } = useGetAllCategoriesQuery(undefined, { skip: type !== "product" || !isOpen });
  const { data: subcategoriesData } = useGetSubcategoriesQuery(
    { page: 1, per_page: 100, category_id: categoryFilter || undefined },
    { skip: type !== "product" || !isOpen }
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
        setCurrentPage(1);
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

  const options = useMemo(() => {
    if (type === "product") {
      return (
        productsData?.data?.map((product: any) => ({
        id: product.id,
        name: isArabic
          ? (product.name_ar || product.name_en || `#${product.id}`)
          : (product.name_en || product.name_ar || `#${product.id}`),
        image: product.image || product.variants?.[0]?.image || null,
        size: undefined,
      })) || []
      );
    }

    if (type === "variant" && parentProductData?.data) {
      return (
        parentProductData.data.variants?.map((variant: any) => ({
        id: variant.id,
        name: variant.size || variant.name_ar || variant.name_en || variant.name,
        image: variant.image,
        size: variant.size,
      })) || []
      );
    }

    return [];
  }, [type, productsData?.data, parentProductData?.data]);

  const selectedOption = useMemo(() => {
    const found = options.find((option) => option.id === value);
    if (found) return found;

    if (type === "product" && selectedProductData?.data && value > 0) {
      return {
        id: selectedProductData.data.id,
        name: isArabic
          ? (selectedProductData.data.name_ar || selectedProductData.data.name_en || `#${selectedProductData.data.id}`)
          : (selectedProductData.data.name_en || selectedProductData.data.name_ar || `#${selectedProductData.data.id}`),
        image: (selectedProductData.data as any).image || (selectedProductData.data as any).variants?.[0]?.image || null,
        size: undefined,
      };
    }

    return undefined;
  }, [options, value, type, selectedProductData?.data, isArabic]);

  // If we have a value but no selected option, it means the data is still loading
  const isValueLoading =
    value > 0 &&
    !selectedOption &&
    (isLoading || isFetching || isLoadingSelectedProduct || isLoadingParentProduct);

  const handleSelect = (option: typeof options[0]) => {
    onChange(option.id);
    setIsOpen(false);
    setSearchTerm("");
    setCurrentPage(1);
    setCategoryFilter(0);
    setSubcategoryFilter(0);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm("");
      setCurrentPage(1);
      setCategoryFilter(0);
      setSubcategoryFilter(0);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm("");
    setCurrentPage(1);
    setCategoryFilter(0);
    setSubcategoryFilter(0);
  };

  const pagination = productsData?.pagination;
  const canGoPrev = Boolean(pagination && pagination.current_page > 1);
  const canGoNext = Boolean(pagination && pagination.current_page < pagination.last_page);
  const visiblePages = useMemo(() => {
    if (!pagination) return [];
    const total = pagination.last_page;
    const current = pagination.current_page;
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    const pages: number[] = [];
    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }
    return pages;
  }, [pagination]);

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

      {/* Product Modal */}
      {isOpen && type === "product" && (
        <div
          className="fixed inset-0 z-[999] bg-black/40 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div
            className="w-full max-w-7xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">{placeholder}</h3>
              <button
                type="button"
                onClick={handleClose}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Icon icon="solar:close-circle-bold" height={20} className="text-gray-500" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
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
                  placeholder={searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                />
                {(isLoading || isFetching) && (
                  <Icon
                    icon="solar:refresh-bold"
                    height={16}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin"
                  />
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  const nextCategory = parseInt(e.target.value) || 0;
                  setCategoryFilter(nextCategory);
                  setSubcategoryFilter(0);
                }}
                className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value={0}>{allCategoriesLabel}</option>
                {(categoriesData?.data || []).map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {isArabic ? (category.name_ar || category.name_en) : (category.name_en || category.name_ar)}
                  </option>
                ))}
              </select>
              <select
                value={subcategoryFilter}
                onChange={(e) => setSubcategoryFilter(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value={0}>{allSubcategoriesLabel}</option>
                {(subcategoriesData?.data || []).map((subcategory: any) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {isArabic ? (subcategory.name_ar || subcategory.name_en) : (subcategory.name_en || subcategory.name_ar)}
                  </option>
                ))}
              </select>
            </div>

            {/* Options List */}
            <div className="h-[30rem] overflow-y-auto">
              {isLoading ? (
                <div className="px-4 py-4 text-sm text-gray-500 text-center">
                  جاري البحث...
                </div>
              ) : options.length > 0 ? (
                <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 auto-rows-[14.5rem]">
                  {options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`h-full text-left border rounded-lg overflow-hidden transition-all hover:shadow-md ${
                        value === option.id
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-primary/60"
                      }`}
                      onClick={() => handleSelect(option)}
                    >
                      <div className="w-full h-44 bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                        {option.image ? (
                          <img
                            src={option.image}
                            alt={option.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Icon icon="solar:gallery-bold" height={26} className="text-gray-400" />
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium text-gray-900 dark:text-white line-clamp-2">
                          {option.name}
                        </p>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-[11px] text-gray-500">#{option.id}</span>
                          {value === option.id && (
                            <Icon
                              icon="solar:check-circle-bold"
                              height={16}
                              className="text-primary"
                            />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-4 text-sm text-gray-500 text-center">
                  {searchTerm ? "لا توجد نتائج" : "لا توجد عناصر"}
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  عرض {pagination.from ?? 0} - {pagination.to ?? 0} من {pagination.total ?? 0}
                </span>
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(1)}
                    disabled={!canGoPrev}
                    className="px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    الأولى
                  </button>
                  <button
                    type="button"
                    onClick={() => canGoPrev && setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={!canGoPrev}
                    className="px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    السابق
                  </button>

                  {visiblePages.map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-8 px-2.5 py-1.5 text-xs rounded-md border ${
                        page === pagination.current_page
                          ? "bg-primary text-white border-primary"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => canGoNext && setCurrentPage((p) => p + 1)}
                    disabled={!canGoNext}
                    className="px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    التالي
                  </button>
                  <button
                    type="button"
                    onClick={() => pagination && setCurrentPage(pagination.last_page)}
                    disabled={!canGoNext}
                    className="px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    الأخيرة
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Variant Dropdown */}
      {isOpen && type === "variant" && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-[30rem] overflow-hidden">
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
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              />
              {(isLoading || isFetching) && (
                <Icon
                  icon="solar:refresh-bold"
                  height={16}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin"
                />
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto">
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
                        {isArabic ? "الشده" : "Pack of"}: {option.size}
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
