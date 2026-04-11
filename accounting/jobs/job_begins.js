/*
 * name: budiono;
 * date: sep-28, 22:37, thu-2023; new;
 * edit: oct-04, 16:16, wed-2023; xHTML;
 * -----------------------------; happy new year 2024;
 * edit: jan-11, 09:49, thu-2024; re-write with class;
 * edit: sep-13, 17:39, fri-2024; r19;
 * edit: nov-26, 13:08, tue-2024; #27; locker;
 * edit: dec-26, 18:11, thu-2024; #32; properties+duplicate;
 * -----------------------------; happy new year 2025;
 * edit: feb-23, 15:49, sun-2025; #41; file_blok;
 * edit: mar-13, 05:56, thu-2025; #43; deep-folder;
 */ 

'use strict';

var JobBegins={};

JobBegins.table_name="job_begins";
JobBegins.title="Job Beginning Balances";
JobBegins.form=new ActionForm2(JobBegins);
JobBegins.job=new JobLook(JobBegins);
JobBegins.phase=new PhaseLook(JobBegins);
JobBegins.cost=new CostLook(JobBegins);

JobBegins.show=(tiket)=>{
  tiket.modul=JobBegins.table_name;
  tiket.menu.name=JobBegins.title;
  
  var baru=exist(tiket);
  if(baru==-1){
    var newCus=new BingkaiUtama(tiket);
    var indek=newCus.show();
    getCompanyID(indek);
    getPath2(indek,(h)=>{
      mkdir(indek,h.folder,(h)=>{
        JobBegins.form.modePaging(indek);
      });
    });
  }else{
    show(baru);
  }
}

JobBegins.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
    +" FROM job_begins"
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

JobBegins.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  JobBegins.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT job_id,job_name,amount,"
        +" user_name,date_modified"
        +" FROM job_begins"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY job_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      JobBegins.readShow(indek);
    });
  })
}

JobBegins.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border=1>'
      +'<tr>'
      +'<th colspan="2">Job ID</th>'
      +'<th>Description</th>'
      +'<th>Balance</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
      +'<th colspan=2>Action</th>'
      +'</tr>';

    if (p.err.id===0){
      var x;
      for (x in d) {
        n++;
        html+='<tr>'
          +'<td align="center">'+n+'</td>'
          +'<td align="left">'+d[x].job_id+'</td>'
          +'<td align="left">'+xHTML(d[x].job_name)+'</td>'
          +'<td align="right">'+d[x].amount+'</td>'

          +'<td align="center">'+d[x].user_name+'</td>'
          +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'

          +'<td align="center">'
            +'<button type="button"'
            +' id="btn_change" '
            +' onclick="JobBegins.formUpdate(\''+indek+'\''
            +',\''+d[x].job_id+'\');">'
            +'</button></td>'
            
          +'<td align="center">'
            +'<button type="button" '
            +' id="btn_delete" '
            +' onclick="JobBegins.formDelete(\''+indek+'\''
            +',\''+d[x].job_id+'\');">'
            +'</button></td>'
          +'</tr>';
      }
    }  
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  JobBegins.form.addPagingFn(indek);
}

JobBegins.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    +'<ul>'
    
    +'<li><label>Job ID:</label>'
      +'<input type="text"'
      +' id="job_id_'+indek+'"'
      +' onchange="JobBegins.getJob(\''+indek+'\')"'
      +' size="12">'
      
      +'<button type="button" '
        +' id="job_btn_'+indek+'" class="btn_find"'
        +' onclick="JobBegins.job.getPaging(\''+indek+'\''
        +',\'job_id_'+indek+'\',-2)">'
        +'</button>'
    +'</li>'
      
    +'<li><label>Description:</label>'
      +'<input type="text"'
      +' id="job_name_'+indek+'"'
      +' disabled'
      +' size="25">'
      +'</li>'
      
    +'<li><label>&nbsp;</label>'
      +'<input type="checkbox" '
        +' id="use_phases_'+indek+'"'
        +' disabled>'
      +'Use Phases'
      +'</li>'
      
    +'</ul>'
        
    +'<details open>'
      +'<summary>Details</summary>'
      +'<div id="begin_detail_'+indek+'"'
        +' style="width:100%;overflow:auto;">'
        +'</div>'
    +'</details>'
    
    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  
  if(metode==MODE_UPDATE){
    document.getElementById('job_id_'+indek).disabled=true;
    document.getElementById('job_btn_'+indek).disabled=true;
  }else{
    document.getElementById('job_id_'+indek).focus();
  }
  JobBegins.setDefault(indek);
  
}

