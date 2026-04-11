/*
 * auth: budiono;
 * code: H1;
 * path: /accounting/purchases/purchase_orders.js;
 * ----------------------------------------------;
 * date: oct-26, 09:25, thu-2023; new;
 * edit: nov-16, 07:03, thu-2023; resize;
 * -----------------------------; happy new year 2024;
 * edit: jan-18, 15:22, thu-2024; meringkas;
 * edit: jul-11, 22:13, thu-2024; r8;
 * edit: aug-07, 21:46, wed-2024; r11;
 * edit: sep-25, 21:02, wed-2024; r19;
 * edit: nov-27, 21:05, wed-2024; #27; add locker();
 * edit: dec-02, 15:39, mon-2024; #27; 2;
 * edit: dec-17, 11:58, tue-2024; #31; properties;
 * edit: dec-28, 12:07, sat-2024; #32; properties+duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-24, 16:32, mon-2025; #41; file_id;
 * edit: mar-13, 15:09, thu-2025; #43; deep-folder;
 * edit: mar-26, 22:05, wed-2025; #45; ctables;cstructure;
 * edit: apr-24, 21:25, thu-2025; #50; export to CSV;
 * edit: aug-16, 10:24, sat-2025; #68;
 * edit: oct-19, 11:57, sun-2025; #80;  
 * edit: nov-25, 15:08, tue-2025; #81;
 * -----------------------------; happy new year 2026;
 * edit: mar-14, 15:38, sat-2026; #91; 
 */

'use strict';

var PurchaseOrders={}
PurchaseOrders.hidePreview=false;

PurchaseOrders.table_name='purchase_orders';
PurchaseOrders.gl_account_id='';
PurchaseOrders.form=new ActionForm2(PurchaseOrders);
PurchaseOrders.grid=new Grid(PurchaseOrders);
PurchaseOrders.vendor=new VendorLook(PurchaseOrders);
PurchaseOrders.ship=new ShipMethodLook(PurchaseOrders);
PurchaseOrders.account=new AccountLook(PurchaseOrders);
PurchaseOrders.item=new ItemLook(PurchaseOrders);
PurchaseOrders.job=new JobLook(PurchaseOrders);

PurchaseOrders.show=(karcis)=>{
  karcis.modul=PurchaseOrders.table_name;
  karcis.have_child=true;
  
  var baru=exist(karcis);
  if(baru==-1){
    var newTxs=new BingkaiUtama(karcis);
    var indek=newTxs.show();
    getCompanyID(indek);
    getPath2(indek,(h)=>{
      mkdir(indek,h.folder,()=>{
        PurchaseOrders.getDefault(indek);
        PurchaseOrders.form.modePaging(indek);
      });
    });
  }else{
    show(baru);
  }
}

PurchaseOrders.getDefault=(indek)=>{
  VendorDefaults.getDefault(indek);
  ShipToAddress.defineColumn(indek);
  bingkai[indek].sum_item_amount=0.00;
}

PurchaseOrders.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM purchase_orders"
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

PurchaseOrders.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  PurchaseOrders.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT status,po_no,date,amount,"
        +" vendor_id,vendor_name,"
        +" user_name,date_modified"
        +" FROM purchase_orders"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY date"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      PurchaseOrders.readShow(indek);
    });
  })
}

PurchaseOrders.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)  
    +TotalPagingLimit(indek)
    +'<table border=1>'
      +'<tr>'
