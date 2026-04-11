/*
 * name: budiono;
 * date: dec-31, 15:47, sun-2023; percobaan....> simpan dulu ajahh..
 */

class locationBox extends HTMLElement{
  constructor(){
    super();
    const shadow=this.attachShadow({mode: 'open'});
    const css=new CSSStyleSheet();
    css.replaceSync("button:before {content:'\\279C';} ");
    
    var div=document.createElement('DIV');
    var lbl=document.createElement('LABEL');
    var txt=document.createElement('INPUT');
    var btn=document.createElement('BUTTON');

    lbl.textContent="Location ID";    
    txt.size="8";
    txt.style.borderRadius="7px";
    txt.style.border="1px solid grey";

    div.append(lbl);
    div.append(txt);
    div.append(btn);
    
    shadow.adoptedStyleSheets=[css];
    shadow.append(div);
    
    let indek=this.getAttribute('indek');

    btn.onclick=function(){
      Locations.lookUp(indek,'location_id_'+indek);
    }
    
  }
  connectedCallback(){

  }
}

customElements.define("location-box",locationBox);
