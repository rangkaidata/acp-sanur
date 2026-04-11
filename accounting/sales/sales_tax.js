/*
 * name: budiono;
 * file: E6;
 * path: /accounting/sales/sales_tax.js;
 * ------------------------------------;
 * edit: sep-13, 11:33, wed-2023; new;503;
 * edit: sep-19, 12:20, tue-2023; 
 * -----------------------------; happy new year 2024;
 * edit: jan-08, 16:48, mon-2024; new with oop;
 * edit: may-30, 10:04, thu-2024; BasicSQL;
 * edit: jul-02, 16:13, tue-2024; r4;
 * edit: jul-30, 17:08, tue-2024; r11;
 * edit: sep-12, 10:57, thu-2024; r19;
 * edit: nov-25, 08:35, mon-2024; #27; add locker;
 * edit: dec-01, 18:01, sun-2024; #27; 
 * edit: dec-25, 15:38, wed-2024; #32; properties+duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-22, 16:58, sat-2025; #41; file_id
 * edit: mar-11, 21:21, tue-2025; #43; deep-folder;
 * edit: mar-26, 00:29, wed-2025; #45; ctables;cstructure;
 * edit: apr-11, 12:51, fri-2025; #46; tes-data;
 * edit: apr-24, 21:00, thu-2025; #50; export to csv file;
 */ 
 
'use strict';

var SalesTax={}

SalesTax.table_name="sales_taxes";
SalesTax.form=new ActionForm2(SalesTax);
SalesTax.account=new AccountLook(SalesTax);

SalesTax.show=(karcis)=>{
  karcis.modul=SalesTax.table_name;
  karcis.child_free=false;
  
  var baru=exist(karcis);
  if(baru==-1){
    var newItm=new BingkaiUtama(karcis);
    var indek=newItm.show();
    getCompanyID(indek);
    getPath2(indek,(h)=>{
      mkdir(indek,h.folder,()=>{
        SalesTax.form.modePaging(indek);
      });
    });
  }else{
    show(baru);
  }
}

SalesTax.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM sales_taxes"
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

SalesTax.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  SalesTax.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT sales_tax_id,name,rate, "
        +" user_name,date_modified"
        +" FROM sales_taxes"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY sales_tax_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      SalesTax.readShow(indek);
    });
  })
}

SalesTax.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +totalPagingandLimit(indek)
    
    +'<table border=1>'
    +'<tr>'
      +'<th colspan="2">Sales Tax </th>'
      +'<th>Description</th>'
      +'<th>Rate</th>'
      
      +'<th>User</th>'
      +'<th>Modified</th>'
      +'<th colspan=2>Action</th>'
    +'</tr>';
    
  if (p.err.id===0){
    var x;
    for (x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].sales_tax_id+'</td>'
        +'<td align="left">'+xHTML(d[x].name)+'</td>'
        +'<td align="right">'+d[x].rate+'%</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'
          +tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button" id="btn_change" '
            +' onclick="SalesTax.formUpdate(\''+indek+'\''
            +',\''+d[x].sales_tax_id+'\');">'
          +'</button>'
        +'</td>'
        +'<td align="center">'
          +'<button type="button" id="btn_delete" '
            +' onclick="SalesTax.formDelete(\''+indek+'\''
            +',\''+d[x].sales_tax_id+'\');">'
          +'</button>'
        +'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);  
  SalesTax.form.addPagingFn(indek);
}

