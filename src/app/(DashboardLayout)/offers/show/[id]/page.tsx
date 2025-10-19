"use client";
import React from "react";
import { Card, Badge, Spinner } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetOfferByIdQuery } from "@/store/api/offersApi";
import Link from "next/link";
import Image from "next/image";

interface ShowOfferPageProps {
  params: {
    id: string;
  };
}

const ShowOfferPage = ({ params }: ShowOfferPageProps) => {
  const offerId = parseInt(params.id);
  const { data: offerData, isLoading, error } = useGetOfferByIdQuery(offerId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA");
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
      <Badge color="orange">خصم</Badge>
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

  const offer = offerData.data;

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
            <h1 className="text-3xl font-bold text-dark dark:text-white">عرض التفاصيل</h1>
          </div>
          <p className="text-sm text-ld mr-12">تفاصيل العرض: #{offer.id}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/offers/edit/${offer.id}`}>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Icon icon="solar:pen-bold" height={16} />
              تعديل
            </button>
          </Link>
        </div>
      </div>

      {/* Offer Image and Basic Info */}
      <Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Image
              src={offer.image}
              alt={`عرض ${offer.id}`}
              width={600}
              height={400}
              className="w-full h-80 object-cover rounded-lg"
            />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-dark dark:text-white">
                عرض #{offer.id}
              </h2>
              {getStatusBadge(offer.is_active, offer.offer_start_date, offer.offer_end_date)}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon icon="solar:star-bold" height={20} className="text-yellow-500" />
                <span className="text-lg font-semibold text-dark dark:text-white">
                  {offer.points} نقطة
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Icon icon="solar:calendar-bold" height={20} className="text-blue-500" />
                <span className="text-dark dark:text-white">
                  من {formatDate(offer.offer_start_date)} إلى {formatDate(offer.offer_end_date)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {getTypeBadge(offer.type)}
                {getRewardTypeBadge(offer.reward_type)}
              </div>
              
              {offer.charity && (
                <div className="flex items-center gap-2">
                  <Icon icon="solar:heart-bold" height={20} className="text-red-500" />
                  <span className="text-dark dark:text-white">
                    الجمعية الخيرية: {offer.charity.name_ar}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Icon icon="solar:clock-circle-bold" height={20} className="text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  تم الإنشاء: {formatDate(offer.created_at)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Icon icon="solar:refresh-bold" height={20} className="text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  آخر تحديث: {formatDate(offer.updated_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Conditions */}
      <Card>
        <h3 className="text-xl font-semibold text-dark dark:text-white mb-4">شروط العرض</h3>
        {offer.conditions && offer.conditions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offer.conditions.map((condition, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:box-bold" height={16} className="text-blue-500" />
                    <span className="font-medium text-dark dark:text-white">
                      المنتج #{condition.product_id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:settings-bold" height={16} className="text-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      المتغير #{condition.product_variant_id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:hashtag-bold" height={16} className="text-orange-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      الكمية: {condition.quantity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {condition.is_active ? (
                      <Badge color="green" size="sm">نشط</Badge>
                    ) : (
                      <Badge color="red" size="sm">غير نشط</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Icon icon="solar:box-bold" height={48} className="mx-auto mb-4 text-gray-300" />
            <p>لا توجد شروط محددة لهذا العرض</p>
          </div>
        )}
      </Card>

      {/* Rewards */}
      <Card>
        <h3 className="text-xl font-semibold text-dark dark:text-white mb-4">المكافآت</h3>
        {offer.rewards && offer.rewards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offer.rewards.map((reward, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:gift-bold" height={16} className="text-purple-500" />
                    <span className="font-medium text-dark dark:text-white">
                      المنتج #{reward.product_id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:settings-bold" height={16} className="text-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      المتغير #{reward.product_variant_id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:hashtag-bold" height={16} className="text-orange-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      الكمية: {reward.quantity}
                    </span>
                  </div>
                  {reward.discount_amount && (
                    <div className="flex items-center gap-2">
                      <Icon icon="solar:percent-bold" height={16} className="text-red-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        خصم: {reward.discount_amount} {reward.discount_type === 'percentage' ? '%' : 'د.ك'}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {reward.is_active ? (
                      <Badge color="green" size="sm">نشط</Badge>
                    ) : (
                      <Badge color="red" size="sm">غير نشط</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Icon icon="solar:gift-bold" height={48} className="mx-auto mb-4 text-gray-300" />
            <p>لا توجد مكافآت محددة لهذا العرض</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ShowOfferPage;
