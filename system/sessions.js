/*
 * auth: budiono;
 * date: Mar-05, 15:51, thur-2026;
 */ 

'use strict';

var Sessions={}
  
Sessions.table_name='sessions';
Sessions.title='Login Sessions';
Sessions.form=new ActionForm2(Sessions);
Sessions.hideNew=true;
Sessions.hideExport=true;
Sessions.hideImport=true;

Sessions.show=(tiket)=>{
  tiket.modul=Sessions.table_name;
  tiket.menu.name=Sessions.title;
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    Sessions.form.modePaging(indek);
  }else{
    show(baru);
  }
}

Sessions.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Sessions.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT login_id, user_name,date_created,timeout"
        +" FROM login"
        +" ORDER BY date_created"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Sessions.readShow(indek);
    });
  })
}

Sessions.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
    +" FROM login"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Sessions.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var date_expired;
  
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border="1">'
    +'<tr>'
      +'<th colspan="2">Login ID</th>'
      +'<th>User Name</th>'
      +'<th>Timeout</th>'
      +'<th>Created</th>'
      +'<th>Status</th>'
      +'<th colspan="2">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    
    var tgl=new Date();
    var tgl_create;
    var hasil=0;
    
    tgl.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    
    for (var x in d) {
      
      tgl_create=new Date(parseInt(d[x].date_created));
      
      date_expired=Sessions.durasi(tgl,tgl_create,d[x].timeout);
      
      n++;
      html+='<tr>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+blokID2(d[x].login_id)+'</td>'
      +'<td align="left">'+d[x].user_name+'</td>'
      +'<td align="center">'+array_expired_mode[d[x].timeout]+'</td>'
      +'<td align="center">'+tglInt(d[x].date_created)+'</td>'
      +'<td align="center">'+(date_expired==1?'Expired':'')+'</td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_delete" '
        +' onclick="Sessions.formDelete(\''+indek+'\''
        +',\''+d[x].login_id+'\');">'
        +'</button></td>'
      +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Sessions.form.addPagingFn(indek);// #here
}

Sessions.durasi=(tgl,tgl_create,exp_mode)=>{
  var durasi=Math.abs((tgl.getTime()-tgl_create.getTime()));
  var durasi_day=Math.floor((durasi/1000)/60/60/24);
  var durasi_hour=Math.floor((durasi/1000)/60/60%24);
  var durasi_minute=Math.floor((durasi/1000)/60%60);
  var durasi_second=Math.floor((durasi/1000)%60);
  var berhenti=0;
  var berhentiText='';
  
  if(exp_mode==0){
    // 15 menit
    if(parseInt(durasi_minute)>15){berhenti=1;}
    if(parseInt(durasi_hour)>0){berhenti=1;}// karena lewat dari 1 jam
    if(parseInt(durasi_hour)>8){berhenti=1;}// karena lewat dari 8 jam
    if(parseInt(durasi_hour)>24){berhenti=1;}// karena lewat dari 24 jam
    if(parseInt(durasi_day)>0){berhenti=1;}// karena lewat dari 1 hari
    berhentiText='15 minute';
    
  }else if(exp_mode==1){
    // 1 jam
    if(parseInt(durasi_hour)>1){berhenti=1;}
    if(parseInt(durasi_hour)>8){berhenti=1;}
    if(parseInt(durasi_hour)>24){berhenti=1;}
    if(parseInt(durasi_day)>0){berhenti=1;}
    berhentiText='1 hour';
    
  }else if(exp_mode==2){
    // 8 jam
    if(parseInt(durasi_hour)>8){berhenti=1;}
    if(parseInt(durasi_hour)>24){berhenti=1;}
    if(parseInt(durasi_day)>0){berhenti=1;}
    berhentiText='8 hour';
    
  }else if(exp_mode==3){
    // 24 jam
    if(parseInt(durasi_hour)>24){berhenti=1;}
    if(parseInt(durasi_day)>0){berhenti=1;}
    berhentiText='24 hour';
    
  }else if(exp_mode==4){
    // never expired
    berhentiText='Never Expired';
  }
  
  return berhenti
}

