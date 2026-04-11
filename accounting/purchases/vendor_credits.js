/*
 * auth: budiono;
 * code: H7;
 * path: /accounting/purchases/vendor_credits.js;
 * ---------------------------------------------;
 * name: nov-18, 15:21, sat-2023; new; 
 * edit: nov-19, 12:40, sun-2023; display;
 * -----------------------------; happy new year 2024;
 * edit: feb-15, 11:41, thu-2024; class;
 * edit: jul-23, 11:05, tue-2024; r9;
 * edit: aug-11, 09:30, sun-2024; r11;
 * edit: sep-30, 11:00, mon-2024; r19; 
 * edit: nov-28, 13:35, thu-2024; #27; add locker();
 * edit: dec-02, 16:03, mon-2024; #27; 2;
 * edit: dec-18, 14;09, wed-2024; #31; properties;
 * edit: dec-30, 10:48, mon-2024; #32; properties+duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-24, 21:20, mon-2025; #41; file_id;
 * edit: mar-13, 22:26, thu-2025; #43; deep-folder;
 * edit: mar-27, 08:26, thu-2025; #45; ctables;cstructure;
 * edit: apr-24, 21:46, thu-2025; #50; can export to csv;
 * edit: aug-16, 15:00, sat-2025; #68; date;
 * edit: oct-29, 05:46, wed-2025; #80;
 * edit: oct-31, 10:52, fri-2025; #80;
 */ 

'use strict';

var VendorCredits={}
VendorCredits.table_name='vendor_credits';
VendorCredits.kosong='--No Invoice Selected--';
VendorCredits.form=new ActionForm2(VendorCredits);
VendorCredits.vendor=new VendorLook(VendorCredits);
VendorCredits.account=new AccountLook(VendorCredits);
VendorCredits.item=new ItemLook(VendorCredits);
VendorCredits.job=new JobLook(VendorCredits);
VendorCredits.invoice={};

VendorCredits.show=(karcis)=>{
  karcis.modul=VendorCredits.table_name;
  karcis.have_child=true;
  
  var baru=exist(karcis);
  if(baru==-1){
    var newTxs=new BingkaiUtama(karcis);
    var indek=newTxs.show();
    createFolder(indek,()=>{
      VendorCredits.form.modePaging(indek);
      VendorCredits.getDefault(indek);
    });
  }else{
    show(baru);
  }
}

VendorCredits.getDefault=(indek)=>{
  VendorDefaults.getDefault(indek);
}

VendorCredits.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM vendor_credits"
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

VendorCredits.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  VendorCredits.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT vendor_id,credit_no,date,amount,vendor_name,"
        +" user_name,date_modified"
        +" FROM vendor_credits"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY date,credit_no"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      VendorCredits.readShow(indek);
    });
  })
}

VendorCredits.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +TotalPagingLimit(indek)
    +'<table border=1>'
      +'<tr>'
        +'<th colspan="2">Credit #</th>'
        +'<th>Date</th>'
        +'<th>Amount</th>'
        +'<th>Vendor Name</th>'
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
        +'<td align="left">'+d[x].credit_no+'</td>'
        +'<td align="center">'+tglWest(d[x].date)+'</td>'
        +'<td align="right">'+d[x].amount+'</td>'
        +'<td align="left">'+xHTML(d[x].vendor_name)+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button"'
          +' id="btn_change"'
          +' onclick="VendorCredits.formUpdate(\''+indek+'\''
          +',\''+d[x].vendor_id+'\''
          +',\''+d[x].credit_no+'\''
          +');"></button>'
        +'</td>'
        +'<td align="center">'
          +'<button type="button"'
          +' id="btn_delete"'
          +' onclick="VendorCredits.formDelete(\''+indek+'\''
          +',\''+d[x].vendor_id+'\''
          +',\''+d[x].credit_no+'\''
          +');"></button>'
        +'</td>'
        +'<td align="center">'+n+'</td>'
        +'</tr>';
    }
  }
  html+='</table>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  VendorCredits.form.addPagingFn(indek);
}

