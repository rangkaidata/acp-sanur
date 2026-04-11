/*
 * auth: budiono;
 * file: E7;
 * path: /accounting/sales/customers.js;
 * ------------------------------------;
 * date: sep-12, 12:28, tue-2023;
 * edit: sep-16, 17:37, sat-2023; 
 * -----------------------------; happy new year 2024;
 * edit: jan-08, 22:38, mon-2024; mringkas + oop
 * edit: jan-09, 08:47, tue-2024; dengan sales_tax dgn class;
 * edit: jan-10, 15:41, wed-2024; re-write with class;
 * edit: may-31, 14:18, fri-2024; BasicSQL;
 * edit: jul-03, 18:11, wed-2024; r5;
 * edit: jul-30, 17:53, tue-2024; r11; on-leave sick 3 hari --aug-02;
 * edit: aug-02, 15:16, fri-2024; r11; lanjut kembali, sudah fit;
 * edit: sep-12, 11:32, thu-2024; r19;
 * edit: nov-25, 09:04, mon-2024; #27; add locker;
 * edit: dec-01, 21:15, sun-2024; #27; 
 * edit: dec-09, 16:24, mon-2024; #30;
 * edit: dec-26, 07:00, thu-2024; #32; properties+duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-22, 17:26, sat-2025; #41; file-id;
 * edit: mar-11, 21:50, tue-2025; #43; deep-folder;
 * edit: mar-26, 00:32, wed-2025; #45; ctables;cstructure;
 * edit: apr-11, 13:13, fri-2025; #46; tes-data;
 * edit: apr-24, 20:27, thu-2025; #50; export csv;
 * edit: nov-22, 21:51, sat-2025; #81;
 */ 

'use strict';

var Customers={};

Customers.table_name='customers';
Customers.form=new ActionForm2(Customers);
Customers.account=new AccountLook(Customers);
Customers.salesTax=new SalesTaxLook(Customers);
Customers.salesRep=new SalesRepLook(Customers);
Customers.shipMethod=new ShipMethodLook(Customers);
Customers.hidePreview=true;

Customers.show=(karcis)=>{
  karcis.modul=Customers.table_name;
  karcis.have_child=true;

  var baru=exist(karcis);

  if(baru==-1){
    var newCus=new BingkaiUtama(karcis);
    var indek=newCus.show();
    getCompanyID(indek);
    getPath2(indek,(h)=>{
      mkdir(indek,h.folder,(h)=>{
        Customers.getDefault(indek);
        Customers.form.modePaging(indek);
      });
    });
  }else{
    show(baru);
  }
}

Customers.getDefault=(indek)=>{
  CustomerDefaults.getDefault(indek);
}

Customers.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM customers"
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

Customers.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Customers.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT customer_id,name,phone,"
        +" user_name,date_modified"
        +" FROM customers"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY customer_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Customers.readShow(indek);
    });
  })
}

Customers.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +totalPagingandLimit(indek)
    +'<table border=1>'
    +'<tr>'
      +'<th colspan="2">Customer ID</th>'
      +'<th>Name</th>'
      +'<th>Phone</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
      +'<th colspan="3">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d){
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].customer_id+'</td>'
        +'<td align="left">'+xHTML(d[x].name)+'</td>'
        +'<td align="left">'+xHTML(d[x].phone)+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center"><button type="button" id="btn_change" '
          +' onclick="Customers.formUpdate(\''+indek+'\''
          +',\''+d[x].customer_id+'\');"></button></td>'
          
        +'<td align="center"><button type="button" id="btn_delete" '
          +' onclick="Customers.formDelete(\''+indek+'\''
          +',\''+d[x].customer_id+'\');"></button></td>'
        +'<td align="center">'+n+'</td>'
        +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Customers.form.addPagingFn(indek);
}

