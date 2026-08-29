export interface GenerationConfig {
  audience?: string;
  tone?: string;
  detail?: string;
  objective?: string;
  language?: string;
}

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const generationService = {
  async generateContent(sourceUrl: string, targetFormats: string[], config?: GenerationConfig) {
    const aiResponse = await fetch(`${AI_SERVICE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        source_url: sourceUrl, 
        target_formats: targetFormats, 
        audience: config?.audience,
        tone: config?.tone,
        detail_level: config?.detail,
        objective: config?.objective,
        language: config?.language
      }),
    });
    
    const payload = await aiResponse.json() as { detail?: string; results?: unknown; status?: string };
    
    if (!aiResponse.ok) {
      throw new Error(payload.detail || 'AI service failed');
    }
    
    return payload;
  }
};
