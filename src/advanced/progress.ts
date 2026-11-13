import { gradeAdvanced, type AdvancedQuestion } from './question';
import { categories, type Category } from './model';
export interface AdvancedAttempt { question:AdvancedQuestion; answerId:string; correct:boolean; seconds:number; date:string }
export interface AdvancedProgress { version:1; attempts:AdvancedAttempt[] }
export const ADVANCED_KEY='quadric-advanced-progress-v1';
export const emptyAdvanced=():AdvancedProgress=>({version:1,attempts:[]});
export function loadAdvanced():AdvancedProgress {try{const value=JSON.parse(localStorage.getItem(ADVANCED_KEY)||'null');if(value?.version!==1||!Array.isArray(value.attempts))return emptyAdvanced();return {...value,attempts:value.attempts.filter((a:AdvancedAttempt)=>a.question?.region&&Array.isArray(a.question.choices)&&categories.includes(a.question.category)&&typeof a.answerId==='string'&&typeof a.correct==='boolean'&&Number.isFinite(a.seconds))};}catch{return emptyAdvanced();}}
export function saveAdvanced(value:AdvancedProgress):boolean {try{localStorage.setItem(ADVANCED_KEY,JSON.stringify(value));return true;}catch{return false;}}
export function recordAdvanced(progress:AdvancedProgress,question:AdvancedQuestion,answerId:string,seconds:number):AdvancedProgress {
 if(!question.choices.some(c=>c.id===answerId)||progress.attempts.some(a=>a.question.id===question.id))return progress;
 return {version:1,attempts:[{question,answerId,correct:gradeAdvanced(question,answerId),seconds:Math.max(0,seconds),date:new Date().toISOString()},...progress.attempts]};
}
export function advancedStats(progress:AdvancedProgress) {
 const byCategory=Object.fromEntries(categories.map(c=>[c,{total:0,correct:0}])) as Record<Category,{total:number;correct:number}>;
 let correct=0,streak=0,best=0,totalSeconds=0;
 for(const attempt of [...progress.attempts].reverse()){const stats=byCategory[attempt.question.category];stats.total++;stats.correct+=Number(attempt.correct);correct+=Number(attempt.correct);streak=attempt.correct?streak+1:0;best=Math.max(best,streak);totalSeconds+=attempt.seconds;}
 return {byCategory,total:progress.attempts.length,correct,streak,best,totalSeconds};
}
