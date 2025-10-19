"use client";
import React from "react";
import CardBox from "../../shared/CardBox";
import { Icon } from "@iconify/react";

const LatestOrders = () => {
  const ordersData = [
    {
      id: "#12345",
      customer: "أحمد محمد",
      product: "منتج رقم 1",
      amount: "150 دينار",
      status: "قيد المعالجة",
      statusColor: "bg-lightprimary text-primary",
      date: "2024-01-15"
    },
    {
      id: "#12346",
      customer: "فاطمة أحمد",
      product: "منتج رقم 2",
      amount: "200 دينار",
      status: "تم التسليم",
      statusColor: "bg-lightsecondary text-secondary",
      date: "2024-01-14"
    },
    {
      id: "#12347",
      customer: "محمد علي",
      product: "منتج رقم 3",
      amount: "300 دينار",
      status: "معلق",
      statusColor: "bg-lighterror text-error",
      date: "2024-01-13"
    },
    {
      id: "#12348",
      customer: "سارة خالد",
      product: "منتج رقم 4",
      amount: "180 دينار",
      status: "مكتمل",
      statusColor: "bg-lightwarning text-warning",
      date: "2024-01-12"
    },
    {
      id: "#12349",
      customer: "عبدالله سالم",
      product: "منتج رقم 5",
      amount: "250 دينار",
      status: "قيد المعالجة",
      statusColor: "bg-lightprimary text-primary",
      date: "2024-01-11"
    }
  ];

  return (
    <CardBox>
      <div className="flex justify-between items-center mb-6">
        <h5 className="card-title">أحدث الطلبات</h5>
        <button className="text-primary hover:text-primary-dark text-sm font-medium">
          عرض الكل
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-right py-3 px-4 font-semibold text-gray-700">رقم الطلب</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">العميل</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">المنتج</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">المبلغ</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">الحالة</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {ordersData.map((order, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900 font-medium">{order.id}</td>
                <td className="py-3 px-4 text-gray-700">{order.customer}</td>
                <td className="py-3 px-4 text-gray-700">{order.product}</td>
                <td className="py-3 px-4 text-gray-900 font-semibold">{order.amount}</td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.statusColor}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardBox>
  );
};

export default LatestOrders;
