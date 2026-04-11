/*
 * name: budiono;
 * code: i8;
 * path: /accounting/sales/customer_credits.js;
 * -------------------------------------------;
 * edit: feb 12, 22:13, sat 2022;
 * edit: mar 21, 12:25, mon 2022;
 * edit: jul-13, 11:08, wed 2022; 
 * edit: jul-19, 16:00, tue 2022; change cash=>>ar
 * edit: aug-02, 21:33, tue 2022; add invoice_detail
 * edit: aug-03, 13:24, wed 2022; add invoice_detail;
 * -----------------------------; happy new year 2023; 
 * edit: mar-10, 19:33, fri-2023; postgress;
 * edit: jul-12, 09:41, wed-2023; standarize#1;
 * -----------------------------; happy new year 2024;
 * edit: feb-16, 11:33, fri-2024; 
 * edit: feb-19, 16:29, mon-2024; add job object;
 * edit: aug-17, 21:12, sat-2024; r12;
 * edit: aug-18, 16:48, sun-2024; r12;
 * edit: aug-20, 11:22, tue-2024; r13;revisi ke-13;
 * edit: oct-07, 15:14, mon-2024; #20;
 * edit: oct-13, 09:27, sun-2024; #22;
 * edit: nov-29, 08:07, fri-2024; #27; add locker();
 * edit: dec-30, 12:05, mon-2024; #32; properties+duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-25, 15:34, tue-2025; #41; file_id;
 * edit: mar-15, 12:00, sat-2025; #43; deep-folder;
 * edit: mar-27, 13:08, thu-2025; #45; ctables;cstructure;
 * edit: apr-11, 17:58, fri-2025; #46; tes-data;
 * edit: apr-24, 20:53, thu-2025; #50; export to CSV;
 * edit: apr-28, 11:54, mon-2025; #51; backup; restore;
 * edit: aug-15, 22:03, fri-2025; #68; add date_obj;
 * edit: nov-09, 12:58, sun-2025; #80; 
 */ 
 
'use strict';

var CustomerCredits={};
  
CustomerCredits.table_name='customer_credits';
CustomerCredits.blank='--No Invoice Selected--';
CustomerCredits.invoice={}
CustomerCredits.form=new ActionForm2(CustomerCredits);
CustomerCredits.customer=new CustomerLook(CustomerCredits);
CustomerCredits.salesTaxes=new SalesTaxLook(CustomerCredits);
CustomerCredits.salesRep=new SalesRepLook(CustomerCredits);
CustomerCredits.item=new ItemLook(CustomerCredits);
CustomerCredits.itemTax=new ItemTaxesLook(CustomerCredits);
CustomerCredits.account=new AccountLook(CustomerCredits);
CustomerCredits.job=new JobLook(CustomerCredits);
CustomerCredits.hidePreview=false;

CustomerCredits.show=(karcis)=>{
  karcis.modul=CustomerCredits.table_name;
  karcis.have_child=true;

  var baru=exist(karcis);
  if(baru==-1){
    var newTxs=new BingkaiUtama(karcis);
    var indek=newTxs.show();
    createFolder(indek,()=>{
      CustomerCredits.getDefault(indek);
      CustomerCredits.form.modePaging(indek);
    });
  }else{
    show(baru);
  }
}

CustomerCredits.getDefault=(indek)=>{
  CustomerDefaults.getDefault(indek);
}

CustomerCredits.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM customer_credits"
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

CustomerCredits.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  CustomerCredits.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT credit_no,date,total,customer_name,"
        +"customer_id,invoice_no,"
        +"user_name,date_modified"
        +" FROM customer_credits"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY date,credit_no"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      CustomerCredits.readShow(indek);
    });
  })
}

CustomerCredits.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border=1>'
    +'<tr>'
    +'<th colspan="2">Credit #</th>'
    +'<th>Date</th>'
    +'<th>Amount</th>'
    +'<th>Customer Name</th>'
    +'<th>Invoice #</th>'
    +'<th>Owner</th>'
    +'<th>Modified</th>'
    +'<th colspan="3">Action</th>'
    +'</tr>';
  var x;

  if (p.err.id===0){
    for (x in d) { 
      n++;     
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].credit_no+'</td>'
        +'<td align="center">'+tglWest(d[x].date)+'</td>'
        +'<td align="right">'+d[x].total+'</td>'
        +'<td align="left">'+d[x].customer_name+'</td>'
        +'<td align="left">'+d[x].invoice_no+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
        +'<button type="button"'
          +' id="btn_change"'
          +' onclick="CustomerCredits.formUpdate(\''+indek+'\''
          +',\''+d[x].customer_id+'\''
          +',\''+d[x].credit_no+'\');">'
          +'</button></td>'
        
        +'<td align="center">'
        +'<button type="button"'
          +' id="btn_delete"'
          +' onclick="CustomerCredits.formDelete(\''+indek+'\''
          +',\''+d[x].customer_id+'\''
          +',\''+d[x].credit_no+'\');">'
          +'</button></td>'
        +'<td align="center">'+n+'</td>'
        +'</tr>';
    }
  }
  html+='</table>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  CustomerCredits.form.addPagingFn(indek);
}

