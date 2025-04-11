// components/ImagePromptGenerator.tsx
import React, { useState } from "react";
import { geminiModel, isGeminiAvailable } from "../lib/geminiClient";
import { createImagePromptGeneratorPrompt } from "../prompts/imagePromptGeneratorPrompts";

const ImagePromptGenerator: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [numVariations, setNumVariations] = useState<number>(1); // Default 1 variation
  const [generatedPrompts, setGeneratedPrompts] = useState<string[] | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const geminiReady = isGeminiAvailable();

  const handleGeneratePrompts = async () => {
    const trimmedInput = inputText.trim();
    if (!trimmedInput || isLoading || !geminiReady || !geminiModel) return;

    setIsLoading(true);
    setGeneratedPrompts(null);
    setErrorMessage(null);

    try {
      const prompt = createImagePromptGeneratorPrompt({
        description: trimmedInput,
        count: numVariations,
      });

      const apiResponse = await geminiModel.generateContent(prompt);
      const responseText = apiResponse.response.text().trim();

      // Check for refusal message
      const REFUSAL_MESSAGE_FROM_PROMPT =
        "Error: Cannot generate prompts. Please provide a clearer or more appropriate description for an image.";
      if (responseText === REFUSAL_MESSAGE_FROM_PROMPT) {
        setErrorMessage(responseText);
        setGeneratedPrompts(null);
      } else if (!responseText) {
        setErrorMessage("The AI returned an empty response.");
        setGeneratedPrompts(null);
      } else {
        // Split the response into an array of prompts based on double newline
        const promptsArray = responseText
          .split("\n\n")
          .map((p) => p.trim())
          .filter((p) => p.length > 0);
        setGeneratedPrompts(promptsArray);
      }
    } catch (error) {
      console.error("Error calling Gemini API or processing result:", error);
      const message =
        error instanceof Error ? error.message : "An unknown error occurred.";
      setErrorMessage(`API Error: ${message}`);
      setGeneratedPrompts(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Optional: Show a temporary success message to the user
        console.log("Prompt copied to clipboard!");
        // You could implement a small toast notification here
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        // Optional: Show an error message
      });
  };

  return (
    <div className="mx-auto max-w-4xl p-1">
      <h2 className="mb-4 text-xl font-semibold">Create Image Prompt</h2>
      <div className="grid grid-cols-1 gap-6">
        {/* Input Area */}
        <div>
          <label
            htmlFor="img-prompt-input"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Describe the image you want to create:
          </label>
          <textarea
            id="img-prompt-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g., A fluffy cat wearing a tiny wizard hat, sitting on a stack of books"
            className="resize-vertical min-h-[100px] w-full border-2 border-black p-3 focus:outline-none focus:ring-2 focus:ring-black"
            rows={4}
            disabled={isLoading || !geminiReady}
          />
        </div>

        {/* Options & Action */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-y-2 border-black p-4">
          <div className="flex items-center gap-2">
            <label htmlFor="variations-count" className="text-sm font-medium">
              Variations:
            </label>
            <select
              id="variations-count"
              value={numVariations}
              onChange={(e) => setNumVariations(parseInt(e.target.value))}
              className="w-16 appearance-none border-2 border-black bg-white p-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-black"
              disabled={isLoading || !geminiReady}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </div>
          <button
            onClick={handleGeneratePrompts}
            className={`border-2 border-black p-3 px-6 text-base font-semibold text-black ${isLoading || !geminiReady ? "cursor-not-allowed bg-gray-400" : "bg-purple-400 hover:bg-purple-500 active:bg-purple-600"}`} // Different color
            disabled={isLoading || !geminiReady}
          >
            {isLoading ? "Generating..." : "Generate Prompts"}
          </button>
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
                Creating prompts...
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
        {generatedPrompts && !isLoading && !errorMessage && (
          <div>
            <h3 className="mb-2 border-b border-gray-400 pb-1 text-lg font-semibold">
              Generated Prompts:
            </h3>
            <div className="space-y-4">
              {generatedPrompts
                .filter((item) => item.length > 10)
                .map((prompt, index) => (
                  <div
                    key={index}
                    className="group relative rounded border border-gray-300 bg-gray-50 p-4 shadow"
                  >
                    <p className="whitespace-pre-wrap text-sm">{prompt}</p>
                    {/* Copy Button */}
                    <button
                      onClick={() => copyToClipboard(prompt)}
                      title="Copy prompt"
                      className="absolute right-2 top-2 rounded border border-gray-400 bg-gray-200 p-1 text-xs opacity-50 transition-opacity hover:bg-gray-300 group-hover:opacity-100" // Show on hover
                      aria-label="Copy prompt to clipboard"
                    >
                      Copy
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePromptGenerator;
