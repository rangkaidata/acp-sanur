/*
 * auth: budiono;
 * code: I1;
 * path: /accounting/sales/quotes.js;
 * ---------------------------------;
 * date: dec-01, 11:17, fri-2023; new;
 * -----------------------------; happy new year 2024;
 * edit: jan-19, 21:21, fri-2024; mringkas;
 * edit: jul-24, 06:11, wed-2024; r9;
 * edit: aug-11, 15:26, sun-2024; r12;
 * edit: sep-30, 16:19, mon-2024; #19;
 * edit: nov-28, 16:32, thu-2024; #27; locker();
 * edit: dec-01, 16:07, mon-2024; #27; 2;
 * edit: dec-30, 16:51, mon-2024; #32; properties+duplicate;item_tax_id->tax_id
 * -----------------------------; happy new year 2025;
 * edit: feb-25, 07:29, tue-2025; #41; file_id;
 * edit: mar-14, 16:02, fri-2025; #43; deep-folder;
 * edit: mar-27, 08:45, thu-2025; #45; ctables;cstructure;
 * edit: apr-24, 20:30, thu-2025; #50; export csv;
 * edit: aug-15, 20:48, fri-2025; #68; add date obj;
 * edit: oct-31, 14:24, fri-2025; #80; 
 */ 
  
'use strict';

var Quotes={};
Quotes.hidePreview=false;

Quotes.table_name='quotes';
Quotes.form=new ActionForm2(Quotes);
Quotes.grid=new Grid(Quotes);
Quotes.customer=new CustomerLook(Quotes);
Quotes.ship=new ShipMethodLook(Quotes);
Quotes.salesrep=new SalesRepLook(Quotes);
Quotes.item=new ItemLook(Quotes);
Quotes.itemTaxes=new ItemTaxesLook(Quotes);
Quotes.account=new AccountLook(Quotes);
Quotes.job=new JobLook(Quotes);
Quotes.salesTax=new SalesTaxLook(Quotes);

Quotes.show=(karcis)=>{
  karcis.modul=Quotes.table_name;
  karcis.have_child=true;

  var baru=exist(karcis);
  if(baru==-1){
    var newTxs=new BingkaiUtama(karcis);
    var indek=newTxs.show();
    createFolder(indek,()=>{
      Quotes.form.modePaging(indek);
      Quotes.getDefault(indek);
    });
  }else{
    show(baru);
  }
}

Quotes.getDefault=(indek)=>{
  CustomerDefaults.getDefault(indek);
  ShipToCustomer.getDefault(indek)
  
  bingkai[indek].customer_address=[];
  bingkai[indek].sum_item_amount=0.00;
  bingkai[indek].sum_tax_amount=0.00;
  bingkai[indek].sum_tax_rate=0.00;
}

Quotes.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM quotes "
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

Quotes.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Quotes.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
        query:"SELECT customer_id,customer_name,date,quote_no,total,"
        +" user_name,date_modified"
        +" FROM quotes"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY date,quote_no"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Quotes.readShow(indek);
    });
  })
}

