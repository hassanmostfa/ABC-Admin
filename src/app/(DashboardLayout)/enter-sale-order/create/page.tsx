"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { Card, Label, TextInput, Spinner, Select, Button, Badge, Tabs, TabItem, Modal, ModalBody, ModalHeader, Pagination } from "flowbite-react";
import { Icon } from "@iconify/react";
import Script from "next/script";
import { useGetCustomerByIdQuery, useGetCustomerAddressesQuery, useCreateCustomerAddressMutation } from "@/store/api/customersApi";
import { useGetOffersQuery } from "@/store/api/offersApi";
import { useGetProductsQuery } from "@/store/api/productsApi";
import { useGetAllCategoriesQuery } from "@/store/api/categoriesApi";
import { useGetSubcategoriesQuery } from "@/store/api/subcategoriesApi";
import { useCreateOrderMutation, useGetOrdersQuery } from "@/store/api/ordersApi";
import { useGetSettingsQuery } from "@/store/api/settingsApi";
import { useGetAllCountriesQuery } from "@/store/api/countriesApi";
import { useGetGovernoratesByCountryQuery } from "@/store/api/governoratesApi";
import { useGetAreasByGovernorateQuery } from "@/store/api/areasApi";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/app/context/NotificationContext";
import { useTranslation } from "react-i18next";
import Image from "next/image";

const GOOGLE_MAPS_API_KEY = "AIzaSyB8lLTBxa_Fyp9qGWwPcO-1KxRPVmELppE";
type AddressType = "apartment" | "house" | "office";

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

