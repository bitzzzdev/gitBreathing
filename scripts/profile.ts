import fs from 'node:fs/promises';
import path from 'node:path';

type Json = Record<string, any>;
type Corner = 'none'|'fire'|'titan'|'demon'|'cursed'|'chakra'|'pirate'|'spirit'|'hunter'|'dragon';
const config = JSON.parse(await fs.readFile(process.env.GITBREATHING_CONFIG || 'gitbreathing.json','utf8')) as Json;
const readme = config.readme ?? {};
const show = new Set<string>(readme.show ?? ['name','bio','location','company','website','socials','orcid','followers','following','repositories','stars','languages','contributions','dailyContributions','pinnedRepos']);
const out = config.outputDir || 'dist';
let profile: Json = {};
try { profile = JSON.parse(await fs.readFile(path.join(out,'profile-data.json'),'utf8')); } catch { profile = config.profile ?? {}; }
const user: Json = profile.data?.user ?? profile.user ?? profile;
const calendar = user.contributionsCollection?.contributionCalendar ?? user.contributionCalendar ?? {};
const days = (calendar.weeks ?? []).flatMap((w: Json) => w.contributionDays ?? []);
const repos = (user.pinnedItems?.nodes ?? user.repositories?.nodes ?? []).filter(Boolean).slice(0,6);
const socialNodes = user.socialAccounts?.nodes ?? user.socialAccounts ?? [];
const manualSocials = config.socials ?? {};
const socials = [...socialNodes.map((s: Json) => ({name:s.provider || 'Social',url:s.url})), ...Object.entries(manualSocials).map(([name,url])=>({name,url}))].filter((s: Json)=>s.url);
const orcid = config.orcid || socials.find((s: Json)=>String(s.name).toLowerCase()==='orcid')?.url || '';
const contributions = Number(calendar.totalContributions ?? user.contributions ?? config.contributions ?? 0);
const followers = Number(user.followers?.totalCount ?? user.followers ?? 0);
const following = Number(user.following?.totalCount ?? user.following ?? 0);
const repoCount = Number(user.repositories?.totalCount ?? user.publicRepos ?? 0);
const starredRepos = Number(user.starredRepositories?.totalCount ?? 0);
const gists = Number(user.gists?.totalCount ?? 0);
const organizations = user.organizations?.nodes ?? [];
const cc = user.contributionsCollection ?? {};
const stars = Number((user.repositories?.nodes ?? repos).reduce((n: number,r: Json)=>n+Number(r.stargazerCount||0),0));
const langs = new Map<string,{count:number,color:string}>();
for (const r of (user.repositories?.nodes ?? repos)) {
 const l=r.primaryLanguage;
 if(l?.name){const v=langs.get(l.name)??{count:0,color:l.color||'#929792'};v.count++;langs.set(l.name,v);}
}
const topLanguages=[...langs.entries()].sort((a,b)=>b[1].count-a[1].count).slice(0,6);
const esc=(v:unknown)=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const tx=(x:number,y:number,v:unknown,size=14,fill='#e8e9e4',weight=400,mono=false)=>'<text x="'+x+'" y="'+y+'" fill="'+fill+'" font-family="'+(mono?'IBM Plex Mono,monospace':'Manrope,Inter,Arial,sans-serif')+'" font-size="'+size+'" font-weight="'+weight+'">'+esc(v)+'</text>';
const ln=(y:number)=>'<path d="M54 '+y+'H1146" stroke="#343934" stroke-width="1"/>';
const label=(x:number,y:number,v:string)=>tx(x,y,v.toUpperCase(),10,'#9da49b',500,true);
const pill=(x:number,y:number,v:string)=>{const w=Math.min(220,Math.max(62,v.length*7+22));return '<rect x="'+x+'" y="'+(y-16)+'" width="'+w+'" height="26" rx="2" fill="#171b17" stroke="#3a4039"/>'+tx(x+11,y+1,v,10,'#cbd1c8',500,true);};
const motif=(kind:Corner,x:number,y:number,fx=false,fy=false)=>{
 if(kind==='none')return '';
 const g='<g transform="translate('+x+' '+y+') scale('+(fx?-1:1)+' '+(fy?-1:1)+')" opacity=".72" fill="none" stroke-linecap="round" stroke-linejoin="round">';
 if(kind==='fire')return g+'<path d="M0 104 C-8 70 23 59 17 25 C43 48 45 12 63 0 C62 42 91 45 83 77 C110 49 112 79 102 105" stroke="#c88d62" stroke-width="2"><animate attributeName="opacity" values=".65;1;.65" dur="2.4s" repeatCount="indefinite"/></path><path d="M28 105 C25 83 44 74 42 54 C57 70 68 61 67 43 C88 70 83 89 77 105" stroke="#e7bd91" stroke-width="1.5"><animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="2.1s" repeatCount="indefinite"/></path></g>';
 const paths:Record<string,string>={
 titan:'<path d="M8 8 L50 96 L91 8 M50 96 L50 30 M20 31 L50 60 L80 31" stroke="#9ca99b" stroke-width="2"/><path d="M8 8 Q42 19 50 60 Q60 18 91 8" stroke="#d1d8cd"/>',
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
if(show.has('name'))outParts.push(tx(56,104,profileName,35,fg,650));
if(login)outParts.push(tx(58,130,'@'+login,12,'#a1aaa0',400,true));
if(show.has('bio')&&bio)outParts.push(tx(58,160,bio.slice(0,145),12,'#b4bbb2'));
let px=58;
if(show.has('location')&&location){outParts.push(pill(px,194,'⌖ '+location));px+=Math.min(230,location.length*7+45);}
if(show.has('company')&&company){outParts.push(pill(px,194,company));px+=Math.min(220,company.length*7+32);}
if(show.has('website')&&website)outParts.push(tx(58,225,website,10,'#b7c2b3',500,true));
if(show.has('socials')){let sx=58;for(const s of socials.slice(0,8)){outParts.push(pill(sx,258,String(s.name)));sx+=Math.min(210,String(s.name).length*7+32);if(sx>1050)break;}}
if(show.has('orcid')&&orcid)outParts.push(tx(58,286,'ORCID  '+orcid,10,'#aab6a8',400,true));
outParts.push(ln(310));
let y=340;
const metrics=[
 {id:'followers',name:'FOLLOWERS',value:followers.toLocaleString()},
 {id:'following',name:'FOLLOWING',value:following.toLocaleString()},
 {id:'repositories',name:'PUBLIC REPOS',value:repoCount.toLocaleString()},
 {id:'stars',name:'RECEIVED STARS',value:stars.toLocaleString()},
 {id:'starredRepos',name:'STARRED REPOS',value:starredRepos.toLocaleString()},
 {id:'contributions',name:'CONTRIBUTIONS',value:contributions.toLocaleString()},
 {id:'commits',name:'COMMITS',value:Number(cc.totalCommitContributions||0).toLocaleString()},
 {id:'pullRequests',name:'PULL REQUESTS',value:Number(cc.totalPullRequestContributions||0).toLocaleString()},
 {id:'issues',name:'ISSUES',value:Number(cc.totalIssueContributions||0).toLocaleString()},
 {id:'reviews',name:'CODE REVIEWS',value:Number(cc.totalPullRequestReviewContributions||0).toLocaleString()},
 {id:'gists',name:'PUBLIC GISTS',value:gists.toLocaleString()}
].filter(m=>show.has(m.id));
if(metrics.length){outParts.push(label(58,340,'Activity / account metrics'));const mw=1084/metrics.length;metrics.forEach((m,i)=>{const x=58+i*mw;outParts.push(tx(x,386,m.value,28,fg,600));outParts.push(tx(x,407,m.name,9,'#8e988d',500,true));if(i)outParts.push('<path d="M'+(x-16)+' 358V414" stroke="#343934"/>');});outParts.push(ln(430));y=465;}
if(show.has('dailyContributions')&&days.length){outParts.push(label(58,y,'Daily contributions / last 12 months'));const startY=y+24;days.slice(-371).forEach((d:Json,i:number)=>{const col=Math.floor(i/7),row=i%7,n=Number(d.contributionCount||0);const fill=n===0?'#202520':n<2?'#465247':n<5?'#657c66':n<10?'#8ca58a':'#b7c2b3';outParts.push('<rect x="'+(58+col*14)+'" y="'+(startY+row*14)+'" width="10" height="10" rx="1" fill="'+fill+'"><title>'+esc(d.date)+': '+n+'</title></rect>');});outParts.push(tx(58,startY+116,contributions.toLocaleString()+' contributions · '+days.filter((d:Json)=>Number(d.contributionCount)>0).length+' active days',9,'#9ca59a',400,true));y=startY+150;outParts.push(ln(y));y+=32;}
if(show.has('languages')&&topLanguages.length){outParts.push(label(58,y,'Languages / repository distribution'));const total=topLanguages.reduce((n,[,v])=>n+v.count,0)||1;let x=58;for(const [name,v] of topLanguages){const w=1084*v.count/total;outParts.push('<rect x="'+x+'" y="'+(y+16)+'" width="'+(w-3)+'" height="8" fill="'+esc(v.color)+'"/>');outParts.push(tx(x,y+43,name,10,'#c4cbc1',500));x+=w;}y+=72;outParts.push(ln(y));y+=32;}
if(show.has('organizations')&&organizations.length){outParts.push(label(58,y,'Organizations'));let ox=58;for(const org of organizations.slice(0,8)){outParts.push(pill(ox,y+25,String(org.login||org.name||'Organization')));ox+=Math.min(220,String(org.login||org.name||'Organization').length*7+32);}y+=58;outParts.push(ln(y));y+=32;}
if((show.has('pinnedRepos')||show.has('repositories'))&&repos.length){outParts.push(label(58,y,'Selected repositories'));const cw=526,ch=82;repos.forEach((r:Json,i:number)=>{const x=58+(i%2)*558,yy=y+17+Math.floor(i/2)*(ch+10);outParts.push('<rect x="'+x+'" y="'+yy+'" width="'+cw+'" height="'+ch+'" rx="2" fill="#101410" stroke="#353c34"/>');outParts.push(tx(x+14,yy+24,r.name||'Repository',13,fg,600));outParts.push(tx(x+14,yy+45,String(r.description||'').slice(0,72),9,'#9ca59a'));outParts.push(tx(x+14,yy+66,'★ '+Number(r.stargazerCount||0)+'   Forks '+Number(r.forkCount||0)+'   '+(r.primaryLanguage?.name||''),9,'#b5bdb3',400,true));if(r.url)outParts.push('<a href="'+esc(r.url)+'"><rect x="'+x+'" y="'+yy+'" width="'+cw+'" height="'+ch+'" fill="transparent"/></a>');});y+=Math.ceil(repos.length/2)*(ch+10)+35;}
const height=Math.max(500,y+54);
const decor=[motif(corners.topLeft??'fire',12,12),motif(corners.topRight??'titan',1080,12,true),motif(corners.bottomLeft??'demon',12,height-125,false,true),motif(corners.bottomRight??'fire',1080,height-125,true,true)].join('');
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="'+height+'" viewBox="0 0 1200 '+height+'" role="img"><title>'+esc(profileName)+' · GitBreathing profile</title><desc>Generated profile composition with selected identity, social, repository and contribution data.</desc><defs><pattern id="grain" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".35" fill="#fff" opacity=".06"/></pattern></defs><rect width="1200" height="'+height+'" fill="'+esc(bg)+'"/><rect width="1200" height="'+height+'" fill="url(#grain)"/><path d="M54 38H1146" stroke="#343934"/>'+tx(56,25,'GITBREATHING / PROFILE SYSTEM',9,'#9da49b',500,true)+outParts.join('')+decor+(readme.showCornerLabels?tx(58,height-24,'ART PRESET / '+String(preset).toUpperCase(),8,'#778176',400,true):'')+tx(1050,height-24,'GENERATED SVG',8,'#778176',400,true)+'</svg>';
await fs.writeFile(path.join(out,'profile.svg'),svg,'utf8');
console.log('Generated profile.svg for '+login+' with '+show.size+' selectable fields, '+days.length+' contribution days and '+repos.length+' repositories.');