Quotes.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;

  var html='<div style="padding:0.5rem;">'
  +content.title(indek)
  +content.message(indek)
  +TotalPagingLimit(indek)
  +'<table border=1>'
    +'<tr>'
    +'<th colspan="2">Date</th>'
    +'<th>Quote#</th>'
    +'<th>Amount</th>'
    +'<th>Customer Name</th>'
    +'<th>Owner</th>'
    +'<th>Modified</th>'
    +'<th colspan="3">Action</th>'
    +'</tr>';

  if(p.err.id===0){
    var x;
    for(x in d){
      n++;
      html+='<tr>'
      +'<td align="center">'+n+'</td>'
      +'<td align="center">'+tglWest(d[x].date)+'</td>'
      +'<td align="left">'+d[x].quote_no+'</td>'
      +'<td align="right">'+d[x].total+'</td>'
      +'<td align="left">'+xHTML(d[x].customer_name)+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'<td align="center">'
        +'<button type="button"'
        +' id="btn_change"'
        +' onclick="Quotes.formUpdate(\''+indek+'\''
        +',\''+d[x].customer_id+'\''
        +',\''+d[x].quote_no+'\');">'
        +'</button>'
        +'</td>'
      +'<td align="center">'
        +'<button type="button"'
        +' id="btn_delete"'
        +' onclick="Quotes.formDelete(\''+indek+'\''
        +',\''+d[x].customer_id+'\''
        +',\''+d[x].quote_no+'\');">'
        +'</button>'
        +'</td>'
        +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Quotes.form.addPagingFn(indek);
}

Quotes.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)

    +'<form autocomplete="off">'
    +'<div style="display:grid;'
      +'grid-template-columns:repeat(2,1fr);'
      +'padding-bottom:50px;">'

    +'<div>'
      +'<ul>'
        +'<li>'
          +'<label>Customer ID<i class="required">*</i></label>'
          +'<input type="text"'
            +' id="customer_id_'+indek+'"'
            +' onchange="Quotes.getCustomer(\''+indek+'\');"'
            +' size="16" >'
          +'<button type="button"'
            +' id="btn_find" '
            +' onclick="Quotes.customer.getPaging(\''+indek+'\''
            +',\'customer_id_'+indek+'\')">'
            +'</button>'
        +'</li>'
        +'<li><label>Name</label>'
          +'<input type="text" disabled '
          +' id="customer_name_'+indek+'"'
          +' style="width:14.6rem;">'
        +'</li>'
        +'<li><label>Bill To</label>'
          +'<textarea id="customer_address_'+indek+'"'
          +' placeholder="Bill To"'
          +' style="resize:none;width:14.6rem;height:50px;"'
          +' spellcheck=false'
          +'  disabled>'
          +'</textarea>'
        +'</li>'
      +'</ul>'
    +'</div>'
    
    +'<div>'
      +'<ul>'
        +'<li><label>Quote#<i class="required">*</i></label>'
          +'<input type="text"'
          +' id="quote_no_'+indek+'"'
          +' size="9">'
        +'</li>'
        +'<li><label>Date</label>'
          +'<input type="date"'
            +' id="quote_date_'+indek+'"'
            +' onblur="dateFakeShow('+indek+',\'quote_date\')"'
            +' style="display:none;">'
          +'<input type="text"'
            +' id="quote_date_fake_'+indek+'"'
            +' onfocus="dateRealShow('+indek+',\'quote_date\')"'
            +' size="10">'
        +'</li>'
        +'<li><label>Good Thru</label>'
          +'<input type="date"'
            +' id="good_thru_'+indek+'"'
            +' onblur="dateFakeShow('+indek+',\'good_thru\')"'
            +' style="display:none;">'
          +'<input type="text"'
            +' id="good_thru_fake_'+indek+'"'
            +' onfocus="dateRealShow('+indek+',\'good_thru\')"'
            +' size="10">'
        +'</li>'
        +'<li>'
          +'<label>'
            +'<input type="button"'
            +' onclick="ShipToCustomer.show(\''+indek+'\')"'
            +' value="Ship to">'
          +'</label>'
          +'<textarea '
            +' id="ship_address_'+indek+'" '
            +' placeholder="Ship To"'
            +' style="resize:none;width:14.6rem;height:50px;"'
            +' spellcheck=false  disabled>'
          +'</textarea>'
        +'</li>'
      +'</ul>'
    +'</div>'
    +'</div>'

    +'<div style="display:grid;'
      +'grid-template-columns: repeat(4,1fr);'
      +'padding-bottom:20px;">'

      +'<div>'
        +'<label style="display:block;">Customer PO</label>'
        +'<input type="text"'
        +' id="customer_po_'+indek+'"'
        +' size="10">'
      +'</div>'
      +'<div>'  
        +'<label style="display:block;">Ship Via</label>'
        +'<input type="text"'
          +' id="ship_id_'+indek+'" '
          +' style="text-align:center;"'
          +' size="9">'
        +'<button type="button"'
          +' id="btn_find" '
          +' onclick="Quotes.ship.getPaging(\''+indek+'\''
          +',\'ship_id_'+indek+'\');">'
        +'</button>'
      +'</div>'
      +'<div>'
        +'<label style="display:block;">Terms</label>'
        +'<input type="text"'
          +' id="displayed_terms_'+indek+'"'
          +' size="15" disabled>'
        +'<button type="button" id="btn_find" '
          +' onclick="Quotes.showTerms(\''+indek+'\');">'
        +'</button>'
      +'</div>'
    +'<div>'
    +'<label style="display:block;">Sales Rep ID</label>'
      +'<input type="text" '
        +' id="sales_rep_id_'+indek+'" '
        +' size="15" >'
      +'<button type="button" id="btn_find" '
        +' onclick="Quotes.salesrep.getPaging(\''+indek+'\''
        +',\'sales_rep_id_'+indek+'\');">'
      +'</button>'
    +'</div>'
    +'</div>'
    +'<details open>'
      +'<summary>Quote Items</summary>'
      +'<div id="quote_detail_'+indek+'"'
      +' style="width:100%;overflow:auto;">'
    +'</details>'
    
