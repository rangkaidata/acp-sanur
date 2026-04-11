/*
 * name: budiono;
 * code: 52;
 * path: /accounting/inventory/unbuilds.js;
 * ---------------------------------------;
 * date: oct 13, 09:40, fri-2023; new;
 * edit: oct-13, 09:47, fri-2023; xHTML;
 * edit: dec-15, 14:27, fri-2023; add location_id auto 
 * -----------------------------; happy new year 2024;
 * edit: jan-13, 10:23, sat-2024; re-write w class;
 * edit: jul-09, 12:24, tue-2024; r7;
 * edit: aug-06, 12:47, tue-2024; r11;
 * edit: sep-25, 14:28, wed-2024; r19;
 * edit: nov-26, 15:53, tue-2024; #27; add locker();
 * edit: dec-02, 15:02, mon-2024; #27;
 * edit: dec-27, 20:42, fri-2024; #32; properti+duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-23, 21:40, sun-2025; #41; file_id;
 * edit: mar-13, 10:41, thu-2025; #43; deep-folder;
 * edit: mar-26, 16:38, wed-2025; #45; ctables;cstructure;
 * edit: aug-18, 18:00, mon-2025; #68; date obj;
 * edit: oct-16, 06:45, thu-2025; #80; relation_vobj;
 * edit: nov-24, 11:54, mon-2025; #81; remove location_id+inventory account;
 */ 
 
'use strict';

var Unbuilds={};

Unbuilds.table_name='unbuilds';
Unbuilds.form=new ActionForm2(Unbuilds);
Unbuilds.grid=new Grid(Unbuilds);
Unbuilds.bom=new BomLook(Unbuilds);
Unbuilds.location=new LocationLook(Unbuilds);
Unbuilds.employee=new SupervisorLook(Unbuilds);
Unbuilds.item=new ItemLook(Unbuilds);

Unbuilds.show=(karcis)=>{

  karcis.modul=Unbuilds.table_name;
//  karcis.child_free=false;
  karcis.have_child=true;

  var baru=exist(karcis);
  if(baru==-1){
    var newTxs=new BingkaiUtama(karcis);
    var indek=newTxs.show();
    getCompanyID(indek);
    getPath2(indek,(h)=>{
      mkdir(indek,h.folder,()=>{
        Unbuilds.form.modePaging(indek);
      });
    });
  }else{
    show(baru);
  }
}
//-----------------------------PAGING---------------------------------//
Unbuilds.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM unbuilds"
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

Unbuilds.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Unbuilds.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT unbuild_no,date,"
        +" item_id,item_name,quantity,"
        +" user_name,date_modified"
        +" FROM unbuilds"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY date,unbuild_no"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Unbuilds.readShow(indek);
    });
  })
}

