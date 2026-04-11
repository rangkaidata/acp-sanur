/*
 * name: budiono;
 * date: jan-05, 10:50; mon-2026; #87;
 */
 
'use strict';

var CloseSO={}

CloseSO.table_name="close_so";
CloseSO.title="Close SO";
CloseSO.form=new ActionForm2(CloseSO);
CloseSO.so=new SOStatusLook(CloseSO);


CloseSO.show=(tiket)=>{
  tiket.modul=    CloseSO.table_name;
  tiket.menu.name=CloseSO.title;

  const baru=exist(tiket);
  if(baru==-1){
    const newReg=new BingkaiUtama(tiket);
    const indek=newReg.show();
    createFolder(indek,()=>{
      CloseSO.form.modePaging(indek);
    });
  }else{
    show(baru);
  }  
}

CloseSO.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM close_so"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

CloseSO.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  CloseSO.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT customer_id,so_no,so_date,remaining,"
        +"user_name,date_modified"
        +" FROM close_so "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY so_date"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      CloseSO.readShow(indek);
    });
  })
}

CloseSO.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +TotalPagingLimit(indek)
    +'<table>'
    +'<tr>'
      +'<th colspan="2">Customer ID</th>'
      +'<th>SO #</th>'
      +'<th>Date</th>'
      +'<th>Remaining</th>'

      +'<th>Owner</th>'
      +'<th>Modified</th>'
      +'<th colspan="3">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    var x
    for(x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].customer_id+'</td>'
        +'<td align="left">'+d[x].so_no+'</td>'
        +'<td align="center">'+tglWest(d[x].so_date)+'</td>'
        +'<td align="right">'+d[x].remaining+'</td>'
        
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button"'
          +' id="btn_delete"'
          +' onclick="CloseSO.formDelete(\''+indek+'\''
          +',\''+d[x].customer_id+'\''
          +',\''+d[x].so_no+'\');">'
          +'</button>'
          +'</td>'
      +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  if(READ_PAGING) CloseSO.form.addPagingFn(indek);
}

CloseSO.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
      +content.title(indek)
      +content.message(indek)
      +'<form autocomplete="off">'
      +'<ul>'
        +'<li><label>Customer ID:</label>'
          +'<input type="text" '
            +' id="customer_id_'+indek+'"'
            +' size="15" disabled>'
        +'</li>'
        
        +'<li><label>SO No.:</label>'
          +'<input type="text"'
          +' id="so_no_'+indek+'"'
          +' size="15" disabled>'
          +'<button type="button" '
            +' class="btn_find" '
            +' onclick="CloseSO.so.getPaging(\''+indek+'\''
            +',\'so_no_'+indek+'\',-1)">'
          +'</button>'
        +'</li>'
        +'<li><label>Date.:</label>'
          +'<input type="text"'
          +' id="so_date_'+indek+'"'
          +' size="15" disabled>'
        +'</li>'
        +'<li><label>Remaining:</label>'
          +'<input type="text"'
          +' id="remaining_'+indek+'"'
          +' size="15" disabled>'
        +'</li>'
        +'<li><label>Comment:</label>'
          +'<input type="text"'
          +' id="comment_'+indek+'"'
          +' size="30">'
        +'</li>'
      +'</ul>'
      +'</form>'
    +'</div>';
  content.html(indek,html);
  statusbar.ready(indek);
}

CloseSO.setSOStatus=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  
  setEV('customer_id_'+indek, data.customer_id );
  setEV('so_no_'+indek, data.so_no );
  setEV('so_date_'+indek, tglWest(data.so_date) );
  setEV('remaining_'+indek, data.remaining);
  setEV('comment_'+indek, 'some comment...');
}

CloseSO.createExecute=(indek)=>{
  db.execute(indek,{
    query:"INSERT INTO close_so "
    +"(admin_name,company_id,customer_id,so_no,comment)"
    +" VALUES"
    +"('"+bingkai[indek].admin.name+"'"
    +",'"+bingkai[indek].company.id+"'"
    +",'"+getEV("customer_id_"+indek)+"'"
    +",'"+getEV("so_no_"+indek)+"'"
    +",'"+getEV("comment_"+indek)+"'"
    +")"
  });
}

CloseSO.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
      +" FROM close_so"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"'"
      +" AND so_no='"+bingkai[indek].so_no+"'"
  },(p)=>{
    if (p.count>0){
      var d=objectOne(p.fields,p.data);
      
      setEV('customer_id_'+indek, d.customer_id );
      setEV('so_no_'+indek, d.so_no);
      setEV('so_date_'+indek, d.so_date);
      setEV('remaining_'+indek, d.remaining);
      setEV('comment_'+indek, d.comment);
      message.none(indek);
    }
    return callback();
  });
}

CloseSO.formDelete=(indek,customer_id,so_no)=>{
  bingkai[indek].customer_id=customer_id;
  bingkai[indek].so_no=so_no;
  CloseSO.form.modeDelete(indek);
}

CloseSO.deleteExecute=function(indek){
  db.execute(indek,{
    query:"DELETE FROM close_so"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"'"
      +" AND so_no='"+bingkai[indek].so_no+"'"
  },(p)=>{
    if(p.err.id==0) CloseSO.finalPath(indek);
  });
}

CloseSO.finalPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{CloseSO.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{CloseSO.properties(indek);})
  }
}

CloseSO.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT customer_id,so_no,so_date,remaining,"
      +" user_name,date_modified"
      +" FROM close_so"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY so_date"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    CloseSO.selectShow(indek);
  });
}

CloseSO.selectShow=(indek)=>{
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
        +'<th colspan="2">Customer ID</th>'
        +'<th>SO #</th>'
        +'<th>Date</th>'
        +'<th>Remaining</th>'
        +'<th>Owner</th>'
        +'<th colspan="2">Modified</th>'
      +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
      +'<td align="center">'
      +'<input type="checkbox"'
        +' id="checked_'+x+'_'+indek+'"'
        +' name="checked_'+indek+'"'
        +' value="'+d[x].location_id+'">'
      +'</td>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].customer_id+'</td>'
      +'<td align="left">'+d[x].so_no+'</td>'
      +'<td align="left">'+tglWest(d[x].so_date)+'</td>'
      +'<td align="left">'+d[x].remaining+'</td>'
      
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

CloseSO.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM close_so"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND customer_id = '"+d[i].customer_id+"'"
          +" AND so_no = '"+d[i].so_no+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

CloseSO.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM close_so "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR so_no LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

CloseSO.search=(indek)=>{
  CloseSO.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT customer_id,so_no,so_date,remaining,"
        +"user_name,date_modified "
        +" FROM close_so"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND customer_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR so_no LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      CloseSO.readShow(indek);
    });
  });
}

CloseSO.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM close_so "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+getEV('customer_id_'+indek)+"' "
      +" AND so_no='"+getEV('so_no_'+indek)+"' "
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

CloseSO.exportExecute=(indek)=>{
  var table_name=CloseSO.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

CloseSO.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO close_so "
        +" (admin_name,company_id,customer_id,so_no,comment) "
        +" VALUES "
        +"('"+bingkai[indek].admin.name+"'"
        +",'"+bingkai[indek].company.id+"'"
        +",'"+d[i][1]+"'"
        +",'"+d[i][2]+"'"
        +",'"+d[i][3]+"'"
        +")"
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

//eof:319;414;