Customers.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
      +content.title(indek)
      +'<div id="msg_'+indek+'" style="margin-bottom:1rem;"></div>'
      +'<form autocomplete="off">'
      
        +'<div style="display:grid;'
          +'grid-template-columns:repeat(2,1fr);">'
        +'<div>'
          +'<ul>'
          +'<li><label>Customer ID'
            +'<i style="color:red;">*</i>:</label>'
            +'<input type="text" '
            +' id="customer_id_'+indek+'"'
            +' size="30">'
            +'</li>'
          
          +'<li><label>Name:</label>'
            +'<input type="text" id="customer_name_'+indek+'"'
            +' onfocus="this.select()" size="30"></li>'
          +'</ul>'
        +'</div>'
        +'<div>'
            +'<label><input type="checkbox" '
            +'id="customer_inactive_'+indek+'">Inactive</label>'
            //+'</li>'
          //+'</ul>'
        +'</div>'
        +'</div>'
          
        //+'<li><label>&nbsp;</label>'
//          +'<label><input type="checkbox" '
//          +'id="customer_inactive_'+indek+'">Inactive</label></li>'

        +'</ul>'

        +'<details open>'
        +'<summary>General</summary>'
        +'<ul>'
          +'<li><label>Contact:</label>'
            +'<input type="text" '
            +' id="customer_contact_'+indek+'"'
            +' size="15"'
            +' onfocus="this.select()"></li>'
        +'</ul>'
        
        +'<div style="display:grid;'
          +'grid-template-columns:repeat(2,1fr);">'
        +'<div>'
          +'<ul>'
          +'<li><label>&nbsp;</label>'
            +'<span id="customer_combo_'+indek+'"></span>'
            +'<button id="btn_add" type="button"'
              +' onclick="Customers.addAddress(\''+indek+'\')">'
              +'</button>'

            +'<input type="text" '
              +' id="address_no_'+indek+'" '
              +' value="0" disabled'
              +' size="5"'
              +' style="text-align:center;">'

            +'<button id="btn_remove" type="button"'
              +' onclick="Customers.removeAddress(\''+indek+'\')">'
              +'</button>'
            +'</li>'
            
          +'<li id="li_sembunyi_'+indek+'" '
            +' style="visibility:hidden;"><label>Ship Name:</label>'
            +'<input type="text"'
            +' id="customer_ship_name_'+indek+'" '
            +' onfocus="this.select()" '
            +' onchange="Customers.setAddress(\''+indek+'\')"></li>'
            
          +'<li><label>Address:</label>'
            +'<input type="text" id="customer_street_1_'+indek+'" '
            +' onfocus="this.select()" '
            +' onchange="Customers.setAddress(\''+indek+'\')"'
            +' size="25"></li>'
            
          +'<li><label>&nbsp;</label>'
            +'<input type="text"'
            +' id="customer_street_2_'+indek+'" '
            +' onfocus="this.select()" '
            +' onchange="Customers.setAddress(\''+indek+'\')"'
            +' size="25">'
            +'</li>'
            
          +'<li><label>City:</label>'
            +'<input type="text"'
            +' id="customer_city_'+indek+'" '
            +' onfocus="this.select()"'
            +' onchange="Customers.setAddress(\''+indek+'\')"'
            +' size="20">'
            +'</li>'
            
          +'<li><label>State:</label>'
            +'<input type="text"'
            +' id="customer_state_'+indek+'"'
            +' onfocus="this.select()"'
            +' onchange="Customers.setAddress(\''+indek+'\')"'
            +' size="10">'
            +'</li>'
            
          +'<li><label>Zip:</label>'
            +'<input type="text"'
            +' id="customer_zip_'+indek+'" '
            +' onfocus="this.select()"'
            +' onchange="Customers.setAddress(\''+indek+'\')"'
            +' size="10">'
            +'</li>'
            
          +'<li><label>Country:</label>'
            +'<input type="text"'
            +' id="customer_country_'+indek+'" '
            +' onfocus="this.select()"'
            +' onchange="Customers.setAddress(\''+indek+'\')"'
            +' size="20">'
            +'</li>'
            
          +'<li><label>Sales Tax:</label>'
            +'<input type="text"'
            +' id="sales_tax_id_'+indek+'" '
            +' onfocus="this.select()"'
            +' onchange="Customers.setAddress(\''+indek+'\')"'
            +' size="10">'
            
            +'<button type="button"'
              +' id="btn_find" '
              +' onclick="Customers.salesTax.getPaging(\''+indek+'\''
              +',\'sales_tax_id_'+indek+'\''
              +',-1);">'
            +'</button>'
            
          +'</li>'
          +'</ul>'
        +'</div>'
        +'<div>'
          +'<ul>'
          +'<li><label>Type:</label>'
            +'<input type="text"'
            +' id="customer_type_'+indek+'" '
            +' onfocus="this.select()"'
            +' size="10">'
            +'</li>'
            
          +'<li><label>Phone:</label>'
            +'<input type="text"'
            +' id="customer_phone_'+indek+'" '
            +' onfocus="this.select()"'
            +' size="12">'
            +'</li>'
            
          +'<li><label>Mobile:</label>'
            +'<input type="text"'
            +' id="customer_mobile_'+indek+'" '
            +' onfocus="this.select()"'
            +' size="12">'
            +'</li>'
            
          +'<li><label>Fax:</label>'
            +'<input type="text"'
            +' id="customer_fax_'+indek+'" '
            +' onfocus="this.select()"'
            +' size="12">'
            +'</li>'

          +'<li><label>Email:</label>'
            +'<input type="text"'
            +' id="customer_email_'+indek+'" '
            +' onfocus="this.select()"'
            +' size="20">'
            +'</li>'

          +'<li><label>Web</label>'
            +'<input type="text"'
            +' id="customer_web_'+indek+'" '
            +' onfocus="this.select()"'
            +' size="20">'
            +'</li>'
            
          +'</ul>'
        +'</div>'
        +'<div>'
        +'</details>'
        
        +'<details open>'
        +'<summary>Defaults</summary>'
        
        +'<div style="display:grid;'
          +'grid-template-columns:repeat(2,1fr);">'
        +'<div>'
        +'<ul>'
        +'<li><label>Sales Rep:</label>'
          +'<input type="text"'
          +' id="sales_rep_id_'+indek+'" '  
          +' onfocus="this.select()"'
          +' onchange="Customers.getSalesRep(\''+indek+'\''
          +',\'sales_rep_id_'+indek+'\');"'
          +' size="15" >'
          
          +'<button type="button"'
            +' id="btn_find" '
            +' onclick="Customers.salesRep.getPaging(\''+indek+'\''
            +',\'sales_rep_id_'+indek+'\''
            +',-1);">'
          +'</button>'
          +'</li>'
          
        +'<li><label>&nbsp;</label>'
          +'<input type="text"'
          +' id="sales_rep_name_'+indek+'"'
          +' disabled>'
          +'</li>'

        +'<li><label>GL Sales Acct'
          +'<i style="color:red;">*</i>:</label>'
          +'<input type="text" id="gl_account_id_'+indek+'" '
          +' onfocus="this.select()"'
          +' onchange="Customers.getAccount(\''+indek+'\''
          +',\'gl_account_id_'+indek+'\')"'
          +' size="8">'
          
          +'<button type="button"'
            +' id="btn_find" '
            +' onclick="Customers.account.getPaging(\''+indek+'\''
            +',\'gl_account_id_'+indek+'\',-1'
            +',\''+CLASS_INCOME+'\');">'
          +'</button>'
          +'</li>'
        
        +'<li><label>&nbsp;</label>'
          +'<input type="text" '
          +' id="gl_account_name_'+indek+'" disabled>'
          +'</li>'
          
        +'<li><label>Open PO#:</label>'
          +'<input type="text" id="customer_po_'+indek+'" '
          +' onfocus="this.select()"'
          +' size="9"></li>'
        +'</ul>'
        +'</div>'
        
        +'<div>'
        +'<ul>'
        +'<li><label>Ship via:</label>'
          +'<input type="text" id="ship_id_'+indek+'" '
          +' onfocus="this.select()"'
          +' size="9">'

          +'<button type="button"'
            +' id="btn_find" '
            +' onclick="Customers.shipMethod.getPaging(\''+indek+'\''
            +',\'ship_id_'+indek+'\''
            +',-1);">'
          +'</button></li>'
        
        +'<li><label>Resale#:</label>'
          +'<input type="text"'
          +' id="customer_resale_'+indek+'" '
          +' onfocus="this.select()"'
          +' size="5"></li>'
          
        +'<li>'
          +'<label>Term:</label>'
          +'<input type="text"'
          +' id="terms_displayed_'+indek+'" '
          +' onfocus="this.select()" disabled'
          +' size="15">'
          
          +'<button type="button" class="btn_find" '
          +' onclick="DiscountTerms.show(\''+indek+'\',1);">'
          +'</button>'
          +'</li>'
          
        +'<li>'
          +'<label>Credit limit:</label>'
          +'<input type="text"'
          +' style="text-align:center;"'
          +' id="credit_limit_'+indek+'" '
          +' onfocus="this.select()"'
          +' size="5">'
          +'</li>'
          
        +'</ul>'
        +'</div>'
        +'</div>'
        +'</details>'
      +'</form>'
    +'</div><br><br>';
  content.html(indek,html);
  statusbar.ready(indek);
  
  bingkai[indek].address_collect=[];
  Customers.setKoleksi(indek) ;
  Customers.setDefault(indek);
  
  if(metode==MODE_CREATE){
    document.getElementById('customer_id_'+indek).focus();  
  }else{
    document.getElementById('customer_id_'+indek).disabled=true;
  }
}