Unbuilds.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
  +content.title(indek)
  +content.message(indek)
  +TotalPagingLimit(indek)
  +'<table border=1>'
    +'<tr>'
    +'<th colspan="2">Unbuild No.</th>'
    +'<th>Date</th>'
    +'<th>Item Name</th>'
    +'<th>Qty Unbuild</th>'
    +'<th>User</th>'
    +'<th>Modified</th>'
    +'<th colspan="3">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    var x;
    for (x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].unbuild_no+'</td>'
        +'<td align="left">'+tglWest(d[x].date)+'</td>'
        +'<td align="left">'+xHTML(d[x].item_name)+'</td>'
        +'<td align="center">'+d[x].quantity+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button" '
          +' id="btn_change"'
          +' onclick="Unbuilds.formUpdate(\''+indek+'\''
          +',\''+d[x].unbuild_no+'\''
          +',\''+d[x].item_id+'\');">'
          +'</button>'
        +'</td>'
        +'<td align="center">'
          +'<button type="button" '
          +' id="btn_delete" '
          +' onclick="Unbuilds.formDelete(\''+indek+'\''
          +',\''+d[x].unbuild_no+'\''
          +',\''+d[x].item_id+'\');">'
          +'</button>'
        +'</td>'
        +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }

  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Unbuilds.form.addPagingFn(indek);
}
//-------------------------FORM ENTRY---------------------------------//
Unbuilds.formEntry=(indek,metode)=>{
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
          +'<li><label>Item ID</label>'
            +'<input type="text" size="9"'
              +' id="item_id_'+indek+'" '
              +' onchange="Unbuilds.getBom(\''+indek+'\');">'
            
            +'<button type="button" id="btn_find" '
              +' onclick="Unbuilds.bom.getPaging(\''+indek+'\''
              +',\'item_id_'+indek+'\',-1)">'
            +'</button>'        
            
            +'<input type="text"'
              +' id="item_name_'+indek+'" disabled>'
          +'</li>'
            
          +'<li><label>Quantity:</label>'
            +'<input type="text" size="9"'
              +' style="text-align:center;"'
              +' id="unbuild_qty_'+indek+'" '
              +' onchange="Unbuilds.setCell(\''+indek+'\')">'
          +'</li>'
        +'</ul>'
      +'</div>'

      +'<div>'
        +'<ul>'
          +'<li><label>Date:</label>'
            +'<input type="date" '
              +' id="unbuild_date_'+indek+'"'
              +' onblur="dateFakeShow('+indek+',\'unbuild_date\')"'
              +' style="display:none;">'
            +'<input type="text" '
              +'id="unbuild_date_fake_'+indek+'"'
              +' onfocus="dateRealShow('+indek+',\'unbuild_date\')"'
              +' size="9">'
          +'</li>'
            
          +'<li><label>Unbuild No.:</label>'
            +'<input type="text" size="9"'
              +' id="unbuild_no_'+indek+'">'
          +'</li>'
        +'</ul>'
      +'</div>'
    +'</div>'
    
    +'<details open>'
      +'<summary>Details</summary>'
      +'<div id="unbuild_detail_'+indek+'"'
      +' style="width:100%;overflow:auto;">bom detail</div>'
    +'</details>'
    
    +'<ul>'
    +'<li><label>Supervisor:</label>'
      +'<input type="text" size="9"'
      +' id="employee_id_'+indek+'"'
      +' onchange="Unbuilds.getSupervisor(\''+indek+'\')">'
      
      +'<button type="button" id="btn_find" '
      +' onclick="Unbuilds.employee.getPaging(\''+indek+'\''
      +',\'employee_id_'+indek+'\',-1)"></button>'
      
      +'<input type="text" id="employee_name_'+indek+'" disabled>'
      +'</li>'

    +'<li><label>Reason:</label>'
      +'<input type="text" id="unbuild_note_'+indek+'" size="50%"></li>'
    
    +'</ul>'
    
    +'</form>'
    +'</div>';
  content.html(indek,html);
  statusbar.ready(indek);
  
  document.getElementById('item_id_'+indek).focus();
  document.getElementById('unbuild_date_'+indek).value=tglSekarang();
  document.getElementById('unbuild_date_fake_'+indek).value=tglWest(tglSekarang());
  
  Unbuilds.setRows(indek,[]);
}
//----------------------------GRID------------------------------------//
Unbuilds.setRows=(indek,isi)=>{
  if(isi===undefined) isi=[];
  
  var panjang=isi.length;
  var html=Unbuilds.tableHead(indek);
  var qty_required=0;
  var qty_unbuild=getEV('unbuild_qty_'+indek);
  
  // convert to number
  if(isNaN(Number(qty_unbuild)))qty_unbuild=0;

  bingkai[indek].isiTabel=isi;
  
  for (var i=0;i<panjang;i++){
    qty_required=Number(isi[i].qty_needed)*qty_unbuild;

    html+='<tr>'
      +'<td align="center">'+(i+1)+'</td>'
      
      +'<td>'+isi[i].item_id+'</td>'
      +'<td>'+xHTML(isi[i].item_name)+'</td>'
      +'<td align="center">'+isi[i].qty_needed+'</td>'
      +'<td align="center">'+qty_required+'</td>'
      +'</td>'
      +'</tr>';
  }
  html+=Unbuilds.tableFoot(indek);
  var budi = JSON.stringify(isi);
  document.getElementById('unbuild_detail_'+indek).innerHTML=html;
  
  if(panjang==0) Unbuilds.grid.addRow(indek,0,[]);
}

Unbuilds.tableHead=function(indek){
  return '<table>'
    +'<thead>'
    +'<tr>'
    +'<th>No.</th>'
    +'<th>Item ID</th>'
    +'<th>Item Name</th>'
    +'<th>Qty Needed</th>'
    +'<th>Qty Required</th>'
    +'</tr>'
    +'</thead>';
}

