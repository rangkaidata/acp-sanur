/*
 * auth: budiono;
 * code: I4;
 * path: /accounting/sales/invoices.js;
 * -----------------------------------;
 * date: dec-03, 06:36, sun-2023; new;
 * -----------------------------; happy new year 2024;
 * edit: jan-20, 18:00, sat-2024; mringkas;
 * edit: jan-21, 17:20, sun-2024; masih-mringkas..;
 * edit: aug-12, 20:30, mon-2024; r12; 
 * edit: oct-04, 20:27, fri-2024; #20;
 * edit: oct-12, 21:35, sat-2024; #22;
 * edit: nov-28, 19:05, thu-2024; #27; add locker();
 * edit: dec-02, 16:21, mon-2024; #27; 2;
 * edit: dec-31, 08:20, mon-2024; #32; properties+duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-25, 10:48, tue-2025; #41; file_id;
 * edit: mar-15, 06:40, sat-2025; #43; deep-folder;
 * edit: mar-27, 11:46, thu-2025; #45; ctables;cstructure;
 * edit: jul-25, 17:06, fri-2025; #65; ticket_invoice;
 * edit: jul-28, 16:50, mon-2025; #65; ticket_look;
 * edit: aug-04, 10:29, mon-2025; #65; masih belum kelar;
 * edit: aug-15, 21:20, fri-2025; #68; add date obj;
 * edit: nov-03, 06:42, mon-2025; #80;
 * edit: dec-19, 21:23, fri-2025; #84; add freight_account;
 */ 
 
'use strict';

var Invoices={};

Invoices.table_name='invoices';
Invoices.blank='--No SO Selected--';
Invoices.so={};
Invoices.ticket={};
Invoices.form=new ActionForm2(Invoices);
// grid
Invoices.grid=new Grid(Invoices);
Invoices.so.grid=new Grid(Invoices.so);// ...!?
Invoices.ticket.grid=new Grid(Invoices.ticket);
//
Invoices.customer=new CustomerLook(Invoices);
Invoices.ship=new ShipMethodLook(Invoices);
Invoices.salesTax=new SalesTaxLook(Invoices);
Invoices.salesRep=new SalesRepLook(Invoices);
Invoices.item=new ItemLook(Invoices);
Invoices.itemTax=new ItemTaxesLook(Invoices);
Invoices.account=new AccountLook(Invoices);
Invoices.job=new JobLook(Invoices);
Invoices.timeExpense=new TicketInvoiceLook(Invoices);
Invoices.quote=new QuoteLook(Invoices);
Invoices.hidePreview=false;

Invoices.show=(karcis)=>{
  karcis.modul=Invoices.table_name;
  karcis.have_child=true;
  
  const baru=exist(karcis);
  if(baru==-1){
    const newTxs=new BingkaiUtama(karcis);
    const indek=newTxs.show();
    createFolder(indek,()=>{
      Invoices.form.modePaging(indek);
      Invoices.getDefault(indek);
    });
  }else{
    show(baru);
  }
}

Invoices.getDefault=(indek)=>{
  CustomerDefaults.getDefault(indek);
  DiscountTerms.getColumn(indek);
  
  bingkai[indek].paid_at_sale={};
  bingkai[indek].customer_address=[];
}

Invoices.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM invoices"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
//      +" AND total > 0"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Invoices.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Invoices.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT invoice_no,"
          +" date,"
          +" total,"
          +" customer_name,"
          +" customer_id,"
          +" user_name,"
          +" date_modified"
        +" FROM invoices"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
//        +" AND total > 0"
        +" ORDER BY date,invoice_no"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Invoices.readShow(indek);
    });
  })
}

Invoices.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table>'
    +'<tr>'
      +'<th colspan="2">Invoice #</th>'
      +'<th>Date</th>'
      +'<th>Status</th>'
      +'<th>Amount</th>'
      +'<th>Name</th>'
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
          +'<td align="left">'+d[x].invoice_no+'</td>'
          +'<td align="center">'+tglEast(d[x].date)+'</td>'
          +'<td align="left">'+array_invoice_status[0]+'</td>'
          +'<td align="right">'+d[x].total+'</td>'
          +'<td align="left">'+xHTML(d[x].customer_name)+'</td>'
          +'<td align="center">'+d[x].user_name+'</td>'
          +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
          +'<td align="center">'
            +'<button type="button" id="btn_change"'
            +' onclick="Invoices.formUpdate(\''+indek+'\''
            +',\''+d[x].customer_id+'\''
            +',\''+d[x].invoice_no+'\');">'
            +'</button>'
          +'</td>'
          +'<td align="center">'
            +'<button type="button"'
            +' id="btn_delete"'
            +' onclick="Invoices.formDelete(\''+indek+'\''
            +',\''+d[x].customer_id+'\''
            +',\''+d[x].invoice_no+'\');">'
            +'</button>'
          +'</td>'
          +'<td align="center">'+n+'</td>'
        +'</tr>';
      }
    }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Invoices.form.addPagingFn(indek);
}

Invoices.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  
  var html=''
  +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    +'<div'
    +' style="display:grid;grid-template-columns:repeat(2,1fr);'
    +'padding-bottom:40px;">'
      +'<div>'
        +'<ul>'
