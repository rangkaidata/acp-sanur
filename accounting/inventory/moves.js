/*
 * auth: budiono;
 * code: G4;
 * path: /accounting/inventory/moves.js;
 * ------------------------------------;
 * date: oct-13, 15:08, fri-2023; new;
 * -----------------------------; happy new year 2024;
 * edit: jan-13, 11:22, sat-2024; re-write w class;
 * edit: jul-10, 16:23, wed-2024; r7;
 * edit: aug-07, 11:07, wed-2024; r11;
 * edit: sep-25, 16:11, wed-2024; r19;
 * edit: nov-26, 16:23, tue-2024; #27; add locker();
 * edit: dec-02, 15:15, mon-2024; #27; 
 * edit: dec-28, 09:48, sat-2024; #32; properties+duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-24, 11:27, mon-2025; #41; file_id;
 * edit: mar-13, 11:15, thu-2025; #43; deep-folder;
 * edit: mar-26. 21:46, wed-2025; #45; ctables;cstructure;
 * edit: aug-18, 19:59, mon-2025; #68; date obj;
 * edit: oct-16, 15:08, thu-2025; #80; v
 * edit: nov-24, 20:31, mon-2025; #82; 
 */ 

'use strict';

var Moves={}

Moves.table_name='moves';
Moves.form=new ActionForm2(Moves);
Moves.grid=new Grid(Moves);
Moves.location=new LocationLook(Moves);
Moves.employee=new SupervisorLook(Moves);
Moves.item=new StockItemLook(Moves);

Moves.show=(tiket)=>{
  tiket.modul=Moves.table_name;

  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    getCompanyID(indek);
    getPath2(indek,(h)=>{
      mkdir(indek,h.folder,()=>{
        Moves.form.modePaging(indek);
      });
    });
  }else{
    show(baru);
  }
}

Moves.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM moves "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      console.log(paket.data);
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Moves.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Moves.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT location_id,to_location_id,"
        +" date,move_no,"
        +" user_name,date_modified"
        +" FROM moves"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY date, move_no "
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Moves.readShow(indek);
    });
  })
}

Moves.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
  +content.title(indek)
  +content.message(indek)
  +TotalPagingLimit(indek)

  +'<table border=1>'
    +'<tr>'
      +'<th colspan="2">From</th>'
      +'<th>To</th>'
      +'<th>Date</th>'
      +'<th>Move#</th>'
      +'<th>User</th>'
      +'<th>Modified</th>'
      +'<th colspan="3">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].location_id+'</td>'
        +'<td align="left">'+d[x].to_location_id+'</td>'
        +'<td align="left">'+tglWest(d[x].date)+'</td>'
        +'<td align="left">'+d[x].move_no+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button" '
          +' id="btn_change" '
          +' onclick="Moves.formUpdate(\''+indek+'\''
          +',\''+d[x].move_no+'\''
          +',\''+d[x].location_id+'\');">'
          +'</button>'
        +'</td>'
        +'<td align="center">'
          +'<button type="button" '
          +' id="btn_delete" '
          +' onclick="Moves.formDelete(\''+indek+'\''
          +',\''+d[x].move_no+'\''
          +',\''+d[x].location_id+'\');">'
          +'</button>'
        +'</td>'
        +'<td align="center">'+n+'</td>'
        +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  if(READ_PAGING) Moves.form.addPagingFn(indek);
}

