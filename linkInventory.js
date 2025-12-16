(function(){
    var t = document.title,
        u = location.href,
        h = location.host;

    // Collect all links
    var l = [...document.getElementsByTagName("a")].map(function(e){
        var t = e.href,
            n = e.textContent.trim() || "No Text",
            r = e.querySelector("img,picture source"),
            o, a = e.outerHTML.trim(),
            i = a.replace(/</g,"&lt;").replace(/>/g,"&gt;");
        if(r){
            var s = r.getAttribute("src") || r.getAttribute("srcset") || t;
            if(s.indexOf("http") !== 0) s = new URL(s, location.href).href;
            var c = s.split("?")[0].split("#")[0],
                d = c.split("/").pop();
            o = 'Image Link: <a href="'+s+'" target="_blank">'+d+'</a><br>'+c+'<br><br><a href="'+t+'" target="_blank">'+n+'</a><br>'+t;
        } else {
            o = '<a href="'+t+'" target="_blank">'+n+'</a><br>'+t;
        }
        return {text: n, href: t, colOriginal: o, markupHTML: i, rawMarkup: a};
    });

    // Open new window
    var w = window.open();
    var d = w.document;

    // Header
    var header = d.createElement("div"); header.id = "header";
    var h1 = d.createElement("h1"); h1.innerHTML = "Link Inventory<br><small>"+t+"</small><br><small>"+u+"</small>";
    var linkCount = d.createElement("div"); linkCount.id = "linkCount"; linkCount.textContent = "Link Count: 0";
    var controls = d.createElement("div"); controls.id = "controls";
    header.appendChild(h1); header.appendChild(linkCount); header.appendChild(controls);
    d.body.appendChild(header);

    // Fixed table header
    var theadWrap = d.createElement("div"); theadWrap.id = "theadWrap";
    var thTable = d.createElement("table");
    var thead = d.createElement("thead");
    var tr = d.createElement("tr");
    ["#","Link","HTML"].forEach(function(h){ var th = d.createElement("th"); th.textContent = h; tr.appendChild(th); });
    thead.appendChild(tr); thTable.appendChild(thead); theadWrap.appendChild(thTable);
    d.body.appendChild(theadWrap);

    // Main table
    var table = d.createElement("table"); table.id = "tbl"; table.appendChild(d.createElement("tbody")); 
    d.body.appendChild(table);

    // Back to top
    var btt = d.createElement("div"); btt.id = "backToTop"; btt.textContent = "↑"; d.body.appendChild(btt);

    // Styles
    var style = d.createElement("style"); style.textContent = `
        body{font-family:Arial;margin:0;text-align:center}
        #header{position:fixed;top:0;left:0;width:100%;background:#fff;z-index:1000;padding:12px 0;box-shadow:0 2px 6px rgba(0,0,0,.1)}
        #linkCount{font-weight:bold;font-size:1.4em;margin:6px 0}
        input,select{padding:6px;margin:6px;font-size:1em}
        #theadWrap{position:fixed;left:5%;width:90%;background:#f2f2f2;z-index:900}
        #theadWrap table{width:100%;border-collapse:separate;border-spacing:0}
        #theadWrap th{text-align:left;padding:12px 6px;border-bottom:2px solid #ccc}
        table#tbl{width:90%;margin:auto;border-collapse:separate;border-spacing:0 10px}
        table#tbl td{text-align:left;vertical-align:top;padding:12px 6px}
        table#tbl td:first-child{text-align:left}
        table#tbl tbody tr:nth-child(odd){background:#f9f9f9}
        table#tbl tbody tr:nth-child(even){background:#fff}
        table#tbl tbody tr:hover{background:#e2f0ff;transition:background 0.3s}
        .highlight{background:yellow;pointer-events:none}
        .markup{font-family:Consolas,monospace;background:#fafafa;padding:4px;display:block;white-space:pre-wrap;word-break:break-all}
        #backToTop{position:fixed;bottom:24px;right:24px;width:44px;height:44px;border-radius:50%;background:#333;color:#fff;font-size:24px;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:opacity .3s;z-index:9999}
        #backToTop:hover{background:#000}
    `;
    d.head.appendChild(style);

    // Load jQuery
    var j = d.createElement("script"); j.src = "https://code.jquery.com/jquery-3.7.1.min.js";
    j.onload = function(){
        var $ = w.jQuery.noConflict(true);
        var e = l.slice();

        function updateCount(){
            var c = d.querySelectorAll("#tbl tbody tr").length;
            linkCount.textContent = "Link Count: "+c;
            linkCount.style.transition="none"; linkCount.style.opacity=0;
            setTimeout(function(){ linkCount.style.transition="opacity 0.5s"; linkCount.style.opacity=1; },10);
        }

        function escapeRegex(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }
        function highlight(el, term){
            if(!term || !term.trim()) return;
            var regex = new RegExp(term.trim().split(/\s+/).map(escapeRegex).join("|"),"gi");
            (function walk(node){
                if(node.nodeType===3){ 
                    var p = node.parentNode, t = node.textContent;
                    if(regex.test(t)){
                        var span = document.createElement("span");
                        span.innerHTML = t.replace(regex,function(m){return '<span class="highlight">'+m+'</span>';});
                        p.replaceChild(span,node);
                    }
                } else if(node.nodeType===1 && node.childNodes.length){
                    Array.from(node.childNodes).forEach(walk);
                }
            })(el);
        }

        function highlightHTML(str, term){
            if(!term || !term.trim()) return str;
            var regex = new RegExp(term.trim().split(/\s+/).map(escapeRegex).join("|"),"gi");
            return str.replace(regex,function(m){ return '<span class="highlight">'+m+'</span>'; });
        }

        function renderTable(data,search){
            var tbody = d.querySelector("#tbl tbody"); tbody.innerHTML="";
            data.forEach(function(row,i){
                var tr = d.createElement("tr");
                tr.innerHTML = "<td>"+(i+1)+".</td><td class='linkcol'>"+row.colOriginal+"</td><td class='markupcol'>"+row.markupHTML+"</td>";
                tbody.appendChild(tr);
            });
            tbody.querySelectorAll("td.linkcol").forEach(function(td){ highlight(td,search); });
            tbody.querySelectorAll("td.markupcol").forEach(function(td){ td.innerHTML = highlightHTML(td.innerHTML,search); });
            updateCount();
        }

        renderTable(e,null);

        $("#search",d).on("input",function(){
            var val = this.value.toLowerCase();
            renderTable(e.filter(function(r){ var div=d.createElement("div"); div.innerHTML=r.colOriginal; return div.textContent.toLowerCase().includes(val); }),this.value);
        });

        $("#sort",d).on("change",function(){
            var val=this.value;
            if(val==="text-asc") e.sort((a,b)=>a.text.localeCompare(b.text));
            if(val==="text-desc") e.sort((a,b)=>b.text.localeCompare(a.text));
            if(val==="url-asc") e.sort((a,b)=>a.href.localeCompare(b.href));
            if(val==="url-desc") e.sort((a,b)=>b.href.localeCompare(a.href));
            renderTable(e,$("#search",d).val());
        });

        $("#filter",d).on("change",function(){
            var val=this.value;
            if(val==="all") e=l.slice();
            if(val==="internal") e=l.filter(a=>a.href.includes(h));
            if(val==="external") e=l.filter(a=>!a.href.includes(h));
            renderTable(e,$("#search",d).val());
        });

        // Back to top
        w.addEventListener("scroll",function(){ btt.style.opacity = w.scrollY>300?1:0; });
        btt.onclick = function(){ w.scrollTo({top:0,behavior:"smooth"}); };

        // Auto offset headers
        function setOffset(){
            var h1 = header.offsetHeight, h2 = theadWrap.offsetHeight;
            theadWrap.style.top = h1+"px"; d.body.style.paddingTop = h1+h2+"px";
        }
        setOffset(); w.addEventListener("resize",setOffset);
    }
    d.head.appendChild(j);
})();
