/*
 * name: budiono;
 * file: 27;
 * path: /accounting/ledgers/period.js;
 * edit: sep-04, 20:01, mon-2023; new;251;
 * edit: dec-29, 18:11, fri-2023; new fn paging+select;
 * -----------------------------; happy new year 2024;
 * edit: feb-02, 11:05, fri-2024; class;
 * edit: apr-25, 12:45, thu-2024; 
 * edit: jun-25, 13:49, tue-2024; r3;
 * edit: jul-27, 12:45, sat-2024; r11;
 * edit: nov-05, 19:21, tue-2024; #24;
 * edit: nov-24, 15:42, sun-2024; #27; locker;
 * edit: dec-20, 18:02, fri-2024; #32; properti+duplicate;
 * edit: dec-23, 10:45, mon-2024; #32;
 * -----------------------------; happy new year 2025;
 * edit: feb-17, 17:14, mon-2025; #40; new properties;
 * edit: mar-11, 10:27, mon-2025; #43; deep folder;
 * edit: mar-25, 14:45; tue-2025; #45; ctables;cstructure;
 * edit: sep-18, 10:34, thu-2025; #75; period_id=end_date;
 * edit: oct-05, 21:00, sun-2025; #79; std_col+big_int;
 */ 
 
'use strict';

var Periods={}

Periods.table_name='period';
Periods.hideSearch=true;
Periods.hideSelect=true;
Periods.form=new ActionForm2(Periods);

Periods.show=(karcis)=>{  
  karcis.modul=Periods.table_name;
  
  var baru=exist(karcis);
  if(baru==-1){
    var newPeriods=new BingkaiUtama(karcis);
    var indek=newPeriods.show();
    getCompanyID(indek);
    getPath2(indek,(h)=>{
      mkdir(indek,h.folder,()=>{
        Periods.form.modePaging(indek);
      });
    })
  }else{
    show(baru);
  }
}

Periods.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM period "
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

Periods.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Periods.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT period_id,start_date,end_date, "
        +" user_name,date_modified "
        +" FROM period "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY start_date DESC "
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Periods.readShow(indek);
    });
  })
}

Periods.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  
  var html ='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +totalPagingandLimit(indek)
    +'<table border=1>'
    +'<th colspan="2">Period</th>'
    +'<th>Start Date</th>'
    +'<th>End Date</th>'
    +'<th>User</th>'
    +'<th>Modified</th>'
    +'<th>Action</th>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="center">'+d[x].period_id+'</td>'
        +'<td align="center">'+tglWest(d[x].start_date)+'</td>'
        +'<td align="center">'+tglWest(d[x].end_date)+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button" id="btn_delete" '
          +' onclick="Periods.formDelete(\''+indek+'\''
          +',\''+d[x].period_id+'\');">'
          +'</button></td>'/*
        +'<td align="center">'
          +'<button type="button" id="btn_change" '
          +' onclick="Periods.formUpdate(\''+indek+'\''
          +',\''+d[x].period_id+'\');">'
          +'</button></td>'*/
        +'</tr>';
    }
  }
  
  html+='</table>'
    +'</div>';

  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Periods.form.addPagingFn(indek);
}

Periods.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding: 0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    //+'<form autocomplete="off" spellcheck=false style="border-left:3px green solid;">'
    +'<form autocomplete="off" spellcheck=false>'
    +'<ul>'
    +'<li><label>Period ID</label>'
      +'<input type="text" id="period_id_'+indek+'" disabled>'
      +'</li>'

    +'<li><label>Start Date</label>'
      +'<input type="date" id="start_date_'+indek+'" disabled hidden>'
      +'<input type="text" id="start_date2_'+indek+'" '
        +'disabled size="9">'
      +'</li>'

    +'<li><label>End Date</label>'
      +'<input type="date" id="end_date_'+indek+'" '
        +' onblur="Periods.ngumpet('+indek+')">'
      +'<input type="text" id="end_date2_'+indek+'" size="9" '
        +' onfocus="Periods.muncul('+indek+')">'
      +'</li>'

    +'<li><label>Text</label>'
      +'<input type="text" id="note_'+indek+'"></li>'

    +'</ul>'
    +'</form>'
    +'</div>';
    /*
    +'<p><i>&#10020 Closing date berfungsi untuk mengunci semua akses '
    +'transaksi berdasarkan tanggal.</i></p>';*/
  
  content.html(indek,html);
  document.getElementById('note_'+indek).focus()
  document.getElementById('end_date_'+indek).style.display="none";
  
  if(metode==MODE_CREATE){
    Periods.startDate(indek,()=>{
      toolbar.back(indek,()=>{Periods.form.modePaging(indek,Periods);});
      toolbar.save(indek,()=>{Periods.createExecute(indek);});
    });
  }
}

Periods.muncul=(indek)=>{
  document.getElementById('end_date2_'+indek).style.display="none";
  document.getElementById('end_date_'+indek).style.display="inline";
  document.getElementById('end_date_'+indek).focus();
}

