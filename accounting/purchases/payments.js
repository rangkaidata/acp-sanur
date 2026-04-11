/*
 * auth: budiono;
 * code: H3;
 * date: nov-16, 08:24, thu-2023; new;  
 * -----------------------------; happy new year 2024;
 * edit: jan-19, 09:45, fri-2024; mringkas;
 * edit: jul-16, 15:51, tue-2024; r9;
 * edit: jul-17, 22:31, wed-2024; r9;
 * edit: jul-18, 06:46, thu-2024; r9;
 * edit: aug-08, 22:54, thu-2024; r11;
 * edit: sep-27, 15:13, fri-2024; r19;
 * edit: nov-09, 07:03, sat-2024; #25;
 * edit: nov-28, 11:55, thu-2024; #27; add locker(); 
 * edit: dec-02, 15:47, mon-2024; #27;2;
 * edit: dec-29, 21:23, sun-2024; #32; properties+duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-24, 17:30, mon-2025; #41; file_id;
 * edit: mar-13, 16:09, thu-2025; #43; deep-folder;
 * edit: mar-26, 22:40, wed-2025; #45; ctables;cstructure;
 * edit: apr-24, 21:40, thu-2025; #50; export to csv;
 * edit: aug-16, 10:41, sat-2025; #68; 
 * edit: oct-25, 05:36, sat-2025; #80; 
 */

'use strict';

var Payments={};

Payments.table_name='payments';
Payments.receive={};
Payments.form=new ActionForm2(Payments);
Payments.grid=new Grid(Payments);
Payments.receive.grid=new Grid(Payments.receive);
Payments.vendor=new VendorLook(Payments);
Payments.account=new AccountLook(Payments);
Payments.item=new ItemLook(Payments);
Payments.job=new JobLook(Payments);

Payments.show=(karcis)=>{
  karcis.modul=Payments.table_name;
  karcis.have_child=true;
  
  var baru=exist(karcis);
  if(baru==-1){
    var newTxs=new BingkaiUtama(karcis);
    var indek=newTxs.show();
    createFolder(indek,()=>{
      Payments.form.modePaging(indek);
      Payments.getDefault(indek);
    });
  }else{
    show(baru);
  }
}

Payments.getDefault=(indek)=>{
  bingkai[indek].payment_amount=0;
  VendorDefaults.getDefault(indek);
}

Payments.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM payments "
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

Payments.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Payments.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT payment_no,date,amount,name,cash_account_id,"
        +" user_name,date_modified"
        +" FROM payments"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY date,payment_no"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Payments.readShow(indek);
    });
  })
}

Payments.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +TotalPagingLimit(indek)
    +'<table border=1>'
    +'<tr>'
      +'<th colspan="2">Payment #</th>'
      +'<th>Date</th>'
      +'<th>Amount</th>'
      +'<th>Vendor Name</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
      +'<th colspan="3">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    var x;
    for(x in d){
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].payment_no+'</td>'
        +'<td align="center">'+tglWest(d[x].date)+'</td>'
        +'<td align="right">'+d[x].amount+'</td>'
        +'<td align="left">'+xHTML(d[x].name)+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button"'
          +' id="btn_change"'
          +' onclick="Payments.formUpdate(\''+indek+'\''
          +',\''+d[x].cash_account_id+'\''
          +',\''+d[x].payment_no+'\''
          +');"></button>'
          +'</td>'
        +'<td align="center">'
          +'<button type="button"'
          +' id="btn_delete"'
          +' onclick="Payments.formDelete(\''+indek+'\''
          +',\''+d[x].cash_account_id+'\''
          +',\''+d[x].payment_no+'\''
          +');">'
          +'</button>'
          +'</td>'
          +'<td align="center">'+n+'</td>'
        +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Payments.form.addPagingFn(indek);
}