//      +'<th colspan="2">Status</th>'
      +'<th colspan="2">PO#</th>'
      +'<th>Date</th>'
      +'<th>Amount</th>'
      +'<th>Vendor Name</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
      +'<th colspan="3">Action</th>'
      +'</tr>';

  if (p.err.id===0){
    var x;
    for (x in d){
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
//        +'<td align="center">'+setStatus(d[x].status)+'</td>'
        +'<td align="left">'+d[x].po_no+'</td>'
        +'<td align="left">'+tglWest(d[x].date)+'</td>'
        +'<td align="right">'+d[x].amount+'</td>'
        +'<td align="left">'+d[x].vendor_name+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button"'
            +' id="btn_change"'
            +' onclick="PurchaseOrders.formUpdate(\''+indek+'\''
            +',\''+d[x].vendor_id+'\''
            +',\''+d[x].po_no+'\');">'
          +'</button>'
        +'</td>'
        +'<td align="center">'
          +'<button type="button"'
            +' id="btn_delete"'
            +' onclick="PurchaseOrders.formDelete(\''+indek+'\''
            +',\''+d[x].vendor_id+'\''
            +',\''+d[x].po_no+'\');">'
          +'</button>'
        +'</td>'
        +'<td align="center">'+n+'</td>'
        +'</tr>';
    }
  }
  html+='</table>';
  content.html(indek,html);
  if(p.err.id!==0) content.infoPaket(indek,p);
  PurchaseOrders.form.addPagingFn(indek);
}
//--------------------------CREATE-DATA-------------------------------//
PurchaseOrders.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
  +'<div style="padding:0.5rem">' //a
  +content.title(indek)
  +content.message(indek)
  +'<form autocomplete="off">'    
  +'<div style="display:grid;'
    +'grid-template-columns:repeat(2,1fr);'
    +'padding-bottom:20px;"'
    +'>'
  +'<div>'
    +'<ul>'

    +'<li><label>Vendor ID:<i style="color:red">&nbsp;*</i></label>'
      +'<input type="text"'
      +' id="vendor_id_'+indek+'"'
      +' onchange="PurchaseOrders.getVendor(\''+indek+'\');"'
      +' size="16" >'
      
      +'<button type="button"'
        +' id="btn_find" '
        +' onclick="PurchaseOrders.vendor.getPaging(\''+indek+'\''
        +',\'vendor_id_'+indek+'\')">'
      +'</button>'      
      +'</li>'
      
    +'<li><label>Name:</label>'
      +'<input type="text"'
      +' id="vendor_name_'+indek+'" disabled>'
      +'</li>'
        
    +'<li><label>&nbsp;</label>'
      +'<textarea id="vendor_address_'+indek+'"'
        +' placeholder="Remit to"'
        +' style="resize:none;width:14.6rem;height:50px;"'
        +' spellcheck=false  disabled>'
      +'</textarea>'
    +'</li>'
    +'</ul>'
  +'</div>'
    
  +'<div style="display:block;padding-bottom:30px;">'//d
    +'<ul>'
      +'<li><label>PO#:<i style="color:red">&nbsp;*</i></label>'
        +'<input type="text"'
        +' id="po_no_'+indek+'"'
        +' size="25" >'
      +'</li>'
      +'<li><label>Date:</label>'
        +'<input type="date"'
          +' id="po_date_'+indek+'"'
          +' onblur="dateFakeShow('+indek+',\'po_date\')"'
          +' style="display:none;">'
        +'<input type="text"'
          +' id="po_date_fake_'+indek+'"'
          +' onfocus="dateRealShow('+indek+',\'po_date\')"'
          +' size="9">'
      +'</li>'
      +'<li><label>Status:</label>'
        +'<label><input type="checkbox"'
        +' id="po_close_'+indek+'">Close</label>'
      +'</li>'
      +'<li><label>Good thru:</label>'
        +'<input type="date"'
          +' id="good_thru_'+indek+'"'
          +' onblur="dateFakeShow('+indek+',\'good_thru\')"'
          +' style="display:none;">'
        +'<input type="text"'
          +' id="good_thru_fake_'+indek+'"'
          +' onfocus="dateRealShow('+indek+',\'good_thru\')"'
          +' size="9">'
      +'</li>'
      +'<li><label><input type="button"'
        +' onclick="ShipToAddress.show(\''+indek+'\')"'
        +' value="Ship to">'
        +'</label>'
        +'<textarea'
          +' id="ship_to_'+indek+'"'
          +' placeholder="Ship to"'
          +'style="resize:none;width:14.6rem;height:50px;"'
          +' spellcheck=false disabled>'
        +'</textarea>'
      +'</li>'
    +'</ul>'
  +'</div>'
  +'</div>'
  
  +'<div'
    +' style="display:grid;'
    +'grid-template-columns:repeat(4,1fr);padding-bottom:20px;"'
    +'>'
    +'<div>'
      +'<label style="display:block;">Ship Via</label>'
      +'<input type="text"'
        +' id="ship_id_'+indek+'"'
        +' style="text-align:center"'
        +' size="9" >'

      +'<button type="button"'
        +' id="btn_find" '
        +' onclick="PurchaseOrders.ship.getPaging(\''+indek+'\''
        +',\'ship_id_'+indek+'\');">'
      +'</button>'
    +'</div>'
    
    +'<div>'
      +'<label style="display:block;">Discount Amt.</label>'
      +'<input type="text"'
        +' id="discount_amount_'+indek+'"'
        +' style="text-align:center"'
        +' disabled'
        +' size="9" >'
    +'</div>'

    +'<div>'
      +'<label style="display:block;">Displayed terms</label>'
      +'<input type="text"'
        +' id="displayed_terms_'+indek+'"'
        +' style="text-align:center" '
        +' size="15" >'

      +'<button type="button"'
        +' id="btn_find" '
        +' onclick="PurchaseOrders.showTerms(\''+indek+'\');">'
      +'</button>'
    +'</div>'
      
    +'<div>'
      +'<label style="display:block;">A/P Account'
        +'<i style="color:red">&nbsp;*</i></label>'
      +'<input type="text"'
        +' id="ap_account_id_'+indek+'"'
        +' style="text-align:center" '
        +' size="9" >'
      
      +'<button type="button"'
        +' id="btn_find" '
        +' onclick="PurchaseOrders.account.getPaging(\''+indek+'\''
        +',\'ap_account_id_'+indek+'\',-1,\''+CLASS_LIABILITY+'\')">'
      +'</button>'
        
      +'</div>'
  +'</div>'
  
  +'<details open>'
    +'<summary>PO Details</summary>'
    +'<div id="po_detail_'+indek+'"'
    +' style="width:100%;overflow:auto;">'
    +'</div>'
  +'</details>'
  
  +'<div>' //f
    +'<ul>'
    +'<li><label>PO Amount</label>: '
      +'<input type="text" id="po_amount_'+indek+'" '
        +' style="text-align:right;"'
        +' disabled size="9" >'
      +'</li>'
    +'</ul>'
  +'</div>'// fx
  +'</form>'
  +'<p><i style="color:red">* Required</i></p>'
  +'</div>'; // ax

  content.html(indek,html);
  statusbar.ready(indek);
  
  document.getElementById('vendor_id_'+indek).focus();
  document.getElementById('po_date_'+indek).value=tglSekarang();
  document.getElementById('po_date_fake_'+indek).value=tglWest(tglSekarang());

  PurchaseOrders.setRows(indek,[]);
  PurchaseOrders.setDefault(indek);
}

