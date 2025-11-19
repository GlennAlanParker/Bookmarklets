javascript:(function(){
  var e={
    "\u00A0":"&nbsp;","\u00A1":"&iexcl;","\u00A2":"&cent;","\u00A3":"&pound;","\u00A4":"&curren;","\u00A5":"&yen;","\u00A6":"&brvbar;","\u00A7":"&sect;",
    "\u00A8":"&uml;","\u00A9":"&copy;","\u00AA":"&ordf;","\u00AB":"&laquo;","\u00AC":"&not;","\u00AD":"&shy;","\u00AE":"&reg;","\u00AF":"&macr;",
    "\u00B0":"&deg;","\u00B1":"&plusmn;","\u00B2":"&sup2;","\u00B3":"&sup3;","\u00B4":"&acute;","\u00B5":"&micro;","\u00B6":"&para;","\u00B7":"&middot;",
    "\u00B8":"&cedil;","\u00B9":"&sup1;","\u00BA":"&ordm;","\u00BB":"&raquo;","\u00BC":"&frac14;","\u00BD":"&frac12;","\u00BE":"&frac34;","\u00BF":"&iquest;",
    "\u2018":"&lsquo;","\u2019":"&rsquo;","\u201A":"&sbquo;","\u201C":"&ldquo;","\u201D":"&rdquo;","\u201E":"&bdquo;","\u2020":"&dagger;","\u2021":"&Dagger;",
    "\u2022":"&bull;","\u2026":"&hellip;","\u2030":"&permil;","\u2032":"&prime;","\u2033":"&Prime;","\u2039":"&lsaquo;","\u203A":"&rsaquo;",
    "\u2044":"&frasl;","\u2116":"&num;","\u2122":"&trade;","\u2190":"&larr;","\u2191":"&uarr;","\u2192":"&rarr;","\u2193":"&darr;",
    "\u2194":"&harr;","\u21B5":"&crarr;","\u21D0":"&lArr;","\u21D1":"&uArr;","\u21D2":"&rArr;","\u21D3":"&dArr;","\u21D4":"&hArr;"
  };

  function h(n){
    if(n.nodeType===3 && n.nodeValue.trim()){
      var original = n.nodeValue;

      var replaced = original.replace(/[\u0080-\uFFFF]/g, function(c){
        // Replace char with the entity OR numeric entity — but NO brackets
        return e[c] || "&#"+c.charCodeAt(0)+";";
      });

      if(replaced !== original){
        var frag = document.createDocumentFragment();

        // Split on entities (e.g. &copy;) so they can be wrapped in span
        replaced.split(/(&[A-Za-z0-9#]+;)/).forEach(function(part){
          if(part.match(/^&[A-Za-z0-9#]+;$/)){ 
            // entity: highlight it
            var s=document.createElement("span");
            s.innerHTML = part;
            s.style.background="yellow";
            s.style.color="black";
            s.style.fontWeight="bold";
            frag.appendChild(s);
          } else {
            frag.appendChild(document.createTextNode(part));
          }
        });

        n.replaceWith(frag);
      }
    } else if(n.nodeType===1){
      for(var c of [...n.childNodes]) h(c);
    }
  }

  h(document.body);
})();