Moves.formEntry=(indek,metode)=>{
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
          +'<li>'
            +'<label>To location ID:</label>'
            +'<input type="text" id="to_location_id_'+indek+'"'
            +' onchange="Moves.getLocation(\''+indek+'\''
            +',\'to_location_id_'+indek+'\',\'to\')" '
            +' size="9">'
            
            +'<button type="button" id="btn_find" '
            +' onclick="Moves.location.getPaging(\''+indek+'\''
            +',\'to_location_id_'+indek+'\',\'to\')"></button>'        

          +'</li>'
          +'<li>'
            +'<label>&nbsp;</label>'
            +'<input type="text" '
            +' id="to_location_name_'+indek+'" disabled>'
            +'</li>'
        +'</ul>'
      +'</div>'

      +'<div>'
        +'<ul>'
          +'<li>'
            +'<label>Location ID:</label>'
            +'<input type="text" id="location_id_'+indek+'"'
            +' onchange="Moves.getLocation(\''+indek+'\''
            +',\'location_id_'+indek+'\',\'from\')" '
            +' size="9">'

            +'<button type="button" id="btn_find" '
            +' onclick="Moves.location.getPaging(\''+indek+'\''
            +',\'location_id_'+indek+'\',\'from\')"></button>'
          +'</li>'

          +'<li>'
            +'<label>&nbsp;</label>'
            +'<input type="text" '
            +' id="location_name_'+indek+'" disabled>'

          +'</li>'
            
          +'<li><label>Move No.:</label>'
            +'<input type="text" id="move_no_'+indek+'"'
            +' size="9">'
          +'</li>'
          
          +'<li><label>Date:</label>'
            +'<input type="date"'
              +' id="move_date_'+indek+'" '
              +' onblur="dateFakeShow('+indek+',\'move_date\')"'
              +' style="display:none;">'
            +'<input type="text"'
              +' id="move_date_fake_'+indek+'" '
              +' onfocus="dateRealShow('+indek+',\'move_date\')"'
              +' size="9">'
          +'</li>'

        +'</ul>'
      +'</div>'
    +'</div>'
        
    +'<details open>'
      +'<summary>Move Details</summary>'
      +'<div id="move_detail_'+indek+'"'
      +' style="width:100%;overflow:auto;">Move Details</div>'
    +'</details>'
      
    +'<ul>'
    
    +'<li><label>Employee ID:</label>'
      +'<input type="text" size="9" '
      +' id="employee_id_'+indek+'"'
      +' onchange="Moves.getSupervisor(\''+indek+'\')">'

      +'<button type="button" id="btn_find" '
      +' onclick="Moves.employee.getPaging(\''+indek+'\''
      +',\'employee_id_'+indek+'\')"></button>'
      
      +'<input type="text" '
      +' id="employee_name_'+indek+'" disabled>'
      +'</li>'
      

    +'<li><label>Note:</label>'
      +'<input type="text" id="move_note_'+indek+'"></li>'

    +'</ul>'
    +'</form>'
    +'<p><i class="required">* Required</i></p>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  
  document.getElementById('to_location_id_'+indek).focus();
  document.getElementById('move_date_'+indek).value=tglSekarang();
  document.getElementById('move_date_fake_'+indek).value=tglWest(tglSekarang());
  
  Moves.setRows(indek,[]);
}

Moves.setRows=(indek,isi)=>{

  if(isi===undefined) isi=[];
  var panjang=isi.length;
  var html=Moves.tableHead(indek);
  
  bingkai[indek].move_detail=isi;
  for (var i=0;i<panjang;i++){
    html+='<tr>'
      +'<td align="center">'+(i+1)+'</td>'

      +'<td style="margin:0;padding:0">'
        +'<input type="text" id="item_id_'+i+'_'+indek+'" '
        +' value="'+isi[i].item_id+'" size="15"'
        +'onchange="Moves.setCell(\''+indek+'\''
        +',\'item_id_'+i+'_'+indek+'\')" '
        +' onfocus="this.select()"></td>'

      +'<td><button type="button" id="btn_find" '
      +' onclick="Moves.item.getPaging(\''+indek+'\''
      +',\'item_id_'+i+'_'+indek+'\',\''+i+'\')">'
      +'</button></td>'
      
      +'<td style="padding:0;margin:0;">'
        +'<input type="text" id="item_name_'+i+'_'+indek+'" '
        +' value="'+isi[i].item_name+'" disabled></td>'
      
      +'<td  align="center" style="padding:0;margin:0;">'
        +'<input type="text" id="qty_moved_'+i+'_'+indek+'" '
        +' value="'+isi[i].qty_moved+'" size="3" '
        +' style="text-align:center"'
        +' onchange="Moves.setCell(\''+indek+'\''
        +',\'qty_moved_'+i+'_'+indek+'\')" '
        +' onfocus="this.select()" ></td>'
      
      +'<td align="center">'
        +'<button type="button" id="btn_add" '
        +' onclick="Moves.addRow(\''+indek+'\','+i+')" ></button>'
        +'<button type="button" id="btn_remove" '
        +' onclick="Moves.removeRow(\''+indek+'\','+i+')" ></button>'
      +'</td>'
      +'</tr>';
  }
  html+=Moves.tableFoot(indek);
  var budi = JSON.stringify(isi);
  document.getElementById('move_detail_'+indek).innerHTML=html;
  if(panjang==0) Moves.grid.addRow(indek,0,[]);
}

Moves.tableHead=(indek)=>{
  return '<table>'
    +'<thead>'
    +'<tr>'
    +'<th colspan=3>Item ID <i class="required">*</i></th>'
    +'<th>Description</th>'
    +'<th>Qty Moved</th>'
    +'<th>Add/Remove</th>'
    +'</tr>'
    +'</thead>';
}

