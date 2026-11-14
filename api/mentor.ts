declare const process:
  | {
      env: Record<string, string | undefined>;
    }
  | undefined;

interface MentorApiHistoryTurn {
  sender: 'cadet' | 'mentor';
  text: string;
}

interface MentorApiRequestBody {
  prompt?: unknown;
  history?: unknown;
  cadetSummary?: unknown;
}

const SYSTEM_INSTRUCTION = `You are ARIA (Astronaut Readiness & Instructional Assistant), an encouraging aerospace educator for middle and high school cadets in the ANANTRA Junior Astronaut Mission Trainer.
Guidelines:
1. Keep explanations accurate to NASA orbital mechanics, Newtonian physics, spacesuit engineering, and mission safety.
2. Explain clearly in 2-4 concise, encouraging sentences suitable for students (ages 10-18).
3. Never invent fake telemetry or pretend ANANTRA is officially affiliated with NASA.
4. When relevant, connect concepts back to Moon landing thrust (1.62 m/s^2 gravity, vacuum = no parachutes), microgravity inertia (F = m * a), dual safety tethers during EVA, or crew-first emergency triage (air, power, radiation shielding).`;

function jsonResponse(payload: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function sanitizeHistory(raw: unknown): MentorApiHistoryTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(-6)
    .filter(
      (item): item is MentorApiHistoryTurn =>
        Boolean(item) &&
        typeof item === 'object' &&
        ((item as MentorApiHistoryTurn).sender === 'cadet' ||
          (item as MentorApiHistoryTurn).sender === 'mentor') &&
        typeof (item as MentorApiHistoryTurn).text === 'string',
    )
    .map((item) => ({
      sender: item.sender,
      text: item.text.trim().slice(0, 500),
    }));
}

async function queryGemini(
  apiKey: string,
  prompt: string,
  history: MentorApiHistoryTurn[],
  cadetSummary: string,
): Promise<string> {
  const historyLines = history
    .map((turn) => `${turn.sender === 'cadet' ? 'Cadet' : 'ARIA'}: ${turn.text}`)
    .join('\n');

  const fullUserPrompt = [
    cadetSummary ? `Cadet Context: ${cadetSummary}` : '',
    historyLines ? `Recent Conversation:\n${historyLines}` : '',
    `Cadet Question: ${prompt}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: fullUserPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 320,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini upstream responded with status ${response.status}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };
  const answer = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!answer) {
    throw new Error('Gemini returned an empty response');
  }
  return answer;
}

async function queryOpenAi(
  apiKey: string,
  prompt: string,
  history: MentorApiHistoryTurn[],
  cadetSummary: string,
): Promise<string> {
  const messages = [
    { role: 'system', content: SYSTEM_INSTRUCTION },
    ...(cadetSummary
      ? [{ role: 'system', content: `Cadet Context: ${cadetSummary}` }]
      : []),
    ...history.map((turn) => ({
      role: turn.sender === 'cadet' ? 'user' : 'assistant',
      content: turn.text,
    })),
    { role: 'user', content: prompt },
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      max_tokens: 320,
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI upstream responded with status ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const answer = data.choices?.[0]?.message?.content?.trim();
  if (!answer) {
    throw new Error('OpenAI returned an empty response');
  }
  return answer;
}

export async function GET(): Promise<Response> {
  const env = typeof process !== 'undefined' ? process.env : {};
  const hasGemini = Boolean(env.GEMINI_API_KEY?.trim());
  const hasOpenAi = Boolean(env.OPENAI_API_KEY?.trim());

  return jsonResponse({
    configured: hasGemini || hasOpenAi,
    provider: hasGemini ? 'gemini' : hasOpenAi ? 'openai' : 'offline-fallback',
  });
}

export async function POST(request: Request): Promise<Response> {
  const env = typeof process !== 'undefined' ? process.env : {};
  const geminiKey = env.GEMINI_API_KEY?.trim();
  const openAiKey = env.OPENAI_API_KEY?.trim();

  if (!geminiKey && !openAiKey) {
    return jsonResponse(
      {
        configured: false,
        provider: 'offline-fallback',
        error:
          'Live AI provider key is not configured on this server. Falling back to ARIA deterministic offline mentor.',
      },
      503,
    );
  }

  let body: MentorApiRequestBody;
  try {
    body = (await request.json()) as MentorApiRequestBody;
  } catch {
    return jsonResponse(
      { configured: true, error: 'Invalid JSON request payload.' },
      400,
    );
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim().slice(0, 600) : '';
  if (!prompt) {
    return jsonResponse(
      { configured: true, error: 'Prompt text is required.' },
      400,
    );
  }

  const history = sanitizeHistory(body.history);
  const cadetSummary =
    typeof body.cadetSummary === 'string'
      ? body.cadetSummary.trim().slice(0, 400)
      : '';

  try {
    const answer = geminiKey
      ? await queryGemini(geminiKey, prompt, history, cadetSummary)
      : await queryOpenAi(openAiKey as string, prompt, history, cadetSummary);

    return jsonResponse({
      configured: true,
      provider: geminiKey ? 'gemini' : 'openai',
      reply: answer,
    });
  } catch {
    return jsonResponse(
      {
        configured: true,
        error:
          'Upstream AI provider did not respond cleanly. Falling back to ARIA offline handbook.',
      },
      502,
    );
  }
}