Unbuilds.tableFoot=function(indek){
  return '<tfoot>'
    +'<tr>'
    +'<td>&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

Unbuilds.newRow=(newBasket)=>{    
  var myItem={};
  myItem.row_id=newBasket.length+1;
  myItem.item_id="";
  myItem.item_name="";
  myItem.qty_needed=0;
  myItem.qty_required=0;
  newBasket.push(myItem);
}

Unbuilds.setCell=function(indek){
  var isi=bingkai[indek].isiTabel;
  var baru = [];
  var isiEdit = {};
  var qty_unbuild=getEV('unbuild_qty_'+indek);
  if(isNaN(Number(qty_unbuild)))qty_unbuild=0;
  
  for (var i=0;i<isi.length; i++){
    isiEdit = isi[i];
    if(isNaN(Number(isi[i].qty_needed))) isi[i].qty_needed=0;
    // calculate
    isiEdit.qty_required=isi[i].qty_needed*qty_unbuild;
    baru.push(isiEdit);
  }
  
  bingkai[indek].isiTabel=baru;
  Unbuilds.setRows(indek,baru);
}
//-----------------------------SET/GET--------------------------------//

Unbuilds.setBom=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var id_baris=bingkai[indek].id_baris;

  setEV(id_kolom, data.item_id);
  setEV('item_name_'+indek, data.item_name);

  Unbuilds.getBom(indek);
}

Unbuilds.getBom=(indek)=>{
  setEV('item_name_'+indek, txt_undefined);

  Unbuilds.bom.getOne(indek,getEV('item_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count!=0){
      var d=objectOne(paket.fields,paket.data);
      setEV('item_name_'+indek, d.item_name);
      Unbuilds.setRows(indek, JSON.parse(d.detail) );
    }else{
      Unbuilds.setRows(indek,[]);
    }
    Unbuilds.getItem(indek);
  });
}

Unbuilds.getItem=(indek)=>{
  Unbuilds.item.getOne(indek, 
  getEV('item_id_'+indek), 
  (paket)=>{
    if(paket.err.id==0 && paket.count!=0){
      var d=objectOne(paket.fields,paket.data);
      setEV('item_name_'+indek, d.name);
    }
  });
}

Unbuilds.setSupervisor=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.employee_id);
  Unbuilds.getSupervisor(indek);
}

Unbuilds.getSupervisor=(indek)=>{
  setEV('employee_name_'+indek, txt_undefined);
  Unbuilds.employee.getOne(indek, getEV('employee_id_'+indek),
  (paket)=>{
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('employee_name_'+indek,d.name);
    }
  });
}

//--------------------------------CREATE------------------------------//

Unbuilds.createExecute=(indek)=>{

  db.execute(indek,{
    query:"INSERT INTO unbuilds "
    +"(admin_name,company_id,item_id,quantity,date,unbuild_no"
    +",employee_id, reason)"
    +" VALUES "
    +"('"+bingkai[indek].admin.name+"'"
    +",'"+bingkai[indek].company.id+"'"
    +",'"+getEV("item_id_"+indek)+"'"
    +",'"+getEV("unbuild_qty_"+indek )+"'"
    +",'"+getEV("unbuild_date_"+indek)+"'"
    +",'"+getEV("unbuild_no_"+indek)+"'"
    +",'"+getEV("employee_id_"+indek)+"'"
    +",'"+getEV("unbuild_note_"+indek)+"'"
    +")"
  });
}
//--------------------------------EDIT--------------------------------//
Unbuilds.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
      +" FROM unbuilds "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND item_id='"+bingkai[indek].item_id+"' "
      +" AND unbuild_no='"+bingkai[indek].unbuild_no+"'"
  },(paket)=>{
    if (paket.err.id==0 && paket.count!=0){
      var d=objectOne(paket.fields,paket.data);
      setEV('unbuild_no_'+indek, d.unbuild_no);
      setEV('unbuild_date_'+indek, d.date);
      setEV('unbuild_date_fake_'+indek, tglWest(d.date));
      setEV('unbuild_qty_'+indek, d.quantity);
      
      setEV('item_id_'+indek, d.item_id);
      setEV('item_name_'+indek, d.item_name);
      
      setEV('unbuild_note_'+indek, d.reason);
      setEV('employee_id_'+indek, d.employee_id);
      setEV('employee_name_'+indek, d.employee_name);
      Unbuilds.setRows(indek, JSON.parse(d.detail));
      message.none(indek);
    }
    return callback();
  });
}

Unbuilds.formUpdate=(indek,unbuild_no,item_id)=>{
  bingkai[indek].unbuild_no=unbuild_no;
  bingkai[indek].item_id=item_id;
  Unbuilds.form.modeUpdate(indek);
}