Moves.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
    +'<td colspan="6">&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

Moves.addRow=(indek,baris)=>{
  Moves.grid.addRow(indek,baris,bingkai[indek].move_detail);
}

Moves.newRow=(newBasket)=>{
  var myItem={};
  myItem.row_id=newBasket.length+1;
  myItem.item_id="";
  myItem.item_name="";
  myItem.qty_moved=0;
  newBasket.push(myItem);
}

Moves.removeRow=(indek,baris)=>{
  Moves.grid.removeRow(indek,baris,bingkai[indek].move_detail);
}

Moves.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].move_detail;
  var baru=[];
  var isiEdit={};

  for (var i=0;i<isi.length; i++){
    isiEdit=isi[i];
    if(id_kolom==('item_id_'+i+'_'+indek)){
      isiEdit.item_id=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
      Moves.getItem(indek,'item_id_'+i+'_'+indek,i);
    }
    else if(id_kolom==('item_name_'+i+'_'+indek)){
      isiEdit.item_name=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
    }
    else if(id_kolom==('qty_moved_'+i+'_'+indek)){
      isiEdit.qty_moved=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
    }
    else{
      baru.push(isi[i]);
    }
  }
  bingkai[indek].move_detail=isi;
}

Moves.setLocation=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var baris=bingkai[indek].baris;

  setEV(id_kolom, data.location_id);
  Moves.getLocation(indek,id_kolom,baris);
}

Moves.getLocation=(indek,id_kolom,baris)=>{
  switch(baris){
    case "from":
      setEV('location_name_'+indek, txt_undefined);
      break;
    case "to":
      setEV('to_location_name_'+indek, txt_undefined);
      break;
  }

  Moves.location.getOne(indek,
    document.getElementById(id_kolom).value,
  (paket)=>{
    if(paket.count>0){
      
      var d=objectOne(paket.fields,paket.data);
      switch(baris){
        case "from":
          setEV('location_name_'+indek, d.name);
          break;
        case "to":
          setEV('to_location_name_'+indek, d.name);
          break;
      }
    }
  });
}

Moves.setItem=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var baris=bingkai[indek].baris;

  setEV(id_kolom, data.item_id);
  Moves.setCell(indek,id_kolom);
}

Moves.getItem=(indek,id_kolom,baris)=>{
  Moves.item.getOne(indek,
    document.getElementById(id_kolom).value,
  (paket)=>{
    setEV('item_name_'+baris+'_'+indek, txt_undefined);
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('item_name_'+baris+'_'+indek, d.name);
      Moves.setCell(indek,'item_name_'+baris+'_'+indek);
    }
  });
}

Moves.setSupervisor=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.employee_id);
  Moves.getSupervisor(indek);
}

Moves.getSupervisor=(indek)=>{
  Moves.employee.getOne(indek,getEV('employee_id_'+indek),
  (paket)=>{
    setEV('employee_name_'+indek, txt_undefined);
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data)
      setEV('employee_name_'+indek, d.name);
    }
  });
}
//-------------------------CREATE-DATA--------------------------------//

Moves.createExecute=(indek)=>{
  var detail=JSON.stringify(bingkai[indek].move_detail);
  db.execute(indek,{
    query:"INSERT INTO moves "
    +"(admin_name,company_id,to_location_id"
    +",location_id,move_no,date"
    +",detail,employee_id,note)"
    +" VALUES "
    +"('"+bingkai[indek].admin.name+"'"
    +",'"+bingkai[indek].company.id+"'"
    +",'"+getEV("to_location_id_"+indek)+"'"
    +",'"+getEV("location_id_"+indek)+"'"
    +",'"+getEV("move_no_"+indek)+"'"
    +",'"+getEV("move_date_"+indek)+"'"
    +",'"+detail+"'"
    +",'"+getEV("employee_id_"+indek)+"'"
    +",'"+getEV("move_note_"+indek)+"'"
    +")"
  });
}
//-------------------------EDIT-DATA----------------------------------//
Moves.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
      +" FROM moves "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND location_id='"+bingkai[indek].location_id+"' "
      +" AND move_no='"+bingkai[indek].move_no+"' "
  },(paket)=>{
    if (paket.err.id==0||paket.count>0){
      
      var d=objectOne(paket.fields,paket.data);
      
      setEV('to_location_id_'+indek, d.to_location_id);
      setEV('to_location_name_'+indek, d.to_location_name);
      setEV('location_id_'+indek, d.location_id);
      setEV('location_name_'+indek, d.location_name);
      setEV('move_no_'+indek, d.move_no);
      setEV('move_date_'+indek, d.date);
      setEV('move_date_fake_'+indek, tglWest(d.date));
      setEV('employee_id_'+indek, d.employee_id);
      setEV('employee_name_'+indek, d.employee_name);
      setEV('move_note_'+indek, d.note);
      Moves.setRows(indek, JSON.parse(d.detail) );
      message.none(indek);
    }
    return callback();
  });
}