/*        
          +'<li><label>Quote#: </label>'
            +'<input type="text" '
            +' id="quote_no_'+indek+'"'
            +' size="9" >'
          +'</li>'
*/          
          +'<li><label>Quote #</label>'
            +'<input type="text"'
            +' id="quote_no_'+indek+'"'
            +' size="9" '
            +' onchange="Invoices.getQuote(\''+indek+'\')">'
            +'<button type="button" class="btn_find" '
              +' id="quote_btn_'+indek+'"'
              +' onclick="Invoices.quote.getPaging(\''+indek+'\''
              +',\'quote_id_'+indek+'\')">'
            +'</button>'
          +'</li>'
          
          +'<li>'
            +'<label>Customer ID <i class="required">*</i>:</label>'
            +'<input type="text" '
            +' id="customer_id_'+indek+'"'
            +' onchange="Invoices.getCustomer(\''+indek+'\',()=>{})"'
            +' size="16" >'

            +'<button type="button" id="btn_find" '
            +' onclick="Invoices.customer.getPaging(\''+indek+'\''
            +',\'customer_id_'+indek+'\')">'
            +'</button>'
          +'</li>'

          +'<li><label>Name:</label>'
            +'<input type="text" disabled'
            +' id="customer_name_'+indek+'" '
            +' style="width:14.6rem;">'
          +'</li>'
          
          +'<li><label>Bill To:</label>'
            +'<textarea id="customer_address_'+indek+'" '
            +' placeholder="Bill To"'
            +' style="resize:none;width:14.6rem;height:50px;" '
            +' spellcheck=false disabled>'
            +'</textarea>'
          +'</li>'
            
        +'</ul>'
      +'</div>'
      
      +'<div style="display:block;padding-bottom:30px;">'
        +'<ul>'
          +'<li><label>Invoice#</label>'
            +'<input type="text"'
            +' id="invoice_no_'+indek+'"'
            +' size="9" >'
          
            +'&nbsp;<label id="invoice_status_'+indek+'"'
            +' style="color:red;font-weight:strong;">'
          +'</li>'
          
          +'<li><label>Date:</label>'
            +'<input type="date"'
              +' id="invoice_date_'+indek+'"'
              +' onblur="dateFakeShow('+indek+',\'invoice_date\')"'
              +' style="display:none;">'
            +'<input type="text"'
              +' id="invoice_date_fake_'+indek+'"'
              +' onfocus="dateRealShow('+indek+',\'invoice_date\')"'
              +' size="9">'
          +'</li>'
          
          +'<li><label><input type="button" '
            +' onclick="ShipToCustomer.show(\''+indek+'\')" '
            +' value="Ship to"></label>'
            +'<textarea '
            +' id="ship_address_'+indek+'" disabled'
            +' spellcheck=false'
            +' placeholder="Ship To"'
            +' style="resize:none;width:14.6rem;height:50px;" >'
            +'</textarea>'
          +'</li>'
          
        +'</ul>'
      +'</div>'
    +'</div>'
    
    +'<div style="display:grid;grid-template-columns:repeat(5,1fr);'
    +'padding-bottom:10px;">'
      +'<div>'
        +'<label style="display:block;">Customer PO:</label>'
        +'<input type="text"'
        +' id="customer_po_'+indek+'"'
        +' size="15" >'
      +'</div>'
      
      +'<div>'  
        +'<label style="display:block;">Ship Via:</label>'
        +'<input type="text" '
        +' id="ship_id_'+indek+'"'
        +' size="9" >'
        
        +'<button type="button" id="btn_find" '
        +' onclick="Invoices.ship.getPaging(\''+indek+'\''
        +',\'ship_id_'+indek+'\');">'
        +'</button>'
      +'</div>'
      
      +'<div>'
        +'<label style="display:block;">Ship Date:</label>'
        +'<input type="date"'
          +' id="ship_date_'+indek+'"'
          +' onblur="dateFakeShow('+indek+',\'ship_date\')"'
          +' style="display:none;">'
        +'<input type="text"'
          +' id="ship_date_fake_'+indek+'"'
          +' onfocus="dateRealShow('+indek+',\'ship_date\')"'
          +' size="9">'
      +'</div>'
      
      +'<div>'
        +'<label style="display:block;">Terms:</label>'
        +'<input type="text"'
        +' id="displayed_terms_'+indek+'"'
        +' style="text-align:center;"'
        +' size="15" >'

        +'<button type="button" id="btn_find" '
        +' onclick="Invoices.showTerms(\''+indek+'\');">'
        +'</button>'
      +'</div>'  
      
      +'<div>'
        +'<label style="display:block;">Sales Rep ID</label>'
        +'<input type="text"'
        +' id="sales_rep_id_'+indek+'"'
        +' size="12" >'
        
        +'<button type="button" id="btn_find" '
        +' onclick="Invoices.salesRep.getPaging(\''+indek+'\''
        +',\'sales_rep_id_'+indek+'\');">'
        +'</button>'
      +'</div>'  
      
      +'<div>'
        +'<label style="display:block;">Item Mode</label>'
        +'<select id="item_detail_'+indek+'"'
          +' onchange="Invoices.itemDetail(\''+indek+'\')">'
          +'<option>Invoices</option>'
          +'<option>Sales Orders</option>'
          +'<option>Tickets</option>'
          +'<option>Reimbursable</option>'
        +'</select>'
      +'</div>'
    +'</div>'

    +'<details id="detail_invoice_'+indek+'" open>'
      +'<summary>Invoice Items'
      +'<label id="total_invoice_'+indek+'"></label>'
      +'</summary>'
      +'<div id="invoice_detail_'+indek+'"'
        +' style="width:100%;overflow:auto;"></div>'
    +'</details>'
    
    +'<details id="detail_so_'+indek+'"'
      +' style="display:none" open>'
      +'<summary>Sales Order Items'
      +'<label id="total_so_'+indek+'"></label>'
      +'</summary>'
      +'Sales Order#: <select id="so_no_'+indek+'"'
        +' onchange="Invoices.getSOItem(\''+indek+'\')">'
        +'<option>'+Invoices.blank+'</option>'
      +'</select>'
      
      +'<div id="so_detail_'+indek+'"'
        +' style="width:100%;overflow:auto;"></div>'
    +'</details>'
    
    +'<details id="detail_ticket_'+indek+'"'
      +' style="display:none" open>'
      +'<summary>Time Tickets and Expenses'
        +'<label id="total_ticket_'+indek+'"></label>'
      +'</summary>'
      +'<div id="ticket_detail_'+indek+'"'
        +' style="width:100%;overflow:auto;"></div>'
    +'</details>'
    
    +'<details id="detail_reimbursable_'+indek+'"'
      +' style="display:none" open>'
      +'<summary>Reimbursable'
        +'<label id="total_reimbursable_'+indek+'"></label>'
      +'</summary>'
    +'</details>'
    
    +'<div style="display:grid;grid-template-columns: repeat(3,1fr);'
      +'padding-bottom:20px;">'
      +'<div>'
        +'<ul>'

        +'<li><label>A/R Account:</label>'
          +'<input type="text" '
          +' id="ar_account_id_'+indek+'" '
          +' size="9" >'

          +'<button type="button" id="btn_find" '
          +' onclick="Invoices.account.getPaging(\''+indek+'\''
          +',\'ar_account_id_'+indek+'\',-1'
          +',\''+CLASS_ASSET+'\')">'
          +'</button>'
          +'</li>'
        
        +'<li><label>Sales Tax ID:</label>'
          +'<input type="text" '
          +' id="sales_tax_id_'+indek+'" '
          +' onchange="Invoices.getSalesTax(\''+indek+'\')"'
          +' style="text-align:center;"'
          +' size="9" >'
          
          +'<button type="button" id="btn_find" '
          +' onclick="Invoices.salesTax.getPaging(\''+indek+'\''
          +',\'sales_tax_id_'+indek+'\')">'
          +'</button>'
          +'</li>'
          
        +'<li><label>Sales Tax Rate:</label>'
          +'<input type="text" '
          +' id="sales_tax_rate_'+indek+'" disabled'
          +' value="0%"'
          +' style="text-align:center;"'
          +' size="9" >'
          +' </li>'

        +'</ul>'
      +'</div>'

      +'<div>'
        +'<ul>'
          +'<li>'
            +'<label>Sales Tax :</label>'
            +'<input type="text" disabled'
              +' id="sales_tax_'+indek+'" '
              +' style="text-align:right;"'
              +' size="9" >'
          +'</li>'
          +'<li>'
            +'<label>Freight Account:</label>'
            +'<input type="text" '
              +' id="freight_account_id_'+indek+'" '
              +' size="9">'
              +'<button type="button" id="btn_find" '
              +' onclick="Invoices.account.getPaging(\''+indek+'\''
              +',\'freight_account_id_'+indek+'\',\''+indek+'\''
              +',\''+CLASS_COST_OF_SALES+'\')">'
              +'</button>'
          +'</li>'
          +'<li>'
            +'<label>Freight Amt:</label>'
            +'<input type="text"'
              +' id="freight_amount_'+indek+'" '
              +' onfocus="this.select();"'
              +' onchange="Invoices.calculateTotal(\''+indek+'\');"'
              +' style="text-align:right;"'
              +' size="9" >'
          +'</li>'
        +'</ul>'
      +'</div>'
      +'<div>'
        +'<ul>'
          +'<li><label>Receipts:</label>'
            +'<input type="text"'
            +' id="invoice_receipt_'+indek+'" disabled '
            +' style="text-align:right;"'
            +' size="9" >'
          +'</li>'
          
          +'<li><label>Invoice Total:</label>'
            +'<input type="text" '
            +' id="invoice_total_'+indek+'" disabled '
            +' style="text-align:right"'
            +' size="9" >'
          +'</li>'

          +'<li><label>Paid at Sale:'
            +'<button type="button"'
            +' id="btn_find"'
            +' onclick="PaidAtSale.show(\''+indek+'\')">'
            +'</button>'
            +'</label>'
            
            +'<input type="text" '
            +' id="invoice_paid_'+indek+'" disabled '
            +' style="text-align:right"'
            +' size="9" >'
          +'</li>'
          
          +'<li><label>Amount Due:</label>'
          +'<input type="text" '
            +' id="invoice_amount_due_'+indek+'" disabled'
            +' style="text-align:right"'
            +' size="9" >'
          +'</li>'
            
        +'</ul>'
      +'</div>'
    +'</div>'
      
    +'<details>'
      +'<summary>Receive Payment</summary>'
      +''
    +'</details>'
    +'</form>'
  +'</div>';
  
  content.html(indek,html);
  statusbar.ready(indek);
  
  document.getElementById('customer_id_'+indek).focus();
  document.getElementById('invoice_date_'+indek).value=tglSekarang();
  document.getElementById('invoice_date_fake_'+indek).value=tglWest(tglSekarang());
  
  if(metode==MODE_CREATE) {
    Invoices.setDefault(indek);
  }else{
    document.getElementById('quote_no_'+indek).disabled=true;
    document.getElementById('quote_btn_'+indek).disabled=true;
  }
}

Invoices.itemDetail=(indek)=>{
  var i=document.getElementById('item_detail_'+indek).selectedIndex;
  
//  alert(i);
  document.getElementById('detail_invoice_'+indek).style.display="none";
  document.getElementById('detail_so_'+indek).style.display="none";
  document.getElementById('detail_ticket_'+indek).style.display="none";
  document.getElementById('detail_reimbursable_'+indek).style.display="none";
  
  switch (i){
    case 0:
      document.getElementById('detail_invoice_'+indek).style.display="block"; 
      break;
    case 1:
      document.getElementById('detail_so_'+indek).style.display="block"; 
      break;
    case 2:
      document.getElementById('detail_ticket_'+indek).style.display="block"; 
      break;
    case 3:
      document.getElementById('detail_reimbursable_'+indek).style.display="block"; 
      break;
    default:
      alert('undefined')
  }
}

Invoices.setDefault=(indek)=>{
  var d=bingkai[indek].data_default;
//  var dt=JSON.parse(d.discount_terms);
  var dt=d.discount_terms;
  
  // clear value;
  bingkai[indek].discount_terms=dt;
  bingkai[indek].so_no="";
  bingkai[indek].invoice_no="";
  bingkai[indek].sum_item_amount=0
  bingkai[indek].sales_tax_rate=0;
  bingkai[indek].paid_at_sale={};
  
  // set new rows
  Invoices.setRows(indek,[]);
  Invoices.so.setRows(indek,[]);
  Invoices.ticket.setRows(indek,[]);
  
  // set default value
  setEV('ar_account_id_'+indek, d.ar_account_id);
  setEV('displayed_terms_'+indek, dt.displayed);
  setEV('sales_tax_rate_'+indek,0);
  ShipToCustomer.getDefault(indek);
}

