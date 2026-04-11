/*
 * name: budiono;
 * date: feb-06, 16:28, thu-2025; #39; 
 */
 
'use strict';

var MenuCustom={}

MenuCustom.form=new ActionForm2(MenuCustom);
MenuCustom.hideSelect=true;
MenuCustom.hideImport=true;
MenuCustom.hideNew=true;

MenuCustom.show=(tiket)=>{
  tiket.modul='menu_custom';
  tiket.menu.name="Menu Custom";

  const baru=exist(tiket);
  if(baru==-1){
    const newReg=new BingkaiUtama(tiket);
    const indek=newReg.show();
    MenuCustom.form.modePaging(indek);
  }else{
    show(baru);
  }  
}

MenuCustom.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  MenuCustom.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT directory,details"
        +" ,user_name,date_modified"
        +" FROM menu_custom"
        +" ORDER BY directory"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      MenuCustom.readShow(indek);
    });
  })
}

MenuCustom.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
    +" FROM menu_custom"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

MenuCustom.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border="1">'
    +'<tr>'
      +'<th colspan="2">Directory</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
      +'<th colspan="2">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].directory+'</td>'
      +'<td align="left">'+tglWest(d[x].date)+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_change" '
        +' onclick="MenuCustom.formUpdate(\''+indek+'\''
        +',\''+d[x].directory+'\');">'
        +'</button></td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_delete" '
        +' onclick="MenuCustom.formDelete(\''+indek+'\''
        +',\''+d[x].directory+'\');">'
        +'</button></td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  MenuCustom.form.addPagingFn(indek);// #here
}




// eof: 