VendorCredits.formEntry=(indek,metode)=>{
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
        
          +'<li><label>Vendor ID:<i class="required">*</i>:</label>'
            +'<input type="text" '
            +' id="vendor_id_'+indek+'"'
            +' onchange="VendorCredits.getVendor(\''+indek+'\')"'
            +' size="16" >'
            
            +'<button type="button" id="btn_find" '
            +' onclick="VendorCredits.vendor.getPaging(\''+indek+'\''
            +',\'vendor_id_'+indek+'\')">'
            +'</button>'
            +'</li>'
            
          +'<li><label>Name:</label>'
            +'<input type="text"'
            +' id="vendor_name_'+indek+'"'
            +' disabled>'
            +'</li>'
                   
          +'<li><label>Bill To:</label>'
            +'<textarea id="vendor_address_'+indek+'" '
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
          +'<li><label>Credit No.:</label>'
            +'<input type="text"'
            +' id="credit_no_'+indek+'"'
            +' size="9" >'
            +'</li>'    

          +'<li><label>Date:</label>'
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
    
    +'<div style="display:grid;grid-template-columns:repeat(3,1fr);'
    +'padding-bottom:10px;">'

      +'<div>'
        +'<label style="display:block;">Terms:</label>'
        
        +'<input type="text"'
        +' id="displayed_terms_'+indek+'"'
        +' style="text-align:center;"'
        +' size="15" >'
        
        +'<button type="button" id="btn_find" '
        +' onclick="VendorCredits.showTerms(\''+indek+'\');">'
        +'</button>'
      +'</div>'  
        
      +'<div>'
        +'<label style="display:block;">Return Authorization</label>'
        +'<input type="text"'
        +' id="return_authorization_'+indek+'"'
        +' size="16" >'
      +'</div>'  
      
      +'<div>'
        +'<label style="display:block;">A/P Account:</label>'
          +'<input type="text" '
          +' id="ap_account_id_'+indek+'" '
          +' onchange="VendorCredits.getAccount(\''+indek+'\''
          +',\'ap_account_id_'+indek+'\',\'ap\')"'
          +' size="9" >'

          +'<button type="button" id="btn_find" '
          +' onclick="VendorCredits.account.getPaging(\''+indek+'\''
          +',\'ap_account_id_'+indek+'\''
          +',-1'
          +',\''+CLASS_LIABILITY+'\')">'
          +'</button>'
      +'</div>'
    +'</div>'
      
    +'<details id="detail_invoice_'+indek+'">'
      +'<summary>Invoice Details</summary>'
      +'Invoice No.:&nbsp;'
      +'<select id="invoice_no_'+indek+'"'
        +' onchange="VendorCredits.getInvoiceItem(\''+indek+'\')" >'
        +'<option>'+VendorCredits.kosong+'</option>'
        +'</select>'
        
      +'<div id="invoice_detail_'+indek+'"'
        +' style="width:100%;overflow:auto;" >'
        +'</div>'
      +'</details>'
      
    +'<details open id="detail_credit_'+indek+'">'
      +'<summary>Credit Memo Details</summary>'
      +'<div id="credit_detail_'+indek+'"'
        +' style="width:100%;overflow:auto;" >'
        +'</div>'
      +'</details>'
      
    +'<div style="display:grid;'
      +'grid-template-columns:repeat(3,1fr);'
      +'padding-bottom:20px;">'
      
      +'<div>'
        +'~c'
      +'</div>'

      +'<div>'
        +'~c'
      +'</div>'
      
      +'<div>'
        +'<ul>'
          +'<li><label>Credit Total:</label>'
            +'<input type="text" '
            +' id="credit_total_'+indek+'"'
            +' disabled'
            +' style="text-align:right"'
            +' size="9" >'
            +'</li>'
        +'</ul>'
      +'</div>'

    +'</div>'
    +'</form>'
  +'</div>';
  content.html(indek,html);
  document.getElementById('vendor_id_'+indek).focus();
  document.getElementById('credit_date_'+indek).value=tglSekarang();
  document.getElementById('credit_date_fake_'+indek).value=tglWest(tglSekarang());
  
  VendorCredits.setRows(indek,[]);

  VendorCredits.setDefault(indek);
  statusbar.ready(indek);
}

