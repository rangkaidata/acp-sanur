/*
 * name: budiono;
 * file: F6-49;
 * path: /accounting/inventory/item_begins.js;
 * ------------------------------------------;
 * date: sep-29, 11:10, fri-2023; new; 
 * edit: oct-01, 09:34, sun-2023; 
 * edit: dec-25, 11;54, mon-2023;
 * edit: dec-26, 12:24, tue-2023; import_sort desc;
 * -----------------------------; happy new year 2024;
 * edit: jan-11, 20:18, thu-2024; re-write w class;
 * edit: jun-19, 10:26, wed-2024; BasicSQL;
 * edit: jul-07, 12:24, sun-2024; r7;
 * edit: aug-05, 12:38, mon-2024; r11;
 * edit: sep-13, 16:32, fri-2024; r19;
 * edit: oct-08, 17:41, tue-2024; #20;
 * edit: nov-11, 09:11, mon-2024; #25; lockDate();
 * edit: nov-26, 14:15, tue-2024; #27; add locker();
 * edit: dec-02, 13:34, mon-2024; #27; 
 * edit: dec-26, 12:43, thu-2024; #32; properties+duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-23, 17:36, sun-2025; #41; file_id;
 * edit: mar-13, 06:39, thu-2025; #43; deep-folder;
 * edit: mar-26, 12:58, wed-2025; #45; ctables;cstructure;
 * edit: apr-21, 15:31, mon-2025; #50; export_all_record;
 * edit: apr-24, 15:27, thu-2025; #50; total;
 */ 

'use strict';

var ItemBegins={};

ItemBegins.table_name='item_begins';
ItemBegins.form=new ActionForm2(ItemBegins);
ItemBegins.item=new ItemLook(ItemBegins);
ItemBegins.location=new LocationLook(ItemBegins);

ItemBegins.show=(karcis)=>{
  karcis.modul=ItemBegins.table_name;
  karcis.have_child=true;
  
  var baru=exist(karcis);
  if(baru==-1){
    var newTxs=new BingkaiUtama(karcis);
    var indek=newTxs.show();
    getCompanyID(indek);
    getPath2(indek,(h)=>{
      mkdir(indek,h.folder,()=>{
        ItemBegins.getDefault(indek);
        ItemBegins.form.modePaging(indek);
      });
    });
  }else{
    show(baru);
  }
}

ItemBegins.getDefault=(indek)=>{
  ItemDefaults.getDefault(indek);
}

ItemBegins.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +",SUM(quantity) AS quantity"
      +",SUM(total_cost) AS total_cost"
      +" FROM item_begins"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
      bingkai[indek].quantity=paket.data[0][1];
      bingkai[indek].total_cost=paket.data[0][2];
    }
    return callback()
  });
}

ItemBegins.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  ItemBegins.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT item_id,item_name,cost_method,"
        +" quantity,unit_cost,total_cost,"
        +" user_name,date_modified"
        +" FROM item_begins"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY item_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      ItemBegins.readShow(indek);
    });
  })
}

ItemBegins.readShow=function(indek){
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var quantity=bingkai[indek].quantity;
  var total_cost=bingkai[indek].total_cost;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +TotalPagingLimit(indek)
    +'<table border=1>'
    +'<tr>'
      +'<th colspan="2">Item ID</th>'
      +'<th>Item Name</th>'    
      +'<th>Quantity</th>'
//      +'<th>Unit Cost</th>'
      +'<th>Total Cost</th>'
      +'<th>Owner</th>'
      +'<th>Date Modified</th>'
      +'<th colspan=3>Action</th>'
    +'</tr>';

    if (p.err.id===0){
      var x
      for (x in d) {
        n++;
        html+='<tr>'
          +'<td align="center">'+n+'</td>'
          +'<td align="left">'+d[x].item_id+'</td>'
          +'<td align="left">'+xHTML(d[x].item_name)+'</td>'
          +'<td align="right">'+d[x].quantity+'</td>'
//          +'<td align="right">'
//            +Number(d[x].total_cost)/Number(d[x].quantity)
//            +'</td>'
          +'<td align="right">'+d[x].total_cost+'</td>'
          +'<td align="center">'+d[x].user_name+'</td>'
          +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
          +'<td align="center"><button type="button" '
            +' id="btn_change" '
            +' onclick="ItemBegins.formUpdate(\''+indek+'\''
            +',\''+d[x].item_id+'\');"></button></td>'
            
          +'<td align="center"><button type="button" '
            +' id="btn_delete" '
            +'onclick="ItemBegins.formDelete(\''+indek+'\''
            +',\''+d[x].item_id+'\');"></button></td>'
          +'<td align="center">'+n+'</td>'
          +'</tr>';
      }
    }
    html+='<tr>'
        +'<td colspan="2">&nbsp</td>'
        +'<td align="right"><strong>Total:</strong></td>'
        +'<td align="right"><strong>'+quantity+'</strong></td>'
//        +'<td>&nbsp;</td>'
        +'<td align="right"><strong>'+total_cost+'</strong></td>'
        +'<td colspan="5">&nbsp</td>'
        +'</tr>';

    html+='</table></div>';
    
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  ItemBegins.form.addPagingFn(indek);
}

