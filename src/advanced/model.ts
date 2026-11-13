import type { Vec } from '../math';

export type Difficulty = 'Intermediate' | 'Hard' | 'Exam Challenge';
export const categories = ['Restricted surfaces', 'Composite solids', 'Cylindrical regions', 'Spherical regions', 'Reverse identification'] as const;
export type Category = typeof categories[number];
export const restrictedFamilies = ['cylinderPatch', 'hemispherePatch', 'paraboloidPatch', 'conePatch'] as const;
export const compositeFamilies = ['paraboloidSolid', 'cylinderSolid', 'paraboloidLens', 'sphereCap', 'hemisphereSolid', 'sphereCylinder', 'slopedCylinder'] as const;
export const cylindricalFamilies = ['cylindricalSector', 'annularCylinder', 'coneCap', 'coneBand', 'paraboloidBand'] as const;
export const sphericalFamilies = ['sphericalHemisphere', 'sphericalWedge', 'sphericalShell', 'sphericalSector'] as const;
export type Family = typeof restrictedFamilies[number] | typeof compositeFamilies[number] | typeof cylindricalFamilies[number] | typeof sphericalFamilies[number];
export const families: Family[] = [...restrictedFamilies, ...compositeFamilies, ...cylindricalFamilies, ...sphericalFamilies];
export interface Frame { center: Vec; axis: 0 | 1 | 2 }
export type Interval = [number, number];
// An explicitly structured height law; never reconstruct geometry from formatted equations.
export interface Height { constant: number; radial: number; quadratic: number; slope: number; sphere: number; sphereSign: number }
export const height = (constant = 0, values: Partial<Height> = {}): Height => ({ constant, radial: 0, quadratic: 0, slope: 0, sphere: 0, sphereSign: 0, ...values });
export interface BaseRegion { family: Family; classification: 'surface' | 'solid'; coordinates: 'Cartesian' | 'Cylindrical' | 'Spherical'; frame: Frame; theta: Interval }
export interface RadialRegion extends BaseRegion { model: 'radial'; radial: Interval; lower: Height; upper: Height; patch?: 'outer' | 'top' }
export interface SphericalRegion extends BaseRegion { model: 'spherical'; rho: Interval; phi: Interval }
export type Region = RadialRegion | SphericalRegion;
export const TAU = Math.PI * 2;
export const EPS = 1e-8;
export const mix = ([a,b]: Interval, t: number) => a + (b-a)*t;
export function toWorld(frame: Frame, p: Vec): Vec { const out = [...frame.center] as Vec; [ (frame.axis+1)%3, (frame.axis+2)%3, frame.axis ].forEach((a,i) => out[a] += p[i]); return out; }
export function toLocal(frame: Frame, p: Vec): Vec { return [(frame.axis+1)%3, (frame.axis+2)%3, frame.axis].map(a => p[a]-frame.center[a]) as Vec; }
export function cylindrical(r: number, theta: number, z: number): Vec { return [r*Math.cos(theta),r*Math.sin(theta),z]; }
// Calculus III convention: phi is the polar angle measured down from +w (+z in the standard frame).
export function spherical(rho: number, theta: number, phi: number): Vec { return cylindrical(rho*Math.sin(phi),theta,rho*Math.cos(phi)); }
export function heightAt(h: Height, r: number, theta: number): number { return h.constant+h.radial*r+h.quadratic*r*r+h.slope*r*Math.cos(theta)+h.sphereSign*Math.sqrt(Math.max(0,h.sphere*h.sphere-r*r)); }
export function inAngle(theta: number, interval: Interval, tolerance = EPS): boolean { const span=interval[1]-interval[0]; if(span>=TAU-tolerance)return true; const relative=((theta-interval[0])%TAU+TAU)%TAU; return relative<=span+tolerance || TAU-relative<=tolerance; }
export function contains(region: Region, point: Vec, tolerance = EPS): boolean {
 const [u,v,w]=toLocal(region.frame,point), r=Math.hypot(u,v), theta=Math.atan2(v,u);
 if(r>tolerance&&!inAngle(theta,region.theta,tolerance))return false;
 if(region.model==='spherical') { const rho=Math.hypot(r,w),phi=rho>tolerance?Math.acos(Math.max(-1,Math.min(1,w/rho))):mix(region.phi,.5);return rho>=region.rho[0]-tolerance&&rho<=region.rho[1]+tolerance&&phi>=region.phi[0]-tolerance&&phi<=region.phi[1]+tolerance&&(region.classification==='solid'||Math.abs(rho-region.rho[1])<=tolerance); }
 if(r<region.radial[0]-tolerance||r>region.radial[1]+tolerance)return false;
 const lo=heightAt(region.lower,r,theta), hi=heightAt(region.upper,r,theta);
 if(w<lo-tolerance||w>hi+tolerance)return false;
 if(region.classification==='solid')return true;
 return region.patch==='outer'?Math.abs(r-region.radial[1])<=tolerance:Math.abs(w-hi)<=tolerance;
}
export function validate(region: Region): void {
 const finite=(v:number)=>Number.isFinite(v); const interval=(v:Interval)=>v.every(finite)&&v[1]>v[0];
 if(!region.frame.center.every(finite)||![0,1,2].includes(region.frame.axis)||!interval(region.theta)||region.theta[1]-region.theta[0]>TAU+EPS)throw new Error('Invalid frame or angular interval');
 if(region.model==='spherical'){if(!interval(region.rho)||region.rho[0]<0||!interval(region.phi)||region.phi[0]<0||region.phi[1]>Math.PI)throw new Error('Invalid spherical bounds');return;}
 if(!interval(region.radial)||region.radial[0]<0)throw new Error('Invalid radial bounds');
 for(const h of [region.lower,region.upper])if(!Object.values(h).every(finite)||(h.sphereSign!==0&&h.sphere<region.radial[1]-EPS))throw new Error('Invalid height law');
 let positive=false;
 for(let i=0;i<=24;i++)for(let j=0;j<=24;j++){const r=mix(region.radial,i/24),theta=mix(region.theta,j/24),gap=heightAt(region.upper,r,theta)-heightAt(region.lower,r,theta);if(gap < -EPS)throw new Error('Contradictory height bounds');if(gap>0)positive=true;}
 if(!positive)throw new Error('Empty or degenerate region');
}
