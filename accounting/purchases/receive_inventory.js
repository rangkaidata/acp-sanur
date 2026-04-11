/*
 * auth: budiono;
 * code: H2;
 * path: /accounting/purchases/receive_inventory.js;
 * ------------------------------------------------;
 * date: oct-27, 16:03, fri-2023; new;
 * edit: nov-16, 07:14, thu-2023; resize;
 * edit: dec-25, 11:58, mon-2023; number in right;
 * -----------------------------; happy new year 2024;
 * edit: jan-18, 17:06, thu-2024; mringkas;
 * edit: jul-14, 09:38, sun-2024; r8;
 * edit: aug-08, 12:25, thu-2024; r11;
 * edit: sep-25, 21:42, wed-2024; r19;
 * edit: nov-28, 10:53, thu-2024; #27; add locker();
 * edit: dec-02, 15:43, mon-2024; #27-2;
 * edit: dec-09, 20:35, mon-2024; #30;
 * edit: dec-17, 16:53, tue-2024; #31; properties;
 * edit: dec-29, 16:52, sun-2024; #32; properties+duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-24, 17:02, mon-2025; #41; file_id;
 * edit: mar-13, 15:36, thu-2025; #43; deep-folder;
 * edit: mar-26, 22:16, wed-2025; #45; ctables;cstructure;
 * edit: apr-11, 17:10, fri-2025; #46; test-data;
 * edit: apr-24, 21:32, thu-2025; #50; export to CSV;
 * edit: aug-16, 10:33, sat-2025; #68; add date obj;
 * edit: oct-19, 17:59, sun-2025; #80; 
 */  

'use strict';

var ReceiveInventory={}

ReceiveInventory.table_name='receives';
ReceiveInventory.blank='--No PO Selected--';
ReceiveInventory.gl_account_id='';
ReceiveInventory.po={};
ReceiveInventory.form=new ActionForm2(ReceiveInventory);
ReceiveInventory.grid=new Grid(ReceiveInventory);
ReceiveInventory.po.grid=new Grid(ReceiveInventory.po);
ReceiveInventory.vendor=new VendorLook(ReceiveInventory);
ReceiveInventory.ship=new ShipMethodLook(ReceiveInventory);
ReceiveInventory.account=new AccountLook(ReceiveInventory);
ReceiveInventory.job=new JobLook(ReceiveInventory);
ReceiveInventory.item=new ItemLook(ReceiveInventory);

ReceiveInventory.show=(karcis)=>{
  karcis.modul=ReceiveInventory.table_name;
  karcis.have_child=true;

  var baru=exist(karcis);
  if(baru==-1){
    var newTxs=new BingkaiUtama(karcis);
    var indek=newTxs.show();
    createFolder(indek,()=>{
      ReceiveInventory.getDefault(indek);
      ReceiveInventory.form.modePaging(indek);
    });
  }else{
    show(baru);
  }
}

ReceiveInventory.getDefault=(indek)=>{
  VendorDefaults.getDefault(indek);
  ShipToAddress.defineColumn(indek);
  bingkai[indek].sum_item_amount=0.00;
}

ReceiveInventory.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM receives "
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

ReceiveInventory.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  ReceiveInventory.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query: "SELECT invoice_no,date,amount, "
        +" vendor_name,vendor_id, "
        +" user_name,date_modified "
        +" FROM receives "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY date, invoice_no"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      ReceiveInventory.readShow(indek);
    });
  })
}

ReceiveInventory.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
  +content.title(indek)
  +content.message(indek)
  +pagingLimit(indek)
  +'<table border=1>'
    +'<caption>&nbsp;</caption>'
    +'<tr>'
    +'<th colspan="2">Invoice #</th>'
    +'<th>Date</th>'
    +'<th>Status</th>'
    +'<th>Amount</th>'
    +'<th>Vendor Name</th>'
    +'<th>Owner</th>'
    +'<th>Modified</th>'
    +'<th colspan=3>Action</th>'
    +'</tr>';

  if (p.err.id===0){
    var x;
    for (x in p.data) {
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td>'+d[x].invoice_no+'</td>'
        +'<td>'+tglWest(d[x].date)+'</td>'
        +'<td>&nbsp;</td>'
        +'<td align="right">'+d[x].amount+'</td>'
        +'<td align="left">'+d[x].vendor_name+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button"'
          +' id="btn_change"'
          +' onclick="ReceiveInventory.formUpdate(\''+indek+'\''
          +',\''+d[x].vendor_id+'\''
          +',\''+d[x].invoice_no+'\');">'
          +'</button>'
        +'</td>'
        +'<td align="center">'
          +'<button type="button"'
          +' id="btn_delete"'
          +' onclick="ReceiveInventory.formDelete(\''+indek+'\''
          +',\''+d[x].vendor_id+'\''
          +',\''+d[x].invoice_no+'\');">'
          +'</button>'
        +'</td>'
        +'<td align="center">'+n+'</td>'
        +'</tr>';
    }
  }
  html+='</table>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  ReceiveInventory.form.addPagingFn(indek);
}

