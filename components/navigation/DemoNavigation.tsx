"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { FaMapMarkerAlt, FaGlobeAsia, FaDatabase, FaSearch } from "react-icons/fa";

const demoPages = [
  {
    href: "/places-overview",
    title: "Overview",
    description: "System overview and features",
    icon: FaMapMarkerAlt,
    color: "gray"
  },
  {
    href: "/attraction-search-demo",
    title: "Basic Search Demo",
    description: "Search and selection demo",
    icon: FaSearch,
    color: "blue"
  },
  {
    href: "/geographic-search-demo", 
    title: "Geographic Demo",
    description: "Location-based search",
    icon: FaGlobeAsia,
    color: "green"
  },
  {
    href: "/api-demo",
    title: "API Testing", 
    description: "Interactive API demo",
    icon: FaDatabase,
    color: "purple"
  }
];

export default function DemoNavigation() {
  const pathname = usePathname();

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="text-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Places & Geographic Search Demos
          </h2>
          <p className="text-sm text-gray-600">
            Explore our complete geospatial search capabilities
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {demoPages.map((page) => {
            const Icon = page.icon;
            const isActive = pathname === page.href;
            
            return (
              <Link key={page.href} href={page.href}>
                <div className={`
                  border rounded-lg p-4 transition-all hover:shadow-md cursor-pointer
                  ${isActive 
                    ? `border-${page.color}-500 bg-${page.color}-50` 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon 
                      className={`
                        ${isActive ? `text-${page.color}-600` : 'text-gray-500'}
                      `} 
                      size={20} 
                    />
                    <h3 className={`
                      font-medium text-sm
                      ${isActive ? `text-${page.color}-900` : 'text-gray-900'}
                    `}>
                      {page.title}
                    </h3>
                  </div>
                  <p className={`
                    text-xs
                    ${isActive ? `text-${page.color}-700` : 'text-gray-600'}
                  `}>
                    {page.description}
                  </p>
                  {isActive && (
                    <div className={`mt-2 text-xs font-medium text-${page.color}-600`}>
                      Currently viewing →
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
