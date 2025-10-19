"use client";
import React, { useState } from "react";
import { Card, Badge, Spinner, TextInput, Pagination } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetCategoriesQuery, useDeleteCategoryMutation } from "@/store/api/categoriesApi";
import { useNotification } from "@/app/context/NotificationContext";
import ConfirmModal from "@/components/shared/ConfirmModal";
import Link from "next/link";
import Image from "next/image";

const CategoriesPage = () => {
  const { showNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { data: categoriesData, isLoading, error } = useGetCategoriesQuery({
    search: searchQuery,
    page: currentPage,
  });
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: number; name_ar: string } | null>(null);

  const onPageChange = (page: number) => setCurrentPage(page);

  const handleDeleteClick = (id: number, name_ar: string) => {
    setCategoryToDelete({ id, name_ar });
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      const result = await deleteCategory(categoryToDelete.id).unwrap();
      if (result.success) {
        setShowConfirmModal(false);
        setCategoryToDelete(null);
        showNotification("success", "نجاح!", "تم حذف التصنيف بنجاح");
      }
    } catch (err: any) {
      setShowConfirmModal(false);
      setCategoryToDelete(null);
      showNotification("error", "خطأ!", err?.data?.message || "حدث خطأ أثناء حذف التصنيف");
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setCategoryToDelete(null);
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
            <p className="text-sm text-dark dark:text-white">فشل في تحميل التصنيفات</p>
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
          <h1 className="text-3xl font-bold text-dark dark:text-white">التصنيفات</h1>
          <p className="text-sm text-ld mt-2">إدارة تصنيفات المنتجات</p>
        </div>
        <Link href="/categories/add">
          <button className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors">
            <Icon icon="solar:add-circle-bold" height={20} />
            إضافة تصنيف جديد
          </button>
        </Link>
      </div>

      {/* Categories Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-dark dark:text-white">جميع التصنيفات</h2>
          <div className="relative w-80">
            <TextInput
              icon={() => <Icon icon="solar:magnifer-linear" height={20} />}
              placeholder="ابحث عن تصنيف..."
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
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">الصورة</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">اسم التصنيف (عربي)</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">  اسم التصنيف (انجليزي)</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">الحالة</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">تاريخ الإنشاء</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">آخر تحديث</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {categoriesData?.data?.map((category, index) => (
                <tr key={category.id} className="border-b border-ld hover:bg-lightgray dark:hover:bg-darkgray transition-colors">
                  <td className="px-6 py-4 font-medium text-dark dark:text-white">{index + 1}</td>
                  <td className="px-6 py-4">
                    {category.image_url ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-lightgray dark:bg-darkgray">
                        <Image
                          src={category.image_url}
                          alt={category.name_ar}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-lightgray dark:bg-darkgray flex items-center justify-center">
                        <Icon icon="solar:gallery-bold" height={20} className="text-ld" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-dark dark:text-white font-medium">{category.name_ar}</td>
                  <td className="px-6 py-4 text-dark dark:text-white font-medium">{category.name_en}</td>
                  <td className="px-6 py-4">
                    {category.is_active ? (
                      <Badge color="success" className="w-fit">نشط</Badge>
                    ) : (
                      <Badge color="failure" className="w-fit">غير نشط</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-dark dark:text-white">
                    {new Date(category.created_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
                  </td>
                  <td className="px-6 py-4 text-dark dark:text-white">
                    {new Date(category.updated_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/categories/edit/${category.id}`}>
                        <button className="h-8 w-8 rounded-full hover:bg-lightprimary dark:hover:bg-darkprimary flex items-center justify-center transition-colors" title="تعديل">
                          <Icon icon="solar:pen-bold" height={18} className="text-primary" />
                        </button>
                      </Link>
                      <button onClick={() => handleDeleteClick(category.id, category.name_ar)} className="h-8 w-8 rounded-full hover:bg-lighterror dark:hover:bg-darkerror flex items-center justify-center transition-colors" title="حذف">
                        <Icon icon="solar:trash-bin-minimalistic-bold" height={18} className="text-error" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {categoriesData?.data?.length === 0 && (
            <div className="text-center py-12">
              <Icon icon="solar:widget-2-bold-duotone" height={64} className="text-ld mx-auto mb-4" />
              <p className="text-ld dark:text-white/70">لا يوجد تصنيفات حتى الآن</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {categoriesData?.pagination && categoriesData.pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-ld">
            <div className="text-sm text-ld dark:text-white/70">
              عرض {categoriesData.pagination.from} إلى {categoriesData.pagination.to} من {categoriesData.pagination.total} تصنيف
            </div>
            <Pagination
              currentPage={categoriesData.pagination.current_page}
              totalPages={categoriesData.pagination.last_page}
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
        message={`هل أنت متأكد من حذف التصنيف "${categoryToDelete?.name_ar}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        cancelText="إلغاء"
        isLoading={deleting}
        type="danger"
      />
    </div>
  );
};

export default CategoriesPage;