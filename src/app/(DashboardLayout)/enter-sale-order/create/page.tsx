"use client";
import React, { useState, useEffect } from "react";
import { Card, Label, TextInput, Spinner, Select, Button, Badge, Tabs, TabItem } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetCustomerByIdQuery, useGetCustomerAddressesQuery, useCreateCustomerAddressMutation } from "@/store/api/customersApi";
import { useGetOffersQuery } from "@/store/api/offersApi";
import { useGetProductsQuery } from "@/store/api/productsApi";
import { useCreateOrderMutation } from "@/store/api/ordersApi";
import { useGetSettingsQuery } from "@/store/api/settingsApi";
import { useGetAllCountriesQuery } from "@/store/api/countriesApi";
import { useGetGovernoratesByCountryQuery } from "@/store/api/governoratesApi";
import { useGetAreasByGovernorateQuery } from "@/store/api/areasApi";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/app/context/NotificationContext";
import { useTranslation } from "react-i18next";
import Image from "next/image";

interface CartOffer {
  offer_id: number;
  quantity: number;
  title: string;
  price: number;
  image: string;
}

interface CartItem {
  variant_id: number;
  quantity: number;
  product_name: string;
  variant_size: string;
  price: number;
  image: string;
}

const CreateSaleOrderPage = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showNotification } = useNotification();
  
  const customerId = parseInt(searchParams.get('customer_id') || '0');
  const { data: customerData, isLoading: loadingCustomer } = useGetCustomerByIdQuery(customerId, { skip: !customerId });
  const { data: addressesData, refetch: refetchAddresses } = useGetCustomerAddressesQuery(customerId, { skip: !customerId });
  const [createAddress, { isLoading: creatingAddress }] = useCreateCustomerAddressMutation();
  
  const [activeTab, setActiveTab] = useState<"offers" | "products">("offers");
  const [cartOffers, setCartOffers] = useState<CartOffer[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "wallet" | "online_link">("cash");
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("delivery");
  const [usedPoints, setUsedPoints] = useState<number>(0);
  const [offersSearch, setOffersSearch] = useState<string>("");
  const [productsSearch, setProductsSearch] = useState<string>("");
  
  const { data: offersData, isLoading: loadingOffers } = useGetOffersQuery({ 
    search: offersSearch || undefined,
    per_page: 100,
    page: 1,
  });
  const { data: productsData, isLoading: loadingProducts } = useGetProductsQuery({ 
    search: productsSearch || undefined,
    page: 1,
  });
  const { data: settingsData } = useGetSettingsQuery();
  
  const [createOrder, { isLoading: creatingOrder }] = useCreateOrderMutation();
  
  const [newAddress, setNewAddress] = useState({
    country_id: 0,
    governorate_id: 0,
    area_id: 0,
    street: "",
    house: "",
    block: "",
    floor: "",
  });
  const [showAddAddress, setShowAddAddress] = useState(false);
  
  // Fetch countries, governorates, and areas
  const { data: countriesData } = useGetAllCountriesQuery();
  const { data: governoratesData } = useGetGovernoratesByCountryQuery(newAddress.country_id, {
    skip: !newAddress.country_id || newAddress.country_id === 0,
  });
  const { data: areasData } = useGetAreasByGovernorateQuery(newAddress.governorate_id, {
    skip: !newAddress.governorate_id || newAddress.governorate_id === 0,
  });

  // Set default country to Kuwait on mount and when form opens
  useEffect(() => {
    if (countriesData?.data && (newAddress.country_id === 0 || showAddAddress)) {
      const kuwait = countriesData.data.find((country: any) => 
        country.name_en?.toLowerCase().includes('kuwait') || 
        country.name_ar?.includes('الكويت')
      );
      if (kuwait && newAddress.country_id !== kuwait.id) {
        setNewAddress(prev => ({ ...prev, country_id: kuwait.id }));
      }
    }
  }, [countriesData, showAddAddress]);

  useEffect(() => {
    if (!customerId) {
      router.push("/enter-sale-order");
    }
  }, [customerId, router]);

  const handleAddOffer = (offer: any) => {
    const existingIndex = cartOffers.findIndex(item => item.offer_id === offer.id);
    if (existingIndex >= 0) {
      const updated = [...cartOffers];
      updated[existingIndex].quantity += 1;
      setCartOffers(updated);
    } else {
      const title = i18n.language === 'ar' 
        ? (offer.title_ar || offer.title_en || `Offer #${offer.id}`)
        : (offer.title_en || offer.title_ar || `Offer #${offer.id}`);
      setCartOffers([...cartOffers, {
        offer_id: offer.id,
        quantity: 1,
        title,
        price: offer.price_after_discount || 0,
        image: offer.image || "",
      }]);
    }
  };

  const handleAddProduct = (product: any, variant: any) => {
    const existingIndex = cartItems.findIndex(item => item.variant_id === variant.id);
    if (existingIndex >= 0) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      setCartItems(updated);
    } else {
      const productName = i18n.language === 'ar'
        ? (product.name_ar || product.name_en)
        : (product.name_en || product.name_ar);
      setCartItems([...cartItems, {
        variant_id: variant.id,
        quantity: 1,
        product_name: productName,
        variant_size: variant.size,
        price: variant.price,
        image: (variant.image && typeof variant.image === 'string') ? variant.image : "",
      }]);
    }
  };

  const handleRemoveOffer = (offerId: number) => {
    setCartOffers(cartOffers.filter(item => item.offer_id !== offerId));
  };

  const handleRemoveItem = (variantId: number) => {
    setCartItems(cartItems.filter(item => item.variant_id !== variantId));
  };

  const handleUpdateQuantity = (type: "offer" | "item", id: number, delta: number) => {
    if (type === "offer") {
      setCartOffers(cartOffers.map(item => {
        if (item.offer_id === id) {
          const newQuantity = item.quantity + delta;
          return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
        }
        return item;
      }));
    } else {
      setCartItems(cartItems.map(item => {
        if (item.variant_id === id) {
          const newQuantity = item.quantity + delta;
          return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
        }
        return item;
      }));
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.country_id || !newAddress.governorate_id || !newAddress.area_id || 
        !newAddress.street.trim() || !newAddress.house.trim() || !newAddress.block.trim()) {
      showNotification("error", t("enterSaleOrder.error"), t("orders.enterAllAddressFields"));
      return;
    }

    try {
      const result = await createAddress({
        customerId,
        address: {
          country_id: newAddress.country_id,
          governorate_id: newAddress.governorate_id,
          area_id: newAddress.area_id,
          street: newAddress.street,
          house: newAddress.house,
          block: newAddress.block,
          floor: newAddress.floor || undefined,
        },
      }).unwrap();

      if (result.success) {
        showNotification("success", t("enterSaleOrder.success"), t("enterSaleOrder.addressCreated"));
        setShowAddAddress(false);
        // Reset to Kuwait default
        const kuwaitId = countriesData?.data?.find((c: any) => 
          c.name_en?.toLowerCase().includes('kuwait') || c.name_ar?.includes('الكويت')
        )?.id || newAddress.country_id;
        setNewAddress({ 
          country_id: kuwaitId,
          governorate_id: 0,
          area_id: 0,
          street: "",
          house: "",
          block: "",
          floor: "",
        });
        refetchAddresses();
      }
    } catch (err: any) {
      showNotification("error", t("enterSaleOrder.error"), err?.data?.message || "Failed to add address");
    }
  };

  const handleCreateOrder = async () => {
    if (cartOffers.length === 0 && cartItems.length === 0) {
      showNotification("error", t("enterSaleOrder.error"), t("enterSaleOrder.cartEmpty"));
      return;
    }

    if (!selectedAddressId && deliveryType === "delivery") {
      showNotification("error", t("enterSaleOrder.error"), t("enterSaleOrder.selectAddressFirst"));
      return;
    }

    try {
      const orderData: any = {
        customer_id: customerId,
        customer_address_id: selectedAddressId || undefined,
        payment_method: paymentMethod,
        delivery_type: deliveryType,
      };

      if (cartOffers.length > 0) {
        orderData.offers = cartOffers.map(item => ({
          offer_id: item.offer_id,
          quantity: item.quantity,
        }));
      }

      if (cartItems.length > 0) {
        orderData.items = cartItems.map(item => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
        }));
      }

      if (usedPoints > 0) {
        orderData.used_points = usedPoints;
      }

      const result = await createOrder(orderData).unwrap();

      if (result.success) {
        showNotification("success", t("enterSaleOrder.success"), t("enterSaleOrder.orderCreated"));
        setTimeout(() => {
          router.push("/orders");
        }, 1500);
      }
    } catch (err: any) {
      showNotification("error", t("enterSaleOrder.error"), err?.data?.message || t("enterSaleOrder.orderError"));
    }
  };

  if (loadingCustomer) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!customerData?.data) {
    return (
      <div className="text-center py-8">
        <p className="text-error">{t("enterSaleOrder.error")}</p>
        <Link href="/enter-sale-order">
          <Button className="mt-4">{t("enterSaleOrder.searchCustomer")}</Button>
        </Link>
      </div>
    );
  }

  const customer = customerData.data;
  const addresses = addressesData?.data || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/enter-sale-order">
              <button className="h-10 w-10 rounded-full hover:bg-lightprimary dark:hover:bg-darkprimary flex items-center justify-center transition-colors">
                <Icon icon="solar:arrow-right-bold" height={20} className="text-dark dark:text-white" />
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-dark dark:text-white">{t("enterSaleOrder.selectProducts")}</h1>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <Card>
        <h2 className="text-xl font-semibold text-dark dark:text-white mb-4">{t("enterSaleOrder.customerInfo")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label className="text-sm text-ld">{t("orders.name")}</Label>
            <p className="font-semibold text-dark dark:text-white">{customer.name}</p>
          </div>
          <div>
            <Label className="text-sm text-ld">{t("orders.phone")}</Label>
            <p className="font-semibold text-dark dark:text-white">{customer.phone}</p>
          </div>
          <div>
            <Label className="text-sm text-ld">{t("orders.email")}</Label>
            <p className="font-semibold text-dark dark:text-white">{customer.email || "-"}</p>
          </div>
          <div>
            <Label className="text-sm text-ld">{t("orders.points")}</Label>
            <p className="font-semibold text-primary">{customer.points || 0}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products & Offers Selection */}
        <div className="lg:col-span-2">
          <Card>
            <Tabs>
              <TabItem active={activeTab === "offers"} title={t("enterSaleOrder.offers")} onClick={() => setActiveTab("offers")}>
                <div className="mb-4">
                  <TextInput
                    type="text"
                    placeholder={t("enterSaleOrder.searchOffers")}
                    value={offersSearch}
                    onChange={(e) => setOffersSearch(e.target.value)}
                    icon={() => <Icon icon="solar:magnifer-line-duotone" height={20} />}
                  />
                </div>
                {loadingOffers ? (
                  <div className="flex justify-center py-8">
                    <Spinner size="xl" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {offersData?.data && offersData.data.length > 0 ? (
                      offersData.data
                        .filter(offer => offer.is_active && offer.type === "normal")
                        .map((offer) => (
                          <Card key={offer.id} className="hover:shadow-lg transition-shadow">
                            <div className="flex flex-col">
                              {offer.image && (
                                <div className="w-full h-48 rounded-lg overflow-hidden mb-4">
                                  <Image
                                    src={offer.image}
                                    alt={offer.title_en || offer.title_ar || `Offer ${offer.id}`}
                                    width={300}
                                    height={200}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <h3 className="font-semibold text-dark dark:text-white mb-2 text-lg">
                                  {i18n.language === 'ar' 
                                    ? (offer.title_ar || offer.title_en || `Offer #${offer.id}`)
                                    : (offer.title_en || offer.title_ar || `Offer #${offer.id}`)}
                                </h3>
                                {offer.description_ar || offer.description_en ? (
                                  <p className="text-sm text-ld mb-3 line-clamp-2">
                                    {i18n.language === 'ar' 
                                      ? (offer.description_ar || offer.description_en)
                                      : (offer.description_en || offer.description_ar)}
                                  </p>
                                ) : null}
                                <div className="space-y-2 mb-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-ld line-through">
                                      {offer.price_before_discount} KWD
                                    </span>
                                    <span className="font-bold text-primary text-lg">
                                      {offer.price_after_discount} KWD
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  onClick={() => handleAddOffer(offer)}
                                  className="w-full bg-primary hover:bg-primary/90"
                                >
                                  <Icon icon="solar:cart-large-4-bold" height={18} className="ml-2" />
                                  {t("enterSaleOrder.addToCart")}
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))
                    ) : (
                      <p className="text-ld col-span-3 text-center py-8">{t("enterSaleOrder.noOffers")}</p>
                    )}
                  </div>
                )}
              </TabItem>

              <TabItem active={activeTab === "products"} title={t("enterSaleOrder.products")} onClick={() => setActiveTab("products")}>
                <div className="mb-4">
                  <TextInput
                    type="text"
                    placeholder={t("enterSaleOrder.searchProducts")}
                    value={productsSearch}
                    onChange={(e) => setProductsSearch(e.target.value)}
                    icon={() => <Icon icon="solar:magnifer-line-duotone" height={20} />}
                  />
                </div>
                {loadingProducts ? (
                  <div className="flex justify-center py-8">
                    <Spinner size="xl" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {productsData?.data && productsData.data.length > 0 ? (
                      productsData.data
                        .filter(product => product.is_active)
                        .flatMap((product) => 
                          product.variants && product.variants.length > 0
                            ? product.variants
                                .filter((variant: any) => variant.is_active)
                                .map((variant: any) => (
                                  <Card key={variant.id} className="hover:shadow-lg transition-shadow">
                                    <div className="flex flex-col">
                                      {variant.image && typeof variant.image === 'string' && (
                                        <div className="w-full h-48 rounded-lg overflow-hidden mb-4">
                                          <Image
                                            src={variant.image}
                                            alt={variant.size}
                                            width={300}
                                            height={200}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                      )}
                                      <div className="flex-1">
                                        <h3 className="font-semibold text-dark dark:text-white mb-2 text-lg">
                                          {i18n.language === 'ar'
                                            ? `${product.name_ar || product.name_en} - ${variant.size}`
                                            : `${product.name_en || product.name_ar} - ${variant.size}`}
                                        </h3>
                                        <p className="text-sm text-ld mb-3">SKU: {variant.sku}</p>
                                        <div className="mb-4">
                                          <span className="font-bold text-primary text-lg">
                                            {variant.price} KWD
                                          </span>
                                        </div>
                                        <Button
                                          onClick={() => handleAddProduct(product, variant)}
                                          className="w-full bg-primary hover:bg-primary/90"
                                        >
                                          <Icon icon="solar:cart-large-4-bold" height={18} className="ml-2" />
                                          {t("enterSaleOrder.addToCart")}
                                        </Button>
                                      </div>
                                    </div>
                                  </Card>
                                ))
                            : []
                        )
                    ) : (
                      <p className="text-ld col-span-3 text-center py-8">{t("enterSaleOrder.noProducts")}</p>
                    )}
                  </div>
                )}
              </TabItem>
            </Tabs>
          </Card>
        </div>

        {/* Cart & Order Details */}
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-xl font-semibold text-dark dark:text-white mb-4">{t("enterSaleOrder.cart")}</h2>
            
            {/* Cart Offers */}
            {cartOffers.length > 0 && (
              <div className="space-y-2 mb-4">
                <h3 className="font-semibold text-dark dark:text-white">{t("enterSaleOrder.offers")}</h3>
                {cartOffers.map((item) => (
                  <div key={item.offer_id} className="border border-ld rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      {item.image && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.title}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-dark dark:text-white truncate">{item.title}</p>
                          <button
                            onClick={() => handleRemoveOffer(item.offer_id)}
                            className="text-error hover:text-error/80 flex-shrink-0"
                          >
                            <Icon icon="solar:trash-bin-trash-bold" height={16} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateQuantity("offer", item.offer_id, -1)}
                              className="w-8 h-8 rounded-lg border border-ld flex items-center justify-center hover:bg-lightprimary dark:hover:bg-darkprimary transition-colors"
                            >
                              <Icon icon="solar:minus-circle-bold" height={16} />
                            </button>
                            <span className="w-8 text-center font-semibold text-dark dark:text-white">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity("offer", item.offer_id, 1)}
                              className="w-8 h-8 rounded-lg border border-ld flex items-center justify-center hover:bg-lightprimary dark:hover:bg-darkprimary transition-colors"
                            >
                              <Icon icon="solar:add-circle-bold" height={16} />
                            </button>
                          </div>
                          <span className="font-semibold text-primary">{item.price * item.quantity} KWD</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cart Items */}
            {cartItems.length > 0 && (
              <div className="space-y-2 mb-4">
                <h3 className="font-semibold text-dark dark:text-white">{t("enterSaleOrder.products")}</h3>
                {cartItems.map((item) => (
                  <div key={item.variant_id} className="border border-ld rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      {item.image && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={`${item.product_name} - ${item.variant_size}`}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-dark dark:text-white truncate">
                            {item.product_name} - {item.variant_size}
                          </p>
                          <button
                            onClick={() => handleRemoveItem(item.variant_id)}
                            className="text-error hover:text-error/80 flex-shrink-0"
                          >
                            <Icon icon="solar:trash-bin-trash-bold" height={16} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateQuantity("item", item.variant_id, -1)}
                              className="w-8 h-8 rounded-lg border border-ld flex items-center justify-center hover:bg-lightprimary dark:hover:bg-darkprimary transition-colors"
                            >
                              <Icon icon="solar:minus-circle-bold" height={16} />
                            </button>
                            <span className="w-8 text-center font-semibold text-dark dark:text-white">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity("item", item.variant_id, 1)}
                              className="w-8 h-8 rounded-lg border border-ld flex items-center justify-center hover:bg-lightprimary dark:hover:bg-darkprimary transition-colors"
                            >
                              <Icon icon="solar:add-circle-bold" height={16} />
                            </button>
                          </div>
                          <span className="font-semibold text-primary">{item.price * item.quantity} KWD</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cartOffers.length === 0 && cartItems.length === 0 && (
              <p className="text-ld text-center py-8">{t("enterSaleOrder.cartEmpty")}</p>
            )}

            {/* Order Summary */}
            {(cartOffers.length > 0 || cartItems.length > 0) && (() => {
              // Calculate subtotal
              const offersTotal = cartOffers.reduce((sum, item) => sum + (item.price * item.quantity), 0);
              const itemsTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
              const subtotal = offersTotal + itemsTotal;

              // Get settings
              const settings = settingsData?.data || [];
              const taxRate = parseFloat(settings.find((s: any) => s.key === "tax")?.value || "0");
              const deliveryPrice = parseFloat(settings.find((s: any) => s.key === "delivery_price")?.value || "0");
              const onePointDiscount = parseFloat(settings.find((s: any) => s.key === "one_point_dicount")?.value || "0");

              // Calculate tax
              const tax = subtotal * taxRate;

              // Calculate delivery fees (only if delivery type is delivery)
              const deliveryFees = deliveryType === "delivery" ? deliveryPrice : 0;

              // Calculate points discount
              const maxPoints = customer.points || 0;
              const pointsDiscountAmount = usedPoints * onePointDiscount;
              const pointsDiscount = Math.min(pointsDiscountAmount, subtotal);

              // Calculate total
              const total = subtotal + tax + deliveryFees - pointsDiscount;

              return (
                <div className="mt-6 pt-6 border-t border-ld space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-ld">{t("orders.subtotal")}</span>
                    <span className="font-semibold text-dark dark:text-white">{subtotal.toFixed(3)} KWD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ld">{t("orders.taxAmount")}</span>
                    <span className="font-semibold text-dark dark:text-white">{tax.toFixed(3)} KWD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ld">{t("orders.deliveryFees")}</span>
                    <span className="font-semibold text-dark dark:text-white">{deliveryFees.toFixed(3)} KWD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ld">{t("orders.pointsDiscount")}</span>
                    <span className="font-semibold text-success">-{pointsDiscount.toFixed(3)} KWD</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-ld">
                    <span className="text-dark dark:text-white">{t("orders.total")}</span>
                    <span className="text-primary">{total.toFixed(3)} KWD</span>
                  </div>
                </div>
              );
            })()}

            {/* Order Details */}
            {(cartOffers.length > 0 || cartItems.length > 0) && (
              <div className="space-y-4 mt-6 pt-6 border-t border-ld">
                <div>
                  <Label className="mb-2 block">{t("enterSaleOrder.paymentMethod")}</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentMethod === "cash"}
                        onChange={() => setPaymentMethod("cash")}
                        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                      />
                      <span className="text-sm text-dark dark:text-white">{t("orders.paymentMethod.cashOnDelivery")}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentMethod === "wallet"}
                        onChange={() => setPaymentMethod("wallet")}
                        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                      />
                      <span className="text-sm text-dark dark:text-white">{t("orders.paymentMethod.wallet")}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentMethod === "online_link"}
                        onChange={() => setPaymentMethod("online_link")}
                        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                      />
                      <span className="text-sm text-dark dark:text-white">{t("orders.paymentMethod.online_link")}</span>
                    </label>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">{t("orders.usedPoints")} ({t("orders.available")}: {customer.points || 0})</Label>
                  <TextInput
                    type="number"
                    min="0"
                    max={customer.points || 0}
                    value={usedPoints}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      const maxPoints = customer.points || 0;
                      setUsedPoints(Math.min(Math.max(0, value), maxPoints));
                    }}
                    placeholder="0"
                  />
                </div>

                {deliveryType === "delivery" && (
                  <div>
                    <Label className="mb-2 block">{t("enterSaleOrder.customerAddress")}</Label>
                    {addresses.length > 0 ? (
                      <Select dir="ltr" value={selectedAddressId} onChange={(e) => setSelectedAddressId(parseInt(e.target.value))}>
                        <option value={0}>{t("enterSaleOrder.selectAddress")}</option>
                        {addresses.map((address: any) => {
                          const countryName = i18n.language === 'ar' ? address.country?.name_ar : address.country?.name_en;
                          const governorateName = i18n.language === 'ar' ? address.governorate?.name_ar : address.governorate?.name_en;
                          const areaName = i18n.language === 'ar' ? address.area?.name_ar : address.area?.name_en;
                          const addressParts = [
                            countryName,
                            governorateName,
                            areaName,
                            address.street,
                            address.block,
                            address.house,
                            address.floor
                          ].filter(Boolean);
                          return (
                            <option key={address.id} value={address.id}>
                              {addressParts.join(' - ')}
                            </option>
                          );
                        })}
                      </Select>
                    ) : (
                      <p className="text-sm text-ld mb-2">{t("enterSaleOrder.noAddresses")}</p>
                    )}
                    <Button
                      size="sm"
                      onClick={() => setShowAddAddress(!showAddAddress)}
                      className="mt-2 w-full"
                    >
                      {showAddAddress ? t("orders.cancel") : t("enterSaleOrder.addNewAddress")}
                    </Button>

                    {showAddAddress && (
                      <div className="mt-4 space-y-3 p-4 border border-ld rounded-lg">
                        {newAddress.country_id > 0 && (
                          <div>
                            <Label className="mb-2 block">{t("orders.governorate")}</Label>
                            <Select
                              dir="ltr"
                              value={newAddress.governorate_id}
                              onChange={(e) => {
                                const governorateId = parseInt(e.target.value);
                                setNewAddress({ 
                                  ...newAddress, 
                                  governorate_id: governorateId,
                                  area_id: 0,
                                });
                              }}
                            >
                              <option value={0}>{t("orders.selectGovernorate")}</option>
                              {governoratesData?.data?.map((governorate: any) => (
                                <option key={governorate.id} value={governorate.id}>
                                  {i18n.language === "ar" ? governorate.name_ar : governorate.name_en}
                                </option>
                              ))}
                            </Select>
                          </div>
                        )}

                        {newAddress.governorate_id > 0 && (
                          <div>
                            <Label className="mb-2 block">{t("orders.area")}</Label>
                            <Select
                              dir="ltr"
                              value={newAddress.area_id}
                              onChange={(e) => setNewAddress({ ...newAddress, area_id: parseInt(e.target.value) })}
                            >
                              <option value={0}>{t("orders.selectArea")}</option>
                              {areasData?.data?.map((area: any) => (
                                <option key={area.id} value={area.id}>
                                  {i18n.language === "ar" ? area.name_ar : area.name_en}
                                </option>
                              ))}
                            </Select>
                          </div>
                        )}

                        <TextInput
                          placeholder={t("orders.street")}
                          value={newAddress.street}
                          onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        />
                        <TextInput
                          placeholder={t("orders.houseNumber")}
                          value={newAddress.house}
                          onChange={(e) => setNewAddress({ ...newAddress, house: e.target.value })}
                        />
                        <TextInput
                          placeholder={t("orders.block")}
                          value={newAddress.block}
                          onChange={(e) => setNewAddress({ ...newAddress, block: e.target.value })}
                        />
                        <TextInput
                          placeholder={t("orders.floor")}
                          value={newAddress.floor}
                          onChange={(e) => setNewAddress({ ...newAddress, floor: e.target.value })}
                        />
                        <Button
                          size="sm"
                          onClick={handleAddAddress}
                          disabled={creatingAddress}
                          className="w-full bg-primary"
                        >
                          {creatingAddress ? <Spinner size="sm" /> : t("enterSaleOrder.addAddress")}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleCreateOrder}
                  disabled={creatingOrder || (deliveryType === "delivery" && !selectedAddressId)}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {creatingOrder ? (
                    <>
                      <Spinner size="sm" className="ml-2" />
                      {t("orders.creating")}
                    </>
                  ) : (
                    t("enterSaleOrder.createOrder")
                  )}
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateSaleOrderPage;

