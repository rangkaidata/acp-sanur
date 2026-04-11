/*
 * auth: budiono;
 * code: J3;
 * path: /accounting/time_and_expense/time_tickets.js;
 * --------------------------------------------------;
 * date: feb-04, 16:04, sun-2024; new...
 * edit: aug-22, 20:46, thu-2024; r13; revisi ke-13;
 * edit: oct-07, 20:50, mon-2024; #20;
 * edit: nov-29, 10:41, fri-2024; #27; add locker();
 * -----------------------------; happy new year 2025;
 * edit: jan-01, 20:58, wed-2025; #32; properties+duplicate;
 * edit: feb-25, 18:31, tue-2025; #41; file_blok;
 * edit: mar-15, 17:52, sat-2025; #43; deep-folder;
 * edit: mar-27, 13:33, thu-2025; #45; ctables;cstructure;
 * edit: jul-19, 15:41, sat-2025; #64; 
 * edit: aug-04, 17:55, mon-2025; #64; 
 * edit: nov-10, 18:51, mon-2025; #80;
*/

'use strict';

var TimeTickets={}

TimeTickets.table_name='time_tickets';
TimeTickets.form=new ActionForm2(TimeTickets);
TimeTickets.employee=new EmployeeLook(TimeTickets);
TimeTickets.vendor=new VendorLook(TimeTickets);
TimeTickets.item=new ActivityItemLook(TimeTickets);
TimeTickets.customer=new CustomerLook(TimeTickets);
TimeTickets.job=new JobLook(TimeTickets);

TimeTickets.show=(karcis)=>{
  karcis.modul=TimeTickets.table_name;
  karcis.child_free=false;

  var baru=exist(karcis);
  if(baru==-1){
    var newCus=new BingkaiUtama(karcis);
    var indek=newCus.show();
    createFolder(indek,()=>{
      TimeTickets.form.modePaging(indek);
      TimeTickets.getDefault(indek);
    });
  }else{
    show(baru);
  }
}

TimeTickets.getDefault=(indek)=>{
  
}

TimeTickets.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM time_tickets"
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

TimeTickets.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  TimeTickets.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT date,ticket_no,unit_duration,record_name,"
        +"billing_amount,"
        +"user_name,date_modified"
        +" FROM time_tickets"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY date DESC,ticket_no DESC"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      TimeTickets.readShow(indek);
    });
  })
}

TimeTickets.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border=1>'
      +'<tr>'
        +'<th colspan="2">Date</th>'
        +'<th>Ticket #</th>'
        +'<th>Employee /<br>Vendor Name</th>'
        +'<th>Duration</th>'
        +'<th>Billing Amount</th>'
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
        +'<td align="center">'+tglEast(d[x].date)+'</td>'
        +'<td align="left">'+d[x].ticket_no+'</td>'
        +'<td align="left">'+d[x].record_name+'</td>'
        +'<td align="center">'+d[x].unit_duration+'</td>'
        +'<td align="center">'+d[x].billing_amount+'</td>'

        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button" '
          +' id="btn_change" '
          +' onclick="TimeTickets.formUpdate(\''+indek+'\''
          +',\''+d[x].ticket_no+'\');">'
          +'</button></td>'
        +'<td align="center">'
          +'<button type="button" '
          +' id="btn_delete" '
          +' onclick="TimeTickets.formDelete(\''+indek+'\''
          +',\''+d[x].ticket_no+'\');">'
          +'</button></td>'
        +'<td align="center">'+n+'</td>'
        +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  TimeTickets.form.addPagingFn(indek);
}

TimeTickets.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
  +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    +'<ul>'
    
    +'<li><label>'
      +'<select id="recordby_mode_'+indek+'"'
      +' onchange="TimeTickets.changeRecordByMode(\''+indek+'\')">'
      +getDataRecordBy(indek)
      +'</select>'
      +'</label>'
      
      +'<input type="text" '
      +' id="recordby_id_'+indek+'" '
      +' onchange="TimeTickets.getRecordByMode(\''+indek+'\')"'
      +' size="9">'
      
      +'<button type="button"'
      +' id="btn_find" '
      +' onclick="TimeTickets.setRecordByMode(\''+indek+'\')">'
      +' </button>'
      
      +'<input type="text" '
      +' id="recordby_name_'+indek+'" '
      +' size="20"'
      +' disabled>'
      
      +'</li>'
    +'</ul>'
    
    +'<div style="display:grid'
      +';grid-template-columns: repeat(2,1fr)'
      +';padding-bottom:3px;padding-top:10px;">'
      
      +'<div>'
        +'<ul>'
        +'<li>'
        +'<label>Ticket Number: </label>'
          +'<input type="text" '
          +' id="ticket_no_'+indek+'" '
          +' size="9">'
        +'</li>'

        +'<li>'
        +'<label>Type:</label>'
          +'<select id="ticket_type_'+indek+'"'
          +' onchange="TimeTickets.changeType(\''+indek+'\')">'
          +getDataTicketType(indek, 0)
          +'</select>'
        +'</li>'
        +'</ul>'
      +'</div>'

      +'<div>'
        +'<label>Ticket Date: </label>'
          +'<input type="date" '
          +' id="ticket_date_'+indek+'"'
          +' onchange="TimeTickets.changeDate(\''+indek+'\')"'
          +' onblur="TimeTickets.ngumpet(\''+indek+'\',1)"'
          +' style="display:none;">'

          +'<input type="text"'
          +' id="date_tmp_'+indek+'"'
          +' onfocus="TimeTickets.ngumpet(\''+indek+'\',0)"'
          //+' style="text-align:center;width:6rem;"'
          +' style="text-align:center;"'
          +' size="9"'
          +' readonly>'
      +'</div>'
    +'</div>'
    
    +'<details open>'
      +'<summary>Daily</summary>'
      +'<div id="daily_time_'+indek+'"'
        +' style="width:100%;overflow:auto;">'
      +'</div>'
    +'</details>'

    +'<details open>'
      +'<summary>Weekly</summary>'
      +'<div id="weekly_time_'+indek+'"'
        +' style="width:100%;overflow:auto;">'
      +'</div>'
    +'</details>'

    +'</form>'
  +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  
  document.getElementById('recordby_id_'+indek).focus();
  document.getElementById('ticket_date_'+indek).value=tglSekarang();
  document.getElementById('date_tmp_'+indek).value=tglWest(tglSekarang());
  document.getElementById('weekly_time_'+indek).style.display="none";
  
  bingkai[indek].time_detail=[]  
  TimeTickets.setRows(indek,[]);
  TimeTickets.dailyForm(indek);
  
  if(metode==MODE_UPDATE){
    document.getElementById('ticket_type_'+indek).disabled=true;
  }
}