VendorCredits.setRows=(indek,isi)=>{
  if(isi===undefined)isi=[];

  var panjang=isi.length;
  var html=VendorCredits.tableHead(indek);
  var sum_item=0;
  var sum_tax=0;
  
  bingkai[indek].credit_detail=isi;
  
  for (var i=0;i<panjang;i++){
    html+='<tr>'
    +'<td align="center">'+(i+1)+'</td>'
      
    +'<td align="center" style="margin:0;padding:0">'
      +'<input type="text"'
      +' id="quantity_'+i+'_'+indek+'"'
      +' value="'+isi[i].quantity+'"'
      +' onchange="VendorCredits.setCell(\''+indek+'\''
      +',\'quantity_'+i+'_'+indek+'\')"'
      +' onfocus="this.select()"'
      +' style="text-align:center"'
      +' size="3" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;">'
      +'<input type="text"'
      +' id="item_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].item_id+'"'
      +' onchange="VendorCredits.setCell(\''+indek+'\''
      +',\'item_id_'+i+'_'+indek+'\')"'
      +' onfocus="this.select()" '
      +' style="text-align:left"'
      +' size="10" >'
      +'</td>'
      
    +'<td><button type="button" id="btn_find" '
      +' onclick="VendorCredits.item.getPaging(\''+indek+'\''
      +',\'item_id_'+i+'_'+indek+'\''
      +',\''+i+'\');">'
      +'</button>'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="description_'+i+'_'+indek+'" '
      +' value="'+isi[i].description+'" '
      +' onchange="VendorCredits.setCell(\''+indek+'\''
      +',\'description_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()" '
      +' style="text-align:left" '
      +' size="15" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text" '
      +' id="gl_account_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].gl_account_id+'"'
      +' onchange="VendorCredits.setCell(\''+indek+'\''
      +',\'gl_account_id_'+i+'_'+indek+'\',\'credit\')"'
      +' onfocus="this.select()"'
      +' style="text-align:center;"'
      +' size="9" >'
      +'</td>'

    +'<td><button type="button" id="btn_find"'
      +' onclick="VendorCredits.account.getPaging(\''+indek+'\''
      +',\'gl_account_id_'+i+'_'+indek+'\''
      +',\''+i+'\''
      +',\''+CLASS_EXPENSE+'\');">'
      +'</button>'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="unit_price_'+i+'_'+indek+'"'
      +' value="'+isi[i].unit_price+'"'
      +' onchange="VendorCredits.setCell(\''+indek+'\''
      +',\'unit_price_'+i+'_'+indek+'\')"'
      +' onfocus="this.select()" '
      +' style="text-align:right"'
      +' size="6" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="amount_'+i+'_'+indek+'"'
      +' value="'+Number(isi[i].amount)+'"'
      +' onchange="VendorCredits.setCell(\''+indek+'\''
      +',\'amount_'+i+'_'+indek+'\')"'
      +' onfocus="this.select()"'
      +' style="text-align:right"'
      +' size="9" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="job_phase_cost_'+i+'_'+indek+'"'
      +' value="'+isi[i].job_phase_cost+'"'
      +' onchange="VendorCredits.setCell(\''+indek+'\''
      +',\'job_phase_cost_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()" '
      +' style="text-align:center"'
      +' size="5" >'
      +'</td>'

    +'<td><button type="button"'
      +' id="btn_find"'
      +' onclick="VendorCredits.job.getPaging(\''+indek+'\''
      +',\'job_phase_cost_'+i+'_'+indek+'\''
      +',\''+i+'\');">'
      +'</button>'
      +'</td>'

    +'<td align="center">'
      +'<button type="button"'
      +' id="btn_add"'
      +' onclick="VendorCredits.addRow(\''+indek+'\','+i+')">'
      +'</button>/'
      +'<button type="button"'
      +' id="btn_remove"'
      +' onclick="VendorCredits.removeRow(\''+indek+'\','+i+')"'
      +'>'
      +'</button>'
    +'</td>'
    +'</tr>';
    
    sum_item+=Number(isi[i].amount);

  }
  html+=VendorCredits.tableFoot(indek);
  var budi=JSON.stringify(isi);
  
  document.getElementById('credit_detail_'+indek).innerHTML=html;
  
  bingkai[indek].sum_item=sum_item;
  
  VendorCredits.calculateTotal(indek);
    
  if(panjang==0)VendorCredits.addRow(indek,0);  
}

VendorCredits.tableHead=(indek)=>{
  return '<table border=0 style="width:100%;" >'
    +'<thead>'
    +'<tr>'
    +'<th colspan="2">Quantity</th>'
    +'<th colspan="2">Item ID</th>'
    +'<th>Description<i class="required">*</i></th>'
    +'<th colspan="2">G/L Account<i class="required">*</i></th>'
    +'<th>Unit Price</th>'
    +'<th>Amount<i class="required">*</i></th>'
    +'<th colspan="2">Job ID</th>'
    +'<th>Add/Remve</th>'
    +'</tr>'
    +'</thead>';
}

VendorCredits.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
    +'<td align="center">#</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

VendorCredits.calculateTotal=(indek)=>{
  var itemAmount=Number(bingkai[indek].sum_item) || 0;
  var itemAmount_invoice=Number(bingkai[indek].sum_item_invoice) || 0;
  var creditAmount=(itemAmount+itemAmount_invoice);
  
  bingkai[indek].credit_amount=creditAmount;
  
  setEV('credit_total_'+indek, creditAmount);
}

VendorCredits.addRow=(indek,baris)=>{
  var gl_account_id=bingkai[indek].data_default.gl_account_id;
  var oldBasket=[];
  var newBasket=[];

  oldBasket=bingkai[indek].credit_detail;
  for(var i=0;i<oldBasket.length;i++){
    newBasket.push(oldBasket[i]);
    if(i==baris) newRow(newBasket);
  }
  if(oldBasket.length==0) newRow(newBasket);
  VendorCredits.setRows(indek,newBasket);
  if(baris>0) 
  document.getElementById('quantity_'+(baris+1)+'_'+indek).focus();
  
  function newRow(newBas){
    var myItem={};
    myItem.row_id=newBas.length+1;
    myItem.quantity=0;
    myItem.item_id='';
    myItem.description="";
    myItem.gl_account_id=gl_account_id;
    myItem.unit_price=0;
    myItem.amount=0;
    myItem.job_phase_cost='';
    newBas.push(myItem);    
  }
}

