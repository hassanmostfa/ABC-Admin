"use client";
import React, { useContext } from "react";
import { Badge, Breadcrumb, BreadcrumbItem } from "flowbite-react";
import CardBox from "@/app/components/shared/CardBox";
import { Icon } from "@iconify/react";

interface BreadCrumbType {
  subtitle?: string;
  items?: any[];
  title: string;
  children?: JSX.Element;
}

const BreadcrumbComp = ({ items, title }: BreadCrumbType) => {
  return (
    <>
      <CardBox className={`mb-30 py-4`}>
        <Breadcrumb className="flex justify-between">
          <h6 className="text-base">{title}</h6>
          <div className="flex items-center gap-3">
            {items
              ? items.map((item) => (
                  <div key={item.title}>
                    {item.to ? (
                      <BreadcrumbItem href={item.to}>
                        <Icon
                          icon="solar:home-2-line-duotone"
                          height={20}
                        ></Icon>{" "}
                      </BreadcrumbItem>
                    ) : (
                      <Badge color={"lightprimary"}>{item.title}</Badge>
                    )}
                  </div>
                ))
              : ""}
          </div>
        </Breadcrumb>
      </CardBox>
    </>
  );
};

export default BreadcrumbComp;