Payments.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)

    +'<form autocomplete="off" style="padding-bottom:50px;">'
    +'<div '
      +'style="display:grid;'
      +'grid-template-columns:repeat(3,1fr);'
      +'padding-bottom:50px;">'
    // +'<div>'
    +'<div style="padding-right:1rem;">'
      +'<ul>'
        +'<li><label>Vendor ID:</label>'
          +'<input type="text"'
          +' id="vendor_id_'+indek+'"'
          +' onfocus="this.select()"'
          +' onchange="Payments.getVendor(\''+indek+'\');"'
          +' size="16" >'
          
          +'<button type="button"'
            +' id="btn_find" '
            +' onclick="Payments.vendor.getPaging(\''+indek+'\''
            +',\'vendor_id_'+indek+'\')">'
          +'</button>'
        +'</li>'
        
        +'<li>'
          +'<label>Name:</label>'
          +'<input type="text"'
          +' id="payment_name_'+indek+'"'
          +' disabled'
          +' onfocus="this.select()")">'
        +'</li>'
      
        +'<li>'
          +'<label><input type="button"'
            +' onclick="PayToAddress.show(\''+indek+'\')" '
            +' value="Pay to Address">'
          +'</label>'
          
          +'<textarea' 
            +' id="payment_address_'+indek+'"'
            +' placeholder="Remit to"'
            +'style="resize:none;width:14.6rem;height:50px;" '
            +' spellcheck=false  disabled>'
          +'</textarea>'
        +'</li>'
      +'</ul>'
    +'</div>'
  
    +'<div style="padding-right:1rem;">'   
      +'<ul>'
      
      +'<li><label>Payment#:<i class="required"> *</i></label>'
        +'<input type="text"'
        +' id="payment_no_'+indek+'"'
        +' onfocus="this.select()"'
        +' size="9">'
        +' </li>' 
        
      +'<li><label>Date:</label>'
        +'<input type="date"'
          +' id="payment_date_'+indek+'"'
          +' onchange="Payments.calcDiscount(\''+indek+'\')"'
          +' onblur="dateFakeShow('+indek+',\'payment_date\')"'
          +' style="display:none;">'
        +'<input type="text"'
          +' id="payment_date_fake_'+indek+'"'
          +' onfocus="dateRealShow('+indek+',\'payment_date\')"'
          +' size="9">'
      +'</li>'
      
      +'<li><label>Amount:</label>'
        +'<input type="text"'
        +' id="payment_amount_'+indek+'"'
        +' disabled value="0"'
        +' style="text-align:right;"'
        +' size="9" >'
        +'</li>'
      +'</ul>'
    +'</div>'

    +'<div style="padding-right:1rem;">'
      +'<div>'
        +'<label style="display:block;">Cash Account:'
        +'&nbsp<i class="required">*</i>'
        +'</label>'
        +'<input type="text"'
        +' id="cash_account_id_'+indek+'"'
        +' onchange="Payments.getAccount(\''+indek+'\''
        +',\'cash_account_id_'+indek+'\',\'cash\')"'
        +' size="9" >'
        
        +'<button type="button"'
        +' id="btn_find"'
        +' onclick="Payments.account.getPaging(\''+indek+'\''
        +',\'cash_account_id_'+indek+'\''
        +',-1'
        +',\''+CLASS_ASSET+'\')">'
        +'</button>'

        +'<br><input type="text"'
        +' id="cash_account_name_'+indek+'"'
        +' size="12"'
        +' disabled>'
        +'</div>'
        // +'</div>'
    +'</div>'
  +'</div>'

    +'<ul>'
      +'<li><label>Memo:</label>'
        +'<input type="text"'
        +' id="payment_memo_'+indek+'"'
        +' onfocus="this.select()" '
        +' size="20">'
        +'</li>'
    +'</ul>'

    +'<details id="detail_payment_'+indek+'" open>'
      +'<summary>Payment Details</summary>'
      +'<div id="payment_detail_'+indek+'"'
      +' style="width:100%;overflow:auto;">'
      +'</div>'
    +'</details>'
    
    +'<details id="detail_receive_'+indek+'">'
      +'<summary>Receive Details</summary>'
      +'<div id="receive_detail_'+indek+'"'
      +' style="width:100%;overflow:auto;">'
      +'</div>'
      
      +'<ul>'
        +'<li><label>Discount Acct:<i class="required"> *</i></label>'
        +'<input type="text"'
        +' id="discount_account_id_'+indek+'"'
        +' onfocus="this.select()"'
        +' onchange="Payments.getAccount(\''+indek+'\''
        +',\'discount_account_id_'+indek+'\',\'discount\')"'
        +' size="9">'
        
        +'<button type="button" id="btn_find" '
        +' onclick="Payments.account.getPaging(\''+indek+'\''
            +',\'discount_account_id_'+indek+'\''
            +',-1'
            +',\''+CLASS_EXPENSE+'\')"'
            +'>'
        +'</button>'
        
        +'<input type="text"'
        +' id="discount_account_name_'+indek+'"'
        +' disabled>'
        +'</li>'
      +'</ul>'
    +'</details>'
    
    +'</form>'
    +'<p><i class="required">* Required</i></p>'
    +'</div>';
  content.html(indek,html);
  statusbar.ready(indek);
  
  document.getElementById('vendor_id_'+indek).focus();
  document.getElementById('payment_date_'+indek).value=tglSekarang();
  document.getElementById('payment_date_fake_'+indek).value=tglWest(tglSekarang());
  
  Payments.setRows(indek,[]);
  Payments.receive.setRows(indek,[]);
  
  if(metode==MODE_CREATE) Payments.setDefault(indek);
}

