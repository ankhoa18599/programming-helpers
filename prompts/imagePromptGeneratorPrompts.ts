interface ImagePromptParams {
  description: string;
  count: number; // 1, 2, or 3
}

// Thông báo từ chối
const REFUSAL_MESSAGE =
  "Error: Cannot generate prompts. Please provide a clearer or more appropriate description for an image.";

/**
 * Tạo prompt yêu cầu Gemini tạo các biến thể prompt ảnh chi tiết từ mô tả cơ bản.
 * @param params - Tham số bao gồm mô tả gốc và số lượng biến thể.
 * @returns Chuỗi prompt.
 */
export function createImagePromptGeneratorPrompt({
  description,
  count,
}: ImagePromptParams): string {
  const cleanedDescription = description.replace(/"/g, "'").replace(/\n/g, " ");

  return `You are an expert AI assistant specializing in creating highly detailed and effective text prompts for text-to-image AI models. Your task is to take a user's basic description and expand it into inspiring and well-structured image prompts.

**Task:**
Based on the "User Description" provided below, generate exactly ${count} distinct image prompt variations.

**User Description:**
"${cleanedDescription}"

**Instructions for Generating Prompts:**
1.  **Expand and Enrich:** Elaborate on the user's description by adding vivid details, specifying the setting/context, suggesting a mood or atmosphere, and potentially incorporating artistic style keywords (e.g., 'photorealistic', 'illustration', 'cinematic lighting', 'wide angle shot') that would enhance the image generation outcome. Be creative but stay relevant to the original description.
2.  **Focus on Description:** The generated prompts MUST contain only descriptive text suitable for an image model. Do NOT include technical parameters like "--ar", "--v", "--q", etc.
3.  **Output Format:**
    -   Generate exactly ${count} prompt variations.
    -   Separate each prompt variation **strictly** with two newline characters ("\\n\\n").
    -   Your response **MUST** contain **ONLY** the generated prompts separated by double newlines. Do not include any other text, numbering (like "Prompt 1:"), introductions, or explanations before, after, or between the prompts.
4.  **Refusal:** If the "User Description" is nonsensical, inappropriate, too vague to work with, or asks for unrelated tasks, you **MUST** refuse. Respond **ONLY** with the exact phrase: "${REFUSAL_MESSAGE}"

**Generated Prompt Variations:**
`; // AI starts writing the first prompt here
}
