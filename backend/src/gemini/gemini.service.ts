import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiService {
  private geminiProVisionModel: GenerativeModel;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in the environment variables');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // this.geminiProVisionModel = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    this.geminiProVisionModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  }

  async identifyGymMachine(
    imageBuffer: Buffer,
    // prompt: string = 'What is this gym machine? Respond only with the equipment name with the exercise can be played with description, no formatting like **, no extra words.',
     prompt = `What is this gym machine? Respond only with the equipment name in the first with no Introductions, the exercise that can be performed, and a short description. End the sentence with the primary muscle group in lowercase between parentheses. The muscle group must be one of the following: chest, leg, shoulders, abs, back, arms. No formatting like asterisks or bold text. No extra commentary.`,

    mimeType: string = 'image/jpeg'
  ): Promise<string> {
    try {
      const base64Image = imageBuffer.toString('base64');

      const result = await this.geminiProVisionModel.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
      ]);

      const response = await result.response;
      const text = response.text();
      return this.formatResponse(text);
    } catch (error) {
        console.error('❌ Gemini API Error:', JSON.stringify(error, null, 2));
        if (error instanceof Error) {
          throw new Error(error.message);
        }
        throw new Error('Failed to identify gym machine');
      }
  }

  private formatResponse(text:string): string {
    return text
        .replace(/```(\w*)([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^\*]+)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
}
}



// src/gemini/gemini.service.ts
// import { Injectable } from '@nestjs/common';
// import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
// import { ConfigService } from '@nestjs/config';
// import * as fs from 'fs/promises';
// import { base64Encode } from '../utils/base64-encode'; // Assuming you have this utility

// @Injectable()
// export class GeminiService {
//   private geminiProVisionModel: GenerativeModel;

//   constructor(private configService: ConfigService) {
//     const apiKey = this.configService.get<string>('GEMINI_API_KEY');
//     if (!apiKey) {
//       throw new Error('GEMINI_API_KEY is not defined in the environment variables');
//     }
//     const genAI = new GoogleGenerativeAI(apiKey);
//     this.geminiProVisionModel = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
// }

//   async identifyGymMachine(imageBuffer: Buffer, prompt: string = 'What is this gym machine?') {
//     try {
//       const base64Image = imageBuffer.toString('base64');
//     //   const mimeType = 'image/jpg'; 
//     const mimeType = image.mimetype; 
//       const result = await this.geminiProVisionModel.generateContent([
//         prompt,
//         {
//           inlineData: {
//             data: base64Image,
//             mimeType,
//           },
//         },
//       ]);
//       const response = await result.response;
//       const text = response.text();
//       return text;
//     } catch (error) {
//       console.error('Error identifying gym machine:', error);
//       console.error('Detailed Gemini API Error:', error);
//       throw new Error('Failed to identify gym machine');
//     }
//   }
// }