/*
 * name: budiono;
 * date: jul-01, 11:55, tue-2025; #62; reconcile;
 * edit: jul-03, 12:26, thu-2025; #62; cash;
 * edit: jul-06, 18:44, sun-2025; #63; new dataset;
 * edit: aug-18, 21:40, mon-2025; #68; date obj;
 * edit: nov-13, 14:37, thu-2025; #80;
 */

'use strict';

var FrmReconcile={}
  
FrmReconcile.table_name='reconcile';
FrmReconcile.form=new ActionForm2(FrmReconcile);
FrmReconcile.hideSaveAs=true;

FrmReconcile.show=(tiket)=>{
  tiket.modul=FrmReconcile.table_name;
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    getCompanyID(indek);
    getPath(indek,FrmReconcile.table_name,(h)=>{
      mkdir(indek,h.folder,()=>{
        FrmReconcile.form.modePaging(indek);
      });
    });
  }else{
    show(baru);
  }
}

FrmReconcile.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
    +" FROM reconcile"
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

FrmReconcile.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  FrmReconcile.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT cash_account_id,date"
        +",bank_credit,bank_debit"
        +",user_name,date_modified"
        +" FROM reconcile"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY date"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      FrmReconcile.readShow(indek);
    });
  })
};

FrmReconcile.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border="1">'
    +'<tr>'
      +'<th colspan="2">Cash Account ID</th>'
      +'<th>Date</th>'
      +'<th>Bank Credit</th>'
      +'<th>Bank Debit</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
      +'<th colspan="3">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    var x;
    for (x in d) {
      n++;
      html+='<tr>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].cash_account_id+'</td>'
      +'<td align="center">'+tglEast(d[x].date)+'</td>'
      +'<td align="right">'+d[x].bank_credit+'</td>'
      +'<td align="right">'+d[x].bank_debit+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_change" '
        +' onclick="FrmReconcile.formUpdate(\''+indek+'\''
        +',\''+d[x].cash_account_id+'\''
        +',\''+d[x].date+'\');">'
        +'</button></td>'
      +'<td align="center">'
        +'<button type="button" '
        +' id="btn_delete" '
        +' onclick="FrmReconcile.formDelete(\''+indek+'\''
        +',\''+d[x].cash_account_id+'\''
        +',\''+d[x].date+'\');">'
        +'</button></td>'
        +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  FrmReconcile.form.addPagingFn(indek);// #here
}

FrmReconcile.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
      +'<ul>'
        +'<li><label>Cash Account ID</label>'
          +'<input type="text" '
          +' id="cash_account_id_'+indek+'"'
          +' onchange="FrmReconcile.getTransaction(\''+indek+'\')"'
          +' size="9">'
        +'</li>'
          
        +'<li><label>Statement Date</label>'
          +'<input type="date"'
            +' id="date_'+indek+'"'
            +' onblur="dateFakeShow('+indek+',\'date\')"'
            +' style="display:none;">'
          +'<input type="text"'
            +' id="date_fake_'+indek+'"'
            +' onfocus="dateRealShow('+indek+',\'date\')"'
            +' size="9">'
        +'</li>'
      +'</ul>'
      +'<br>'
      +'<div>'
        +'<detail open>'
        +'<summary>Detail Transactions</summary>'
        +'<div id="detail_'+indek+'">'
        +'</div>'
        +'</detail>'
      +'</div>'
    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  
  if (metode===MODE_CREATE){
    document.getElementById('cash_account_id_'+indek).focus();
  }else{
    document.getElementById('cash_account_id_'+indek).disabled=true;
    document.getElementById('date_'+indek).focus();
  }
  setEV('date_'+indek,tglSekarang());
  setEV('date_fake_'+indek,tglWest(tglSekarang()));
  
  FrmReconcile.setRows(indek,[]);
  FrmReconcile.getTransaction(indek);
}