VendorCredits.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].credit_detail;
  var baru = [];
  var isiEdit = {};  
  var sum_item=0;
  var sum_tax=0;
    
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
      VendorCredits.getItem(indek,i);
      
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
      setEV('unit_price_'+i+'_'+indek, isiEdit.unit_price);
      
    }else if(id_kolom==('job_phase_cost_'+i+'_'+indek)){
      isiEdit.job_phase_cost=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else{
      baru.push(isi[i]);
    }
    sum_item+=Number(isi[i].amount);
  }
  bingkai[indek].sum_item=sum_item;
  VendorCredits.calculateTotal(indek);
}

VendorCredits.removeRow=(indek,number)=>{
  var isi=bingkai[indek].credit_detail;
  var newBasket=[];
  VendorCredits.setRows(indek,isi);
  for(var i=0;i<isi.length;i++){
    if (i!=(number))newBasket.push(isi[i]);
  }
  VendorCredits.setRows(indek,newBasket);
}

VendorCredits.setDefault=(indek)=>{
  var d=bingkai[indek].data_default;
  bingkai[indek].discount_terms=d.discount_terms;
  setEV('ap_account_id_'+indek, d.ap_account_id);
  setEV('displayed_terms_'+indek, d.discount_terms.displayed);
  if(bingkai[indek].metode==MODE_CREATE){
    bingkai[indek].vendor_id='';
    bingkai[indek].credit_no='';
    bingkai[indek].invoice_no='';
  }
}

VendorCredits.setVendor=(indek,d)=>{
  setEV('vendor_id_'+indek, d.vendor_id);
  VendorCredits.getVendor(indek);
}

VendorCredits.getVendor=(indek)=>{
  VendorCredits.vendor.getOne(indek,
    getEV('vendor_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      var da=JSON.parse(d.address)
      var dt=JSON.parse(d.discount_terms);
//      var ap_account_id=bingkai[indek].data_default.ap_account_id
      
      setEV('vendor_name_'+indek,d.name);
      setEV('vendor_address_'+indek, toAddress(da));
      setEV('displayed_terms_'+indek, dt.displayed);
//      setEV('ap_account_id_'+indek, ap_account_id);

      bingkai[indek].discount_terms=dt;
    }
    VendorCredits.invoice.setRows(indek,[]);// new row;
  });
  VendorCredits.getInvoices(indek,"");
}

VendorCredits.getInvoices=(indek,invoice_no)=>{
  var x=document.getElementById('invoice_no_'+indek);  
  for(var i=x.options.length;i>0;i--){
    x.remove(i);
  }

  var vendor_id=getEV('vendor_id_'+indek);
  db.run(indek,{
    query:"SELECT invoice_no "
      +" FROM receive_credit_sum"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+vendor_id+"'"
      +" GROUP BY invoice_no"
  },(paket)=>{
    if(invoice_no!=''){
      var option2=document.createElement("option");
      option2.text=invoice_no;
      document.getElementById('invoice_no_'+indek).add(option2);      
      document.getElementById('invoice_no_'+indek).value=invoice_no;
    }
    if(paket.err.id==0 && paket.count>0){
      var d=objectMany(paket.fields,paket.data);
      for (var x in d){
        if(d[x].invoice_no!=invoice_no){
          var option=document.createElement("option");
          option.text=d[x].invoice_no;
          document.getElementById('invoice_no_'+indek).add(option);
        }
      }
    }

    // default condition
    document.getElementById('detail_invoice_'+indek).open=false;
    document.getElementById('detail_credit_'+indek).open=true;

    if(invoice_no!=''){// edit condition
      document.getElementById('detail_invoice_'+indek).open=true;
      document.getElementById('detail_credit_'+indek).open=false;
    }
    
    if(bingkai[indek].metode==MODE_CREATE){
      if(bingkai[indek].invoice_no==""){// new condition
        if(paket.count>0){
          document.getElementById('detail_invoice_'+indek).open=true;
          document.getElementById('detail_credit_'+indek).open=false;
        }
      }
    }
  });
}

