/*
 * auth: budiono;
 * file: 46;
 * path: /accounting/sales/customer_begins.js;
 * ------------------------------------------;
 * date: sep-28, 17:12, thu-2023; new;
 * edit: sep-30, 17:27, sat-2023; xHTML;
 * edit: dec-04, 17:52, mon-2023; ribuan;
 * -----------------------------; happy new year 2024;
 * edit: jan-11, 09:10, thu-2024; re-write with class;
 * edit: jun-14, 15:53, fri-2024; BasicSQL;
 * edit: jun-15, 20:13, sat-2024; 
 * edit: aug-04, 17:53, sun-2024; r11;
 * edit: sep-13, 11:06, fri-2024; r19;
 * edit: nov-26, 12:41, tue-2024; #27; add locker; 
 * edit: dec-01, 23:12, sun-2024; #27;
 * edit: dec-26, 17:39, thu-2024; #32; properties+duplicate;
 * ------------------------------; happy new year 2025; 
 * edit: feb-23, 15:05, sun-2025; #41; file_id;
 * edit: mar-12, 15:14, wed-2025; #43; deep folder;
 * edit: mar-26, 12:41, wed-2025; #45; ctables;cstructure;
 * edit: apr-22, 16:54, tue-2025; $50; download to CSV format;
 * edit: apr-24, 15:39, thu-2025; #50; total_ar;
 * edit: oct-13, 14:22, mon-2025; #80; relation_vobj;
 */
  
'use strict';

var CustomerBegins={}

CustomerBegins.table_name='customer_begins';
CustomerBegins.form=new ActionForm2(CustomerBegins);
CustomerBegins.customer=new CustomerLook(CustomerBegins);
CustomerBegins.account=new AccountLook(CustomerBegins);
CustomerBegins.hidePreview=true;

CustomerBegins.show=(karcis)=>{
  karcis.modul=CustomerBegins.table_name;
  karcis.have_child=true;
  
  var baru=exist(karcis);
  if(baru==-1){
    var newCus=new BingkaiUtama(karcis);
    var indek=newCus.show();
    getCompanyID(indek);
    getPath2(indek,(h)=>{
      mkdir(indek,h.folder,()=>{
        CustomerBegins.getDefault(indek);
        CustomerBegins.form.modePaging(indek);
      });
    });
  }else{
    show(baru);
  }
}

CustomerBegins.getDefault=(indek)=>{
  CustomerDefaults.getDefault(indek);
//  alert(bingkai[indek].)
}

CustomerBegins.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*),SUM(amount) AS amount"
      +" FROM customer_begins"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
      bingkai[indek].total=paket.data[0][1];
    }
    return callback()
  });
}

CustomerBegins.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  CustomerBegins.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT customer_id,customer_name,amount,"
        +" user_name,date_modified"
        +" FROM customer_begins"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY customer_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      CustomerBegins.readShow(indek);
    });
  })
}

CustomerBegins.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var total=bingkai[indek].total;
  var html='<div style="padding:0.5rem;">'
  +content.title(indek)
  +content.message(indek)
  +TotalPagingLimit(indek)
  +'<table border=1>'
    +'<tr>'
    +'<th colspan="2">Customer ID</th>'
    +'<th>Name</th>'
    +'<th>Amount</th>'
    +'<th>User</th>'
    +'<th>Modified</th>'
    +'<th colspan="2">Action</th>'
    +'</tr>';
    
  if (p.err.id===0){
    var x;
    for (x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].customer_id+'</td>'
        +'<td align="left">'+xHTML(d[x].customer_name)+'</td>'
        +'<td align="right">'+d[x].amount+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button"'
            +' id="btn_change"'
            +' onclick="CustomerBegins.formUpdate(\''+indek+'\''
            +',\''+d[x].customer_id+'\');">'
            +'</button>'
        +'</td>'
        +'<td align="center">'
          +'<button type="button"'
            +' id="btn_delete"'
            +' onclick="CustomerBegins.formDelete(\''+indek+'\''
            +',\''+d[x].customer_id+'\');">'
            +'</button>'
          +'</td>'
        +'</tr>';
    }
  }
  html+='<tr>'
      +'<td colspan="2">&nbsp</td>'
      +'<td align="right"><strong>Total:</strong></td>'
      +'<td align="right"><strong>'+total+'</strong></td>'
      +'<td colspan="4">&nbsp</td>'
    +'</tr>';
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  CustomerBegins.form.addPagingFn(indek);
}

