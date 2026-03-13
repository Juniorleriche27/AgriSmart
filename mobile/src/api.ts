export type HealthResponse = {
  status: string;
  classes: string[];
  input_size: number[];
  cohere_enabled: boolean;
  cohere_model: string | null;
};

export type PredictionResponse = {
  predicted_class: string;
  predicted_label: string;
  confidence: number;
  scores: Record<string, number>;
  input_size: number[];
  inference_time_ms: number;
  advice: string;
  commentary: string;
  commentary_source: 'cohere' | 'local';
  cohere_enabled: boolean;
};


function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.trim().replace(/\/+$/, '');
}


async function readApiError(response: Response) {
  try {
    const data = await response.json();
    if (typeof data.detail === 'string') {
      return data.detail;
    }
  } catch (error) {
    return `Erreur API (${response.status})`;
  }

  return `Erreur API (${response.status})`;
}


export async function checkApiHealth(baseUrl: string): Promise<HealthResponse> {
  const response = await fetch(`${normalizeBaseUrl(baseUrl)}/health`);
  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return (await response.json()) as HealthResponse;
}


export async function predictLeaf(baseUrl: string, photoUri: string): Promise<PredictionResponse> {
  const formData = new FormData();
  formData.append('file', {
    uri: photoUri,
    name: `capture-${Date.now()}.jpg`,
    type: 'image/jpeg',
  } as never);

  const response = await fetch(`${normalizeBaseUrl(baseUrl)}/predict`, {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return (await response.json()) as PredictionResponse;
}