//    +'<div style="display:grid;'
//      +'grid-template-columns: repeat(2,1fr);'
//      +'padding-bottom:50px;">'
    +'<div>'
      +'<div style="float:left;margin-right:3rem;">'
        +'<ul>'
          +'<li>'
            +'<label>A/R Account<i class="required">*</i></label>'
            +'<input type="text"'
              +' id="ar_account_id_'+indek+'"'
              +' size="12">'
            +'<button type="button"'
              +' id="btn_find" '
              +' onclick="Quotes.account.getPaging(\''+indek+'\''
              +',\'ar_account_id_'+indek+'\''
              +',-1'
              +',\''+CLASS_ASSET+'\')">'
            +'</button>'
          +'</li>'
          +'<li>'
            +'<label>Sales Tax ID</label>'
            +'<input type="text"'
              +' id="sales_tax_id_'+indek+'"'
              +' size="12">'
            +'<button type="button"'
              +' id="btn_find" '
              +' onclick="Quotes.salesTax.getPaging(\''+indek+'\''
              +',\'sales_tax_id_'+indek+'\')">'
            +' </button>'
          +'</li>'
          +'<li>'
            +'<label>Sales Tax Rate</label>'
            +'<input type="text" disabled'
              +' id="sales_tax_rate_'+indek+'"'
              +' style="text-align:center;"'
              +' size="6">'
          +'</li>'
        +'</ul>'
      +'</div>'
    
      +'<div style="float:left;margin-right:3rem;">'
        +'<ul>'
          +'<li>'
            +'<label>Sales Tax:</label>'
            +'<input type="text"'
              +' id="sales_tax_'+indek+'"'
              +' onfocus="this.select()"'
              +' style="text-align:right;" disabled'
              +' size="9" >'
          +'</li>'
          +'<li>'
            +'<label>Freight Account:</label>'
            +'<input type="text" '
              +' id="freight_account_id_'+indek+'" '
              +' size="9">'
              +'<button type="button" id="btn_find" '
              +' onclick="Quotes.account.getPaging(\''+indek+'\''
              +',\'freight_account_id_'+indek+'\',\''+indek+'\''
              +',\''+CLASS_COST_OF_SALES+'\')">'
              +'</button>'
          +'</li>'
          +'<li>'
            +'<label>Freight Amount:</label>'
            +'<input type="text"'
              +' id="freight_amount_'+indek+'"'
              +' onfocus="this.select()" '
              +' onchange="Quotes.calculateTotal(\''+indek+'\')"'
              +' style="text-align:right;"'
              +' size="9" >'
          +'</li>'

        +'</ul>'
      +'</div>'
    
      +'<div>'
        +'<ul>'
          +'<li>'
            +'<label>Quote Total</label>'
            +'<input type="text"'
              +' id="quote_total_'+indek+'"'
              +' style="text-align:right;"'
              +' disabled'
              +' size="9" >'        
          +'</li>'
        +'</ul>'
      +'</div>'
    +'</div>'
    +'<div style="clear:both;margin-top:5rem;">'
      +'<p><i class="required">* Required.</i></p>';
    +'</div>'
    +'</form>'
    +'</div>'

    
  content.html(indek,html);
  statusbar.ready(indek);

  document.getElementById('customer_id_'+indek).focus();
  document.getElementById('quote_date_'+indek).value=tglSekarang();
  document.getElementById('quote_date_fake_'+indek).value=tglWest(tglSekarang());

  Quotes.setRows(indek,[]);
  
  if(metode==MODE_CREATE) Quotes.setDefault(indek);
}