CustomerBegins.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    +'<ul>'
    
    +'<li><label>Customer ID</label>&nbsp;'
      +'<input type="text" '
      +' id="customer_id_'+indek+'"'
      +' onchange="CustomerBegins.getCustomer(\''+indek+'\')">'
      
      +'<button type="button" '
        +' id="customer_btn_'+indek+'" '
        +' class="btn_find"'
        +' onclick="CustomerBegins.customer.getPaging(\''+indek+'\''
        +',\'customer_id_'+indek+'\',-1)">'
        +'</button>'
      +'</li>'
      
    +'<li><label>Name</label>&nbsp;'
      +'<input type="text" '
      +' id="customer_name_'+indek+'"'
      +' size="30"'
      +' disabled>'
      +' </li>'
    +'</ul>'
    
    +'<details open>'
      +'<summary>Customer Beginning Details</summary>'
      +'<div id="begin_detail_'+indek+'"'
      +' style="width:100%;overflow:auto;"></div>'
      +'</details>'
    
    +'<ul>'
    +'<li><label>Total Amount</label>&nbsp;'
      +'<input type="text"'
      +' id="begin_amount_'+indek+'"'
      +' size="12" disabled'
      +' style="text-align:right;">'
      +'</li>'
    +'</ul>'

    +'</form>'
    +'</div>';

  content.html(indek,html);  
  
  if(metode==MODE_CREATE){
    document.getElementById('customer_id_'+indek).focus();
  }else{
    document.getElementById('customer_id_'+indek).disabled=true;
    document.getElementById('customer_btn_'+indek).disabled=true;
  }
  //CustomerBegins.setDefault(indek );
  CustomerBegins.setRows(indek,[] );
}

//CustomerBegins.setDefault=(indek)=>{
  //const d=bingkai[indek].data_default;
  // bingkai[indek].discount_terms=JSON.parse(d.discount_terms);
//}

CustomerBegins.setRows=(indek,isi)=>{
  if(isi===undefined)isi=[];
  if(isi===null)isi=[];

  var panjang=isi.length;
  var html=CustomerBegins.tableHead(indek);
  var begin_amount=0;
    
  bingkai[indek].begin_detail=isi;
    
  for (var i=0;i<panjang;i++){
    html+='<tr>'
    +'<td align="center">'+(i+1)+'</td>'
    +'<td style="margin:0;padding:0">'
      +'<input type="text"'
      +' id="invoice_no_'+i+'_'+indek+'"'
      +' value="'+isi[i].invoice_no+'"'
      +' onfocus="this.select()"'
      +' onchange="CustomerBegins.setCell(\''+indek+'\''
      +',\'invoice_no_'+i+'_'+indek+'\')" '
      +' size="10">'
    +'</td>'
            
    +'<td style="padding:0;margin:0;">'
      +'<input type="text"'
      +' id="date_fake_'+i+'_'+indek+'" '
      +' onfocus="CustomerBegins.showTgl('+i+','+indek+');"'
      +' value="'+tglWest(isi[i].date)+'"'
      +' size="10">'
      +'<br>'

      +'<input type="date"'
      +' id="date_'+i+'_'+indek+'"'
      +' onchange="CustomerBegins.date_change('+indek+',\''+i+'_'+indek+'\')"'
      +' onblur="CustomerBegins.hideTgl(this.value,'+i+','+indek+');"'
      +' value="'+isi[i].date+'"'
      +' style="display:none;"'
      +' size="10">'
    +'</td>'
            
    +'<td style="padding:0;margin:0;">'
      +'<input type="text"'
      +' id="customer_po_'+i+'_'+indek+'"'
      +' value="'+isi[i].customer_po+'"'
      +' onchange="CustomerBegins.setCell(\''+indek+'\''
      +',\'customer_po_'+i+'_'+indek+'\')"'
      +' onfocus="this.select()"'
      +' size="7">'
    +'</td>'

    +'<td align="right" style="padding:0;margin:0;">'
      +'<input type="text"'
      +' id="amount_'+i+'_'+indek+'"'
      +' value="'+isi[i].amount+'"'
      +' style="text-align:right"'
      +' onchange="CustomerBegins.setCell(\''+indek+'\''
      +',\'amount_'+i+'_'+indek+'\')"'
      +' onfocus="this.select()"'
      +' size="5">'
    +'</td>'

    +'<td style="padding:0;margin:0;">'
      +'<input type="text"'
      +' id="displayed_terms_'+i+'_'+indek+'"'
      +' value="'+isi[i].displayed_terms+'"'
      +' onchange="CustomerBegins.setCell(\''+indek+'\''
      +',\'displayed_terms_'+i+'_'+indek+'\')"'
      +' onfocus="this.select()"'
      +' size="15">'
    +'</td>'
    
    +'<td>'
      +'<button type="button"'
      +' id="btn_find" '
      +' onclick="CustomerBegins.showTerms(\''+indek+'\',\''+i+'\');">'
      +'</button>'
    +'</td>'
          
    +'<td style="padding:0;margin:0;">'
      +'<input type="text"'
      +' id="ar_account_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].ar_account_id+'"'
      +' onchange="CustomerBegins.setCell(\''+indek+'\''
      +',\'ar_account_id_'+i+'_'+indek+'\')"'
      +' onfocus="this.select()"'
      +' style="text-align:center;"'
      +' size="8">'
    +'</td>'
    
    +'<td>'
      +'<button type="button"'
      +' id="btn_find" '
      +' onclick="CustomerBegins.account.getPaging(\''+indek+'\''
      +',\'ar_account_id_'+i+'_'+indek+'\',\''+i+'\''
      +',\''+CLASS_ASSET+'\');">'
      +'</button>'
    +'</td>'
          
    +'<td align="center">'
      +'<button type="button"'
      +' id="btn_add"'
      +' onclick="CustomerBegins.addRow(\''+indek+'\','+i+')" >'
      +'</button>'

      +'<button type="button"'
      +' id="btn_remove"'
      +' onclick="CustomerBegins.removeRow(\''+indek+'\','+i+')" >'
      +'</button>'
    +'</td>'
    +'</tr>';
    begin_amount+=Number(isi[i].amount);
  }
  html+=CustomerBegins.tableFoot(indek);
  var budi = JSON.stringify(isi);
  document.getElementById('begin_detail_'+indek).innerHTML=html;
  document.getElementById('begin_amount_'+indek).value=begin_amount;
  if(panjang==0) CustomerBegins.addRow(indek,0);
}