Unbuilds.updateExecute=(indek)=>{
  var detail=JSON.stringify(bingkai[indek].isiTabel);
  
  db.execute(indek,{
    query:"UPDATE unbuilds "
      +" SET unbuild_no='"+getEV("unbuild_no_"+indek)+"', "
      +" date='"+getEV("unbuild_date_"+indek)+"', "
      +" item_id='"+getEV("item_id_"+indek)+"', "
      +" quantity='"+getEV("unbuild_qty_"+indek)+"', "
      +" detail='"+ detail +"',"
      +" employee_id='"+getEV("employee_id_"+indek)+"', "
      +" reason='"+getEV("unbuild_note_"+indek)+"' "

      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND item_id='"+bingkai[indek].item_id+"' "
      +" AND unbuild_no='"+bingkai[indek].unbuild_no+"' "
  },(p)=>{
    if(p.err.id==0) Unbuilds.endPath(indek);
  });
}

Unbuilds.formDelete=(indek,unbuild_no,item_id)=>{
  bingkai[indek].unbuild_no=unbuild_no;
  bingkai[indek].item_id=item_id;
  Unbuilds.form.modeDelete(indek);
}

Unbuilds.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM unbuilds"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND item_id='"+bingkai[indek].item_id+"' "
      +" AND unbuild_no='"+bingkai[indek].unbuild_no+"' "
  },(p)=>{
    if(p.err.id==0) Unbuilds.endPath(indek);
  });
}
//--------------------------------SEARCH------------------------------//
Unbuilds.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM unbuilds "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND unbuild_no LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Unbuilds.search=(indek)=>{
  Unbuilds.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT item_id,unbuild_no,"
        +" date,item_name,quantity,"
        +" user_name,date_modified"
        +" FROM unbuilds"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND unbuild_no LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR item_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Unbuilds.readShow(indek);
    });
  });
}
//--------------------------------EXPORT------------------------------//
Unbuilds.exportExecute=(indek)=>{
  var table_name=Unbuilds.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}
//--------------------------------IMPORT------------------------------//
Unbuilds.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;
  var i;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO unbuilds"
      +"(admin_name,company_id,item_id,quantity,date,unbuild_no"
      +",employee_id,reason)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+d[i][1]+"'" // item_id
      +",'"+d[i][2]+"'" // qty
      +",'"+d[i][3]+"'" // date
      +",'"+d[i][4]+"'" // unbuild_no
      +",'"+d[i][5]+"'" // employee
      +",'"+d[i][6]+"'" // reason 
      +")"
    },(paket)=>{  
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}
//------------------------SELECT PAGING-------------------------------//
Unbuilds.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT unbuild_no,date,"
      +" item_id,item_name,quantity,"
      +" user_name,date_modified"
      +" FROM unbuilds"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date, unbuild_no"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Unbuilds.selectShow(indek);
  });
}

Unbuilds.selectShow=(indek)=>{
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
    +'<th colspan="2">Unbuild No.</th>'
    +'<th>Date</th>'
    +'<th>Item Name</th>'
    +'<th>Qty Unbuild</th>'
    +'<th>User</th>'
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
        +'<td align="left">'+d[x].unbuild_no+'</td>'
        +'<td align="left">'+tglWest(d[x].date)+'</td>'
        +'<td align="left">'+xHTML(d[x].item_name)+'</td>'
        +'<td align="center">'+d[x].quantity+'</td>'
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
//--------------------------DELETE ALL--------------------------------//
Unbuilds.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM unbuilds "
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND unbuild_no='"+d[i].unbuild_no+"' "
          +" AND item_id='"+d[i].item_id+"' "
      });
    }
  }
  db.deleteMany(indek,a);
} 

Unbuilds.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM unbuilds"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND item_id='"+getEV('item_id_'+indek)+"'"
      +" AND unbuild_no='"+getEV('unbuild_no_'+indek)+"'"
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

Unbuilds.duplicate=(indek)=>{
  var id='copy_of '+document.getElementById('unbuild_no_'+indek).value;
  document.getElementById('unbuild_no_'+indek).value=id;
  document.getElementById('unbuild_no_'+indek).focus();
  document.getElementById('unbuild_no_'+indek).disabled=false;
}

Unbuilds.endPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Unbuilds.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Unbuilds.properties(indek);})
  }
}




//eof: 517;492;605;708;769;749;757;765;
