import { describe,it,expect } from 'vitest';
import { accepts,axes,equation,generate,geometry,kinds,local,names,residual,terms,world,type Kind,type Surface } from './math';
import { empty,record,weakest } from './progress';
function rng(seed:number){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
describe('procedural surfaces',()=>{
 for(const kind of kinds)it(`${names[kind]} has valid parameters, matching equations and accurate vertices`,()=>{
  const r=rng(31);for(let i=0;i<25;i++){
   const s=generate(kind,true,r);expect(s.kind).toBe(kind);expect(s.scale.every(n=>n>0)).toBe(true);expect(equation(s)).not.toMatch(/NaN|undefined|Infinity/);
   if(kind==='sphere')expect(new Set(s.scale).size).toBe(1);
   if(kind==='ellipsoid'||kind==='ellipticCylinder')expect(s.scale[0]).not.toBe(s.scale[1]);
   if(kind==='circularCylinder')expect(s.scale[0]).toBe(s.scale[1]);
   const patches=geometry(s,10);expect(patches.length).toBe(['twoSheet','cone','hyperbolicCylinder'].includes(kind)?2:1);
   for(const patch of patches){expect(patch.indices.length).toBe(600);expect(Math.max(...patch.indices)).toBeLessThan(patch.vertices.length);for(const p of patch.vertices){expect(p.every(Number.isFinite)).toBe(true);expect(Math.abs(residual(s,p))).toBeLessThan(1e-10);const polynomial=terms(s).reduce((sum,t)=>sum+t.c*p.reduce((a,x,j)=>a*x**t.p[j],1),0);expect(Math.abs(polynomial-residual(s,p))).toBeLessThan(1e-9);}}
  }
 });
 it('axis transformations round trip and align the principal direction',()=>{for(const axis of [0,1,2] as const){const s:Surface={kind:'cone',axis,scale:[2,3,4],center:[-2,3,1],sign:1,expanded:false};expect(local(s,world(s,[1,2,3]))).toEqual([1,2,3]);const p=world(s,[0,0,1]);expect(p[axis]-s.center[axis]).toBe(4);expect(new Set(axes(s)).size).toBe(3);}});
 it('two sheets lie on opposite sides of the translated axis',()=>{const s=generate('twoSheet',true,rng(2));const g=geometry(s,8);expect(g[0].vertices.every(p=>local(s,p)[2]<=-1+1e-9)).toBe(true);expect(g[1].vertices.every(p=>local(s,p)[2]>=1-1e-9)).toBe(true);});
 it('expanded display represents the same polynomial',()=>{for(const k of kinds){const s=generate(k,true,rng(89));s.expanded=true;const latex=equation(s);const js=latex.replace(/=0$/,'').replace(/\^\{2\}/g,'**2').replace(/(\d)([xyz])/g,'$1*$2').replace(/([xyz])([xyz])/g,'$1*$2');const evaluate=new Function('x','y','z',`return ${js}`) as (x:number,y:number,z:number)=>number;const factor=s.scale.reduce((a,b)=>a*b*b,1);for(const p of [[1,2,3],[-2,.3,1],[0,0,0]] as [number,number,number][])expect(evaluate(...p)).toBeCloseTo(residual(s,p)*factor,6);}});
});
describe('grading and progress',()=>{
 it('recognizes equivalent saddle labels and rejects unrelated surfaces',()=>{expect(accepts('product','saddle')).toBe(true);expect(accepts('saddle','product')).toBe(true);expect(accepts('sphere','ellipsoid')).toBe(false);});
 it('records scores, streaks, history, time, and weakest topic',()=>{const p=(kind:Kind)=>({id:kind,surface:generate(kind),options:kinds.slice(0,4)});let state=record(empty(),p('sphere'),'sphere',3,'Quiz');state=record(state,p('plane'),'plane',5,'Challenge');state=record(state,p('sphere'),'cone',6,'Quiz');expect(state.total).toBe(3);expect(state.correct).toBe(2);expect(state.streak).toBe(0);expect(state.best).toBe(2);expect(state.attempts).toHaveLength(3);expect(state.attempts[0].seconds).toBe(6);expect(state.byType.sphere).toEqual({total:2,correct:1});expect(weakest(state)).toBe('sphere');});
});
