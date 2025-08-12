import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Search,
  FileSearch,
  Sparkles,
  Rocket,
} from "lucide-react";

const menuItems = [
  {
    category: "Công Cụ SEO",
    items: [
      { name: "Trang Chủ", icon: <LayoutDashboard className="mr-3 h-5 w-5" />, path: "/dashboard" },
      { name: "Phân Tích Keyword", icon: <Search className="mr-3 h-5 w-5" />, path: "/keyword-analysis" },
      { name: "Phân Tích Website", icon: <FileSearch className="mr-3 h-5 w-5" />, path: "/seo-audit" },
      { name: "Tối Ưu Hóa Nội Dung", icon: <Sparkles className="mr-3 h-5 w-5" />, path: "/content-optimization" },
    ],
  },
];

// SỬA Ở ĐÂY 1: Sidebar giờ sẽ nhận props để điều khiển trạng thái
export default function Sidebar({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void; }) {
  const [location] = useLocation();

  return (
    <>
      {/* Lớp phủ cho di động, chỉ hiện khi sidebar mở */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 md:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* SỬA Ở ĐÂY 2: Cập nhật lại class để có hiệu ứng trượt */}
      <aside
        className={`bg-white dark:bg-gray-900 w-64 h-full shadow-md fixed md:relative z-50
                   transform transition-transform duration-300 ease-in-out
                   ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                   md:translate-x-0 overflow-y-auto`}
      >
        <div className="p-4 border-b border-neutral-200 dark:border-gray-700">
          {/* Bọc logo trong Link và thêm onClick để đóng sidebar */}
          <Link href="/dashboard" onClick={() => setSidebarOpen(false)}>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent flex items-center cursor-pointer">
              <Rocket className="mr-2 h-6 w-6 text-blue-500" />
              SEOBoostAI
            </h1>
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            AI-powered SEO Platform
          </p>
        </div>

        <div className="py-2">
          {menuItems.map((category, idx) => (
            <div key={idx}>
              <p className="px-4 py-2 text-xs uppercase text-muted-foreground font-medium mt-2">
                {category.category}
              </p>
              {category.items.map((item, i) => {
                const isActive = location === item.path;
                return (
                  // SỬA Ở ĐÂY 3: Thêm onClick để đóng sidebar khi chọn một mục
                  <Link
                    key={i}
                    href={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`sidebar-menu-item flex items-center px-4 py-3 ${
                      isActive
                        ? "text-white bg-blue-600 dark:bg-blue-500 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* Nút bấm nổi đã được xóa và chuyển thành hamburger menu trong Header */}
    </>
  );
}
