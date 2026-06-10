import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Github, Mail, Plus, LogOut, Moon, Sun, UserCircle,
  Trash2, Edit3, AlignLeft, AlignCenter, AlignRight,
  ChevronUp, ChevronDown, Briefcase, Award, Code2,
  FolderOpen, Trophy, ExternalLink, Eye, Pencil, Save, Smile
} from 'lucide-react';

import { AuthModal }    from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { AiAgentPanel } from './components/AiAgentPanel';
import { stripHtml } from '../api/aiAgent';
import EmojiPicker, { Theme } from 'emoji-picker-react';

// ── 토큰 스토리지 ────────────────────────────────────────────
const TOKEN_KEY   = 'portfolio_access_token';
const REFRESH_KEY = 'portfolio_refresh_token';
const USER_KEY    = 'portfolio_user_info';
const tokenStorage = {
  isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),
  getUser: () => {
    try { const r = localStorage.getItem(USER_KEY); return r ? JSON.parse(r) : null; }
    catch { return null; }
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

// ── 타입 ─────────────────────────────────────────────────────
type SectionType = 'intro' | 'awards' | 'timeline' | 'projects' | 'skills';
interface Section { id: SectionType; label: string; icon: any; }
interface IntroData    { html: string; profileImage: string | null; }
interface AwardItem    { id: number; title: string; description: string; icon: string; }
interface TimelineItem { id: number; icon: string; title: string; organization: string; date: string; description: string; }
interface ProjectItem  { id: number; title: string; description: string; tags: string[]; github: string; demo: string; }
interface SkillItem    { id: number; name: string; level: number; experience: string; }

const SECTION_META: Section[] = [
  { id: 'intro',    label: '자기소개',      icon: UserCircle },
  { id: 'awards',   label: '수상 & 자격증', icon: Trophy },
  { id: 'timeline', label: '경력 & 학력',   icon: Briefcase },
  { id: 'projects', label: '프로젝트',      icon: FolderOpen },
  { id: 'skills',   label: '기술 스택',     icon: Code2 },
];

const DEFAULT_INTRO: IntroData = {
  html: '<p>안녕하세요! 저는 <strong>풀스택 개발자</strong>입니다.</p><p>이곳에 자유롭게 자기소개를 작성해보세요.</p>',
  profileImage: null,
};
const DEFAULT_AWARDS: AwardItem[] = [
  { id: 1, icon: '🏆', title: '해커톤 최우수상', description: '전국 대학생 해커톤 2023 최우수상 수상.' },
  { id: 2, icon: '🎖️', title: 'AWS 공인 개발자', description: 'AWS Certified Developer – Associate 취득.' },
];
const DEFAULT_TIMELINE: TimelineItem[] = [
  { id: 1, icon: '💼', title: '시니어 풀스택 개발자', organization: '테크 스타트업', date: '2024 ~ 현재', description: '마이크로서비스 아키텍처 설계 및 팀 리딩.' },
  { id: 2, icon: '🎓', title: '컴퓨터공학과 졸업', organization: '○○대학교', date: '2018', description: '웹 기술 및 알고리즘 전공.' },
];
const DEFAULT_PROJECTS: ProjectItem[] = [
  { id: 1, title: 'E-Commerce 플랫폼', description: '풀스택 전자상거래 웹사이트', tags: ['React','Node.js','PostgreSQL'], github: '', demo: '' },
  { id: 2, title: '실시간 채팅 앱', description: 'WebSocket 기반 메시징 플랫폼', tags: ['React','Socket.io'], github: '', demo: '' },
];
const DEFAULT_SKILLS: SkillItem[] = [
  { id: 1, name: 'React / Next.js', level: 90, experience: '3년 경력' },
  { id: 2, name: 'Spring Boot',     level: 80, experience: '2년 경력' },
  { id: 3, name: 'MySQL / JPA',     level: 75, experience: '2년 경력' },
];

// ── 이모지 선택 버튼 컴포넌트 ─────────────────────────────────
function EmojiButton({
  value, onChange, isDarkMode
}: {
  value: string; onChange: (v: string) => void; isDarkMode: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-10 h-10 text-2xl flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        title="이모지 선택"
      >
        {value || <Smile className="w-5 h-5 text-gray-400" />}
      </button>
      {open && (
        <div className="absolute left-0 top-12 z-[100]">
          <EmojiPicker
            onEmojiClick={(data: any) => {
              onChange(data.emoji);
              setOpen(false);
            }}
            theme={isDarkMode ? Theme.DARK : Theme.LIGHT}
            searchPlaceholder="이모지 검색..."
            width={300}
            height={380}
            lazyLoadEmojis
          />
        </div>
      )}
    </div>
  );
}

// ── contentEditable 필드 (input 대체 - 툴바 스타일 적용 가능) ──
function EditableField({
  value, onChange, placeholder = '', className = '', multiline = false
}: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; className?: string; multiline?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const skipSync = useRef(false);

  // 외부 value가 바뀔 때만 DOM 업데이트 (커서 보호)
  useEffect(() => {
    if (!ref.current) return;
    if (skipSync.current) { skipSync.current = false; return; }
    if (ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onInput={() => {
        skipSync.current = true;
        if (ref.current) onChange(ref.current.innerHTML);
      }}
      onKeyDown={e => {
        if (!multiline && e.key === 'Enter') e.preventDefault();
      }}
      className={`focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 ${className}`}
    />
  );
}

// ── 자기소개 전용 에디터 (html 통째로 저장) ───────────────────
function IntroEditor({
  html, onChange, isDarkMode
}: {
  html: string; onChange: (h: string) => void; isDarkMode: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const skipSync = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    if (skipSync.current) { skipSync.current = false; return; }
    if (ref.current.innerHTML !== html) {
      ref.current.innerHTML = html;
    }
  }, [html]);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.color = isDarkMode ? '#ffffff' : '#000000';
    }
  }, [isDarkMode]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={() => {
        skipSync.current = true;
        if (ref.current) onChange(ref.current.innerHTML);
      }}
      style={{ color: isDarkMode ? '#ffffff' : '#000000' }}
      className="min-h-[160px] p-4 focus:outline-none text-sm leading-relaxed rounded-xl border border-blue-300 dark:border-blue-600 focus:ring-2 focus:ring-blue-400 dark:bg-gray-800"
    />
  );
}

