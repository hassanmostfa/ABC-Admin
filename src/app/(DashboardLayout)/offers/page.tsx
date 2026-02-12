"use client";
import React, { useState } from "react";
import { Card, Button, Spinner, Badge } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetOffersQuery, useDeleteOfferMutation } from "@/store/api/offersApi";
import { useNotification } from "@/app/context/NotificationContext";
import Link from "next/link";
import Image from "next/image";
import ConfirmModal from "@/components/shared/ConfirmModal";
import HasPermission from "@/components/shared/HasPermission";
import { useTranslation } from "react-i18next";

const OffersPage = () => {
  const { t, i18n } = useTranslation();
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
        showNotification("success", t("offers.success"), t("offers.deleteSuccess"));
        setShowDeleteModal(false);
        setOfferToDelete(null);
      }
    } catch (err: any) {
      showNotification("error", t("offers.error"), err?.data?.message || t("offers.deleteError"));
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setOfferToDelete(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) {
      return <Badge color="red">{t("offers.statusInactive")}</Badge>;
    }

    if (status === "expired") {
      return <Badge color="red">{t("offers.statusExpired")}</Badge>;
    }

    return <Badge color="green">{t("offers.statusActive")}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    return type === "charity" ? (
      <Badge color="purple">{t("offers.typeCharity")}</Badge>
    ) : (
      <Badge color="blue">{t("offers.typeNormal")}</Badge>
    );
  };

  const getRewardTypeBadge = (rewardType: string) => {
    return rewardType === "products" ? (
      <Badge color="green">{t("offers.rewardTypeProducts")}</Badge>
    ) : (
      <Badge color="primary">{t("offers.rewardTypeDiscount")}</Badge>
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
            <h3 className="text-lg font-semibold text-error mb-1">{t("offers.error")}</h3>
            <p className="text-sm text-dark dark:text-white">{t("offers.loadError")}</p>
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
          <h1 className="text-3xl font-bold text-dark dark:text-white">{t("offers.title")}</h1>
          <p className="text-sm text-ld">{t("offers.subtitle")}</p>
        </div>
        <HasPermission resource="offers" action="add">
          <Link href="/offers/add">
            <Button className="bg-primary hover:bg-primary/90">
              <Icon icon="solar:add-circle-bold" height={20} className="ml-2" />
              {t("offers.addNew")}
            </Button>
          </Link>
        </HasPermission>
      </div>


      {/* Offers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offersData?.data?.map((offer) => (
          <Card key={offer.id} className="overflow-hidden">
            <div className="relative">
              <Image
                src={offer.image}
                alt={t("offers.offerNumber", { id: offer.id })}
                width={400}
                height={200}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                {getStatusBadge(offer.status, offer.is_active)}
                {getTypeBadge(offer.type)}
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-dark dark:text-white">
                  {i18n.language === 'ar' 
                    ? (offer.title_ar || t("offers.offerNumber", { id: offer.id }))
                    : (offer.title_en || t("offers.offerNumber", { id: offer.id }))}
                </h3>
                {getRewardTypeBadge(offer.reward_type)}
              </div>

              {(offer.description_ar || offer.description_en) && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {i18n.language === 'ar' ? offer.description_ar : offer.description_en}
                </p>
              )}

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:calendar-bold" height={16} />
                  <span>{t("offers.from")}: {formatDate(offer.offer_start_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="solar:calendar-bold" height={16} />
                  <span>{t("offers.to")}: {formatDate(offer.offer_end_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="solar:star-bold" height={16} />
                  <span>{offer.points} {t("offers.points")}</span>
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
                  <HasPermission resource="offers" action="edit">
                    <Link href={`/offers/edit/${offer.id}`}>
                      <Button size="sm" color="blue">
                        <Icon icon="solar:pen-bold" height={16} />
                      </Button>
                    </Link>
                  </HasPermission>
                  <HasPermission resource="offers" action="delete">
                    <Button 
                      size="sm" 
                      color="red"
                      onClick={() => handleDeleteClick(offer.id)}
                      disabled={deleting}
                    >
                      <Icon icon="solar:trash-bin-trash-bold" height={16} />
                    </Button>
                  </HasPermission>
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
                {t("offers.noOffers")}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t("offers.noOffersDescription")}
              </p>
              <HasPermission resource="offers" action="add">
                <Link href="/offers/add">
                  <Button className="bg-primary hover:bg-primary/90">
                    <Icon icon="solar:add-circle-bold" height={20} className="ml-2" />
                    {t("offers.addNew")}
                  </Button>
                </Link>
              </HasPermission>
            </div>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {offersData?.pagination && offersData.pagination.last_page > 1 && (
        <Card>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t("offers.showing", { from: offersData.pagination.from, to: offersData.pagination.to, total: offersData.pagination.total })}
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
                {currentPage} {t("offers.of")} {offersData.pagination.last_page}
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
        title={t("offers.confirmDelete")}
        message={t("offers.deleteMessage")}
        confirmText={t("offers.delete")}
        cancelText={t("offers.cancel")}
        isLoading={deleting}
        type="danger"
      />
    </div>
  );
};

export default OffersPage;
