/*
 * name: budiono;
 * code: I5;
 * path: /accounting/sales/void_invoices.js;
 * ----------------------------------------;
 * date: dec-03, 11:54, sun-2023; new
 * -----------------------------; happy new year 2024;
 * edit: jan-21, 17:59, sun-2024; mringkas;
 * edit: aug-20, 16:19, tue-2024; r13; 
 * edit: oct-05, 17:36, sat-2024; #20;
 * edit: dec-31, 16:25, mon-2024; #32; properties+duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-25, 11:45, tue-2025; #41; file_blok;
 * edit: mar-15, 11:19, sat-2025; #43; deep-folder;
 * edit: mar-27, 12:30, thu-2025; #45; ctables;cstructure;
 * edit: apr-22, 17:33, tue-2025; #50; download to CSV;
 * edit: apr-28, 11:42, mon-2025; #51; backup-restore;
 * edit: aug-15, 21:37, fri-2025; #68; add date_obj;
*/

'use struct';

var VoidInvoices={}

VoidInvoices.table_name='void_invoices';
VoidInvoices.form=new ActionForm2(VoidInvoices);
VoidInvoices.invoice=new InvoiceLook(VoidInvoices);

VoidInvoices.show=(karcis)=>{
  karcis.modul=VoidInvoices.table_name;
  
  var baru=exist(karcis);
  if(baru==-1){
    var newTxs=new BingkaiUtama(karcis);
    var indek=newTxs.show();
    createFolder(indek,()=>{
      VoidInvoices.form.modePaging(indek);
      VoidInvoices.getDefault(indek);
    });
  }else{
    show(baru);
  }
}

VoidInvoices.getDefault=(indek)=>{
  CustomerDefaults.getDefault(indek);
}

VoidInvoices.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM void_invoices"
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

VoidInvoices.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  VoidInvoices.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT customer_id,customer_name,"
        +" void_no,date,amount,invoice_no,invoice_date,"
        +" user_name,date_modified"
        +" FROM void_invoices"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY date"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      VoidInvoices.readShow(indek);
    });
  })
}

VoidInvoices.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table>'
    +'<tr>'
      +'<th colspan="2">Void #</th>'
      +'<th>Date</th>'
      +'<th>Amount</th>'
      +'<th>Customer</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
      +'<th colspan="3">Action</th>'
    +'</tr>';

  if(p.err.id===0){
    var x;
    for(x in d){
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].void_no+'</td>'
        +'<td align="center">'+tglWest(d[x].date)+'</td>'
        +'<td align="right">'+d[x].amount+'</td>'
        +'<td align="left">'+d[x].customer_name+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button"'
          +' id="btn_delete"'
          +' onclick="VoidInvoices.formDelete(\''+indek+'\''
          +',\''+d[x].customer_id+'\''
          +',\''+d[x].void_no+'\');">'
          +'</button>'
        +'</td>'
        +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  VoidInvoices.form.addPagingFn(indek);
}

VoidInvoices.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  
  var html=''
  +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    +'<div style="display:grid;'
      +'grid-template-columns:repeat(2,1fr);'
      +'padding-bottom:50px;">'
      
      +'<div>'      
        +'<ul>'
        +'<li><label>Customer ID:</label>'
          +'<input type="text" '
          +' id="customer_id_'+indek+'"'
          +'  size="9"'
          +' disabled>'
          +'</li>'

        +'<li><label>Invoice No.:</label>'
          +'<input type="text"'
          +' id="invoice_no_'+indek+'"'
          +' size="9"'
          +' disabled>'
              +'<button type="button" id="btn_find" '
              +' onclick="VoidInvoices.invoice.getPaging(\''+indek+'\''
              +',\'invoice_no_'+indek+'\')">'
              +'</button>'
          +'</li>'
        +'<li><label>Date:</label>'
          +'<input type="text"'
          +' id="invoice_date_'+indek+'"'
          +' size="9"'
          +' disabled>'
          +'</li>'
        +'<li><label>Amount:</label>'
          +'<input type="text"'
          +' id="invoice_total_'+indek+'"'
          +' disabled'
          +' size="9"'
          +' style="text-align:center;">'
          +'</li>'
          
        +'</ul>'
      +'</div>'
      
      +'<div>'
        +'<ul>'
          +'<li><label>Void No.:</label>'
            +'<input type="text"'
            +' id="void_no_'+indek+'"'
            +' size="9">'
          +'</li>'
          +'<li><label>Date:</label>'
            +'<input type="date" '
              +' id="void_date_'+indek+'"'
              +' onblur="dateFakeShow('+indek+',\'void_date\')"'
              +' style="display:none;">'
            +'<input type="text" '
              +' id="void_date_fake_'+indek+'"'
              +' onfocus="dateRealShow('+indek+',\'void_date\')"'
              +' size="9">'
          +'</li>'
          +'<li><label>Note:</label>'
            +'<input type="text"'
            +' id="void_note_'+indek+'"'
            +' size="20">'
          +'</li>'
        +'</ul>'
      +'</div>'

    +'</div>'
    +'</form>'
  +'</div>';
  
  content.html(indek,html);
  statusbar.ready(indek);
  
  document.getElementById('void_no_'+indek).focus();
  document.getElementById('void_date_'+indek).value=tglSekarang();
  document.getElementById('void_date_fake_'+indek).value=tglWest(tglSekarang());
}

