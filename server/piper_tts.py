"""Persistent Piper TTS HTTP server.
Loads the model once and serves synthesis requests over HTTP.
Runs on port 3002 by default.
"""
import sys
import os
import wave
import json
import hashlib
from http.server import HTTPServer, BaseHTTPRequestHandler

MODEL_PATH = None
CACHE_DIR = None
voice = None

class TTSHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok", "model_loaded": voice is not None}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path != "/synthesize":
            self.send_response(404)
            self.end_headers()
            return

        content_length = int(self.headers.get("Content-Length", 0))
        if content_length == 0 or content_length > 100000:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Invalid content length"}).encode())
            return

        body = json.loads(self.rfile.read(content_length))
        text = body.get("text", "").strip()
        if not text:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Empty text"}).encode())
            return

        text_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]
        cache_file = os.path.join(CACHE_DIR, f"{text_hash}.wav")

        if os.path.exists(cache_file) and os.path.getsize(cache_file) > 0:
            print(f"[Piper] Cache hit: {text_hash}", flush=True)
            self._send_wav(cache_file)
            return

        print(f"[Piper] Synthesizing ({len(text)} chars): {text[:60]}...", flush=True)
        try:
            tmp_path = os.path.join(CACHE_DIR, f"{text_hash}_tmp.wav")
            with wave.open(tmp_path, "wb") as w:
                voice.synthesize_wav(text, w)

            os.replace(tmp_path, cache_file)
            print(f"[Piper] Done: {text_hash} ({os.path.getsize(cache_file)} bytes)", flush=True)
            self._send_wav(cache_file)
        except Exception as e:
            print(f"[Piper] Error: {e}", flush=True)
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

    def _send_wav(self, path):
        with open(path, "rb") as f:
            data = f.read()
        self.send_response(200)
        self.send_header("Content-Type", "audio/wav")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, format, *args):
        pass

def main():
    global MODEL_PATH, CACHE_DIR, voice

    if len(sys.argv) < 3:
        print("Usage: piper_tts.py <model_path> <cache_dir> [port]", file=sys.stderr)
        sys.exit(1)

    MODEL_PATH = sys.argv[1]
    CACHE_DIR = sys.argv[2]
    port = int(sys.argv[3]) if len(sys.argv) > 3 else 3002

    os.makedirs(CACHE_DIR, exist_ok=True)

    if not os.path.exists(MODEL_PATH):
        print(f"Model not found: {MODEL_PATH}", file=sys.stderr)
        sys.exit(1)

    print(f"[Piper] Loading model: {MODEL_PATH}", flush=True)
    from piper import PiperVoice
    voice = PiperVoice.load(MODEL_PATH)
    print(f"[Piper] Model loaded successfully", flush=True)

    server = HTTPServer(("127.0.0.1", port), TTSHandler)
    print(f"[Piper] TTS server running on http://127.0.0.1:{port}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("[Piper] Shutting down", flush=True)
        server.server_close()

if __name__ == "__main__":
    main()