PurchaseOrders.setRows=(indek,isi)=>{
  if(isi===undefined)isi=[];    
  var panjang=isi.length;
  var html=PurchaseOrders.tableHead(indek);
  var sum_item_amount=0;
  
  bingkai[indek].po_detail=isi;
  
  for (var i=0;i<panjang;i++){

    html+='<tr>'
    +'<td align="center">'+(i+1)+'</td>'
    
    +'<td style="padding:0;margin:0;">'
    +'<input type="text"'
      +' id="quantity_'+i+'_'+indek+'"'
      +' value="'+isi[i].quantity+'"'
      +' onchange="PurchaseOrders.setCell(\''+indek+'\''
      +',\'quantity_'+i+'_'+indek+'\')"'
      +' style="text-align:center"'
      +' onfocus="this.select()" '
      +' size="3" >'
      +'</td>'
    
    +'<td style="margin:0;padding:0">'
    +'<input type="text"'
      +' id="item_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].item_id+'"'
      +' onchange="PurchaseOrders.setCell(\''+indek+'\''
      +',\'item_id_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()"'
      +' size="9" >'
      +'</td>'
    
    +'<td>'
    +'<button type="button"'
      +' id="btn_find" '
      +' onclick="PurchaseOrders.item.getPaging(\''+indek+'\''
      +',\'item_id_'+i+'_'+indek+'\',\''+i+'\');">'
      +'</button>'
      +'</td>'
    
    +'<td style="padding:0;margin:0;">'
    +'<input type="text"'
      +' id="description_'+i+'_'+indek+'"'
      +' value="'+isi[i].description+'"'
      +' onchange="PurchaseOrders.setCell(\''+indek+'\''
      +',\'description_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()"'
      +' size="15">'
    +'</td>'
    
    +'<td  align="center" style="padding:0;margin:0;">'
    +'<input type="text"'
      +' id="gl_account_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].gl_account_id+'"'
      +' onchange="PurchaseOrders.setCell(\''+indek+'\''
      +',\'gl_account_id_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()"'
      +' style="text-align:center;"'
      +' size="8" >'
      +'</td>'
      
    +'<td><button type="button" id="btn_find" '
      +' onclick="PurchaseOrders.account.getPaging(\''+indek+'\''
      +',\'gl_account_id_'+i+'_'+indek+'\''
      +',\''+i+'\''
      +',\''+CLASS_EXPENSE+'\');">'
      +'</button>'
      +'</td>'
            
    +'<td  align="right" style="padding:0;margin:0;">'
    +'<input type="text"'
      +' id="unit_price_'+i+'_'+indek+'"'
      +' value="'+isi[i].unit_price+'"'
      +' onchange="PurchaseOrders.setCell(\''+indek+'\''
      +',\'unit_price_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()"'
      +' style="text-align:right"'
      +' size="6" >'
      +'</td>'
            
    +'<td  align="right" style="padding:0;margin:0;">'
      +'<input type="text"'
      +' id="amount_'+i+'_'+indek+'"'
      +' value="'+isi[i].amount+'"'
      +' onchange="PurchaseOrders.setCell(\''+indek+'\''
      +',\'amount_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()"'
      +' style="text-align:right"'
      +' size="9">'
      +'</td>'
            
    +'<td  align="center" style="padding:0;margin:0;">'
    +'<input type="text"'
      +' id="job_phase_cost_'+i+'_'+indek+'"'
      +' value="'+isi[i].job_phase_cost+'"'
      +' onchange="PurchaseOrders.setCell(\''+indek+'\''
      +',\'job_phase_cost_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()"'
      +' size="5" >'
      +'</td>'
      
    +'<td style="width:0;">'
      +'<button type="button" '
      +' id="btn_find"'
      +' onclick="PurchaseOrders.job.getPaging(\''+indek+'\''
      +',\'job_phase_cost_'+i+'_'+indek+'\',\''+i+'\');">'
      +'</button>'
      +'</td>'

    +'<td align="center">'
      +'<button type="button"'
      +' id="btn_add"'
      +' onclick="PurchaseOrders.addRow(\''+indek+'\','+i+')" >'
      +'</button>'
      
      +'<button type="button"'
      +' id="btn_remove"'
      +' onclick="PurchaseOrders.removeRow(\''+indek+'\','+i+')" >'
      +'</button>'
    +'</td>'
    +'</tr>';
    sum_item_amount+=Number(isi[i].amount);
  }
  
  html+=PurchaseOrders.tableFoot(indek);
  var budi = JSON.stringify(isi);
  document.getElementById('po_detail_'+indek).innerHTML=html;
  
  if(panjang==0)PurchaseOrders.addRow(indek,0);
  
  bingkai[indek].sum_item_amount=sum_item_amount;
  PurchaseOrders.calculateTotal(indek);
}

