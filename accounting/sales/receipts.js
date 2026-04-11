/*
 * auth: budiono;
 * code: i6;
 * path: /accounting/sales/receipts.js;
 * -----------------------------------;
 * date: dec-04, 10:44, mon-2023;
 * -----------------------------; happy new year 2024;
 * edit: jan-22, 15:34, mon-2024; meringkas;
 * edit: aug-15, 20:03, thu-2024; r12;
 * edit: aug-16, 13:34, fri-2024; r12;
 * edit: oct-06, 22:27, sun-2024; #20;
 * edit: dec-31, 17:20, mon-2024; #32; properties+duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-25, 14:10, tue-2025; #41; file_id;
 * edit: mar-15, 11:30, sat-2025; #43; deep-folder;
 * edit: mar-27, 12:36, thu-2025; #45; ctables;cstructure;
 * edit: apr-11, 17:56, fri-2025; #46; tes-data;
 * edit: apr-23, 13:59, wed-2025; #50; import serialized;
 * edit: apr-24, 20:49, thu-2025; #50; export to CSV format;
 * edit: aug-15, 21:43, fri-2025; #68; add date_obj;
 * edit: nov-06, 12:24, thu-2025; #80;
 */ 
 
/* p_key : [cash_account_id, receipt_no]
 * n_null: [cash_account_id, receipt_no]
 */ 

'use strict';

var Receipts={}

Receipts.table_name='receipts';
Receipts.invoice={};
Receipts.form=new ActionForm2(Receipts);
Receipts.grid=new Grid(Receipts);
Receipts.invoice.grid=new Grid(Receipts.invoice);
Receipts.customer=new CustomerLook(Receipts);
Receipts.salesTax=new SalesTaxLook(Receipts);
Receipts.payMethod=new PayMethodLook(Receipts);
Receipts.account=new AccountLook(Receipts);
Receipts.item=new ItemLook(Receipts);
Receipts.itemTax=new ItemTaxesLook(Receipts);
Receipts.job=new JobLook(Receipts);
Receipts.salesRep=new SalesRepLook(Receipts);
//Receipts.hidePreview=false;

Receipts.show=(karcis)=>{
  karcis.modul=Receipts.table_name;
  karcis.have_child=true;
  
  var baru=exist(karcis);
  if(baru==-1){
    var newTxs=new BingkaiUtama(karcis);
    var indek=newTxs.show();
    createFolder(indek,()=>{
      Receipts.form.modePaging(indek);
      Receipts.getDefault(indek);
    });
  }else{
    show(baru);
  }
}

Receipts.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM receipts"
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

Receipts.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Receipts.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT cash_account_id,receipt_no,date,amount,"
        +" name,"
        +" user_name,date_modified"
        +" FROM receipts"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY date,cash_account_id,receipt_no"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Receipts.readShow(indek);
    });
  })
}

Receipts.getDefault=(indek)=>{
  CustomerDefaults.getDefault(indek)
}

Receipts.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
  +content.title(indek)
  +content.message(indek)
  +pagingLimit(indek)
  +'<table border=1>'
    +'<tr>'
    +'<th colspan="2">Receipt #</th>'
    +'<th>Date</th>'
    +'<th>Amount</th>'
    +'<th>Name</th>'
    +'<th>Owner</th>'
    +'<th>Modified</th>'
    +'<th colspan="3">Action</th>'
    +'</tr>';

  if(p.err.id===0){
    for(var x in d){
      n++;
      html+='<tr>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].receipt_no+'</td>'
      +'<td align="center">'+tglWest(d[x].date)+'</td>'
      +'<td align="right">'+(d[x].amount)+'</td>'
      +'<td align="left">'+xHTML(d[x].name)+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'<td align="center">'
        +'<button type="button"'
        +' id="btn_change"'
        +' onclick="Receipts.formUpdate(\''+indek+'\''
        +',\''+d[x].cash_account_id+'\''
        +',\''+d[x].receipt_no+'\''
        +');">'
        +'</button>'
        +'</td>'
      +'<td align="center">'
        +'<button type="button"'
        +' id="btn_delete"'
        +' onclick="Receipts.formDelete(\''+indek+'\''
        +',\''+d[x].cash_account_id+'\''
        +',\''+d[x].receipt_no+'\''
        +');">'
        +'</button>'
        +'</td>'
      +'<td align="center">'+n+'</td>'  
      +'</tr>';
    }
  }

  html+='</table>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Receipts.form.addPagingFn(indek);
}

