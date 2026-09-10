"use client";
import { fieldClassName } from "./question-editor";
interface OptionListProps { options: string[]; onChange: (options: string[]) => void; }
export default function OptionList({ options, onChange }: OptionListProps) {
  return <div className="mt-4 max-w-80"><p className="mb-2 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400">Options</p>{options.map((option, index) => <div className="mb-2 flex items-center gap-2" key={index}><input className={fieldClassName} value={option} onChange={(event) => onChange(options.map((current, currentIndex) => currentIndex === index ? event.target.value : current))} /><button type="button" aria-label={`Remove option ${index + 1}`} className="text-slate-300 hover:text-delete" disabled={options.length <= 1} onClick={() => onChange(options.filter((_, currentIndex) => currentIndex !== index))}>×</button></div>)}<button type="button" className="ml-3 text-xs text-secondary hover:text-primary" onClick={() => onChange([...options, `Option ${options.length + 1}`])}>Add option</button></div>;
}