VoidInvoices.setInvoice=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var nama_kolom=bingkai[indek].nama_kolom;

  setEV(id_kolom, data.invoice_no );
  setEV('customer_id_'+indek, data.customer_id );
  setEV('invoice_date_'+indek, tglWest(data.date) );
  setEV('invoice_total_'+indek, data.total );
  
  setEV('void_no_'+indek, data.invoice_no+'v' );
  setEV('void_note_'+indek, 'some note for this Avoid.' );
}

VoidInvoices.createExecute=(indek)=>{
  db.execute(indek,{
    query:"INSERT INTO void_invoices"
      +"(admin_name,company_id"
      +",customer_id,invoice_no"
      +",void_no,date,note)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEV('customer_id_'+indek)+"'"
      +",'"+getEV('invoice_no_'+indek)+"'"
      +",'"+getEV('void_no_'+indek)+"'"
      +",'"+getEV('void_date_'+indek)+"'"
      +",'"+getEV('void_note_'+indek)+"'"
      +")"
  });
}

VoidInvoices.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT *"
      +" FROM void_invoices"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"'"
      +" AND void_no='"+bingkai[indek].void_no+"'"
  },(paket)=>{
    if (paket.err.id==0 && paket.count==1){
      var d=objectOne(paket.fields,paket.data);
      
      setEV('customer_id_'+indek,d.customer_id);
      setEV('invoice_no_'+indek,d.invoice_no);
      setEV('invoice_date_'+indek,tglWest(d.invoice_date) );
      setEV('invoice_total_'+indek, d.amount);
      
      setEV('void_no_'+indek, d.void_no);
      setEV('void_date_'+indek, d.date);
      setEV('void_date_fake_'+indek, tglWest(d.date));
      setEV('void_note_'+indek, d.note);
      
      message.none(indek);
      return callback();
    }
  });
}

VoidInvoices.formDelete=(indek,customer_id,void_no)=>{
  bingkai[indek].customer_id=customer_id;
  bingkai[indek].void_no=void_no;
  VoidInvoices.form.modeDelete(indek);
}

VoidInvoices.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM void_invoices"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"'"
      +" AND void_no='"+bingkai[indek].void_no+"'"
  },(p)=>{
    if(p.err.id==0) VoidInvoices.deadPath(indek);
  });
}

VoidInvoices.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM void_invoices "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND void_no LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR customer_name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

VoidInvoices.search=(indek)=>{
  VoidInvoices.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT customer_id,void_no,date,amount,customer_name,"
        +" user_name,date_modified "
        +" FROM void_invoices"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND void_no LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR customer_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      VoidInvoices.readShow(indek);
    });
  });
}

VoidInvoices.exportExecute=(indek)=>{
  var table_name=VoidInvoices.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

VoidInvoices.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT customer_id,void_no,date,amount,customer_name,"
      +" user_name,date_modified"
      +" FROM void_invoices"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    VoidInvoices.selectShow(indek);
  });
}

VoidInvoices.selectShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
  +content.title(indek)
  +content.message(indek)
  +'<table>'
    +'<tr>'
      +'<td align="center">'
        +'<input type="checkbox"'
        +' id="check_all_'+indek+'"'
        +' onclick="checkAll(\''+indek+'\')">'
      +'</td>'
      +'<th colspan="2">Void #</th>'
      +'<th>Date</th>'
      +'<th>Amount</th>'
      +'<th>Customer</th>'
      +'<th>Owner</th>'
      +'<th colspan="2">Modified</th>'
    +'</tr>';

  if(p.err.id===0){
    for(var x in d){
      n++;
      html+='<tr>'
        +'<td align="center">'
          +'<input type="checkbox"'
          +' id="checked_'+x+'_'+indek+'"'
          +' name="checked_'+indek+'" >'
        +'</td>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].void_no+'</td>'
        +'<td align="center">'+tglWest(d[x].date)+'</td>'
        +'<td align="right">'+d[x].amount+'</td>'
        +'<td align="left">'+d[x].customer_name+'</td>'
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

VoidInvoices.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM void_invoices"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND customer_id='"+d[i].customer_id+"'"
          +" AND void_no='"+d[i].void_no+"'"
      });
    }
  }
  db.deleteMany(indek,a);
} 

VoidInvoices.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o;
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO void_invoices"
        +"(admin_name,company_id"
        +",customer_id,invoice_no"
        +",void_no,date,note)"
        +" VALUES "
        +"('"+bingkai[indek].admin.name+"'"
        +",'"+bingkai[indek].company.id+"'"
        +",'"+d[i][1]+"'"
        +",'"+d[i][2]+"'"
        +",'"+d[i][3]+"'"
        +",'"+d[i][4]+"'"
        +",'"+d[i][5]+"'"
        +")"
    },(paket)=>{  
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

VoidInvoices.setDefault=(indek)=>{
  
}

VoidInvoices.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM void_invoices"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"'"
      +" AND void_no='"+bingkai[indek].void_no+"'"
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

VoidInvoices.duplicate=(indek)=>{
  var id='copy_of '+getEV('void_no_'+indek);
  setEV('void_no_'+indek,id);
  focus('void_no_'+indek);
}

VoidInvoices.deadPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{VoidInvoices.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{VoidInvoices.properties(indek);})
  }
}





// eof;380;428;508;487;488;492;489;