JobBegins.setDefault=(indek)=>{
  JobBegins.setRows(indek,[] );
}

JobBegins.setRows=function(indek,isi){
  if(isi===undefined)isi=[];
    
  var panjang=isi.length;
  var html=JobBegins.tableHead(indek);

  bingkai[indek].begin_detail=isi;
    
  for (var i=0;i<panjang;i++){
    html+='<tr>'
      +'<td align="center">'+(i+1)+'</td>'
    
      +'<td style="margin:0;padding:0">'
        +'<input type="text" id="phase_id_'+i+'_'+indek+'" '
        +' value="'+isi[i].phase_id+'" size="10"'
        +' onchange="JobBegins.setCell(\''+indek+'\''
        +',\'phase_id_'+i+'_'+indek+'\')" '
        +' onfocus="this.select()">'
        +'</td>'
        
      +'<td>'
        +'<button type="button" id="btn_find" '
        +' onclick="JobBegins.phase.getPaging(\''+indek+'\''
        +',\'phase_id_'+i+'_'+indek+'\',\''+i+'\');">'
        +'</button>'
        +'</td>'

      +'<td style="padding:0;margin:0;">'
        +'<input type="text" id="cost_id_'+i+'_'+indek+'"'
        +' value="'+isi[i].cost_id+'" size=10'
        +' onchange="JobBegins.setCell(\''+indek+'\''
        +',\'cost_id_'+i+'_'+indek+'\')"'
        +' onfocus="this.select()" >'
        +'</td>'
        
      +'<td>'
        +'<button type="button" id="btn_find" '
        +' onclick="JobBegins.cost.getPaging(\''+indek+'\''
        +',\'cost_id_'+i+'_'+indek+'\',\''+i+'\');">'
        +'</button>'
        +'</td>'

        
      +'<td style="padding:0;margin:0;">'
        +'<input type="text" id="date_fake_'+i+'_'+indek+'"'
        +' onfocus="JobBegins.tampilTglAsli('+i+','+indek+');" '
        +' size="12" value="'+tglWest(isi[i].date)+'"><br>'
        
        +'<input type="date" id="date_'+i+'_'+indek+'"'
        +' onblur="JobBegins.isiTgl(this.value,'+i+','+indek+');"  '
        +' style="display:none;"></td>'

      +'<td style="padding:0;margin:0;">'
        +'<input type="text" id="expenses_'+i+'_'+indek+'" '
        +' value="'+isi[i].expenses+'" '
        +' size=7'
        +' style="text-align:right"'
        +' onchange="JobBegins.setCell(\''+indek+'\''
        +',\'expenses_'+i+'_'+indek+'\')" '
        +' onfocus="this.select()" >'
        +'</td>'
      
      +'<td style="padding:0;margin:0;">'
        +'<input type="text" id="revenues_'+i+'_'+indek+'" '
        +' value="'+isi[i].revenues+'" '
        +' size=7 '
        +' style="text-align:right"'
        +' onchange="JobBegins.setCell(\''+indek+'\''
        +',\'revenues_'+i+'_'+indek+'\')" '
        +' onfocus="this.select()" >'
        +'</td>'
      
      +'<td align="center">'
        +'<button type="button"'
          +' id="btn_add" '
          +' onclick="JobBegins.addRow(\''+indek+'\','+i+')" >'
          +'</button>'
        +'<button type="button"'
          +' id="btn_remove"'
          +' onclick="JobBegins.removeRow(\''+indek+'\','+i+')" >'
          +'</button>'
      +'</td>'
    +'</tr>';
  }
  html+=JobBegins.tableFoot(indek);
  var budi = JSON.stringify(isi);
  document.getElementById('begin_detail_'+indek).innerHTML=html;
  if(panjang==0)JobBegins.addRow(indek,0);
}

JobBegins.tableHead=(indek)=>{
  return '<table>'
    +'<thead>'
    +'<tr>'
    +'<th>No.</th>'
    +'<th colspan="2">Phase ID</th>'
    +'<th colspan="2">Cost ID</th>'
    +'<th>Date</th>'
    +'<th>Expenses</th>'
    +'<th>Revenues</th>'
    +'<th>Add/Rem</th>'
    +'</tr>'
    +'</thead>';
}

JobBegins.tableFoot=(indek)=>{
  return '<tfoot>'
    +'<tr>'
      +'<td>&nbsp;</td>'
    +'</tr>'
    +'</tfoot>'
    +'</table>';
}

