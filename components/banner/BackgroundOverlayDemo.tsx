"use client";

import React, { useState } from "react";
import styles from "./GSAPSlider.module.css";

const BackgroundOverlayDemo: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<string>("filter");

  const methods = [
    {
      id: "filter",
      name: "CSS Filter",
      description: "brightness(0.7) + contrast(1.2)",
      style: {
        backgroundImage: `url('/images/Saigon.jpg')`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        filter: "brightness(0.7) contrast(1.2)",
      },
    },
    {
      id: "gradient",
      name: "Linear Gradient Overlay",
      description: "Gradient overlay directly in background property",
      style: {
        background: `
          linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
          url('/images/Saigon.jpg')
        `,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      },
    },
    {
      id: "inset-shadow",
      name: "Inset Box Shadow",
      description: "box-shadow: inset overlay",
      style: {
        backgroundImage: `url('/images/Saigon.jpg')`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        boxShadow: "inset 0 0 0 1000px rgba(0, 0, 0, 0.4)",
      },
    },
    {
      id: "multiple-filters",
      name: "Multiple Filters",
      description: "brightness + contrast + saturate",
      style: {
        backgroundImage: `url('/images/Saigon.jpg')`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        filter: "brightness(0.6) contrast(1.3) saturate(0.9)",
      },
    },
  ];

  const currentMethod = methods.find((m) => m.id === selectedMethod);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Background Darkening Methods Demo
        </h1>

        {/* Method Selector */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {methods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  selectedMethod === method.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {method.name}
              </button>
            ))}
          </div>
        </div>

        {/* Current Method Info */}
        {currentMethod && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{currentMethod.name}</h3>
            <p className="text-gray-600 mb-3">{currentMethod.description}</p>
            <div className="bg-gray-800 text-green-400 p-3 rounded text-sm font-mono">
              <pre>{JSON.stringify(currentMethod.style, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Demo Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Original (No overlay) */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Original (No Overlay)</h3>
            <div
              className="h-64 rounded-lg relative flex items-center justify-center"
              style={{
                backgroundImage: `url('/images/Saigon.jpg')`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundColor: "#f0f0f0",
              }}
            >
              <div className="text-white font-bold text-2xl drop-shadow-lg">
                Original Image
              </div>
            </div>
          </div>

          {/* With Selected Method */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              With {currentMethod?.name}
            </h3>
            <div
              className="h-64 rounded-lg relative flex items-center justify-center"
              style={{
                ...currentMethod?.style,
                backgroundColor: "#f0f0f0",
              }}
            >
              <div className="text-white font-bold text-2xl drop-shadow-lg">
                Darkened Image
              </div>
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Implementation Code</h2>

          <div className="grid gap-6">
            {methods.map((method) => (
              <div key={method.id} className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">{method.name}</h3>

                {/* React/JSX Code */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2">React/JSX:</h4>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
                    <pre>{`<div
  style={{${Object.entries(method.style)
    .map(
      ([key, value]) =>
        `\n    ${key}: ${typeof value === "string" ? `"${value}"` : value},`
    )
    .join("")}
  }}
  className="your-classes"
>
  Content here
</div>`}</pre>
                  </div>
                </div>

                {/* CSS Code */}
                <div>
                  <h4 className="font-medium mb-2">CSS:</h4>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
                    <pre>{`.your-class {${Object.entries(method.style)
                      .map(([key, value]) => {
                        // Convert camelCase to kebab-case
                        const cssKey = key
                          .replace(/([A-Z])/g, "-$1")
                          .toLowerCase();
                        return `\n  ${cssKey}: ${value};`;
                      })
                      .join("")}
}`}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">
            📝 Recommendations
          </h2>
          <div className="space-y-3 text-blue-800">
            <p>
              <strong>CSS Filter:</strong> Best for simple darkening with
              performance. Easy to adjust dynamically.
            </p>
            <p>
              <strong>Linear Gradient:</strong> Most flexible, can create
              complex overlays (gradients, colors). Good browser support.
            </p>
            <p>
              <strong>Inset Box Shadow:</strong> Creative approach, but can
              affect layout. Use with caution.
            </p>
            <p>
              <strong>Multiple Filters:</strong> Great for fine-tuning the look,
              but may impact performance on older devices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundOverlayDemo;