ReceiveInventory.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)

    +'<form autocomplete="off">'
    +'<div'
      +' style="display:grid;grid-template-columns:repeat(2,1fr);'
      +'padding-bottom:50px;"'
      +'>'

    +'<div>'
      +'<ul>'
      +'<li><label>Vendor ID<i class="required"> *</i></label>'
        +'<input type="text"'
        +' id="vendor_id_'+indek+'"'
        +' onchange="ReceiveInventory.getVendor(\''+indek+'\');"'
        +' size="15">'

        +'<button type="button"'
          +' id="btn_find" '
          +' onclick="ReceiveInventory.vendor.getPaging(\''+indek+'\''
          +',\'vendor_id_'+indek+'\')">'
          +'</button>'
        +'</li>'
        
      +'<li><label>Vendor Name</label>'
        +'<input type="text"'
        +' id="vendor_name_'+indek+'" disabled>'
        +'</li>'
        
      +'<li><label>&nbsp;</label>'
        +'<textarea'
        +' id="vendor_address_'+indek+'"'
        +' placeholder="Remit to"'
        +'style="resize:none;width:14.6rem;height:50px;" '
        +'spellcheck=false  disabled>'
        +'</textarea>'
      +'</li>'
    +'</ul>'
    +'</div>'
    +'<div>'
      +'<ul>'
      +'<li><label>Invoice #<i class="required">*</i></label>'
        +'<input type="text"'
        +' id="invoice_no_'+indek+'"'
        +' size="9">'
        +'<label id="status_'+indek+'" '
          +' style="color:red;font-weight:bolder;padding-left:10px;">'
        +'status</label>'  
      +'</li>'
        
      +'<li><label>Date</label>'
        +'<input type="date"'
          +' id="receive_date_'+indek+'"'
          +' onblur="dateFakeShow('+indek+',\'receive_date\')"'
          +' style="display:none;">'
        +'<input type="text"'
          +' id="receive_date_fake_'+indek+'"'
          +' onfocus="dateRealShow('+indek+',\'receive_date\')"'
          +' size="9">'
      +'</li>'
      
      +'<li><label><input type="button"'
        +' onclick="ShipToAddress.show(\''+indek+'\')"'
        +' value="Ship to">'
        +'</label>'
        
        +'<textarea'
        +' id="ship_address_'+indek+'"'
        +' placeholder="Ship to"'
        +'style="resize:none;width:14.6rem;height:50px;"'
        +' spellcheck=false disabled>'
        +'</textarea>'
        +'</li>'

      +'</ul>'
    +'</div>'
    +'</div>'
    
    +'<div style="display:grid;grid-template-columns:repeat(3,1fr);'
      +'padding-bottom:20px;">'
      +'<div>'
        +'<label style="display:block;">Ship via</label>'
          +'<input type="text"'
          +' id="ship_id_'+indek+'"'
          +' size="9">'
          
          +'<button type="button"'
            +' id="btn_find" '
            +' onclick="ReceiveInventory.ship.getPaging(\''+indek+'\''
            +',\'ship_id_'+indek+'\');">'
            +'</button>'
      +'</div>'
      
      +'<div>'
      +'<label style="display:block;">Terms</label>'
        +'<input type="text"'
        +' id="displayed_terms_'+indek+'"'
        +' size="15" disabled>'
        
        +'<button type="button"'
          +' id="btn_find"'
          +' onclick="ReceiveInventory.showTerms(\''+indek+'\');">'
      +'</div>'
      
      +'<div>'
      +'<label style="display:block;">AP Account'
        +'<i class="required"> *</i>'
        +'</label>'

      +'<input type="text"'
        +' id="ap_account_id_'+indek+'"'
        +' size="9">'
          
      +'<button type="button"'
        +' id="btn_find" '
        +' onclick="ReceiveInventory.account.getPaging(\''+indek+'\''
        +',\'ap_account_id_'+indek+'\',-1,\''+CLASS_LIABILITY+'\')">'
        +'</button>'
      +'</div>'  
    +'</div>'  

    +'<details id="detail_po_'+indek+'">'
      +'<summary>Apply to Purchase Order: </summary>'
      +'Purchase Order #: <select id="po_no_'+indek+'"'
      +' onchange="ReceiveInventory.getPOItem(\''+indek+'\')">'
        +'<option>'+ReceiveInventory.blank+'</option>'
      +'</select>'
      
      +'<div id="po_detail_'+indek+'"'
        +' style="width:100%;overflow:auto;">'
        +'</div>'
    +'</details>'

    +'<details id="detail_receive_'+indek+'" open>'
      +'<summary>Apply to Purchases: </summary>'
      
      +'<div id="receive_detail_'+indek+'"'
        +'style="width:100%;overflow:auto;">'
        +'</div>'
    +'</details>'

    +'<div style="display:grid;grid-template-columns: repeat(3,1fr);'
      +'padding-bottom:20px;">'

    +'<div>&nbsp;f~</div>'
    +'<div>'
      +'<ul>'
        +'<li><label>Applied Payment</label>'
          +'<input type="text"'
          +' id="receive_payment_'+indek+'"'
          +' style="text-align:right;"'
          +' disabled  size="9" >'
        +'</li>'
        +'<li><label>Amount Paid</label>'
          +'<input type="text"'
          +' id="amount_paid_'+indek+'"'
          +' onchange="ReceiveInventory.setAmountPaid(\''+indek+'\')"'
          +' style="text-align:right;"'
          +' size="9" >'
        +'</li>'
      +'</ul>'
    +'</div>'
    
    +'<div>'
      +'<ul>'
        +'<li><label>Amount</label>'
          +'<input type="text"'
          +' id="receive_total_'+indek+'"'
          +' style="text-align:right;"'
          +' disabled'
          +' size="9" >'
        +'</li>'
          
        +'<li><label>Amount Due</label>'
          +'<input type="text"'
          +' id="amount_due_'+indek+'"'
          +' style="text-align:right;" '
          +' disabled'
          +' size="9" >'
        +'</li>'
      +'</ul>'
    +'</div>'
    +'</div>'
    +'</form>'
    +'<p><i class="required">* Required</i></p>'
    +'</div>';

  content.html(indek,html);
  document.getElementById('vendor_id_'+indek).focus();
  document.getElementById('receive_date_'+indek).value=tglSekarang();  
  document.getElementById('receive_date_fake_'+indek).value=tglWest(tglSekarang());  
  
  bingkai[indek].receive_detail=[];
  bingkai[indek].receive_total=0;
  
  bingkai[indek].po_detail=[];
  bingkai[indek].po_amount=0;

  ReceiveInventory.addRow(indek,[]);
  ReceiveInventory.po.addRow(indek,[]);

  if(metode==MODE_CREATE) ReceiveInventory.setDefault(indek);
  
  statusbar.ready(indek);
}

ReceiveInventory.addRow=(indek,baris)=>{
  ReceiveInventory.gl_account_id=bingkai[indek].data_default.gl_account_id;
  ReceiveInventory.grid.addRow(indek,baris,bingkai[indek].receive_detail);
  //document.getElementById('quantity_'+(baris-1)+'_'+indek).focus();
}