TimeTickets.setRows=(indek,isi)=>{
  if(isi===undefined)isi=[];
    
  var panjang=isi.length;
  var html=TimeTickets.tableHead(indek);

  bingkai[indek].time_detail=isi;
    
  for (var i=0;i<panjang;i++){
    
    html+='<tr>'
    +'<td align="center">'+(i+1)+'</td>'
    
    +'<td style="margin:0;padding:0">' //activity item
      +'<input type="text" id="item_id_'+i+'_'+indek+'" '
      +' value="'+isi[i].item_id+'"'
      +' onchange="TimeTickets.setCell(\''+indek+'\''
      +',\'item_id_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()"'
      +' size="5">'
      +'</td>'

    +'<td style="padding:0;margin:0;">'
      +'<button type="button"'
      +' id="btn_find"'
      +' onclick="TimeTickets.item.getPaging(\''+indek+'\''
      +',\'item_id_'+i+'_'+indek+'\')"'
      +'</button>'
      +'</td>'
    
    +'<td>'
      +'<select id="customerby_mode_'+i+'_'+indek+'"'
      +' onchange="TimeTickets.changeCustomerByMode(\''+indek+'\''
      +',\''+i+'\')">'
      +getDataCustomerBy(indek,isi[i].customerby_mode)
      +'</select>'
    
      +'<input type="text"'
      +' id="customerby_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].customerby_id+'"'
      +' onchange="TimeTickets.setCell(\''+indek+'\''
      +',\'customerby_id_'+i+'_'+indek+'\')"'
      +' size="12">'
    +'</td>'
    
    +'<td style="padding:0;margin:0;">'
      +'<button type="button"'
        +' id="btn_find"'
        +' onclick="TimeTickets.setCustomerByMode(\''+indek+'\''
        +',\''+i+'\')">'
      +'</button>'
    +'</td>'
      
    +'<td>'
      +'<select id="pay_level_'+i+'_'+indek+'"'
        +' onchange="TimeTickets.setCell(\''+indek+'\''
        +',\'pay_level_'+i+'_'+indek+'\')">'
        +getDataPayLevel(indek, isi[i].pay_level)
      +'</select>'
    +'</td>'

    +'<td>'
      +'<select id="billing_type_'+i+'_'+indek+'"'
        +' onchange="TimeTickets.setCell(\''+indek+'\''
        +',\'billing_type_'+i+'_'+indek+'\')">'      
        +getDataBillingType(indek, isi[i].billing_type)
      +'</select>'
    
      +'<input type="text"'
        +' id="billing_rate_'+i+'_'+indek+'"'
        +' value="'+isi[i].billing_rate+'"'
        +' onchange="TimeTickets.setCell(\''+indek+'\''
        +',\'billing_rate_'+i+'_'+indek+'\')"'
        +' size="12"'
        +' style="text-align:center;">'
      
      +'<select id="billing_status_'+i+'_'+indek+'"'
        +' onchange="TimeTickets.setCell(\''+indek+'\''
        +',\'billing_status_'+i+'_'+indek+'\')">'
        +getDataBillingStatus(indek, isi[i].billing_status)
      +'</select>'
    +'</td>'
    
    +'<td style="padding:0;margin:0;">'
      +'<button type="button"'
      +' id="btn_find"'
      +' onclick="Prices.lookUp(\''+indek+'\''
      +',\'billing_rate_'+i+'_'+indek+'\')">'
      +'</button>'
      +'</td>'
    
    +'<td style="padding:0;margin:0;">'// sun
      +'<input type="text"'
      +' id="day_0_'+i+'_'+indek+'"'
      +' value="'+isi[i].day_0+'"' 
      +' onchange="TimeTickets.setCell(\''+indek+'\''
      +',\'day_0_'+i+'_'+indek+'\')"'
      +' size="4" onfocus="this.select();"'
      +' style="text-align:center;">'
    +'</td>'
    
    +'<td style="padding:0;margin:0;">' //mon
      +'<input type="text"'
      +' id="day_1_'+i+'_'+indek+'"'
      +' value="'+isi[i].day_1+'"' 
      +' onchange="TimeTickets.setCell(\''+indek+'\''
      +',\'day_1_'+i+'_'+indek+'\')"'
      +' size="4"'
      +' style="text-align:center;">'
    +'</td>'
    
    +'<td style="padding:0;margin:0;">' //tue
      +'<input type="text"'
      +' id="day_2_'+i+'_'+indek+'"'
      +' value="'+isi[i].day_2+'"' 
      +' onchange="TimeTickets.setCell(\''+indek+'\''
      +',\'day_2_'+i+'_'+indek+'\')"'
      +' size="4"'
      +' style="text-align:center;">'
    +'</td>'
    
    +'<td style="padding:0;margin:0;">' //wed
      +'<input type="text"'
      +' id="day_3_'+i+'_'+indek+'"'
      +' value="'+isi[i].day_3+'"'
      +' onchange="TimeTickets.setCell(\''+indek+'\''
      +',\'day_3_'+i+'_'+indek+'\')"'
      +' size="4"'
      +' style="text-align:center;">'
    +'</td>'
    
    +'<td style="padding:0;margin:0;">' //thu
      +'<input type="text"'
      +' id="day_4_'+i+'_'+indek+'"'
      +' value="'+isi[i].day_4+'"'
      +' onchange="TimeTickets.setCell(\''+indek+'\''
      +',\'day_4_'+i+'_'+indek+'\')"'
      +' size="4"'
      +' style="text-align:center;">'
    +'</td>'
    
    +'<td style="padding:0;margin:0;">' //fri
      +'<input type="text"'
      +' id="day_5_'+i+'_'+indek+'"'
      +' value="'+isi[i].day_5+'"'
      +' onchange="TimeTickets.setCell(\''+indek+'\''
      +',\'day_5_'+i+'_'+indek+'\')"'
      +' size="4"'
      +' style="text-align:center;">'
    +'</td>'
    
    +'<td style="padding:0;margin:0;">' //sat
      +'<input type="text"'
        +' id="day_6_'+i+'_'+indek+'"'
        +' value="'+isi[i].day_6+'"'
        +' onchange="TimeTickets.setCell(\''+indek+'\''
        +',\'day_6_'+i+'_'+indek+'\')"'
        +' size="4"'
        +' style="text-align:center;">'
    +'</td>'
    
    +'<td style="padding:0;margin:0;">' //total hours
      +'<input type="text"'
      +' id="total_hour_'+i+'_'+indek+'"'
      +' value="'+(isi[i].total_hour).toFixed(2)+'"'
      +' onchange="TimeTickets.setCell(\''+indek+'\''
      +',\'total_hour_'+i+'_'+indek+'\')"'
      +' size="5"'
      +' style="text-align:center;"'
      +' disabled>'
    +'</td>'

    +'<td align="center">'
      +'<button type="button" id="btn_add" '
      +' onclick="TimeTickets.addRow(\''+indek+'\','+i+')" ></button>'
      
      +'<button type="button" id="btn_remove" '
      +' onclick="TimeTickets.removeRow(\''+indek+'\','+i+')" ></button>'
    +'</td>'
    +'</tr>';
  }
  html+=TimeTickets.tableFoot(indek);
  var budi = JSON.stringify(isi);
  document.getElementById('weekly_time_'+indek).innerHTML=html;
  if(panjang==0)TimeTickets.addRow(indek,[]);
}