Quotes.setRows=(indek,isi)=>{
  if(isi===undefined)isi=[];
  var panjang=isi.length;
  var html=Quotes.tableHead(indek);
  var sum_item_amount=0;
  var sum_tax_amount=0;

  bingkai[indek].quote_detail=isi;
    
  for (var i=0;i<panjang;i++){
    html+='<tr>'
    +'<td align="center">'+(i+1)+'</td>'

    +'<td align="center" style="margin:0;padding:0">'
      +'<input type="text"'
      +' id="quantity_'+i+'_'+indek+'"'
      +' value="'+isi[i].quantity+'"'
      +' onfocus="this.select()" '
      +' onchange="Quotes.setCell(\''+indek+'\''
      +',\'quantity_'+i+'_'+indek+'\')"'
      +' style="text-align:center" '
      +' size="3" >'
      +'</td>'
            
    +'<td align="center" style="padding:0;margin:0;">'
      +'<input type="text"'
      +' id="item_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].item_id+'"'
      //+' style="text-align:left;width:100%;min-width:50px;"'
      +' onfocus="this.select()"'
      +' onchange="Quotes.setCell(\''+indek+'\''
      +',\'item_id_'+i+'_'+indek+'\')"'
      +' style="text-align:left;"'
      +' size="9"'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;">'
      +'<button type="button"'
        +' id="btn_find" '
        +' onclick="Quotes.item.getPaging(\''+indek+'\''
        +',\'item_id_'+i+'_'+indek+'\',\''+i+'\');">'
      +'</button>'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="description_'+i+'_'+indek+'"'
      +' value="'+isi[i].description+'"'
      +' onchange="Quotes.setCell(\''+indek+'\''
      +',\'description_'+i+'_'+indek+'\')"'
      +' onfocus="this.select()"'
      //+' style="text-align:left;width:100%;min-width:20px;"'
      +' style="text-align:left;"'
      +' size="15" >'
      +'</td>'
            
    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="gl_account_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].gl_account_id+'"'
      +' onfocus="this.select()" '
      +' onchange="Quotes.setCell(\''+indek+'\''
      +',\'gl_account_id_'+i+'_'+indek+'\')"'
      +' style="text-align:center"'
      +' size="8" >'
      +'</td>'
      
    +'<td><button type="button" id="btn_find" '
      +' onclick="Quotes.account.getPaging(\''+indek+'\''
      +',\'gl_account_id_'+i+'_'+indek+'\''
      +',\''+i+'\''
      +',\''+CLASS_INCOME+'\');">'
      +'</button>'
      +'</td>'
            
    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="unit_price_'+i+'_'+indek+'"'
      +' value="'+isi[i].unit_price+'"'
      +' onfocus="this.select()" '
      +' onchange="Quotes.setCell(\''+indek+'\''
      +',\'unit_price_'+i+'_'+indek+'\')"'
      +' style="text-align:right" '
      +' size="6" >'
      +'</td>'
            
    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="tax_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].tax_id+'"'
      +' onfocus="this.select()" '
      +' onchange="Quotes.setCell(\''+indek+'\''
      +',\'tax_id_'+i+'_'+indek+'\')"'
      +' style="text-align:center"'
      +' size="1" >'

      +'<input type="text"'
      +' id="tax_calculate_'+i+'_'+indek+'"'
      +' value="'+isi[i].tax_calculate+'"'
      +' style="text-align:center;"'
      +' disabled'
      +' size="1" >'
      +'</td>'
            
    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="amount_'+i+'_'+indek+'"'
      +' value="'+Number(isi[i].amount)+'"'
      +' onfocus="this.select()"'
      +' onchange="Quotes.setCell(\''+indek+'\''
      +',\'amount_'+i+'_'+indek+'\')"'
      +' style="text-align:right"'
      +' size="9" >'
      +'</td>'
      
    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text" '
      +' id="job_phase_cost_'+i+'_'+indek+'" '
      +' value="'+isi[i].job_phase_cost+'" '
      +' onfocus="this.select()"'
      +' onchange="Quotes.setCell(\''+indek+'\''
      +',\'job_phase_cost_'+i+'_'+indek+'\')" '
      +' size="5"'
      +'</td>'
      
    +'<td align="center" style="margin:0;padding:0">'
      +'<button type="button" id="btn_find"'
      +' onclick="Quotes.job.getPaging(\''+indek+'\''
      +',\'job_phase_cost_'+i+'_'+indek+'\''
      +',\''+i+'\');">'
      +'</button>'
      +'</td>'
            
    +'<td align="center" style="margin:0;padding:0">'
      +'<button type="button"'
      +' id="btn_add"'
      +' onclick="Quotes.addRow(\''+indek+'\','+i+')">'
      
      +'</button>'
      +'<button type="button"'
      +' id="btn_remove"'
      +' onclick="Quotes.removeRow(\''+indek+'\','+i+')">'
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
  var budi = JSON.stringify(isi);
  html+=Quotes.tableFoot(indek);
  document.getElementById('quote_detail_'+indek).innerHTML=html;
  
  bingkai[indek].sum_item_amount=sum_item_amount;
  bingkai[indek].sum_tax_amount=sum_tax_amount;
  
  Quotes.calculateTotal(indek);

  if(panjang==0)Quotes.addRow(indek,0);
}

Quotes.tableHead=(indek)=>{
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

Quotes.tableFoot=function(indek){
  return '<tfoot>'
    +'<tr>'
    +'<td>&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

Quotes.calculateTotal=(indek)=>{
  var itemAmount=Number(bingkai[indek].sum_item_amount) || 0;//without tax;
  var taxAmount=Number(bingkai[indek].sum_tax_amount) || 0;//with tax;
  var taxRate=Number(bingkai[indek].sales_tax_rate) || 0;
  var taxValue=Number(taxAmount)*Number(taxRate)/100;// item dengan pajak;
  var freightValue=Number(document.getElementById('freight_amount_'+indek).value) || 0;
  var quoteAmount=(itemAmount+taxValue+freightValue);
  
  document.getElementById('sales_tax_rate_'+indek).value=taxRate+' %';
  document.getElementById('sales_tax_'+indek).value=taxValue;
  document.getElementById('freight_amount_'+indek).value=freightValue;
  document.getElementById('quote_total_'+indek).value=quoteAmount;
}

Quotes.addRow=(indek,baris)=>{
  Quotes.gl_account_id=bingkai[indek].data_default.gl_account_id;
  Quotes.grid.addRow(indek,baris,bingkai[indek].quote_detail);
}

Quotes.newRow=(newBas)=>{
  newBas.push({
    'row_id':newBas.length+1,
    'quantity':0,
    'item_id':'',
    'description':'',
    'gl_account_id':Quotes.gl_account_id,
    'unit_price':0,
    'tax_id':0,
    'amount':0,
    'job_phase_cost':'',
    'tax_calculate':0
  });
}
  
Quotes.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].quote_detail;
  var baru=[];
  var isiEdit={};
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
      Quotes.getItem(indek,i);

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
      setEV('amount_'+i+'_'+indek, Number(isiEdit.amount));
      
    }else if(id_kolom==('tax_id_'+i+'_'+indek)){
      isiEdit.tax_id=getEV(id_kolom);
      baru.push(isiEdit);
      Quotes.getItemTax(indek,i);
      
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
  Quotes.calculateTotal(indek);
}

Quotes.removeRow=(indek,baris)=>{
  Quotes.grid.removeRow(indek,baris,bingkai[indek].quote_detail);
}

Quotes.setDefault=(indek)=>{
  var d=bingkai[indek].data_default;
//  var dt=JSON.parse(d.discount_terms);
  var dt=d.discount_terms;
  
  setEV('ar_account_id_'+indek, d.ar_account_id);
  setEV('displayed_terms_'+indek, dt.displayed);
  setEV('sales_tax_rate_'+indek,0);
  bingkai[indek].discount_terms=dt;
}

Quotes.setCustomer=(indek,data)=>{
  setEV('customer_id_'+indek,data.customer_id);
  Quotes.getCustomer(indek);
}

Quotes.getCustomer=(indek)=>{
  Quotes.customer.getOne(indek,
    getEV('customer_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      var ca=JSON.parse(d.address);
      var sa=ca[1];
      var dt=JSON.parse(d.discount_terms);

      setEV('customer_name_'+indek,d.name);
      setEV('customer_address_'+indek, toAddress(ca[0]));
      setEV('sales_tax_id_'+indek, ca[0].sales_tax_id);
      setEV('customer_po_'+indek, d.customer_po);
      setEV('ship_id_'+indek,d.ship_id);
      setEV('ship_address_'+indek, toAddress(sa));
      setEV('sales_rep_id_'+indek, d.sales_rep_id);
      setEV('displayed_terms_'+indek, dt.displayed);

      bingkai[indek].discount_terms=dt;
      bingkai[indek].customer_address=ca;
      bingkai[indek].ship_address=sa;
    }
    Quotes.getSalesTax(indek);
    Quotes.setRows(indek,[]);// new row;
  });
}