JobBegins.addRow=(indek,baris)=>{
  var oldBasket=[];
  var newBasket=[];
  oldBasket=bingkai[indek].begin_detail;

  for(var i=0;i<oldBasket.length;i++){
    newBasket.push(oldBasket[i]);
    if(i==baris) JobBegins.newRow(newBasket);
  }
  if(oldBasket.length==0) JobBegins.newRow(newBasket);
  JobBegins.setRows(indek,newBasket);
}

JobBegins.newRow=(newBasket)=>{
  var myItem={};
  myItem.row_id=newBasket.length+1;
  myItem.phase_id='';
  myItem.cost_id='';
  myItem.date='';
  myItem.expenses=0;
  myItem.revenues=0;
  newBasket.push(myItem);
}

JobBegins.removeRow=(indek,number)=>{
  var oldBasket=bingkai[indek].begin_detail;
  var newBasket=[];
  
  JobBegins.setRows(indek,oldBasket);
  for(var i=0;i<oldBasket.length;i++){
    if (i!=(number))newBasket.push(oldBasket[i])
  }
  JobBegins.setRows(indek,newBasket);
}

JobBegins.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].begin_detail;
  var baru = [];
  var isiEdit = {};

  for (var i=0;i<isi.length; i++){
    isiEdit=isi[i];
    
    if(id_kolom==('phase_id_'+i+'_'+indek)){
      isiEdit.phase_id=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
      
    }else if(id_kolom==('cost_id_'+i+'_'+indek)){
      isiEdit.cost_id=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
      
    }else if(id_kolom==('date_'+i+'_'+indek)){
      // alert(id_kolom);
      isiEdit.date=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
      
    }else if(id_kolom==('expenses_'+i+'_'+indek)){
      isiEdit.expenses=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
      
    }else if(id_kolom==('revenues_'+i+'_'+indek)){
      isiEdit.revenues=document.getElementById(id_kolom).value;
      baru.push(isiEdit);
      
    }else{
      baru.push(isi[i]);
    }
  }
  bingkai[indek].begin_detail=isi;
}

JobBegins.setJob=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, data);
  JobBegins.getJob(indek);
}

JobBegins.getJob=(indek)=>{
  JobBegins.job.getOne(indek,
    getEV('job_id_'+indek),
  (paket)=>{
    setEV('job_name_'+indek, txt_undefined);
    setEC('use_phases_'+indek, 0);

    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('job_name_'+indek, d.name);
      setEC('use_phases_'+indek, d.use_phases);
    }
  });
}

JobBegins.tampilTglAsli=(kolom,indek)=>{
  var abc=bingkai[indek].begin_detail[kolom].date;
  if(abc==''){
    var tgl=new Date();
    abc=tgl.getFullYear()
    +'-'+String("00"+(tgl.getMonth()+1)).slice(-2)
    +'-'+String("00"+tgl.getDate()).slice(-2);
  }
  
  document.getElementById('date_fake_'+kolom+'_'+indek).style.display="none";
  document.getElementById('date_'+kolom+'_'+indek).value=abc;
  document.getElementById('date_'+kolom+'_'+indek).style.display="inline";
  document.getElementById('date_'+kolom+'_'+indek).style.width="231px";
  document.getElementById('date_'+kolom+'_'+indek).focus();
}

JobBegins.isiTgl=(abc,baris,indek)=>{
  var dateEdit=getEV('date_'+baris+'_'+indek);
  //JobBegins.setCell(indek,baris,'date',dateEdit);
  JobBegins.setCell(indek,'date_'+baris+'_'+indek);

  document.getElementById('date_fake_'+baris+'_'+indek).value=tglWest(abc);
  document.getElementById('date_fake_'+baris+'_'+indek).style.display="inline";
  document.getElementById('date_'+baris+'_'+indek).style.display="none";
}

JobBegins.setPhase=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, data.phase_id);
  JobBegins.setCell(indek,id_kolom);
}

JobBegins.setCost=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, data.cost_id);
  JobBegins.setCell(indek,id_kolom);
}

JobBegins.createExecute=(indek)=>{

  var detail=JSON.stringify(bingkai[indek].begin_detail);

  db.execute(indek,{
    query:"INSERT INTO job_begins"
      +"(admin_name,company_id,job_id,detail)"
      +" VALUES "
      +"('"+bingkai[indek].admin.name+"'"
      +",'"+bingkai[indek].company.id+"'"
      +",'"+getEV('job_id_'+indek)+"'"
      +",'"+detail+"'"
      +")"
  });
}

