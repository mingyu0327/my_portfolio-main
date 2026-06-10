import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import {
  sendPlanningMessage,
  isAiAgentConfigured,
  AI_API_KEY_NOT_CONFIGURED,
  type ChatMessage,
  type PortfolioPlanningContext,
} from '../../api/aiAgent';

const QUICK_PROMPTS = [
  '자기소개 섹션 초안을 기획해줘',
  '프로젝트 카드 구성과 설명을 어떻게 쓰면 좋을지 알려줘',
  '경력·학력 타임라인을 채용 담당자 관점에서 정리해줘',
  '기술 스택 섹션을 강점 위주로 재구성해줘',
];

const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    '안녕하세요! 포트폴리오 **기획·구성**을 도와드리는 AI 에이전트입니다.\n\n' +
    '자기소개, 프로젝트 설명, 경력 정리, 기술 스택 표현 등을 함께 다듬어 볼 수 있어요. ' +
    '아래 빠른 질문을 누르거나, 궁금한 점을 직접 입력해 보세요.',
};

interface AiAgentPanelProps {
  context: PortfolioPlanningContext;
}

export function AiAgentPanel({ context }: AiAgentPanelProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const configured = isAiAgentConfigured();

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [open, messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const toApiHistory = (msgs: ChatMessage[]): ChatMessage[] =>
    msgs.filter(
      m =>
        m.role === 'user' ||
        (m.role === 'assistant' && m.content !== WELCOME_MESSAGE.content)
    );

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setError(null);
      const userMsg: ChatMessage = { role: 'user', content: trimmed };
      const withUser = [...messages, userMsg];
      setMessages(withUser);
      setInput('');
      setLoading(true);

      try {
        const reply = await sendPlanningMessage(toApiHistory(withUser), context);
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : '요청에 실패했습니다.';
        setError(msg === AI_API_KEY_NOT_CONFIGURED ? 'API_KEY_MISSING' : msg);
        setMessages(prev => prev.slice(0, -1));
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, context]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="w-[min(100vw-2rem,380px)] h-[min(70vh,480px)] flex flex-col rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 overflow-hidden"
            role="dialog"
            aria-label="AI 에이전트"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-violet-600 to-blue-600 text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <div>
                  <p className="text-sm font-semibold">AI 에이전트</p>
                  <p className="text-[10px] text-white/80">포트폴리오 기획 도우미</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!configured && (
              <div className="px-3 py-2 bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  Gemini API 키가 없습니다. <code className="text-[10px] bg-amber-100 dark:bg-amber-900/50 px-1 rounded">frontend/.env.local</code>에{' '}
                  <code className="text-[10px] bg-amber-100 dark:bg-amber-900/50 px-1 rounded">REACT_APP_AI_API_KEY</code>(Google AI Studio)를 넣은 뒤 개발 서버를 재시작하세요.
                </p>
              </div>
            )}

            <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-md'
                    }`}
                  >
                    {m.content.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
                      part.startsWith('**') && part.endsWith('**') ? (
                        <strong key={j}>{part.slice(2, -2)}</strong>
                      ) : (
                        <span key={j}>{part}</span>
                      )
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-500 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    생각하는 중…
                  </div>
                </div>
              )}
            </div>

            {error && error !== 'API_KEY_MISSING' && (
              <p className="px-3 pb-1 text-xs text-red-600 dark:text-red-400">{error}</p>
            )}
            {error === 'API_KEY_MISSING' && (
              <p className="px-3 pb-1 text-xs text-red-600 dark:text-red-400">
                채팅을 사용하려면 API 키 설정이 필요합니다.
              </p>
            )}

            <div className="px-2 pb-2 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {QUICK_PROMPTS.map(label => (
                <button
                  key={label}
                  type="button"
                  disabled={loading}
                  onClick={() => send(label)}
                  className="text-[10px] px-2 py-1 rounded-full bg-violet-50 dark:bg-violet-900/40 text-violet-700 dark:text-violet-200 hover:bg-violet-100 dark:hover:bg-violet-900/60 transition-colors disabled:opacity-50"
                >
                  {label}
                </button>
              ))}
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-3 border-t border-gray-100 dark:border-gray-700 flex gap-2 items-end"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={configured ? '기획 관련 질문을 입력하세요…' : 'API 키 설정 후 사용 가능'}
                disabled={loading || !configured}
                rows={2}
                className="flex-1 resize-none text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading || !configured || !input.trim()}
                className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-40 transition-colors"
                aria-label="전송"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg font-medium text-sm text-white transition-shadow ${
          open
            ? 'bg-gray-700 hover:bg-gray-800 dark:bg-gray-600'
            : 'bg-gradient-to-r from-violet-600 to-blue-600 hover:shadow-xl'
        }`}
        aria-expanded={open}
        aria-controls="ai-agent-panel"
      >
        {open ? <X className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        AI 에이전트
      </motion.button>
    </div>
  );
}
