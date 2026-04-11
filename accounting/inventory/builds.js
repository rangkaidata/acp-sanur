/*
 * auth: budiono;
 * code: 51;
 * path: /accounting/inventory/builds.js;
 * -------------------------------------; 
 * date: oct-12, 19:12, thu-2023; new;
 * edit: oct-13, 09:27, fri-2023; xHTML;
 * edit: dec-13, 16:30, wed-2023; location
 * -----------------------------; happy new year 2024;
 * edit: jan-12, 15:24, fri-2024; re-write w class;
 * edit: jun-21, 07:20, fri-2024; BasicSQL;
 * edit: jul-09, 12:24, tue-2024; r7;
 * edit: aug-05, 20:44, mon-2024; r11;
 * edit: sep-25, 11:27, wed-2024; r19;
 * edit: dec-02, 14:23, mon-2024; #27; add locker();
 * edit: dec-27, 16:12, fri-2024; #32; properties+duplicte;
 * -----------------------------; happy new year 2025;
 * edit: feb-23, 20:53; sun-2025; #41; file_id;
 * edit: mar-13, 10:19, thu-2025; #43; deep_folder;
 * edit: mar-26, 16:30, wed-2025; #45; ctables;cstructure;
 * edit: apr-24, 22:13, thu-2025; #50; can export to csv;
 * edit: aug-18, 17:52, mon-2025; #68; date obj;
 * edit: nov-24, 16:06, mon-2025; #82; remove location_id from builds;
 */ 
 
'use strict';

var Builds={}

Builds.table_name='builds';
Builds.form=new ActionForm2(Builds);
Builds.grid=new Grid(Builds);
Builds.bom=new BomLook(Builds);
Builds.employee=new SupervisorLook(Builds);
Builds.item=new ItemLook(Builds);

Builds.show=(karcis)=>{
  karcis.modul=Builds.table_name;
  karcis.have_child=true;

  var baru=exist(karcis);
  if(baru==-1){
    var newTxs=new BingkaiUtama(karcis);
    var indek=newTxs.show();
    getCompanyID(indek);
    getPath2(indek,(h)=>{
      mkdir(indek,h.folder,()=>{
        Builds.form.modePaging(indek);
      });
    });
  }else{
    show(baru);
  }
}

Builds.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM builds"
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
//-----------------------------PAGING---------------------------------//
Builds.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Builds.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT build_no,date,"
        +" item_id,item_name, quantity,"
        +" user_name,date_modified"
        +" FROM builds"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY date,build_no"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Builds.readShow(indek);
    });
  })
}

Builds.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
  +content.title(indek)
  +content.message(indek)
  +TotalPagingLimit(indek)
  +'<table border=1>'
    +'<tr>'
      +'<th colspan="2">Build No.</th>'
      +'<th>Date</th>'
      +'<th>Item Name</th>'
      +'<th>Qty Build</th>'
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
        +'<td align="left">'+d[x].build_no+'</td>'
        +'<td align="left">'+tglWest(d[x].date)+'</td>'
        +'<td align="left">'+xHTML(d[x].item_name)+'</td>'
        +'<td align="center">'+d[x].quantity+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button" '
          +' id="btn_change" onclick="Builds.formUpdate(\''+indek+'\''
          +',\''+d[x].build_no+'\''
          +',\''+d[x].item_id+'\');">'
          +'</button>'
        +'</td>'
        +'<td align="center">'
          +'<button type="button" '
          +' id="btn_delete" onclick="Builds.formDelete(\''+indek+'\''
          +',\''+d[x].build_no+'\''
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
  Builds.form.addPagingFn(indek);
}
//-------------------------FORM ENTRY---------------------------------//
Builds.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    +'<div style="display:grid;'
      +'grid-template-columns:repeat(2,1fr);'
      +'padding-bottom:10px;">'

      +'<div><ul>'

      +'<li><label>Item ID:</label>'
        +'<input type="text" size="15"'
        +' id="item_id_'+indek+'" '
        +' onchange="Builds.getBom(\''+indek+'\');">'
        
        +'<button type="button" id="btn_find" '
          +' onclick="Builds.bom.getPaging(\''+indek+'\''
          +',\'item_id_'+indek+'\',-1)">'
        +'</button>'        
        
        +'<input type="text" '
        +' id="item_name_'+indek+'" disabled>'
        +'</li>'

      +'<li><label>Quantity:</label>'
        +'<input type="text" size="9"'
        +' style="text-align:center;"'
        +' id="build_qty_'+indek+'" '
        +' onchange="Builds.setCell(\''+indek+'\')">'
        +'</li>'
      +'</ul></div>'

      +'<div><ul>'
        +'<li><label>Date:</label>'
          +'<input type="date"'
            +' id="build_date_'+indek+'"'
            +' onblur="dateFakeShow('+indek+',\'build_date\')"'
            +' style="display:none;">'
          +'<input type="text" '
            +' id="build_date_fake_'+indek+'"'
            +' onfocus="dateRealShow('+indek+',\'build_date\')"'
            +' size="9">'
        +'</li>'
          
        +'<li><label>Build No.:</label>'
          +'<input type="text" size="9"'
          +' id="build_no_'+indek+'">'
          +'</li>'
      
      +'</ul></div>'
    +'</div>'
    
    +'<details open>'
      +'<summary>Details</summary>'
      +'<div id="build_detail_'+indek+'"'
      +' style="width:100%;overflow:auto;">bom detail</div>'
    +'</details>'
    
    +'<ul>'
    +'<li><label>Supervisor:</label>'
      +'<input type="text" size="9"'
      +' id="employee_id_'+indek+'"'
      +' onchange="Builds.getSupervisor(\''+indek+'\')">'
      
      +'<button type="button" id="btn_find" '
      +' onclick="Builds.employee.getPaging(\''+indek+'\''
      +',\'employee_id_'+indek+'\',-1)"></button>'
      
      +'<input type="text" id="employee_name_'+indek+'" disabled>'
      +'</li>'

    +'<li><label>Reason:</label>'
      +'<input type="text" id="build_note_'+indek+'" size="50%"></li>'
    
    +'</ul>'
    
    +'</form>'
    +'</div>';
  content.html(indek,html);
  statusbar.ready(indek);
  
  document.getElementById('item_id_'+indek).focus();
  document.getElementById('build_date_'+indek).value=tglSekarang();
  document.getElementById('build_date_fake_'+indek).value=tglWest(tglSekarang());
  
  Builds.setRows(indek,[]);
}
//-----------------------------GRID-----------------------------------//
Builds.setRows=(indek,isi)=>{
  if(isi===undefined) isi=[];
  
  var panjang=isi.length;
  var html=Builds.tableHead(indek);
  var qty_required=0;
  var amount=0;

  bingkai[indek].build_detail=isi;
  
  for (var i=0;i<panjang;i++){
    qty_required=Number(isi[i].qty_needed)
      *Number(getEV('build_qty_'+indek))
    
    amount=Number(qty_required)*Number(isi[i].unit_cost);

    html+='<tr>'
      +'<td align="center">'+(i+1)+'</td>'
      
      +'<td>'+isi[i].item_id+'</td>'
      +'<td>'+xHTML(isi[i].item_name)+'</td>'
      +'<td align="center">'+isi[i].qty_needed+'</td>'
      +'<td align="center">'+qty_required+'</td>'
      +'</td>'
      +'</tr>';
  }
  html+=Builds.tableFoot(indek);
  var budi = JSON.stringify(isi);
  document.getElementById('build_detail_'+indek).innerHTML=html;
  
  if(panjang==0) Builds.grid.addRow(indek,0,isi);
}