TimeTickets.tableHead=(indek)=>{
  var dt=getEV('ticket_date_'+indek);
  var tgl=new Date(dt);
  
  var i=0;
  var h='';
  var nama=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  var hari=[];
  var bulan;
  
  tgl.setDate(tgl.getDate()-(tgl.getDay()));

  bingkai[indek].seminggu=[];

  for(i=0;i<7;i++){
    bingkai[indek].seminggu.push(tgl);
    h+='<th>'
      +nama[i]
      +'<br>'
      +tgl.getDate()
      //+'<br>'
      //+tglIntDateOnly(bingkai[indek].seminggu[i])
      +'</th>';
    tgl.setDate(tgl.getDate()+1);
  }
  
  return '<table border=0 style="width:100%;" >'
    +'<thead>'
    +'<tr>'
    +'<th colspan="3">Activity Item</th>'
    +'<th colspan="2">Customer By</th>'
    +'<th>Pay<br>Level</th>'
    +'<th colspan="2">Billing</th>'
    +h
    +'<th>Total<br>Hours</th>'
    +'<th>Add/Rem</th>'
    +'</tr>'
    +'</thead>';
}

TimeTickets.tableFoot=(indek)=>{
  var last_row_id=parseInt(bingkai[indek].time_detail.length)+1;
  return '<tr>'
  +'<td align="center">'+last_row_id+'</td>'
  +'</tr>'
  +'</tfoot>'
  +'</table>';
}

TimeTickets.addRow=(indek,baris)=>{
  var oldBasket=[];
  var newBasket=[];

  oldBasket=bingkai[indek].time_detail;

  for(var i=0;i<oldBasket.length;i++){
    newBasket.push(oldBasket[i]);
    if(i==baris)newRow(newBasket);
  }
  if(oldBasket.length==0)newRow(newBasket);
  TimeTickets.setRows(indek,newBasket);
  
  function newRow(newBas){
    var myItem={};
    myItem.row_id=newBas.length+1;
    myItem.item_id="";
    myItem.customerby_mode=0;
    myItem.customerby_id='';
    myItem.pay_level=0;
    myItem.billing_type=-1;
    myItem.billing_rate=0;
    myItem.billing_status=-1;
    myItem.day_0=0;
    myItem.day_1=0;
    myItem.day_2=0;
    myItem.day_3=0;
    myItem.day_4=0;
    myItem.day_5=0;
    myItem.day_6=0;
    myItem.total_hour=0;

    newBas.push(myItem);    
  }
}

