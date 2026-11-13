import { heightAt, TAU, type Height, type Interval, type Region } from './model';
export const number = (v:number):string => Number.isInteger(v)?String(v):String(+v.toFixed(5));
export function angle(v:number):string { const quarters=Math.round(v/Math.PI*4);if(Math.abs(v-quarters*Math.PI/4)>1e-9)return number(v);if(!quarters)return '0';const gcd=(a:number,b:number):number=>b?gcd(b,a%b):a;const g=gcd(Math.abs(quarters),4),n=quarters/g,d=4/g;return d===1?`${n===1?'':n===-1?'-':n}\\pi`:`\\frac{${n===1?'':n===-1?'-':n}\\pi}{${d}}`; }
function variables(region:Region):[string,string,string] {return isStandard(region)?['x','y','z']:['u','v','w'];}
export function isStandard(region:Region){return region.frame.axis===2&&region.frame.center.every(v=>v===0);}
export function frameEquation(region:Region):string|undefined {if(isStandard(region))return;const axes=[(region.frame.axis+1)%3,(region.frame.axis+2)%3,region.frame.axis];return axes.map((a,i)=>`${'uvw'[i]}=${'xyz'[a]}${region.frame.center[a]?`${region.frame.center[a]>0?'-':'+'}${Math.abs(region.frame.center[a])}`:''}`).join(',\\quad ');}
function heightExpression(h:Height,region:Region):string {
 const [u,v]=variables(region),radial=region.coordinates==='Cartesian'?`\\sqrt{${u}^2+${v}^2}`:'r',square=region.coordinates==='Cartesian'?`(${u}^2+${v}^2)`:'r^2';
 const terms:[number,string][]=[[h.constant,''],[h.radial,radial],[h.quadratic,square],[h.slope,u],[h.sphereSign,`\\sqrt{${number(h.sphere*h.sphere)}-${square}}`]];
 const parts=terms.filter(([c])=>c!==0);return parts.map(([c,term],i)=>`${c<0?'-':i?'+':''}${Math.abs(c)===1&&term?'':number(Math.abs(c))}${term}`).join('')||'0';
}
export interface ConstraintLine { latex:string; reason:string }
export function constraints(region:Region):ConstraintLine[] {
 const [u,v,w]=variables(region),result:ConstraintLine[]=[],theta=region.theta;
 const angular=()=>{
  const span=theta[1]-theta[0],quarter=Math.round(theta[0]/(Math.PI/2)),aligned=Math.abs(theta[0]-quarter*Math.PI/2)<1e-9;
  if(region.coordinates==='Cartesian'&&span<TAU-1e-9&&aligned&&(Math.abs(span-Math.PI)<1e-9||Math.abs(span-Math.PI/2)<1e-9)){
   const k=((quarter%4)+4)%4;
   const signs=Math.abs(span-Math.PI)<1e-9?[[v,1],[u,-1],[v,-1],[u,1]][k]:undefined;
   const restrictions=signs?[signs]:[[u,k===0||k===3?1:-1],[v,k<2?1:-1]];
   for(const [variable,sign] of restrictions)result.push({latex:`${variable}${sign===1?'\\geq':'\\leq'}0`,reason:`This coordinate half-space clips the original shape. Together the coordinate signs keep ${Math.abs(span-Math.PI)<1e-9?'one half':'one quarter'} of its angular extent.`});
  }else if(region.coordinates!=='Cartesian'||span<TAU-1e-9)result.push({latex:`${angle(theta[0])}\\leq \\theta\\leq ${angle(theta[1])}`,reason:`The azimuth interval has width ${number(span/Math.PI)}π. It selects the angular portion shown; endpoints are included.`});
 };
 if(region.model==='spherical'){
  if(region.coordinates==='Spherical'){
   result.push({latex:region.classification==='surface'?`\\rho=${number(region.rho[1])}`:`${number(region.rho[0])}\\leq \\rho\\leq ${number(region.rho[1])}`,reason:region.classification==='surface'?'Fixed distance from the origin defines a surface.':'The radial interval includes every distance between the two bounds, so this is a solid region.'});
   result.push({latex:`${angle(region.phi[0])}\\leq \\phi\\leq ${angle(region.phi[1])}`,reason:'φ is measured DOWN from the positive z-axis. A fixed φ boundary is a cone, or a plane when φ = π/2.'});
  }else{
   result.push({latex:`${u}^2+${v}^2+${w}^2${region.classification==='surface'?'=':'\\leq '}${number(region.rho[1]**2)}`,reason:region.classification==='surface'?'The equality selects only the spherical surface.':'The inequality fills the sphere rather than selecting only its surface.'});
   if(region.rho[0]>0)result.push({latex:`${u}^2+${v}^2+${w}^2\\geq ${number(region.rho[0]**2)}`,reason:'The inner radius removes the central ball.'});
   result.push({latex:region.phi[0]===0&&region.phi[1]===Math.PI/2?`${w}\\geq 0`:`${angle(region.phi[0])}\\leq \\phi\\leq ${angle(region.phi[1])}`,reason:'The polar restriction keeps only the permitted part of the sphere.'});
  }
  angular();return result;
 }
 const {radial,lower,upper}=region,square=`${u}^2+${v}^2`,rSquared=(n:number)=>number(n*n);
 const sphereSolid=region.classification==='solid'&&(region.family==='sphereCap'||region.family==='sphereCylinder');
 if(sphereSolid){
  result.push({latex:`${square}+${w}^2\\leq ${number(upper.sphere**2)}`,reason:`Points lie inside a sphere of radius ${number(upper.sphere)} in the stated coordinate frame.`});
  result.push(region.family==='sphereCap'?{latex:`${w}\\geq ${number(lower.constant)}`,reason:'A plane clips off the lower part, leaving a spherical cap. The circular rim is the plane–sphere intersection.'}:{latex:`${square}\\leq ${rSquared(radial[1])}`,reason:'Only points also inside this cylinder survive. The two solids are intersected, not overlaid.'});
 }else if(region.classification==='surface'&&region.patch==='outer'){
  result.push({latex:region.coordinates==='Cylindrical'?`r=${number(radial[1])}`:`${square}=${rSquared(radial[1])}`,reason:`The equality fixes radius ${number(radial[1])}. It selects a lateral surface, without an interior or end caps.`});
  result.push({latex:`${heightExpression(lower,region)}\\leq ${w}\\leq ${heightExpression(upper,region)}`,reason:'The axial range clips the lateral surface at these heights.'});
 }else{
  result.push({latex:region.classification==='surface'?`${w}=${heightExpression(upper,region)}`:`${heightExpression(lower,region)}\\leq ${w}\\leq ${heightExpression(upper,region)}`,reason:region.classification==='surface'?'The equality selects just this curved patch. It does not fill the space underneath.':'Every point between the lower and upper height functions is included.'});
  const derived=region.classification==='solid'&&['paraboloidSolid','paraboloidLens'].includes(region.family);
  const axialClip=region.classification==='surface'&&region.patch==='top'&&region.coordinates==='Cartesian'&&(upper.radial>0||upper.quadratic>0)&&upper.slope===0;
  if(axialClip)result.push({latex:`${number(heightAt(upper,radial[0],0))}\\leq ${w}\\leq ${number(heightAt(upper,radial[1],0))}`,reason:'Two perpendicular coordinate planes clip the curved surface. The equality determines the radial extent; no planar caps are included.'});
  else if(!derived)result.push({latex:region.coordinates==='Cylindrical'?`${number(radial[0])}\\leq  r\\leq ${number(radial[1])}`:`${rSquared(radial[0])}\\leq ${square}\\leq ${rSquared(radial[1])}`,reason:radial[0]>0?'The inner and outer radii restrict the radial domain; the central portion is excluded.':'The radial bound restricts the domain to a disk.'});
 }
 angular();return result;
}
export function regionEquation(region:Region):string {return `\\begin{gathered}${constraints(region).map(c=>c.latex).join('\\\\[6pt]')}\\end{gathered}`;}
export function coordinateConvention(region:Region):string|undefined {
 const [u,v,w]=variables(region);
 if(region.coordinates==='Spherical')return `${u}=\\rho\\sin\\phi\\cos\\theta,\\quad ${v}=\\rho\\sin\\phi\\sin\\theta,\\quad ${w}=\\rho\\cos\\phi`;
 if(region.coordinates==='Cylindrical')return `${u}=r\\cos\\theta,\\quad ${v}=r\\sin\\theta`;
 if(region.theta[1]-region.theta[0]<TAU-1e-9){const [u,v]=variables(region);return `${u}=r\\cos\\theta,\\quad ${v}=r\\sin\\theta,\\quad r\\geq 0`;}
}
function angularDescription(theta:Interval){const fraction=(theta[1]-theta[0])/TAU;const size=Math.abs(fraction-1)<1e-9?'Full turn':Math.abs(fraction-.5)<1e-9?'Half-turn':Math.abs(fraction-.25)<1e-9?'Quarter-turn':`${number(fraction)} of a turn`;return `${size}, θ from ${number(theta[0]/Math.PI)}π to ${number(theta[1]/Math.PI)}π`;}
function heightName(h:Height):string {return h.sphereSign?'spherical boundary':h.quadratic?'paraboloid':h.radial?'cone':h.slope?'sloped plane':'plane';}
export function interpretation(region:Region):string {
 const solid=region.classification==='solid';let shape:string;
 if(region.model==='spherical'){
  const shell=solid&&region.rho[0]>0,phi=region.phi;
  shape=`${solid?'Solid':'Surface of a'} ${shell?'spherical shell':phi[0]===0&&phi[1]===Math.PI/2?'upper hemisphere':phi[0]===0&&phi[1]<Math.PI/2?'spherical sector inside a cone':'sphere or spherical wedge'}`;
  shape+=`; ${solid?'ρ between '+number(region.rho[0])+' and ': 'ρ = '}${number(region.rho[1])}, φ from ${number(phi[0]/Math.PI)}π to ${number(phi[1]/Math.PI)}π`;
 }else{
  const {lower:l,upper:h,radial}=region;
  if(!solid)shape=region.patch==='outer'?`Lateral cylinder surface only; radius ${number(radial[1])}, heights ${number(l.constant)} to ${number(h.constant)}`:`${heightName(h)} surface patch only; radii ${number(radial[0])} to ${number(radial[1])}`;
  else if(h.sphereSign&&l.sphereSign)shape=`Solid intersection of a sphere (radius ${number(h.sphere)}) and a cylinder (radius ${number(radial[1])})`;
  else if(h.sphereSign)shape=`Solid spherical cap; sphere radius ${number(h.sphere)}, above height ${number(l.constant)}`;
  else if(l.quadratic>0&&h.quadratic<0)shape=`Solid between upward and downward paraboloids; radial extent ${number(radial[1])}`;
  else if(h.quadratic<0)shape=`Solid under a downward paraboloid and above a plane; radial extent ${number(radial[1])}`;
  else if(h.slope)shape=`Solid cylinder clipped by a sloped plane; radius ${number(radial[1])}`;
  else if(l.radial||l.quadratic||h.radial||h.quadratic)shape=`Solid between a lower ${heightName(l)} and an upper ${heightName(h)}; radii ${number(radial[0])} to ${number(radial[1])}`;
  else shape=`${radial[0]>0?'Hollow cylindrical shell solid':'Solid circular cylinder'}; radii ${number(radial[0])} to ${number(radial[1])}, heights ${number(l.constant)} to ${number(h.constant)}`;
 }
 return `${shape}. ${angularDescription(region.theta)}. Frame center (${region.frame.center.join(', ')}), axis ${'xyz'[region.frame.axis]}.`;
}
export function regionExplanation(region:Region):string[] {
 const result=constraints(region).map((c,i)=>`${i+1}. ${c.reason}`);
 if(region.model==='radial'){
  const {lower:l,upper:h}=region;
  if(region.family==='paraboloidLens'&&region.classification==='solid')result.push(`Solve lower = upper: (${number(l.quadratic-h.quadratic)})r² = ${number(h.constant-l.constant)}. Thus the meeting circle has r = ${number(region.radial[1])}; outside it the height bounds would reverse.`);
  if(region.family==='paraboloidSolid'&&region.classification==='solid')result.push(`Nonnegative upper height requires r² ≤ ${number(h.constant)}. This determines the disk of radius ${number(region.radial[1])}; the two boundaries meet on its rim.`);
  if(region.family==='sphereCap'&&region.classification==='solid')result.push(`At the clipping plane, r² = ${number(h.sphere**2)} − ${number(l.constant**2)}. The intersection radius is ${number(region.radial[1])}.`);
  if(region.family==='slopedCylinder')result.push(`The smallest top height is ${number(h.constant-Math.abs(h.slope)*region.radial[1])}, above the bottom ${number(l.constant)}; the entire allowed angular disk has positive thickness.`);
  if(h.constant-l.constant>0&&h.radial===l.radial&&h.quadratic===l.quadratic&&(l.radial||l.quadratic))result.push(`Upper minus lower is ${number(h.constant-l.constant)}: a constant vertical separation, not a constant distance normal to the curved surfaces.`);
  const t=(region.theta[0]+region.theta[1])/2,r=(region.radial[0]+region.radial[1])/2;
  result.push(`At r = ${number(r)}, θ = ${number(t/Math.PI)}π, the allowed axial heights run from ${number(heightAt(l,r,t))} to ${number(heightAt(h,r,t))}${region.classification==='surface'?', with the stated equality still enforced':''}.`);
 }
 result.push(region.classification==='surface'?'Only the equality-defined surface is present. No disk caps or filled interior have been added.':'These simultaneous inequalities define a filled three-dimensional region. The colored mesh depicts its boundary, not an empty shell. Hiding a component is a viewing aid and does not change the region.');
 result.push(`Conclusion: ${interpretation(region)}`);return result;
}
