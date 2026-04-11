
/*
 * auth: budiono;
 * file: E8;
 * path: /accounting/jobs/jobs.js;
 * ------------------------------;
 * date: sep-13, 12:08, wed-2023; new;
 * edit: sep-14, 14:05, thu-2023; 
 * edit: sep-16, 17:21, sat-2023; mod size;
 * -----------------------------; happy new year 2024;
 * edit: jan-09, 14:12, tue-2024; meringkas 1;
 * edit: jun-08, 13:15, sat-2024; BasicSQL;
 * edit: jul-03, 20:12, wed-2024; r5;
 * edit; aug-02, 16:57, fri-2024; r11;
 * edit: sep-12, 16:17, thu-2024; r19;
 * edit: nov-25, 16:03, mon-2024; #27; add locker;
 * edit: dec-26, 08:04, thu-2024; #32; properties+duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-23, 07:44, sun-2025; #41; file_blok;
 * edit: mar-11, 22:27, mon-2025; #43; deep-folder;
 * edit: mar-26, 00:35, wed-2025; #45; ctables;cstructure;
 * edit: apr-24, 22:44, thu-2025; #50; export to csv;
 * edit: aug-18, 21:28, mon-2025; #68;
 * edit: oct-10, 20:44, fri-2025; #80; relation_vobj;
 */ 

'use strict';

var Jobs={};

Jobs.table_name='jobs',
Jobs.form=new ActionForm2(Jobs);
Jobs.customer=new CustomerLook(Jobs);
Jobs.phase=new PhaseLook(Jobs);
Jobs.cost=new CostLook(Jobs);

Jobs.show=(tiket)=>{
  tiket.modul=Jobs.table_name;
  
  var baru=exist(tiket);
  if(baru==-1){
    var newCus=new BingkaiUtama(tiket);
    var indek=newCus.show();
    getCompanyID(indek);
    getPath2(indek,(h)=>{
      mkdir(indek,h.folder,(h)=>{
        Jobs.form.modePaging(indek);
      });
    });
  }else{
    show(baru);
  }
}

Jobs.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM jobs"
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

Jobs.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Jobs.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT job_id,name,supervisor,start_date,use_phases,"
        +" user_name,date_modified"
        +" FROM jobs"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY job_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Jobs.readShow(indek);
    });
  })
}

Jobs.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +totalPagingandLimit(indek)
    +'<table border=1>'
    +'<tr>'
      +'<th colspan="2">Job ID</th>'
      +'<th>Description</th>'
      +'<th>Supervisor</th>'
      +'<th>Start<br>Date</th>'
      +'<th>Use<br>Phases</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
      +'<th colspan=2>Action</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].job_id+'</td>'
        +'<td align="left">'+xHTML(d[x].name)+'</td>'
        +'<td align="left">'+xHTML(d[x].supervisor)+'</td>'
        +'<td align="center">'+tglWest(d[x].start_date)+'</td>'
        +'<td align="center">'+binerToBool(d[x].use_phases)+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
          
        +'<td align="center">'
          +'<button type="button"'
          +' id="btn_change" '
          +' onclick="Jobs.formUpdate(\''+indek+'\''
          +',\''+d[x].job_id+'\');">'
          +'</button>'
          +'</td>'
          
        +'<td align="center">'
          +'<button type="button"'
          +' id="btn_delete"'
          +' onclick="Jobs.formDelete(\''+indek+'\''
          +' ,\''+d[x].job_id+'\');">'
          +'</button>'
          +'</td>'
        +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Jobs.form.addPagingFn(indek);
}

Jobs.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    +'<ul>'
    
    +'<li><label>Job ID <i class="required">*</i></label>'
      +'<input type="text"'
      +' id="job_id_'+indek+'"'
      +' size="18"></li>'
      
    +'<li><label>Description</label>'
      +'<input type="text"'
      +' id="job_name_'+indek+'"'
      +' size="25"></li>'
      
    +'<li><label>&nbsp;</label>'
      +'<label><input type="checkbox"'
      +' id="job_inactive_'+indek+'">Inactive</label></li>'
    
    +'</ul>'
      