Customers.setKoleksi=(indek)=>{
  var abc=[];
  var isi={};
  var html='';
  // var jumlah=10; // setting jumlah array
  var c=bingkai[indek].address_collect;
  var jumlah=c.length;

  if(jumlah<2) jumlah=2;
  setEV('address_no_'+indek,jumlah+' rows');
  
  html='<select class="combo" id="address_collect_'+indek+'" '
    +' onchange="Customers.pilih(this,\''+indek+'\');">';

  for(var i=0;i<jumlah;i++){
    if(i==0){
      html+='<option class="combo" id="opt_'+indek+'_'+i+'" '
      +' value="Bill to Address">Bill to Address-'+(i+1)+'</option>';
    }else{
      html+='<option class="combo" id="opt_'+indek+'_'+i+'" '
      +' value="Ship to Address '+i+'">Ship to Address-'+(i+1)+'</option>';
    }
  }
  html+='</select>'
  document.getElementById('customer_combo_'+indek).innerHTML=html;

  // set koleksi kosong --- set pertama kosongkan array 
  for(i=0;i<jumlah;i++){
    isi={};
    isi.row_id=i;
    isi.by='';
    isi.name='';
    isi.street_1='';
    isi.street_2='';
    isi.city='';
    isi.state='';
    isi.zip='';
    isi.country='';
    isi.sales_tax_id='';
    abc.push(isi);
  }
  
  // set kolesi dengan data --- bila ada data, 
  // masukkan data. bila tidak maka array tetap KOSONG;
  var data_address=bingkai[indek].address_collect;
  jumlah= data_address.length;
  for(i=0;i<jumlah;i++){
    abc[i].row_id=data_address[i].row_id;
    abc[i].by=data_address[i].by;
    
    abc[i].name=data_address[i].name;
    abc[i].street_1=data_address[i].street_1;
    abc[i].street_2=data_address[i].street_2;
    abc[i].city=data_address[i].city;
    abc[i].state=data_address[i].state;
    abc[i].zip=data_address[i].zip;
    abc[i].country=data_address[i].country;
    abc[i].sales_tax_id=data_address[i].sales_tax_id;
    
    if(i==0){
      setEV('customer_ship_name_'+indek, data_address[i].name);
      setEV('customer_street_1_'+indek, data_address[i].street_1);
      setEV('customer_street_2_'+indek, data_address[i].street_2);
      setEV('customer_city_'+indek, data_address[i].city);
      setEV('customer_state_'+indek, data_address[i].state);
      setEV('customer_zip_'+indek, data_address[i].zip);
      setEV('customer_country_'+indek, data_address[i].country);
      setEV('sales_tax_id_'+indek, data_address[i].sales_tax_id);
    }
  }

  // simpan kembali --- simpan kembali 
  // perubahan data ke memori array lokal.
  bingkai[indek].address_collect=abc;
}

