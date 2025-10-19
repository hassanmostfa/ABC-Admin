"use client";
import React, { useState, useRef } from "react";
import { Card, Label, TextInput, Spinner, Select, Textarea, Button } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useCreateProductMutation } from "@/store/api/productsApi";
import { useGetAllCategoriesQuery } from "@/store/api/categoriesApi";
import { useGetSubcategoriesByCategoryQuery } from "@/store/api/subcategoriesApi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/app/context/NotificationContext";
import Image from "next/image";

interface ProductVariant {
  id: string;
  image: File | null;
  imagePreview: string | null;
  size: string;
  sku: string;
  short_item: string;
  quantity: number;
  price: number;
  is_active: boolean;
}

const AddProduct = () => {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  
  const [currentStep, setCurrentStep] = useState(1);
  const isSubmittingRef = useRef(false);
  const [formData, setFormData] = useState({
    name_en: "",
    name_ar: "",
    category_id: 0,
    subcategory_id: 0,
    description_en: "",
    description_ar: "",
    sku: "",
    is_active: true,
  });
  
  const { data: categoriesData } = useGetAllCategoriesQuery();
  
  const { data: subcategoriesData } = useGetSubcategoriesByCategoryQuery(formData.category_id, {
    skip: !formData.category_id || formData.category_id === 0,
  });
  
  const [variants, setVariants] = useState<ProductVariant[]>([
    {
      id: "1",
      image: null,
      imagePreview: null,
      size: "",
      sku: "",
      short_item: "",
      quantity: 0,
      price: 0,
      is_active: true,
    }
  ]);
  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [variantErrors, setVariantErrors] = useState<Record<string, Record<string, string>>>({});

  // Step validation functions
  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name_en.trim()) {
      errors.name_en = "يرجى إدخال اسم المنتج بالإنجليزية";
    }
    if (!formData.name_ar.trim()) {
      errors.name_ar = "يرجى إدخال اسم المنتج بالعربية";
    }
    if (!formData.category_id || formData.category_id === 0) {
      errors.category_id = "يرجى اختيار التصنيف الرئيسي";
    }
    if (!formData.subcategory_id || formData.subcategory_id === 0) {
      errors.subcategory_id = "يرجى اختيار التصنيف الفرعي";
    }
    if (!formData.sku.trim()) {
      errors.sku = "يرجى إدخال رمز المنتج";
    }
    
    setFieldErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    console.log('Step 1 validation:', { errors, isValid, formData });
    return isValid;
  };

  const validateStep2 = () => {
    let hasVariantErrors = false;
    const newVariantErrors: Record<string, Record<string, string>> = {};

    variants.forEach((variant) => {
      const variantErrors: Record<string, string> = {};
      
      if (!variant.size.trim()) {
        variantErrors.size = "يرجى إدخال الحجم";
        hasVariantErrors = true;
      }
      if (!variant.sku.trim()) {
        variantErrors.sku = "يرجى إدخال رمز المتغير";
        hasVariantErrors = true;
      }
      if (!variant.short_item.trim()) {
        variantErrors.short_item = "يرجى إدخال اسم المتغير";
        hasVariantErrors = true;
      }
      if (variant.quantity <= 0) {
        variantErrors.quantity = "يرجى إدخال كمية صحيحة";
        hasVariantErrors = true;
      }
      if (variant.price <= 0) {
        variantErrors.price = "يرجى إدخال سعر صحيح";
        hasVariantErrors = true;
      }
      
      if (Object.keys(variantErrors).length > 0) {
        newVariantErrors[variant.id] = variantErrors;
      }
    });

    setVariantErrors(newVariantErrors);
    return !hasVariantErrors;
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep === 1) {
      const isValid = validateStep1();
      if (!isValid) {
        showNotification("error", "خطأ!", "يرجى تصحيح الأخطاء قبل المتابعة");
        return; // Don't proceed to next step
      }
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Reset subcategory when category changes
    if (name === 'category_id') {
      setFormData((prev) => ({ 
        ...prev, 
        category_id: parseInt(value),
        subcategory_id: 0 
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) }));
    }
    
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleToggleChange = () => {
    setFormData((prev) => ({ ...prev, is_active: !prev.is_active }));
  };

  const handleVariantChange = (variantId: string, field: keyof ProductVariant, value: any) => {
    setVariants(prev => prev.map(variant => 
      variant.id === variantId 
        ? { ...variant, [field]: value }
        : variant
    ));
    
    // Clear variant errors
    if (variantErrors[variantId]?.[field]) {
      setVariantErrors(prev => ({
        ...prev,
        [variantId]: {
          ...prev[variantId],
          [field]: ""
        }
      }));
    }
  };

  const handleVariantImageChange = (variantId: string, file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      showNotification("error", "خطأ!", "يرجى اختيار صورة بصيغة JPEG, JPG, PNG, WebP أو GIF");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showNotification("error", "خطأ!", "حجم الصورة يجب أن لا يتجاوز 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      handleVariantChange(variantId, 'imagePreview', e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    handleVariantChange(variantId, 'image', file);
  };

  const removeVariantImage = (variantId: string) => {
    handleVariantChange(variantId, 'image', null);
    handleVariantChange(variantId, 'imagePreview', null);
  };

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      image: null,
      imagePreview: null,
      size: "",
      sku: "",
      short_item: "",
      quantity: 0,
      price: 0,
      is_active: true,
    };
    setVariants(prev => [...prev, newVariant]);
  };

  const removeVariant = (variantId: string) => {
    if (variants.length > 1) {
      setVariants(prev => prev.filter(variant => variant.id !== variantId));
      // Remove variant errors
      setVariantErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[variantId];
        return newErrors;
      });
    } else {
      showNotification("error", "خطأ!", "يجب أن يكون هناك على الأقل متغير واحد");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Completely prevent form submission on Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      console.log('Enter key prevented - current step:', currentStep);
      return false;
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Form submit triggered - Step:', currentStep, 'isSubmitting:', isSubmittingRef.current);
    
    // Only allow submission on step 2 and if not already submitting
    if (currentStep !== 2 || isSubmittingRef.current) {
      console.log('Form submission prevented - not on step 2, current step:', currentStep);
      return false;
    }
    
    // Set the submitting flag
    isSubmittingRef.current = true;
    
    // Call the actual submit handler
    handleSubmit(e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('handleSubmit called - Step:', currentStep);
    
    // Only allow submission on step 2
    if (currentStep !== 2) {
      isSubmittingRef.current = false;
      return;
    }
    
    // Validate step 2 (variants)
    if (!validateStep2()) {
      showNotification("error", "خطأ!", "يرجى تصحيح الأخطاء في المتغيرات");
      return;
    }

    // Create FormData
    const data = new FormData();
    
    // Add main product data
    data.append('name_en', formData.name_en.trim());
    data.append('name_ar', formData.name_ar.trim());
    data.append('category_id', formData.category_id.toString());
    data.append('subcategory_id', formData.subcategory_id.toString());
    data.append('description_en', formData.description_en.trim());
    data.append('description_ar', formData.description_ar.trim());
    data.append('sku', formData.sku.trim());
    data.append('is_active', formData.is_active ? '1' : '0');

    // Add variants
    variants.forEach((variant, index) => {
      data.append(`variants[${index}][size]`, variant.size.trim());
      data.append(`variants[${index}][sku]`, variant.sku.trim());
      data.append(`variants[${index}][short_item]`, variant.short_item.trim());
      data.append(`variants[${index}][quantity]`, variant.quantity.toString());
      data.append(`variants[${index}][price]`, variant.price.toString());
      data.append(`variants[${index}][is_active]`, variant.is_active ? '1' : '0');
      
      if (variant.image) {
        data.append(`variants[${index}][image]`, variant.image);
      }
    });

    // Log FormData contents for debugging
    console.log('Form submission - Step:', currentStep);
    console.log('Description fields being sent:');
    console.log('description_en:', formData.description_en);
    console.log('description_ar:', formData.description_ar);
    
    for (const [key, value] of data.entries()) {
      console.log(`FormData ${key}:`, value);
    }

    try {
      const result = await createProduct(data).unwrap();
      showNotification("success", "تم!", "تم إنشاء المنتج بنجاح");
      router.push('/products');
    } catch (err: any) {
      console.error("Create product error:", err);
      let errorMessage = "حدث خطأ أثناء إنشاء المنتج";
      if (err.status === 422 && err.data?.errors) {
        const errors = err.data.errors;
        const fieldErrors: Record<string, string> = {};
        
        // Handle main product errors
        Object.keys(errors).forEach(key => {
          if (!key.includes('variants')) {
            fieldErrors[key] = errors[key][0];
          }
        });
        
        setFieldErrors(fieldErrors);
        errorMessage = Object.values(fieldErrors).join("، ") || errorMessage;
      }
      showNotification("error", "خطأ!", errorMessage);
    } finally {
      // Reset the submitting flag
      isSubmittingRef.current = false;
    }
  };

  const isSubmitting = creating;

  // Stepper component
  const Stepper = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          {/* Step 1 */}
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= 1 
                ? 'bg-primary border-primary text-white' 
                : 'border-gray-300 text-gray-500'
            }`}>
              <Icon icon="solar:tag-bold" height={20} />
            </div>
            <div className="mr-3 rtl:mr-0 rtl:ml-3">
              <p className={`text-sm font-medium ${currentStep >= 1 ? 'text-primary' : 'text-gray-500'}`}>
                المعلومات الأساسية
              </p>
            </div>
          </div>
          
          {/* Connector */}
          <div className={`w-16 h-0.5 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-300'}`}></div>
          
          {/* Step 2 */}
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= 2 
                ? 'bg-primary border-primary text-white' 
                : 'border-gray-300 text-gray-500'
            }`}>
              <Icon icon="solar:layers-bold" height={20} />
            </div>
            <div className="mr-3 rtl:mr-0 rtl:ml-3">
              <p className={`text-sm font-medium ${currentStep >= 2 ? 'text-primary' : 'text-gray-500'}`}>
                المتغيرات
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/products">
              <button className="h-10 w-10 rounded-full hover:bg-lightprimary dark:hover:bg-darkprimary flex items-center justify-center transition-colors">
                <Icon icon="solar:arrow-right-bold" height={20} className="text-dark dark:text-white" />
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-dark dark:text-white">إضافة منتج جديد</h1>
          </div>
          <p className="text-sm text-ld mr-12">قم بإنشاء منتج جديد مع متغيراته</p>
        </div>
      </div>

      {/* Stepper */}
      <Stepper />

      {/* Step 1: Basic Product Information - NOT a form */}
      {currentStep === 1 && (
        <div>
          <Card>
            <h3 className="text-xl font-semibold text-dark dark:text-white mb-6">معلومات المنتج الأساسية</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* English Name */}
            <div>
              <Label htmlFor="name_en" className="mb-2 block">اسم المنتج (الإنجليزية) <span className="text-error">*</span></Label>
              <TextInput 
                id="name_en" 
                name="name_en" 
                placeholder="Enter product name in English" 
                value={formData.name_en} 
                onChange={handleInputChange} 
                required 
                icon={() => <Icon icon="solar:tag-bold" height={18} />} 
              />
              {fieldErrors.name_en ? (
                <p className="mt-1 text-xs text-error">{fieldErrors.name_en}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">اسم المنتج باللغة الإنجليزية</p>
              )}
            </div>

            {/* Arabic Name */}
            <div>
              <Label htmlFor="name_ar" className="mb-2 block">اسم المنتج (العربية) <span className="text-error">*</span></Label>
              <TextInput 
                id="name_ar" 
                name="name_ar" 
                placeholder="أدخل اسم المنتج بالعربية" 
                value={formData.name_ar} 
                onChange={handleInputChange} 
                required 
                icon={() => <Icon icon="solar:tag-bold" height={18} />} 
                dir="rtl"
              />
              {fieldErrors.name_ar ? (
                <p className="mt-1 text-xs text-error">{fieldErrors.name_ar}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">اسم المنتج باللغة العربية</p>
              )}
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category_id" className="mb-2 block">التصنيف الرئيسي <span className="text-error">*</span></Label>
              <Select 
                id="category_id" 
                name="category_id" 
                value={formData.category_id}
                onChange={handleSelectChange}
                required
                className="select-md"
              >
                <option value={0}>اختر التصنيف الرئيسي</option>
                {categoriesData?.data?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name_ar} - {category.name_en}
                  </option>
                ))}
              </Select>
              {fieldErrors.category_id ? (
                <p className="mt-1 text-xs text-error">{fieldErrors.category_id}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">اختر التصنيف الرئيسي للمنتج</p>
              )}
            </div>

            {/* Subcategory */}
            <div>
              <Label htmlFor="subcategory_id" className="mb-2 block">التصنيف الفرعي <span className="text-error">*</span></Label>
              <Select 
                id="subcategory_id" 
                name="subcategory_id" 
                value={formData.subcategory_id}
                onChange={handleSelectChange}
                required
                className="select-md"
                disabled={!formData.category_id || formData.category_id === 0}
              >
                <option value={0}>اختر التصنيف الفرعي</option>
                {subcategoriesData?.data?.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name_ar} - {subcategory.name_en}
                  </option>
                ))}
              </Select>
              {fieldErrors.subcategory_id ? (
                <p className="mt-1 text-xs text-error">{fieldErrors.subcategory_id}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">اختر التصنيف الفرعي للمنتج</p>
              )}
            </div>

            {/* SKU */}
            <div>
              <Label htmlFor="sku" className="mb-2 block">رمز المنتج (item)<span className="text-error">*</span></Label>
              <TextInput 
                id="sku" 
                name="sku" 
                placeholder="أدخل رمز المنتج" 
                value={formData.sku} 
                onChange={handleInputChange} 
                required 
                icon={() => <Icon icon="solar:qr-code-bold" height={18} />} 
              />
              {fieldErrors.sku ? (
                <p className="mt-1 text-xs text-error">{fieldErrors.sku}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">رمز فريد للمنتج</p>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-700">
              <div>
                <Label className="text-base font-medium text-gray-900 dark:text-white block mb-1">
                  حالة المنتج
                </Label>
                <p className={`text-sm ${formData.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {formData.is_active ? "🟢 المنتج نشط" : "🔴 المنتج غير نشط"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleChange}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  formData.is_active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.is_active ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <Label htmlFor="description_en" className="mb-2 block">وصف المنتج (الإنجليزية)</Label>
              <Textarea 
                id="description_en" 
                name="description_en" 
                placeholder="Enter product description in English" 
                value={formData.description_en} 
                onChange={handleInputChange}
                rows={4}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div>
              <Label htmlFor="description_ar" className="mb-2 block">وصف المنتج (العربية)</Label>
              <Textarea 
                id="description_ar" 
                name="description_ar" 
                placeholder="أدخل وصف المنتج بالعربية" 
                value={formData.description_ar} 
                onChange={handleInputChange}
                rows={4}
                dir="rtl"
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
        </Card>
        </div>
      )}

      {/* Step 2: Product Variants - Wrapped in form */}
      {currentStep === 2 && (
        <form onSubmit={handleFormSubmit} onKeyDown={handleKeyDown}>
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-dark dark:text-white">متغيرات المنتج</h3>
            <button
              type="button"
              onClick={addVariant}
              className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <Icon icon="solar:add-circle-bold" height={20} />
              إضافة متغير
            </button>
          </div>

          {variants.map((variant, index) => (
            <div key={variant.id} className="border border-gray-200 rounded-lg p-6 mb-6 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-dark dark:text-white">متغير {index + 1}</h4>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(variant.id)}
                    className="h-8 w-8 rounded-full hover:bg-lighterror dark:hover:bg-darkerror flex items-center justify-center transition-colors"
                  >
                    <Icon icon="solar:trash-bin-minimalistic-bold" height={16} className="text-error" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Variant Image */}
                <div className="md:col-span-2">
                  <Label className="mb-2 block">صورة المتغير</Label>
                  
                  <div className="flex items-start gap-4 mb-4">
                    {variant.imagePreview && (
                      <div className="relative">
                        <div className="w-32 h-32 rounded-lg overflow-hidden border border-ld">
                          <Image
                            src={variant.imagePreview}
                            alt="Preview"
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVariantImage(variant.id)}
                          className="absolute -top-2 -right-2 h-6 w-6 bg-error text-white rounded-full flex items-center justify-center hover:bg-error/90 transition-colors"
                        >
                          <Icon icon="solar:close-circle-bold" height={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer">
                      <div className="border-2 border-dashed border-ld rounded-lg p-6 text-center hover:border-primary transition-colors">
                        <Icon icon="solar:cloud-upload-bold" height={32} className="text-ld mx-auto mb-2" />
                        <p className="text-sm text-ld mb-1">انقر لرفع صورة المتغير</p>
                        <p className="text-xs text-ld">JPEG, JPG, PNG, WebP, GIF (الحد الأقصى 5MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleVariantImageChange(variant.id, file);
                        }}
                        className="hidden"
                      />
                    </label>
                    
                    {!variant.imagePreview && (
                      <div className="w-32 h-32 rounded-lg bg-lightgray dark:bg-darkgray flex items-center justify-center border border-ld">
                        <Icon icon="solar:gallery-bold" height={32} className="text-ld" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <Label className="mb-2 block">الحجم <span className="text-error">*</span></Label>
                  <TextInput 
                    placeholder="أدخل الحجم" 
                    value={variant.size} 
                    onChange={(e) => handleVariantChange(variant.id, 'size', e.target.value)}
                    icon={() => <Icon icon="solar:ruler-bold" height={18} />}
                    onKeyDown={handleKeyDown}
                  />
                  {variantErrors[variant.id]?.size && (
                    <p className="mt-1 text-xs text-error">{variantErrors[variant.id].size}</p>
                  )}
                </div>

                {/* SKU */}
                <div>
                  <Label className="mb-2 block">رمز المتغير (item)<span className="text-error">*</span></Label>
                  <TextInput 
                    placeholder="أدخل رمز المتغير" 
                    value={variant.sku} 
                    onChange={(e) => handleVariantChange(variant.id, 'sku', e.target.value)}
                    icon={() => <Icon icon="solar:qr-code-bold" height={18} />}
                    onKeyDown={handleKeyDown}
                  />
                  {variantErrors[variant.id]?.sku && (
                    <p className="mt-1 text-xs text-error">{variantErrors[variant.id].sku}</p>
                  )}
                </div>

                {/* Short Item */}
                <div>
                  <Label className="mb-2 block">اسم المختصر (short item)<span className="text-error">*</span></Label>
                  <TextInput 
                    placeholder="أدخل اسم المتغير" 
                    value={variant.short_item} 
                    onChange={(e) => handleVariantChange(variant.id, 'short_item', e.target.value)}
                    icon={() => <Icon icon="solar:tag-bold" height={18} />}
                    onKeyDown={handleKeyDown}
                  />
                  {variantErrors[variant.id]?.short_item && (
                    <p className="mt-1 text-xs text-error">{variantErrors[variant.id].short_item}</p>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <Label className="mb-2 block">الكمية <span className="text-error">*</span></Label>
                  <TextInput 
                    type="number"
                    placeholder="0" 
                    value={variant.quantity} 
                    onChange={(e) => handleVariantChange(variant.id, 'quantity', parseInt(e.target.value) || 0)}
                    icon={() => <Icon icon="solar:box-bold" height={18} />}
                    onKeyDown={handleKeyDown}
                  />
                  {variantErrors[variant.id]?.quantity && (
                    <p className="mt-1 text-xs text-error">{variantErrors[variant.id].quantity}</p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <Label className="mb-2 block">السعر <span className="text-error">*</span></Label>
                  <TextInput 
                    type="number"
                    step="0.01"
                    placeholder="0.00" 
                    value={variant.price} 
                    onChange={(e) => handleVariantChange(variant.id, 'price', parseFloat(e.target.value) || 0)}
                    icon={() => <Icon icon="solar:dollar-bold" height={18} />}
                    onKeyDown={handleKeyDown}
                  />
                  {variantErrors[variant.id]?.price && (
                    <p className="mt-1 text-xs text-error">{variantErrors[variant.id].price}</p>
                  )}
                </div>

                {/* Active Status */}
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                  <div>
                    <Label className="text-base font-medium text-gray-900 dark:text-white block mb-1">
                      حالة المتغير
                    </Label>
                    <p className={`text-sm ${variant.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {variant.is_active ? "🟢 المتغير نشط" : "🔴 المتغير غير نشط"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleVariantChange(variant.id, 'is_active', !variant.is_active)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      variant.is_active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        variant.is_active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </Card>

        {/* Form Actions for Step 2 */}
        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/products">
                <button 
                  type="button" 
                  disabled={isSubmitting}
                  className="px-6 py-2.5 border border-ld rounded-lg text-dark dark:text-white hover:bg-lightgray dark:hover:bg-darkgray transition-colors disabled:opacity-50"
                >
                  إلغاء
                </button>
              </Link>
              
              <button 
                type="button" 
                onClick={prevStep}
                disabled={isSubmitting}
                className="px-6 py-2.5 border border-ld rounded-lg text-dark dark:text-white hover:bg-lightgray dark:hover:bg-darkgray transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Icon icon="solar:arrow-right-bold" height={20} />
                السابق
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" /> 
                    جاري إضافة المنتج...
                  </>
                ) : (
                  <>
                    <Icon icon="solar:add-circle-bold" height={20} /> 
                    إضافة المنتج
                  </>
                )}
              </button>
            </div>
          </div>
        </Card>
        </form>
      )}

      {/* Actions for Step 1 - NOT inside form */}
      {currentStep === 1 && (
        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/products">
                <button 
                  type="button" 
                  disabled={isSubmitting}
                  className="px-6 py-2.5 border border-ld rounded-lg text-dark dark:text-white hover:bg-lightgray dark:hover:bg-darkgray transition-colors disabled:opacity-50"
                >
                  إلغاء
                </button>
              </Link>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                type="button" 
                onClick={nextStep}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                التالي
                <Icon icon="solar:arrow-left-bold" height={20} />
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AddProduct;