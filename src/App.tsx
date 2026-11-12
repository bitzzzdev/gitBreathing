import { useMemo, useState } from 'react';
import { Ascii } from 'ascii.rest/react';
import { createBreathingPiece } from './breathing';
import { IDS, STYLES, type StyleId } from './styles';

type Mode = 'both' | 'total' | 'daily';
type TotalStyle = 'number' | 'bar' | 'ring';
type DailyStyle = 'heatmap' | 'bars';
type Palette = 'mono' | 'ember' | 'ocean';
type ProfileField = 'name' | 'bio' | 'location' | 'company' | 'website' | 'socials' | 'orcid' | 'followers' | 'following' | 'repositories' | 'stars' | 'languages' | 'contributions' | 'dailyContributions' | 'pinnedRepos' | 'commits' | 'pullRequests' | 'issues' | 'reviews' | 'gists' | 'organizations' | 'starredRepos' | 'email' | 'joined';
type CornerTheme = 'none' | 'fire' | 'titan' | 'demon' | 'cursed' | 'chakra' | 'pirate' | 'spirit' | 'hunter' | 'dragon';
const PROFILE_FIELDS: {id: ProfileField; label: string}[] = [
  {id:'name',label:'Display name'},{id:'bio',label:'Bio'},{id:'location',label:'Location'},{id:'company',label:'Company'},
  {id:'website',label:'Website'},{id:'socials',label:'Social accounts'},{id:'orcid',label:'ORCID'},
  {id:'followers',label:'Followers'},{id:'following',label:'Following'},{id:'repositories',label:'Public repositories'},
  {id:'stars',label:'Received stars'},{id:'languages',label:'Top languages'},{id:'contributions',label:'Total contributions'},
  {id:'dailyContributions',label:'Daily contribution calendar'},{id:'pinnedRepos',label:'Pinned repositories'},
  {id:'commits',label:'Commit contributions'},{id:'pullRequests',label:'Pull request contributions'},{id:'issues',label:'Issue contributions'},
  {id:'reviews',label:'Code review contributions'},{id:'gists',label:'Public gists'},{id:'organizations',label:'Organizations'},{id:'starredRepos',label:'Starred repositories'},{id:'email',label:'Public email'},{id:'joined',label:'GitHub join date'}
];
const CORNER_THEMES: {id: CornerTheme; label: string}[] = [
  {id:'none',label:'None'},{id:'fire',label:'Breathing fire'},{id:'titan',label:'Titan / freedom wings motif'},
  {id:'demon',label:'Demon blade motif'},{id:'cursed',label:'Cursed energy motif'},{id:'chakra',label:'Chakra spiral motif'},
  {id:'pirate',label:'Pirate / compass motif'},{id:'spirit',label:'Spirit mask motif'},{id:'hunter',label:'Hunter rune motif'},{id:'dragon',label:'Dragon aura motif'}
];

function makePreviewDays(total: number, seed: string) {
  let hash = 2166136261;
  for (const char of seed) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  const weights = Array.from({ length: 364 }, (_, i) =>
    (0.28 + Math.abs(Math.sin((i + (hash & 31)) * 0.173)) * 0.52) *
    (0.2 + ((Math.imul(i + 1, hash | 1) >>> 0) % 100) / 125));
  const sum = weights.reduce((a, b) => a + b, 0);
  const values = weights.map((weight) => Math.floor(weight / sum * total));
  let remainder = total - values.reduce((a, b) => a + b, 0);
  for (let i = 0; remainder > 0; i = (i + 17) % values.length) { values[i]++; remainder--; }
  return values;
}

