javascript:(function(){
  if(window.__devMenuIcon){document.body.removeChild(window.__devMenuIcon);window.__devMenuIcon=null;return;}

  var icon=document.createElement('div');window.__devMenuIcon=icon;
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
  icon.innerText='⚡';

  var menu=document.createElement('div');
  menu.style.position='fixed';
  menu.style.top='40px';
  menu.style.right='5px';
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
    ['Outline All',()=>{var s=document.createElement('style');s.innerHTML='* {outline:1px solid rgba(255,0,0,0.5)}';document.head.appendChild(s);}],
    ['Show Hidden',()=>{document.querySelectorAll('*').forEach(e=>{if(getComputedStyle(e).display==='none'){e.style.display='block';e.style.background='yellow';}})}],
    ['IDs & Classes',()=>{document.querySelectorAll('*').forEach(e=>{if(e.id||e.className){var l=document.createElement('div');l.style.position='absolute';l.style.background='rgba(0,0,255,0.5)';l.style.color='white';l.style.fontSize='10px';l.style.padding='2px';l.innerText=(e.id?`#${e.id} `:'')+(e.className?`.${e.className}`:'');e.appendChild(l);}})}],
    ['Remove CSS',()=>{document.querySelectorAll('link[rel="stylesheet"],style').forEach(s=>s.remove());}],
    ['Inject CSS',()=>{var c=prompt('CSS to inject:','body{background:pink}');if(c){var s=document.createElement('style');s.innerHTML=c;document.head.appendChild(s);}}],
    ['Grid/Flex',()=>{document.querySelectorAll('*').forEach(e=>{var d=getComputedStyle(e).display;if(d==='grid'||d==='flex'){e.style.outline='2px dashed green';}})}],
    ['Show Images',()=>{var imgs=document.images;for(var i=0;i<imgs.length;i++){imgs[i].style.border='2px solid blue';imgs[i].onerror=function(){this.style.border='2px solid red';}}}],
    ['Alt Texts',()=>{document.querySelectorAll('img').forEach(e=>{var alt=e.alt||'(no alt)';var l=document.createElement('div');l.style.position='absolute';l.style.background='yellow';l.style.fontSize='10px';l.innerText=alt;e.parentNode.appendChild(l);});}],
    ['JS Console',()=>{var c=prompt('JS to run:','');if(c)eval(c);}]
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

  var closeBtn=document.createElement('div');
  closeBtn.innerText='✖';
  closeBtn.style.textAlign='right';
  closeBtn.style.cursor='pointer';
  closeBtn.onclick=function(){menu.style.display='none';};
  menu.insertBefore(closeBtn, menu.firstChild);

  icon.onclick=function(){menu.style.display=(menu.style.display==='none')?'block':'none';};

  document.body.appendChild(icon);
  document.body.appendChild(menu);
})();
