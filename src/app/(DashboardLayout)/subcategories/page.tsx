"use client";
import React, { useState } from "react";
import { Card, Badge, Spinner, TextInput, Pagination, Select } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetSubcategoriesQuery, useDeleteSubcategoryMutation } from "@/store/api/subcategoriesApi";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";
import { useNotification } from "@/app/context/NotificationContext";
import ConfirmModal from "@/components/shared/ConfirmModal";
import HasPermission from "@/components/shared/HasPermission";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";

const SubcategoriesPage = () => {
  const { t, i18n } = useTranslation();
  const { showNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  
  const { data: subcategoriesData, isLoading, error } = useGetSubcategoriesQuery({
    search: searchQuery,
    page: currentPage,
    category_id: selectedCategoryId,
  });
  
  const { data: categoriesData } = useGetCategoriesQuery({
    page: 1,
    per_page: 100, // Get all categories
  });
  const [deleteSubcategory, { isLoading: deleting }] = useDeleteSubcategoryMutation();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<{ id: number; name_ar: string } | null>(null);

  const onPageChange = (page: number) => setCurrentPage(page);

  const handleDeleteClick = (id: number, name_ar: string) => {
    setSubcategoryToDelete({ id, name_ar });
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!subcategoryToDelete) return;
    try {
      const result = await deleteSubcategory(subcategoryToDelete.id).unwrap();
      if (result.success) {
        setShowConfirmModal(false);
        setSubcategoryToDelete(null);
        showNotification("success", t("subcategories.success"), t("subcategories.deleteSuccess"));
      }
    } catch (err: any) {
      setShowConfirmModal(false);
      setSubcategoryToDelete(null);
      showNotification("error", t("subcategories.error"), err?.data?.message || t("subcategories.deleteError"));
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setSubcategoryToDelete(null);
  };

  const handleCategoryFilter = (categoryId: string) => {
    if (categoryId === "") {
      setSelectedCategoryId(undefined);
    } else {
      setSelectedCategoryId(parseInt(categoryId));
    }
    setCurrentPage(1); // Reset to first page when filtering
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
            <h3 className="text-lg font-semibold text-error mb-1">{t("subcategories.error")}</h3>
            <p className="text-sm text-dark dark:text-white">{t("subcategories.loadError")}</p>
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
          <h1 className="text-3xl font-bold text-dark dark:text-white">{t("subcategories.title")}</h1>
          <p className="text-sm text-ld mt-2">{t("subcategories.subtitle")}</p>
        </div>
        <HasPermission resource="subcategories" action="add">
          <Link href="/subcategories/add">
            <button className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors">
              <Icon icon="solar:add-circle-bold" height={20} />
              {t("subcategories.addNew")}
            </button>
          </Link>
        </HasPermission>
      </div>

      {/* Subcategories Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-dark dark:text-white">{t("subcategories.allSubcategories")}</h2>
          <div className="flex items-center gap-4">
            {/* Category Filter */}
            <div className="w-48">
              <Select
                value={selectedCategoryId?.toString() || ""}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="select-md"
              >
                <option value="">{t("subcategories.allCategories")}</option>
                {categoriesData?.data?.map((category) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name_ar}
                  </option>
                ))}
              </Select>
            </div>
            
            {/* Search */}
            <div className="relative w-80">
              <TextInput
                icon={() => <Icon icon="solar:magnifer-linear" height={20} />}
                placeholder={t("subcategories.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-xs uppercase bg-lightgray dark:bg-darkgray">
              <tr>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">#</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("subcategories.image")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("subcategories.nameAr")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("subcategories.nameEn")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("subcategories.mainCategory")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("subcategories.status")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("subcategories.createdAt")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("subcategories.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {subcategoriesData?.data?.map((subcategory, index) => (
                <tr key={subcategory.id} className="border-b border-ld hover:bg-lightgray dark:hover:bg-darkgray transition-colors">
                  <td className="px-6 py-4 font-medium text-dark dark:text-white text-center">{index + 1}</td>
                  <td className="px-6 py-4 text-center">
                    {subcategory.image_url ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-lightgray dark:bg-darkgray mx-auto">
                        <Image
                          src={subcategory.image_url}
                          alt={subcategory.name_ar}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-lightgray dark:bg-darkgray flex items-center justify-center mx-auto">
                        <Icon icon="solar:gallery-bold" height={20} className="text-ld" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-dark dark:text-white font-medium text-center">{subcategory.name_ar}</td>
                  <td className="px-6 py-4 text-dark dark:text-white font-medium text-center">{subcategory.name_en}</td>
                  <td className="px-6 py-4 text-dark dark:text-white font-medium text-center">{subcategory.category.name_ar}</td>
                  <td className="px-6 py-4 text-center">
                    {subcategory.is_active ? (
                      <Badge color="success" className="w-fit mx-auto">{t("subcategories.active")}</Badge>
                    ) : (
                      <Badge color="failure" className="w-fit mx-auto">{t("subcategories.inactive")}</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-dark dark:text-white text-center">
                    {new Date(subcategory.created_at).toLocaleDateString(
                      i18n.language === "ar" ? "ar-EG" : "en-US",
                      { year: "numeric", month: "long", day: "numeric" }
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <HasPermission resource="subcategories" action="edit">
                        <Link href={`/subcategories/edit/${subcategory.id}`}>
                          <button className="h-8 w-8 rounded-full hover:bg-lightprimary dark:hover:bg-darkprimary flex items-center justify-center transition-colors" title={t("subcategories.edit")}>
                            <Icon icon="solar:pen-bold" height={18} className="text-primary" />
                          </button>
                        </Link>
                      </HasPermission>
                      <HasPermission resource="subcategories" action="delete">
                        <button onClick={() => handleDeleteClick(subcategory.id, subcategory.name_ar)} className="h-8 w-8 rounded-full hover:bg-lighterror dark:hover:bg-darkerror flex items-center justify-center transition-colors" title={t("subcategories.delete")}>
                          <Icon icon="solar:trash-bin-minimalistic-bold" height={18} className="text-error" />
                        </button>
                      </HasPermission>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {subcategoriesData?.data?.length === 0 && (
            <div className="text-center py-12">
              <Icon icon="solar:widget-2-bold-duotone" height={64} className="text-ld mx-auto mb-4" />
              <p className="text-ld dark:text-white/70">{t("subcategories.noSubcategories")}</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {subcategoriesData?.pagination && subcategoriesData.pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-ld">
            <div className="text-sm text-ld dark:text-white/70">
              {t("subcategories.showing", { from: subcategoriesData.pagination.from, to: subcategoriesData.pagination.to, total: subcategoriesData.pagination.total })}
            </div>
            <Pagination
              currentPage={subcategoriesData.pagination.current_page}
              totalPages={subcategoriesData.pagination.last_page}
              onPageChange={onPageChange}
              showIcons
              previousLabel={t("subcategories.previous")}
              nextLabel={t("subcategories.next")}
            />
          </div>
        )}
      </Card>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={t("subcategories.confirmDelete")}
        message={t("subcategories.deleteMessage", { name: subcategoryToDelete?.name_ar })}
        confirmText={t("subcategories.delete")}
        cancelText={t("subcategories.cancel")}
        isLoading={deleting}
        type="danger"
      />
    </div>
  );
};

export default SubcategoriesPage;
