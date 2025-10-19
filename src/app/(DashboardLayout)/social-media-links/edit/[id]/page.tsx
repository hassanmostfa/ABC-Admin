"use client";
import React, { useState, useEffect } from "react";
import { Card, Label, TextInput, Button, Spinner, Radio } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetSocialMediaLinkQuery, useUpdateSocialMediaLinkMutation } from "@/store/api/socialMediaLinksApi";
import { useNotification } from "@/app/context/NotificationContext";
import Link from "next/link";

interface EditSocialMediaLinkPageProps {
  params: Promise<{
    id: string;
  }>;
}

const EditSocialMediaLinkPage = ({ params }: EditSocialMediaLinkPageProps) => {
  const { showNotification } = useNotification();
  const resolvedParams = React.use(params);
  const linkId = parseInt(resolvedParams.id);

  const [updateLink, { isLoading }] = useUpdateSocialMediaLinkMutation();
  const { data: linkData, isLoading: loadingData, error } = useGetSocialMediaLinkQuery(linkId);

  const [formData, setFormData] = useState({
    title_en: "",
    title_ar: "",
    url: "",
    is_active: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load data when available
  useEffect(() => {
    if (linkData?.data) {
      const link = linkData.data;
      setFormData({
        title_en: link.title_en || "",
        title_ar: link.title_ar || "",
        url: link.url,
        is_active: link.is_active,
      });
      setImagePreview(link.icon_url);
    }
  }, [linkData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(linkData?.data?.icon_url || "");
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title_en.trim()) {
      newErrors.title_en = "اسم الرابط بالإنجليزية مطلوب";
    }

    if (!formData.title_ar.trim()) {
      newErrors.title_ar = "اسم الرابط بالعربية مطلوب";
    }

    if (!formData.url.trim()) {
      newErrors.url = "رابط وسائل التواصل الاجتماعي مطلوب";
    } else if (!isValidUrl(formData.url)) {
      newErrors.url = "يرجى إدخال رابط صحيح";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await updateLink({
        id: linkId,
        data: {
          ...(imageFile && { icon: imageFile }),
          title_en: formData.title_en,
          title_ar: formData.title_ar,
          url: formData.url,
          is_active: formData.is_active,
        },
      }).unwrap();

      showNotification("success", "نجح!", "تم تحديث رابط وسائل التواصل الاجتماعي بنجاح");
      
    } catch (err: any) {
      showNotification("error", "خطأ!", err?.data?.message || "فشل في تحديث رابط وسائل التواصل الاجتماعي");
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error || !linkData?.data) {
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
            <p className="text-sm text-dark dark:text-white">لم يتم العثور على رابط وسائل التواصل الاجتماعي</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Link href="/social-media-links">
          <button className="h-10 w-10 rounded-full hover:bg-lightprimary dark:hover:bg-darkprimary flex items-center justify-center transition-colors">
            <Icon icon="solar:arrow-right-bold" height={20} className="text-dark dark:text-white" />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white">تعديل رابط وسائل التواصل الاجتماعي</h1>
          <p className="text-sm text-ld mr-12">تعديل رابط وسائل التواصل الاجتماعي</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <Card>
          <h2 className="text-xl font-semibold text-dark dark:text-white mb-4">المعلومات الأساسية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Upload - Full Row */}
            <div className="md:col-span-2">
              <Label htmlFor="icon" className="mb-2 block">أيقونة الرابط</Label>
              
              {/* File Input and Image Preview Side by Side */}
              <div className="flex items-center gap-6">
                <label
                  htmlFor="icon"
                  className={`flex-1 cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="border-2 border-dashed border-ld rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <Icon icon="solar:cloud-upload-bold" height={32} className="text-ld mx-auto mb-2" />
                    <p className="text-sm text-ld mb-1">انقر لرفع أيقونة جديدة</p>
                    <p className="text-xs text-ld">JPEG, JPG, PNG, WebP, GIF (الحد الأقصى 5MB)</p>
                  </div>
                  <input
                    id="icon"
                    name="icon"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleImageChange}
                    disabled={isLoading}
                    className="hidden"
                  />
                </label>
                
                {/* Image Preview */}
                <div className="flex-shrink-0">
                  {imagePreview ? (
                    <div className="relative">
                      <div className="w-40 h-40 rounded-lg overflow-hidden border border-ld">
                        <img
                          src={imagePreview}
                          alt="Preview"
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
                  ) : (
                    <div className="w-40 h-40 rounded-lg bg-lightgray dark:bg-darkgray flex items-center justify-center border border-ld">
                      <Icon icon="solar:gallery-bold" height={32} className="text-ld" />
                    </div>
                  )}
                </div>
              </div>
              
              <p className="mt-1 text-xs text-gray-500">اتركه فارغاً للاحتفاظ بالأيقونة الحالية</p>
            </div>

            {/* Title Fields in One Row */}
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title_en" className="mb-2 block">اسم الرابط (إنجليزي) <span className="text-error">*</span></Label>
                  <TextInput
                    id="title_en"
                    name="title_en"
                    value={formData.title_en}
                    onChange={handleInputChange}
                    required
                    icon={() => <Icon icon="solar:letter-unread-bold" height={18} />}
                    placeholder="Facebook"
                  />
                  {errors.title_en ? (
                    <p className="mt-1 text-xs text-error">{errors.title_en}</p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500">اسم الرابط باللغة الإنجليزية</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="title_ar" className="mb-2 block">اسم الرابط (عربي) <span className="text-error">*</span></Label>
                  <TextInput
                    id="title_ar"
                    name="title_ar"
                    value={formData.title_ar}
                    onChange={handleInputChange}
                    required
                    icon={() => <Icon icon="solar:letter-unread-bold" height={18} />}
                    placeholder="فيسبوك"
                  />
                  {errors.title_ar ? (
                    <p className="mt-1 text-xs text-error">{errors.title_ar}</p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500">اسم الرابط باللغة العربية</p>
                  )}
                </div>
              </div>
            </div>

            {/* URL Field */}
            <div className="md:col-span-2">
              <Label htmlFor="url" className="mb-2 block">رابط وسائل التواصل الاجتماعي <span className="text-error">*</span></Label>
              <TextInput
                id="url"
                name="url"
                type="url"
                value={formData.url}
                onChange={handleInputChange}
                required
                icon={() => <Icon icon="solar:link-bold" height={18} />}
                placeholder="https://www.facebook.com/yourpage"
              />
              {errors.url ? (
                <p className="mt-1 text-xs text-error">{errors.url}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">رابط صفحة وسائل التواصل الاجتماعي</p>
              )}
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <Label className="mb-2 block">الحالة <span className="text-error">*</span></Label>
              <div className="flex gap-6">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="active"
                    name="is_active"
                    value="true"
                    checked={formData.is_active === true}
                    onChange={() => setFormData(prev => ({ ...prev, is_active: true }))}
                    className="ui-checkbox"
                  />
                  <Label htmlFor="active" className="mr-2">نشط</Label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="inactive"
                    name="is_active"
                    value="false"
                    checked={formData.is_active === false}
                    onChange={() => setFormData(prev => ({ ...prev, is_active: false }))}
                    className="ui-checkbox"
                  />
                  <Label htmlFor="inactive" className="mr-2">غير نشط</Label>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <Link href="/social-media-links">
            <Button color="gray" disabled={isLoading}>
              إلغاء
            </Button>
          </Link>
          <Button type="submit" color="blue" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner size="sm" className="ml-2" />
                جاري التحديث...
              </>
            ) : (
              <>
                <Icon icon="solar:check-circle-bold" height={16} className="ml-1" />
                تحديث الرابط
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditSocialMediaLinkPage;
