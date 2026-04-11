/*
 * auth: budiono
 * date: sep-04, 14:40, mon-2023; new;256;
 * -----------------------------; happy new year 2024;
 * edit: jan-11, 20:21, thu-2024; metode with font-color :D
 * edit: feb-07, 15:45, wed-2024; re-test;Actionform;
 * edit: mar-19, 19:39, tue-2024; execute with basic sql;
 */

'use strict';

var Blockchain={}

Blockchain.form=new ActionForm2(Blockchain);
Blockchain.table_name="blockchain";
Blockchain.hideSelect=true;
Blockchain.hideImport=true;
Blockchain.hideNew=true;

Blockchain.show=(tiket)=>{
  tiket.modul='blocks';
  tiket.menu.name="Blockchain";

  const baru=exist(tiket);
  if(baru==-1){
    const newReg=new BingkaiUtama(tiket);
    const indek=newReg.show();
    Blockchain.form.modePaging(indek);
  }else{
    show(baru);
  }  
}

Blockchain.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) FROM blockchain"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Blockchain.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Blockchain.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT hash,modul,metode,index,user_name,timestamp"
      +" FROM blockchain"
      +" ORDER BY hash DESC"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Blockchain.readShow(indek);
    });
  })
}

Blockchain.readShow=(indek)=>{
  const p=bingkai[indek].paket;
  const d=objectMany(p.fields,p.data);
  var nomer=bingkai[indek].paging.offset;
  
  var html='<div style="padding:0.5rem;">'
  +content.title(indek)
  +content.message(indek)
  +totalPagingandLimit(indek)
  +'<table border=1 width=100%>'
    +'<caption>&nbsp;</caption>'
    +'<tr>'
    +'<th style="display:none">Blok</th>'
    +'<th colspan="2">Hash</th>'
    +'<th>Modul</th>'
    +'<th>Metode</th>'
    +'<th>Index</th>'
    +'<th>User</th>'
    +'<th>Created</th>'
    +'<th>Detail</th>'
    +'</tr>';
  
  if (p.err.id===0){
    for (var x in d) {
      nomer++;
      html+='<tr>'
        +'<td align="center">'+nomer+'</td>'
        +'<td style="display:none">'+d[x].hash+'</td>'
        +'<td align="center">'+blokID(d[x].hash)+'</td>'
        +'<td align="center">'+d[x].modul.slice(0,1).toUpperCase()
          +d[x].modul.slice(1)+'</td>'
        +'<td align="center">'+fontColor(d[x].metode)+'</td>'
        +'<td align="center">'+Blockchain.display_err(d[x].index)+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].timestamp)+'</td>'
        +'<td align="center"><button type="button" '
          +' id="btn_detail" '
          +' onclick="Blockchain.readOne(\''+indek+'\''
          +',\''+d[x].hash+'\');">'
          +'</button>'
          +'</td>'
        +'</tr>';
    }
  }
  html+='</table></div>';
  
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Blockchain.form.addPagingFn(indek);
}

Blockchain.display_err=(txt)=>{
  if (txt==-1){
    txt='<div '
    +' style="border-radius:10px;'
    +'background-color:yellow;color:red">err'
    +'</div>';
  }
  return txt;
}

Blockchain.readOne=(indek,block)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>Blockchain.form.lastMode(indek));

  db.execute(indek,{
    content:true,
    query:"SELECT * "
    +" FROM blockchain"
    +" WHERE hash='"+block+"' "
  },(batman)=>{
    var html;
    var txt;
    
    if (batman.err.id===0 && batman.count==1){
      const d=objectOne(batman.fields,batman.data);
      bingkai[indek].metode="View";
      bingkai[indek].md5=d;
      
//      var c=agarSupayaRapih(JSON.parse(d.data).query);
      
      txt='<pre>'
        +JSON.stringify(JSON.parse(xHTML(d.data)),undefined,2)
        +'</pre>';
        
      html='<div style="padding:0.5rem;"><ul>'
        +content.title(indek)
        +'<input type="button" value="MD5 sum"'
          +' onclick="Blockchain.md5CekSum(\''+indek+'\')">'
        +'<li><label>Hash</label>: '+blokID(d.hash)+'</li>'
        +'<li><label>Date</label>: '+d.date+'</li>'
        +'<li><label>Module</label>: '+d.modul.toUpperCase()
          +'</li>'
        +'<li><label>Method</label>: '+fontColor(d.metode)
          +'</li>'
        +'<li><label>User</label>: '+d.user_name+'</li>'
        +'<li><label>Admin</label>: '+d.admin_name+'</li>'
        +'<li><label>Timestamp</label>: '+d.timestamp+'</li>'
        +'<li><label>Previous Hash</label>: '
          +blokID(d.previous_hash)+'</li>'
        +'<li><label>Randomize</label>: '+d.acak+'</li>'
        +'<li><label>Index</label>: '+d.index+'</li>'
        +'<li><label>Status</label>: '
          +Blockchain.idxStatus(d.index)+'</li>'
        +'<li><label>Data</label>:'
          +'<div style="width:100%;'
          +'font-family:courier new;'
          //+'overflow-wrap;break-word;'
          +'white-space:normal;overflow-wrap: break-word;'
          +'overflow-x:auto;">'
          +''+txt+'</div>'
        +'</li>' 
        +'</ul>'
      html+='</div>';
      content.html(indek,html);
    }
  });
}

