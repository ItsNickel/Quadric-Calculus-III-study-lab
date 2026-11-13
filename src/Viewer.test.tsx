// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
vi.mock('@react-three/fiber',()=>({Canvas:()=> <div data-testid="webgl-canvas"/>,useThree:()=>({})}));
import Viewer from './Viewer';
import { generateRegion } from './advanced/generate';
import { generate } from './math';
afterEach(cleanup);
describe('shared viewer controls',()=>{
 it('shows and toggles actual boundary components, opacity, grid, axes and reset',()=>{render(<Viewer region={generateRegion('cylinderSolid')}/>);const top=screen.getByLabelText('Upper boundary') as HTMLInputElement;expect(top.checked).toBe(true);fireEvent.click(top);expect(top.checked).toBe(false);expect(screen.getByText('Some components are hidden for inspection.')).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'Show full boundary'}));expect(top.checked).toBe(true);fireEvent.click(screen.getByLabelText('Axes'));expect((screen.getByLabelText('Axes') as HTMLInputElement).checked).toBe(false);fireEvent.click(screen.getByLabelText('Grid'));fireEvent.change(screen.getByLabelText('Surface opacity'),{target:{value:'.4'}});expect((screen.getByLabelText('Surface opacity') as HTMLInputElement).value).toBe('0.4');fireEvent.click(screen.getByLabelText('Boundary edges'));fireEvent.click(screen.getByTitle('Reset camera (R)'));expect(screen.getByText(/boundary of a filled solid/)).toBeTruthy();});
 it('preserves the original surface viewer and uncapped surface notes',()=>{const {rerender}=render(<Viewer surface={generate('sphere')}/>);expect(screen.queryByText('BOUNDARY COMPONENTS')).toBeNull();expect(screen.getByText(/Complete closed surface/)).toBeTruthy();rerender(<Viewer region={generateRegion('conePatch')}/>);expect(screen.getByText(/No caps or interior/)).toBeTruthy();expect(screen.queryByLabelText('Lower boundary')).toBeNull();});
});