PurchaseOrders.tableHead=(indek)=>{
  return '<table>'
  +'<thead>'
    +'<tr>'
    +'<th colspan="2">Qty</th>'
    +'<th colspan="2">Item</th>'
    +'<th>Description<i class="required">&nbsp;*</i></th>'
    +'<th colspan="2">G/L Account<i class="required">&nbsp;*</i></th>'
    +'<th>Unit Price</th>'
    +'<th>Amount<i class="required">&nbsp;*</i></th>'
    +'<th colspan="2">Job ID</th>'
    +'<th>Add/Rem</th>'
    +'</tr>'
  +'</thead>';
}

PurchaseOrders.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
    +'<td>&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

PurchaseOrders.addRow=(indek,baris)=>{
  PurchaseOrders.gl_account_id=bingkai[indek].data_default.gl_account_id;
  PurchaseOrders.grid.addRow(indek,baris,bingkai[indek].po_detail);
}

PurchaseOrders.newRow=(newBasket)=>{
  var myItem={};
  myItem.nomer=newBasket.length+1;
  myItem.quantity=0;
  myItem.item_id='';
  myItem.description="";
  myItem.gl_account_id=PurchaseOrders.gl_account_id;
  myItem.unit_price=0;
  myItem.amount=0;
  myItem.job_phase_cost='';
  newBasket.push(myItem);
}

PurchaseOrders.removeRow=(indek,baris)=>{
  PurchaseOrders.grid.removeRow(indek,baris,bingkai[indek].po_detail);
}

