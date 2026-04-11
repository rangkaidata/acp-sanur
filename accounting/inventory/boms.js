/*
 * auth: budiono;
 * file: E4;
 * path: /accounting/inventory/boms.js;
 * -----------------------------------;
 * date: sep-13, 15:22, wed-2023; new;
 * edit: oct-13, 09:24, fri-2023; xHTML;
 * -----------------------------; happy new year 2024;
 * edit: jan-06, 10:32, sat-2024; meringkas;[union formPaging,gotoPage, and more ...]
 * edit: jan-10, 14:05, wed-2024; re-write with class;
 * edit: may-29, 08:45, wed-2024; BasicSQL;
 * edit: jul-02, 11:01, tue-2024; r4;
 * edit: jul-29, 16:53, mon-2024; r11;
 * edit: aug-05, 23:28, mon-2024; r11+ add account_id;
 * edit: aug-06, 16:00, tue-2024; r11+ add location_id;
 * edit: sep-12, 10:27, thu-2024; r19: hapus location_id, & inventory account id;
 * edit: nov-25, 07:47, mon-2024; #27; add locker;
 * edit: dec-24, 17:08, tue-2024; #32; properties+duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-22, 13:17, sat-2025; #41; file_id;
 * edit: mar-11, 18:58, tue-2025; #43; deep-folder;
 * edit: mar-26, 00:20, wed-2025; #45; ctables;cstructure;
 * edit: apr-24, 22:11, thu-2025; #50; export csv;
 * edit: oct-10, 17:50, fri-2025; #80; new relation;
 */ 
 
'use strict';

var Boms={};

Boms.table_name='boms';
Boms.form=new ActionForm2(Boms);
Boms.item=new StockItemLook(Boms);
Boms.hideSaveAs=true;

Boms.show=(karcis)=>{
  karcis.modul=Boms.table_name;
  karcis.child_free=false;
  
  var baru=exist(karcis);
  if(baru==-1){
    var newTxs=new BingkaiUtama(karcis);
    var indek=newTxs.show();
    getCompanyID(indek);
    getPath2(indek,(h)=>{
      mkdir(indek,h.folder,()=>{
        Boms.form.modePaging(indek,Boms);
      });
    });
  }else{
    show(baru);
  }
}

Boms.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM boms"
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

Boms.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Boms.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT "
        +" item_id,item_name,detail,"
        +" user_name,date_modified"
        +" FROM boms"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY item_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Boms.readShow(indek);
    });
  })
}

Boms.readShow=(indek)=>{
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
      +'<th>Part</th>'
      +'<th>User</th>'
      +'<th>Modified</th>'
      +'<th colspan="3">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d){
      n++;
      html+='<tr>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].item_id+'</td>'
      +'<td align="left">'+xHTML(d[x].item_name)+'</td>'
      +'<td align="center">'+JSON.parse(d[x].detail).length+' item</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'<td align="center"><button type="button" id="btn_change" '
        +' onclick="Boms.formUpdate(\''+indek+'\''
        +',\''+d[x].item_id+'\');">'
        +'</button></td>'
        
      +'<td align="center"><button type="button" id="btn_delete" '
        +' onclick="Boms.formDelete(\''+indek+'\''
        +',\''+d[x].item_id+'\');">'
        +'</button></td>'
      +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Boms.form.addPagingFn(indek);
}

Boms.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;

  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +'<div id="msg_'+indek+'" '
    +' style="margin-bottom:1rem;line-height:1.5rem;"></div>'
    +'<form autocomplete="off">'
    +'<fieldset id="bom_'+indek+'" style="border:0px;">'
    +'<ul>'
      +'<li><label>Item ID<i class="required">*</i>:</label>'
        +'<input type="text" '
        +' id="item_id_'+indek+'" '
        +' onchange="Boms.getItem(\''+indek+'\''
        +',\'item_id_'+indek+'\',-1)"'
        +' size="15">'
        
        +'<button type="button"'
          +' class="btn_find" '
          +' id="btn_item_'+indek+'" '
          +' onclick="Boms.item.getPaging(\''+indek+'\''
          +',\'item_id_'+indek+'\''
          +',-1'
          +',Boms)">'
          +'</button>'
        
      +'</li>'
      
      +'<li><label>Description</label>'
        +'<input type="text" '
        +' id="item_name_'+indek+'" '
        +' size="50" disabled>'
      +'</li>'

    +'</ul>'
    +'</fieldset>'
    +'<details open>'
    +'<summary>Detail Components</summary>'
      +'<div id="bom_list_'+indek+'" '
      +' style="width:100%;overflow:auto;">bom list</div>'
    +'</details>'

    +'<ul>'
      +'<li><label>Note:</label>'
        +'<input type="text" '
        +' id="bom_note_'+indek+'">'
        +'</li>'
    +'</ul>'
    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  
  if(metode==MODE_CREATE){
    setEDisabled('bom_'+indek,false);
    document.getElementById('item_id_'+indek).focus();
  }else{
    setEDisabled('bom_'+indek,true);
  }
  
  Boms.setRows(indek,[]);
}

