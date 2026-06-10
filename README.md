# 포트폴리오 프로젝트

Personal Portfolio 프론트엔드 + Spring Boot 백엔드 풀스택 프로젝트

---

## 📁 프로젝트 구조

```
portfolio_project/
├── frontend/          # React (CRA) 프론트엔드
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx               # 메인 앱 컴포넌트
│   │   │   └── components/           # UI 컴포넌트들
│   │   │       └── AiAgentPanel.tsx  # 우측 하단 AI 기획 도우미
│   │   ├── api/
│   │   │   └── aiAgent.ts            # AI Chat API 클라이언트
│   │   ├── styles/
│   │   │   └── index.css             # 전역 스타일 (Tailwind)
│   │   └── index.tsx                 # CRA 진입점
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── postcss.config.js
├── backend/           # Spring Boot 백엔드
│   ├── src/
│   │   └── main/java/com/noos/backend/
│   │       ├── auth/                 # 인증 (OAuth2, 회원)
│   │       ├── board/                # 게시판
│   │       ├── chat/                 # 실시간 채팅 (WebSocket)
│   │       └── config/               # 보안/CORS/WebSocket 설정
│   ├── build.gradle
│   ├── gradlew
│   └── gradlew.bat
└── portfolio.code-workspace          # VSCode 워크스페이스
```

---

## 🚀 실행 방법

### 프론트엔드 (React)

```bash
cd frontend
npm install
npm start
```
→ http://localhost:3000 에서 실행

### AI 에이전트 (포트폴리오 기획 도우미)

화면 **우측 하단**의 **「AI 에이전트」** 버튼을 누르면 같은 위치에 팝업 채팅창이 열립니다.  
자기소개·프로젝트·경력·기술 스택 등 포트폴리오 **기획·문장 구성**을 AI가 도와줍니다.

**API 키 연결 (Google Gemini — Google AI Studio):**

1. [Google AI Studio](https://aistudio.google.com/apikey)에서 API 키 발급  
2. 아래처럼 설정 후 **개발 서버 재시작** (`npm start`)

```bash
cd frontend
cp .env.example .env.local
```

`.env.local` 예시:

```env
REACT_APP_AI_API_KEY=발급받은_Gemini_키
REACT_APP_AI_MODEL=gemini-2.5-flash
```

| 환경 변수 | 필수 | 설명 |
|-----------|------|------|
| `REACT_APP_AI_API_KEY` | ✅ | Google AI Studio Gemini API 키 |
| `REACT_APP_AI_MODEL` | | 모델명 (기본: `gemini-2.5-flash`) |
| `REACT_APP_AI_API_BASE` | | API 베이스 (기본: `https://generativelanguage.googleapis.com/v1beta`) |

키가 없어도 UI는 동작하며, 패널 상단에 설정 안내가 표시됩니다.

> **보안:** API 키는 브라우저에 노출됩니다. 공개 저장소·스크린샷에 키를 올리지 마세요. 유출 시 AI Studio에서 키를 삭제하고 재발급하세요.

### 백엔드 (Spring Boot)

```bash
cd backend
./gradlew bootRun
```
→ H2 내장 DB로 http://localhost:8080 에서 바로 실행

> **Windows 사용자:** `./gradlew` 대신 `gradlew.bat bootRun` 사용

---

## ⚙️ 환경 설정 (백엔드)

기본 실행은 H2 내장 DB를 사용하므로 별도 데이터베이스 설치 없이 바로 실행할 수 있습니다.

MySQL로 실행하려면 `backend/src/main/resources/application-mysql.properties`를 사용하세요:

```bash
cd backend
./gradlew bootRun --args='--spring.profiles.active=mysql'
```

MySQL 사용 시 필요한 값:

```properties
# MySQL 접속 정보
DB_URL=jdbc:mysql://localhost:3306/portfolio_db?serverTimezone=Asia/Seoul&characterEncoding=UTF-8
DB_USERNAME=root
DB_PASSWORD=YOUR_DB_PASSWORD

# JWT 비밀키(선택)
JWT_SECRET=YOUR_JWT_SECRET
```

H2로 실행하면 H2 콘솔도 함께 열립니다.

---

## 🛠️ 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트엔드 | React 18, TypeScript, Tailwind CSS v3, Framer Motion |
| 백엔드 | Spring Boot 3.4, JPA, H2(기본), MySQL(선택), WebSocket (STOMP) |
| 인증 | Spring Security, JWT |

---

## 💡 VSCode에서 열기

```bash
code portfolio.code-workspace
```

워크스페이스를 열면 Frontend와 Backend가 각각 별도 폴더로 나뉘어 표시됩니다.