JobBegins.readOne=(indek,callback)=>{

  JobBegins.setRows(indek,[]);

  db.execute(indek,{
    query:"SELECT * "
      +" FROM job_begins"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND job_id='"+bingkai[indek].job_id+"'"
  },(paket)=>{
    if (paket.err.id==0) {
      var d=objectOne(paket.fields,paket.data);
      setEV('job_id_'+indek, d.job_id);
      setEV('job_name_'+indek, d.job_name);
      setEC('use_phases_'+indek, d.use_phases);
      JobBegins.setRows(indek, JSON.parse(d.detail));
      message.none(indek);
    }
    return callback();
  });
}

JobBegins.formUpdate=function(indek,job_id){
  bingkai[indek].job_id=job_id;
  JobBegins.form.modeUpdate(indek);
}

JobBegins.updateExecute=function(indek){

  var detail=JSON.stringify(bingkai[indek].begin_detail);
  
  db.execute(indek,{
    query:"UPDATE job_begins"
      +" SET detail='"+detail+"'"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND job_id='"+bingkai[indek].job_id+"'"
  },(p)=>{
    if(p.err.id==0) JobBegins.endPath( indek );
  });
}

JobBegins.formDelete=function(indek,job_id){
  bingkai[indek].job_id=job_id;
  JobBegins.form.modeDelete(indek);
}

JobBegins.deleteExecute=function(indek){
  db.execute(indek,{
    query:"DELETE FROM job_begins"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND job_id='"+bingkai[indek].job_id+"'"
  },(p)=>{
    if(p.err.id==0) JobBegins.endPath( indek );
  });
}

JobBegins.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM job_begins "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND job_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

JobBegins.search=(indek)=>{
  JobBegins.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT job_id,job_name,amount,"
        +" user_name,date_modified "
        +" FROM job_begins "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND job_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR job_name LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      JobBegins.readShow(indek);
    });
  });
}

JobBegins.exportExecute=(indek)=>{
  var table_name=JobBegins.table_name;
  var sql=sqlDatabase2(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

JobBegins.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;

  for (var i=0;i<j;i++){    
    db.run(indek,{
      query:"INSERT INTO job_begins"
        +"(admin_name,company_id,job_id,detail)"
        +" VALUES "
        +"('"+bingkai[indek].admin.name+"'"
        +",'"+bingkai[indek].company.id+"'"
        +",'"+d[i][1]+"'" // job_id
        +",'"+d[i][2]+"'" // detail
        +")"
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

JobBegins.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT job_id,job_name,amount,"
      +" user_name,date_modified"
      +" FROM job_begins"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" ORDER BY job_id"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    JobBegins.selectShow(indek);
  });
}

JobBegins.selectShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
  +content.title(indek)
  +content.message(indek)
  +'<table border=1>'
    +'<tr>'
      +'<td align="center">'
      +'<input type="checkbox"'
      +' id="check_all_'+indek+'"'
      +' onclick="checkAll(\''+indek+'\')">'
      +'</td>'
    +'<th>Job ID</th>'
    +'<th>Description</th>'
    +'<th>Beginning Balance</th>'
    +'<th>Owner</th>'
    +'<th>Modified</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
      +'<td align="center">'
        +'<input type="checkbox"'
        +' id="checked_'+x+'_'+indek+'"'
        +' name="checked_'+indek+'" >'
      +'</td>'
      +'<td align="left">'+d[x].job_id+'</td>'
      +'<td align="left">'+xHTML(d[x].job_name)+'</td>'
      +'<td align="right">'+d[x].amount+'</td>'

      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'</tr>';
    }
  }
  
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

JobBegins.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany( p.fields,p.data );
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked){
      a.push({
        query:"DELETE FROM job_begins"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND job_id='"+d[i].job_id+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

JobBegins.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM job_begins"
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND job_id='"+getEV('job_id_'+indek)+"'"
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

JobBegins.duplicate=(indek)=>{
  var id='copy_of '+getEV('job_id_'+indek);
  document.getElementById('job_id_'+indek).value=id;
  document.getElementById('job_id_'+indek).focus();
  //--disabled
  document.getElementById('job_id_'+indek).disabled=false;
  document.getElementById('job_btn_'+indek).disabled=false;
}

JobBegins.endPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{JobBegins.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{JobBegins.properties(indek);})
  }
}



// eof: 580;536;714;703;706;