Payments.setRows=(indek,isi)=>{
  if(isi===undefined)isi=[];
  var panjang=isi.length;
  var html=Payments.tableHead(indek);
  var sum_item_amount=0;
  
  bingkai[indek].payment_detail=isi;
  
  for (var i=0;i<panjang;i++){
    html+='<tr>'
    +'<td>'+(i+1)+'</td>'

    +'<td style="padding:0;margin:0;">'
    +'<input type="text"'
      +' id="quantity_'+i+'_'+indek+'"'
      +' value="'+isi[i].quantity+'"'
      +' onchange="Payments.setCell(\''+indek+'\''
      +',\'quantity_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()"'
      +' style="text-align:center"'
      +' size="6" >'
    +'</td>'
          
    +'<td style="margin:0;padding:0">'
    +'<input type="text"'
      +' id="item_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].item_id+'"'
      +' onchange="Payments.setCell(\''+indek+'\''
      +',\'item_id_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()" '
      +' style="text-align:left"'
      +' size="10" >'
    +'</td>'
          
    +'<td>'
      +'<button type="button"'
        +' id="btn_find"'
        +' onclick="Payments.item.getPaging(\''+indek+'\''
        +',\'item_id_'+i+'_'+indek+'\''
        +',\''+i+'\');">'
      +'</button>'
      +'</td>'
                
    +'<td style="padding:0;margin:0;">'
    +'<input type="text"'
      +' id="description_'+i+'_'+indek+'"'
      +' value="'+isi[i].description+'"'
      +' onchange="Payments.setCell(\''+indek+'\''
      +',\'description_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()" '
      +' size="20" >'
    +'</td>'

    +'<td  align="center" style="padding:0;margin:0;">'
    +'<input type="text"'
      +' id="gl_account_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].gl_account_id+'"'
      +' onchange="Payments.setCell(\''+indek+'\''
      +',\'gl_account_id_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()" '
      +' size="9" >'
    +'</td>'
    
    +'<td>'
      +'<button type="button" id="btn_find" '
      +' onclick="Payments.account.getPaging(\''+indek+'\''
      +',\'gl_account_id_'+i+'_'+indek+'\''
      +',\''+i+'\''
      +',\''+CLASS_EXPENSE+'\');">'
      +'</button>'
      +'</td>'

    +'<td  align="right" style="padding:0;margin:0;">'
    +'<input type="text"'
      +' id="unit_price_'+i+'_'+indek+'"'
      +' value="'+isi[i].unit_price+'" '
      +' onchange="Payments.setCell(\''+indek+'\''
      +',\'unit_price_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()" '
      +' style="text-align:right"'
      +' size="6" >'
    +'</td>'
          
    +'<td  align="right" style="padding:0;margin:0;">'
    +'<input type="text"'
      +' id="amount_'+i+'_'+indek+'"'
      +' value="'+isi[i].amount+'"'
      +' onchange="Payments.setCell(\''+indek+'\''
      +',\'amount_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()" '
      +' style="text-align:right"'
      +' size="9" >'
    +'</td>'
          
    +'<td  align="center" style="padding:0;margin:0;">'
      +'<input type="text"'
      +' id="job_phase_cost_'+i+'_'+indek+'"'
      +' value="'+isi[i].job_phase_cost+'"'
      +' onchange="Payments.setCell(\''+indek+'\''
      +',\'job_phase_cost_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()" '
      +' size="8" >'
    +'</td>'

    +'<td><button type="button"'
      +' id="btn_find"'
      +' onclick="Payments.job.getPaging(\''+indek+'\''
      +',\'job_phase_cost_'+i+'_'+indek+'\',\''+i+'\');">'
      +'</button>'
    +'</td>'
          
    +'<td align="center">'
      +'<button type="button"'
        +' id="btn_add"'
        +' onclick="Payments.addRow(\''+indek+'\','+i+')" >'
        +'</button>'

      +'<button type="button"'
        +' id="btn_remove"'
        +' onclick="Payments.removeRow(\''+indek+'\','+i+')" >'
        +'</button>'
    +'</td>'
    +'</tr>';
    
    sum_item_amount+=Number(isi[i].amount);
  }
  html+=Payments.tableFoot(indek);
  var budi=JSON.stringify(isi);
  document.getElementById('payment_detail_'+indek).innerHTML=html;
  
  bingkai[indek].item_amount=sum_item_amount;
  
  Payments.calculateTotal(indek);
  if(panjang==0)Payments.addRow(indek,[]);
}

