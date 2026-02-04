# ShareHub 플래닝 문서

## 개요
Obsidian 노트를 GitHub 저장소에 푸시하고, GitHub Pages를 통해 다른 사람들에게 공유할 수 있는 플러그인

---

## 아키텍처

### 1. ShareHub 플러그인 (Obsidian)
- GitHub API를 통한 노트/이미지 업로드
- Home MOC 자동 관리
- 공유 URL 생성

### 2. GitHub Pages SPA
- 해시 기반 라우팅 (Navaid)
- GitHub Raw URL로 파일 로드
- 클라이언트 사이드 렌더링
- Tailwind CSS 스타일링

---

## 기술 스택

### Obsidian 플러그인
- **Obsidian API**: 플러그인 기능
- **Octokit**: GitHub API
- **TypeScript**: 타입 안전성
- **Vite**: 빌드 도구

### GitHub Pages SPA
- **Navaid**: 경량 해시 라우터 (2KB)
- **Tailwind CSS**: 스타일링
- **marked.js**: 마크다운 → HTML 변환
- **highlight.js**: 코드 하이라이팅
- **순수 JavaScript**: 프레임워크 불필요

---

## GitHub 저장소 구조

```
github-repo/
├── index.html             ← ShareHub SPA
├── _home.md               ← Home MOC (설정에서 지정)
├── _moc-tech.md           ← 하위 MOC
├── _moc-life.md           ← 하위 MOC
├── note1.md               ← 일반 노트
├── note2.md
├── myimage.png            ← 이미지
└── img2.jpg
```

**특징:**
- 모든 파일이 최상위 (평평한 구조)
- 이미지도 확장자 유지 (.png, .jpg, .gif, .svg, .webp)
- `_home.md`만 Home MOC (설정에서 지정)
- 하위 MOC는 이름 규칙 없음

---

## Obsidian 링크 형식

### Wiki 링크
```markdown
[[note1]]           ← 노트 링크
![[myimage]]        ← 이미지 링크 (확장자 없음)
```

### Home MOC 자동 추가 형식
```markdown
## Recent Notes

- [[note1]] 2026-02-03 10:30
- [[note2]] 2026-02-02 15:45
```

- 사용자가 섹션 추가 가능
- 자동 섹션 분류는 하지 않음
- 타임스탬프 자동 추가

---

## 플러그인 기능

### 1. GitHub 설정
- GitHub 토큰 저장
- 저장소 (owner/repo)
- 브랜치 (default: main)
- Home MOC 파일명 (default: `_home.md`)

### 2. 노트 공유 커맨드
```
"Share current note to GitHub"
```

**동작 흐름:**
1. 현재 노트 내용 가져오기
2. 노트 안에서 이미지 링크(`![[filename]]`) 찾기
3. 이미지 파일 확장자 확인
4. 이미지 파일 → GitHub에 업로드
5. 노트 → GitHub에 업로드
6. Home MOC 파일 가져오기
7. Home에 자동 추가 (리스트 형식 + 타임스탬프)
8. Home MOC 파일 → GitHub에 업로드

### 3. 이미지 업로드
- 원본 파일명 유지 (확장자 포함)
- Obsidian 링크에서는 확장자 없이 사용
- 웹에서는 확장자 추측 또는 별도 규칙 사용

---

## GitHub Pages SPA

### 라우팅 구조
```
#/                    → Home MOC
#/_moc-tech.md        → 하위 MOC
#/note1.md           ← 일반 노트
```

### 페이지 구조
```
App
├── Router (Navaid)
├── Layout
│   ├── Header (로고, 검색)
│   ├── Sidebar (MOC 목록)
│   └── Main (대시보드 또는 노트 뷰어)
└── Pages
    ├── Dashboard (MOC 렌더링)
    └── NoteViewer (노트 렌더링)
```

---

## 파일 로드 및 타입 구별

