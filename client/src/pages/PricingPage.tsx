import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowLeft, Zap } from "lucide-react";

// Dữ liệu cho các gói pricing
const pricingTiers = [
  {
    name: "Free",
    price: "0 VNĐ",
    description: "Bắt đầu với các tính năng cơ bản, hoàn toàn miễn phí cho bạn.",
    features: [
      "20.000 Token mỗi tháng",
      "Tối ưu từ khóa",
      "Chấm điểm SEO",
      "Viết lại nội dung bằng AI",
      "Hỗ trợ và tư vấn qua Email",

    ],
    buttonText: "Gói hiện tại",
    isCurrent: true,
  },
  {
    name: "Basic",
    price: "250.000 VNĐ",
    description: "Mở khóa các công cụ mạnh mẽ dành cho các chuyên gia SEO có kinh nghiệm hoặc muốn bắt đầu.",
    features: [
      "100.000 Token mỗi tháng",
      "Tối ưu từ khóa",
      "Chấm điểm SEO",
      "Viết lại nội dung bằng AI",
      "Báo cáo và phân tích backlink tự động.",
      "Hỗ trợ tư vấn qua Email và Chat Support",
    ],
    buttonText: "Nâng cấp lên gói Basic",
    isCurrent: false,
    isPopular: true,
  },
  {
    name: "Pro",
    price: "370.000 VNĐ",
    description: "The complete suite for agencies and large teams.",
    features: [
      "350.000 Token mỗi tháng",
      "Tối ưu từ khóa",
      "Chấm điểm SEO",
      "Viết lại nội dung bằng AI",
      "Báo cáo và phân tích backlink tự động.",
      "Đề xuất cải tiến kỹ thuật SEO.",
      "Hỗ trợ tư vấn qua Email và Chat Support",
    ],
    buttonText: "Nâng cấp lên gói Pro",
    isCurrent: false,
  },
];

export default function PricingPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Gói tốt nhất cho bạn</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Chọn gói phù hợp với nhu cầu của bạn và bắt đầu cải thiện SEO ngay hôm nay.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pricingTiers.map((tier) => (
          <Card key={tier.name} className={`flex flex-col ${tier.isPopular ? 'border-primary shadow-lg' : ''}`}>
            {tier.isPopular && (
              <div className="py-1 px-3 bg-primary text-primary-foreground text-sm font-semibold rounded-t-lg text-center">
                Phổ biến nhất
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{tier.name}</CardTitle>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-muted-foreground">/ month</span>
              </div>
              <CardDescription>{tier.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" disabled={tier.isCurrent}>
                {tier.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center mt-12">
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Về trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
}