Receipts.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode
  
  var html=''
    +'<div style="padding:0.5rem;margin-bottom:50px;">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    
    +'<div style="display:grid;grid-template-columns:repeat(3,1fr);'
      +'padding-bottom:50px;">'
      +'<div style="padding-right:1rem;">'
        +'<ul>'
        +'<li><label>Ticket ID:</label>'
          +'<input type="text"'
          +' id="deposit_no_'+indek+'"'
          +' size="9" >'
          +'</li>'
          
        +'<li><label>Customer ID<i class="required">*</i>:</label>'
          +'<input type="text"'
          +' id="customer_id_'+indek+'"'
          +' onchange="Receipts.getCustomer(\''+indek+'\')"'
          +' size="16" >'
          
          +'<button type="button" id="btn_find" '
            +' onclick="Receipts.customer.getPaging(\''+indek+'\''
            +',\'customer_id_'+indek+'\')">'
          +'</button>'
          +'</li>'
          
        +'<li><label>Name:</label>'
          +'<input type="text" '
          +' id="receipt_name_'+indek+'"'
          +' onchange="Receipts.changeReceiptName(\''+indek+'\')"'
          +' style="width:14.6rem;" >'
          +'</li>'
          
        +'<li><label>Address:</label>'
          +'<textarea disabled'
          +' id="receipt_address_'+indek+'" '
          +' spellcheck=false'
          +' placeholder="Address"'
          +' style="resize:none;width:14.6rem;height:50px;" >'
          +'</textarea>'
          +'</li>'
          
        +'</ul>'
      +'</div>'
      
      +'<div style="padding-right:1rem;">'
        +'<ul>'
          +'<li><label>Receipt# <i class="required">*</i></label>'
            +'<input type="text"'
            +' id="receipt_no_'+indek+'"'
            +' size="9">'
          +'</li>'
          
          +'<li><label>Date</label>'
            +'<input type="date"'
              +' id="receipt_date_'+indek+'"'
              +' onchange="Receipts.calculateDiscount(\''+indek+'\')"'
              +' onblur="dateFakeShow('+indek+',\'receipt_date\')"'
              +' style="display:none;">'
            +'<input type="text"'
              +' id="receipt_date_fake_'+indek+'"'
              +' onfocus="dateRealShow('+indek+',\'receipt_date\')"'
              +' size="9">'
          +'</li>'
          
          +'<li><label>Reference</label>'
            +'<input type="text"'
            +' id="reference_'+indek+'"'
            +' size="9" >'
            +'</li>'
            
          +'<li><label>Receipt Amt:</label>'
            +'<input type="text" disabled '
            +' id="receipt_amount_'+indek+'"'
            +' style="text-align:right"'
            +' size="9" >' 
            +'</li>'
            
        +'</ul>'
      +'</div>'
    
      +'<div style="padding-right:1rem;">'
        +'<div>'
          +'<label style="display:block;">Paymt Method:</label>'
          +'<input type="text"'
          +' id="pay_method_id_'+indek+'"'
          +' size="9" >'

          +'<button type="button"'
          +' id="btn_find"'
          +' onclick="Receipts.payMethod.getPaging(\''+indek+'\''
          +',\'pay_method_id_'+indek+'\')">'
          +'</button>'
          +'</div>'

        +'<div>'
          +'<label style="display:block;">Cash Account</label>'
          +'<input type="text"'
            +' id="cash_account_id_'+indek+'"'
            +' size="9" >'
          
          +'<button type="button"'
            +' id="btn_find"'
            +' onclick="Receipts.account.getPaging(\''+indek+'\''
            +',\'cash_account_id_'+indek+'\',-1'
            +',\''+CLASS_ASSET+'\')">'
          +'</button>'
        +'</div>'
          
      +'</div>'        
    +'</div>'

    +'<details open id="detail_receipt_'+indek+'">'
      +'<summary>Receipt Details</summary>'
      +'<div id="receipt_detail_'+indek+'"'
        +' style="width:100%;overflow:auto;">'
        +'</div>'

      +'<div style="display:grid;grid-template-columns:repeat(3,1fr)'
      +';margin-top:10px;">'
      +'<div>'
        +'<label>Sales Rep:</label>'
        +'<input type="text"'
        +' id="sales_rep_id_'+indek+'"'
        +' size="12" >'
        
        +'<button type="button" id="btn_find" '
        +' onclick="Receipts.salesRep.getPaging(\''+indek+'\''
        +',\'sales_rep_id_'+indek+'\');">'
        +'</button>'
        +'</div>'

      +'<div>'
        +'<ul>'
        +'<li>'
          +'<label>Sales Tax ID:</label>'
          +'<input type="text"'
            +' id="sales_tax_id_'+indek+'"'
            +' onchange="Receipts.getSalesTax(\''+indek+'\')"'
            +' size="9" >'
            
          +'<button type="button" id="btn_find" '
            +' onclick="Receipts.salesTax.getPaging(\''+indek+'\''
            +',\'sales_tax_id_'+indek+'\')">'
            +'</button>'
          +'</li>'
          
        +'<li>'
          +'<label>Sales Tax Rate:</label>'
          +'<input type="text" disabled'
          +' id="sales_tax_rate_'+indek+'" '
          +' value="0%"'
          +' style="text-align:right;"'
          +' size="7" >'
          +'</li>'
        +'</ul>'
      +'</div>'
        
      +'<div>'
        +'<label>Sales Tax:</label>'
        +'<input type="text" disabled'
        +' id="sales_tax_'+indek+'"'
        +' style="text-align:right;"'
        +' size="12" >'
      +'</div>'

      +'</div>'
    +'</details>'

    +'<details id="detail_invoice_'+indek+'">'
      +'<summary>Invoices:'
        +' <i id="invoice_total_paid_'+indek+'"></i>'
        +'</summary>'
      +'<div'
        +' id="invoice_detail_'+indek+'"'
        +' style="width:100%;overflow:auto;">'
        +'</div>'
        
      +'<label>Discount Acct.:</label>'
      +'<input type="text"'
      +' id="discount_account_id_'+indek+'"'
      +' size="9" >'
      
      +'<button type="button" id="btn_find" '
      +' onclick="Receipts.account.getPaging(\''+indek+'\''
          +',\'discount_account_id_'+indek+'\',-1'
          +',\''+CLASS_INCOME+'\')">'
      +'</button>'
    +'</details>'

    
    +'</form>'
    +'</div>';
  
  content.html(indek,html);
  statusbar.ready(indek);
  
  document.getElementById('customer_id_'+indek).focus();
  document.getElementById('receipt_date_'+indek).value=tglSekarang();
  document.getElementById('receipt_date_fake_'+indek).value=tglWest(tglSekarang());
  
  if(metode==MODE_CREATE) Receipts.setDefault(indek);
}

Receipts.setDefault=(indek)=>{
  var d=bingkai[indek].data_default;
  
  setEV('discount_account_id_'+indek, d.discount_account_id);
  setEV('cash_account_id_'+indek, d.cash_account_id);
  setEV('pay_method_id_'+indek, d.pay_method_id);
  
  bingkai[indek].receipt_address={
    name: "name",
    street_1:"--",
    street_2:"--",
    city:"--",
    state:"--",
    zip:"--",
    country:"--"
  }

  Receipts.setRows(indek,[]);
  Receipts.invoice.setRows(indek,[]);
}

