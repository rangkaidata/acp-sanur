/* column width: 71
012345678901234567890123456789012345678901234567890123456789012345678901
----------1---------2---------3---------4---------5---------6---------7-
*/ 

/*
 * auth: budiono;
 * code: i7;
 * path: /accounting/sales/deposit.js;
 * ----------------------------------;
 * date: feb-05, 17:59, mon-2024; 
 * edit: aug-21, 16:20, wed-2024; revisi ke-13 (r13);
 * edit: aug-22, 14:44, thu-2024; r13;
 * edit: oct-07, 11:19, mon-2024; #20;
 * edit: oct-10, 14:32, thu-2024; #21;
 * edit: nov-29, 07:45, fri-2024; #27; add locker();
 * edit: dec-31, 18:03, tue-2024; #32; properties+duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-25, 14:46, tue-2025; #41; file_id;
 * edit: mar-15, 11:47, sat-2025; #43; deep-folder;
 * edit: mar-27, 13:05, thu-2025; #45; ctables;cstructure;
 * edit: apr-24, 11:43, thu-2025; #50; download_csv;
 * edit: jun-23, 11:32, mon-2025; #62; reconciliation;
 * edit: aug-15, 21:51, fri-2025; #68; add date_obj;
 * edit: nov-07, 17:14, fri-2025; #80;
 */ 

'use strict';

var Deposits={}

Deposits.table_name='deposits';
Deposits.form=new ActionForm2(Deposits);
Deposits.account=new AccountLook(Deposits);
Deposits.hidePreview=false;

Deposits.show=(karcis)=>{
  karcis.modul=Deposits.table_name;
  karcis.have_child=true;
  
  var baru=exist(karcis);
  if(baru==-1){
    var form=new BingkaiUtama(karcis);
    var indek=form.show();
    createFolder(indek,()=>{
      Deposits.form.modePaging(indek);
    });
  }else{
    show(baru);
  }
}

Deposits.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM deposits"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Deposits.readPaging=(indek)=>{
  bingkai[indek].deposit_no="";
  bingkai[indek].metode=MODE_READ;
  Deposits.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT cash_account_id,deposit_no,date,amount"
        +",user_name,date_modified"
        +" FROM deposits"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY date"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Deposits.readShow(indek);
    });
  })
}

Deposits.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border=1>'
      +'<tr>'
        +'<th colspan="2">Cash Account ID</th>'
        +'<th>Deposit #</th>'
        +'<th>Date</th>'
        +'<th>Amount</th>'
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
      +'<td align="center">'+d[x].cash_account_id+'</td>'
      +'<td align="left">'+d[x].deposit_no+'</td>'
      +'<td align="center">'+tglWest(d[x].date)+'</td>'
      +'<td align="right">'+d[x].amount+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'<td align="center">'
        +'<button type="button"'
        +' id="btn_change"'
        +' onclick="Deposits.formUpdate(\''+indek+'\''
        +',\''+d[x].cash_account_id+'\''
        +',\''+d[x].deposit_no+'\''
        +');">'
        +'</button>'
      +'</td>'
      +'<td align="center">'
        +'<button type="button"'
        +' id="btn_delete"'
        +' onclick="Deposits.formDelete(\''+indek+'\''
        +',\''+d[x].cash_account_id+'\''
        +',\''+d[x].deposit_no+'\''
        +');">'
        +'</button></td>'
      +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Deposits.form.addPagingFn(indek);
}