// ── 드래그 선택 정보 툴팁 ────────────────────────────────────
function SelectionTooltip({ editMode }: { editMode: boolean }) {
  const [info, setInfo] = useState<{
    top: number; left: number;
    bold: boolean; italic: boolean; underline: boolean; fontSize: string;
  } | null>(null);

  useEffect(() => {
    if (!editMode) { setInfo(null); return; }

    const update = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) { setInfo(null); return; }

      const range = sel.getRangeAt(0);
      // contenteditable 영역 안에서만 표시
      let node: Node | null = range.commonAncestorContainer;
      while (node) {
        if (node instanceof HTMLElement && node.isContentEditable) break;
        node = node.parentNode;
      }
      if (!node) { setInfo(null); return; }

      const bold = document.queryCommandState('bold');
      const italic = document.queryCommandState('italic');
      const underline = document.queryCommandState('underline');

      const el = sel.anchorNode instanceof Element
        ? sel.anchorNode
        : sel.anchorNode?.parentElement;
      const fontSize = el ? window.getComputedStyle(el as Element).fontSize : '';

      const rect = range.getBoundingClientRect();
      setInfo({ top: rect.top - 44, left: rect.left + rect.width / 2, bold, italic, underline, fontSize });
    };

    const onSelChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) setInfo(null);
    };

    document.addEventListener('mouseup', update);
    document.addEventListener('keyup', update);
    document.addEventListener('selectionchange', onSelChange);
    return () => {
      document.removeEventListener('mouseup', update);
      document.removeEventListener('keyup', update);
      document.removeEventListener('selectionchange', onSelChange);
    };
  }, [editMode]);

  if (!info) return null;

  return (
    <div
      style={{ position: 'fixed', top: info.top, left: info.left, transform: 'translateX(-50%)', zIndex: 300 }}
      className="bg-gray-900/95 text-white text-xs rounded-lg px-3 py-1.5 flex gap-2 items-center shadow-xl pointer-events-none whitespace-nowrap border border-gray-700"
    >
      <span className="text-blue-300 font-medium">{info.fontSize}</span>
      <span className="text-gray-500">|</span>
      <span className={info.bold ? 'font-bold text-white' : 'text-gray-500'}>B</span>
      <span className={info.italic ? 'italic text-white' : 'text-gray-500'}>I</span>
      <span className={info.underline ? 'underline text-white' : 'text-gray-500'}>U</span>
    </div>
  );
}

