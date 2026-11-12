import fs from 'node:fs/promises';
import path from 'node:path';
import { isPiece, load } from 'ascii.rest';
import { svg as asciiSvg } from 'ascii.rest/svg';

type Json = Record<string, any>;
type Corner = 'none'|'fire'|'titan'|'demon'|'cursed'|'chakra'|'pirate'|'spirit'|'hunter'|'dragon'|'moon'|'vines'|'cave';
const config = JSON.parse(await fs.readFile(process.env.GITBREATHING_CONFIG || 'gitbreathing.json','utf8')) as Json;
const fireName = 'doom-fire';
const firePiece = isPiece(fireName) ? await load[fireName]() : null;
const fireSvg = firePiece ? asciiSvg(firePiece, { dark: true, seconds: 4, fps: 12, scale: 2, label: 'Animated ASCII breathing fire' }) : '';
const fireViewStart = fireSvg.indexOf('viewBox="');
const fireViewEnd = fireViewStart >= 0 ? fireSvg.indexOf('"', fireViewStart + 9) : -1;
const fireViewBox = fireViewStart >= 0 && fireViewEnd > fireViewStart ? fireSvg.slice(fireViewStart + 9, fireViewEnd) : '0 0 80 24';
const fireOpenEnd = fireSvg.indexOf('>');
const fireCloseStart = fireSvg.lastIndexOf('</svg>');
const fireBody = fireOpenEnd >= 0 && fireCloseStart > fireOpenEnd ? fireSvg.slice(fireOpenEnd + 1, fireCloseStart) : '';
const readme = config.readme ?? {};
const show = new Set<string>(readme.show ?? ['name','bio','location','company','website','socials','orcid','followers','following','repositories','stars','languages','contributions','dailyContributions','pinnedRepos']);
const out = config.outputDir || 'dist';
let profile: Json = {};
try { profile = JSON.parse(await fs.readFile(path.join(out,'profile-data.json'),'utf8')); } catch { profile = config.profile ?? {}; }
const user: Json = profile.data?.user ?? profile.user ?? profile;
const calendar = user.contributionsCollection?.contributionCalendar ?? user.contributionCalendar ?? {};
const days = (calendar.weeks ?? []).flatMap((w: Json) => w.contributionDays ?? []);
const pinnedRepos = (user.pinnedItems?.nodes ?? []).filter(Boolean).slice(0,6);
const topRepos = (user.repositories?.nodes ?? []).filter(Boolean).slice(0,6);
const socialNodes = user.socialAccounts?.nodes ?? user.socialAccounts ?? [];
const manualSocials = config.socials ?? {};
const socials = [...socialNodes.map((s: Json) => ({name:s.provider || 'Social',url:s.url})), ...(user.twitterUsername ? [{name:'X',url:'https://x.com/'+encodeURIComponent(user.twitterUsername)}] : []), ...Object.entries(manualSocials).map(([name,url])=>({name,url}))].filter((s: Json)=>s.url).filter((s: Json,i:number,a:Json[])=>a.findIndex((v:Json)=>String(v.name).toLowerCase()===String(s.name).toLowerCase())===i);
const orcid = config.orcid || socials.find((s: Json)=>String(s.name).toLowerCase()==='orcid')?.url || '';
const contributions = Number(calendar.totalContributions ?? user.contributions ?? config.contributions ?? 0);
const visuals = readme.visualizations ?? {};
const totalVisual = visuals.total ?? {};
const dailyVisual = visuals.daily ?? {};
const followers = Number(user.followers?.totalCount ?? user.followers ?? 0);
const following = Number(user.following?.totalCount ?? user.following ?? 0);
const repoCount = Number(user.repositories?.totalCount ?? user.publicRepos ?? 0);
const starredRepos = Number(user.starredRepositories?.totalCount ?? 0);
const gists = Number(user.gists?.totalCount ?? 0);
const organizations = user.organizations?.nodes ?? [];
const cc = user.contributionsCollection ?? {};
const stars = Number(topRepos.reduce((n: number,r: Json)=>n+Number(r.stargazerCount||0),0));
const langs = new Map<string,{count:number,color:string}>();
for (const r of topRepos) {
 const l=r.primaryLanguage;
 if(l?.name){const v=langs.get(l.name)??{count:0,color:l.color||'#929792'};v.count++;langs.set(l.name,v);}
}
const topLanguages=[...langs.entries()].sort((a,b)=>b[1].count-a[1].count).slice(0,6);
const esc=(v:unknown)=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const safeUrl=(v:unknown)=>{try{const u=new URL(String(v??''));return u.protocol==='https:'||u.protocol==='http:'?esc(u.toString()):'';}catch{return '';}};
const tx=(x:number,y:number,v:unknown,size=14,fill='#ffffff',weight=400,mono=false)=>'<text x="'+x+'" y="'+y+'" fill="'+fill+'" font-family="Paper Mono,ui-monospace,monospace" font-size="'+size+'" font-weight="'+weight+'">'+esc(v)+'</text>';
const ln=(y:number)=>'<path d="M54 '+y+'H1146" stroke="#303038" stroke-width="1"/>';
const label=(x:number,y:number,v:string)=>tx(x,y,v.toUpperCase(),10,'#a1a1aa',500,true);
const pill=(x:number,y:number,v:string)=>{const w=Math.min(220,Math.max(62,v.length*7+22));return '<rect x="'+x+'" y="'+(y-16)+'" width="'+w+'" height="26" rx="2" fill="#101014" stroke="#303038"/>'+tx(x+11,y+1,v,10,'#cbd1c8',500,true);};
const motif=(kind:Corner,x:number,y:number,fx=false,fy=false)=>{
 if(kind==='none')return '';
 const g='<g transform="translate('+x+' '+y+') scale('+(fx?-1:1)+' '+(fy?-1:1)+')" opacity=".72" fill="none" stroke-linecap="round" stroke-linejoin="round">';
 if(kind==='fire')return g+'<path d="M0 104 C-8 70 23 59 17 25 C43 48 45 12 63 0 C62 42 91 45 83 77 C110 49 112 79 102 105" stroke="#c88d62" stroke-width="2"><animate attributeName="opacity" values=".65;1;.65" dur="2.4s" repeatCount="indefinite"/></path><path d="M28 105 C25 83 44 74 42 54 C57 70 68 61 67 43 C88 70 83 89 77 105" stroke="#e7bd91" stroke-width="1.5"><animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="2.1s" repeatCount="indefinite"/></path></g>';
 const paths:Record<string,string>={
 titan:'<path d="M8 8 L50 96 L91 8 M50 96 L50 30 M20 31 L50 60 L80 31" stroke="#9ca99b" stroke-width="2"/><path d="M8 8 Q42 19 50 60 Q60 18 91 8" stroke="#d1d8cd"/>',
 moon:'<circle cx="52" cy="52" r="40" stroke="#d8d8e0"/><path d="M65 14 C33 18 25 63 50 83 C21 78 8 44 25 20 C35 6 52 5 65 14Z" stroke="#b8b8c2"/>',
 vines:'<path d="M8 100 C12 76 30 82 26 60 C22 42 43 40 40 20 M40 70 C60 60 59 40 76 32 M25 82 C8 70 8 55 12 46 M44 54 C58 48 67 54 74 64" stroke="#8eaa8c" stroke-width="2"/><path d="M12 46 l-8 -8 M40 20 l-7 -8 M76 32 l9 -8 M74 64 l10 4" stroke="#b8c9a9"/>,
 cave:'<path d="M4 90 L18 40 L31 56 L48 8 L62 50 L79 28 L98 92 M4 90 H98" stroke="#a2a7a0" stroke-width="2"/><path d="M48 8 L48 42 M31 56 L25 78 M79 28 L84 58" stroke="#707a70"/>',
 demon:'<path d="M12 88 L88 12 M25 75 L10 62 M38 62 L23 49 M51 49 L36 36 M64 36 L49 23" stroke="#c88d62" stroke-width="3"/>',
 cursed:'<circle cx="52" cy="52" r="40" stroke="#9b8cba"/><circle cx="52" cy="52" r="25" stroke="#c2b1dc" stroke-dasharray="4 5"><animateTransform attributeName="transform" type="rotate" from="0 52 52" to="360 52 52" dur="18s" repeatCount="indefinite"/></circle>',
 chakra:'<path d="M52 52 C88 18 93 80 52 82 C15 83 17 22 52 22 C83 22 80 70 52 70 C30 70 31 37 52 37" stroke="#829db4" stroke-width="2"><animateTransform attributeName="transform" type="rotate" from="0 52 52" to="360 52 52" dur="24s" repeatCount="indefinite"/></path>',
 pirate:'<circle cx="52" cy="52" r="43" stroke="#c3a77b"/><path d="M52 5 L61 43 L99 52 L61 61 L52 99 L43 61 L5 52 L43 43Z" stroke="#d7c49e"/>',
 spirit:'<path d="M18 32 Q52 -2 86 32 L81 78 Q52 110 23 78Z" stroke="#c5c5ba"/><path d="M31 48 L43 53 M61 53 L73 48 M42 72 Q52 78 62 72" stroke="#d7d8ce" stroke-width="2"/>',
 hunter:'<path d="M52 5 L96 52 L52 99 L8 52Z M52 20 L82 52 L52 84 L22 52Z" stroke="#a4b19f"/><path d="M52 5 V99 M8 52 H96" stroke="#68776a"/>',
 dragon:'<path d="M8 76 C25 15 79 8 93 45 C103 73 63 94 36 73 C19 60 36 37 57 42 C73 46 74 62 62 68" stroke="#b9a17b" stroke-width="2"/>'
 };
 return g+(paths[kind]??paths.titan)+'</g>';
};
const corners:Record<string,Corner>=readme.corners??{};
const preset=readme.animePreset??'original';
const bg=readme.background??'#0b0d0b';
const fg=readme.foreground??'#e8e9e4';
const outParts:string[]=[];
const profileName=user.name||user.login||config.username||'GitHub profile';
const login=user.login||config.username||'';
const bio=user.bio||'';
const website=user.websiteUrl||user.blog||config.website||'';
const location=user.location||'';
const company=user.company||'';
if(show.has('avatar')&&user.avatarUrl){outParts.push('<defs><clipPath id="profileAvatarClip"><circle cx="1102" cy="116" r="38"/></clipPath></defs><image href="'+safeUrl(user.avatarUrl)+'" x="1064" y="78" width="76" height="76" preserveAspectRatio="xMidYMid slice" clip-path="url(#profileAvatarClip)"/>');}
if(show.has('name'))outParts.push(tx(56,104,profileName,35,fg,600));
if(show.has('username')&&login)outParts.push(tx(58,130,'@'+login,12,'#a1a1aa',400,true));
if(show.has('bio')&&bio)outParts.push(tx(58,160,bio.slice(0,145),12,'#c4c4cc'));
let px=58;
if(show.has('location')&&location){outParts.push(pill(px,194,'⌖ '+location));px+=Math.min(230,location.length*7+45);}
if(show.has('company')&&company){outParts.push(pill(px,194,company));px+=Math.min(220,company.length*7+32);}
if(show.has('website')&&website){const href=safeUrl(website);outParts.push(href?'<a href="'+href+'">'+tx(58,225,website,10,'#ffffff',500,true)+'</a>':tx(58,225,website,10,'#ffffff',500,true));}
if(show.has('email')&&user.email)outParts.push(tx(58,242,'EMAIL  '+user.email,10,'#aab6a8',400,true));
if(show.has('joined')&&user.createdAt)outParts.push(tx(58,302,'GITHUB MEMBER SINCE  '+String(user.createdAt).slice(0,10),9,'#8e988d',400,true));
if(show.has('socials')){let sx=58;for(const s of socials.slice(0,9)){const href=safeUrl(s.url);outParts.push(href?'<a href="'+href+'">'+pill(sx,258,String(s.name))+'</a>':pill(sx,258,String(s.name)));sx+=Math.min(210,String(s.name).length*7+32);if(sx>1030)break;}}
if(show.has('twitter')&&user.twitterUsername)outParts.push(tx(58,275,'X  @'+user.twitterUsername,9,'#ffffff',400,true));
if(show.has('orcid')&&orcid){const href=safeUrl(orcid);outParts.push(href?'<a href="'+href+'">'+tx(58,286,'ORCID  '+orcid,10,'#ffffff',400,true)+'</a>':tx(58,286,'ORCID  '+orcid,10,'#ffffff',400,true));}
outParts.push(ln(310));
let y=340;
const activeDays=days.filter((d:Json)=>Number(d.contributionCount)>0);
const longestStreak=(()=>{let best=0,run=0,last=0;for(const d of days){const stamp=Date.parse(String(d.date)+'T00:00:00Z');if(Number(d.contributionCount)>0){run=last&&stamp-last===86400000?run+1:1;best=Math.max(best,run);}else run=0;last=stamp;}return best;})();
const currentStreak=(()=>{let run=0,last=0;for(const d of [...days].reverse()){const stamp=Date.parse(String(d.date)+'T00:00:00Z');if(Number(d.contributionCount)>0&&(run===0||last-stamp===86400000)){run++;last=stamp;}else if(run>0)break;}return run;})();
const metrics=[
 {id:'followers',name:'FOLLOWERS',value:followers.toLocaleString()},
 {id:'following',name:'FOLLOWING',value:following.toLocaleString()},
 {id:'repositories',name:'PUBLIC REPOS',value:repoCount.toLocaleString()},
 {id:'stars',name:'REPO STARS / TOP 100',value:stars.toLocaleString()},
 {id:'starredRepos',name:'STARRED REPOS',value:starredRepos.toLocaleString()},
 
 {id:'commits',name:'COMMITS',value:Number(cc.totalCommitContributions||0).toLocaleString()},
 {id:'pullRequests',name:'PULL REQUESTS',value:Number(cc.totalPullRequestContributions||0).toLocaleString()},
 {id:'issues',name:'ISSUES',value:Number(cc.totalIssueContributions||0).toLocaleString()},
 {id:'reviews',name:'CODE REVIEWS',value:Number(cc.totalPullRequestReviewContributions||0).toLocaleString()},
 {id:'gists',name:'PUBLIC GISTS',value:gists.toLocaleString()},
 {id:'streak',name:'CURRENT / LONGEST STREAK',value:currentStreak+' / '+longestStreak+' days'}
].filter(m=>show.has(m.id));
if(metrics.length){outParts.push(label(58,y,'Account / activity metrics'));const cols=4,cellW=1084/cols,rows=Math.ceil(metrics.length/cols);metrics.forEach((m,i)=>{const col=i%cols,row=Math.floor(i/cols),x=58+col*cellW,yy=y+42+row*78;outParts.push(tx(x,yy,m.value,24,fg,600));outParts.push(tx(x,yy+20,m.name,8,'#8e8e98',500,true));if(col)outParts.push('<path d="M'+(x-15)+' '+(yy-20)+'V'+(yy+24)+'" stroke="#34343b"/>');});y+=42+rows*78+18;outParts.push(ln(y));y+=30;}
if(show.has('contributions') && totalVisual.enabled!==false){outParts.push(label(58,y,'A / Total contributions'));const style=totalVisual.style||'number';const maxValue=Math.max(1,Number(config.maxContributions||5000));const progress=Math.max(0,Math.min(1,contributions/maxValue));const tone=totalVisual.palette==='ember'?'#c88d62':totalVisual.palette==='ocean'?'#82aeb4':'#cbd5c8';if(style==='ring'){const circ=2*Math.PI*43;outParts.push('<circle cx="112" cy="'+(y+66)+'" r="43" fill="none" stroke="#303630" stroke-width="8"/><circle cx="112" cy="'+(y+66)+'" r="43" fill="none" stroke="'+tone+'" stroke-width="8" stroke-dasharray="'+(circ*progress)+' '+circ+'" transform="rotate(-90 112 '+(y+66)+')"/>');outParts.push(tx(82,y+72,Math.round(progress*100)+'%',18,fg,600));outParts.push(tx(180,y+60,contributions.toLocaleString(),36,fg,650));outParts.push(tx(182,y+82,'total contributions',10,'#9ca59a',400,true));}else{outParts.push(tx(58,y+60,contributions.toLocaleString(),40,fg,650));if(style==='bar'){outParts.push('<rect x="58" y="'+(y+82)+'" width="1084" height="8" fill="#282e28"/><rect x="58" y="'+(y+82)+'" width="'+(1084*progress)+'" height="8" fill="'+tone+'"/>');outParts.push(tx(58,y+110,'0',9,'#8e988d',400,true));outParts.push(tx(1070,y+110,maxValue.toLocaleString(),9,'#8e988d',400,true));}}y+=style==='ring'?130:style==='bar'?135:92;outParts.push(ln(y));y+=30;}
if(show.has('dailyContributions')&&days.length && dailyVisual.enabled!==false){outParts.push(label(58,y,'B / Daily contributions · last 12 months'));const startY=y+24;const weeks=calendar.weeks??[];const style=dailyVisual.style||'heatmap';const palette=dailyVisual.palette||'mono';const tones=palette==='ember'?['#24201d','#594031','#8b5a3c','#c58a61','#f0c7a1']:palette==='ocean'?['#20272a','#344d54','#527b83','#82aeb4','#c1d9dc']:['#202520','#465247','#657c66','#8ca58a','#cbd5c8'];if(style==='bars'){const totals=weeks.map((w:Json)=>(w.contributionDays??[]).reduce((n:number,d:Json)=>n+Number(d.contributionCount||0),0));const maxWeek=Math.max(1,...totals);totals.slice(-53).forEach((n:number,i:number)=>{const h=Math.max(2,n/maxWeek*88);outParts.push('<rect x="'+(58+i*20)+'" y="'+(startY+90-h)+'" width="13" height="'+h+'" fill="'+tones[n===0?0:n/maxWeek<.25?1:n/maxWeek<.5?2:n/maxWeek<.75?3:4]+'"><title>Week '+(i+1)+': '+n+' contributions</title></rect>');});}else{const requestedSize=Math.max(6,Math.min(16,Number(dailyVisual.cellSize||10)));const requestedGap=Math.max(1,Math.min(7,Number(dailyVisual.cellGap||3)));const scale=Math.min(1,1084/(53*(requestedSize+requestedGap)-requestedGap));const cell=requestedSize*scale,gap=requestedGap*scale;weeks.slice(-53).forEach((week:Json,col:number)=>{(week.contributionDays??[]).forEach((d:Json,row:number)=>{const n=Number(d.contributionCount||0);const level=n===0?0:n<2?1:n<5?2:n<10?3:4;outParts.push('<rect x="'+(58+col*(cell+gap))+'" y="'+(startY+row*(cell+gap))+'" width="'+cell+'" height="'+cell+'" rx="1" fill="'+tones[level]+'"><title>'+esc(d.date)+': '+n+'</title></rect>');});});}outParts.push(tx(58,startY+116,contributions.toLocaleString()+' contributions · '+days.filter((d:Json)=>Number(d.contributionCount)>0).length+' active days',9,'#9ca59a',400,true));y=startY+150;outParts.push(ln(y));y+=32;}
if(show.has('languages')&&topLanguages.length){outParts.push(label(58,y,'Languages / repository distribution'));const total=topLanguages.reduce((n,[,v])=>n+v.count,0)||1;let x=58;for(const [name,v] of topLanguages){const w=1084*v.count/total;outParts.push('<rect x="'+x+'" y="'+(y+16)+'" width="'+(w-3)+'" height="8" fill="'+esc(v.color)+'"/>');outParts.push(tx(x,y+43,name,10,'#c4cbc1',500));x+=w;}y+=72;outParts.push(ln(y));y+=32;}
if(show.has('organizations')&&organizations.length){outParts.push(label(58,y,'Organizations'));let ox=58;for(const org of organizations.slice(0,8)){outParts.push(pill(ox,y+25,String(org.login||org.name||'Organization')));ox+=Math.min(220,String(org.login||org.name||'Organization').length*7+32);}y+=58;outParts.push(ln(y));y+=32;}
const renderRepoCards=(heading:string,items:Json[])=>{if(!items.length)return;outParts.push(label(58,y,heading));const cw=526,ch=82;items.forEach((r:Json,i:number)=>{const x=58+(i%2)*558,yy=y+17+Math.floor(i/2)*(ch+10);outParts.push('<rect x="'+x+'" y="'+yy+'" width="'+cw+'" height="'+ch+'" fill="#09090d" stroke="#303038"/>');outParts.push(tx(x+14,yy+24,r.name||'Repository',13,fg,500));outParts.push(tx(x+14,yy+45,String(r.description||'').slice(0,72),9,'#a1a1aa'));outParts.push(tx(x+14,yy+66,'★ '+Number(r.stargazerCount||0)+'   Forks '+Number(r.forkCount||0)+'   '+(r.primaryLanguage?.name||''),9,'#bdbdc4',400,true));const href=safeUrl(r.url);if(href)outParts.push('<a href="'+href+'"><rect x="'+x+'" y="'+yy+'" width="'+cw+'" height="'+ch+'" fill="transparent"/></a>');});y+=Math.ceil(items.length/2)*(ch+10)+35;};
if(show.has('pinnedRepos'))renderRepoCards('Pinned repositories',pinnedRepos);
if(show.has('topRepos'))renderRepoCards('Top repositories by stars',topRepos);
if(show.has('repositories')&&repoCount)outParts.push(tx(58,y,'PUBLIC REPOSITORIES  '+repoCount.toLocaleString(),10,'#bdbdc4',500,true));
const height=Math.max(500,y+54);
const cornerArt=(kind:Corner,x:number,y:number,fx=false,fy=false)=>{if(kind==='fire'&&fireBody){return '<svg x="'+x+'" y="'+y+'" width="118" height="92" viewBox="'+fireViewBox+'" preserveAspectRatio="xMidYMid meet">'+fireBody+'</svg>';}return motif(kind,x,y,fx,fy);};
const decor=[cornerArt(corners.topLeft??'fire',12,12),cornerArt(corners.topRight??'titan',1080,12,true),cornerArt(corners.bottomLeft??'demon',12,height-125,false,true),cornerArt(corners.bottomRight??'fire',1080,height-125,true,true)].join('');
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="'+height+'" viewBox="0 0 1200 '+height+'" role="img"><title>'+esc(profileName)+' · GitBreathing profile</title><desc>Generated profile composition with selected identity, social, repository and contribution data.</desc><defs><pattern id="grain" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".35" fill="#fff" opacity=".06"/></pattern></defs><rect width="1200" height="'+height+'" fill="'+esc(bg)+'"/><rect width="1200" height="'+height+'" fill="url(#grain)"/><path d="M54 38H1146" stroke="#343934"/>'+tx(56,25,'GITBREATHING / PROFILE SYSTEM',9,'#9da49b',500,true)+outParts.join('')+decor+(readme.showCornerLabels?tx(58,height-24,'ART PRESET / '+String(preset).toUpperCase(),8,'#778176',400,true):'')+tx(1050,height-24,'GENERATED SVG',8,'#778176',400,true)+'</svg>';
await fs.writeFile(path.join(out,'profile.svg'),svg,'utf8');
console.log('Generated profile.svg for '+login+' with '+show.size+' selectable fields, '+days.length+' contribution days, '+pinnedRepos.length+' pinned repositories and '+topRepos.length+' top repositories.');
