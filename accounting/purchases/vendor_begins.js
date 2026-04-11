/*
 * auth: budiono;
 * file: 48;
 * path: /accounting/purchases/vendor_begins.js;
 * --------------------------------------------;
 * date: sep-27, 15:08, wed-2023; new;
 * edit: sep-30, 17:30, sat-2023; xHTML;
 * edit: oct-04, 17:59, wed-2023; 
 * edit: nov-19, 21:10, sun-2023;
 * edit: dec-24, 06:42, sun-2023; ribuan;
 * -----------------------------; happy new year 2024;
 * edit: jan-11, 11:58, thu-2024; re-write w class;
 * edit: jun-16, 10:57, sun-2024; BasicSQL;
 * edit: aug-04, 14:32, sun-2024; r11;
 * edit: sep-13, 11:32, fri-2024; r19;
 * edit: oct-08, 17:26, tue-2024; #20;
 * edit: nov-26, 13:28, tue-2024; #27; add locker;
 * edit: dec-02, 12:53, mon-2024; #27; 
 * edit: dec-19, 14:51, thu-2024; #31; properties;
 * edit: dec-26, 17:02, thu-2024; #32; duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-23, 16:22, sun-2025; #41; file_id;
 * edit: mar-13, 06:15, thu-2025; #43; deep-folder;
 * edit: mar-26, 12:49, wed-2025; #45; ctables;cstructure;
 * edit: apr-22, 16:46, tue-2025; #50; download to csv;
 * edit: apr-24, 15:24, thu-2025; #50; total
 */ 

'use strict';

var VendorBegins={};

VendorBegins.table_name='vendor_begins';
VendorBegins.form=new ActionForm2(VendorBegins);
VendorBegins.vendor=new VendorLook(VendorBegins);
VendorBegins.account=new AccountLook(VendorBegins);

VendorBegins.show=(karcis)=>{
  karcis.modul=VendorBegins.table_name;
  karcis.child_free=false;

  var baru=exist(karcis);
  if(baru==-1){
    var newVen=new BingkaiUtama(karcis);
    var indek=newVen.show();
    getCompanyID(indek);
    getPath2(indek,(h)=>{
      mkdir(indek,h.folder,()=>{
        VendorBegins.getDefault(indek);
        VendorBegins.form.modePaging(indek);
      });
    });
  }else{
    show(baru);
  }
}

VendorBegins.getDefault=(indek)=>{
  VendorDefaults.getDefault(indek);
}

VendorBegins.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*),SUM(amount) AS amount"
      +" FROM vendor_begins"
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

VendorBegins.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  VendorBegins.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT vendor_id,vendor_name,amount,"
        +" user_name,date_modified"
        +" FROM vendor_begins"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY vendor_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      VendorBegins.readShow(indek);
    });
  })
}

