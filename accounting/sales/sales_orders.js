/*
 * auth: budiono;
 * code: I3;
 * path: /accounting/sales/sales_orders.js;
 * ---------------------------------------;
 * date: dec-01, 21:40, fri-2023; new; 
 * -----------------------------; happy new year 2024;
 * edit: jan-20, 12:06, sat-2024; meringkas;
 * edit: aug-11, 19:48, sun-2024; r12; 
 * edit: oct-04, 14:10, fri-2024; #20;
 * edit: oct-08, 18:34, tue-2024; #20;
 * edit: dec-02, 16:16, mon-2024; #27; add locker();
 * edit: dec-30, 18:16, mon-2024; #32; properties+duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-25, 09:59, tue-2025; #41; file_id;
 * edit: mar-14, 17:37, fri-2025; #43; deep-folder;
 * edit: mar-27, 09:09, thu-2025; #45; ctables;cstructure;
 * edit: apr-11, 17:51, fri-2025; #46; tes-data;
 * edit: apr-24, 20:40, thu-2025; #50; export to csv;
 * edit: aug-15, 21:12, fri-2025; #68; date obj;
 * edit: sep-28, 19:28, sun-2025; #77; 
 * edit: oct-31, 14:21, fri-2025; #80;
 * -----------------------------; happy new year 2026;
 * edit: jan-06, 13:22, tue-2026; #87;
 */ 

'use strict';

var SalesOrders={}
SalesOrders.hidePreview=false; // tampilkan preview;

SalesOrders.table_name='sales_orders';
SalesOrders.form=new ActionForm2(SalesOrders);
SalesOrders.grid=new Grid(SalesOrders);
SalesOrders.customer=new CustomerLook(SalesOrders);
SalesOrders.ship=new ShipMethodLook(SalesOrders);
SalesOrders.salesTax=new SalesTaxLook(SalesOrders);
SalesOrders.salesRep=new SalesRepLook(SalesOrders);
SalesOrders.item=new ItemLook(SalesOrders);
SalesOrders.account=new AccountLook(SalesOrders);
SalesOrders.itemTaxes=new ItemTaxesLook(SalesOrders);
SalesOrders.job=new JobLook(SalesOrders);
SalesOrders.quote=new QuoteLook(SalesOrders);

SalesOrders.show=(karcis)=>{
  karcis.modul=SalesOrders.table_name;
  karcis.have_child=true;
  
  const baru=exist(karcis);
  if(baru==-1){
    var newTxs=new BingkaiUtama(karcis);
    var indek=newTxs.show();
    createFolder(indek,()=>{
      SalesOrders.form.modePaging(indek);
      SalesOrders.getDefault(indek);
    });
  }else{
    show(baru);
  }
}

SalesOrders.getDefault=(indek)=>{
  CustomerDefaults.getDefault(indek);
  ShipToCustomer.getDefault(indek)
  bingkai[indek].customer_address=[]; 
  bingkai[indek].sum_item_amount=0.00;
  bingkai[indek].sum_tax_amount=0.00;
  bingkai[indek].sum_tax_rate=0.00;
}

SalesOrders.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM sales_orders"
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

SalesOrders.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  SalesOrders.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT customer_id,so_no,date,total,customer_name,"
        +" user_name,date_modified"
        +" FROM sales_orders"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY date,so_no"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      SalesOrders.readShow(indek);
    });
  })
}

SalesOrders.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;

  var html='<div style="padding:0.5rem;">'
  +content.title(indek)
  +content.message(indek)
  +pagingLimit(indek)
  +'<table border=1>'
    +'<tr>'
    +'<th colspan="2">Order #</th>'
    +'<th>Date</th>'
    +'<th>Amount</th>'
    +'<th>Customer Name</th>'
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
        +'<td align="left">'+d[x].so_no+'</td>'
        +'<td align="center">'+tglWest(d[x].date)+'</td>'
        +'<td align="right">'+d[x].total+'</td>'
        +'<td align="left">'+xHTML(d[x].customer_name)+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button" id="btn_change" '
          +' onclick="SalesOrders.formUpdate(\''+indek+'\''
          +',\''+d[x].customer_id+'\''
          +',\''+d[x].so_no+'\');">'
          +'</button>'
        +'</td>'
        +'<td align="center">'
          +'<button type="button" id="btn_delete" '
            +' onclick="SalesOrders.formDelete(\''+indek+'\''
            +',\''+d[x].customer_id+'\''
            +',\''+d[x].so_no+'\');">'
          +'</button>'
        +'</td>'
        +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  SalesOrders.form.addPagingFn(indek);
}