Receipts.setRows=(indek,isi)=>{
  if(isi===undefined)isi=[];

  var panjang=isi.length;
  var html=Receipts.tableHead(indek);
  var amount_receipt=0;
  var tax_receipt=0;

  bingkai[indek].receipt_detail=isi;
    
  for (var i=0;i<panjang;i++){

    html+='<tr>'
    +'<td style="display:none;">'+(i+1)+'</td>'
    
    +'<td align="center" style="margin:0;padding:0">'
      +'<input type="text"'
      +' id="quantity_'+i+'_'+indek+'"'
      +' value="'+isi[i].quantity+'"'
      +' onfocus="this.select()"'
      +' onchange="Receipts.setCell(\''+indek+'\''
      +',\'quantity_'+i+'_'+indek+'\')"'
      +' style="text-align:center"'
      +' size="3" >'
      +'</td>'
            
    +'<td align="center" style="padding:0;margin:0;">'
      +'<input type="text"'
      +' id="item_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].item_id+'"'
      +' onfocus="this.select()"'
      //+' onchange="Receipts.getItem(\''+indek+'\',\''+i+'\')"'
      +' onchange="Receipts.setCell(\''+indek+'\''
      +',\'item_id_'+i+'_'+indek+'\')"'
      +' style="text-align:left"'
      +' size="10" >'
      +'</td>'

    +'<td>'
      +'<button type="button"'
      +' id="btn_find"'
      +' onclick="Receipts.item.getPaging(\''+indek+'\''
      +',\'item_id_'+i+'_'+indek+'\''
      +',\''+i+'\');">'
      +'</button>'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="description_'+i+'_'+indek+'"'
      +' value="'+isi[i].description+'"'
      +' onfocus="this.select()"'
      +' onchange="Receipts.setCell(\''+indek+'\''
      +',\'description_'+i+'_'+indek+'\')"'
      +' style="text-align:left"'
      +' size="15" >'
      +'</td>'
            
    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="gl_account_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].gl_account_id+'"'
      +' onfocus="this.select()"'
      +' onchange="Receipts.setCell(\''+indek+'\''
      +',\'gl_account_id_'+i+'_'+indek+'\')"'
      +' style="text-align:center"'
      +' size="8" >'
      +'</td>'
      
    +'<td>'
      +'<button type="button" id="btn_find" '
      +' onclick="Receipts.account.getPaging(\''+indek+'\''
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
      +' onchange="Receipts.setCell(\''+indek+'\''
      +',\'unit_price_'+i+'_'+indek+'\')"'
      +' style="text-align:right"'
      +' size="6" >'
      +'</td>'
            
    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="tax_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].tax_id+'"'
      +' onfocus="this.select()"'
      +' onchange="Receipts.setCell(\''+indek+'\''
      +',\'tax_id_'+i+'_'+indek+'\')"'
      +' style="text-align:center"'
      +' size="1" >'
      
      +'<input type="text" hidden'
      +' id="tax_calculate_'+i+'_'+indek+'"'
      +' value="'+isi[i].tax_calculate+'"'
      +' style="text-align:right"'
      +' size="1" >'
      +'</td>'
            
    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="amount_'+i+'_'+indek+'"'
      +' value="'+Number(isi[i].amount)+'"'
      +' onfocus="this.select()"'
      +' onchange="Receipts.setCell(\''+indek+'\''
      +',\'amount_'+i+'_'+indek+'\')"'
      +' style="text-align:right"'
      +' size="9" >'
      +'</td>'
        
    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="job_phase_cost_'+i+'_'+indek+'"'
      +' value="'+isi[i].job_phase_cost+'"'
      +' onfocus="this.select()"'
      +' onchange="Receipts.setCell(\''+indek+'\''
      +',\'job_phase_cost_'+i+'_'+indek+'\')"'
      +' style="text-align:center"'
      +' size="5" >'
      +'</td>'

    +'<td>'
      +'<button type="button" id="btn_find" '
      +' onclick="Receipts.job.getPaging(\''+indek+'\''
      +',\'job_phase_cost_'+i+'_'+indek+'\''
      +',\''+i+'\');">'
      +'</button>'
      +'</td>'
            
    +'<td align="center">'
      +'<button type="button"'
      +' id="btn_add"'
      +' onclick="Receipts.addRow(\''+indek+'\','+i+')" >'
      +'</button>'

      +'<button type="button"'
      +' id="btn_remove"'
      +' onclick="Receipts.removeRow(\''+indek+'\','+i+')" >'
      +'</button>'
      +'</td>'

    +'</tr>';
    
    amount_receipt+=Number(isi[i].amount);

    if(String(isi[i].tax_id).length>0){
      if(Number(isi[i].tax_calculate)==1){
        tax_receipt+=Number(isi[i].amount);
      }
    }
  }
  html+=Receipts.tableFoot(indek);
  var budi = JSON.stringify(isi);
  document.getElementById('receipt_detail_'+indek).innerHTML=html;
  
  bingkai[indek].amount_receipt=amount_receipt;
  bingkai[indek].tax_receipt=tax_receipt;

  Receipts.calculateTotal(indek);

  if(panjang==0)Receipts.addRow(indek,0);
}

Receipts.tableHead=(indek)=>{
  return '<table border=0 style="width:100%;display:inline-block;" >'
    +'<thead>'
    +'<tr>'
    +'<th style="display:none;">No.</th>'
    +'<th>Quantity</th>'
    +'<th colspan="2">Item</th>'
    +'<th>Description</th>'
    +'<th colspan="2">G/L Account<i class="required">(*)</i></th>'
    +'<th>Unit Price</th>'
    +'<th>Tax</th>'
    +'<th>Amount<i class="required">*</i></th>'
    +'<th colspan="2">Job</th>'
    +'<th>Add/Remove</th>'
    +'</tr>'
    +'</thead>';
}

Receipts.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
    +'<td colspan="12">&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

Receipts.calculateTotal=(indek)=>{
  // receipt
  var amountReceipt=Number(bingkai[indek].amount_receipt) || 0;//without tax;
  var taxReceipt=Number(bingkai[indek].tax_receipt) || 0;//with tax;
  
  // const invoiceAmount=Number(jendela[indek].invoice_total_paid) || 0;
  var paidInvoice=Number(bingkai[indek].paid_invoice) || 0;
  var taxRate=Number(bingkai[indek].sales_tax_rate) || 0;
  var taxValue=Number(taxReceipt)*Number(taxRate)/100;// item dengan pajak;
  var receiptAmount=(amountReceipt+taxValue);
  
  setEV('sales_tax_rate_'+indek, taxRate+'%');
  setEV('sales_tax_'+indek, taxValue);
  setEV('invoice_total_paid_'+indek,paidInvoice);
  //setEV('receipt_amount_'+indek,(paidInvoice+amountReceipt).toFixed(2));
  setEV('receipt_amount_'+indek,(paidInvoice+receiptAmount));
}