//--      
    +'<div style="display:grid;grid-template-columns:repeat(2,1fr);'
    +'padding-bottom:20px;">' //b
    +'<div>'
    +'<ul>'
    +'<li><label>Supervisor</label>'
      +'<input type="text"'
      +' id="supervisor_'+indek+'"'
      +' size="18"></li>'
      
    +'<li><label>Customer ID</label>'
      +'<input type="text" '
      +' id="customer_id_'+indek+'" '
      +' onchange="Jobs.getCustomer(\''+indek+'\''
      +',\'customer_id_'+indek+'\')"'
      +' size="18">'

      +'<button type="button"'
        +' id="btn_find" '
        +' onclick="Jobs.customer.getPaging(\''+indek+'\''
        +',\'customer_id_'+indek+'\''
        +',-1);">'
      +'</button>'
    +'</li>'
    
    +'<li><label>&nbsp;</label>'
      +'<input type="text" size="25"'
      +' id="customer_name_'+indek+'" disabled >'
    +'</li>'
      
    +'<li><label>Start Date</label>'
      +'<input type="date" '
        +'id="start_date_'+indek+'"'
        +' onblur="dateFakeShow('+indek+',\'start_date\')"'
        +' style="display:none;">'
      +'<input type="text" '
        +'id="start_date_fake_'+indek+'"'
        +' onfocus="dateRealShow('+indek+',\'start_date\')"'
        +' size="9">'
    +'</li>'
      
    +'<li><label>End Date</label>'
      +'<input type="date" '
        +' id="end_date_'+indek+'"'
        +' onblur="dateFakeShow('+indek+',\'end_date\')"'
        +' style="display:none;">'
      +'<input type="text" '
        +' id="end_date_fake_'+indek+'"'
        +' onfocus="dateRealShow('+indek+',\'end_date\')"'
        +' size="9">'
    +'</li>'
    +'</ul>'
    +'</div>'
//--      
    +'<div>'
    +'<ul>'
    +'<li><label>Job Type</label>'
      +'<input type="text" id="job_type_'+indek+'" size="9"></li>'
      
    +'<li><label>PO Number</label>'
      +'<input type="text" id="po_number_'+indek+'" size="9"></li>'
      
    +'<li><label>% Complete</label>'
      +'<input type="text"'
      +' id="percent_complete_'+indek+'" '
      +' style="text-align:center;"'
      +' size="5"></li>'
    +'</ul>'
    +'</div>'
    +'</div>'
//--
    +'<ul>'
    +'<li><label>&nbsp;</label>&nbsp;'
      +'<label><input type="checkbox" id="use_phases_'+indek+'"'
      +' onclick="Jobs.changePhases(\''+indek+'\')">Use Phases'
      +'</label></li>'
    
    +'</ul>'
    
    +'<details id="dtl_no_phases_'+indek+'">'
    +'<summary>Estimated</summary>'
    +'<ul>'
      +'<li><label>Expenses</label>'
        +'<input type="text"'
        +' id="expenses_'+indek+'"'
        +' style="text-align:center;"'
        +' size="9"></li>'
        
      +'<li><label>Revenues</label>'
        +'<input type="text"'
        +' id="revenues_'+indek+'"'
        +' style="text-align:center;"'
        +' size="9"></li>'
    +'</ul>'

    +'</details>'
    
    +'<details id="dtl_phases_'+indek+'">'
      +'<summary>Phases</summary>'
      +'<div id="job_detail_'+indek+'"'
      +' style="overflow-y:auto;" ></div>'
    +'</details>'
    
    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  
  if(metode!=MODE_CREATE){
    document.getElementById("job_id_"+indek).disabled=true;
    document.getElementById("use_phases_"+indek).disabled=true;
  }else{
    document.getElementById("job_id_"+indek).focus();
  }
  
  bingkai[indek].job_detail=[];
}