ReceiveInventory.newRow=(insBasket)=>{
  var myItem={};
  myItem.row_id=insBasket.length;
  myItem.item_id="";
  myItem.description="";
  myItem.unit_price=0.00;
  myItem.quantity=0;
  myItem.amount=0.00;
  myItem.gl_account_id=ReceiveInventory.gl_account_id;
  myItem.job_phase_cost='';
  
  myItem.tambah="abc";
  myItem.tambah2="abcd";
  insBasket.push(myItem);  
}

ReceiveInventory.setRows=(indek,isi)=>{
  if(isi===undefined)isi=[];
  var panjang=isi.length;
  var html=ReceiveInventory.tableHead(indek);
  var item_amount=0;
    
  bingkai[indek].receive_detail=isi;
    
  for (var i=0;i<panjang;i++){
    html+='<tr>'
      +'<td align="center">'+(i+1)+'</td>'
      
      +'<td style="padding:0;margin:0;">'
        +'<input type="text"'
          +' id="quantity_'+i+'_'+indek+'"'
          +' value="'+isi[i].quantity+'"'
          +' onchange="ReceiveInventory.setCell(\''+indek+'\''
            +',\'quantity_'+i+'_'+indek+'\')" '
          +' onfocus="this.select()"'
          +' style="text-align:center"'
          +' size="8">'
      +'</td>'
            
      +'<td style="margin:0;padding:0">'
      +'<input type="text"'
        +' id="item_id_'+i+'_'+indek+'"'
        +' value="'+isi[i].item_id+'"'
        +' onchange="ReceiveInventory.setCell(\''+indek+'\''
        +',\'item_id_'+i+'_'+indek+'\')" '
        +' onfocus="this.select()"'
        +' size="9">'
      +'</td>'
            
      +'<td style="margin:0;padding:0">'
      +'<button type="button"'
        +' id="btn_find" '
        +' onclick="ReceiveInventory.item.getPaging(\''+indek+'\''
        +',\'item_id_'+i+'_'+indek+'\',\''+i+'\');">'
        +'</button>'
      +'</td>'
            
      +'<td style="padding:0;margin:0;">'
      +'<input type="text"'
        +' id="description_'+i+'_'+indek+'"'
        +' value="'+isi[i].description+'"'
        
        +' onchange="ReceiveInventory.setCell(\''+indek+'\''
        +',\'description_'+i+'_'+indek+'\')" '
        +' onfocus="this.select()"'
        +' size="15" >'
      +'</td>'
      
      +'<td align="center" style="padding:0;margin:0;">'
      +'<input type="text"'
        +' id="gl_account_id_'+i+'_'+indek+'"'
        +' value="'+isi[i].gl_account_id+'"'
        +' onchange="ReceiveInventory.setCell(\''+indek+'\''
        +',\'gl_account_id_'+i+'_'+indek+'\')"'
        +' onfocus="this.select()" '
        +' style="text-align:center;"'
        +' size="9" >'
      +'</td>'
      
      +'<td align="center" style="padding:0;margin:0;">'
        +'<button type="button" id="btn_find" '
        +' onclick="ReceiveInventory.account.getPaging(\''+indek+'\''
        +',\'gl_account_id_'+i+'_'+indek+'\''
        +',\''+i+'\''
        +',\''+CLASS_EXPENSE+'\');">'
        +'</button>'
        +'</td>'
            
      +'<td  align="right" style="padding:0;margin:0;">'
        +'<input type="text"'
        +' id="unit_price_'+i+'_'+indek+'"'
        +' value="'+Number(isi[i].unit_price)+'"'
        +' onchange="ReceiveInventory.setCell(\''+indek+'\''
        +',\'unit_price_'+i+'_'+indek+'\')"'
        +' onfocus="this.select()" '
        +' style="text-align:right"'
        +' size="9" >'
      +'</td>'
            
      +'<td  align="right" style="padding:0;margin:0;">'
        +'<input type="text"'
        +' id="amount_'+i+'_'+indek+'"'
        +' value="'+Number(isi[i].amount)+'"'
        +' style="text-align:right"'
        +' onchange="ReceiveInventory.setCell(\''+indek+'\''
        +',\'amount_'+i+'_'+indek+'\')" '
        +' onfocus="this.select()"'
        +' size="10" >'
      +'</td>'

      +'<td  align="center" style="padding:0;margin:0;">'
      +'<input type="text"'
        +' id="job_phase_cost_'+i+'_'+indek+'"'
        +' value="'+isi[i].job_phase_cost+'"'
        +' onchange="ReceiveInventory.setCell(\''+indek+'\''
        +',\'job_phase_cost_'+i+'_'+indek+'\')"'
        +' onfocus="this.select()" '
        +' size="9" >'
      +'</td>'
      
      +'<td  style="margin:0;padding:0"><button type="button"'
        +' id="btn_find"'
        +' onclick="ReceiveInventory.job.getPaging(\''+indek+'\''
        +',\'job_phase_cost_'+i+'_'+indek+'\',\''+i+'\');">'
        +'</button>'
        +'</td>'

      +'<td align="center">'
        +'<button type="button"'
          +' id="btn_add"'
          +' onclick="ReceiveInventory.addRow(\''+indek+'\','+i+')">'
          +'</button>'
          
        +'<button type="button"'
          +' id="btn_remove"'
          +' onclick="ReceiveInventory.removeRow(\''+indek+'\','+i+')">'
          +'</button>'
      +'</td>'
      +'</tr>';
      item_amount+=Number(isi[i].amount);
    }
  html+=ReceiveInventory.tableFoot(indek);
  var budi=JSON.stringify(isi);
  document.getElementById('receive_detail_'+indek).innerHTML=html;
  
  bingkai[indek].item_amount=item_amount;
  ReceiveInventory.calculateTotal(indek);
  
  if(panjang==0)ReceiveInventory.addRow(indek,[]);
}