Builds.tableHead=function(indek){
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

Builds.tableFoot=function(indek){
  return '<tfoot>'
    +'<tr>'
    +'<td>&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

Builds.newRow=(newBasket)=>{    
  var myItem={};
  myItem.row_id=newBasket.length+1;
  myItem.item_id="";
  myItem.item_name="";
  myItem.qty_needed=0;
  myItem.qty_required=0;
  newBasket.push(myItem);
}

Builds.setCell=function(indek){
  var isi=bingkai[indek].build_detail;
  var baru = [];
  var isiEdit = {};
  var txt=getEV('build_qty_'+indek);

  for (var i=0;i<isi.length; i++){
    isiEdit = isi[i];
    if(isNaN(txt))txt=0;
    isiEdit.qty_required=Number(isi[i].qty_needed)*Number(txt);
    baru.push(isiEdit);
  }
  
  bingkai[indek].build_detail=baru;
  Builds.setRows(indek,baru);
}
//------------------------SET/GET-------------------------------------//

Builds.setBom=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var id_baris=bingkai[indek].id_baris;

  setEV(id_kolom, data.item_id);
  setEV('item_name_'+indek, data.item_name);
  Builds.getBom(indek);
}

Builds.getBom=(indek)=>{
  Builds.bom.getOne(indek, getEV('item_id_'+indek), 
  (paket)=>{
    setEV('item_name_'+indek, txt_undefined);
    
    if(paket.err.id==0 && paket.count!=0){
      var d=objectOne(paket.fields,paket.data);
      setEV('item_name_'+indek, d.item_name);
      Builds.setRows(indek, JSON.parse(d.detail) );
    }else{
      Builds.setRows(indek,[]);
    }
  });
}

Builds.setSupervisor=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.employee_id);
  Builds.getSupervisor(indek);
}