Jobs.setCustomer=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, data.customer_id);
  Jobs.getCustomer(indek,id_kolom);
}

Jobs.getCustomer=(indek,id_kolom)=>{
  setEV('customer_name_'+indek, txt_undefined);
  Jobs.customer.getOne(indek,
    document.getElementById(id_kolom).value,
  (paket)=>{
    if(paket.count!=0){
      var d=objectOne(paket.fields,paket.data);
      setEV('customer_name_'+indek, d.name);
    }
  });
}

Jobs.changePhases=(indek)=>{
  if(document.getElementById('use_phases_'+indek).checked){
    document.getElementById('dtl_phases_'+indek).open=true;
    document.getElementById('dtl_no_phases_'+indek).open=false;
    Jobs.setRows(indek,bingkai[indek].job_detail);
  }else{
    document.getElementById('dtl_phases_'+indek).open=false;
    document.getElementById('dtl_no_phases_'+indek).open=true;
    Jobs.setRows(indek,[]);
  }
}

Jobs.setRows=(indek,isi)=>{
  if(isi===undefined)isi=[]; 
     
  var panjang=isi.length;
  var html=Jobs.tableHead(indek);
  
  bingkai[indek].job_detail=isi;
    
  for (var i=0;i<panjang;i++){

    html+='<tr>'
    +'<td align="center">'+(i+1)+'</td>'
    
    +'<td>'
      +'<input type="text" id="phase_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].phase_id+'"'
      +' onchange="Jobs.setCell(\''+indek+'\''
      +',\'phase_id_'+i+'_'+indek+'\')"'
      +' style="text-align:left"'
      +' size="12">'
      +'</td>'

    +'<td>'
      +'<button type="button" '
        +' id="btn_find" '
        +' onclick="Jobs.phase.getPaging(\''+indek+'\''
        +',\'phase_id_'+i+'_'+indek+'\',\''+i+'\');">'
      +'</button>'
      +'</td>'

    +'<td>'
      +'<input type="text" id="cost_id_'+i+'_'+indek+'"'
      +' value="'+isi[i].cost_id+'"'
      +' onchange="Jobs.setCell(\''+indek+'\''
      +',\'cost_id_'+i+'_'+indek+'\')"'
      +' style="text-align:left"'
      +' size="12" >'
    +'</td>'

    +'<td>'
      +'<button type="button" '
        +' id="btn_find" '
        +' onclick="Jobs.cost.getPaging(\''+indek+'\''
        +',\'cost_id_'+i+'_'+indek+'\',\''+i+'\');">'
      +'</button>'
      +'</td>'
      
    +'<td style="margin:0;padding:0" align="center">'
      +'<input type="text" id="units_'+i+'_'+indek+'"'
      +' value="'+isi[i].units+'"'
      +' onchange="Jobs.setCell(\''+indek+'\''
      +',\'units_'+i+'_'+indek+'\')"'
      +' style="text-align:center"'
      +' size="4">'
      +'</td>'    
      
    +'<td style="margin:0;padding:0" align="center">'
      +'<input type="text" id="expenses_'+i+'_'+indek+'"'
      +' value="'+isi[i].expenses+'"'
      +' onchange="Jobs.setCell(\''+indek+'\''
      +',\'expenses_'+i+'_'+indek+'\')"'
      +' style="text-align:center"'
      +' size="6">'
      +'</td>'    

    +'<td style="margin:0;padding:0" align="center">'
      +'<input type="text" id="revenues_'+i+'_'+indek+'" '
      +' value="'+isi[i].revenues+'"'
      +' onchange="Jobs.setCell(\''+indek+'\''
      +',\'revenues_'+i+'_'+indek+'\')"'
      +' style="text-align:center"'
      +' size="6">'
      +'</td>'

    +'<td align="center">'
      +'<button type="button" id="btn_add" '
      +' onclick="Jobs.addRow(\''+indek+'\','+i+')" >'
      +'</button>'
      
      +'<button type="button" id="btn_remove" '
      +' onclick="Jobs.removeRow(\''+indek+'\','+i+')" >'
      +'</button>'
      +'</td>'
    +'</tr>';
  }
  
  html+=Jobs.tableFoot(indek);
  var budi = JSON.stringify(isi);
  document.getElementById('job_detail_'+indek).innerHTML=html;
  
  if(panjang==0)Jobs.addRow(indek,0);
}