Customers.setDefault=(indek)=>{
  var d=bingkai[indek].data_default;
//  alert(JSON.stringify(d.discount_terms));
//  var dt=JSON.parse(d.discount_terms);
  var dt=d.discount_terms;

  setEV('gl_account_id_'+indek, d.gl_account_id);
  setEV('gl_account_name_'+indek, d.gl_account_name);
  setEV('terms_displayed_'+indek, dt.displayed);
  setEV('credit_limit_'+indek, d.credit_limit);
  bingkai[indek].discount_terms=dt;
}

Customers.pilih=(ini,indek)=>{
  var data=bingkai[indek].address_collect;
  var isi={};
  var ada=false;
  var nomer=ini.selectedIndex;

  if(nomer>0){
   document.getElementById("li_sembunyi_"+indek).style.visibility
   ="visible";
  }else{
   document.getElementById("li_sembunyi_"+indek).style.visibility
   ="hidden";  
  }

  // tampilkan data --- tampilkan data sesuai nomer pilihan.
  setEV('customer_ship_name_'+indek, data[nomer].name);
  setEV('customer_street_1_'+indek, data[nomer].street_1);
  setEV('customer_street_2_'+indek, data[nomer].street_2);
  setEV('customer_city_'+indek, data[nomer].city);
  setEV('customer_state_'+indek, data[nomer].state);
  setEV('customer_zip_'+indek, data[nomer].zip);
  setEV('customer_country_'+indek, data[nomer].country);
  setEV('sales_tax_id_'+indek, data[nomer].sales_tax_id);
  document.getElementById('customer_street_1_'+indek).focus();
}

