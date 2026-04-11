/*
 * auth: budiono
 * date: mar-17, 15:02, sun-2024; new...
 * edit: mar-18, 10:07, mon-2024; search with array function;
 * edit: apr-03, 09:11, wed-2024; add input column;
 * edit: nov-05, 12:42, tue-2024; remove data;
 * -----------------------------; happy new year 2025;
 * edit: sep-04, 16:52, thu-2025; #72; 
 */

'use strict';

var Tables={}

Tables.form=new ActionForm2(Tables);
Tables.hideNew=true;
Tables.hideImport=true;
Tables.hideSelect=true;
Tables.table_name="tables";

Tables.show=(tiket)=>{
  tiket.modul='tables';
  tiket.menu.name="Tables";

  const baru=exist(tiket);
  if(baru==-1){
    const newReg=new BingkaiUtama(tiket);
    const indek=newReg.show();
    Tables.form.modePaging(indek);  
  }else{
    show(baru);
  }  
}

Tables.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
    +" FROM tables"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Tables.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Tables.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT table_id,zone,part,permission"
        +" FROM tables"
        +" ORDER BY table_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Tables.readShow(indek);
    });
  });
}

Tables.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var nomer=bingkai[indek].paging.offset;
  
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border=1>'  
      +'<tr>'
        +'<th colspan="2">Table Name</th>'
        +'<th>Zone #</th>'
        +'<th>Type</th>'
        +'<th>Permissions</th>'
        +'<th colspan="2">Actions</th>'
      +'</tr>';
      
  if (p.err.id===0){
    
    var table_type;
    var x;
    
    for (x in d) {
      nomer++;
      table_type='Table';
      if(d[x].permission=='-r--'){
        table_type='Query';
      }
      html+='<tr>'
        +'<td align="center">'+nomer+'</td>'
        +'<td align="left">'+d[x].table_id+'</td>'
        +'<td align="center">'+d[x].zone+d[x].part+'</td>'
        +'<td align="center">'+table_type+'</td>'
        +'<td align="center">'+d[x].permission+'</td>'
        +'<td align="center">'
          +'<button type="button"'
          +' id="btn_structure"'
          +' onclick="Tables.struct(\''+indek+'\''
          +',\''+d[x].table_id+'\');">Structure'
          +'</button>'
        +'</td>'
        +'<td align="center">'+nomer+'</td>'
      +'</tr>';
    }
  }
  html+='</table>'
  +'<p>'
  +'<i class="info">+ Gunakan App di [Menu > System > Small Query]'
  +' untuk menampilkan <b>data record</b> dengan perintah dasar SQL.</i>'
  +'</p>'
  +'</div>';

  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Tables.form.addPagingFn(indek);
}

Tables.struct=(indek,n)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>Tables.form.lastMode(indek) );
  
  db.execute(indek,{
    query:"SELECT row_id,table_id,column_id,"
      +" data_type,primary_key,not_null,"
      +" input_mode,input_id,foreign_key"
      +" FROM structure"
      +" WHERE table_id='"+n+"'"
      +" ORDER BY row_id"
  },(paket)=>{
    bingkai[indek].metode=n;
    var i;
    var d=objectMany(paket.fields,paket.data);

    var html='<div style="padding:0.5rem;">'
      +content.title(indek)
      +content.message(indek)
      +'<table>'
      +'<caption><b>TABLE NAME: </b><big>'+n+'</big></caption>'
      +'<th colspan="2">COLUMN NAME</th>'
      +'<th>TYPE</th>'
      +'<th>PRIMARY<br>KEY &#x1F511</th>'
      +'<th>NOT<br>NULL</th>'
      +'<th>INPUT MODE</th>'

    for(i=0;i<d.length;i++){
      
      html+='<tr>'
        //+'<td align="center">'+d[i].row_id+'</td>'
        +'<td align="center">'+(i+1)+'</td>'
        +'<td align="left">'+d[i].column_id+'</td>'
        +'<td align="left">'+String(d[i].data_type).toUpperCase()+'</td>'
        +'<td align="center">'+Tables.keBool(d[i].primary_key)+'</td>'
        +'<td align="center">'+Tables.keBool(d[i].not_null)+'</td>'
        +'<td align="left">'+Tables.keMode(Tables.kePlus(d[i].input_id),d[i].input_mode)+'</td>'
        
      +'</tr>';
    }
    html+='</table>'
    content.html(indek,html);    
  });
}

Tables.keBool=(b)=>{
  let r='';
  if(b==1){
    //r='<input type ="checkbox" checked>'
    //r='&check;'
    r='&#x2705';
  }else{
    //r='<input type ="checkbox">'
    //r='&nbsp;'
    r='&#x2610';
  }
  return r; 
}

Tables.keMode=(t,i)=>{
  switch(i){
    case 0:
      return '<i style="color:grey">SYSTEM</i>';
      break;
    case 1:
      return '<i style="color:blue">INSERT ('+t+')</i>';
      break;
    case 2:
      return '<i style="color:green">INSERT / UPDATE ('+t+')</i>';
      break;
    default:
      return i;
  }
}

Tables.kePlus=(i)=>{
  if(i==-1){
    return '';
  }else{
    return i;
  }
}
/*
Tables.search=(indek)=>{
  if(bingkai[indek].paket.data2){
    bingkai[indek].paket.data=bingkai[indek].paket.data2
  } 
  const f=bingkai[indek].paket.data;
  const txt=getEV("text_search_"+indek);
  const table=[];
  var new_table=[];
  var new_paket=[];
  
  var text_search=bingkai[indek].text_search;
  alert(text_search);
  
  bingkai[indek].paket.data2=f;
  
  for(let n in f){
    table.push( f[n][0] );
  }
  
  new_table=table.filter(
    abc=>abc.toLowerCase().indexOf(txt.toLowerCase()) !==-1
  )

  for(let n in new_table){
    for(let m in f){
      if(new_table[n]==f[m][0]){
        new_paket.push( f[m] );
      }
    }
  }
  
  bingkai[indek].paket.data=new_paket;
  
  bingkai[indek].count=new_paket.length;
  PAGING=false;
  Tables.readShow(indek);
}
*/
Tables.exportExecute=(indek)=>{
/*  
  db.execute(indek,{
    query:"tables"
  },(paket)=>{
    if (paket.err.id===0){
      downloadJSON(indek,JSON.stringify(paket),'tables.json');
    }else{
      content.infoPaket(indek,paket);
    }    
  });
*/  
  var table_name=Tables.table_name;
  var sql=sqlDatabase3(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

Tables.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM tables "
      +" WHERE table_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR zone LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR permission LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Tables.search=(indek)=>{
  var text_search=bingkai[indek].text_search;
  var limit=bingkai[indek].paging.limit;
  var offset=bingkai[indek].paging.offset;
  Tables.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT table_id,zone,part,permission"
        +" FROM tables"
        +" WHERE table_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR zone LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR permission LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Tables.readShow(indek);
    });
  });
}


// eof: 175;
