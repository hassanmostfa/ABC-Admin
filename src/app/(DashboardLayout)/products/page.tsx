"use client";
import React, { useState } from "react";
import { Card, Label, TextInput, Spinner, Select, Badge, Pagination } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetProductsQuery, useDeleteProductMutation } from "@/store/api/productsApi";
import { useGetAllCategoriesQuery } from "@/store/api/categoriesApi";
import { useGetSubcategoriesQuery } from "@/store/api/subcategoriesApi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/app/context/NotificationContext";
import ConfirmModal from "@/components/shared/ConfirmModal";
import Image from "next/image";
import { useTranslation } from "react-i18next";

const ProductsPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { showNotification } = useNotification();
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<number>(0);
  const [subcategoryFilter, setSubcategoryFilter] = useState<number>(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  const { data: productsData, isLoading, error } = useGetProductsQuery({
    search: searchTerm || undefined,
    page: currentPage,
    category_id: categoryFilter || undefined,
    subcategory_id: subcategoryFilter || undefined,
  });

  const { data: categoriesData } = useGetAllCategoriesQuery();
  
  const { data: subcategoriesData } = useGetSubcategoriesQuery({
    page: 1,
    per_page: 100,
  });


  const handleDeleteClick = (productId: number) => {
    setProductToDelete(productId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      await deleteProduct(productToDelete).unwrap();
      showNotification("success", t("products.success"), t("products.deleteSuccess"));
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (err: any) {
      console.error("Delete product error:", err);
      showNotification("error", t("products.error"), t("products.deleteError"));
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
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
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-error">{t("products.loadError")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white">{t("products.title")}</h1>
          <p className="text-sm text-ld mt-2">{t("products.subtitle")}</p>
        </div>
        <Link href="/products/add">
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Icon icon="solar:add-circle-bold" height={20} />
            {t("products.addNew")}
          </button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <Label htmlFor="search" className="mb-2 block">{t("products.search")}</Label>
              <TextInput
                id="search"
                placeholder={t("products.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={() => <Icon icon="solar:magnifer-bold" height={18} />}
              />
            </div>

            {/* Category Filter */}
            <div>
              <Label htmlFor="category" className="mb-2 block">{t("products.mainCategory")}</Label>
              <Select
                id="category"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(parseInt(e.target.value));
                  setSubcategoryFilter(0);
                  setCurrentPage(1);
                }}
                className="select-md"
              >
                <option value={0}>{t("products.allCategories")}</option>
                {categoriesData?.data?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name_ar} - {category.name_en}
                  </option>
                ))}
              </Select>
            </div>

            {/* Subcategory Filter */}
            <div>
              <Label htmlFor="subcategory" className="mb-2 block">{t("products.subCategory")}</Label>
              <Select
                id="subcategory"
                value={subcategoryFilter}
                onChange={(e) => {
                  setSubcategoryFilter(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="select-md"
                disabled={!categoryFilter || categoryFilter === 0}
              >
                <option value={0}>{t("products.allSubcategories")}</option>
                {subcategoriesData?.data?.filter(sub => sub.category_id === categoryFilter).map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name_ar} - {subcategory.name_en}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter(0);
                setSubcategoryFilter(0);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-ld rounded-lg text-dark dark:text-white hover:bg-lightgray dark:hover:bg-darkgray transition-colors"
            >
              {t("products.reset")}
            </button>
          </div>
        </div>
      </Card>

      {/* Products Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-xs uppercase bg-lightgray dark:bg-darkgray">
              <tr>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">#</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("products.image")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("products.productName")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("products.category")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("products.sku")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("products.variants")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("products.status")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("products.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {productsData?.data?.map((product, index) => (
                <tr key={product.id} className="border-b border-ld hover:bg-lightgray dark:hover:bg-darkgray transition-colors">
                  <td className="px-6 py-4 text-dark dark:text-white font-medium">
                    {productsData.pagination ? (productsData.pagination.from + index) : (index + 1)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-lightgray dark:bg-darkgray">
                      {product.variants?.[0]?.image && typeof product.variants[0].image === 'string' ? (
                        <Image
                          src={product.variants[0].image}
                          alt={product.name_ar}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon icon="solar:gallery-bold" height={24} className="text-ld" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-dark dark:text-white">{product.name_ar}</div>
                      <div className="text-sm text-ld dark:text-white/70">{product.name_en}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-dark dark:text-white">
                        {product.category?.name_ar}
                      </div>
                      <div className="text-sm text-ld dark:text-white/70">
                        {product.subcategory?.name_ar}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-dark dark:text-white">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4">
                    <Badge color="info" className="w-fit">
                      {product.variants?.length || 0} {t("products.variant")}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(product.is_active)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/products/show/${product.id}`}>
                        <button className="h-8 w-8 rounded-full hover:bg-lightprimary dark:hover:bg-darkprimary flex items-center justify-center transition-colors">
                          <Icon icon="solar:eye-bold" height={16} className="text-primary" />
                        </button>
                      </Link>
                      <Link href={`/products/edit/${product.id}`}>
                        <button className="h-8 w-8 rounded-full hover:bg-lightprimary dark:hover:bg-darkprimary flex items-center justify-center transition-colors">
                          <Icon icon="solar:pen-bold" height={16} className="text-primary" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(product.id)}
                        className="h-8 w-8 rounded-full hover:bg-lighterror dark:hover:bg-darkerror flex items-center justify-center transition-colors"
                      >
                        <Icon icon="solar:trash-bin-minimalistic-bold" height={16} className="text-error" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {productsData?.pagination && productsData.pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-ld">
            <div className="text-sm text-ld dark:text-white/70">
              {t("products.showing", { from: productsData.pagination.from, to: productsData.pagination.to, total: productsData.pagination.total })}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={productsData.pagination.last_page}
              onPageChange={setCurrentPage}
              showIcons
              previousLabel={t("products.previous")}
              nextLabel={t("products.next")}
            />
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={t("products.confirmDelete")}
        message={t("products.deleteMessage")}
        confirmText={t("products.delete")}
        cancelText={t("products.cancel")}
        isLoading={deleting}
        type="danger"
      />
    </div>
  );
};

export default ProductsPage;
