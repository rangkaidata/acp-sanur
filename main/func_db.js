/*
 * name: budiono;
 * date: sep 18, 12:16, thu-2025; #75; 
 */


var dbFunc={}
var dbo={};

dbFunc.period=new PeriodLook(dbFunc);

dbFunc.getPeriod=(indek,period_id,callback)=>{
  dbFunc.period.getOne(indek,
    period_id,
  (p)=>{
    if(p.err.id==0 && p.count>0){
      var d=objectOne(p.fields,p.data);
      return callback({
        start_date:d.start_date,
        end_date:d.end_date
      });
    }
  });
};

dbo.getCompany=(indek,callback)=>{
  var sql="SELECT company_id,name,start_date"
    +" FROM company"
    +" WHERE company_id='"+bingkai[indek].company.id+"'"
  DownloadEmpat.run(indek,sql,(h)=>{
    var a=JSON.parse(h);
    var d=objectMany(a.fields,a.rows);
    return callback(d);
  });
}

dbo.getDefault=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT period_id"
      +" FROM account_defaults"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
  },(p)=>{
    if(p.count>0){
      var period_id=p.data[0];
      bingkai[indek].rpt.filter.period_id=period_id;
      dbFunc.getPeriod(indek,period_id,(d)=>{
        bingkai[indek].rpt.filter.from=d.start_date;
        bingkai[indek].rpt.filter.to=d.end_date;
        bingkai[indek].rpt.filter.date=d.end_date;
        return callback();
      });
    } else {
      return callback();
    }
  })
}

dbo.getDefaultDate=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT period_id"
      +" FROM account_defaults"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
  },(p)=>{
    if(p.count>0){
      var period_id=p.data[0];
      bingkai[indek].rpt.filter.period_id=period_id;
      dbFunc.getPeriod(indek,period_id,(d)=>{
        bingkai[indek].rpt.filter.date=d.end_date;
        return callback();
      });
    } else {
      return callback();
    }
  })
}



// eof: 
