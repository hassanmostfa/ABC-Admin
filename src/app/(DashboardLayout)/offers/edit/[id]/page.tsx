"use client";
import React, { useState, useEffect } from "react";
import { Card, Label, TextInput, Spinner, Select, Button } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetOfferByIdQuery, useUpdateOfferMutation, useGetAllCharitiesQuery } from "@/store/api/offersApi";
import { useGetProductsQuery } from "@/store/api/productsApi";
import SearchableSelect from "@/components/shared/SearchableSelect";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/app/context/NotificationContext";

interface EditOfferPageProps {
  params: Promise<{
    id: string;
  }>;
}

const EditOfferPage = ({ params }: EditOfferPageProps) => {
  const router = useRouter();
  const { showNotification } = useNotification();
  const resolvedParams = React.use(params);
  const offerId = parseInt(resolvedParams.id);

  const { data: offerData, isLoading: loadingOffer, error } = useGetOfferByIdQuery(offerId);
  const [updateOffer, { isLoading: updating }] = useUpdateOfferMutation();
  const { data: charitiesData } = useGetAllCharitiesQuery();

  const [formData, setFormData] = useState({
    image: null as File | null,
    offer_start_date: "",
    offer_end_date: "",
    is_active: true,
    type: "normal" as "normal" | "charity",
    points: "",
    reward_type: "products" as "products" | "discount",
    charity_id: 0,
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [conditions, setConditions] = useState<Array<{product_id: number, product_variant_id: number, quantity: number}>>([]);

  const [rewards, setRewards] = useState<Array<{product_id: number, product_variant_id: number, quantity: number, discount_amount: number, discount_type: string}>>([]);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [nestedErrors, setNestedErrors] = useState<Record<string, string[]>>({});
  const [initialized, setInitialized] = useState(false);

  // Update form data when offer data is loaded
  useEffect(() => {
    if (offerData?.data && !initialized) {
      setFormData({
        image: null,
        offer_start_date: offerData.data.offer_start_date ? new Date(offerData.data.offer_start_date).toISOString().split('T')[0] : "",
        offer_end_date: offerData.data.offer_end_date ? new Date(offerData.data.offer_end_date).toISOString().split('T')[0] : "",
        is_active: offerData.data.is_active,
        type: offerData.data.type,
        points: offerData.data.points?.toString() || "",
        reward_type: offerData.data.reward_type,
        charity_id: offerData.data.charity_id || 0,
      });
      
      if (offerData.data.conditions && offerData.data.conditions.length > 0) {
        const mappedConditions = offerData.data.conditions.map((c: any) => ({
          product_id: c.product_id,
          product_variant_id: c.variant_id, // API uses 'variant_id'
          quantity: c.required_quantity // API uses 'required_quantity'
        }));
        console.log("Mapped conditions:", mappedConditions);
        setConditions(mappedConditions);
      }
      
      if (offerData.data.rewards && offerData.data.rewards.length > 0) {
        const mappedRewards = offerData.data.rewards.map((r: any) => ({
          product_id: r.product_id || 0,
          product_variant_id: r.variant_id || 0, // API uses 'variant_id'
          quantity: r.reward_quantity || 1, // API uses 'reward_quantity'
          discount_amount: r.discount_amount || 0,
          discount_type: r.discount_type || "percentage"
        }));
        console.log("Mapped rewards:", mappedRewards);
        setRewards(mappedRewards);
      }
      
      setInitialized(true);
    }
  }, [offerData, initialized]);

  const getNestedError = (field: string, index: number, subField: string): string => {
    const errorKey = `${field}.${index}.${subField}`;
    const errors = nestedErrors[errorKey];
    return errors && errors.length > 0 ? errors[0] : "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "file") {
      const file = (e.target as HTMLInputElement).files?.[0];
      setFormData((prev) => ({ ...prev, [name]: file }));
    } else if (name === "is_active") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (name === "points") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else if (name === "charity_id") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setFormData((prev) => ({ ...prev, image: file }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: null }));
  };

  const addCondition = () => {
    // Always add empty values for new conditions
    setConditions([...conditions, { product_id: 0, product_variant_id: 0, quantity: 1 }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: string, value: number) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    setConditions(updated);
    
    // Clear nested error for this field
    const errorKey = `conditions.${index}.${field}`;
    if (nestedErrors[errorKey]) {
      const newNestedErrors = { ...nestedErrors };
      delete newNestedErrors[errorKey];
      setNestedErrors(newNestedErrors);
    }
  };

  const addReward = () => {
    // Always add empty values for new rewards
    setRewards([...rewards, { product_id: 0, product_variant_id: 0, quantity: 1, discount_amount: 0, discount_type: "percentage" }]);
  };

  const removeReward = (index: number) => {
    setRewards(rewards.filter((_, i) => i !== index));
  };

  const updateReward = (index: number, field: string, value: number | string) => {
    const updated = [...rewards];
    updated[index] = { ...updated[index], [field]: value };
    setRewards(updated);
    
    // Clear nested error for this field
    const errorKey = `rewards.${index}.${field}`;
    if (nestedErrors[errorKey]) {
      const newNestedErrors = { ...nestedErrors };
      delete newNestedErrors[errorKey];
      setNestedErrors(newNestedErrors);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.offer_start_date) {
      errors.offer_start_date = "يرجى اختيار تاريخ البداية";
    }

    if (!formData.offer_end_date) {
      errors.offer_end_date = "يرجى اختيار تاريخ النهاية";
    }

    if (formData.offer_start_date && formData.offer_end_date) {
      const startDate = new Date(formData.offer_start_date);
      const endDate = new Date(formData.offer_end_date);
      if (startDate >= endDate) {
        errors.offer_end_date = "تاريخ النهاية يجب أن يكون بعد تاريخ البداية";
      }
    }

    if (!formData.points || parseInt(formData.points) < 0) {
      errors.points = "النقاط يجب أن تكون أكبر من أو تساوي صفر";
    }


    // Validate conditions
    const validConditions = conditions.filter(c => c.product_id > 0 && c.product_variant_id > 0 && c.quantity > 0);
    if (conditions.length === 0 || validConditions.length === 0) {
      errors.conditions = "يرجى إضافة شرط واحد على الأقل";
    }

    // Validate rewards based on reward type
    let validRewards;
    if (formData.reward_type === "products") {
      validRewards = rewards.filter(r => r.product_id > 0 && r.product_variant_id > 0 && r.quantity > 0);
    } else {
      // For discount rewards, check for discount_amount and discount_type
      validRewards = rewards.filter(r => r.discount_amount && r.discount_amount > 0 && r.discount_type);
    }
    
    if (rewards.length === 0 || validRewards.length === 0) {
      if (formData.reward_type === "products") {
        errors.rewards = "يرجى إضافة مكافأة واحدة على الأقل";
      } else {
        errors.rewards = "يرجى إدخال مبلغ ونوع الخصم للمكافأة";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification("error", "خطأ!", "يرجى تصحيح الأخطاء في النموذج");
      return;
    }

    try {
      const validConditions = conditions.filter(c => c.product_id > 0 && c.product_variant_id > 0 && c.quantity > 0);
      const cleanedConditions = validConditions.map(c => ({
        product_id: c.product_id,
        product_variant_id: c.product_variant_id,
        quantity: c.quantity,
        is_active: true
      }));
      
      // For rewards, filter based on reward type
      let validRewards;
      if (formData.reward_type === "products") {
        validRewards = rewards.filter(r => r.product_id > 0 && r.product_variant_id > 0 && r.quantity > 0);
        validRewards = validRewards.map(r => ({
          product_id: r.product_id,
          product_variant_id: r.product_variant_id,
          quantity: r.quantity,
          is_active: true
        }));
      } else {
        // For discount rewards, check for discount_amount and discount_type
        validRewards = rewards.filter(r => r.discount_amount && r.discount_amount > 0 && r.discount_type);
        validRewards = validRewards.map(r => ({
          discount_amount: r.discount_amount,
          discount_type: r.discount_type as 'percentage' | 'fixed',
          is_active: true
        }));
      }

      // Ensure arrays are not empty
      if (cleanedConditions.length === 0) {
        showNotification("error", "خطأ!", "يرجى إضافة شرط واحد على الأقل");
        return;
      }

      if (validRewards.length === 0) {
        if (formData.reward_type === "products") {
          showNotification("error", "خطأ!", "يرجى اختيار منتج ومتغير للمكافأة");
        } else {
          showNotification("error", "خطأ!", "يرجى إدخال مبلغ ونوع الخصم للمكافأة");
        }
        return;
      }

      // Debug log
      console.log("Updating offer with data:", {
        offer_start_date: formData.offer_start_date,
        offer_end_date: formData.offer_end_date,
        is_active: formData.is_active,
        type: formData.type,
        points: parseInt(formData.points),
        reward_type: formData.reward_type,
        charity_id: formData.charity_id || undefined,
        conditions: cleanedConditions,
        rewards: validRewards,
      });

      const updateData: any = {
        offer_start_date: formData.offer_start_date,
        offer_end_date: formData.offer_end_date,
        is_active: formData.is_active,
        type: formData.type,
        points: parseInt(formData.points),
        reward_type: formData.reward_type,
        charity_id: formData.charity_id || undefined,
        conditions: cleanedConditions,
        rewards: validRewards,
      };

      // Only include image if a new one was selected
      if (formData.image) {
        updateData.image = formData.image;
      }

      const result = await updateOffer({
        id: offerId,
        offerData: updateData,
      }).unwrap();

      if (result.success) {
        showNotification("success", "نجح!", "تم تحديث العرض بنجاح");
        setTimeout(() => {
          router.push("/offers");
        }, 1200);
      }
    } catch (err: any) {
      console.log("Update error:", err);
      
      // Handle validation errors
      if (err?.data?.errors) {
        const errors = err.data.errors;
        const newNestedErrors: Record<string, string[]> = {};
        
        // Parse nested errors like "conditions.0.quantity" or "rewards.0.quantity"
        Object.keys(errors).forEach(key => {
          if (key.includes('.')) {
            newNestedErrors[key] = errors[key];
          }
        });
        
        setNestedErrors(newNestedErrors);
        
        // Show general error message
        showNotification("error", "خطأ في التحقق!", err?.data?.message || "يرجى تصحيح الأخطاء في النموذج");
      } else {
        showNotification("error", "خطأ!", err?.data?.message || "فشل في تحديث العرض");
      }
    }
  };

  if (loadingOffer) {
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
            <p className="text-sm text-dark dark:text-white">فشل في تحميل بيانات العرض</p>
          </div>
        </div>
      </div>
    );
  }

  if (!offerData?.data) {
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
            <p className="text-sm text-dark dark:text-white">العرض غير موجود</p>
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
            <Link href="/offers">
              <button className="h-10 w-10 rounded-full hover:bg-lightprimary dark:hover:bg-darkprimary flex items-center justify-center transition-colors">
                <Icon icon="solar:arrow-right-bold" height={20} className="text-dark dark:text-white" />
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-dark dark:text-white">تعديل العرض</h1>
          </div>
          <p className="text-sm text-ld mr-12">تحديث معلومات العرض: #{offerData.data.id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <Card>
          <h2 className="text-xl font-semibold text-dark dark:text-white mb-4">المعلومات الأساسية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Upload - Full Row */}
            <div className="md:col-span-2">
              <Label htmlFor="image" className="mb-2 block">صورة العرض</Label>
              
              {/* File Input and Image Preview Side by Side */}
              <div className="flex items-center gap-6">
                <label
                  htmlFor="image"
                  className={`flex-1 cursor-pointer ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="border-2 border-dashed border-ld rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <Icon icon="solar:cloud-upload-bold" height={32} className="text-ld mx-auto mb-2" />
                    <p className="text-sm text-ld mb-1">انقر لرفع صورة جديدة للعرض</p>
                    <p className="text-xs text-ld">JPEG, JPG, PNG, WebP, GIF (الحد الأقصى 5MB)</p>
                  </div>
                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleImageChange}
                    disabled={updating}
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
                        disabled={updating}
                        className="absolute -top-2 -right-2 h-6 w-6 bg-error text-white rounded-full flex items-center justify-center hover:bg-error/90 transition-colors"
                      >
                        <Icon icon="solar:close-circle-bold" height={14} />
                      </button>
                    </div>
                  ) : offerData.data.image ? (
                    <div className="relative">
                      <div className="w-40 h-40 rounded-lg overflow-hidden border border-ld">
                        <img
                          src={offerData.data.image}
                          alt="Current offer image"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-40 h-40 rounded-lg bg-lightgray dark:bg-darkgray flex items-center justify-center border border-ld">
                      <Icon icon="solar:gallery-bold" height={32} className="text-ld" />
                    </div>
                  )}
                </div>
              </div>
              
              <p className="mt-1 text-xs text-gray-500">اختر صورة جديدة للعرض (اختياري)</p>
            </div>

            {/* Points, Dates, and Reward Type in One Row */}
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <Label htmlFor="points" className="mb-2 block">النقاط التي سيحصل عليها العميل <span className="text-error">*</span></Label>
                  <TextInput
                    id="points"
                    name="points"
                    type="number"
                    min="0"
                    value={formData.points}
                    onChange={handleInputChange}
                    required
                    icon={() => <Icon icon="solar:star-bold" height={18} />}
                  />
                  {fieldErrors.points ? (
                    <p className="mt-1 text-xs text-error">{fieldErrors.points}</p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500">عدد النقاط التي سيحصل عليها العميل</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="offer_start_date" className="mb-2 block">تاريخ البداية <span className="text-error">*</span></Label>
                  <TextInput
                    id="offer_start_date"
                    name="offer_start_date"
                    type="date"
                    value={formData.offer_start_date}
                    onChange={handleInputChange}
                    required
                    icon={() => <Icon icon="solar:calendar-bold" height={18} />}
                  />
                  {fieldErrors.offer_start_date ? (
                    <p className="mt-1 text-xs text-error">{fieldErrors.offer_start_date}</p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500">تاريخ بداية العرض</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="offer_end_date" className="mb-2 block">تاريخ النهاية <span className="text-error">*</span></Label>
                  <TextInput
                    id="offer_end_date"
                    name="offer_end_date"
                    type="date"
                    value={formData.offer_end_date}
                    onChange={handleInputChange}
                    required
                    icon={() => <Icon icon="solar:calendar-bold" height={18} />}
                  />
                  {fieldErrors.offer_end_date ? (
                    <p className="mt-1 text-xs text-error">{fieldErrors.offer_end_date}</p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500">تاريخ انتهاء العرض</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="reward_type" className="mb-2 block">نوع المكافأة <span className="text-error">*</span></Label>
                  <Select
                    id="reward_type"
                    name="reward_type"
                    value={formData.reward_type}
                    onChange={handleInputChange}
                    required
                    className="select-md"
                  >
                    <option value="products">منتجات</option>
                    <option value="discount">خصم</option>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">نوع العرض <span className="text-error">*</span></Label>
              <div className="flex gap-6">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="type_normal"
                    name="type"
                    value="normal"
                    checked={formData.type === "normal"}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary"
                  />
                  <Label htmlFor="type_normal" className="ml-2 text-sm font-medium text-dark dark:text-white">
                    عرض عادي
                  </Label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="type_charity"
                    name="type"
                    value="charity"
                    checked={formData.type === "charity"}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary"
                  />
                  <Label htmlFor="type_charity" className="ml-2 text-sm font-medium text-dark dark:text-white">
                    عرض خيري
                  </Label>
                </div>
              </div>
            </div>

            {formData.type === "charity" && (
              <div>
                <Label htmlFor="charity_id" className="mb-2 block">الجمعية الخيرية</Label>
                <Select
                  id="charity_id"
                  name="charity_id"
                  value={formData.charity_id}
                  onChange={handleInputChange}
                  className="select-md"
                >
                  <option value={0}>اختر الجمعية الخيرية</option>
                  {charitiesData?.data?.map((charity: any) => (
                    <option key={charity.id} value={charity.id}>
                      {charity.name_ar}
                    </option>
                  ))}
                </Select>
                {fieldErrors.charity_id ? (
                  <p className="mt-1 text-xs text-error">{fieldErrors.charity_id}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">اختر الجمعية الخيرية المرتبطة بالعرض (اختياري)</p>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
              />
              <Label htmlFor="is_active">العرض نشط</Label>
            </div>
          </div>
        </Card>

        {/* Conditions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-dark dark:text-white">شروط العرض</h2>
            <Button type="button" size="sm" onClick={addCondition}>
              <Icon icon="solar:add-circle-bold" height={16} className="ml-1" />
              إضافة منتج
            </Button>
          </div>
          
          {fieldErrors.conditions && (
            <p className="text-xs text-error mb-4">{fieldErrors.conditions}</p>
          )}

          <div className="space-y-4">
            {conditions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Icon icon="solar:info-circle-bold" height={32} className="mx-auto mb-2" />
                <p>لا توجد شروط مضافة</p>
                <p className="text-sm">اضغط على "إضافة منتج" لإضافة منتج جديد</p>
              </div>
            ) : (
              conditions.map((condition, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <Label className="mb-1 block">المنتج</Label>
                  <SearchableSelect
                    value={condition.product_id}
                    onChange={(value) => updateCondition(index, "product_id", value)}
                    placeholder="اختر المنتج"
                    showImage={true}
                    type="product"
                  />
                </div>
                <div>
                  <Label className="mb-1 block">متغير المنتج</Label>
                  <SearchableSelect
                    value={condition.product_variant_id}
                    onChange={(value) => updateCondition(index, "product_variant_id", value)}
                    placeholder="اختر المتغير"
                    showImage={true}
                    showSize={true}
                    type="variant"
                    parentProductId={condition.product_id}
                  />
                </div>
                <div>
                  <Label className="mb-1 block">الكمية</Label>
                  <TextInput
                    type="number"
                    min="1"
                    value={condition.quantity}
                    onChange={(e) => updateCondition(index, "quantity", parseInt(e.target.value) || 1)}
                    placeholder="الكمية"
                    color={getNestedError("conditions", index, "quantity") ? "error" : undefined}
                  />
                  {getNestedError("conditions", index, "quantity") && (
                    <p className="mt-1 text-xs text-error">{getNestedError("conditions", index, "quantity")}</p>
                  )}
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    size="sm"
                    color="red"
                    onClick={() => removeCondition(index)}
                    disabled={conditions.length <= 1}
                  >
                    <Icon icon="solar:trash-bin-trash-bold" height={16} />
                  </Button>
                </div>
              </div>
            ))
            )}
          </div>
        </Card>

        {/* Rewards */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-dark dark:text-white">المكافآت</h2>
            <Button type="button" size="sm" onClick={addReward}>
              <Icon icon="solar:add-circle-bold" height={16} className="ml-1" />
              إضافة مكافأة
            </Button>
          </div>
          
          {fieldErrors.rewards && (
            <p className="text-xs text-error mb-4">{fieldErrors.rewards}</p>
          )}

          <div className="space-y-4">
            {rewards.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Icon icon="solar:info-circle-bold" height={32} className="mx-auto mb-2" />
                <p>لا توجد مكافآت مضافة</p>
                <p className="text-sm">اضغط على "إضافة مكافأة" لإضافة مكافأة جديدة</p>
              </div>
            ) : (
              rewards.map((reward, index) => (
              <div key={index} className={`grid gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg ${
                formData.reward_type === "discount" 
                  ? "grid-cols-1 md:grid-cols-3" 
                  : "grid-cols-1 md:grid-cols-4"
              }`}>
                {/* Product Fields - Only show when reward_type is "products" */}
                {formData.reward_type === "products" && (
                  <>
                    <div>
                      <Label className="mb-1 block">المنتج</Label>
                      <SearchableSelect
                        value={reward.product_id}
                        onChange={(value) => updateReward(index, "product_id", value)}
                        placeholder="اختر المنتج"
                        showImage={true}
                        type="product"
                      />
                    </div>
                    <div>
                      <Label className="mb-1 block">متغير المنتج</Label>
                      <SearchableSelect
                        value={reward.product_variant_id}
                        onChange={(value) => updateReward(index, "product_variant_id", value)}
                        placeholder="اختر المتغير"
                        showImage={true}
                        showSize={true}
                        type="variant"
                        parentProductId={reward.product_id}
                      />
                    </div>
                    <div>
                      <Label className="mb-1 block">الكمية</Label>
                      <TextInput
                        type="number"
                        min="1"
                        value={reward.quantity}
                        onChange={(e) => updateReward(index, "quantity", parseInt(e.target.value) || 1)}
                        placeholder="الكمية"
                        color={getNestedError("rewards", index, "quantity") ? "error" : undefined}
                      />
                      {getNestedError("rewards", index, "quantity") && (
                        <p className="mt-1 text-xs text-error">{getNestedError("rewards", index, "quantity")}</p>
                      )}
                    </div>
                  </>
                )}
                
                {/* Discount Fields - Only show when reward_type is "discount" */}
                {formData.reward_type === "discount" && (
                  <>
                    <div>
                      <Label className="mb-1 block">القيمة</Label>
                      <TextInput
                        type="number"
                        step="0.01"
                        min="0"
                        value={reward.discount_amount || ""}
                        onChange={(e) => updateReward(index, "discount_amount", parseFloat(e.target.value) || 0)}
                        placeholder="القيمة"
                      />
                    </div>
                    <div>
                      <Label className="mb-1 block">نوع الخصم</Label>
                      <Select
                        value={reward.discount_type || "percentage"}
                        onChange={(e) => updateReward(index, "discount_type", e.target.value)}
                        className="select-md"
                      >
                        <option value="percentage">نسبة مئوية</option>
                        <option value="fixed">مبلغ ثابت</option>
                      </Select>
                    </div>
                  </>
                )}
                
                {/* Remove Button */}
                <div className="flex items-end">
                  <Button
                    type="button"
                    size="sm"
                    color="red"
                    onClick={() => removeReward(index)}
                    disabled={rewards.length <= 1}
                  >
                    <Icon icon="solar:trash-bin-trash-bold" height={16} />
                  </Button>
                </div>
              </div>
            ))
            )}
          </div>
        </Card>

        {/* Submit Button */}
        <Card>
          <div className="flex items-center justify-end gap-3">
            <Link href="/offers">
              <Button type="button" color="gray">إلغاء</Button>
            </Link>
            <Button type="submit" disabled={updating} className="bg-primary hover:bg-primary/90">
              {updating ? (
                <>
                  <Spinner size="sm" className="ml-2" />
                  جاري التحديث...
                </>
              ) : (
                <>
                  <Icon icon="solar:check-circle-bold" height={20} className="ml-2" />
                  تحديث العرض
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default EditOfferPage;
