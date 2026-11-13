// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { emptyAdvanced, recordAdvanced, loadAdvanced, saveAdvanced, advancedStats, ADVANCED_KEY } from './progress';
import { makeQuestion } from './question';
import { empty, save, load, record } from '../progress';
import { problem } from '../math';
beforeEach(()=>localStorage.clear());
describe('separate advanced persistence',()=>{
 it('saves category scores and history without modifying original progress',()=>{const original=record(empty(),problem('sphere'),'sphere',4,'Quiz');save(original);let advanced=emptyAdvanced();for(const family of ['cylinderPatch','sphereCylinder','coneBand','sphericalShell'] as const){const q=makeQuestion('Exam Challenge','identify',Math.random,family);advanced=recordAdvanced(advanced,q,q.correctId,3);}const reverse=makeQuestion('Hard','bounds');advanced=recordAdvanced(advanced,reverse,reverse.choices.find(c=>c.id!==reverse.correctId)!.id,5);expect(saveAdvanced(advanced)).toBe(true);expect(loadAdvanced()).toEqual(advanced);expect(load()).toEqual(original);const stats=advancedStats(advanced);expect(stats.total).toBe(5);expect(stats.correct).toBe(4);expect(stats.best).toBe(4);expect(stats.streak).toBe(0);expect(stats.byCategory['Reverse identification']).toEqual({total:1,correct:0});expect(Object.values(stats.byCategory).every(s=>s.total===1)).toBe(true);});
 it('does not double-count a question or grade an unknown option',()=>{const q=makeQuestion();const p=recordAdvanced(emptyAdvanced(),q,q.correctId,3);expect(recordAdvanced(p,q,q.correctId,3)).toBe(p);expect(recordAdvanced(p,makeQuestion(),'missing',3)).toBe(p);});
 it('loads empty or malformed storage safely and can reset independently',()=>{localStorage.setItem(ADVANCED_KEY,'bad JSON');expect(loadAdvanced()).toEqual(emptyAdvanced());const original=empty();save(original);saveAdvanced(emptyAdvanced());expect(load()).toEqual(original);});
});
