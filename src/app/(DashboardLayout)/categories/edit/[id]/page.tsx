"use client";
import React, { useState, useEffect } from "react";
import { Card, Label, TextInput, Spinner } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetCategoryByIdQuery, useUpdateCategoryMutation } from "@/store/api/categoriesApi";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/app/context/NotificationContext";
import Image from "next/image";

const EditCategory = () => {
  const router = useRouter();
  const params = useParams();
  const categoryId = parseInt(params.id as string);
  const { showNotification } = useNotification();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  
  // Fetch category data
  const { data: categoryData, isLoading: loading, error } = useGetCategoryByIdQuery(categoryId);
  
  const [formData, setFormData] = useState({
    name_en: "",
    name_ar: "",
    is_active: true,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Update form data when category data is loaded
  useEffect(() => {
    if (categoryData?.data) {
      const category = categoryData.data;
      setFormData({
        name_en: category.name_en,
        name_ar: category.name_ar,
        is_active: category.is_active,
      });
      if (category.image_url) {
        setImagePreview(category.image_url);
      }
    }
  }, [categoryData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleToggleChange = () => {
    setFormData((prev) => ({ ...prev, is_active: !prev.is_active }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(categoryData?.data?.image_url || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    // Log the current values to debug
    console.log('name_en:', formData.name_en);
    console.log('name_ar:', formData.name_ar);

    // Validate names
    if (!formData.name_en.trim()) {
      const msg = "يرجى إدخال اسم التصنيف بالإنجليزية";
      setFieldErrors({ name_en: msg });
      showNotification("error", "خطأ!", msg);
      return;
    }
    if (!formData.name_ar.trim()) {
      const msg = "يرجى إدخال اسم التصنيف بالعربية";
      setFieldErrors({ name_ar: msg });
      showNotification("error", "خطأ!", msg);
      return;
    }

    const data = new FormData();
    data.append('name_en', formData.name_en.trim());
    data.append('name_ar', formData.name_ar.trim());
    data.append('is_active', formData.is_active ? '1' : '0');

    if (selectedImage) {
      data.append('image', selectedImage);
    }

    // Log FormData contents for debugging
    for (const [key, value] of data.entries()) {
      console.log(`FormData ${key}:`, value);
    }

    try {
      const result = await updateCategory({ id: categoryId, formData: data }).unwrap();
      showNotification("success", "تم!", "تم تحديث التصنيف بنجاح");
      router.push('/categories');
    } catch (err: any) {
      console.error("Update category error:", err);
      console.error("Error status:", err.status);
      console.error("Error data:", err.data);
      
      let errorMessage = "حدث خطأ أثناء تحديث التصنيف";
      
      // Handle different error structures
      if (err.status === 422 && err.data?.errors) {
        const errors = err.data.errors;
        const fieldErrors: Record<string, string> = {};
        if (errors.name_en) fieldErrors.name_en = errors.name_en[0];
        if (errors.name_ar) fieldErrors.name_ar = errors.name_ar[0];
        if (errors.image) fieldErrors.image = errors.image[0];
        if (errors.is_active) fieldErrors.is_active = errors.is_active[0];
        setFieldErrors(fieldErrors);
        errorMessage = Object.values(fieldErrors).join("، ") || errorMessage;
      } else if (err.data?.message) {
        errorMessage = err.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showNotification("error", "خطأ!", errorMessage);
    }
  };

  // Use the updating state from RTK mutation for loading state
  const isSubmitting = updating;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-lighterror dark:bg-darkerror border-r-4 border-error rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-error/10 flex items-center justify-center">
              <Icon icon="solar:danger-circle-bold" height={24} className="text-error" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-error mb-1">خطأ!</h3>
            <p className="text-sm text-dark dark:text-white">فشل في تحميل بيانات التصنيف</p>
          </div>
        </div>
      </div>
    );
  }

  if (!categoryData?.data) {
    return (
      <div className="text-center py-12">
        <Icon icon="solar:widget-2-bold-duotone" height={64} className="text-ld mx-auto mb-4" />
        <p className="text-ld dark:text-white/70">التصنيف غير موجود</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/categories">
              <button className="h-10 w-10 rounded-full hover:bg-lightprimary dark:hover:bg-darkprimary flex items-center justify-center transition-colors">
                <Icon icon="solar:arrow-right-bold" height={20} className="text-dark dark:text-white" />
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-dark dark:text-white">تعديل التصنيف</h1>
          </div>
          <p className="text-sm text-ld mr-12">تعديل بيانات التصنيف "{categoryData.data.name_ar}"</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* English Name */}
            <div>
              <Label htmlFor="name_en" className="mb-2 block">اسم التصنيف (الإنجليزية) <span className="text-error">*</span></Label>
              <TextInput 
                id="name_en" 
                name="name_en" 
                placeholder="Enter category name in English" 
                value={formData.name_en} 
                onChange={handleInputChange} 
                required 
                icon={() => <Icon icon="solar:tag-bold" height={18} />} 
                disabled={isLoading}
              />
              {fieldErrors.name_en ? (
                <p className="mt-1 text-xs text-error">{fieldErrors.name_en}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">اسم التصنيف باللغة الإنجليزية</p>
              )}
            </div>

            {/* Arabic Name */}
            <div>
              <Label htmlFor="name_ar" className="mb-2 block">اسم التصنيف (العربية) <span className="text-error">*</span></Label>
              <TextInput 
                id="name_ar" 
                name="name_ar" 
                placeholder="أدخل اسم التصنيف بالعربية" 
                value={formData.name_ar} 
                onChange={handleInputChange} 
                required 
                icon={() => <Icon icon="solar:tag-bold" height={18} />} 
                disabled={isLoading}
                dir="rtl"
              />
              {fieldErrors.name_ar ? (
                <p className="mt-1 text-xs text-error">{fieldErrors.name_ar}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">اسم التصنيف باللغة العربية</p>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-700">
              <div>
                <Label className="text-base font-medium text-gray-900 dark:text-white block mb-1">
                  حالة التصنيف
                </Label>
                <p className={`text-sm ${formData.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {formData.is_active ? "🟢 التصنيف نشط" : "🔴 التصنيف غير نشط"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleChange}
                disabled={isLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  formData.is_active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.is_active ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Image Upload */}
            <div className="md:col-span-2">
              <Label htmlFor="image" className="mb-2 block">صورة التصنيف</Label>
              
              {/* Image Preview and Upload Status */}
              <div className="flex items-start gap-4 mb-4">
                {imagePreview && (
                  <div className="relative">
                    <div className="w-32 h-32 rounded-lg overflow-hidden border border-ld">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      disabled={isLoading}
                      className="absolute -top-2 -right-2 h-6 w-6 bg-error text-white rounded-full flex items-center justify-center hover:bg-error/90 transition-colors"
                    >
                      <Icon icon="solar:close-circle-bold" height={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* File Input */}
              <div className="flex items-center gap-4">
                <label
                  htmlFor="image"
                  className={`flex-1 cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="border-2 border-dashed border-ld rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <Icon icon="solar:cloud-upload-bold" height={32} className="text-ld mx-auto mb-2" />
                    <p className="text-sm text-ld mb-1">انقر لرفع صورة التصنيف</p>
                    <p className="text-xs text-ld">JPEG, JPG, PNG, WebP, GIF (الحد الأقصى 5MB)</p>
                  </div>
                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleImageChange}
                    disabled={isLoading}
                    className="hidden"
                  />
                </label>
                
                {!imagePreview && (
                  <div className="w-32 h-32 rounded-lg bg-lightgray dark:bg-darkgray flex items-center justify-center border border-ld">
                    <Icon icon="solar:gallery-bold" height={32} className="text-ld" />
                  </div>
                )}
              </div>
              
              {fieldErrors.image ? (
                <p className="mt-1 text-xs text-error">{fieldErrors.image}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">اختياري - يمكنك إضافة صورة لتمييز التصنيف</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="mt-6">
          <div className="flex items-center justify-end gap-3">
            <Link href="/categories">
              <button 
                type="button" 
                disabled={isSubmitting}
                className="px-6 py-2.5 border border-ld rounded-lg text-dark dark:text-white hover:bg-lightgray dark:hover:bg-darkgray transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
            </Link>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" /> 
                  جاري تحديث التصنيف...
                </>
              ) : (
                <>
                  <Icon icon="solar:check-circle-bold" height={20} /> 
                  تحديث التصنيف
                </>
              )}
            </button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default EditCategory;
