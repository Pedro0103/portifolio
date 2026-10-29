import * as THREE from 'three';
const V = `attribute vec3 t1,t2,t3;attribute vec4 aR;uniform float uT,uP,uPR,uIn;uniform vec3 uM,uF;uniform float uSafe,uR,uK;varying float vA;varying vec3 vC;
void main(){
 float a=smoothstep(0.,1.,clamp(uP,0.,1.)),b=smoothstep(0.,1.,clamp(uP-1.,0.,1.)),c=smoothstep(0.,1.,clamp(uP-2.,0.,1.));
 vec3 p=mix(mix(mix(position,t1,a),t2,b),t3,c);
 p+=sin(vec3(uT*.4+aR.x*6.,uT*.5+aR.y*6.,uT*.3+aR.z*6.))*.12;
 vec3 d=p-uM;p+=normalize(d+1e-4)*smoothstep(2.2,0.,length(d))*1.1;
 vec3 tf=uF-p;p+=tf*smoothstep(uR,0.,length(tf))*uK;p*=mix(.2,1.,uIn);
 vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
 gl_PointSize=(1.1+aR.w*aR.w*aR.w*3.4)*uPR*(10./-mv.z);
 vC=mix(mix(vec3(.54,.50,.75),vec3(.50,.66,.77),aR.y),vec3(.9,.92,.96),step(.94,aR.w));
 vA=(.35+.65*aR.z)*uIn*clamp(1.-(-mv.z-12.)/20.,0.,1.);
 vec2 nd=gl_Position.xy/gl_Position.w;vA*=mix(1.,mix(.25,1.,smoothstep(-.75,.05,nd.x)),uSafe);}`;
const F = `varying float vA;varying vec3 vC;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;float s=smoothstep(.5,0.,d);gl_FragColor=vec4(vC,vA*s*s*.95);}`;
const r = () => Math.random();
function sphere(o){const u=r()*2-1,t=r()*6.2832,s=Math.sqrt(1-u*u);o.set(3*s*Math.cos(t),3*u,3*s*Math.sin(t));}
function rings(o){const k=Math.floor(r()*3),t=r()*6.2832,R=2.4+k*.9,x=R*Math.cos(t),y=(r()-.5)*.08,z=R*Math.sin(t),a=k*1.05,ca=Math.cos(a),sa=Math.sin(a);o.set(x,y*ca-z*sa*0+z*0,z*ca+y*sa);o.y=y+x*sa*.5;}
function lattice(o){const g=v=>Math.round(v*.9)/.9;o.set((r()-.5)*7,(r()-.5)*7,(r()-.5)*7);const k=Math.floor(r()*3);for(let i=0;i<3;i++)if(i!==k)o.setComponent(i,g(o.getComponent(i)));}
export function createParticles(count, pr) {
  const g = new THREE.BufferGeometry(), tmp = new THREE.Vector3();
  const A = { position: new Float32Array(count*3), t1: new Float32Array(count*3), t2: new Float32Array(count*3), t3: new Float32Array(count*3), aR: new Float32Array(count*4) };
  for (let i = 0; i < count; i++) {
    A.position.set([(r()-.5)*16, (r()-.5)*10, (r()-.5)*10], i*3);
    sphere(tmp); A.t1.set(tmp.toArray(), i*3);
    rings(tmp); A.t2.set(tmp.toArray(), i*3);
    lattice(tmp); A.t3.set(tmp.toArray(), i*3);
    A.aR.set([r(), r(), r(), r()], i*4);
  }
  for (const k in A) g.setAttribute(k, new THREE.BufferAttribute(A[k], k === 'aR' ? 4 : 3));
  const m = new THREE.ShaderMaterial({ vertexShader: V, fragmentShader: F, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uT: { value: 0 }, uP: { value: 0 }, uPR: { value: pr }, uIn: { value: 0 }, uM: { value: new THREE.Vector3(99, 99, 0) }, uF: { value: new THREE.Vector3() }, uSafe: { value: 1 }, uR: { value: 7 }, uK: { value: 0.16 } } });
  const points = new THREE.Points(g, m); points.frustumCulled = false;
  return { points, uniforms: m.uniforms };
}