Payments.tableHead=(indek)=>{
  return '<table>'
    +'<thead>'
    +'<tr>'
    +'<th colspan="2">Qty</th>'
    +'<th colspan="2">Item</th>'
    +'<th>Description</th>'
    +'<th colspan="2">GL Account</th>'
    +'<th>Unit Price</th>'
    +'<th>Amount</th>'
    +'<th colspan="2">Job ID</th>'
    +'<th>Add/Rem</th>'
    +'</tr>'
    +'</thead>';
}

Payments.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
    +'<td>&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

Payments.calculateTotal=(indek)=>{
  // receipt
  var itemAmount=Number(bingkai[indek].item_amount) || 0;
  var receiveAmount=Number(bingkai[indek].item_amount_receive) || 0;
  var discountAmount=Number(bingkai[indek].sum_discount) || 0;

  //var receiptAmount=(itemAmount+taxValue);
  
  // document.getElementById('receive_total_paid_'+indek).value=receiveAmount;
  setEV('payment_amount_'+indek, Number(receiveAmount+itemAmount));
}

Payments.addRow=(indek,baris)=>{
  Payments.gl_account_id=bingkai[indek].data_default.gl_account_id;
  Payments.grid.addRow(indek,baris,bingkai[indek].payment_detail);
}

Payments.newRow=(newBas)=>{
  newBas.push({
    'row_id':newBas.length+1,
    'item_id':'',
    'description':'',
    'unit_price':0.00,
    'quantity':0,
    'amount':0.00,
    'gl_account_id':Payments.gl_account_id,
    'job_phase_cost':''
  });
}

Payments.removeRow=(indek,baris)=>{
  Payments.grid.removeRow(indek,baris,bingkai[indek].payment_detail);
}

Payments.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].payment_detail;
  var baru = [];
  var isiEdit = {};
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
      Payments.getItem(indek,i);
      
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
  }
  bingkai[indek].item_amount=sum_item_amount;
  Payments.calculateTotal(indek);
}

Payments.receive.setRows=(indek,isi)=>{
  if(isi===undefined)isi=[];
  var panjang=isi.length;
  var html=Payments.receive.tableHead(indek);
  var amount_paid=0, sum_discount=0;
  var discount=0;
  var payment_date=getEV('payment_date_'+indek);
  var contreng='';
  var pay=0;
    
  bingkai[indek].receive_detail=isi;

  for (var i=0;i<panjang;i++){
    discount=0;
    amount_paid+=Number(isi[i].amount_paid);
    //sum_discount+=Number(isi[i].discount_amount);
    sum_discount+=Number(isi[i].discount);

//    alert(payment_date)
//    alert(isi[i].discount_date);
//    if(payment_date<=isi[i].discount_date){
    if(payment_date<=isi[i].date_due){// discount_date atau date_due??? yg bener apa ya???
      //if(Number(isi[i].discount)>0{
        discount=isi[i].discount;
        //alert(isi[i].discount);
      //}else{
        //discount=isi[i].discount;
      //}
    }else{
      discount='';
      //discount=isi[i].discount;
    }

//    discount=isi[i].discount;// sementara;
    
    if(isi[i].description==undefined) isi[i].description='';
    if(isi[i].pay==undefined) isi[i].pay=0;
    
    isi[i].pay==1?contreng='checked':contreng='';
    if(isi[i].pay==1) pay++;

    html+='<tr>'
    +'<td>'+(i+1)+'</td>'
            
    +'<td style="padding:0;margin:0;">'
      +'<input type="text"'
      +' id="receive_no_'+i+'_'+indek+'"'
      +' value="'+isi[i].invoice_no+'"'
      +' size=9 disabled>'
      +'</td>'
            
    +'<td style="margin:0;padding:0">'
      +'<input type="text"'
      +' id="date_due_'+i+'_'+indek+'"'
      +' value="'+tglWest(isi[i].date_due)+'"'
      +' style="text-align:center;"'
      +' size="9" disabled>'
      +'</td>'
            
    +'<td style="margin:0;padding:0">'
      +'<input type="text"'
      +' id="amount_due_'+i+'_'+indek+'"'
      +' value="'+isi[i].amount_due+'"'
      +' style="text-align:right" '
      +' size="9"'
      +' disabled >'
      +'</td>'

    +'<td style="padding:0;margin:0;">'
      +'<input type="text"'
      +' id="invoice_description_'+i+'_'+indek+'"'
      +' value="'+isi[i].description+'"'
      +' onchange="Payments.receive.setCell(\''+indek+'\''
      +',\'invoice_description_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()" '
      +' size="15" >'
      +'</td>'
                        
    +'<td  align="center" style="padding:0;margin:0;">'
      +'<input type="text"'
      +' id="discount_'+i+'_'+indek+'"'
      +' value="'+discount+'"'
      +' onchange="Payments.receive.setCell(\''+indek+'\''
      +',\'discount_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()" '
      +' style="text-align:right;"'
      +' size="6" >'
      +'</td>'
            
    +'<td  align="right" style="padding:0;margin:0;">'
      +'<input type="text"'
      +' id="amount_paid_'+i+'_'+indek+'"'
      +' value="'+Number(isi[i].amount_paid)+'"'
      +' onchange="Payments.receive.setCell(\''+indek+'\''
      +',\'amount_paid_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()" '
      +' style="text-align:right"'
      +' size="9" >'
      +'</td>'
            
    +'<td align="center">'
      +'<input type="checkbox"'
      +' id="pay_'+i+'_'+indek+'"'
      +' value="'+isi[i].pay+'"'
      +' size="3" '
      +' onchange="Payments.receive.setCell(\''+indek+'\''
      +',\'pay_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()" '+contreng+'>'
      +'</td>'            
    +'</tr>';
  }
  html+=Payments.receive.tableFoot(indek);
  var budi = JSON.stringify(isi);
  document.getElementById('receive_detail_'+indek).innerHTML=html;

  bingkai[indek].item_amount_receive=amount_paid;
  bingkai[indek].sum_discount=sum_discount;
  bingkai[indek].total_pay=pay;
  Payments.calculateTotal(indek);

  if(panjang==0)Payments.receive.addRow(indek,0);
}

