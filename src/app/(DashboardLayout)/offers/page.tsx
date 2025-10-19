"use client";
import React, { useState } from "react";
import { Card, Button, Spinner, Badge } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetOffersQuery, useDeleteOfferMutation } from "@/store/api/offersApi";
import { useNotification } from "@/app/context/NotificationContext";
import Link from "next/link";
import Image from "next/image";
import ConfirmModal from "@/components/shared/ConfirmModal";

const OffersPage = () => {
  const { showNotification } = useNotification();
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<number | null>(null);

  const { data: offersData, isLoading, error } = useGetOffersQuery({
    page: currentPage,
    per_page: 10,
  });

  const [deleteOffer, { isLoading: deleting }] = useDeleteOfferMutation();

  const handleDeleteClick = (offerId: number) => {
    setOfferToDelete(offerId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!offerToDelete) return;
    
    try {
      const result = await deleteOffer(offerToDelete).unwrap();
      if (result.success) {
        showNotification("success", "نجح!", "تم حذف العرض بنجاح");
        setShowDeleteModal(false);
        setOfferToDelete(null);
      }
    } catch (err: any) {
      showNotification("error", "خطأ!", err?.data?.message || "فشل في حذف العرض");
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setOfferToDelete(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getStatusBadge = (isActive: boolean, startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!isActive) {
      return <Badge color="red">غير نشط</Badge>;
    }

    if (now < start) {
      return <Badge color="yellow">قريباً</Badge>;
    }

    if (now > end) {
      return <Badge color="red">منتهي</Badge>;
    }

    return <Badge color="green">نشط</Badge>;
  };

  const getTypeBadge = (type: string) => {
    return type === "charity" ? (
      <Badge color="purple">خيري</Badge>
    ) : (
      <Badge color="blue">عادي</Badge>
    );
  };

  const getRewardTypeBadge = (rewardType: string) => {
    return rewardType === "products" ? (
      <Badge color="green">منتجات</Badge>
    ) : (
      <Badge color="primary">خصم</Badge>
    );
  };

  if (isLoading) {
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
            <p className="text-sm text-dark dark:text-white">فشل في تحميل العروض</p>
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
          <h1 className="text-3xl font-bold text-dark dark:text-white">إدارة العروض</h1>
          <p className="text-sm text-ld">عرض وإدارة جميع العروض المتاحة</p>
        </div>
        <Link href="/offers/add">
          <Button className="bg-primary hover:bg-primary/90">
            <Icon icon="solar:add-circle-bold" height={20} className="ml-2" />
            إضافة عرض جديد
          </Button>
        </Link>
      </div>


      {/* Offers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offersData?.data?.map((offer) => (
          <Card key={offer.id} className="overflow-hidden">
            <div className="relative">
              <Image
                src={offer.image}
                alt={`عرض ${offer.id}`}
                width={400}
                height={200}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                {getStatusBadge(offer.is_active, offer.offer_start_date, offer.offer_end_date)}
                {getTypeBadge(offer.type)}
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-dark dark:text-white">
                  عرض #{offer.id}
                </h3>
                {getRewardTypeBadge(offer.reward_type)}
              </div>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:calendar-bold" height={16} />
                  <span>من: {formatDate(offer.offer_start_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="solar:calendar-bold" height={16} />
                  <span>إلى: {formatDate(offer.offer_end_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="solar:star-bold" height={16} />
                  <span>{offer.points} نقطة</span>
                </div>
                {offer.charity && (
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:heart-bold" height={16} />
                    <span>{offer.charity.name_ar}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <Link href={`/offers/edit/${offer.id}`}>
                    <Button size="sm" color="blue">
                      <Icon icon="solar:pen-bold" height={16} />
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    color="red"
                    onClick={() => handleDeleteClick(offer.id)}
                    disabled={deleting}
                  >
                    <Icon icon="solar:trash-bin-trash-bold" height={16} />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* No Data */}
      {offersData?.data?.length === 0 && (
        <Card className="text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Icon icon="solar:gift-bold" height={32} className="text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">
                لا توجد عروض
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                لم يتم العثور على أي عروض مطابقة لمعايير البحث
              </p>
              <Link href="/offers/add">
                <Button className="bg-primary hover:bg-primary/90">
                  <Icon icon="solar:add-circle-bold" height={20} className="ml-2" />
                  إضافة عرض جديد
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {offersData?.pagination && offersData.pagination.last_page > 1 && (
        <Card>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              عرض {offersData.pagination.from} إلى {offersData.pagination.to} من {offersData.pagination.total} عرض
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                color="gray"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <Icon icon="solar:arrow-left-bold" height={16} />
              </Button>
              <span className="px-3 py-1 text-sm text-dark dark:text-white">
                {currentPage} من {offersData.pagination.last_page}
              </span>
              <Button
                size="sm"
                color="gray"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === offersData.pagination.last_page}
              >
                <Icon icon="solar:arrow-right-bold" height={16} />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="حذف العرض"
        message="هل أنت متأكد من حذف هذا العرض؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        isLoading={deleting}
        type="danger"
      />
    </div>
  );
};

export default OffersPage;