Moves.formUpdate=(indek,move_no,location_id)=>{
  bingkai[indek].move_no=move_no;
  bingkai[indek].location_id=location_id;
  Moves.form.modeUpdate(indek);
}

Moves.updateExecute=(indek)=>{
  var detail=JSON.stringify(bingkai[indek].move_detail);

  db.execute(indek,{
    query:"UPDATE moves "
      +" SET to_location_id='"+getEV("to_location_id_"+indek)+"',"
      +" location_id='"+getEV("location_id_"+indek)+"',"
      +" move_no='"+getEV("move_no_"+indek)+"',"
      +" date='"+getEV("move_date_"+indek)+"',"
      +" detail='"+detail+"',"
      +" employee_id='"+getEV("employee_id_"+indek)+"',"
      +" note='"+getEV("move_note_"+indek)+"'"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND location_id='"+bingkai[indek].location_id+"'"
      +" AND move_no='"+bingkai[indek].move_no+"'"
  },(p)=>{
    if(p.err.id==0)Moves.endPath(indek);
  });
}

Moves.formDelete=(indek,move_no,location_id)=>{
  bingkai[indek].move_no=move_no;
  bingkai[indek].location_id=location_id;
  Moves.form.modeDelete(indek);
}

Moves.deleteExecute=function(indek){
  db.execute(indek,{
    query:"DELETE FROM moves"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND location_id='"+bingkai[indek].location_id+"' "
      +" AND move_no='"+bingkai[indek].move_no+"' "
  },(p)=>{
    if(p.err.id==0)Moves.endPath(indek);
  });
}
//-----------------------SEARCH-DATA----------------------------------//
Moves.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM moves "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND to_location_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR location_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR move_no LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Moves.search=(indek)=>{
  Moves.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT location_id,to_location_id,"
        +" date,move_no,"
        +" user_name,date_modified"
        +" FROM moves"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND to_location_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR location_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR move_no LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Moves.readShow(indek);
    });
  });
}
//--------------------------EXPORT-DATA-------------------------------//
Moves.exportExecute=(indek)=>{
  var table_name=Moves.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}
//--------------------------IMPORT-DATA-------------------------------//
Moves.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO moves"
      +"(admin_name,company_id,to_location_id,location_id"
      +",move_no,date"
      +",detail,employee_id,note)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+d[i][1]+"'" // to_location
      +",'"+d[i][2]+"'" // from
      +",'"+d[i][3]+"'" // move_no
      +",'"+d[i][4]+"'" // date
      +",'"+d[i][5]+"'" // detail
      +",'"+d[i][6]+"'" // employeee
      +",'"+d[i][7]+"'" // note
      +")" // path
    },(paket)=>{  
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}
//--------------------------SELECT-ROW--------------------------------//
Moves.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT location_id,to_location_id,"
      +" date,move_no,"
      +" user_name,date_modified"
      +" FROM moves"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Moves.selectShow(indek);
  });
}

Moves.selectShow=(indek)=>{
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
      +'<th colspan="2">From</th>'
      +'<th>To</th>'
      +'<th>Date</th>'
      +'<th>Move#</th>'
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
        +'<td align="left">'+d[x].location_id+'</td>'
        +'<td align="left">'+d[x].to_location_id+'</td>'
        +'<td align="left">'+tglWest(d[x].date)+'</td>'
        +'<td align="left">'+d[x].move_no+'</td>'
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
//--------------------------DELETE-ROW--------------------------------//
Moves.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM moves"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND location_id='"+d[i].location_id+"' "
          +" AND move_no='"+d[i].move_no+"' "
      });
    }
  }
  db.deleteMany(indek,a);
}
 
Moves.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM moves"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND location_id='"+getEV('location_id_'+indek)+"'"
      +" AND move_no='"+getEV('move_no_'+indek)+"'"
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

Moves.duplicate=(indek)=>{
  var id='copy_of '+document.getElementById('move_no_'+indek).value;
  document.getElementById('move_no_'+indek).value=id;
  document.getElementById('move_no_'+indek).focus();
  document.getElementById('move_no_'+indek).disabled=false;
}

Moves.endPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Moves.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Moves.properties(indek);})
  }
}





// eof: 599;529;656;659;668;680;698;753;735;742;
