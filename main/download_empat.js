/*
 * name: budiono;
 * date: may-14, 11:05, wed-2025; #45; report;
 */ 

var DownloadEmpat={};

DownloadEmpat.run=(indek, sqlx, callback)=>{

  function sortByPage(a,b){ // sort multidimensi;
    
    if(a[0] === b[0]){
      return 0;
    }
    else{
      if(a[0] < b[0]) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }

  // sql, TIDAK BOLEH ADA ORDER BY, karena BISA TERJADI DATA KEMBAR; (boleh: hard)
  // sql, tidak perlu ada limit dan offset, biarkan app yg siapkan; (perlu: soft)

  let limit=100;
  let my_data={
    "total_page":0,
    "data":[],
    "fields":[
      'page',
      'data',
    ]
  }

  // join
  let data_pack={
    "table_name": "", 
    "fields":"",
    "type":[],
    "rows":[],
    "count":0,
    "date":"",
  };    
  
  let layar=getiH('layar_'+indek);
  let kursor=0;
    
  function proses(indek,i2){
    kursor=i2*limit;
    db.run(indek,{// start
      query:sqlx
        +" LIMIT "+limit
        +" OFFSET "+kursor
    },(paket)=>{        
      i2++;
      
      data_pack.table_name=paket.modul;
      data_pack.fields=paket.fields;
      data_pack.date=paket.info.date;
      
      if (paket.err.id===0){
        
        if(paket.count>0){
          layar='['+paket.modul+'] download page '+i2+' OK, '+paket.count+' rows.<br>'+layar
          setiH('layar_'+indek,layar);
          
          if(paket.count>0){
            my_data.data.push([i2, paket.data ]);
          }
          
          proses(indek,i2);
          
        }else{// empty record stop or finish!!

          var data_sort=my_data.data.sort( sortByPage );
          
          for(let k=0;k<data_sort.length;k++){
            data_pack.rows=data_pack.rows.concat( data_sort[k][1] );
          }
          data_pack.count=data_pack.rows.length;
          layar='['+paket.modul+'] complete, '+data_pack.count+' rows.<br>'+layar;
          setiH('layar_'+indek,layar);
          
          callback( JSON.stringify(data_pack) );
        }
        
      }else{// error, just stop
        
        layar='<br>['+paket.modul+'] download error.<br>'+paket.msg+layar;
        setiH('layar_'+indek,);
        
      }
    });
  }
    
  let i=0;
    
  proses(indek,i);
}

DownloadEmpat.display=(indek,sql,file_name)=>{
  var html=''
    +'<div id="layar_'+indek+'">'
    +"</div>"
  content.html(indek,html);

  DownloadEmpat.run(indek,sql,(p)=>{
    DownloadEmpat.fileReady(indek,p, file_name);
  });
}

DownloadEmpat.fileReady=(indek, paket, file_name)=>{
  
//  bingkai[indek].paket_data_download=paket;
  var d=JSON.parse(paket);
  
  var data_pack=JSON.stringify({
    "table_name": d.table_name, 
    "fields": d.fields,
    "type": d.type,
    "data": d.rows,
    "count": d.count,
    "date": d.date
  });

  bingkai[indek].data_pack=data_pack;
  
  var html='<div style="padding:0 1rem 0 1rem;">'
    +content.title(indek)
    +'<h1>'+MODE_EXPORT+'</h1>'
    +'Silakan klik tombol berikut untuk mengunduh file.<br>'
    +'<p><a href="" id="export_'+indek+'">Download JSON</a></p>'
    +'<p>'
      +'<div id="export_csv_'+indek+'">'
        +'<p>Klik tombol berikut untuk konversi ke format CSV (tab)'
        +'</p>'
        +'<input type="button" '
        +' onclick="DownloadEmpat.convertToCSV(\''+indek+'\''
        +',\''+file_name+'\')"'
        +' value="Convert to CSV">'
      +'</div>'
      +'<div div id="download_csv_'+indek+'" style="display:none;">'
        +'<p><a href="" id="export2_'+indek+'">Download CSV-tab</a></p>'
      +'</div>'
    +'</p>'
    +'</div>';
  content.html(indek,html);
      
  // Create a blob
  var blob = new Blob([data_pack], { type:'application/json;charset=utf-8;'});
  var url = URL.createObjectURL(blob);
  document.getElementById('export_'+indek).href=url;
  
  var a=document.getElementById('export_'+indek)
  a.setAttribute('download', file_name+'.json');
}

DownloadEmpat.convertToCSV=(indek, file_name)=>{
  var data=JSON.parse(bingkai[indek].data_pack);
  var hasil='';

  hasil=data.fields.join("\t");
  hasil=hasil.concat('\n');

  for(var i=0;i<data.data.length;i++){ // baris
    hasil+=data.data[i].join("\t");
    hasil=hasil.concat("\n");
  };

  // Create a blob
  var blob = new Blob([hasil], { type:'text/tab-separated-values;charset=utf-8;'});
  var url = URL.createObjectURL(blob);
  document.getElementById('export2_'+indek).href=url;
  
  var a=document.getElementById('export2_'+indek);
  a.setAttribute('download', file_name+'.csv');
  
  document.getElementById('export_csv_'+indek).style.display="none";
  document.getElementById('download_csv_'+indek).style.display="block";
}


//---
DownloadEmpat.run2=(indek, sqlx, callback)=>{

  function sortByPage(a,b){ // sort multidimensi;
    
    if(a[0] === b[0]){
      return 0;
    }
    else{
      if(a[0] < b[0]) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }

  // sql, TIDAK BOLEH ADA ORDER BY, karena BISA TERJADI DATA KEMBAR; (boleh: hard)
  // sql, tidak perlu ada limit dan offset, biarkan app yg siapkan; (perlu: soft)

  let limit=100;
  let my_data={
    "total_page":0,
    "data":[],
    "fields":[
      'page',
      'data',
    ]
  }

  // join
  let data_pack={
    "table_name": "", 
    "fields":"",
    "type":[],
    "rows":[],
    "count":0,
    "date":"",
  };    
  
//  let layar=getiH('layar_'+indek);
  let kursor=0;
    
  function proses(indek,i2){
    kursor=i2*limit;
    db.run(indek,{// start
      query:sqlx
        +" LIMIT "+limit
        +" OFFSET "+kursor
    },(paket)=>{        
      i2++;
      
      data_pack.table_name=paket.modul;
      data_pack.fields=paket.fields;
      data_pack.date=paket.info.date;
      
      if (paket.err.id===0){
        
        if(paket.count>0){
//          layar='['+paket.modul+'] download page '+i2+' OK, '+paket.count+' rows.<br>'+layar
//          setiH('layar_'+indek,layar);
          
          if(paket.count>0){
            my_data.data.push([i2, paket.data ]);
          }
          
          proses(indek,i2);
          
        }else{// empty record stop or finish!!

          var data_sort=my_data.data.sort( sortByPage );
          
          for(let k=0;k<data_sort.length;k++){
            data_pack.rows=data_pack.rows.concat( data_sort[k][1] );
          }
          data_pack.count=data_pack.rows.length;
//          layar='['+paket.modul+'] complete, '+data_pack.count+' rows.<br>'+layar;
//          setiH('layar_'+indek,layar);
          
          callback( JSON.stringify(data_pack) );
        }
        
      }else{// error, just stop
        alert('<br>['+paket.modul+'] download error.<br>'+paket.msg);
        //layar='<br>['+paket.modul+'] download error.<br>'+paket.msg+layar;
        //setiH('layar_'+indek,);
        
      }
    });
  }
    
  let i=0;
    
  proses(indek,i);
}
// eof: 04;