CustomerCredits.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  
  var html=''
  +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    
    +'<div'
    +' style="display:grid;'
    +'grid-template-columns:repeat(2,1fr);'
    +'padding-bottom:50px;">'
      +'<div>'
        +'<ul>'
          +'<li><label>Customer ID:<i class="required">*</i>:</label>'
            +'<input type="text" size="15"'
            +' id="customer_id_'+indek+'"'
            +' onchange="CustomerCredits.getCustomer(\''+indek+'\')">'
            +'<button type="button" id="btn_find" '
            +' onclick="CustomerCredits.customer.getPaging(\''+indek+'\''
            +',\'customer_id_'+indek+'\',-1)">'
            +'</button>'
            +'</li>'

          +'<li><label>Name:</label>'
            +'<input type="text"'
              +' id="customer_name_'+indek+'"'
              +' disabled>'
            +'</li>'          

          +'<li><label>Bill To</label>'
            +'<textarea id="customer_address_'+indek+'" '
              +' placeholder="Bill To"'
              +' style="resize:none;width:14.6rem;height:50px;" '
              +' spellcheck=false'
              +' disabled>'
            +'</textarea>'
          +'</li>'
        +'</ul>'
      +'</div>'
      
      +'<div style="display:block;padding-bottom:30px;">'
        +'<ul>'
          +'<li><label>Credit No.</label>'
            +'<input type="text"'
            +' id="credit_no_'+indek+'"'
            +' size="9">'
          +'</li>'

          +'<li><label>Date</label>'
            +'<input type="date"'
              +' id="credit_date_'+indek+'"'
              +' onblur="dateFakeShow('+indek+',\'credit_date\')"'
              +' style="display:none;">'
            +'<input type="text"'
              +' id="credit_date_fake_'+indek+'"'
              +' onfocus="dateRealShow('+indek+',\'credit_date\')"'
              +' size="9">'
          +'</li>'
        +'</ul>'
      +'</div>'
    +'</div>'    
    
    +'<div style="display:grid;grid-template-columns:repeat(4,1fr);'
    +'padding-bottom:10px;">'
      +'<div>'
        +'<label style="display:block;">Customer PO:</label>'
        +'<input type="text"'
        +' id="customer_po_'+indek+'"'
        +' size="15">'
        +'</div>'
        
      +'<div>'
        +'<label style="display:block;">Terms:</label>'
        +'<input type="text"'
        +' id="credit_displayed_terms_'+indek+'"'
        +' size="15"'
        +' style="text-align:center;">'

        +'<button type="button" id="btn_find" '
        +' onclick="CustomerCredits.showTerms(\''+indek+'\');">'
        +'</button>'
        +'</div>'
        
      +'<div>'
        +'<label style="display:block;">Sales Rep ID</label>'
        +'<input type="text"'
        +' id="sales_rep_id_'+indek+'"'
        +' size="10">'

        +'<button type="button"'
        +' id="btn_find" '
        +' onclick="CustomerCredits.salesRep.getPaging(\''+indek+'\''
        +',\'sales_rep_id_'+indek+'\',-1);">'
        +'</button>'

        +'</div>'  
      +'<div>'
        +'<label style="display:block;">Return Authorization</label>'
        +'<input type="text"'
        +' id="return_authorization_'+indek+'"'
        +' size="15">'
      +'</div>'  
      +'</div>'
    +'<details id="detail_invoice_'+indek+'">'
      +'<summary>Invoice Details</summary>'
      +'Invoice No.:&nbsp;'
      +'<select id="invoice_no_'+indek+'"'
        +' onchange="CustomerCredits.getInvoiceItem(\''+indek+'\')">'
        +'<option>'+CustomerCredits.blank+'</option>'
        +'</select>'
      +'<div id="invoice_detail_'+indek+'"'
        +' style="width:100%;overflow:auto;">'
        +'</div>'
      +'</details>'
    +'<details open id="detail_credit_'+indek+'">'
      +'<summary>Credit Memo Details</summary>'
      +'<div id="credit_detail_'+indek+'"'
        +' style="width:100%;overflow:auto;">'
        +'</div>'
      +'</details>'
      
    +'<div style="display:grid;grid-template-columns: repeat(3,1fr);'
      +'padding-bottom:20px;">'
      +'<div>'
        +'<ul>'
        +'<li>'
          +'<label>A/R Account:</label>'
          +'<input type="text" '
            +' id="ar_account_id_'+indek+'" '
            // +' onchange="CustomerCredits.getAccount(\''+indek+'\''
            //+',\'ar_account_id_'+indek+'\',\'ar\')"'
            +' size="7">'
            +'<button type="button" id="btn_find" '
            +' onclick="CustomerCredits.account.getPaging(\''+indek+'\''
            +',\'ar_account_id_'+indek+'\',\''+indek+'\''
            +',\''+CLASS_ASSET+'\')">'
            +'</button>'
        +'</li>'
        
        +'<li><label>Sales Tax ID:</label>'
          +'<input type="text" '
          +' id="sales_tax_id_'+indek+'" '
          +' onchange="CustomerCredits.getSalesTax(\''+indek+'\')"'
          +' size="7"' 
          +' style="text-align:center;">'

          +'<button type="button" id="btn_find" '
          +' onclick="CustomerCredits.salesTaxes.getPaging(\''+indek+'\''
          +',\'sales_tax_id_'+indek+'\',-1)">'
          +'</button></li>'
          
        +'<li><label>Sales Tax Rate:</label>'
          +'<input type="text" '
          +' id="sales_tax_rate_'+indek+'" disabled'
          +' value="0%"'
          +' style="text-align:center;"'
          +' size="7"></li>'
          
        +'</ul>'
      +'</div>'

      +'<div>'
        +'<ul>'
          +'<li>'
            +'<label>Sales Tax :</label>'
            +'<input type="text"'
              +' id="sales_tax_'+indek+'" '
              +' size="10" disabled'
              +' style="text-align:right;">'
          +'</li>'
          
          +'<li>'
            +'<label>Freight Account:</label>'
            +'<input type="text" '
              +' id="freight_account_id_'+indek+'" '
              +' size="7">'
              +'<button type="button" id="btn_find" '
              +' onclick="CustomerCredits.account.getPaging(\''+indek+'\''
              +',\'freight_account_id_'+indek+'\',\''+indek+'\''
              +',\''+CLASS_COST_OF_SALES+'\')">'
              +'</button>'
          +'</li>'
          
          +'<li>'
            +'<label>Freight Amount:</label>'
            +'<input type="text"'
              +' id="freight_amount_'+indek+'" '
              +' size="10"'
              +' onfocus="this.select();"'
              +' onchange="CustomerCredits.calculateTotal(\''+indek+'\');"'
              +' style="text-align:right;">'
          +'</li>'
        +'</ul>'
      +'</div>'
      +'<div>'
        +'<ul>'
          +'<li><label>Credit Total:</label>'
            +'<input type="text" '
            +' id="credit_total_'+indek+'"'
            +' disabled '
            +' size="12"'
            +' style="text-align:right">'
            +'</li>'
        +'</ul>'
      +'</div>'
    +'</div>'
    +'</form>'
  +'</div>';
  
  content.html(indek,html);
  statusbar.ready(indek);
  
  document.getElementById('customer_id_'+indek).focus();
  document.getElementById('credit_date_'+indek).value=tglSekarang();
  document.getElementById('credit_date_fake_'+indek).value=tglWest(tglSekarang());
  if(MODE_CREATE==metode) CustomerCredits.setDefault(indek);
}

CustomerCredits.setDefault=(indek)=>{
  var d=bingkai[indek].data_default;
  var discount_terms=d.discount_terms;
  
  setEV('ar_account_id_'+indek, d.ar_account_id);
  setEV('credit_displayed_terms_'+indek, discount_terms.displayed);
  setEV('sales_tax_rate_'+indek,0);
  
  bingkai[indek].discount_terms=discount_terms;
  bingkai[indek].invoice_no='';
  
  CustomerCredits.setRows(indek,[]);
  // CustomerCredits.setRows_invoice(indek,[]);
}