SalesOrders.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    +'<header>'
    +'<div style="display:grid;grid-template-columns:repeat(2,1fr);'
      +'padding-bottom:50px;">'
      +'<div>'
        +'<ul>'
          +'<li><label>Quote #</label>'
            +'<input type="text"'
            +' id="quote_no_'+indek+'"'
            +' size="9" '
            +' onchange="SalesOrders.getQuote(\''+indek+'\')">'
            +'<button type="button" class="btn_find" '
              +' id="quote_btn_'+indek+'"'
              +' onclick="SalesOrders.quote.getPaging(\''+indek+'\''
              +',\'quote_id_'+indek+'\')">'
            +'</button>'
          +'</li>'

          +'<li><label>Customer ID<i class="required">*</i></label>'
            +'<input type="text" '
            +' id="customer_id_'+indek+'"  '
            +' onfocus="this.select()"'
            +' onchange="SalesOrders.getCustomer(\''+indek+'\')"'
            +' size="16" >'
            
            +'<button type="button" id="btn_find" '
            +' onclick="SalesOrders.customer.getPaging(\''+indek+'\''
            +',\'customer_id_'+indek+'\')">'
            +'</button>'
          +'</li>'

          +'<li><label>Name</label>'
            +'<input type="text" '
            +' id="customer_name_'+indek+'" disabled'
            +' style="width:14.6rem;" >'
          +'</li>'

          +'<li><label>Bill To</label>'
            +'<textarea '
            +' id="customer_address_'+indek+'" disabled'
            +' placeholder="Bill To..."'
            +' spellcheck=false '
            +' style="resize:none;width:14.6rem;height:50px;" >'
            
            +'</textarea>'
          +'</li>'
        +'</ul>'
      +'</div>'

      +'<div>'
        +'<ul>'
          +'<li><label>SO #<i class="required">*</i></label>'
            +'<input type="text"'
            +' id="so_no_'+indek+'" '
            +' size="9">'
          +'</li>'
            
          +'<li><label>Date</label>'
            +'<input type="date" '
              +' id="so_date_'+indek+'"'
              +' onblur="dateFakeShow('+indek+',\'so_date\')"'
              +' style="display:none;">'
            +'<input type="text" '
              +' id="so_date_fake_'+indek+'"'
              +' onfocus="dateRealShow('+indek+',\'so_date\')"'
              +' size="9" align="center">'
          +'</li>'
          +'<li><label>Status</label>'
            +'<label><input type="checkbox" '
            +' id="so_status_'+indek+'">Close</label>'
          +'</li>'
            
          +'<li><label>'
            +' <input type="button" '
            +' onclick="ShipToCustomer.show(\''+indek+'\')" '
            +' value="Ship to"></label>'

            +'<textarea '
            +' id="ship_address_'+indek+'" disabled'
            +' spellcheck=false  '
            +' placeholder="Ship To ..."'
            +' style="resize:none;width:14.6rem;height:50px;" >'
            +'</textarea>'
          +'</li>'
        +'</ul>'
      +'</div>'
    +'</div>'
    
    +'<div style="display:grid;grid-template-columns:repeat(4,1fr);'
    +'padding-bottom:20px;">'
      +'<div>'
        +'<label style="display:block;">Customer PO</label>'
        +'<input type="text"'
          +' id="customer_po_'+indek+'"'
          +' size="15">'
      +'</div>'
      +'<div>'
        +'<label style="display:block;">Ship Via</label>'
        +'<input type="text"'
          +' id="ship_id_'+indek+'"'
          +' size="9">'        
        +'<button type="button" id="btn_find" '
          +' onclick="SalesOrders.ship.getPaging(\''+indek+'\''
          +',\'ship_id_'+indek+'\');">'
        +'</button>'
      +'</div>'
      +'<div>'
        +'<label style="display:block;">Term</label>'
        +'<input type="text" '
          +' id="displayed_terms_'+indek+'"'
          +' size="15" >'
        +'<button type="button" id="btn_find" '
          +' onclick="SalesOrders.showTerms(\''+indek+'\');">'
        +'</button>'
      +'</div>'
      +'<div>'
        +'<label style="display:block;">Sales Rep ID</label>'
        +'<input type="text" '
          +' id="sales_rep_id_'+indek+'" '
          +' spellcheck=false '
          +' size="12" >'
        +'<button type="button" id="btn_find" '
          +' onclick="SalesOrders.salesRep.getPaging(\''+indek+'\''
          +',\'sales_rep_id_'+indek+'\');">'
        +'</button>'
      +'</div>'
    +'</div>'
    +'</header>'
    +'<details open>'
      +'<summary>Sales Order Details</summary>'
      +'<div id="so_detail_'+indek+'" '
      +' style="width:100%;overflow:auto;"></div>'
    +'</details>'
