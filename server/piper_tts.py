"""Piper TTS wrapper — reads text from stdin, writes WAV to stdout."""
import sys
import io
import wave
from piper import PiperVoice
from piper.config import SynthesisConfig

MODEL_PATH = sys.argv[1] if len(sys.argv) > 1 else "models/kk_KZ-issai-high/kk_KZ-issai-high.onnx"

voice = PiperVoice.load(MODEL_PATH)
syn_config = SynthesisConfig(
    speaker_id=3,  # Raya — clear female voice
    length_scale=1.0,
    noise_scale=0.333,
    noise_w_scale=0.333,
)
SENTENCE_SILENCE_SEC = 0.3
_silence = b'\x00' * int(voice.config.sample_rate * 2 * SENTENCE_SILENCE_SEC)

text = sys.stdin.buffer.read().decode("utf-8").strip()
if not text:
    sys.exit(1)

buf = io.BytesIO()
wf = wave.open(buf, "wb")
wf.setnchannels(1)
wf.setsampwidth(2)
wf.setframerate(voice.config.sample_rate)

first_chunk = True
for chunk in voice.synthesize(text, syn_config=syn_config):
    if not first_chunk:
        wf.writeframes(_silence)
    first_chunk = False
    wf.writeframes(chunk.audio_int16_bytes)

wf.close()

sys.stdout.buffer.write(buf.getvalue())
