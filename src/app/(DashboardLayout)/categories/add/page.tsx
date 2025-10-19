"use client";
import React, { useState } from "react";
import { Card, Label, TextInput, Spinner } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useCreateCategoryMutation } from "@/store/api/categoriesApi";
// Removed file upload functionality
// import { useUploadFileMutation } from "@/store/api/fileUploadApi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/app/context/NotificationContext";
import Image from "next/image";

const AddCategory = () => {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  // Removed file upload functionality
  // const [uploadFile, { isLoading: uploading }] = useUploadFileMutation();
  const [formData, setFormData] = useState({
    name_en: "",
    name_ar: "",
    is_active: true,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // Removed imagePath as it's no longer needed with direct file upload
  // const [imagePath, setImagePath] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

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

  // Removed uploadImage function as file will be sent directly with the form
  /*
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      if (!file) {
        showNotification("error", "خطأ!", "يرجى اختيار ملف للرفع");
        return null;
      }
      const formData = new FormData();
      formData.append("file", file);
      console.log('Uploading file:', file.name, 'Size:', file.size);
      console.log('FormData contains file:', formData.has('file'));

      const result = await uploadFile(formData).unwrap();
      
      if (result.success) {
        showNotification("success", "نجاح!", "تم رفع الصورة بنجاح");
        return result.data.path; // Return the image path (not URL)
      }
      return null;
    } catch (err: any) {
      console.error('Upload error:', err);
      
      // Handle validation errors from upload API
      if (err?.data?.errors) {
        const uploadErrors = err.data.errors;
        if (uploadErrors.file) {
          showNotification("error", "خطأ!", uploadErrors.file[0] || "خطأ في رفع الملف");
        } else {
          showNotification("error", "خطأ!", "فشل في رفع الصورة");
        }
      } else {
        showNotification("error", "خطأ!", err?.data?.message || "فشل في رفع الصورة");
      }
      return null;
    }
  };
  */

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
      // Removed immediate upload as file will be sent with the form
      // const uploadedPath = await uploadImage(file);
      // if (uploadedPath) {
      //   setImagePath(uploadedPath);
      // } else {
      //   // Upload failed, reset image selection
      //   setSelectedImage(null);
      //   setImagePreview(null);
      // }
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    // Removed imagePath reset as it's no longer needed
    // setImagePath(null);
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
      const result = await createCategory(data).unwrap();
      showNotification("success", "تم!", "تم إنشاء التصنيف بنجاح");
      router.push('/categories');
    } catch (err: any) {
      console.error("Create category error:", err);
      let errorMessage = "حدث خطأ أثناء إنشاء التصنيف";
      if (err.status === 422 && err.data?.errors) {
        const errors = err.data.errors;
        const fieldErrors: Record<string, string> = {};
        if (errors.name_en) fieldErrors.name_en = errors.name_en[0];
        if (errors.name_ar) fieldErrors.name_ar = errors.name_ar[0];
        if (errors.image) fieldErrors.image = errors.image[0];
        setFieldErrors(fieldErrors);
        errorMessage = Object.values(fieldErrors).join("، ") || errorMessage;
      }
      showNotification("error", "خطأ!", errorMessage);
    }
  };

  // Use the creating state from RTK mutation for loading state
  const isSubmitting = creating;

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
            <h1 className="text-3xl font-bold text-dark dark:text-white">إضافة تصنيف جديد</h1>
          </div>
          <p className="text-sm text-ld mr-12">قم بإنشاء تصنيف جديد للمنتجات</p>
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
                
                {/* Removed Upload Status as file is sent with form */}
                {/*
                <div className="flex-1">
                  {uploading && (
                    <div className="flex items-center gap-2 text-sm text-warning">
                      <Spinner size="sm" />
                      جاري رفع الصورة...
                    </div>
                  )}
                  {imagePath && !uploading && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Icon icon="solar:check-circle-bold" height={16} />
                      تم رفع الصورة بنجاح
                    </div>
                  )}
                  {selectedImage && !imagePath && !uploading && (
                    <div className="flex items-center gap-2 text-sm text-error">
                      <Icon icon="solar:danger-circle-bold" height={16} />
                      فشل في رفع الصورة
                    </div>
                  )}
                </div>
                */}
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
                  جاري إضافة التصنيف...
                </>
              ) : (
                <>
                  <Icon icon="solar:add-circle-bold" height={20} /> 
                  إضافة التصنيف
                </>
              )}
            </button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default AddCategory;