Deposits.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    
    +'<form autocomplete="off">'
    
    +'<div style="display:grid;grid-template-columns:repeat(2,1fr);'
      +'padding-bottom:5px;">'
      
      +'<div>'
        +'<ul>'
        +'<li>'
          +'<label>Cash Acct. ID:</label>'
          +'<input type="text"'
          +' id="cash_account_id_'+indek+'"'
          +' onchange="Deposits.getAccount(\''+indek+'\''
          +',\'cash_account_id_'+indek+'\')"'
          +' size="9">'

          +'<button type="button" id="btn_find" '
          +' onclick="Deposits.account.getPaging(\''+indek+'\''
            +',\'cash_account_id_'+indek+'\''
            +',-1'
            +',\''+CLASS_ASSET+'\')">'
          +'</button>'
          
          +'</li>'
        +'<li>'
          +'<label></label>'
          +'<input type="text" id="cash_account_name_'+indek+'"'
          +' disabled>'
          +'</li>'
          +'</ul>'
      +'</div>'
      +'<div>'
        +'<ul>'
        +'<li><label>Deposit #:</label>'
          +'<input type="text"'
          +' id="deposit_no_'+indek+'"'
          +' size="9">'
          +'</li>'
        
        +'<li><label>Date:</label>'
          +'<input type="date"'
            +' id="deposit_date_'+indek+'"'
            +' onblur="dateFakeShow('+indek+',\'deposit_date\')"'
            +' style="display:none;">'
          +'<input type="text"'
            +' id="deposit_date_fake_'+indek+'"'
            +' onfocus="dateRealShow('+indek+',\'deposit_date\')"'
            +' size="9">'
        +'</li>'
        +'</ul>'
      +'</div>'
      
    +'</div>'
    
      
    +'<details open>'
      +'<summary id="total_rec_'+indek+'">Deposit Details</summary>'
      +'<div id="deposit_detail_'+indek+'"'
      +' style="width:100%;overflow:auto;">'
      +'</div>'

    +'</details>'
    
    +'<ul>'
      +'<li><label>Deposit Total:</label>'
      +'<input type="text"'
      +' id="deposit_amount_'+indek+'"'
      +' size=9'
      +' disabled'
      +' style="text-align:right;">'
      +'</li>'
    +'</ul>'
    
    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  
  document.getElementById('cash_account_id_'+indek).focus();
  document.getElementById('deposit_date_'+indek).value=tglSekarang();
  document.getElementById('deposit_date_fake_'+indek).value=tglWest(tglSekarang());
  
  if(metode==MODE_CREATE) Deposits.getReceipt(indek);
}

Deposits.setRows=(indek,isi)=>{
  if(isi===undefined)isi=[];
    
  var amount=0;
  var html=Deposits.tableHead(indek);
  var iya=false;
  var panjang=isi.length;
  var i;

  bingkai[indek].deposit_detail=isi;
    
  for (i=0;i<panjang;i++){
    if(isi[i].deposit==0) iya='';
    if(isi[i].deposit==1){
      iya='checked';
      amount+=isi[i].receipt_amount;
    }

    html+='<tr>'
    +'<td align="center">'+tglWest(isi[i].receipt_date)+'</td>'
    +'<td align="left">'+isi[i].customer_name+'</td>'
    +'<td align="left">'+isi[i].pay_method_id+'</td>'
    +'<td align="left">'+isi[i].receipt_no+'</td>'
    +'<td align="right">'+isi[i].receipt_amount+'</td>'

    +'<th>'
      +'<input type="checkbox" '
      +' name="deposit_'+indek+'"'
      +' id="deposit_'+i+'_'+indek+'" '+iya
      +' onchange="Deposits.setCell(\''+indek+'\''
      +',\''+i+'\',\'deposit\',this.checked)" '
      +'onfocus="this.select()">'
    +'</th>'
    +'</tr>';
  }
  html+=Deposits.tableFoot(indek);

  var budi = JSON.stringify(isi);
  document.getElementById('deposit_detail_'+indek).innerHTML=html;
  setEV('deposit_amount_'+indek, amount);
  document.getElementById('total_rec_'+indek).innerHTML
        ='Deposit detail: '+panjang+' rows.';

  if(panjang==0)Deposits.newRow(indek);
}

Deposits.tableHead=(indek)=>{
  return '<table border=0 style="width:100%;display:inline-block;" >'
    +'<thead>'
    +'<tr>'
      +'<th>Date</th>'
      +'<th>Received From</th>'
      +'<th>Payment Method</th>'
      +'<th>Ref No.</th>'
      +'<th>Amount</th>'
      +'<th align="center">'
        +'<label>Deposit</label><br>'
        +'<input type="checkbox"'
        +' id="check_all_'+indek+'"'
        +' onclick="Deposits.checkAll(\''+indek+'\')">'
      +'</th>'
    +'</tr>'
    +'</thead>';
}

Deposits.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
    +'<td>&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

Deposits.newRow=(indek)=>{
  var myBasket=[];
  var myItem={};
  var i;

  myBasket=bingkai[indek].deposit_detail;
  
  myItem={};
  myItem.row_id=myBasket.length+1;
  myItem.receipt_date='';
  myItem.customer_name='';
  myItem.pay_method_id='';
  myItem.receipt_no='';
  myItem.receipt_amount=0;
  myItem.deposit=0;
  myBasket.push(myItem);

  Deposits.setRows(indek,myBasket);
}

Deposits.setAccount=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var nama_kolom=bingkai[indek].nama_kolom;
  
  setEV(id_kolom,data.account_id);
  Deposits.getAccount(indek,id_kolom);
}