//      +'<div style="display:grid;'
//        +'grid-template-columns:repeat(2,1fr);'
//        +'padding-bottom:50px;">'
      +'<div>'
        +'<div style="float:left;margin-right:100px;">'
          +'<ul>'
            +'<li>'
              +'<label>A/R Account<i class="required">*</i></label>'
              +'<input type="text"'
                +' id="ar_account_id_'+indek+'"'
                +' onfocus="this.select()"'
                +' size="9" >'
              +'<button type="button"'
                +' id="btn_find" '
                +' onclick="SalesOrders.account.getPaging(\''+indek+'\''
                +',\'ar_account_id_'+indek+'\',-1'
                +',\''+CLASS_ASSET+'\')">'
              +'</button>'
            +'</li>'
            +'<li>'
              +'<label>Sales Tax ID</label>'
              +'<input type="text"'
                +' id="sales_tax_id_'+indek+'" '
                +' onfocus="this.select()"'
                +' onchange="SalesOrders.getSalesTax(\''+indek+'\')"'
                +' size="9" >'
              +'<button type="button" id="btn_find" '
                +' onclick="SalesOrders.salesTax.getPaging'
                +'(\''+indek+'\''
                +',\'sales_tax_id_'+indek+'\')">'
              +' </button>'
            +'</li>'
            +'<li>'
              +'<label>Sales Tax Rate</label>'
              +'<input type="text" '
                +' id="sales_tax_rate_'+indek+'" disabled'
                +' style="text-align:center;"'
                +' size="9" >'
          +'</ul>'
        +'</div>'
        
        +'<div style="float:left;margin-right:100px;">'
          +'<ul>'
            +'<li>'
              +'<label>Sales Tax</label>'
              +'<input type="text" '
                +' id="sales_tax_'+indek+'" disabled'
                +' value="0"'
                +' style="text-align:right;"'
                +' size="9" >'
            +'</li>'
            +'<li>'
              +'<label>Freight Account:</label>'
              +'<input type="text" '
                +' id="freight_account_id_'+indek+'" '
                +' size="9">'
                +'<button type="button" id="btn_find" '
                +' onclick="SalesOrders.account.getPaging(\''+indek+'\''
                +',\'freight_account_id_'+indek+'\',\''+indek+'\''
                +',\''+CLASS_COST_OF_SALES+'\')">'
                +'</button>'
            +'</li>'
            +'<li>'
              +'<label>Freight Amount:</label>'
              +'<input type="text" '
                +' id="freight_amount_'+indek+'" '
                +' onfocus="this.select()" '
                +' value="0"'
                +' onchange="SalesOrders.calculateTotal(\''+indek+'\')"'
                +' style="text-align:right;"'
                +' size="9" >'
            +'</li>'

          +'</ul>'
        +'</div>'
        
        +'<div>'
          +'<ul>'
            +'<li>'
              +'<label>So Total</label>'
              +'<input type="text"'
                +' id="so_total_'+indek+'" disabled'
                +' value="0"'
                +' style="text-align:right;" '
                +' size="9" >'
            +'</li>'
          +'</ul>'
        +'</div>'
      +'<div style="clear:both">'
        +'<i style="color:red">* Required.</i>'
      +'</div>'
      +'</div>'

    +'</form>'
    +'</div>';    
  content.html(indek,html);
  statusbar.ready(indek);

  document.getElementById('customer_id_'+indek).focus();
  document.getElementById('so_date_'+indek).value=tglSekarang();
  document.getElementById('so_date_fake_'+indek).value=tglWest(tglSekarang());
  
  if(metode==MODE_CREATE) {
    SalesOrders.setDefault(indek);
  } else{
    document.getElementById('quote_no_'+indek).disabled=true;
    document.getElementById('quote_btn_'+indek).disabled=true;
  }
}

SalesOrders.setDefault=(indek)=>{
  var d=bingkai[indek].data_default;
//  var dt=JSON.parse(d.discount_terms);
  var dt=d.discount_terms;
  
  setEV('ar_account_id_'+indek, d.ar_account_id);
  setEV('displayed_terms_'+indek, dt.displayed);
  setEV('sales_tax_rate_'+indek,0);

  bingkai[indek].sum_item_amount=0
  bingkai[indek].sales_tax_rate=0;  
  bingkai[indek].discount_terms=dt;
  
  SalesOrders.setRows(indek,[]);
}

