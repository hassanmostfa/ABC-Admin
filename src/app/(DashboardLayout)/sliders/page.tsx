"use client";
import React, { useState } from "react";
import { Card, Spinner, Badge, Button, Modal, ModalBody, Label, TextInput } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetSlidersQuery, useCreateSliderMutation, useUpdateSliderMutation, useDeleteSliderMutation, Slider } from "@/store/api/slidersApi";
import { useTranslation } from "react-i18next";
import { useNotification } from "@/app/context/NotificationContext";
import Image from "next/image";
import ConfirmModal from "@/components/shared/ConfirmModal";
import HasPermission from "@/components/shared/HasPermission";

const SlidersPage = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const { data: slidersData, isLoading, error } = useGetSlidersQuery();
  const [createSlider, { isLoading: creating }] = useCreateSliderMutation();
  const [updateSlider, { isLoading: updating }] = useUpdateSliderMutation();
  const [deleteSlider, { isLoading: deleting }] = useDeleteSliderMutation();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSlider, setSelectedSlider] = useState<Slider | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isPublished, setIsPublished] = useState(true);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showNotification("error", t("sliders.error"), t("sliders.invalidImageFormat") || "Please select an image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification("error", t("sliders.error"), t("sliders.imageSizeExceeded") || "Image size must not exceed 5MB");
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateSlider = async () => {
    if (!selectedImage) {
      showNotification("error", t("sliders.error"), t("sliders.selectImage") || "Please select an image");
      return;
    }

    try {
      const result = await createSlider({
        image: selectedImage,
        is_published: isPublished,
      }).unwrap();

      if (result.success) {
        showNotification("success", t("sliders.success"), t("sliders.createSuccess") || "Slider created successfully");
        setShowCreateModal(false);
        resetForm();
      }
    } catch (err: any) {
      showNotification("error", t("sliders.error"), err?.data?.message || t("sliders.createError") || "Failed to create slider");
    }
  };

  const handleEditSlider = async () => {
    if (!selectedSlider) return;

    try {
      const result = await updateSlider({
        id: selectedSlider.id,
        sliderData: {
          ...(selectedImage && { image: selectedImage }),
          is_published: isPublished,
        },
      }).unwrap();

      if (result.success) {
        showNotification("success", t("sliders.success"), t("sliders.updateSuccess") || "Slider updated successfully");
        setShowEditModal(false);
        resetForm();
      }
    } catch (err: any) {
      showNotification("error", t("sliders.error"), err?.data?.message || t("sliders.updateError") || "Failed to update slider");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSlider) return;

    try {
      const result = await deleteSlider(selectedSlider.id).unwrap();
      if (result.success) {
        showNotification("success", t("sliders.success"), t("sliders.deleteSuccess") || "Slider deleted successfully");
        setShowDeleteModal(false);
        setSelectedSlider(null);
      }
    } catch (err: any) {
      showNotification("error", t("sliders.error"), err?.data?.message || t("sliders.deleteError") || "Failed to delete slider");
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setIsPublished(true);
    setSelectedSlider(null);
  };

  const openEditModal = (slider: Slider) => {
    setSelectedSlider(slider);
    setIsPublished(slider.is_published);
    setImagePreview(slider.image);
    setSelectedImage(null);
    setShowEditModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
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
              <Icon icon="solar:danger-triangle-bold" height={24} className="text-error" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-error mb-1">{t("sliders.error") || "Error"}</h3>
            <p className="text-sm text-error/80">
              {t("sliders.loadError") || "An error occurred while loading sliders"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const sliders = slidersData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white">{t("sliders.title") || "Sliders"}</h1>
          <p className="text-ld mt-1">{t("sliders.subtitle") || "Manage all sliders"}</p>
        </div>
        <HasPermission resource="sliders" action="add">
          <Button onClick={openCreateModal} color="primary">
            <Icon icon="solar:add-circle-bold" height={20} className="mr-2" />
            {t("sliders.addSlider") || "Add Slider"}
          </Button>
        </HasPermission>
      </div>

      {/* Sliders Grid */}
      {sliders.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Icon icon="solar:gallery-line-duotone" height={64} className="mx-auto text-ld mb-4" />
            <p className="text-ld dark:text-white/70 text-lg">{t("sliders.noSliders") || "No sliders found"}</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sliders.map((slider) => (
            <Card key={slider.id} className="hover:shadow-lg transition-shadow">
              <div className="flex flex-col">
                {/* Slider Image */}
                <div className="w-full h-48 rounded-lg overflow-hidden mb-4 bg-lightgray dark:bg-darkgray">
                  <Image
                    src={slider.image}
                    alt={`Slider ${slider.id}`}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Slider Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ld">ID: {slider.id}</span>
                    </div>
                    {slider.is_published ? (
                      <Badge color="green">{t("sliders.published") || "Published"}</Badge>
                    ) : (
                      <Badge color="red">{t("sliders.unpublished") || "Unpublished"}</Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-ld">
                      <Icon icon="solar:calendar-bold" height={16} />
                      <span>{t("sliders.createdAt") || "Created"}: {formatDate(slider.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-ld">
                      <Icon icon="solar:calendar-mark-bold" height={16} />
                      <span>{t("sliders.updatedAt") || "Updated"}: {formatDate(slider.updated_at)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <HasPermission resource="sliders" action="edit">
                      <button
                        onClick={() => openEditModal(slider)}
                        className="w-8 h-8 rounded-lg border border-ld flex items-center justify-center hover:bg-lightprimary dark:hover:bg-darkprimary transition-colors text-primary hover:text-primary"
                        title={t("sliders.edit") || "Edit"}
                      >
                        <Icon icon="solar:pen-bold" height={18} />
                      </button>
                    </HasPermission>
                    <HasPermission resource="sliders" action="delete">
                      <button
                        onClick={() => {
                          setSelectedSlider(slider);
                          setShowDeleteModal(true);
                        }}
                        className="w-8 h-8 rounded-lg border border-ld flex items-center justify-center hover:bg-lighterror dark:hover:bg-darkerror transition-colors text-error hover:text-error"
                        title={t("sliders.delete") || "Delete"}
                      >
                        <Icon icon="solar:trash-bin-trash-bold" height={18} />
                      </button>
                    </HasPermission>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Info */}
      {slidersData?.pagination && (
        <div className="text-center text-sm text-ld">
          {t("sliders.showing") || "Showing"} {slidersData.pagination.from} {t("sliders.to") || "to"} {slidersData.pagination.to} {t("sliders.of") || "of"} {slidersData.pagination.total} {t("sliders.sliders") || "sliders"}
        </div>
      )}

      {/* Create Modal */}
      <Modal show={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm(); }} size="xl">
        <div className="p-6 border-b border-ld">
          <h3 className="text-xl font-semibold text-dark dark:text-white">{t("sliders.addSlider") || "Add Slider"}</h3>
        </div>
        <ModalBody>
          <div className="space-y-6">
            {/* Image Upload */}
            <div>
              <Label className="mb-2 block">{t("sliders.image") || "Image"} *</Label>
              <div className="flex items-center gap-6">
                <label
                  htmlFor="create-image"
                  className={`flex-1 cursor-pointer ${creating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="border-2 border-dashed border-ld rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <Icon icon="solar:cloud-upload-bold" height={32} className="text-ld mx-auto mb-2" />
                    <p className="text-sm text-ld mb-1">{t("sliders.clickToUpload") || "Click to upload image"}</p>
                    <p className="text-xs text-ld">{t("sliders.imageFormats") || "JPEG, JPG, PNG, WebP, GIF (Max 5MB)"}</p>
                  </div>
                  <input
                    id="create-image"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleImageChange}
                    disabled={creating}
                    className="hidden"
                  />
                </label>
                
                {/* Image Preview */}
                <div className="flex-shrink-0">
                  {imagePreview ? (
                    <div className="relative">
                      <div className="w-48 h-48 rounded-lg overflow-hidden bg-lightgray dark:bg-darkgray border border-ld">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          width={192}
                          height={192}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setSelectedImage(null);
                        }}
                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-error text-white flex items-center justify-center hover:bg-error/80 transition-colors"
                      >
                        <Icon icon="solar:close-circle-bold" height={20} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-48 h-48 rounded-lg bg-lightgray dark:bg-darkgray flex items-center justify-center border border-ld">
                      <Icon icon="solar:gallery-bold" height={32} className="text-ld" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Published Toggle */}
            <div>
              <Label className="mb-2 block">{t("sliders.publishStatus") || "Publish Status"}</Label>
              <div dir="ltr" className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPublished(!isPublished)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    isPublished ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isPublished ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <Label className="text-sm font-medium text-dark dark:text-white">
                  {isPublished ? (t("sliders.published") || "Published") : (t("sliders.unpublished") || "Unpublished")}
                </Label>
              </div>
            </div>
          </div>
        </ModalBody>
        <div className="p-6 border-t border-ld flex items-center gap-3 justify-end">
          <Button color="gray" onClick={() => { setShowCreateModal(false); resetForm(); }}>
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button color="primary" onClick={handleCreateSlider} disabled={creating || !selectedImage}>
            {creating ? t("sliders.creating") || "Creating..." : t("sliders.create") || "Create"}
          </Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onClose={() => { setShowEditModal(false); resetForm(); }} size="xl">
        <div className="p-6 border-b border-ld">
          <h3 className="text-xl font-semibold text-dark dark:text-white">{t("sliders.editSlider") || "Edit Slider"}</h3>
        </div>
        <ModalBody>
          <div className="space-y-6">
            {/* Image Upload */}
            <div>
              <Label className="mb-2 block">{t("sliders.image") || "Image"}</Label>
              <div className="flex items-center gap-6">
                <label
                  htmlFor="edit-image"
                  className={`flex-1 cursor-pointer ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="border-2 border-dashed border-ld rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <Icon icon="solar:cloud-upload-bold" height={32} className="text-ld mx-auto mb-2" />
                    <p className="text-sm text-ld mb-1">{t("sliders.clickToUploadNew") || "Click to upload new image"}</p>
                    <p className="text-xs text-ld">{t("sliders.imageFormats") || "JPEG, JPG, PNG, WebP, GIF (Max 5MB)"}</p>
                    <p className="text-xs text-ld mt-1">{t("sliders.leaveEmptyToKeepCurrent") || "Leave empty to keep current image"}</p>
                  </div>
                  <input
                    id="edit-image"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleImageChange}
                    disabled={updating}
                    className="hidden"
                  />
                </label>
                
                {/* Image Preview */}
                <div className="flex-shrink-0">
                  {imagePreview ? (
                    <div className="relative">
                      <div className="w-48 h-48 rounded-lg overflow-hidden bg-lightgray dark:bg-darkgray border border-ld">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          width={192}
                          height={192}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {selectedImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(selectedSlider?.image || null);
                            setSelectedImage(null);
                          }}
                          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-error text-white flex items-center justify-center hover:bg-error/80 transition-colors"
                        >
                          <Icon icon="solar:close-circle-bold" height={20} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="w-48 h-48 rounded-lg bg-lightgray dark:bg-darkgray flex items-center justify-center border border-ld">
                      <Icon icon="solar:gallery-bold" height={32} className="text-ld" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Published Toggle */}
            <div>
              <Label className="mb-2 block">{t("sliders.publishStatus") || "Publish Status"}</Label>
              <div dir="ltr" className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPublished(!isPublished)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    isPublished ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isPublished ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <Label className="text-sm font-medium text-dark dark:text-white">
                  {isPublished ? (t("sliders.published") || "Published") : (t("sliders.unpublished") || "Unpublished")}
                </Label>
              </div>
            </div>
          </div>
        </ModalBody>
        <div className="p-6 border-t border-ld flex items-center gap-3 justify-end">
          <Button color="gray" onClick={() => { setShowEditModal(false); resetForm(); }}>
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button color="primary" onClick={handleEditSlider} disabled={updating}>
            {updating ? t("sliders.updating") || "Updating..." : t("sliders.update") || "Update"}
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedSlider(null); }}
        onConfirm={handleDeleteConfirm}
        title={t("sliders.deleteSlider") || "Delete Slider"}
        message={t("sliders.deleteConfirm") || "Are you sure you want to delete this slider? This action cannot be undone."}
        confirmText={t("sliders.delete") || "Delete"}
        cancelText={t("common.cancel") || "Cancel"}
        isLoading={deleting}
        type="danger"
      />
    </div>
  );
};

export default SlidersPage;

