/*
 * name: budiono;
 * file: E3;
 * path: /accounting/inventory/prices.js;
 * -------------------------------------;
 * date: sep-13, 16:16, wed-2023; new
 * edit: sep-20, 10:54, wed-2023; 
 * edit: dec-27, 08:48, wed-2023;
 * -----------------------------; happy new year 2024;
 * edit: jan-06, 17:44, sat-2024; mringkas;
 * edit: jan-10, 14:39, wed-2024; re-write with class;
 * edit: may-27, 10:49, mon-2024; basic-sql;
 * edit: jul-02, 10:11, tue-2024; r4;
 * edit: jul-29, 16:11, mon-2024; r11;
 * edit: sep-11, 15:17, wed-2024; r18;
 * edit: nov-24, 17:17, sun-2024; #27; add locker;
 * edit: dec-01, 15:34, sun-2024; #27;
 * edit: dec-24, 16:36, tue-2024; #32; properties+duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-22, 12:22, tue-2025; #41; file_blok;
 * edit: mar-11, 17:33, tue-2025; #43; deep-folder;
 * edit: mar-26, 00:17, wed-2025; #45; ctables;cstructure;
 * edit: apr-24, 22:08, thu-2025; #50; can export csv;
 */ 

'use strict';

var Prices={};

Prices.table_name='prices';
Prices.form=new ActionForm2(Prices);
Prices.item=new ItemLook(Prices);
Prices.hideSaveAs=true;

Prices.show=(tiket)=>{
  tiket.modul=Prices.table_name;
  
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    getCompanyID(indek);
    getPath2(indek,(h)=>{
      mkdir(indek,h.folder,()=>{
        Prices.form.modePaging(indek,Prices);
      });
    });
  }else{
    show(baru);
  }
}

Prices.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM prices"
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

Prices.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Prices.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT item_id,item_name,unit_price,"
        +" user_name,date_modified"
        +" FROM prices"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY item_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Prices.readShow(indek);
    });
  })
}

Prices.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +totalPagingandLimit(indek)
    +'<table border=1>'
    +'<tr>'
      +'<th colspan="2">Item ID</th>'
      +'<th>Item Name</th>'
      +'<th>Unit Price</th>'
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
        +'<td align="left">'+d[x].item_id+'</td>'
        +'<td align="left">'+xHTML(d[x].item_name)+'</td>'
        +'<td align="right">'+d[x].unit_price+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'
          +tglInt(d[x].date_modified)
          +'</td>'
        +'<td align="center">'
          +'<button type="button" '
          +' id="btn_change" '
          +' onclick="Prices.formUpdate(\''+indek+'\''
          +',\''+d[x].item_id+'\');">'
          +'</button></td>'
        +'<td align="center">'
          +'<button type="button" '
          +' id="btn_delete" '
          +' onclick="Prices.formDelete(\''+indek+'\''
          +',\''+d[x].item_id+'\');">'
          +'</button></td>'
        +'<td align="center">'+n+'</td>'
        +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Prices.form.addPagingFn(indek);
}

Prices.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +'<div id="msg_'+indek+'" style="margin-bottom:1rem;"></div>'
    +'<form autocomplete="off">'
    +'<ul>'
    +'<li><label>Item ID:</label>'

      +'<input type="text" '
      +' id="item_id_'+indek+'"'
      +' onchange="Prices.getItem(\''+indek+'\''
      +',\'item_id_'+indek+'\',-1)"'
      +' size="12">'

      +'<button type="button" '
        +' id="item_btn_'+indek+'" '
        +' class="btn_find"'
        +' onclick="Prices.item.getPaging(\''+indek+'\''
        +',\'item_id_'+indek+'\',-1)">'
        +'</button>'

      +'<input type="text" '
      +' id="item_name_'+indek+'"'
      +' disabled>'
      +'</li>'

    +'<li><label>Unit Price:</label>'
      +'<input type="text" '
      +' id="unit_price_'+indek+'"'
      +' onfocus="this.select();"'
      +' style="text-align:center;"'
      +' size="10">'
      +'</li>'
    +'</ul>'

    +'<details open>'
      +'<summary>Price Details</summary>'
      +'<div id="price_detail_'+indek+'"></div>'
    +'</details>'
    
    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);

  if(MODE_CREATE==metode){
    document.getElementById('item_id_'+indek).focus();
    Prices.setRows(indek,[]);
  }else{
    document.getElementById('item_id_'+indek).disabled=true;
    document.getElementById('item_btn_'+indek).disabled=true;
  }
}