Quotes.getSalesTax=(indek)=>{
  Quotes.salesTax.getOne(indek,
    getEV('sales_tax_id_'+indek),
  (paket)=>{
    bingkai[indek].sales_tax_rate=0;
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      bingkai[indek].sales_tax_rate=d.rate;
    };
    Quotes.calculateTotal(indek);
  });
}

Quotes.setShipAddress=(indek)=>{
  var d=bingkai[indek].ship_address;
  var ship_address={
    "name":d.name,
    "street_1":d.street_1,
    "street_2":d.street_2,
    "city":d.city,
    "state":d.state,
    "zip":d.zip,
    "country":d.country
  }
  setEV('ship_address_'+indek, toAddress(ship_address));
}

Quotes.setShipMethod=(indek,d)=>{
  setEV('ship_id_'+indek, d.ship_id);
}

Quotes.showTerms=(indek)=>{
  bingkai[indek].discount_terms.date=getEV('quote_date_'+indek);
  bingkai[indek].discount_terms.amount=getEV('quote_total_'+indek);
  DiscountTerms.show(indek);
}

Quotes.setTerms=(indek)=>{
  setEV('displayed_terms_'
    +indek,bingkai[indek].discount_terms.displayed);
}

Quotes.setSalesRep=(indek,d)=>{
  setEV('sales_rep_id_'+indek, d.sales_rep_id);
}

