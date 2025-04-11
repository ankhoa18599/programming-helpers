// components/ComponentNameGenerator.tsx
import React, { useState, useRef, useEffect } from "react";
import { geminiModel, isGeminiAvailable } from "../lib/geminiClient";
import { createComponentNamePrompt } from "../prompts/componentNamerPrompts";

interface Message {
  sender: "user" | "ai";
  text: string;
}

const supportedLanguages = ["English", "Vietnamese"];

const ComponentNameGenerator: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    supportedLanguages[0],
  );
  const [numSuggestions, setNumSuggestions] = useState<number>(3);
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

    const userMessage: Message = { sender: "user", text: trimmedInput };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    // --- Gọi API Gemini sử dụng model đã import ---
    try {
      const prompt = createComponentNamePrompt({
        description: trimmedInput,
        language: selectedLanguage,
        count: numSuggestions,
      });

      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      let aiText = response.text().trim();

      const REFUSAL_MESSAGE_FROM_PROMPT =
        "Error: Invalid input. Please provide a functional or visual description for a software component."; // Lấy từ file prompt để đảm bảo đồng bộ
      if (aiText === REFUSAL_MESSAGE_FROM_PROMPT) {
        // Có thể xử lý đặc biệt ở đây nếu muốn, ví dụ: hiển thị lỗi rõ ràng hơn
        console.warn(
          "Gemini refused the request due to invalid input as per prompt instructions.",
        );
      } else if (!aiText) {
        // Xử lý trường hợp trả về rỗng nhưng không phải là từ chối
        aiText = "Sorry, I couldn't generate names based on that description.";
      }

      const aiMessage: Message = { sender: "ai", text: aiText };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      const errorMessageText =
        error instanceof Error ? error.message : "An unknown error occurred.";
      const errorMessage: Message = {
        sender: "ai",
        text: `An error occurred while contacting the AI: ${errorMessageText}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="mx-auto flex h-[600px] max-w-2xl flex-col border-2 border-black bg-white shadow-[8px_8px_0px_rgba(0,0,0,1)]">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-lg border border-black p-3 ${
                msg.sender === "user" ? "bg-blue-200" : "bg-gray-200"
              }`}
              style={{ whiteSpace: "pre-wrap" }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="animate-pulse rounded-lg border border-black bg-gray-200 p-3">
              Generating...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center gap-2 border-t-2 border-black bg-gray-50 p-4">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your component..."
          className="flex-1 border-2 border-black p-2 focus:outline-none focus:ring-2 focus:ring-black"
          disabled={isLoading || !geminiReady}
        />
        {/* Select Ngôn ngữ */}
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="border-2 border-black bg-white p-2 focus:outline-none focus:ring-2 focus:ring-black"
          disabled={isLoading || !geminiReady}
        >
          {supportedLanguages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
        {/* Select Số lượng */}
        <select
          value={numSuggestions}
          onChange={(e) => setNumSuggestions(parseInt(e.target.value))}
          className="w-16 appearance-none border-2 border-black bg-white p-2 text-center focus:outline-none focus:ring-2 focus:ring-black"
          disabled={isLoading || !geminiReady}
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>

        <button
          onClick={handleSendMessage}
          className={`border-2 border-black p-2 font-semibold text-black ${isLoading || !geminiReady ? "cursor-not-allowed bg-gray-400" : "bg-yellow-400 hover:bg-yellow-500"}`}
          disabled={isLoading || !geminiReady}
        >
          Send
        </button>
      </div>
      {!geminiReady && (
        <div className="border-t-2 border-black bg-red-100 p-2 text-center text-sm text-red-800">
          Warning: Gemini API Key not configured or failed to initialize. Please
          check environment variables and console logs.
        </div>
      )}
    </div>
  );
};

export default ComponentNameGenerator;