SalesOrders.setRows=(indek,isi)=>{
  if(isi===undefined)isi=[];
  var panjang=isi.length;
  var html=SalesOrders.tableHead(indek);
  var sum_item_amount=0;
  var sum_tax_amount=0;

  bingkai[indek].so_detail=isi;
  for (var i=0;i<panjang;i++){
    //sum_item_amount+=Number(isi[i].amount);
    html+='<tr>'
    +'<td align="center">'+(i+1)+'</td>'

    +'<td align="center" style="margin:0;padding:0">'
      +'<input type="text"'
      +' id="quantity_'+i+'_'+indek+'" '
      +' value="'+isi[i].quantity+'"'
      +' onfocus="this.select()"'
      +' onchange="SalesOrders.setCell(\''+indek+'\''
      +',\'quantity_'+i+'_'+indek+'\')"'
      +' style="text-align:center"'
      +' size="8" >'
    +'</td>'

    +'<td align="center" style="padding:0;margin:0;">'
      +'<input type="text"'
      +' id="item_id_'+i+'_'+indek+'" '
      +' value="'+isi[i].item_id+'"'
      +' onfocus="this.select()"'
      +' onchange="SalesOrders.setCell(\''+indek+'\''
      +',\'item_id_'+i+'_'+indek+'\')"'
      +' style="text-align:left"'
      +' size="9" >'
    +'</td>'
      
    +'<td><button type="button"'
      +' id="btn_find" '
      +' onclick="SalesOrders.item.getPaging(\''+indek+'\''
      +',\'item_id_'+i+'_'+indek+'\''
      +',\''+i+'\');">'
      +'</button>'
    +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="description_'+i+'_'+indek+'" '
      +' value="'+isi[i].description+'"'
      +' onfocus="this.select()"'
      +' onchange="SalesOrders.setCell(\''+indek+'\''
      +',\'description_'+i+'_'+indek+'\')" '
      +' style="text-align:left"'
      +' size="15" >'
    +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="gl_account_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].gl_account_id+'"'
      +' onfocus="this.select()"'
      +' onchange="SalesOrders.setCell(\''+indek+'\''
      +',\'gl_account_id_'+i+'_'+indek+'\',\'gl\')"'
      +' style="text-align:center"'
      +' size="8" >'
    +'</td>'
    
    +'<td><button type="button" id="btn_find" '
      +' onclick="SalesOrders.account.getPaging(\''+indek+'\''
      +',\'gl_account_id_'+i+'_'+indek+'\''
      +',\''+i+'\''
      +',\''+CLASS_INCOME+'\');">'
      +'</button>'
    +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="unit_price_'+i+'_'+indek+'" '
      +' value="'+Number(isi[i].unit_price)+'"'
      +' onfocus="this.select()"'
      +' onchange="SalesOrders.setCell(\''+indek+'\''
      +' ,\'unit_price_'+i+'_'+indek+'\')" '
      +' style="text-align:right"'
      +' size="8" >'
    +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="tax_id_'+i+'_'+indek+'" '
      +' value="'+isi[i].tax_id+'"'
      +' onfocus="this.select()"'
      +' onchange="SalesOrders.setCell(\''+indek+'\''
      +' ,\'tax_id_'+i+'_'+indek+'\')" '
      +' style="text-align:center;"'
      +' size="1" >'

      +'<input type="text"'
      +' id="tax_calculate_'+i+'_'+indek+'" disabled'
      +' value="'+isi[i].tax_calculate+'"'
      +' style="text-align:center;"'
      +' size="1" >'
    +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="amount_'+i+'_'+indek+'" '
      +' value="'+Number(isi[i].amount)+'"'
      +' onfocus="this.select()"'
      +' onchange="SalesOrders.setCell(\''+indek+'\''
      +',\'amount_'+i+'_'+indek+'\')" '
      +' style="text-align:right" '
      +' size="9" >'
    +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text" '
      +' id="job_phase_cost_'+i+'_'+indek+'" '
      +' value="'+isi[i].job_phase_cost+'" '
      +' onfocus="this.select()"'
      +' onchange="SalesOrders.setCell(\''+indek+'\''
      +',\'job_phase_cost_'+i+'_'+indek+'\')" '
      +' style="text-align:center"'
      +' size="5" >'
    +'</td>'
      
    +'<td style="width:0">'
      +'<button type="button" id="btn_find"'
        +' onclick="SalesOrders.job.getPaging(\''+indek+'\''
        +',\'job_phase_cost_'+i+'_'+indek+'\''
        +',\''+i+'\');">'
      +'</button>'
    +'</td>'

    +'<td align="center">'
      +'<button type="button" id="btn_add" '
      +' onclick="SalesOrders.addRow(\''+indek+'\','+i+')" >'
      +'</button>'
      
      +'<button type="button" id="btn_remove" '
      +' onclick="SalesOrders.removeRow(\''+indek+'\','+i+')" >'
      +'</button>'
    +'</td>'

    +'</tr>';
    
    sum_item_amount+=Number(isi[i].amount);    
    if(String(isi[i].tax_id).length>0){
      if(Number(isi[i].tax_calculate)==1){
        sum_tax_amount+=Number(isi[i].amount);
      }
    }
  }
  html+=SalesOrders.tableFoot(indek);
  var budi = JSON.stringify(isi);

  document.getElementById('so_detail_'+indek).innerHTML=html;
  
  bingkai[indek].sum_item_amount=sum_item_amount;
  bingkai[indek].sum_tax_amount=sum_tax_amount;
  
  SalesOrders.calculateTotal(indek);
  if(panjang==0) SalesOrders.addRow(indek,0);
}

SalesOrders.tableHead=(indek)=>{
  return '<table border=0 style="width:100%;" >'
    +'<thead>'
    +'<tr>'
    +'<th colspan="2">Quantity</th>'
    +'<th colspan="2">Item</th>'
    +'<th>Description<i class="required">*</i></th>'
    +'<th colspan="2">G/L Account<i class="required">*</i></th>'
    +'<th>Unit Price</th>'
    +'<th>Tax</th>'
    +'<th>Amount<i class="required">*</i></th>'
    +'<th colspan="2">Job</th>'
    +'<th>Add/Rem</th>'
    +'</tr>'
    +'</thead>';
}

SalesOrders.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
    +'<td>&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

SalesOrders.calculateTotal=(indek)=>{
  var itemAmount=Number(bingkai[indek].sum_item_amount) || 0;//without tax;
  var taxAmount=Number(bingkai[indek].sum_tax_amount) || 0;//with tax;
  var taxRate=Number(bingkai[indek].sales_tax_rate) || 0;
  var taxValue=Number(taxAmount)*Number(taxRate)/100;// item dengan pajak;
  var freightValue=Number(document.getElementById('freight_amount_'+indek).value) || 0;
  var soAmount=(itemAmount+taxValue+freightValue);

  setEV('sales_tax_rate_'+indek, taxRate+' %');
  setEV('sales_tax_'+indek, taxValue);
  setEV('freight_amount_'+indek, freightValue);
  setEV('so_total_'+indek, soAmount);
}

SalesOrders.addRow=(indek,baris)=>{
  SalesOrders.gl_account_id=bingkai[indek].data_default.gl_account_id;
  SalesOrders.grid.addRow(indek,baris,bingkai[indek].so_detail);
}

SalesOrders.newRow=(newBas)=>{
  var myItem={};
  myItem.row_id=newBas.length+1;
  myItem.quantity=0;
  myItem.item_id='';
  myItem.description="";
  myItem.gl_account_id=SalesOrders.gl_account_id
  myItem.unit_price=0;
  myItem.tax_id='';
  myItem.amount=0;
  myItem.job_phase_cost='';
  myItem.tax_calculate=0;
  newBas.push(myItem);
}

