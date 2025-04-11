import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

// --- Đọc API Key từ biến môi trường ---
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

// Chỉ khởi tạo nếu API Key tồn tại
if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });
  } catch (error) {
    console.error(
      "Error initializing GoogleGenerativeAI. Check API Key or configuration:",
      error,
    );
    // Đảm bảo model vẫn là null nếu có lỗi khởi tạo
    model = null;
  }
} else {
  console.warn(
    "Gemini API Key (NEXT_PUBLIC_GEMINI_API_KEY) not found in environment variables.",
  );
}

/**
 * Export instance model đã được khởi tạo.
 * Sẽ là `null` nếu API key không được cung cấp hoặc có lỗi khởi tạo.
 * Các component sử dụng cần kiểm tra giá trị này trước khi gọi API.
 */
export const geminiModel = model;

/**
 * Hàm tiện ích để kiểm tra xem client đã sẵn sàng chưa.
 * @returns {boolean} True nếu model đã được khởi tạo thành công, ngược lại là false.
 */
export const isGeminiAvailable = (): boolean => {
  return model !== null;
};
