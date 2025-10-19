import WelcomeBox from "@/app/components/dashboards/Dashboard1/WelcomeBox";
import React from "react";
import Customer from "../components/dashboards/Dashboard1/Customer";
import Project from "../components/dashboards/Dashboard1/Project";
import YourPerformance from "../components/dashboards/Dashboard1/YourPerformance";
import RevenueByProduct from "../components/dashboards/Dashboard1/RevenueByProduct";
import StatsCards from "../components/dashboards/Dashboard1/StatsCards";
import LatestOrders from "../components/dashboards/Dashboard1/LatestOrders";

const page = () => {
  return (
    <>
      <div className="grid grid-cols-12 gap-6 items-stretch">
        {/* Top Row - Welcome Box and Performance Chart */}
        <div className="lg:col-span-4 col-span-12">
          <WelcomeBox />
        </div>
        <div className="lg:col-span-8 col-span-12">
          <YourPerformance />
        </div>
        
        {/* Stats Cards Row */}
        <div className="col-span-12">
          <StatsCards />
        </div>
        
        {/* Latest Orders Table */}
        <div className="col-span-12">
          <LatestOrders />
        </div>
      
      </div>
    </>
  );
};

export default page;