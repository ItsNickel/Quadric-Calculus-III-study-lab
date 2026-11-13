import { accepts, type Kind, type Problem } from './math';
export interface Attempt { problem:Problem; answer:Kind; correct:boolean; seconds:number; date:string; mode:string }
export interface Progress { attempts:Attempt[]; total:number; correct:number; streak:number; best:number; byType:Partial<Record<Kind,{total:number;correct:number}>> }
export const empty=():Progress=>({attempts:[],total:0,correct:0,streak:0,best:0,byType:{}});
export function record(p:Progress,problem:Problem,answer:Kind,seconds:number,mode:string):Progress {const correct=accepts(problem.surface.kind,answer),streak=correct?p.streak+1:0; const stats=p.byType[problem.surface.kind]||{total:0,correct:0};return {attempts:[{problem,answer,correct,seconds,date:new Date().toISOString(),mode},...p.attempts],total:p.total+1,correct:p.correct+Number(correct),streak,best:Math.max(p.best,streak),byType:{...p.byType,[problem.surface.kind]:{total:stats.total+1,correct:stats.correct+Number(correct)}}};}
const KEY='quadric-progress-v1';
export function load():Progress {try{const p=JSON.parse(localStorage.getItem(KEY)||'null');return p&&Array.isArray(p.attempts)&&typeof p.total==='number'&&p.byType?p:empty();}catch{return empty();}}
export function save(p:Progress):boolean{try{localStorage.setItem(KEY,JSON.stringify(p));return true;}catch{return false;}}
export function weakest(p:Progress):Kind|undefined {return (Object.entries(p.byType) as [Kind,{total:number;correct:number}][]).sort((a,b)=>a[1].correct/a[1].total-b[1].correct/b[1].total||b[1].total-a[1].total)[0]?.[0];}
