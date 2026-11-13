import { describe,it,expect } from 'vitest';
import katex from 'katex';
import { availableFamilies, generateRegion } from './generate';
import { regionGeometry } from './geometry';
import { contains,cylindrical,spherical,toLocal,toWorld,heightAt,validate,inAngle,families,TAU,height,type Difficulty,type Region } from './model';
import { constraints,frameEquation,regionEquation,regionExplanation,interpretation } from './display';
import { equivalent,gradeAdvanced,makeQuestion } from './question';
const seeded=(s:number)=>()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
describe('phase 2: composite and coordinate regions',()=>{
 for(const family of families)it(`${family}: valid, nonempty and accurately bounded`,()=>{
  const random=seeded(346);
  for(const level of ['Intermediate','Hard','Exam Challenge'] as Difficulty[])for(let trial=0;trial<6;trial++){
   const region=generateRegion(family,level,random);expect(()=>validate(region)).not.toThrow();
   const patches=regionGeometry(region,9);expect(patches.length).toBeGreaterThan(0);const interior=region.model==='radial'?cylindrical((region.radial[0]+region.radial[1])/2,(region.theta[0]+region.theta[1])/2,(heightAt(region.lower,(region.radial[0]+region.radial[1])/2,(region.theta[0]+region.theta[1])/2)+heightAt(region.upper,(region.radial[0]+region.radial[1])/2,(region.theta[0]+region.theta[1])/2))/2):spherical((region.rho[0]+region.rho[1])/2,(region.theta[0]+region.theta[1])/2,(region.phi[0]+region.phi[1])/2);
   if(region.classification==='solid')expect(contains(region,toWorld(region.frame,interior))).toBe(true);
   for(const patch of patches)for(const p of patch.vertices){expect(p.every(Number.isFinite)).toBe(true);expect(contains(region,p,1e-6)).toBe(true);const [u,v,w]=toLocal(region.frame,p),r=Math.hypot(u,v),t=Math.atan2(v,u);if(region.model==='radial'){if(patch.id==='top')expect(w).toBeCloseTo(heightAt(region.upper,r,t),7);if(patch.id==='bottom')expect(w).toBeCloseTo(heightAt(region.lower,r,t),7);if(patch.id==='outer')expect(r).toBeCloseTo(region.radial[1],7);}else if(patch.id==='outer')expect(Math.hypot(u,v,w)).toBeCloseTo(region.rho[1],7);}
   expect(()=>katex.renderToString(regionEquation(region),{throwOnError:true})).not.toThrow();const frame=frameEquation(region);if(frame)expect(()=>katex.renderToString(frame,{throwOnError:true})).not.toThrow();
   expect(regionExplanation(region).at(-1)).toContain(interpretation(region));expect(constraints(region).every(c=>c.reason.length>15)).toBe(true);
  }
 });
 it('converts cylindrical and spherical coordinates with polar φ down from +z',()=>{expect(cylindrical(2,Math.PI/2,3)[1]).toBeCloseTo(2);expect(spherical(4,0,0)).toEqual([0,0,4]);expect(spherical(4,Math.PI/2,Math.PI/2)[1]).toBeCloseTo(4);expect(spherical(4,0,Math.PI)[2]).toBeCloseTo(-4);});
 it('handles angular intervals crossing 2π, endpoints and negative starts',()=>{expect(inAngle(.1,[3*Math.PI/2,5*Math.PI/2])).toBe(true);expect(inAngle(Math.PI,[3*Math.PI/2,5*Math.PI/2])).toBe(false);expect(inAngle(-Math.PI/2,[3*Math.PI/2,TAU])).toBe(true);expect(inAngle(0,[-Math.PI/4,Math.PI/4])).toBe(true);});
 it('closes solids and leaves restricted surfaces uncapped',()=>{const surface=generateRegion('cylinderPatch');expect(regionGeometry(surface,8)).toHaveLength(1);const cylinder=generateRegion('cylinderSolid');expect(regionGeometry(cylinder,8).map(p=>p.id)).toEqual(['top','bottom','outer']);const lens=generateRegion('paraboloidLens');expect(regionGeometry(lens,8).map(p=>p.id)).toEqual(['top','bottom']);const wedge=generateRegion('sphericalWedge');expect(regionGeometry(wedge,8).map(p=>p.id)).toEqual(['outer','theta-0','theta-1']);});
 it('curved boundaries meet at the actual intersection circle',()=>{for(const family of ['paraboloidLens','sphereCap','paraboloidSolid'] as const){const r=generateRegion(family);if(r.model!=='radial')throw Error();for(const t of [0,.7,Math.PI])expect(heightAt(r.lower,r.radial[1],t)).toBeCloseTo(heightAt(r.upper,r.radial[1],t),7);}});
 it('rejects invalid or degenerate input and handles thin, translated sectors',()=>{const r=generateRegion('cylindricalSector') as Extract<Region,{model:'radial'}>;expect(()=>validate({...r,radial:[2,2]})).toThrow();expect(()=>validate({...r,theta:[0,0]})).toThrow();expect(()=>validate({...r,lower:height(100),upper:height(1)})).toThrow();expect(()=>validate({...r,theta:[0,TAU+1]})).toThrow();const thin={...r,frame:{center:[-3,2,-1] as [number,number,number],axis:0 as const},radial:[2,2.0001] as [number,number],theta:[TAU-.0001,TAU+.0001] as [number,number],lower:height(2),upper:height(2.0001)};expect(()=>validate(thin)).not.toThrow();for(const patch of regionGeometry(thin,5))for(const p of patch.vertices)expect(contains(thin,p,1e-7)).toBe(true);});
 it('difficulty changes mathematical structure',()=>{expect(availableFamilies('Intermediate')).not.toContain('slopedCylinder');expect(availableFamilies('Exam Challenge')).toContain('sphereCylinder');expect(availableFamilies('Hard')).toContain('paraboloidLens');});
});
describe('phase 3: unique interpretation and reverse-identification choices',()=>{
 for(const type of ['identify','bounds'] as const)it(`${type} contains exactly one correct choice with distinct descriptions`,()=>{const random=seeded(53);for(const family of families)for(let i=0;i<5;i++){const q=makeQuestion('Exam Challenge',type,random,family);expect(q.choices.filter(c=>gradeAdvanced(q,c.id))).toHaveLength(1);expect(gradeAdvanced(q,q.correctId)).toBe(true);expect(gradeAdvanced(q,'missing')).toBe(false);expect(new Set(q.choices.map(c=>type==='identify'?interpretation(c.region):regionEquation(c.region))).size).toBe(4);for(const c of q.choices){expect(()=>validate(c.region)).not.toThrow();expect(()=>katex.renderToString(regionEquation(c.region),{throwOnError:true})).not.toThrow();}}});
 it('treats the same unwrapped angular interval as equivalent',()=>{const a=generateRegion('cylindricalSector'),b=structuredClone(a);b.theta=[a.theta[0]+TAU,a.theta[1]+TAU];expect(equivalent(a,b)).toBe(true);});
});
