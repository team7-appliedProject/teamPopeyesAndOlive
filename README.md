# 🥬 Popeye Project

콘텐츠 기반 유료 구독 플랫폼 프로젝트

## 📋 목차

- [프로젝트 소개](#프로젝트-소개)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [시작하기](#시작하기)
- [환경 변수 설정](#환경-변수-설정)
- [주요 기능](#주요-기능)
- [API 문서](#api-문서)
- [개발 가이드](#개발-가이드)

---

## 🎯 프로젝트 소개

Popeye는 크리에이터가 콘텐츠를 판매하고, 사용자가 구독하는 유료 콘텐츠 플랫폼입니다.

### 주요 특징

- 🔐 JWT 기반 인증 시스템
- 📱 SMS 본인 인증
- 🔑 OAuth2 소셜 로그인 (Google)
- 💳 토스페이먼츠 결제 연동
- 📊 크리에이터 정산 시스템
- 🛡️ 관리자 콘텐츠 관리 및 신고 처리
- 📦 AWS S3 파일 업로드
- 🔒 AES-256 암호화 (은행 계좌 정보)

---

## 🛠️ 기술 스택

### Backend
- **Framework**: Spring Boot 3.5.9
- **Language**: Java 21
- **Database**: MySQL 8.0
- **Cache**: Redis
- **Security**: Spring Security, JWT
- **OAuth2**: Google OAuth2 Client
- **File Storage**: AWS S3
- **Payment**: Toss Payments
- **Build Tool**: Gradle
- **API Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: Next.js 14.2.5
- **Language**: TypeScript, JavaScript
- **UI Library**: Radix UI, Tailwind CSS
- **State Management**: React Hooks
- **Form Handling**: React Hook Form
- **Payment**: Toss Payments Widget SDK

### Infrastructure
- **Web Server**: Nginx
- **Container**: Docker, Docker Compose
- **Email**: SMTP (Gmail)

---

## 📁 프로젝트 구조

```
teamPopeyesAndOlive/
├── popeye-backend/          # Spring Boot 백엔드
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── popeye/popeyebackend/
│   │   │   │       ├── global/          # 전역 설정
│   │   │   │       ├── user/            # 사용자 관리
│   │   │   │       ├── content/         # 콘텐츠 관리
│   │   │   │       ├── creator/         # 크리에이터 관리
│   │   │   │       ├── payment/         # 결제 관리
│   │   │   │       ├── admin/           # 관리자 기능
│   │   │   │       └── report/           # 신고 기능
│   │   │   └── resources/
│   │   │       └── application.yml
│   │   └── test/
│   ├── build.gradle
│   └── Dockerfile
│
├── popeye-frontend/         # Next.js 프론트엔드
│   ├── app/                 # Next.js App Router
│   ├── components/          # React 컴포넌트
│   ├── lib/                 # 유틸리티 함수
│   ├── package.json
│   └── Dockerfile
│
├── nginx/                   # Nginx 설정
│   ├── nginx.conf
│   └── default.conf
│
├── docs/                    # 프로젝트 문서
│   ├── API_명세서.md
│   ├── DB명세서.md
│   ├── 요구사항정의서.md
│   └── ...
│
├── docker-compose.yml       # Docker Compose 설정
└── README.md
```

---

## 🚀 시작하기

### 사전 요구사항

- Java 21 이상
- Node.js 18 이상
- Docker & Docker Compose
- MySQL 8.0 (또는 Docker 사용)
- Redis (또는 Docker 사용)

### 1. 저장소 클론

```bash
git clone <repository-url>
cd teamPopeyesAndOlive
```

### 2. Docker Compose로 실행 (권장)

```bash
# 환경 변수 파일 생성
cp .env.example .env
# .env 파일에 필요한 환경 변수 설정

# 모든 서비스 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

서비스 접속:
- Frontend: http://localhost:80
- Backend API: http://localhost:80/api
- Swagger UI: http://localhost:8080/swagger-ui.html

### 3. 로컬 개발 환경 설정

#### Backend 실행

```bash
cd popeye-backend

# Gradle Wrapper 권한 부여 (Linux/Mac)
chmod +x gradlew

# 애플리케이션 실행
./gradlew bootRun
# 또는 Windows
gradlew.bat bootRun
```

Backend는 `http://localhost:8080`에서 실행됩니다.

#### Frontend 실행

```bash
cd popeye-frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

Frontend는 `http://localhost:3000`에서 실행됩니다.

---

## ⚙️ 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 환경 변수를 설정하세요.

### 필수 환경 변수

```bash
# Database
SPRING_DB_URL=jdbc:mysql://localhost:3306/popeye?useSSL=false&serverTimezone=Asia/Seoul
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_DATABASE=popeye

# Redis
SPRING_DATA_REDIS_HOST=localhost
SPRING_DATA_REDIS_PORT=6379
SPRING_DATA_REDIS_PASSWORD=your_redis_password

# Email (Gmail)
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

# AWS S3
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_KEY=your_aws_secret_key

# JWT Secret Key
POPEYE_SECRET_KEY=your_jwt_secret_key

# Encryption (AES-256)
POPEYE_ACCOUNT_SECRET_KEY=your_encryption_key_32_chars

# Toss Payments
TOSS_SECRET_KEY=your_toss_secret_key
TOSS_CLIENT_KEY=your_toss_client_key
```

### 선택적 환경 변수 (OAuth2)

```bash
# Google OAuth2 (소셜 로그인 사용 시)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8080/login/oauth2/code/google
OAUTH2_REDIRECT_URI=http://localhost:3000/oauth2/redirect
```

### 환경 변수 설정 방법

자세한 설정 방법은 [docs/환경변수_설정_가이드.md](docs/환경변수_설정_가이드.md)를 참고하세요.

---

## ✨ 주요 기능

### 사용자 기능 (U-01 ~ U-09)

- **U-01**: 회원가입 (이메일, 비밀번호, 닉네임, 전화번호)
- **U-02**: SMS 본인 인증
- **U-03**: 로그인/로그아웃 (JWT 토큰 발급)
- **U-04**: 프로필 관리 (닉네임, 프로필 이미지)
- **U-05**: 소셜 로그인 (Google OAuth2)
- **U-06**: 비밀번호 재설정 (이메일 인증)
- **U-07**: 추천인 코드 시스템 (NanoID 기반)
- **U-08**: 크리에이터 전환
- **U-09**: 회원 탈퇴 (Soft Delete)

### 콘텐츠 기능

- 콘텐츠 생성, 수정, 삭제
- 유료/무료 콘텐츠 구분
- 콘텐츠 미디어 업로드 (이미지, 동영상)
- 콘텐츠 좋아요, 북마크
- 콘텐츠 신고 기능

### 결제 및 정산

- 토스페이먼츠 결제 연동
- 크레딧 시스템
- 크리에이터 정산 (은행 계좌 정보 암호화 저장)
- 출금 요청 및 처리

### 관리자 기능

- 콘텐츠 차단/해제
- 사용자 차단/해제
- 신고 처리
- 통계 조회

자세한 기능 설명은 [docs/U-01~09_구현_교안.md](docs/U-01~09_구현_교안.md)를 참고하세요.

---

## 📚 API 문서

### Swagger UI

애플리케이션 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:

```
http://localhost:8080/swagger-ui.html
```

### API 명세서

자세한 API 명세는 [docs/API_명세서.md](docs/API_명세서.md)를 참고하세요.

### 주요 API 엔드포인트

#### 인증
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/sms/send` - SMS 인증번호 발송
- `POST /api/auth/sms/verify` - SMS 인증번호 검증
- `POST /api/auth/password/reset` - 비밀번호 재설정 요청
- `POST /api/auth/password/reset/confirm` - 비밀번호 재설정 확인

#### 사용자
- `GET /api/users/me` - 내 프로필 조회
- `PATCH /api/users/me` - 내 프로필 수정
- `PATCH /api/users/me/creator` - 크리에이터 전환
- `DELETE /api/users/me` - 회원 탈퇴

#### 콘텐츠
- `GET /api/contents` - 콘텐츠 목록 조회
- `GET /api/contents/{id}` - 콘텐츠 상세 조회
- `POST /api/contents` - 콘텐츠 생성 (크리에이터)
- `PATCH /api/contents/{id}` - 콘텐츠 수정
- `DELETE /api/contents/{id}` - 콘텐츠 삭제

#### 결제
- `POST /api/payments/confirm` - 결제 확인
- `GET /api/payments/history` - 결제 내역 조회

---

## 📖 개발 가이드

### 코드 스타일

- **Backend**: Java 21, Spring Boot 컨벤션 준수
- **Frontend**: Next.js 14 App Router, TypeScript 권장

### 데이터베이스 스키마

데이터베이스 스키마는 [docs/DB명세서.md](docs/DB명세서.md)를 참고하세요.

### 주요 구현 포인트

자세한 구현 내용은 [docs/구현_주요_포인트_상세.md](docs/구현_주요_포인트_상세.md)를 참고하세요.

### 프론트엔드-백엔드 연동

프론트엔드와 백엔드 연동 가이드는 [docs/프론트엔드_백엔드_연결_체크리스트.md](docs/프론트엔드_백엔드_연결_체크리스트.md)를 참고하세요.

### 문제 해결

#### OAuth2 404 에러

OAuth2 소셜 로그인 시 404 에러가 발생하는 경우 [docs/OAuth2_404_에러_해결_가이드.md](docs/OAuth2_404_에러_해결_가이드.md)를 참고하세요.

#### IDE 설정

- **IntelliJ Lombok 설정**: [docs/IntelliJ_Lombok_설정_가이드.md](docs/IntelliJ_Lombok_설정_가이드.md)
- **IDE 캐시 무효화**: [docs/IDE_캐시_무효화_가이드.md](docs/IDE_캐시_무효화_가이드.md)

---

## 🧪 테스트

### Backend 테스트

```bash
cd popeye-backend
./gradlew test
```

### API 테스트

HTTP 클라이언트 파일을 사용하여 API를 테스트할 수 있습니다:

- `popeye-backend/src/test/java/popeye/popeyebackend/oauth/oauth_api_test3.http`

IntelliJ IDEA의 HTTP Client 기능을 사용하거나, VS Code의 REST Client 확장을 사용할 수 있습니다.

---

## 📝 문서 목록

프로젝트의 모든 문서는 `docs/` 디렉토리에 있습니다:

- [API 명세서](docs/API_명세서.md)
- [DB 명세서](docs/DB명세서.md)
- [요구사항 정의서](docs/요구사항정의서.md)
- [U-01~09 구현 교안](docs/U-01~09_구현_교안.md)
- [구현 주요 포인트 상세](docs/구현_주요_포인트_상세.md)
- [프론트엔드 토큰 연동 가이드](docs/프론트엔드_토큰_연동_가이드.md)
- [환경변수 설정 가이드](docs/환경변수_설정_가이드.md)
- [OAuth2 404 에러 해결 가이드](docs/OAuth2_404_에러_해결_가이드.md)

---

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 라이선스

이 프로젝트는 팀 프로젝트입니다.

---

## 👥 팀

**Team PopeyesAndOlive**

---

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.

---

**Made with ❤️ by Team PopeyesAndOlive**