VendorCredits.getInvoiceItem=(indek)=>{
  db.execute(indek,{
    query:"SELECT ap_account_id,"
      +" discount_terms,"
      +" po_no,item_id,"
      +" description,"
      +" gl_account_id,"
      +" unit_price,"
      +" job_phase_cost,"
      +" quantity,"
      +" returned,"
      +" amount "
      +" FROM receive_credit_sum"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+getEV('vendor_id_'+indek)+"'"
      +" AND invoice_no='"+getEV('invoice_no_'+indek)+"'"
  },(paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectMany(paket.fields,paket.data);
      var dt=JSON.parse(d[0].discount_terms);

      setEV('ap_account_id_'+indek, d[0].ap_account_id);
      setEV('displayed_terms_'+indek, dt.displayed);

      VendorCredits.invoice.setRows(indek,d);
      
      bingkai[indek].discount_terms=dt;
    }else{
      VendorCredits.invoice.setRows(indek,[]);
    }
    message.none(indek);
  });
}

VendorCredits.invoice.setRows=(indek, isi)=>{
  if(isi===undefined)isi=[];

  var panjang=isi.length;
  var html=VendorCredits.invoice.tableHead(indek);
  var sum_item=0;
  var sum_tax=0;
  
  bingkai[indek].invoice_detail=isi;
  
  for (var i=0;i<panjang;i++){
    html+='<tr>'
    +'<td align="center">'+isi[i].po_no+'</td>'
    +'<td align="center">'+isi[i].description+'</td>'
//    +'<td align="center">'+(i+1)+'</td>'
      
    +'<td align="center" style="padding:0;margin:0;">'
      +'<input type="text"'
      +' id="invoice_item_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].item_id+'" '
      +' style="text-align:left" '
      +' disabled '
      +' size="10" >'
      +'</td>'

    +'<td align="center" style="margin:0;padding:0">'
      +'<input type="text"'
      +' id="invoice_quantity_'+i+'_'+indek+'"'
      +' value="'+isi[i].quantity+'"'
      +' style="text-align:center"'
      +' disabled '
      +' size="3" >'
      +'</td>'

    +'<td align="center" style="margin:0;padding:0">'
      +'<input type="text"'
      +' id="invoice_returned_'+i+'_'+indek+'"'
      +' value="'+isi[i].returned+'"'
      +' onchange="VendorCredits.invoice.setCell(\''+indek+'\''
      +',\'invoice_returned_'+i+'_'+indek+'\')"'
      +' onfocus="this.select()"'
      +' style="text-align:center"'
      +' size="3" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="invoice_description_'+i+'_'+indek+'"'
      +' value="'+isi[i].description+'"'
      +' onchange="VendorCredits.invoice.setCell(\''+indek+'\''
      +',\'invoice_description_'+i+'_'+indek+'\')"'
      +' onfocus="this.select()"'
      +' style="text-align:left"'
      +' size="15" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text" '
      +' id="invoice_gl_account_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].gl_account_id+'"'
      +' onchange="VendorCredits.invoice.setCell(\''+indek+'\''
      +',\'invoice_gl_account_id_'+i+'_'+indek+'\')"'
      +' onfocus="this.select()"'
      +' style="text-align:center;"'
      +' size="8" >'
      +'</td>'

    +'<td><button type="button" id="btn_find"'
      +' onclick="VendorCredits.account.getPaging(\''+indek+'\''
      +',\'invoice_gl_account_id_'+i+'_'+indek+'\''
      +',\''+i+'\''
      +',\''+CLASS_EXPENSE+'\');">'
      +'</button>'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="invoice_unit_price_'+i+'_'+indek+'"'
      +' value="'+isi[i].unit_price+'"'
      +' onchange="VendorCredits.invoice.setCell(\''+indek+'\''
      +',\'invoice_unit_price_'+i+'_'+indek+'\')"'
      +' onfocus="this.select()" '
      +' style="text-align:right"'
      +' size="6" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="invoice_amount_'+i+'_'+indek+'"'
      +' value="'+Number(isi[i].amount)+'"'
      +' onchange="VendorCredits.invoice.setCell(\''+indek+'\''
      +',\'invoice_amount_'+i+'_'+indek+'\')"'
      +' onfocus="this.select()"'
      +' style="text-align:right"'
      +' size="9" >'
      +'</td>'

    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="invoice_job_phase_cost_'+i+'_'+indek+'"'
      +' value="'+isi[i].job_phase_cost+'"'
      +' onchange="VendorCredits.invoice.setCell(\''+indek+'\''
      +',\'invoice_job_phase_cost_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()" '
      +' style="text-align:center"'
      +' size="5" >'
      +'</td>'
      
    +'<td><button type="button"'
      +' id="btn_find"'
      +' onclick="VendorCredits.job.getPaging(\''+indek+'\''
      +',\'invoice_job_phase_cost_'+i+'_'+indek+'\''
      +',\''+i+'\');">'
      +'</button>'
      +'</td>'

    +'</tr>';
    
    sum_item+=Number(isi[i].amount);
  }
  html+=VendorCredits.invoice.tableFoot(indek);
  var budi=JSON.stringify(isi);
  document.getElementById('invoice_detail_'+indek).innerHTML=html;
  bingkai[indek].sum_item_invoice=sum_item;
  VendorCredits.calculateTotal(indek);
  if(panjang==0)VendorCredits.invoice.addRow(indek,0);  
}