VendorBegins.readShow=function(indek){
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
      +'<th colspan="2">Vendor ID</th>'
      +'<th>Name</th>'
      +'<th>Amount</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
      +'<th colspan=2>Action</th>'
      +'</tr>';
    
    if (p.err.id===0){
      var x;
      for (x in d) {
        n++;
        html+='<tr>'
          +'<td align="center">'+n+'</td>'
          +'<td>'+d[x].vendor_id+'</td>'
          +'<td>'+xHTML(d[x].vendor_name)+'</td>'
          +'<td align="right">'+d[x].amount+'</td>'
          +'<td align="center">'+d[x].user_name+'</td>'
          +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
          +'<td align="center">'
            +'<button type="button"'
            +' id="btn_change"'
            +' onclick="VendorBegins.formUpdate(\''+indek+'\''
            +',\''+d[x].vendor_id+'\');">'
            +'</button>'
            +'</td>'
          +'<td align="center">'
            +'<button type="button"'
            +' id="btn_delete"'
            +' onclick="VendorBegins.formDelete(\''+indek+'\''
            +',\''+d[x].vendor_id+'\');">'
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
  VendorBegins.form.addPagingFn(indek);
}

VendorBegins.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    +'<ul>'
    
    +'<li><label>Vendor ID</label>&nbsp;'
      +'<input type="text"'
      +' id="vendor_id_'+indek+'"'
      +' onchange="VendorBegins.getVendor(\''+indek+'\')"'
      +' size="16" >'

      +'<button type="button" '
        +' id="vendor_btn_'+indek+'" class="btn_find"'
        +' onclick="VendorBegins.vendor.getPaging(\''+indek+'\''
        +',\'vendor_id_'+indek+'\',-1)"></button>'
      
      +'</li>'
      
    +'<li><label>Name</label>&nbsp;'
      +'<input type="text"'
      +' id="vendor_name_'+indek+'"'
      +' disabled>'
      +'</li>'
    +'</ul>'
    
    +'<details open>'
      +'<summary>Vendor Beginning Details</summary>'
      +'<div id="begin_detail_'+indek+'"'
      +' style="width:100%;overflow:auto;"></div>'
      +'</details>'
      
    +'<ul>'
    +'<li><label>Total Amount</label>:&nbsp;'
      +'<input type="text"'
      +' id="begin_amount_'+indek+'"'
      +' style="text-align:right;" disabled'
      +' size="9" >'
      +'</li>'
    +'</ul>'
    
    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  
  if(metode!=MODE_CREATE){
    document.getElementById('vendor_id_'+indek).disabled=true;
    document.getElementById('vendor_btn_'+indek).disabled=true;
  }else{
    document.getElementById('vendor_id_'+indek).focus();
  }
  //VendorBegins.setDefault(indek);
  VendorBegins.setRows(indek,[] );
}

VendorBegins.setRows=function(indek,isi){  
  if(isi===undefined)isi=[];
  if(isi===null)isi=[];
  var panjang=isi.length;
  var html=VendorBegins.tableHead(indek);
  var begin_amount=0;

  bingkai[indek].begin_detail=isi;

  for (var i=0;i<panjang;i++){
    html+='<tr>'
      +'<td style="padding:0;margin:0" align="center">'+(i+1)+'</td>'
      +'<td style="margin:0;padding:0">'
        +'<input type="text"'
        +' id="invoice_no_'+i+'_'+indek+'"'
        +' value="'+isi[i].invoice_no+'"'
        +' onfocus="this.select()"'
        +' onchange="VendorBegins.setCell(\''+indek+'\''
        +',\'invoice_no_'+i+'_'+indek+'\')"'
        +' size="10" >'
        +'</td>'
        
      +'<td style="padding:0;margin:0;">'
        +'<input type="text"'
          +' id="date_fake_'+i+'_'+indek+'"'
          +' onfocus="VendorBegins.showTgl('+i+','+indek+');"'
          +' value="'+tglWest(isi[i].date)+'"'
          +' size="9" >'
          +'<br>'
          
        +'<input type="date"'
          +' id="date_'+i+'_'+indek+'"'
          +' onblur="VendorBegins.hideTgl(this.value,'+i+','+indek+');"'
          +' value="'+isi[i].date+'"'
          +' style="display:none;"'
          +' size="12" >'
          +'</td>'
        
      +'<td style="padding:0;margin:0;">'
        +'<input type="text"'
        +' id="po_no_'+i+'_'+indek+'"'
        +' value="'+isi[i].po_no+'"'
        +' onfocus="this.select()"'
        +' onchange="VendorBegins.setCell(\''+indek+'\''
        +',\'po_no_'+i+'_'+indek+'\')"'
        +' size="10" >'
        +'</td>'

      +'<td  align="right" style="padding:0;margin:0;">'
        +'<input type="text"'
        +' id="amount_'+i+'_'+indek+'"'
        +' value="'+isi[i].amount+'"'
        +' onfocus="this.select()"'
        +' onchange="VendorBegins.setCell(\''+indek+'\''
        +',\'amount_'+i+'_'+indek+'\')"'
        +' style="text-align:right"'
        +' size="9">'
        +'</td>'
        
      +'<td style="padding:0;margin:0;">'
        +'<input type="text"'
        +' id="displayed_terms_'+i+'_'+indek+'"'
        +' value="'+isi[i].displayed_terms+'"'
        +' onfocus="this.select()"'
        +' onchange="VendorBegins.setCell(\''+indek+'\''
        +',\'displayed_terms_'+i+'_'+indek+'\')"'
        +' size="15" >'
      +'</td>'
      
      +'<td>'
        +'<button type="button"'
        +' id="btn_find" '
        +' onclick="VendorBegins.showTerms(\''+indek+'\',\''+i+'\');">'
        +'</button>'
      +'</td>'
      
      +'<td style="padding:0;margin:0;">'
        +'<input type="text"'
        +' id="ap_account_id_'+i+'_'+indek+'"'
        +' value="'+isi[i].ap_account_id+'"'
        +' onchange="VendorBegins.setCell(\''+indek+'\''
        +',\'ap_account_id_'+i+'_'+indek+'\')"'
        +' onfocus="this.select()" '
        +' style="text-align:center;"'
        +' size="7" >'
        +'</td>'
        
      +'<td>'
        +'<button type="button"'
        +' id="btn_find" '
        +' onclick="VendorBegins.account.getPaging(\''+indek+'\''
        +',\'ap_account_id_'+i+'_'+indek+'\',\''+i+'\''
        +',\''+CLASS_LIABILITY+'\');">'
        +'</button>'
      +'</td>'
      
      +'<td align="center">'
        +'<button type="button"'
        +' id="btn_add"'
        +' onclick="VendorBegins.addRow(\''+indek+'\','+i+')" >'
        +'</button>'
        
        +'<button type="button"'
        +' id="btn_remove"'
        +' onclick="VendorBegins.removeRow(\''+indek+'\','+i+')" >'
        +'</button>'
      +'</td>'
    +'</tr>';
    begin_amount+=Number(isi[i].amount);
  }

  html+=VendorBegins.tableFoot(indek);
  var budi = JSON.stringify(isi);
  document.getElementById('begin_detail_'+indek).innerHTML=html;
  document.getElementById('begin_amount_'+indek).value=begin_amount;
  if(panjang==0)VendorBegins.addRow(indek,0);
}

VendorBegins.tableHead=(indek)=>{
  return '<table id="myTable_'+indek+'" border=0 style="width:100%;" >'
    +'<thead>'
    +'<tr>'
    +'<th colspan="2">Invoice#</th>'
    +'<th>Date</th>'
    +'<th>PO#</th>'
    +'<th>Amount</th>'
    +'<th colspan="2">Displayed Terms</th>'
    +'<th colspan="2">A/P Account</th>'
    +'<th>Add/Rem</th>'
    +'</tr>'
    +'</thead>';
}

VendorBegins.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
    +'<td>&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

VendorBegins.addRow=(indek,baris)=>{
  var oldBasket=[];
  var newBasket=[];
  var dt=bingkai[indek].data_default.discount_terms;
  bingkai[indek].discount_terms=dt;

  oldBasket=bingkai[indek].begin_detail;

  for(var i=0;i<oldBasket.length;i++){
    newBasket.push(oldBasket[i]);
    if(i==baris)newRow(newBasket);
  }
  if(oldBasket.length==0)newRow(newBasket);
  VendorBegins.setRows(indek,newBasket);
  
  function newRow(newBasket2){
    var myItem={};
    myItem.nomer=newBasket2.length+1;
    myItem.invoice_no='';
    myItem.date='';
    myItem.po_no='';
    myItem.amount=0;
    myItem.ap_account_id=bingkai[indek].data_default.ap_account_id;
    myItem.displayed_terms=dt.displayed;
    myItem.discount_terms=dt;
    
    newBasket2.push(myItem);
  }
}

VendorBegins.removeRow=(indek,number)=>{
  var oldBasket=bingkai[indek].begin_detail;
  var newBasket=[];
  
  VendorBegins.setRows(indek,oldBasket);

  for(var i=0;i<oldBasket.length;i++){
    if (i!=(number))newBasket.push(oldBasket[i])
  }
  VendorBegins.setRows(indek,newBasket);
}

VendorBegins.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].begin_detail;
  var baru=[];
  var isiEdit={};
  var sum_amount=0;

  for (var i=0;i<isi.length; i++){
    isiEdit=isi[i];
    
    if(id_kolom==('invoice_no_'+i+'_'+indek)){
      isiEdit.invoice_no=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
    }
    else if(id_kolom==('date_'+i+'_'+indek)){
      isiEdit.date=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
    }
    else if(id_kolom==('po_no_'+i+'_'+indek)){
      isiEdit.po_no=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
    }
    else if(id_kolom==('displayed_terms_'+i+'_'+indek)){
      isiEdit.displayed_terms=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
    }
    else if(id_kolom==('amount_'+i+'_'+indek)){
      isiEdit.amount=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
    }
    else if(id_kolom==('ap_account_id_'+i+'_'+indek)){
      isiEdit.ap_account_id=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
    }
    else{
      baru.push(isi[i]);
    }
    sum_amount+=parseFloat(baru[i].amount);
  }  

  document.getElementById('begin_amount_'+indek).value=sum_amount;
  
  bingkai[indek].begin_detail=isi;
}