CustomerCredits.setRows=(indek,isi)=>{
  if(isi===undefined)isi=[];

  var panjang=isi.length;
  var html=CustomerCredits.tableHead(indek);
  var amount_credit=0;
  var tax_credit=0;
  
  bingkai[indek].credit_detail=isi;
  
  for (var i=0;i<panjang;i++){
    html+='<tr>'
    +'<td>'+(i+1)+'</td>'
      
    +'<td align="center" style="margin:0;padding:0">'
      +'<input type="text"'
      +' id="quantity_'+i+'_'+indek+'"'
      +' value="'+isi[i].quantity+'"'
      +' onchange="CustomerCredits.setCell(\''+indek+'\''
      +',\'quantity_'+i+'_'+indek+'\')"'
      +' onfocus="this.select()"'
      +' style="text-align:center"'
      +' size="3" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;">'
      +'<input type="text"'
      +' id="item_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].item_id+'"'
      +' onchange="CustomerCredits.setCell(\''+indek+'\''
      +',\'item_id_'+i+'_'+indek+'\')"'
      +' onfocus="this.select()"'
      +' style="text-align:left"'
      +' size="10" >'
      +'</td>'

    +'<td style="padding:0;margin:0;">'
      +'<button type="button" id="btn_find" '
      +' onclick="CustomerCredits.item.getPaging(\''+indek+'\''
      +',\'item_id_'+i+'_'+indek+'\',\''+i+'\');">'
      +'</button>'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="description_'+i+'_'+indek+'"'
      +' value="'+isi[i].description+'"'
      +' onchange="CustomerCredits.setCell(\''+indek+'\''
      +',\'description_'+i+'_'+indek+'\')"'
      +' onfocus="this.select()" '
      +' style="text-align:left"'
      +' size="15" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text" '
      +' id="gl_account_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].gl_account_id+'"'
      +' onchange="CustomerCredits.setCell(\''+indek+'\''
      +',\'gl_account_id_'+i+'_'+indek+'\')"'
      +' onfocus="this.select()" '
      +' style="text-align:center;"'
      +' size="8" >'
      +'</td>'
      
    +'<td style="margin:0;padding:0;">'
      +'<button type="button" id="btn_find"'
      +' onclick="CustomerCredits.account.getPaging(\''+indek+'\''
      +',\'gl_account_id_'+i+'_'+indek+'\''
      +',\''+i+'\''
      +',\''+CLASS_INCOME+'\');">'
      +'</button>'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="unit_price_'+i+'_'+indek+'"'
      +' value="'+isi[i].unit_price+'"'
      +' onchange="CustomerCredits.setCell(\''+indek+'\''
      +',\'unit_price_'+i+'_'+indek+'\')"'
      +' onfocus="this.select()"'
      +' style="text-align:right"'
      +' size="6" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="tax_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].tax_id+'"'
      +' onchange="CustomerCredits.setCell(\''+indek+'\''
      +',\'tax_id_'+i+'_'+indek+'\')"'
      +' onfocus="this.select()"'
      +' style="text-align:center;"'
      +' size="1" >'

      +'<input type="text" disabled '
      +' id="tax_calculate_'+i+'_'+indek+'"'
      +' value="'+isi[i].tax_calculate+'"'
      +' style="text-align:center;"'
      +' size="1" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="amount_'+i+'_'+indek+'"'
      +' value="'+Number(isi[i].amount)+'"'
      +' onchange="CustomerCredits.setCell(\''+indek+'\''
      +',\'amount_'+i+'_'+indek+'\')"'
      +' onfocus="this.select()"'
      +' style="text-align:right"'
      +' size="9" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="job_phase_cost_'+i+'_'+indek+'"'
      +' value="'+isi[i].job_phase_cost+'"'
      +' onchange="CustomerCredits.setCell(\''+indek+'\''
      +',\'job_phase_cost_'+i+'_'+indek+'\',\'credit\')" '
      +' onfocus="this.select()"'
      +' style="text-align:center"'
      +' size="5" >'
      +'</td>'

    +'<td style="padding:0;margin:0;">'
      +'<button type="button"'
      +' id="btn_find"'
      +' onclick="CustomerCredits.job.getPaging(\''+indek+'\''
      +',\'job_phase_cost_'+i+'_'+indek+'\''
      +',\''+i+'\');">'
      +'</button></td>'

    +'<td align="center">'
      +'<button type="button"'
      +' id="btn_add"'
      +' onclick="CustomerCredits.addRow(\''+indek+'\','+i+')">'
      +'</button>'

      +'<button type="button"'
      +' id="btn_remove"'
      +' onclick="CustomerCredits.removeRow(\''+indek+'\','+i+')">'
      +'</button>'
    +'</td>'
    +'</tr>';
    
    amount_credit+=Number(isi[i].amount);

    if(String(isi[i].tax_id).length>0){
      if(Number(isi[i].tax_calculate)==1){
        tax_credit+=Number(isi[i].amount);
      }
    }
  }
  html+=CustomerCredits.tableFoot(indek);
  var budi=JSON.stringify(isi);
  document.getElementById('credit_detail_'+indek).innerHTML=html;
  bingkai[indek].amount_credit=amount_credit;
  bingkai[indek].tax_credit=tax_credit;
  CustomerCredits.calculateTotal(indek);
  if(panjang==0)CustomerCredits.addRow(indek,[]);
}