VendorCredits.invoice.tableHead=(indek)=>{
  return '<table border=0 style="width:100%;" >'
    +'<thead>'
    +'<tr>'
    +'<th>PO No</th>'
    +'<th>Description</th>'
    +'<th>Item ID</th>'
    +'<th>Quantity</th>'
    +'<th>Returned</th>'
    +'<th>Description<i class="required">*</i></th>'
    +'<th colspan="2">G/L Account<i class="required">*</i></th>'
    +'<th>Unit Price</th>'
    +'<th>Amount<i class="required">*</i></th>'
    +'<th colspan="2">Job ID</th>'
    +'</tr>'
    +'</thead>';
}

VendorCredits.invoice.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
    +'<td align="center">#</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

VendorCredits.invoice.addRow=(indek,baris)=>{
  var oldBasket=[];
  var newBasket=[];
  var gl_account_id=bingkai[indek].data_default.gl_account_id
  
  oldBasket=bingkai[indek].invoice_detail;
  for(var i=0;i<oldBasket.length;i++){
    newBasket.push(oldBasket[i]);
    if(i==baris) newRow(newBasket);
  }
  if(oldBasket.length==0) newRow(newBasket);
  VendorCredits.invoice.setRows(indek,newBasket);
  // if(baris>0) document.getElementById('quantity_'+(baris+1)+'_'+indek).focus();
  
  function newRow(newBas){
    var myItem={};
    myItem.po_no='';// nomer po
    myItem.description=""// ori description
//    myItem.row_id=0;
    myItem.quantity=0;
    myItem.returned=0;
    myItem.item_id='';
    myItem.description_edit="";
    myItem.gl_account_id=gl_account_id;
    myItem.unit_price=0;
    myItem.amount=0;
    myItem.job_phase_cost='';
    newBasket.push(myItem);    
  }
}

VendorCredits.invoice.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].invoice_detail;
  var baru = [];
  var isiEdit = {};  
  var sum_item=0;
    
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
      isiEdit.amount=(isiEdit.returned*isiEdit.unit_price);
      baru.push(isiEdit);
      setEV('invoice_amount_'+i+'_'+indek,
        Number(isiEdit.amount));
            
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
    sum_item+=Number(isi[i].amount);
  }
  bingkai[indek].sum_item_invoice=sum_item;
  VendorCredits.calculateTotal(indek);
}

VendorCredits.setItem=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var nama_kolom=bingkai[indek].nama_kolom;
  setEV(id_kolom, d.item_id);
  VendorCredits.setCell(indek,id_kolom); 
}

VendorCredits.getItem=(indek,baris)=>{
  VendorCredits.item.getOne(indek,
    getEV('item_id_'+baris+'_'+indek),
  (paket)=>{
    setEV('description_'+baris+'_'+indek, txt_undefined);
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('item_id_'+baris+'_'+indek, d.item_id);
      setEV('description_'+baris+'_'+indek, d.name_for_purchases);
      if(d.name_for_purchases==''){
        setEV('description_'+baris+'_'+indek, d.name_for_sales);  
      }
      setEV('gl_account_id_'+baris+'_'+indek, d.inventory_account_id);
    }
    VendorCredits.setCell(indek,'description_'+baris+'_'+indek);
    VendorCredits.setCell(indek,'gl_account_id_'+baris+'_'+indek);
  });  
}

VendorCredits.showTerms=(indek,baris)=>{
  bingkai[indek].baris=baris;
  var tgl=getEV('credit_date_'+indek);
  var amount=bingkai[indek].credit_amount

  bingkai[indek].discount_terms.date=tgl;
  bingkai[indek].discount_terms.amount=amount;
  
  DiscountTerms.show(indek);
} 

VendorCredits.setTerms=(indek)=>{
  var d=bingkai[indek].discount_terms.displayed;
  setEV('displayed_terms_'+indek, d);
  VendorCredits.calculateTotal(indek);
}

VendorCredits.setAccount=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var baris=bingkai[indek].baris;
  setEV(id_kolom, d.account_id);
  
  VendorCredits.getAccount(indek,id_kolom,baris);
}

