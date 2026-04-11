/*
 * name: budiono;
 * code: G5;
 * path: /accounting/inventory/adjustments.js;
 * ------------------------------------------;
 * date: oct-13, 17:04, fri-2023; new;
 * -----------------------------; happy new year 2024;
 * edit: jan-13, 14:43, sat-2024; re-write w class; 
 * edit: jul-11, 12:25, thu-2024; r8;
 * edit: aug-07, 14:38, wed-2024; r11;
 * edit: sep-25, 20:27, wed-2024; r19;
 * edit: oct-08, 17:55, tue-2024; #20;
 * edit: nov-26, 16:50, tue-2024; #27 add locker();
 * edit: dec-02, 15:26, mon-2024; #27; cancel lock, ganti properties;
 * edit: dec-28, 11:00, sat-2024; #32; properties+duplicate; 
 * -----------------------------; happy new year 2025;
 * edit: feb-24, 12:03, mon-2025; #41; file_id;
 * edit: mar-13, 11:44, thu-2025; #43; deep-folder;
 * edit: mar-22, 16:48, wed-2025; #45; ctables;cstructure;
 * edit: mar-26, 21:42, wed-2025; #45; 
 * edit: apr-24, 22:19, thu-2025; #50; export to csv;
 * edit: aug-18, 20:02, mon-2025; #68; 
 * edit: nov-25, 11:21, mon-2025; #82; 
 */ 
 
'use strict';

var Adjustments={}
Adjustments.table_name='adjustments';
Adjustments.form=new ActionForm2(Adjustments);
Adjustments.grid=new Grid(Adjustments);
Adjustments.item=new ItemLook(Adjustments);
Adjustments.account=new AccountLook(Adjustments);
Adjustments.job=new JobLook(Adjustments);
Adjustments.employee=new SupervisorLook(Adjustments);

Adjustments.show=(karcis)=>{
  karcis.modul=Adjustments.table_name;
  karcis.have_child=true;
  
  var baru=exist(karcis);
  if(baru==-1){
    var newTxs=new BingkaiUtama(karcis);
    var indek=newTxs.show();
    getCompanyID(indek);
    getPath2(indek,(h)=>{
      mkdir(indek,h.folder,()=>{
        Adjustments.form.modePaging(indek);
      });
    });
  }else{
    show(baru);
  }
}
//--------------------------READ-PAGING-------------------------------//
Adjustments.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM adjustments"
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

Adjustments.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Adjustments.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT date,adjustment_no,quantity,"
        +" user_name,date_modified"
        +" FROM adjustments"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY date,adjustment_no"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Adjustments.readShow(indek);
    });
  })
}

