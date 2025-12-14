"use client";

import React from "react";
import DishesTable from "../components/DishesTable";


const Dishes = () => {

  return (
    <div className="bg-[#121212] m-0 border border-[#2A2A2A] h-screen px-6 py-4 text-white">
      <DishesTable />
    </div>
  );
};

export default Dishes;
