# ShareHub

Obsidian 노트를 GitHub 저장소에 푸시하고 다른 사람들에게 공유할 수 있는 플러그인

## 기획

### 핵심 기능

1. **GitHub 설정**
   - GitHub 토큰 저장
   - 저장소 선택 (owner/repo)
   - 브랜치 설정 (default: main)
   - 경로 설정 (노트가 저장될 경로)

2. **노트 푸시**
   - 현재 노트를 GitHub에 푸시
   - 여러 노트 선택 푸시
   - 폴더 단위 푸시
   - 노트 이름 변환 규칙 (선택 사항)

3. **공유 URL 생성**
   - GitHub Blob URL 제공
   - 옵션: GitHub Pages나 다른 렌더링 서비스 연동
   - URL 복사 기능

4. **공유 관리**
   - 공유된 노트 목록 확인
   - 노트 삭제 (GitHub에서)
   - 공유 내역 관리

### 기술 스택

- **Obsidian API**: 플러그인 기능
- **Octokit**: GitHub API 호출
- **Vite**: 빌드 도구

### 사용자 플로우

1. 설정에서 GitHub 정보 입력 (토큰, 저장소)
2. 노트 작성
3. "Share to GitHub" 명령 실행
4. 노트가 저장소에 커밋됨
5. 생성된 URL을 받아서 공유

### 추가 고려사항

- 프라이빗 저장소 vs 퍼블릭 저장소 지원
- 이미지 처리
- 링크 변환 (Obsidian 내부 링크 → GitHub 링크)
- 충돌 처리
- 히스토리 관리