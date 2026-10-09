"""
Rebuild src/assets/video/noor-hero.{mp4,webm} from a new character animation.

The browser can't rely on transparent video everywhere, so this script:
  1. removes the background from every frame with the ISNet segmentation model
     (download isnet-general-use.onnx from https://github.com/danielgatis/rembg/releases),
  2. crops to the character, and
  3. writes a "stacked" video: colour on top, greyscale alpha matte underneath.
     Frames are played forward, then backward to frame LOOP_FROM, so the typing loop is seamless.

Requirements:  pip install onnxruntime pillow numpy   ·   ffmpeg on PATH
Usage:         python scripts/make-hero-video.py input.mp4 isnet-general-use.onnx
Afterwards, update the numbers printed at the end in src/components/world/videoMeta.js.
"""
import os, subprocess, sys, tempfile
import numpy as np
import onnxruntime as ort
from PIL import Image

LOOP_FROM = 100      # frame where the typing loop starts
GAP = 16             # rows between colour and alpha halves
FILL = np.array([237, 232, 245], dtype=np.float32)  # soft lavender behind semi-transparent edges

src, model = sys.argv[1], sys.argv[2]
tmp = tempfile.mkdtemp()
subprocess.run(['ffmpeg', '-v', 'error', '-i', src, f'{tmp}/%04d.png'], check=True)
files = sorted(f for f in os.listdir(tmp) if f.endswith('.png'))
sess = ort.InferenceSession(model, providers=['CPUExecutionProvider'])
name = sess.get_inputs()[0].name

def matte(img):
    w, h = img.size
    x = np.asarray(img.resize((1024, 1024), Image.LANCZOS), dtype=np.float32) / 255.0
    x = (x - np.array([0.485, 0.456, 0.406])).transpose(2, 0, 1)[None].astype(np.float32)
    out = sess.run(None, {name: x})[0][0, 0]
    out = (out - out.min()) / (out.max() - out.min() + 1e-8)
    return np.asarray(Image.fromarray((out * 255).astype(np.uint8)).resize((w, h), Image.LANCZOS), dtype=np.float32) / 255

frames = [Image.open(f'{tmp}/{f}').convert('RGB') for f in files]
mattes = [matte(f) for f in frames]
union = np.any([m > 0.1 for m in mattes], axis=0)
ys, xs = np.where(union)
pad = 12
x0, x1 = max(0, xs.min() - pad), min(union.shape[1], xs.max() + pad)
y0, y1 = max(0, ys.min() - pad), min(union.shape[0], ys.max() + pad)
W, H = (x1 - x0) // 2 * 2, (y1 - y0) // 2 * 2
order = list(range(len(frames))) + list(range(len(frames) - 2, LOOP_FROM, -1))
out_dir = tempfile.mkdtemp()
for k, i in enumerate(order):
    a = 0.25 * mattes[max(0, i - 1)] + 0.5 * mattes[i] + 0.25 * mattes[min(len(mattes) - 1, i + 1)]
    a = np.clip((a[y0:y0 + H, x0:x0 + W] - 0.1) / 0.8, 0, 1)
    rgb = np.asarray(frames[i], dtype=np.float32)[y0:y0 + H, x0:x0 + W]
    col = rgb * a[..., None] + FILL * (1 - a[..., None])
    canvas = np.zeros((H * 2 + GAP, W, 3), dtype=np.uint8)
    canvas[:H] = np.clip(col, 0, 255).astype(np.uint8)
    canvas[H + GAP:] = (a[..., None] * 255).astype(np.uint8)
    Image.fromarray(canvas).save(f'{out_dir}/{k:04d}.png')

dst = os.path.join(os.path.dirname(__file__), '..', 'src', 'assets', 'video')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '24', '-i', f'{out_dir}/%04d.png', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
                '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', f'{dst}/noor-hero.mp4'], check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '24', '-i', f'{out_dir}/%04d.png', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '34',
                '-row-mt', '1', '-pix_fmt', 'yuv420p', '-an', f'{dst}/noor-hero.webm'], check=True)
feet = ys.max() - y0
print(f'width: {W}, colorHeight: {H}, alphaOffset: {H + GAP}, totalHeight: {H * 2 + GAP},')
print(f'feetPad: {H - feet} / {H}, loopStart: {LOOP_FROM} / 24, loopEnd: {len(order) / 24 - 0.05:.2f}')