Jobs.newRow=(oldBasket,newBasket)=>{
  var myItem={};
  myItem.row_id=oldBasket.length+1;
  myItem.phase_id="";
  myItem.cost_id="";
  myItem.units='';
  myItem.expenses='';
  myItem.revenues='';
  newBasket.push(myItem);        
}

Jobs.addRow=(indek,baris)=>{
  var oldBasket=[];
  var newBasket=[];
  oldBasket=bingkai[indek].job_detail;
  
  for(var i=0;i<oldBasket.length;i++){
    newBasket.push(oldBasket[i]);
    if(i==baris)Jobs.newRow(oldBasket,newBasket);
  }

  if(newBasket.length==0)Jobs.newRow(oldBasket,newBasket);
  Jobs.setRows(indek,newBasket);
}

Jobs.tableHead=(indek)=>{
  return '<table>'
  +'<thead>'
    +'<tr>'
    +'<th>No.</th>'
    +'<th colspan="2">Phases ID</th>'
    +'<th colspan="2">Cost ID</th>'
    +'<th>Unit</th>'
    +'<th>Expenses</th>'
    +'<th>Revenues</th>'
    +'<th>Add/Rem</th>'
    +'</tr>'
  +'</thead>';
}

Jobs.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
    +'<td colspan="7">&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

Jobs.removeRow=(indek,number)=>{
  var oldBasket=bingkai[indek].job_detail;
  var newBasket=[];
  
  Jobs.setRows(indek,oldBasket);
  for(let i=0;i<oldBasket.length;i++){
    if (i!=(number)){
      newBasket.push(oldBasket[i]);
    }
  }
  Jobs.setRows(indek,newBasket);
}

Jobs.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].job_detail;
  var baru = [];
  var isiEdit = {};

  for (var i=0;i<isi.length; i++){
    isiEdit=isi[i];
    
    if(id_kolom==('phase_id_'+i+'_'+indek)){
      isiEdit.phase_id=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
      
    }else if(id_kolom==('cost_id_'+i+'_'+indek)){
      isiEdit.cost_id=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
      
    }else if(id_kolom==('units_'+i+'_'+indek)){
      // alert(id_kolom);
      isiEdit.units=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
      
    }else if(id_kolom==('expenses_'+i+'_'+indek)){
      isiEdit.expenses=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
      
    }else if(id_kolom==('revenues_'+i+'_'+indek)){
      isiEdit.revenues=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
      
    }else{
      baru.push(isi[i]);
    }
  }
  bingkai[indek].job_detail=isi;
}

Jobs.setPhase=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, data.phase_id);
  Jobs.setCell(indek,id_kolom);
}

Jobs.setCost=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, data.cost_id);
  Jobs.setCell(indek,id_kolom);
}

Jobs.createExecute=(indek)=>{

  var detail=JSON.stringify(bingkai[indek].job_detail);
  var custom_fields=JSON.stringify(['new-1','new-2']);

  db.execute(indek,{
    query:"INSERT INTO jobs"
    +"(admin_name,company_id"
    +",job_id,name,inactive,supervisor,customer_id"
    +",start_date,end_date,type,po_number,percent_complete"
    +",use_phases,expenses,revenues,detail,custom_fields)"
    +" VALUES "
    +"('"+bingkai[indek].admin.name+"'"
    +",'"+bingkai[indek].company.id+"'"
    +",'"+getEV("job_id_"+indek)+"'"
    +",'"+getEV("job_name_"+indek)+"'"
    +",'"+getEC("job_inactive_"+indek)+"'"
    +",'"+getEV("supervisor_"+indek)+"'"
    +",'"+getEV("customer_id_"+indek)+"'"
    +",'"+getEV("start_date_"+indek)+"'"
    +",'"+getEV("end_date_"+indek)+"'"
    +",'"+getEV("job_type_"+indek)+"'"
    +",'"+getEV("po_number_"+indek)+"'"
    +",'"+getEV("percent_complete_"+indek)+"'"
    +",'"+getEC("use_phases_"+indek)+"'"
    +",'"+getEV("expenses_"+indek)+"'"
    +",'"+getEV("revenues_"+indek)+"'"
    +",'"+detail+"'"
    +",'"+custom_fields+"'"
    +")"
  });
}