PurchaseOrders.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].po_detail;
  var baru = [];
  var isiEdit = {};
  var sum_item_amount=0;
  
  for (var i=0;i<isi.length; i++){
    isiEdit=isi[i];
    if(id_kolom==('quantity_'+i+'_'+indek)){
      isiEdit.quantity=document.getElementById(id_kolom).value;
      isiEdit.amount=
      isiEdit.quantity*
      isiEdit.unit_price;
      baru.push(isiEdit);
      document.getElementById('amount_'+i+'_'+indek).value
        =Number(isiEdit.amount);
      
    }else if(id_kolom==('item_id_'+i+'_'+indek)){
      isiEdit.item_id=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
      PurchaseOrders.getItem(indek,i);
      
    }else if(id_kolom==('description_'+i+'_'+indek)){
      isiEdit.description=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
      
    }else if(id_kolom==('gl_account_id_'+i+'_'+indek)){
      isiEdit.gl_account_id=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
    
    }else if(id_kolom==('unit_price_'+i+'_'+indek)){
      isiEdit.unit_price=document.getElementById(id_kolom).value;
      isiEdit.amount=
      isiEdit.quantity*
      isiEdit.unit_price;
      baru.push(isiEdit);
      document.getElementById('amount_'+i+'_'+indek).value
        =Number(isiEdit.amount);

    }else if(id_kolom==('amount_'+i+'_'+indek)){
      isiEdit.amount=document.getElementById(id_kolom).value;
      if(isiEdit.quantity>0){
        isiEdit.unit_price=
        isiEdit.amount/
        isiEdit.quantity;
      }
      baru.push(isiEdit);
      document.getElementById('unit_price_'+i+'_'+indek).value=isiEdit.unit_price;
      
    }else if(id_kolom==('job_phase_cost_'+i+'_'+indek)){
      isiEdit.job_phase_cost=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
      
    }else{
      baru.push(isi[i]);
    }
    
    baru.push(isiEdit);
    sum_item_amount+=Number(isi[i].amount);
  }
  bingkai[indek].sum_item_amount=sum_item_amount;
  PurchaseOrders.calculateTotal(indek);
}

PurchaseOrders.calculateTotal=(indek)=>{
  bingkai[indek].discount_terms.date=document.getElementById('po_date_'+indek).value;
  bingkai[indek].discount_terms.amount=bingkai[indek].sum_item_amount;
  DiscountTerms.calcNow(indek);
  
  var itemAmount=Number(bingkai[indek].sum_item_amount) || 0;//without tax;
  var discountAmount=Number(bingkai[indek].discount_terms.discount_amount);
  
  document.getElementById('po_amount_'+indek).value=itemAmount; //poAmount.toFixed(2);
  document.getElementById('discount_amount_'+indek).value=discountAmount;//.toFixed(2);
}
//-------------------------SET/GET------------------------------------//
PurchaseOrders.setDefault=(indek)=>{
  var d=bingkai[indek].data_default;
  setEV('ap_account_id_'+indek, d.ap_account_id);
  setEV('displayed_terms_'+indek, d.discount_terms.displayed);
  bingkai[indek].discount_terms=d.discount_terms;
  PurchaseOrders.getCompany(indek);
}

PurchaseOrders.getCompany=(indek)=>{
  Company.getOne(indek,(paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      var ca=JSON.parse(d.address);
      var data_ship={
        "drop_ship":false,
        "invoice_no":'',
        "customer_id":'',
        "name":d.name,
        "street_1":ca.street_1,
        "street_2":ca.street_2,
        "city":ca.city,
        "state":ca.state,
        "zip":ca.zip,
        "country":ca.country
      }
      bingkai[indek].ship_address=data_ship;
      PurchaseOrders.setShipAddress(indek);
    }
  });
}

PurchaseOrders.setShipAddress=(indek)=>{
  var data_ship=bingkai[indek].ship_address;
  var company_address={
    "drop_ship":data_ship.drop_ship,
    "invoice_no":data_ship.invoice_no,
    "customer_id":data_ship.customer_id,
    "address":data_ship.address,
    "name":data_ship.name,
    "street_1":data_ship.street_1,
    "street_2":data_ship.street_2,
    "city":data_ship.city,
    "state":data_ship.state,
    "zip":data_ship.zip,
    "country":data_ship.country
  }
  setEV('ship_to_'+indek, toAddress(company_address));
}

