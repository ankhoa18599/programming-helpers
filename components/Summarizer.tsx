// components/Summarizer.tsx
import React, { useState } from "react";
import {
  createSummarizePrompt,
  presetLengths,
  PresetLength,
  summaryFormats,
  SummaryFormat,
  LengthControlType,
  LengthOption,
} from "../prompts/summarizerPrompts";
import { geminiModel, isGeminiAvailable } from "../lib/geminiClient";

const Summarizer: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [summaryResult, setSummaryResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State for customization options
  const [lengthControlType, setLengthControlType] =
    useState<LengthControlType>("Preset");
  const [presetLength, setPresetLength] = useState<PresetLength>("Medium");
  const [percentageLength, setPercentageLength] = useState<number>(30); // Default percentage
  const [wordCountLength, setWordCountLength] = useState<number>(100); // Default word count
  const [summaryFormat, setSummaryFormat] =
    useState<SummaryFormat>("Paragraph");

  const geminiReady = isGeminiAvailable();

  // --- UI Rendering for Length Options ---
  const renderLengthOptions = () => {
    switch (lengthControlType) {
      case "Preset":
        return (
          <select
            value={presetLength}
            onChange={(e) => setPresetLength(e.target.value as PresetLength)}
            className="border-2 border-black bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            disabled={isLoading || !geminiReady}
          >
            {presetLengths.map((len) => (
              <option key={len} value={len}>
                {len}
              </option>
            ))}
          </select>
        );
      case "Percentage":
        return (
          <div className="flex items-center gap-1">
            <input
              placeholder="Percentage"
              type="number"
              value={percentageLength}
              onChange={(e) => setPercentageLength(parseInt(e.target.value))} // Clamp between 10-80%
              min="10"
              max="80"
              step="5"
              className="w-20 border-2 border-black p-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-black"
              disabled={isLoading || !geminiReady}
            />
            <span className="text-sm">%</span>
          </div>
        );
      case "WordCount":
        return (
          <div className="flex items-center gap-1">
            <input
              placeholder="Word Count"
              type="number"
              value={wordCountLength}
              onChange={(e) =>
                setWordCountLength(Math.max(20, parseInt(e.target.value) || 20))
              } // Min 20 words
              min="20"
              step="10"
              className="w-24 border-2 border-black p-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-black"
              disabled={isLoading || !geminiReady}
            />
            <span className="text-sm">words</span>
          </div>
        );
      default:
        return null;
    }
  };

  // --- Handle Summarize ---
  const handleSummarize = async () => {
    const trimmedInput = inputText.trim();
    if (!trimmedInput || isLoading || !geminiReady || !geminiModel) return;

    setIsLoading(true);
    setSummaryResult(null);
    setErrorMessage(null);

    // Construct lengthOption based on current state
    let currentLengthOption: LengthOption;
    if (lengthControlType === "Preset") {
      currentLengthOption = { type: "Preset", value: presetLength };
    } else if (lengthControlType === "Percentage") {
      currentLengthOption = { type: "Percentage", value: percentageLength };
    } else {
      // WordCount
      currentLengthOption = { type: "WordCount", value: wordCountLength };
    }

    try {
      const prompt = createSummarizePrompt({
        text: trimmedInput,
        lengthOption: currentLengthOption,
        format: summaryFormat,
      });

      const apiResponse = await geminiModel.generateContent(prompt);
      const responseText = apiResponse.response.text().trim();

      // Check for refusal message
      const REFUSAL_MESSAGE_FROM_PROMPT =
        "Error: Cannot process the request. Please provide text content to summarize.";
      if (responseText === REFUSAL_MESSAGE_FROM_PROMPT) {
        setErrorMessage(responseText);
      } else if (!responseText) {
        setErrorMessage("The AI returned an empty summary.");
      } else {
        setSummaryResult(responseText);
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
      <h2 className="mb-4 text-xl font-semibold">Summarize Content</h2>
      <div className="grid grid-cols-1 gap-6">
        {/* Input Area */}
        <div>
          <label
            htmlFor="summary-input"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Paste your text here:
          </label>
          <textarea
            id="summary-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter the text you want to summarize..."
            className="resize-vertical min-h-[200px] w-full border-2 border-black p-3 focus:outline-none focus:ring-2 focus:ring-black" // Tăng chiều cao mặc định
            rows={8}
            disabled={isLoading || !geminiReady}
          />
        </div>

        {/* Customization Options */}
        <div className="grid grid-cols-1 gap-4 border-y-2 border-black p-4 md:grid-cols-3">
          {/* Length Control */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Summary Length:
            </label>
            <select
              value={lengthControlType}
              onChange={(e) =>
                setLengthControlType(e.target.value as LengthControlType)
              }
              className="w-full border-2 border-black bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              disabled={isLoading || !geminiReady}
            >
              <option value="Preset">Preset (Short/Medium/Long)</option>
              <option value="Percentage">Percentage (%)</option>
              <option value="WordCount">Word Count (approx.)</option>
            </select>
            <div className="mt-1">{renderLengthOptions()}</div>{" "}
            {/* Render input tương ứng */}
          </div>
          {/* Format Control */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Output Format:
            </label>
            <select
              value={summaryFormat}
              onChange={(e) =>
                setSummaryFormat(e.target.value as SummaryFormat)
              }
              className="w-full border-2 border-black bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              disabled={isLoading || !geminiReady}
            >
              {summaryFormats.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </div>
          {/* Action Button */}
          <div className="flex items-end">
            {" "}
            {/* Căn nút xuống dưới */}
            <button
              onClick={handleSummarize}
              className={`w-full border-2 border-black p-3 text-base font-semibold text-black ${isLoading || !geminiReady ? "cursor-not-allowed bg-gray-400" : "bg-green-400 hover:bg-green-500 active:bg-green-600"}`} // Đổi màu nút
              disabled={isLoading || !geminiReady}
            >
              {isLoading ? "Summarizing..." : "Summarize"}
            </button>
          </div>
        </div>
        {!geminiReady && (
          <p className="-mt-4 mb-2 text-sm text-red-600">
            Warning: Gemini API not available. Check API Key.
          </p>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center justify-center border-2 border-dashed border-gray-300 p-4">
            {/* Spinner */}
            <div className="flex items-center space-x-2 rounded-lg p-3">
              <div className="h-4 w-4 animate-bounce rounded-full bg-black"></div>
              <div className="animation-delay-200 h-4 w-4 animate-bounce rounded-full bg-black"></div>
              <div className="animation-delay-400 h-4 w-4 animate-bounce rounded-full bg-black"></div>
              <span className="ml-2 text-sm font-semibold">
                Generating summary...
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

        {/* Summary Result */}
        {summaryResult && !isLoading && !errorMessage && (
          <div>
            <h3 className="mb-2 border-b border-gray-400 pb-1 text-lg font-semibold">
              Generated Summary:
            </h3>
            <div className="min-h-[150px] overflow-y-auto whitespace-pre-wrap border border-gray-300 bg-blue-50 p-4 text-sm">
              {summaryResult}
            </div>
            {/* Optional: Word Count Display */}
            <p className="mt-1 text-right text-xs text-gray-500">
              Original: {inputText.split(/\s+/).filter(Boolean).length} words |
              Summary: {summaryResult.split(/\s+/).filter(Boolean).length} words
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Summarizer;
