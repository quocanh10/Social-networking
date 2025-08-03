"use client";

import { useState } from "react";
import GridOnIcon from "@mui/icons-material/GridOn";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";

export default function ProfileTabs() {
  const [activeTab, setActiveTab] = useState("posts");

  const tabs = [
    { id: "posts", label: "POSTS", icon: <GridOnIcon fontSize="small" /> },
    { id: "reels", label: "REELS", icon: <PlayArrowIcon fontSize="small" /> },
    {
      id: "tagged",
      label: "TAGGED",
      icon: <AssignmentIndIcon fontSize="small" />,
    },
  ];

  return (
    <div className="border-t border-gray-300">
      <div className="flex justify-center items-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex justify-center items-center gap-2 px-6 py-3 text-xs font-semibold tracking-wide transition-colors ${
              activeTab === tab.id
                ? "text-black border-t-2 border-black -mt-px"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span className="text-sm">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
