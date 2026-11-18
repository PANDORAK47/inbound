"""serve.py 보안 회귀 테스트: 허용 목록 밖 파일(.env, .git, 소스)이 어떤 경로 표기로도 나가지 않는지.
실행: python3 -m unittest discover -s tests -p 'test_*.py'"""
import http.client
import os
import sys
import tempfile
import threading
import unittest
from http.server import ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
import serve  # noqa: E402

LEAKS = [
    "/.env", "/.git/config", "/serve.py", "/README.md", "/tests/test_serve.py", "/js/",
    "/js/%2e%2e/%2eenv", "/js/%2e%2e/serve.py", "/css/%2E%2E/%2Egit/config", "/js/..%2f..%2f.env",
    "//js/../.env", "/js/%5c..%5c.env", "/js/%2e%2e/%2e%2e/etc/passwd", "/models/../serve.py",
]
OK = ["/", "/index.html", "/index.html?v=1", "/js/app.js", "/css/app.css", "/vendor/tf.min.js",
      "/models/mobilenet_v2_035/model.json", "/sw.js", "/manifest.webmanifest", "/icons/icon-192.png"]


class ServeSecurity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.env = ROOT / ".env"
        cls.had_env = cls.env.exists()
        if not cls.had_env:
            cls.env.write_text("SECRET=leak-check\n", encoding="utf-8")
        cls.httpd = ThreadingHTTPServer(("127.0.0.1", 0), serve.Handler)
        threading.Thread(target=cls.httpd.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        if not cls.had_env:
            cls.env.unlink()

    def get(self, path):
        c = http.client.HTTPConnection("127.0.0.1", self.httpd.server_address[1])
        c.request("GET", path)
        r = c.getresponse()
        body = r.read()
        return r, body

    def test_blocked(self):
        for p in LEAKS:
            r, body = self.get(p)
            self.assertEqual(r.status, 404, p)
            self.assertNotIn(b"leak-check", body, p)

    def test_allowed_with_js_mime(self):
        for p in OK:
            r, _ = self.get(p)
            self.assertEqual(r.status, 200, p)
        r, _ = self.get("/js/app.js")
        self.assertTrue(r.getheader("Content-Type").startswith("text/javascript"))


if __name__ == "__main__":
    unittest.main()
