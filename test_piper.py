import wave, os
from piper import PiperVoice

model_path = r"C:\Users\777\OneDrive\Desktop\Khoja Ahmed Yasawi\models\piper\kk_KZ-issai-high.onnx"
out_path = r"C:\Users\777\OneDrive\Desktop\Khoja Ahmed Yasawi\test_output.wav"
print("Loading model...")
v = PiperVoice.load(model_path)
print("Model loaded. Synthesizing...")
with wave.open(out_path, "wb") as w:
    v.synthesize_wav("Сәлем", w)
size = os.path.getsize(out_path)
print(f"Generated {size} bytes -> {out_path}")