PurchaseOrders.setVendor=(indek,data)=>{
  document.getElementById('vendor_id_'+indek).value=
  data.vendor_id;
  PurchaseOrders.getVendor(indek);
}

PurchaseOrders.getVendor=(indek)=>{
  PurchaseOrders.vendor.getOne(indek,
    getEV('vendor_id_'+indek),
  (paket)=>{
    setEV('vendor_name_'+indek, txt_undefined);
    if(paket.err.id==0 && paket.count>0){
      var v=objectOne(paket.fields,paket.data);
      var va=JSON.parse(v.address)
      var dt=JSON.parse(v.discount_terms);

      setEV('vendor_name_'+indek, v.name);
      setEV('vendor_address_'+indek, toAddress(va));
      setEV('ship_id_'+indek, v.ship_id);
      setEV('displayed_terms_'+indek, dt.displayed);
      bingkai[indek].discount_terms=dt;
    }
  });
}

PurchaseOrders.setShipMethod=(indek,data)=>{
  setEV('ship_id_'+indek, data.ship_id);
}

PurchaseOrders.showTerms=(indek,baris)=>{
  bingkai[indek].baris=baris;

  if(bingkai[indek].discount_terms==undefined){
    DiscountTerms.getColumn(indek);
  }else{
    var amount=bingkai[indek].sum_item_amount
    var tgl=document.getElementById('po_date_'+indek).value;

    bingkai[indek].discount_terms.date=tgl;
    bingkai[indek].discount_terms.amount=amount;
  }
  DiscountTerms.show(indek);
}
 
PurchaseOrders.setTerms=(indek)=>{
  setEV('displayed_terms_'+indek, bingkai[indek].discount_terms.displayed);
  PurchaseOrders.calculateTotal(indek);
}

PurchaseOrders.setAccount=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var nama_kolom=bingkai[indek].nama_kolom;

  setEV(id_kolom,data.account_id);
  PurchaseOrders.setCell(indek,id_kolom);
}

PurchaseOrders.setItem=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, data.item_id);
  PurchaseOrders.setCell(indek,id_kolom);
}

PurchaseOrders.getItem=(indek,baris)=>{
  PurchaseOrders.item.getOne(indek,
    getEV('item_id_'+baris+'_'+indek),
  (paket)=>{
    
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);

      setEV('item_id_'+baris+'_'+indek, d.item_id);
      setEV('description_'+baris+'_'+indek, d.name_for_purchases);
      
      if(d.inventory_account_id!='')
        setEV('gl_account_id_'+baris+'_'+indek, d.inventory_account_id);
      if(d.name_for_purchases=='') 
        setEV('description_'+baris+'_'+indek, d.name);

      PurchaseOrders.setCell(indek,'description_'+baris+'_'+indek);
      PurchaseOrders.setCell(indek,'gl_account_id_'+baris+'_'+indek);
    }
  });
}

PurchaseOrders.setJob=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, data);
  PurchaseOrders.setCell(indek,id_kolom);
}

