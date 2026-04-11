/*
 * name: budiono;
 * date: may-11, 15:44, sun-2025; test download tanpa count;
 */ 

var DownloadTiga={};

DownloadTiga.run=(indek, sqlx, callback)=>{

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
  
//  DownloadTiga.count(indek,sqlx,(count)=>{
  function mulai(indek,sqlx){

    let limit=sqlx.limit || 100;// tes begini!!
    let sql=" SELECT "+sqlx.select
      +" FROM "+sqlx.from
      +" WHERE "+sqlx.where;
      // TIDAK BOLEH ADA ORDER, BISA TERJADI DATA KEMBAR;
      
//      if(sqlx.order_by != undefined){
//      if(String(sqlx.order_by).length >0) {
//        sql+=" ORDER BY "+sqlx.order_by;
//      }}
      if(sqlx.group_by != undefined){
        if(String(sqlx.group_by).length >0) {
          sql+=" GROUP BY "+sqlx.group_by;
        }
      }

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
      "table_name": sqlx.from, 
      "fields":"",
      "type":[],
      "rows":[],
      "count": 0
    };    
    
    let layar=getiH('layar_'+indek);
    let kursor=0;
    
    function proses(indek,i2){
      kursor=i2*limit;
      db.run(indek,{// start
        query:sql
          +" LIMIT "+limit
          +" OFFSET "+kursor
      },(paket)=>{        
        i2++;
        
        data_pack.fields=paket.fields;
        
        if (paket.err.id===0){
          if(paket.count>0){
            layar='['+sqlx.from+'] download page '+i2+' OK, '+paket.count+' rows.<br>'+layar
            setiH('layar_'+indek,layar);
            
            
            
            if(paket.count>0){
              my_data.data.push([i2, paket.data ]);
            }
            
            proses(indek,i2);
            
          }else{// empty record stop or finish!!
            
//            alert(0);// count & select tak sesuai
            // sort by 
            var data_sort=my_data.data.sort( sortByPage );
            
            for(let k=0;k<data_sort.length;k++){
              data_pack.rows=data_pack.rows.concat( data_sort[k][1] );
            }
            data_pack.count=data_pack.rows.length;
            layar='['+sqlx.from+'] complete, '+data_pack.count+' rows.<br>'+layar;
            setiH('layar_'+indek,layar);
            callback( JSON.stringify(data_pack) );
          }
        }else{// error, just stop
          layar='<br>['+sqlx.from+'] download error.<br>'+paket.msg+layar;
          setiH('layar_'+indek,);
          // content.infoPaket(indek,paket);
        }
      });
    }
    
    let i=0;
    
    proses(indek,i);
  } 
  
  mulai(indek,sqlx);
}

// eof: 04;