SalesTax.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  
  var html=''
    +'<div style="padding:0.5rem">'
      +content.title(indek)
      +'<div id="msg_'+indek+'" style="margin-bottom:1rem;"></div>'
      +'<form autocomplete="off">'
      +'<ul>'
        +'<li>'
          +'<label>Tax ID<i style="color:red">*</i></label>'
          +'<input type="text" '
            +' id="sales_tax_id_'+indek+'" '
            +' size="20" >'
        +'</li>'

        +'<li>'
          +'<label>Description</label>'
          +'<input type="text" '
            +' id="sales_tax_name_'+indek+'">'
        +'</li>'

        +'<li><label>&nbsp;</label>'
          +'<label><input type="checkbox" '
            +' id="sales_tax_inactive_'+indek+'">Inactive'
          +'</label>'
        +'</li>'

        +'<li><label>&nbsp;</label>'
          +'<label><input type="checkbox" '
            +' id="sales_tax_freight_'+indek+'">Freight'
          +'</label>'
        +'</li>'
      +'</ul>'

      +'<details open>'
        +'<summary>Sales Tax Details</summary>'
        +'<div id="sales_tax_detail_'+indek+'"></div>'
      +'</details>'

      +'<ul>'
        +'<li><label>Total Rate</label>'
          +'<input type="text" '
            +' id="sales_tax_total_'+indek+'"'
            +' disabled'
            +' style="text-align:center;"'
            +' size="9">'
        +'</li>'
      +'</ul>'
      
      +'</form>'
    +'</div>';
    
  content.html(indek,html);
  statusbar.ready(indek);
  bingkai[indek].sales_tax_detail=[];
  SalesTax.setRows(indek,[]);
  
  if(metode==MODE_CREATE){
    document.getElementById('sales_tax_id_'+indek).focus();
  }else{
    document.getElementById('sales_tax_id_'+indek).disabled=true;
    document.getElementById('sales_tax_name_'+indek).focus();
  }
}

// GRID operation;
SalesTax.setRows=(indek,isi)=>{
  if(isi===undefined)isi=[];
    
  var panjang=isi.length;
  var html=SalesTax.tableHead(indek);
  var sum_rate=0;

  bingkai[indek].sales_tax_detail=isi;
    
  for (var i=0;i<panjang;i++){
    html+='<tr>'
    +'<td align="center">'+(i+1)+'</td>'
    +'<td style="margin:0;padding:0">'
      +'<input type="text" id="description_'+i+'_'+indek+'" '
      +' value="'+isi[i].description+'"'
      +' onchange="SalesTax.setCell(\''+indek+'\''
      +',\'description_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()">'
    +'</td>'

    +'<td align="center" style="padding:0;margin:0;">'
    +'<input type="text" id="rate_'+i+'_'+indek+'" '
      +' value="'+isi[i].rate+'"'
      +' style="text-align:center"'
      +' onchange="SalesTax.setCell(\''+indek+'\''
      +',\'rate_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()" '
      +'  size="10">'
    +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text" '
      +' id="gl_account_id_'+i+'_'+indek+'" '
      +' value="'+isi[i].gl_account_id+'"'
      +' onchange="SalesTax.setCell(\''+indek+'\''
      +',\'gl_account_id_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()" '
      +' style="text-align:center"'
      +' size="8"></td>'
      
      +'<td>'
        +'<button type="button"'
          +' id="btn_find" '
          +' onclick="SalesTax.account.getPaging(\''+indek+'\''
          +',\'gl_account_id_'+i+'_'+indek+'\',\''+i+'\''
          +',\''+CLASS_LIABILITY+'\');">'
        +'</button>'
        +'</td>'

    +'<td align="center">'
      +'<button type="button" id="btn_add" '
      +' onclick="SalesTax.addRow(\''+indek+'\','+i+')" ></button>'
      
      +'<button type="button" id="btn_remove" '
      +' onclick="SalesTax.removeRow(\''+indek+'\','+i+')" ></button>'
    +'</td>'
    +'</tr>';
    
    sum_rate+=Number(isi[i].rate);

  }
  html+=SalesTax.tableFoot(indek);
  var budi = JSON.stringify(isi);
  document.getElementById('sales_tax_detail_'+indek).innerHTML=html;
  if(panjang==0)SalesTax.addRow(indek,[]);
  
  setEV('sales_tax_total_'+indek, sum_rate);
}