### 방식: Content-Type 헤더 확인
```javascript
async loadFile(filename) {
  const url = `https://raw.githubusercontent.com/owner/repo/branch/${filename}`;
  const response = await fetch(url);
  const type = response.headers.get('content-type');

  if (type.startsWith('text/')) {
    // 마크다운
    return { type: 'markdown', content: await response.text() };
  } else if (type.startsWith('image/')) {
    // 이미지
    return { type: 'image', url: url };
  }
}
```

**장점:**
- 별도의 API 호출 불필요
- 빠름 (GET 요청 한 번)

---

## 노트 렌더링

### 마크다운 → HTML 변환
```javascript
async renderNote(filename) {
  const { content } = await loadFile(filename);

  // 마크다운 → HTML
  let html = marked.parse(content);

  // 내부 링크 변환
  html = convertInternalLinks(html);

  // 이미지 링크 변환
  html = convertImageLinks(html);

  return html;
}
```

### 내부 링크 변환
```javascript
function convertInternalLinks(html) {
  // [[filename]] → <a href="#/filename.md">filename</a>
  return html.replace(
    /\[\[(.*?)\]\]/g,
    '<a href="#/$1.md" class="internal-link">$1</a>'
  );
}
```

### 이미지 링크 변환
```javascript
function convertImageLinks(html) {
  // ![[filename]] → <img src="..." />
  return html.replace(
    /!\[\[(.*?)\]\]/g,
    (match, filename) => {
      const url = `https://raw.githubusercontent.com/owner/repo/branch/${filename}`;
      return `<img src="${url}" alt="${filename}" />`;
    }
  );
}
```

---

## 확장자 문제와 해결 방안

### 문제점
Obsidian에서는 `![[myimage]]` 처럼 확장자 없이 사용하지만, GitHub에는 `myimage.png`로 저장됨

### 옵션 A: 확장자 추측 (HEAD 요청)
```javascript
async function guessExtension(filename) {
  const extensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];

  for (const ext of extensions) {
    const response = await fetch(url + ext, { method: 'HEAD' });
    if (response.ok) {
      return ext;
    }
  }

  return '';
}
```

**문제점:**
- 각 이미지마다 HEAD 요청 (최대 6번 시도)
- 10개 이미지면 최대 60번 HTTP 요청
- 느림 (네트워크 지연)

### 옵션 B: 접두사 규칙 (추천)
- 플러그인에서 이미지 업로드 시 접두사 추가: `_image_myimage.png`
- 웹에서는 `_image_` 접두사 있는 파일만 이미지로 처리

**장점:**
- HEAD 요청 불필요
- 빠름
- 확장자 유지

**구현:**
```javascript
// 플러그인 업로드 시
uploadImage(filename) {
  const newFilename = `_image_${filename}`; // _image_myimage.png
  github.createFile(newFilename, content);
}

// 웹에서 이미지 링크 변환
function convertImageLinks(html) {
  return html.replace(
    /!\[\[(.*?)\]\]/g,
    (match, filename) => {
      const url = `https://raw.githubusercontent.com/owner/repo/branch/_image_${filename}`;
      return `<img src="${url}" alt="${filename}" />`;
    }
  );
}
```

---

## 대시보드 UI

### Home MOC 렌더링
1. Home 파일 fetch
2. 마크다운 파싱
3. `[[...]]` 링크 추출
4. 노트 목록 표시 (그리드 또는 리스트)
5. 타임스탬프 표시

### 사이드바
- 하위 MOC 목록 (파일 리스트)
- `_home.md` 제외
- MOC 간 전환 가능

### 검색/필터
- 노트 제목 검색
- 타임스탬프 필터
- 최근 노트 순 정렬

---

## 구현 순서

### Phase 1: Obsidian 플러그인 기본
- [x] GitHub 설정 UI
- [ ] GitHub API 연동 (Octokit)
- [ ] 노트 푸시 기본 기능

### Phase 2: Home MOC 관리
- [ ] Home 파일 자동 추가 로직
- [ ] 타임스탬프 추가
- [ ] 이미지 업로드 + 접두사 규칙 (`_image_`)

### Phase 3: 웹 기본 구조
- [ ] Navaid 라우터 설정
- [ ] Tailwind CSS 설치/설정
- [ ] 레이아웃 (헤더, 사이드바, 메인)

### Phase 4: 웹 GitHub 통합
- [ ] 파일 로드 함수 (Content-Type 구별)
- [ ] MOC 파싱
- [ ] 대시보드 렌더링

### Phase 5: 웹 노트 뷰어
- [ ] 마크다운 렌더링 (marked.js)
- [ ] 내부 링크 변환
- [ ] 이미지 링크 변환 (`_image_` 접두사)
- [ ] 코드 하이라이팅 (highlight.js)

### Phase 6: 폴리시
- [ ] 에러 처리
- [ ] 로딩 상태
- [ ] 404 페이지
- [ ] 테스트

---

## 추가 고려사항

### 보안
- 공개 저장소만 지원 (GitHub Token 불필요)
- Rate Limit 회피 (Raw URL 사용)

### 성능
- MOC 캐싱 (localStorage)
- 이미지 레이지 로딩
- 코드 하이라이팅 지연 로딩

### 사용자 경험
- 백/포워드 네비게이션
- 브레드크럼
- 다크 모드 지원
- 모바일 반응형

---

## 질문/결정 사항

- [x] 이미지 접두사 규칙: `_image_` (옵션 B)
- [x] Home MOC 지정: 설정에서 파일명 지정
- [x] Home 자동 추가: 리스트 형식 + 타임스탬프
- [x] 섹션 관리: 사용자가 직접 (자동 분류 안 함)
- [ ] Tailwind CSS 설정 방법 (CDN vs 빌드)
- [ ] 코드 하이라이팅 테마 선택

---

## 참고 자료

- [Navaid](https://github.com/lukeed/navaid)
- [marked.js](https://marked.js.org/)
- [highlight.js](https://highlightjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [GitHub API](https://docs.github.com/en/rest)
- [Obsidian API](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)