SalesOrders.removeRow=(indek,baris)=>{
  SalesOrders.grid.removeRow(indek,baris,bingkai[indek].so_detail);
}

SalesOrders.setCustomer=(indek,d)=>{
  setEV('customer_id_'+indek, d.customer_id);
  SalesOrders.getCustomer(indek);
}

SalesOrders.getCustomer=(indek)=>{
  SalesOrders.customer.getOne(indek,
    getEV('customer_id_'+indek),
  (paket)=>{

    setEV('sales_tax_id_'+indek,'');
    setEV('customer_name_'+indek, txt_undefined);

    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      var address=JSON.parse(d.address);
      var bill_to=address[0];
      var ship_address=address[1];
      var dt=JSON.parse(d.discount_terms);

      setEV('customer_name_'+indek, d.name);
      setEV('customer_address_'+indek, toAddress(bill_to));
      setEV('sales_tax_id_'+indek, bill_to.sales_tax_id);
      setEV('customer_po_'+indek, d.customer_po);
      setEV('ship_id_'+indek, d.ship_id);
      setEV('ship_address_'+indek, toAddress(ship_address));
      setEV('sales_rep_id_'+indek, d.sales_rep_id);
      setEV('displayed_terms_'+indek, dt.displayed);
      
      bingkai[indek].discount_terms=dt;
      bingkai[indek].ship_address=ship_address;
      bingkai[indek].customer_address=address;
      bingkai[indek].gl_account_id=d.sales_account_id;
      
      SalesOrders.setShipAddress(indek);
    }
    SalesOrders.getSalesTax(indek);
    SalesOrders.setRows(indek,[]);
  });
}

SalesOrders.setShipAddress=(indek)=>{
  setEV('ship_address_'+indek, 
    toAddress(bingkai[indek].ship_address));
}

SalesOrders.getSalesTax=(indek)=>{
  SalesOrders.salesTax.getOne(indek,
  getEV('sales_tax_id_'+indek),
  (paket)=>{
    bingkai[indek].sales_tax_rate=0;
    if(paket.count>0){
      var dd=objectOne(paket.fields,paket.data);
      bingkai[indek].sales_tax_rate=dd.rate;
    };
    // SalesOrders.calculateTotal(indek);
    SalesOrders.setRows(indek,bingkai[indek].so_detail);
  });
}

SalesOrders.getQuote=(indek)=>{
  SalesOrders.quote.getOne(indek,
    getEV('customer_id_'+indek),
    getEV('quote_no_'+indek),
  (paket)=>{
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      
      setEV('quote_no_'+indek, d.quote_no);
//      setEV('customer_id_'+indek, d.customer_id);
//      setEV('customer_po_'+indek, d.customer_po);
//      setEV('ship_id_'+indek, d.ship_id);
      
//      SalesOrders.setRows(indek,JSON.parse(d.detail) );
      
      
    
    
    
    
    //--
        var address=JSON.parse(d.customer_address);
        var ship_address=JSON.parse(d.ship_address);
        var discount_terms=JSON.parse(d.discount_terms);
        var so_detail=JSON.parse(d.detail);

        setEV('quote_no_'+indek, d.quote_no);
        setEV('customer_id_'+indek, d.customer_id);
        setEV('customer_name_'+indek, d.customer_name);
        setEV('customer_address_'+indek, toAddress(address));

        setEV('so_no_'+indek, d.quote_no);
        setEV('so_date_'+indek, d.date);
        setEV('so_date_fake_'+indek, tglWest(d.date));
        
        setEV('ship_address_'+indek, toAddress(ship_address));
        setEV('customer_po_'+indek, d.customer_po);
        setEV('ship_id_'+indek, d.ship_id);
        setEV('displayed_terms_'+indek, discount_terms.displayed);
        setEV('sales_rep_id_'+indek, d.sales_rep_id);
        
        SalesOrders.setRows(indek, so_detail);

        setEV('ar_account_id_'+indek, d.ar_account_id);
        setEV('sales_tax_id_'+indek, d.sales_tax_id);
        setEV('sales_tax_rate_'+indek, d.sales_tax_rate+' %');
        setEV('sales_tax_'+indek, Number(d.tax_amount));
        
        setEV('freight_account_id_'+indek, d.freight_account_id);
        setEV('freight_amount_'+indek, Number(d.freight_amount));
        setEV('so_total_'+indek, Number(d.total));
        
        
        bingkai[indek].discount_terms=discount_terms;
        bingkai[indek].ship_address=ship_address;
        bingkai[indek].sales_tax_rate=d.sales_tax_rate;
    //--
    };
  });
}

SalesOrders.setQuote=(indek,d)=>{
  setEV('customer_id_'+indek, d.customer_id);
  setEV('quote_no_'+indek, d.quote_no);
  SalesOrders.getQuote(indek);
}

SalesOrders.setShipMethod=(indek,d)=>{
  setEV('ship_id_'+indek, d.ship_id);
}

SalesOrders.showTerms=(indek)=>{
  bingkai[indek].discount_terms.date=getEV('so_date_'+indek);
  bingkai[indek].discount_terms.amount=getEV('so_total_'+indek);
  DiscountTerms.show(indek);
}

SalesOrders.setTerms=(indek)=>{
  setEV('displayed_terms_'
    +indek, bingkai[indek].discount_terms.displayed);
}