function setEDisabled(id,bool){
  document.getElementById(id).disabled=bool;
}

Boms.getItem=(indek,id_kolom,baris)=>{
  if(baris==-1){
    setEV('item_name_'+indek, txt_undefined);
  }else{
    setEV('item_name_'+baris+'_'+indek, txt_undefined);
  }
  Boms.item.getOne(indek,
    document.getElementById(id_kolom).value,
  (paket)=>{
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      var item_name=d.name;
      if(baris==-1) {
        setEV('item_name_'+indek, item_name);
      }else{
        setEV('item_name_'+baris+'_'+indek, item_name);
        Boms.setCell(indek,'item_name_'+baris+'_'+indek);
      }
    }
  });
}

Boms.setItem=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  var baris=bingkai[indek].baris;

  setEV(id_kolom, data.item_id);
  switch(id_kolom){
    case 'item_id_'+indek:
      Boms.getItem(indek,id_kolom,baris); 
      break;
    case 'item_id_'+baris+'_'+indek:
      Boms.setCell(indek,id_kolom);
      break;
    default:
      alert('['+id_kolom+'] undefined in [boms.js]');
  }
}

Boms.setRows=function(indek,isi){
  if(isi===undefined) isi=[];
  var panjang=isi.length;
  var html=Boms.tableHead(indek);
  bingkai[indek].isiTabel=isi;
  
  for (var i=0;i<panjang;i++){
    html+='<tr>'
      +'<td align="center">'+(i+1)+'</td>'

      +'<td style="margin:0;padding:0">'
        +'<input type="text"'
        +' id="item_id_'+i+'_'+indek+'" '
        +' value="'+isi[i].item_id+'" '
        +'onchange="Boms.setCell(\''+indek+'\''
        +',\'item_id_'+i+'_'+indek+'\')" '
        +' onfocus="this.select()"'
        +' size="9">'
      +'</td>'

      +'<td><button type="button" '
        +' id="btn_find" '
        +' onclick="Boms.item.getPaging(\''+indek+'\''
        +',\'item_id_'+i+'_'+indek+'\''
        +',\''+i+'\')">'
        +'</button>'
      +'</td>'
      
      +'<td style="padding:0;margin:0;">'
        +'<input type="text" '
        +' id="item_name_'+i+'_'+indek+'" '
        +' value="'+isi[i].item_name+'" disabled>'
      +'</td>'
/*      
      +'<td style="padding:0;margin:0;">'
        +'<input type="text" size="8"'
        +' id="gl_account_id_'+i+'_'+indek+'" '
        +' value="'+isi[i].gl_account_id+'" disabled>'
      +'</td>'*/
      
      +'<td  align="center" style="padding:0;margin:0;">'
        +'<input type="text"'
        +' id="qty_needed_'+i+'_'+indek+'" '
        +' value="'+isi[i].qty_needed+'" '
        +' style="text-align:center"'
        +' onchange="Boms.setCell(\''+indek+'\''
        +',\'qty_needed_'+i+'_'+indek+'\')" '
        +' onfocus="this.select()"'
        +' size="6"  >'
      +'</td>'
      
      +'<td align="center">'
        +'<button type="button"'
        +' id="btn_add" '
        +' onclick="Boms.addRow(\''+indek+'\','+i+')" >'
        +'</button>'
        +'<button type="button" '
        +' id="btn_remove" '
        +' onclick="Boms.removeRow(\''+indek+'\','+i+')" >'
        +'</button>'
      +'</td>'
      +'</tr>';
  }
  html+=Boms.tableFoot(indek);
  var budi = JSON.stringify(isi);
  document.getElementById('bom_list_'+indek).innerHTML=html;
  if(panjang==0)Boms.addRow(indek,0);
}

Boms.tableHead=(indek)=>{
  return '<table>'
    +'<thead>'
    +'<tr>'
    +'<th colspan="3">Sub Item ID<i class="required">*</i></th>'
    +'<th>Description</th>'
//    +'<th>GL Account ID</th>'
    +'<th>Qty Needed</th>'
    +'<th>Add/Remove</th>'
    +'</tr>'
    +'</thead>';
}

Boms.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
    +'<td>&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

Boms.addRow=(indek,baris)=>{
  var oldBasket=[];
  var newBasket=[];
  
  oldBasket=bingkai[indek].isiTabel;
  
  for(var i=0;i<oldBasket.length;i++){
    newBasket.push(oldBasket[i]);
    if(i==baris)Boms.newRow(newBasket);
  }
  if(oldBasket.length==0)Boms.newRow(newBasket);
  Boms.setRows(indek,newBasket);
  
  // if(baris>0)document.getElementById('item_id'+i+'_'+indek).focus();
}

Boms.newRow=(newBasket)=>{
  var myItem={};
  myItem.row_id=newBasket.length+1;
  myItem.item_id="";
  myItem.item_name="";
//  myItem.gl_account_id="";
  myItem.qty_needed=0;
  newBasket.push(myItem);
}