ItemBegins.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    +'<ul>'
    +'<li><label>Item ID:&nbsp;<i class="required">*</i></label>'
      +'<input type="text" '
      +' id="item_id_'+indek+'"'
      +' onchange="ItemBegins.getItem(\''+indek+'\''
      +',\'item_id_'+indek+'\')"'
      +' size="20">'
      
      +'<button type="button" '
        +' id="item_btn_'+indek+'" '
        +' class="btn_find"'
        +' onclick="ItemBegins.item.getPaging(\''+indek+'\''
        +',\'item_id_'+indek+'\',-1)"></button>'
      +'</li>'
      
    +'<li><label>Description:</label>'
      +'<input type="text"'
      +' id="item_name_'+indek+'"'
      +' size="25"'
      +' disabled></li>'
        
    +'</ul>'
    
    +'<details open>'
      +'<summary>Item Begin Details</summary>'
      +'<div id="begin_detail_'+indek+'"></div>'
    +'</details>'

    +'</form>'
    +'</div>';
  content.html(indek,html);
  statusbar.ready(indek);
  ItemBegins.setDefault(indek);
    
  if(metode==MODE_CREATE){
    document.getElementById('item_id_'+indek).focus();
  }else{
    document.getElementById('item_id_'+indek).disabled=true;
    document.getElementById('item_btn_'+indek).disabled=true;
  }
}

ItemBegins.setDefault=(indek)=>{
  ItemBegins.setRows(indek,[] );
}

ItemBegins.setRows=function(indek,isi){
  if(isi===undefined) isi=[];
  if(isi===null)isi=[];
  
  var panjang=isi.length;
  var html=ItemBegins.tableHead(indek);
  
  var sum_qty=0;
  var sum_total=0;
  
  bingkai[indek].begin_detail=isi;
  
  for (var i=0;i<panjang;i++){
    html+='<tr>'
      +'<td align="center">'+(i+1)+'</td>'
      
      +'<td style="margin:0;padding:0">'
        +'<input type="text" id="location_id_'+i+'_'+indek+'" '
        +' value="'+isi[i].location_id+'" '
        +' onchange="ItemBegins.setCell(\''+indek+'\''
        +',\'location_id_'+i+'_'+indek+'\')"'
        +' onfocus="this.select()"'
        +' size="10">'
        +'</td>'
        
      +'<td><button type="button" id="btn_find" '
        +' onclick="ItemBegins.location.getPaging(\''+indek+'\''
        +',\'location_id_'+i+'_'+indek+'\',\''+i+'\')">'
        +'</button></td>'

      +'<td style="padding:0;margin:0;" align="right">'
        +'<input type="text" id="quantity_'+i+'_'+indek+'"'
        +' value="'+isi[i].quantity+'"'
        +' onchange="ItemBegins.setCell(\''+indek+'\''
        +',\'quantity_'+i+'_'+indek+'\')" '
        +' onfocus="this.select()"'
        +' style="text-align:right" '
        +' size="5">'
        +'</td>'
        
      +'<td style="padding:0;margin:0;" align="right">'
        +'<input type="text" id="unit_cost_'+i+'_'+indek+'"'
        +' value="'+isi[i].unit_cost+'"'
        +' onchange="ItemBegins.setCell(\''+indek+'\''
        +',\'unit_cost_'+i+'_'+indek+'\')" '
        +' onfocus="this.select()" '
        +' style="text-align:right" '
        +' size="5">'
        +'</td>'

      +'<td style="padding:0;margin:0;" align="right">'
        +'<input type="text" id="total_cost_'+i+'_'+indek+'"'
        +' value="'+isi[i].total_cost+'" '
        +' onchange="ItemBegins.setCell(\''+indek+'\''
        +',\'total_cost_'+i+'_'+indek+'\')"  '
        +' onfocus="this.select()"'
        +' disabled'
        +' style="text-align:right" '
        +' size="9">'
        +'</td>'
      
      +'<td align="center">'
        +'<button type="button" id="btn_add" '
        +' onclick="ItemBegins.addRow(\''+indek+'\','+i+')" >'
        +'</button>'
        
      +'<button type="button" id="btn_remove"'
        +' onclick="ItemBegins.removeRow(\''+indek+'\','+i+')" >'
        +'</button>'
        +'</td>'

      +'</tr>';      
    
    sum_qty+=parseFloat(isi[i].quantity);
    sum_total+=parseFloat(isi[i].total_cost);
    
  }
  html+=ItemBegins.tableFoot(indek);
  var budi = JSON.stringify(isi);
  document.getElementById('begin_detail_'+indek).innerHTML=html;
  if(panjang==0) ItemBegins.addRow(indek,[]);
  
  document.getElementById('sum_qty_'+indek).innerHTML=sum_qty;
  document.getElementById('sum_total_'+indek).innerHTML
    =ribuan(sum_total);
}