Sessions.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    +'<ul>'
    
    +'<li><label>Login ID:</label>'
      +'<input type="text" disabled'
      +' id="login_id_'+indek+'"'
      +' size="40">'
    +'</li>'
    
    +'<li><label>User Name:</label>'
      +'<input type="text" disabled'
      +' id="user_name_'+indek+'"'
      +' size="20">'
    +'</li>'
    
    +'<li><label>Timeout:</label>'
      +'<input type="text" disabled'
      +' id="timeout_'+indek+'"'
      +' size="20">'
    +'</li>'
    
    +'<li><label>Created:</label>'
      +'<input type="text" disabled'
      +' id="date_created_'+indek+'"'
      +' size="20">'
    +'</li>'
    
    +'<li><label>Status:</label>'
      +'<input type="text" disabled'
      +' id="status_'+indek+'"'
      +' size="20">'
    +'</li>'

    +'</ul>'
    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
}

Sessions.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
      +" FROM login"
      +" WHERE login_id='"+bingkai[indek].login_id+"'"
  },(paket)=>{
    if (paket.count>0){
      //Sessions.copyData(indek,paket);
      var d=objectOne(paket.fields,paket.data);
      
      var tgl=new Date();
      var tgl_create=new Date(parseInt(d.date_created));
      var date_expired=Sessions.durasi(tgl,tgl_create,d.timeout);
      
      setEV('login_id_'+indek, blokID2(d.login_id) );
      setEV('user_name_'+indek, d.user_name);
      
      setEV('timeout_'+indek, array_expired_mode[d.timeout]);
      setEV('date_created_'+indek, tglInt(d.date_created));
      setEV('status_'+indek, date_expired==1?'Expired':'');
      
      
      message.none(indek);
    }
    return callback();
  });
}

Sessions.formDelete=(indek,login_id)=>{
  bingkai[indek].login_id=login_id
  Sessions.form.modeDelete(indek);
}

Sessions.deleteExecute=function(indek){
  db.execute(indek,{
    query:"DELETE FROM login"
      +" WHERE login_id='"+bingkai[indek].login_id+"'"
  },(p)=>{
    if(p.err.id==0) Sessions.deadPath( indek );
  });
}

Sessions.deadPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Sessions.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Sessions.properties(indek);})
  }
}

Sessions.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM properties"
      +" WHERE file_id=':/login/"+bingkai[indek].login_id+"'"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data);
      bingkai[indek].file_id=d.file_id;
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

Sessions.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT login_id,user_name,timeout,date_created"
      +" FROM login"
      +" ORDER BY date_created"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Sessions.selectShow(indek);
  });
}

Sessions.selectShow=(indek)=>{
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
      +'<th colspan="2">Login ID</th>'
      +'<th>User Name</th>'
      +'<th>Timeout</th>'
      +'<th>Status</th>'
      +'<th colspan="2">Created</th>'
    +'</tr>';

  if (p.err.id===0){
    var tgl=new Date();
    var tgl_create;
    var status;
    tgl.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    
    for (var x in d) {
      tgl_create=new Date(parseInt(d[x].date_created));
      status=Sessions.durasi(tgl,tgl_create,d[x].timeout);
      
      n++;
      html+='<tr>'
      +'<td align="center">'
      +'<input type="checkbox"'
        +' id="checked_'+x+'_'+indek+'"'
        +' name="checked_'+indek+'">'
        +'</td>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+blokID2 (d[x].login_id)+'</td>'
      +'<td align="left">'+d[x].user_name+'</td>'
      +'<td align="center">'+array_expired_mode[d[x].timeout]+'</td>'
      +'<td align="center">'+tglInt(d[x].date_created)+'</td>'
      +'<td align="center">'+(status==1?"Expired":"")+'</td>'
      +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

Sessions.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM login"
          +" WHERE login_id = '"+d[i].login_id+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

Sessions.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM login "
      +" WHERE login_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR user_name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Sessions.search=(indek)=>{
  Sessions.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT login_id,user_name,date_created,timeout"
        +" FROM login"
        +" WHERE login_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR user_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Sessions.readShow(indek);
    });
  });
}


// eof: 395;