CustomerCredits.tableHead=(indek)=>{
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


CustomerCredits.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
    +'<td colspan="1">&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

CustomerCredits.calculateTotal=(indek)=>{
  // credit
  var amount_credit=Number(bingkai[indek].amount_credit) || 0;//no tax;
  var tax_credit=Number(bingkai[indek].tax_credit) || 0;//w tax;
  var amount_invoice=Number(bingkai[indek].amount_invoice) || 0;
  var tax_invoice=Number(bingkai[indek].tax_invoice) || 0;
  var tax_rate=Number(bingkai[indek].sales_tax_rate) || 0;

  // item dengan pajak;
  var taxValue=Number(tax_credit+tax_invoice)*Number(tax_rate)/100;
  var freightValue=Number(getEV('freight_amount_'+indek)) || 0;
  var allValue=(amount_credit+amount_invoice+taxValue+freightValue);
  
  setEV('sales_tax_rate_'+indek,tax_rate+' %');
  setEV('sales_tax_'+indek,taxValue);
  setEV('freight_amount_'+indek,freightValue);
  setEV('credit_total_'+indek,allValue);
}

CustomerCredits.addRow=(indek,baris)=>{
  var oldBasket=[];
  var newBasket=[];

  oldBasket=bingkai[indek].credit_detail;
  for(var i=0;i<oldBasket.length;i++){
    newBasket.push(oldBasket[i]);
    if(i==baris) newRow(newBasket);
  }
  if(oldBasket.length==0) newRow(newBasket);
  CustomerCredits.setRows(indek,newBasket);
  if(baris>0) 
    document.getElementById('quantity_'+(baris+1)+'_'+indek).focus();
  
  function newRow(newBas){
    var myItem={};
    myItem.nomer=newBas.length+1;
    myItem.quantity=0;
    myItem.item_id='';
    myItem.description="";
    myItem.gl_account_id=bingkai[indek].data_default.gl_account_id;
    myItem.unit_price=0;
    myItem.tax_id="";
    myItem.tax_calculate=0;
    myItem.amount=0;
    myItem.job_phase_cost='';
    newBas.push(myItem);    
  }
}

CustomerCredits.removeRow=(indek,number)=>{
  var isi=bingkai[indek].credit_detail;
  var newBasket=[];
  
  CustomerCredits.setRows(indek,isi);
  for(var i=0;i<isi.length;i++){
    if (i!=(number))newBasket.push(isi[i]);
  }
  CustomerCredits.setRows(indek,newBasket);
}

CustomerCredits.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].credit_detail;
  var baru = [];
  var isiEdit = {};  
  var amount_credit=0;
  var tax_credit=0;
    
  for (var i=0;i<isi.length; i++){
    isiEdit=isi[i];
    
    if(id_kolom==('quantity_'+i+'_'+indek)){
      isiEdit.quantity=getEV(id_kolom);
      isiEdit.amount=(isiEdit.quantity*isiEdit.unit_price);
      baru.push(isiEdit);
      setEV('amount_'+i+'_'+indek,Number(isiEdit.amount));
      
    }else if(id_kolom==('item_id_'+i+'_'+indek)){
      isiEdit.item_id=getEV(id_kolom);
      baru.push(isiEdit);
      CustomerCredits.getItem(indek,i);
      
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
      CustomerCredits.getItemTax(indek,i);
      
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

    amount_credit+=Number(isi[i].amount);    
    if(String(isi[i].tax_id).length>0){
      if(Number(isi[i].tax_calculate)==1){
        tax_credit+=Number(isi[i].amount);
      }
    }
  }
  bingkai[indek].amount_credit=amount_credit;
  bingkai[indek].tax_credit=tax_credit;
  CustomerCredits.calculateTotal(indek);
}

CustomerCredits.setCustomer=(indek,d)=>{
  setEV('customer_id_'+indek,d.customer_id);
  CustomerCredits.getCustomer(indek);
}

CustomerCredits.getCustomer=(indek)=>{
  CustomerCredits.customer.getOne(indek,
  getEV('customer_id_'+indek),
  (paket)=>{
    setEV('sales_tax_id_'+indek,'');
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      var address_array=JSON.parse(d.address);
      var discount_terms=JSON.parse(d.discount_terms);
      var address=address_array[0];
      
      setEV('customer_name_'+indek,d.name);
      setEV('customer_address_'+indek,toAddress(address));
      setEV('sales_tax_id_'+indek,address.sales_tax_id);
      setEV('sales_rep_id_'+indek,d.sales_rep_id);
      setEV('customer_po_'+indek,d.customer_po);
      setEV('credit_displayed_terms_'+indek,discount_terms.displayed);
      
      bingkai[indek].gl_account_id=d.sales_account_id;
      bingkai[indek].customer_address=address_array;
      bingkai[indek].discount_terms=discount_terms;
    }
    CustomerCredits.getSalesTax(indek);
    CustomerCredits.invoice.setRows(indek,[]);// new row;
    CustomerCredits.getInvoices(indek,"");
  });
}

CustomerCredits.getSalesTax=(indek)=>{
  CustomerCredits.salesTaxes.getOne(indek,
  getEV('sales_tax_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields, paket.data);
      bingkai[indek].sales_tax_rate=d.rate;
      setEV('sales_tax_rate_'+indek,bingkai[indek].sales_tax_rate+'%');
    }else{
      bingkai[indek].sales_tax_rate=0;
      setEV('sales_tax_rate_'+indek,'0%');
    }
    CustomerCredits.calculateTotal(indek);
  });
}