CustomerBegins.tableHead=(indek)=>{
  return '<table border=0 style="width:100%;" >'
    +'<thead>'
    +'<tr>'
    +'<th colspan="2">Invoice#</th>'
    +'<th>Date</th>'
    +'<th>PO#</th>'
    +'<th>Amount</th>'
    +'<th colspan="2">Displayed Terms</th>'
    +'<th colspan="2">A/R Account</th>'
    +'<th>Add/Rem</th>'
    +'</tr>'
    +'</thead>';
}

CustomerBegins.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
    +'<td>#</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

CustomerBegins.addRow=(indek,baris)=>{
  var oldBasket=[];
  var newBasket=[];

  oldBasket=bingkai[indek].begin_detail;

  for(var i=0;i<oldBasket.length;i++){
    newBasket.push(oldBasket[i]);
    if(i==baris) newRow(newBasket);
  }

  if(oldBasket.length==0)newRow(newBasket);
  CustomerBegins.setRows(indek,newBasket);
  
  function newRow(newBas){
    var def=bingkai[indek].data_default;
//    var dt=JSON.parse(def.discount_terms);
    var dt=def.discount_terms;
    var myItem={};
    myItem.nomer=newBas.length+1;
    myItem.invoice_no="";
    myItem.date='';
    myItem.customer_po='';
    myItem.amount=0;
    myItem.ar_account_id=def.ar_account_id;
    myItem.displayed_terms=dt.displayed;
    myItem.discount_terms=dt;
    newBas.push(myItem);
  }
}

CustomerBegins.removeRow=(indek,number)=>{
  var isi=bingkai[indek].begin_detail;
  var newBasket=[];
  var amount=0;  
  CustomerBegins.setRows(indek,isi);
  for(var i=0;i<isi.length;i++){
    if (i!=(number))newBasket.push(isi[i]);
  }
  CustomerBegins.setRows(indek,newBasket);
}