Receipts.addRow=(indek,baris)=>{
  Receipts.gl_account_id=bingkai[indek].data_default.gl_account_id
  Receipts.grid.addRow(indek,baris,bingkai[indek].receipt_detail);
}

Receipts.newRow=(newBas)=>{
  newBas.push({
    'row_id':newBas.length+1,
    'quantity':0,
    'item_id':'',
    'description':"",
    'gl_account_id':Receipts.gl_account_id,
    'unit_price':0,
    'tax_id':'',
    'tax_calculate':0,
    'amount':0,
    'job_phase_cost':''
  });
}

Receipts.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].receipt_detail;
  var baru=[];
  var isiEdit={};
  var amount_receipt=0;  
  var tax_receipt=0;
    
  for (var i=0;i<isi.length; i++){
    isiEdit = isi[i];
    
    if(id_kolom==('item_id_'+i+'_'+indek)){
      isiEdit.item_id=getEV(id_kolom);
      baru.push(isiEdit);
      Receipts.getItem(indek,i);

    }else if(id_kolom==('quantity_'+i+'_'+indek)){
      isiEdit.quantity=getEV(id_kolom);
      isiEdit.amount=(isiEdit.quantity*isiEdit.unit_price);
      baru.push(isiEdit);
      setEV('amount_'+i+'_'+indek, (isiEdit.amount) );

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
      setEV('amount_'+i+'_'+indek, (isiEdit.amount) );
      
    }else if(id_kolom==('tax_id_'+i+'_'+indek)){  
      isiEdit.tax_id=getEV(id_kolom);
      baru.push(isiEdit);
      Receipts.getItemTaxes(indek,i);
      
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
    
    amount_receipt+=Number(isi[i].amount);
    if(String(isi[i].tax_id).length>0){
      if(Number(isi[i].tax_calculate)==1){
        tax_receipt+=Number(isi[i].amount);
      }
    }
  }
  bingkai[indek].amount_receipt=amount_receipt;
  bingkai[indek].tax_receipt=tax_receipt;
  Receipts.calculateTotal(indek);
}

Receipts.removeRow=(indek,baris)=>{
  Receipts.grid.removeRow(indek,baris,bingkai[indek].receipt_detail);
}

Receipts.invoice.setRows=(indek,isi)=>{
  if(isi===undefined)isi=[];
  var panjang=isi.length;
  var html=Receipts.invoice.tableHead(indek);
  var total_paid=0;
  var discount=0;
  var receipt_date=document.getElementById('receipt_date_'+indek).value;
  var contreng='';
  var count_pay=0;
    
  bingkai[indek].invoice_detail=isi;
    
  for (var i=0;i<panjang;i++){
    
    discount=0;
    
    if(isi[i].pay==1){
      total_paid+=Number(isi[i].amount_paid);
      count_pay+=Number(isi[i].pay);
    }
    
    if(receipt_date<=isi[i].discount_date){
      if(Number(isi[i].discount)>0){
        discount=isi[i].discount;
      }else{
        discount=isi[i].discount;
      }
    }else{
      discount='';//isi[i].discount;
    }
    
    if(isi[i].description==undefined) isi[i].description='';
    if(isi[i].pay==undefined) isi[i].pay=0;
    isi[i].pay==1?contreng='checked':contreng='';

    html+='<tr>'
    +'<td>'+(i+1)+'</td>'
            
    +'<td style="padding:0;margin:0;">'
      +'<input type="text" disabled'
      +' id="invoice_no_'+i+'_'+indek+'"'
      +' value="'+isi[i].invoice_no+'"'
      +' size="9" >'
      +'</td>'
            
    +'<td style="margin:0;padding:0">'
      +'<input type="text" disabled'
      +' id="date_due_'+i+'_'+indek+'"'
      +' value="'+tglWest(isi[i].date_due)+'"'
      +' style="text-align:center;"'
      +' size="9" >'
      +'</td>'
            
    +'<td style="margin:0;padding:0">'
      +'<input type="text" disabled'
      +' id="amount_due_'+i+'_'+indek+'"'
      +' value="'+Number(isi[i].amount_due) +'"'
      +' style="text-align:right"'
      +' size="9" >'
      +'</td>'

    +'<td style="padding:0;margin:0;">'
      +'<input type="text"'
      +' id="invoice_description_'+i+'_'+indek+'"'
      +' value="'+isi[i].description+'"'
      +' onfocus="this.select()"'
      +' onchange="Receipts.invoice.setCell(\''+indek+'\''
      +',\'invoice_description_'+i+'_'+indek+'\')" '
      +' size="15" >'
      +'</td>'
                        
    +'<td  align="center" style="padding:0;margin:0;">'
      +'<input type="text"'
      +' id="discount_'+i+'_'+indek+'"'
      +' value="'+discount+'"'
      +' onfocus="this.select()"'
      +' onchange="Receipts.invoice.setCell(\''+indek+'\''
      +',\'discount_'+i+'_'+indek+'\')"'
      +' style="text-align:right;"'
      +' size="6" >'
      +'</td>'
            
    +'<td  align="right" style="padding:0;margin:0;">'
      +'<input type="text"'
      +' id="amount_paid_'+i+'_'+indek+'"'
      +' value="'+Number(isi[i].amount_paid)+'"'
      +' onfocus="this.select()"'
      +' onchange="Receipts.invoice.setCell(\''+indek+'\''
      +',\'amount_paid_'+i+'_'+indek+'\')" '
      +' style="text-align:right"'
      +' size="9" >'
      +'</td>'
            
    +'<td align="center">'
      +'<input type="checkbox" '+ contreng
      +' id="pay_'+i+'_'+indek+'"'
      +' value="'+isi[i].pay+'"'
      +' onfocus="this.select()" '
      +' onchange="Receipts.invoice.setCell(\''+indek+'\''
      +',\'pay_'+i+'_'+indek+'\',)" '
      +' size="3" >'
      +'</td>'
    +'</tr>';
  }
  html+=Receipts.invoice.tableFoot(indek);
  var budi = JSON.stringify(isi);
  document.getElementById('invoice_detail_'+indek).innerHTML=html;
  
  bingkai[indek].paid_invoice=total_paid;
  bingkai[indek].count_pay=count_pay;
  Receipts.calculateTotal(indek);
  // document.getElementById('invoice_total_paid_'+indek).value=total_paid;
    
  if(panjang==0)Receipts.invoice.addRow(indek,[]);
}

