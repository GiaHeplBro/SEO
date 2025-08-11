import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Minus, ArrowLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Dữ liệu so sánh tính năng đã được Việt hóa
const featureData = {
    headers: ["Miễn phí", "Cơ bản", "Chuyên nghiệp", "Doanh nghiệp"],
    features: [
        {
            category: "Tính năng cốt lõi",
            items: [
                { name: "Kiểm tra SEO", values: ["5/tháng", "Không giới hạn", "Không giới hạn", "Không giới hạn"] },
                { name: "Phân tích từ khóa", values: ["10/tháng", "Không giới hạn", "Không giới hạn", "Không giới hạn"] },
                { name: "Tối ưu hóa nội dung bằng AI", values: [false, true, true, true] },
                { name: "Theo dõi thứ hạng", values: ["5 từ khóa", "100 từ khóa", "500 từ khóa", "1.500 từ khóa"] },
                { name: "Phân tích backlink tự động", values: [false, false, true, true] },
                { name: "Đề xuất SEO kỹ thuật", values: [false, false, true, true] },
            ]
        },
        {
            category: "Nhóm & Cộng tác",
            items: [
                { name: "Thành viên nhóm", values: [1, 2, 10, "50+"] },
                { name: "Vai trò & Quyền của nhóm", values: [false, false, true, true] },
                { name: "Công cụ cộng tác", values: [false, true, true, true] },
            ]
        },
        {
            category: "Hỗ trợ",
            items: [
                { name: "Hỗ trợ cộng đồng", values: [true, true, true, true] },
                { name: "Hỗ trợ qua Email & Chat", values: [false, true, true, true] },
                { name: "Quản lý hỗ trợ riêng", values: [false, false, false, true] },
            ]
        }
    ]
};

// Dịch vụ trả phí theo lần sử dụng đã được Việt hóa
const payPerUseServices = [
    { name: "Kiểm tra SEO", price: "99.000 VNĐ" },
    { name: "AI Nội dung", price: "79.000 VNĐ" },
    { name: "Phân tích Backlink", price: "89.000 VNĐ" },
    { name: "Sửa lỗi SEO kỹ thuật", price: "129.000 VNĐ" },
];

// Component hiển thị icon hoặc giá trị cho tính năng
const FeatureIcon = ({ value }: { value: string | boolean | number }) => {
    if (typeof value === 'boolean') {
        // Nếu là true, hiển thị icon Check to và đậm hơn
        // Nếu là false, hiển thị icon gạch ngang (Minus)
        return value
            ? <Check className="h-6 w-6 text-green-500 stroke-[3]" />
            : <Minus className="h-6 w-6 text-gray-400" />;
    }
    // Font chữ to và đậm hơn cho text
    return <span className="text-base font-semibold">{value}</span>;
};

// Component chính của trang so sánh
export default function FeatureComparisonPage() {
    return (
        <div className="container mx-auto py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight">So sánh các gói của chúng tôi</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Tìm gói hoàn hảo với các tính năng phù hợp để nâng cao hiệu suất SEO của bạn.
                </p>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[300px] text-sm font-bold">Tính năng</TableHead>
                                {featureData.headers.map(header => (
                                    <TableHead
                                        key={header}
                                        className="text-center text-sm font-bold"
                                        style={{ fontSize: "150%" }}
                                    >
                                        {header}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {featureData.features.map(category => (
                                <React.Fragment key={category.category}>
                                    <TableRow className="bg-muted/50">
                                        <TableCell colSpan={5} className="font-bold text-base">{category.category}</TableCell>
                                    </TableRow>
                                    {category.items.map(item => (
                                        <TableRow key={item.name}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            {item.values.map((value, index) => (
                                                <TableCell key={index} className="text-left">
                                                    <FeatureIcon value={value} />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="mt-16">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold">Dịch vụ trả phí theo lần sử dụng</h2>
                    <p className="mt-2 text-muted-foreground">Cần một dịch vụ một lần? Chọn từ các tùy chọn riêng lẻ của chúng tôi.</p>
                </div>
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-sm font-bold " style={{ fontSize: "150%" }}>Dịch vụ</TableHead>
                                    <TableHead className="text-right text-sm font-bold " style={{ fontSize: "150%" }}>Chi phí</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payPerUseServices.map(service => (
                                    <TableRow key={service.name}>
                                        <TableCell className="font-medium" >{service.name}</TableCell>
                                        <TableCell className="text-right font-semibold text-sm">{service.price}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <div className="text-center mt-12">
                <Link href="/dashboard">
                    <Button variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại trang tổng quan
                    </Button>
                </Link>
            </div>
        </div>
    );
}
