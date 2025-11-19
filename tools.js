javascript:(function(){
  if(window.__devIcon){document.body.removeChild(window.__devIcon);window.__devIcon=null;return;}

  var icon=document.createElement('div');window.__devIcon=icon;
  icon.style.position='fixed';
  icon.style.top='5px';
  icon.style.right='5px';
  icon.style.width='30px';
  icon.style.height='30px';
  icon.style.background='rgba(0,0,0,0.85)';
  icon.style.color='white';
  icon.style.fontSize='16px';
  icon.style.borderRadius='50%';
  icon.style.textAlign='center';
  icon.style.lineHeight='30px';
  icon.style.cursor='pointer';
  icon.style.zIndex=99999;
  icon.style.transition='width 0.2s,height 0.2s,border-radius 0.2s,padding 0.2s';
  icon.innerText='⚡';

  var menu=document.createElement('div');
  menu.style.position='absolute';
  menu.style.top='0';
  menu.style.right='0';
  menu.style.background='rgba(0,0,0,0.95)';
  menu.style.color='white';
  menu.style.padding='5px';
  menu.style.borderRadius='4px';
  menu.style.display='none';
  menu.style.fontSize='12px';
  menu.style.fontFamily='sans-serif';
  menu.style.minWidth='160px';
  menu.style.maxHeight='400px';
  menu.style.overflowY='auto';

  var tools=[
    ['Outline All Elements',()=>{var s=document.createElement('style');s.innerHTML='* {outline:1px solid rgba(255,0,0,0.5)}';document.head.appendChild(s);}],
    ['Show Hidden Elements',()=>{document.querySelectorAll('*').forEach(e=>{if(getComputedStyle(e).display==='none'){e.style.display='block';e.style.background='yellow';}})}],
    ['Show IDs & Classes',()=>{document.querySelectorAll('*').forEach(e=>{if(e.id||e.className){var l=document.createElement('div');l.style.position='absolute';l.style.background='rgba(0,0,255,0.5)';l.style.color='white';l.style.fontSize='10px';l.style.padding='2px';l.innerText=(e.id?`#${e.id} `:'')+(e.className?`.${e.className}`:'');e.appendChild(l);}})}],
    ['Remove CSS',()=>{document.querySelectorAll('link[rel="stylesheet"],style').forEach(s=>s.remove());}],
    ['Inject Custom CSS',()=>{var c=prompt('CSS to inject:','body{background:pink}');if(c){var s=document.createElement('style');s.innerHTML=c;document.head.appendChild(s);}}],
    ['Grid/Flex Overlay',()=>{document.querySelectorAll('*').forEach(e=>{var d=getComputedStyle(e).display;if(d==='grid'||d==='flex'){e.style.outline='2px dashed green';}})}],
    ['Show Images & Broken Ones',()=>{var imgs=document.images;for(var i=0;i<imgs.length;i++){imgs[i].style.border='2px solid blue';imgs[i].onerror=function(){this.style.border='2px solid red';}}}],
    ['Show Image Alt Texts',()=>{document.querySelectorAll('img').forEach(e=>{var alt=e.alt||'(no alt)';var l=document.createElement('div');l.style.position='absolute';l.style.background='yellow';l.style.fontSize='10px';l.innerText=alt;e.parentNode.appendChild(l);});}],
    ['Highlight Links Without Titles',()=>{document.querySelectorAll('a').forEach(l=>{if(!l.title){l.style.border='2px solid red';}})}],
    ['Check Heading Structure',()=>{document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h=>{h.style.border='1px dashed orange';h.style.padding='2px';});}],
    ['Text Contrast Checker',()=>{document.querySelectorAll('*').forEach(e=>{var c=getComputedStyle(e).color,bg=getComputedStyle(e).backgroundColor;console.log(e.tagName,'color:',c,'bg:',bg);});alert('Contrast info logged in console');}],
    ['Quick JS Console',()=>{var c=prompt('JS to run:','');if(c)eval(c);}],
    ['List Global Variables',()=>{alert(Object.keys(window).join('\n'));}],
    ['Check Viewport Width',()=>{alert('Current viewport width: '+window.innerWidth+'px');}],
    ['Emulate Device Width',()=>{var w=prompt('Enter device width in px','375');if(w)document.body.style.width=w+'px';}]
  ];

  tools.forEach(t=>{
    var b=document.createElement('button');
    b.innerText=t[0];
    b.style.display='block';
    b.style.width='100%';
    b.style.margin='2px 0';
    b.style.fontSize='10px';
    b.style.cursor='pointer';
    b.onclick=t[1];
    menu.appendChild(b);
  });

  icon.appendChild(menu);
  icon.onmouseenter=function(){menu.style.display='block';icon.style.width='180px';icon.style.height='auto';icon.style.borderRadius='4px';};
  icon.onmouseleave=function(){menu.style.display='none';icon.style.width='30px';icon.style.height='30px';icon.style.borderRadius='50%';};

  document.body.appendChild(icon);
})();