VendorCredits.getAccount=(indek,id_kolom,baris)=>{
  VendorCredits.account.getOne(indek
  ,getEV(id_kolom)
  ,(paket)=>{
    var nm_account=undefined;
    if(paket.count!=0){
      var d=objectOne(paket.fields,paket.data);
      nm_account=d.name;
    }
    switch(id_kolom){
      case "ap_account_id_"+indek:
        break;
      case "gl_account_id_"+baris+'_'+indek:
        VendorCredits.setCell(indek,id_kolom);
        break;
      case "invoice_gl_account_id_"+baris+'_'+indek:
        VendorCredits.invoice.setCell(indek,id_kolom);
        break;
      default:
        alert('['+id_kolom+'] undefined!?')
    }
  });
}

VendorCredits.setJob=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var baris=bingkai[indek].baris;
  setEV(id_kolom, d);
  
  switch(id_kolom){
    case"job_phase_cost_"+baris+'_'+indek:
      VendorCredits.setCell(indek,id_kolom);
      break;
    case "invoice_job_phase_cost_"+baris+"_"+indek:
      VendorCredits.invoice.setCell(indek,id_kolom);
      break;
    default:
      alert('['+id_kolom+'] undefined!?');
  }
}

VendorCredits.createExecute=function(indek){
  //some=something positive, any=something negative;
  var some_note=JSON.stringify(
    ['Add some note for this credit memos.','new-note']
  );
  var invoice_no=getEV('invoice_no_'+indek);
  var discount_terms=JSON.stringify(bingkai[indek].discount_terms);
  var credit_detail=JSON.stringify(bingkai[indek].credit_detail);
  var invoice_detail=JSON.stringify(bingkai[indek].invoice_detail);

  if(invoice_no==VendorCredits.kosong) {
    invoice_no='';
  }

  db.execute(indek,{
    query:"INSERT INTO vendor_credits"
      +"(admin_name,company_id,vendor_id,credit_no,date"
      +",discount_terms,return_authorization,ap_account_id"
      +",detail,invoice_no,invoice_detail,note)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEV("vendor_id_"+indek)+"'"
      +",'"+getEV("credit_no_"+indek)+"'"
      +",'"+getEV("credit_date_"+indek)+"'"
      +",'"+discount_terms+"'"
      +",'"+getEV("return_authorization_"+indek)+"'"
      +",'"+getEV("ap_account_id_"+indek)+"'"
      +",'"+credit_detail+"'"
      +",'"+invoice_no+"'"
      +",'"+invoice_detail+"'"
      +",'"+some_note+"'"
      +")"
  })
}

VendorCredits.readOne=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT * "
      +" FROM vendor_credits "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+bingkai[indek].vendor_id+"' "
      +" AND credit_no='"+bingkai[indek].credit_no+"' "
  },(paket)=>{
    if (paket.err.id==0 && paket.count>0) {
      var d=objectOne(paket.fields,paket.data);
      var da=JSON.parse(d.vendor_address);
      var dt=JSON.parse(d.discount_terms);
      var dtl=JSON.parse(d.detail);
      var invoice_dtl=JSON.parse(d.invoice_detail);
      
      setEV('vendor_id_'+indek, d.vendor_id);
      setEV('vendor_name_'+indek, d.vendor_name);
      setEV('vendor_address_'+indek, toAddress(da));
      
      VendorCredits.setRows(indek, dtl );
      VendorCredits.invoice.setRows(indek, invoice_dtl );

      setEV('credit_no_'+indek,d.credit_no);
      setEV('credit_date_'+indek,d.date);
      setEV('credit_date_fake_'+indek,tglWest(d.date));

      setEV('displayed_terms_'+indek,dt.displayed);
      
      setEV('return_authorization_'+indek,d.return_authorization);
      setEV('ap_account_id_'+indek,d.ap_account_id);
      setEV('credit_total_'+indek, d.amount);
      
      if(d.invoice_no!=""){
        var option=document.createElement("option");
        option.text=d.invoice_no;
        document.getElementById('invoice_no_'+indek).add(option);      
        setEV('invoice_no_'+indek,d.invoice_no);
      }
      
      // don't forget, simpan di lokal storage;
      bingkai[indek].discount_terms=dt;
      bingkai[indek].invoice_no=d.invoice_no;

      // load invoice
      VendorCredits.getInvoices(indek,d.invoice_no);
      message.none(indek);
    }
    return callback();
  });
}

VendorCredits.formUpdate=(indek,vendor_id,credit_no)=>{
  bingkai[indek].vendor_id=vendor_id;
  bingkai[indek].credit_no=credit_no;
  VendorCredits.form.modeUpdate(indek);
}