CustomerBegins.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].begin_detail;
  var baru = [];
  var isiEdit = {};
  var sum_amount=0;
  
  for (var i=0;i<isi.length; i++){
    isiEdit={};
    isiEdit=isi[i];
    
    if(id_kolom==('invoice_no_'+i+'_'+indek)){
      isiEdit.invoice_no=getEV(id_kolom);
      baru.push(isiEdit);
    }
    else if(id_kolom==('date_'+i+'_'+indek)){
      isiEdit.date=getEV(id_kolom);
      baru.push(isiEdit);
    }
    else if(id_kolom==('customer_po_'+i+'_'+indek)){
      isiEdit.customer_po=getEV(id_kolom);
      baru.push(isiEdit);
    }
    else if(id_kolom==('displayed_terms_'+i+'_'+indek)){
      isiEdit.displayed_terms=getEV(id_kolom);
      baru.push(isiEdit);
    }
    else if(id_kolom==('amount_'+i+'_'+indek)){
      isiEdit.amount=getEV(id_kolom);
      baru.push(isiEdit);
    }
    else if(id_kolom==('ar_account_id_'+i+'_'+indek)){
      isiEdit.ar_account_id=getEV(id_kolom);
      baru.push(isiEdit);
    }
    else{
      baru.push(isi[i]);
    }
    sum_amount+=Number(isi[i].amount);
  }
  bingkai[indek].begin_detail=isi;
  document.getElementById('begin_amount_'+indek).value=sum_amount;
}

CustomerBegins.setCustomer=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;

  setEV(id_kolom, data.customer_id);
  CustomerBegins.getCustomer(indek);
}

CustomerBegins.getCustomer=(indek)=>{
  message.none(indek);
  CustomerBegins.customer.getOne(indek,
    getEV('customer_id_'+indek),
  (paket)=>{
    setEV('customer_name_'+indek, txt_undefined);
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('customer_name_'+indek, d.name);
    }
  });
}

CustomerBegins.showTgl=(kolom,indek)=>{
  var abc=bingkai[indek].begin_detail[kolom].date
  if(abc==undefined || abc==''){
    var tgl=new Date();
    abc=tgl.getFullYear()
      +'-'+String("00"+(tgl.getMonth()+1)).slice(-2)
      +'-'+String("00"+tgl.getDate()).slice(-2);
  }
  document.getElementById('date_fake_'+kolom+'_'+indek).style.display="none";
  document.getElementById('date_'+kolom+'_'+indek).value=abc;
  document.getElementById('date_'+kolom+'_'+indek).style.display="inline";
  document.getElementById('date_'+kolom+'_'+indek).style.width="231px";
  document.getElementById('date_'+kolom+'_'+indek).focus();
}

CustomerBegins.hideTgl=(abc,baris,indek)=>{
  setEV('date_fake_'+baris+'_'+indek, tglWest(abc));
  document.getElementById('date_fake_'+baris+'_'+indek).style.display="inline";
  document.getElementById('date_'+baris+'_'+indek).style.display="none";
  bingkai[indek].begin_detail[baris].date
    =document.getElementById('date_'+baris+'_'+indek).value;
  
  CustomerBegins.setCell(indek,'date_fake_'+baris+'_'+indek);
}

CustomerBegins.date_change=(indek,id)=>{
  setEV("date_fake_"+id, tglWest(getEV("date_"+id)));
  CustomerBegins.setCell(indek,"date_"+id);
}

CustomerBegins.showTerms=(indek,baris)=>{
  bingkai[indek].baris=baris;
  
  var def=bingkai[indek].data_default;
  //var dt=JSON.parse(def.discount_terms);
  var dt=def.discount_terms;
  bingkai[indek].discount_terms=dt;
  if(bingkai[indek].discount_terms==undefined){
    DiscountTerms.getColumn(indek);
  }else{
    var isi=bingkai[indek].begin_detail[baris].discount_terms;
    var amount=Number(document.getElementById('amount_'+baris+'_'+indek).value);
    var tgl=document.getElementById('date_'+baris+'_'+indek).value;

//    alert(bingkai[indek].begin_detail[baris].discount_terms.date);
//    alert(tgl);

    bingkai[indek].begin_detail[baris].discount_terms.date=tgl;
    bingkai[indek].begin_detail[baris].discount_terms.amount=amount;
    bingkai[indek].discount_terms=bingkai[indek].begin_detail[baris].discount_terms;
  }
  DiscountTerms.show(indek);
}

CustomerBegins.setTerms=(indek)=>{
  var baris=bingkai[indek].baris;
  var data_terms=bingkai[indek].discount_terms;

  setEV('displayed_terms_'+baris+'_'+indek
    ,bingkai[indek].discount_terms.displayed);
  
  CustomerBegins.setCell(indek,"displayed_terms_"+baris+'_'+indek);
  bingkai[indek].begin_detail[baris].discount_terms=data_terms;
}

CustomerBegins.setAccount=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom,data.account_id);
  CustomerBegins.setCell(indek,id_kolom);
}

CustomerBegins.createExecute=(indek)=>{

  var begin_detail=JSON.stringify(bingkai[indek].begin_detail);

  db.execute(indek,{
    query:"INSERT INTO customer_begins"
      +"(admin_name,company_id,customer_id,detail)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEV('customer_id_'+indek)+"'"
      +",'"+begin_detail+"'"
      +")"
  });
}

