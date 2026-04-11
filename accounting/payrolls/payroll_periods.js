/*
 * name: budiono
 * date: sep-14, 16:34, thu-2023; new;
 * -----------------------------; happy new year 2024;
 * edit: jan-01, 10:53, mon-2023; mringkas;
 * edit: feb-03, 17:43, sat-2024; class;
 */ 

'use strict';

var PayrollPeriods={}
PayrollPeriods.url='payroll_periods';
PayrollPeriods.title='Payroll Periods';
PayrollPeriods.hideSearch=true;
PayrollPeriods.hideSelect=true;
PayrollPeriods.form=new ActionForm2(PayrollPeriods);

PayrollPeriods.show=(karcis)=>{
  karcis.modul=PayrollPeriods.url;
  karcis.menu.name=PayrollPeriods.title;
  karcis.child_free=false;
  karcis.add_param_pay_frequency=true;

  const baru=exist(karcis);
  if(baru==-1){
    const newPeriods=new BingkaiUtama(karcis);
    const indek=newPeriods.show();
    PayrollPeriods.form.modePaging(indek);
    
    EmployeeDefaults.getDefault(indek,()=>{
      bingkai[indek].pay_frequency=bingkai[indek].data_default.pay_frequency;
//      showFormPaging(indek,PayrollPeriods);
    });
  }else{
    show(baru);
  }
}

PayrollPeriods.changePayFrequency=(indek)=>{
  bingkai[indek].pay_frequency=getEI('pay_frequency_'+indek);
  PayrollPeriods.form.modePaging(indek);
}

PayrollPeriods.readShow=(indek)=>{
  const p=bingkai[indek].paket;
  const d=p.data;
  
  var html =''
    +'<div style="padding:0 1rem 0 1rem;">'
    +content.title(indek)
    +content.message(indek)
    
    +'<p><label>Frequency:</label>'
      +'<select id="pay_frequency_'+indek+'"'
      +' onchange="PayrollPeriods.changePayFrequency(\''+indek+'\')">'
      +getDataPayFrequency(indek)
      +'</select></p>'

    +pagingAndLimit(indek)
    
    +'<table border=1>'
      +'<th colspan="3">Period</th>'
      +'<th>Start Date</th>'
      +'<th>End Date</th>'
      +'<th>User</th>'
      +'<th>Modified</th>'
      +'<th>Action</th>';

  if (p.err.id===0){
    for (var x in d) {
      html+='<tr>'
        +'<td align="center">'+d[x].row_id+'</td>'
        +'<td align="center">'
          +array_pay_frequency[d[x].pay_frequency]
          +'</td>'
        +'<td align="center">'+d[x].period_id+'</td>'
        +'<td align="center">'
          +tglWest(d[x].start_date)+'</td>'
        +'<td align="center">'
          +tglWest(d[x].end_date)+'</td>'
      
        +'<td align="center">'
          +d[x].info.user_name+'</td>'
        +'<td align="center">'
          +tglInt(d[x].info.date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button" id="btn_delete" '
          +' onclick="PayrollPeriods.formDelete(\''+indek+'\''
          +',\''+d[x].pay_frequency+'\''
          +',\''+d[x].period_id+'\');">'
          +'</button></td>'
        +'</tr>';
    }
  }
  
  html+='</table>'
//    +'<p><i>&#10020 Closing date berfungsi untuk mengunci semua '
//    +'akses transaksi berdasarkan tanggal.</i></p>'
    +'</div>';

  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  
  setEI('pay_frequency_'+indek,bingkai[indek].pay_frequency);
  
  if(READ_PAGING) PayrollPeriods.form.addPagingFn(indek);
}

PayrollPeriods.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding: 0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'

    +'<ul>'
    +'<li><label>Period ID:</label>'
      +'<input type="text" '
      +'id="period_id_'+indek+'" disabled>'
      +'</li>'
      
    +'<li><label>Frequency:</label>'
      +'<select id="pay_frequency_'+indek+'"'
      +' onchange="PayrollPeriods.startDate(\''+indek+'\')">'
      +getDataPayFrequency(indek)
      +'</select></li>'

    +'<li><label>Start Date:</label>'
      +'<input type="date" '
      +' id="start_date_'+indek+'" disabled hidden>'
      
      +'<input type="text" '
        +' id="start_date2_'+indek+'" '
        +'disabled size="9">'
      +'</li>'

    +'<li><label>End Date:</label>'
      +'<input type="date" '
        +' id="end_date_'+indek+'" '
        +' onblur="PayrollPeriods.ngumpet('+indek+')">'
        
      +'<input type="text" '
        +' id="end_date2_'+indek+'" size="9" '
        +' onfocus="PayrollPeriods.muncul('+indek+')">'
      +'</li>'

    +'<li><label>Text:</label>'
      +'<input type="text" '
      +' id="period_note_'+indek+'"></li>'

    +'</ul>'
    +'</form>';
    //+'<p><i>&#10020 Closing date berfungsi untuk mengunci semua akses '
    //+'transaksi berdasarkan tanggal.</i></p>';
  
  content.html(indek,html);
  document.getElementById('period_note_'+indek).focus()
  document.getElementById('end_date_'+indek).style.display="none";

  PayrollPeriods.setDefault(indek);
  PayrollPeriods.startDate(indek);
}

