import { X, Eye, EyeOff, Loader2, Github, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { login, signup } from '../../api/auth';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (username: string) => void;
}

export function AuthModal({ onClose, onLogin }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);

  // 필수
  const [email,           setEmail]           = useState('');
  const [username,        setUsername]        = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // 선택
  const [organization, setOrganization] = useState('');
  const [githubUrl,    setGithubUrl]    = useState('');

  // UI
  const [showPw,    setShowPw]    = useState(false);
  const [showCfPw,  setShowCfPw]  = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState('');

  const reset = () => {
    setEmail(''); setUsername(''); setPassword(''); setConfirmPassword('');
    setOrganization(''); setGithubUrl('');
    setError(''); setShowPw(false); setShowCfPw(false);
  };

  const switchMode = () => { setIsLogin(p => !p); reset(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLogin) {
      if (password !== confirmPassword) { setError('비밀번호가 일치하지 않습니다.'); return; }
      if (password.length < 8)          { setError('비밀번호는 8자 이상이어야 합니다.'); return; }
      if (githubUrl && !githubUrl.startsWith('https://github.com')) {
        setError('GitHub 주소는 https://github.com 으로 시작해야 합니다.'); return;
      }
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        const res = await login(email, password);
        onLogin(res.username); onClose();
      } else {
        const res = await signup({
          email,
          password,
          username,
          organization: organization || undefined,
          githubUrl:    githubUrl    || undefined,
        });
        onLogin(res.username); onClose();
      }
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = `w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg
    focus:ring-2 focus:ring-blue-500 focus:border-transparent
    dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-colors text-sm
    disabled:opacity-60`;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{    opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', duration: 0.35 }}
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-8
                   border border-gray-200 dark:border-gray-700 shadow-xl
                   max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isLogin ? '로그인' : '회원가입'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isLogin ? '포트폴리오 관리자로 로그인하세요.' : '새 계정을 만들어보세요.'}
            </p>
          </div>
          <button onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* 에러 */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{    opacity: 0, height: 0 }}
              className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/30
                         border border-red-200 dark:border-red-800
                         rounded-lg text-sm text-red-600 dark:text-red-400"
            >{error}</motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* 이메일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              이메일 <span className="text-red-500">*</span>
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="example@email.com"
              className={inputCls} required disabled={isLoading} />
          </div>

          {/* 닉네임 - 회원가입만 */}
          <AnimatePresence>
            {!isLogin && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  닉네임 <span className="text-red-500">*</span>
                </label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="사용할 닉네임"
                  className={inputCls} required={!isLogin} disabled={isLoading} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              비밀번호 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={isLogin ? '비밀번호 입력' : '8자 이상 입력'}
                className={`${inputCls} pr-11`} required disabled={isLoading} />
              <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 비밀번호 확인 - 회원가입만 */}
          <AnimatePresence>
            {!isLogin && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  비밀번호 확인 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input type={showCfPw ? 'text' : 'password'} value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호 재입력"
                    className={`${inputCls} pr-11`} required={!isLogin} disabled={isLoading} />
                  <button type="button" tabIndex={-1} onClick={() => setShowCfPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    {showCfPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 선택 입력 - 회원가입만 */}
          <AnimatePresence>
            {!isLogin && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
                className="space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
                  <span className="text-xs text-gray-400 whitespace-nowrap">선택 입력</span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <Building2 className="w-4 h-4 text-gray-400" /> 학교 또는 직장
                  </label>
                  <input type="text" value={organization} onChange={e => setOrganization(e.target.value)}
                    placeholder="예) ○○대학교 / ○○회사"
                    className={inputCls} disabled={isLoading} />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <Github className="w-4 h-4 text-gray-400" /> GitHub 주소
                  </label>
                  <input type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className={inputCls} disabled={isLoading} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 제출 버튼 */}
          <button type="submit" disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                       text-white rounded-lg font-medium transition-colors
                       flex items-center justify-center gap-2 text-sm mt-2">
            {isLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" />{isLogin ? '로그인 중...' : '회원가입 중...'}</>
              : isLogin ? '로그인' : '회원가입'}
          </button>
        </form>

        {/* 모드 전환 */}
        <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
          {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}{' '}
          <button onClick={switchMode} disabled={isLoading}
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline disabled:opacity-50">
            {isLogin ? '회원가입하기' : '로그인하기'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}