/*
 * name: budiono;
 * date: feb-28, 08:49, wed-2024; new
 */
 
'use strict';

var Clipboard={}

Clipboard.table_name="clipboard";
Clipboard.title="Clipboard";

Clipboard.form=new ActionForm2(Clipboard);
//Clipboard.hideSelect=true;
//Clipboard.hideImport=true;
Clipboard.hideNew=true;

Clipboard.show=(tiket)=>{
  tiket.modul=Clipboard.table_name;
  tiket.menu.name=Clipboard.title;

  const baru=exist(tiket);
  if(baru==-1){
    const newReg=new BingkaiUtama(tiket);
    const indek=newReg.show();
    createFolder(indek,()=>{
      Clipboard.form.modePaging(indek);
    });
  }else{
    show(baru);
  }  
}


Clipboard.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
    +" FROM clipboard"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Clipboard.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Clipboard.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT clipboard_id,modul,name,content,"
        +" user_name,date_modified"
        +" FROM clipboard"
        +" ORDER BY date_created"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Clipboard.readShow(indek);
    });
  })
}

Clipboard.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border="1">'
    +'<tr>'
      +'<th colspan="2">Table</th>'
      +'<th>Name</th>'
      +'<th>Size</th>'

      +'<th>Owner</th>'
      +'<th>Modified</th>'
      +'<th colspan="2">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].modul+'</td>'
      +'<td align="left">'+xHTML(d[x].name)+'</td>'
      +'<td align="right">'+parseInt(String(d[x].content).length)/1000+' kB</td>'
      
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'<td align="center">'        
        +'<button type="button" '
        +' id="btn_delete" '
        +' onclick="Clipboard.formDelete(\''+indek+'\''
        +',\''+d[x].clipboard_id+'\');">'
        +'</button></td>'
        +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Clipboard.form.addPagingFn(indek);// #here
}

Clipboard.formEntry=(indek,metode)=>{
  
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<div id="view_'+indek+'"></div>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
}


Clipboard.formDelete=(indek,clipboard_id)=>{
  bingkai[indek].clipboard_id=clipboard_id;
  Clipboard.form.modeDelete(indek);
}

Clipboard.deleteExecute=function(indek){
  db.execute(indek,{
    query:"DELETE FROM clipboard"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND clipboard_id='"+bingkai[indek].clipboard_id+"'"
  },(p)=>{
    if(p.err.id==0) Clipboard.finalPath(indek);
  });
}

Clipboard.finalPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Clipboard.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Clipboard.properties(indek);})
  }
}

Clipboard.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
      +" FROM clipboard"
      +" WHERE clipboard_id='"+bingkai[indek].clipboard_id+"'"
  },(paket)=>{
    if (paket.err.id==0){
      var d=objectOne(paket.fields,paket.data);
      var j=(JSON.parse(d.content)).join(""); // join array
      var dd=JSON.parse(atob(j));
      var k=dd.fields;
      var v=dd.rows[0];
      var html='<div style="padding:0.5rem;"><ul>'
          +content.title(indek)
          +'<p><b>Modul:</b>&nbsp;<i>'+d.modul+'</i></p>'
          +'<p><b>Size:</b>&nbsp;<i>'+j.length+'</i>&nbsp;Byte</p>'
          +'<table style="table-layout: fixed;">'
          +'<tr>'
          +'<th>Key</th>'
          +'<th>Value</th>'
          +'</tr>'
        for(var i=0;i<k.length;i++){
          if(typeof v[i]==="object"){
            v[i]=JSON.stringify(v[i]);
          }

          html+='<tr>'
          +'<td align="right"><b>'+k[i]+' ('+i+')'+'</b></td>'
          +'<td>'
            +'<span style="display:block;'
            +'word-wrap:break-word;padding:2px 0px 2px 0px;">'
              +v[i]
            +'</span>'
          +'</td>'
          +'</tr>'
        }
        html+="</table>"
        html+='</div>';
      setiH('view_'+indek,html);
      message.none(indek);
    }
    return callback();
  });
}

Clipboard.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM clipboard "
      +" WHERE clipboard_id='"+bingkai[indek].clipboard_id+"'"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data) ;      
      bingkai[indek].file_id=d.file_id;
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

Clipboard.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT clipboard_id,modul,name,content,"
      +" user_name,date_modified"
      +" FROM clipboard"
//      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
//      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date_created"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Clipboard.selectShow(indek);
  });
}

Clipboard.selectShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +'<table border="1">'
    +'<tr>'
      +'<td align="center">'
      +'<input type="checkbox"'
        +' id="check_all_'+indek+'"'
        +' onclick="checkAll(\''+indek+'\')">'
        +'</td>'
      +'<th colspan="2">Table</th>'
      +'<th>Name</th>'
      +'<th>Size</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
    +'</tr>';

  if (p.err.id===0){
    var x;
    for (x in d) {
      n++;
      html+='<tr>'
      +'<td align="center">'
      +'<input type="checkbox"'
        +' id="checked_'+x+'_'+indek+'"'
        +' name="checked_'+indek+'"'
        +' value="'+d[x].location_id+'">'
        +'</td>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].modul+'</td>'
      +'<td align="left">'+d[x].name+'</td>'
      +'<td align="right">'+parseInt(String(d[x].content).length)/1000+' kB</td>'
      
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

Clipboard.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  var i;
  
  for(i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM clipboard"
          +" WHERE clipboard_id='"+d[i].clipboard_id+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}
