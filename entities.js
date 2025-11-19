javascript:(function(){
  var e={
    // Essentials / Most common
    "\u00A0":"&nbsp;",
    "\u2019":"&rsquo;",
    "\u2018":"&lsquo;",
    "\u201C":"&ldquo;",
    "\u201D":"&rdquo;",
    "\u2013":"&ndash;",
    "\u2014":"&mdash;",
    "\u2026":"&hellip;",
    "\u00A9":"&copy;",
    "\u00AE":"&reg;",
    "\u2122":"&trade;",

    // Latin-1
    "\u00A1":"&iexcl;","\u00A2":"&cent;","\u00A3":"&pound;","\u00A4":"&curren;","\u00A5":"&yen;",
    "\u00A6":"&brvbar;","\u00A7":"&sect;","\u00A8":"&uml;","\u00AA":"&ordf;","\u00AB":"&laquo;",
    "\u00AC":"&not;","\u00AD":"&shy;","\u00AF":"&macr;","\u00B0":"&deg;","\u00B1":"&plusmn;",
    "\u00B2":"&sup2;","\u00B3":"&sup3;","\u00B4":"&acute;","\u00B5":"&micro;","\u00B6":"&para;",
    "\u00B7":"&middot;","\u00B8":"&cedil;","\u00B9":"&sup1;","\u00BA":"&ordm;","\u00BB":"&raquo;",
    "\u00BC":"&frac14;","\u00BD":"&frac12;","\u00BE":"&frac34;","\u00BF":"&iquest;",

    // Lower punctuation / bullets
    "\u201A":"&sbquo;","\u201E":"&bdquo;","\u2022":"&bull;",

    // Arrows
    "\u2190":"&larr;","\u2191":"&uarr;","\u2192":"&rarr;","\u2193":"&darr;","\u2194":"&harr;",
    "\u21D0":"&lArr;","\u21D1":"&uArr;","\u21D2":"&rArr;","\u21D3":"&dArr;","\u21D4":"&hArr;",

    // Math symbols
    "\u00D7":"&times;","\u00F7":"&divide;","\u2212":"&minus;","\u2260":"&ne;",
    "\u2264":"&le;","\u2265":"&ge;","\u221E":"&infty;","\u2202":"&part;","\u220F":"&prod;",
    "\u2211":"&sum;","\u2208":"&in;","\u2209":"&notin;","\u221A":"&radic;","\u222B":"&int;",

    // Misc
    "\u2020":"&dagger;","\u2021":"&Dagger;","\u2030":"&permil;","\u2032":"&prime;",
    "\u2033":"&Prime;","\u2039":"&lsaquo;","\u203A":"&rsaquo;","\u2044":"&frasl;","\u2116":"&num;"
  };

  function highlight(node){
    if(node.nodeType===3 && node.nodeValue.trim()){
      var original=node.nodeValue;

      // Replace each matched char with the actual entity *as text* (not rendered)
      var replaced = original.replace(/[\u00A0-\uFFFF]/g, function(c){
        return e[c] || ("&#"+c.charCodeAt(0)+";");
      });

      if(replaced!==original){
        var frag=document.createDocumentFragment();
        
        // Split so each entity is individually processed
        replaced.split(/(&[A-Za-z0-9#]+;)/).forEach(function(part){
          if(/^&[A-Za-z0-9#]+;$/.test(part)){
            var s=document.createElement("span");
            // Show raw entity text
            s.textContent = part;
            s.style.background="yellow";
            s.style.color="black";
            s.style.fontWeight="bold";
            s.style.padding="1px 2px";
            frag.appendChild(s);
          } else {
            frag.appendChild(document.createTextNode(part));
          }
        });

        node.replaceWith(frag);
      }
    } else if(node.nodeType===1){
      [...node.childNodes].forEach(highlight);
    }
  }

  highlight(document.body);
})();