TimeTickets.dailyForm=(indek)=>{
  var html=''
    +'<div style="margin-bottom:100px;display:inline;">'
    
    +'<div style="display:grid'
      +';grid-template-columns: repeat(2,1fr)'
      +';padding-bottom:3px;padding-top:10px;">'

    +'<div>'
      +'<ul>'
      +'<li><label>Activity Item:</label>'
        +'<input type="text" '
        +' id="item_id_n_'+indek+'" '
        +' onchange="TimeTickets.getActivityItem(\''+indek+'\',\'n\')"'
        +' size="9">'
        
        +'<button type="button"'
        +' id="btn_find" '
        +' onclick="TimeTickets.item.getPaging(\''+indek+'\''
        +',\'item_id_n_'+indek+'\')">'
        +' </button>'
        
        +'<input type="text" '
        +' id="item_name_n_'+indek+'" '
        +' size="20" disabled>'
      +'</li>'
      
      +'<li><label><select id="customerby_mode_n_'+indek+'"'
        +' onchange="TimeTickets.changeCustomerByMode(\''+indek+'\',\'n\')">'
        +getDataCustomerBy(indek)
        +'</select></label>'
        
        +'<input type="text" '
        +' id="customerby_id_n_'+indek+'" '
        +' onChange="TimeTickets.getCustomerByMode(\''+indek+'\')"'
        +' size="9">'
        
        +'<button type="button"'
        +' id="btn_find" '
        +' onclick="TimeTickets.setCustomerByMode(\''+indek+'\',\'n\')">'
        +' </button>'
        
        +'<input type="text" '
        +' id="customerby_name_n_'+indek+'" '
        +' size="20" disabled>'
      +'</li>'
      
      +'<li>'
        +'<label>Pay Level:</label>'
          +'<select id="pay_level_'+indek+'"'
          +' onchange="TimeTickets.setCell(\''+indek+'\''
          +',\'pay_level_'+indek+'\')">'
          +getDataPayLevel(indek,0)
          +'</select>'
      +'</li>'
      +'<li>'
        +'<label>&nbsp;</label>'
        +'<label><input type="checkbox"'
          +' id="used_in_payroll_'+indek+'">'
          +'Has been used in Payroll</label>'
      +'</li>'
      
      +'<li>'
        +'<label>Time Option:</label>'
          +'<select id="time_option_'+indek+'"'
          +' onchange="TimeTickets.changeOption(\''+indek+'\')">'
          +getTimeOption(indek)
          +'</select>'
      +'</li>'
      
      +'<li>'
        +'<label>&nbsp;</label>'
        +'<div id="time_manual_'+indek+'">'
          +'<ul>'
            +'<li><label>Start Time:</label>'
              +'<input type="text" size="5"'
              +' style="text-align:center;"'
              +' id="start_time_'+indek+'"'
              +' onchange="TimeTickets.timeCalc(\''+indek+'\')">'
            +'</li>'
            +'<li><label>End Time:</label>'
              +'<input type="text" size="5"'
              +' style="text-align:center;"'
              +' id="end_time_'+indek+'"'
              +' onchange="TimeTickets.timeCalc(\''+indek+'\')">'
            +'</li>'
            +'<li><label>Break Time:</label>'
              +'<input type="text" size="5"'
              +' style="text-align:center;"'
              +' id="break_time_'+indek+'"'
              +' onchange="TimeTickets.timeCalc(\''+indek+'\')">'
              +'&nbsp;&nbsp;<label>Duration:</label>'
              +'<input type="text" id="duration_calc_'+indek+'"'
              +' size="5" style="text-align:center;"'
              +' disabled>'
            +'</li>'
          +'</ul>'
        +'</div>'
        
        +'<div id="time_duration_'+indek+'" style="display:none;">'
          +'<ul>'
            +'<li><label>Duration:</label>'
              +'<input type="text" size="5"'
              +' id="duration_'+indek+'"'
              +' onchange="TimeTickets.durationChange(\''+indek+'\')"'
              +' style="text-align:center;">'
            +'</li>'
            +'<li><label>&nbsp;</label>'
              +'<input type="button" value="Start" '
              +' style="height:50px;width:50px;">'
            +'</li>'
          +'</ul>'
        +'</div>'
      +'</li>'
      +'</ul>'
    +'</div>'

    +'<div style="margin-left:10px;">'
      +'<div style="margin-bottom:10px;">'
        +'<label style="display:block;">'
          +'Ticket Description for Invoicing</label>'
        +'<textArea id="ticket_description_'+indek+'"'
          +' spellcheck=false'
          +' style="height:60px;width:80%;">'
        +'</textArea>'
      +'</div>'
      +'<div>'
        +'<label style="display:block;">Internal Memo</label>'
        +'<textArea id="internal_memo_'+indek+'"'
          +' spellcheck=false'
          +' style="height:60px;width:80%;">'
        +'</textArea>'
      +'</div>'
    +'</div>'
    +'</div>'
    
    +'<div>'
      +'<div style="display:grid'
        +';grid-template-columns: repeat(6,1fr)'
        +';padding-bottom:3px;padding-top:50px;">'

        +'<div><label style="display:block;">Billing Type:</label>'
          +'<select id="billing_type_'+indek+'">'
          +getDataBillingType(indek,0)
          +'</select>'
        +'</div>'
        
        +'<div><label style="display:block;">Billing Rate:</label>'
          +'<input type="text" size="9"'
          +' id="billing_rate_n_'+indek+'"'
          +' onchange="TimeTickets.durationChange(\''+indek+'\')"'
          +' style="text-align:center;">'
        +'</div>'
        
        +'<div><label style="display:block;">Billing Status:</label>'
          +'<select id="billing_status_'+indek+'">'
            +getDataBillingStatus(indek, 0)
          +'</select>'
        +'</div>'
        
        +'<div><label style="display:block;">Unit Duration:</label>'
          +'<input type="text" size="9"'
          +' id="unit_duration_'+indek+'"'
          +' style="text-align:center;"'
          +' disabled>'
        +'</div>'
        
        +'<div><label style="display:block;">Billing Amount:</label>'
          +'<input type="text" size="9"'
          +' id="billing_amount_'+indek+'"'
          +' style="text-align:center;"'
          +' disabled>'
        +'</div>'
        +'<div>~f6'
        +'</div>'
      +'</div>'
    +'</div>'
    
    +'</div>';
  document.getElementById('daily_time_'+indek).innerHTML=html;
}