FrmReconcile.getTransaction=(indek)=>{
  var f=[
    "clear",
    "date",
    "description",
    "reference",
    "bank_credit",
    "bank_debit",
    "source",
    "cash_no"
  ];
  var r=[];
  var i;
  var cash_account_id=getEV('cash_account_id_'+indek);
  
  function belumReconcile(callback){
    // bila mau dihapus, data yg belum tersimpan tdk perlu ditampilkan
    // tampilkan yg akan dihapus saja;
    if(bingkai[indek].metode==MODE_DELETE) return callback();
    
    db.run(indek,{
      query: "SELECT date,description,reference,bank_credit,bank_debit"
        +",source,cash_no,reconcile_date"
        +" FROM cash"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND cash_account_id='"+cash_account_id+"'"
        +" AND reconcile_date=''"
        +" AND hide=1"
        +" ORDER BY date ASC"
    },(p)=>{
      if(p.count>0){
        for(i=0;i<p.count;i++){
          r.push([
            0,
            p.data[i][0], //date
            p.data[i][1], //descr
            p.data[i][2], //reference
            p.data[i][3], //bank_credit
            p.data[i][4], //bank_debit
            p.data[i][5], //source
            p.data[i][6], //cash_no
          ]);
        };
      }
      return callback();
    });    
  }
  
  function sudahReconcile(callback){
    
    // bila data baru, data tersimpan tdk perlu ditampilkan
    // hanya ditampilkan yg belum reconcile saja;
    if(bingkai[indek].metode==MODE_CREATE) return callback();
    
    db.run(indek,{
      query: "SELECT date,description,reference,bank_credit,bank_debit"
        +",source,cash_no,reconcile_date"
        +" FROM cash"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND cash_account_id='"+cash_account_id+"'"
        +" AND reconcile_date='"+getEV('date_'+indek)+"'"// reconcile_date
        +" AND reconcile_date!=''"
        +" AND hide=1"
        +" ORDER BY date ASC"
    },(p)=>{
      if(p.count>0){
        for(i=0;i<p.count;i++){
          r.push([
            1,
            p.data[i][0], //date
            p.data[i][1], //descr
            p.data[i][2], //reference
            p.data[i][3], //bank_credit
            p.data[i][4], //bank_debit
            p.data[i][5], //source
            p.data[i][6], //cash_no
          ]);
        };
      }
      return callback();
    });
  }
  
  function sortByID(a,b){ // sort multidimensi;
    if( a.date === b.date ){
      return 0;
    }
    else{
      if( a.date < b.date ) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
  
  belumReconcile(()=>{
    sudahReconcile(()=>{
      var b=objectMany(f,r);
      var c=b.sort( sortByID );
      FrmReconcile.setRows(indek,b);
    });
  }); 
}

FrmReconcile.setRows=(indek,isi)=>{
  if(isi===undefined)isi=[];

  var html=FrmReconcile.tableHead(indek);
  var check=false;
  var tot_d=0,tot_c=0;
  
  bingkai[indek].detail=isi;
    
  for (var i=0;i<isi.length;i++){
    check=''
    if(isi[i].clear==1) {
      check='checked'
    }
    html+='<tr>'
      +'<td align="center">'+(i+1)+'</td>'
      +'<td align="center">'
        +'<input type="checkbox" '+check 
        +' id="checked_'+i+'_'+indek+'"'
        +' name="checked_'+indek+'"'
        +' onclick="FrmReconcile.cashOK(\''+indek+'\',\''+i+'\')">'
      +'</td>'
      
      +'<td align="center">'
        +tglEast(isi[i].date)
      +'</td>'

      +'<td align="left">'
        +strN(isi[i].description,30)
      +'</td>'

      +'<td align="left">'
        +isi[i].reference
      +'</td>'      
      
      +'<td align="right">'
        +ribuan(isi[i].bank_credit)
      +'</td>'
      
      +'<td align="right">'
        +ribuan(isi[i].bank_debit)
      +'</td>'

      +'<td align="left">'
        +source_name[isi[i].source]
      +'</td>'
      
      +'<td align="left">'
        +isi[i].cash_no
      +'</td>'
      
      +'<td align="center">'+(i+1)+'</td>'

    +'</tr>';
    
    tot_c+=Number(isi[i].bank_credit);
    tot_d+=Number(isi[i].bank_debit);
  }
  bingkai[indek].val={
    bank_credit: tot_c,
    bank_debit: tot_d
  }
  
  html+=FrmReconcile.tableFoot(indek);
  var budi = JSON.stringify(isi);
  document.getElementById('detail_'+indek).innerHTML=html;
  if(isi.length==0) FrmReconcile.addRow(indek,[]);
}

FrmReconcile.cashOK=(indek,baris)=>{
  var o=getEC('checked_'+baris+'_'+indek);
  var d=bingkai[indek].detail;
  var i;
  
  for(i=0;i<d.length;i++){
    if(i==baris){
      if(o==true){
        d[i].clear=true;
      }else{
        d[i].clear=false;
      }
    }
  }
}

FrmReconcile.tableHead=(indek)=>{
  return '<table border=0 style="width:100%;" >'
    +'<thead>'
      +'<tr>'
        +'<th>#</th>'
        +'<th align="center">Clear<br>'
          +'<input type="checkbox"'
          +' id="check_all_'+indek+'"'
          +' onclick="FrmReconcile.checkAll(\''+indek+'\')">'
        +'</th>'
        +'<th>Date</th>'
        +'<th>Description</th>'
        +'<th>Reference</th>'
        +'<th>Bank Credit</th>'
        +'<th>Bank Debit</th>'
        +'<th>Source</th>'
        +'<th colspan="2">Cash No.</th>'
      +'</tr>'
    +'</thead>';
}

FrmReconcile.tableFoot=(indek)=>{
  var tot_d=bingkai[indek].val.bank_debit;
  var tot_c=bingkai[indek].val.bank_credit;
  return '</tfoot>'
      +'<tr>'
        +'<td colspan="5">&nbsp;</td>'
        +'<td align="right"><b>Deposits: '+ribuan(tot_c)+'</b></td>'
        +'<td align="right"><b>Checks: '+ribuan(tot_d)+'</b></td>'
        +'<td colspan="3">&nbsp;</td>'
      +'</tr>'
    +'</tfoot>'
  +'</table>';
}

FrmReconcile.addRow=(indek,baris)=>{
  var oldBasket=[];
  var newBasket=[];

  oldBasket=bingkai[indek].detail;

  for(var i=0;i<oldBasket.length;i++){
    newBasket.push(oldBasket[i]);
    if(i==baris) FrmReconcile.newRow(newBasket);
  }
  if(oldBasket.length==0) newRow(newBasket);
  FrmReconcile.setRows(indek,newBasket);

  function newRow(n){
    
    var myItem={};
    
    myItem.clear=0;
    myItem.date="";
    myItem.description="";
    myItem.reference="";
    myItem.bank_credit=0;
    myItem.bank_debit=0;
    myItem.balance=0;
    myItem.source=9;
    myItem.cash_no="";
    n.push(myItem);
  }
}

FrmReconcile.createExecute=(indek)=>{
  var detail=JSON.stringify(bingkai[indek].detail);
  db.execute(indek,{
    query:"INSERT INTO reconcile"
      +"(admin_name,company_id,cash_account_id,date,detail)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEV('cash_account_id_'+indek)+"'"
      +",'"+getEV('date_'+indek)+"'"
      +",'"+detail+"'"
      +")"
  })
}

FrmReconcile.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
      +" FROM reconcile"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+bingkai[indek].cash_account_id+"'"
      +" AND date='"+bingkai[indek].date+"'"
  },(p)=>{
    if (p.err.id==0){
      var d=objectOne(p.fields,p.data);
      setEV('cash_account_id_'+indek, d.cash_account_id );
      setEV('date_'+indek, d.date );
      setEV('date_fake_'+indek, tglWest(d.date) );
      
      FrmReconcile.getTransaction(indek,[]);
      
      message.none(indek);
    }
    return callback();
  });
}