Payments.receive.tableHead=(indek)=>{
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

Payments.receive.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
    +'<td>&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

Payments.receive.addRow=(indek,baris)=>{
  Payments.receive.grid.addRow(indek,baris,
    bingkai[indek].receive_detail);
}

Payments.receive.newRow=(newBas)=>{
  newBas.push({
    'row_id':newBas.length+1,
    'invoice_no':"",
    'date_due':"",
    'discount_date':"",
    'amount_due':0,
    'discount_amount':0,
    'description':"",
    'discount':0,
    'amount_paid':0,
    'pay':0
  });
}

Payments.receive.setCell=(indek,id_kolom)=>{
  var payment_date=getEV('payment_date_'+indek);
  var isi=bingkai[indek].receive_detail;
  var baru = [];
  var isiEdit = {};
  var total_paid=0;
  var discount=0;
  var nilai;
  
  nilai=getEV(id_kolom);
  
  for (var i=0;i<isi.length; i++){
    if(payment_date<=isi[i].discount_date){
      //discount=isi[i].discount_amount;
      discount=isi[i].discount;
    }else{
      discount=getEV('discount_'+i+'_'+indek);
    }
    isiEdit=isi[i];
    
    if(id_kolom==('invoice_description_'+i+'_'+indek)){
      isiEdit.description=nilai;
      baru.push(isiEdit);
    
    }else if(id_kolom==('discount_'+i+'_'+indek)){
      isiEdit.discount=nilai;
      isiEdit.amount_paid=Number(isiEdit.amount_due)-Number(isiEdit.discount);
      baru.push(isiEdit);
      setEV('amount_paid_'+i+'_'+indek, Number(isiEdit.amount_paid));
    
    }else if(id_kolom==('amount_paid_'+i+'_'+indek)){  
      isiEdit.amount_paid=nilai;
      //isiEdit.discount=discount;
      isiEdit.pay=true;

      baru.push(isiEdit);
      document.getElementById('pay_'+i+'_'+indek).checked=true;
    
    }else if(id_kolom==('pay_'+i+'_'+indek)){  
      isiEdit.pay=document.getElementById(id_kolom).checked;
      isiEdit.discount=discount;//document.getElementById('discount_'+i+'_'+indek).value;
      
      if(isiEdit.pay==false){
        isiEdit.amount_paid=0;
      }else{
        isiEdit.amount_paid=
        (isi[i].amount_due-discount);
      }
      setEV('discount_'+i+'_'+indek, Number(isiEdit.discount));
      setEV('amount_paid_'+i+'_'+indek,Number(isiEdit.amount_paid));
      baru.push(isiEdit);      
    }else{
      baru.push(isi[i]);
    }
    total_paid+=Number(isi[i].amount_paid);
  }
  
  bingkai[indek].receive_detail=isi;
  bingkai[indek].item_amount_receive=total_paid;
  Payments.calculateTotal(indek);
}

Payments.setDefault=(indek)=>{
  var d=bingkai[indek].data_default;
  setEV('discount_account_id_'+indek,d.discount_account_id);
  setEV('discount_account_name_'+indek,d.discount_account_name);

  setEV('cash_account_id_'+indek,d.cash_account_id);
  setEV('cash_account_name_'+indek,d.cash_account_name);  
  
  bingkai[indek].vendor_id='';
  bingkai[indek].payment_no='';
  bingkai[indek].item_amount=0;
  bingkai[indek].item_amount_receive=0;
  
  PayToAddress.getDefault(indek);
}

Payments.setVendor=(indek,d)=>{
  setEV('vendor_id_'+indek, d.vendor_id);
  Payments.getVendor(indek);
}

Payments.getVendor=(indek)=>{
  Payments.vendor.getOne(indek,
    getEV('vendor_id_'+indek),
  (paket)=>{
    setEV('payment_name_'+indek, txt_undefined);
    if(paket.err.id==0 && paket.count>0){
      var v=objectOne(paket.fields,paket.data);
      var va=JSON.parse(v.address);
      
      setEV('payment_name_'+indek, v.name);
      setEV('payment_address_'+indek, toAddress(va));
      setEV('payment_memo_'+indek, v.account);
      
      bingkai[indek].payment_address=va;
    }
  });
  Payments.getReceive(indek);
  Payments.setRows(indek,[]);
}

Payments.getReceive=(indek)=>{
  db.run(indek,{
    query:"SELECT "
      +" invoice_no, "
      +" date_due, "
      +" amount_due, "
      +" discount_date, "
      +" discount, "
      +" discount AS discount_amount, "
      +" amount_paid"
      +" FROM receive_payment_sum "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+getEV('vendor_id_'+indek)+"'"
      +" AND amount_due != 0 "
  },(paket)=>{
    if(paket.count>0){
      var d=objectMany(paket.fields,paket.data)
      Payments.receive.setRows(indek, d);
      
      document.getElementById('detail_receive_'+indek).open=true;
      document.getElementById('detail_payment_'+indek).open=false;
    }else{
      Payments.receive.setRows(indek, []);
      document.getElementById('detail_receive_'+indek).open=false;
      document.getElementById('detail_payment_'+indek).open=true;
    }
  });
}

Payments.setItem=(indek,data)=>{  
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, data.item_id);
  Payments.setCell(indek,id_kolom);
}