Invoices.setRows=(indek,isi)=>{
  if(isi===undefined)isi=[];
  var invoice_total=0;
  var panjang=isi.length;
  var html=Invoices.tableHead(indek);
  var sum_item_inv=0;
  var sum_tax_inv=0;
  
  bingkai[indek].invoice_detail=isi;
  
  for (var i=0;i<panjang;i++){
    invoice_total+=isi[i].amount;
    
    html+='<tr>'
    +'<td>'+(i+1)+'</td>'
      
    +'<td align="center" style="margin:0;padding:0">'
      +'<input type="text"'
      +' id="quantity_'+i+'_'+indek+'"'
      +' value="'+isi[i].quantity+'"'
      +' onfocus="this.select()"'
      +' onchange="Invoices.setCell(\''+indek+'\''
      +',\'quantity_'+i+'_'+indek+'\')"'
      +' style="text-align:center"'
      +' size="3" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;">'
      +'<input type="text"'
      +' id="item_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].item_id+'"'
      +' onchange="Invoices.setCell(\''+indek+'\''
      +',\'item_id_'+i+'_'+indek+'\')"'
      +' onfocus="this.select()" '
      +' style="text-align:left"'
      +' size="9" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;">'
      +'<button type="button" id="btn_find" '
        +' onclick="Invoices.item.getPaging(\''+indek+'\''
        +',\'item_id_'+i+'_'+indek+'\''
        +',\''+i+'\');">'
      +'</button>'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="description_'+i+'_'+indek+'"'
      +' value="'+isi[i].description+'"'
      +' onfocus="this.select()"'
      +' onchange="Invoices.setCell(\''+indek+'\''
      +',\'description_'+i+'_'+indek+'\')"'
      +' style="text-align:left"'
      +' size="15" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text" '
      +' id="gl_account_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].gl_account_id+'"'
      +' onfocus="this.select()"'
      +' onchange="Invoices.setCell(\''+indek+'\''
      +',\'gl_account_id_'+i+'_'+indek+'\')"'
      +' style="text-align:center;"'
      +' size="8" >'
      +'</td>'
      
    +'<td align="center" style="padding:0;margin:0;">'
      +'<button type="button"'
      +' id="btn_find"'
      +' onclick="Invoices.account.getPaging(\''+indek+'\''
      +',\'gl_account_id_'+i+'_'+indek+'\''
      +',\''+i+'\''
      +',\''+CLASS_INCOME+'\');">'
      +'</button>'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="unit_price_'+i+'_'+indek+'"'
      +' value="'+isi[i].unit_price+'"'
      +' onfocus="this.select()"'
      +' onchange="Invoices.setCell(\''+indek+'\''
      +',\'unit_price_'+i+'_'+indek+'\')"'
      +' style="text-align:right"'
      +' size="6" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="tax_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].tax_id+'"'
      +' onfocus="this.select()"'
      +' onchange="Invoices.setCell(\''+indek+'\''
      +',\'tax_id_'+i+'_'+indek+'\')"'
      +' style="text-align:center;"'
      +' size="1" >'
      
      +'<input type="text" hidden'
      +' id="tax_calculate_'+i+'_'+indek+'" '
      +' value="'+isi[i].tax_calculate+'"'
      +' style="text-align:center;"'
      +' size="1" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="amount_'+i+'_'+indek+'"'
      +' value="'+Number(isi[i].amount)+'"'
      +' onfocus="this.select()"'
      +' onchange="Invoices.setCell(\''+indek+'\''
      +',\'amount_'+i+'_'+indek+'\')"'
      +' style="text-align:right"'
      +' size="9" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="job_phase_cost_'+i+'_'+indek+'"'
      +' value="'+isi[i].job_phase_cost+'"'
      +' onfocus="this.select()" '
      +' onchange="Invoices.setCell(\''+indek+'\''
      +',\'job_phase_cost_'+i+'_'+indek+'\',\'invoice\')" '
      +' style="text-align:center"'
      +' size="5" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;">'
      +'<button type="button"'
      +' id="btn_find"'
      +' onclick="Invoices.job.getPaging(\''+indek+'\''
      +',\'job_phase_cost_'+i+'_'+indek+'\''
      +',\''+i+'\');">'
      +'</button>'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;">'
      +'<button type="button"'
      +' id="btn_add"'
      +' onclick="Invoices.addRow(\''+indek+'\','+i+')" >'
      +'</button>'
      
      +'<button type="button"'
      +' id="btn_remove"'
      +' onclick="Invoices.removeRow(\''+indek+'\','+i+')" >'
      +'</button>'
    +'</td>'
    +'</tr>';
    
    sum_item_inv+=Number(isi[i].amount);

    if(String(isi[i].tax_id).length>0){
      if(Number(isi[i].tax_calculate)==1){
        sum_tax_inv+=Number(isi[i].amount);
      }
    }
  }
  html+=Invoices.tableFoot(indek);
  var budi=JSON.stringify(isi);
  
  document.getElementById('invoice_detail_'+indek).innerHTML=html;
  bingkai[indek].sum_item_inv=sum_item_inv;  
  bingkai[indek].sum_tax_inv=sum_tax_inv;  
  Invoices.calculateTotal(indek);
    
  if(panjang==0) Invoices.addRow(indek,0);
}

Invoices.tableHead=(indek)=>{
  return '<table border=0 style="width:100%;" >'
    +'<thead>'
    +'<tr>'
    +'<th colspan="2">Quantity</th>'
    +'<th colspan="2">Item ID</th>'
    +'<th>Description<i class="required">*</i></th>'
    +'<th colspan="2">G/L Account<i class="required">*</i></th>'
    +'<th>Unit Price</th>'
    +'<th>Tax</th>'
    +'<th>Amount<i class="required">*</i></th>'
    +'<th colspan="2">Job ID</th>'
    +'<th>Add/Rem</th>'
    +'</tr>'
    +'</thead>';
}

Invoices.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
    +'<td>&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

Invoices.calculateTotal=(indek)=>{
  // invoice
  var itemAmount=Number(bingkai[indek].sum_item_inv) || 0;//without tax;
  var taxAmount=Number(bingkai[indek].sum_tax_inv) || 0;//with tax;
  // sales_order
  var itemAmount_so=Number(bingkai[indek].sum_item_so) || 0;
  var taxAmount_so=Number(bingkai[indek].sum_tax_so) || 0;
  var paidAtSale=0; //Number(bingkai[indek].paid_at_sale.receipt_amount) || 0;
  
//  alert('paid_at_sale: '+paidAtSale);
  
  // ticket
  var itemAmount_ticket=Number(bingkai[indek].sum_item_ticket) || 0;// without tx;
  var taxAmount_ticket=Number(bingkai[indek].sum_tax_ticket) || 0;// with tx;
  // receipt
  var otherApplied=Number(bingkai[indek].other_applied) || 0;
  
//  alert('otherApplied: '+otherApplied);

  var taxRate=Number(bingkai[indek].sales_tax_rate) || 0;  
  var taxValue=Number(taxAmount+taxAmount_so+taxAmount_ticket)*Number(taxRate)/100;// tax only
  var freightValue=Number(getEV('freight_amount_'+indek)) || 0;
  var invoiceAmount=(itemAmount+itemAmount_so+itemAmount_ticket+taxValue+freightValue);// total
  var amountDue=invoiceAmount-paidAtSale-otherApplied;

  setEV('sales_tax_rate_'+indek,taxRate +' %');
  setEV('sales_tax_'+indek,taxValue);
  setEV('freight_amount_'+indek,freightValue );
  setEV('invoice_total_'+indek,invoiceAmount );
  setEV('invoice_amount_due_'+indek,amountDue );
  
  setiH('total_invoice_'+indek, ', ('+ribuan0(itemAmount)+')');
  setiH('total_so_'+indek, ', ('+ribuan0(itemAmount_so)+')');
  setiH('total_ticket_'+indek, ', ('+ribuan0(itemAmount_ticket)+')');
  

}

Invoices.addRow=(indek,baris)=>{
  Invoices.gl_account_id=bingkai[indek].data_default.gl_account_id;
  Invoices.grid.addRow(indek,baris,bingkai[indek].invoice_detail);
}

Invoices.newRow=(myArr)=>{
  myArr.push({
    'nomer':myArr.length+1,
    'quantity':0,
    'item_id':'',
    'description':'',
    'gl_account_id':Invoices.gl_account_id,
    'unit_price':0,
    'tax_id':'',
    'tax_calculate':0,
    'amount':0,
    'job_phase_cost':''
  });
}

Invoices.removeRow=(indek,baris)=>{
  Invoices.grid.removeRow(indek,baris,bingkai[indek].invoice_detail);
};

Invoices.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].invoice_detail;
  var baru = [];
  var isiEdit = {};
  var invoice_total=0;
  var sum_item_inv=0;
  var sum_tax_inv=0;

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
      Invoices.getItem(indek,i);
      
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
      Invoices.getItemTax(indek,i);
      
    }else if(id_kolom==('tax_calculate_'+i+'_'+indek)){
      isiEdit.tax_calculate=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else if(id_kolom==('amount_'+i+'_'+indek)){
      isiEdit.amount=getEV(id_kolom);
      if(isiEdit.quantity>0){
        isiEdit.unit_price=(isiEdit.amount/isiEdit.quantity);
      }
      baru.push(isiEdit);
      setEV('unit_price_'+i+'_'+indek,isiEdit.unit_price);
      
    }else if(id_kolom==('job_phase_cost_'+i+'_'+indek)){
      isiEdit.job_phase_cost=getEV(id_kolom);
      baru.push(isiEdit);

    }else{
      baru.push(isi[i]);
    }
    sum_item_inv+=Number(isi[i].amount);
    if(String(isi[i].tax_id).length>0){
      if(Number(isi[i].tax_calculate)==1){
        sum_tax_inv+=Number(isi[i].amount);
      }
    }
  }
  bingkai[indek].sum_item_inv=sum_item_inv;
  bingkai[indek].sum_tax_inv=sum_tax_inv;
  Invoices.calculateTotal(indek);
}

