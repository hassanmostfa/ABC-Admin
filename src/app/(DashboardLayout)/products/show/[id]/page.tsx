"use client";
import React, { useState } from "react";
import { use } from "react";
import { Card, Badge, Spinner, Button } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetProductByIdQuery, useDeleteProductMutation } from "@/store/api/productsApi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/app/context/NotificationContext";
import ConfirmModal from "@/components/shared/ConfirmModal";
import Image from "next/image";
import { useTranslation } from "react-i18next";

interface ProductShowProps {
  params: Promise<{ id: string }>;
}

const ProductShow = ({ params }: ProductShowProps) => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { showNotification } = useNotification();
  const resolvedParams = use(params);
  const productId = parseInt(resolvedParams.id);
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { data: productData, isLoading, error } = useGetProductByIdQuery(productId);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProduct(productId).unwrap();
      showNotification("success", t("products.success"), t("products.deleteSuccess"));
      router.push('/products');
    } catch (err: any) {
      console.error("Delete product error:", err);
      showNotification("error", t("products.error"), t("products.deleteError"));
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge color={isActive ? "success" : "failure"} className="w-fit">
        {isActive ? t("products.active") : t("products.inactive")}
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
    const locale = i18n.language?.startsWith("ar") ? "ar-SA" : "en-US";
    const formattedNumber = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(price);
    return `${formattedNumber} ${t("products.currencyKwd")}`;
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
        <h2 className="text-2xl font-bold text-dark dark:text-white mb-2">{t("products.productNotFound")}</h2>
        <p className="text-ld mb-6">{t("products.productNotFoundDescription")}</p>
        <Link href="/products">
          <Button color="primary">
            <Icon icon="solar:arrow-right-bold" height={20} className="ml-2" />
            {t("products.backToProducts")}
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
            <h1 className="text-3xl font-bold text-dark dark:text-white">{t("products.showProduct")}</h1>
          </div>
          <p className="text-sm text-ld mr-12">{t("products.showDescription")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/products/edit/${product.id}`}>
            <Button color="primary" className="flex items-center gap-2">
              <Icon icon="solar:pen-bold" height={20} />
              {t("products.editProduct")}
            </Button>
          </Link>
          <Button color="failure" onClick={handleDeleteClick} className="flex items-center gap-2">
            <Icon icon="solar:trash-bin-minimalistic-bold" height={20} />
            {t("products.delete")} {t("products.title")}
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
              <h2 className="text-xl font-semibold text-dark dark:text-white">{t("products.basicInfo")}</h2>
              {getStatusBadge(product.is_active)}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-ld dark:text-white/70 block mb-2">{t("products.nameAr")}</label>
                <p className="text-lg font-semibold text-dark dark:text-white">{product.name_ar}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-ld dark:text-white/70 block mb-2">{t("products.nameEn")}</label>
                <p className="text-lg font-semibold text-dark dark:text-white">{product.name_en}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-ld dark:text-white/70 block mb-2">{t("products.sku")}</label>
                <p className="font-mono text-dark dark:text-white bg-lightgray dark:bg-darkgray px-3 py-2 rounded-lg">{product.sku}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-ld dark:text-white/70 block mb-2">{t("products.mainCategory")}</label>
                <p className="text-dark dark:text-white">{product.category?.name_ar} - {product.category?.name_en}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-ld dark:text-white/70 block mb-2">{t("products.subCategory")}</label>
                <p className="text-dark dark:text-white">{product.subcategory?.name_ar} - {product.subcategory?.name_en}</p>
              </div>
            </div>
          </Card>

          {/* Descriptions */}
          <Card>
            <h2 className="text-xl font-semibold text-dark dark:text-white mb-6">{t("products.description")}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-ld dark:text-white/70 block mb-2">{t("products.descriptionArLabel")}</label>
                <div className="bg-lightgray dark:bg-darkgray p-4 rounded-lg">
                  <p className="text-dark dark:text-white leading-relaxed">
                    {product.description_ar || t("products.noDescriptionAr")}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-ld dark:text-white/70 block mb-2">{t("products.descriptionEnLabel")}</label>
                <div className="bg-lightgray dark:bg-darkgray p-4 rounded-lg">
                  <p className="text-dark dark:text-white leading-relaxed">
                    {product.description_en || t("products.noDescriptionEn")}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Product Variants */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-dark dark:text-white">{t("products.productVariants")}</h2>
              <Badge color="info" className="w-fit">
                {product.variants?.length || 0} {t("products.variant")}
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
                              alt={variant.short_item || t("products.variantNumber", { number: index + 1 })}
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
                          <label className="text-xs font-medium text-ld dark:text-white/70 block">{t("products.size")}</label>
                          <p className="text-sm font-semibold text-dark dark:text-white">{variant.size}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-ld dark:text-white/70 block">{t("products.variantCode")}</label>
                          <p className="text-xs font-mono text-dark dark:text-white bg-lightgray dark:bg-darkgray px-2 py-1 rounded">{variant.sku}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs font-medium text-ld dark:text-white/70 block">{t("products.shortName")}</label>
                          <p className="text-sm text-dark dark:text-white">{variant.short_item}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-ld dark:text-white/70 block">{t("products.quantity")}</label>
                          <p className="text-sm font-semibold text-dark dark:text-white">{variant.quantity}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs font-medium text-ld dark:text-white/70 block">{t("products.price")}</label>
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
                  <p className="text-ld dark:text-white/70">{t("products.noVariants")}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          {/* Product Image */}
          <Card>
            <h2 className="text-xl font-semibold text-dark dark:text-white mb-4">{t("products.productImage")}</h2>
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
            <h2 className="text-xl font-semibold text-dark dark:text-white mb-4">{t("products.statistics")}</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-lightgray dark:bg-darkgray rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:layers-bold" height={20} className="text-primary" />
                  <span className="text-sm font-medium text-dark dark:text-white">{t("products.variantCount")}</span>
                </div>
                <Badge color="info">{product.variants?.length || 0}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-lightgray dark:bg-darkgray rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:box-bold" height={20} className="text-primary" />
                  <span className="text-sm font-medium text-dark dark:text-white">{t("products.totalQuantity")}</span>
                </div>
                <Badge color="success">
                  {product.variants?.reduce((total, variant) => total + (variant.quantity || 0), 0) || 0}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-lightgray dark:bg-darkgray rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:dollar-bold" height={20} className="text-primary" />
                  <span className="text-sm font-medium text-dark dark:text-white">{t("products.minPrice")}</span>
                </div>
                <Badge color="warning">
                  {product.variants && product.variants.length > 0 
                    ? formatPrice(Math.min(...product.variants.map(v => v.price || 0)))
                    : t("products.notSpecified")
                  }
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-lightgray dark:bg-darkgray rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:dollar-bold" height={20} className="text-primary" />
                  <span className="text-sm font-medium text-dark dark:text-white">{t("products.maxPrice")}</span>
                </div>
                <Badge color="warning">
                  {product.variants && product.variants.length > 0 
                    ? formatPrice(Math.max(...product.variants.map(v => v.price || 0)))
                    : t("products.notSpecified")
                  }
                </Badge>
              </div>
            </div>
          </Card>

          {/* Timestamps */}
          <Card>
            <h2 className="text-xl font-semibold text-dark dark:text-white mb-4">{t("products.dateInfo")}</h2>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-ld dark:text-white/70 block mb-1">{t("products.createdAt")}</label>
                <p className="text-sm text-dark dark:text-white">{formatDate(product.created_at)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-ld dark:text-white/70 block mb-1">{t("products.updatedAt")}</label>
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
        title={t("products.confirmDelete")}
        message={t("products.deleteMessage", { name: product.name_ar })}
        confirmText={t("products.delete")}
        cancelText={t("products.cancel")}
        isLoading={deleting}
        type="danger"
      />
    </div>
  );
};

export default ProductShow;