CustomerCredits.invoice.setRows=(indek,isi)=>{
  if(isi===undefined)isi=[];
  var panjang=isi.length;
  var html=CustomerCredits.invoice.tableHead(indek);
  var amount_invoice=0;
  var tax_invoice=0;
  
  bingkai[indek].invoice_detail=isi;
  
  for (var i=0;i<panjang;i++){
    html+='<tr>'
//    +'<td align="center">'+isi[i].so_no+'</td>'
//    +'<td align="center">'+isi[i].item_id+'</td>'
//    +'<td align="center">'+isi[i].quantity+'</td>'  
    +'<td>'
      +'<input type="text" value="'+isi[i].so_no+'" size="6" disabled>'
    +'</td>'
    

    +'<td align="center" style="padding:0;margin:0;">'
      +'<input type="text" disabled'
      +' id="invoice_item_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].item_id+'"'
      +' style="text-align:left"'
      +' size="10" >'
      
      // description ini sebagai pengganti item_id, 
      // bila tidak ada item_id
      +'<input type="text" disabled hidden'
      +' value="'+isi[i].description+'">'
    +'</td>'

    +'<td align="center" style="margin:0;padding:0">'
      +'<input type="text" disabled '
      +' id="invoice_quantity_'+i+'_'+indek+'"'
      +' value="'+isi[i].quantity+'"'
      +' style="text-align:center"'
      +' size="3" >'
      +'</td>'

    +'<td align="center" style="margin:0;padding:0">'
      +'<input type="text"'
      +' id="invoice_returned_'+i+'_'+indek+'"'
      +' value="'+isi[i].returned+'"'
      +' onchange="CustomerCredits.invoice.setCell(\''+indek+'\''
      +',\'invoice_returned_'+i+'_'+indek+'\')"'
      +' onfocus="this.select()"'
      +' style="text-align:center"'
      +' size="3" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="invoice_description_'+i+'_'+indek+'"'
      +' value="'+isi[i].description_edit+'"'
      +' onchange="CustomerCredits.invoice.setCell(\''+indek+'\''
      +',\'invoice_description_'+i+'_'+indek+'\')"'
      +' onfocus="this.select()"'
      +' style="text-align:left"'
      +' size="15" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text" '
      +' id="invoice_gl_account_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].gl_account_id+'"'
      +' onchange="CustomerCredits.invoice.setCell(\''+indek+'\''
      +',\'invoice_gl_account_id_'+i+'_'+indek+'\')"'
      +' onfocus="this.select()" '
      +' style="text-align:center;"'
      +' size="8" >'
      +'</td>'
      
    +'<td><button type="button" id="btn_find"'
      +' onclick="CustomerCredits.account.getPaging(\''+indek+'\''
      +',\'invoice_gl_account_id_'+i+'_'+indek+'\''
      +',\''+i+'\''
      +',\''+CLASS_INCOME+'\');">'
      +'</button>'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="invoice_unit_price_'+i+'_'+indek+'"'
      +' value="'+isi[i].unit_price+'"'
      +' onchange="CustomerCredits.invoice.setCell(\''+indek+'\''
      +',\'invoice_unit_price_'+i+'_'+indek+'\')"'
      +' onfocus="this.select()"'
      +' style="text-align:right"'
      +' size="6" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="invoice_tax_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].tax_id+'"'
      +' onchange="CustomerCredits.invoice.setCell(\''+indek+'\''
      +',\'invoice_tax_id_'+i+'_'+indek+'\')"'
      +' onfocus="this.select()"'
      +' style="text-align:center;"'
      +' size="1" >'

      +'<input type="text" disabled'
      +' id="invoice_tax_calculate_'+i+'_'+indek+'"'
      +' value="'+isi[i].tax_calculate+'"'
      +' style="text-align:center;"'
      +' size="1" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="invoice_amount_'+i+'_'+indek+'"'
      +' value="'+Number(isi[i].amount)+'"'
      +' onchange="CustomerCredits.invoice.setCell(\''+indek+'\''
      +',\'invoice_amount_'+i+'_'+indek+'\')"'
      +' onfocus="this.select()" '
      +' style="text-align:right"'
      +' size="9" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="invoice_job_phase_cost_'+i+'_'+indek+'"'
      +' value="'+isi[i].job_phase_cost+'"'
      +' onchange="CustomerCredits.invoice.setCell(\''+indek+'\''
      +',\'invoice_job_phase_cost_'+i+'_'+indek+'\',\'invoice\')" '
      +' onfocus="this.select()"'
      +' style="text-align:center"'
      +' size="5" >'
      +'</td>'
      
    +'<td style="padding:0;margin:0;">'
      +'<button type="button"'
      +' id="btn_find"'
      +' onclick="CustomerCredits.job.getPaging(\''+indek+'\''
      +',\'invoice_job_phase_cost_'+i+'_'+indek+'\''
      +',\''+i+'\');">'
      +'</button></td>'
    +'</tr>';

    amount_invoice+=Number(isi[i].amount);

    if(String(isi[i].tax_id).length>0){
      if(Number(isi[i].tax_calculate)==1){
        tax_invoice+=Number(isi[i].amount);
      }
    }
  }
  html+=CustomerCredits.invoice.tableFoot(indek);
  var budi=JSON.stringify(isi);
  document.getElementById('invoice_detail_'+indek).innerHTML=html;
  bingkai[indek].amount_invoice=amount_invoice;
  bingkai[indek].tax_invoice=tax_invoice;

  CustomerCredits.calculateTotal(indek);
  if(panjang==0)CustomerCredits.invoice.addRow(indek,0);
}

CustomerCredits.invoice.tableHead=(indek)=>{
  return '<table border=0 style="width:100%;" >'
  +'<thead>'
  +'<tr>'
  +'<th>Order #</th>'
  //+'<th>Description</th>'
  +'<th>Item ID</th>'
  +'<th>Quantity</th>'
  +'<th>Returned</th>'
  +'<th>Description<i class="required">*</i></th>'
  +'<th colspan="2">G/L Account<i class="required">*</i></th>'
  +'<th>Unit Price</th>'
  +'<th>Tax</th>'
  +'<th>Amount<i class="required">*</i></th>'
  +'<th colspan="2">Job ID</th>'
  +'</tr>'
  +'</thead>';
}

CustomerCredits.invoice.tableFoot=(indek)=>{
  return '<tfoot>'
  +'<tr>'
  +'<td colspan="1">&nbsp;</td>'
  +'</tr>'
  +'</tfoot>'
  +'</table>';
}

CustomerCredits.invoice.addRow=(indek,baris)=>{
  var oldBasket=[];
  var newBasket=[];
  
  oldBasket=bingkai[indek].invoice_detail;
  for(var i=0;i<oldBasket.length;i++){
    newBasket.push(oldBasket[i]);
    if(i==baris) newRow(newBasket);
  }
  if(oldBasket.length==0) newRow(newBasket);
  CustomerCredits.invoice.setRows(indek,newBasket);
  // if(baris>0) document.getElementById('quantity_'+(baris+1)+'_'+indek).focus();
  
  function newRow(newBas){
    var myItem={};
    myItem.so_no='';
    myItem.description='';
    myItem.row_id=newBas.length+1;
    myItem.quantity=0;
    myItem.returned=0;
    myItem.item_id='';
    myItem.description_edit="";
    myItem.gl_account_id=bingkai[indek].data_default.gl_account_id;
    myItem.unit_price=0;
    myItem.tax_id="";
    myItem.tax_calculate=0;
    myItem.amount=0;
    myItem.job_phase_cost='';
    newBasket.push(myItem);
  }
}

CustomerCredits.getInvoices=(indek,invoice_no)=>{
  // remove list
  var x=document.getElementById('invoice_no_'+indek);  
  while(x.options.length >0) x.remove(0);

  var option3=document.createElement("option");
  option3.text=CustomerCredits.blank;
  document.getElementById('invoice_no_'+indek).add(option3);

  db.run(indek,{
    query:"SELECT invoice_no"
      +" FROM invoice_credit_sum"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+getEV('customer_id_'+indek)+"'"
      +" AND amount != 0" // NOT EQUAL
      +" GROUP BY invoice_no"
  },(paket)=>{
    if(invoice_no!=''){
      var option2=document.createElement("option");
      option2.text=invoice_no;
      document.getElementById('invoice_no_'+indek).add(option2);      
      document.getElementById('invoice_no_'+indek).value=invoice_no;
    }
    if(paket.err.id==0 && paket.count>0){
      var d=objectMany(paket.fields,paket.data)
      for (var x in d){
        if(d[x].invoice_no!=invoice_no){
          var option=document.createElement("option");
          option.text=d[x].invoice_no;
          document.getElementById('invoice_no_'+indek).add(option);
        }
      }
    }

    CustomerCredits.aktifTab(indek,0);

    if(invoice_no!=''){// edit condition
      CustomerCredits.aktifTab(indek,1);
    }

    if(bingkai[indek].metode==MODE_CREATE){
      if(bingkai[indek].invoice_no==""){// new condition
        if(paket.count>0){
          CustomerCredits.aktifTab(indek,1);
        }
      }
    }
  });
}