Invoices.so.setRows=(indek,isi)=>{
  if(isi===undefined){isi=[];}
  var panjang=isi.length;
  var html=Invoices.so.tableHead(indek);
  var sum_item_so=0;
  var sum_tax_so=0;
  
  bingkai[indek].so_detail=isi;
    
  for (var i=0;i<panjang;i++){
    html+='<tr>'
    //+'<td align="center">'+(i+1)+'</td>'
    +'<td align="center">'+isi[i].row_id+'</td>'

    +'<td align="center" style="padding:0;margin:0;">'
      +'<input type="text"'
      +' id="so_item_id_'+i+'_'+indek+'" disabled'
      +' value="'+isi[i].item_id+'"'
      +' style="text-align:left;"'
      +' size="9" >'
      +'</td>'

    +'<td align="center" style="margin:0;padding:0">'
      +'<input type="text"'
      +' id="so_remaining_'+i+'_'+indek+'" disabled'
      +' value="'+isi[i].remaining+'"'
      +' style="text-align:center;"'
      +' size="3" >'
      +'</td>'

    +'<td align="center" style="margin:0;padding:0">'
      +'<input type="text"'
      +' id="so_shipped_'+i+'_'+indek+'"'
      +' value="'+isi[i].shipped+'"'
      +' onfocus="this.select()"'
      +' onchange="Invoices.so.setCell(\''+indek+'\''
      +',\'so_shipped_'+i+'_'+indek+'\')"'
      +' style="text-align:center;"'
      +' size="3" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="so_description_'+i+'_'+indek+'"'
      +' value="'+isi[i].description+'"'
      +' style="text-align:left"'
      +' size="15" disabled hidden>'
      
      +'<input type="text" '
      +' id="so_description_edit_'+i+'_'+indek+'"'
      +' value="'+isi[i].description_edit+'"'
      +' onfocus="this.select()"'
      +' onchange="Invoices.so.setCell(\''+indek+'\''
      +',\'so_description_edit_'+i+'_'+indek+'\')"'
      +' >'
      +'</td>'
            
    +'<td align="center"'
      +' style="padding:0;margin:0;" >'
      +'<input type="text" '
      +' id="so_gl_account_id_'+i+'_'+indek+'" '
      +' value="'+isi[i].gl_account_id+'" '
      +' onfocus="this.select()"'
      +' onchange="Invoices.so.setCell(\''+indek+'\''
      +',\'so_gl_account_id_'+i+'_'+indek+'\')"'
      +' style="text-align:center"'
      +' size="8" >'
      +'</td>'
      
    +'<td><button type="button" '
      +' id="btn_find"'
      +' onclick="Invoices.account.getPaging(\''+indek+'\''
      +',\'so_gl_account_id_'+i+'_'+indek+'\''
      +',\''+i+'\''
      +',\''+CLASS_INCOME+'\');">'
      +'</button>'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="so_unit_price_'+i+'_'+indek+'"'
      +' value="'+isi[i].unit_price+'"'
      +' onfocus="this.select()"'
      +' onchange="Invoices.so.setCell(\''+indek+'\''
      +',\'so_unit_price_'+i+'_'+indek+'\')"'
      +' style="text-align:right"'
      +' size="6" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="so_tax_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].tax_id+'"'
      +' onfocus="this.select()"'
      +' onchange="Invoices.so.setCell(\''+indek+'\''
      +',\'so_tax_id_'+i+'_'+indek+'\')"'
      +' style="text-align:center"'
      +' size="1" >'
      
      +'<br>'

      +'<input type="text" hidden'
      +' id="so_tax_calculate_'+i+'_'+indek+'"'
      +' value="'+isi[i].tax_calculate+'"'
      +' style="text-align:center;"'
      +' size="1" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="so_amount_'+i+'_'+indek+'"'
      +' value="'+Number(isi[i].amount)+'"'
      +' onfocus="this.select()" '
      +' onchange="Invoices.so.setCell(\''+indek+'\''
      +',\'so_amount_'+i+'_'+indek+'\')"'
      +' style="text-align:right"'
      +' size="9" >'
      +'</td>'

    +'<td align="center"'
      +' style="padding:0;margin:0;">'
      +'<input type="text"'
      +' id="so_job_phase_cost_'+i+'_'+indek+'"'
      +' value="'+isi[i].job_phase_cost+'"'
      +' onfocus="this.select()"'
      +' onchange="Invoices.sosetCell(\''+indek+'\''
      +',\'so_job_phase_cost_'+i+'_'+indek+'\',\'so\')"'
      +' style="text-align:center"'
      +' size="5" >'
      +'</td>'
      
    +'<td><button type="button" id="btn_find"'
      +' onclick="Invoices.job.getPaging(\''+indek+'\''
      +',\'so_job_phase_cost_'+i+'_'+indek+'\''
      +',\''+i+'\');"></button>'
      +'</td>'

    +'</tr>';
    
    sum_item_so+=Number(isi[i].amount);
    
    if(String(isi[i].tax_id).length>0){
      if(Number(isi[i].tax_calculate)==1){
        sum_tax_so+=Number(isi[i].amount);
      }
    }
  }
  
  html+=Invoices.so.tableFoot(indek);
  var budi = JSON.stringify(isi);
  document.getElementById('so_detail_'+indek).innerHTML=html;
  
  bingkai[indek].sum_item_so=sum_item_so;
  bingkai[indek].sum_tax_so=sum_tax_so;
  Invoices.calculateTotal(indek);
    
  if(panjang==0){Invoices.so.addRow(indek,0);}
}

Invoices.so.tableHead=(indek)=>{
  return '<table style="width:100%;" >'
    +'<thead>'
    +'<tr>'
    +'<th colspan="2">Item</th>'
    +'<th>Remaining</th>'
    +'<th>Shipped</th>'
    +'<th>Description<i class="required">(*)</i></th>'
    +'<th colspan="2">G/L Account<i class="required">(*)</i></th>'
    +'<th>Unit Price</th>'
    +'<th>Tax ID</th>'
    +'<th>Amount<i class="required">(*)</i></th>'
    +'<th colspan="2">Job ID</th>'
    +'</tr>'
    +'</thead>';
}

Invoices.so.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
    +'<td>&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

Invoices.so.addRow=(indek,baris)=>{
  Invoices.gl_account_id=bingkai[indek].data_default.gl_account_id;
  Invoices.so.grid.addRow(indek,baris,bingkai[indek].so_detail);
}

Invoices.so.newRow=(myArr)=>{
  myArr.push({
    'row_id':myArr.length+1,
    'item_id':'',
    'remaining':0,
    'shipped':0,
    'description':'',
    'description_edit':'',
    'gl_account_id':Invoices.gl_account_id,
    'unit_price':0,
    'tax_id':0,
    'tax_calculate':0,
    'amount':0,
    'job_phase_cost':''
  });
}

Invoices.so.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].so_detail;
  var baru = [];
  var isiEdit = {};
  var so_total=0;
  var sum_item_so=0;
  var sum_tax_so=0;
    
  for (var i=0;i<isi.length; i++){
    
    isiEdit=isi[i];
    
    if(id_kolom==('so_item_id_'+i+'_'+indek)){
      isiEdit.item_id=getEV(id_kolom);
      baru.push(isiEdit);
      
//    }else if(id_kolom==('so_remaining_'+i+'_'+indek)){
//      isiEdit.remaining=getEV(id_kolom);
//      baru.push(isiEdit);
      
    }else if(id_kolom==('so_shipped_'+i+'_'+indek)){
      isiEdit.shipped=getEV(id_kolom);
      isiEdit.amount=(isiEdit.shipped*isiEdit.unit_price);
      baru.push(isiEdit);
      setEV('so_amount_'+i+'_'+indek,Number(isiEdit.amount));
      
    }else if(id_kolom==('so_description_edit_'+i+'_'+indek)){
      isiEdit.description_edit=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else if(id_kolom==('so_gl_account_id_'+i+'_'+indek)){
      isiEdit.gl_account_id=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
    
    }else if(id_kolom==('so_unit_price_'+i+'_'+indek)){  
      isiEdit.unit_price=getEV(id_kolom);
      baru.push(isiEdit);
      isiEdit.amount=(isiEdit.shipped*isiEdit.unit_price);
      setEV('so_amount_'+i+'_'+indek,Number(isiEdit.amount));
    
    }else if(id_kolom==('so_tax_id_'+i+'_'+indek)){    
      isiEdit.tax_id=getEV(id_kolom);
      baru.push(isiEdit);
      Invoices.so.getItemTax(indek,i);
    
    }else if(id_kolom==('so_tax_calculate_'+i+'_'+indek)){
      isiEdit.tax_calculate=getEV(id_kolom);
      baru.push(isiEdit);
    
    }else if(id_kolom==('so_amount_'+i+'_'+indek)){      
      isiEdit.amount=getEV(id_kolom);
      if(isiEdit.shipped>0){
        isiEdit.unit_price=(isiEdit.amount/isiEdit.shipped);
        setEV('so_unit_price_'+i+'_'+indek, isiEdit.unit_price);
      }
      baru.push(isiEdit);
      
    }else if(id_kolom==('so_job_phase_cost_'+i+'_'+indek)){
      isiEdit.job_phase_cost=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else{
      baru.push(isi[i]);
    }
    
    sum_item_so+=Number(isi[i].amount);
    
    if(String(isi[i].tax_id).length>0){
      if(Number(isi[i].tax_calculate)==1){
        sum_tax_so+=Number(isi[i].amount);
        // alert('loop: '+sum_tax_so+'/'+baru[i].item_tax_calculate);
      }
    }
  }
  
  bingkai[indek].sum_item_so=sum_item_so;
  bingkai[indek].sum_tax_so=sum_tax_so;
  Invoices.calculateTotal(indek);
}

Invoices.setCustomer=(indek,d)=>{
  setEV('customer_id_'+indek, d.customer_id);
  Invoices.getCustomer(indek,()=>{});
}

Invoices.getCustomer=(indek,callback)=>{
  Invoices.customer.getOne(indek,
    getEV('customer_id_'+indek),
  (paket)=>{
    setEV('sales_tax_id_'+indek,'');
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      var address=JSON.parse(d.address);
      var discount_terms=JSON.parse(d.discount_terms);
      var bill_address=address[0];
      var ship_address=address[1];
      
      setEV('customer_name_'+indek, d.name);
      setEV('customer_address_'+indek, toAddress(bill_address));
      setEV('customer_po_'+indek, d.customer_po);
      setEV('sales_tax_id_'+indek, bill_address.sales_tax_id);      
      setEV('ship_id_'+indek, d.ship_id);
      setEV('ship_address_'+indek, toAddress(ship_address));
      setEV('sales_rep_id_'+indek, d.sales_rep_id);
      setEV('displayed_terms_'+indek, discount_terms.displayed);

      //bingkai[indek].paid_at_sale.customer_id=d.customer_id;
      //bingkai[indek].paid_at_sale.customer_address=getEV('customer_address_'+indek);
      bingkai[indek].ship_address= ship_address;
      bingkai[indek].customer_address= address;
      bingkai[indek].gl_account_id= d.sales_account_id;
      bingkai[indek].discount_terms=discount_terms;
    }
    Invoices.getSalesTax(indek);
    Invoices.so.setRows(indek,[]);

    // reset so-no
    Invoices.getSO(indek,"",()=>{
      return callback();
    });
  });
}

