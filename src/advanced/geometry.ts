import type { Patch, Vec } from '../math';
import { heightAt, mix, spherical, cylindrical, toWorld, TAU, type Region } from './model';
export interface BoundaryPatch extends Patch { id: string; label: string; color: string; edges: Vec[][] }
export function regionGeometry(region: Region, n=48): BoundaryPatch[] {
 if(!Number.isInteger(n)||n<3)throw new Error('Mesh resolution must be an integer of at least 3');
 const patches: BoundaryPatch[]=[];
 const add=(id:string,label:string,color:string,fn:(a:number,b:number)=>Vec)=>{
  const vertices:Vec[]=[], indices:number[]=[];
  for(let i=0;i<=n;i++)for(let j=0;j<=n;j++)vertices.push(toWorld(region.frame,fn(i/n,j/n)));
  for(let i=0;i<n;i++)for(let j=0;j<n;j++){const a=i*(n+1)+j,b=a+n+1;indices.push(a,b,a+1,b,b+1,a+1);}
  const edges=[Array.from({length:n+1},(_,i)=>vertices[i]),Array.from({length:n+1},(_,i)=>vertices[n*(n+1)+i]),Array.from({length:n+1},(_,i)=>vertices[i*(n+1)]),Array.from({length:n+1},(_,i)=>vertices[i*(n+1)+n])];
  patches.push({id,label,color,vertices,indices,edges});
 };
 const top='#ad94fa',bottom='#60bca9',side='#e8ac78';
 if(region.model==='spherical'){
  const {rho,theta,phi}=region;
  add('outer',region.classification==='solid'?'Outer spherical boundary':'Spherical surface',top,(a,b)=>spherical(rho[1],mix(theta,a),mix(phi,b)));
  if(region.classification==='solid'){
   if(rho[0]>0)add('inner','Inner spherical boundary',bottom,(a,b)=>spherical(rho[0],mix(theta,a),mix(phi,b)));
   for(const [i,p] of phi.entries())if(p>1e-10&&p<Math.PI-1e-10)add(`phi-${i}`,`Polar boundary φ = ${+(p/Math.PI).toFixed(3)}π`,side,(a,b)=>spherical(mix(rho,b),mix(theta,a),p));
   if(theta[1]-theta[0]<TAU-1e-10)for(const [i,t] of theta.entries())add(`theta-${i}`,`Angular cut ${i+1}`,'#83b4ec',(a,b)=>spherical(mix(rho,a),t,mix(phi,b)));
  }
 }else{
  const {radial,theta,lower,upper}=region;
  const cap=(which:'top'|'bottom')=>add(which,region.classification==='surface'?'Restricted curved surface':which==='top'?'Upper boundary':'Lower boundary',which==='top'?top:bottom,(a,b)=>{const r=mix(radial,b),t=mix(theta,a);return cylindrical(r,t,heightAt(which==='top'?upper:lower,r,t));});
  const wall=(r:number,id:string,label:string)=>add(id,label,side,(a,b)=>{const t=mix(theta,a);return cylindrical(r,t,mix([heightAt(lower,r,t),heightAt(upper,r,t)],b));});
  if(region.classification==='surface'){if(region.patch==='outer')wall(radial[1],'outer','Restricted lateral surface');else cap('top');}
  else{
   cap('top');cap('bottom');
   // Omit a collapsed wall when curved top and bottom meet at the domain boundary.
   for(const [i,r] of radial.entries())if(r>0&&[0,.25,.5,.75,1].some(t=>heightAt(upper,r,mix(theta,t))-heightAt(lower,r,mix(theta,t))>1e-10))wall(r,i?'outer':'inner',i?'Outer radial boundary':'Inner radial boundary');
   if(theta[1]-theta[0]<TAU-1e-10)for(const [i,t] of theta.entries())add(`theta-${i}`,`Angular cut ${i+1}`,'#83b4ec',(a,b)=>{const r=mix(radial,a);return cylindrical(r,t,mix([heightAt(lower,r,t),heightAt(upper,r,t)],b));});
  }
 }
 return patches;
}