Builds.getSupervisor=(indek)=>{
  Builds.employee.getOne(indek, getEV('employee_id_'+indek),
  (paket)=>{
    setEV('employee_name_'+indek, txt_undefined);
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('employee_name_'+indek, d.name);      
    }
  });
}
//--------------------------------CREATE------------------------------//
Builds.createExecute=(indek)=>{

  db.execute(indek,{
    query:"INSERT INTO builds"
      +"(admin_name,company_id,item_id,quantity,date,build_no"
      +",employee_id,reason)"
      +" VALUES"
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEV("item_id_"+indek)+"'"
      +",'"+getEV("build_qty_"+indek)+"'"
      +",'"+getEV("build_date_"+indek)+"'"
      +",'"+getEV("build_no_"+indek)+"'"
      +",'"+getEV("employee_id_"+indek)+"'"
      +",'"+getEV("build_note_"+indek)+"'"
      +")"
  });
}
//--------------------------------EDIT--------------------------------//
Builds.readOne=(indek,callback)=>{

  db.execute(indek,{
    query:"SELECT * "
      +" FROM builds "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND item_id='"+bingkai[indek].item_id+"' "
      +" AND build_no='"+bingkai[indek].build_no+"' "
  },(paket)=>{
    if (paket.err.id==0 && paket.count!=0){
      
      var d=objectOne(paket.fields,paket.data);
      setEV('build_no_'+indek, d.build_no);
      setEV('build_date_'+indek, d.date);
      setEV('build_date_fake_'+indek, tglWest(d.date));
      setEV('build_qty_'+indek, d.quantity);
      setEV('item_id_'+indek, d.item_id);
      setEV('item_name_'+indek, d.item_name);
      setEV('build_note_'+indek, d.reason);
      setEV('employee_id_'+indek, d.employee_id);
      setEV('employee_name_'+indek, d.employee_name);
      Builds.setRows(indek, JSON.parse(d.detail) );
      message.none(indek);
    }
    return callback();
  });
}

Builds.formUpdate=(indek,build_no,item_id)=>{
  bingkai[indek].build_no=build_no;
  bingkai[indek].item_id=item_id;
  Builds.form.modeUpdate(indek);
}

Builds.updateExecute=(indek)=>{
  var detail=JSON.stringify(bingkai[indek].build_detail);
  
  db.execute(indek,{
    query:"UPDATE builds"
      +" SET build_no='"+getEV("build_no_"+indek)+"',"
      +" date='"+getEV("build_date_"+indek)+"',"
      +" item_id='"+getEV("item_id_"+indek)+"',"
      +" quantity='"+getEV("build_qty_"+indek)+"',"
      +" employee_id='"+getEV("employee_id_"+indek)+"',"
      +" reason='"+getEV("build_note_"+indek)+"'"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND item_id='"+bingkai[indek].item_id+"'"
      +" AND build_no='"+bingkai[indek].build_no+"'"
  },(p)=>{
    if(p.err.id==0) Builds.endPath( indek );
  });
}

Builds.formDelete=(indek,build_no,item_id)=>{
  bingkai[indek].build_no=build_no;
  bingkai[indek].item_id=item_id;
  Builds.form.modeDelete(indek);
}

Builds.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM builds"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND item_id='"+bingkai[indek].item_id+"' "
      +" AND build_no='"+bingkai[indek].build_no+"' "
  },(p)=>{
    if(p.err.id==0) Builds.endPath( indek );
  });
}
//--------------------------------SEARCH------------------------------//
Builds.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM builds "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND build_no LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR item_name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Builds.search=(indek)=>{
  Builds.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT build_no,date,"
        +" item_id,item_name,quantity,"
        +" user_name,date_modified"
        +" FROM builds"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND build_no LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR item_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Builds.readShow(indek);
    });
  });
}
//--------------------------------EXPORT------------------------------//
Builds.exportExecute=(indek)=>{
  var table_name=Builds.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}
//--------------------------------IMPORT------------------------------//
Builds.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO builds "
      +"(admin_name,company_id,item_id,quantity,date,build_no"
      +",employee_id,reason)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+d[i][1]+"'" //item_id
      +",'"+d[i][2]+"'" //quantity
      +",'"+d[i][3]+"'" //date
      +",'"+d[i][4]+"'" //build_no
      
      +",'"+d[i][5]+"'" // employee_id
      +",'"+d[i][6]+"'" // reason
      +")"
    },(paket)=>{  
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

Builds.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT build_no,date,"
      +" item_id,item_name,quantity,"
      +" user_name,date_modified"
      +" FROM builds"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY date,build_no"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Builds.selectShow(indek);
  });
}

Builds.selectShow=(indek)=>{
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
      +'<th colspan="2">Build No.</th>'
      +'<th>Date</th>'
      +'<th>Item Name</th>'
      +'<th>Qty Build</th>'
      +'<th>User</th>'
      +'<th colspan="2">Modified</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'
          +'<input type="checkbox"'
          +' id="checked_'+x+'_'+indek+'"'
          +' name="checked_'+indek+'" >'
        +'</td>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].build_no+'</td>'
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

Builds.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM builds "
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND build_no='"+d[i].build_no+"' "
          +" AND item_id='"+d[i].item_id+"' "
      });
    }
  }
  db.deleteMany(indek,a);
}

Builds.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM builds"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND item_id='"+bingkai[indek].item_id+"'"
      +" AND build_no='"+getEV('build_no_'+indek)+"'"
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

Builds.duplicate=(indek)=>{
  var id='copy_of '+document.getElementById('build_no_'+indek).value;
  document.getElementById('build_no_'+indek).value=id;
  document.getElementById('build_no_'+indek).focus();
  document.getElementById('build_no_'+indek).disabled=false;
}

Builds.endPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Builds.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Builds.properties(indek);})
  }
}




// eof: 542;582;711;789;748;755;752;749;