SalesOrders.setSalesRep=(indek,d)=>{
  setEV('sales_rep_id_'+indek,d.sales_rep_id);
}

SalesOrders.setItem=(indek,d)=>{  
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.item_id);
  SalesOrders.setCell(indek,id_kolom);
}

SalesOrders.getItem=(indek,baris)=>{
  SalesOrders.item.getOne(indek,
  getEV('item_id_'+baris+'_'+indek),
  (paket)=>{
    setEV('description_'+baris+'_'+indek, txt_undefined);
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('item_id_'+baris+'_'+indek,d.item_id);
      setEV('description_'+baris+'_'+indek, d.name_for_sales);
      setEV('gl_account_id_'+baris+'_'+indek, d.sales_account_id);
      setEV('unit_price_'+baris+'_'+indek, d.item_price);
      setEV('tax_id_'+baris+'_'+indek, d.tax_id);
      setEV('tax_calculate_'+baris+'_'+indek, d.tax_calculate);

      SalesOrders.setCell(indek,'description_'+baris+'_'+indek);
      SalesOrders.setCell(indek,'gl_account_id_'+baris+'_'+indek);
      SalesOrders.setCell(indek,'unit_price_'+baris+'_'+indek);
      SalesOrders.setCell(indek,'tax_id_'+baris+'_'+indek);
      SalesOrders.setCell(indek,'tax_calculate_'+baris+'_'+indek);
    }
  });  
}

SalesOrders.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].so_detail;
  var baru = [];
  var isiEdit = {};

  var sum_item_amount=0;
  var sum_tax_amount=0;
  
  for (var i=0;i<isi.length; i++){
    isiEdit=isi[i];
    
    if(id_kolom==('quantity_'+i+'_'+indek)){
      isiEdit.quantity=getEV(id_kolom);
      isiEdit.amount=(isiEdit.quantity*isiEdit.unit_price);
      baru.push(isiEdit);
      setEV('amount_'+i+'_'+indek, Number(isiEdit.amount));
      
    }else if(id_kolom==('item_id_'+i+'_'+indek)){
      isiEdit.item_id=getEV(id_kolom);
      baru.push(isiEdit);
      SalesOrders.getItem(indek,i);
      
    }else if(id_kolom==('description_'+i+'_'+indek)){
      isiEdit.description=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else if(id_kolom==('gl_account_id_'+i+'_'+indek)){
      isiEdit.gl_account_id=getEV(id_kolom);
      baru.push(isiEdit);
    
    }else if(id_kolom==('unit_price_'+i+'_'+indek)){
      isiEdit.unit_price=getEV(id_kolom);
      isiEdit.amount=(isiEdit.quantity*isiEdit.unit_price);
      baru.push(isiEdit);
      setEV('amount_'+i+'_'+indek,Number(isiEdit.amount));
      
    }else if(id_kolom==('tax_id_'+i+'_'+indek)){
      isiEdit.tax_id=getEV(id_kolom);
      baru.push(isiEdit);
      SalesOrders.getItemTax(indek,i);
      
    }else if(id_kolom==('tax_calculate_'+i+'_'+indek)){
      isiEdit.tax_calculate=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else if(id_kolom==('amount_'+i+'_'+indek)){
      isiEdit.amount=getEV(id_kolom);
      if(isiEdit.quantity>0){
        isiEdit.unit_price=(isiEdit.amount/isiEdit.quantity);
      }
      baru.push(isiEdit);
      setEV('unit_price_'+i+'_'+indek, isiEdit.unit_price);
      
    }else if(id_kolom==('job_phase_cost_'+i+'_'+indek)){
      isiEdit.job_phase_cost=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else{
      baru.push(isi[i]);
    }

    baru.push(isiEdit);
    sum_item_amount+=Number(isi[i].amount);    
    if(String(isi[i].tax_id).length>0){
      if(Number(isi[i].tax_calculate)==1){
        sum_tax_amount+=Number(isi[i].amount);
      }
    }
  }
  bingkai[indek].sum_item_amount=sum_item_amount;
  bingkai[indek].sum_tax_amount=sum_tax_amount;
  SalesOrders.calculateTotal(indek);
}

SalesOrders.setAccount=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var baris=bingkai[indek].baris;

  switch (id_kolom){
    case "ar_account_id_"+indek:
      setEV(id_kolom, d.account_id);
      break;
    case "gl_account_id_"+baris+'_'+indek:
      setEV(id_kolom, d.account_id);
      SalesOrders.setCell(indek,id_kolom);
      break;
    case "freight_account_id_"+indek:
      setEV(id_kolom, d.account_id);
      SalesOrders.setCell(indek,id_kolom);
      break;

    default:
      alert('['+id_kolom+'] undefined?');
  }
}

SalesOrders.getItemTax=(indek,baris)=>{  
  SalesOrders.itemTaxes.getOne(indek,
  getEV('tax_id_'+baris+'_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('tax_calculate_'+baris+'_'+indek, d.calculate);
      SalesOrders.setCell(indek,'tax_calculate_'+baris+'_'+indek);
    }
  })
}

SalesOrders.setJob=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d);
  SalesOrders.setCell(indek,id_kolom);
}

SalesOrders.setSalesTax=(indek,d)=>{
  setEV('sales_tax_id_'+indek, d.sales_tax_id);
  bingkai[indek].sales_tax_rate=d.rate;
  SalesOrders.getSalesTax(indek)
}

