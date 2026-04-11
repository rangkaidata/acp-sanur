/*
 * auth: budiono
 * date: aug-31, 08:29, thu-2023; new;10;
 * edit: sep-04, 21:49, mon-2023; add;59;
 * edit: sep-05, 11:10, tue-2023; add;64;
 * -----------------------------; happy new year 2024;
 * edit: jan-09, 15:27, tue-2024; add content.message;
 * edit: dec-09, 20:50, mon-2024; #30; 
 */

'use strict';

content.html=function(indek,isi){
  document.getElementById("frm_konten_"+indek).innerHTML=isi;
}

content.wait=function(indek){
  document.getElementById("frm_konten_"+indek).innerHTML=
    '<span style="background-color:gold;'
    +'padding:0.5rem;margin:0.1rem;border-radius:0rem 1rem 1rem;">'
    +'Sending, please wait ...</span>';
};

content.title=function(indek){/*
  const html='<div style="display:flex;flex-direction:row;'
    +'margin-bottom:0.1rem;border:0px solid blue;">'
      +'<div style="flex-grow:1;align-self:center;'
      +'border:0px solid blue;">'
        +'<h1 style="margin:0rem 0 1rem 0;'
          +'border-radius:0px 30px 30px 0px;'
          +'">'+bingkai[indek].metode+'</h1>'
      +'</div>'
      +'<div style="flex-grow:1;text-align:right;'
      +'align-self:center;border:0px solid blue;">'
        +'<h1 style="margin:0rem 0 1rem 0;'
          +'border-radius:0px 30px 30px 0px;'
          +'">'+bingkai[indek].menu.name+'</h1>'
      +'</div>'
    +'</div>';
*/    
  var kondisi=bingkai[indek].metode;
  var sedang='';
  
  switch(kondisi){
    case MODE_CREATE:
      sedang="(C)";
      break;
      
    case MODE_READ:
      sedang="(R)";
      break;
      
    case MODE_UPDATE:
      var offset=bingkai[indek].offset || 0;
      var count=bingkai[indek].count || 0;
      sedang="(U) - "+ (offset+1)+'/'+count;
      break;
      
    case MODE_DELETE:
      sedang="(D)";
      break;
      
    case MODE_SEARCH:
      sedang="(T)";
      break;
      
    case MODE_EXPORT:
      sedang="(E)";
      break;
      
    case MODE_IMPORT:
      sedang="(I)";
      break;
      
    case MODE_SELECT:
      sedang="(X)";
      break;
      
    case MODE_RESULT:
      sedang="(S)";
      break;
      
    case MODE_VIEW:
      //sedang="(V)";
      var offset=bingkai[indek].offset || 0;
      var count=bingkai[indek].count || 0;
      sedang="(V) - "+ (offset+1)+'/'+count;
      break;
      
    default:
      sedang="";
  }

  var html2='<div style="letter-spacing:3px;'
    +'padding: 2px 15px 0px 15px;'
    +'color:blue;border:1px solid blue;'
    +'border-radius:10px;">'
    +'<i>'+bingkai[indek].menu.name+' '+sedang+'</i></div>'
//    +'<i>'+offset+'/'+count+'</i></div>'
  setiH('frm_toolbar_title_'+indek, html2 );

  var html='<div style="border:1px white solid;margin:0px;padding:0px;">'
    +'<div style="float:left;margin-top:0px;padding-top:0px">'
      +'<h2>'+bingkai[indek].metode+'</h2>'
    +'</div>'
    +'<div style="text-align:right;display:block;">'
      +'<h2>'+bingkai[indek].menu.name+'</h2>'
    +'</div>'
  +'</div>'
  html='';

  return (html);
}

content.infoPaket=function(indek,paket){
  message.paket(indek,paket);
  statusbar.message(indek,paket);
  document.getElementById('frm_konten_'+indek).scrollTop = 0;
}

content.search=function(indek,func){
  this.html(indek,'<div style="padding:0.5rem;">'
    +this.title(indek)
    +'<input type="text" id="text_search_'+indek+'"'
    +' placeholder="Type text to search ..."'
    +' value="'+bingkai[indek].text_search+'"'
    +' onfocus="this.select()">'
    +'<button type="button"'
    +' id="btn_search_'+indek+'"'
    +' class="btn_search"></button></div>');

  document.getElementById('text_search_'+indek).focus();
  document.getElementById('btn_search_'+indek).onclick=func;
  statusbar.ready(indek);
}

content.infoError=function(indek,paket){
  this.html(indek,db.info(paket));  
}

content.message=function(indek){
  return  '<div id="msg_'+indek+'" '
      +'style="margin-bottom:1rem;line-height:1.5rem;">'
      +'</div>';
}


// eof: 10;59;64;71;
//     //+'<div id="msg_'+indek+'" style="margin:0.5rem;"></div>'