TimeTickets.changeRecordByMode=(indek)=>{
  setEV('recordby_id_'+indek,'');
  setEV('recordby_name_'+indek,'');
}

TimeTickets.setRecordByMode=(indek)=>{
  var kode=parseInt(document.getElementById('recordby_mode_'+indek).value);
  if(kode==0){
    TimeTickets.employee.getPaging(indek,'recordby_id_'+indek);
  }else if(kode==1){
    TimeTickets.vendor.getPaging(indek,'recordby_id_'+indek);
  }  
}

TimeTickets.setEmployee=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.employee_id);
  TimeTickets.getEmployee(indek);
}

TimeTickets.getEmployee=(indek)=>{
  setEV('recordby_name_'+indek, "");
  TimeTickets.employee.getOne(indek,
    getEV('recordby_id_'+indek
  ),(paket)=>{
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('recordby_name_'+indek, d.name);
    }
  });
}

TimeTickets.setVendor=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.vendor_id);
  TimeTickets.getVendor(indek);
}

TimeTickets.getVendor=(indek)=>{
  setEV('recordby_name_'+indek, "");
  TimeTickets.vendor.getOne(indek,
  getEV('recordby_id_'+indek
  ),(paket)=>{
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('recordby_name_'+indek, d.name);
    }
  });
}

TimeTickets.changeType=(indek)=>{
  if(getEI('ticket_type_'+indek)==0){
    document.getElementById('weekly_time_'+indek).style.display="none";
    document.getElementById('daily_time_'+indek).style.display="inline";
  }else{
    document.getElementById('daily_time_'+indek).style.display="none";
    document.getElementById('weekly_time_'+indek).style.display="inline";
  }
}

TimeTickets.removeRow=(indek,number)=>{
  var isiTabel=bingkai[indek].time_detail;
  var newBasket=[];
  var amount=0;  
  TimeTickets.setRows(indek,isiTabel);
  for(var i=0;i<isiTabel.length;i++){
    if (i!=(number))newBasket.push(isiTabel[i]);
  }
  TimeTickets.setRows(indek,newBasket);
}

