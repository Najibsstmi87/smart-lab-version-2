import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini API client
// Note: In AI Studio, process.env.GEMINI_API_KEY is automatically injected.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function predictQuantity(
  itemName: string,
  defaultQuantityPerGroup: number,
  numberOfGroups: number,
  itemType: 'bahan' | 'radas'
): Promise<number> {
  // Base formula
  const baseQuantity = defaultQuantityPerGroup * numberOfGroups;
  
  try {
    // We use Gemini to suggest if any extra buffer is needed (e.g. for spills, breakages)
    const prompt = `
      Saya sedang menyediakan radas dan bahan untuk eksperimen sains sekolah.
      Item: ${itemName}
      Jenis: ${itemType}
      Kuantiti asas untuk 1 kumpulan: ${defaultQuantityPerGroup}
      Bilangan kumpulan: ${numberOfGroups}
      Kuantiti asas keseluruhan: ${baseQuantity}
      
      Berdasarkan pengalaman makmal, berapakah kuantiti cadangan yang perlu disediakan termasuk sedikit penimbal (buffer) untuk mengelakkan kekurangan akibat tumpahan atau kerosakan?
      
      Sila balas dengan HANYA SATU NOMBOR BULAT yang mewakili jumlah kuantiti cadangan. Jangan tulis teks lain.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const suggestedText = response.text?.trim() || '';
    const suggestedNumber = parseInt(suggestedText.replace(/[^0-9]/g, ''), 10);
    
    if (!isNaN(suggestedNumber) && suggestedNumber >= baseQuantity) {
      return suggestedNumber;
    }
    
    return baseQuantity;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Fallback to base formula if AI fails
    // Add 10% buffer for bahan, 0 buffer for radas as a fallback rule of thumb
    if (itemType === 'bahan') {
      return Math.ceil(baseQuantity * 1.1);
    }
    return baseQuantity;
  }
}