Deposits.getAccount=(indek,id_kolom,alias)=>{
  Deposits.account.getOne(indek,
  getEV(id_kolom),
  (paket)=>{
    if(paket.count==0){
      setEV('cash_account_name_'+indek, '');
    }else{
      var d=objectOne(paket.fields,paket.data);
      setEV('cash_account_name_'+indek,d.name);
    }
    Deposits.getReceipt(indek);
  });
}

Deposits.checkAll=(indek)=>{
  var c=document.getElementsByName('deposit_'+indek);
  var d=document.getElementById('check_all_'+indek);
  
  for(let x=0;x<c.length;x++){
    if(d.checked){
      c[x].checked=true;
    }else{
      c[x].checked=false;
    }
    Deposits.setCell(indek,x,'deposit',c[x].checked);
  } 
};

Deposits.setCell=(indek,baris,kolom,txt)=>{
  var isi=bingkai[indek].deposit_detail;
  var baru = [];
  var isiEdit = {};
  var amount=0;
    
  for (var i=0;i<isi.length; i++){
    if (i != baris){
      baru.push(isi[i]);
    }else{
      isiEdit = isi[i];
      
      if (kolom=="deposit"){
        txt==true?txt=1:txt=0;
        isiEdit.deposit=txt;
      }
    }
    baru.push(isiEdit);
    //alert(isi[i].receipt_amount);
    if(isi[i].deposit==1) amount+=Number(isi[i].receipt_amount);
  }
  setEV('deposit_amount_'+indek, amount);
}

Deposits.createExecute=(indek)=>{
  var detail=JSON.stringify(bingkai[indek].deposit_detail);
  
  db.execute(indek,{
    query:"INSERT INTO deposits"
      +"(admin_name,company_id,cash_account_id"
      +",deposit_no,date,detail)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEV('cash_account_id_'+indek)+"'"
      +",'"+getEV('deposit_no_'+indek)+"'"
      +",'"+getEV('deposit_date_'+indek)+"'"
      +",'"+detail+"'"
      +")"
  });
}

Deposits.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
      +" FROM deposits"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+bingkai[indek].cash_account_id+"'"
      +" AND deposit_no='"+bingkai[indek].deposit_no+"'"
  },(paket)=>{
    if (paket.err.id==0 && paket.count>0) {
      var d=objectOne(paket.fields,paket.data);

      setEV('cash_account_id_'+indek, d.cash_account_id);
      setEV('cash_account_name_'+indek, d.cash_account_name);
      
      setEV('deposit_no_'+indek, d.deposit_no);
      setEV('deposit_date_'+indek, d.date);
      setEV('deposit_date_fake_'+indek, tglWest(d.date));
      setEV('deposit_amount_'+indek,d.amount);
      
      //Deposits.setRows(indek,d.deposit_detail);
      Deposits.getReceipt(indek);
      message.none(indek);
    }
    
    return callback();
  });
}

Deposits.getReceipt=(indek)=>{  
  //Deposits.setRows(indek,[]);
  var obj={
    fields:["row_id","receipt_date","customer_name","pay_method_id",
      "receipt_no","receipt_amount","deposit"],
    rows:[]
  }
  var i;
  
  db.run(indek,{
    query:"SELECT receipt_date,customer_name,pay_method_id"
      +",receipt_no,receipt_amount"
      +" FROM receipt_deposit_sum"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+getEV('cash_account_id_'+indek)+"'"
      +" AND deposit_no ='"+bingkai[indek].deposit_no+"'"
      +" AND deposit_no !=''"
  },(p)=>{
    if(p.count>0){
      var a;
      for(i=0;i<p.count;i++){
        a=p.data;
        obj.rows.push([
          i,
          a[i][0], // receipt_date
          a[i][1], // customer_name
          a[i][2], // pay_method_id
          a[i][3], // receipt_no
          a[i][4], // receipt_amount
          1
        ])
      }
    }
    getReceiptKosong();
  });
  
  function getReceiptKosong(){
    db.run(indek,{
      query:"SELECT receipt_date,customer_name,pay_method_id"
        +",receipt_no,receipt_amount"
        +" FROM receipt_deposit_sum"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND cash_account_id='"+getEV('cash_account_id_'+indek)+"'"
        +" AND deposit_no =''"
    },(p)=>{
      if(p.err.id==0){
        var a;
        for(i=0;i<p.count;i++){
          a=p.data;
          obj.rows.push([
            i,
            a[i][0], // receipt_date
            a[i][1], // customer_name
            a[i][2], // pay_method_id
            a[i][3], // receipt_no
            a[i][4], // receipt_amount
            0
          ])
        }
        
      }
      var d=objectMany(obj.fields,obj.rows);
      Deposits.setRows(indek,d);
    });
  }
}

