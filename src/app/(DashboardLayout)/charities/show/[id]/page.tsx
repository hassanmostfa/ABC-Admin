"use client";
import React from "react";
import { use } from "react";
import { Card, Spinner } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetCharityByIdQuery } from "@/store/api/charitiesApi";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ShowCharityPageProps {
  params: Promise<{ id: string }>;
}

const ShowCharityPage = ({ params }: ShowCharityPageProps) => {
  const router = useRouter();
  const resolvedParams = use(params);
  const charityId = parseInt(resolvedParams.id);

  const { data: charityData, isLoading, error } = useGetCharityByIdQuery(charityId);

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

  const charity = charityData.data;

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
            <h1 className="text-3xl font-bold text-dark dark:text-white">تفاصيل الجمعية</h1>
          </div>
          <p className="text-sm text-ld mr-12">عرض تفاصيل الجمعية الخيرية</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href={`/charities/edit/${charity.id}`}>
            <button className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
              <Icon icon="solar:pen-bold" height={20} />
              تعديل
            </button>
          </Link>
        </div>
      </div>

      {/* Charity Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <div className="lg:col-span-2">
          <Card>
            <div className="space-y-6">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Icon icon="solar:buildings-2-bold" className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-dark dark:text-white">{charity.name_ar}</h2>
                  <p className="text-ld dark:text-white/70">{charity.name_en}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Phone */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Icon icon="solar:phone-bold" className="w-5 h-5 text-ld" />
                    <span className="text-sm font-medium text-dark dark:text-white">رقم الهاتف</span>
                  </div>
                  <p className="text-dark dir-ltr dark:text-white">{charity.phone}</p>
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Icon icon="solar:map-point-bold" className="w-5 h-5 text-ld" />
                    <span className="text-sm font-medium text-dark dark:text-white">الدولة</span>
                  </div>
                  <p className="text-dark dark:text-white">{charity.country?.name_ar || 'غير محدد'}</p>
                </div>

                {/* Governorate */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Icon icon="solar:buildings-2-bold" className="w-5 h-5 text-ld" />
                    <span className="text-sm font-medium text-dark dark:text-white">المحافظة</span>
                  </div>
                  <p className="text-dark dark:text-white">{charity.governorate?.name_ar || 'غير محدد'}</p>
                </div>

                {/* Area */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Icon icon="solar:home-bold" className="w-5 h-5 text-ld" />
                    <span className="text-sm font-medium text-dark dark:text-white">المنطقة</span>
                  </div>
                  <p className="text-dark dark:text-white">{charity.area?.name_ar || 'غير محدد'}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Side Info Card */}
        <div>
          <Card>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-dark dark:text-white">معلومات إضافية</h3>
              
              {/* Created Date */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Icon icon="solar:calendar-bold" className="w-5 h-5 text-ld" />
                  <span className="text-sm font-medium text-dark dark:text-white">تاريخ الإنشاء</span>
                </div>
                <p className="text-dark dark:text-white">
                  {new Date(charity.created_at).toLocaleDateString("ar-EG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </p>
              </div>

              {/* Updated Date */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Icon icon="solar:refresh-bold" className="w-5 h-5 text-ld" />
                  <span className="text-sm font-medium text-dark dark:text-white">آخر تحديث</span>
                </div>
                <p className="text-dark dark:text-white">
                  {new Date(charity.updated_at).toLocaleDateString("ar-EG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </p>
              </div>

              {/* Charity ID */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Icon icon="solar:hashtag-bold" className="w-5 h-5 text-ld" />
                  <span className="text-sm font-medium text-dark dark:text-white">رقم الجمعية</span>
                </div>
                <p className="text-dark dark:text-white">#{charity.id}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ShowCharityPage;