Adjustments.readShow=(indek)=>{
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
        +'<th>Adjustment #</th>'
        +'<th>Amount</th>'
        +'<th>User</th>'
        +'<th>Modified</th>'
        +'<th colspan="2">Action</th>'
      +'</tr>';

  if (p.err.id===0){
    var x;
    for (x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="center">'+tglWest(d[x].date)+'</td>'
        +'<td align="left">'+d[x].adjustment_no+'</td>'
        +'<td align="right">'+d[x].quantity+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button"'
          +' id="btn_change" '
          +' onclick="Adjustments.formUpdate(\''+indek+'\''
          +',\''+d[x].adjustment_no+'\''
          +');"></button></td>'
          
        +'<td align="center">'
          +'<button type="button" '
          +' id="btn_delete" '
          +' onclick="Adjustments.formDelete(\''+indek+'\''
          +',\''+d[x].adjustment_no+'\''
          +');"></button></td>'
        +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Adjustments.form.addPagingFn(indek);
}
//-------------------------FORM-ENTRY---------------------------------//
Adjustments.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    +'<div style="display:grid;'
      +'grid-template-columns:repeat(2,1fr);'
      +'padding-bottom:10px;">'
      
      +'<div>'
        +'<ul>'
          +'<li><label>Adjustment #<i class="required">*</i></label>'
            +'<input type="text" size="9"'
            +' id="adjustment_no_'+indek+'">'
          +'</li>'
          +'<li>'
            +'<label>Date</label>'
            +'<input type="date" '
              +' id="adjustment_date_'+indek+'"'
              +' onblur="dateFakeShow('+indek+',\'adjustment_date\')"'
              +' style="display:none;">'
            +'<input type="text" '
              +' id="adjustment_date_fake_'+indek+'"'
              +' onfocus="dateRealShow('+indek+',\'adjustment_date\')"'
              +' size="9">'
          +'</li>'
        +'</ul>'
      +'</div>'
      
      +'<div>~f2</div>'
      
    +'</div>'

    +'<details open>'
      +'<summary>Adjustment Details</summary>'
      +'<div id="adjustment_detail_'+indek+'"'
      +' style="width:100%;overflow:auto;">Move Details</div>'
    +'</details>'

    +'<ul>'
      +'<li>'
        +'<label>Employee ID</label>'
        +'<input type="text" size="12"'
          +' onchange="Adjustments.getSupervisor(\''+indek+'\''
          +',\'employee_id_'+indek+'\')"'
          +' id="employee_id_'+indek+'">'
        +'<button type="button" id="btn_find" '
          +' onclick="Adjustments.employee.getPaging(\''+indek+'\''
          +',\'employee_id_'+indek+'\',-1)">'
          +'</button>'
        +'<input type="text" '
          +' id="employee_name_'+indek+'" disabled>'
      +'</li>'
      +'<li><label>Reason</label>'
        +'<input type="text"'
        +' id="adjustment_note_'+indek+'"'
        +' size="50">'
      +'</li>'
    +'</ul>'

    +'</form>'
    +'<p><i class="required">* Required</i></p>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);

  document.getElementById('adjustment_no_'+indek).focus();
  document.getElementById('adjustment_date_'+indek).value=tglSekarang();
  document.getElementById('adjustment_date_fake_'+indek).value=tglWest(tglSekarang());

  Adjustments.setRows(indek,[]);
}
//-------------------------FORM-ENTRY-GRID----------------------------//
Adjustments.setRows=(indek,isi)=>{
  if(isi===undefined) isi=[];
  var panjang=isi.length;
  var html=Adjustments.tableHead(indek);
  
  bingkai[indek].adjustment_detail=isi;
  for (var i=0;i<panjang;i++){
    html+='<tr>'
      +'<td align="center">'+(i+1)+'</td>'

      +'<td style="margin:0;padding:0">'
        +'<input type="text" id="item_id_'+i+'_'+indek+'" '
        +' value="'+isi[i].item_id+'" size="15"'
        +'onchange="Adjustments.setCell(\''+indek+'\''
        +',\'item_id_'+i+'_'+indek+'\')" '
        +' onfocus="this.select()"></td>'

      +'<td><button type="button" id="btn_find" '
      +' onclick="Adjustments.item.getPaging(\''+indek+'\''
      +',\'item_id_'+i+'_'+indek+'\',\''+i+'\')">'
      +'</button></td>'
      
      +'<td style="padding:0;margin:0;">'
        +'<input type="text" id="item_name_'+i+'_'+indek+'" '
        +' value="'+isi[i].item_name+'" disabled></td>'
/*        
    +'<td align="center" style="padding:0;margin:0;" >'
      +'<input type="text"'
      +' id="cogs_account_id_'+i+'_'+indek+'" '
      +' value="'+isi[i].cogs_account_id+'"'
      +' onchange="Adjustments.setCell(\''+indek+'\''
      +',\'cogs_account_id_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()" '
      +' style="text-align:center"'
      +' size="8"></td>'
      
      +'<td>'
        +'<button type="button"'
          +' id="btn_find" '
          +' onclick="Adjustments.account.getPaging(\''+indek+'\''
          +',\'cogs_account_id_'+i+'_'+indek+'\''
          +',\''+i+'\''
          +',\''+CLASS_COST_OF_SALES+'\');">'
        
        +'</button>'
        +'</td>'
*/
      +'<td  align="center" style="padding:0;margin:0;">'
        +'<input type="text" id="unit_cost_'+i+'_'+indek+'" '
        +' value="'+isi[i].unit_cost+'" size="8" '
        +' style="text-align:center"'
        +' onchange="Adjustments.setCell(\''+indek+'\''
        +',\'unit_cost_'+i+'_'+indek+'\')" '
        +' onfocus="this.select()" ></td>'
              
      +'<td  align="center" style="padding:0;margin:0;">'
        +'<input type="text" id="qty_adjust_'+i+'_'+indek+'" '
        +' value="'+isi[i].qty_adjust+'" size="8" '
        +' style="text-align:center"'
        +' onchange="Adjustments.setCell(\''+indek+'\''
        +',\'qty_adjust_'+i+'_'+indek+'\')" '
        +' onfocus="this.select()" ></td>'
        
      +'<td style="margin:0;padding:0">'
        +'<input type="text" id="job_phase_cost_'+i+'_'+indek+'" '
        +' value="'+isi[i].job_phase_cost+'" size="8"'
        +'onchange="Adjustments.setCell(\''+indek+'\''
        +',\'job_phase_cost_'+i+'_'+indek+'\')" '
        +' onfocus="this.select()"></td>'

      +'<td><button type="button" id="btn_find" '
        +' onclick="Adjustments.job.getPaging(\''+indek+'\''
        +',\'job_phase_cost_'+i+'_'+indek+'\',\''+i+'\')">'
        +'</button></td>'
      
      +'<td align="center">'
        +'<button type="button" id="btn_add" '
        +' onclick="Adjustments.addRow(\''+indek+'\','+i+')" >'
        +'</button>'
        
        +'<button type="button" id="btn_remove" '
        +' onclick="Adjustments.removeRow(\''+indek+'\','+i+')" >'
        +'</button>'
      +'</td>'
/*      
      +'<td style="display:none;">'
        +'<input type="text" '
        +' id="inventory_account_id_'+i+'_'+indek+'"'
        +' value="'+isi[i].inventory_account_id+'"'
        +' onchange="Adjustments.setCell(\''+indek+'\''
        +',\'inventory_account_id_'+i+'_'+indek+'\')" '
        +' disabled>'
        
        +'<input type="text" '
        +' id="cogs_account_id_'+i+'_'+indek+'"'
        +' value="'+isi[i].cogs_account_id+'"'
        +' onchange="Adjustments.setCell(\''+indek+'\''
        +',\'cogs_account_id_'+i+'_'+indek+'\')" '
        +' disabled>'
      +'</td>'
*/      
      +'</tr>';
  }
  html+=Adjustments.tableFoot(indek);
  var budi = JSON.stringify(isi);
  document.getElementById('adjustment_detail_'+indek).innerHTML=html;
  if(panjang==0)Adjustments.addRow(indek,0);
}

Adjustments.tableHead=(indek)=>{
  return '<table>'
    +'<thead>'
    +'<tr>'
    +'<th colspan=3>Item ID <i class="required">*</i></th>'
    +'<th>Description</th>'
//    +'<th colspan="2">COGS<br>Account ID</th>'
    +'<th>Unit<br>Cost <i class="required">*</i></th>'
    +'<th>Adjust<br>Quantity</th>'
    +'<th colspan=2>Job</th>'
    +'<th>Add/Rem</th>'
//    +'<th style="display:none;">account_id(hide)</th>'
    +'</tr>'
    +'</thead>';
}

Adjustments.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
    +'<td>#</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

Adjustments.addRow=(indek,baris)=>{
  Adjustments.grid.addRow(indek,baris,
    bingkai[indek].adjustment_detail);
}

Adjustments.newRow=(newBasket)=>{
  var myItem={};
  myItem.row_id=newBasket.length+1;
  myItem.item_id="";
  myItem.item_name="";
//  myItem.cogs_account_id="";
//  myItem.inventory_account_id="";
  myItem.unit_cost=0;
  myItem.qty_adjust=0;
  myItem.job_phase_cost="";
  newBasket.push(myItem);
}

Adjustments.removeRow=(indek,baris)=>{
  Adjustments.grid.removeRow(indek,baris,
    bingkai[indek].adjustment_detail);
}

Adjustments.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].adjustment_detail;
  var baru=[];
  var isiEdit={};

  for (var i=0;i<isi.length; i++){
    isiEdit=isi[i];
    if(id_kolom==('item_id_'+i+'_'+indek)){
      isiEdit.item_id=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
      Adjustments.getItem(indek,'item_id_'+i+'_'+indek,i);
    }
    else if(id_kolom==('item_name_'+i+'_'+indek)){
      isiEdit.item_name=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
    }
    else if(id_kolom==('unit_cost_'+i+'_'+indek)){
      isiEdit.unit_cost=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
    }
    else if(id_kolom==('qty_adjust_'+i+'_'+indek)){
      isiEdit.qty_adjust=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
    }
    else if(id_kolom==('job_phase_cost_'+i+'_'+indek)){
      isiEdit.job_phase_cost=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
    }
/*    
    else if(id_kolom==('inventory_account_id_'+i+'_'+indek)){
      isiEdit.inventory_account_id=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
    }
    else if(id_kolom==('cogs_account_id_'+i+'_'+indek)){
      isiEdit.cogs_account_id=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
    }
*/    
    else{
      baru.push(isi[i]);
    }
  }
  bingkai[indek].adjustment_detail=isi;
}
//-------------------------FORM-ENTRY-SET-GET-------------------------//

