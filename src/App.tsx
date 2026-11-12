import { useEffect, useMemo, useRef, useState } from 'react';
import { IDS, STYLES, type StyleId } from './styles';
import { pixelsToSvg, renderSlash } from './renderer';

export default function App() {
  const [styles, setStyles] = useState<StyleId[]>(['sun', 'moon', 'water', 'mist']);
  const [count, setCount] = useState(850);
  const [max, setMax] = useState(5000);
  const [curve, setCurve] = useState(1);
  const [size, setSize] = useState(128);
  const [phase, setPhase] = useState(0);
  const [bg, setBg] = useState<'dark' | 'transparent'>('dark');
  const [user, setUser] = useState('your-username');
  const [platform, setPlatform] = useState('github');
  const canvas = useRef<HTMLCanvasElement>(null);
  const power = useMemo(() => Math.pow(Math.min(1, count / Math.max(1, max)), curve), [count, max, curve]);
  const renderSize = Math.max(8, Math.round(8 + (size - 8) * Math.sqrt(power)));

  useEffect(() => {
    let frame = 0;
    const tick = () => { setPhase((value) => value + 0.025); frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const pixels = useMemo(() => renderSlash({ size: renderSize, styles, power, phase, background: bg, seed: `${platform}:${user.toLowerCase()}` }), [renderSize, styles, power, phase, bg, platform, user]);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    element.width = renderSize; element.height = renderSize;
    const context = element.getContext('2d');
    if (!context) return;
    const image = context.createImageData(renderSize, renderSize);
    image.data.set(pixels);
    context.putImageData(image, 0, 0);
  }, [pixels, renderSize]);

  const toggle = (id: StyleId) => setStyles((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const move = (id: StyleId, direction: number) => setStyles((items) => {
    const next = [...items]; const from = next.indexOf(id); const to = from + direction;
    if (from < 0 || to < 0 || to >= next.length) return items;
    [next[from], next[to]] = [next[to], next[from]]; return next;
  });
  const exportSvg = () => {
    const source = pixelsToSvg(renderSlash({ size: renderSize, styles, power, background: bg, seed: `${platform}:${user.toLowerCase()}` }), renderSize, `GitBreathing slash for ${user}`);
    const url = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'slash.svg'; anchor.click(); URL.revokeObjectURL(url);
  };
  const exportPng = () => { const anchor = document.createElement('a'); anchor.download = 'slash.png'; anchor.href = canvas.current!.toDataURL(); anchor.click(); };

  return <main>
    <header><b><i>GB</i> GitBreathing</b><nav>MIT LICENSE　<a href="https://github.com/bitzzdev">GitHub</a>　<a href="https://gitlab.com/bitzzdev">GitLab</a></nav></header>
    <section className="hero"><small>CONTRIBUTION-POWERED PROCEDURAL ART</small><h1>Your activity.<br/><em>Your breathing style.</em></h1><p>Deterministic pixel slash art that grows with your contributions. No character sprites, no ranks, no hosted backend.</p></section>
    <section className="layout">
      <article className="panel"><small>01 / CONFIGURE</small><h2>Your technique</h2>
        <label>Contribution source</label><select value={platform} onChange={(event) => setPlatform(event.target.value)}><option value="github">GitHub</option><option value="gitlab">GitLab</option><option value="combined">GitHub + GitLab</option></select>
        <label>Username</label><input value={user} onChange={(event) => setUser(event.target.value)} />
        <label>Breathing styles and layer order</label>{IDS.map((id) => <div className="style" key={id}><button onClick={() => toggle(id)}><span className="dots">{STYLES[id].colors.map((color) => <i style={{ background: color }} key={color}/>)}</span>{STYLES[id].name}<strong>{styles.includes(id) ? 'Selected' : '+'}</strong></button>{styles.includes(id) && <div className="order">Layer {styles.indexOf(id) + 1}<button onClick={() => move(id, -1)} aria-label={`Move ${id} up`}>↑</button><button onClick={() => move(id, 1)} aria-label={`Move ${id} down`}>↓</button></div>}</div>)}
        <label>Contributions: {count.toLocaleString()}</label><input type="range" min="0" max={max} step="10" value={count} onChange={(event) => setCount(+event.target.value)}/>
        <label>Maximum contributions</label><input type="number" min="1" value={max} onChange={(event) => setMax(Math.max(1, +event.target.value || 1))}/>
        <label>Power curve: {curve.toFixed(1)}</label><input type="range" min="0.2" max="3" step="0.1" value={curve} onChange={(event) => setCurve(+event.target.value)}/>
        <label>Maximum pixel resolution: {size} × {size}</label><input type="range" min="8" max="128" step="8" value={size} onChange={(event) => setSize(+event.target.value)}/>
        <label>Preview background</label><select value={bg} onChange={(event) => setBg(event.target.value as 'dark' | 'transparent')}><option value="dark">Dark</option><option value="transparent">Transparent</option></select>
        <div className="exports"><button className="export" onClick={exportSvg}>Export SVG</button><button className="export secondary" onClick={exportPng}>Export PNG</button></div>
      </article>
      <div><article className="panel preview"><small>02 / LIVE PREVIEW</small><h2>Slash renderer</h2><div className={'stage ' + (bg === 'transparent' ? 'checker' : '')}><canvas ref={canvas}/></div><div className="stats"><span>POWER <b>{Math.round(power * 100)}%</b></span><span>RESOLUTION <b>{renderSize}px / {size}px max</b></span><span>STYLES <b>{styles.length}</b></span></div></article>
        <article className="panel"><small>03 / POWER PROGRESSION</small><h2>Contribution evolution</h2><div className="bar"><i style={{ width: `${power * 100}%` }}/></div><p className="muted">The same contribution count, username, style order and configuration produce the same artwork. More activity reveals denser slash geometry, secondary cuts and particles, up to 128 × 128.</p></article>
      </div>
    </section>
    <footer>Created by <a href="https://github.com/bitzzdev">Dev Borah</a> · <a href="https://gitlab.com/bitzzdev">GitLab</a> · MIT License</footer>
  </main>;
}
