/*
 * name: budiono;
 * code: K1;
 * path: /accounting/ledgers/close_period.js;
 * -----------------------------------------;
 * date: nov-06, 13:01, wed-2024; #24;
 * -----------------------------; happy new year 2025;
 * edit: jan-01, 22:48, wed-2025; #32; properties+duplicate;
 * edit: mar-27, 16:08, thu-2025; #45; ctables;cstructure;
 */
 
'use strict';

var ClosePeriod={};

ClosePeriod.table_name='close_period';
ClosePeriod.form=new ActionForm2(ClosePeriod);
ClosePeriod.period=new PeriodLook(ClosePeriod);

ClosePeriod.show=(tiket)=>{
  tiket.modul=ClosePeriod.table_name;
  const baru=exist(tiket);
  if(baru==-1){
    const newReg=new BingkaiUtama(tiket);
    const indek=newReg.show();
    createFolder(indek,()=>{
      ClosePeriod.formUpdate(indek);
    });
  }else{
    show(baru);
  }  
}

ClosePeriod.formUpdate=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.close(indek);
  toolbar.more(indek,()=>Menu.more(indek));
  ClosePeriod.formEntry(indek);
  ClosePeriod.readOne(indek,()=>{
    toolbar.edit(indek,()=>{ClosePeriod.formEdit(indek);});
    toolbar.refresh(indek,()=>{ClosePeriod.formUpdate(indek);});
  });
}

ClosePeriod.formEdit=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ClosePeriod.formUpdate(indek);});
  toolbar.save(indek,()=>{ClosePeriod.saveExecute(indek);});
  toolbar.delet(indek,()=>{ClosePeriod.deleteExecute(indek);});
  toolbar.properties(indek,()=>ClosePeriod.properties(indek));
  ClosePeriod.view(indek,false);
}

ClosePeriod.formEntry=(indek)=>{
  bingkai[indek].metode=MODE_UPDATE;
  
  var html='<div style="margin:1rem;">'
    +content.title(indek)
    +'<div id="msg_'+indek+'" style="margin:0.5rem;"></div>'
    +'<form autocomplete="off">'
    +'<ul>'
      +'<li><label>Period ID</label>'
      +'<input type="text" id="period_id_'+indek+'" size="17">'
      
      +'<button type="button" '
        +' id="btn_period_'+indek+'" '
        +' onclick="ClosePeriod.period.getPaging(\''+indek+'\''
        +',\'period_id_'+indek+'\')"'
        +' class="btn_find">'
      +'</button>'
      
      +'</li>'
      +'<li><label>Start Date</label>'
      +'<input type="text" id="start_date_'+indek+'" disabled size="12">'
      +'</li>'
      
      +'<li><label>End Date</label>'
      +'<input type="text" id="end_date_'+indek+'" disabled size="12">'
      +'</li>'
      +'</li>'
    +'</ul>'
    +'</form>'
    +'</div>';

  content.html(indek,html);
  ClosePeriod.view(indek,true);
}

ClosePeriod.view=(indek,lock)=>{
//  alert(lock);
  document.getElementById('period_id_'+indek).disabled=lock;
  document.getElementById('btn_period_'+indek).disabled=lock;
}

ClosePeriod.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * FROM close_period"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(paket)=>{
    if (paket.count>0){
      const d=objectOne(paket.fields,paket.data);
      
      setEV('period_id_'+indek, d.period_id);
      setEV('start_date_'+indek, tglWest(d.start_date));
      setEV('end_date_'+indek, tglWest(d.end_date));
      
    }
    message.none(indek);
    return callback();
  });
}

ClosePeriod.setPeriod=(indek,d)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, d.period_id);
  ClosePeriod.getPeriod(indek);
}

ClosePeriod.getPeriod=(indek)=>{
  message.none(indek);
  ClosePeriod.period.getOne(indek,
    getEV('period_id_'+indek),
  (paket)=>{
    if(paket.err.id==0 && paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('start_date_'+indek, tglWest(d.start_date) );
      setEV('end_date_'+indek, tglWest(d.end_date) );
    }else{
      setEV('start_date_'+indek, '');
      setEV('end_date_'+indek, '');
    }
  });
}

ClosePeriod.saveExecute=(indek)=>{
  db.run(indek,{
    query:"SELECT * FROM close_period "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(paket)=>{
    if(paket.count==0){
      ClosePeriod.createExecute(indek);
    }else{
      ClosePeriod.updateExecute(indek);
    }
  });
}

ClosePeriod.getDir=(indek)=>{
  return {
    folder:'/'+bingkai[indek].company.id,
    name:ClosePeriod.table_name
  };
}

ClosePeriod.createExecute=(indek)=>{
  db.execute(indek,{
    query:"INSERT INTO close_period"
      +"(admin_name,company_id,period_id"
      +") VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEV('period_id_'+indek)+"'"
      +")"
  },(p)=>{
    if(p.err.id==0){
      ClosePeriod.finalPath(indek);
    }
  });
}

ClosePeriod.updateExecute=(indek)=>{
  bingkai[indek].metode=MODE_UPDATE;
  db.execute(indek,{
    query:"UPDATE close_period"
      +" SET period_id='"+getEV('period_id_'+indek)+"'"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(p)=>{
    if(p.err.id==0){
      ClosePeriod.finalPath(indek);
    }
  });
}

ClosePeriod.deleteExecute=(indek)=>{
  bingkai[indek].metode=MODE_DELETE;
  db.execute(indek,{
    query:"DELETE FROM close_period"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(p)=>{
    if(p.err.id==0){
      ClosePeriod.finalPath(indek);
    }
  });
}

ClosePeriod.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM close_period"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data) ;      
      bingkai[indek].file_id=d.file_id;
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

ClosePeriod.finalPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{ClosePeriod.formUpdate(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{ClosePeriod.properties(indek);})
  }
}





// eof: 156;182;227;229;219;