Customers.addAddress=(indek)=>{
  var i=bingkai[indek].address_collect;
  bingkai[indek].address_collect.push({
    row_id:i.length,
    by:'',
    name:'',
    street_1:'',
    street_2:'',
    city:'',
    state:'',
    zip:'',
    country:'',
    sales_tax_id:''
  });
  Customers.setKoleksi(indek);
  setEI('address_collect_'+indek,i.length-1);// goto last
  Customers.pilih(document.getElementById('address_collect_'+indek),indek);
}

Customers.removeAddress=(indek)=>{
  var nomer=getEI('address_collect_'+indek);
  var pnjng=(bingkai[indek].address_collect).length;

  if(nomer<2) nomer=(pnjng-1);
  if(nomer>1){
    var oldBasket=bingkai[indek].address_collect;
    var newBasket=[];
    for(var i=0;i<oldBasket.length;i++){
      if (i!=(nomer))newBasket.push(oldBasket[i]);
    }
    bingkai[indek].address_collect=newBasket;
    Customers.setKoleksi(indek);
  }
}

Customers.setAddress=function(indek){
  var data=[];
  var nomer
  =document.getElementById('address_collect_'+indek).selectedIndex;

  data=bingkai[indek].address_collect;

  data[nomer].by=getEV('address_collect_'+indek);
  data[nomer].name=getEV('customer_ship_name_'+indek);
  data[nomer].street_1=getEV('customer_street_1_'+indek);
  data[nomer].street_2=getEV('customer_street_2_'+indek);
  data[nomer].city=getEV('customer_city_'+indek);
  data[nomer].state=getEV('customer_state_'+indek);
  data[nomer].zip=getEV('customer_zip_'+indek);
  data[nomer].country=getEV('customer_country_'+indek);
  data[nomer].sales_tax_id=getEV('sales_tax_id_'+indek);

  // simpan kembali --- perubahan yang ada di komponen 
  // HTML ke memori array lokal.
  bingkai[indek].address_collect=data;
}

