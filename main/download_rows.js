/*
 * 
 */ 

var DownloadRows={};

DownloadRows.run=(indek, sqlx, callback)=>{

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
  
  DownloadRows.count(indek,sqlx,(count)=>{
    let limit=sqlx.limit || 100;// tes begini!!
    let total_page=Math.ceil( count/limit );
    let sql=" SELECT "+sqlx.select
      +" FROM "+sqlx.from
      +" WHERE "+sqlx.where;
      if(sqlx.order_by != undefined){
      if(String(sqlx.order_by).length >0) {
        sql+=" ORDER BY "+sqlx.order_by;
      }}
      if(sqlx.group_by != undefined){
        if(String(sqlx.group_by).length >0) {
          sql+=" GROUP BY "+sqlx.group_by;
        }
      }

    let my_data={
      "total_page":total_page,
      "data":[],
      "fields":[
        'page',
        'data',
      ]
    }
    let j=0;
    // join
    let data_pack={
      "table_name": sqlx.from, 
      "fields":"",
      "type":[],
      "rows":[],
      "count": 0
    };    

    for(let i=0;i<total_page;i++){
      db.execute(indek,{
        query:sql
          +" LIMIT "+limit
          +" OFFSET "+(i*limit)
      },(paket)=>{
        if (paket.err.id===0){
          if(paket.count>0){
            data_pack.fields=paket.fields;
            
            if(paket.count>0){
              my_data.data.push([j, paket.data ]);
            }
            j++;
            if(j==total_page){
              // sort by 
              var data_sort=my_data.data.sort( sortByPage );
              
              for(let k=0;k<data_sort.length;k++){
                data_pack.rows=data_pack.rows.concat( data_sort[k][1] );
              }
              data_pack.count=data_pack.rows.length;
              callback( JSON.stringify(data_pack) );
            }
          }else{
            alert(0);// count & select tak sesuai
          }
        }else{
          content.infoPaket(indek,paket);
        }
      });  
    }
    if(total_page==0){
      callback( JSON.stringify(data_pack) );
    }
  })
}

DownloadRows.count=(indek,sqlx,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM "+sqlx.from
      +" WHERE "+sqlx.where
  },(paket)=>{
    if(paket.err.id==0){
      return callback( paket.data[0][0] );
    }else{
      return callback( 0 )
    }
  });
}

// eof: 04;
