import { height, TAU, validate, type Difficulty, type Family, type Region } from './model';
const pick = <T,>(values: readonly T[], random:()=>number): T => values[Math.floor(random()*values.length)];
export function generateRegion(family: Family, difficulty: Difficulty = 'Intermediate', random = Math.random): Region {
 const radius=pick([2,3,4,5],random), h=pick([3,4,5,6],random), start=pick([0,Math.PI/2,Math.PI,3*Math.PI/2],random),span=pick([Math.PI/2,Math.PI],random);
 const frame={center:(difficulty==='Intermediate'?[0,0,0]:[pick([-2,0,2],random),pick([-1,0,3],random),pick([-2,0,1],random)]) as [number,number,number],axis:pick([0,1,2] as const,random)};
 const base={family,frame,classification:'surface' as 'surface'|'solid',coordinates:'Cartesian' as 'Cartesian'|'Cylindrical'|'Spherical',theta:[start,start+span] as [number,number]};
 let region: Region;
 switch(family){
 case 'cylinderPatch':region={...base,model:'radial',radial:[0,radius],lower:height(),upper:height(h),patch:'outer'};break;
 case 'hemispherePatch':region={...base,model:'spherical',theta:[0,TAU],rho:[0,radius],phi:[0,Math.PI/2]};break;
 case 'paraboloidPatch':{const a=pick([1,2],random);region={...base,model:'radial',theta:[0,TAU],radial:[difficulty==='Intermediate'?0:1,radius],lower:height(),upper:height(0,{quadratic:a}),patch:'top'};break;}
 case 'conePatch':region={...base,model:'radial',theta:[0,TAU],radial:[difficulty==='Intermediate'?0:1,radius],lower:height(),upper:height(0,{radial:pick([1,2],random)}),patch:'top'};break;
 case 'paraboloidSolid':region={...base,classification:'solid',model:'radial',theta:[0,TAU],radial:[0,radius],lower:height(),upper:height(radius*radius,{quadratic:-1})};break;
 case 'cylinderSolid':region={...base,classification:'solid',model:'radial',theta:[0,TAU],radial:[0,radius],lower:height(),upper:height(h)};break;
 case 'paraboloidLens':{const a=pick([1,2],random),b=pick([1,2,3],random);region={...base,classification:'solid',model:'radial',theta:[0,TAU],radial:[0,radius],lower:height(0,{quadratic:a}),upper:height((a+b)*radius*radius,{quadratic:-b})};break;}
 case 'sphereCap':{const cut=pick([1,2],random),sphere=radius+2;region={...base,classification:'solid',model:'radial',theta:[0,TAU],radial:[0,Math.sqrt(sphere*sphere-cut*cut)],lower:height(cut),upper:height(0,{sphere,sphereSign:1})};break;}
 case 'hemisphereSolid':region={...base,classification:'solid',model:'spherical',theta:[0,TAU],rho:[0,radius],phi:[0,Math.PI/2]};break;
 case 'sphereCylinder':region={...base,classification:'solid',model:'radial',theta:[0,TAU],radial:[0,radius],lower:height(0,{sphere:radius+2,sphereSign:-1}),upper:height(0,{sphere:radius+2,sphereSign:1})};break;
 case 'slopedCylinder':region={...base,classification:'solid',model:'radial',radial:[0,radius],lower:height(),upper:height(radius+2,{slope:pick([.5,-.5],random)})};break;
 case 'cylindricalSector':case 'annularCylinder':case 'coneCap':case 'coneBand':case 'paraboloidBand':{
  base.frame={center:[0,0,0],axis:2};base.coordinates='Cylindrical';base.classification='solid';
  const theta: [number,number]=family==='coneCap'?[0,TAU]:family==='annularCylinder'&&difficulty==='Hard'?[0,TAU]:[start,start+span];
  const radial:[number,number]=[family==='annularCylinder'?radius/2:0,radius];
  region={...base,model:'radial',theta,radial,lower:family==='coneCap'||family==='coneBand'?height(0,{radial:1}):family==='paraboloidBand'?height(0,{quadratic:1}):height(),upper:family==='coneCap'?height(radius):family==='coneBand'?height(h,{radial:1}):family==='paraboloidBand'?height(h,{quadratic:1}):height(h)};break;
 }
 case 'sphericalHemisphere':case 'sphericalWedge':case 'sphericalShell':case 'sphericalSector':
  region={...base,frame:{center:[0,0,0],axis:2},coordinates:'Spherical',classification:'solid',model:'spherical',rho:[family==='sphericalShell'?radius/2:0,radius],phi:[0,family==='sphericalSector'?Math.PI/4:family==='sphericalHemisphere'?Math.PI/2:Math.PI],theta:family==='sphericalWedge'||(family==='sphericalShell'&&difficulty==='Exam Challenge')?[start,start+span]:[0,TAU]};break;
 }
 validate(region);return region;
}

export function availableFamilies(difficulty: Difficulty): Family[] {
 if(difficulty==='Intermediate')return ['cylinderPatch','hemispherePatch','paraboloidPatch','conePatch','cylinderSolid','cylindricalSector','hemisphereSolid'];
 if(difficulty==='Hard')return ['cylinderPatch','paraboloidPatch','paraboloidSolid','paraboloidLens','sphereCap','annularCylinder','coneCap','coneBand','sphericalHemisphere','sphericalWedge','sphericalShell','sphericalSector'];
 return ['sphereCylinder','slopedCylinder','paraboloidLens','sphereCap','paraboloidBand','coneBand','annularCylinder','sphericalShell','sphericalWedge','sphericalSector'];
}
