import { describe, it, expect } from 'vitest';
import { generateRegion } from './generate';
import { regionGeometry } from './geometry';
import { contains, restrictedFamilies, toLocal, type Difficulty } from './model';
describe('phase 1: restricted surface patches',()=>{
 for(const family of restrictedFamilies)it(`${family} obeys its equation and restrictions without adding caps`,()=>{
  for(const difficulty of ['Intermediate','Hard','Exam Challenge'] as Difficulty[])for(let i=0;i<12;i++){
   const region=generateRegion(family,difficulty),patches=regionGeometry(region,10);
   expect(region.classification).toBe('surface');expect(patches).toHaveLength(1);
   for(const p of patches[0].vertices){expect(p.every(Number.isFinite)).toBe(true);expect(contains(region,p,1e-7)).toBe(true);const [u,v,w]=toLocal(region.frame,p),r=Math.hypot(u,v);if(family==='cylinderPatch'&&region.model==='radial')expect(r).toBeCloseTo(region.radial[1],8);if(family==='hemispherePatch'&&region.model==='spherical'){expect(Math.hypot(r,w)).toBeCloseTo(region.rho[1],8);expect(w).toBeGreaterThanOrEqual(-1e-8);}}
  }
 });
});