Receipts.invoice.tableHead=(indek)=>{
  return '<table>'
    +'<tr>'
    +'<th colspan="2">Invoice</th>'
    +'<th>Date Due</th>'
    +'<th>Amount Due</th>'
    +'<th>Description</th>'
    +'<th>Discount</th>'
    +'<th>Amount Paid</th>'
    +'<th>Pay</th>'
    +'</tr>'
    +'</thead>';
}

Receipts.invoice.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
    +'<td>&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

Receipts.invoice.addRow=(indek,baris)=>{
  var oldBasket=[];
  var newBasket=[];

  oldBasket=bingkai[indek].invoice_detail;

  for(var i=0;i<oldBasket.length;i++){
    newBasket.push(oldBasket[i]);
    if(i==baris) newRow(newBasket);
  }
  if(newBasket.length==0) newRow(newBasket);
  Receipts.invoice.setRows(indek,newBasket);
  
  function newRow(newBas){
    var myItem={};
    myItem.row_id=newBas.length+1;
    myItem.invoice_no="";
    myItem.date_due="";
    myItem.discount_date="";
    myItem.amount_due=0;
    myItem.discount_amount=0;
    
    myItem.description="";
    myItem.discount=0;
    myItem.amount_paid=0;
    
    myItem.pay=0;
    newBas.push(myItem);  
  }
}

Receipts.invoice.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].invoice_detail;
  var baru = [];
  var isiEdit = {};
  var total_paid=0;
  var discount=0;
  var receipt_date=getEV('receipt_date_'+indek);
  
  for (var i=0;i<isi.length; i++){
    if(receipt_date<=isi[i].discount_date){
      //discount=isi[i].discount_amount;
      discount=isi[i].discount_due;
      isi[i].discount=isi[i].discount_due;
//      alert('a '+isi[i].discount_due);
    }else{
      discount=getEV('discount_'+i+'_'+indek);
//      alert('b '+isi[i].discount_due);
    }
    
    isiEdit=isi[i];
    
    if(id_kolom==('invoice_description_'+i+'_'+indek)){
      isiEdit.description=getEV(id_kolom);
      baru.push(isiEdit);
    
    }else if(id_kolom==('discount_'+i+'_'+indek)){
      isiEdit.discount=getEV(id_kolom);
//      alert(isiEdit.discount);
      isiEdit.amount_paid=isiEdit.amount_due-isiEdit.discount;
      baru.push(isiEdit);
      setEV('amount_paid_'+i+'_'+indek,(isiEdit.amount_paid));
    
    }else if(id_kolom==('amount_paid_'+i+'_'+indek)){  
      isiEdit.amount_paid=getEV(id_kolom);
      isiEdit.discount=discount;
      isiEdit.pay=true;

      baru.push(isiEdit);
      document.getElementById('pay_'+i+'_'+indek).checked=true;
    
    }else if(id_kolom==('pay_'+i+'_'+indek)){  
      isiEdit.pay=document.getElementById(id_kolom).checked;
      isiEdit.discount=getEV('discount_'+i+'_'+indek);
      
      if(isiEdit.pay==false){
        isiEdit.amount_paid=0;
      }else{
        isiEdit.amount_paid=(isi[i].amount_due-isi[i].discount);
      }
      setEV('discount_'+i+'_'+indek, Number(isiEdit.discount));
      setEV('amount_paid_'+i+'_'+indek, Number(isiEdit.amount_paid) );
      
      baru.push(isiEdit);      
    }else{
      baru.push(isi[i]);
    }
    
    total_paid+=Number(isi[i].amount_paid);
  }
  bingkai[indek].invoice_detail=isi;
  bingkai[indek].paid_invoice=total_paid;
  Receipts.calculateTotal(indek);
}

Receipts.calculateDiscount=(indek)=>{
  var invoice_detail=bingkai[indek].invoice_detail;
  var receipt_date=getEV('receipt_date_'+indek);
  
  for(var i=0;i<invoice_detail.length;i++){
    setEV('amount_paid_'+i+'_'+indek,'');
    document.getElementById('pay_'+i+'_'+indek).checked=false;

    if(getEV('receipt_date_'+indek)<=invoice_detail[i].discount_date){
//      alert(invoice_detail[i].discount_due);
      
      //setEV('discount_'+i+'_'+indek, invoice_detail[i].discount);
      setEV('discount_'+i+'_'+indek, invoice_detail[i].discount_due);
    }else{
      setEV('discount_'+i+'_'+indek,'');
    }
  }
}

Receipts.setCustomer=(indek,d)=>{
  setEV('customer_id_'+indek, d.customer_id);
  Receipts.getCustomer(indek);
}

Receipts.getCustomer=(indek)=>{
  Receipts.customer.getOne(indek,
    getEV('customer_id_'+indek),
  (paket)=>{
    setEV('sales_tax_id_'+indek,'');
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      var address=JSON.parse(d.address)[0];
      
      setEV('receipt_name_'+indek, d.name);
      setEV('receipt_address_'+indek, toAddress(address));
      setEV('sales_tax_id_'+indek, address.sales_tax_id);
      setEV('sales_rep_id_'+indek, d.sales_rep_id);

      bingkai[indek].receipt_address=address;
      bingkai[indek].receipt_address.name=d.name;
    }
    Receipts.getSalesTax(indek);
    Receipts.setRows(indek,[]);// new row;
    Receipts.getInvoice(indek);
  })
}

Receipts.changeReceiptName=(indek)=>{
  bingkai[indek].receipt_address.name=getEV('receipt_name_'+indek);
}

Receipts.setSalesTax=(indek,d)=>{
  setEV('sales_tax_id_'+indek,d.sales_tax_id);
  Receipts.getSalesTax(indek);
}