SalesOrders.createExecute=(indek)=>{
  var ship_address=  JSON.stringify(bingkai[indek].ship_address);
  var discount_terms=JSON.stringify(bingkai[indek].discount_terms);
  var detail=JSON.stringify(bingkai[indek].so_detail);
  var some_note=JSON.stringify(
    ["Add some note for this Sales Orders.","new-1"]
  );

  db.execute(indek,{
    query:"INSERT INTO sales_orders "
      +"(admin_name,company_id,quote_no,customer_id,"
      +"so_no,date,status,ship_address,"
      +"customer_po,ship_id,discount_terms,sales_rep_id,"
      +"detail,"
      +"ar_account_id,sales_tax_id,"
      +"freight_account_id,freight_amount,note) "
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEV("quote_no_"+indek)+"'"
      +",'"+getEV("customer_id_"+indek)+"'"
      +",'"+getEV("so_no_"+indek)+"'"
      +",'"+getEV("so_date_"+indek)+"'"
      +",'"+getEC("so_status_"+indek)+"'"
      +",'"+ship_address+"'"
      +",'"+getEV("customer_po_"+indek)+"'"
      +",'"+getEV("ship_id_"+indek)+"'"
      +",'"+discount_terms+"'"
      +",'"+getEV("sales_rep_id_"+indek)+"'"
      +",'"+detail+"'"
      +",'"+getEV("ar_account_id_"+indek)+"'"
      +",'"+getEV("sales_tax_id_"+indek)+"'"
      +",'"+getEV("freight_account_id_"+indek)+"'"
      +",'"+getEV("freight_amount_"+indek)+"'"
      +",'"+some_note+"'"
      +")"
  });
}

SalesOrders.readOne=(indek,callback)=>{
  SalesOrders.getStatus(indek,()=>{
    db.run(indek,{
      query:"SELECT * "
        +" FROM sales_orders"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND customer_id='"+bingkai[indek].customer_id+"'"
        +" AND so_no='"+bingkai[indek].so_no+"'"
    },(paket)=>{
      if (paket.err.id==0 && paket.count>0) {
        var d=objectOne(paket.fields,paket.data);
        var address=JSON.parse(d.customer_address);
        var ship_address=JSON.parse(d.ship_address);
        var discount_terms=JSON.parse(d.discount_terms);
        var so_detail=JSON.parse(d.detail);
        
        copy_data (indek,d.so_no,paket);

        setEV('quote_no_'+indek, d.quote_no);
        setEV('customer_id_'+indek, d.customer_id);
        setEV('customer_name_'+indek, d.customer_name);
        setEV('customer_address_'+indek, toAddress(address));

        setEV('so_no_'+indek, d.so_no);
        setEV('so_date_'+indek, d.date);
        setEV('so_date_fake_'+indek, tglWest(d.date));
//        setEC('so_status_'+indek, d.status);
        
        setEV('ship_address_'+indek, toAddress(ship_address));
        setEV('customer_po_'+indek, d.customer_po);
        setEV('ship_id_'+indek, d.ship_id);
        setEV('displayed_terms_'+indek, discount_terms.displayed);
        setEV('sales_rep_id_'+indek, d.sales_rep_id);
        
        SalesOrders.setRows(indek, so_detail);

        setEV('ar_account_id_'+indek, d.ar_account_id);
        setEV('sales_tax_id_'+indek, d.sales_tax_id);
        setEV('sales_tax_rate_'+indek, d.sales_tax_rate+' %');
        setEV('sales_tax_'+indek, Number(d.tax_amount));
        
        setEV('freight_account_id_'+indek, d.freight_account_id);
        setEV('freight_amount_'+indek, Number(d.freight_amount));
        setEV('so_total_'+indek, Number(d.total));
        
        
        bingkai[indek].discount_terms=discount_terms;
        bingkai[indek].ship_address=ship_address;
        bingkai[indek].sales_tax_rate=d.sales_tax_rate;
        
        // ambil address
        SalesOrders.customer.getOne(indek,
        getEV('customer_id_'+indek),
        (paket2)=>{
          bingkai[indek].customer_address=[];
          if(paket2.count>0){
            var d=objectOne(paket2.fields,paket2.data);
            var customer_address=JSON.parse(d.address)
            bingkai[indek].customer_address=customer_address;
          }
        });
        message.none(indek);
      }
      return callback();
    });
  });
}

SalesOrders.getStatus=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT status "
      +" FROM sales_orders"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"'"
      +" AND so_no='"+bingkai[indek].so_no+"'"
  },(p)=>{
    if(p.count>0){
      var d=objectOne(p.fields,p.data);
      setEC('so_status_'+indek, d.status);
    }
    return callback();
  });
}

SalesOrders.formUpdate=(indek,customer_id,so_no)=>{
  bingkai[indek].customer_id=customer_id;
  bingkai[indek].so_no=so_no;
  SalesOrders.form.modeUpdate(indek);
}