ReceiveInventory.tableHead=(indek)=>{
  return '<table>'
    +'<thead>'
    +'<tr>'
    +'<th colspan="2">Quantity</th>'
    +'<th colspan="2">Item ID</th>'
    +'<th>Description<i class="required"> *</i></th>'
    +'<th colspan="2">GL Account<i  class="required"> *</i></th>'
    +'<th>Unit Price</th>'
    +'<th>Amount<i  class="required"> *</i></th>'
    +'<th colspan="2">Job ID</th>'
    +'<th>Add/Rem</th>'
    +'</tr>'
    +'</thead>';
}

ReceiveInventory.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
    +'<td align="center">#</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

ReceiveInventory.calculateTotal=(indek)=>{
  // tidak dihitung ditransaksi ini, tapi di  
  var itemAmount=Number(bingkai[indek].item_amount) || 0;
  var itemAmount_po=Number(bingkai[indek].item_amount_po) || 0;
  var paidAmount=Number(bingkai[indek].amount_paid) || 0;
  var receiveAmount=(itemAmount+itemAmount_po);
  var discountAmount=0;
  var applied_payment=Number(bingkai[indek].applied_payment);

  bingkai[indek].discount_terms.date=document.getElementById('receive_date_'+indek).value;
  bingkai[indek].discount_terms.amount=receiveAmount;
  DiscountTerms.calcNow(indek);
  
  discountAmount=Number(bingkai[indek].discount_terms.discount_amount);
  //const receiveAmountB=(receiveAmountA-discountAmount);
  //dengan disc//;
  //const amountDue=paidAmount-receiveAmount+discountAmount;
  //receiveAmount-=discountAmount; 
  var amountDue=applied_payment+paidAmount-receiveAmount;
  
  document.getElementById('receive_total_'+indek).value=receiveAmount;
  document.getElementById('amount_due_'+indek).value=amountDue;
  
  bingkai[indek].receive_total=receiveAmount;
}

ReceiveInventory.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].receive_detail;
  var baru=[];
  var isiEdit={};
  var sum_item_amount=0;
  
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
      ReceiveInventory.getItem(indek,i);
      
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
    baru.push(isiEdit);
    sum_item_amount+=Number(isi[i].amount);
  }
  bingkai[indek].item_amount=sum_item_amount;
  ReceiveInventory.calculateTotal(indek);
}

ReceiveInventory.removeRow=(indek,baris)=>{
  ReceiveInventory.grid.removeRow(indek,baris,
    bingkai[indek].receive_detail);
}

ReceiveInventory.po.addRow=(indek,baris)=>{
  ReceiveInventory.po.grid.addRow(indek,baris,bingkai[indek].po_detail);
}

ReceiveInventory.po.newRow=(basket)=>{
  var myItem={};
  myItem.row_id=0;
  myItem.item_id="";
  myItem.description="";
  myItem.remaining=0;
  myItem.received=0;
  myItem.description_edit="";
  myItem.gl_account_id='';
  myItem.unit_price=0.00;
  myItem.amount=0.00;  
  myItem.job_phase_cost='';
  basket.push(myItem);  
}

ReceiveInventory.po.setRows=(indek,isi)=>{
  if(isi===undefined)isi=[];
  var panjang=isi.length;
  var html=ReceiveInventory.po.tableHead(indek);
  var sum_item_amount=0;

  bingkai[indek].po_detail=isi;
    
  for (var i=0;i<panjang;i++){
    sum_item_amount+=Number(isi[i].amount);

    html+='<tr>'
      +'<td align="center">'+isi[i].row_id+'</td>'
              
      +'<td style="margin:0;padding:0;width:0;">'
        +'<input type="text"'
        +' id="po_item_id_'+i+'_'+indek+'"'
        +' value="'+isi[i].item_id+'"'
        +' style="text-align:left;"'
        +' size="9" disabled>'
      +'</td>'
        
      +'<td style="margin:0;padding:0;width:0;">'// tambahan description_id
        +'<input type="text"'
        +' id="po_description_'+i+'_'+indek+'"'
        +' value="'+isi[i].description+'"'
        +' style="text-align:left;"'
        +' size="9" disabled>'
      +'</td>'
              
      +'<td align="center" style="padding:0;margin:0;">'
        +'<input type="text"'
        +' id="po_remaining_'+i+'_'+indek+'"'
        +' value="'+isi[i].remaining+'"'
        +' style="text-align:center"'
        +' disabled'
        +' size="3">'
      +'</td>'
              
      +'<td align="center" style="padding:0;margin:0;">'
        +'<input type="text"'
        +' id="po_received_'+i+'_'+indek+'"'
        +' value="'+isi[i].received+'"'
        +' onchange="ReceiveInventory.po.setCell(\''+indek+'\''
        +',\'po_received_'+i+'_'+indek+'\')" '
        +' style="text-align:center"'
        +' onfocus="this.select()"'
        +' size="3">'
        +'</td>'
                          
      +'<td style="padding:0;margin:0;">'
        +'<input type="text"'
        +' id="po_description_edit_'+i+'_'+indek+'"'
        +' value="'+isi[i].description_edit+'"'
        +' onchange="ReceiveInventory.po.setCell(\''+indek+'\''
        +',\'po_description_edit_'+i+'_'+indek+'\')" '
        +' onfocus="this.select()"'
        +' size="15" >'
        +'</td>'
              
      +'<td  align="center" style="padding:0;margin:0;">'
        +'<input type="text"'
        +' id="po_gl_account_id_'+i+'_'+indek+'"'
        +' value="'+isi[i].gl_account_id+'"'
        +' onchange="ReceiveInventory.po.setCell(\''+indek+'\''
        +',\'po_gl_account_id_'+i+'_'+indek+'\')" '
        +' onfocus="this.select()"'
        +' size="9" >'
        +'</td>'
        
      +'<td><button type="button" '
        +' id="btn_find"'
        +' onclick="ReceiveInventory.account.getPaging(\''+indek+'\''
        +',\'po_gl_account_id_'+i+'_'+indek+'\',\''+i+'\');">'
        +'</button>'
        +'</td>'
              
      +'<td align="right"'
        +' style="padding:0;margin:0;">'
        +'<input type="text"'
        +' id="po_unit_price_'+i+'_'+indek+'"'
        +' value="'+Number(isi[i].unit_price)+'"'
        +' style="text-align:right"'
        +' onchange="ReceiveInventory.po.setCell(\''+indek+'\''
        +',\'po_unit_price_'+i+'_'+indek+'\')" '
        +' onfocus="this.select()" '
        +' size="6" >'
        +'</td>'
              
      +'<td  align="right" style="padding:0;margin:0;">'
        +'<input type="text"'
        +' id="po_amount_'+i+'_'+indek+'"'
        +' value="'+Number(isi[i].amount)+'"'
        +' style="text-align:right"'
        +' onchange="ReceiveInventory.po.setCell(\''+indek+'\''
        +',\'po_amount_'+i+'_'+indek+'\')" '
        +' onfocus="this.select()" '
        +' size="9" >'
        +'</td>'
              
      +'<td  align="center" style="padding:0;margin:0;">'
        +'<input type="text"'
        +' id="po_job_phase_cost_'+i+'_'+indek+'"'
        +' value="'+isi[i].job_phase_cost+'"'
        +' onchange="ReceiveInventory.po.setCell(\''+indek+'\''
        +',\'po_job_phase_cost_'+i+'_'+indek+'\')" '
        +' onfocus="this.select()" '
        +' size="5" >'
        +'</td>'

      +'<td><button type="button"'
        +' id="btn_find"'
        +' onclick="ReceiveInventory.job.getPaging(\''+indek+'\''
        +',\'po_job_phase_cost_'+i+'_'+indek+'\',\''+i+'\');">'
        +'</button>'
        +'</td>'
              
      +'</tr>';
  }
  html+=ReceiveInventory.po.tableFoot(indek);
  var budi=JSON.stringify(isi);
  document.getElementById('po_detail_'+indek).innerHTML=html;
  
  bingkai[indek].item_amount_po=sum_item_amount;
  ReceiveInventory.calculateTotal(indek);
    
  if(panjang==0) ReceiveInventory.po.addRow(indek,[]);
}