VendorBegins.showTgl=(kolom,indek)=>{
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

VendorBegins.hideTgl=(abc,baris,indek)=>{
  document.getElementById('date_fake_'+baris+'_'+indek).value=tglWest(abc);
  document.getElementById('date_fake_'+baris+'_'+indek).style.display="inline";
  document.getElementById('date_'+baris+'_'+indek).style.display="none";
  bingkai[indek].begin_detail[baris].date
    =document.getElementById('date_'+baris+'_'+indek).value;
  
  VendorBegins.setCell(indek,'date_fake_'+baris+'_'+indek);
}

VendorBegins.setVendor=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, data.vendor_id);
  VendorBegins.getVendor(indek);
}

VendorBegins.getVendor=(indek)=>{
  VendorBegins.vendor.getOne(indek,
    document.getElementById('vendor_id_'+indek).value,
  (paket)=>{
    setEV('vendor_name_'+indek, txt_undefined);
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('vendor_name_'+indek, d.name);
    }
  });
}

VendorBegins.showTerms=(indek,baris)=>{
  bingkai[indek].baris=baris;
  
  var isi=bingkai[indek].begin_detail[baris].discount_terms;
  var amount=Number(document.getElementById('amount_'+baris+'_'+indek).value);
  var tgl=document.getElementById('date_'+baris+'_'+indek).value;

  bingkai[indek].begin_detail[baris].discount_terms.date=tgl;
  bingkai[indek].begin_detail[baris].discount_terms.amount=amount;
  bingkai[indek].discount_terms=bingkai[indek].begin_detail[baris].discount_terms;

  DiscountTerms.show(indek);
}

