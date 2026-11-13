import katex from 'katex';
export default function MathBlock({value,small=false}:{value:string;small?:boolean}){return <div className={small?'math small':'math'} dangerouslySetInnerHTML={{__html:katex.renderToString(value,{throwOnError:false,displayMode:true})}}/>;}