ReceiveInventory.po.tableHead=(indek)=>{
  return ''
    +'<table>'
    +'<thead>'
    +'<tr>'
    +'<th colspan="2">Item ID</th>'
    +'<th>Description ID</th>'
    +'<th>Remaining</th>'
    +'<th>Received</th>'
    +'<th>Description<i class="required"> *</i></th>'
    +'<th colspan="2">GL Account<i class="required"> *</i></th>'
    +'<th>Unit Price</th>'
    +'<th>Amount<i class="required"> *</i></th>'
    +'<th colspan="2">Job ID</th>'
    +'</tr>'
    +'</thead>';
}

ReceiveInventory.po.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
    +'<td>#</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

ReceiveInventory.po.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].po_detail;
  var baru = [];
  var isiEdit = {};
  var sum_item_amount=0;
    
  for (var i=0;i<isi.length; i++){    
    isiEdit=isi[i];
    
    if(id_kolom==('po_item_id_'+i+'_'+indek)){
      isiEdit.item_id=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else if(id_kolom==('po_description_'+i+'_'+indek)){
      isiEdit.description=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else if(id_kolom==('po_remaining_'+i+'_'+indek)){
      isiEdit.remaining=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else if(id_kolom==('po_received_'+i+'_'+indek)){
      isiEdit.received=getEV(id_kolom);
      isiEdit.amount=(isiEdit.received*isiEdit.unit_price);
      baru.push(isiEdit);
      setEV('po_amount_'+i+'_'+indek, Number(isiEdit.amount));
      
    }else if(id_kolom==('po_description_edit_'+i+'_'+indek)){
      isiEdit.description_edit=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else if(id_kolom==('po_gl_account_id_'+i+'_'+indek)){
      isiEdit.gl_account_id=getEV(id_kolom);
      baru.push(isiEdit);
    
    }else if(id_kolom==('po_unit_price_'+i+'_'+indek)){  
      isiEdit.unit_price=getEV(id_kolom);
      isiEdit.amount=(isiEdit.received*isiEdit.unit_price);
      baru.push(isiEdit);
      setEV('po_amount_'+i+'_'+indek,Number(isiEdit.amount));
    
    }else if(id_kolom==('po_amount_'+i+'_'+indek)){      
      isiEdit.amount=getEV(id_kolom);
      if(isiEdit.received>0){
        isiEdit.unit_price=(isiEdit.amount/isiEdit.received);
        setEV('po_unit_price_'+i+'_'+indek, isiEdit.unit_price);
      }
      baru.push(isiEdit);
      
    }else if(id_kolom==('po_job_phase_cost_'+i+'_'+indek)){
      isiEdit.job_phase_cost=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else{
      baru.push(isi[i]);
    }
    sum_item_amount+=Number(isi[i].amount);
  }
  bingkai[indek].item_amount_po=sum_item_amount;
  ReceiveInventory.calculateTotal(indek);
}

ReceiveInventory.setDefault=(indek)=>{
  var d=bingkai[indek].data_default;
  bingkai[indek].vendor_id='';
  bingkai[indek].invoice_no='';
  setEV('ap_account_id_'+indek,d.ap_account_id);
  setEV('displayed_terms_'+indek,d.discount_terms.displayed);
  bingkai[indek].discount_terms=d.discount_terms;
  ReceiveInventory.getCompany(indek);
}

ReceiveInventory.getCompany=(indek)=>{
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
      ReceiveInventory.setShipAddress(indek);
    }
  });
}

ReceiveInventory.setShipAddress=(indek)=>{
  var d=bingkai[indek].ship_address;
  setEV('ship_address_'+indek, toAddress(d));
}

ReceiveInventory.setVendor=(indek,d)=>{
  setEV('vendor_id_'+indek, d.vendor_id);
  ReceiveInventory.getVendor(indek);
}

ReceiveInventory.getVendor=(indek)=>{
  ReceiveInventory.vendor.getOne(indek, 
    getEV('vendor_id_'+indek), 
  (paket)=>{
    setEV('vendor_name_'+indek, txt_undefined);
    if(paket.count>0){
      var v=objectOne(paket.fields,paket.data) ;
      var va=JSON.parse(v.address);
      var dt=JSON.parse(v.discount_terms);
      
      setEV('vendor_name_'+indek,v.name);
      setEV('vendor_address_'+indek, toAddress(va));
      setEV('ship_id_'+indek,v.ship_id);
      setEV('displayed_terms_'+indek,dt.displayed);      
      bingkai[indek].discount_terms=dt;
    }
  });
  ReceiveInventory.setAmountPaid(indek);
  ReceiveInventory.getCompany(indek);
  ReceiveInventory.getPO(indek,"");
  ReceiveInventory.po.setRows(indek,[]);
}

ReceiveInventory.setAmountPaid=(indek)=>{
  bingkai[indek].amount_paid=getEV('amount_paid_'+indek);
  ReceiveInventory.calculateTotal(indek);
}

ReceiveInventory.getPO=(indek,po_no,callback)=>{
  // reset
  // ReceiveInventory.setAmountPaid(indek);
  // ReceiveInventory.setRows_po(indek,[]);

  var x=document.getElementById('po_no_'+indek);  
  while(x.options.length >0) x.remove(0);
  
  var option3=document.createElement("option");
  option3.text=ReceiveInventory.blank;
  document.getElementById('po_no_'+indek).add(option3);

//  var x=document.getElementById('po_no_'+indek);  
//  for(var i=x.options.length;i>0;i--){
//    x.remove(i);
//  }
//  po_receive.read(indek,getEV('vendor_id_'+indek)
  db.run(indek,{
    query:"SELECT po_no"
      +" FROM po_receive_sum"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+getEV('vendor_id_'+indek)+"'"
      +" AND amount != 0"
      +" GROUP BY po_no"
  },(paket)=>{
    var masih_ada=0;
    if(po_no!=''){
      var option2=document.createElement("option");
      option2.text=po_no;
      document.getElementById('po_no_'+indek).add(option2);
      document.getElementById('po_no_'+indek).value=po_no;
    }
    if(paket.err.id==0 && paket.count>0){
      var d=objectMany(paket.fields,paket.data);
      for (var x in d){
        if(d[x].po_no!=po_no){
          var option=document.createElement("option");
          option.text=d[x].po_no;
          document.getElementById('po_no_'+indek).add(option);
          masih_ada++;
        }
      }
    }

    // default condition
    document.getElementById('detail_po_'+indek).open=false;
    document.getElementById('detail_receive_'+indek).open=true;

    if(po_no!=''){// edit condition
      document.getElementById('detail_po_'+indek).open=true;
      document.getElementById('detail_receive_'+indek).open=false;
    }
    
    if(bingkai[indek].invoice_no==""){// new condition
      //if(paket.count>0){
      if(masih_ada>0){
        document.getElementById('detail_po_'+indek).open=true;
        document.getElementById('detail_receive_'+indek).open=false;
      }
    }
    // return callback;
  });
}

ReceiveInventory.setShipMethod=(indek,data)=>{
  setEV('ship_id_'+indek,data.ship_id);
}

ReceiveInventory.showTerms=(indek,baris)=>{
  bingkai[indek].baris=baris;
  //if(bingkai[indek].data_terms==undefined){
    //DiscountTerms.getColumn(indek);
  //}else{
    var amount=bingkai[indek].receive_total;
    bingkai[indek].discount_terms.date=getEV('receive_date_'+indek);
    bingkai[indek].discount_terms.amount=amount;
  //}
  DiscountTerms.show(indek);
} 

ReceiveInventory.setTerms=(indek)=>{
  var d=bingkai[indek].discount_terms.displayed;
  setEV('displayed_terms_'+indek, d);
  ReceiveInventory.calculateTotal(indek);
}

ReceiveInventory.setAccount=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var baris=bingkai[indek].baris;

  setEV(id_kolom, d.account_id);

  switch(id_kolom){
    case "ap_account_id_"+indek:
      setEV('ap_account_id_'+indek,d.account_id);
      break;
    case "gl_account_id_"+baris+'_'+indek:
      setEV(id_kolom, d.account_id);
      ReceiveInventory.setCell(indek,id_kolom);
      break;
    case "po_gl_account_id_"+baris+'_'+indek:
      setEV(id_kolom,d.account_id);
      ReceiveInventory.po.setCell(indek,id_kolom);
      break;
    default:
      alert(id_kolom+' undefined in [setAccount]');
  }
}