Quotes.setItem=(indek,d)=>{  
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.item_id);
  Quotes.setCell(indek,id_kolom);
}

Quotes.getItem=(indek,baris)=>{
  Quotes.item.getOne(indek,
    getEV('item_id_'+baris+'_'+indek),
  (paket)=>{
    setEV('description_'+baris+'_'+indek, txt_undefined);
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('item_id_'+baris+'_'+indek, d.item_id);
      setEV('description_'+baris+'_'+indek, d.name_for_sales);
      setEV('gl_account_id_'+baris+'_'+indek, d.sales_account_id);
      setEV('unit_price_'+baris+'_'+indek, d.item_price);
      setEV('tax_id_'+baris+'_'+indek, d.tax_id);
      setEV('tax_calculate_'+baris+'_'+indek,d.tax_calculate);

      Quotes.setCell(indek,'description_'+baris+'_'+indek);
      Quotes.setCell(indek,'gl_account_id_'+baris+'_'+indek);
      Quotes.setCell(indek,'unit_price_'+baris+'_'+indek);
      Quotes.setCell(indek,'tax_id_'+baris+'_'+indek);
      Quotes.setCell(indek,'tax_calculate_'+baris+'_'+indek);
    }
  });
}

Quotes.getItemTax=(indek,baris)=>{
  setEV('tax_calculate_'+baris+'_'+indek, 0);
  Quotes.itemTaxes.getOne(indek,
    getEV('tax_id_'+baris+'_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('tax_calculate_'+baris+'_'+indek, d.calculate);
    }else {
      //
    }
    Quotes.setCell(indek,'tax_calculate_'+baris+'_'+indek);
  })
}

Quotes.setAccount=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var baris=bingkai[indek].baris;

  switch (id_kolom){
    case "ar_account_id_"+indek:
      setEV(id_kolom, data.account_id);    
      break;
    case "gl_account_id_"+baris+'_'+indek:
      setEV(id_kolom, data.account_id);
      Quotes.setCell(indek,id_kolom);
      break;
    case "freight_account_id_"+indek:
      setEV(id_kolom, data.account_id);
      Quotes.setCell(indek,id_kolom);
      break;
    default:
      alert('['+id_kolom+'] undefined');
  }
}

Quotes.setJob=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, data);
  Quotes.setCell(indek,id_kolom);
}

Quotes.setSalesTax=(indek,d)=>{
  setEV('sales_tax_id_'+indek, d.sales_tax_id);
  bingkai[indek].sales_tax_rate=d.rate;
  Quotes.calculateTotal(indek);
}