Invoices.setSalesTax=(indek,d)=>{
  setEV('sales_tax_id_'+indek,d.sales_tax_id);
  //document.getElementById('sales_tax_rate_'+indek).value=data.sales_tax_total+'%';
  bingkai[indek].sales_tax_rate=d.rate;
  //Invoices.calculateTotal(indek);
  Invoices.getSalesTax(indek);
}

Invoices.getSalesTax=(indek)=>{
  Invoices.salesTax.getOne(indek,
  getEV('sales_tax_id_'+indek),
  (paket)=>{
    bingkai[indek].sales_tax_rate=0;
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      bingkai[indek].sales_tax_rate=d.rate;
    };
    // document.getElementById('sales_tax_rate_'+indek).value=jendela[indek].sales_tax_rate+' %';
    // Invoices.calculateTotal(indek);
    // recalculate dengan rate baru;
    // alert(bingkai[indek].sales_tax_rate);
    Invoices.setRows(indek, bingkai[indek].invoice_detail);
    Invoices.so.setRows(indek, bingkai[indek].so_detail);
  });
}

Invoices.getSO=(indek,so_no,eow)=>{
  // remove list
  var x=document.getElementById('so_no_'+indek);  
  while(x.options.length >0) x.remove(0);
  
  var option3=document.createElement("option");
  option3.text=Invoices.blank;
  document.getElementById('so_no_'+indek).add(option3);
  
  db.run(indek,{
    query:"SELECT so_no"
      +" FROM so_invoice_sum"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+getEV('customer_id_'+indek)+"'"
      +" AND amount != 0"
      +" GROUP BY so_no"
  },(paket)=>{
    if(so_no!=''){
      var option2=document.createElement("option");
      option2.text=so_no;
      document.getElementById('so_no_'+indek).add(option2);      
      setEV('so_no_'+indek, so_no);
    }
    if(paket.err.id==0 && paket.count>0){
      var d=objectMany(paket.fields,paket.data);
      for (var x in d){
        if(d[x].so_no!=so_no){
          var option=document.createElement("option");
          option.text=d[x].so_no;
          document.getElementById('so_no_'+indek).add(option);
        }
      }
    }

    // default condition
/*    
    document.getElementById('detail_so_'+indek).open=false;
    document.getElementById('detail_invoice_'+indek).open=true;

    if(so_no!=''){// edit condition
      document.getElementById('detail_so_'+indek).open=true;
      document.getElementById('detail_invoice_'+indek).open=false;
    }
    
    if(bingkai[indek].invoice_no==""){// new condition
      if(paket.count>0){
        document.getElementById('detail_so_'+indek).open=true;
        document.getElementById('detail_invoice_'+indek).open=false;
      }
    }
*/    
    return eow();
  });
}

Invoices.getSOItem=(indek)=>{
  if(getEV('so_no_'+indek)==Invoices.blank){
    Invoices.so.setRows(indek,[]);
    return;
  }

  db.run(indek,{
    query:"SELECT "

      //--header
      +" customer_po,"
      +" ship_id,"
      +" discount_terms,"
      +" so_no,"
      +" so_date,"
      
      //--detail
      +" row_id,"
      +" item_id,"
      +" quantity AS remaining,"
      +" quantity AS shipped,"
      +" description,"
      +" description AS description_edit,"
      +" gl_account_id,"
      +" unit_price,"
      +" tax_id,"
      +" tax_calculate,"
      +" amount,"
      +" job_phase_cost,"
      
      //--footer
      +" ar_account_id,"
      +" sales_tax_id,"
      +" freight_amount"
      
      +" FROM so_invoice_sum"
      
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+getEV('customer_id_'+indek)+"'"
      +" AND so_no='"+getEV('so_no_'+indek)+"'"
      +" AND amount != 0"
  },(paket)=>{
    if(paket.err.id==0 ){
      if(paket.count>0){
        var d=objectMany(paket.fields,paket.data);
        var d0=d[0];
        var dt=JSON.parse(d0.discount_terms);
        
        setEV('customer_po_'+indek, d0.customer_po);
        setEV('ship_id_'+indek, d0.ship_id);
        setEV('displayed_terms_'+indek, dt.displayed);
        setEV('ar_account_id_'+indek, d0.ar_account_id);
        setEV('sales_tax_id_'+indek, d0.sales_tax_id);
        setEV('freight_amount_'+indek, d0.freight_amount);
        
        bingkai[indek].discount_terms=dt;
        Invoices.getSalesTax(indek);
        Invoices.so.setRows(indek, d)
      }else{
        Invoices.so.setRows(indek,[]);
      }
      
      if(paket.count==0){
        if(getEV('so_no_'+indek)==bingkai[indek].so_no){
          Invoices.formUpdate(indek,bingkai[indek].invoice_no);
        }
      }
    }
  });
}

Invoices.setShipAddress=(indek)=>{
  setEV('ship_address_'+indek, toAddress(bingkai[indek].ship_address));
}

Invoices.setShipMethod=(indek,d)=>{
  setEV('ship_id_'+indek,d.ship_id);
}

Invoices.showTerms=(indek)=>{
  console.log(bingkai[indek].discount_terms);
  bingkai[indek].discount_terms.date=getEV('invoice_date_'+indek);
  bingkai[indek].discount_terms.amount=getEV('invoice_total_'+indek);
  DiscountTerms.show(indek);
}

Invoices.setTerms=(indek)=>{
  setEV('displayed_terms_'+indek, 
    bingkai[indek].discount_terms.displayed);
}

Invoices.setSalesRep=(indek,d)=>{
  setEV('sales_rep_id_'+indek,d.sales_rep_id);
}

Invoices.setItem=(indek,d)=>{  
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.item_id);
  Invoices.setCell(indek,id_kolom);
}

Invoices.getItem=(indek,baris)=>{
  Invoices.item.getOne(indek,
  getEV('item_id_'+baris+'_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('item_id_'+baris+'_'+indek, d.item_id);
      setEV('description_'+baris+'_'+indek, d.name_for_sales);
      setEV('gl_account_id_'+baris+'_'+indek, d.sales_account_id);
      setEV('unit_price_'+baris+'_'+indek, d.price);
      setEV('tax_id_'+baris+'_'+indek, d.tax_id);
      setEV('tax_calculate_'+baris+'_'+indek, d.calculate);

      Invoices.setCell(indek,'description_'+baris+'_'+indek);
      Invoices.setCell(indek,'gl_account_id_'+baris+'_'+indek);
      Invoices.setCell(indek,'unit_price_'+baris+'_'+indek);
      Invoices.setCell(indek,'tax_id_'+baris+'_'+indek);
      Invoices.setCell(indek,'tax_calculate_'+baris+'_'+indek);
    }
  });
}

Invoices.getItemTax=(indek,baris)=>{
  setEV('tax_calculate_'+baris+'_'+indek,0);
  Invoices.setCell(indek,'tax_calculate_'+baris+'_'+indek);

  Invoices.itemTax.getOne(indek,
    getEV('tax_id_'+baris+'_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('tax_calculate_'+baris+'_'+indek,d.calculate);
      Invoices.setCell(indek,'tax_calculate_'+baris+'_'+indek);
    }
  })
}

Invoices.so.getItemTax=(indek,baris)=>{;
  setEV('so_tax_calculate_'+baris+'_'+indek,0);
  Invoices.so.setCell(indek,'so_tax_calculate_'+baris+'_'+indek);
        
  Invoices.itemTax.getOne(indek, 
    getEV('so_tax_id_'+baris+'_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      //var d=paket.data;
      var d=objectOne(paket.fields,paket.data);
      setEV('so_tax_calculate_'+baris+'_'+indek,d.calculate);
      Invoices.so.setCell(indek,'so_tax_calculate_'+baris+'_'+indek);
    }
  })
}

Invoices.setAccount=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var baris=bingkai[indek].baris;

  setEV(id_kolom,d.account_id);

  switch(id_kolom){
    case "ar_account_id_"+indek:
      setEV('ar_account_id_'+indek,d.account_id);
      break;
    case "gl_account_id_"+baris+'_'+indek:
      Invoices.setCell(indek,id_kolom);
      break;
    case "so_gl_account_id_"+baris+'_'+indek:
      Invoices.so.setCell(indek,id_kolom);
      break;
    case "ticket_gl_account_id_"+baris+'_'+indek:
      Invoices.ticket.setCell(indek,id_kolom);
      break;
    case "freight_account_id_"+indek:
      setEV('freight_account_id_'+indek,d.account_id);
      break;
    default:
      alert('['+id_kolom+'] undefined.');
  }
}

Invoices.setJob=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var baris=bingkai[indek].baris;

  setEV(id_kolom, d);
  
  switch (id_kolom){
    case "job_phase_cost_"+baris+'_'+indek:
      Invoices.setCell(indek,id_kolom);
      break;
    case "so_job_phase_cost_"+baris+'_'+indek:
      Invoices.so.setCell(indek,id_kolom);
      break;
    default:
      alert('['+id_kolom+'] undefined');
  }
}

Invoices.setReceipt=(indek)=>{
  setEV('invoice_paid_'+indek, 
    Number(bingkai[indek].paid_at_sale.receipt_amount));
  Invoices.calculateTotal(indek);
}