//---------------------------CREATE-DATA------------------------------//
PurchaseOrders.createExecute=(indek)=>{
  var ship_address=JSON.stringify(bingkai[indek].ship_address);
  var discount_terms=JSON.stringify(bingkai[indek].discount_terms);
  var detail=JSON.stringify(bingkai[indek].po_detail);
  var some_note=["Add some note for this po.","new-1"];

  db.execute(indek,{
    query:"INSERT INTO purchase_orders"
    +"(admin_name,company_id,vendor_id,po_no,date,status,good_thru"
    +",ship_address,ship_id,discount_terms,ap_account_id"
    +",detail,note)"
    +" VALUES"
    +"('"+bingkai[indek].admin.name+"'"
    +",'"+bingkai[indek].company.id+"'"
    +",'"+getEV("vendor_id_"+indek)+"'"
    +",'"+getEV("po_no_"+indek)+"'"
    +",'"+getEV("po_date_"+indek)+"'"
    +",'"+getEC("po_close_"+indek)+"'"
    +",'"+getEV("good_thru_"+indek)+"'"
    +",'"+ship_address+"'"
    +",'"+getEV("ship_id_"+indek)+"'"
    +",'"+discount_terms+"'"
    +",'"+getEV("ap_account_id_"+indek)+"'"
    +",'"+detail+"'"
    +",'"+some_note+"'"
    +")"
  });
}
//--------------------------EDIT-DATA---------------------------------//
PurchaseOrders.readOne=(indek,callback)=>{
  PurchaseOrders.getStatus(indek,()=>{
    db.execute(indek,{
      query:"SELECT * "
        +" FROM purchase_orders "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND vendor_id='"+bingkai[indek].vendor_id+"' "
        +" AND po_no='"+bingkai[indek].po_no+"' "
    },(paket)=>{
      if (paket.err.id==0 && paket.count>0) {
        
        var po=objectOne(paket.fields,paket.data) ;
        var va=JSON.parse(po.vendor_address);
        var dt=JSON.parse(po.discount_terms);
        var sa=JSON.parse(po.ship_address);
        
        copy_data (indek,po.po_no,paket);

        PurchaseOrders.setRows(indek, JSON.parse(po.detail));

        setEV('vendor_id_'+indek,po.vendor_id);
        setEV('vendor_name_'+indek, po.vendor_name);
        setEV('vendor_address_'+indek,toAddress(va));

        setEV('po_no_'+indek,po.po_no);
        setEV('po_date_'+indek,po.date);
        setEV('po_date_fake_'+indek,tglWest(po.date));
//        setEC('po_close_'+indek,po.status);
        setEV('good_thru_'+indek,po.good_thru);
        setEV('good_thru_fake_'+indek,tglWest(po.good_thru));
        
        setEV('ship_id_'+indek,po.ship_id);
        setEV('discount_amount_'+indek,po.discount_amount);
        setEV('displayed_terms_'+indek,dt.displayed);
        
        setEV('ap_account_id_'+indek,po.ap_account_id);
        setEV('po_amount_'+indek,po.amount);
        
        bingkai[indek].ship_address=sa;
        bingkai[indek].discount_terms=dt;
        
        PurchaseOrders.setShipAddress(indek);
        PurchaseOrders.calculateTotal(indek);

        message.none(indek);
      }
      return callback();
    });
  });
}

PurchaseOrders.getStatus=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT status "
      +" FROM po_status "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+bingkai[indek].vendor_id+"' "
      +" AND po_no='"+bingkai[indek].po_no+"' "
  },(p)=>{
    if(p.count>0){
      var d=objectOne(p.fields,p.data);
      //status: CLOSE=1;OPEN=0;
      setEC('po_close_'+indek,d.status);
    }
    return callback();
  });
}

PurchaseOrders.formUpdate=(indek,vendor_id,po_no)=>{
  bingkai[indek].vendor_id=vendor_id;
  bingkai[indek].po_no=po_no;
  PurchaseOrders.form.modeUpdate(indek);
}

PurchaseOrders.updateExecute=(indek)=>{
  var ship_address=JSON.stringify(bingkai[indek].ship_address);
  var discount_terms=JSON.stringify(bingkai[indek].discount_terms);
  var detail=JSON.stringify(bingkai[indek].po_detail);
  var some_note=["Add some note for this po.","edit-2"];
  
  db.execute(indek,{
    query:"UPDATE purchase_orders"
      +" SET vendor_id='"+getEV("vendor_id_"+indek)+"',"
      +" po_no='"+getEV("po_no_"+indek)+"',"
      +" date='"+getEV("po_date_"+indek)+"',"
      +" status='"+getEC("po_close_"+indek)+"',"
      +" good_thru='"+getEV("good_thru_"+indek)+"',"
      +" ship_address='"+ship_address+"',"
      +" ship_id='"+getEV("ship_id_"+indek)+"',"
      +" discount_terms='"+discount_terms+"',"
      +" ap_account_id='"+getEV("ap_account_id_"+indek)+"',"
      +" detail='"+detail+"',"
      +" note='"+some_note+"'"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+bingkai[indek].vendor_id+"' "
      +" AND po_no='"+bingkai[indek].po_no+"' "
  },(p)=>{
    if(p.err.id==0) {
      bingkai[indek].vendor_id=getEV('vendor_id_'+indek);
      bingkai[indek].po_no=getEV('po_no_'+indek);
      PurchaseOrders.endPath(indek);
    }
  });
}

