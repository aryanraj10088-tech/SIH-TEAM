export interface GenerationConfig {
  audience?: string;
  tone?: string;
  detail?: string;
  objective?: string;
  language?: string;
}

const getAiServiceUrl = () => {
  const url = process.env.AI_SERVICE_URL;
  if (!url && process.env.NODE_ENV === 'production') {
    throw new Error('AI_SERVICE_URL environment variable is required in production');
  }
  return url ? url.replace(/\/$/, '') : 'http://localhost:8000';
};

export const generationService = {
  async generateContent(sourceUrl: string, targetFormats: string[], config?: GenerationConfig) {
    const aiResponse = await fetch(`${getAiServiceUrl()}/api/generate`, {
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
    
    const responseText = await aiResponse.text();
    let payload: any;
    try {
      payload = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`AI Service returned an HTML page instead of JSON. You have likely pasted your Frontend or Node Backend URL into the AI_SERVICE_URL environment variable by mistake. It must be the URL of the Python AI Service.`);
    }
    
    if (!aiResponse.ok) {
      throw new Error(payload.detail || 'AI service failed');
    }
    
    return payload;
  }
};