Deposits.formUpdate=(indek,cash_account_id,deposit_no)=>{
  bingkai[indek].cash_account_id=cash_account_id;
  bingkai[indek].deposit_no=deposit_no;
  Deposits.form.modeUpdate(indek);
}

Deposits.updateExecute=(indek)=>{
  var detail=JSON.stringify(bingkai[indek].deposit_detail);
  var custom_field=JSON.stringify([
    ['note'],
    ['Add some note']
  ]);
    
  db.execute(indek,{
    query:"UPDATE deposits"
      +" SET deposit_no='"+getEV('deposit_no_'+indek)+"'"
      +",date='"+getEV('deposit_date_'+indek)+"'"
      +",detail='"+detail+"'"
      +",custom_field='"+custom_field+"'"
      
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND admin_name='"+bingkai[indek].admin.name+"'"
      +" AND cash_account_id='"+bingkai[indek].cash_account_id+"'"
      +" AND deposit_no='"+bingkai[indek].deposit_no+"'"
  });
}

Deposits.formDelete=(indek,cash_account_id,deposit_no)=>{
  bingkai[indek].cash_account_id=cash_account_id;
  bingkai[indek].deposit_no=deposit_no;
  Deposits.form.modeDelete(indek);
}

Deposits.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM deposits"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND admin_name='"+bingkai[indek].admin.name+"'"
      +" AND cash_account_id='"+bingkai[indek].cash_account_id+"'"
      +" AND deposit_no='"+bingkai[indek].deposit_no+"'"
  });
}

Deposits.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM deposits "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR deposit_no LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Deposits.search=(indek)=>{
  Deposits.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT cash_account_id,deposit_no,date,amount,"
      +" user_name,date_modified "
      +" FROM deposits"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR deposit_no LIKE '%"+bingkai[indek].text_search+"%'"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Deposits.readShow(indek);
    });
  });
}

Deposits.exportExecute=(indek)=>{
  var table_name=Deposits.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

Deposits.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT cash_account_id,deposit_no,date,amount,"
      +" user_name,date_modified"
      +" FROM deposits"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Deposits.selectShow(indek);
  });
}


Deposits.selectShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +'<table border=1>'
      +'<tr>'
      +'<th align="center">'
        +'<input type="checkbox"'
        +' id="check_all_'+indek+'"'
        +' onclick="checkAll(\''+indek+'\')">'
      +'</th>'
      +'<th colspan="2">Cash Acc. ID</th>'
      +'<th>Deposit #</th>'
      +'<th>Date</th>'
      +'<th>Amount</th>'
      +'<th>Owner</th>'
      +'<th colspan="2">Modified</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
      +'<th align="center">'
        +'<input type="checkbox"'
        +' id="checked_'+x+'_'+indek+'"'
        +' name="checked_'+indek+'">'
      +'</th>'
      +'<td align="center">'+n+'</td>'
      +'<td align="center">'+d[x].cash_account_id+'</td>'
      +'<td align="left">'+d[x].deposit_no+'</td>'
      +'<td align="center">'+tglWest(d[x].date)+'</td>'
      +'<td align="right">'+Number(d[x].amount).toFixed(2)+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

Deposits.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM deposits"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND cash_account_id='"+d[i].cash_account_id+"'"
          +" AND deposit_no='"+d[i].deposit_no+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

Deposits.importExecute=(indek)=>{
  var n=0;
  var m='<p>[Start]</p>';
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO deposits "
        +"(admin_name,company_id,cash_account_id"
        +",deposit_no,date,detail,custom_field)"
        +" VALUES "
        +"('"+bingkai[indek].admin.name+"'"
        +",'"+bingkai[indek].company.id+"'"
        +",'"+d[i][1]+"'" // cash_account_id
        +",'"+d[i][2]+"'" // deposit_no
        +",'"+d[i][3]+"'" // date
        +",'"+d[i][4]+"'" // detail
        +",'"+d[i][5]+"'" // custom_field
        +")"
    },(paket)=>{  
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

Deposits.setDefault=(indek)=>{
  Deposits.setRows(indek,[]);
}

Deposits.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM deposits"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+getEV('cash_account_id_'+indek)+"'"
      +" AND deposit_no='"+getEV('deposit_no_'+indek)+"'"
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

Deposits.duplicate=(indek)=>{
  var id='copy_of '+getEV('deposit_no_'+indek);
  setEV('deposit_no_'+indek,id);
  focus('deposit_no_'+indek);
}

Deposits.deadPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Deposits.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Deposits.properties(indek);})
  }
}



// eof: 572;506;640;658;673;733;716;712;713;717;715;743;