PurchaseOrders.formDelete=(indek,vendor_id,po_no)=>{
  bingkai[indek].vendor_id=vendor_id;
  bingkai[indek].po_no=po_no;
  PurchaseOrders.form.modeDelete(indek);
}

PurchaseOrders.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM purchase_orders"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+bingkai[indek].vendor_id+"'"
      +" AND po_no='"+bingkai[indek].po_no+"'"
  },(p)=>{
    if(p.err.id==0) PurchaseOrders.endPath(indek);
  });
}

PurchaseOrders.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM purchase_orders"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND po_no LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR vendor_name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

PurchaseOrders.search=(indek)=>{
  PurchaseOrders.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT status,po_no,date,amount,vendor_name,vendor_id,"
        +" user_name, date_modified"
        +" FROM purchase_orders"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND po_no LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR vendor_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      PurchaseOrders.readShow(indek);
    });
  });
}

PurchaseOrders.exportExecute=(indek)=>{
  var table_name=PurchaseOrders.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

PurchaseOrders.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO purchase_orders "
      +"(admin_name,company_id,vendor_id,po_no,date,status,good_thru"
      +",ship_address,ship_id,discount_terms,ap_account_id"
      +",detail,note)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+d[i][1]+"'" // vendor_id
      +",'"+d[i][2]+"'" // po_no
      +",'"+d[i][3]+"'" //date
      +",'"+d[i][4]+"'" //status
      +",'"+d[i][5]+"'" //good_thru
      +",'"+d[i][6]+"'" //ship_address 
      +",'"+d[i][7]+"'" //ship_id
      +",'"+d[i][8]+"'" //discount_terms
      +",'"+d[i][9]+"'" // ap_acc
      +",'"+d[i][10]+"'" //detail
      +",'"+d[i][11]+"'" // note
      +")"
    },(paket)=>{  
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

PurchaseOrders.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT status,po_no,date,amount,vendor_name,vendor_id,"
      +" user_name,date_modified"
      +" FROM purchase_orders"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date "
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    PurchaseOrders.selectShow(indek);
  });
}

PurchaseOrders.selectShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset
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
//    +'<th colspan="2">Status</th>'
    +'<th colspan="2">PO#</th>'
    +'<th>Date</th>'
    +'<th>Amount</th>'
    +'<th>Vendor Name</th>'
    +'<th>Owner</th>'
    +'<th colspan="2">Modified</th>'
    +'</tr>';
  if (p.err.id===0){
    for (var x in d){
      n++;
      html+='<tr>'
        +'<td align="center">'
          +'<input type="checkbox"'
          +' id="checked_'+x+'_'+indek+'"'
          +' name="checked_'+indek+'" >'
        +'</td>'
        +'<td align="center">'+n+'</td>'
//        +'<td align="center">'+setStatus(d[x].status)+'</td>'
        +'<td align="left">'+d[x].po_no+'</td>'
        +'<td align="left">'+tglWest(d[x].date)+'</td>'
        +'<td align="right">'
          +Number(d[x].amount)
        +'</td>'
        +'<td align="left">'+d[x].vendor_name+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table>';
  content.html(indek,html);
  if(p.err.id!==0) content.infoPaket(indek,p);
}

PurchaseOrders.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM purchase_orders "
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND vendor_id='"+d[i].vendor_id+"' "
          +" AND po_no='"+d[i].po_no+"' "
      });
    }
  }
  db.deleteMany(indek,a);
} 

function setStatus(s){
  return s==1?"Close":"";
}

PurchaseOrders.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM purchase_orders "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+bingkai[indek].vendor_id+"' "
      +" AND po_no='"+bingkai[indek].po_no+"' "
  },(p)=>{
    if (p.count>0) {
      var d=objectOne(p.fields,p.data) ;      
      bingkai[indek].file_id=d.file_id;
      Properties.lookup(indek);
    }
    message.none(indek);
  });
}

PurchaseOrders.duplicate=(indek)=>{
  var id='copy_of '+document.getElementById('po_no_'+indek).value;
  document.getElementById('po_no_'+indek).value=id;
  document.getElementById('po_no_'+indek).focus();
}

PurchaseOrders.endPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{PurchaseOrders.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{PurchaseOrders.properties(indek);})
  }
}

// eof: 926;858;994;988;1042;1086;1059;1064;1071;1068;