SalesTax.tableHead=(indek)=>{
  return '<table border=0 style="width:100%;" >'
    +'<thead>'
    +'<tr>'
    +'<th colspan="2">Description</th>'
    +'<th>Rate %</th>'
    +'<th colspan="2">G/L Account<i style="color:red">*</i></th>'
    +'<th>Add/Remove</th>'
    +'</tr>'
    +'</thead>';
}

SalesTax.tableFoot=(indek)=>{
  return '<tr>'
  +'<td>&nbsp;</td>'
  +'</tr>'
  +'</tfoot>'
  +'</table>';
}

SalesTax.addRow=(indek,baris)=>{
  var oldBasket=[];
  var newBasket=[];

  oldBasket=bingkai[indek].sales_tax_detail;

  for(var i=0;i<oldBasket.length;i++){
    newBasket.push(oldBasket[i]);
    if(i==baris)SalesTax.newRow(newBasket);
  }
  if(oldBasket.length==0)SalesTax.newRow(newBasket);
  SalesTax.setRows(indek,newBasket);
}

SalesTax.newRow=(newBasket)=>{
  var myItem={};
  myItem.row_id=newBasket.length+1;
  myItem.description="";
  myItem.rate=0;
  myItem.gl_account_id='';
  newBasket.push(myItem);
}

SalesTax.removeRow=(indek,number)=>{
  var isi=bingkai[indek].sales_tax_detail;
  var newBasket=[];
  var amount=0;  
  SalesTax.setRows(indek,isi);
  for(var i=0;i<isi.length;i++){
    if (i!=(number))newBasket.push(isi[i]);
  }
  SalesTax.setRows(indek,newBasket);
}

SalesTax.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].sales_tax_detail;
  var baru=[];
  var isiEdit={};
  var sum_rate=0;

  for (var i=0;i<isi.length; i++){
    isiEdit=isi[i];
    
    if(id_kolom==('description_'+i+'_'+indek)){
      isiEdit.description=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
    }
    else if(id_kolom==('rate_'+i+'_'+indek)){
      isiEdit.rate=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
    }
    else if(id_kolom==('gl_account_id_'+i+'_'+indek)){
      isiEdit.gl_account_id=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
    }else{
      baru.push(isi[i]);
    }
    sum_rate+=parseFloat(baru[i].rate);
  }  

  setEV('sales_tax_total_'+indek, sum_rate);
  bingkai[indek].sales_tax_detail=isi;
}

// set get operation;
SalesTax.setAccount=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  
  setEV(id_kolom, data.account_id);
  SalesTax.setCell(indek,id_kolom);  
}

SalesTax.createExecute=(indek)=>{
  var detail=JSON.stringify(bingkai[indek].sales_tax_detail);

  db.execute(indek,{
    query:"INSERT INTO sales_taxes"
    +"(admin_name,company_id"
    +",sales_tax_id,name,inactive,tax_freight,detail)"
    +" VALUES "
    +"('"+bingkai[indek].admin.name+"'"
    +",'"+bingkai[indek].company.id+"'"
    +",'"+getEV("sales_tax_id_"+indek)+"'"
    +",'"+getEV("sales_tax_name_"+indek)+"'"
    +",'"+getEC("sales_tax_inactive_"+indek)+"'"
    +",'"+getEC("sales_tax_freight_"+indek)+"'"
    +",'"+detail+"'"
    +")"
  });
}

SalesTax.readOne=(indek,callback)=>{

  db.execute(indek,{
    query:"SELECT * "
      +" FROM sales_taxes"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND sales_tax_id='"+bingkai[indek].sales_tax_id+"'"
  },(paket)=>{
    if (paket.err.id==0 && paket.count>0){
      
      var d=objectOne(paket.fields,paket.data);
      
      setEV('sales_tax_id_'+indek, d.sales_tax_id);
      setEV('sales_tax_name_'+indek, d.name);
      setEC('sales_tax_inactive_'+indek, d.inactive);
      setEC('sales_tax_freight_'+indek, d.tax_freight);
      setEV('sales_tax_total_'+indek, d.rate);
      SalesTax.setRows(indek,JSON.parse(d.detail));
      message.none(indek);
    }
    return callback();
  });
}

