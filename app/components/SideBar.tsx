"use client";
import { useState } from "react";
import sidebarNames from "./names";

interface SubmenuState {
  [key: number]: boolean;
}

// Sort sidebarNames by the main property
const sortedSidebarNames = sidebarNames.sort((a, b) => {
  if (a.main < b.main) {
    return -1;
  }
  if (a.main > b.main) {
    return 1;
  }
  return 0;
});

interface SideBarProps {
  onKeywordSelect: (keyword: { main: string; sub: string }) => void;
}

const SideBar: React.FC<SideBarProps> = ({ onKeywordSelect }) => {
  const [openSubmenus, setOpenSubmenus] = useState<SubmenuState>({});

  const toggleSubMenu = (index: number) => {
    setOpenSubmenus((prevState: any) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const handleClick = (mainKeyword: string, subKeyword: string = "") => {
    onKeywordSelect({ main: mainKeyword, sub: subKeyword });
    console.log({ main: mainKeyword, sub: subKeyword });
  };

  return (
    <div className="w-full h-auto bg-gray-800 text-white flex flex-col">
      {sortedSidebarNames.map((item, index) => (
        <div key={index}>
          <div
            className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-700"
            onClick={() => {
              toggleSubMenu(index);
              handleClick(item.main);
            }}
          >
            <span>{item.main}</span>
            <svg
              className={`w-5 h-5 transform transition-transform ${
                openSubmenus[index] ? "rotate-90" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </div>
          {openSubmenus[index] && (
            <div className="pl-8">
              {item.sub.map((subItem, subIndex) => (
                <div
                  key={subIndex}
                  className="py-2 cursor-pointer hover:bg-gray-700"
                  onClick={() => handleClick(item.main, subItem)}
                >
                  {subItem}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SideBar;