Quotes.createExecute=(indek)=>{
  var some_note=JSON.stringify(
    ['Add some note for this quote...','new-1']
  );
  var ship_address=JSON.stringify(bingkai[indek].ship_address);
  var discount_terms=JSON.stringify(bingkai[indek].discount_terms);
  var quote_detail=JSON.stringify(bingkai[indek].quote_detail);

  db.execute(indek,{
    query:"INSERT INTO quotes "
      +"(admin_name,company_id,customer_id"
      +",quote_no,date,good_thru,ship_address"
      +",customer_po,ship_id,discount_terms,sales_rep_id"
      +",detail"
      +",ar_account_id,sales_tax_id"
      +",freight_account_id,freight_amount"
      +",note)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEV("customer_id_"+indek)+"'"
      +",'"+getEV("quote_no_"+indek)+"'"
      +",'"+getEV("quote_date_"+indek)+"'"
      +",'"+getEV("good_thru_"+indek)+"'"
      +",'"+ship_address+"'"
      +",'"+getEV("customer_po_"+indek)+"'"
      +",'"+getEV("ship_id_"+indek)+"'"
      +",'"+discount_terms+"'"
      +",'"+getEV("sales_rep_id_"+indek)+"'"
      +",'"+quote_detail+"'"
      +",'"+getEV("ar_account_id_"+indek)+"'"
      +",'"+getEV("sales_tax_id_"+indek)+"'"
      +",'"+getEV("freight_account_id_"+indek)+"'"
      +",'"+getEV("freight_amount_"+indek)+"'"
      +",'"+some_note+"'"
      +")"
  });
}

Quotes.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
      +" FROM quotes "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"' "
      +" AND quote_no='"+bingkai[indek].quote_no+"' "
  },(paket)=>{
    if (paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      var address=JSON.parse(d.customer_address);
      var discount_terms=JSON.parse(d.discount_terms);
      var ship_address=JSON.parse(d.ship_address);
      var quote_detail=JSON.parse(d.detail);
      
      setEV('customer_id_'+indek, d.customer_id);
      setEV('customer_name_'+indek, d.customer_name);
      setEV('customer_address_'+indek, toAddress(address));
      
      setEV('quote_no_'+indek, d.quote_no);
      setEV('quote_date_'+indek, d.date);
      setEV('quote_date_fake_'+indek, tglWest(d.date));
      setEV('good_thru_'+indek, d.good_thru);
      setEV('good_thru_fake_'+indek, tglWest(d.good_thru) );
      
      setEV('customer_po_'+indek, d.customer_po);
      setEV('ship_id_'+indek, d.ship_id);
      setEV('displayed_terms_'+indek, discount_terms.displayed);
      
      setEV('sales_rep_id_'+indek, d.sales_rep_id);
      
      Quotes.setRows(indek, quote_detail );

      setEV('ar_account_id_'+indek, d.ar_account_id);
      setEV('sales_tax_id_'+indek, d.sales_tax_id);
      setEV('sales_tax_rate_'+indek,d.sales_tax_rate);
      
      setEV('sales_tax_'+indek,d.tax_amount);
      setEV('freight_account_id_'+indek,d.freight_account_id);
      setEV('freight_amount_'+indek,d.freight_amount);
      setEV('quote_total_'+indek,d.total);
      
      bingkai[indek].ship_address=ship_address;
      bingkai[indek].discount_terms=discount_terms;
      bingkai[indek].sales_tax_rate=d.sales_tax_rate;
      
      Quotes.setShipAddress(indek);
      // get customer addrees
      
      Quotes.customer.getOne(indek,
      getEV('customer_id_'+indek),
      (paket)=>{
        bingkai[indek].customer_address=[];
        if(paket.err.id==0 && paket.count>0){
          var d=objectOne(paket.fields,paket.data);
          bingkai[indek].customer_address=JSON.parse(d.address);
        }
        message.none(indek);
        return callback();
      });
    }
  });
}

Quotes.formUpdate=(indek,customer_id,quote_no)=>{
  bingkai[indek].customer_id=customer_id;
  bingkai[indek].quote_no=quote_no;
  Quotes.form.modeUpdate(indek);
}

Quotes.updateExecute=function(indek){
  var some_note=JSON.stringify(
    ['Add some note for this quote...','edit-1']
  );
  var ship_address=JSON.stringify(bingkai[indek].ship_address);
  var discount_terms=JSON.stringify(bingkai[indek].discount_terms);
  var quote_detail=JSON.stringify(bingkai[indek].quote_detail);
  
  db.execute(indek,{
    query:"UPDATE quotes "
      +" SET customer_id='"+getEV("customer_id_"+indek)+"', "
      +" quote_no='"+getEV("quote_no_"+indek)+"', "
      +" date='"+getEV("quote_date_"+indek)+"', "
      +" good_thru='"+getEV("good_thru_"+indek)+"', "
      +" ship_address='"+ship_address+"', "
      +" customer_po='"+getEV("customer_po_"+indek)+"', "
      +" ship_id='"+getEV("ship_id_"+indek)+"', "
      +" discount_terms='"+discount_terms+"', "
      +" sales_rep_id='"+getEV("sales_rep_id_"+indek)+"', "
      +" ar_account_id='"+getEV("ar_account_id_"+indek)+"', "
      +" detail='"+quote_detail+"', "
      +" sales_tax_id='"+getEV("sales_tax_id_"+indek)+"', "
      +" freight_account_id='"+getEV("freight_account_id_"+indek)+"', "
      +" freight_amount='"+getEV("freight_amount_"+indek)+"', "
      +" note='"+some_note+"' "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"' "
      +" AND quote_no='"+bingkai[indek].quote_no+"' "
  },(p)=>{
    if(p.err.id==0) {
      Quotes.deadPath(indek);
      bingkai[indek].customer_id=getEV('customer_id_'+indek);
      bingkai[indek].quote_no=getEV('quote_no_'+indek);
    }
  });
}