Periods.ngumpet=(indek)=>{
  document.getElementById('end_date_'+indek).style.display="none";
  document.getElementById('end_date2_'+indek).style.display="inline";
  document.getElementById('end_date2_'+indek).value=
  tglWest(document.getElementById('end_date_'+indek).value);
}

Periods.createExecute=(indek)=>{
  var period_id=tglWest(getEV('end_date_'+indek));
  var note=JSON.stringify([getEV("note_"+indek)]);

  db.execute(indek,{
    query:"INSERT INTO period"
    +"(admin_name,company_id,period_id,end_date,note)"
    +" VALUES "
    +"('"+bingkai[indek].admin.name+"'"
    +",'"+bingkai[indek].company.id+"'"
    +",'"+period_id+"'"
    +",'"+getEV("end_date_"+indek)+"'"
    +",'"+note+"'"
    +")"
  });
}

Periods.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
      +" FROM period "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND period_id='"+bingkai[indek].period_id+"' "
  },(paket)=>{
    if (paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      var note=JSON.parse(d.note);
      setEV('period_id_'+indek, d.period_id);
      setEV('start_date_'+indek, tglWest(d.start_date));
      setEV('start_date2_'+indek, tglWest(d.start_date));      
      setEV('end_date_'+indek, d.end_date);
      setEV('end_date2_'+indek, tglWest(d.end_date));
      setEV('note_'+indek, note[0] );
      message.none(indek);
    }
    return callback();
  });
}

Periods.startDate=(indek,callback)=>{
  message.wait(indek);
  db.run(indek,{
    query:"SELECT MAX(end_date) AS start_date "
      +" FROM period "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(paket)=>{
    if (paket.err.id==0) {
      var d=objectOne(paket.fields,paket.data);
      if(d.start_date==null){
        Periods.companyStartDate(indek,(s)=>{
          Periods.setStartDate(indek,s);
        });
      }else{
        var start_date=datePlusOne(d.start_date)
        Periods.setStartDate(indek,start_date);
      }
    }else{
      setEV('start_date_'+indek, tglSekarang());
      setEV('period_id_'+indek, "Period ");
    }
    message.none(indek);
    return callback();
  });
}

Periods.setStartDate=(indek,start_date)=>{
  setEV('start_date_'+indek, (start_date) );
  setEV('start_date2_'+indek, tglWest((start_date)) );
  setEV('end_date_'+indek, (start_date) );
  setEV('end_date2_'+indek, tglWest((start_date)) ); 
//  setEV('period_id_'+indek, "Period "+(tglWest(start_date)) );// set-ID disini!!!
}

Periods.companyStartDate=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT start_date "
      +" FROM company "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(paket)=>{
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      return callback(d.start_date);
    }
  });
}

Periods.formDelete=(indek,period_id)=>{
  bingkai[indek].period_id=period_id;
  Periods.form.modeDelete(indek);
}

Periods.deleteExecute=(indek)=>{
  db.execute(indek,{
    query:"DELETE FROM period "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND period_id='"+bingkai[indek].period_id+"' "
  });
}

Periods.formUpdate=(indek,period_id)=>{
  bingkai[indek].period_id=period_id;
  Periods.form.modeUpdate(indek);
}

Periods.updateExecute=(indek)=>{

}

Periods.exportExecute=(indek)=>{
  var table_name=Periods.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

Periods.importExecute=(indek)=>{
  
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;
  var i=0;

  document.getElementById('btn_import_all_'+indek).disabled=true;

  d.sort(sortByDate);
  
  prosess(i,()=>{});

  function prosess(i2,callback){
    //+"(admin_name,company_id,period_id,end_date,note)"    
    db.run(indek,{
      query:"INSERT INTO period"
        +"(admin_name,company_id,period_id,end_date,note)"
        +" VALUES"
        +"('"+bingkai[indek].admin.name+"'"
        +",'"+bingkai[indek].company.id+"'"
        +",'"+d[i2][1]+"'" // period_id
        +",'"+d[i2][2]+"'" // date
        +",'"+d[i2][3]+"'" // note
        +")"
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'..'+d[i2][2]+', '+d[i2][3]+'<br>'+m;
      progressBar(indek,n,j,m);
      
      i2++;
      if(i2<j){
        prosess(i2,callback);// next rows;
      }
    });
  }

  function sortByDate(a,b){ // sort multidimensi;
    if(a[2] === b[2]){
      return 0;
    }
    else{
      if(a[2] < b[2]) {
        return -1;
      }
      else{
        return 1;
      }
    }
  }
}

Periods.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT company_id,period_id,date_created"
      +" FROM period "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND period_id='"+getEV('period_id_'+indek)+"'"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data) ;      
      bingkai[indek].file_id=String(":/").concat(
        Periods.table_name,"/",
        d.company_id,"/",
        d.period_id);
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

Periods.finalPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Periods.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Periods.properties(indek);})
  }
}



//eof: 251;271;270;301;346;349;
