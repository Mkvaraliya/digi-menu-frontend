import React from "react";

const DashCard = ({ title, count, icon, bgColor, textColor }) => {
  return (
    <div className="bg-[#1E1E1E] rounded-lg px-6 py-4 border border-[#2A2A2A] w-72 h-32 flex flex-col justify-between">
      <p className="text-[#9E9E9E] text-2xl">{title}</p>

      <div className="flex justify-between items-center">
        <p className="text-2xl font-semibold">{count}</p>

        <div
          className="rounded-xl w-12 h-12 flex items-center text-2xl justify-center"
          style={{ backgroundColor: bgColor, color: textColor }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default DashCard;