VendorBegins.setTerms=(indek)=>{
  var baris=bingkai[indek].baris;
  document.getElementById('displayed_terms_'+baris+'_'+indek).value
    =bingkai[indek].discount_terms.displayed;
    
  VendorBegins.setCell(indek,"displayed_terms_"+baris+'_'+indek);
  bingkai[indek].begin_detail[baris].discount_terms
    =bingkai[indek].discount_terms;
}

VendorBegins.setAccount=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  document.getElementById(id_kolom).value=data.account_id;
  VendorBegins.setCell(indek,id_kolom);
}

VendorBegins.createExecute=(indek)=>{
  var detail=JSON.stringify(bingkai[indek].begin_detail);
  db.execute(indek,{
    query:"INSERT INTO vendor_begins"
    +"(admin_name,company_id,vendor_id,detail)"
    +" VALUES "
    +"('"+bingkai[indek].admin.name+"'"
    +",'"+bingkai[indek].company.id+"'"
    +",'"+getEV('vendor_id_'+indek)+"'"
    +",'"+detail+"'"
    +")"
  });
}

VendorBegins.readOne=(indek,callback)=>{

  db.execute(indek,{
    query:"SELECT * "
      +" FROM vendor_begins"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+bingkai[indek].vendor_id+"'"
  },(paket)=>{
    if (paket.err.id==0) {
      var d=objectOne(paket.fields,paket.data);
      setEV('vendor_id_'+indek,d.vendor_id);
      setEV('vendor_name_'+indek,d.vendor_name);
      VendorBegins.setRows(indek, JSON.parse(d.detail));
    }else{
      VendorBegins.setRows(indek,[]);    
    }
    message.none(indek);
    return callback();
  });
}

