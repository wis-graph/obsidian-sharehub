# ShareHub

Obsidian 노트를 GitHub 저장소에 푸시하고 GitHub Pages를 통해 다른 사람들에게 공유할 수 있는 플러그인

## 설치

1. [GitHub Releases](https://github.com/wis-graph/obsidian-sharehub/releases)에서 `main.js`와 `manifest.json` 다운로드
2. Obsidian 설정 → 커뮤니티 플러그인 → 폴더 열기
3. `sharehub` 폴더 생성 후 파일들 붙여넣기
4. 플러그인 활성화

## 사용법

### 1. 설정

Obsidian 설정 → ShareHub에서 다음 정보를 입력:

- **GitHub Token**: GitHub Personal Access Token (repo 권한 필요)
- **Repository Owner**: GitHub 사용자명 또는 조직명
- **Repository Name**: 레포지토리 이름
- **Branch**: 푸시할 브랜치 (기본값: main)
- **Home MOC File**: Home MOC 파일명 (기본값: `_home.md`)

### 2. 노트 공유

- 현재 노트 공유: 명령 팔레트(Ctrl+P) → "Share current note to GitHub"
- 우클릭 메뉴: 노트 파일 우클릭 → "Share to GitHub"

### 3. 공유 URL

공유가 완료되면 자동으로 URL이 클립보드에 복사됩니다.

예: `https://wis-graph.github.io/sharehub/#/note.md`

## 기능

### ✅ 완료된 기능

- GitHub 설정 UI
- 노트 푸시 (현재 노트)
- 이미지 자동 업로드 (접두사 `_image_` 추가)
- Home MOC 자동 업데이트 (타임스탬프 포함)
- 공유 URL 자동 생성 및 복사

### 예정된 기능

- [ ] 여러 노트 동시 공유
- [ ] 폴더 단위 공유
- [ ] 공유된 노트 목록 확인
- [ ] 노트 삭제 기능

## 아키텍처

### Obsidian 플러그인
```
sharehub/
├── main.ts              # 메인 플러그인
├── settings.ts          # 설정 인터페이스
├── settings-tab.ts      # 설정 UI
├── github-service.ts    # GitHub API (Octokit)
└── home-moc-manager.ts  # Home MOC 관리
```

### GitHub Pages 웹 인터페이스
```
sharehub-web/
├── index.html
└── src/
    ├── app.js
    ├── router/router.js
    ├── pages/
    ├── services/
    └── components/
```

## GitHub Pages 설정

1. [sharehub 레포지토리](https://github.com/wis-graph/sharehub)에서 Settings → Pages
2. Source: Deploy from a branch → main branch → /(root)
3. Save

## 라이선스

MIT