TimeTickets.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].time_detail;
  var baru=[];
  var isiEdit={};
  var total=0;
  
  for (var i=0;i<isi.length; i++){
    isiEdit=isi[i];
    
    if(id_kolom==('item_id_'+i+'_'+indek)){
      isiEdit.item_id=getEV(id_kolom);
      baru.push(isiEdit);
      TimeTickets.getActivityItem(indek,i);
      
    }else if(id_kolom==('customerby_mode_'+i+'_'+indek)){
      isiEdit.customerby_mode=getEI(id_kolom);
      baru.push(isiEdit);
      
    }else if(id_kolom==('customerby_id_'+i+'_'+indek)){
      isiEdit.customerby_id=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else if(id_kolom==('pay_level_'+i+'_'+indek)){
      isiEdit.pay_level=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else if(id_kolom==('billing_type_'+i+'_'+indek)){
      isiEdit.billing_type=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else if(id_kolom==('billing_rate_'+i+'_'+indek)){
      isiEdit.billing_rate=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else if(id_kolom==('billing_status_'+i+'_'+indek)){
      isiEdit.billing_status=getEV(id_kolom);
      baru.push(isiEdit);
      
    }else if(id_kolom==('day_0_'+i+'_'+indek)){
      isiEdit.day_0=getEV(id_kolom);
      isiEdit.day_0=Number(isiEdit.day_0).toFixed(2);
      baru.push(isiEdit);
      
    }else if(id_kolom==('day_1_'+i+'_'+indek)){
      isiEdit.day_1=getEV(id_kolom);
      isiEdit.day_1=Number(isiEdit.day_1).toFixed(2);
      baru.push(isiEdit);
      
    }else if(id_kolom==('day_2_'+i+'_'+indek)){
      isiEdit.day_2=getEV(id_kolom);
      isiEdit.day_2=Number(isiEdit.day_2).toFixed(2);
      baru.push(isiEdit);
      
    }else if(id_kolom==('day_3_'+i+'_'+indek)){
      isiEdit.day_3=getEV(id_kolom);
      isiEdit.day_3=Number(isiEdit.day_3).toFixed(2);
      baru.push(isiEdit);
      
    }else if(id_kolom==('day_4_'+i+'_'+indek)){
      isiEdit.day_4=getEV(id_kolom);
      isiEdit.day_4=Number(isiEdit.day_4).toFixed(2);
      baru.push(isiEdit);
      
    }else if(id_kolom==('day_5_'+i+'_'+indek)){
      isiEdit.day_5=getEV(id_kolom);
      isiEdit.day_5=Number(isiEdit.day_5).toFixed(2);
      baru.push(isiEdit);

    }else if(id_kolom==('day_6_'+i+'_'+indek)){
      isiEdit.day_6=getEV(id_kolom);
      isiEdit.day_6=Number(isiEdit.day_6).toFixed(2);
      baru.push(isiEdit);

    }else{
      baru.push(isi[i]);
    }
    isiEdit.total_hour=Number(isiEdit.day_0)
      +Number(isiEdit.day_1)+Number(isiEdit.day_2)
      +Number(isiEdit.day_3)+Number(isiEdit.day_4)
      +Number(isiEdit.day_5)+Number(isiEdit.day_6);
    setEV('total_hour_'+i+'_'+indek,isiEdit.total_hour.toFixed(2));
  }  
  bingkai[indek].time_detail=baru;  
}

TimeTickets.changeCustomerByMode=(indek,baris)=>{
  if(getEI('ticket_type_'+indek)==1){// weekly
    setEV('customerby_id_'+baris+'_'+indek,'');
    TimeTickets.setCell(indek,'customerby_mode_'+baris+'_'+indek);
  }else{
    setEV('customerby_id_n_'+indek,'');
    setEV('customerby_name_n_'+indek,'');
  }
}

TimeTickets.setActivityItem=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.item_id);
  if(getEI('ticket_type_'+indek)==0){
    TimeTickets.getActivityItem(indek,"n");
  }else{
    TimeTickets.setCell(indek, id_kolom);
  }
}

TimeTickets.getActivityItem=(indek, baris)=>{
  var item_id='item_id_'+baris+'_'+indek;
  TimeTickets.item.getOne(indek,
  getEV(item_id),
  (paket)=>{
    if(paket.count>0 && paket.err.id==0){
      var d=objectOne(paket.fields,paket.data);
      setEV('billing_rate_'+baris+'_'+indek, d.unit_cost);
      //setEV('billing_rate_'+baris+'_'+indek, 500);
      if(getEI('ticket_type_'+indek)==0){
        // daily
        setEV('item_name_'+baris+'_'+indek, d.name);
        TimeTickets.durationChange(indek);
      }else{
        // weekly
        TimeTickets.setCell(indek, 'billing_rate_'+baris+'_'+indek);
      }
    }
  });
}

TimeTickets.durationChange=(indek)=>{
  setEV('duration_'+indek, fTime(getEV('duration_'+indek)) );
  var t=getEV('duration_'+indek);
  var s=String(t).split(':');
  var a=digit2(s[0]);
  var b=digit2(s[1]);
  var h=a+'.'+digit2(Math.round(parseInt(b)/60*100));
  var amount=Number(getEV('billing_rate_n_'+indek))*Number(h);
  
  setEV('unit_duration_'+indek,h);
  setEV('billing_amount_'+indek, amount.toFixed(2) );
}

TimeTickets.setCustomerByMode=(indek, baris)=>{
  var kode=getEI('customerby_mode_'+baris+'_'+indek);
  if(kode==0){
    TimeTickets.customer.getPaging(indek,'customerby_id_'+baris+'_'+indek);
  }else if(kode==1){
    TimeTickets.job.getPaging(indek,'customerby_id_'+baris+'_'+indek);
  }else{}
}

TimeTickets.setCustomer=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.customer_id);
  if(getEI('ticket_type_'+indek)==0){
    TimeTickets.getCustomerByMode(indek);
  }else{
    TimeTickets.setCell(indek, id_kolom);
  }
}

TimeTickets.getCustomerByMode=(indek)=>{
  setEV('customerby_name_n_'+indek, "");
  TimeTickets.customer.getOne(indek,
  getEV('customerby_id_n_'+indek),
  (paket)=>{
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('customerby_name_n_'+indek, d.name);
    }
  });
}

TimeTickets.setJob=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d);
  TimeTickets.setCell(indek, id_kolom);
}

TimeTickets.changeOption=(indek)=>{
  if(getEI('time_option_'+indek)==0){
    document.getElementById('time_duration_'+indek).style.display="none";
    document.getElementById('time_manual_'+indek).style.display="inline";
  }else{
    document.getElementById('time_manual_'+indek).style.display="none";
    document.getElementById('time_duration_'+indek).style.display="inline";
  }
}

TimeTickets.timeCalc=(indek)=>{
  var sDate,eDate;
  var sTime,eTime,bTime,cTime;
  var bh="00",bm="00";
  var hh,mm,cc;
  
  sDate=fTgl(getEV('ticket_date_'+indek));
  eDate=fTgl(getEV('ticket_date_'+indek));
  
  sTime=new Date(sDate+' '+fTime(getEV('start_time_'+indek)));
  eTime=new Date(sDate+' '+fTime(getEV('end_time_'+indek)));
  bTime=fTime(getEV('break_time_'+indek));

  // bila beda satu hari;
  if(eTime<sTime){
    eDate=new Date(getEV('ticket_date_'+indek));
    eDate.setDate(eDate.getDate()+1);
    eTime=new Date(fTgl(eDate)+' '+fTime(getEV('end_time_'+indek)));
  }

  cTime=new Date(eTime.getTime()-sTime.getTime() );
  
  if(bTime=="00:00"){
    // no break;
  }else{
    // with break;
    bh=parseInt((bTime).substr(0,2));
    bm=parseInt((bTime).substr(3,2));
  }
  
  cTime.setHours(cTime.getHours()-bh);// kurang jam;
  cTime.setMinutes(cTime.getMinutes()-bm);// kurang menit;

  hh=Math.floor(cTime/1000/60/60);
  cc=cTime-(hh*1000*60*60);
  mm=Math.floor(cc/1000/60);
  
  setEV('start_time_'+indek
    ,digit2(sTime.getHours())+':'+digit2(sTime.getMinutes()) );
  setEV('end_time_'+indek
    ,digit2(eTime.getHours())+':'+digit2(eTime.getMinutes()) );
  setEV('break_time_'+indek,digit2(bh)+':'+digit2(bm) );
  setEV('duration_'+indek, digit2(hh)+':'+digit2(mm));
  setEV('duration_calc_'+indek, digit2(hh)+':'+digit2(mm));
  TimeTickets.durationChange(indek);// konversi ke satuan JAM;
}

