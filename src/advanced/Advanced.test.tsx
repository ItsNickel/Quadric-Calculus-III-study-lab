// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Surface } from '../math';
import type { Region } from './model';
vi.mock('../Viewer',()=>({default:({surface,region}:{surface?:Surface;region?:Region})=><div data-testid="viewer">{region?`${region.classification} region viewer`:surface?.kind}</div>}));
import Advanced, { AdvancedDashboard } from './Advanced';
import App from '../App';
import { makeQuestion } from './question';
import { loadAdvanced } from './progress';
beforeEach(()=>{localStorage.clear();history.replaceState(null,'','/#Quiz');});
afterEach(cleanup);
describe('Advanced Geometry interactions',()=>{
 it('hides geometry until submission, reveals feedback, records once and hides the next question',()=>{
  const q=makeQuestion('Intermediate','identify',()=>.2,'cylinderPatch');const {container}=render(<Advanced initialQuestion={q}/>);
  expect(screen.queryByTestId('viewer')).toBeNull();expect((screen.getByRole('button',{name:/Check answer/}) as HTMLButtonElement).disabled).toBe(true);
  const index=q.choices.findIndex(c=>c.id===q.correctId);fireEvent.click(container.querySelectorAll('.advanced-answers .answer')[index]);fireEvent.click(screen.getByRole('button',{name:/Check answer/}));
  expect(screen.getByTestId('viewer').textContent).toBe('surface region viewer');expect(screen.getByText('You found the region.')).toBeTruthy();expect(loadAdvanced().attempts).toHaveLength(1);expect(container.querySelectorAll('.advanced-answers .answer.correct')).toHaveLength(1);
  fireEvent.click(screen.getByRole('button',{name:/Next question/}));expect(screen.queryByTestId('viewer')).toBeNull();expect(loadAdvanced().attempts).toHaveLength(1);
 });
 it('shows geometry before answering reverse questions and resets on difficulty/type changes',()=>{
  render(<Advanced/>);fireEvent.change(screen.getByLabelText('Question type'),{target:{value:'bounds'}});expect(screen.getByTestId('viewer')).toBeTruthy();expect(screen.queryByText('You found the region.')).toBeNull();
  fireEvent.change(screen.getByLabelText('Difficulty'),{target:{value:'Hard'}});expect((screen.getByText('Check answer').closest('button') as HTMLButtonElement).disabled).toBe(true);
  fireEvent.change(screen.getByLabelText('Question type'),{target:{value:'identify'}});expect(screen.queryByTestId('viewer')).toBeNull();
 });
 it('supports keyboard selection, wrong-answer feedback and review without grading twice',()=>{
  const q=makeQuestion();const wrong=q.choices.findIndex(c=>c.id!==q.correctId);const {unmount}=render(<Advanced initialQuestion={q}/>);fireEvent.keyDown(window,{key:String(wrong+1)});fireEvent.keyDown(window,{key:'Enter'});expect(screen.getByText('Here is how the bounds fit together.')).toBeTruthy();expect(loadAdvanced().attempts[0].correct).toBe(false);unmount();
  render(<AdvancedDashboard/>);fireEvent.click(screen.getByRole('button',{name:new RegExp(q.category)}));expect(screen.getByTestId('viewer')).toBeTruthy();expect(loadAdvanced().attempts).toHaveLength(1);fireEvent.click(screen.getByRole('button',{name:'Reset advanced progress'}));fireEvent.click(screen.getByRole('button',{name:'Cancel'}));expect(loadAdvanced().attempts).toHaveLength(1);
 });
});
describe('existing mode regression',()=>{
 it('keeps quiz, challenge, library, explorer and progress available alongside Advanced Geometry',async()=>{
  render(<App/>);expect(screen.getByText('What surface does this equation describe?')).toBeTruthy();expect(screen.queryByTestId('viewer')).toBeNull();
  for(const [mode,text] of [['Challenge','Push your perspective.'],['Learn','Meet the surfaces.'],['Explorer','Make it your own.'],['Progress','See your progress.'],['Advanced Geometry','Read between the boundaries.'],['Quiz','Find the shape.']]){
   await act(async()=>{location.hash=encodeURIComponent(mode);});await waitFor(()=>expect(screen.getByText(text)).toBeTruthy());
   if(mode==='Learn'||mode==='Explorer')expect(screen.getByTestId('viewer')).toBeTruthy();
   if(mode==='Progress')expect(screen.getByText('Advanced Geometry progress')).toBeTruthy();
  }
 });
});
