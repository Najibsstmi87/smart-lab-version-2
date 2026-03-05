import { GoogleGenAI } from '@google/genai';

export async function predictQuantity(
  itemName: string,
  defaultQuantityPerGroup: number,
  numberOfGroups: number,
  itemType: 'bahan' | 'radas'
): Promise<number> {
  // Pengiraan asas (Matematik biasa)
  const baseQuantity = defaultQuantityPerGroup * numberOfGroups;
  
  try {
    // Kita semak jika ada API Key. Jika tiada, kita guna pengiraan biasa supaya tak crash.
    // @ts-ignore - Abaikan ralat typescript untuk import.meta.env
    const apiKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : '';
    
    if (!apiKey) {
      console.warn("API Key Gemini tidak dijumpai. Menggunakan pengiraan biasa.");
      // Jika bahan (cecair/serbuk), tambah 10% buffer. Jika radas, kekalkan kuantiti asas.
      return itemType === 'bahan' ? Math.ceil(baseQuantity * 1.1) : baseQuantity;
    }

    // Jika ada API Key, baru kita hidupkan AI
    const ai = new GoogleGenAI({ apiKey });

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
    console.error('Ralat memanggil Gemini API:', error);
    if (itemType === 'bahan') {
      return Math.ceil(baseQuantity * 1.1);
    }
    return baseQuantity;
  }
}
