import { X, Eye, EyeOff, Loader2, Github, Building2, Mail, User, Calendar, Edit3, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getMe, updateMe, UserProfile } from '../../api/auth';

interface ProfileModalProps {
  onClose: () => void;
}

export function ProfileModal({ onClose }: ProfileModalProps) {
  const [profile,   setProfile]   = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving,  setIsSaving]  = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');

  // 수정 폼
  const [username,        setUsername]        = useState('');
  const [organization,    setOrganization]    = useState('');
  const [githubUrl,       setGithubUrl]       = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmNewPw,    setConfirmNewPw]    = useState('');
  const [showPw,          setShowPw]          = useState(false);
  const [showNewPw,       setShowNewPw]       = useState(false);
  const [changePassword,  setChangePassword]  = useState(false);

  useEffect(() => {
    getMe()
      .then(p => {
        setProfile(p);
        setUsername(p.username);
        setOrganization(p.organization ?? '');
        setGithubUrl(p.githubUrl ?? '');
      })
      .catch(() => setError('프로필을 불러오지 못했습니다.'))
      .finally(() => setIsLoading(false));
  }, []);

  const startEdit = () => { setError(''); setSuccess(''); setIsEditing(true); };
  const cancelEdit = () => {
    if (!profile) return;
    setUsername(profile.username);
    setOrganization(profile.organization ?? '');
    setGithubUrl(profile.githubUrl ?? '');
    setCurrentPassword(''); setNewPassword(''); setConfirmNewPw('');
    setChangePassword(false); setError(''); setIsEditing(false);
  };

  const handleSave = async () => {
    setError(''); setSuccess('');

    if (!username.trim()) { setError('닉네임은 필수입니다.'); return; }
    if (githubUrl && !githubUrl.startsWith('https://github.com')) {
      setError('GitHub 주소는 https://github.com 으로 시작해야 합니다.'); return;
    }
    if (changePassword) {
      if (!currentPassword) { setError('현재 비밀번호를 입력해주세요.'); return; }
      if (newPassword.length < 8) { setError('새 비밀번호는 8자 이상이어야 합니다.'); return; }
      if (newPassword !== confirmNewPw) { setError('새 비밀번호가 일치하지 않습니다.'); return; }
    }

    setIsSaving(true);
    try {
      const updated = await updateMe({
        username: username.trim(),
        organization: organization.trim() || null,
        githubUrl:    githubUrl.trim()    || null,
        ...(changePassword ? { currentPassword, newPassword } : {}),
      });
      setProfile(updated);
      setIsEditing(false);
      setChangePassword(false);
      setCurrentPassword(''); setNewPassword(''); setConfirmNewPw('');
      setSuccess('프로필이 성공적으로 수정되었습니다.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || '저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const inputCls = `w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
    focus:ring-2 focus:ring-blue-500 focus:border-transparent
    dark:bg-gray-700 dark:text-white text-sm transition-colors
    disabled:opacity-60 disabled:cursor-not-allowed`;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{    opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', duration: 0.35 }}
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full
                   border border-gray-200 dark:border-gray-700 shadow-xl
                   max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">내 프로필</h2>
          <div className="flex items-center gap-2">
            {!isEditing && !isLoading && (
              <button onClick={startEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400
                           hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                <Edit3 className="w-4 h-4" /> 수정
              </button>
            )}
            <button onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* 로딩 */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          )}

          {/* 알림 */}
          <AnimatePresence>
            {(error || success) && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`px-4 py-3 rounded-lg text-sm border ${
                  error
                    ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                    : 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
                }`}>{error || success}</motion.div>
            )}
          </AnimatePresence>

          {profile && !isLoading && (
            <>
              {/* 아바타 + 기본 정보 */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600
                                flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-lg">{profile.username}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    profile.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                  }`}>{profile.role === 'ADMIN' ? '관리자' : '일반 사용자'}</span>
                </div>
              </div>

              {/* 정보 목록 or 수정 폼 */}
              {!isEditing ? (
                // ── 조회 모드 ──────────────────────────────────────
                <div className="space-y-3">
                  {[
                    { icon: Mail,      label: '이메일',       value: profile.email },
                    { icon: User,      label: '닉네임',       value: profile.username },
                    { icon: Building2, label: '학교/직장',    value: profile.organization || '—' },
                    { icon: Github,    label: 'GitHub',       value: profile.githubUrl    || '—', isLink: !!profile.githubUrl },
                    { icon: Calendar,  label: '가입일',       value: formatDate(profile.createdAt) },
                  ].map(({ icon: Icon, label, value, isLink }) => (
                    <div key={label}
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
                        {isLink ? (
                          <a href={value} target="_blank" rel="noopener noreferrer"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all">
                            {value}
                          </a>
                        ) : (
                          <p className="text-sm text-gray-900 dark:text-white break-all">{value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // ── 수정 모드 ──────────────────────────────────────
                <div className="space-y-4">
                  {/* 이메일 (수정 불가) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-gray-400" /> 이메일
                    </label>
                    <input value={profile.email} disabled className={`${inputCls} bg-gray-100 dark:bg-gray-600`} />
                    <p className="text-xs text-gray-400 mt-1">이메일은 변경할 수 없습니다.</p>
                  </div>

                  {/* 닉네임 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-gray-400" /> 닉네임 <span className="text-red-500">*</span>
                    </label>
                    <input value={username} onChange={e => setUsername(e.target.value)}
                      placeholder="닉네임" className={inputCls} disabled={isSaving} />
                  </div>

                  {/* 학교/직장 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-gray-400" /> 학교 또는 직장
                    </label>
                    <input value={organization} onChange={e => setOrganization(e.target.value)}
                      placeholder="예) ○○대학교 / ○○회사" className={inputCls} disabled={isSaving} />
                  </div>

                  {/* GitHub */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                      <Github className="w-4 h-4 text-gray-400" /> GitHub 주소
                    </label>
                    <input value={githubUrl} onChange={e => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username" className={inputCls} disabled={isSaving} />
                  </div>

                  {/* 비밀번호 변경 토글 */}
                  <div>
                    <button type="button"
                      onClick={() => setChangePassword(v => !v)}
                      className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      <Check className={`w-4 h-4 transition-opacity ${changePassword ? 'opacity-100' : 'opacity-30'}`} />
                      비밀번호 변경
                    </button>
                  </div>

                  <AnimatePresence>
                    {changePassword && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }} className="space-y-3">
                        {/* 현재 비밀번호 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            현재 비밀번호
                          </label>
                          <div className="relative">
                            <input type={showPw ? 'text' : 'password'} value={currentPassword}
                              onChange={e => setCurrentPassword(e.target.value)}
                              placeholder="현재 비밀번호" className={`${inputCls} pr-11`} disabled={isSaving} />
                            <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        {/* 새 비밀번호 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            새 비밀번호
                          </label>
                          <div className="relative">
                            <input type={showNewPw ? 'text' : 'password'} value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                              placeholder="8자 이상" className={`${inputCls} pr-11`} disabled={isSaving} />
                            <button type="button" tabIndex={-1} onClick={() => setShowNewPw(v => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                              {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        {/* 새 비밀번호 확인 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            새 비밀번호 확인
                          </label>
                          <input type="password" value={confirmNewPw}
                            onChange={e => setConfirmNewPw(e.target.value)}
                            placeholder="새 비밀번호 재입력" className={inputCls} disabled={isSaving} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 버튼 */}
                  <div className="flex gap-3 pt-2">
                    <button onClick={cancelEdit} disabled={isSaving}
                      className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600
                                 text-gray-700 dark:text-gray-300 rounded-lg text-sm
                                 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
                      취소
                    </button>
                    <button onClick={handleSave} disabled={isSaving}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                                 text-white rounded-lg text-sm font-medium transition-colors
                                 flex items-center justify-center gap-2">
                      {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" />저장 중...</> : '저장하기'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
