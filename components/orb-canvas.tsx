"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main(){
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
varying vec2 v_uv;
uniform vec2 u_res;
uniform float u_time;
uniform float u_listen;
uniform vec3 u_bg, u_c1, u_c2, u_c3;
uniform float u_radius;
uniform float u_aspect;

vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);
  vec2 i1; i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
  vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;
  i=mod289(i);
  vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
  m=m*m;m=m*m;
  vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;
  vec3 ox=floor(x+0.5);vec3 a0=x-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.0*dot(m,g);
}

float fbm(vec2 p){
  float v=0.0; float a=0.5;
  for(int i=0;i<5;i++){v+=a*snoise(p);p=p*2.02;a*=0.5;}
  return v;
}

void main(){
  vec2 uv=v_uv;
  vec2 p=(uv-0.5);
  p.x*=u_aspect;
  float t=u_time*0.18;

  float bgGlow = smoothstep(0.9, 0.0, length(p));
  vec3 col = mix(u_bg, u_bg + vec3(0.012,0.008,0.000), bgGlow*0.5);

  vec2 op = p;
  float r = length(op);
  float listen = u_listen;
  float pulse = 1.0 + 0.02*sin(t*1.6) + listen*0.04;
  float radius = u_radius * pulse;

  vec2 q = op*2.2 + vec2(t*0.6, -t*0.4);
  float n = fbm(q);
  vec2 q2 = op*3.4 + vec2(n*1.2 - t*0.3, n*0.8 + t*0.2);
  float n2 = fbm(q2);

  float band = 0.5 + 0.5*sin(n2*2.4 + t*0.8 + op.y*4.0);
  vec3 orbCol = mix(u_c2, u_c1, smoothstep(0.2,0.85,band));
  orbCol = mix(orbCol, u_c3, smoothstep(0.65,1.0,band)*0.5);

  float edge = smoothstep(radius, radius - 0.18, r);
  float halo = smoothstep(radius+0.16, radius, r) * 0.18;
  float listenGlow = listen * smoothstep(radius+0.08, radius-0.04, r) * 0.16;

  vec3 final = mix(col, orbCol, edge);
  final += orbCol * (halo + listenGlow);

  float depth = smoothstep(radius, radius*0.2, r);
  final = mix(final, final*0.92, depth*0.25);

  gl_FragColor = vec4(final, 1.0);
}
`;

export type OrbHandle = {
  setListen: (on: boolean) => void;
};

type Props = {
  className?: string;
  radius?: number;
  palette?: {
    bg: [number, number, number];
    c1: [number, number, number];
    c2: [number, number, number];
    c3: [number, number, number];
  };
};

const defaultPalette = {
  bg: [0.965, 0.953, 0.925] as [number, number, number],
  c1: [1.0, 0.91, 0.8] as [number, number, number],
  c2: [0.91, 0.5, 0.38] as [number, number, number],
  c3: [0.78, 0.42, 0.38] as [number, number, number],
};

export const OrbCanvas = forwardRef<OrbHandle, Props>(function OrbCanvas(
  { className, radius = 0.3, palette = defaultPalette },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const listenTargetRef = useRef(0);

  useImperativeHandle(ref, () => ({
    setListen(on: boolean) {
      listenTargetRef.current = on ? 1 : 0;
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      antialias: true,
      premultipliedAlpha: false,
      alpha: false,
    });
    if (!gl) return;

    function compile(type: number, src: string) {
      const s = gl!.createShader(type);
      if (!s) return null;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        console.error(gl!.getShaderInfoLog(s));
        return null;
      }
      return s;
    }

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u_res = gl.getUniformLocation(prog, "u_res");
    const u_time = gl.getUniformLocation(prog, "u_time");
    const u_listen = gl.getUniformLocation(prog, "u_listen");
    const u_bg = gl.getUniformLocation(prog, "u_bg");
    const u_c1 = gl.getUniformLocation(prog, "u_c1");
    const u_c2 = gl.getUniformLocation(prog, "u_c2");
    const u_c3 = gl.getUniformLocation(prog, "u_c3");
    const u_radius = gl.getUniformLocation(prog, "u_radius");
    const u_aspect = gl.getUniformLocation(prog, "u_aspect");

    const pal = {
      bg: new Float32Array(palette.bg),
      c1: new Float32Array(palette.c1),
      c2: new Float32Array(palette.c2),
      c3: new Float32Array(palette.c3),
    };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas!.getBoundingClientRect();
      const w = Math.max(1, Math.round(r.width * dpr));
      const h = Math.max(1, Math.round(r.height * dpr));
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
        gl!.viewport(0, 0, w, h);
      }
    }

    let listen = 0;
    const start = performance.now();
    let raf = 0;
    let mounted = true;

    function frame(now: number) {
      if (!mounted) return;
      resize();
      listen += (listenTargetRef.current - listen) * 0.04;
      gl!.useProgram(prog);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, buf);
      gl!.enableVertexAttribArray(aPos);
      gl!.vertexAttribPointer(aPos, 2, gl!.FLOAT, false, 0, 0);
      gl!.uniform2f(u_res, canvas!.width, canvas!.height);
      gl!.uniform1f(u_time, (now - start) * 0.001);
      gl!.uniform1f(u_listen, listen);
      gl!.uniform3fv(u_bg, pal.bg);
      gl!.uniform3fv(u_c1, pal.c1);
      gl!.uniform3fv(u_c2, pal.c2);
      gl!.uniform3fv(u_c3, pal.c3);
      gl!.uniform1f(u_radius, radius);
      gl!.uniform1f(u_aspect, canvas!.width / canvas!.height);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    const onResize = () => resize();
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [palette, radius]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
});