Receipts.getSalesTax=(indek)=>{
  bingkai[indek].sales_tax_rate=0;
  setEV('sales_tax_rate_'+indek,'0 %');
  Receipts.salesTax.getOne(indek,
    getEV('sales_tax_id_'+indek),
  (paket)=>{
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data)
      bingkai[indek].sales_tax_rate=d.rate;
    };
    setEV('sales_tax_rate_'+indek, bingkai[indek].sales_tax_rate+'%');
    Receipts.calculateTotal(indek);
  });
}

Receipts.getInvoice=(indek)=>{
  // default
  document.getElementById('detail_invoice_'+indek).open=false;
  document.getElementById('detail_receipt_'+indek).open=true;  
  
  db.run(indek,{
    query:"SELECT "
      +" invoice_no,"
      +" invoice_date,"
      +" date_due,"
      +" discount_date,"
      +" discount_due,"
      +" discount,"
      +" amount_due,"
      +" amount_paid"
      +" FROM invoice_receipt_sum"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+getEV('customer_id_'+indek)+"'"
      +" AND amount_due !=0"
  },(paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectMany(paket.fields,paket.data);
      Receipts.invoice.setRows(indek, d);
    }else{
      Receipts.invoice.setRows(indek,[]);
    }

    if(paket.count>0){
      document.getElementById('detail_invoice_'+indek).open=true;
      document.getElementById('detail_receipt_'+indek).open=false;
    }
  });
}

Receipts.setPayMethod=(indek,d)=>{
  setEV('pay_method_id_'+indek,d.pay_method_id);
}

Receipts.setAccount=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var baris=bingkai[indek].baris;
  
  if(baris==-1){
    setEV(id_kolom,data.account_id);
  }else{
    setEV(id_kolom,data.account_id);
    Receipts.setCell(indek,id_kolom);
  }
}

Receipts.setItem=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, data.item_id);
  Receipts.setCell(indek,id_kolom);
}

Receipts.getItem=(indek,baris)=>{
  Receipts.item.getOne(indek,
    getEV('item_id_'+baris+'_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      
      var d=objectOne(paket.fields,paket.data);
      
      setEV('item_id_'+baris+'_'+indek,d.item_id);
      setEV('description_'+baris+'_'+indek, d.name_for_sales);
      setEV('gl_account_id_'+baris+'_'+indek, d.sales_account_id);
      setEV('unit_price_'+baris+'_'+indek, d.price);
      setEV('tax_id_'+baris+'_'+indek, d.tax_id);
      setEV('tax_calculate_'+baris+'_'+indek, d.calculate);

      Receipts.setCell(indek,'description_'+baris+'_'+indek);
      Receipts.setCell(indek,'gl_account_id_'+baris+'_'+indek);
      Receipts.setCell(indek,'unit_price_'+baris+'_'+indek);
      Receipts.setCell(indek,'tax_id_'+baris+'_'+indek);
      Receipts.setCell(indek,'tax_calculate_'+baris+'_'+indek);
    }
  });
}

Receipts.getItemTaxes=(indek,baris)=>{
  setEV('tax_calculate_'+baris+'_'+indek,0);
  Receipts.setCell(indek,'tax_calculate_'+baris+'_'+indek);

  Receipts.itemTax.getOne(indek,
    getEV('tax_id_'+baris+'_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('tax_calculate_'+baris+'_'+indek,d.calculate);
      Receipts.setCell(indek,'tax_calculate_'+baris+'_'+indek);
    }
  })
}

Receipts.setJob=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d);
  Receipts.setCell(indek,id_kolom);
}

Receipts.setSalesRep=(indek,d)=>{
  setEV('sales_rep_id_'+indek, d.sales_rep_id);
}

Receipts.createExecute=(indek)=>{
  var address=JSON.stringify(bingkai[indek].receipt_address);
  var receipt_detail=JSON.stringify(bingkai[indek].receipt_detail);
  var invoice_detail=JSON.stringify(bingkai[indek].invoice_detail);
  var some_note=JSON.stringify(
    ['some note for this receipt','new-1']
  );

  db.execute(indek,{
    query:"INSERT INTO receipts"
    +"(admin_name,company_id,deposit_no,customer_id,name,address"
    +",receipt_no,date,reference"
    +",pay_method_id,cash_account_id"
    +",detail,sales_rep_id,sales_tax_id"
    +",invoice_detail,discount_account_id,note)"
    +" VALUES "
    +"('"+bingkai[indek].admin.name+"'"
    +",'"+bingkai[indek].company.id+"'"
    +",'"+getEV("deposit_no_"+indek)+"'"
    +",'"+getEV("customer_id_"+indek)+"'"
    +",'"+getEV("receipt_name_"+indek)+"'"
    +",'"+address+"'"
    +",'"+getEV("receipt_no_"+indek)+"'"
    +",'"+getEV("receipt_date_"+indek)+"'"
    +",'"+getEV("reference_"+indek)+"'"
    +",'"+getEV("pay_method_id_"+indek)+"'"
    +",'"+getEV("cash_account_id_"+indek)+"'"
    +",'"+receipt_detail+"'"
    +",'"+getEV("sales_rep_id_"+indek)+"'"
    +",'"+getEV("sales_tax_id_"+indek)+"'"
    +",'"+invoice_detail+"'"
    +",'"+getEV("discount_account_id_"+indek)+"'"
    +",'"+some_note+"'"
    +")"
  });
}

