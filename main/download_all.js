/*
 * auth: budiono;
 * date: apr-17, 17:01, thu-2025; #48; tesData;
 * edit: apr-24, 20:38, thu-2025; #50; bisa export tanpa order_by;
 * edit: aug-19, 10:28, tue-2025; #69; 
 */

var DownloadAllPage={};

DownloadAllPage.viewForm=(indek, sqlx, file_name)=>{
  DownloadAllPage.count(indek,sqlx,(count)=>{
    var limit=sqlx.limit;
    var total_page=Math.ceil( count/limit );
    var sql=" SELECT "+sqlx.select
      +" FROM "+sqlx.from
      +" WHERE "+sqlx.where;
      if(sqlx.order_by != undefined){
      if(String(sqlx.order_by).length >0) {
        sql+=" ORDER BY "+sqlx.order_by;
      }}

    var my_data={
      "total_page":total_page,
      "data":[],
      "fields":[
        'page',
        'data',
      ]
    }
    var j=0;
    var kolom=[];
    
    for(var i=0;i<total_page;i++){
      db.execute(indek,{
        query:sql
          +" LIMIT "+limit
          +" OFFSET "+(i*limit)
      },(paket)=>{
        if (paket.err.id===0){
          kolom=paket.fields;
          if(paket.count>0){
            my_data.data.push([j, paket.data ]);
          }
          j++;
          if(j==total_page){
            // join
            var data_1=[];
            var my_data2={
              "fields": kolom,
              "data": []
            }
            for(var k=0;k<my_data.data.length;k++){
              data_1=data_1.concat( my_data.data[k][1] );
            }
            my_data2.data=data_1
            DownloadAllPage.fileReady(indek, JSON.stringify(my_data2), file_name);
          }
        }else{
          content.infoPaket(indek,paket);
        }
      });  
    }
  })
}

DownloadAllPage.count=(indek,sql,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM "+sql.from
      +" WHERE "+sql.where
  },(paket)=>{
    if(paket.err.id==0){
      return callback( paket.data[0][0] );
    }else{
      return callback( 0 )
    }
  });
}

DownloadAllPage.fileReady=(indek, paket, file_name)=>{
  bingkai[indek].paket_data_download=paket;
  
  var html='<div style="padding:0 1rem 0 1rem;">'
    +'<h1>'+MODE_EXPORT+'</h1>'
    +'Silakan klik tombol berikut untuk mengunduh file.<br>'
    +'<p><a href="" id="export_'+indek+'">Download JSON</a></p>'
    +'<p>'
      +'<div id="export_csv_'+indek+'">'
        +'<p>Klik tombol berikut untuk konversi ke format CSV (tab)'
        +'</p>'
        +'<input type="button" '
        +' onclick="DownloadAllPage.convertToCSV(\''+indek+'\''
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
  var blob = new Blob([paket], { type:'application/json;charset=utf-8;'});
  var url = URL.createObjectURL(blob);
  document.getElementById('export_'+indek).href=url;
  
  const a=document.getElementById('export_'+indek)
  a.setAttribute('download', file_name+'.json');
}

DownloadAllPage.convertToCSV=(indek, file_name)=>{
  var data=JSON.parse(bingkai[indek].paket_data_download);
  var hasil='';

  hasil=data.fields.join("\t");
  hasil=hasil.concat('\n');
  
  for(var i=0;i<data.data.length;i++){//baris
    hasil+=data.data[i].join("\t");
    hasil=hasil.concat("\n");
  }
      
  // Create a blob
  var blob = new Blob([hasil], { type:'text/tab-separated-values;charset=utf-8;'});
  var url = URL.createObjectURL(blob);
  document.getElementById('export2_'+indek).href=url;
  
  const a=document.getElementById('export2_'+indek)
  a.setAttribute('download', file_name+'.csv');
  
  document.getElementById('export_csv_'+indek).style.display="none";
  document.getElementById('download_csv_'+indek).style.display="block";
}


// eof: 115; 110;129;