Invoices.createExecute=(indek)=>{
  var so_no=getEV("so_no_"+indek);

  if(so_no==Invoices.blank){
    so_no='';
    bingkai[indek].so_detail=[];
  }
  
  var ship_address=JSON.stringify(bingkai[indek].ship_address);
  var discount_terms=JSON.stringify(bingkai[indek].discount_terms);
  var invoice_detail=JSON.stringify(bingkai[indek].invoice_detail);
  var so_detail=JSON.stringify(bingkai[indek].so_detail);
  var paid_at_sale=JSON.stringify(bingkai[indek].paid_at_sale);
  var some_note=JSON.stringify(
    ["Add some note for this invoices...","new-note"]
  );
  var ticket_detail=JSON.stringify(bingkai[indek].ticket_detail);

  db.execute(indek,{
    query:"INSERT INTO invoices"
    +"(admin_name,company_id,quote_no,customer_id"
    +",invoice_no,date,ship_address"
    +",customer_po,ship_id,ship_date,discount_terms,sales_rep_id"
    +",detail,so_no,so_detail,ticket_detail"
    +",ar_account_id,sales_tax_id"
    +",freight_account_id,freight_amount,paid_at_sale"
    +",note)"
    +" VALUES"
    +"('"+bingkai[indek].admin.name+"'"
    +",'"+bingkai[indek].company.id+"'"
    +",'"+getEV("quote_no_"+indek)+"'"
    +",'"+getEV("customer_id_"+indek)+"'"
    +",'"+getEV("invoice_no_"+indek)+"'"
    +",'"+getEV("invoice_date_"+indek)+"'"
    +",'"+ship_address+"'"
    +",'"+getEV("customer_po_"+indek)+"'"
    +",'"+getEV("ship_id_"+indek)+"'"
    +",'"+getEV("ship_date_"+indek)+"'"
    +",'"+discount_terms+"'"
    +",'"+getEV("sales_rep_id_"+indek)+"'"
    +",'"+invoice_detail+"'"
    +",'"+so_no+"'"
    +",'"+so_detail+"'"
    +",'"+ticket_detail+"'"
    +",'"+getEV("ar_account_id_"+indek)+"'"
    +",'"+getEV("sales_tax_id_"+indek)+"'"
    +",'"+getEV("freight_account_id_"+indek)+"'"
    +",'"+getEV("freight_amount_"+indek)+"'"
    +",'"+paid_at_sale+"'"
    +",'"+some_note+"'"
    +")"
  });
}

Invoices.readOne=(indek,callback)=>{
  Invoices.getStatus(indek,()=>{
    db.execute(indek,{
      query:"SELECT * "
        +" FROM invoices"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND customer_id='"+bingkai[indek].customer_id+"'"
        +" AND invoice_no='"+bingkai[indek].invoice_no+"'"

    },(paket)=>{
      if (paket.count>0) {
        var d=objectOne(paket.fields,paket.data);
        var address=JSON.parse(d.customer_address);
        var ship_address=JSON.parse(d.ship_address);
        var discount_terms=JSON.parse(d.discount_terms);
        var paid_at_sale=JSON.parse(d.paid_at_sale);
        var invoice_detail=JSON.parse(d.detail);
        var so_detail=JSON.parse(d.so_detail);
        
        setEV('quote_no_'+indek, d.quote_no);
        setEV('customer_id_'+indek, d.customer_id);
        setEV('customer_name_'+indek, d.customer_name);
        setEV('customer_address_'+indek, toAddress(address));

        setEV('invoice_no_'+indek, d.invoice_no);
        setEV('invoice_date_'+indek, d.date);
        setEV('invoice_date_fake_'+indek, tglWest(d.date));
        setEV('invoice_status_'+indek, 0);
        
        setEV('ship_address_'+indek, toAddress(ship_address));
        setEV('customer_po_'+indek, d.customer_po);
        setEV('ship_id_'+indek, d.ship_id);
        setEV('ship_date_'+indek, d.ship_date);
        setEV('ship_date_fake_'+indek, tglWest(d.ship_date));
        setEV('displayed_terms_'+indek, discount_terms.displayed);
        setEV('sales_rep_id_'+indek, d.sales_rep_id);

        Invoices.setRows(indek, invoice_detail) ;

        if(d.so_no!=""){
          var option=document.createElement("option");
          option.text=d.so_no;
          document.getElementById('so_no_'+indek).add(option);      
          setEV('so_no_'+indek, d.so_no);
        }
        Invoices.so.setRows(indek, so_detail);
        Invoices.ticket.setRows(indek, JSON.parse(d.ticket_detail) );

        setEV('ar_account_id_'+indek, d.ar_account_id);
        setEV('sales_tax_id_'+indek, d.sales_tax_id);
        setEV('sales_tax_rate_'+indek, d.sales_tax_rate+' %');
        
        setEV('sales_tax_'+indek, d.tax_amount);
        setEV('freight_account_id_'+indek, d.freight_account_id);
        setEV('freight_amount_'+indek, d.freight_amount);
        setEV('invoice_total_'+indek, d.total);
            
        if(Object.keys(paid_at_sale).length==0){
          setEV('invoice_paid_'+indek, 0);
        }else{
          setEV('invoice_paid_'+indek, paid_at_sale.receipt_amount);
        }

        // don't forget, simpan di lokal storage;
        bingkai[indek].ship_address= ship_address;
        bingkai[indek].discount_terms= discount_terms;
        bingkai[indek].sales_tax_rate= d.sales_tax_rate;
        bingkai[indek].so_no= d.so_no;
        bingkai[indek].paid_at_sale= paid_at_sale;
        
        // load so
        Invoices.getSO(indek,d.so_no,()=>{
          Invoices.calculateTotal(indek);
          Invoices.getAddress(indek);
          message.none(indek);
          return callback();
        });
        
        Invoices.getItemMode(indek,d);
      }else{
        toolbar.back(indek,()=>{
          Invoices.form.modePaging(indek);
        });
      }
    });
  });
}

Invoices.getStatus=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT status,amount"
      +" FROM invoice_status"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"'"
      +" AND invoice_no='"+bingkai[indek].invoice_no+"'"
  },(p)=>{
    if(p.count>0){
      var d=objectOne(p.fields,p.data);
      setiH("invoice_status_"+indek, array_invoice_status[d.status]);
      setEV("invoice_receipt_"+indek,d.amount);
      bingkai[indek].other_applied=d.amount;
    }
    return callback();
  });
}

Invoices.getItemMode=(indek,d)=>{

  var inv_itm=JSON.parse(d.detail);
  var so_itm=JSON.parse(d.so_detail);
  var i;
  var t=0;
  var select_itm=0;
  
  for(i=0;i<inv_itm.length;i++){
    t+=inv_itm[i].amount;
  }
  
  if(t>0)  select_itm=0;
  
  t=0;
  for(i=0;i<so_itm.length;i++){
    t+=so_itm[i].amount;
  }

  if(t>0)  select_itm=1;
  
  document.getElementById('item_detail_'+indek).selectedIndex=select_itm;
  Invoices.itemDetail(indek);
}

Invoices.getAddress=(indek)=>{
  bingkai[indek].customer_address=[];
  Invoices.customer.getOne(indek,
  getEV('customer_id_'+indek),
  (paket)=>{
    bingkai[indek].customer_address=[];
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].customer_address=paket.data.customer_address;
    }
  });
}

Invoices.formUpdate=(indek,customer_id,invoice_no)=>{
  bingkai[indek].customer_id=customer_id;
  bingkai[indek].invoice_no=invoice_no;
  Invoices.form.modeUpdate(indek);
}

Invoices.updateExecute=(indek)=>{
  var so_no=getEV("so_no_"+indek);
  if(so_no==Invoices.blank){
    so_no='';
    bingkai[indek].so_detail=[];
  }
  
  var ship_address=JSON.stringify(bingkai[indek].ship_address);
  var discount_terms=JSON.stringify(bingkai[indek].discount_terms);
  var invoice_detail=JSON.stringify(bingkai[indek].invoice_detail);
  var so_detail=JSON.stringify(bingkai[indek].so_detail);
  var paid_at_sale=JSON.stringify(bingkai[indek].paid_at_sale);
  var some_note=JSON.stringify(
    ["Add some note for this invoices...","edit-note"]
  );
  var ticket_detail=JSON.stringify(bingkai[indek].ticket_detail);

  db.execute(indek,{
    query:"UPDATE invoices"
      +" SET customer_id='"+getEV("customer_id_"+indek)+"',"
      +" invoice_no='"+getEV("invoice_no_"+indek)+"',"
      +" date='"+getEV("invoice_date_"+indek)+"',"
      +" ship_address='"+ship_address+"',"
      +" customer_po='"+getEV("customer_po_"+indek)+"',"
      +" ship_id='"+getEV("ship_id_"+indek)+"',"
      +" ship_date='"+getEV("ship_date_"+indek)+"',"
      +" discount_terms='"+discount_terms+"',"
      +" sales_rep_id='"+getEV("sales_rep_id_"+indek)+"',"
      +" detail='"+invoice_detail+"',"
      +" so_no='"+so_no+"',"
      +" so_detail='"+so_detail+"',"
      +" ticket_detail='"+ticket_detail+"',"
      +" ar_account_id='"+getEV("ar_account_id_"+indek)+"',"
      +" sales_tax_id='"+getEV("sales_tax_id_"+indek)+"',"
      +" freight_account_id='"+getEV("freight_account_id_"+indek)+"',"
      +" freight_amount='"+getEV("freight_amount_"+indek)+"',"
      +" paid_at_sale='"+paid_at_sale+"',"
      +" note='"+some_note+"'"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"'"
      +" AND invoice_no='"+bingkai[indek].invoice_no+"'"
  },(p)=>{
    if(p.err.id==0){
      Invoices.deadPath(indek);
      bingkai[indek].customer_id=getEV('customer_id_'+indek);
      bingkai[indek].Invoice_no=getEV('invoice_no_'+indek);
    }
  });
}

Invoices.formDelete=(indek,customer_id,invoice_no)=>{
  bingkai[indek].customer_id=customer_id;
  bingkai[indek].invoice_no=invoice_no;
  Invoices.form.modeDelete(indek);
}