Receipts.readOne=(indek,callback)=>{
  bingkai[indek].count_pay=0;
  db.execute(indek,{
    query:"SELECT * "
      +" FROM receipts"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+bingkai[indek].cash_account_id+"'"
      +" AND receipt_no='"+bingkai[indek].receipt_no+"'"
  },(paket)=>{
    if(paket.err.id==0 && paket.count>0) {
      var d=objectOne(paket.fields,paket.data);
      var address=JSON.parse(d.address);
      var receipt_detail=JSON.parse(d.detail);
      var invoice_detail=JSON.parse(d.invoice_detail);
      
      setEV('deposit_no_'+indek, d.deposit_no);
      setEV('customer_id_'+indek, d.customer_id);
      setEV('receipt_name_'+indek, d.name);
      setEV('receipt_address_'+indek, toAddress(address));
      setEV('receipt_no_'+indek, d.receipt_no);
      setEV('receipt_date_'+indek, d.date);
      setEV('receipt_date_fake_'+indek, tglWest(d.date));
      setEV('reference_'+indek, d.reference);
      setEV('receipt_amount_'+indek,d.amount);
      setEV('pay_method_id_'+indek,d.pay_method_id);
      setEV('cash_account_id_'+indek,d.cash_account_id);
      setEV('sales_rep_id_'+indek,d.sales_rep_id);
      setEV('sales_tax_id_'+indek,d.sales_tax_id);
      setEV('sales_tax_rate_'+indek,d.sales_tax_rate+'%');
      setEV('sales_tax_'+indek,d.sales_tax);
      setEV('discount_account_id_'+indek,d.discount_account_id);
      
      bingkai[indek].sales_tax_rate=d.sales_tax_rate;
      bingkai[indek].receipt_address=address;
      bingkai[indek].invoice_detail=invoice_detail; //this data invoice.

      Receipts.setRows(indek, receipt_detail);
      //Receipts.invoice.setRows(indek, JSON.parse(d.invoice_detail) );
      
      document.getElementById('detail_invoice_'+indek).open=false;
      document.getElementById('detail_receipt_'+indek).open=true;
      
      Receipts.getRemaining(indek,()=>{// ada invoice;
        //load invoice_detail
        if(bingkai[indek].count_pay!=0){
          document.getElementById('detail_invoice_'+indek).open=true;
          document.getElementById('detail_receipt_'+indek).open=false;
        }
      });
      Receipts.getDeposit(indek);
      message.none(indek);
      return callback();
    }
  });
}

Receipts.getDeposit=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT deposit_no"
      +" FROM deposits"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
      +" AND admin_name='"+bingkai[indek].admin.name+"'"
      +" AND receipt_no='"+bingkai[indek].receipt_no+"'"
      +" AND cash_account_id='"+bingkai[indek].cash_account_id+"'"
  },(p)=>{
    if(p.count>0){
      var r=objectMany(p.fields,p.data);
      setEV('deposit_no_'+indek,r[0].deposit_no);
    }
  });
}

Receipts.getRemaining=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT "
      +" invoice_no,invoice_date,"
      +" date_due,discount_date,"
      +" discount_due,discount,"
      +" amount_due,"
      +" amount_due AS amount_paid"
      // +" ar_account_id"
      +" FROM invoice_receipt_sum"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+getEV('customer_id_'+indek)+"'"
      +" AND amount_due !=0"
  },(paket)=>{
    var m=bingkai[indek].invoice_detail;
    if(paket.err.id==0 && paket.count>0){
      var r=objectMany(paket.fields,paket.data);
      var d=[];
      var ada=false;
      // join
      for(var i=0;i<r.length;i++){// remaining
        ada=false;
        for(var j=0;j<m.length;j++){// edit data
          if(r[i].invoice_no==m[j].invoice_no){// edit data;
            // m[j].amount_due=m[j].amount_paid+r[i].amount_due
            m[j].discount_due=Number(m[j].discount)+Number(r[i].discount_due);
            ada=true;
          }
        }
        if(ada==false){// tambah;
          m.push(r[i]);
        }
      }
    }
    Receipts.invoice.setRows(indek, m);
    return callback();
  });
}

Receipts.formUpdate=(indek,cash_account_id,receipt_no)=>{
  bingkai[indek].cash_account_id=cash_account_id;
  bingkai[indek].receipt_no=receipt_no;
  Receipts.form.modeUpdate(indek);
}

Receipts.updateExecute=(indek)=>{
  var address=JSON.stringify(bingkai[indek].receipt_address);
  var receipt_detail=JSON.stringify(bingkai[indek].receipt_detail);
  var invoice_detail=JSON.stringify(bingkai[indek].invoice_detail);
  var some_note=JSON.stringify([
    'some note for this receipt',
    'edit-1'
  ]);
  
  db.execute(indek,{
    query:"UPDATE receipts "
      +" SET deposit_no='"+getEV('deposit_no_'+indek)+"'"
      +",customer_id='"+getEV("customer_id_"+indek)+"'"
      +",name='"+getEV("receipt_name_"+indek)+"'"
      +",address='"+address+"'"
      +",receipt_no='"+getEV("receipt_no_"+indek)+"'"
      +",date='"+getEV("receipt_date_"+indek)+"'"
      +",reference='"+getEV("reference_"+indek)+"'"
      +",pay_method_id='"+getEV("pay_method_id_"+indek)+"'"
      +",cash_account_id='"+getEV("cash_account_id_"+indek)+"'"
      +",detail='"+receipt_detail+"'"
      +",sales_rep_id='"+getEV("sales_rep_id_"+indek)+"'"
      +",sales_tax_id='"+getEV("sales_tax_id_"+indek)+"'"
      +",invoice_detail='"+invoice_detail+"'"
      +",discount_account_id='"+getEV("discount_account_id_"+indek)+"'"
      +",note='"+some_note+"'"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+bingkai[indek].cash_account_id+"'"
      +" AND receipt_no='"+bingkai[indek].receipt_no+"'"
  },(p)=>{
    if(p.err.id==0){
      Receipts.deadPath(indek);
      bingkai[indek].cash_account_id=getEV('cash_account_id_'+indek);
      bingkai[indek].receipt_no=getEV('receipt_no_'+indek);
    }
  });
}

Receipts.formDelete=(indek,cash_account_id,receipt_no)=>{
  bingkai[indek].cash_account_id=cash_account_id;
  bingkai[indek].receipt_no=receipt_no;
  Receipts.form.modeDelete(indek);
}

Receipts.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM receipts"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+bingkai[indek].cash_account_id+"'"
      +" AND receipt_no='"+bingkai[indek].receipt_no+"'"
  },(p)=>{
    if(p.err.id==0) Receipts.deadPath(indek);
  });
}

Receipts.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM receipts "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND receipt_no LIKE '%"+bingkai[indek].text_search+"%'"
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

Receipts.search=(indek)=>{
  Receipts.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT cash_account_id,receipt_no,date,amount,name,"
        +" user_name,date_modified "
        +" FROM receipts"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND receipt_no LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR date LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Receipts.readShow(indek);
    });
  });
}