Payments.getItem=(indek,baris)=>{
  Payments.item.getOne(indek,
    getEV('item_id_'+baris+'_'+indek),
  (paket)=>{
    setEV('description_'+baris+'_'+indek,txt_undefined);
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      
      setEV('item_id_'+baris+'_'+indek,d.item_id);
      setEV('description_'+baris+'_'+indek,d.name_for_purchases);
      if(d.name_for_purchases=='')
        setEV('description_'+baris+'_'+indek,d.name);
      if(d.name=='')
        setEV('description_'+baris+'_'+indek,d.name_for_sales);
      setEV('gl_account_id_'+baris+'_'+indek,d.inventory_account_id);

      Payments.setCell(indek,'description_'+baris+'_'+indek);
      Payments.setCell(indek,'gl_account_id_'+baris+'_'+indek);
    }
  });
}

Payments.setAccount=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var baris=bingkai[indek].baris;

  setEV(id_kolom, data.account_id);
  Payments.getAccount(indek,id_kolom,baris);
}

Payments.getAccount=(indek,id_kolom,baris)=>{
  Payments.account.getOne(indek,
    getEV(id_kolom),
  (paket)=>{
    let nm_account=txt_undefined;
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      nm_account=d.name;
    }
    switch(id_kolom){
      case "cash_account_id_"+indek:
        setEV('cash_account_name_'+indek, nm_account);
        break;
      case "discount_account_id_"+indek:
        setEV('discount_account_name_'+indek, nm_account);
        break;
      case "gl_account_id_"+baris+'_'+indek:
        Payments.setCell(indek,id_kolom);
        break;

      default:
        alert(id_kolom+' undefined. ')
    }
  });
}

Payments.setJob=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d);
  Payments.setCell(indek,id_kolom);
}

