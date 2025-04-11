// components/SentenceRewriter.tsx
import React, { useState, useRef, useEffect } from "react";
// Import prompt function và các mục tiêu
import {
  createRewriteSentencePrompt,
  rewriteGoals,
  RewriteGoal,
} from "../prompts/sentenceRewriterPrompts";
import { geminiModel, isGeminiAvailable } from "../lib/geminiClient";

// Kiểu tin nhắn (giống component trước)
interface Message {
  sender: "user" | "ai";
  text: string;
}

const SentenceRewriter: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>("");
  // State cho mục tiêu và số lượng
  const [selectedGoal, setSelectedGoal] = useState<RewriteGoal>(
    rewriteGoals[0],
  ); // Mặc định là Auto
  const [numSuggestions, setNumSuggestions] = useState<number>(1); // Mặc định 1 gợi ý
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const geminiReady = isGeminiAvailable();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    const trimmedInput = inputText.trim();
    if (!trimmedInput || isLoading || !geminiReady || !geminiModel) return;

    // Hiển thị cả câu gốc và cài đặt người dùng chọn trong chat cho rõ ràng
    const userMessageText = trimmedInput;
    const userMessage: Message = { sender: "user", text: userMessageText };
    setMessages((prev) => [...prev, userMessage]);
    setInputText(""); // Có thể giữ lại input nếu người dùng muốn sửa nhẹ và gửi lại? Tạm thời xóa.
    setIsLoading(true);

    try {
      const prompt = createRewriteSentencePrompt({
        sentence: trimmedInput,
        goal: selectedGoal,
        count: numSuggestions,
      });

      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      let aiText = response.text().trim();

      // Xử lý thông báo từ chối
      const REFUSAL_MESSAGE_FROM_PROMPT =
        "Error: Cannot fulfill the request. Please provide a sentence or short text to rewrite.";
      if (aiText === REFUSAL_MESSAGE_FROM_PROMPT) {
        console.warn("Gemini refused the rewrite request.");
      } else if (!aiText) {
        aiText = "Sorry, I couldn't rewrite the sentence.";
      }

      // AI response có thể chứa nhiều dòng nếu numSuggestions > 1
      const aiMessage: Message = { sender: "ai", text: aiText };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      const errorMessageText =
        error instanceof Error ? error.message : "An unknown error occurred.";
      const errorMessage: Message = {
        sender: "ai",
        text: `An error occurred: ${errorMessageText}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý Enter trong textarea (Ctrl+Enter hoặc Shift+Enter để xuống dòng)
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Gửi khi nhấn Enter nhưng không nhấn kèm Shift hoặc Ctrl
    if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="mx-auto flex h-[600px] max-w-2xl flex-col border-2 border-black bg-white shadow-[8px_8px_0px_rgba(0,0,0,1)]">
      {/* Khu vực hiển thị tin nhắn */}
      <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg border border-black p-3 shadow ${
                // Tăng max-width chút
                msg.sender === "user" ? "bg-blue-200" : "bg-gray-200"
              }`}
              style={{ whiteSpace: "pre-wrap" }} // Rất quan trọng để giữ định dạng xuống dòng từ AI
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading /* Spinner */ && (
          <div className="flex justify-start">
            <div className="animate-pulse rounded-lg border border-black bg-gray-200 p-3">
              Rewriting...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Khu vực nhập liệu */}
      <div className="flex flex-col gap-3 border-t-2 border-black bg-white p-4">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown} // Xử lý Enter
          placeholder="Enter the sentence to rewrite here..."
          className="w-full resize-none border-2 border-black p-2 focus:outline-none focus:ring-2 focus:ring-black" // Tắt resize tự động
          rows={3} // Số dòng mặc định
          disabled={isLoading || !geminiReady}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          {" "}
          {/* Bố trí các control */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="rewrite-goal"
              className="whitespace-nowrap text-sm font-medium"
            >
              Goal:
            </label>
            <select
              id="rewrite-goal"
              value={selectedGoal}
              onChange={(e) => setSelectedGoal(e.target.value as RewriteGoal)}
              className="border-2 border-black bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              disabled={isLoading || !geminiReady}
            >
              {rewriteGoals.map((goal) => (
                <option key={goal} value={goal}>
                  {goal}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="suggestions-count" className="text-sm font-medium">
              Suggestions:
            </label>
            <select
              id="suggestions-count"
              value={numSuggestions}
              onChange={(e) => setNumSuggestions(parseInt(e.target.value))}
              className="w-16 appearance-none border-2 border-black bg-white p-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-black"
              disabled={isLoading || !geminiReady}
            >
              {[1, 2, 3].map(
                (
                  num, // Chỉ cho chọn 1, 2, 3
                ) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ),
              )}
            </select>
          </div>
          <button
            onClick={handleSendMessage}
            className={`border-2 border-black p-2 px-5 text-sm font-semibold text-black ${isLoading || !geminiReady ? "cursor-not-allowed bg-gray-400" : "bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600"}`}
            disabled={isLoading || !geminiReady}
          >
            Rewrite
          </button>
        </div>
      </div>
      {/* Cảnh báo API key */}
      {!geminiReady && (
        <div className="border-t-2 border-black bg-red-100 p-2 text-center text-sm font-medium text-red-800">
          Warning: Gemini API not available. Check API Key and console logs.
        </div>
      )}
    </div>
  );
};

export default SentenceRewriter;
