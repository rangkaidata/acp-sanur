/*
 * name: budiono;
 * date: nov-22, 16:00, fri-2024; #27; locker;
 */


'use strict';

var Locker={}

Locker.form=new ActionForm2(Locker);
Locker.hideNew=true;
Locker.hideImport=true;

Locker.show=(tiket)=>{
  tiket.modul='locker';
  tiket.menu.name="Data Locker";

  var baru=exist(tiket);
  if(baru==-1){
    var newReg=new BingkaiUtama(tiket);
    var indek=newReg.show();
    Locker.form.modePaging(indek);  
  }else{
    show(baru);
  }  
}

Locker.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
    +" FROM locker"
    +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Locker.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Locker.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT table_name,lock_id,primary_key,data,"
        +" user_name,date_modified"
        +" FROM locker"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" ORDER BY date_modified DESC "
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Locker.readShow(indek);
    });
  })
}

Locker.readShow=(indek)=>{
  var paket=bingkai[indek].paket;
  var d=objectMany(paket.fields,paket.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
  +content.title(indek)
  +content.message(indek)
  +TotalPagingLimit(indek)
  +'<table border=1">'  
    +'<tr>'
      +'<th colspan="2">Table Name</th>'
      +'<th>Data</th>'
      +'<th>User Name</th>'
      +'<th colspan="2">Date Created</th>'
    +'</tr>'  
  if (paket.err.id===0){
    var j,k;
    for (var x in d) {
      k='';
      j=Object.values(JSON.parse(d[x].primary_key));
      for(var f=0;f<j.length;f++){
        if(f==0){
          k=j[f];
        }else{
          k+=', '+j[f];
        }
      }
      
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].table_name+'</td>'
        //+'<td align="left">'+str50(d[x].data)+'</td>'
        +'<td align="left">'+k+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button"'
            +' id="btn_detail"'
            +' onclick="Locker.readOne(\''+indek+'\''
            +',\''+d[x].lock_id+'\');">'
            +'</button>'
        +'</td>'
      +'</tr>';
    }
  }
  html+='</table>'
  +'</div>';

  content.html(indek,html);
  if(paket.err.id!=0) content.infoPaket(indek,paket);
  Locker.form.addPagingFn(indek);
}

Locker.readOne=(indek,lock_id)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>Locker.form.lastMode(indek));
  toolbar.delet(indek,()=>Locker.deleteExecute(indek,lock_id));
  bingkai[indek].metode="View [V]";
  
  db.execute(indek,{
    query:"SELECT table_name,data "
    +" FROM locker"
    +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
    +" AND lock_id='"+lock_id+"'"
  },(paket)=>{
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      var j=JSON.parse(d.data);
      var k=Object.keys(j);
      var v=Object.values(j);
      var val='';
      
      var html='<div style="padding:0.5rem;"><ul>'
        +content.title(indek)
        +content.message(indek)
        +'<h3 align="left">Table Name: '+d.table_name+'</h3>';
      html+='<table style="table-layout: fixed;">'
      
      for(var i=0;i<k.length;i++){
        if(typeof v[i]==="object"){
          v[i]=JSON.stringify(v[i]);
        }
        
        html+='<tr>'
        +'<td align="right"><b>'+k[i]+' ('+ i+') </b></td>'
        +'<td><span style="display:block;word-wrap:break-word;">'
        +v[i]+'</span></td>'
        +'</tr>'
      }
      html+="</table>"
      html+='</div>';
      content.html(indek,html);
    }    
  });
}

Locker.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT table_name,lock_id,primary_key,data,"
      +" user_name,date_created"
      +" FROM locker "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" ORDER BY date_modified DESC "
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Locker.selectShow(indek);
  });
}

Locker.selectShow=(indek)=>{
  var paket=bingkai[indek].paket;
  var d=objectMany(paket.fields,paket.data);
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
      +'<th colspan="2">Table Name</th>'
      +'<th>Data</th>'
      +'<th>User Name</th>'
      +'<th>Date Created</th>'
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
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].table_name+'</td>'
        +'<td align="left">'+str50(d[x].data)+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_created)+'</td>'
        +'</tr>';
      }
    }
  html+='</table>'
  +'</div>';

  content.html(indek,html);
  if(paket.err.id!=0) content.infoPaket(indek,paket);
}

Locker.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  var d=objectMany(p.fields,p.data);
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM locker "
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND lock_id = "+d[i].lock_id
      });
    }
  }
  db.deleteMany(indek,a);
}

Locker.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM locker "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND table_name LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR data LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Locker.search=(indek)=>{
  Locker.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT table_name,lock_id,primary_key,data,"
        +" user_name,date_created"
        +" FROM locker"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND table_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR data LIKE '%"+bingkai[indek].text_search+"%'"
    },()=>{
      PAGING=false;// karena ini mode search;
      bingkai[indek].metode=MODE_RESULT;
      Locker.readShow(indek);
    });
  });
}

Locker.deleteExecute=(indek,lock_id)=>{
  db.run(indek,{
    query:"DELETE FROM locker "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND lock_id = '"+lock_id+"'"
  },(p)=>{
    message.infoPaket(indek,p);
  });
}


Locker.exportExecute=(indek)=>{
  db.execute(indek,{
    query:"SELECT lock_id,table_name,primary_key,data"
    +" FROM locker "
    +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
  },(paket)=>{
    if (paket.err.id===0){
      downloadJSON(indek,JSON.stringify(paket),'locker.json');
    }else{
      content.infoPaket(indek,paket);
    }    
  });
}

// eof: 274;266;
