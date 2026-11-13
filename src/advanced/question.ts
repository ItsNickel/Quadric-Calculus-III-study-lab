import { availableFamilies, generateRegion } from './generate';
import { interpretation, regionEquation } from './display';
import { TAU, validate, type Category, type Difficulty, type Family, type Region } from './model';
export interface RegionChoice { id:string; region:Region }
export interface AdvancedQuestion { id:string; type:'identify'|'bounds'; difficulty:Difficulty; category:Category; region:Region; choices:RegionChoice[]; correctId:string }
export function categoryFor(region:Region):Category {return region.classification==='surface'?'Restricted surfaces':region.coordinates==='Cylindrical'?'Cylindrical regions':region.coordinates==='Spherical'?'Spherical regions':'Composite solids';}
// Compare complete structured constraints rather than answer text, including filled-vs-surface semantics.
export function equivalent(a:Region,b:Region):boolean {
 const canonical=(r:Region)=>({model:r.model,classification:r.classification,frame:r.frame,theta:[r.theta[1]-r.theta[0]>=TAU-1e-9?0:+( ((r.theta[0]%TAU+TAU)%TAU) ).toFixed(9),+(r.theta[1]-r.theta[0]).toFixed(9)],...(r.model==='radial'?{radial:r.radial,lower:r.lower,upper:r.upper,patch:r.classification==='surface'?r.patch:undefined}:{rho:r.classification==='surface'?[r.rho[1],r.rho[1]]:r.rho,phi:r.phi})});
 return JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
}
export function gradeAdvanced(q:AdvancedQuestion,choiceId:string):boolean {const choice=q.choices.find(c=>c.id===choiceId);return !!choice&&equivalent(choice.region,q.region);}
export function makeQuestion(difficulty:Difficulty='Intermediate',type:'identify'|'bounds'='identify',random=Math.random,family?:Family):AdvancedQuestion {
 const pool=availableFamilies(difficulty),chosen=family||pool[Math.floor(random()*pool.length)];
 const reverseFamily:Family=difficulty==='Intermediate'?'cylindricalSector':difficulty==='Hard'?'annularCylinder':'paraboloidBand';
 let region=generateRegion(type==='bounds'?reverseFamily:chosen,difficulty,random);
 if(type==='bounds'&&region.model==='radial'){region={...region,theta:[region.theta[0],region.theta[0]+Math.PI]};}
 const opposite=structuredClone(region);opposite.classification=region.classification==='surface'?'solid':'surface';if(opposite.model==='radial'&&!opposite.patch)opposite.patch='top';
 const angular=structuredClone(region),span=region.theta[1]-region.theta[0];angular.theta=span>=TAU-1e-9?[0,Math.PI]:[region.theta[0]+Math.PI,region.theta[1]+Math.PI];
 const shifted=structuredClone(region);
 if(type==='bounds'&&shifted.model==='radial')shifted.radial[0]=shifted.radial[0]>0?0:shifted.radial[1]/2;
 else shifted.frame.center[shifted.frame.axis]+=2;
 const choices=[region,opposite,angular,shifted].map((r,i)=>{validate(r);return {id:String(i),region:r};});
 for(let i=choices.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]];}
 return {id:crypto.randomUUID(),type,difficulty,category:type==='bounds'?'Reverse identification':categoryFor(region),region,choices,correctId:'0'};
}
export function choiceText(q:AdvancedQuestion,choice:RegionChoice):string {return q.type==='bounds'?regionEquation(choice.region):interpretation(choice.region);}