Customers.setSalesTax=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var nama_kolom=bingkai[indek].nama_kolom;
  setEV(id_kolom, data.sales_tax_id);

  var nomer=document.getElementById('address_collect_'+indek)
  bingkai[indek].address_collect[nomer.selectedIndex].sales_tax_id
  =data.sales_tax_id;
}

Customers.setSalesRep=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var nama_kolom=bingkai[indek].nama_kolom;
  
  setEV(id_kolom, data.sales_rep_id);
  Customers.getSalesRep(indek,id_kolom,nama_kolom);
}

Customers.getSalesRep=(indek,id_kolom,alias)=>{
  Customers.salesRep.getOne(indek,
    document.getElementById(id_kolom).value,
  (paket)=>{
    setEV('sales_rep_name_'+indek, txt_undefined);
    if(paket.count!=0){
      var d=objectOne(paket.fields,paket.data);
      setEV('sales_rep_name_'+indek, d.name);
    }else{
      // nothing
    }
  });
}

Customers.setShipMethod=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var nama_kolom=bingkai[indek].nama_kolom;
  setEV(id_kolom, data.ship_id);
}

Customers.setAccount=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var nama_kolom=bingkai[indek].nama_kolom;
  
  setEV(id_kolom, data.account_id);
  Customers.getAccount(indek,id_kolom,nama_kolom);
}

Customers.getAccount=(indek,id_kolom,alias)=>{
  Customers.account.getOne(indek,
    document.getElementById(id_kolom).value,
  (paket)=>{
    setEV('gl_account_name_'+indek, txt_undefined);
    if(paket.count!=0){
      var d=objectOne(paket.fields,paket.data);
      setEV('gl_account_name_'+indek, d.name);
    }
  });
}

Customers.setTerms=(indek)=>{
  setEV('terms_displayed_'+indek, bingkai[indek].discount_terms.displayed);
}

Customers.createExecute=(indek)=>{
  var address=JSON.stringify(bingkai[indek].address_collect);
  var discount_terms=JSON.stringify(bingkai[indek].discount_terms);
  var custom_fields=JSON.stringify(['new1','new2']);
  
  db.execute(indek,{
      query:"INSERT INTO customers "
      +"(admin_name,company_id,customer_id,name,inactive"
      +",contact,address"
      +",type,phone,mobile,fax,email,web"
      +",sales_rep_id,sales_account_id,customer_po"
      +",ship_id,resale,discount_terms,credit_limit"
      +",finance_charges,custom_fields"
      +") VALUES "    
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEV("customer_id_"+indek)+"'"
      +",'"+getEV("customer_name_"+indek)+"'"
      +",'"+getEC("customer_inactive_"+indek)+"'"
      +",'"+getEV("customer_contact_"+indek)+"'"
      +",'"+address+"'"
      +",'"+getEV("customer_type_"+indek)+"'"
      +",'"+getEV("customer_phone_"+indek)+"'"
      +",'"+getEV("customer_mobile_"+indek)+"'"
      +",'"+getEV("customer_fax_"+indek)+"'"
      +",'"+getEV("customer_email_"+indek)+"'"
      +",'"+getEV("customer_web_"+indek)+"'"
      +",'"+getEV("sales_rep_id_"+indek)+"'"
      +",'"+getEV("gl_account_id_"+indek)+"'"
      +",'"+getEV("customer_po_"+indek)+"'"
      +",'"+getEV("ship_id_"+indek)+"'"
      +",'"+getEV("customer_resale_"+indek)+"'"
      +",'"+discount_terms+"'"
      +",'"+getEV("credit_limit_"+indek)+"'"
      +",'0'"
      +",'"+custom_fields+"'"
      +")"
  });
}

