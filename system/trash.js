/*
 * name: budiono;
 * date: feb-28, 08:49, wed-2024; new;
 * edit: mar-18, 17:25, mon-2024; basic sql;
 * edit: jul-26, 19:08, fri-2024; r-10;
 * edit: jul-30, 12:18, tue-2024; r11;
 */
 
'use strict';

var Trash={}

Trash.form=new ActionForm2(Trash);
Trash.hideNew=true;
Trash.hideImport=true;
Trash.table_name="trash";

Trash.show=(tiket)=>{
  tiket.modul='trash';
  tiket.menu.name="Trash";

  const baru=exist(tiket);
  if(baru==-1){
    const newReg=new BingkaiUtama(tiket);
    const indek=newReg.show();
    Trash.form.modePaging(indek);  
  }else{
    show(baru);
  }  
}

Trash.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
    +" FROM trash"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Trash.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Trash.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT index,modul,data,user_name,date_trashed"
      +" FROM trash"
      +" ORDER BY date_trashed DESC "
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Trash.readShow(indek);
    });
  })
}

Trash.readShow=(indek)=>{
  var paket=bingkai[indek].paket;
  var d=objectMany(paket.fields,paket.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
  +content.title(indek)
  +content.message(indek)
  +TotalPagingLimit(indek)
  +'<table border=1">'  
    +'<tr>'
      +'<th colspan="2">Modul</th>'
      +'<th>Data</th>'
      +'<th>User Name</th>'
      +'<th colspan="2">Trashed On</th>'
    +'</tr>'  
  if (paket.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'+d[x].index+'</td>'
        +'<td align="left">'+d[x].modul+'</td>'
        +'<td align="left">'+str50(d[x].data)+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_trashed)+'</td>'
        +'<td align="center">'
          +'<button type="button"'
            +' id="btn_detail"'
            +' onclick="Trash.readOne(\''+indek+'\''
            +',\''+d[x].index+'\');">'
            +'</button>'
        +'</td>'
        
      +'</tr>';
    }
  }
  html+='</table>'
  +'</div>';

  content.html(indek,html);
  if(paket.err.id!=0) content.infoPaket(indek,paket);
  Trash.form.addPagingFn(indek);
}

Trash.readOne=(indek,index)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>Trash.form.lastMode(indek));
  bingkai[indek].metode="View";
  
  db.execute(indek,{
    query:"SELECT modul,data "
    +" FROM trash"
    +" WHERE index="+index
  },(paket)=>{
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      var j=JSON.parse(d.data);
      var k=Object.keys(j);
      var v=Object.values(j);
      var html='<div style="padding:0.5rem;"><ul>'
        +content.title(indek)
        +'<h3 align="left">modul: '+d.modul+'</h3>';
      html+='<table style="table-layout: fixed;">'
      +'<tr>'
      +'<th>Key</th>'
      +'<th>Value</th>'
      +'</tr>'
      for(var i=0;i<k.length;i++){
        if(typeof v[i]==="object"){
          v[i]=JSON.stringify(v[i]);
        }
        
        html+='<tr>'
        +'<td align="right">'+k[i]+' ('+i+')'+'</td>'
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
      content.html(indek,html);
    }    
  });
}

Trash.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT index,modul,data,user_name,date_trashed"
    +" FROM trash "
    +" ORDER BY date_trashed DESC "
    +" LIMIT "+bingkai[indek].paging.limit
    +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Trash.selectShow(indek);
  });
}

Trash.selectShow=(indek)=>{
  const paket=bingkai[indek].paket;
  const d=objectMany(paket.fields,paket.data);
  var n=bingkai[indek].paging.offset;
  
  var html='<div style="padding:0.5rem;">'
  +content.title(indek)
  +content.message(indek)
  +'<br>'
  +'<table border=1>'
    +'<tr>'
      +'<td align="center">'
      +'<input type="checkbox"'
      +' id="check_all_'+indek+'"'
      +' onclick="checkAll(\''+indek+'\')">'
      +'</td>'
      +'<th colspan="2">Modul</th>'
      +'<th>Data</th>'
      +'<th>User Name</th>'
      +'<th>Trashed On</th>'
    +'</tr>';
  
    if (paket.err.id===0){
      for (var x in d) {
        n++;
        html+='<tr>'
        +'<td align="center">'
          +'<input type="checkbox"'
          +' id="checked_'+x+'_'+indek+'"'
          +' name="checked_'+indek+'" >'
        +'</td>'
        +'<td align="center">'+d[x].index+'</td>'
        +'<td align="left">'+d[x].modul+'</td>'
        +'<td align="left">'+str50(d[x].data)+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_trashed)+'</td>'
        +'</tr>';
      }
    }
  html+='</table>'
  +'</div>';

  content.html(indek,html);
  if(paket.err.id!=0) content.infoPaket(indek,paket);
}

Trash.exportExecute=(indek)=>{
/*  
  db.execute(indek,{
    query:"SELECT modul,data"
    +" FROM trash "
  },(paket)=>{
    if (paket.err.id===0){
      downloadJSON(indek,JSON.stringify(paket),'trash.json');
    }else{
      content.infoPaket(indek,paket);
    }    
  });
*/
  var table_name=Trash.table_name;
  var sql=sqlDatabase3(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

Trash.search=(indek)=>{
  db.execute(indek,{
    query:"SELECT index,modul,data,user_name,date_trashed"
    +" FROM trash"
    +" WHERE modul LIKE '%"+bingkai[indek].text_search+"%'"
    +" OR data LIKE '%"+bingkai[indek].text_search+"%'"
  },()=>{
    bingkai[indek].count=bingkai[indek].paket.count;
    PAGING=false;
    bingkai[indek].metode=MODE_RESULT;
    Trash.readShow(indek);
  });
}

Trash.deleteAllExecute=(indek)=>{
  const d=bingkai[indek].paket.data;
  const e=document.getElementsByName('checked_'+indek);
  const c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM trash "
        +" WHERE index = "+d[i][0]
      });
    }
  }
  db.deleteMany(indek,a);
}


// eof: 197;245;