SalesTax.formUpdate=(indek,sales_tax_id)=>{
  bingkai[indek].sales_tax_id=sales_tax_id;
  SalesTax.form.modeUpdate(indek,SalesTax);
}

SalesTax.updateExecute=(indek)=>{

  var detail=JSON.stringify(bingkai[indek].sales_tax_detail);

  db.execute(indek,{
    query:"UPDATE sales_taxes "
      +" SET name='"+getEV("sales_tax_name_"+indek)+"', "
      +" inactive='"+getEC("sales_tax_inactive_"+indek)+"', "
      +" tax_freight='"+getEC("sales_tax_freight_"+indek)+"', "
      +" detail='"+detail+"'"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND sales_tax_id='"+bingkai[indek].sales_tax_id+"'"
  },(p)=>{
    if(p.err.id==0) SalesTax.endPath(indek);
  });
}

SalesTax.formDelete=(indek,sales_tax_id)=>{
  bingkai[indek].sales_tax_id=sales_tax_id;
  SalesTax.form.modeDelete(indek,SalesTax);
}

SalesTax.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM sales_taxes"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND sales_tax_id='"+bingkai[indek].sales_tax_id+"'"
  },(p)=>{
    if(p.err.id==0) SalesTax.endPath(indek);
  });
}

SalesTax.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM sales_taxes "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND sales_tax_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

SalesTax.search=(indek)=>{
  SalesTax.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT sales_tax_id,name,rate,"
        +" user_name,date_modified"
        +" FROM sales_taxes"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND sales_tax_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      SalesTax.readShow(indek);
    });
  });
}

SalesTax.exportExecute=(indek)=>{
  var table_name=SalesTax.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

SalesTax.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO sales_taxes"
      +"(admin_name,company_id"
      +",sales_tax_id,name,inactive,tax_freight,detail)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+d[i][1]+"'" // sales_tax_id
      +",'"+d[i][2]+"'" // name
      +",'"+d[i][3]+"'" // inactive
      +",'"+d[i][4]+"'" // tax_freight
      +",'"+d[i][5]+"'" // detail
      +")"
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

SalesTax.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT sales_tax_id,name,rate, "
      +" user_name,date_modified"
      +" FROM sales_taxes"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY sales_tax_id"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    SalesTax.selectShow(indek);
  });
}

SalesTax.selectShow=(indek)=>{
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
      +'<th colspan="2">Sales Tax </th>'
      +'<th>Description</th>'
      +'<th>Rate</th>'
      
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
        +' name="checked_'+indek+'">'
        +'</td>'
        +'<td align="left">'+n+'</td>'
        +'<td align="left">'+d[x].sales_tax_id+'</td>'
        +'<td align="left">'+xHTML(d[x].name)+'</td>'
        +'<td align="right">'+d[x].rate+'%</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);  
}

SalesTax.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM sales_taxes"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND sales_tax_id='"+d[i].sales_tax_id+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

SalesTax.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT company_id,sales_tax_id,date_created"
      +" FROM sales_taxes"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND sales_tax_id='"+getEV('sales_tax_id_'+indek)+"'"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data) ;      
      bingkai[indek].file_id=String(":/").concat(
        SalesTax.table_name,"/",
        d.company_id,"/",
        d.sales_tax_id);
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

SalesTax.duplicate=(indek)=>{
  var id='copy_of '+document.getElementById('sales_tax_id_'+indek).value;
  document.getElementById('sales_tax_id_'+indek).disabled=false;
  document.getElementById('sales_tax_id_'+indek).value=id;
  document.getElementById('sales_tax_id_'+indek).focus();
}

SalesTax.endPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{SalesTax.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{SalesTax.properties(indek);})
  }
}



// eof: 503;489;457;568;571;587;599;638;645;
