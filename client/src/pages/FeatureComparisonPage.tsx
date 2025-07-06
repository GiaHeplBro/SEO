import React from "react"; // SỬA Ở ĐÂY 1: Thêm import React
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Check, Minus, ArrowLeft } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Dữ liệu so sánh tính năng
const featureData = {
    headers: ["Free", "Basic", "Pro", "Business"],
    features: [
        {
            category: "Core Features",
            items: [
                { name: "SEO Audits", values: ["5/month", "Unlimited", "Unlimited", "Unlimited"] },
                { name: "Keyword Analysis", values: ["10/month", "Unlimited", "Unlimited", "Unlimited"] },
                { name: "AI Content Optimization", values: [false, true, true, true] },
                { name: "Rank Tracking", values: ["5 keywords", "100 keywords", "500 keywords", "1,500 keywords"] },
                { name: "Automated Backlink Analysis", values: [false, false, true, true] },
                { name: "Technical SEO Recommendations", values: [false, false, true, true] },
            ]
        },
        {
            category: "Team & Collaboration",
            items: [
                { name: "Team Members", values: [1, 2, 10, "50+"] },
                { name: "Team Roles & Permissions", values: [false, false, true, true] },
                { name: "Collaboration Tools", values: [false, true, true, true] },
            ]
        },
        // {
        //     category: "Reporting & API",
        //     items: [
        //         { name: "Custom PDF Reports", values: [false, true, true, true] },
        //         { name: "White-label Reports", values: [false, false, false, true] },
        //         { name: "API Access", values: [false, false, false, true] },
        //     ]
        // },
        {
            category: "Support",
            items: [
                { name: "Community Support", values: [true, true, true, true] },
                { name: "Email & Chat Support", values: [false, true, true, true] },
                { name: "Dedicated Support Manager", values: [false, false, false, true] },
            ]
        }
    ]
};


const payPerUseServices = [
    { name: "SEO Audit", price: "99.000 VNĐ" },
    { name: "Content AI", price: "79.000 VNĐ" },
    { name: "Backlink Analysis", price: "89.000 VNĐ" },
    { name: "Technical SEO Fix", price: "129.000 VNĐ" },
];


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


export default function FeatureComparisonPage() {
    return (
        <div className="container mx-auto py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight">Compare Our Plans</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Find the perfect plan with the right features to boost your SEO performance.
                </p>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {/* SỬA Ở ĐÂY: Áp dụng style mới cho header */}
                                <TableHead className="w-[300px] text-sm font-bold">Features</TableHead>
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
                    <h2 className="text-3xl font-bold">Pay-Per-Use Services</h2>
                    <p className="mt-2 text-muted-foreground">Need a one-time service? Choose from our a la carte options.</p>
                </div>
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>

                                <TableRow>
                                    {/* SỬA Ở ĐÂY: Áp dụng style mới cho header */}
                                    <TableHead className="text-sm font-bold "   style={{ fontSize: "150%" }}>Dịch Vụ Trả Phí Theo Lẻ</TableHead>
                                    <TableHead className="text-right text-sm font-bold "   style={{ fontSize: "150%" }}>Chi Phí Bán</TableHead>
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
                        Back to Dashboard
                    </Button>
                </Link>
            </div>
        </div>
    );
}