FrmReconcile.formUpdate=(indek,cash_account_id,date)=>{
  bingkai[indek].cash_account_id=cash_account_id;
  bingkai[indek].date=date;
  FrmReconcile.form.modeUpdate(indek);
}

FrmReconcile.updateExecute=function(indek){
  var detail=JSON.stringify(bingkai[indek].detail);
  db.execute(indek,{
    query:"UPDATE reconcile"
      +" SET date='"+getEV('date_'+indek)+"'"
      +",detail='"+detail+"'"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+bingkai[indek].cash_account_id+"'"
      +" AND date='"+bingkai[indek].date+"'"
  });
}

FrmReconcile.formDelete=(indek,cash_account_id,date)=>{
  bingkai[indek].cash_account_id=cash_account_id;
  bingkai[indek].date=date;
  FrmReconcile.form.modeDelete(indek);
}

FrmReconcile.deleteExecute=function(indek){
  db.execute(indek,{
    query:"DELETE FROM reconcile"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+bingkai[indek].cash_account_id+"'"
      +" AND date='"+bingkai[indek].date+"'"
  },(p)=>{
    if(p.err.id==0) FrmReconcile.finalPath(indek);
  });
};

FrmReconcile.finalPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{FrmReconcile.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{FrmReconcile.properties(indek);})
  };
};


