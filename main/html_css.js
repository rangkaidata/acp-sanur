/*
 * name: budiono;
 * edit: may-18, 16:11, sun-2025; #55; journal_type;
 */ 


function setTR(height){
  return '<tr style="height:'+height+'px;">';
}

function setTH(width,align,text){
  return '<th '
    +' style="width:'+width+'px;'
    +' text-align:'+align+';">'
    +'<div style="width:100%;display:inline;">'
    +'<span style="position:relative;'
    +'width:'+width+'px;'
    +'overflow:hidden;'
    +'padding:0;margin:0;'
    +'border:0px solid red;">'
    +text
    +'</span>'
    +'</div>'
    +'</th>';
}

function setLabel(left,width,align,text){
  return '<span '
    +' style="left:'+left+'px;'
    +' position:absolute;'
    +' border:0px solid grey;'
    +' width:'+width+'px;'
    +' overflow: hidden;'
//    +' border:1px solid grey;'
    +' text-align:'+align+';" >'
    + text
    +'</span>';
}

function setTotalA(left,width,align,text){
  return '<span '
    +' style="left:'+left+'px;'
    +' position:absolute;'
    +' border:0px solid grey;'
    +' width:'+width+'px;'
    +' overflow: hidden;'
//    +' border:1px solid grey;'
    +' margin-top:3px;'
    +' padding-top:3px;'
    +' border-top:1px solid grey;'
    +' border-bottom:4px double grey;'
    +' text-align:'+align+';" >'
    +'<b><i>'+text+'</i></b>'
    +'</span>';
}

class rptHTML {
  setCompany(t){
    return '<p '
      +'style="text-align:center;'
      +'font-size:20px;font-weight:bolder;'
      +'border:0px solid grey;'
      +'line-height:1;">'+t
      +'</p>';
  }  

  setTitle(t){
    return '<p '
      +'style="text-align:center;'
      +'font-weight:bolder;'
      +'line-height:0.1;'
      +'font-size:16px;">'+t
      +'</p>'; 
  }
  
  setNone(){
    return '<p>&nbsp;</p>'
      +'Filter: <br>';
  }
  
  setFromTo(from,to){
    return '<p '
      +'style="text-align:center;'
      +'font-weight:bolder;'
      +'line-height:1.5;'
      +'font-size:14px;">'
      +'From&nbsp;'+tglWest(from)
      +'&nbsp;to&nbsp;'+tglWest(to)
      +'</p>'
      +'Filter: <br>';
  }
  
  setFromToText(from,to,teks){
    return '<p '
      +'style="text-align:center;'
      +'font-weight:bolder;'
      +'line-height:1.5;'
      +'font-size:14px;">'
      +'From&nbsp;'+tglWest(from)
      +'&nbsp;to&nbsp;'+tglWest(to)
      +'<br>'
      +teks
      +'</p>';
  }
  
  setAsof(date){
    return '<p '
      +'style="text-align:center;'
      +'font-weight:bolder;'
      +'line-height:1.5;'
      +'font-size:14px;">'
      +'As of&nbsp;'+tglWest(date)
      +'</p>'
      +'Filter: <br>';
  }
  
  setAsof2(date,t){
    return '<p '
        +'style="text-align:center;'
        +'font-weight:bolder;'
        +'line-height:1.5;'
        +'font-size:14px;">'
        +'As of&nbsp;'+tglWest(date)
      +'</p>'
      +'<p '
        +'style="font-weight:bolder;text-align:center;'
        +'line-height:0.1;'
        +'font-size:14px;">'
        +t
      +'</p>';
  }
  
  setDate(date){
    return '<p '
      +'style="text-align:center;'
      +'font-weight:bolder;'
      +'line-height:1.5;'
      +'font-size:14px;">'+tglWest(date)+'</p>'
      +'Filter: <br>';
  }
  
  setTotalA(left,width,align,text){
    return '<span '
      +' style="left:'+left+'px;'
      +' position:absolute;'
      +' width:'+width+'px;'
      +' overflow: hidden;'
      +' margin-top:3px;'
      +' padding: 5px 2px 0px 5px;'// [top,right,bottom,left]
      +' border-top:1px solid grey;'
//      +' border-right:1px solid grey;'
//      +' border-left:1px solid grey;'
      +' border-bottom:4px double grey;'
      +' text-align:'+align+';" >'
      +'<b><i>'+text+'</i></b>'
      +'</span>';
  }
  
  setSubTotal(left,width,align,text){
    return '<span '
      +' style="left:'+left+'px;'
      +' position:absolute;'
      +' width:'+width+'px;'
      +' overflow: hidden;'
      +' padding: 1px 2px 5px 5px;'// [top,right,bottom,left]
      +' border-top:1px solid grey;'
      +' text-align:'+align+';" >'
      +'<b><i>'+text+'</i></b>'
      +'</span>';
  }
  
  setTotal(left,width,align,text){
    return '<span '
      +' style="left:'+left+'px;'
      +' position:absolute;'
      +' border:0px solid grey;'
      +' width:'+width+'px;'
      +' overflow: hidden;'
      +' margin-top:3px;'
      +' padding-top:3px;'
      +' border-top:1px solid grey;'
      +' text-align:'+align+';" >'
      +'<b><i>'+text+'</i></b>'
      +'</span>';
  }
  
  setHeader(left,width,align,text){
    return '<span '
      +' style="left:'+left+'px;'
      +' position:absolute;'
      +' border:0px solid grey;'
      +' width:'+width+'px;'
      +' overflow: hidden;'
//      +' border:1px solid gold;'
      +' text-align:'+align+';'
      +' font-weight:bolder;'
      +' font-size:14px;'
      +' padding-left:5px;'
      +' padding-right:1px;'
      +' padding-top:3px;'
      +'" >'
      +text
      +'</span>';
  }
  
  setLabel(left,width,align,text){
    return '<span '
      +' style="left:'+left+'px;'
      +' position:absolute;'
      +' border:0px solid grey;'
      +' width:'+width+'px;'
      +' overflow: hidden;'
//      +' border:1px solid grey;'
      +' padding: 1px 2px 0px 5px;'// top,right,bottom,left
      +' text-align:'+align+';" >'
      + text
      +'</span>';
  }
};