SalesOrders.updateExecute=(indek)=>{
  var ship_address  =JSON.stringify(bingkai[indek].ship_address);
  var discount_terms=JSON.stringify(bingkai[indek].discount_terms);
  var detail=JSON.stringify(bingkai[indek].so_detail);
  var some_note=JSON.stringify(
    ["Add some note for this Sales Orders.","edit-1"]
  );

  db.execute(indek,{
    query:" UPDATE sales_orders"
      +" SET customer_id='"+getEV("customer_id_"+indek)+"',"
      +" so_no='"+getEV("so_no_"+indek)+"',"
      +" date='"+getEV("so_date_"+indek)+"',"
      +" status='"+getEC("so_status_"+indek)+"',"
      +" ship_address='"+ship_address+"',"
      +" customer_po='"+getEV("customer_po_"+indek)+"',"
      +" ship_id='"+getEV("ship_id_"+indek)+"',"
      +" discount_terms='"+discount_terms+"',"
      +" sales_rep_id='"+getEV("sales_rep_id_"+indek)+"',"
      +" detail='"+detail+"',"
      +" ar_account_id='"+getEV("ar_account_id_"+indek)+"',"
      +" sales_tax_id='"+getEV("sales_tax_id_"+indek)+"',"
      +" freight_account_id='"+getEV("freight_account_id_"+indek)+"',"
      +" freight_amount='"+getEV("freight_amount_"+indek)+"',"
      +" note='"+some_note+"'"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"'"
      +" AND so_no='"+bingkai[indek].so_no+"'"
  },(p)=>{
    if(p.err.id==0){
      SalesOrders.deadPath(indek);
      bingkai[indek].customer_id=getEV('customer_id_'+indek);
      bingkai[indek].so_no=getEV('so_no_'+indek);
    }
  })
}

SalesOrders.formDelete=(indek,customer_id,so_no)=>{
  bingkai[indek].customer_id=customer_id;
  bingkai[indek].so_no=so_no;
  SalesOrders.form.modeDelete(indek);
}

SalesOrders.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM sales_orders"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"'"
      +" AND so_no='"+bingkai[indek].so_no+"'"
  },(p)=>{
    if(p.err.id==0) SalesOrders.deadPath(indek);
  });
}

SalesOrders.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM sales_orders"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND so_no LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR date LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

SalesOrders.search=(indek)=>{
  SalesOrders.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT so_no,date,total,customer_name,customer_id,"
        +" user_name,date_modified"
        +" FROM sales_orders"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND so_no LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR customer_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR date LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      SalesOrders.readShow(indek);
    });
  });
}

SalesOrders.exportExecute=(indek)=>{
  var table_name=SalesOrders.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

SalesOrders.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO sales_orders "
        +"(admin_name,company_id,quote_no,customer_id"
        +",so_no,date,status,ship_address"
        +",customer_po,ship_id,discount_terms,sales_rep_id"
        +",detail"
        +",ar_account_id,sales_tax_id"
        +",freight_account_id,freight_amount,note)"
        +" VALUES "
        +"('"+bingkai[indek].admin.name+"'"
        +",'"+bingkai[indek].company.id+"'"
//        +",''"
        +",'"+d[i][1]+"'" // quote_no
        +",'"+d[i][2]+"'" // customer id
        +",'"+d[i][3]+"'" // so_no
        +",'"+d[i][4]+"'" // date
        +",'"+d[i][5]+"'" // status
        +",'"+d[i][6]+"'" // ship address
        +",'"+d[i][7]+"'" // customer_po
        +",'"+d[i][8]+"'" // ship_id
        +",'"+d[i][9]+"'" // discount_terms
        +",'"+d[i][10]+"'" // sales_rep_id
        +",'"+d[i][11]+"'" // so_detail
        +",'"+d[i][12]+"'" // ar_account_is
        +",'"+d[i][13]+"'" // sales_tax_id
        +",'"+d[i][14]+"'" // freight_account_id
        +",'"+d[i][15]+"'" // freight_amount
        +",'"+d[i][16]+"'" // note
        +")"
    },(paket)=>{  
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

SalesOrders.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT so_no,date,total,customer_name,customer_id,"
      +" user_name,date_modified"
      +" FROM sales_orders"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    SalesOrders.selectShow(indek);
  });
}

SalesOrders.selectShow=(indek)=>{
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
      +'<th colspan="2">Order #</th>'
      +'<th>Date</th>'
      +'<th>Amount</th>'
      +'<th>Customer Name</th>'
      +'<th>Owner</th>'
      +'<th colspan="2">Modified</th>'
    +'</tr>';

  if (p.err.id===0){
    var x;
    for (x in d){
      n++;
      html+='<tr>'
        +'<td align="center">'
          +'<input type="checkbox"'
          +' id="checked_'+x+'_'+indek+'"'
          +' name="checked_'+indek+'" >'
        +'</td>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].so_no+'</td>'
        +'<td align="center">'+tglWest(d[x].date)+'</td>'
        +'<td align="right">'+d[x].total+'</td>'
        +'<td align="left">'+xHTML(d[x].customer_name)+'</td>'
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

SalesOrders.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM sales_orders"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND customer_id='"+d[i].customer_id+"'"
          +" AND so_no='"+d[i].so_no+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

SalesOrders.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM sales_orders"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"'"
      +" AND so_no='"+bingkai[indek].so_no+"'"
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

SalesOrders.duplicate=(indek)=>{
  var id='copy_of '+getEV('so_no_'+indek);
  setEV('so_no_'+indek,id);
  focus('so_no_'+indek);
}


SalesOrders.deadPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{SalesOrders.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{SalesOrders.properties(indek);})
  }
}





// eof: 1050;1163;1174;1237;1225;1230;1228;1225;