Invoices.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM invoices"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"'"
      +" AND invoice_no='"+bingkai[indek].invoice_no+"'"
  },(p)=>{
    if(p.err.id==0) Invoices.deadPath(indek);
  });
}

Invoices.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM invoices"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND invoice_no LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR customer_name LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR date LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR customer_id LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Invoices.search=(indek)=>{
  Invoices.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT invoice_no,date,total,customer_name,customer_id,"
        +" user_name,date_modified "
        +" FROM invoices"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND invoice_no LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR customer_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR date LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR customer_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Invoices.readShow(indek);
    });
  });
}

Invoices.exportExecute=(indek)=>{
  var table_name=Invoices.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

Invoices.importExecute=(indek)=>{//proses import dengan sequential;
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;
  var i=0;
  var jok=0,jerr=0;

  document.getElementById('btn_import_all_'+indek).disabled=true;

  d.sort(sortByDate);
  
  prosess(i,()=>{});

  function prosess(i2,callback){
    db.run(indek,{
      query:"INSERT INTO invoices"
        +"(admin_name,company_id,quote_no,customer_id"
        +",invoice_no,date,ship_address"
        +",customer_po,ship_id,ship_date,discount_terms,sales_rep_id"
        +",detail,so_no,so_detail,ticket_detail"
        +",ar_account_id,sales_tax_id"
        +",freight_account_id,freight_amount,paid_at_sale"
        +",note)"
        +" VALUES"
        +"('"+bingkai[indek].admin.name+"'"
        +",'"+bingkai[indek].company.id+"'"
//        +",''"
        +",'"+d[i2][1]+"'" // quote_no
        +",'"+d[i2][2]+"'" // customer_id
        +",'"+d[i2][3]+"'" // invoice_no
        +",'"+d[i2][4]+"'" // date
        +",'"+d[i2][5]+"'" // ship_address
        +",'"+d[i2][6]+"'" // customer_po
        +",'"+d[i2][7]+"'" // ship_id
        +",'"+d[i2][8]+"'" // ship_date 
        +",'"+d[i2][9]+"'" // discount_terms
        +",'"+d[i2][10]+"'" // sales_rep_id
        +",'"+d[i2][11]+"'" // detail
        +",'"+d[i2][12]+"'" // so_no
        +",'"+d[i2][13]+"'" // so_detail
        +",'"+d[i2][14]+"'" // ticket_detail
        +",'"+d[i2][15]+"'" // ar_account_id 
        +",'"+d[i2][16]+"'" // sales_tax_id 
        +",'"+d[i2][17]+"'" // freight_account_id
        +",'"+d[i2][18]+"'" // freight_amount
        +",'"+d[i2][19]+"'" // paid_at_sale
        +",'"+d[i2][20]+"'" // note
        +")"
    },(paket)=>{
      paket.err.id==0?jok++:jerr++;
      n++;
      m='['+n+'] '+db.error(paket)+'..'+d[i2][2]+', '+d[i2][3]+'<br>'+m;
      progressBar2(indek,n,j,m,jok,jerr);
      
      i2++;
      if(i2<j){
        prosess(i2,callback);// next rows;
      }
    });
  }

  function sortByDate(a,b){ // sort multidimensi;
    if(a[4] === b[4]){
      return 0;
    }
    else{
      if(a[4] < b[4]) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
}

Invoices.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT customer_id,invoice_no,date,total,customer_name,"
      +" user_name,date_modified"
      +" FROM invoices"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      //+" ORDER BY date DESC"
      +" ORDER BY date,invoice_no"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Invoices.selectShow(indek);
  });
}

Invoices.selectShow=(indek)=>{
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
    +'<th colspan="2">Number</th>'
    +'<th>Date</th>'
    +'<th>Status</th>'
    +'<th>Amount</th>'
    +'<th>Customer Name</th>'
    +'<th>Owner</th>'
    +'<th colspan="2">Modified</th>'
  +'</tr>';

  if (p.err.id===0){
    var x;
    for (x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'
          +'<input type="checkbox"'
          +' id="checked_'+x+'_'+indek+'"'
          +' name="checked_'+indek+'" >'
        +'</td>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].invoice_no+'</td>'
        +'<td align="center">'+tglEast(d[x].date)+'</td>'
        +'<td align="left">'+array_invoice_status[0]+'</td>'
        +'<td align="right">'+d[x].total+'</td>'
        +'<td align="left">'+xHTML(d[x].customer_name)+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'+n+'</td>'
        +'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

Invoices.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM invoices"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND customer_id='"+d[i].customer_id+"'"
          +" AND invoice_no='"+d[i].invoice_no+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

Invoices.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM invoices"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+getEV('customer_id_'+indek)+"'"
      +" AND invoice_no='"+getEV('invoice_no_'+indek)+"'"
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

Invoices.duplicate=(indek)=>{
  var id='copy_of '+getEV('invoice_no_'+indek);
  setEV('invoice_no_'+indek,id);
  focus('invoice_no_'+indek);
}

Invoices.deadPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Invoices.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Invoices.properties(indek);})
  }
}


Invoices.ticket.setRows=(indek,isi)=>{
  if(isi===undefined)isi=[];
  var panjang=isi.length;
  var html=Invoices.ticket.tableHead(indek);
  var i=0;
  var sum_item_ticket=0;
  var sum_tax_ticket=0;

  bingkai[indek].ticket_detail=isi;

  for(i=0;i<isi.length;i++){
    
    html+='<tr>'

    +'<td align="center" style="margin:0;padding:0">'
      +'<input type="text" disabled'
        +' id="ticket_no_'+i+'_'+indek+'"'
        +' value="'+isi[i].ticket_no+'"'
        +' style="text-align:center"'
        +' size="10" >'
    +'</td>'

    +'<td align="center" style="padding:0;margin:0;">'
      +'<button type="button" id="btn_find" '
        +' onclick="Invoices.timeExpense.getPaging(\''+indek+'\''
        +',\'ticket_no_'+i+'_'+indek+'\''
        +',\''+i+'\');">'
      +'</button>'
    +'</td>'

    +'<td align="center" style="margin:0;padding:0">'
      +'<input type="text" disabled'
        +' id="ticket_date_'+i+'_'+indek+'"'
        +' value="'+isi[i].ticket_date+'"'
        +' style="text-align:center"'
        +' size="10" >'
    +'</td>'

    +'<td align="center" style="padding:0;margin:0;">'
      +'<input type="text" disabled'
      +' id="ticket_item_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].item_id+'"'
      +' style="text-align:left"'
      +' size="12" >'
    +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text" disabled'
      +' id="ticket_description_'+i+'_'+indek+'"'
      +' value="'+isi[i].description+'"'
      +' style="text-align:left"'
      +' size="15" >'
    +'</td>'
    
    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text" '
      +' id="ticket_gl_account_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].gl_account_id+'"'
      +' onfocus="this.select()"'
      +' onchange="Invoices.ticket.setCell(\''+indek+'\''
      +',\'ticket_gl_account_id_'+i+'_'+indek+'\')"'
      +' style="text-align:center;"'
      +' size="8" >'
    +'</td>'
      
    +'<td align="center" style="padding:0;margin:0;">'
      +'<button type="button"'
      +' id="btn_find"'
      +' onclick="Invoices.account.getPaging(\''+indek+'\''
      +',\'ticket_gl_account_id_'+i+'_'+indek+'\''
      +',\''+i+'\''
      +',\''+CLASS_INCOME+'\');">'
      +'</button>'
    +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="ticket_tax_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].tax_id+'"'
      +' onfocus="this.select()"'
      +' onchange="Invoices.ticket.setCell(\''+indek+'\''
      +',\'ticket_tax_id_'+i+'_'+indek+'\')"'
      +' style="text-align:center;"'
      +' size="1" >'
      
      +'<input type="text" '
      +' id="ticket_tax_calculate_'+i+'_'+indek+'" '
      +' value="'+isi[i].tax_calculate+'"'
      +' style="text-align:center;"'
      +' size="1" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="ticket_amount_'+i+'_'+indek+'"'
      +' value="'+Number(isi[i].amount)+'"'
      +' onfocus="this.select()"'
      +' onchange="Invoices.ticket.setCell(\''+indek+'\''
      +',\'ticket_amount_'+i+'_'+indek+'\')"'
      +' style="text-align:right"'
      +' size="9" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text" disabled'
      +' id="ticket_job_phase_cost_'+i+'_'+indek+'"'
      +' value="'+isi[i].job_phase_cost+'"'
      +' style="text-align:center"'
      +' size="5" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;">'
      +'<button type="button"'
        +' id="btn_add"'
        +' onclick="Invoices.ticket.addRow(\''+indek+'\','+i+')" >'
      +'</button>'
      
      +'<button type="button"'
        +' id="btn_remove"'
        +' onclick="Invoices.ticket.removeRow(\''+indek+'\','+i+')" >'
      +'</button>'
    +'</td>'
    +'</tr>';
    
    sum_item_ticket+=Number(isi[i].amount);

    if(String(isi[i].tax_id).length>0){
      if(Number(isi[i].tax_calculate)==1){
        sum_tax_ticket+=Number(isi[i].amount);
      }
    }
  }
  html+=Invoices.ticket.tableFoot(indek);
  var budi=JSON.stringify(isi);
  
  document.getElementById('ticket_detail_'+indek).innerHTML=html;
  bingkai[indek].sum_item_ticket=sum_item_ticket;  
  bingkai[indek].sum_tax_ticket=sum_tax_ticket;  
  Invoices.calculateTotal(indek);
    
  if(isi.length==0) Invoices.ticket.addRow(indek,0);
}