TimeTickets.ngumpet=(indek,mode)=>{
  if(mode==0){
    document.getElementById('date_tmp_'+indek).style.display="none";
    document.getElementById('ticket_date_'+indek).style.display="inline";
    document.getElementById('ticket_date_'+indek).focus();
  }else{
    document.getElementById('ticket_date_'+indek).style.display="none";  
    document.getElementById('date_tmp_'+indek).style.display="inline";
    setEV('date_tmp_'+indek, tglWest(getEV('ticket_date_'+indek)) );
  }
}

TimeTickets.changeDate=(indek)=>{
  TimeTickets.setRows(indek,bingkai[indek].time_detail);
}

TimeTickets.getRecordByMode=(indek)=>{
  var kode=parseInt(document.getElementById('recordby_mode_'+indek).value);
  if(kode==0){
    TimeTickets.getEmployee(indek);
  }else if(kode==1){
    TimeTickets.getVendor(indek);
  }  
}

/*
TimeTickets.getCustomerByMode=(indek)=>{
  var kode=parseInt(document.getElementById('customerby_mode_'+indek).value);
  if(kode==0){
    TimeTickets.getEmployee(indek);
  }else if(kode==1){
    TimeTickets.getVendor(indek);
  }  
}
*/

TimeTickets.createExecute=(indek)=>{

  var detail=TimeTickets.getFormEntry(indek);

  db.execute(indek,{
    query:"INSERT INTO time_tickets "
      +"(admin_name,company_id,record_mode,record_id"
      +",ticket_no,date,type,daily_detail,weekly_detail)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEI("recordby_mode_"+indek)+"'"
      +",'"+getEV("recordby_id_"+indek)+"'"
      +",'"+getEV("ticket_no_"+indek)+"'"
      +",'"+getEV("ticket_date_"+indek)+"'"
      +",'"+getEI("ticket_type_"+indek)+"'"
      +",'"+JSON.stringify(detail.daily)+"'"
      +",'"+JSON.stringify(detail.weekly)+"'"
      +")"
  });
}

TimeTickets.getFormEntry=(indek)=>{
  var daily_detail={};//object
  var weekly_detail={};//array 

  if(getEI('ticket_type_'+indek)==0){// daily
    daily_detail={
      'item_id':getEV('item_id_n_'+indek),
      'customerby_mode':getEV('customerby_mode_n_'+indek),
      'customerby_id':getEV('customerby_id_n_'+indek),
      'pay_level':getEI('pay_level_'+indek),
      'used_in_payroll':getEC('used_in_payroll_'+indek),
      'time_option':getEI('time_option_'+indek),
      'start_time':getEV('start_time_'+indek),
      'end_time':getEV('end_time_'+indek),
      'break_time':getEV('break_time_'+indek),
      'duration':getEV('duration_'+indek),

      'ticket_description':getEV('ticket_description_'+indek),
      'internal_memo':getEV('internal_memo_'+indek),

      'billing_type': getEI('billing_type_'+indek),
      'billing_rate': getEV('billing_rate_n_'+indek),
      'billing_status': getEI('billing_status_'+indek),
      'unit_duration': getEV('unit_duration_'+indek),
      'billing_amount': getEV('billing_amount_'+indek)
    };
  }else{
    weekly_detail=bingkai[indek].time_detail;
  }
  
  return {
    'daily':daily_detail,
    'weekly':weekly_detail
  };
}

TimeTickets.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:" SELECT * "
      +" FROM time_tickets"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND ticket_no='"+bingkai[indek].ticket_no+"'"
  },(paket)=>{
    if (paket.err.id==0){
      var d=objectOne(paket.fields,paket.data);
      var dd=JSON.parse(d.daily_detail);
      var wd=JSON.parse(d.weekly_detail);
      
      setEI('recordby_mode_'+indek, d.record_mode);
      setEV('recordby_id_'+indek, d.record_id);
      setEV('recordby_name_'+indek, d.record_name);
      setEV('ticket_no_'+indek, d.ticket_no);
      setEV('ticket_date_'+indek, d.date);
      setEV('date_tmp_'+indek, tglWest(d.date));
      setEI('ticket_type_'+indek, d.type);

      if(d.type==0){
        TimeTickets.setDailyForm(indek,dd );
        setEI('time_option_'+indek, dd.time_option);
        TimeTickets.changeOption(indek);
      }else{
        TimeTickets.setRows(indek,wd);
      }
      TimeTickets.changeType(indek);
    }
    message.none(indek);
    return callback();
  });
}

TimeTickets.formUpdate=(indek,ticket_no)=>{
  bingkai[indek].ticket_no=ticket_no;
  TimeTickets.form.modeUpdate(indek);
}

TimeTickets.updateExecute=(indek)=>{
  var detail=TimeTickets.getFormEntry(indek)

  db.execute(indek,{
    query:"UPDATE time_tickets"
      +" SET record_mode='"+getEI("recordby_mode_"+indek)+"',"
      +" record_id='"+getEV("recordby_id_"+indek)+"',"
      +" ticket_no='"+getEV("ticket_no_"+indek)+"',"
      +" date='"+getEV("ticket_date_"+indek)+"',"
      +" type='"+getEI("ticket_type_"+indek)+"',"
      +" daily_detail='"+JSON.stringify(detail.daily)+"',"
      +" weekly_detail='"+JSON.stringify(detail.weekly)+"'"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND ticket_no='"+bingkai[indek].ticket_no+"'"
  },(p)=>{
    if(p.err.id==0){
      TimeTickets.deadPath(indek);
      bingkai[indek].ticket_no=getEV('ticket_no_'+indek);
    }
  });
}

