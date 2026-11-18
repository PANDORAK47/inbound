#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""팔레트 입고 카운터를 웹으로 띄우는 서버 (설치 필요 없음, projctl 규칙 호환).

실행: python serve.py  ->  .env 의 PORT(없으면 환경변수 PORT, 기본 8000)로 엽니다.
GitHub Pages 와 같은 파일 구조를 쓰기 위해 public/ 대신 저장소 루트에서 서비스하되,
아래 허용 목록(앱 화면 파일)만 웹에 나가고 .env·.git·tests·문서 등은 나가지 않습니다.
"""
import http.server
import os
import posixpath
import re
import urllib.parse
from pathlib import Path

HERE = Path(__file__).resolve().parent

# 웹에 내보내는 것: 파일 또는 폴더(끝에 /)
ALLOW_FILES = {"index.html", "manifest.webmanifest", "sw.js"}
ALLOW_DIRS = ("css/", "js/", "vendor/", "models/", "icons/")
# 오래 캐시해도 되는 큰 파일(버전이 바뀌면 경로 대신 서비스워커가 갱신)
LONG_CACHE = ("vendor/", "models/", "icons/")


def env(key, default=""):
    f = HERE / ".env"
    if f.exists():
        for line in f.read_text(encoding="utf-8").splitlines():
            m = re.match(r"\s*(?:export\s+)?" + key + r"\s*=\s*(.*)", line)
            if m:
                return m.group(1).strip().strip("'\"")
    return os.environ.get(key, default)


PORT = int(env("PORT") or 8000)
PROJECT_ID = env("PROJECT_ID")


def normalize(raw_path: str) -> str:
    """요청 경로를 파일 서버(SimpleHTTPRequestHandler.translate_path)와 똑같이 해석한다:
    쿼리 제거 → %-디코딩 → 정규화(.. 처리). 허용 검사는 반드시 이 결과에 한다.
    (원문 경로로 검사하면 /js/%2e%2e/%2eenv 가 검사는 통과하고 서버에서는 /.env 로 풀린다)"""
    raw = raw_path.split("?", 1)[0].split("#", 1)[0]
    return posixpath.normpath(urllib.parse.unquote(raw, errors="surrogatepass")).lstrip("/")


def allowed(rel: str) -> bool:
    """rel: normalize() 결과(앞의 / 없음)."""
    if rel in ("", "."):
        return True                                   # / → index.html
    parts = rel.split("/")
    if any(p in ("", "..") or p.startswith(".") or "\\" in p for p in parts):
        return False                                  # 숨김 파일(.env, .git)·상위 폴더·역슬래시 차단
    return rel in ALLOW_FILES or rel.startswith(ALLOW_DIRS)


class Handler(http.server.SimpleHTTPRequestHandler):
    # Windows 레지스트리 설정에 따라 .js 가 text/plain 으로 나가면 모듈 스크립트가 막히므로 직접 지정
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".mjs": "text/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".json": "application/json",
        ".webmanifest": "application/manifest+json",
        ".bin": "application/octet-stream",
        ".png": "image/png",
        ".svg": "image/svg+xml",
        ".wasm": "application/wasm",
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(HERE), **kwargs)

    def _rel(self):
        return normalize(self.path)

    def do_GET(self):
        if not allowed(self._rel()):
            self.send_error(404)
            return
        super().do_GET()

    def do_HEAD(self):
        if not allowed(self._rel()):
            self.send_error(404)
            return
        super().do_HEAD()

    def list_directory(self, path):  # 폴더 목록은 보여 주지 않는다
        self.send_error(404)
        return None

    def end_headers(self):
        rel = self._rel()
        self.send_header("Cache-Control", "public, max-age=86400" if rel.startswith(LONG_CACHE) else "no-store")
        self.send_header("X-Projctl-Id", PROJECT_ID)  # projctl check 가 '맞는 프로젝트인지' 확인
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()


if __name__ == "__main__":
    print(f"{PROJECT_ID or 'inbound'} 실행 중: http://localhost:{PORT}  (끄려면 Ctrl+C)")
    http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
