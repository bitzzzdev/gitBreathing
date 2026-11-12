import { useMemo, useState } from 'react';
import { Ascii } from 'ascii.rest/react';
import { createBreathingPiece } from './breathing';
import { IDS, STYLES, type StyleId } from './styles';

export default function App() {
  const [styles, setStyles] = useState<StyleId[]>(['sun', 'water', 'mist']);
  const [count, setCount] = useState(850);
  const [max, setMax] = useState(5000);
  const [curve, setCurve] = useState(1);
  const [user, setUser] = useState('your-username');
  const [platform, setPlatform] = useState('github');
  const power = useMemo(() => Math.pow(Math.min(1, count / Math.max(1, max)), curve), [count, max, curve]);
  const piece = useMemo(() => createBreathingPiece({
    styles,
    power,
    seed: `${platform}:${user.toLowerCase()}`,
  }), [styles, power, platform, user]);

  const toggle = (id: StyleId) => setStyles((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const move = (id: StyleId, direction: number) => setStyles((items) => {
    const next = [...items]; const from = next.indexOf(id); const to = from + direction;
    if (from < 0 || to < 0 || to >= next.length) return items;
    [next[from], next[to]] = [next[to], next[from]]; return next;
  });

  return <main>
    <header><b><i>GB</i> GitBreathing</b><nav>MIT LICENSE　<a href="https://github.com/bitzzdev">GitHub</a>　<a href="https://gitlab.com/bitzzdev">GitLab</a></nav></header>
    <section className="hero"><small>CONTRIBUTION-POWERED PROCEDURAL ASCII ART</small><h1>Your activity.<br/><em>Your breathing style.</em></h1><p>Animated, multi-layered ASCII slash art. Contribution activity controls its density, intensity and visual complexity. Fourteen breathing styles, each with its own movement language.</p></section>
    <section className="layout">
      <article className="panel"><small>01 / CONFIGURE</small><h2>Your technique</h2>
        <label>Contribution source</label><select value={platform} onChange={(event) => setPlatform(event.target.value)}><option value="github">GitHub</option><option value="gitlab">GitLab</option><option value="combined">GitHub + GitLab</option></select>
        <label>Username</label><input value={user} onChange={(event) => setUser(event.target.value)} />
        <label>Breathing styles and layer order</label>
        {IDS.map((id) => <div className="style" key={id}>
          <button onClick={() => toggle(id)}>
            <span className="dots">{STYLES[id].colors.map((color) => <i style={{ background: color }} key={color}/>)}</span>
            <span className="style-copy"><b>{STYLES[id].name}</b><small>{STYLES[id].parent ? `Derived from ${STYLES[STYLES[id].parent].name}` : 'Origin style'} · ${STYLES[id].forms} known forms · ${STYLES[id].colour}}</small></span>
            <strong>{styles.includes(id) ? 'Selected' : '+'}</strong>
          </button>
          {styles.includes(id) && <div className="order">Layer {styles.indexOf(id) + 1}<button onClick={() => move(id, -1)} aria-label={`Move ${id} up`}>↑</button><button onClick={() => move(id, 1)} aria-label={`Move ${id} down`}>↓</button></div>}
        </div>)}
        <label>Contributions: {count.toLocaleString()}</label><input type="range" min="0" max={max} step="10" value={count} onChange={(event) => setCount(+event.target.value)}/>
        <label>Maximum contributions</label><input type="number" min="1" value={max} onChange={(event) => setMax(Math.max(1, +event.target.value || 1))}/>
        <label>Power curve: {curve.toFixed(1)}</label><input type="range" min="0.2" max="3" step="0.1" value={curve} onChange={(event) => setCurve(+event.target.value)}/>
      </article>
      <div>
        <article className="panel preview"><small>02 / LIVE ASCII PREVIEW</small><h2>Breathing sequence</h2>
          <div className="stage"><Ascii piece={piece} label="Animated GitBreathing ASCII slash preview" /></div>
          <div className="stats"><span>POWER <b>{Math.round(power * 100)}%</b></span><span>CANVAS <b>64 × 30 chars</b></span><span>STYLES <b>{styles.length} / 14</b></span></div>
        </article>
        <article className="panel"><small>03 / POWER PROGRESSION</small><h2>Contribution evolution</h2><div className="bar"><i style={{ width: `${power * 100}%` }}/></div><p className="muted">Low activity produces a restrained slash. Higher activity reveals additional slash layers, denser style motifs, sharper secondary cuts and more particles. Identical inputs produce identical frames.</p></article>
        <article className="panel"><small>04 / STYLE LINEAGE</small><h2>Fourteen styles. One origin.</h2><p className="muted">Sun is the origin. The five fundamental styles branch from it, with Moon also tracing back to Sun. Later styles branch from Water, Flame, Thunder and Wind. Mist and Flower are included as established branches.</p></article>
      </div>
    </section>
    <footer>Created by <a href="https://github.com/bitzzdev">Dev Borah</a> · <a href="https://gitlab.com/bitzzdev">GitLab</a> · ASCII rendering powered by <a href="https://ascii.rest/">ascii.rest</a> · MIT License</footer>
  </main>;
}
