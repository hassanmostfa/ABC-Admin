"use client";
import React, { useState, useEffect } from "react";
import { Card, Label, TextInput, Spinner, Select } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetCharityByIdQuery, useUpdateCharityMutation, useGetAllCountriesQuery, useGetGovernoratesByCountryQuery, useGetAreasByGovernorateQuery } from "@/store/api/charitiesApi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/app/context/NotificationContext";

export default function EditCharityPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { showNotification } = useNotification();
  const charityId = parseInt(params?.id);

  const { data: charityData, isLoading: loadingCharity, error } = useGetCharityByIdQuery(charityId);
  const [updateCharity, { isLoading: updating }] = useUpdateCharityMutation();
  const { data: countriesData } = useGetAllCountriesQuery();

  const [formData, setFormData] = useState({
    name_ar: "",
    name_en: "",
    phone: "+965 ",
    country_id: 0,
    governorate_id: 0,
    area_id: 0,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  // Update form data when charity data is loaded
  useEffect(() => {
    if (charityData?.data && !initialized) {
      setFormData({
        name_ar: charityData.data.name_ar || "",
        name_en: charityData.data.name_en || "",
        phone: charityData.data.phone || "+965 ",
        country_id: charityData.data.country?.id || 0,
        governorate_id: charityData.data.governorate?.id || 0,
        area_id: charityData.data.area?.id || 0,
      });
      setInitialized(true);
    }
  }, [charityData, initialized]);

  const { data: governoratesData } = useGetGovernoratesByCountryQuery(formData.country_id || 0);
  const { data: areasData } = useGetAreasByGovernorateQuery(formData.governorate_id || 0);

  const validateNameAr = (name: string): string => {
    if (!name.trim()) {
      return "يرجى إدخال اسم الجمعية بالعربية";
    }
    
    // Remove extra spaces and validate length
    const cleanName = name.trim().replace(/\s+/g, ' ');
    
    if (cleanName.length < 2) {
      return "الاسم يجب أن يكون على الأقل حرفين";
    }
    
    if (cleanName.length > 100) {
      return "الاسم يجب أن لا يتجاوز 100 حرف";
    }
    
    return "";
  };

  const validateNameEn = (name: string): string => {
    if (!name.trim()) {
      return "يرجى إدخال اسم الجمعية بالإنجليزية";
    }
    
    // Remove extra spaces and validate length
    const cleanName = name.trim().replace(/\s+/g, ' ');
    
    if (cleanName.length < 2) {
      return "الاسم يجب أن يكون على الأقل حرفين";
    }
    
    if (cleanName.length > 100) {
      return "الاسم يجب أن لا يتجاوز 100 حرف";
    }
    
    return "";
  };

  const validatePhone = (phone: string): string => {
    if (!phone.trim() || phone.trim() === "+965") {
      return "يرجى إدخال رقم الهاتف";
    }
    
    // Check if it starts with +965 and has more content
    if (!phone.startsWith("+965 ") || phone.length <= 5) {
      return "يرجى إدخال رقم هاتف صحيح";
    }
    
    // Remove +965 prefix and validate the local number
    const localNumber = phone.substring(5);
    if (!/^[0-9\s\-\(\)]+$/.test(localNumber)) {
      return "رقم الهاتف المحلي غير صحيح";
    }
    
    return "";
  };

  const validateLocation = (countryId: number, governorateId: number, areaId: number): string => {
    if (!countryId || countryId === 0) {
      return "يرجى اختيار الدولة";
    }
    if (!governorateId || governorateId === 0) {
      return "يرجى اختيار المحافظة";
    }
    if (!areaId || areaId === 0) {
      return "يرجى اختيار المنطقة";
    }
    return "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "phone") {
      // Ensure +965 prefix is always maintained
      if (!value.startsWith("+965 ")) {
        setFormData((prev) => ({ ...prev, [name]: "+965 " }));
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else if (name === "country_id" || name === "governorate_id" || name === "area_id") {
      const newValue = parseInt(value);
      
      if (name === "country_id") {
        // Reset governorate and area when country changes
        setFormData((prev) => ({ 
          ...prev, 
          [name]: newValue,
          governorate_id: 0,
          area_id: 0
        }));
      } else if (name === "governorate_id") {
        // Reset area when governorate changes
        setFormData((prev) => ({ 
          ...prev, 
          [name]: newValue,
          area_id: 0
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: newValue }));
      }
    } else {
      // Clean up extra spaces in real-time for other fields
      const cleanValue = value.replace(/\s+/g, ' ');
      setFormData((prev) => ({ ...prev, [name]: cleanValue }));
    }
    
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const extractErrorMessage = (err: any): string => {
    const apiErrors = err?.data?.errors;
    if (apiErrors && typeof apiErrors === "object") {
      const firstField = Object.keys(apiErrors)[0];
      const messages = apiErrors[firstField];
      if (Array.isArray(messages) && messages.length > 0) return messages[0];
    }
    return err?.data?.message || "حدث خطأ أثناء تحديث الجمعية";
  };

  const extractFieldErrors = (err: any): Record<string, string> => {
    const apiErrors = err?.data?.errors;
    const mapped: Record<string, string> = {};
    if (apiErrors && typeof apiErrors === "object") {
      Object.keys(apiErrors).forEach((key) => {
        const messages = apiErrors[key];
        if (Array.isArray(messages) && messages.length > 0) mapped[key] = messages[0];
      });
    }
    return mapped;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    // Validate all fields
    const nameArError = validateNameAr(formData.name_ar);
    const nameEnError = validateNameEn(formData.name_en);
    const phoneError = validatePhone(formData.phone);
    const locationError = validateLocation(formData.country_id, formData.governorate_id, formData.area_id);

    if (nameArError || nameEnError || phoneError || locationError) {
      setFieldErrors({
        ...(nameArError && { name_ar: nameArError }),
        ...(nameEnError && { name_en: nameEnError }),
        ...(phoneError && { phone: phoneError }),
        ...(locationError && { location: locationError }),
      });
      showNotification("error", "خطأ!", "يرجى تصحيح الأخطاء في النموذج");
      return;
    }

    try {
      const result = await updateCharity({
        id: charityId,
        charityData: {
          name_ar: formData.name_ar.trim(),
          name_en: formData.name_en.trim(),
          phone: formData.phone.trim(),
          country_id: formData.country_id,
          governorate_id: formData.governorate_id,
          area_id: formData.area_id,
        },
      }).unwrap();

      if (result.success) {
        showNotification("success", "نجاح!", "تم تحديث الجمعية بنجاح");
        setTimeout(() => {
          router.push("/charities");
        }, 1200);
      }
    } catch (err: any) {
      const fieldErrs = extractFieldErrors(err);
      if (Object.keys(fieldErrs).length > 0) setFieldErrors(fieldErrs);
      showNotification("error", "خطأ!", extractErrorMessage(err));
    }
  };

  if (loadingCharity) {
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
            <p className="text-sm text-dark dark:text-white">فشل في تحميل بيانات الجمعية</p>
          </div>
        </div>
      </div>
    );
  }

  if (!charityData?.data) {
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
            <p className="text-sm text-dark dark:text-white">الجمعية غير موجودة</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/charities">
              <button className="h-10 w-10 rounded-full hover:bg-lightprimary dark:hover:bg-darkprimary flex items-center justify-center transition-colors">
                <Icon icon="solar:arrow-right-bold" height={20} className="text-dark dark:text-white" />
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-dark dark:text-white">تعديل بيانات الجمعية</h1>
          </div>
          <p className="text-sm text-ld mr-12">تحديث معلومات الجمعية: {charityData.data.name_ar}</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Removed theme toggle */}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name_ar" className="mb-2 block">اسم الجمعية (عربي) <span className="text-error">*</span></Label>
              <TextInput 
                id="name_ar" 
                name="name_ar" 
                placeholder="اسم الجمعية بالعربية" 
                value={formData.name_ar} 
                onChange={handleInputChange} 
                required 
                icon={() => <Icon icon="solar:buildings-2-bold" height={18} />} 
              />
              {fieldErrors.name_ar ? (
                <p className="mt-1 text-xs text-error">{fieldErrors.name_ar}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">أدخل اسم الجمعية الخيرية بالعربية</p>
              )}
            </div>

            <div>
              <Label htmlFor="name_en" className="mb-2 block">اسم الجمعية (إنجليزي) <span className="text-error">*</span></Label>
              <TextInput 
                id="name_en" 
                name="name_en" 
                placeholder="Charity Name in English" 
                value={formData.name_en} 
                onChange={handleInputChange} 
                required 
                icon={() => <Icon icon="solar:buildings-2-bold" height={18} />} 
              />
              {fieldErrors.name_en ? (
                <p className="mt-1 text-xs text-error">{fieldErrors.name_en}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">أدخل اسم الجمعية الخيرية بالإنجليزية</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone" className="mb-2 block">رقم الهاتف <span className="text-error">*</span></Label>
              <TextInput 
                id="phone" 
                name="phone" 
                placeholder="+965 xxxx xxxx" 
                value={formData.phone} 
                onChange={handleInputChange} 
                required 
                style={{direction: "ltr"}}
                className="pl-16"
                icon={() => <Icon icon="solar:phone-bold" height={18} />} 
              />
              {fieldErrors.phone ? (
                <p className="mt-1 text-xs text-error">{fieldErrors.phone}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">أدخل رقم الهاتف الكامل</p>
              )}
            </div>

            <div>
              <Label htmlFor="country_id" className="mb-2 block">الدولة <span className="text-error">*</span></Label>
              <Select
                id="country_id"
                name="country_id"
                value={formData.country_id}
                onChange={handleInputChange}
                required
                className="select-md"
                icon={() => <Icon icon="solar:flag-bold" height={18} />}
              >
                <option value={0}>اختر الدولة</option>
                {countriesData?.data?.map((country: any) => (
                  <option key={country.id} value={country.id}>
                    {country.name_ar} - {country.name_en}
                  </option>
                ))}
              </Select>
              {fieldErrors.location ? (
                <p className="mt-1 text-xs text-error">{fieldErrors.location}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">اختر الدولة</p>
              )}
            </div>

            <div>
              <Label htmlFor="governorate_id" className="mb-2 block">المحافظة <span className="text-error">*</span></Label>
              <Select
                id="governorate_id"
                name="governorate_id"
                value={formData.governorate_id}
                onChange={handleInputChange}
                required
                disabled={formData.country_id === 0}
                className="select-md"
                icon={() => <Icon icon="solar:buildings-bold" height={18} />}
              >
                <option value={0}>اختر المحافظة</option>
                {governoratesData?.data?.map((governorate: any) => (
                  <option key={governorate.id} value={governorate.id}>
                    {governorate.name_ar} - {governorate.name_en}
                  </option>
                ))}
              </Select>
              {fieldErrors.location ? (
                <p className="mt-1 text-xs text-error">{fieldErrors.location}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">اختر المحافظة</p>
              )}
            </div>

            <div>
              <Label htmlFor="area_id" className="mb-2 block">المنطقة <span className="text-error">*</span></Label>
              <Select
                id="area_id"
                name="area_id"
                value={formData.area_id}
                onChange={handleInputChange}
                required
                disabled={formData.governorate_id === 0}
                className="select-md"
                icon={() => <Icon icon="solar:home-bold" height={18} />}
              >
                <option value={0}>اختر المنطقة</option>
                {areasData?.data?.map((area: any) => (
                  <option key={area.id} value={area.id}>
                    {area.name_ar} - {area.name_en}
                  </option>
                ))}
              </Select>
              {fieldErrors.location ? (
                <p className="mt-1 text-xs text-error">{fieldErrors.location}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">اختر المنطقة</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="mt-6">
          <div className="flex items-center justify-end gap-3">
            <Link href="/charities">
              <button type="button" className="px-6 py-2.5 border border-ld rounded-lg text-dark dark:text-white hover:bg-lightgray dark:hover:bg-darkgray transition-colors">إلغاء</button>
            </Link>
            <button type="submit" disabled={updating} className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50">
              {updating ? (<><Spinner size="sm" /> جاري التحديث...</>) : (<><Icon icon="solar:check-circle-bold" height={20} /> تحديث الجمعية</>)}
            </button>
          </div>
        </Card>
      </form>
    </div>
  );
  }