Adjustments.setItem=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var nama_kolom=bingkai[indek].nama_kolom;

  setEV(id_kolom, data.item_id);
  Adjustments.setCell(indek,id_kolom);
}

Adjustments.getItem=(indek,id_kolom,baris)=>{
  Adjustments.item.getOne(indek,
    document.getElementById(id_kolom).value,
  (paket)=>{
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('item_name_'+baris+'_'+indek, d.name);
      
      Adjustments.setCell(indek,'item_name_'+baris+'_'+indek);
    }
  });
}

Adjustments.setAccount=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var id_baris=bingkai[indek].id_baris;
  setEV(id_kolom, data.account_id);
  Adjustments.setCell(indek,id_kolom);  
}

Adjustments.setJob=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, data);
  Adjustments.setCell(indek,id_kolom);
}

Adjustments.setSupervisor=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.employee_id);
  Adjustments.getSupervisor(indek);
}

Adjustments.getSupervisor=(indek)=>{
  Adjustments.employee.getOne(indek,
  getEV('employee_id_'+indek),
  (paket)=>{
    setEV('employee_name_'+indek, txt_undefined);
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('employee_name_'+indek, d.name);      
    }
  });
}
//------------------------CREATE-DATA---------------------------------//
Adjustments.createExecute=(indek)=>{

  var detail=JSON.stringify(bingkai[indek].adjustment_detail);

  db.execute(indek,{
    query:"INSERT INTO adjustments"
    +"(admin_name,company_id,adjustment_no,date,detail"
    +",employee_id,reason)"
    +" VALUES "
    +"('"+bingkai[indek].admin.name+"'"
    +",'"+bingkai[indek].company.id+"'"
    +",'"+getEV("adjustment_no_"+indek)+"'"
    +",'"+getEV("adjustment_date_"+indek)+"'"
    +",'"+detail+"'"
    +",'"+getEV("employee_id_"+indek)+"'"
    +",'"+getEV("adjustment_note_"+indek)+"'"
    +")"
  });
}
//--------------------------EDIT-DATA---------------------------------//
Adjustments.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
      +" FROM adjustments"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND adjustment_no='"+bingkai[indek].adjustment_no+"'"
  },(paket)=>{
    if (paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('adjustment_no_'+indek, d.adjustment_no);
      setEV('adjustment_date_'+indek, d.date);
      setEV('adjustment_date_fake_'+indek, tglWest(d.date));
      setEV('employee_id_'+indek, d.employee_id);
      setEV('employee_name_'+indek, d.employee_name);
      setEV('adjustment_note_'+indek, d.reason);
      
      Adjustments.setRows(indek, JSON.parse (d.detail));
    }
    message.none(indek);
  });
  return callback();
}

