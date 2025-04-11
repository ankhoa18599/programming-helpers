"use client";
import React, { useState } from "react";
// Import các component tool
import ComponentNameGenerator from "./ComponentNameGenerator";
import SentenceRewriter from "./SentenceRewriter";
import GrammarChecker from "./GrammarChecker";
import Summarizer from "./Summarizer";
import ImagePromptGenerator from "./ImagePromptGenerator";
// (Khi có tool mới, import chúng ở đây)
// import CheckGrammarTool from './CheckGrammarTool';
// import CreateImgPromptTool from './CreateImgPromptTool';

// Danh sách các tab/tool
const tabs = [
  "Check English Grammar", // Placeholder
  "Create Img Prompt", // Placeholder
  "Rewrite Sentence Better", // Placeholder
  "Summary Content", // Placeholder
  "Clean Code", // Placeholder
  "React Named Component from Content", // ĐÃ CÓ
  "Create Unit Test", // Placeholder
  "Create Story Book", // Placeholder
];

const ToolLayout: React.FC = () => {
  // State để lưu trữ tab đang hoạt động
  // Đặt tool 'React Named Component from Content' làm mặc định để dễ test
  const [activeTab, setActiveTab] = useState<string>(
    "React Named Component from Content",
  );

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100 p-4 font-sans md:p-10">
      <h1 className="mb-8 border-b-4 border-black pb-2 text-center text-3xl font-bold md:mb-12 md:text-4xl">
        Programing Helper
      </h1>

      <div className="mb-8 grid w-full max-w-5xl grid-cols-2 gap-3 px-2 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
        {tabs.map((tabName) => (
          <button
            key={tabName}
            onClick={() => setActiveTab(tabName)}
            // Style brutalist cho button, có hiệu ứng active rõ ràng hơn
            className={`/* Responsive text */ /* Hiệu ứng nhấn xuống */ border-2 border-black bg-white px-2 py-3 text-sm font-semibold text-black shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-150 ease-in-out hover:bg-gray-200 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_rgba(0,0,0,1)] md:text-base ${
              activeTab === tabName
                ? "bg-yellow-300 shadow-[2px_2px_0px_rgba(0,0,0,1)] ring-2 ring-black ring-offset-1" // Style active khác biệt
                : ""
            } `}
          >
            {tabName}
          </button>
        ))}
      </div>
      <div className="min-h-[650px] w-full max-w-5xl border-2 border-black bg-white p-4 shadow-[8px_8px_0px_rgba(0,0,0,1)] md:p-6">
        {activeTab === "React Named Component from Content" && (
          <ComponentNameGenerator />
        )}
        {activeTab === "Rewrite Sentence Better" && <SentenceRewriter />}
        {activeTab === "Check English Grammar" && <GrammarChecker />}
        {activeTab === "Summary Content" && <Summarizer />}
        {activeTab === "Create Img Prompt" && <ImagePromptGenerator />}

        {/*
          (Khi thêm tool mới, ví dụ 'Check English Grammar'):
          {activeTab === 'Check English Grammar' && (
             <CheckGrammarTool />
          )}
        */}
      </div>
      {/* <footer className="mt-8 text-sm text-gray-600">
        Powered by Gemini - Current Time: {new Date().toLocaleString()}
      </footer> */}
    </div>
  );
};

export default ToolLayout;