ItemBegins.tableHead=(indek)=>{
  return '<table id="myTable_'+indek+'" border=0 style="width:100%;" >'
    +'<thead>'
    +'<tr>'
    +'<th colspan="3">Location ID</th>'
    +'<th>Quantity</th>'
    +'<th>Unit Cost</th>'
    +'<th>Total Cost</th>'
    +'<th>Add/Rem</th>'
    +'</tr>'
    +'</thead>';
}

ItemBegins.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
    +'<td colspan="3" style="text-align:right;">Total:</td>'
    +'<td style="text-align:right;font-weight:bolder;" '
      +' id="sum_qty_'+indek+'">0.00</td>'
    +'<td>&nbsp;</td>'
    +'<td style="text-align:right;font-weight:bolder;" '
      +' id="sum_total_'+indek+'">0.00</td>'
    +'<td>&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

ItemBegins.addRow=(indek,baris)=>{
  var oldBasket=[];
  var newBasket=[];
  var location_id=bingkai[indek].data_default.location_id;

  oldBasket=bingkai[indek].begin_detail;
  for(var i=0;i<oldBasket.length;i++){
    newBasket.push(oldBasket[i]);
    if(i==baris) newRow(newBasket);
  }
  if(oldBasket.length==0)newRow(newBasket);
  ItemBegins.setRows(indek,newBasket);
  
  function newRow(newBas){
    var myItem={};
    myItem.row_id=newBas.length+1;
    myItem.location_id=location_id;
    myItem.quantity=0;
    myItem.unit_cost=0;
    myItem.total_cost=0;
    newBas.push(myItem);    
  }
}

ItemBegins.removeRow=(indek,number)=>{
  var isiTabel=bingkai[indek].begin_detail;
  var newBasket=[];
  var amount=0;  
  ItemBegins.setRows(indek,isiTabel);
  for(var i=0;i<isiTabel.length;i++){
    if (i!=(number))newBasket.push(isiTabel[i]);
  }
  ItemBegins.setRows(indek,newBasket);
}

ItemBegins.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].begin_detail;
  var baru = [];
  var isiEdit = {};
  
  var sum_qty=0;
  var sum_total=0;

  for (var i=0;i<isi.length; i++){
    isiEdit=isi[i];
    
    if(id_kolom==('location_id_'+i+'_'+indek)){
      isiEdit.location_id=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
    }
    else if(id_kolom==('quantity_'+i+'_'+indek)){
      isiEdit.quantity=document.getElementById(id_kolom).value;
      isiEdit.total_cost=isiEdit.unit_cost*isiEdit.quantity;
      setEV('total_cost_'+i+'_'+indek,ribuan(isiEdit.total_cost) );
      baru.push(isiEdit);
      ItemBegins.calculator(indek,i);
    }
    else if(id_kolom==('unit_cost_'+i+'_'+indek)){
      isiEdit.unit_cost=document.getElementById(id_kolom).value;
      isiEdit.total_cost=isiEdit.unit_cost*isiEdit.quantity;
      setEV('total_cost_'+i+'_'+indek,ribuan(isiEdit.total_cost) );
      baru.push(isiEdit);
      ItemBegins.calculator(indek,i);
    }
    else if(id_kolom==('total_cost_'+i+'_'+indek)){
      isiEdit.total_cost
        =ribuan(document.getElementById(id_kolom).value);
      baru.push(isiEdit);
    }
    else{
      baru.push(isi[i]);
    }
    
    sum_qty+=parseFloat(baru[i].quantity);
    sum_total+=parseFloat(baru[i].total_cost);
  }  

//  document.getElementById('sum_qty_'+indek).innerHTML=sum_qty;
//  document.getElementById('sum_total_'+indek).innerHTML=2;//ribuan(sum_total);
  
  bingkai[indek].begin_detail=isi;
}

ItemBegins.setItem=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, data.item_id);
  ItemBegins.getItem(indek,id_kolom); 
}

ItemBegins.getItem=(indek,id_kolom)=>{
  ItemBegins.item.getOne(indek,
    document.getElementById(id_kolom).value,
  (paket)=>{
    setEV('item_name_'+indek, txt_undefined);
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('item_name_'+indek, d.name);
      bingkai[indek].data_default.location_id=d.location_id;
    }
    ItemBegins.setRows(indek,[] );
  });
}