Adjustments.formUpdate=(indek,adjustment_no)=>{
  bingkai[indek].adjustment_no=adjustment_no;
  Adjustments.form.modeUpdate(indek);
}

Adjustments.updateExecute=(indek)=>{
  
  var detail=JSON.stringify(bingkai[indek].adjustment_detail);
  
  db.execute(indek,{
    query:"UPDATE adjustments"
      +" SET adjustment_no='"+getEV("adjustment_no_"+indek)+"',"
      +" date='"+getEV("adjustment_date_"+indek)+"',"
      +" detail='"+detail+"',"
      +" employee_id='"+getEV("employee_id_"+indek)+"',"
      +" reason='"+getEV("adjustment_note_"+indek)+"'"

      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND adjustment_no='"+bingkai[indek].adjustment_no+"'"
  },(p)=>{
    if(p.err.id==0) Adjustments.endPath(indek);
  });
}

Adjustments.formDelete=(indek,adjustment_no)=>{
  bingkai[indek].adjustment_no=adjustment_no;
  Adjustments.form.modeDelete(indek);
}

Adjustments.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM adjustments "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND adjustment_no='"+bingkai[indek].adjustment_no+"'"
  },(p)=>{
    if(p.err.id==0) Adjustments.endPath(indek);
  });
}
//----------------------SEARCH-DATA-----------------------------------//
Adjustments.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM adjustments "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" OR adjustment_no LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Adjustments.search=(indek)=>{
  Adjustments.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT date,adjustment_no,quantity,"
        +" user_name,date_modified"
        +" FROM adjustments"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" OR adjustment_no LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Adjustments.readShow(indek);
    });
  });
}
//--------------------------EXPORT-DATA-------------------------------//
Adjustments.exportExecute=(indek)=>{
  var table_name=Adjustments.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}
