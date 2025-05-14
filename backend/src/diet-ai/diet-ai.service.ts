import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DietGeminiService {
  private model: GenerativeModel;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('DIET_API');
    if (!apiKey) {
      throw new Error('❌ DIET_API key not found in .env');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async generateDietPlan(data: {
    age: number;
    weight: number;
    height: number;
    waist: number;
    neck: number;
    gender: string;
    goal: string;
  }): Promise<string> {
    const prompt = `
You are a certified nutritionist.

Based on the following user info, generate a detailed, plain-text one-day diet plan (breakfast, lunch, dinner, snacks):

- Age: ${data.age}
- Gender: ${data.gender}
- Weight: ${data.weight} kg
- Height: ${data.height} cm
- Waist: ${data.waist} cm
- Neck: ${data.neck} cm
- Goal: ${data.goal}

Return only:
- Meal names
- Foods with quantities
- Estimated calories per meal

No formatting, no Markdown, no extra explanation.
`;

    try {
      const result = await this.model.generateContent([prompt]);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('❌ Gemini Diet Error:', error);
      throw new Error('Error generating diet plan');
    }
  }
}
