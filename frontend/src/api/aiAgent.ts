/**
 * 포트폴리오 기획 AI 에이전트 — Google Gemini API
 *
 * frontend/.env.local:
 *   REACT_APP_AI_API_KEY=발급받은_Gemini_키
 *   REACT_APP_AI_MODEL=gemini-2.0-flash   (선택)
 */

const API_KEY = process.env.REACT_APP_AI_API_KEY ?? '';
const API_BASE = (
  process.env.REACT_APP_AI_API_BASE ?? 'https://generativelanguage.googleapis.com/v1beta'
).replace(/\/$/, '');
const MODEL = process.env.REACT_APP_AI_MODEL ?? 'gemini-2.5-flash';

export const AI_API_KEY_NOT_CONFIGURED = 'AI_API_KEY_NOT_CONFIGURED';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface PortfolioPlanningContext {
  username?: string;
  editMode: boolean;
  sections: {
    awardsCount: number;
    timelineCount: number;
    projects: { title: string; description: string; tags: string[] }[];
    skills: { name: string; level: number; experience: string }[];
    introTextPreview: string;
    hasProfileImage: boolean;
  };
}

export function isAiAgentConfigured(): boolean {
  return API_KEY.trim().length > 0;
}

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function buildSystemPrompt(context?: PortfolioPlanningContext): string {
  const base = `당신은 개발자 포트폴리오 웹사이트 작성을 돕는 기획·콘텐츠 어시스턴트입니다.
역할:
- 자기소개, 수상/자격증, 경력·학력, 프로젝트, 기술 스택 섹션의 구성과 문장을 기획합니다.
- 구체적이고 실행 가능한 제안을 합니다 (예: 항목 제목, bullet 포인트, 강조할 키워드).
- 과장·허위는 피하고, 사실에 기반한 표현을 권장합니다.
- 한국어로 답변합니다. 목록·단계가 있으면 읽기 쉽게 정리합니다.
- 코드 생성보다는 포트폴리오 기획·카피·구조 제안에 집중합니다.`;

  if (!context) return base;

  const ctx = context.sections;
  const snapshot = [
    context.username ? `사용자명: ${context.username}` : null,
    `수정 모드: ${context.editMode ? '켜짐' : '꺼짐'}`,
    `수상·자격증 항목 수: ${ctx.awardsCount}`,
    `경력·학력 항목 수: ${ctx.timelineCount}`,
    `프로젝트: ${ctx.projects.map(p => `${p.title} (${p.tags.join(', ') || '태그 없음'})`).join(' | ') || '없음'}`,
    `기술 스택: ${ctx.skills.map(s => `${stripHtml(s.name)} ${s.level}%`).join(' | ') || '없음'}`,
    ctx.introTextPreview ? `자기소개 미리보기: ${ctx.introTextPreview.slice(0, 200)}` : null,
    `프로필 이미지: ${ctx.hasProfileImage ? '있음' : '없음'}`,
  ].filter(Boolean).join('\n');

  return `${base}\n\n현재 포트폴리오 상태:\n${snapshot}`;
}

function toGeminiContents(messages: ChatMessage[]) {
  return messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
}

function parseGeminiError(data: unknown, status: number): string {
  if (data && typeof data === 'object' && 'error' in data) {
    const err = (data as { error?: { message?: string; status?: string } }).error;
    if (err?.status === 'RESOURCE_EXHAUSTED' || status === 429) {
      return 'Gemini API 할당량이 초과되었습니다. Google AI Studio에서 결제·플랜을 확인하거나, .env.local의 REACT_APP_AI_MODEL을 gemini-2.5-flash 등 사용 가능한 모델로 바꿔 보세요.';
    }
    if (err?.message) return err.message;
  }
  return `Gemini API 오류 (HTTP ${status})`;
}

function extractGeminiText(data: unknown): string {
  const candidates = (data as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> }; finishReason?: string }> })
    ?.candidates;
  const text = candidates?.[0]?.content?.parts?.map(p => p.text ?? '').join('').trim();
  if (text) return text;

  const reason = candidates?.[0]?.finishReason;
  if (reason && reason !== 'STOP') {
    throw new Error(`응답이 생성되지 않았습니다 (${reason}). 질문을 다시 시도해 주세요.`);
  }
  throw new Error('AI 응답 형식이 올바르지 않습니다.');
}

export async function sendPlanningMessage(
  messages: ChatMessage[],
  context?: PortfolioPlanningContext
): Promise<string> {
  if (!isAiAgentConfigured()) {
    throw new Error(AI_API_KEY_NOT_CONFIGURED);
  }

  const url = `${API_BASE}/models/${MODEL}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': API_KEY,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: buildSystemPrompt(context) }],
      },
      contents: toGeminiContents(messages),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(parseGeminiError(data, res.status));
  }

  return extractGeminiText(data);
}

export { stripHtml };