export default function App() {
  const [styles, setStyles] = useState<StyleId[]>(['sun', 'water', 'mist']);
  const [count, setCount] = useState(850);
  const [max, setMax] = useState(5000);
  const [curve, setCurve] = useState(1);
  const [user, setUser] = useState('your-username');
  const [platform, setPlatform] = useState('github');
  const [mode, setMode] = useState<Mode>('both');
  const [totalStyle, setTotalStyle] = useState<TotalStyle>('number');
  const [dailyStyle, setDailyStyle] = useState<DailyStyle>('heatmap');
  const [totalPalette, setTotalPalette] = useState<Palette>('mono');
  const [dailyPalette, setDailyPalette] = useState<Palette>('mono');
  const [cellSize, setCellSize] = useState(10);
  const [cellGap, setCellGap] = useState(3);
  const [weekdays, setWeekdays] = useState(true);
  const [profileFields, setProfileFields] = useState<ProfileField[]>(['name','bio','socials','orcid','location','website','followers','following','repositories','stars','languages','contributions','dailyContributions','pinnedRepos','commits','pullRequests','issues','reviews','gists','organizations','starredRepos','email','joined']);
  const [cornerThemes, setCornerThemes] = useState<Record<'topLeft'|'topRight'|'bottomLeft'|'bottomRight', CornerTheme>>({topLeft:'fire',topRight:'titan',bottomLeft:'demon',bottomRight:'fire'});
  const [animePreset, setAnimePreset] = useState('original');
  const [showCornerLabels, setShowCornerLabels] = useState(false);
  const [orcidUrl, setOrcidUrl] = useState('');
  const [socialLines, setSocialLines] = useState('Instagram|https://instagram.com/your-handle\nLinkedIn|https://linkedin.com/in/your-handle\nX|https://x.com/your-handle');

  const power = useMemo(() => Math.pow(Math.min(1, count / Math.max(1, max)), curve), [count, max, curve]);
  const piece = useMemo(() => createBreathingPiece({ styles, power, seed: `${platform}:${user.toLowerCase()}` }), [styles, power, platform, user]);
  const daily = useMemo(() => makePreviewDays(count, `${platform}:${user.toLowerCase()}`), [count, platform, user]);
  const dailyMax = Math.max(1, ...daily);
  const toggle = (id: StyleId) => setStyles((items) => items.includes(id) ? (items.length > 1 ? items.filter((item) => item !== id) : items) : [...items, id]);
  const move = (id: StyleId, direction: number) => setStyles((items) => {
    const next = [...items]; const from = next.indexOf(id); const to = from + direction;
    if (from < 0 || to < 0 || to >= next.length) return items;
    [next[from], next[to]] = [next[to], next[from]]; return next;
  });
  const paletteClass = (palette: Palette) => `palette-${palette}`;
  const toggleProfileField = (field: ProfileField) => setProfileFields((items) => items.includes(field) ? items.filter((item) => item !== field) : [...items, field]);
  const downloadConfig = () => {
    const socials = Object.fromEntries(socialLines.split('\n').map((line) => line.split('|')).filter((parts) => parts.length >= 2 && parts[0].trim() && parts[1].trim()).map((parts) => [parts[0].trim(),parts[1].trim()]));
    const config = { username:user, platform, styles, maxContributions:max, powerCurve:curve, contributions:count, orcid:orcidUrl, socials,
      readme:{show:profileFields,layout:'editorial',theme:'portfolio-paper',animePreset,showCornerLabels,
        corners:cornerThemes,visualizations:{total:{enabled:true,style:totalStyle,palette:totalPalette},daily:{enabled:true,style:dailyStyle,palette:dailyPalette,cellSize,cellGap,weekdays}}} };
    const url = URL.createObjectURL(new Blob([JSON.stringify(config,null,2)+'\n'],{type:'application/json'}));
    const anchor = document.createElement('a'); anchor.href=url; anchor.download='gitbreathing.json'; anchor.click(); URL.revokeObjectURL(url);
  };

  return <main className="site-shell">
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-mark">GB</span><span>gitBreathing</span></a>
      <nav><a href="https://github.com/bitzzdev">GitHub</a><a href="https://gitlab.com/bitzzdev">GitLab</a><a href="https://github.com/bitzzdev/gitBreathing">Repository ↗</a></nav>
    </header>
    <section className="hero">
      <p className="eyebrow">PROCEDURAL ART / CONTRIBUTION VISUALIZATION</p>
      <h1>Make your activity<br/><span>visible.</span></h1>
      <p className="hero-copy">A configurable breathing-style artwork generator driven by your contribution history. Shape the visual language, tune the output, and keep the result in your profile README.</p>
      <div className="hero-meta"><span>01 / CONFIGURE</span><span>02 / PREVIEW</span><span>DETERMINISTIC RENDERING</span></div>
    </section>
    <section className="workspace">
      <aside className="config-column">
        <section className="section-block">
          <div className="section-heading"><span className="eyebrow">SOURCE</span><span className="step-index">01</span></div>
          <h2>Activity source</h2>
          <label htmlFor="platform">Platform</label>
          <select id="platform" value={platform} onChange={(e) => setPlatform(e.target.value)}><option value="github">GitHub</option><option value="gitlab">GitLab</option><option value="combined">GitHub + GitLab</option></select>
          <label htmlFor="username">Username</label><input id="username" value={user} onChange={(e) => setUser(e.target.value)} />
          <p className="field-note">Contribution data is fetched by your own workflow. This studio preview is local.</p>
        </section>
        <section className="section-block">
          <div className="section-heading"><span className="eyebrow">BREATHING STYLE</span><span className="step-index">02</span></div>
          <h2>Choose your technique</h2>
          <p className="section-description">Select styles and arrange their rendering order. Earlier layers sit beneath later layers.</p>
          <div className="style-list">{IDS.map((id) => <div className={`style-row ${styles.includes(id) ? 'is-selected' : ''}`} key={id}>
            <button className="style-select" onClick={() => toggle(id)} aria-pressed={styles.includes(id)}>
              <span className="style-swatches">{STYLES[id].colors.map((color) => <i style={{ background: color }} key={color}/>)}</span>
              <span className="style-copy"><b>{STYLES[id].name}</b><small>{STYLES[id].parent ? `From ${STYLES[STYLES[id].parent].name}` : 'Origin style'} · {STYLES[id].forms} forms</small></span>
              <span className="style-state">{styles.includes(id) ? 'ON' : 'ADD'}</span>
            </button>
            {styles.includes(id) && <div className="layer-controls"><span>Layer {styles.indexOf(id) + 1}</span><button onClick={() => move(id, -1)} aria-label={`Move ${id} up`} disabled={styles.indexOf(id) === 0}>↑</button><button onClick={() => move(id, 1)} aria-label={`Move ${id} down`} disabled={styles.indexOf(id) === styles.length - 1}>↓</button></div>}
          </div>)}</div>
          <p className="field-note">{styles.length} of 14 styles selected. Select at least one style.</p>
        </section>
        <section className="section-block">
          <div className="section-heading"><span className="eyebrow">ART INTENSITY</span><span className="step-index">03</span></div>
          <h2>Contribution power</h2>
          <div className="range-heading"><label htmlFor="count">Contribution total</label><output>{count.toLocaleString()}</output></div>
          <input id="count" type="range" min="0" max={max} step="10" value={count} onChange={(e) => setCount(+e.target.value)} />
          <label htmlFor="max">Maximum contribution scale</label><input id="max" type="number" min="1" value={max} onChange={(e) => setMax(Math.max(1, +e.target.value || 1))} />
          <div className="range-heading"><label htmlFor="curve">Power curve</label><output>{curve.toFixed(1)}</output></div>
          <input id="curve" type="range" min="0.2" max="3" step="0.1" value={curve} onChange={(e) => setCurve(+e.target.value)} />
        </section>
      </aside>
      <div className="preview-column">
        <section className="preview-section">
          <div className="section-heading"><span className="eyebrow">LIVE OUTPUT / ASCII ART</span><span className="step-index">A</span></div>
          <div className="preview-title-row"><h2>Breathing sequence</h2><span className="live-indicator"><i/> LIVE PREVIEW</span></div>
          <div className="art-stage"><Ascii piece={piece} label="Animated GitBreathing ASCII slash preview"/></div>
          <div className="metric-strip"><div><span>POWER</span><b>{Math.round(power * 100)}%</b></div><div><span>CANVAS</span><b>64 × 30</b></div><div><span>ACTIVE STYLES</span><b>{styles.length} / 14</b></div></div>
        </section>
        <section className="section-block contribution-section">
          <div className="section-heading"><span className="eyebrow">CONTRIBUTION VISUALS</span><span className="step-index">04</span></div>
          <h2>Choose what to display</h2>
          <p className="section-description">Two independent views. Show either one or both.</p>
          <div className="segmented" role="group" aria-label="Contribution visualizations">
            {([{value:'both',label:'Both'},{value:'total',label:'A / Total'},{value:'daily',label:'B / Daily'}] as const).map((item) => <button key={item.value} className={mode === item.value ? 'active' : ''} onClick={() => setMode(item.value)} aria-pressed={mode === item.value}>{item.label}</button>)}
          </div>
          {mode !== 'daily' && <article className="visual-card">
            <div className="visual-card-heading"><div><span className="eyebrow">A / PRIMARY</span><h3>Total contributions</h3></div><span className="data-tag">ALL TYPES</span></div>
            <div className={`total-visual ${paletteClass(totalPalette)}`}>
              {totalStyle === 'number' && <div className="total-number"><strong>{count.toLocaleString()}</strong><span>contributions in the selected period</span></div>}
              {totalStyle === 'bar' && <div className="total-bar-view"><div className="total-number"><strong>{count.toLocaleString()}</strong><span>of {max.toLocaleString()} contributions</span></div><div className="total-track"><i style={{width:`${Math.min(100,count/Math.max(1,max)*100)}%`}}/></div></div>}
              {totalStyle === 'ring' && <div className="total-ring-view"><div className="ring" style={{'--ring-progress':`${Math.min(100,count/Math.max(1,max)*100)}%`} as React.CSSProperties}><strong>{Math.round(Math.min(1,count/Math.max(1,max))*100)}<small>%</small></strong></div><div className="total-number"><strong>{count.toLocaleString()}</strong><span>contributions</span></div></div>}
            </div>
            <div className="visual-controls"><label>Visualization<select value={totalStyle} onChange={(e) => setTotalStyle(e.target.value as TotalStyle)}><option value="number">Large number</option><option value="bar">Progress bar</option><option value="ring">Progress ring</option></select></label><label>Palette<select value={totalPalette} onChange={(e) => setTotalPalette(e.target.value as Palette)}><option value="mono">Monochrome</option><option value="ember">Ember</option><option value="ocean">Ocean</option></select></label></div>
          </article>}
          {mode !== 'total' && <article className="visual-card">
            <div className="visual-card-heading"><div><span className="eyebrow">B / SECONDARY</span><h3>Daily contributions</h3></div><span className="data-tag">364 DAYS</span></div>
            <div className={`daily-visual ${paletteClass(dailyPalette)}`}>
              {dailyStyle === 'heatmap' ? <div className="heatmap-wrap">
                {weekdays && <div className="weekday-labels" style={{height:`calc(7 * ${cellSize}px + 6 * ${cellGap}px)`}}><span>Mon</span><span>Wed</span><span>Fri</span></div>}
                <div className="heatmap-grid" style={{gridTemplateRows:`repeat(7, ${cellSize}px)`,gridAutoColumns:`${cellSize}px`,gap:`${cellGap}px`,'--cell-size':`${cellSize}px`} as React.CSSProperties}>
                  {daily.map((value,index) => <i key={index} title={`${value} contributions`} className={value===0?'level-0':value/dailyMax<.25?'level-1':value/dailyMax<.5?'level-2':value/dailyMax<.75?'level-3':'level-4'}/>)}
                </div>
              </div> : <div className="daily-bars">{daily.filter((_,index)=>index%7===0).map((value,index)=><i key={index} title={`${value} contributions`} style={{height:`${Math.max(2,value/dailyMax*100)}%`}}/>)}</div>}
              <div className="daily-legend"><span>LESS</span><i className="level-0"/><i className="level-1"/><i className="level-2"/><i className="level-3"/><i className="level-4"/><span>MORE</span></div>
            </div>
            <div className="daily-summary"><span><b>{daily.reduce((a,b)=>a+b,0).toLocaleString()}</b> total contributions</span><span><b>{daily.filter((v)=>v>0).length}</b> active days</span><span><b>{dailyMax}</b> busiest day</span></div>
            <div className="visual-controls">
              <label>Visualization<select value={dailyStyle} onChange={(e)=>setDailyStyle(e.target.value as DailyStyle)}><option value="heatmap">Contribution heatmap</option><option value="bars">Weekly bars</option></select></label>
              <label>Palette<select value={dailyPalette} onChange={(e)=>setDailyPalette(e.target.value as Palette)}><option value="mono">Monochrome</option><option value="ember">Ember</option><option value="ocean">Ocean</option></select></label>
              {dailyStyle==='heatmap' && <><label>Cell size <output>{cellSize}px</output><input type="range" min="6" max="16" value={cellSize} onChange={(e)=>setCellSize(+e.target.value)}/></label><label>Cell gap <output>{cellGap}px</output><input type="range" min="1" max="7" value={cellGap} onChange={(e)=>setCellGap(+e.target.value)}/></label><label className="check-control"><input type="checkbox" checked={weekdays} onChange={(e)=>setWeekdays(e.target.checked)}/> Weekday labels</label></>}
            </div>
          </article>}
          <p className="preview-disclaimer">Illustrative daily distribution generated locally from the total. It is not fetched GitHub history. The profile renderer must use the actual contribution calendar data.</p>
        </section>

        <section className="section-block profile-builder">
          <div className="section-heading"><span className="eyebrow">README COMPOSITION</span><span className="step-index">06</span></div>
          <h2>Build your profile card</h2>
          <p className="section-description">Choose which public GitHub profile fields and contribution data appear in the generated README artwork. Missing fields are omitted automatically.</p>
          <label htmlFor="orcid-url">ORCID URL <input id="orcid-url" value={orcidUrl} onChange={(e)=>setOrcidUrl(e.target.value)} placeholder="https://orcid.org/0000-0000-0000-0000" /></label>
          <label htmlFor="social-lines">Additional social links <small>One per line: Label|https://profile-url</small><textarea id="social-lines" rows={3} value={socialLines} onChange={(e)=>setSocialLines(e.target.value)} /></label>
          <div className="profile-field-grid">{PROFILE_FIELDS.map((field) => <label className="profile-check" key={field.id}><input type="checkbox" checked={profileFields.includes(field.id)} onChange={() => toggleProfileField(field.id)}/><span>{field.label}</span></label>)}</div>
          <div className="section-heading corner-heading"><span className="eyebrow">ANIME CORNER ART</span><span className="step-index">07</span></div>
          <p className="section-description">Original series-inspired motifs, not copied character art, logos or screenshots. Place a different animation in each corner.</p>
          <label>Visual preset<select value={animePreset} onChange={(e)=>{const v=e.target.value;setAnimePreset(v);const presets:Record<string,Record<'topLeft'|'topRight'|'bottomLeft'|'bottomRight',CornerTheme>>={original:{topLeft:'fire',topRight:'titan',bottomLeft:'demon',bottomRight:'fire'},aot:{topLeft:'titan',topRight:'titan',bottomLeft:'hunter',bottomRight:'fire'},'demon-slayer':{topLeft:'fire',topRight:'demon',bottomLeft:'spirit',bottomRight:'fire'},'jujutsu-kaisen':{topLeft:'cursed',topRight:'cursed',bottomLeft:'spirit',bottomRight:'fire'},naruto:{topLeft:'chakra',topRight:'chakra',bottomLeft:'hunter',bottomRight:'fire'},'one-piece':{topLeft:'pirate',topRight:'pirate',bottomLeft:'dragon',bottomRight:'fire'},bleach:{topLeft:'spirit',topRight:'demon',bottomLeft:'hunter',bottomRight:'fire'},'solo-leveling':{topLeft:'hunter',topRight:'cursed',bottomLeft:'dragon',bottomRight:'fire'},'dragon-ball':{topLeft:'dragon',topRight:'chakra',bottomLeft:'dragon',bottomRight:'fire'},'chainsaw-man':{topLeft:'demon',topRight:'hunter',bottomLeft:'cursed',bottomRight:'fire'}};setCornerThemes(presets[v]||presets.original)}}><option value="original">Original anime atmosphere</option><option value="aot">Titan / freedom</option><option value="demon-slayer">Breathing / sword forms</option><option value="jujutsu-kaisen">Cursed energy</option><option value="naruto">Chakra / seals</option><option value="one-piece">Pirate / compass</option><option value="bleach">Spirit / blade</option><option value="solo-leveling">Hunter / shadow</option><option value="dragon-ball">Dragon aura</option><option value="chainsaw-man">Saw / industrial</option></select></label>
          <div className="corner-grid">{(['topLeft','topRight','bottomLeft','bottomRight'] as const).map((corner) => <label key={corner}>{corner.replace(/([A-Z])/g,' $1')}<select value={cornerThemes[corner]} onChange={(e)=>setCornerThemes((old)=>({...old,[corner]:e.target.value as CornerTheme}))}>{CORNER_THEMES.map((theme)=><option key={theme.id} value={theme.id}>{theme.label}</option>)}</select></label>)}</div>
          <label className="check-control"><input type="checkbox" checked={showCornerLabels} onChange={(e)=>setShowCornerLabels(e.target.checked)}/> Show corner motif labels</label>
          <button className="export-config" onClick={downloadConfig}>Export README configuration ↗</button>
        </section>
        <section className="section-block lineage-section">
          <div className="section-heading"><span className="eyebrow">STYLE SYSTEM</span><span className="step-index">05</span></div>
          <h2>Fourteen styles. One origin.</h2>
          <p className="section-description">Sun is the origin. The five fundamental styles branch from it, with Moon also tracing back to Sun. Later styles branch from Water, Flame, Thunder and Wind. Mist and Flower remain established branches.</p>
        </section>
      </div>
    </section>
    <footer><span>GITBREATHING / OPEN SOURCE</span><span>Created by <a href="https://bitz.is-a.dev/">Dev Borah</a> · MIT License</span></footer>
  </main>;
}