Jobs.readOne=(indek,callback)=>{

  db.execute(indek,{
    query:"SELECT * "
      +" FROM jobs"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND job_id='"+bingkai[indek].job_id+"'"
  },(paket)=>{
    if (paket.err.id==0 && paket.count>0) {

      var d=objectOne(paket.fields,paket.data);
      
      setEV('job_id_'+indek, d.job_id);
      setEV('job_name_'+indek, d.name);
      setEC('job_inactive_'+indek, d.inactive);
      
      setEV('supervisor_'+indek, d.supervisor);
      setEV('start_date_'+indek, d.start_date);
      setEV('start_date_fake_'+indek, tglWest(d.start_date));
      setEV('end_date_'+indek, d.end_date);
      setEV('end_date_fake_'+indek, tglWest(d.end_date));
      
      setEV('job_type_'+indek, d.type);
      setEV('po_number_'+indek, d.po_number);
      setEV('percent_complete_'+indek, d.percent_complete);

      setEC('use_phases_'+indek, d.use_phases);
      
      setEV('revenues_'+indek, d.revenues);
      setEV('expenses_'+indek, d.expenses);
      
      setEV('customer_id_'+indek, d.customer_id);
      setEV('customer_name_'+indek, d.customer_name);
      
      Jobs.setRows(indek,JSON.parse(d.detail)) ;

      if(getEC('use_phases_'+indek)){
        setEO('dtl_phases_'+indek, true);
        setEO('dtl_no_phases_'+indek, false);
      }else{
        setEO('dtl_phases_'+indek, false);
        setEO('dtl_no_phases_'+indek, true);
      }
      message.none(indek);
      return callback();
    }
  });
}

Jobs.formUpdate=(indek,job_id)=>{
  bingkai[indek].job_id=job_id;
  Jobs.form.modeUpdate(indek);
}

Jobs.updateExecute=(indek)=>{

  var detail=JSON.stringify(bingkai[indek].job_detail);
  var custom_fields=JSON.stringify(['edit-1','edit-2']);
  
  db.execute(indek,{
    query:"UPDATE jobs"
      +" SET name='"+getEV("job_name_"+indek)+"',"
      +" inactive='"+getEC("job_inactive_"+indek)+"',"
      +" supervisor='"+getEV("supervisor_"+indek)+"',"
      +" customer_id='"+getEV("customer_id_"+indek)+"',"
      +" start_date='"+getEV("start_date_"+indek)+"',"
      +" end_date='"+getEV("end_date_"+indek)+"',"
      +" type='"+getEV("job_type_"+indek)+"',"
      +" po_number='"+getEV("po_number_"+indek)+"',"
      +" percent_complete='"+getEV("percent_complete_"+indek)+"',"
      +" use_phases='"+getEC("use_phases_"+indek)+"',"
      +" expenses='"+getEV("expenses_"+indek)+"',"
      +" revenues='"+getEV("revenues_"+indek)+"',"
      +" detail='"+detail+"',"
      +" custom_fields='"+custom_fields+"'"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND job_id='"+bingkai[indek].job_id+"'"
  },(p)=>{
    if(p.err.id==0) Jobs.endPath( indek );
  });
}

Jobs.formDelete=(indek,job_id)=>{
  bingkai[indek].job_id=job_id;
  Jobs.form.modeDelete(indek);
}