Invoices.ticket.tableHead=(indek)=>{
  return '<table border=0 style="width:100%;" >'
    +'<thead>'
      +'<tr>'
        +'<th colspan="2">Ticket No.</th>'
        +'<th>Date</th>'
        +'<th>Item</th>'
        +'<th>Description<i class="required">*</i></th>'
        +'<th colspan="2">GL Account ID</th>'
        +'<th>Tax</th>'
        +'<th>Amount<i class="required">*</i></th>'
        +'<th>Job ID</th>'
        +'<th>Add/Rem</th>'
      +'</tr>'
    +'</thead>';
}

Invoices.ticket.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
      +'<td>&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
  +'</table>';
}

Invoices.ticket.addRow=(indek,baris)=>{
  Invoices.gl_account_id=bingkai[indek].data_default.gl_account_id;
  Invoices.ticket.grid.addRow(indek,baris,bingkai[indek].ticket_detail);
}

Invoices.ticket.newRow=(myArr)=>{
  myArr.push({
    'ticket_no': '',   //*
    'ticket_date': '',
    'item_id': '',     //*
    'description': '', //*
    'gl_account_id': Invoices.gl_account_id,
    'tax_id': '',
    'tax_calculate': 0,
    'amount': 0,
    'job_phase_cost': ''
  });
}

Invoices.ticket.removeRow=(indek,baris)=>{
  Invoices.ticket.grid.removeRow(indek,baris,bingkai[indek].ticket_detail);
};

Invoices.setTicket=(indek,d)=>{
  var kolom=bingkai[indek].kolom;
  var baris=bingkai[indek].baris;

  setEV('ticket_no_'+baris+'_'+indek, d.ticket_no);
  setEV('ticket_item_id_'+baris+'_'+indek, d.item_id);
  setEV('ticket_description_'+baris+'_'+indek, d.description);

  Invoices.getTicket(indek,baris,()=>{});
}

Invoices.getTicket=(indek,baris)=>{
  var customer_id=getEV('customer_id_'+indek);
  var ticket_no=getEV('ticket_no_'+baris+'_'+indek);
  var item_id=getEV('ticket_item_id_'+baris+'_'+indek);
  var description=getEV('ticket_description_'+baris+'_'+indek);
  
  Invoices.timeExpense.getOne(
    indek,customer_id,ticket_no,item_id,description,
    (p)=>{
      if(p.count>0){
        var d=objectOne(p.fields,p.data);
        setEV('ticket_no_'+baris+'_'+indek, d.ticket_no);
        setEV('ticket_date_'+baris+'_'+indek, d.ticket_date );
        
        setEV('ticket_item_id_'+baris+'_'+indek, d.item_id);
        setEV('ticket_description_'+baris+'_'+indek, d.description);
        setEV('ticket_gl_account_id_'+baris+'_'+indek, d.gl_account_id);
        setEV('ticket_tax_id_'+baris+'_'+indek, d.tax_id);
        setEV('ticket_amount_'+baris+'_'+indek, d.remaining);
        setEV('ticket_job_phase_cost_'+baris+'_'+indek, d.job_phase_cost);
        
        
        Invoices.ticket.setCell(indek,'ticket_no_'+baris+'_'+indek);
        Invoices.ticket.setCell(indek,'ticket_date_'+baris+'_'+indek);
        Invoices.ticket.setCell(indek,'ticket_item_id_'+baris+'_'+indek);
        Invoices.ticket.setCell(indek,'ticket_description_'+baris+'_'+indek);
        Invoices.ticket.setCell(indek,'ticket_gl_account_id_'+baris+'_'+indek);
        Invoices.ticket.setCell(indek,'ticket_tax_id_'+baris+'_'+indek);
        Invoices.ticket.setCell(indek,'ticket_amount_'+baris+'_'+indek);
        Invoices.ticket.setCell(indek,'ticket_job_phase_cost_'+baris+'_'+indek);
//        Invoices.ticket.setCell(indek,'ticket_tax_calculate_'+baris+'_'+indek);
      }
      
  });
};

Invoices.ticket.getItem=(indek,baris)=>{
  Invoices.item.getOne(indek,
    getEV('ticket_item_id_'+baris+'_'+indek),
  (paket)=>{
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('ticket_item_id_'+baris+'_'+indek, d.item_id);
      setEV('ticket_description_'+baris+'_'+indek, d.name_for_sales);
      setEV('ticket_gl_account_id_'+baris+'_'+indek, d.sales_account_id);
//      setEV('unit_price_'+baris+'_'+indek, d.price);
      setEV('ticket_tax_id_'+baris+'_'+indek, d.tax_id);
      setEV('ticket_tax_calculate_'+baris+'_'+indek, d.calculate);

      Invoices.ticket.setCell(indek,'ticket_description_'+baris+'_'+indek);
      Invoices.ticket.setCell(indek,'ticket_gl_account_id_'+baris+'_'+indek);
//      Invoices.ticket.setCell(indek,'unit_price_'+baris+'_'+indek);
      Invoices.ticket.setCell(indek,'ticket_tax_id_'+baris+'_'+indek);
      Invoices.ticket.setCell(indek,'ticket_tax_calculate_'+baris+'_'+indek);
    }
  });
}

Invoices.ticket.getItemTax=(indek,baris)=>{
  setEV('ticket_tax_calculate_'+baris+'_'+indek,0);
  Invoices.ticket.setCell(indek,'ticket_tax_calculate_'+baris+'_'+indek);

  Invoices.itemTax.getOne(indek,
    getEV('ticket_tax_id_'+baris+'_'+indek),
  (paket)=>{
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('ticket_tax_calculate_'+baris+'_'+indek,d.calculate);
      Invoices.ticket.setCell(indek,'ticket_tax_calculate_'+baris+'_'+indek);
    }
  })
}

Invoices.ticket.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].ticket_detail;
  var baru = [];
  var isiEdit = {};
  var ticket_total=0;
  var sum_item_ticket=0;
  var sum_tax_ticket=0;
  var i;
    
  for(i=0;i<isi.length; i++){
    
    isiEdit=isi[i];
    
    if(id_kolom==('ticket_no_'+i+'_'+indek)){
      isiEdit.ticket_no=getEV(id_kolom);
      baru.push(isiEdit);

    }else if(id_kolom==('ticket_date_'+i+'_'+indek)){
      isiEdit.ticket_date=getEV(id_kolom);
      baru.push(isiEdit);

    
    }else if(id_kolom==('ticket_item_id_'+i+'_'+indek)){
      isiEdit.item_id=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else if(id_kolom==('ticket_description_'+i+'_'+indek)){
      isiEdit.description=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else if(id_kolom==('ticket_gl_account_id_'+i+'_'+indek)){
      isiEdit.gl_account_id=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
    
    }else if(id_kolom==('ticket_tax_id_'+i+'_'+indek)){    
      isiEdit.tax_id=getEV(id_kolom);
      baru.push(isiEdit);
      Invoices.ticket.getItemTax(indek,i);

    }else if(id_kolom==('ticket_tax_calculate_'+i+'_'+indek)){
      isiEdit.tax_calculate=getEV(id_kolom);
      baru.push(isiEdit);
    
    }else if(id_kolom==('ticket_amount_'+i+'_'+indek)){      
      isiEdit.amount=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else if(id_kolom==('ticket_job_phase_cost_'+i+'_'+indek)){
      isiEdit.job_phase_cost=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else{
      baru.push(isi[i]);
    }
    
    sum_item_ticket+=Number(isi[i].amount);
    

    if(String(isi[i].tax_id).length>0){
//      alert(isi[i].tax_calculate);
      if(Number(isi[i].tax_calculate)==1){
        sum_tax_ticket+=Number(isi[i].amount);
      }
    }
  }
  
  bingkai[indek].sum_item_ticket=sum_item_ticket;
  bingkai[indek].sum_tax_ticket=sum_tax_ticket;
  Invoices.calculateTotal(indek);
}

Invoices.getQuote=(indek)=>{
  Invoices.quote.getOne(indek,
    getEV('customer_id_'+indek),
    getEV('quote_no_'+indek),
  (paket)=>{
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      
      var address=JSON.parse(d.customer_address);
      var ship_address=JSON.parse(d.ship_address);
      var discount_terms=JSON.parse(d.discount_terms);
      var quote_detail=JSON.parse(d.detail);

      setEV('quote_no_'+indek, d.quote_no);
      setEV('quote_no_'+indek, d.quote_no);
      setEV('customer_id_'+indek, d.customer_id);
      setEV('customer_name_'+indek, d.customer_name);
      setEV('customer_address_'+indek, toAddress(address));

      setEV('invoice_no_'+indek, d.quote_no);
      setEV('invoice_date_'+indek, d.date);
      setEV('invoice_date_fake_'+indek, tglWest(d.date));
      
      setEV('ship_address_'+indek, toAddress(ship_address));
      setEV('customer_po_'+indek, d.customer_po);
      setEV('ship_id_'+indek, d.ship_id);
      setEV('displayed_terms_'+indek, discount_terms.displayed);
      setEV('sales_rep_id_'+indek, d.sales_rep_id);

      Invoices.setRows(indek, quote_detail);

      setEV('ar_account_id_'+indek, d.ar_account_id);
      setEV('sales_tax_id_'+indek, d.sales_tax_id);
      setEV('sales_tax_rate_'+indek, d.sales_tax_rate+' %');
      setEV('sales_tax_'+indek, Number(d.tax_amount));
      
      setEV('freight_account_id_'+indek, d.freight_account_id);
      setEV('freight_amount_'+indek, Number(d.freight_amount));
      setEV('invoice_total_'+indek, Number(d.total));
      
      bingkai[indek].discount_terms=discount_terms;
      bingkai[indek].ship_address=ship_address;
      bingkai[indek].sales_tax_rate=d.sales_tax_rate;

    };
  });
}

Invoices.setQuote=(indek,d)=>{
  setEV('customer_id_'+indek, d.customer_id);
  setEV('quote_no_'+indek, d.quote_no);
  Invoices.getQuote(indek);
}


// eof: 1592;1540;1534;1631;1707;1804;1790;1795;2313;