Payments.calcDiscount=(indek)=>{
  var receive_detail=bingkai[indek].receive_detail;
  var payment_date=getEV('payment_date_'+indek);

  for (var i=0;i<receive_detail.length;i++){
    document.getElementById('amount_paid_'+i+'_'+indek).value=''
    document.getElementById('pay_'+i+'_'+indek).checked=false;
    document.getElementById('payment_amount_'+indek).value=0;

    if(payment_date<=receive_detail[i].discount_date){
      document.getElementById('discount_'+i+'_'+indek).value=
        receive_detail[i].discount_amount;
    }else{
      document.getElementById('discount_'+i+'_'+indek).value='';
    }
  }
}

Payments.createExecute=(indek)=>{
  var address=JSON.stringify(bingkai[indek].payment_address);
  var payment_detail=JSON.stringify(bingkai[indek].payment_detail);
  var receive_detail=JSON.stringify(bingkai[indek].receive_detail);
  var some_note=JSON.stringify(
    ['add some notes for this payment','new-1']
  );

  db.execute(indek,{
    query:"INSERT INTO payments"
    +"(admin_name,company_id,vendor_id,name,address,memo"
    +",payment_no,date,cash_account_id"
    +",detail,invoice_detail,discount_account_id,note)"
    +" VALUES "
    +"('"+bingkai[indek].admin.name+"'"
    +",'"+bingkai[indek].company.id+"'"
    +",'"+getEV("vendor_id_"+indek)+"'"
    +",'"+getEV("payment_name_"+indek)+"'"
    +",'"+address+"'"
    +",'"+getEV("payment_memo_"+indek)+"'"
    +",'"+getEV("payment_no_"+indek)+"'"
    +",'"+getEV("payment_date_"+indek)+"'"
    +",'"+getEV("cash_account_id_"+indek)+"'"
    +",'"+payment_detail+"'"
    +",'"+receive_detail+"'"
    +",'"+getEV("discount_account_id_"+indek)+"'"
    +",'"+some_note+"'"
    +")"
  });
}

Payments.readOne=(indek,callback)=>{
  db.run(indek,{
    query:" SELECT * "
      +" FROM payments"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+bingkai[indek].cash_account_id+"' "
      +" AND payment_no='"+bingkai[indek].payment_no+"' "

  },(paket)=>{
    if (paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      var a=JSON.parse(d.address);
      
      setEV('vendor_id_'+indek, d.vendor_id);
      setEV('payment_name_'+indek, a);
      
      bingkai[indek].payment_address=a;
      Payments.setPayAddress(indek);
      
      setEV('payment_name_'+indek, a.name);
      setEV('payment_memo_'+indek, d.memo);
      
      setEV('payment_no_'+indek, d.payment_no);
      setEV('payment_date_'+indek, d.date);
      setEV('payment_date_fake_'+indek, tglWest(d.date));
      setEV('payment_amount_'+indek, d.amount);

      setEV('cash_account_id_'+indek, d.cash_account_id);
      setEV('cash_account_name_'+indek, d.cash_account_name);
      
      setEV('discount_account_id_'+indek, d.discount_account_id);
      setEV('discount_account_name_'+indek, d.discount_account_name);
      
      //setEV('payment_amount_'+indek, d.amount);
      
      Payments.setRows(indek, JSON.parse(d.detail) );
      Payments.receive.setRows(indek, JSON.parse(d.invoice_detail));

      if(bingkai[indek].total_pay>0){
        document.getElementById('detail_receive_'+indek).open=true;
        document.getElementById('detail_payment_'+indek).open=false;
      }else{
        document.getElementById('detail_receive_'+indek).open=false;
        document.getElementById('detail_payment_'+indek).open=true;
      }      
      message.none(indek);
    }
    
    return callback();
  });
}

Payments.setPayAddress=(indek)=>{
  var payment_address=bingkai[indek].payment_address;
  setEV('payment_name_'+indek, payment_address.name);
  setEV('payment_address_'+indek, toAddress(payment_address));
}

Payments.formUpdate=(indek,cash_account_id,payment_no)=>{
  bingkai[indek].cash_account_id=cash_account_id;
  bingkai[indek].payment_no=payment_no;
  Payments.form.modeUpdate(indek);
}