CustomerCredits.aktifTab=(indek,bool)=>{
  if(bool==0){// default
    document.getElementById('detail_invoice_'+indek).open=false;
    document.getElementById('detail_credit_'+indek).open=true;
  }else{
    document.getElementById('detail_invoice_'+indek).open=true;
    document.getElementById('detail_credit_'+indek).open=false;
  }
}

CustomerCredits.getInvoiceItem=(indek)=>{
  var invoice_no=getEV('invoice_no_'+indek);
  if(getEV('invoice_no_'+indek)==CustomerCredits.blank){
    CustomerCredits.invoice.setRows(indek,[]);
    // CustomerCredits.aktifTab(indek,0);
    return;
  }
  db.run(indek,{
    query:"SELECT "
      //--select header--//
      
      +" customer_po,"
      +" discount_terms,"
      +" sales_rep_id,"
      +" ar_account_id,"
      +" sales_tax_id,"
      +" freight_amount,"
      
      //--select detail--//
      +" so_no,"
      +" row_id,"
      +" item_id,"
      +" description,"
      +" description AS description_edit,"
      +" gl_account_id,"
      +" quantity,"
      +" quantity AS returned,"
      +" unit_price,"
      +" tax_id,"
      +" tax_calculate,"
      +" amount,"
      +" job_phase_cost"
      +" FROM invoice_credit_sum "
      
      //--where--//
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+getEV('customer_id_'+indek)+"'"
      +" AND invoice_no='"+invoice_no+"'"
      +" AND amount != 0" // NOT EQUAL
  },(paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectMany(paket.fields,paket.data);
      var d0=d[0];
      var dt=JSON.parse(d0.discount_terms);

      //--header--//
      setEV('customer_po_'+indek, d0.customer_po);
      setEV('credit_displayed_terms_'+indek, dt.displayed);
      setEV('sales_rep_id_'+indek, d0.sales_rep_id);
      setEV('ar_account_id_'+indek, d0.ar_account_id);
      setEV('sales_tax_id_'+indek, d0.sales_tax_id);
      setEV('freight_amount_'+indek, d0.freight_amount);
      bingkai[indek].discount_terms=dt;
      //--detail--//
      CustomerCredits.invoice.setRows(indek, d);
    }else{
      CustomerCredits.invoice.setRows(indek,[]);
    }
  });
}

CustomerCredits.invoice.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].invoice_detail;
  var baru = [];
  var isiEdit = {};  
  var amount_invoice=0;
  var tax_invoice=0;

  for (var i=0;i<isi.length; i++){
    isiEdit=isi[i];
    
    if(id_kolom==('invoice_returned_'+i+'_'+indek)){
      isiEdit.returned=getEV(id_kolom);
      isiEdit.amount=(isiEdit.returned*isiEdit.unit_price);
      baru.push(isiEdit);
      setEV('invoice_amount_'+i+'_'+indek,
        Number(isiEdit.amount));
      
    }else if(id_kolom==('invoice_description_'+i+'_'+indek)){
      isiEdit.description_edit=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else if(id_kolom==('invoice_gl_account_id_'+i+'_'+indek)){
      isiEdit.gl_account_id=getEV(id_kolom);
      baru.push(isiEdit);
    
    }else if(id_kolom==('invoice_unit_price_'+i+'_'+indek)){
      isiEdit.unit_price=getEV(id_kolom);
      isiEdit.amount=isiEdit.returned*isiEdit.unit_price;
      baru.push(isiEdit);
      setEV('invoice_amount_'+i+'_'+indek,
        Number(isiEdit.amount));
      
    }else if(id_kolom==('invoice_tax_id_'+i+'_'+indek)){
      isiEdit.tax_id=getEV(id_kolom);
      baru.push(isiEdit);
      CustomerCredits.invoice.getItemTax(indek,i);
      
    }else if(id_kolom==('invoice_tax_calculate_'+i+'_'+indek)){
      isiEdit.tax_calculate=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else if(id_kolom==('invoice_amount_'+i+'_'+indek)){
      isiEdit.amount=getEV(id_kolom);
      if(isiEdit.quantity>0){
        isiEdit.unit_price=(isiEdit.amount/isiEdit.quantity);
      }
      baru.push(isiEdit);
      setEV('invoice_unit_price_'+i+'_'+indek,isiEdit.unit_price);
      
    }else if(id_kolom==('invoice_job_phase_cost_'+i+'_'+indek)){
      isiEdit.job_phase_cost=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else{
      baru.push(isi[i]);
    }

    amount_invoice+=Number(isi[i].amount);    
    if(String(isi[i].tax_id).length>0){
      if(Number(isi[i].tax_calculate)==1){
        tax_invoice+=Number(isi[i].amount);
      }
    }
  }
  
  bingkai[indek].amount_invoice=amount_invoice;
  bingkai[indek].tax_invoice=tax_invoice;

  CustomerCredits.calculateTotal(indek);
}

CustomerCredits.invoice.getItemTax=(indek,baris)=>{
  setEV('invoice_tax_calculate_'+baris+'_'+indek,0);
  CustomerCredits.invoice.setCell(indek,
    'invoice_tax_calculate_'+baris+'_'+indek);

  CustomerCredits.itemTax.getOne(indek,
  getEV('invoice_tax_id_'+baris+'_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('invoice_tax_calculate_'+baris+'_'+indek, d.calculate);
      CustomerCredits.invoice.setCell(indek,
        'invoice_tax_calculate_'+baris+'_'+indek);
    }
  })
}

CustomerCredits.setSalesRep=(indek,d)=>{
  setEV('sales_rep_id_'+indek, d.sales_rep_id);
}

CustomerCredits.showTerms=(indek)=>{
  if(bingkai[indek].discount_terms==undefined){
    DiscountTerms.getColumn(indek);
  }else{
    bingkai[indek].discount_terms.date=getEV('credit_date_'+indek);
    bingkai[indek].discount_terms.amount=getEV('credit_total_'+indek);
  }
  DiscountTerms.show(indek);
}

CustomerCredits.setTerms=(indek)=>{
  setEV('credit_displayed_terms_'+indek,
    bingkai[indek].discount_terms.displayed);
}

CustomerCredits.setItem=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var baris=bingkai[indek].baris;
  document.getElementById(id_kolom).value=data.item_id;
  CustomerCredits.setCell(indek,id_kolom);
}