Prices.setRows=function(indek,isi){
  if(isi===undefined) isi=[];
  if(isi===null)isi=[];
  
  var panjang=isi.length;
  var html=Prices.tableHead(indek);
    
  bingkai[indek].price_detail=isi;
  
  for (var i=0;i<panjang;i++){
    html+='<tr>'
      +'<td align="center">'+(i+1)+'</td>'     
        
      +'<td style="margin:0;padding:0" align="center">'
        +'<input type="text" id="level_'+i+'_'+indek+'" '
        +' value="'+isi[i].level+'" size="15" '
        +' onchange="Prices.setCell(\''+indek+'\''
        +',\'level_'+i+'_'+indek+'\')"'
        +' onfocus="this.select()"></td>'

      +'<td style="padding:0;margin:0;" align="center">'
        +'<input type="text" id="unit_price_'+i+'_'+indek+'"'
        +' value="'+isi[i].unit_price+'"'
        +' size="10" '
        +' style="text-align:right" '
        +' onchange="Prices.setCell(\''+indek+'\''
        +',\'unit_price_'+i+'_'+indek+'\')" '
        +' onfocus="this.select()" ></td>'
             
      +'<td align="center">'
        +'<button type="button" id="btn_add" '
        +' onclick="Prices.addRow(\''+indek+'\','+i+')" >'
        +'</button>'
        
      +'<button type="button" id="btn_remove"'
        +' onclick="Prices.removeRow(\''+indek+'\','+i+')" >'
        +'</button>'
        +'</td>'

      +'</tr>';
  }
  html+=Prices.tableFoot(indek);
  var budi=JSON.stringify(isi);
  document.getElementById('price_detail_'+indek).innerHTML=html;
  if(panjang==0) Prices.addRow(indek,[]);
}

Prices.tableHead=(indek)=>{
  return '<table id="myTable_'+indek+'" border=0 style="width:100%;" >'
    +'<thead>'
    +'<tr>'
    +'<th colspan="2">Level</th>'
    +'<th>Price</th>'
    +'<th>Add/Rem</th>'
    +'</tr>'
    +'</thead>';
}

Prices.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
    +'<td colspan="4">&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

Prices.addRow=(indek,baris)=>{
  var oldBasket=[];
  var newBasket=[];

  oldBasket=bingkai[indek].price_detail;
  for(var i=0;i<oldBasket.length;i++){
    newBasket.push(oldBasket[i]);
    if(i==baris) Prices.newRow(newBasket);
  }
  if(oldBasket.length==0)Prices.newRow(newBasket);
  Prices.setRows(indek,newBasket);
}

Prices.newRow=(newBasket)=>{
  var myItem={};
  myItem.row_id=newBasket.length+1;
  myItem.level="";
  myItem.unit_price="";
  newBasket.push(myItem);
}

Prices.removeRow=(indek,number)=>{
  var isiTabel=bingkai[indek].price_detail;
  var newBasket=[];
  var amount=0;  
  Prices.setRows(indek,isiTabel);
  for(var i=0;i<isiTabel.length;i++){
    if (i!=(number))newBasket.push(isiTabel[i]);
  }
  Prices.setRows(indek,newBasket);
}

Prices.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].price_detail;
  var baru = [];
  var isiEdit = {};
  
  for (var i=0;i<isi.length; i++){
    isiEdit=isi[i];
    
    if(id_kolom==('level_'+i+'_'+indek)){
      isiEdit.level=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
    }
    else if(id_kolom==('unit_price_'+i+'_'+indek)){
      isiEdit.unit_price=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
    }
    else{
      baru.push(isi[i]);
    }
  }  
  bingkai[indek].price_detail=isi;
}

Prices.setItem=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var nama_kolom=bingkai[indek].nama_kolom;

  setEV(id_kolom, data.item_id);
  Prices.getItem(indek,id_kolom,nama_kolom); 
}

Prices.getItem=(indek,id_kolom,baris)=>{
  setEV('item_name_'+indek, '');
  Prices.item.getOne(indek,
    document.getElementById(id_kolom).value,
  (p)=>{
    var d=objectOne(p.fields,p.data);
    if(p.count>0){
      setEV('item_id_'+indek, d.item_id);
      setEV('item_name_'+indek, d.name);
    }
  });
}