Payments.updateExecute=(indek)=>{  
  var address=JSON.stringify(bingkai[indek].payment_address);
  var detail=JSON.stringify(bingkai[indek].payment_detail);
  var receive_detail=JSON.stringify(bingkai[indek].receive_detail);
  var some_note=JSON.stringify(
    ["add some notes for this payment",'edit-1']
  );
  
  db.execute(indek,{
    query:"UPDATE payments "
      +" SET vendor_id='"+getEV("vendor_id_"+indek)+"' "
      +" ,name='"+getEV("payment_name_"+indek)+"' "
      +" ,address='"+address+"' "
      +" ,memo='"+getEV("payment_memo_"+indek)+"' "
      +" ,payment_no='"+getEV("payment_no_"+indek)+"' "
      +" ,date='"+getEV("payment_date_"+indek)+"' "
      +" ,cash_account_id='"+getEV("cash_account_id_"+indek)+"' "
      +" ,detail='"+detail+"' "
      +" ,invoice_detail='"+receive_detail+"' "
      +" ,discount_account_id='"+getEV("discount_account_id_"+indek)+"' "
      +" ,note='"+some_note+"' "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+bingkai[indek].cash_account_id+"' "
      +" AND payment_no='"+bingkai[indek].payment_no+"' "
  },(p)=>{
    if(p.err.id==0) {
      bingkai[indek].cash_account_id=getEV("cash_account_id_"+indek);
      bingkai[indek].payment_no=getEV("payment_no_"+indek);
      Payments.deadPath(indek);
    }
  });
}

Payments.formDelete=(indek,cash_account_id,payment_no)=>{
  bingkai[indek].cash_account_id=cash_account_id;
  bingkai[indek].payment_no=payment_no;
  Payments.form.modeDelete(indek);
}

Payments.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM payments"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+bingkai[indek].cash_account_id+"' "
      +" AND payment_no='"+bingkai[indek].payment_no+"' "
  },(p)=>{
    if(p.err.id==0) Payments.deadPath(indek);
  });
}

Payments.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM payments "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND payment_no LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Payments.search=(indek)=>{
  Payments.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT payment_no,date,amount,name,cash_account_id,"
        +" user_name,date_modified "
        +" FROM payments"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND payment_no LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Payments.readShow(indek);
    });
  });
}

Payments.exportExecute=(indek)=>{
  var table_name=Payments.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

Payments.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO payments"
      +"(admin_name,company_id,vendor_id,name,address,memo"
      +",payment_no,date,cash_account_id"
      +",detail,invoice_detail,discount_account_id,note)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+d[i][1]+"'" // 1-vendor_id
      +",'"+d[i][2]+"'" // 2-name
      +",'"+d[i][3]+"'" // 3-address
      +",'"+d[i][4]+"'" // 4-memo
      +",'"+d[i][5]+"'" // 5-no
      +",'"+d[i][6]+"'" // 6-date
      +",'"+d[i][7]+"'" // 7-cash_account_id
      +",'"+d[i][8]+"'" // 8-detail
      +",'"+d[i][9]+"'" // 9-receive_detail
      +",'"+d[i][10]+"'"// 10-discount_account_id
      +",'"+d[i][11]+"'"// 11-note
      +")"
    },(paket)=>{  
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

Payments.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT payment_no,date,amount,name, cash_account_id,"
      +" user_name,date_modified"
      +" FROM payments"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Payments.selectShow(indek);
  });
}

Payments.selectShow=(indek)=>{
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
      +'<th colspan="2">Payment #</th>'
      +'<th>Date</th>'
      +'<th>Amount</th>'
      +'<th>Vendor Name</th>'
      +'<th>Owner</th>'
      +'<th colspan="2">Modified</th>'
    +'</tr>';

  if (p.err.id===0){
    var x;
    for(x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'
          +'<input type="checkbox"'
          +' id="checked_'+x+'_'+indek+'"'
          +' name="checked_'+indek+'" >'
        +'</td>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].payment_no+'</td>'
        +'<td align="center">'+tglWest(d[x].date)+'</td>'
        +'<td align="right">'+d[x].amount+'</td>'
        +'<td align="left">'+xHTML(d[x].name)+'</td>'
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

Payments.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM payments"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND cash_account_id='"+d[i].cash_account_id+"' "
          +" AND payment_no='"+d[i].payment_no+"' "
      });
    }
  }
  db.deleteMany(indek,a);
} 

Payments.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM payments"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND cash_account_id='"+getEV('cash_account_id_'+indek)+"' "
      +" AND payment_no='"+getEV('payment_no_'+indek)+"' "
  },(p)=>{
    if (p.count>0) {
      var d=objectOne(p.fields,p.data) ;      
      bingkai[indek].file_id=d.file_id;
      Properties.lookup(indek);
    }
    message.none(indek);
  });
}

Payments.duplicate=(indek)=>{
  var id='copy_of '+getEV('payment_no_'+indek);
  setEV('payment_no_'+indek,id);
  focus('payment_no_'+indek);
}


Payments.deadPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Payments.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Payments.properties(indek);})
  }
}






// eof: 1167;1096;1188;1269;1306;1322;1296;1301;1303;1310;