CustomerBegins.formUpdate=(indek,customer_id)=>{
  bingkai[indek].customer_id=customer_id;
  CustomerBegins.form.modeUpdate(indek);
}

CustomerBegins.updateExecute=(indek)=>{

  var begin_detail=JSON.stringify(bingkai[indek].begin_detail)

  db.execute(indek,{
    query:"UPDATE customer_begins "
      +" SET detail='"+begin_detail+"'"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"'"
  },(p)=>{
    if(p.err.id==0) CustomerBegins.endPath( indek );
  });
}

CustomerBegins.formDelete=(indek,cust_id)=>{
  bingkai[indek].customer_id=cust_id;
  CustomerBegins.form.modeDelete(indek);
}

CustomerBegins.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM customer_begins"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"'"
  },(p)=>{
    if(p.err.id==0) CustomerBegins.endPath( indek );
  });
}

CustomerBegins.readOne=(indek,callback)=>{

  db.execute(indek,{
    query:"SELECT * FROM customer_begins"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"'"
  },(paket)=>{
    if (paket.err.id==0){
      var d=objectOne(paket.fields,paket.data);
      setEV('customer_id_'+indek,d.customer_id);
      setEV('customer_name_'+indek,d.customer_name);
      CustomerBegins.setRows(indek,JSON.parse(d.detail));
    }else{
      CustomerBegins.setRows(indek,[]);
    }
    message.none(indek);
    return callback();
  });
}

CustomerBegins.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) AS count,SUM(amount) AS amount"
      +" FROM customer_begins "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR customer_name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
      bingkai[indek].total=paket.data[0][1];
    }
    return callback()
  });
}

CustomerBegins.search=(indek)=>{
  CustomerBegins.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT customer_id,customer_name,amount,"
        +" user_name,date_modified"
        +" FROM customer_begins"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND customer_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR customer_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      CustomerBegins.readShow(indek);
    });
  });
}

CustomerBegins.exportExecute=(indek)=>{
  var table_name=CustomerBegins.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

CustomerBegins.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;

  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO customer_begins"
      +"(admin_name,company_id,customer_id,detail)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+d[i][1]+"'"
      +",'"+d[i][2]+"'"
      +")"
    },(paket)=>{  
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

CustomerBegins.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT customer_id,customer_name,amount,"
      +" user_name,date_modified"
      +" FROM customer_begins"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"    
      +" ORDER BY customer_id"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    CustomerBegins.selectShow(indek);
  });
}

CustomerBegins.selectShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
  +content.title(indek)
  +content.message(indek)
  +'<table border=1>'
    +'<tr>'
    +'<td align="center">'
      +'<input type="checkbox"'
      +' id="check_all_'+indek+'"'
      +' onclick="checkAll(\''+indek+'\')">'
    +'</td>'
    +'<th colspan="2">Customer ID</th>'
    +'<th>Name</th>'
    +'<th>Amount</th>'
    +'<th>User</th>'
    +'<th>Modified</th>'
    +'</tr>';
    
  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'
          +'<input type="checkbox"'
          +' id="checked_'+x+'_'+indek+'"'
          +' name="checked_'+indek+'" >'
        +'</td>'
        +'<td align="left">'+n+'</td>'
        +'<td align="left">'+d[x].customer_id+'</td>'
        +'<td align="left">'+xHTML(d[x].customer_name)+'</td>'
        +'<td align="right">'+ribuan(d[x].amount)+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

CustomerBegins.deleteAllExecute=(indek)=>{
  var r=bingkai[indek].paket,
        d=objectMany(r.fields,r.data),
        e=document.getElementsByName('checked_'+indek),
        c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM customer_begins"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND customer_id='"+d[i].customer_id+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}  

CustomerBegins.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM customer_begins"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+getEV('customer_id_'+indek)+"'"
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

CustomerBegins.duplicate=(indek)=>{
  var id='copy_of '+getEV('customer_id_'+indek);
  document.getElementById('customer_id_'+indek).value=id;
  document.getElementById('customer_id_'+indek).focus();
  //--
  document.getElementById('customer_id_'+indek).disabled=false;
  document.getElementById('customer_btn_'+indek).disabled=false;
}

CustomerBegins.endPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{CustomerBegins.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{CustomerBegins.properties(indek);})
  }
}




//eof: 692;662;606;721;718;733;790;780;784;790;