FrmReconcile.checkAll=(indek)=>{
  
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;// count
  var i;
  
  document.getElementsByName('checked_'+indek).checked=true;
  
  for(i=0;i<c;i++){
    if(document.getElementById('check_all_'+indek).checked==true){
      e[i].checked=true;
    }else{
      e[i].checked=false;
    }
  }
  var d=bingkai[indek].detail
  for(i=0;i<d.length;i++){
    if(document.getElementById('check_all_'+indek).checked==true){
      d[i].clear=1;
    }else{
      d[i].clear=0;
    }
  }
  
}

var source_name=[
  "Deposit",//0
  "Journal",//1
  "Receipt",//2
  "Invoice",//3
  "Void",//4
  "Payment",//5
  "Void",//6
  "Check",//7
  "Void",//8
  "", //9
  "Payroll", //10
  "Void", //11
];

FrmReconcile.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM reconcile "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR date LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

FrmReconcile.search=(indek)=>{
  FrmReconcile.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT cash_account_id,date,"
        +" user_name,date_modified "
        +" FROM reconcile"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND cash_account_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR date LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      FrmReconcile.readShow(indek);
    });
  });
}

FrmReconcile.exportExecute=(indek)=>{
  var table_name=FrmReconcile.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

FrmReconcile.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT cash_account_id,date,bank_debit,bank_credit"
      +",user_name,date_modified"
      +" FROM reconcile"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    FrmReconcile.selectShow(indek);
  });
}

FrmReconcile.selectShow=(indek)=>{
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
      +'<th colspan="2">Cash Account ID</th>'
      +'<th>Date</th>'
      +'<th>Bank Credit</th>'
      +'<th>Bank Debit</th>'
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
      +'<td align="left">'+d[x].cash_account_id+'</td>'
      +'<td align="center">'+tglEast(d[x].date)+'</td>'
      +'<td align="right">'+d[x].bank_credit+'</td>'
      +'<td align="right">'+d[x].bank_debit+'</td>'
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

FrmReconcile.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM reconcile"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND cash_account_id='"+d[i].cash_account_id+"'"
          +" AND date= '"+d[i].date+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

FrmReconcile.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO reconcile "
        +" (admin_name,company_id,cash_account_id,date,detail) "
        +" VALUES "
        +"('"+bingkai[indek].admin.name+"'"
        +",'"+bingkai[indek].company.id+"'"
        +",'"+d[i][1]+"'" // cash_account_id
        +",'"+d[i][2]+"'"// date
        +",'"+d[i][3]+"'" // detail
        +")"
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

FrmReconcile.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM reconcile "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+getEV('cash_account_id_'+indek)+"' "
      +" AND date='"+getEV('date_'+indek)+"' "
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



// eof: 723;721;