ReceiveInventory.setItem=(indek,d)=>{  
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom,d.item_id);
  ReceiveInventory.setCell(indek,id_kolom);
}

ReceiveInventory.getItem=(indek,baris)=>{
  ReceiveInventory.item.getOne(indek,
  getEV('item_id_'+baris+'_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('item_id_'+baris+'_'+indek,d.item_id);
      setEV('description_'+baris+'_'+indek,d.name_for_purchases);
      setEV('gl_account_id_'+baris+'_'+indek,d.inventory_account_id);
      if(d.name_for_purchases=='')
      setEV('description_'+baris+'_'+indek,d.name_for_sales);
    
      ReceiveInventory.setCell(indek,'description_'+baris+'_'+indek);
      ReceiveInventory.setCell(indek,'gl_account_id_'+baris+'_'+indek);
    }
  });
}

ReceiveInventory.setJob=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var baris=bingkai[indek].baris;
  
  setEV(id_kolom, d);

  switch(id_kolom){
    case "job_phase_cost_"+baris+'_'+indek:
      ReceiveInventory.setCell(indek,id_kolom);
      break;
    case "po_job_phase_cost_"+baris+'_'+indek:
      ReceiveInventory.po.setCell(indek,id_kolom);
      break;
    default:
      alert(id_kolom + ' undefined.' );
  }
}

