import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

/**
 * Plays a "stacked alpha" video (colour on top, greyscale matte below) with a transparent
 * background, using a tiny WebGL2 shader. Renders only while visible.
 * Falls back to the `fallback` image if WebGL2 or the video isn't available.
 */
const VS = `#version 300 es
in vec2 aPos; out vec2 vUV;
void main(){ vUV = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;
const FS = `#version 300 es
precision highp float;
in vec2 vUV;
uniform sampler2D uVid; uniform float uSplit, uAlphaOff;
out vec4 o;
void main(){
  float v = 1.0 - vUV.y;
  vec3 col = texture(uVid, vec2(vUV.x, v * uSplit)).rgb;
  float a = smoothstep(0.06, 0.9, texture(uVid, vec2(vUV.x, uAlphaOff + v * uSplit)).r);
  o = vec4(col * a, a);
}`;

const AlphaVideo = forwardRef(function AlphaVideo({ webm, mp4, meta, label, className = '', reducedMotion, onFail }, ref) {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  useImperativeHandle(ref, () => ({
    replay: () => {
      const v = videoRef.current;
      if (!v) return;
      v.currentTime = 0;
      v.play().catch(() => {});
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) {
      onFail?.();
      return undefined;
    }
    const sh = (t, src) => {
      const s = gl.createShader(t);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS));
    gl.bindAttribLocation(p, 0, 'aPos');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      onFail?.();
      return undefined;
    }
    gl.useProgram(p);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1f(gl.getUniformLocation(p, 'uSplit'), meta.colorHeight / meta.totalHeight);
    gl.uniform1f(gl.getUniformLocation(p, 'uAlphaOff'), meta.alphaOffset / meta.totalHeight);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    let has = false;
    let lastT = -1;
    const draw = () => {
      if (video.readyState >= 2 && video.currentTime !== lastT) {
        lastT = video.currentTime;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
        has = true;
      }
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (has) gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    let raf = 0;
    let visible = false;
    const loop = () => {
      if (meta.loopEnd && video.currentTime >= meta.loopEnd) video.currentTime = meta.loopStart || 0;
      draw();
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (reducedMotion || raf || !visible || document.hidden) return;
      video.play().catch(() => {});
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      video.pause();
    };
    const onData = () => draw();
    video.addEventListener('loadeddata', onData);
    video.addEventListener('seeked', onData);
    video.addEventListener('error', () => onFail?.());
    if (reducedMotion) {
      const still = () => (video.currentTime = meta.stillAt || 0);
      if (video.readyState >= 1) still();
      else video.addEventListener('loadedmetadata', still, { once: true });
    }
    size();
    const ro = new ResizeObserver(() => {
      size();
      draw();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    }, { rootMargin: '100px 0px' });
    io.observe(canvas);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      video.removeEventListener('loadeddata', onData);
      video.removeEventListener('seeked', onData);
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(p);
    };
  }, [meta, reducedMotion, onFail]);

  return (
    <div className={`alpha-video ${className}`} style={{ aspectRatio: `${meta.width} / ${meta.colorHeight}` }}>
      <video ref={videoRef} className="hero-video-src" muted playsInline loop={!meta.loopEnd} preload="metadata" crossOrigin="anonymous" aria-hidden="true" tabIndex={-1}>
        {webm ? <source src={webm} type="video/webm" /> : null}
        {mp4 ? <source src={mp4} type="video/mp4" /> : null}
      </video>
      <canvas ref={canvasRef} role="img" aria-label={label} />
    </div>
  );
});

export default AlphaVideo;
