"use client";
import React, { useState } from "react";
import { Card, Badge, Spinner, TextInput, Pagination, Button } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetCharitiesQuery, useDeleteCharityMutation } from "@/store/api/charitiesApi";
import { useNotification } from "@/app/context/NotificationContext";
import ConfirmModal from "@/components/shared/ConfirmModal";
import Link from "next/link";

const CharitiesPage = () => {
  const { showNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { data: charitiesData, isLoading, error } = useGetCharitiesQuery({
    search: searchQuery,
    page: currentPage,
  });
  const [deleteCharity, { isLoading: deleting }] = useDeleteCharityMutation();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [charityToDelete, setCharityToDelete] = useState<{ id: number; name: string } | null>(null);

  const onPageChange = (page: number) => setCurrentPage(page);

  const handleDeleteClick = (id: number, name: string) => {
    setCharityToDelete({ id, name });
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!charityToDelete) return;
    try {
      const result = await deleteCharity(charityToDelete.id).unwrap();
      if (result.success) {
        setShowConfirmModal(false);
        setCharityToDelete(null);
        showNotification("success", "نجاح!", "تم حذف الجمعية بنجاح");
      }
    } catch (err: any) {
      setShowConfirmModal(false);
      setCharityToDelete(null);
      showNotification("error", "خطأ!", err?.data?.message || "حدث خطأ أثناء حذف الجمعية");
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setCharityToDelete(null);
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
            <p className="text-sm text-dark dark:text-white">فشل في تحميل الجمعيات</p>
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
            <Link href="/">
              <button className="h-10 w-10 rounded-full hover:bg-lightprimary dark:hover:bg-darkprimary flex items-center justify-center transition-colors">
                <Icon icon="solar:arrow-right-bold" height={20} className="text-dark dark:text-white" />
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-dark dark:text-white">الجمعيات الخيرية</h1>
          </div>
          <p className="text-sm text-ld mr-12">إدارة قائمة الجمعيات الخيرية</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/charities/add">
            <Button color="primary" className="flex items-center gap-2">
              <Icon icon="solar:add-circle-bold" height={20} />
              إضافة جمعية جديدة
            </Button>
          </Link>
        </div>
      </div>

      {/* Charities Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-dark dark:text-white">جميع الجمعيات</h2>
          <div className="relative w-80">
            <TextInput
              icon={() => <Icon icon="solar:magnifer-linear" height={20} />}
              placeholder="ابحث عن جمعية..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-xs uppercase bg-lightgray dark:bg-darkgray">
              <tr>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">#</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">الاسم</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">الاسم (إنجليزي)</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">رقم الهاتف</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">الموقع</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {charitiesData?.data?.map((charity, index) => (
                <tr key={charity.id} className="border-b border-ld hover:bg-lightgray dark:hover:bg-darkgray transition-colors">
                  <td className="px-6 py-4 font-medium text-dark dark:text-white">{index + 1}</td>
                  <td className="px-6 py-4 text-dark dark:text-white">{charity.name_ar}</td>
                  <td className="px-6 py-4 text-dark dark:text-white">{charity.name_en}</td>
                  <td className="px-6 py-4 text-dark dark:text-white">{charity.phone}</td>
                  <td className="px-6 py-4 text-dark dark:text-white">
                    {charity.area?.name_ar || 'غير محدد'}, {charity.governorate?.name_ar || 'غير محدد'}, {charity.country?.name_ar || 'غير محدد'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <Link href={`/charities/edit/${charity.id}`}>
                        <button className="text-primary hover:text-primary/80 transition-colors" title="تعديل">
                          <Icon icon="solar:pen-bold" height={18} />
                        </button>
                      </Link>
                      <button 
                        className="text-error hover:text-error/80 transition-colors" 
                        title="حذف"
                        onClick={() => handleDeleteClick(charity.id, charity.name_ar)}
                      >
                        <Icon icon="solar:trash-bin-trash-bold" height={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {charitiesData?.data?.length === 0 && (
            <div className="text-center py-12">
              <Icon icon="solar:buildings-2-bold-duotone" height={64} className="text-ld mx-auto mb-4" />
              <p className="text-ld dark:text-white/70">لا توجد جمعيات حتى الآن</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {charitiesData?.pagination && charitiesData.pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-ld">
            <div className="text-sm text-ld dark:text-white/70">
              عرض {charitiesData.pagination.from} إلى {charitiesData.pagination.to} من {charitiesData.pagination.total} جمعية
            </div>
            <Pagination
              currentPage={charitiesData.pagination.current_page}
              totalPages={charitiesData.pagination.last_page}
              onPageChange={onPageChange}
              showIcons
              previousLabel="السابق"
              nextLabel="التالي"
            />
          </div>
        )}
      </Card>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف الجمعية "${charityToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        cancelText="إلغاء"
        isLoading={deleting}
        type="danger"
      />
    </div>
  );
};

export default CharitiesPage;