function fontColor(s){
  var str;
  switch(s){
    case "create": 
      str='<i style="color:green">Create</i>';
      break;
    case "update": 
      str='<i style="color:Blue">Update</i>';
      break;
    case "delete": 
      str='<i style="color:Brown">Delete</i>';
      break;
    default:
      str='<i style="color:grey">'+s+'</i>';      
  }
  return str;
}

Blockchain.idxStatus=(idx)=>{
  if(idx==-1){
    return '<strong style="color:red;">Error!</strong>';
  }else{
    return '<strong style="color:blue;">Success!</strong>';
  }
}

Blockchain.md5CekSum=(indek)=>{
  var md5_valid='';
  const data_mentah=bingkai[indek].md5;

  const hash=(data_mentah.modul
    +data_mentah.metode
    +data_mentah.user_name
    +data_mentah.admin_name
    +data_mentah.timestamp2
    +data_mentah.data
    +data_mentah.previous_hash);
  
  if(blokID(data_mentah.hash)==md5(hash)){
    md5_valid='--VALID--';
  }else{
    md5_valid='--NOT VALID--';
  }
  
  
  
  alert("Column Key:\n[Modul+Method+UserName+AdminName+Timestamp+RawData+PreviousHash]"
    +"\n\nData Blockchain:\n["+hash+']'
    +'\n\nHash MD5:\n['+md5(hash)+']'
    +'\n\nStatus:\n['+md5_valid+']');
}

Blockchain.exportExecute=(indek)=>{
/*  
  db.execute(indek,{
    query:"SELECT"
    +" hash,date,modul,metode,user_name,admin_name,timestamp,"
    +" timestamp2,previous_hash,acak,index,data "
    +" FROM blockchain "
  },(paket)=>{
    if (paket.err.id===0){
      downloadJSON(indek,JSON.stringify(paket),'blockchain.json');
    }else{
      content.infoPaket(indek,paket);
    }    
  });
*/  
  var table_name=Blockchain.table_name;
  var sql=sqlDatabase3(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

Blockchain.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
    +" FROM blockchain"
    +" WHERE hash LIKE '%"+bingkai[indek].text_search+"%'"
    +" OR modul LIKE '%"+bingkai[indek].text_search+"%'"
    +" OR metode LIKE '%"+bingkai[indek].text_search+"%'"
    +" OR user_name LIKE '%"+bingkai[indek].text_search+"%'"
    +" OR timestamp LIKE '%"+bingkai[indek].text_search+"%'"
    +" OR data LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Blockchain.search=(indek)=>{
  Blockchain.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT"
      +" hash,modul,metode,index,user_name,timestamp"
      +" FROM blockchain"
      +" WHERE hash LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR modul LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR metode LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR user_name LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR timestamp LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR data LIKE '%"+bingkai[indek].text_search+"%'"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Blockchain.readShow(indek);
    });
  });
}
//eof: 256;195;239;


function agarSupayaRapih(s){
  
  var a=String(s).split(" ");
  var b="";
  var stmt="";
  var setiap=2;
  var t="";

  for(var i=0;i<a.length;i++){
    t=String(a[i]).trim();
    t=String(t).toUpperCase();
    
    if(i==0){
      alert(t);
      if(t=="UPDATE"){
        stmt="update";
        a[i+2]=a[i+2]+' \n';
      }    
      if(t=="DELETE"){
        stmt="delete";
      }    
      
    }
    if(stmt=='delete'){
      if(t=="WHERE"){
        a[i]='\n'+a[i];
      }
      if(t=="AND"){
        a[i]='\n'+a[i];
      }
    }
    
    b+=a[i]+" ...";
  }
  
  return b;
}
