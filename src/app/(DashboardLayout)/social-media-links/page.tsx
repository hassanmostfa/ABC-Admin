"use client";
import React, { useState } from "react";
import { Card, Button, Spinner, Badge, TextInput } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetSocialMediaLinksQuery, useDeleteSocialMediaLinkMutation } from "@/store/api/socialMediaLinksApi";
import { useNotification } from "@/app/context/NotificationContext";
import Link from "next/link";
import ConfirmModal from "@/components/shared/ConfirmModal";

const SocialMediaLinksPage = () => {
  const { showNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<{ id: number; title: string } | null>(null);

  const [deleteLink, { isLoading: deleting }] = useDeleteSocialMediaLinkMutation();

  const { data: linksData, isLoading, error } = useGetSocialMediaLinksQuery({
    search: searchQuery,
    page: currentPage,
    per_page: 15,
    sort_by: "created_at",
    sort_order: "desc",
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteClick = (id: number, title: string) => {
    setLinkToDelete({ id, title });
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!linkToDelete) return;
    try {
      const result = await deleteLink(linkToDelete.id).unwrap();
      if (result.success) {
        setShowConfirmModal(false);
        setLinkToDelete(null);
        showNotification("success", "نجاح!", "تم حذف الرابط بنجاح");
      }
    } catch (err: any) {
      setShowConfirmModal(false);
      setLinkToDelete(null);
      showNotification("error", "خطأ!", err?.data?.message || "حدث خطأ أثناء حذف الرابط");
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setLinkToDelete(null);
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
            <p className="text-sm text-dark dark:text-white">فشل في تحميل روابط وسائل التواصل الاجتماعي</p>
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
          <h1 className="text-3xl font-bold text-dark dark:text-white">روابط وسائل التواصل الاجتماعي</h1>
          <p className="text-sm text-ld">عرض وإدارة جميع روابط وسائل التواصل الاجتماعي</p>
        </div>
        <Link href="/social-media-links/add">
          <Button color="blue">
            <Icon icon="solar:add-circle-bold" height={16} className="ml-1" />
            إضافة رابط جديد
          </Button>
        </Link>
      </div>

      {/* Social Media Links Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-dark dark:text-white">جميع الروابط</h2>
          <div className="relative w-80">
            <TextInput
              icon={() => <Icon icon="solar:magnifer-linear" height={20} />}
              placeholder="ابحث عن رابط..."
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
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">الأيقونة</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">الاسم (عربي)</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">الاسم (إنجليزي)</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">الرابط</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">الحالة</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">تاريخ الإنشاء</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {linksData?.data?.map((link, index) => (
                <tr key={link.id} className="border-b border-ld hover:bg-lightgray dark:hover:bg-darkgray transition-colors">
                  <td className="px-6 py-4 font-medium text-dark dark:text-white">
                    {linksData.pagination ? (linksData.pagination.from + index) : (index + 1)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <img 
                        src={link.icon_url} 
                        alt={link.title_ar || link.title_en || 'Social Media Icon'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/defaults/no-image.png';
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-dark dark:text-white">
                    {link.title_ar || '-'}
                  </td>
                  <td className="px-6 py-4 text-dark dark:text-white">
                    {link.title_en || '-'}
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="truncate text-dark dark:text-white" title={link.url}>
                      {link.url}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge color={link.is_active ? "green" : "gray"}>
                      {link.is_active ? "نشط" : "غير نشط"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-dark dark:text-white">
                    {formatDate(link.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <Link href={`/social-media-links/edit/${link.id}`}>
                        <button className="text-primary hover:text-primary/80 transition-colors" title="تعديل">
                          <Icon icon="solar:pen-bold" height={18} />
                        </button>
                      </Link>
                      <button 
                        className="text-error hover:text-error/80 transition-colors" 
                        title="حذف"
                        onClick={() => handleDeleteClick(link.id, link.title_ar || link.title_en || 'رابط')}
                      >
                        <Icon icon="solar:trash-bin-trash-bold" height={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {linksData?.pagination && linksData.pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              عرض {linksData.pagination.from} إلى {linksData.pagination.to} من {linksData.pagination.total} رابط
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                color="gray"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <Icon icon="solar:alt-arrow-right-bold" height={16} />
                السابق
              </Button>
              
              <span className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                صفحة {currentPage} من {linksData.pagination.last_page}
              </span>
              
              <Button
                size="sm"
                color="gray"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === linksData.pagination.last_page}
              >
                التالي
                <Icon icon="solar:alt-arrow-left-bold" height={16} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="حذف الرابط"
        message={`هل أنت متأكد من حذف رابط "${linkToDelete?.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        cancelText="إلغاء"
        isLoading={deleting}
        type="danger"
      />
    </div>
  );
};

export default SocialMediaLinksPage;
