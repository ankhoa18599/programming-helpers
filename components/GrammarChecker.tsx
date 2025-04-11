// components/GrammarChecker.tsx
import React, { useState } from "react";
import { geminiModel, isGeminiAvailable } from "../lib/geminiClient";
import {
  createGrammarCheckPrompt,
  parseGrammarCheckResponse,
} from "../prompts/grammarCheckerPrompts";

// Định nghĩa kiểu cho kết quả đã parse
interface GrammarCheckData {
  correctedText: string;
  errors: {
    originalPhrase: string;
    suggestion: string;
    explanation: string;
  }[];
}

const GrammarChecker: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [result, setResult] = useState<GrammarCheckData | null>(null); // Lưu kết quả thành công
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Lưu thông báo lỗi

  const geminiReady = isGeminiAvailable();

  const handleCheckGrammar = async () => {
    const trimmedInput = inputText.trim();
    if (!trimmedInput || isLoading || !geminiReady || !geminiModel) return;

    setIsLoading(true);
    setResult(null); // Xóa kết quả cũ
    setErrorMessage(null); // Xóa lỗi cũ

    try {
      const prompt = createGrammarCheckPrompt(trimmedInput);
      const apiResponse = await geminiModel.generateContent(prompt);
      const responseText = apiResponse.response.text().trim();

      // Parse và validate JSON response
      const parsedData = parseGrammarCheckResponse(responseText);

      if ("error" in parsedData) {
        // Nếu parse trả về lỗi (từ chối hoặc lỗi parse)
        setErrorMessage(parsedData.error);
      } else {
        // Nếu parse thành công
        setResult(parsedData);
      }
    } catch (error) {
      console.error("Error calling Gemini API or processing result:", error);
      const message =
        error instanceof Error ? error.message : "An unknown error occurred.";
      setErrorMessage(`API Error: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-1">
      <h2 className="mb-4 text-xl font-semibold">Check English Grammar</h2>
      <div className="grid grid-cols-1 gap-6">
        {/* Input Area */}
        <div>
          <label
            htmlFor="grammar-input"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Enter English text below:
          </label>
          <textarea
            id="grammar-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste or type your English text here..."
            className="resize-vertical min-h-[150px] w-full border-2 border-black p-3 focus:outline-none focus:ring-2 focus:ring-black"
            rows={6}
            disabled={isLoading || !geminiReady}
          />
          <button
            onClick={handleCheckGrammar}
            className={`mt-3 border-2 border-black p-2 px-6 text-base font-semibold text-black ${isLoading || !geminiReady ? "cursor-not-allowed bg-gray-400" : "bg-blue-400 hover:bg-blue-500 active:bg-blue-600"}`}
            disabled={isLoading || !geminiReady}
          >
            {isLoading ? "Checking..." : "Check Grammar"}
          </button>
          {!geminiReady && (
            <p className="mt-2 text-sm text-red-600">
              Warning: Gemini API not available. Check API Key.
            </p>
          )}
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center justify-center border-2 border-dashed border-gray-300 p-4">
            {/* Spinner */}
            <div className="flex items-center space-x-2 rounded-lg p-3">
              <div className="h-4 w-4 animate-bounce rounded-full bg-black"></div>
              <div className="animation-delay-200 h-4 w-4 animate-bounce rounded-full bg-black"></div>
              <div className="animation-delay-400 h-4 w-4 animate-bounce rounded-full bg-black"></div>
              <span className="ml-2 text-sm font-semibold">
                Analyzing text...
              </span>
            </div>
          </div>
        )}

        {/* Error Message Display */}
        {errorMessage && !isLoading && (
          <div className="border-l-4 border-red-500 bg-red-100 p-4 text-red-700">
            <p className="font-bold">Error</p>
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Results Area */}
        {result && !isLoading && !errorMessage && (
          <div className="grid grid-cols-1 gap-6 border-t-2 border-black pt-6 md:grid-cols-2">
            {/* Column 1: Original Text & Error List */}
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 border-b border-gray-400 pb-1 text-lg font-semibold">
                  Identified Issues:
                </h3>
                {result.errors.length === 0 ? (
                  <p className="italic text-green-700">No errors found.</p>
                ) : (
                  <ul className="max-h-[400px] list-disc space-y-3 overflow-y-auto pl-5 pr-2">
                    {result.errors.map((err, index) => (
                      <li key={index} className="text-sm">
                        <span className="mr-1 text-red-600 line-through">
                          {err.originalPhrase}
                        </span>
                        <span className="mr-1 text-green-700">
                          → {err.suggestion}
                        </span>
                        <p className="ml-2 italic text-gray-600">
                          - {err.explanation}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h3 className="mb-2 border-b border-gray-400 pb-1 text-lg font-semibold">
                  Original Text (for reference):
                </h3>
                <div className="max-h-[400px] overflow-y-auto whitespace-pre-wrap border border-gray-300 bg-gray-50 p-3 text-sm">
                  {inputText} {/* Hiển thị lại input gốc */}
                </div>
              </div>
            </div>

            {/* Column 2: Corrected Text */}
            <div>
              <h3 className="mb-2 border-b border-gray-400 pb-1 text-lg font-semibold">
                Corrected Text:
              </h3>
              <div className="max-h-[600px] overflow-y-auto whitespace-pre-wrap border border-gray-300 bg-green-50 p-3 text-sm">
                {result.correctedText}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrammarChecker;
