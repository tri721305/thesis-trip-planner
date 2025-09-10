"use client";

import React, { useState, useRef } from "react";
import styles from "./GSAPSlider.module.css";

const OverlayDemo: React.FC = () => {
  const [overlayType, setOverlayType] = useState<string>("mediumOverlay");
  const demoRef = useRef<HTMLDivElement>(null);

  const overlayOptions = [
    {
      id: "none",
      name: "No Overlay",
      description: "Original background without darkening",
      className: "",
    },
    {
      id: "lightOverlay",
      name: "Light Overlay",
      description: "30% dark overlay - rgba(0, 0, 0, 0.3)",
      className: styles.lightOverlay,
    },
    {
      id: "mediumOverlay",
      name: "Medium Overlay",
      description: "50% dark overlay - rgba(0, 0, 0, 0.5)",
      className: styles.mediumOverlay,
    },
    {
      id: "darkOverlay",
      name: "Dark Overlay",
      description: "60% dark overlay - rgba(0, 0, 0, 0.6)",
      className: styles.darkOverlay,
    },
    {
      id: "gradientOverlay",
      name: "Gradient Overlay",
      description: "Gradient from light to dark",
      className: styles.gradientOverlay,
    },
  ];

  const currentOverlay = overlayOptions.find(
    (option) => option.id === overlayType
  );

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Background Overlay System Demo
        </h1>

        {/* Controls */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Select Overlay Type:
          </h2>
          <div className="flex flex-wrap gap-3">
            {overlayOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setOverlayType(option.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  overlayType === option.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>

        {/* Current Selection Info */}
        {currentOverlay && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
            <h3 className="font-semibold text-lg mb-2 text-gray-800">
              {currentOverlay.name}
            </h3>
            <p className="text-gray-600 mb-3">{currentOverlay.description}</p>

            {/* CSS Code */}
            <div className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono">
              <pre>
                {overlayType === "none"
                  ? "/* No overlay applied */"
                  : overlayType === "gradientOverlay"
                    ? `.gradientOverlay {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.5) 50%,
    rgba(0, 0, 0, 0.7) 100%
  );
}`
                    : `.${overlayType} {
  background: rgba(0, 0, 0, ${
    overlayType === "lightOverlay"
      ? "0.3"
      : overlayType === "mediumOverlay"
        ? "0.5"
        : "0.6"
  });
}`}
              </pre>
            </div>
          </div>
        )}

        {/* Demo Preview */}
        <div
          ref={demoRef}
          className="relative h-96 rounded-lg overflow-hidden shadow-lg"
          style={{
            backgroundImage: `url('/images/Saigon.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Dynamic Overlay */}
          {overlayType !== "none" && (
            <div
              className={`${styles.backgroundOverlay} ${currentOverlay?.className}`}
            ></div>
          )}

          {/* Content */}
          <div
            className={`${styles.contentLayer} h-full flex flex-col justify-center items-center text-center px-8`}
          >
            <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              Sample Content
            </h1>
            <p className="text-lg text-white mb-6 drop-shadow-md max-w-2xl">
              This content should always be visible and readable regardless of
              the overlay type. The z-index system ensures proper layering.
            </p>

            <div className="flex gap-4">
              <button className="bg-primary-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary-400 transition-colors">
                Primary Button
              </button>
              <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold border border-white/30 hover:bg-white/30 transition-colors">
                Secondary Button
              </button>
            </div>
          </div>
        </div>

        {/* Z-index Explanation */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            🏗️ Z-index Layer System
          </h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span>
                <strong>z-index: 0</strong> - Background image
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-black/40 rounded"></div>
              <span>
                <strong>z-index: 1</strong> - Overlay layer (darkening)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>
                <strong>z-index: 2</strong> - Content layer (text, buttons,
                cards)
              </span>
            </div>
          </div>
        </div>

        {/* Implementation Guide */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">
            💡 Implementation in Your Component
          </h2>
          <div className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
            <pre>{`// JSX Structure
<div className="relative bg-cover bg-center" style={{backgroundImage: 'url(...)'}}>
  {/* Overlay Layer */}
  <div className={\`\${styles.backgroundOverlay} \${styles.mediumOverlay}\`}></div>
  
  {/* Content Layer */}
  <div className={styles.contentLayer}>
    {/* Your content here */}
  </div>
</div>

// CSS Module
.backgroundOverlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.contentLayer {
  position: relative;
  z-index: 2;
}

.mediumOverlay {
  background: rgba(0, 0, 0, 0.5);
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverlayDemo;