//--------------------------IMPORT-DATA-------------------------------//
Adjustments.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;
  var i;
  var jok=0,jerr=0;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO adjustments"
      +"(admin_name,company_id,adjustment_no,date,detail"
      +",employee_id,reason)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+d[i][1]+"'"
      +",'"+d[i][2]+"'"
      +",'"+d[i][3]+"'"
      +",'"+d[i][4]+"'"
      +",'"+d[i][5]+"'"
      +")"
    },(paket)=>{  
      paket.err.id==0?jok++:jerr++;
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar2(indek,n,j,m,jok,jerr);
    });
  }
}

Adjustments.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT date,adjustment_no,quantity,"
      +" user_name,date_modified"
      +" FROM adjustments"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Adjustments.selectShow(indek);
  });
}

Adjustments.selectShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
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
      +'<th>Date</th>'
      +'<th>Adjustment #</th>'
      +'<th>Amount</th>'
      +'<th>User</th>'
      +'<th>Modified</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      html+='<tr>'
      +'<td align="center">'
        +'<input type="checkbox"'
        +' id="checked_'+x+'_'+indek+'"'
        +' name="checked_'+indek+'" >'
      +'</td>'
      +'<td align="center">'+tglWest(d[x].date)+'</td>'
      +'<td align="left">'+d[x].adjustment_no+'</td>'
      +'<td align="right">'+d[x].quantity+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}
 
Adjustments.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM adjustments"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND adjustment_no='"+d[i].adjustment_no+"'"
      });
    }
  }
  db.deleteMany(indek,a);
} 

Adjustments.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM adjustments"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND adjustment_no='"+bingkai[indek].adjustment_no+"'"
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

Adjustments.duplicate=(indek)=>{
  var id='copy_of '+document.getElementById('adjustment_no_'+indek).value;
  document.getElementById('adjustment_no_'+indek).value=id;
  document.getElementById('adjustment_no_'+indek).focus();
  document.getElementById('adjustment_no_'+indek).disabled=false;
}

Adjustments.endPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Adjustments.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Adjustments.properties(indek);})
  }
}





// eof: 664;718;730;803;782;790;798;