VendorCredits.updateExecute=(indek)=>{
  var some_note=JSON.stringify(
    ['Add some note for this credit memos...','edit-note']
  );
  var invoice_no=getEV('invoice_no_'+indek);
  var discount_terms=JSON.stringify(bingkai[indek].discount_terms);
  var invoice_detail=JSON.stringify(bingkai[indek].invoice_detail);
  var credit_detail=JSON.stringify(bingkai[indek].credit_detail);

  if(invoice_no==VendorCredits.kosong) invoice_no='';

  db.execute(indek,{
    query:"UPDATE vendor_credits "
      +" SET vendor_id='"+getEV("vendor_id_"+indek)+"', "
      +" credit_no='"+getEV("credit_no_"+indek)+"', "
      +" date='"+getEV("credit_date_"+indek)+"', "
      +" discount_terms='"+discount_terms+"', "
      +" return_authorization='"+getEV("return_authorization_"+indek)+"', "
      +" detail='"+credit_detail+"', "
      +" invoice_no='"+invoice_no+"', "
      +" invoice_detail='"+invoice_detail+"', "
      +" ap_account_id='"+getEV("ap_account_id_"+indek)+"', "
      +" note='"+some_note+"' "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+bingkai[indek].vendor_id+"' "
      +" AND credit_no='"+bingkai[indek].credit_no+"' "
  },(p)=>{
    if(p.err.id==0) {
      bingkai[indek].vendor_id=getEV("vendor_id_"+indek);
      bingkai[indek].credit_no=getEV("credit_no_"+indek);
      VendorCredits.deadPath(indek);
    }
  });
}

VendorCredits.formDelete=(indek,vendor_id,credit_no)=>{
  bingkai[indek].vendor_id=vendor_id;
  bingkai[indek].credit_no=credit_no;
  VendorCredits.form.modeDelete(indek);
}

VendorCredits.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM vendor_credits"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+bingkai[indek].vendor_id+"'"
      +" AND credit_no='"+bingkai[indek].credit_no+"'"
  },(p)=>{
    if(p.err.id==0) VendorCredits.deadPath(indek);
  });
}

VendorCredits.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM vendor_credits "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND credit_no LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR vendor_name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

VendorCredits.search=(indek)=>{
  VendorCredits.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT credit_no,date,amount,"
        +" vendor_name,vendor_id,"
        +" user_name,date_modified"
        +" FROM vendor_credits"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND credit_no LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR vendor_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      VendorCredits.readShow(indek);
    });
  });
}

VendorCredits.exportExecute=(indek)=>{
  var table_name=VendorCredits.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

VendorCredits.importExecute=(indek)=>{
  var n=0;
  var m="<h4>[Start]</h4>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;

  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO vendor_credits"
        +"(admin_name,company_id,vendor_id,credit_no,date"
        +",discount_terms,return_authorization,ap_account_id"
        +",detail,invoice_no,invoice_detail,note)"
        +" VALUES "
        +"('"+bingkai[indek].admin.name+"'"
        +",'"+bingkai[indek].company.id+"'"
        +",'"+d[i][1]+"'" // vendor_id
        +",'"+d[i][2]+"'" // credit_no
        +",'"+d[i][3]+"'" // date
        +",'"+d[i][4]+"'" // discount_terms
        +",'"+d[i][5]+"'" // return_authorization
        +",'"+d[i][6]+"'" // ap_account_id 
        +",'"+d[i][7]+"'" // detail
        +",'"+d[i][8]+"'" // receive_no
        +",'"+d[i][9]+"'" // receive_detail
        +",'"+d[i][10]+"'" // note
        +")"
    },(paket)=>{  
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

VendorCredits.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT credit_no,date,amount,vendor_name,vendor_id,"
      +" user_name,date_modified"
      +" FROM vendor_credits"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date "
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    VendorCredits.selectShow(indek);
  });
}

VendorCredits.selectShow=(indek)=>{
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
    +'<th>Vendor Name</th>'
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
        +'<td align="right">'+ribuan(d[x].amount)+'</td>'
        +'<td align="left">'+xHTML(d[x].vendor_name)+'</td>'
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

VendorCredits.deleteAllExecute=(indek)=>{
  var r=bingkai[indek].paket;
  var d=objectMany(r.fields,r.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM vendor_credits"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND vendor_id='"+d[i].vendor_id+"' "
          +" AND credit_no='"+d[i].credit_no+"' "
      });
    }
  }
  db.deleteMany(indek,a);
}

VendorCredits.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM vendor_credits"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND vendor_id='"+getEV('vendor_id_'+indek)+"'"
      +" AND credit_no='"+getEV('credit_no_'+indek)+"'"
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

VendorCredits.duplicate=(indek)=>{
  var id='copy_of '+getEV('credit_no_'+indek);
  setEV('credit_no_'+indek,id);
  focus('credit_no_'+indek);
}

VendorCredits.deadPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{VendorCredits.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{VendorCredits.properties(indek);})
  }
}





// eof: 1190;1150;1282;1324;1395;1373;1382;1386;1383;1389;
