/*
 * name: budiono;
 * date: jan-05, 10:50; mon-2026; #87;
 */
 
'use strict';

var ClosePO={}

ClosePO.form=new ActionForm2(ClosePO);
ClosePO.po=new POStatusLook(ClosePO);
ClosePO.table_name='close_po';
ClosePO.title='Close PO';

ClosePO.show=(tiket)=>{
  tiket.modul=ClosePO.table_name;
  tiket.menu.name=ClosePO.title;

  const baru=exist(tiket);
  if(baru==-1){
    const newReg=new BingkaiUtama(tiket);
    const indek=newReg.show();
    createFolder(indek,()=>{
      ClosePO.form.modePaging(indek);
    });
  }else{
    show(baru);
  }  
}

ClosePO.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM close_po"
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

ClosePO.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  ClosePO.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT vendor_id,po_no,po_date,remaining,"
        +"user_name,date_modified"
        +" FROM close_po "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY po_date"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      ClosePO.readShow(indek);
    });
  })
}

ClosePO.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +TotalPagingLimit(indek)
    +'<table>'
    +'<tr>'
      +'<th colspan="2">Vendor ID</th>'
      +'<th>PO #</th>'
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
        +'<td align="left">'+d[x].vendor_id+'</td>'
        +'<td align="left">'+d[x].po_no+'</td>'
        +'<td align="center">'+tglWest(d[x].po_date)+'</td>'
        +'<td align="right">'+d[x].remaining+'</td>'
        
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button"'
          +' id="btn_delete"'
          +' onclick="ClosePO.formDelete(\''+indek+'\''
          +',\''+d[x].vendor_id+'\''
          +',\''+d[x].po_no+'\');">'
          +'</button>'
          +'</td>'
      +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  if(READ_PAGING) ClosePO.form.addPagingFn(indek);
}

ClosePO.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
      +content.title(indek)
      +content.message(indek)
      +'<form autocomplete="off">'
      +'<ul>'
        +'<li><label>Vendor ID:</label>'
          +'<input type="text" '
            +' id="vendor_id_'+indek+'"'
            +' size="15" disabled>'
        +'</li>'
        
        +'<li><label>PO No.:</label>'
          +'<input type="text"'
          +' id="po_no_'+indek+'"'
          +' size="15" disabled>'
          +'<button type="button" '
            +' class="btn_find" '
            +' onclick="ClosePO.po.getPaging(\''+indek+'\''
            +',\'po_no_'+indek+'\',-1)">'
          +'</button>'
        +'</li>'
        +'<li><label>Date.:</label>'
          +'<input type="text"'
          +' id="po_date_'+indek+'"'
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

ClosePO.setPOStatus=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
//  setEV(id_kolom, data.vendor_id);
  
  setEV('vendor_id_'+indek, data.vendor_id );
  setEV('po_no_'+indek, data.po_no );
  setEV('po_date_'+indek, tglWest(data.po_date) );
  setEV('remaining_'+indek, data.remaining);
  setEV('comment_'+indek, 'some comment...');
}


ClosePO.createExecute=(indek)=>{
  db.execute(indek,{
    query:"INSERT INTO close_po "
    +"(admin_name,company_id,vendor_id,po_no,comment)"
    +" VALUES"
    +"('"+bingkai[indek].admin.name+"'"
    +",'"+bingkai[indek].company.id+"'"
    +",'"+getEV("vendor_id_"+indek)+"'"
    +",'"+getEV("po_no_"+indek)+"'"
    +",'"+getEV("comment_"+indek)+"'"
    +")"
  });
}

ClosePO.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
      +" FROM close_po"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+bingkai[indek].vendor_id+"'"
      +" AND po_no='"+bingkai[indek].po_no+"'"
  },(p)=>{
    if (p.count>0){
      var d=objectOne(p.fields,p.data);
      
      setEV('vendor_id_'+indek, d.vendor_id );
      setEV('po_no_'+indek, d.po_no);
      setEV('po_date_'+indek, d.po_date);
      setEV('remaining_'+indek, d.remaining);
      setEV('comment_'+indek, d.comment);
      message.none(indek);
    }
    return callback();
  });
}

ClosePO.formDelete=(indek,vendor_id,po_no)=>{
  bingkai[indek].vendor_id=vendor_id;
  bingkai[indek].po_no=po_no;
  ClosePO.form.modeDelete(indek);
}

ClosePO.deleteExecute=function(indek){
  db.execute(indek,{
    query:"DELETE FROM close_po"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+bingkai[indek].vendor_id+"'"
      +" AND po_no='"+bingkai[indek].po_no+"'"
  },(p)=>{
    if(p.err.id==0) ClosePO.finalPath(indek);
  });
}

ClosePO.finalPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ClosePO.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{ClosePO.properties(indek);})
  }
}

ClosePO.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT vendor_id,po_no,po_date,remaining,"
      +" user_name,date_modified"
      +" FROM close_po"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY po_date"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    ClosePO.selectShow(indek);
  });
}

ClosePO.selectShow=(indek)=>{
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
      +'<th colspan="2">Vendor ID</th>'
      +'<th>PO #</th>'
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
      +'<td align="left">'+d[x].vendor_id+'</td>'
      +'<td align="left">'+d[x].po_no+'</td>'
      +'<td align="left">'+tglWest(d[x].po_date)+'</td>'
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

ClosePO.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM close_po"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND vendor_id = '"+d[i].vendor_id+"'"
          +" AND po_no = '"+d[i].po_no+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

ClosePO.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM close_po "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR po_no LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

ClosePO.search=(indek)=>{
  ClosePO.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT vendor_id,po_no,po_date,remaining,"
        +"user_name,date_modified "
        +" FROM close_po "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND vendor_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR po_no LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      ClosePO.readShow(indek);
    });
  });
}

ClosePO.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM close_po "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+getEV('vendor_id_'+indek)+"' "
      +" AND po_no='"+getEV('po_no_'+indek)+"' "
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data) ;      
      bingkai[indek].file_id=d.file_id;
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket (indek,p);
  });
}

ClosePO.exportExecute=(indek)=>{
  var table_name=ClosePO.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

ClosePO.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO close_po "
        +" (admin_name,company_id,vendor_id,po_no,comment) "
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

//eof:

/*








Locations.duplicate=(indek)=>{
  var id='copy_of '+document.getElementById('location_id_'+indek).value;
  document.getElementById('location_id_'+indek).disabled=false;
  document.getElementById('location_id_'+indek).value=id;
  document.getElementById('location_id_'+indek).focus();
}







*/