ItemBegins.setLocation=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var id_baris=bingkai[indek].id_baris;

  setEV(id_kolom, data.location_id);
  ItemBegins.setCell(indek,id_kolom);
}

ItemBegins.calculator=function(indek, baris){
  setEV('total_cost_'+baris+"_"+indek,
    Number(getEV('quantity_'+baris+"_"+indek))*
    Number(getEV('unit_cost_'+baris+"_"+indek))
  )
}

ItemBegins.createExecute=(indek)=>{

  var detail=JSON.stringify(bingkai[indek].begin_detail);

  db.execute(indek,{
    query:"INSERT INTO item_begins"
      +"(admin_name,company_id,item_id,detail)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEV('item_id_'+indek)+"'"
      +",'"+detail+"'"
      +")"
  });
}

ItemBegins.readOne=(indek,callback)=>{

  db.execute(indek,{
    query:"SELECT * "
      +" FROM item_begins "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND item_id='"+bingkai[indek].item_id+"'" 
  },(paket)=>{
    if(paket.err.id==0 || paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('item_id_'+indek, d.item_id);
      setEV('item_name_'+indek, d.item_name);
      ItemBegins.setRows(indek, JSON.parse(d.detail));
      message.none(indek);
    }
    return callback();
  });
}

ItemBegins.formUpdate=(indek,item_id)=>{
  bingkai[indek].item_id=item_id;
  ItemBegins.form.modeUpdate(indek);
}

ItemBegins.updateExecute=(indek)=>{

  var detail=JSON.stringify(bingkai[indek].begin_detail);

  db.execute(indek,{
    query:"UPDATE item_begins "
      +" SET detail='"+detail+"'"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND item_id='"+bingkai[indek].item_id+"'" 
  },(p)=>{
    if(p.err.id==0) ItemBegins.endPath( indek );
  });
}

ItemBegins.formDelete=(indek,item_id)=>{
  bingkai[indek].item_id=item_id;
  ItemBegins.form.modeDelete(indek);
}

ItemBegins.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM item_begins"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND item_id='"+bingkai[indek].item_id+"'" 
  },(p)=>{
    if(p.err.id==0) ItemBegins.endPath( indek );
  });
}

ItemBegins.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM item_begins"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND item_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR item_name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

ItemBegins.search=(indek)=>{
  ItemBegins.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT item_id,item_name,cost_method,"
        +" quantity,unit_cost,total_cost,"
        +" user_name,date_modified"
        +" FROM item_begins"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND item_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR item_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      ItemBegins.readShow(indek);
    });
  });
}

ItemBegins.exportExecute=(indek)=>{
  var table_name=ItemBegins.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

ItemBegins.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;  
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO item_begins"
        +"(admin_name,company_id,item_id,detail)"
        +" VALUES "
        +"('"+bingkai[indek].admin.name+"'"
        +",'"+bingkai[indek].company.id+"'"
        +",'"+d[i][1]+"'"
        +",'"+d[i][2]+"'"
        +")"
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

ItemBegins.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT item_id,item_name,cost_method,"
      +" quantity,unit_cost,total_cost,"
      +" user_name,date_modified"
      +" FROM item_begins"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY item_id"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    ItemBegins.selectShow(indek);
  });
}

ItemBegins.selectShow=function(indek){
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
    +'<th colspan="2">Item ID</th>'
    +'<th>Item Name</th>'    
    +'<th>Quantity</th>'
//    +'<th>Unit Cost</th>'
    +'<th colspan="2">Total Cost</th>'
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
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].item_id+'</td>'
        +'<td align="left">'+xHTML(d[x].item_name)+'</td>'
        +'<td align="right">'+d[x].quantity+'</td>'
//        +'<td align="right">'+formatSerebuan(d[x].unit_cost)+'</td>'
        +'<td align="right">'+d[x].total_cost+'</td>'
        +'<td align="center">'+n+'</td>'
        +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

ItemBegins.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM item_begins"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND item_id='"+d[i].item_id+"'" 
      });
    }
  }
  db.deleteMany(indek,a);
}

ItemBegins.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM item_begins"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND item_id='"+getEV('item_id_'+indek)+"'"
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

ItemBegins.duplicate=(indek)=>{
  var id='copy_of '+document.getElementById('item_id_'+indek).value;
  document.getElementById('item_id_'+indek).value=id;
  document.getElementById('item_id_'+indek).focus();
  document.getElementById('item_id_'+indek).disabled=false;
}

ItemBegins.endPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ItemBegins.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{ItemBegins.properties(indek);})
  }
}




// eof:550;500;616;625;642;679;682;689;