ReceiveInventory.getPOItem=(indek)=>{

  if(getEV('po_no_'+indek)==ReceiveInventory.blank){
    ReceiveInventory.po.setRows(indek,[]);
    return;
  }
  db.run(indek,{
    query:"SELECT ap_account_id,ship_id,discount_terms,"
      +" row_id,item_id,description, description AS description_edit,"
      +" remaining,received,unit_price,"
      +" gl_account_id,amount,job_phase_cost"
      +" FROM po_receive_sum"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+getEV('vendor_id_'+indek)+"'"
      +" AND po_no='"+getEV('po_no_'+indek)+"'"
      +" AND amount != 0"
      +" ORDER BY row_id"
  },(paket)=>{
    var d=objectMany(paket.fields,paket.data);
    if(paket.count>0){
      if(paket.count!=0){
        var dt=JSON.parse(d[0].discount_terms);

        bingkai[indek].discount_terms=dt;
        setEV('ap_account_id_'+indek, d[0].ap_account_id);
        setEV('ship_id_'+indek, d[0].ship_id);
        setEV('displayed_terms_'+indek, dt.displayed);
        // document.getElementById('invoice_customer_po_'+indek).value=paket.data[0].so_customer_po;
      }
      ReceiveInventory.po.setRows(indek, d);
    }
  });
}

ReceiveInventory.createExecute=(indek)=>{
  
  var po_no=getEV("po_no_"+indek);
  if(document.getElementById("po_no_"+indek).selectedIndex==0){
    po_no='';
  }
  var notes=JSON.stringify(
    ['add some note for this purchase invoices..',
    'new-1']
  );
  var ship_address=JSON.stringify(bingkai[indek].ship_address);
  var discount_terms=JSON.stringify(bingkai[indek].discount_terms);
  var detail=JSON.stringify(bingkai[indek].receive_detail);
  var po_detail=JSON.stringify(bingkai[indek].po_detail);
  
  db.execute(indek,{
    query:"INSERT INTO receives"
      +"(admin_name,company_id,vendor_id,invoice_no,date"
      +",ship_address,ship_id,discount_terms"
      +",ap_account_id,detail,po_no,po_detail"
      +",amount_paid,note)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEV("vendor_id_"+indek)+"'"
      +",'"+getEV("invoice_no_"+indek)+"'"
      +",'"+getEV("receive_date_"+indek)+"'"
      +",'"+ship_address+"'"
      +",'"+getEV("ship_id_"+indek)+"'"
      +",'"+discount_terms+"'"
      +",'"+getEV("ap_account_id_"+indek)+"'"
      +",'"+detail+"'"
      +",'"+po_no+"'"
      +",'"+po_detail+"'"
      +",'"+getEV("amount_paid_"+indek)+"'"
      +",'"+notes+"'"
      +")"
  });
}

ReceiveInventory.readOne=(indek,callback)=>{
  ReceiveInventory.getStatus(indek,()=>{
    db.run(indek,{
      query:"SELECT * "
        +" FROM receives "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND vendor_id='"+bingkai[indek].vendor_id+"' "
        +" AND invoice_no='"+bingkai[indek].invoice_no+"' "
    },(paket)=>{
      if (paket.err.id==0) {
        var d=objectOne(paket.fields,paket.data);
        var va=JSON.parse(d.vendor_address);
        var sa=JSON.parse(d.ship_address);
        var dt=JSON.parse(d.discount_terms);
        
        setEV('vendor_id_'+indek, d.vendor_id);
        setEV('vendor_name_'+indek, d.vendor_name);
        setEV('vendor_address_'+indek, toAddress(va));
        
        bingkai[indek].amount_paid=d.amount_paid;
        
        ReceiveInventory.setRows(indek, JSON.parse(d.detail));
        ReceiveInventory.po.setRows(indek,JSON.parse(d.po_detail));
        
        setEV('invoice_no_'+indek, d.invoice_no);
        setEV('receive_date_'+indek, d.date);
        setEV('receive_date_fake_'+indek, tglWest(d.date));
        
        setEV('ship_id_'+indek, d.ship_id);
        setEV('displayed_terms_'+indek, dt.displayed);
        setEV('amount_paid_'+indek, d.amount_paid);
        setEV('ap_account_id_'+indek, d.ap_account_id);
        setEV('receive_total_'+indek, d.amount);

        //ReceiveInventory.setShip(indek,ship_data);
        //ReceiveInventory.getVendor(indek);
        
        var option=document.createElement("option");
        option.text=d.po_no;
        document.getElementById('po_no_'+indek).add(option);
        document.getElementById('po_no_'+indek).value=d.po_no;
        
        ReceiveInventory.getPO(indek,d.po_no);
        
        bingkai[indek].ship_address=sa;
        bingkai[indek].discount_terms=dt;
        
        ReceiveInventory.setShipAddress(indek);
        ReceiveInventory.calculateTotal(indek);

        message.none(indek);
      }
      
      return callback();
    });
  });
}

ReceiveInventory.getStatus=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT status,amount "
      +" FROM receive_status "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+bingkai[indek].vendor_id+"' "
      +" AND invoice_no='"+bingkai[indek].invoice_no+"' "
  },(p)=>{
    if(p.count>0){
      //alert(p.status);
      var d=objectOne(p.fields,p.data);
      setiH('status_'+indek, array_invoice_status[d.status] );
      setEV('receive_payment_'+indek, d.amount );
      bingkai[indek].applied_payment=Number(d.amount);
    }
    return callback();
  });
}

ReceiveInventory.formUpdate=(indek,vendor_id,invoice_no)=>{
  bingkai[indek].vendor_id=vendor_id;
  bingkai[indek].invoice_no=invoice_no;
  ReceiveInventory.form.modeUpdate(indek);
}