Receipts.exportExecute=(indek)=>{
  var table_name=Receipts.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

Receipts.importExecute=(indek)=>{// harus sequential by date;
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;
  var i=0;
  var jer=0,jok=0;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  function sortByDate(a,b){ // sort array multidimensi by tanggal [5];
    if(a[6] === b[6]){
      return 0;
    }
    else{
      if(a[6] < b[5]) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
  
  function prosess(i2,callback){
    
    db.run(indek,{
      query:"INSERT INTO receipts"
      +"(admin_name,company_id"
      +",deposit_no,customer_id,name,address"
      +",receipt_no,date,reference"
      +",pay_method_id,cash_account_id"
      +",detail,sales_rep_id,sales_tax_id"
      +",invoice_detail,discount_account_id,note)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+d[i2][1]+"'" // 1-deposit_no
      +",'"+d[i2][2]+"'" // 2-customer_id
      +",'"+d[i2][3]+"'" // 3-name
      +",'"+d[i2][4]+"'" // 4-address
      +",'"+d[i2][5]+"'" // 5-receipt_no
      +",'"+d[i2][6]+"'" // 6-date
      +",'"+d[i2][7]+"'" // 7-reference
      +",'"+d[i2][8]+"'" // 8-paymthodid
      +",'"+d[i2][9]+"'" // 9-cashaccountid
      +",'"+d[i2][10]+"'"//  10-detail
      +",'"+d[i2][11]+"'"// 11-sales_rep_id
      +",'"+d[i2][12]+"'"// 12-sales_tax_id
      +",'"+d[i2][13]+"'"// 13-invoice_detail
      +",'"+d[i2][14]+"'"// 14-discount_account
      +",'"+d[i2][15]+"'"// 15-note
      +")"
    },(paket)=>{  
      if(paket.err.id==0){
        jok++;
      } else{
        jer++;
      }
      
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar2(indek,n,j,m,jok,jer);
      
      i2++;
      if(i2<j){
        prosess(i2,callback);// next rows;
      }
    });
  }
  
  d.sort(sortByDate);
  prosess(i,()=>{});

}

Receipts.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT cash_account_id,receipt_no,date,amount,name,"
      +" user_name,date_modified"
      +" FROM receipts"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Receipts.selectShow(indek);
  });
}

Receipts.selectShow=(indek)=>{
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
      +'<th colspan="2">Receipt #</th>'
      +'<th>Date</th>'
      +'<th>Amount</th>'
      +'<th>Name</th>'
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
      +'<td align="left">'+d[x].receipt_no+'</td>'
      +'<td align="center">'+tglWest(d[x].date)+'</td>'
      +'<td align="right">'+(d[x].amount)+'</td>'
      +'<td align="left">'+xHTML(d[x].name)+'</td>'
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

Receipts.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM receipts"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND cash_account_id='"+d[i].cash_account_id+"'"
          +" AND receipt_no='"+d[i].receipt_no+"'"
      });
    }
  }
  db.deleteMany(indek,a);
} 

Receipts.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM receipts"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+bingkai[indek].cash_account_id+"'"
      +" AND receipt_no='"+bingkai[indek].receipt_no+"'"
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

Receipts.duplicate=(indek)=>{
  var id='copy_of '+getEV('receipt_no_'+indek);
  setEV('receipt_no_'+indek,id);
  focus('receipt_no_'+indek);
}

Receipts.deadPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Receipts.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Receipts.properties(indek);})
  }
}

Receipts.nextPrevious=(indek,val)=>{
  Receipts.readOffset(indek,val,(d)=>{
    
    if(bingkai[indek].metode==MODE_VIEW){// mode-preview
      
      Receipts.renderPreview(indek,d);
      
    }else{// mode-update;
      
      Receipts.formUpdate(indek,d.cash_account_id,d.receipt_no);
      
    }
  });  

}

Receipts.readOffset=(indek,val,callback)=>{

  setCursor(indek,val);

  db.run(indek,{
    query:"SELECT * "
      +" FROM receipts"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date,receipt_no"
      +" LIMIT 1"
      +" OFFSET "+bingkai[indek].offset
      
  },(p)=>{
    
    Receipts.setFields(p,(d)=>{
      bingkai[indek].cash_account_id=d.cash_account_id;
      bingkai[indek].receipt_no=d.receipt_no;

      return callback(d);
    });
  }); 
}


Receipts.setFields=(p,callback)=>{
  var m={
    deposit_no: "",
    customer_id: "",
    name: "",
    address: {},
    receipt_no: "",
    date: "",
    reference: "",
    pay_method_id: "",
    cash_account_id: "",
    detail: [],
    invoice_detail: [],
    discount_account_id: "",
    sales_rep_id: "",
    sales_tax_id: "",
    sales_tax_rate: 0,
    tax_amount: 0,
    note: [],
    file_id: "",
  }
  
  if(p.count>0){
    var d=objectOne(p.fields,p.data) ;

    m.deposit_no=d.deposit_no;
    m.customer_id=d.customer_id;
    m.name=d.name;
    m.address=JSON.parse(d.address);
    m.receipt_no=d.receipt_no;
    m.date=d.date;
    m.reference=d.reference;
    m.pay_method_id=d.pay_method_id;
    m.cash_account_id=d.cash_account_id;
    m.detail=JSON.parse(d.detail);
    m.invoice_detail=JSON.parse(d.invoice_detail);
    m.discount_account_id=d.discount_account_id;
    m.sales_rep_id=d.sales_rep_id;
    m.sales_tax_id=d.sales_tax_id;
    m.sales_tax_rate=d.sales_tax_rate;
    m.tax_amount=d.tax_amount;
    m.note=JSON.parse(d.note);
    m.file_id=d.file_id;
  }
  
  return callback(m);

}

Receipts.readKeyset=(indek,callback)=>{// sama dengan readOne
  db.execute(indek,{
    query:"SELECT * "
      +" FROM receipts"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+bingkai[indek].cash_account_id+"'"
      +" AND receipt_no='"+bingkai[indek].receipt_no+"'"

  },(p)=>{
    Receipts.setFields(p,(d)=>{
      return callback(d);
    });
  });  
}


// eof: 1283;1372;1504;1509;1528;1556;1673;
