"""Persistent Piper TTS worker.

Protocol:
  stdin  — one line of plain text per request
  stdout — per response: 4-byte big-endian uint32 length, then WAV bytes
           length=0 means synthesis error
  stderr — log messages; 'PIPER_READY' signals model loaded
"""
import sys
import io
import struct
import wave
from piper import PiperVoice
from piper.config import SynthesisConfig

model_path = sys.argv[1] if len(sys.argv) > 1 else None
if not model_path:
    sys.stderr.write("Usage: piper_worker.py <model_path>\n")
    sys.exit(1)

# Speaker IDs in kk_KZ-issai-high model:
#   0 = ISSAI_KazakhTTS2_M2
#   1 = ISSAI_KazakhTTS_M1_Iseke  (male)
#   2 = ISSAI_KazakhTTS2_F3
#   3 = ISSAI_KazakhTTS_F1_Raya   (female, clearest)
#   4 = ISSAI_KazakhTTS2_F1
#   5 = ISSAI_KazakhTTS2_F2
SPEAKER_ID = 3  # Raya — clear female voice
SENTENCE_SILENCE_SEC = 0.3  # 300 ms silence between sentences

voice = PiperVoice.load(model_path)
syn_config = SynthesisConfig(
    speaker_id=SPEAKER_ID,
    length_scale=1.0,
    noise_scale=0.333,
    noise_w_scale=0.333,
)
# Pre-compute silence buffer (16-bit mono PCM zeros)
_silence = b'\x00' * int(voice.config.sample_rate * 2 * SENTENCE_SILENCE_SEC)

sys.stderr.write("PIPER_READY\n")
sys.stderr.flush()

# Read lines from stdin as raw UTF-8 bytes (piped stdin may default to cp1251 on Windows)
for raw_line in sys.stdin.buffer:
    text = raw_line.decode('utf-8').strip()
    if not text:
        sys.stdout.buffer.write(struct.pack(">I", 0))
        sys.stdout.buffer.flush()
        continue
    try:
        buf = io.BytesIO()
        wf = wave.open(buf, "wb")
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(voice.config.sample_rate)

        first_chunk = True
        for chunk in voice.synthesize(text, syn_config=syn_config):
            if not first_chunk:
                wf.writeframes(_silence)   # pause between sentences
            first_chunk = False
            wf.writeframes(chunk.audio_int16_bytes)

        wf.close()

        data = buf.getvalue()
        sys.stdout.buffer.write(struct.pack(">I", len(data)))
        sys.stdout.buffer.write(data)
        sys.stdout.buffer.flush()
    except Exception as e:
        sys.stdout.buffer.write(struct.pack(">I", 0))
        sys.stdout.buffer.flush()
        sys.stderr.write("Piper error: " + str(e) + "\n")
        sys.stderr.flush()