PayrollPeriods.muncul=(indek)=>{
  document.getElementById('end_date2_'+indek).style.display="none";
  document.getElementById('end_date_'+indek).style.display="inline";
  document.getElementById('end_date_'+indek).focus();
}

PayrollPeriods.ngumpet=(indek)=>{
  document.getElementById('end_date_'+indek).style.display="none";
  document.getElementById('end_date2_'+indek).style.display="inline";
  setEV('end_date2_'+indek, tglWest(getEV('end_date_'+indek)) );
}

PayrollPeriods.setDefault=(indek)=>{
  setEV('pay_frequency_'+indek, bingkai[indek].pay_frequency);
}

PayrollPeriods.createExecute=(indek)=>{
  const kode=tglWest(getEV("start_date_"+indek))+' to '
    +tglWest(getEV("end_date_"+indek));// 
  const kode2=getEV("end_date_"+indek);

  setEV("period_id_"+indek, kode2);
  db3.createOne(indek,{
    "pay_frequency":getEI("pay_frequency_"+indek),
    "period_id":getEV("period_id_"+indek),
    "end_date":getEV("end_date_"+indek),
    "period_note":getEV("period_note_"+indek)
  });
  
  bingkai[indek].pay_frequency=getEI('pay_frequency_'+indek);
}

PayrollPeriods.startDate=(indek)=>{
  db3.query(indek,'payroll_periods/read_start',{
    'pay_frequency':getEV('pay_frequency_'+indek)
  },(paket)=>{
    if (paket.err.id==0) {
      const d=paket.data;
      setEV('start_date_'+indek, d.start_date);
      setEV('start_date2_'+indek, tglWest(d.start_date));
      
      setEV('end_date_'+indek, datePlusOne(d.start_date) );
      setEV('end_date2_'+indek, tglWest(datePlusOne(d.start_date)) );
    }else{
      setEV('start_date_'+indek, tglSekarang());
      message.infoPaket(indek,paket);
    }
  });
}

PayrollPeriods.readOne=(indek,callback)=>{
  db3.readOne(indek,{
    "pay_frequency":bingkai[indek].pay_frequency,
    "period_id":bingkai[indek].period_id
  },(paket)=>{
    if (paket.err.id==0 && paket.count>0){
      const d=paket.data;
      setEV('pay_frequency_'+indek, d.pay_frequency);
      setEV('period_id_'+indek, d.period_id);
      setEV('start_date_'+indek, tglWest(d.start_date));
      setEV('start_date2_'+indek, tglWest(d.start_date));
      
      setEV('end_date_'+indek, d.end_date);
      setEV('end_date2_'+indek, tglWest(d.end_date));
      
      setEV('period_note_'+indek, d.period_note);
    }
    message.none(indek);
    return callback();
  });
}

PayrollPeriods.formDelete=(indek,pay_frequency,period_id)=>{
  bingkai[indek].pay_frequency=pay_frequency;
  bingkai[indek].period_id=period_id;
  PayrollPeriods.form.modeDelete(indek);
}

PayrollPeriods.deleteExecute=(indek)=>{
  db3.deleteOne(indek,{
    "pay_frequency":bingkai[indek].pay_frequency,
    "period_id":bingkai[indek].period_id
  });
}

PayrollPeriods.exportExecute=(indek)=>{
  db3.readExport(indek,{},(paket)=>{
    if (paket.err.id===0){
      downloadJSON(indek,JSON.stringify(paket),'payroll_periods.json');
    }else{
      content.infoPaket(indek,paket);
    }
  });
}

PayrollPeriods.importExecute=(indek)=>{
  alert('import waiting ascending (sync)');
}
// 279;247;