Quotes.formDelete=(indek,customer_id,quote_no)=>{
  bingkai[indek].customer_id=customer_id;
  bingkai[indek].quote_no=quote_no;
  Quotes.form.modeDelete(indek);
}

Quotes.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM quotes"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"' "
      +" AND quote_no='"+bingkai[indek].quote_no+"' "
  },(p)=>{
    if(p.err.id==0) Quotes.deadPath(indek);
  });
}

Quotes.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM quotes "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND quote_no LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Quotes.search=(indek)=>{
  Quotes.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT customer_id,customer_name,quote_no,date,total,"
        +" user_name,date_modified"
        +" FROM quotes"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND quote_no LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR customer_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Quotes.readShow(indek);
    });
  });
}

Quotes.exportExecute=(indek)=>{
  var table_name=Quotes.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

Quotes.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;

  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO quotes "
      +"(admin_name,company_id,customer_id"
      +",quote_no,date,good_thru,ship_address"
      +",customer_po,ship_id,discount_terms,sales_rep_id"
      +",detail"
      +",ar_account_id,sales_tax_id"
      +",freight_account_id,freight_amount"
      +",note)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+d[i][1]+"'" // customer_id
      +",'"+d[i][2]+"'" // quote_no
      +",'"+d[i][3]+"'" // date
      +",'"+d[i][4]+"'" // good_thru
      +",'"+d[i][5]+"'" // ship_address
      +",'"+d[i][6]+"'" // customer_po
      +",'"+d[i][7]+"'" // ship_id
      +",'"+d[i][8]+"'" // discount_terms
      +",'"+d[i][9]+"'" // sales_rep_id
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

Quotes.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT customer_id,customer_name,date,quote_no,total,"
      +" user_name,date_modified"
      +" FROM quotes"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date,quote_no"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Quotes.selectShow(indek);
  });
}

Quotes.selectShow=(indek)=>{
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
      +'<th colspan="2">Date</th>'
      +'<th>Quote#</th>'
      +'<th>Amount</th>'
      +'<th>Customer Name</th>'
      +'<th>Owner</th>'
      +'<th colspan="2">Modified</th>'
    +'</tr>';

  if(p.err.id===0){
    var x;
    for(x in d){
      n++;
      html+='<tr>'
        +'<td align="center">'
          +'<input type="checkbox"'
          +' id="checked_'+x+'_'+indek+'"'
          +' name="checked_'+indek+'" >'
        +'</td>'
      +'<td align="center">'+n+'</td>'
      +'<td align="center">'+tglWest(d[x].date)+'</td>'
      +'<td align="left">'+d[x].quote_no+'</td>'
      +'<td align="right">'+d[x].total+'</td>'
      +'<td align="left">'+xHTML(d[x].customer_name)+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

Quotes.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data)
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM quotes "
          +" WHERE admin_name='"+bingkai[indek].admin.name+"' "
          +" AND company_id='"+bingkai[indek].company.id+"' "
          +" AND customer_id='"+d[i].customer_id+"' "
          +" AND quote_no='"+d[i].quote_no+"' "
      });
    }
  }
  db.deleteMany(indek,a);
}

Quotes.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM quotes"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND customer_id='"+bingkai[indek].customer_id+"' "
      +" AND quote_no='"+bingkai[indek].quote_no+"' "
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

Quotes.duplicate=(indek)=>{
  var id='copy_of '+getEV('quote_no_'+indek);
  setEV('quote_no_'+indek,id);
  focus('quote_no_'+indek);
}

Quotes.deadPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Quotes.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Quotes.properties(indek);})
  }
}





//eof: 1061;1031;1159;1171;1243;1226;1231;1228;