Customers.readOne=(indek,callback)=>{

  db.execute(indek,{
    query:"SELECT * "
      +" FROM customers"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"'"
  },(paket)=>{
    if (paket.err.id==0 && paket.count>0){

      var d=objectOne(paket.fields,paket.data);
      var a=JSON.parse(d.address)[0]
      var dt=JSON.parse(d.discount_terms);

      setEV('customer_id_'+indek, d.customer_id);
      setEV('customer_name_'+indek, d.name);
      setEC('customer_inactive_'+indek, d.inactive);
      setEV('gl_account_id_'+indek, d.sales_account_id);
      setEV('gl_account_name_'+indek, d.sales_account_name);
      
      setEV('customer_contact_'+indek,d.contact);
      
      setEV('customer_street_1_'+indek, a.street_1);
      setEV('customer_street_2_'+indek, a.street_2);
      setEV('customer_city_'+indek, a.city);
      setEV('customer_state_'+indek, a.state);
      setEV('customer_zip_'+indek, a.zip);
      setEV('customer_country_'+indek, a.country);
      setEV('sales_tax_id_'+indek, a.sales_tax_id);
      
      setEV('customer_type_'+indek, d.type);
      setEV('customer_phone_'+indek, d.phone);
      setEV('customer_mobile_'+indek, d.mobile);
      setEV('customer_fax_'+indek, d.fax);
      
      setEV('customer_email_'+indek, d.email);
      setEV('customer_web_'+indek, d.web);
      
      setEV('sales_rep_id_'+indek, d.sales_rep_id);
      setEV('sales_rep_name_'+indek, d.sales_rep_name);
      setEV('customer_po_'+indek, d.customer_po);
      setEV('ship_id_'+indek, d.ship_id);
      setEV('customer_resale_'+indek, d.resale);
      setEV('terms_displayed_'+indek, dt.displayed);
      setEV('credit_limit_'+indek, d.credit_limit);

      bingkai[indek].address_collect=JSON.parse(d.address);
      bingkai[indek].discount_terms=dt;//JSON.parse(d.discount_terms);
      Customers.setKoleksi(indek);
      var ac=document.getElementById('address_collect_'+indek);
      Customers.pilih(ac,indek);
    }
    document.getElementById('customer_name_'+indek).focus();
    message.none(indek);
    return callback();
  });
}

Customers.formUpdate=(indek,customer_id)=>{
  bingkai[indek].customer_id=customer_id;
  Customers.form.modeUpdate(indek);
}

Customers.updateExecute=(indek)=>{
  var address=JSON.stringify(bingkai[indek].address_collect);
  var discount_terms=JSON.stringify(bingkai[indek].discount_terms);
  var custom_fields=JSON.stringify(['update1','update2']);

  db.execute(indek,{
    query:"UPDATE customers"
      +" SET name= '"+getEV("customer_name_"+indek)+"',"
      +" inactive= '"+getEC("customer_inactive_"+indek)+"',"
      +" contact= '"+getEV("customer_contact_"+indek)+"',"
      +" address= '"+address+"',"
      +" type= '"+getEV("customer_type_"+indek)+"',"
      +" phone= '"+getEV("customer_phone_"+indek)+"',"
      +" mobile= '"+getEV("customer_mobile_"+indek)+"',"
      +" fax= '"+getEV("customer_fax_"+indek)+"',"
      +" email= '"+getEV("customer_email_"+indek)+"',"
      +" web= '"+getEV("customer_web_"+indek)+"',"
      +" sales_rep_id= '"+getEV("sales_rep_id_"+indek)+"',"
      +" sales_account_id= '"+getEV("gl_account_id_"+indek)+"',"
      +" customer_po= '"+getEV("customer_po_"+indek)+"',"
      +" ship_id= '"+getEV("ship_id_"+indek)+"',"
      +" resale= '"+getEV("customer_resale_"+indek)+"',"
      +" discount_terms= '"+discount_terms+"',"
      +" credit_limit= '"+getEV("credit_limit_"+indek)+"',"
      +" finance_charges= '0',"
      +" custom_fields= '"+custom_fields+"'"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"'"
  },(p)=>{
    if(p.err.id==0) Customers.endPath(indek);
  });
}