CustomerCredits.getItem=(indek,baris)=>{
  CustomerCredits.item.getOne(indek,
  getEV('item_id_'+baris+'_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('item_id_'+baris+'_'+indek,d.item_id);
      setEV('description_'+baris+'_'+indek,d.name_for_sales);
      setEV('gl_account_id_'+baris+'_'+indek,d.sales_account_id);
      //setEV('unit_price_'+baris+'_'+indek,d.price);
      setEV('unit_price_'+baris+'_'+indek,0);
      setEV('tax_id_'+baris+'_'+indek,d.tax_id);
      setEV('tax_calculate_'+baris+'_'+indek,d.tax_calculate);
        
      CustomerCredits.setCell(indek,'description_'+baris+'_'+indek);
      CustomerCredits.setCell(indek,'gl_account_id_'+baris+'_'+indek);
      CustomerCredits.setCell(indek,'unit_price_'+baris+'_'+indek);
      CustomerCredits.setCell(indek,'tax_id_'+baris+'_'+indek);
      CustomerCredits.setCell(indek,'tax_calculate_'+baris+'_'+indek);
    }
  });  
}

CustomerCredits.setAccount=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var baris=bingkai[indek].baris;

  switch(id_kolom){
    case "ar_account_id_"+indek:
      setEV('ar_account_id_'+indek,data.account_id);
      break;
    case "gl_account_id_"+baris+'_'+indek:
      setEV(id_kolom,data.account_id);
      CustomerCredits.setCell(indek,id_kolom);
      break;
    case "invoice_gl_account_id_"+baris+'_'+indek:
      setEV(id_kolom,data.account_id);
      CustomerCredits.invoice.setCell(indek,id_kolom);
      break;
    case "freight_account_id_"+indek:
      setEV('freight_account_id_'+indek,data.account_id);
      break;
    default:
      alert('['+id_kolom+'] undefined!?');
  }
}

CustomerCredits.getItemTax=(indek,baris)=>{
  setEV('tax_calculate_'+baris+'_'+indek,0);
  CustomerCredits.setCell(indek,'tax_calculate_'+baris+'_'+indek);

  CustomerCredits.itemTax.getOne(indek,
  getEV('tax_id_'+baris+'_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('tax_calculate_'+baris+'_'+indek,d.calculate);
      CustomerCredits.setCell(indek,'tax_calculate_'+baris+'_'+indek);
    }
  })
}

CustomerCredits.setJob=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var baris=bingkai[indek].baris;
  setEV(id_kolom, d);
  switch(id_kolom){
    case "job_phase_cost_"+baris+'_'+indek:
      CustomerCredits.setCell(indek,id_kolom);
      break;
    case "invoice_job_phase_cost_"+baris+'_'+indek:
      CustomerCredits.invoice.setCell(indek,id_kolom);
      break;
    default:
      alert('['+id_kolom+'] undefined!?');
  }
}

CustomerCredits.setSalesTax=(indek,data)=>{
  setEV('sales_tax_id_'+indek, data.sales_tax_id);
  setEV('sales_tax_rate_'+indek,data.sales_tax_rate+'%');
  bingkai[indek].sales_tax_rate=data.sales_tax_rate;
  
  CustomerCredits.calculateTotal(indek);
  CustomerCredits.getSalesTax(indek);
}

CustomerCredits.createExecute=(indek)=>{

  var discount_terms=JSON.stringify(bingkai[indek].discount_terms)
  var credit_detail=JSON.stringify(bingkai[indek].credit_detail);
  var invoice_no=getEV("invoice_no_"+indek);
  var invoice_detail=JSON.stringify(bingkai[indek].invoice_detail);
  var some_note=JSON.stringify([
    "add some note for this customer credit memos",
    "new-1"
  ]);
  
  if(invoice_no==CustomerCredits.blank) invoice_no='';
  
  db.execute(indek,{
    query:"INSERT INTO customer_credits "
      +"(admin_name,company_id,customer_id,credit_no,date"
      +",customer_po,discount_terms,sales_rep_id,return_authorization"
      +",detail,invoice_no,invoice_detail,ar_account_id,sales_tax_id"
      +",freight_account_id,freight_amount,note)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEV("customer_id_"+indek)+"'"
      +",'"+getEV("credit_no_"+indek)+"'"
      +",'"+getEV("credit_date_"+indek)+"'"
      +",'"+getEV("customer_po_"+indek)+"'"
      +",'"+discount_terms+"'"
      +",'"+getEV("sales_rep_id_"+indek)+"'"
      +",'"+getEV("return_authorization_"+indek)+"'"
      +",'"+credit_detail+"'"
      +",'"+invoice_no+"'"
      +",'"+invoice_detail+"'"
      +",'"+getEV("freight_account_id_"+indek)+"'"
      +",'"+getEV("ar_account_id_"+indek)+"'"
      +",'"+getEV("sales_tax_id_"+indek)+"'"
      +",'"+getEV("freight_amount_"+indek)+"'"
      +",'"+some_note+"'"
      +")"
  });
}

CustomerCredits.readOne=function(indek,callback){
  db.execute(indek,{
    query:"SELECT * "
      +" FROM customer_credits"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"'"
      +" AND credit_no='"+bingkai[indek].credit_no+"'"
  },(paket)=>{
    if (paket.err.id==0) {
      var d=objectOne(paket.fields,paket.data);
      var address=JSON.parse(d.customer_address);
      var discount_terms=JSON.parse(d.discount_terms);
      var credit_detail=JSON.parse(d.detail);
      var invoice_detail=JSON.parse(d.invoice_detail);
      
      setEV('customer_id_'+indek, d.customer_id);
      setEV('customer_name_'+indek, d.customer_name);
      setEV('customer_address_'+indek, toAddress(address));

      setEV('credit_no_'+indek, d.credit_no);
      setEV('credit_date_'+indek, d.date);
      setEV('credit_date_fake_'+indek, tglWest(d.date));
      setEV('customer_po_'+indek, d.customer_po);
      setEV('credit_displayed_terms_'+indek, discount_terms.displayed);
      
      setEV('sales_rep_id_'+indek,d.sales_rep_id);
      setEV('return_authorization_'+indek,d.return_authorization);

      setEV('ar_account_id_'+indek, d.ar_account_id);
      setEV('sales_tax_id_'+indek,d.sales_tax_id);
      setEV('sales_tax_rate_'+indek, d.sales_tax_rate+' %');
      
      //setEV('sales_tax_'+indek,(d.sales_tax_amount).toFixed(2));
      setEV('freight_account_id_'+indek, d.freight_account_id);
      setEV('freight_amount_'+indek, d.freight_amount);
      setEV('credit_total_'+indek, d.total);
      
      if(d.invoice_no!=""){
        var option=document.createElement("option");
        option.text=d.invoice_no;
        document.getElementById('invoice_no_'+indek).add(option);      
        setEV('invoice_no_'+indek,d.invoice_no);
      }
      
      // don't forget, simpan di lokal storage;
      bingkai[indek].discount_terms= discount_terms;
      bingkai[indek].sales_tax_rate=d.sales_tax_rate;
      bingkai[indek].invoice_no= d.invoice_no;
      
      CustomerCredits.setRows(indek, credit_detail );
      CustomerCredits.invoice.setRows(indek, invoice_detail );
      CustomerCredits.getInvoices(indek, d.invoice_no);

      message.none(indek);
    }
    
    return callback();
  });
}

