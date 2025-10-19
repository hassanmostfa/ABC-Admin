"use client";

import React, { useState } from "react";
import { Card, Label, TextInput, Button, Pagination } from "flowbite-react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useGetGovernoratesQuery, useDeleteGovernorateMutation } from "@/store/api/governoratesApi";
import { useNotification } from "@/app/context/NotificationContext";
import ConfirmModal from "@/components/shared/ConfirmModal";

const GovernoratesPage = () => {
  const { showNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    governorateId: number | null;
    governorateName: string;
  }>({
    isOpen: false,
    governorateId: null,
    governorateName: "",
  });

  const { data: governoratesData, isLoading, error } = useGetGovernoratesQuery({
    search: searchTerm || undefined,
    page: currentPage,
    per_page: 10,
  });

  const [deleteGovernorate, { isLoading: deleting }] = useDeleteGovernorateMutation();

  const handleDeleteClick = (governorateId: number, governorateName: string) => {
    setDeleteModal({
      isOpen: true,
      governorateId,
      governorateName,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.governorateId) return;

    try {
      const result = await deleteGovernorate(deleteModal.governorateId).unwrap();
      if (result.success) {
        showNotification("success", "نجاح!", "تم حذف المحافظة بنجاح");
        setDeleteModal({ isOpen: false, governorateId: null, governorateName: "" });
      }
    } catch (err: any) {
      showNotification("error", "خطأ!", err?.data?.message || "حدث خطأ أثناء حذف المحافظة");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Icon icon="solar:danger-circle-bold" className="w-16 h-16 text-error mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">خطأ في تحميل البيانات</h3>
          <p className="text-gray-500 dark:text-gray-400">حدث خطأ أثناء تحميل قائمة المحافظات</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">المحافظات</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">إدارة المحافظات المتاحة في النظام</p>
        </div>
        <Link href="/governorates/add">
          <Button className="bg-primary hover:bg-primary/90 text-white">
            <Icon icon="solar:add-circle-bold" className="w-5 h-5 ml-2" />
            إضافة محافظة
          </Button>
        </Link>
      </div>

      {/* Search and Stats */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <TextInput
                type="text"
                placeholder="البحث في المحافظات..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-80"
                icon={() => <Icon icon="solar:magnifer-bold" height={18} />}
              />
            </div>
            {governoratesData?.pagination && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                إجمالي المحافظات: {governoratesData.pagination.total}
              </div>
            )}
          </div>
          {/* Removed theme toggle */}
        </div>
      </Card>

      {/* Governorates Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-xs uppercase bg-lightgray dark:bg-darkgray">
              <tr>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">#</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">الاسم (عربي)</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">الاسم (إنجليزي)</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">الدولة</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">الحالة</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">تاريخ الإنشاء</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <Icon icon="solar:loading-bold" className="w-6 h-6 text-primary animate-spin ml-2" />
                      <span className="text-gray-500 dark:text-gray-400">جاري التحميل...</span>
                    </div>
                  </td>
                </tr>
              ) : governoratesData?.data?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-center">
                      <Icon icon="solar:folder-open-bold" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">لا توجد محافظات متاحة</p>
                    </div>
                  </td>
                </tr>
              ) : (
                governoratesData?.data?.map((governorate, index) => (
                  <tr key={governorate.id} className="border-b border-ld hover:bg-lightgray dark:hover:bg-darkgray transition-colors">
                    <td className="px-6 py-4 font-medium text-dark dark:text-white">{index + 1}</td>
                    <td className="px-6 py-4 text-dark dark:text-white">{governorate.name_ar}</td>
                    <td className="px-6 py-4 text-dark dark:text-white">{governorate.name_en}</td>
                    <td className="px-6 py-4 text-dark dark:text-white">{governorate.country?.name_ar || 'غير محدد'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        governorate.is_active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {governorate.is_active ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-dark dark:text-white">
                      {new Date(governorate.created_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Link href={`/governorates/edit/${governorate.id}`}>
                          <button className="text-primary hover:text-primary/80 transition-colors" title="تعديل">
                            <Icon icon="solar:pen-bold" height={18} />
                          </button>
                        </Link>
                        <button
                          className="text-error hover:text-error/80 transition-colors"
                          title="حذف"
                          onClick={() => handleDeleteClick(governorate.id, governorate.name_ar)}
                        >
                          <Icon icon="solar:trash-bin-trash-bold" height={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {governoratesData?.pagination && governoratesData.pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-ld">
            <div className="text-sm text-ld dark:text-white/70">
              عرض {governoratesData.pagination.from} إلى {governoratesData.pagination.to} من {governoratesData.pagination.total} محافظة
            </div>
            <Pagination
              currentPage={governoratesData.pagination.current_page}
              totalPages={governoratesData.pagination.last_page}
              onPageChange={handlePageChange}
              showIcons
              previousLabel="السابق"
              nextLabel="التالي"
            />
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, governorateId: null, governorateName: "" })}
        onConfirm={handleDeleteConfirm}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف المحافظة "${deleteModal.governorateName}"؟`}
        confirmText="حذف"
        cancelText="إلغاء"
        isLoading={deleting}
        type="danger"
      />
    </div>
  );
};

export default GovernoratesPage;
