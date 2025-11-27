"use client";
import React, { useState } from "react";
import { Card, Label, TextInput, Spinner, Select, Button, Modal, ModalBody } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useCreateOrderMutation } from "@/store/api/ordersApi";
import { useGetAllCustomersQuery } from "@/store/api/customersApi";
import { useGetAllCharitiesQuery } from "@/store/api/offersApi";
import { useGetOffersQuery } from "@/store/api/offersApi";
import { useGetProductsQuery } from "@/store/api/productsApi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/app/context/NotificationContext";
import { useTranslation } from "react-i18next";
import GenericSearchableSelect from "@/components/shared/GenericSearchableSelect";

interface OrderItem {
  variant_id: number;
  quantity: number;
}

const AddOrderPage = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { showNotification } = useNotification();
  const [createOrder, { isLoading: creating }] = useCreateOrderMutation();

  const [orderType, setOrderType] = useState<"customer" | "charity">("customer");
  const [formData, setFormData] = useState({
    customer_id: 0,
    charity_id: 0,
    payment_method: "cash" as "cash" | "wallet",
    delivery_type: "pickup" as "pickup" | "delivery",
    offer_id: 0,
    used_points: "",
  });

  // Reset payment method to cash when switching to charity
  const handleOrderTypeChange = (newType: "customer" | "charity") => {
    setOrderType(newType);
    setFormData({ 
      ...formData, 
      customer_id: 0, 
      charity_id: 0,
      payment_method: newType === "charity" ? "cash" : formData.payment_method
    });
  };

  const [items, setItems] = useState<OrderItem[]>([
    { variant_id: 0, quantity: 1 }
  ]);

  const [delivery, setDelivery] = useState({
    delivery_address: "",
    block: "",
    street: "",
    house_number: "",
    delivery_datetime: "",
    notes: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [itemErrors, setItemErrors] = useState<Record<number, Record<string, string>>>({});
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Fetch data
  const { data: customersData } = useGetAllCustomersQuery();
  const { data: charitiesData } = useGetAllCharitiesQuery();
  const { data: offersData } = useGetOffersQuery({ page: 1, per_page: 100 }, { 
    refetchOnMountOrArgChange: true 
  });
  const { data: productsData } = useGetProductsQuery({ page: 1, sort_by: "id", sort_order: "asc" }, { 
    refetchOnMountOrArgChange: true 
  });

  // Get all products with variants
  const allProducts = productsData?.data || [];
  const allVariants = allProducts.flatMap((product: any) => 
    (product.variants || []).map((variant: any) => ({
      ...variant,
      product_name_ar: product.name_ar,
      product_name_en: product.name_en,
      product_id: product.id,
    }))
  );

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const itemErrs: Record<number, Record<string, string>> = {};
    const errorMessages: string[] = [];

    // Validate customer/charity
    if (orderType === "customer" && formData.customer_id === 0) {
      errors.customer_id = t("orders.selectCustomer");
      errorMessages.push(t("orders.selectCustomer"));
    }
    if (orderType === "charity" && formData.charity_id === 0) {
      errors.charity_id = t("orders.selectCharity");
      errorMessages.push(t("orders.selectCharity"));
    }

    // Validate items - only required if no offer is selected
    const hasOffer = formData.offer_id > 0;
    
    if (!hasOffer) {
      // Only validate items if no offer is selected
      const validItems = items.filter(item => item.variant_id > 0 && item.quantity > 0);
      
      if (validItems.length === 0) {
        if (items.length === 0) {
          errors.items = t("orders.addAtLeastOneItem");
          errorMessages.push(t("orders.addAtLeastOneItem"));
        }
      }
      
      // Validate each item only if no offer is selected
      items.forEach((item, index) => {
        const itemErr: Record<string, string> = {};
        if (item.variant_id === 0) {
          itemErr.variant_id = t("orders.selectVariant");
          errorMessages.push(`${t("orders.orderItem")} #${index + 1}: ${t("orders.selectVariant")}`);
        }
        if (item.quantity <= 0) {
          itemErr.quantity = t("orders.quantityMustBeGreaterThanZero");
          errorMessages.push(`${t("orders.orderItem")} #${index + 1}: ${t("orders.quantityMustBeGreaterThanZero")}`);
        }
        if (Object.keys(itemErr).length > 0) {
          itemErrs[index] = itemErr;
        }
      });
    }

    // Validate delivery if delivery_type is "delivery"
    if (formData.delivery_type === "delivery") {
      if (!delivery.delivery_address.trim()) {
        errors.delivery_address = t("orders.enterDeliveryAddress");
        errorMessages.push(t("orders.enterDeliveryAddress"));
      }
      if (!delivery.block.trim()) {
        errors.block = t("orders.enterBlock");
        errorMessages.push(t("orders.enterBlock"));
      }
      if (!delivery.street.trim()) {
        errors.street = t("orders.enterStreet");
        errorMessages.push(t("orders.enterStreet"));
      }
      if (!delivery.house_number.trim()) {
        errors.house_number = t("orders.enterHouseNumber");
        errorMessages.push(t("orders.enterHouseNumber"));
      }
      if (!delivery.delivery_datetime) {
        errors.delivery_datetime = t("orders.selectDeliveryDateTime");
        errorMessages.push(t("orders.selectDeliveryDateTime"));
      }
    }

    setFieldErrors(errors);
    setItemErrors(itemErrs);
    
    if (errorMessages.length > 0) {
      setValidationErrors(errorMessages);
      setShowValidationModal(true);
    }
    
    return Object.keys(errors).length === 0 && Object.keys(itemErrs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const orderData: any = {
        payment_method: formData.payment_method,
        delivery_type: formData.delivery_type,
        items: items.filter(item => item.variant_id > 0),
      };

      if (orderType === "customer" && formData.customer_id > 0) {
        orderData.customer_id = formData.customer_id;
      }
      if (orderType === "charity" && formData.charity_id > 0) {
        orderData.charity_id = formData.charity_id;
      }
      if (formData.offer_id > 0) {
        orderData.offer_id = formData.offer_id;
      }
      if (formData.used_points && parseInt(formData.used_points) > 0) {
        orderData.used_points = parseInt(formData.used_points);
      }
      if (formData.delivery_type === "delivery") {
        orderData.delivery = {
          delivery_address: delivery.delivery_address,
          block: delivery.block,
          street: delivery.street,
          house_number: delivery.house_number,
          delivery_datetime: delivery.delivery_datetime,
          delivery_status: "pending",
          notes: delivery.notes || undefined,
        };
      }

      const result = await createOrder(orderData).unwrap();
      showNotification("success", t("orders.success"), t("orders.orderCreated"));
      router.push(`/orders/show/${result.data.id}`);
    } catch (err: any) {
      showNotification("error", t("orders.error"), err?.data?.message || t("orders.createError"));
    }
  };

  const addItem = () => {
    setItems([...items, { variant_id: 0, quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const getVariantLabel = (variantId: number) => {
    const variant = allVariants.find((v: any) => v.id === variantId);
    if (!variant) return "";
    return `${variant.product_name_ar || variant.product_name_en} - ${variant.size || variant.name_ar || variant.name_en}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/orders">
              <button className="h-10 w-10 rounded-full hover:bg-lightprimary dark:hover:bg-darkprimary flex items-center justify-center transition-colors">
                <Icon icon="solar:arrow-right-bold" height={20} className="text-dark dark:text-white" />
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-dark dark:text-white">{t("orders.createOrder")}</h1>
          </div>
          <p className="text-sm text-ld mr-12">{t("orders.createOrderDescription")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Order Type and Customer/Charity */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-dark dark:text-white mb-4">{t("orders.orderType")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="orderType" className="mb-2 block">{t("orders.type")}</Label>
              <Select
                id="orderType"
                value={orderType}
                onChange={(e) => handleOrderTypeChange(e.target.value as "customer" | "charity")}
                style={{ direction: i18n.language === "ar" ? "ltr" : "ltr" }}
              >
                <option value="customer">{t("orders.type.customer")}</option>
                <option value="charity">{t("orders.type.charity")}</option>
              </Select>
            </div>

            {orderType === "customer" ? (
              <div>
                <Label htmlFor="customer_id" className="mb-2 block">{t("orders.customer")}</Label>
                <GenericSearchableSelect
                  value={formData.customer_id}
                  onChange={(value) => setFormData({ ...formData, customer_id: value })}
                  placeholder={t("orders.selectCustomer")}
                  options={customersData?.data?.map((customer) => ({
                    id: customer.id,
                    label: `${customer.name} - ${customer.phone}`,
                  })) || []}
                  error={!!fieldErrors.customer_id}
                  direction={i18n.language === "ar" ? "ltr" : "ltr"}
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="charity_id" className="mb-2 block">{t("orders.charity")}</Label>
                <GenericSearchableSelect
                  value={formData.charity_id}
                  onChange={(value) => setFormData({ ...formData, charity_id: value })}
                  placeholder={t("orders.selectCharity")}
                  options={charitiesData?.data?.map((charity: any) => ({
                    id: charity.id,
                    label: `${charity.name_ar}${charity.phone ? ` - ${charity.phone}` : ""}`,
                  })) || []}
                  error={!!fieldErrors.charity_id}
                  direction={i18n.language === "ar" ? "ltr" : "ltr"}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Payment and Delivery */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-dark dark:text-white mb-4">{t("orders.paymentAndDelivery")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payment_method" className="mb-2 block">{t("orders.paymentMethod")}</Label>
              <Select
                id="payment_method"
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as "cash" | "wallet" })}
                style={{ direction: i18n.language === "ar" ? "ltr" : "ltr" }}
              >
                <option value="cash">{t("orders.paymentMethod.cash")}</option>
                {orderType === "customer" && (
                  <option value="wallet">{t("orders.paymentMethod.wallet")}</option>
                )}
              </Select>
            </div>

            <div>
              <Label htmlFor="delivery_type" className="mb-2 block">{t("orders.deliveryType")}</Label>
              <Select
                id="delivery_type"
                value={formData.delivery_type}
                onChange={(e) => setFormData({ ...formData, delivery_type: e.target.value as "pickup" | "delivery" })}
                style={{ direction: i18n.language === "ar" ? "ltr" : "ltr" }}
              >
                <option value="pickup">{t("orders.deliveryType.pickup")}</option>
                <option value="delivery">{t("orders.deliveryType.delivery")}</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="offer_id" className="mb-2 block">{t("orders.offer")} ({t("orders.optional")})</Label>
              <GenericSearchableSelect
                value={formData.offer_id || 0}
                onChange={(value) => setFormData({ ...formData, offer_id: value })}
                placeholder={t("orders.selectOffer")}
                options={[
                  { id: 0, label: t("orders.selectOffer") },
                  ...(offersData?.data?.map((offer: any) => ({
                    id: offer.id,
                    label: `${offer.id} - ${offer.reward_type}`,
                  })) || [])
                ]}
                direction={i18n.language === "ar" ? "ltr" : "ltr"}
                allowZero={true}
              />
            </div>

            <div>
              <Label htmlFor="used_points" className="mb-2 block">{t("orders.usedPoints")} ({t("orders.optional")})</Label>
              <TextInput
                id="used_points"
                type="number"
                min="0"
                value={formData.used_points}
                onChange={(e) => setFormData({ ...formData, used_points: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>
        </Card>

        {/* Order Items */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-dark dark:text-white">{t("orders.orderItems")}</h2>
            <Button type="button" onClick={addItem} size="sm" color="primary">
              <Icon icon="solar:add-circle-bold" height={20} className="ml-2" />
              {t("orders.addItem")}
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-ld rounded-lg">
                <div>
                  <Label className="mb-2 block">{t("orders.productVariant")}</Label>
                  <GenericSearchableSelect
                    value={item.variant_id}
                    onChange={(value) => updateItem(index, "variant_id", value)}
                    placeholder={t("orders.selectVariant")}
                    options={allVariants.map((variant: any) => {
                      const productName = variant.product_name_ar && variant.product_name_en 
                        ? `${variant.product_name_ar} / ${variant.product_name_en}`
                        : variant.product_name_ar || variant.product_name_en;
                      const variantSize = variant.size || variant.name_ar || variant.name_en;
                      return {
                        id: variant.id,
                        label: `${productName} - ${variantSize}`,
                      };
                    })}
                    error={!!itemErrors[index]?.variant_id}
                    direction={i18n.language === "ar" ? "ltr" : "ltr"}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">{t("orders.quantity")}</Label>
                  <TextInput
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                    color={itemErrors[index]?.quantity ? "failure" : undefined}
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={() => removeItem(index)}
                    color="failure"
                    size="sm"
                    disabled={items.length === 1}
                  >
                    <Icon icon="solar:trash-bin-trash-bold" height={20} className="ml-2" />
                    {t("orders.remove")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Delivery Information */}
        {formData.delivery_type === "delivery" && (
          <Card className="mb-6">
            <h2 className="text-xl font-bold text-dark dark:text-white mb-4">{t("orders.deliveryInformation")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="delivery_address" className="mb-2 block">{t("orders.deliveryAddress")}</Label>
                <TextInput
                  id="delivery_address"
                  value={delivery.delivery_address}
                  onChange={(e) => setDelivery({ ...delivery, delivery_address: e.target.value })}
                  color={fieldErrors.delivery_address ? "failure" : undefined}
                />
              </div>

              <div>
                <Label htmlFor="block" className="mb-2 block">{t("orders.block")}</Label>
                <TextInput
                  id="block"
                  value={delivery.block}
                  onChange={(e) => setDelivery({ ...delivery, block: e.target.value })}
                  color={fieldErrors.block ? "failure" : undefined}
                />
              </div>

              <div>
                <Label htmlFor="street" className="mb-2 block">{t("orders.street")}</Label>
                <TextInput
                  id="street"
                  value={delivery.street}
                  onChange={(e) => setDelivery({ ...delivery, street: e.target.value })}
                  color={fieldErrors.street ? "failure" : undefined}
                />
              </div>

              <div>
                <Label htmlFor="house_number" className="mb-2 block">{t("orders.houseNumber")}</Label>
                <TextInput
                  id="house_number"
                  value={delivery.house_number}
                  onChange={(e) => setDelivery({ ...delivery, house_number: e.target.value })}
                  color={fieldErrors.house_number ? "failure" : undefined}
                />
              </div>

              <div>
                <Label htmlFor="delivery_datetime" className="mb-2 block">{t("orders.deliveryDateTime")}</Label>
                <TextInput
                  id="delivery_datetime"
                  type="datetime-local"
                  value={delivery.delivery_datetime}
                  onChange={(e) => setDelivery({ ...delivery, delivery_datetime: e.target.value })}
                  color={fieldErrors.delivery_datetime ? "failure" : undefined}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="notes" className="mb-2 block">{t("orders.notes")} ({t("orders.optional")})</Label>
                <TextInput
                  id="notes"
                  value={delivery.notes}
                  onChange={(e) => setDelivery({ ...delivery, notes: e.target.value })}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Submit Button */}
        <Card>
          <div className="flex items-center justify-end gap-3">
            <Link href="/orders">
              <Button type="button" color="gray">{t("orders.cancel")}</Button>
            </Link>
            <Button type="submit" disabled={creating} className="bg-primary hover:bg-primary/90">
              {creating ? (
                <>
                  <Spinner size="sm" className="ml-2" />
                  {t("orders.creating")}
                </>
              ) : (
                <>
                  <Icon icon="solar:check-circle-bold" height={20} className="ml-2" />
                  {t("orders.createOrder")}
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>

      {/* Validation Error Modal */}
      <Modal show={showValidationModal} onClose={() => setShowValidationModal(false)} size="md">
        <div className="p-6 border-b border-ld">
          <div className="flex items-center gap-2">
            <Icon icon="solar:danger-circle-bold" height={24} className="text-error" />
            <h3 className="text-xl font-bold text-dark dark:text-white">{t("orders.validationErrors")}</h3>
          </div>
        </div>
        <ModalBody>
          <div className="space-y-2">
            <p className="text-sm text-ld dark:text-white/70 mb-4">{t("orders.pleaseCorrectErrors")}</p>
            <ul className="list-disc list-inside space-y-2">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm text-dark dark:text-white">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        </ModalBody>
        <div className="p-6 border-t border-ld flex justify-end">
          <Button onClick={() => setShowValidationModal(false)} color="primary">
            {t("orders.close")}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AddOrderPage;