Customers.formDelete=(indek,customer_id)=>{
  bingkai[indek].customer_id=customer_id;
  Customers.form.modeDelete(indek);
}

Customers.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM customers"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"'"
  },(p)=>{
    if(p.err.id==0) Customers.endPath(indek);
  });
}

Customers.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM customers "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Customers.search=(indek)=>{
  Customers.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT customer_id,name,inactive,phone,"
        +" user_name,date_modified"
        +" FROM customers "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND customer_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Customers.readShow(indek);
    });
  });
}

Customers.exportExecute=(indek)=>{
  var table_name=Customers.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);    
}

Customers.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;

  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO customers "
        +"(admin_name,company_id,customer_id,name,inactive"
        +",contact,address"
        +",type,phone,mobile,fax,email,web"
        +",sales_rep_id,sales_account_id,customer_po"
        +",ship_id,resale,discount_terms,credit_limit"
        +",finance_charges, custom_fields"
        +") VALUES "
        +"('"+bingkai[indek].admin.name+"'"
        +",'"+bingkai[indek].company.id+"'"
        +",'"+d[i][1]+"'" //id
        +",'"+d[i][2]+"'" //name
        +",'"+d[i][3]+"'" //incative
        +",'"+d[i][4]+"'" //contact
        +",'"+d[i][5]+"'" //address
        +",'"+d[i][6]+"'" //type
        +",'"+d[i][7]+"'" //phone
        +",'"+d[i][8]+"'" //mobile
        +",'"+d[i][9]+"'" //fax
        +",'"+d[i][10]+"'"//email 
        +",'"+d[i][11]+"'"//web
        +",'"+d[i][12]+"'"//sales_rep
        +",'"+d[i][13]+"'"//sales_account_id
        +",'"+d[i][14]+"'"//customer_po
        +",'"+d[i][15]+"'"//ship_id
        +",'"+d[i][16]+"'"//resale
        +",'"+d[i][17]+"'" // discount_terms
        +",'"+d[i][18]+"'" // credit_limit
        +",'"+d[i][19]+"'" // finance_charges
        +",'"+d[i][20]+"'" //custom_field
        +")"
    },(paket)=>{  
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

Customers.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT customer_id,name,"
      +" user_name,date_modified"
      +" FROM customers"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY customer_id"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Customers.selectShow(indek);
  });
}

Customers.selectShow=(indek)=>{
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
      +'<th>Phone</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d){
      n++;
      html+='<tr>'
        +'<td align="center">'
          +'<input type="checkbox"'
          +' id="checked_'+x+'_'+indek+'"'
          +' name="checked_'+indek+'">'
        +'</td>'
        +'<td align="left">'+n+'</td>'
        +'<td align="left">'+d[x].customer_id+'</td>'
        +'<td align="left">'+xHTML(d[x].name)+'</td>'
        +'<td align="left">'+xHTML(d[x].phone)+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'        
        +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

Customers.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields, p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];

  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM customers "
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND customer_id = '"+d[i].customer_id+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

Customers.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM customers"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+getEV('customer_id_'+indek)+"'"
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

Customers.duplicate=(indek)=>{
  var id='copy_of '+document.getElementById('customer_id_'+indek).value;
  document.getElementById('customer_id_'+indek).disabled=false;
  document.getElementById('customer_id_'+indek).value=id;
  document.getElementById('customer_id_'+indek).focus();
}

Customers.endPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Customers.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Customers.properties(indek);})
  }
}





// eof: 888;909;852;856;979;977;986;1000;1056;1049;1050;1058;