TimeTickets.formDelete=(indek,ticket_no)=>{
  bingkai[indek].ticket_no=ticket_no;
  TimeTickets.form.modeDelete(indek);
}

TimeTickets.deleteExecute=function(indek){
  db.execute(indek,{
    query:"DELETE FROM time_tickets"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND ticket_no='"+bingkai[indek].ticket_no+"'"
  },(p)=>{
    if(p.err.id==0) TimeTickets.deadPath(indek);
  });
}

TimeTickets.setDailyForm=(indek,o)=>{
  
  setEV('item_id_n_'+indek,o.item_id);
  setEV('item_name_n_'+indek,o.item_name);
  setEI('customerby_mode_n_'+indek,o.customerby_mode);
  setEV('customerby_id_n_'+indek,o.customerby_id);
  setEV('customerby_name_n_'+indek,o.customerby_name);
  
  setEI('pay_level_'+indek,o.pay_level);
  setEC('used_in_payroll_'+indek,o.used_in_payroll);
  setEI('time_option_'+indek,o.time_option);
  
  setEV('start_time_'+indek,o.start_time);
  setEV('end_time_'+indek,o.end_time);
  setEV('break_time_'+indek,o.break_time);
  setEV('duration_calc_'+indek,o.duration);
  setEV('duration_'+indek,o.duration);
  
  setEV('ticket_description_'+indek,o.ticket_description);
  setEV('internal_memo_'+indek,o.internal_memo);
  
  setEI('billing_type_'+indek,o.billing_type);
  setEV('billing_rate_n_'+indek, o.billing_rate);
  setEI('billing_status_'+indek,o.billing_status);
  setEV('unit_duration_'+indek,o.unit_duration);
  setEV('billing_amount_'+indek, o.billing_amount);
}

TimeTickets.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM time_tickets "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND ticket_no LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR record_name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

TimeTickets.search=(indek)=>{
  TimeTickets.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT date,ticket_no,unit_duration,record_name,"
        +"billing_amount,"
        +"user_name,date_modified "
        +" FROM time_tickets"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND ticket_no LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR record_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      TimeTickets.readShow(indek);
    });
  });
}

TimeTickets.exportExecute=(indek)=>{
  var table_name=TimeTickets.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

TimeTickets.importExecute=(indek)=>{
  var n=0;
  var m='<p>[Start]</p>';
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;
  var i;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (i=0;i<d.length;i++){
//  for (i=0;i<1;i++){
    db.run(indek,{
      query:"INSERT INTO time_tickets "
        +"(admin_name,company_id,record_mode,record_id"
        +",ticket_no,date,type,daily_detail,weekly_detail)"
        +" VALUES "
        +"('"+bingkai[indek].admin.name+"'"
        +",'"+bingkai[indek].company.id+"'"
        +",'"+d[i][1]+"'" // 1-record_mode
        +",'"+d[i][2]+"'" // 2-record_id
        +",'"+d[i][3]+"'" // 3-ticket_no
        +",'"+d[i][4]+"'" // 4-date
        +",'"+d[i][5]+"'" // 5-type
        +",'"+d[i][6]+"'" // 6-daily_detail
        +",'"+d[i][7]+"'" // 7-weekly_detail
        +")"
    },(paket)=>{  
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

TimeTickets.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT date,ticket_no,unit_duration,"
      +"record_name,billing_amount,"
      +"user_name,date_modified"
      +" FROM time_tickets"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date DESC"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    TimeTickets.selectShow(indek);
  });
}

TimeTickets.selectShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +'<table border=1>'
      +'<tr>'
        +'<th>'
        +'<input type="checkbox"'
          +' id="check_all_'+indek+'"'
          +' onclick="checkAll(\''+indek+'\')">'
          +'</th>'
        +'<th colspan="2">Date</th>'
        +'<th>Ticket #</th>'
        +'<th>Employee/Vendor Name</th>'
        +'<th>Duration</th>'
        +'<th>Billing Amount</th>'
        
        +'<th>Owner</th>'
        +'<th colspan="2">Modified</th>'
      +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
        +'<th>'
        +'<input type="checkbox"'
          +' id="checked_'+x+'_'+indek+'"'
          +' name="checked_'+indek+'">'
          +'</th>'
        +'<td align="center">'+n+'</td>'        
        +'<td align="center">'+tglEast(d[x].date)+'</td>'
        +'<td align="left">'+d[x].ticket_no+'</td>'
        +'<td align="left">'+d[x].record_name+'</td>'
        +'<td align="center">'+d[x].unit_duration+'</td>'
        +'<td align="center">'+d[x].billing_amount+'</td>'
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

TimeTickets.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM time_tickets"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND ticket_no='"+d[i].ticket_no+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

TimeTickets.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM time_tickets"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND ticket_no='"+bingkai[indek].ticket_no+"'"
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

TimeTickets.duplicate=(indek)=>{
  var id='copy_of '+getEV('ticket_no_'+indek);
  setEV('ticket_no_'+indek,id);
  focus('ticket_no_'+indek);
}

TimeTickets.deadPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{TimeTickets.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{TimeTickets.properties(indek);})
  }
}





// eof: 1281;1326;1338;1392;1387;1388;1392;1396;