const CreateSaleOrderPageContent = () => {
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
  const [offersPage, setOffersPage] = useState<number>(1);
  const [productsPage, setProductsPage] = useState<number>(1);
  const [productCategoryFilter, setProductCategoryFilter] = useState<number>(0);
  const [productSubcategoryFilter, setProductSubcategoryFilter] = useState<number>(0);
  const [packOfFilter, setPackOfFilter] = useState<string>("");
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showCustomerDetailsModal, setShowCustomerDetailsModal] = useState<boolean>(false);
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState<boolean>(false);
  const [paymentLink, setPaymentLink] = useState<string>("");
  const [paymentLinkOrderNumber, setPaymentLinkOrderNumber] = useState<string>("");
  const [paymentLinkCopied, setPaymentLinkCopied] = useState<boolean>(false);
  
  const { data: offersData, isLoading: loadingOffers } = useGetOffersQuery({ 
    search: offersSearch || undefined,
    per_page: 12,
    page: offersPage,
  });
  const { data: productsData, isLoading: loadingProducts } = useGetProductsQuery({ 
    search: productsSearch || undefined,
    page: productsPage,
    category_id: productCategoryFilter || undefined,
    subcategory_id: productSubcategoryFilter || undefined,
  });
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const { data: subcategoriesData } = useGetSubcategoriesQuery({
    page: 1,
    per_page: 100,
    category_id: productCategoryFilter || undefined,
  });
  const { data: settingsData } = useGetSettingsQuery();
  
  const [createOrder, { isLoading: creatingOrder }] = useCreateOrderMutation();
  
  // Fetch customer orders for history modal
  const customerPhone = customerData?.data?.phone || "";
  const { data: ordersData, isLoading: loadingOrders } = useGetOrdersQuery(
    { 
      search: customerPhone,
      page: 1,
      sort_by: "created_at",
      sort_order: "desc"
    },
    { skip: !showHistoryModal || !customerPhone }
  );
  
  const [newAddress, setNewAddress] = useState<{
    country_id: number;
    governorate_id: number;
    area_id: number;
    lat: number | null;
    lng: number | null;
    type: AddressType;
    street: string;
    house: string;
    block: string;
    floor: string;
    building_name: string;
    apartment_number: string;
    company: string;
    additional_directions: string;
    address_label: string;
    phone_number: string;
  }>({
    country_id: 0,
    governorate_id: 0,
    area_id: 0,
    lat: null,
    lng: null,
    type: "house",
    street: "",
    house: "",
    block: "",
    floor: "",
    building_name: "",
    apartment_number: "",
    company: "",
    additional_directions: "",
    address_label: "",
    phone_number: "",
  });
  const [showAddAddress, setShowAddAddress] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<{ map: any; marker: any } | null>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  
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

  // Init Google Map when add-address is open and script loaded
  useEffect(() => {
    if (!showAddAddress || !mapsLoaded || !mapRef.current || typeof window === "undefined" || !(window as any).google) return;

    const google = (window as any).google;
    const center = { lat: newAddress.lat ?? 29.3759, lng: newAddress.lng ?? 47.9774 };
    const map = new google.maps.Map(mapRef.current, {
      zoom: 14,
      center,
      mapTypeControl: true,
      fullscreenControl: true,
    });
    let marker: any = null;

    const updateMarker = (lat: number, lng: number) => {
      if (marker) marker.setMap(null);
      marker = new google.maps.Marker({ position: { lat, lng }, map });
      map.panTo({ lat, lng });
    };
    if (newAddress.lat != null && newAddress.lng != null) {
      updateMarker(newAddress.lat, newAddress.lng);
    }

    const clickHandler = (e: any) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setNewAddress((prev) => ({ ...prev, lat, lng }));
      updateMarker(lat, lng);

      // Reverse geocode to suggest address
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: any[] | null, status: string) => {
        if (status === "OK" && results?.[0]) {
          const addr = results[0];
          const components = addr.address_components || [];
          let street = "";
          let block = "";
          for (const c of components) {
            if (c.types.includes("route")) street = c.long_name;
            if (c.types.includes("sublocality_level_1") || c.types.includes("neighborhood")) block = block || c.long_name;
          }
          setNewAddress((prev) => ({
            ...prev,
            ...(street && { street: prev.street || street }),
            ...(block && { block: prev.block || block }),
          }));
        }
      });
    };
    map.addListener("click", clickHandler);
    mapInstanceRef.current = { map, marker };

    return () => {
      if (mapInstanceRef.current?.marker) mapInstanceRef.current.marker.setMap(null);
      google.maps.event.clearListeners(map, "click");
      mapInstanceRef.current = null;
    };
  }, [showAddAddress, mapsLoaded]);

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
    const { type, country_id, governorate_id, area_id, street, phone_number, house, block, floor, building_name, apartment_number, company, additional_directions, address_label, lat, lng } = newAddress;

    if (!country_id || !governorate_id || !area_id || !street.trim() || !phone_number.trim()) {
      showNotification("error", t("enterSaleOrder.error"), t("orders.enterAllAddressFields"));
      return;
    }
    if (type === "house" && (!house.trim() || !block.trim())) {
      showNotification("error", t("enterSaleOrder.error"), t("orders.enterAllAddressFields"));
      return;
    }
    if (type === "apartment" && !building_name.trim()) {
      showNotification("error", t("enterSaleOrder.error"), t("orders.enterAllAddressFields"));
      return;
    }
    if (type === "office" && (!building_name.trim() || !company.trim() || !block.trim())) {
      showNotification("error", t("enterSaleOrder.error"), t("orders.enterAllAddressFields"));
      return;
    }

    const basePayload: Record<string, unknown> = {
      country_id,
      governorate_id,
      area_id,
      type,
      street: street.trim(),
      phone_number: phone_number.trim(),
      ...(lat != null && lng != null && { lat, lng }),
    };

    if (type === "house") {
      basePayload.house = house.trim();
      basePayload.block = block.trim();
    } else if (type === "apartment") {
      basePayload.building_name = building_name.trim();
      if (apartment_number.trim()) basePayload.apartment_number = apartment_number.trim();
      if (floor.trim()) basePayload.floor = floor.trim();
      if (additional_directions.trim()) basePayload.additional_directions = additional_directions.trim();
      if (address_label.trim()) basePayload.address_label = address_label.trim();
    } else if (type === "office") {
      basePayload.building_name = building_name.trim();
      basePayload.company = company.trim();
      if (floor.trim()) basePayload.floor = floor.trim();
      basePayload.block = block.trim();
    }

    try {
      const result = await createAddress({
        customerId,
        address: basePayload,
      }).unwrap();

      if (result.success) {
        showNotification("success", t("enterSaleOrder.success"), t("enterSaleOrder.addressCreated"));
        setShowAddAddress(false);
        const kuwaitId = countriesData?.data?.find((c: any) =>
          c.name_en?.toLowerCase().includes("kuwait") || c.name_ar?.includes("الكويت")
        )?.id ?? country_id;
        setNewAddress({
          country_id: kuwaitId,
          governorate_id: 0,
          area_id: 0,
          lat: null,
          lng: null,
          type: "house",
          street: "",
          house: "",
          block: "",
          floor: "",
          building_name: "",
          apartment_number: "",
          company: "",
          additional_directions: "",
          address_label: "",
          phone_number: "",
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
        const data = result.data as { payment_link?: string; order_number?: string; invoice?: { payment_link?: string } };
        const link = data?.payment_link || data?.invoice?.payment_link;
        if (paymentMethod === "online_link" && link) {
          setPaymentLink(link);
          setPaymentLinkOrderNumber(data?.order_number || "");
          setShowPaymentLinkModal(true);
          showNotification("success", t("enterSaleOrder.success"), t("enterSaleOrder.orderCreated"));
        } else {
          showNotification("success", t("enterSaleOrder.success"), t("enterSaleOrder.orderCreated"));
          setTimeout(() => {
            router.push("/orders");
          }, 1500);
        }
      }
    } catch (err: any) {
      showNotification("error", t("enterSaleOrder.error"), err?.data?.message || t("enterSaleOrder.orderError"));
    }
  };

  const customer = customerData?.data;
  const addresses = addressesData?.data || [];
  
  // Get last 3 orders
  const recentOrders = ordersData?.data?.slice(0, 3) || [];
  
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: "success" | "failure" | "warning" | "info"; label: string }> = {
      pending: { color: "warning", label: t("orders.status.pending") },
      processing: { color: "info", label: t("orders.status.processing") },
      completed: { color: "success", label: t("orders.status.completed") },
      cancelled: { color: "failure", label: t("orders.status.cancelled") },
    };
    const config = statusConfig[status] || { color: "info", label: status };
    return (
      <Badge color={config.color} className="w-fit">
        {config.label}
      </Badge>
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      cash: t("orders.paymentMethod.cash"),
      wallet: t("orders.paymentMethod.wallet"),
      card: t("orders.paymentMethod.card"),
      online_link: t("orders.paymentMethod.onlineLink") || "Online Link",
    };
    return methods[method] || method;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-KW' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const productCategoryOptions = categoriesData?.data || [];
  const productSubcategoryOptions = subcategoriesData?.data || [];

  const packOfOptions = React.useMemo(() => {
    const products = productsData?.data || [];
    const set = new Set<string>();

    products.forEach((product: any) => {
      const categoryId = product.category_id || product.category?.id;
      const subcategoryId = product.subcategory_id || product.subcategory?.id;

      if (productCategoryFilter && categoryId !== productCategoryFilter) return;
      if (productSubcategoryFilter && subcategoryId !== productSubcategoryFilter) return;

      (product.variants || []).forEach((variant: any) => {
        if (variant.is_active && variant.size) {
          set.add(String(variant.size));
        }
      });
    });

    return Array.from(set);
  }, [productsData?.data, productCategoryFilter, productSubcategoryFilter]);

  const filteredProductVariants = React.useMemo(() => {
    const products = productsData?.data || [];

    return products
      .filter((product: any) => product.is_active)
      .flatMap((product: any) =>
        (product.variants || [])
          .filter((variant: any) => variant.is_active)
          .filter((variant: any) => {
            if (!packOfFilter) return true;
            return String(variant.size || "") === packOfFilter;
          })
          .map((variant: any) => ({ product, variant }))
      );
  }, [productsData?.data, productCategoryFilter, productSubcategoryFilter, packOfFilter]);

  const filteredOffers = React.useMemo(() => {
    const offers = offersData?.data || [];
    return offers.filter((offer: any) => {
      const isActive = offer.is_active && offer.type === "normal";
      const notExpired = offer.status !== "expired" && new Date(offer.offer_end_date) >= new Date(new Date().setHours(0, 0, 0, 0));
      return isActive && notExpired;
    });
  }, [offersData?.data]);

  if (loadingCustomer) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-8">
        <p className="text-error">{t("enterSaleOrder.error")}</p>
        <Link href="/enter-sale-order">
          <Button className="mt-4">{t("enterSaleOrder.searchCustomer")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`}
        onLoad={() => setMapsLoaded(true)}
        strategy="lazyOnload"
      />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products & Offers Selection */}
        <div className="lg:col-span-2">
          <Card className="flex flex-col">
            <div className="space-y-3 mb-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  onClick={() => setShowCustomerDetailsModal(true)}
                  color="light"
                  className="w-full"
                >
                  <Icon icon="solar:user-id-bold" height={18} className="mr-2" />
                  {t("enterSaleOrder.customerInfo")}
                </Button>
                <Button
                  onClick={() => setShowHistoryModal(true)}
                  color="light"
                  className="w-full"
                >
                  <Icon icon="solar:history-bold" height={18} className="mr-2" />
                  {t("enterSaleOrder.viewHistory")}
                </Button>
              </div>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
              <Tabs>
                <TabItem active={activeTab === "offers"} title={t("enterSaleOrder.offers")} onClick={() => setActiveTab("offers")}>
                  <div className="mb-4">
                  <TextInput
                    type="text"
                    placeholder={t("enterSaleOrder.searchOffers")}
                    value={offersSearch}
                    onChange={(e) => {
                      setOffersSearch(e.target.value);
                      setOffersPage(1);
                    }}
                    icon={() => <Icon icon="solar:magnifer-line-duotone" height={20} />}
                  />
                </div>
                {loadingOffers ? (
                  <div className="flex justify-center py-8">
                    <Spinner size="xl" />
                  </div>
                ) : (
                  <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 overflow-y-auto max-h-[calc(100vh-350px)]">
                    {filteredOffers.length > 0 ? (
                      filteredOffers.map((offer) => (
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
                  {offersData?.pagination && offersData.pagination.last_page > 1 && (
                    <div className="mt-4 flex justify-center">
                      <Pagination
                        currentPage={offersPage}
                        totalPages={offersData.pagination.last_page}
                        onPageChange={setOffersPage}
                        showIcons
                        previousLabel={t("orders.previous")}
                        nextLabel={t("orders.next")}
                      />
                    </div>
                  )}
                  </>
                )}
              </TabItem>

              <TabItem active={activeTab === "products"} title={t("enterSaleOrder.products")} onClick={() => setActiveTab("products")}>
                <div className="mb-4">
                  <TextInput
                    type="text"
                    placeholder={t("enterSaleOrder.searchProducts")}
                    value={productsSearch}
                    onChange={(e) => {
                      setProductsSearch(e.target.value);
                      setProductsPage(1);
                    }}
                    icon={() => <Icon icon="solar:magnifer-line-duotone" height={20} />}
                  />
                </div>
                <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Select
                    value={productCategoryFilter}
                    onChange={(e) => {
                      setProductCategoryFilter(parseInt(e.target.value));
                      setProductSubcategoryFilter(0);
                      setPackOfFilter("");
                      setProductsPage(1);
                    }}
                  >
                    <option value={0}>{t("products.allCategories")}</option>
                    {productCategoryOptions.map((category) => (
                      <option key={category.id} value={category.id}>
                        {i18n.language === "ar" ? (category.name_ar || category.name_en) : (category.name_en || category.name_ar)}
                      </option>
                    ))}
                  </Select>
                  <Select
                    value={productSubcategoryFilter}
                    onChange={(e) => {
                      setProductSubcategoryFilter(parseInt(e.target.value));
                      setPackOfFilter("");
                      setProductsPage(1);
                    }}
                  >
                    <option value={0}>{t("products.allSubcategories")}</option>
                    {productSubcategoryOptions.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {i18n.language === "ar" ? (subcategory.name_ar || subcategory.name_en) : (subcategory.name_en || subcategory.name_ar)}
                      </option>
                    ))}
                  </Select>
                  <Select
                    value={packOfFilter}
                    onChange={(e) => setPackOfFilter(e.target.value)}
                  >
                    <option value="">
                      {i18n.language === "ar" ? "كل الشده" : "All Pack of"}
                    </option>
                    {packOfOptions.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </Select>
                </div>
                {loadingProducts ? (
                  <div className="flex justify-center py-8">
                    <Spinner size="xl" />
                  </div>
                ) : (
                  <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 overflow-y-auto max-h-[calc(100vh-350px)]">
                    {filteredProductVariants.length > 0 ? (
                      filteredProductVariants.map(({ product, variant }: any) => (
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
                    ) : (
                      <p className="text-ld col-span-3 text-center py-8">{t("enterSaleOrder.noProducts")}</p>
                    )}
                  </div>
                  {productsData?.pagination && productsData.pagination.last_page > 1 && (
                    <div className="mt-4 flex justify-center">
                      <Pagination
                        currentPage={productsPage}
                        totalPages={productsData.pagination.last_page}
                        onPageChange={setProductsPage}
                        showIcons
                        previousLabel={t("orders.previous")}
                        nextLabel={t("orders.next")}
                      />
                    </div>
                  )}
                  </>
                )}
              </TabItem>
            </Tabs>
            </div>
          </Card>
        </div>

        {/* Customer Info & Cart */}
        <div className="lg:col-span-1 space-y-6">
          {/* Cart */}
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

              // Calculate tax
              const tax = subtotal * taxRate;

              // Calculate delivery fees (only if delivery type is delivery)
              const deliveryFees = deliveryType === "delivery" ? deliveryPrice : 0;

              // Calculate total
              const total = subtotal + tax + deliveryFees;

              return (
                <div className="mt-6 pt-6 border-t border-ld space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-ld">{t("orders.subtotal")}</span>
                    <span className="font-semibold text-dark dark:text-white">{subtotal.toFixed(3)} KWD</span>
                  </div>
                  {tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-ld">{t("orders.taxAmount")}</span>
                      <span className="font-semibold text-dark dark:text-white">{tax.toFixed(3)} KWD</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-ld">{t("orders.deliveryFees")}</span>
                    <span className="font-semibold text-dark dark:text-white">{deliveryFees.toFixed(3)} KWD</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-ld">
                    <span className="text-dark dark:text-white">
                      {paymentMethod === "online_link" ? t("orders.amountDue") : t("orders.total")}
                    </span>
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
                      <span className="text-sm text-dark dark:text-white">{t("orders.paymentMethod.onlineLink")}</span>
                    </label>
                  </div>
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
                        <div>
                          <Label className="mb-2 block">{t("enterSaleOrder.addressType")}</Label>
                          <Select
                            value={newAddress.type}
                            style={{ paddingRight: "30px" }}
                            onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value as AddressType })}
                          >
                            <option value="house">{t("enterSaleOrder.addressType.house")}</option>
                            <option value="apartment">{t("enterSaleOrder.addressType.apartment")}</option>
                            <option value="office">{t("enterSaleOrder.addressType.office")}</option>
                          </Select>
                        </div>

                        {newAddress.country_id > 0 && (
                          <div>
                            <Label className="mb-2 block">{t("orders.governorate")}</Label>
                            <Select
                              style={{ paddingRight: "30px" }}
                              value={newAddress.governorate_id}
                              onChange={(e) => {
                                const governorateId = parseInt(e.target.value);
                                setNewAddress({ ...newAddress, governorate_id: governorateId, area_id: 0 });
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

                        <div>
                          <Label className="mb-2 block">{t("enterSaleOrder.addressPhoneNumber")}</Label>
                          <TextInput
                            dir="ltr"
                            placeholder="+96512345678"
                            value={newAddress.phone_number}
                            onChange={(e) => setNewAddress({ ...newAddress, phone_number: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label className="mb-2 block">{t("enterSaleOrder.selectLocationOnMap")}</Label>
                          <div ref={mapRef} className="w-full h-48 rounded-lg overflow-hidden bg-lightgray dark:bg-darkgray" />
                          {(newAddress.lat != null && newAddress.lng != null) && (
                            <p className="text-xs text-ld mt-1">
                              {t("enterSaleOrder.latLng")}: {newAddress.lat.toFixed(5)}, {newAddress.lng.toFixed(5)}
                            </p>
                          )}
                        </div>

                        <TextInput
                          placeholder={t("orders.street")}
                          value={newAddress.street}
                          onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        />

                        {newAddress.type === "house" && (
                          <>
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
                          </>
                        )}

                        {newAddress.type === "apartment" && (
                          <>
                            <TextInput
                              placeholder={t("enterSaleOrder.buildingName")}
                              value={newAddress.building_name}
                              onChange={(e) => setNewAddress({ ...newAddress, building_name: e.target.value })}
                            />
                            <TextInput
                              placeholder={t("enterSaleOrder.apartmentNumber")}
                              value={newAddress.apartment_number}
                              onChange={(e) => setNewAddress({ ...newAddress, apartment_number: e.target.value })}
                            />
                            <TextInput
                              placeholder={t("orders.floor")}
                              value={newAddress.floor}
                              onChange={(e) => setNewAddress({ ...newAddress, floor: e.target.value })}
                            />
                            <TextInput
                              placeholder={t("enterSaleOrder.additionalDirections")}
                              value={newAddress.additional_directions}
                              onChange={(e) => setNewAddress({ ...newAddress, additional_directions: e.target.value })}
                            />
                            <TextInput
                              placeholder={t("enterSaleOrder.addressLabel")}
                              value={newAddress.address_label}
                              onChange={(e) => setNewAddress({ ...newAddress, address_label: e.target.value })}
                            />
                          </>
                        )}

                        {newAddress.type === "office" && (
                          <>
                            <TextInput
                              placeholder={t("enterSaleOrder.buildingName")}
                              value={newAddress.building_name}
                              onChange={(e) => setNewAddress({ ...newAddress, building_name: e.target.value })}
                            />
                            <TextInput
                              placeholder={t("enterSaleOrder.company")}
                              value={newAddress.company}
                              onChange={(e) => setNewAddress({ ...newAddress, company: e.target.value })}
                            />
                            <TextInput
                              placeholder={t("orders.floor")}
                              value={newAddress.floor}
                              onChange={(e) => setNewAddress({ ...newAddress, floor: e.target.value })}
                            />
                            <TextInput
                              placeholder={t("orders.block")}
                              value={newAddress.block}
                              onChange={(e) => setNewAddress({ ...newAddress, block: e.target.value })}
                            />
                          </>
                        )}

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

      {/* Customer Details Modal */}
      <Modal show={showCustomerDetailsModal} onClose={() => setShowCustomerDetailsModal(false)} size="lg">
        <div className="p-6 border-b border-ld">
          <div className="flex items-center gap-2">
            <Icon icon="solar:user-id-bold" height={20} />
            <h3 className="text-xl font-semibold text-dark dark:text-white">{t("enterSaleOrder.customerInfo")}</h3>
          </div>
        </div>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-ld">{t("orders.name")}</Label>
              <p className="font-semibold text-dark dark:text-white text-sm">{customer.name || "-"}</p>
            </div>
            <div>
              <Label className="text-xs text-ld">{t("orders.phone")}</Label>
              <p className="font-semibold text-dark dark:text-white text-sm">{customer.phone || "-"}</p>
            </div>
            <div>
              <Label className="text-xs text-ld">{t("orders.email")}</Label>
              <p className="font-semibold text-dark dark:text-white text-sm">{customer.email || "-"}</p>
            </div>
            <div>
              <Label className="text-xs text-ld">{t("orders.points")}</Label>
              <p className="font-semibold text-primary text-sm">{customer.points || 0}</p>
            </div>
          </div>
        </ModalBody>
        <div className="p-6 border-t border-ld flex justify-end">
          <Button color="gray" onClick={() => setShowCustomerDetailsModal(false)}>
            {t("common.close") || "Close"}
          </Button>
        </div>
      </Modal>
      
      {/* History Modal */}
      <Modal show={showHistoryModal} onClose={() => setShowHistoryModal(false)} size="xl">
        <div className="p-6 border-b border-ld">
          <div className="flex items-center gap-2">
            <Icon icon="solar:history-bold" height={20} />
            <h3 className="text-xl font-semibold text-dark dark:text-white">{t("enterSaleOrder.viewHistory")}</h3>
          </div>
        </div>
        <ModalBody>
          {loadingOrders ? (
            <div className="flex justify-center py-8">
              <Spinner size="xl" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-ld dark:text-white/70">{t("orders.noOrders") || "No orders found"}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm font-semibold text-dark dark:text-white">
                          {order.order_number}
                        </span>
                        {getStatusBadge(order.status || "pending")}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <Label className="text-xs text-ld">{t("orders.totalAmount")}</Label>
                          <p className="font-semibold text-dark dark:text-white">
                            {order.invoice?.amount_due ?? order.total_amount} KWD
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-ld">{t("orders.paymentMethod")}</Label>
                          <p className="font-medium text-dark dark:text-white">{getPaymentMethodLabel(order.payment_method)}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-ld">{t("orders.date")}</Label>
                          <p className="text-dark dark:text-white">{formatDate(order.created_at)}</p>
                        </div>
                        {order.delivery_type && (
                          <div>
                            <Label className="text-xs text-ld">{t("orders.deliveryType")}</Label>
                            <p className="text-dark dark:text-white">
                              {order.delivery_type === "delivery" ? t("orders.deliveryType.delivery") : t("orders.deliveryType.pickup")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <Link href={`/orders/show/${order.id}`}>
                      <Button size="sm" color="light">
                        <Icon icon="solar:eye-bold" height={16} className="mr-1" />
                        {t("orders.view") || "View"}
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ModalBody>
        <div className="p-6 border-t border-ld flex items-center gap-3">
          <Button color="gray" onClick={() => setShowHistoryModal(false)}>
            {t("common.close") || "Close"}
          </Button>
          <Link href={`/orders?search=${customerPhone}`}>
            <Button color="primary">
              {t("orders.viewAll") || "View All Orders"}
            </Button>
          </Link>
        </div>
      </Modal>

      {/* Payment Link Modal (online_link orders) */}
      <Modal show={showPaymentLinkModal} onClose={() => { setShowPaymentLinkModal(false); router.push("/orders"); }} size="lg">
        <ModalHeader className="border-b border-ld">
          <div className="flex items-center gap-2">
            <Icon icon="solar:link-circle-bold" height={24} className="text-primary" />
            <span className="text-dark dark:text-white">{t("enterSaleOrder.paymentLinkTitle")}</span>
          </div>
        </ModalHeader>
        <ModalBody className="pt-6">
          <p className="text-sm text-ld dark:text-white/70 mb-4">
            {t("enterSaleOrder.paymentLinkDescription")}
            {paymentLinkOrderNumber && (
              <span className="font-mono font-semibold text-dark dark:text-white ms-1">{paymentLinkOrderNumber}</span>
            )}
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <TextInput
                readOnly
                value={paymentLink}
                className="flex-1 font-mono text-sm bg-lightgray dark:bg-darkgray border-ld"
              />
              <Button
                color="gray"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(paymentLink);
                    setPaymentLinkCopied(true);
                    showNotification("success", t("enterSaleOrder.copied"), t("enterSaleOrder.linkCopied"));
                    setTimeout(() => setPaymentLinkCopied(false), 2000);
                  } catch {
                    showNotification("error", t("enterSaleOrder.error"), t("enterSaleOrder.copyFailed"));
                  }
                }}
                className="shrink-0"
              >
                <Icon icon={paymentLinkCopied ? "solar:check-circle-bold" : "solar:copy-bold"} height={18} className="me-1" />
                {paymentLinkCopied ? t("enterSaleOrder.copied") : t("enterSaleOrder.copyLink")}
              </Button>
            </div>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(paymentLink)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium transition-colors"
            >
              <Icon icon="ri:whatsapp-fill" height={22} />
              {t("enterSaleOrder.shareViaWhatsApp")}
            </a>
          </div>
        </ModalBody>
        <div className="p-6 border-t border-ld flex justify-end">
          <Button color="gray" onClick={() => { setShowPaymentLinkModal(false); router.push("/orders"); }}>
            {t("enterSaleOrder.closeAndGoToOrders")}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

const CreateSaleOrderPage = () => {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    }>
      <CreateSaleOrderPageContent />
    </Suspense>
  );
};

export default CreateSaleOrderPage;