CustomerCredits.formUpdate=(indek,customer_id,credit_no)=>{
  bingkai[indek].customer_id=customer_id;
  bingkai[indek].credit_no=credit_no;
  CustomerCredits.form.modeUpdate(indek);
}

CustomerCredits.updateExecute=(indek)=>{
  var discount_terms=JSON.stringify(bingkai[indek].discount_terms);
  var credit_detail=JSON.stringify(bingkai[indek].credit_detail);
  var invoice_no=getEV("invoice_no_"+indek);
  var invoice_detail=JSON.stringify(bingkai[indek].invoice_detail);
  var some_note=JSON.stringify([
    "add some note for this customer credit memos",
    "edit1"
  ]);
  
  if(invoice_no==CustomerCredits.blank) invoice_no='';

  db.execute(indek,{
    query:"UPDATE customer_credits"
      +" set customer_id='"+getEV("customer_id_"+indek)+"',"
      +" credit_no='"+getEV("credit_no_"+indek)+"',"
      +" date='"+getEV("credit_date_"+indek)+"',"
      +" customer_po='"+getEV("customer_po_"+indek)+"',"
      +" discount_terms='"+discount_terms+"',"
      +" sales_rep_id='"+getEV("sales_rep_id_"+indek)+"',"
      +" return_authorization='"+getEV("return_authorization_"+indek)+"',"
      +" detail='"+credit_detail+"',"
      +" invoice_no='"+invoice_no+"',"
      +" invoice_detail='"+invoice_detail+"',"
      +" ar_account_id='"+getEV("ar_account_id_"+indek)+"',"
      +" sales_tax_id='"+getEV("sales_tax_id_"+indek)+"',"
      +" freight_account_id='"+getEV("freight_account_id_"+indek)+"',"
      +" freight_amount='"+getEV("freight_amount_"+indek)+"',"
      +" note='"+some_note+"'"
      
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"'"
      +" AND credit_no='"+bingkai[indek].credit_no+"'"
  },(p)=>{
    if(p.err.id==0) {
      CustomerCredits.deadPath(indek);
      bingkai[indek].customer_id=getEV('customer_id_'+indek);
      bingkai[indek].credit_no=getEV('credit_no_'+indek);
    }
  });
}

CustomerCredits.formDelete=(indek,customer_id,credit_no)=>{
  bingkai[indek].customer_id=customer_id;
  bingkai[indek].credit_no=credit_no;
  CustomerCredits.form.modeDelete(indek);
}

CustomerCredits.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM customer_credits"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"'"
      +" AND credit_no='"+bingkai[indek].credit_no+"'"
  },(p)=>{
    if(p.err.id==0) CustomerCredits.deadPath(indek);
  });
}

CustomerCredits.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM customer_credits "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND credit_no LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR customer_name LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR date LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

CustomerCredits.search=(indek)=>{
  CustomerCredits.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT customer_id,credit_no,date,total,"
        +"customer_name,invoice_no,"
        +"user_name,date_modified "
        +" FROM customer_credits "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND credit_no LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR customer_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR date LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      CustomerCredits.readShow(indek);
    });
  });
}

CustomerCredits.exportExecute=(indek)=>{
  var table_name=CustomerCredits.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

CustomerCredits.importExecute=(indek)=>{
  var n=0;
  var m='<p>[Start]</p>';
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO customer_credits "
        +"(admin_name,company_id"
        +",customer_id,credit_no,date"
        +",customer_po,discount_terms,sales_rep_id,return_authorization"
        +",detail,invoice_no,invoice_detail,ar_account_id,sales_tax_id"
        +",freight_account_id,freight_amount,note)"
        +" VALUES "
        +"('"+bingkai[indek].admin.name+"'"
        +",'"+bingkai[indek].company.id+"'"
        +",'"+d[i][1]+"'" // customer_id
        +",'"+d[i][2]+"'" // credit_no
        +",'"+d[i][3]+"'" // date
        +",'"+d[i][4]+"'" // customer_po
        +",'"+d[i][5]+"'" // discount_terms
        +",'"+d[i][6]+"'" // sales_rep
        +",'"+d[i][7]+"'" // return author
        +",'"+d[i][8]+"'" // detail
        +",'"+d[i][9]+"'" // invoice_no
        +",'"+d[i][10]+"'" // detail
        +",'"+d[i][11]+"'" // ar_account_id
        +",'"+d[i][12]+"'" // sales_tax_id
        +",'"+d[i][13]+"'" // freight_account_id
        +",'"+d[i][14]+"'" // freight_amount
        +",'"+d[i][15]+"'" // note
        +")"
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

CustomerCredits.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT customer_id,credit_no,date,total,"
      +"customer_name,invoice_no,"
      +"user_name,date_modified"
      +" FROM customer_credits "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date,customer_id,credit_no"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    CustomerCredits.selectShow(indek);
  });
}

CustomerCredits.selectShow=(indek)=>{
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
      +'<th colspan="2">Credit #</th>'
      +'<th>Date</th>'
      +'<th>Amount</th>'
      +'<th>Customer Name</th>'
      +'<th>Invoice #</th>'
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
        +'<td align="left">'+d[x].credit_no+'</td>'
        +'<td align="center">'+tglWest(d[x].date)+'</td>'
        +'<td align="right">'+Number(d[x].total)+'</td>'
        +'<td align="left">'+d[x].customer_name+'</td>'
        +'<td align="left">'+d[x].invoice_no+'</td>'
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

CustomerCredits.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM customer_credits"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND customer_id='"+d[i].customer_id+"'"
          +" AND credit_no='"+d[i].credit_no+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

CustomerCredits.properties=(indek)=>{
  db.execute(indek,{
    query:" SELECT file_id" 
      +" FROM customer_credits"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"'"
      +" AND credit_no='"+bingkai[indek].credit_no+"'"
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

CustomerCredits.duplicate=(indek)=>{
  var id='copy_of '+getEV('credit_no_'+indek);
  setEV('credit_no_'+indek,id);
  focus('credit_no_'+indek);
}

CustomerCredits.deadPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{CustomerCredits.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{CustomerCredits.properties(indek);})
  }
}





// eof: 1475;1381;1529;1567;1597;1613;1669;1646;1651;1655;