Jobs.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM jobs"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND job_id='"+bingkai[indek].job_id+"'"
  },(p)=>{
    if(p.err.id==0) Jobs.endPath( indek );
  });
}

Jobs.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM jobs"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND job_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR supervisor LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Jobs.search=(indek)=>{
  Jobs.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT job_id,name,supervisor,start_date,use_phases,"
        +" user_name,date_modified"
        +" FROM jobs"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND job_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR supervisor LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Jobs.readShow(indek);
    });
  });
}

Jobs.exportExecute=(indek)=>{
  var sql={
    "select": "company_id," 
      +" job_id,name,inactive,"
      +" supervisor,customer_id,start_date,end_date,"
      +" type,po_number,percent_complete,"
      +" use_phases,"
      +" expenses,revenues,"
      +" detail,custom_fields",
    "from": "jobs",
    "where": "admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'",
    "limit": 100,
  }
  DownloadAllPage.viewForm(indek, sql, 'jobs');
}

Jobs.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO jobs"
      +"(admin_name,company_id"
      +",job_id,name,inactive,supervisor,customer_id"
      +",start_date,end_date,type,po_number,percent_complete"
      +",use_phases,expenses,revenues,detail,custom_fields)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"// owner
      +",'"+bingkai[indek].company.id+"'"// company_id
      +",'"+d[i][1]+"'" // job_id
      +",'"+d[i][2]+"'" // name
      +",'"+d[i][3]+"'" // inactive
      +",'"+d[i][4]+"'" // supervisor
      +",'"+d[i][5]+"'" // customer_id
      +",'"+d[i][6]+"'" // start_date
      +",'"+d[i][7]+"'" // end_date
      +",'"+d[i][8]+"'" // type
      +",'"+d[i][9]+"'" // po_number
      +",'"+d[i][10]+"'"// percent 
      +",'"+d[i][11]+"'"// use_phases
      +",'"+d[i][12]+"'"// expenses
      +",'"+d[i][13]+"'"// revenues
      +",'"+d[i][14]+"'" // detail
      +",'"+d[i][15]+"'"// custom_fields
      +")"
    },(paket)=>{  
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

Jobs.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT job_id,name,supervisor,start_date,use_phases,"
      +" user_name,date_modified"
      +" FROM jobs"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY job_id"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Jobs.selectShow(indek);
  });
}

Jobs.selectShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +totalPagingandLimit(indek)
    +'<table border=1>'
    +'<tr>'
      +'<td align="center">'
        +'<input type="checkbox"'
        +' id="check_all_'+indek+'"'
        +' onclick="checkAll(\''+indek+'\')">'
      +'</td>'
      +'<th colspan="2">Job ID</th>'
      +'<th>Description</th>'
      +'<th>Supervisor</th>'
      +'<th>Start<br>Date</th>'
      +'<th>Use<br>Phases</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'
          +'<input type="checkbox"'
          +' id="checked_'+x+'_'+indek+'"'
          +' name="checked_'+indek+'">'
        +'</td>'
        +'<td align="left">'+n+'</td>'
        +'<td align="left">'+d[x].job_id+'</td>'
        +'<td align="left">'+xHTML(d[x].name)+'</td>'
        +'<td align="left">'+xHTML(d[x].supervisor)+'</td>'
        +'<td align="center">'+tglWest(d[x].start_date)+'</td>'
        +'<td align="center">'+binerToBool(d[x].use_phases)+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

Jobs.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM jobs "
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND job_id = '"+d[i].job_id+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}


Jobs.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM jobs"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND job_id='"+getEV('job_id_'+indek)+"'"
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

Jobs.duplicate=(indek)=>{
  var id='copy_of '+document.getElementById('job_id_'+indek).value;
  document.getElementById('job_id_'+indek).disabled=false;
  document.getElementById('job_id_'+indek).value=id;
  document.getElementById('job_id_'+indek).focus();
}

Jobs.endPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Jobs.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Jobs.properties(indek);})
  }
}





// eof: 709;711;780;784;803;817;847;856;853;875;
