// File: src/types/api.ts

export interface ElementItem {
  id: number;
  status: string;
  element1: string; // Tên yếu tố (ví dụ: 'meta description', 'h1')
  currentValue: string; // Chi tiết, mô tả của yếu tố đó
  url?: string; // URL có thể có hoặc không
}

// Bạn cũng có thể thêm các interface khác vào đây trong tương lai
export interface PaginatedElements {
  items: ElementItem[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}