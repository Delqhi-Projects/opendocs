/**
 * Mistral Vision Client - CAPTCHA Analysis via Mistral API
 * Uses Pixtral-12B-2409 for image-based captcha solving
 */

export interface VisionAnalysisResult {
  text: string;
  confidence: number;
  boundingBoxes?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  }>;
}

export interface CaptchaVerificationResult {
  solved: boolean;
  message?: string;
}

export class MistralVisionClient {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.MISTRAL_API_KEY || '';
    this.model = process.env.VISION_MODEL || 'pixtral-12b-2409';
    this.baseUrl = process.env.MISTRAL_BASE_URL || 'https://api.mistral.ai/v1';
  }

  /**
   * Analyze captcha image and extract solution
   */
  async analyzeCaptcha(imageBuffer: Buffer, captchaType: string): Promise<VisionAnalysisResult> {
    const base64Image = imageBuffer.toString('base64');
    const mimeType = this.detectMimeType(imageBuffer);

    const prompt = this.buildCaptchaPrompt(captchaType);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: { url: `data:${mimeType};base64,${base64Image}` }
                }
              ]
            }
          ],
          temperature: 0.1,
          max_tokens: 256
        })
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      return this.parseCaptchaResponse(content, captchaType);
    } catch (error) {
      console.error('[Vision] Captcha analysis failed:', error);
      throw error;
    }
  }

  /**
   * Build prompt based on captcha type
   */
  private buildCaptchaPrompt(captchaType: string): string {
    const prompts: Record<string, string> = {
      text: `You are a CAPTCHA solver. Analyze this image and extract the text shown. 
Return ONLY the text characters you see, with no extra explanation.
Example output: ABC1234X

What text is shown in this CAPTCHA?`,

      image: `You are a CAPTCHA solver. This is an image-based CAPTCHA.
Identify all the objects, characters, or symbols shown.
Return ONLY the characters/letters, with no extra explanation.
Example output: 7K9M2P

What is shown in this CAPTCHA?`,

      slider: `You are a CAPTCHA solver. This is a slider/jigsaw CAPTCHA.
Analyze the gap between puzzle pieces and calculate the exact pixel distance needed to complete the puzzle.
Return ONLY a number representing the pixel distance.
Example output: 127

What is the slider distance in pixels?`,

      hcaptcha: `You are a CAPTCHA solver. This is an hCaptcha challenge.
Analyze the images and identify which ones match the instruction.
Return ONLY the labels separated by commas.
Example output: bus, car, traffic

What should be selected?`,

      recaptcha: `You are a CAPTCHA solver. This is a reCAPTCHA challenge.
Analyze the images and identify which ones match the instruction.
Return ONLY the labels separated by commas.
Example output: street, crosswalk, car

What should be selected?`
    };

    return prompts[captchaType] || prompts.text;
  }

  /**
   * Parse API response and extract captcha solution
   */
  private parseCaptchaResponse(content: string, captchaType: string): VisionAnalysisResult {
    const cleaned = content.trim();
    
    let confidence = 0.9;
    if (cleaned.length === 0) {
      confidence = 0;
    } else if (captchaType === 'slider') {
      const num = parseInt(cleaned, 10);
      if (!isNaN(num) && num > 0 && num < 500) {
        confidence = 0.95;
      } else {
        confidence = 0.3;
      }
    } else if (cleaned.length > 0 && /^[a-zA-Z0-9\s,]+$/.test(cleaned)) {
      confidence = 0.85;
    }

    return {
      text: cleaned,
      confidence
    };
  }

  /**
   * Verify if captcha was solved correctly
   */
  async verifyCaptchaSolved(imageBuffer: Buffer): Promise<CaptchaVerificationResult> {
    const base64Image = imageBuffer.toString('base64');
    const mimeType = this.detectMimeType(imageBuffer);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this CAPTCHA image. Has it been solved? Look for checkmarks, success messages, or any indication that the challenge was completed successfully. Return ONLY "solved" or "not solved".'
                },
                {
                  type: 'image_url',
                  image_url: { url: `data:${mimeType};base64,${base64Image}` }
                }
              ]
            }
          ],
          temperature: 0.1,
          max_tokens: 32
        })
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.toLowerCase() || '';

      const solved = content.includes('solved') && !content.includes('not solved');

      return {
        solved,
        message: content
      };
    } catch (error) {
      console.error('[Vision] Captcha verification failed:', error);
      return { solved: false, message: 'Verification failed' };
    }
  }

  /**
   * Detect image MIME type from buffer
   */
  private detectMimeType(buffer: Buffer): string {
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      return 'image/png';
    }
    if (buffer[0] === 0xff && buffer[1] === 0xd8) {
      return 'image/jpeg';
    }
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      return 'image/gif';
    }
    if (buffer[0] === 0x57 && buffer[1] === 0x45 && buffer[2] === 0x42 && buffer[3] === 0x50) {
      return 'image/webp';
    }
    return 'image/jpeg';
  }

  /**
   * Analyze full page screenshot for automation
   */
  async analyzePage(imageBuffer: Buffer, task: string): Promise<{
    elements: Array<{ type: string; selector: string; action: string }>;
    suggestions: string[];
  }> {
    const base64Image = imageBuffer.toString('base64');
    const mimeType = this.detectMimeType(imageBuffer);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this webpage screenshot and identify clickable elements (buttons, links, inputs) relevant to: ${task}. Return a JSON array of elements with properties: type, selector, action.`
                },
                {
                  type: 'image_url',
                  image_url: { url: `data:${mimeType};base64,${base64Image}` }
                }
              ]
            }
          ],
          temperature: 0.2,
          max_tokens: 512
        })
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      try {
        const elements = JSON.parse(content);
        return { elements, suggestions: [] };
      } catch {
        return { elements: [], suggestions: [content] };
      }
    } catch (error) {
      console.error('[Vision] Page analysis failed:', error);
      return { elements: [], suggestions: [] };
    }
  }
}

export default MistralVisionClient;