Boms.removeRow=(indek,number)=>{
  var arr=bingkai[indek].isiTabel;
  var newBasket=[];
  Boms.setRows(indek,arr);
  for(let i=0;i<arr.length;i++){
    if(i!==number)newBasket.push(arr[i]);
  }
  Boms.setRows(indek,newBasket);
}

Boms.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].isiTabel;
  var baru=[];
  var isiEdit={};

  for (var i=0;i<isi.length; i++){
    isiEdit=isi[i];

    if(id_kolom==('item_id_'+i+'_'+indek)){
      isiEdit.item_id=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
      Boms.getItem(indek,'item_id_'+i+'_'+indek,i);
    }
    else if(id_kolom==('item_name_'+i+'_'+indek)){
      isiEdit.item_name=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
    }/*
    else if(id_kolom==('gl_account_id_'+i+'_'+indek)){
      isiEdit.gl_account_id=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
    }*/
    else if(id_kolom==('qty_needed_'+i+'_'+indek)){
      isiEdit.qty_needed=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
    }
    else{
      baru.push(isi[i]);
    }
  }
  bingkai[indek].isiTabel=isi;
}

Boms.createExecute=(indek)=>{
  
  var detail=JSON.stringify( bingkai[indek].isiTabel );

  db.execute(indek,{
    query:"INSERT INTO boms"
    +"(admin_name,company_id,"
    +" item_id,detail,note)"
    +" VALUES "
    +"('"+bingkai[indek].admin.name+"'"
    +",'"+bingkai[indek].company.id+"'"
    +",'"+getEV("item_id_"+indek)+"'"
    +",'"+detail+"'"
    +",'"+getEV("bom_note_"+indek)+"'"
    +")"
  });
}

Boms.readOne=(indek,callback)=>{

  db.execute(indek,{
    query:"SELECT * "
      +" FROM boms "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND item_id='"+bingkai[indek].item_id+"'"
  },(paket)=>{
    if (paket.err.id==0 && paket.count>0) {
      
      var d=objectOne(paket.fields,paket.data);

      setEV('bom_note_'+indek, d.note);
      setEV('item_id_'+indek, d.item_id);
      setEV('item_name_'+indek, d.item_name);

      Boms.setRows(indek, JSON.parse (d.detail) ) ;
      message.none(indek);
    }
    return callback();
  });
}

Boms.formUpdate=(indek,item_id)=>{
  bingkai[indek].item_id=item_id;
  Boms.form.modeUpdate(indek,Boms); // here #3
}

Boms.updateExecute=(indek)=>{

  var detail=JSON.stringify(bingkai[indek].isiTabel);
  db.execute(indek,{
    query:"UPDATE boms"
      +" SET detail='"+detail+"',"
      +" note='"+getEV("bom_note_"+indek)+"'"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND item_id='"+bingkai[indek].item_id+"'"
  },(p)=>{
    if(p.err.id==0) Boms.endPath( indek );
  });
}

Boms.formDelete=(indek,item_id)=>{
  bingkai[indek].item_id=item_id;
  Boms.form.modeDelete(indek,Boms); // here #4
}

Boms.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM boms"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND item_id='"+bingkai[indek].item_id+"'"
  },(p)=>{
    if(p.err.id==0) Boms.endPath( indek );
  });
}

Boms.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM boms "
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

Boms.search=(indek)=>{
  Boms.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT"
        +" item_id,item_name,"
        +" detail,"
        +" user_name,date_modified"
        +" FROM boms"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND item_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR item_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Boms.readShow(indek);
    });
  });
}

Boms.exportExecute=(indek)=>{
  var table_name=Boms.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

Boms.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO boms "
        +"(admin_name,company_id,item_id,detail,note)"
        +" VALUES "
        +"('"+bingkai[indek].admin.name+"'"
        +",'"+bingkai[indek].company.id+"'"
        +",'"+d[i][1]+"'"// item_id
        +",'"+d[i][2]+"'"// detail
        +",'"+d[i][3]+"'"// note
        +")"
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

Boms.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT"
      +" item_id,item_name,detail, "
      +" user_name,date_modified"
      +" FROM boms"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY item_id"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Boms.selectShow(indek);
  });
}

Boms.selectShow=(indek)=>{
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
      +'<th>Part</th>'
      +'<th>User</th>'
      +'<th>Modified</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d){
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
      +'<td align="center">'+JSON.parse(d[x].detail).length+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

Boms.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];

  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM boms"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND item_id='"+d[i].item_id+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

Boms.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM boms"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND item_id='"+getEV('item_id_'+indek)+"'"
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

Boms.duplicate=(indek)=>{
  var id='copy_of '+document.getElementById('item_id_'+indek).value;
  document.getElementById('item_id_'+indek).disabled=false;
  document.getElementById('item_id_'+indek).value=id;
  document.getElementById('item_id_'+indek).focus();
}

Boms.endPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Boms.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Boms.properties(indek);})
  }
}




// eof:483;409;589;598;650;675;667;670;676;673;
