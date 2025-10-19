"use client";
import React, { useState } from "react";
import { Card, Badge, Spinner, Button } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetProductByIdQuery, useDeleteProductMutation } from "@/store/api/productsApi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/app/context/NotificationContext";
import ConfirmModal from "@/components/shared/ConfirmModal";
import Image from "next/image";

interface ProductShowProps {
  params: {
    id: string;
  };
}

const ProductShow = ({ params }: ProductShowProps) => {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: productData, isLoading, error } = useGetProductByIdQuery(parseInt(params.id));

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProduct(parseInt(params.id)).unwrap();
      showNotification("success", "تم!", "تم حذف المنتج بنجاح");
      router.push('/products');
    } catch (err: any) {
      console.error("Delete product error:", err);
      showNotification("error", "خطأ!", "حدث خطأ أثناء حذف المنتج");
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge color={isActive ? "success" : "failure"} className="w-fit">
        {isActive ? "نشط" : "غير نشط"}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'KWD',
      currencyDisplay: 'name',
    }).format(price).replace('دينار كويتي', 'دينار كوبتي');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error || !productData?.data) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <Icon icon="solar:danger-circle-bold" height={64} className="text-error mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-dark dark:text-white mb-2">لم يتم العثور على المنتج</h2>
        <p className="text-ld mb-6">المنتج المطلوب غير موجود أو تم حذفه</p>
        <Link href="/products">
          <Button color="primary">
            <Icon icon="solar:arrow-right-bold" height={20} className="ml-2" />
            العودة إلى المنتجات
          </Button>
        </Link>
      </div>
    );
  }

  const product = productData.data;

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
            <h1 className="text-3xl font-bold text-dark dark:text-white">تفاصيل المنتج</h1>
          </div>
          <p className="text-sm text-ld mr-12">عرض تفاصيل المنتج ومتغيراته</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/products/edit/${product.id}`}>
            <Button color="primary" className="flex items-center gap-2">
              <Icon icon="solar:pen-bold" height={20} />
              تعديل المنتج
            </Button>
          </Link>
          <Button color="failure" onClick={handleDeleteClick} className="flex items-center gap-2">
            <Icon icon="solar:trash-bin-minimalistic-bold" height={20} />
            حذف المنتج
          </Button>
        </div>
      </div>

      {/* Product Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Product Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-dark dark:text-white">المعلومات الأساسية</h2>
              {getStatusBadge(product.is_active)}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-ld dark:text-white/70 block mb-2">اسم المنتج (العربية)</label>
                <p className="text-lg font-semibold text-dark dark:text-white">{product.name_ar}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-ld dark:text-white/70 block mb-2">اسم المنتج (الإنجليزية)</label>
                <p className="text-lg font-semibold text-dark dark:text-white">{product.name_en}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-ld dark:text-white/70 block mb-2">رمز المنتج</label>
                <p className="font-mono text-dark dark:text-white bg-lightgray dark:bg-darkgray px-3 py-2 rounded-lg">{product.sku}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-ld dark:text-white/70 block mb-2">التصنيف الرئيسي</label>
                <p className="text-dark dark:text-white">{product.category?.name_ar} - {product.category?.name_en}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-ld dark:text-white/70 block mb-2">التصنيف الفرعي</label>
                <p className="text-dark dark:text-white">{product.subcategory?.name_ar} - {product.subcategory?.name_en}</p>
              </div>
            </div>
          </Card>

          {/* Descriptions */}
          <Card>
            <h2 className="text-xl font-semibold text-dark dark:text-white mb-6">الوصف</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-ld dark:text-white/70 block mb-2">الوصف (العربية)</label>
                <div className="bg-lightgray dark:bg-darkgray p-4 rounded-lg">
                  <p className="text-dark dark:text-white leading-relaxed">
                    {product.description_ar || "لا يوجد وصف باللغة العربية"}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-ld dark:text-white/70 block mb-2">الوصف (الإنجليزية)</label>
                <div className="bg-lightgray dark:bg-darkgray p-4 rounded-lg">
                  <p className="text-dark dark:text-white leading-relaxed">
                    {product.description_en || "لا يوجد وصف باللغة الإنجليزية"}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Product Variants */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-dark dark:text-white">متغيرات المنتج</h2>
              <Badge color="info" className="w-fit">
                {product.variants?.length || 0} متغير
              </Badge>
            </div>
            
            <div className="space-y-4">
              {product.variants && product.variants.length > 0 ? (
                product.variants.map((variant, index) => (
                  <div key={variant.id || index} className="border border-ld rounded-lg p-4 hover:bg-lightgray dark:hover:bg-darkgray transition-colors">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Variant Image */}
                      <div className="flex items-center justify-center">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-lightgray dark:bg-darkgray">
                          {variant.image && typeof variant.image === 'string' ? (
                            <Image
                              src={variant.image}
                              alt={variant.short_item || `متغير ${index + 1}`}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Icon icon="solar:gallery-bold" height={32} className="text-ld" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Variant Details */}
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs font-medium text-ld dark:text-white/70 block">الحجم</label>
                          <p className="text-sm font-semibold text-dark dark:text-white">{variant.size}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-ld dark:text-white/70 block">رمز المتغير</label>
                          <p className="text-xs font-mono text-dark dark:text-white bg-lightgray dark:bg-darkgray px-2 py-1 rounded">{variant.sku}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs font-medium text-ld dark:text-white/70 block">الاسم المختصر</label>
                          <p className="text-sm text-dark dark:text-white">{variant.short_item}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-ld dark:text-white/70 block">الكمية</label>
                          <p className="text-sm font-semibold text-dark dark:text-white">{variant.quantity}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs font-medium text-ld dark:text-white/70 block">السعر</label>
                          <p className="text-lg font-bold text-primary">{formatPrice(variant.price)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(variant.is_active)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Icon icon="solar:layers-bold" height={48} className="text-ld mx-auto mb-4" />
                  <p className="text-ld dark:text-white/70">لا توجد متغيرات لهذا المنتج</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          {/* Product Image */}
          <Card>
            <h2 className="text-xl font-semibold text-dark dark:text-white mb-4">صورة المنتج</h2>
            <div className="flex justify-center">
              <div className="w-48 h-48 rounded-lg overflow-hidden bg-lightgray dark:bg-darkgray">
                {product.variants?.[0]?.image && typeof product.variants[0].image === 'string' ? (
                  <Image
                    src={product.variants[0].image}
                    alt={product.name_ar}
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon icon="solar:gallery-bold" height={64} className="text-ld" />
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Product Statistics */}
          <Card>
            <h2 className="text-xl font-semibold text-dark dark:text-white mb-4">إحصائيات المنتج</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-lightgray dark:bg-darkgray rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:layers-bold" height={20} className="text-primary" />
                  <span className="text-sm font-medium text-dark dark:text-white">عدد المتغيرات</span>
                </div>
                <Badge color="info">{product.variants?.length || 0}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-lightgray dark:bg-darkgray rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:box-bold" height={20} className="text-primary" />
                  <span className="text-sm font-medium text-dark dark:text-white">إجمالي الكمية</span>
                </div>
                <Badge color="success">
                  {product.variants?.reduce((total, variant) => total + (variant.quantity || 0), 0) || 0}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-lightgray dark:bg-darkgray rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:dollar-bold" height={20} className="text-primary" />
                  <span className="text-sm font-medium text-dark dark:text-white">أقل سعر</span>
                </div>
                <Badge color="warning">
                  {product.variants && product.variants.length > 0 
                    ? formatPrice(Math.min(...product.variants.map(v => v.price || 0)))
                    : "غير محدد"
                  }
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-lightgray dark:bg-darkgray rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:dollar-bold" height={20} className="text-primary" />
                  <span className="text-sm font-medium text-dark dark:text-white">أعلى سعر</span>
                </div>
                <Badge color="warning">
                  {product.variants && product.variants.length > 0 
                    ? formatPrice(Math.max(...product.variants.map(v => v.price || 0)))
                    : "غير محدد"
                  }
                </Badge>
              </div>
            </div>
          </Card>

          {/* Timestamps */}
          <Card>
            <h2 className="text-xl font-semibold text-dark dark:text-white mb-4">معلومات التاريخ</h2>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-ld dark:text-white/70 block mb-1">تاريخ الإنشاء</label>
                <p className="text-sm text-dark dark:text-white">{formatDate(product.created_at)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-ld dark:text-white/70 block mb-1">آخر تحديث</label>
                <p className="text-sm text-dark dark:text-white">{formatDate(product.updated_at)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف المنتج "${product.name_ar}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        cancelText="إلغاء"
        isLoading={deleting}
        type="danger"
      />
    </div>
  );
};

export default ProductShow;