// ── 우측 고정 에디터 툴바 ─────────────────────────────────────
function FloatingToolbar({ visible }: { visible: boolean }) {
  const FONTS = ['기본', 'Arial', 'Georgia', 'Courier New', 'Noto Sans KR'];
  const SIZES = ['12px','14px','16px','18px','20px','24px','28px','32px'];
  const COLORS = [
    { hex: '#000000', label: '검정' },
    { hex: '#374151', label: '진회색' },
    { hex: '#e53e3e', label: '빨강' },
    { hex: '#dd6b20', label: '주황' },
    { hex: '#d69e2e', label: '노랑' },
    { hex: '#38a169', label: '초록' },
    { hex: '#3182ce', label: '파랑' },
    { hex: '#805ad5', label: '보라' },
    { hex: '#d53f8c', label: '핑크' },
    { hex: '#ffffff', label: '흰색' },
  ];

  // select 클릭 시 포커스 이동 전에 선택 영역 저장
  const savedRange = useRef<Range | null>(null);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    if (!savedRange.current) return;
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  const exec = (cmd: string, val?: string) => document.execCommand(cmd, false, val);

  const applySize = (size: string) => {
    restoreSelection();
    exec('fontSize', '7');
    setTimeout(() => {
      document.querySelectorAll('font[size="7"]').forEach(el => {
        const span = document.createElement('span');
        span.style.fontSize = size;
        while (el.firstChild) span.appendChild(el.firstChild);
        el.replaceWith(span);
      });
    }, 0);
  };

  const applyFont = (fontName: string) => {
    restoreSelection();
    exec('fontName', fontName);
  };

  if (!visible) return null;

  return (
    <div className="fixed top-20 right-4 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600 p-3 flex flex-col gap-2 w-48">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">✏️ 텍스트 편집</p>

      <div>
        <p className="text-[10px] text-gray-400 mb-1">폰트</p>
        <select
          onMouseDown={saveSelection}
          onChange={e => applyFont(e.target.value)}
          className="w-full text-xs px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none">
          {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <div>
        <p className="text-[10px] text-gray-400 mb-1">글자 크기</p>
        <select
          onMouseDown={saveSelection}
          onChange={e => applySize(e.target.value)}
          className="w-full text-xs px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none">
          {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <p className="text-[10px] text-gray-400 mb-1">스타일</p>
        <div className="flex gap-1">
          {[
            { cmd: 'bold',      label: 'B', cls: 'font-bold' },
            { cmd: 'italic',    label: 'I', cls: 'italic' },
            { cmd: 'underline', label: 'U', cls: 'underline' },
          ].map(({ cmd, label, cls }) => (
            <button key={cmd} onMouseDown={e => { e.preventDefault(); exec(cmd); }}
              className={`flex-1 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm transition-colors ${cls}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] text-gray-400 mb-1">정렬</p>
        <div className="flex gap-1">
          {[
            { cmd: 'justifyLeft',   Icon: AlignLeft },
            { cmd: 'justifyCenter', Icon: AlignCenter },
            { cmd: 'justifyRight',  Icon: AlignRight },
          ].map(({ cmd, Icon }) => (
            <button key={cmd} onMouseDown={e => { e.preventDefault(); exec(cmd); }}
              className="flex-1 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors">
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] text-gray-400 mb-1">글자 색</p>
        <div className="grid grid-cols-5 gap-1">
          {COLORS.map(({ hex, label }) => (
            <button key={hex} title={label}
              onMouseDown={e => { e.preventDefault(); exec('foreColor', hex); }}
              style={{ background: hex }}
              className={`w-7 h-7 rounded-full shadow-sm hover:scale-110 transition-transform
                ${hex === '#ffffff'
                  ? 'border-2 border-gray-400 dark:border-gray-400'
                  : 'border-2 border-white dark:border-gray-700'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 섹션 컴포넌트들 ───────────────────────────────────────────

function IntroSection({ data, editMode, onChange, isDarkMode }: {
  data: IntroData; editMode: boolean; onChange: (d: IntroData) => void; isDarkMode: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onChange({ ...data, profileImage: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <div
            onClick={() => editMode && fileRef.current?.click()}
            className={`w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200 dark:border-blue-700
                        bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center
                        ${editMode ? 'cursor-pointer hover:opacity-80 ring-2 ring-blue-400 ring-offset-2' : ''} transition-all`}
          >
            {data.profileImage
              ? <img src={data.profileImage} alt="프로필" className="w-full h-full object-cover" />
              : <UserCircle className="w-16 h-16 text-white" />
            }
          </div>
          {editMode && (
            <>
              <button onClick={() => fileRef.current?.click()}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline">이미지 변경</button>
              {data.profileImage && (
                <button onClick={() => onChange({ ...data, profileImage: null })}
                  className="text-xs text-red-500 hover:underline">삭제</button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </>
          )}
        </div>

        <div className="flex-1">
          {editMode ? (
            <>
              <p className="text-xs text-blue-500 dark:text-blue-400 mb-2 flex items-center gap-1">
                <Edit3 className="w-3 h-3" /> 우측 툴바로 글자 스타일을 변경하세요
              </p>
              <IntroEditor html={data.html} onChange={html => onChange({ ...data, html })} isDarkMode={isDarkMode} />
            </>
          ) : (
            <div
              className="max-w-none leading-relaxed text-sm [&_*]:max-w-none"
              style={{ color: isDarkMode ? '#ffffff' : '#111827' }}
              dangerouslySetInnerHTML={{ __html: data.html }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function AwardsSection({ items, editMode, onChange, isDarkMode }: {
  items: AwardItem[]; editMode: boolean; onChange: (items: AwardItem[]) => void; isDarkMode: boolean;
}) {
  const add    = () => onChange([...items, { id: Date.now(), icon: '🏅', title: '새 항목', description: '' }]);
  const remove = (id: number) => onChange(items.filter(x => x.id !== id));
  const update = (id: number, field: keyof AwardItem, val: string) =>
    onChange(items.map(x => x.id === id ? { ...x, [field]: val } : x));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map(item => (
          <div key={item.id} className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl relative group">
            {editMode
              ? <EmojiButton value={item.icon} onChange={v => update(item.id, 'icon', v)} isDarkMode={isDarkMode} />
              : <span className="text-2xl w-10 flex-shrink-0 leading-none pt-1">{item.icon}</span>
            }
            <div className="flex-1 min-w-0">
              {editMode ? (
                <>
                  <EditableField value={item.title} onChange={v => update(item.id, 'title', v)}
                    placeholder="제목"
                    className="w-full font-semibold text-sm border-b border-gray-300 dark:border-gray-600 dark:text-white mb-1 pb-0.5" />
                  <EditableField value={item.description} onChange={v => update(item.id, 'description', v)}
                    placeholder="설명"
                    className="w-full text-xs text-gray-500 dark:text-gray-400" />
                </>
              ) : (
                <>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white"
                    dangerouslySetInnerHTML={{ __html: item.title }} />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5"
                    dangerouslySetInnerHTML={{ __html: item.description }} />
                </>
              )}
            </div>
            {editMode && (
              <button onClick={() => remove(item.id)}
                className="absolute top-2 right-2 p-1 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
      {editMode && (
        <button onClick={add} className="mt-4 flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline">
          <Plus className="w-4 h-4" /> 항목 추가
        </button>
      )}
    </div>
  );
}

function TimelineSection({ items, editMode, onChange, isDarkMode }: {
  items: TimelineItem[]; editMode: boolean; onChange: (items: TimelineItem[]) => void; isDarkMode: boolean;
}) {
  const add    = () => onChange([...items, { id: Date.now(), icon: '💼', title: '새 항목', organization: '', date: '', description: '' }]);
  const remove = (id: number) => onChange(items.filter(x => x.id !== id));
  const update = (id: number, field: keyof TimelineItem, val: string) =>
    onChange(items.map(x => x.id === id ? { ...x, [field]: val } : x));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="space-y-4">
        {items.map((item, i) => (
          <motion.div key={item.id}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative pl-8 pb-6 border-l-2 border-blue-200 dark:border-blue-700 last:pb-0 group">
            <div className="absolute -left-5 top-0 flex items-center justify-center">
              {editMode
                ? <EmojiButton value={item.icon} onChange={v => update(item.id, 'icon', v)} isDarkMode={isDarkMode} />
                : <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm shadow">{item.icon}</div>
              }
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 relative">
              {editMode && (
                <button onClick={() => remove(item.id)}
                  className="absolute top-2 right-2 p-1 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              {editMode ? (
                <div className="space-y-1.5 pr-6">
                  <div className="flex gap-2 items-end">
                    {/* 제목 - contentEditable로 툴바 적용 가능 */}
                    <EditableField value={item.title} onChange={v => update(item.id, 'title', v)}
                      placeholder="직함/학위"
                      className="flex-1 font-bold text-sm border-b border-gray-300 dark:border-gray-500 dark:text-white pb-0.5" />
                    <input value={item.date} onChange={e => update(item.id, 'date', e.target.value)}
                      placeholder="기간" className="w-32 text-xs bg-transparent border-b border-gray-300 dark:border-gray-500 focus:outline-none text-gray-500 dark:text-gray-400" />
                  </div>
                  <EditableField value={item.organization} onChange={v => update(item.id, 'organization', v)}
                    placeholder="회사/학교"
                    className="w-full text-sm text-blue-600 font-semibold border-b border-gray-300 dark:border-gray-500 pb-0.5" />
                  <EditableField value={item.description} onChange={v => update(item.id, 'description', v)}
                    placeholder="설명"
                    className="w-full text-xs text-gray-500 dark:text-gray-400" />
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white"
                      dangerouslySetInnerHTML={{ __html: item.title }} />
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">{item.date}</span>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-1"
                    dangerouslySetInnerHTML={{ __html: item.organization }} />
                  <p className="text-xs text-gray-600 dark:text-gray-400"
                    dangerouslySetInnerHTML={{ __html: item.description }} />
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      {editMode && (
        <button onClick={add} className="mt-4 flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline">
          <Plus className="w-4 h-4" /> 항목 추가
        </button>
      )}
    </div>
  );
}

function ProjectsSection({ items, editMode, onChange }: {
  items: ProjectItem[]; editMode: boolean; onChange: (items: ProjectItem[]) => void;
}) {
  const add    = () => onChange([...items, { id: Date.now(), title: '새 프로젝트', description: '', tags: [], github: '', demo: '' }]);
  const remove = (id: number) => onChange(items.filter(x => x.id !== id));
  const update = (id: number, field: keyof ProjectItem, val: any) =>
    onChange(items.map(x => x.id === id ? { ...x, [field]: val } : x));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <motion.div key={item.id}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 relative group border border-gray-200 dark:border-gray-600">
            {editMode && (
              <button onClick={() => remove(item.id)}
                className="absolute top-2 right-2 p-1 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            {editMode ? (
              <div className="space-y-2 pr-4">
                <EditableField value={item.title} onChange={v => update(item.id, 'title', v)}
                  placeholder="프로젝트명"
                  className="w-full font-bold text-sm border-b border-gray-300 dark:border-gray-500 dark:text-white pb-0.5" />
                <EditableField value={item.description} onChange={v => update(item.id, 'description', v)}
                  placeholder="설명" multiline
                  className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded p-1 dark:text-gray-300 min-h-[40px]" />
                <input value={item.tags.join(', ')} onChange={e => update(item.id, 'tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                  placeholder="태그 (쉼표로 구분)" className="w-full text-xs bg-transparent border-b border-gray-200 dark:border-gray-600 focus:outline-none text-gray-500" />
                <input value={item.github} onChange={e => update(item.id, 'github', e.target.value)}
                  placeholder="GitHub URL" className="w-full text-xs bg-transparent border-b border-gray-200 dark:border-gray-600 focus:outline-none text-gray-500" />
                <input value={item.demo} onChange={e => update(item.id, 'demo', e.target.value)}
                  placeholder="Demo URL" className="w-full text-xs bg-transparent border-b border-gray-200 dark:border-gray-600 focus:outline-none text-gray-500" />
              </div>
            ) : (
              <>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1"
                  dangerouslySetInnerHTML={{ __html: item.title }} />
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3"
                  dangerouslySetInnerHTML={{ __html: item.description }} />
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs rounded-full">{t}</span>
                  ))}
                </div>
                <div className="flex gap-2">
                  {item.github && <a href={item.github} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600">
                    <Github className="w-3.5 h-3.5" /> GitHub</a>}
                  {item.demo && <a href={item.demo} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600">
                    <ExternalLink className="w-3.5 h-3.5" /> Demo</a>}
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>
      {editMode && (
        <button onClick={add} className="mt-4 flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline">
          <Plus className="w-4 h-4" /> 프로젝트 추가
        </button>
      )}
    </div>
  );
}

function SkillsSection({ items, editMode, onChange }: {
  items: SkillItem[]; editMode: boolean; onChange: (items: SkillItem[]) => void;
}) {
  const add    = () => onChange([...items, { id: Date.now(), name: '새 기술', level: 50, experience: '' }]);
  const remove = (id: number) => onChange(items.filter(x => x.id !== id));
  const update = (id: number, field: keyof SkillItem, val: any) =>
    onChange(items.map(x => x.id === id ? { ...x, [field]: val } : x));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl relative group">
            {editMode && (
              <button onClick={() => remove(item.id)}
                className="absolute top-2 right-2 p-1 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            {editMode ? (
              <div className="space-y-2 pr-4">
                <EditableField value={item.name} onChange={v => update(item.id, 'name', v)}
                  placeholder="기술명"
                  className="w-full font-semibold text-sm border-b border-gray-300 dark:border-gray-500 dark:text-white pb-0.5" />
                <input value={item.experience} onChange={e => update(item.id, 'experience', e.target.value)}
                  placeholder="경력" className="w-full text-xs bg-transparent border-b border-gray-200 dark:border-gray-600 focus:outline-none text-gray-500" />
                <div className="flex items-center gap-2">
                  <input type="range" min={0} max={100} value={item.level}
                    onChange={e => update(item.id, 'level', Number(e.target.value))} className="flex-1" />
                  <span className="text-xs font-bold text-blue-600 w-8">{item.level}%</span>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-1">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white"
                    dangerouslySetInnerHTML={{ __html: item.name }} />
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">{item.level}%</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{item.experience}</p>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                  <motion.div className="bg-blue-500 h-1.5 rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${item.level}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }} />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      {editMode && (
        <button onClick={add} className="mt-4 flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline">
          <Plus className="w-4 h-4" /> 기술 추가
        </button>
      )}
    </div>
  );
}

// ── 메인 App ─────────────────────────────────────────────────
export default function App() {
  const [isLoggedIn,       setIsLoggedIn]       = useState(false);
  const [editMode,         setEditMode]         = useState(false);
  const [isDirty,          setIsDirty]          = useState(false);
  const [username,         setUsername]         = useState('');
  const [githubUrl,        setGithubUrl]        = useState('');
  const [userEmail,        setUserEmail]        = useState('');
  const [isDarkMode,       setIsDarkMode]       = useState(false);
  const [showAuthModal,    setShowAuthModal]    = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [sectionOrder, setSectionOrder] = useState<SectionType[]>(
    ['intro','awards','timeline','projects','skills']
  );
  const [intro,    setIntro]    = useState<IntroData>(DEFAULT_INTRO);
  const [awards,   setAwards]   = useState<AwardItem[]>(DEFAULT_AWARDS);
  const [timeline, setTimeline] = useState<TimelineItem[]>(DEFAULT_TIMELINE);
  const [projects, setProjects] = useState<ProjectItem[]>(DEFAULT_PROJECTS);
  const [skills,   setSkills]   = useState<SkillItem[]>(DEFAULT_SKILLS);

  useEffect(() => {
    if (tokenStorage.isLoggedIn()) {
      const user = tokenStorage.getUser();
      if (user) {
        setIsLoggedIn(true);
        setUsername(user.username || '');
        setGithubUrl(user.githubUrl || '');
        setUserEmail(user.email || '');
        loadData(user.username || '');
      }
    }
  }, []);

  useEffect(() => { document.documentElement.classList.toggle('dark', isDarkMode); }, [isDarkMode]);
  useEffect(() => { if (!isLoggedIn) { setEditMode(false); setIsDirty(false); } }, [isLoggedIn]);

  const loadData = (u: string) => {
    try {
      const raw = localStorage.getItem(`portfolio_v2_${u}`);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.intro)        setIntro(d.intro);
        if (d.awards)       setAwards(d.awards);
        if (d.timeline)     setTimeline(d.timeline);
        if (d.projects)     setProjects(d.projects);
        if (d.skills)       setSkills(d.skills);
        if (d.sectionOrder) setSectionOrder(d.sectionOrder);
      }
    } catch {}
  };

  const save = useCallback(() => {
    if (!username) return;
    localStorage.setItem(`portfolio_v2_${username}`, JSON.stringify({
      intro, awards, timeline, projects, skills, sectionOrder,
    }));
    setIsDirty(false);
  }, [username, intro, awards, timeline, projects, skills, sectionOrder]);

  // 데이터 변경 감지 → isDirty 표시 (자동저장 X, 수동 저장)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (isLoggedIn && editMode) setIsDirty(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intro, awards, timeline, projects, skills, sectionOrder]);

  const handleLogin = (user: string) => {
    setIsLoggedIn(true);
    setUsername(user);
    const stored = tokenStorage.getUser();
    if (stored) { setGithubUrl(stored.githubUrl || ''); setUserEmail(stored.email || ''); }
    loadData(user);
  };

  const handleLogout = () => {
    tokenStorage.clear();
    setIsLoggedIn(false); setEditMode(false); setIsDirty(false);
    setUsername(''); setGithubUrl(''); setUserEmail('');
    setIntro(DEFAULT_INTRO); setAwards(DEFAULT_AWARDS);
    setTimeline(DEFAULT_TIMELINE); setProjects(DEFAULT_PROJECTS);
    setSkills(DEFAULT_SKILLS);
    setSectionOrder(['intro','awards','timeline','projects','skills']);
  };

  const moveSection = (idx: number, dir: -1 | 1) => {
    const next = [...sectionOrder];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setSectionOrder(next);
  };

  const aiAgentContext = useMemo(
    () => ({
      username: username || undefined,
      editMode,
      sections: {
        awardsCount: awards.length,
        timelineCount: timeline.length,
        projects: projects.map(p => ({
          title: stripHtml(p.title),
          description: stripHtml(p.description),
          tags: p.tags,
        })),
        skills: skills.map(s => ({
          name: s.name,
          level: s.level,
          experience: s.experience,
        })),
        introTextPreview: stripHtml(intro.html).slice(0, 300),
        hasProfileImage: !!intro.profileImage,
      },
    }),
    [username, editMode, awards, timeline, projects, skills, intro]
  );

  const renderSection = (id: SectionType, idx: number) => {
    const meta = SECTION_META.find(s => s.id === id)!;
    return (
      <section key={id}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <meta.icon className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{meta.label}</h2>
          </div>
          {editMode && (
            <div className="flex items-center gap-1">
              <button onClick={() => moveSection(idx, -1)} disabled={idx === 0}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors">
                <ChevronUp className="w-4 h-4 text-gray-500" />
              </button>
              <button onClick={() => moveSection(idx, 1)} disabled={idx === sectionOrder.length - 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors">
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          )}
        </div>
        {id === 'intro'    && <IntroSection    data={intro}     editMode={editMode} onChange={setIntro}    isDarkMode={isDarkMode} />}
        {id === 'awards'   && <AwardsSection   items={awards}   editMode={editMode} onChange={setAwards} isDarkMode={isDarkMode} />}
        {id === 'timeline' && <TimelineSection items={timeline}  editMode={editMode} onChange={setTimeline} isDarkMode={isDarkMode} />}
        {id === 'projects' && <ProjectsSection items={projects}  editMode={editMode} onChange={setProjects} />}
        {id === 'skills'   && <SkillsSection   items={skills}   editMode={editMode} onChange={setSkills} />}
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors">

      <FloatingToolbar visible={editMode} />
      <SelectionTooltip editMode={editMode} />

      <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Portfolio</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsDarkMode(d => !d)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
            </button>
            {isLoggedIn ? (
              <>
                {/* 저장 버튼 - 수정모드 + 변경사항 있을 때만 활성화 */}
                <AnimatePresence>
                  {editMode && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8, x: 10 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: 10 }}
                      onClick={save}
                      disabled={!isDirty}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isDirty
                          ? 'bg-green-500 hover:bg-green-600 text-white shadow-md shadow-green-200 dark:shadow-green-900 cursor-pointer'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Save className="w-3.5 h-3.5" />
                      {isDirty ? '저장하기' : '저장됨'}
                    </motion.button>
                  )}
                </AnimatePresence>
                {/* 모드 스위치 */}
                <button onClick={() => setEditMode(v => !v)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    editMode
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-200 dark:shadow-amber-900'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}>
                  <span className={`relative inline-flex w-9 h-5 rounded-full transition-colors duration-200 ${editMode ? 'bg-white/30' : 'bg-gray-300 dark:bg-gray-500'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${editMode ? 'translate-x-4' : 'translate-x-0'}`} />
                  </span>
                  {editMode ? <><Pencil className="w-3.5 h-3.5" /> 수정 모드</> : <><Eye className="w-3.5 h-3.5" /> 일반 모드</>}
                </button>
                <button onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 transition-colors">
                  <UserCircle className="w-4 h-4" /> {username}
                </button>
                <button onClick={handleLogout}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium bg-red-50 hover:bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors">
                  <LogOut className="w-4 h-4" /> 로그아웃
                </button>
              </>
            ) : (
              <button onClick={() => setShowAuthModal(true)}
                className="px-4 py-1.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                로그인
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            {username ? `${username}의 포트폴리오` : '나의 포트폴리오'}
          </h2>
          <div className="flex justify-center gap-3">
            {githubUrl
              ? <a href={githubUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 dark:bg-gray-700 text-white text-sm hover:bg-gray-700 transition-colors shadow-sm">
                  <Github className="w-4 h-4" /> GitHub</a>
              : <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-400 text-sm cursor-default">
                  <Github className="w-4 h-4" /> GitHub</div>
            }
            {userEmail
              ? <a href={`mailto:${userEmail}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors shadow-sm">
                  <Mail className="w-4 h-4" /> 이메일</a>
              : <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-400 text-sm cursor-default">
                  <Mail className="w-4 h-4" /> 이메일</div>
            }
          </div>
          {isLoggedIn && (!githubUrl || !userEmail) && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              💡 <button onClick={() => setShowProfileModal(true)} className="text-blue-500 hover:underline">개인정보</button>에서 GitHub·이메일을 등록하면 버튼이 활성화됩니다.
            </p>
          )}
        </div>

        <AnimatePresence>
          {editMode && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl text-sm text-amber-700 dark:text-amber-300">
              <Pencil className="w-4 h-4 flex-shrink-0" />
              수정 모드입니다. 텍스트를 드래그해서 선택한 뒤 우측 툴바로 스타일을 변경하세요.
            </motion.div>
          )}
        </AnimatePresence>

        {sectionOrder.map((id, idx) => renderSection(id, idx))}
      </main>

      <AnimatePresence>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onLogin={handleLogin} />}
        {showProfileModal && (
          <ProfileModal onClose={() => {
            setShowProfileModal(false);
            const user = tokenStorage.getUser();
            if (user) { setGithubUrl(user.githubUrl || ''); setUserEmail(user.email || ''); setUsername(user.username || ''); }
          }} />
        )}
      </AnimatePresence>

      <AiAgentPanel context={aiAgentContext} />
    </div>
  );
}