Prices.createExecute=(indek)=>{
  var detail=JSON.stringify(bingkai[indek].price_detail); 

  db.execute(indek,{
    query:"INSERT INTO prices"
    +"(admin_name,company_id,item_id,unit_price,detail)"
    +" VALUES "
    +"('"+bingkai[indek].admin.name+"'" 
    +",'"+bingkai[indek].company.id+"'" 
    +",'"+getEV("item_id_"+indek)+"'" 
    +",'"+getEV("unit_price_"+indek)+"'"
    +",'"+detail+"'"
    +")"
  });
}

Prices.readOne=(indek,callback)=>{

  db.execute(indek,{
    query: "SELECT * "
      +" FROM prices "    
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"    
      +" AND item_id='"+bingkai[indek].item_id+"' "
  },(paket)=>{
    if (paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('item_id_'+indek, d.item_id );
      setEV('item_name_'+indek, d.item_name);
      setEV('unit_price_'+indek, d.unit_price);
      Prices.setRows(indek,JSON.parse(d.detail));
      message.none(indek);
    }
    return callback();
  });
}

Prices.formUpdate=(indek,item_id)=>{
  bingkai[indek].item_id=item_id;
  Prices.form.modeUpdate(indek,Prices); // here 2
}

Prices.updateExecute=(indek)=>{
  
  var detail=JSON.stringify(bingkai[indek].price_detail);

  db.execute(indek,{
    query:"UPDATE prices"
      +" SET unit_price='"+getEV("unit_price_"+indek)+"',"
      +" detail='"+detail+"'"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND item_id='"+bingkai[indek].item_id+"' "
  },(p)=>{
    if(p.err.id==0) Prices.endPath(indek);
  });
}

Prices.formDelete=(indek,item_id)=>{
  bingkai[indek].item_id=item_id;
  Prices.form.modeDelete(indek,Prices);// here 3
}

Prices.deleteExecute=function(indek){
  db.execute(indek,{
    query:"DELETE FROM prices"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND item_id='"+bingkai[indek].item_id+"'"
  },(p)=>{
    if(p.err.id==0) Prices.endPath(indek);
  });
}

Prices.countSearch=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT COUNT(*)"
      +" FROM prices"
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

Prices.search=(indek)=>{
  Prices.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT item_id, item_name, unit_price,"
        +" user_name, date_modified"
        +" FROM prices"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND item_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR item_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Prices.readShow(indek);
    });
  });
}

Prices.exportExecute=(indek)=>{
  var table_name=Prices.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

Prices.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO prices"
        +"(admin_name,company_id,item_id,unit_price,detail)"
        +" VALUES "
        +"('"+bingkai[indek].admin.name+"'"
        +",'"+bingkai[indek].company.id+"'" 
        +",'"+d[i][1]+"'" // item_id
        +",'"+d[i][2]+"'" // unit_price
        +",'"+d[i][3]+"'" // detail
        +")"
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

Prices.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT item_id,item_name,unit_price,"
      +" user_name,date_modified"
      +" FROM prices"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY item_id"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Prices.selectShow(indek);
  });
}

Prices.selectShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    // +totalPagingandLimit(indek)

    +'<table border=1>'
    +'<tr>'
      +'<td align="center">'
        +'<input type="checkbox"'
        +' id="check_all_'+indek+'"'
        +' onclick="checkAll(\''+indek+'\')">'
      +'</td>'
      +'<th colspan="2">Item ID</th>'
      +'<th>Item Name</th>'
      +'<th>Unit Price</th>'
      +'<th>User</th>'
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
        +'<td align="left">'+d[x].item_id+'</td>'
        +'<td align="left">'+xHTML(d[x].item_name)+'</td>'
        +'<td align="right">'+d[x].unit_price+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

Prices.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];

  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM prices"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND item_id='"+d[i].item_id+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

Prices.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT company_id,item_id,date_created"
      +" FROM prices"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND item_id='"+getEV('item_id_'+indek)+"'"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data) ;      
      bingkai[indek].file_id=String(":/").concat(
        Prices.table_name,"/",
        d.company_id,"/",
        d.item_id);
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

Prices.endPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Prices.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Prices.properties(indek);})
  }
}




// eof: 497;441;538;536;592;593;600;597;