VendorBegins.formUpdate=function(indek,vendor_id){
  bingkai[indek].vendor_id=vendor_id;
  VendorBegins.form.modeUpdate(indek);
}

VendorBegins.updateExecute=function(indek){

  var detail=JSON.stringify(bingkai[indek].begin_detail);

  db.execute(indek,{
    query:"UPDATE vendor_begins "
      +" SET detail='"+detail+"'"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+bingkai[indek].vendor_id+"'"
  },(p)=>{
    if(p.err.id==0) VendorBegins.endPath( indek );
  });
}

VendorBegins.formDelete=function(indek,vendor_id){
  bingkai[indek].vendor_id=vendor_id;
  VendorBegins.form.modeDelete(indek);
}

VendorBegins.deleteExecute=function(indek){
  db.execute(indek,{
    query:"DELETE FROM vendor_begins"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+bingkai[indek].vendor_id+"'"
  },(p)=>{
    if(p.err.id==0) VendorBegins.endPath( indek );
  });
}

VendorBegins.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) AS COUNT,SUM(amount) AS amount"
      +" FROM vendor_begins "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR vendor_name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
      bingkai[indek].total=paket.data[0][1];
    }
    return callback()
  });
}

VendorBegins.search=(indek)=>{
  VendorBegins.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT vendor_id,vendor_name,amount,"
        +" user_name,date_modified"
        +" FROM vendor_begins "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND vendor_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR vendor_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      VendorBegins.readShow(indek);
    });
  });
}

VendorBegins.exportExecute=(indek)=>{
  var table_name=VendorBegins.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

VendorBegins.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO vendor_begins"
      +"(admin_name,company_id,vendor_id,detail)"
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

VendorBegins.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT vendor_id,vendor_name,amount,"
      +" user_name,date_modified"
      +" FROM vendor_begins"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY vendor_id"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    VendorBegins.selectShow(indek);
  });
}

VendorBegins.selectShow=function(indek){
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
    +'<th colspan="2">Vendor ID</th>'
    +'<th>Name</th>'
    +'<th>Amount</th>'
    +'<th>Owner</th>'
    +'<th>Modified</th>'
    +'</tr>';
  
  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'
          +'<input type="checkbox"'
          +' id="checked_'+x+'_'+indek+'"'
          +' name="checked_'+indek+'">'
        +'</td>'
        +'<td>'+n+'</td>'
        +'<td>'+d[x].vendor_id+'</td>'
        +'<td>'+xHTML(d[x].vendor_name)+'</td>'
        +'<td align="right">'+ribuan(d[x].amount)+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek, p);
}

VendorBegins.deleteAllExecute=(indek)=>{
  var r=bingkai[indek].paket;
  var d=objectMany(r.fields,r.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM vendor_begins"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND vendor_id='"+d[i].vendor_id+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

VendorBegins.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM vendor_begins"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+getEV('vendor_id_'+indek)+"'"
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

VendorBegins.duplicate=(indek)=>{
  var id='copy_of '+document.getElementById('vendor_id_'+indek).value;
  document.getElementById('vendor_id_'+indek).value=id;
  document.getElementById('vendor_id_'+indek).focus();
  //--disabled
  document.getElementById('vendor_id_'+indek).disabled=false;
  document.getElementById('vendor_btn_'+indek).disabled=false;
}

VendorBegins.endPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{VendorBegins.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{VendorBegins.properties(indek);})
  }
}




// eof: 650;594;704;701;714;731;763;766;773;771;776;