ReceiveInventory.updateExecute=(indek)=>{
  var po_no=getEV("po_no_"+indek);
  if(document.getElementById("po_no_"+indek).selectedIndex==0){
    po_no='';
  }
  var notes=JSON.stringify(
    ['add some note for this purchase invoices...',
    'edit-1']
  );
  var ship_address=JSON.stringify(bingkai[indek].ship_address);
  var discount_terms=JSON.stringify(bingkai[indek].discount_terms);
  var detail=JSON.stringify(bingkai[indek].receive_detail);
  var po_detail=JSON.stringify(bingkai[indek].po_detail);
    
  db.execute(indek,{
    query:"UPDATE receives"
      +" SET vendor_id='"+getEV("vendor_id_"+indek)+"', "
      +" invoice_no='"+getEV("invoice_no_"+indek)+"', "
      +" date='"+getEV("receive_date_"+indek)+"', "
      +" ship_address='"+ship_address+"', "
      +" ship_id='"+getEV("ship_id_"+indek)+"', "
      +" discount_terms='"+discount_terms+"', "
      +" ap_account_id='"+getEV("ap_account_id_"+indek)+"', "
      +" detail='"+detail+"', "
      +" po_no='"+po_no+"', "
      +" po_detail='"+po_detail+"', "
      +" amount_paid='"+getEV("amount_paid_"+indek)+"', "
      +" note='"+notes+"' "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+bingkai[indek].vendor_id+"' "
      +" AND invoice_no='"+bingkai[indek].invoice_no+"' "
  },(p)=>{
    if(p.err.id==0) {
      bingkai[indek].vendor_id=getEV('vendor_id_'+indek);
      bingkai[indek].invoice_no=getEV('invoice_no_'+indek)
      ReceiveInventory.deadPath(indek);
    }
  });
}

ReceiveInventory.formDelete=(indek,vendor_id,invoice_no)=>{
  bingkai[indek].vendor_id=vendor_id;
  bingkai[indek].invoice_no=invoice_no;
  ReceiveInventory.form.modeDelete(indek);
}

ReceiveInventory.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM receives "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+bingkai[indek].vendor_id+"' "
      +" AND invoice_no='"+bingkai[indek].invoice_no+"' "
  },(p)=>{
    if(p.err.id==0) ReceiveInventory.deadPath(indek);
  });
}

ReceiveInventory.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM receives "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND invoice_no LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR vendor_name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

ReceiveInventory.search=(indek)=>{
  ReceiveInventory.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT invoice_no,date,amount,vendor_name,vendor_id,"
        +" user_name,date_modified "
        +" FROM receives"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND invoice_no LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR vendor_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      ReceiveInventory.readShow(indek);
    });
  });
}

ReceiveInventory.exportExecute=(indek)=>{
  var table_name=ReceiveInventory.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

ReceiveInventory.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;
  var jok=0;
  var jerr=0;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO receives"
        +"(admin_name,company_id,vendor_id,invoice_no,date"
        +",ship_address,ship_id,discount_terms"
        +",ap_account_id,detail,po_no,po_detail"
        +",amount_paid,note)"
        +" VALUES "
        +"('"+bingkai[indek].admin.name+"'"
        +",'"+bingkai[indek].company.id+"'"
        +",'"+d[i][1]+"'"
        +",'"+d[i][2]+"'"
        +",'"+d[i][3]+"'"
        +",'"+d[i][4]+"'"
        +",'"+d[i][5]+"'"
        +",'"+d[i][6]+"'"
        +",'"+d[i][7]+"'"
        +",'"+d[i][8]+"'"
        +",'"+d[i][9]+"'"
        +",'"+d[i][10]+"'"
        +",'"+d[i][11]+"'"
        +",'"+d[i][12]+"'"
        +")"
    },(paket)=>{  
      paket.err.id==0?jok++:jerr++;
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar2(indek,n,j,m,jok,jerr);
    });
  }
}

ReceiveInventory.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT invoice_no,date, "
      +" amount, "
      +" vendor_name,vendor_id, "
      +" user_name,date_modified"
      +" FROM receives"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    ReceiveInventory.selectShow(indek);
  });
}

ReceiveInventory.selectShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
  +content.title(indek)
  +content.message(indek)
  +'<table border=1>'
    +'<caption>&nbsp;</caption>'
    +'<tr>'
      +'<td align="center">'
      +'<input type="checkbox"'
      +' id="check_all_'+indek+'"'
      +' onclick="checkAll(\''+indek+'\')">'
      +'</td>'
      +'<th colspan="2">Receive#</th>'
      +'<th>Date</th>'
      +'<th>Status</th>'
      +'<th>Amount</th>'
      +'<th>Vendor Name</th>'
      +'<th>Owner</th>'
      +'<th colspan="2">Modified</th>'
      
    +'</tr>';

  if (p.err.id===0){
    for (var x in p.data) {
      n++;
      html+='<tr>'
        +'<td align="center">'
          +'<input type="checkbox"'
          +' id="checked_'+x+'_'+indek+'"'
          +' name="checked_'+indek+'" >'
        +'</td>'
        +'<td align="center">'+n+'</td>'
        +'<td>'+d[x].invoice_no+'</td>'
        +'<td>'+tglWest(d[x].date)+'</td>'
        +'<td>&nbsp;</td>'
        +'<td align="right">'+d[x].amount+'</td>'
        +'<td align="left">'+d[x].vendor_name+'</td>'
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

ReceiveInventory.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM receives "
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND vendor_id='"+d[i].vendor_id+"' "
          +" AND invoice_no='"+d[i].invoice_no+"' "
      });
    }
  }
  db.deleteMany(indek,a);
} 

ReceiveInventory.duplicate=(indek)=>{
  var id='copy_of '+getEV('invoice_no_'+indek);
  setEV('invoice_no_'+indek,id);
  document.getElementById('invoice_no_'+indek).focus();
}

ReceiveInventory.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM receives "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+bingkai[indek].vendor_id+"' "
      +" AND invoice_no='"+bingkai[indek].invoice_no+"' "
  },(p)=>{
    if (p.count>0) {
      var d=objectOne(p.fields,p.data);
      bingkai[indek].file_id=d.file_id;
      Properties.lookup(indek);
    }
    message.none(indek);
  });
}

ReceiveInventory.deadPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ReceiveInventory.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{ReceiveInventory.properties(indek);})
  }
}




// eof: 1324;1257;1417;1420;1480;1492;1474;1478;1475;1505;
