/*
 * auth: budiono;
 * code: L4;
 * path: /apps/tasks.js;
 * --------------------;
 * date: Dec-03, 22:21, tue-2024; #28; files;
 * -----------------------------; happy new year 2025;
 * edit: feb-26, 22:35, wed-2025; #41; file_id;
 * edit: mar-16, 10:37, sun-2025; #43; deep-folder;
 * edit: mar-28, 09:32, fri-2025; #45; ctables;cstructure;
 * edit: jan-08, 11:25, thu-2026; #87; 
 */ 

'use strict';

var Tasks={}
  
Tasks.table_name='tasks';
Tasks.form=new ActionForm2(Tasks);
Tasks.list=new ListLook(Tasks);

Tasks.show=(tiket)=>{
  tiket.modul=Tasks.table_name;
  var baru=exist(tiket);
  if(baru==-1){
    var newTxs=new BingkaiUtama(tiket);
    var indek=newTxs.show();
    createFolder(indek,()=>{
      Tasks.form.modePaging(indek);
    });
  }else{
    show(baru);
  }
}

Tasks.readPaging=(indek)=>{
  bingkai[indek].metode=MODE_READ;
  Tasks.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT task_id,task,date,completed,"
        +"user_name,date_modified"
        +" FROM tasks"
        +" ORDER BY task_id"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Tasks.readShow(indek);
    });
  })
}

Tasks.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
    +" FROM tasks"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Tasks.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border="1">'
    +'<tr>'
      +'<th colspan="2">Task ID</th>'
      +'<th>Date</th>'
      +'<th>Completed</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
      +'<th colspan="3">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    var checked='';
    for (var x in d) {
      n++;
//      (d[x].completed==1)?checked='&check;':checked='';
      (d[x].completed==1)?checked='&#x2705':checked='&#x2610';
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].task+'</td>'
        +'<td align="center">'+tglEast(d[x].date)+'</td>'
        +'<td align="center">'+checked+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button" '
          +' id="btn_change" '
          +' onclick="Tasks.formUpdate(\''+indek+'\''
          +',\''+d[x].task_id+'\');">'
          +'</button></td>'
        +'<td align="center">'
          +'<button type="button" '
          +' id="btn_delete" '
          +' onclick="Tasks.formDelete(\''+indek+'\''
          +',\''+d[x].task_id+'\');">'
          +'</button></td>'
        +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Tasks.form.addPagingFn(indek);// #here
}

Tasks.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html=''
    +'<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'
    +'<ul>'
      +'<li>'
        +'<label>Task:</label>'
        +'<input type="text" '
          +' id="task_'+indek+'"'
          +' size="30">'
      +'</li>'
      +'<li>'
        +'<label>Detail:</label>'
        +'<input type="text" '
          +' id="detail_'+indek+'"'
          +' size="30">'
      +'</li>'
      
      +'<li>'
        +'<label>Date:</label>'
        +'<input type="date" '
          +' id="date_'+indek+'"'
          +' onblur="dateFakeShow('+indek+',\'date\')"'
          +' style="display:none;">'
        +'<input type="text" '
          +' id="date_fake_'+indek+'"'
          +' onfocus="dateRealShow('+indek+',\'date\')"'
          +' size="9" align="center">'
      +'</li>'
    +'</ul>'
    
    +'<detail open>'
    +'<summary>Sub Tasks</summary>'
      +'<div id="sub_tasks_'+indek+'"></div>'
    +'</detail>'
    
    +'<ul>'
    +'<li><label>Favorited:</label>'
      +'<input type="checkbox" '
      +' id="favorited_'+indek+'" >'
    +'</li>'
    
    +'<li><label>Completed:</label>'
      +'<input type="checkbox" '
      +' id="completed_'+indek+'" >'
    +'</li>'
    
    +'<li><label>List ID:</label>'
      +'<input type="text" size="8"'
      +' id="list_id_'+indek+'" '
      +' onchange="Tasks.getList(\''+indek+'\')">'

      +'<button type="button" '
        +' onclick="Tasks.list.getPaging(\''+indek+'\''
        +',\'list_id_'+indek+'\''
        +',-1 );"'
        +' class="btn_find" >'
      +'</button>'

      +'<input type="text" id="list_'+indek+'" disabled>'
      
    +'</li>'

    +'</ul>'
    +'</form>'
    +'</div>';

  content.html(indek,html);
  statusbar.ready(indek);
  
  document.getElementById('task_'+indek).focus();
  setEV('date_'+indek,tglSekarang());
  setEV('date_fake_'+indek,tglWest(tglSekarang()) );
  
  bingkai[indek].sub_tasks=[];
  Tasks.setRows(indek,[]);
}

Tasks.setRows=(indek,isi)=>{
  if(isi===undefined)isi=[];
    
  var p=isi.length;
  var h=Tasks.tableHead(indek);
  var favorited='';
  var completed='';

  bingkai[indek].sub_tasks=isi;

  for (var i=0;i<p;i++){
    isi[i].favorited==1?favorited='checked':favorited='';
    isi[i].completed==1?completed='checked':completed='';
    
    h+='<tr>'
    +'<td align="center">'+(i+1)+'</td>'
    
    +'<td style="margin:0;padding:0">'
      +'<input type="text" size="15"'
      +' id="sub_task_'+i+'_'+indek+'" '
      +' value="'+isi[i].sub_task+'"'
      +' onchange="Tasks.setCell(\''+indek+'\''
      +',\'sub_task_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()"></td>'
      
    +'<td style="margin:0;padding:0">'
      +'<input type="text" '
      +' id="detail_'+i+'_'+indek+'" '
      +' value="'+isi[i].detail+'"'
      +' onchange="Tasks.setCell(\''+indek+'\''
      +',\'detail_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()"></td>'
      
    +'<td style="margin:0;padding:0">'
      +'<input type="text" size="9"'
        +' id="date_fake_'+i+'_'+indek+'" '
        +' value="'+tglWest(isi[i].date)+'"'
        +' onfocus="Tasks.showTgl('+i+','+indek+');"'
        +'">'
      +'<input type="date"'// real_date
        +' id="date_'+i+'_'+indek+'"'
        +' onblur="Tasks.hideTgl(this.value,'+i+','+indek+');"'
        +' value="'+isi[i].date+'"'
        +' style="display:none;"'
        +'  >'
      +'</td>'
      
    +'<td style="margin:0;padding:0;" align="center">'
      +'<input type="checkbox" '+favorited
      +' id="favorited_'+i+'_'+indek+'" '
      +' onchange="Tasks.setCell(\''+indek+'\''
      +',\'favorited_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()"></td>'
      
    +'<td style="margin:0;padding:0" align="center">'
      +'<input type="checkbox" '+completed
      +' id="completed_'+i+'_'+indek+'" '
      +' onchange="Tasks.setCell(\''+indek+'\''
      +',\'completed_'+i+'_'+indek+'\')" '
      +' onfocus="this.select()"></td>'

    +'<td align="center">'
      +'<button type="button"'
      +' id="btn_add" '
      +' onclick="Tasks.addRow(\''+indek+'\','+i+')" ></button>'
      
      +'<button type="button"'
      +' id="btn_remove" '
      +' onclick="Tasks.removeRow(\''+indek+'\','+i+')" ></button>'
    +'</td>'
    +'</tr>';
  }
  h+=Tasks.tableFoot(indek);
  var budi = JSON.stringify(isi);
  document.getElementById('sub_tasks_'+indek).innerHTML=h;
  if(p==0)Tasks.addRow(indek,[]);
}

Tasks.tableHead=(indek)=>{
  return '<table border=0 style="width:100%;" >'
    +'<thead>'
    +'<tr>'
    +'<th colspan="2">Sub Task</th>'
    +'<th>Detail</th>'
    +'<th>Date</th>'
    +'<th>Favorited</th>'
    +'<th>Completed</th>'
    +'<th>Add/Remove</th>'
    +'</tr>'
    +'</thead>';
}

Tasks.tableFoot=(indek)=>{
  return '<tr>'
  +'<td colspan="7">&nbsp;</td>'
  +'</tr>'
  +'</tfoot>'
  +'</table>';
}

Tasks.addRow=(indek,baris)=>{
  var oldBasket=[];
  var newBasket=[];

  oldBasket=bingkai[indek].sub_tasks;

  for(var i=0;i<oldBasket.length;i++){
    newBasket.push(oldBasket[i]);
    if(i==baris)Tasks.newRow(newBasket);
  }
  
  if(oldBasket.length==0)Tasks.newRow(newBasket);
  Tasks.setRows(indek,newBasket);
}

Tasks.newRow=(newBasket)=>{
  var myItem={};
//  myItem.row_id=newBasket.length+1;
  myItem.sub_task="";
  myItem.detail="";
  myItem.date="";
  myItem.favorited=0;
  myItem.completed=0;
  newBasket.push(myItem);
}

Tasks.removeRow=(indek,number)=>{
  var isi=bingkai[indek].sub_tasks;
  var newBasket=[];
  var amount=0;  
  Tasks.setRows(indek,isi);
  for(var i=0;i<isi.length;i++){
    if (i!=(number))newBasket.push(isi[i]);
  }
  Tasks.setRows(indek,newBasket);
}

Tasks.setCell=(indek,id_kolom)=>{
  var isi=bingkai[indek].sub_tasks;
  var baru=[];
  var isiEdit={};

  for (var i=0;i<isi.length; i++){
    isiEdit=isi[i];
    if(id_kolom==('sub_task_'+i+'_'+indek)){
      isiEdit.sub_task=getEV(id_kolom);
      baru.push(isiEdit);
    } else if(id_kolom==('detail_'+i+'_'+indek)){
      isiEdit.detail=getEV(id_kolom);
      baru.push(isiEdit);
    } else if(id_kolom==('date_'+i+'_'+indek)){
      isiEdit.date=getEV(id_kolom);
      baru.push(isiEdit);
    } else if(id_kolom==('favorited_'+i+'_'+indek)){
      isiEdit.favorited=getEC(id_kolom);
      baru.push(isiEdit);
    } else if(id_kolom==('completed_'+i+'_'+indek)){
      isiEdit.completed=getEC(id_kolom);
      baru.push(isiEdit);
    } else{
      baru.push(isi[i]);
    }
  }  
  bingkai[indek].sub_tasks=isi;
}

Tasks.createExecute=(indek)=>{
  var sub_tasks=JSON.stringify(bingkai[indek].sub_tasks);
  var task_id=new Date().getTime();

  db.execute(indek,{
    query:"INSERT INTO tasks "
    +"(task_id,task,detail,date,sub_tasks,favorited,completed"
    +",list_id "
    +") VALUES "
    +"('"+task_id+"'"
    +",'"+getEV("task_"+indek)+"'"
    +",'"+getEV("detail_"+indek)+"'"
    +",'"+getEV("date_"+indek)+"'"
    +",'"+sub_tasks+"'"
    +",'"+getEC("favorited_"+indek)+"'"
    +",'"+getEC("completed_"+indek)+"'"
    +",'"+getEV("list_id_"+indek)+"'"
    +")"
  });
}

Tasks.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
      +" FROM tasks"
      +" WHERE task_id='"+bingkai[indek].task_id+"'"
  },(paket)=>{
    if (paket.err.id==0){
      var d=objectOne(paket.fields,paket.data);
      setEV('task_'+indek, d.task);
      setEV('detail_'+indek, d.detail);
      setEV('date_'+indek, d.date);
      setEV('date_fake_'+indek, tglWest(d.date) );
      setEC('favorited_'+indek, d.favorited);
      setEC('completed_'+indek, d.completed);
      setEV('list_id_'+indek, d.list_id);
      Tasks.setRows(indek,JSON.parse(d.sub_tasks) );
      message.none(indek);
    }
    return callback();
  });
}

Tasks.formUpdate=(indek,task_id)=>{
  bingkai[indek].task_id=task_id
  Tasks.form.modeUpdate(indek);
}

Tasks.updateExecute=(indek)=>{
  let sub_tasks=JSON.stringify(bingkai[indek].sub_tasks);
  
  db.execute(indek,{
    query:"UPDATE tasks "
      +" SET task='"+getEV("task_"+indek) +"'"
      +",detail='"+getEV('detail_'+indek)+"'"
      +",date='"+getEV('date_'+indek)+"'"
      +",sub_tasks='"+sub_tasks+"'"
      +",favorited='"+getEC('favorited_'+indek)+"'"
      +",completed='"+getEC('completed_'+indek)+"'"
      +",list_id='"+getEV('list_id_'+indek)+"'"
      +" WHERE task_id='"+bingkai[indek].task_id+"'"
  },(p)=>{
    if(p.err.id==0) Tasks.deadPath(indek);
  });
}

Tasks.formDelete=(indek,task_id)=>{
  bingkai[indek].task_id=task_id;
  Tasks.form.modeDelete(indek);
}

Tasks.deleteExecute=function(indek){
  db.execute(indek,{
    query:"DELETE FROM tasks"
      +" WHERE task_id='"+bingkai[indek].task_id+"'"
  },(p)=>{
    if(p.err.id==0) Tasks.deadPath(indek);
  });
}

Tasks.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM tasks "
      +" WHERE task_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR task LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR detail LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR sub_tasks LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Tasks.search=(indek)=>{
  Tasks.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT task_id,task,date,completed,"
        +" user_name,date_modified "
        +" FROM tasks"
        +" WHERE task_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR task LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR detail LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR sub_tasks LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Tasks.readShow(indek);
    });
  });
}

Tasks.exportExecute=(indek)=>{
  var table_name=Tasks.table_name;
  var sql=sqlDatabase3(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

Tasks.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){      
    db.run(indek,{
      query:"INSERT INTO tasks "
        +"(task_id,task,detail,date,sub_tasks "
        +",favorited,completed,list_id"
        +") VALUES "
        +"('"+d[i][0]+"'" // task_id
        +",'"+d[i][1]+"'" // task
        +",'"+d[i][2]+"'" // detail
        +",'"+d[i][3]+"'" // date
        +",'"+d[i][4]+"'" // sub_tasks
        +",'"+d[i][5]+"'" // favorited
        +",'"+d[i][6]+"'" // completed
        +",'"+d[i][7]+"'" // list_id
        +")"
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

Tasks.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT task_id,task,detail,date,sub_tasks,favorited"
      +" ,completed,list_id"
      +" ,user_name,date_modified"
      +" FROM tasks"
      +" ORDER BY task_id"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Tasks.selectShow(indek);
  });
}

Tasks.selectShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +'<table border="1">'
    +'<tr>'
      +'<td align="center">'
      +'<input type="checkbox"'
        +' id="check_all_'+indek+'"'
        +' onclick="checkAll(\''+indek+'\')">'
        +'</td>'
      +'<th colspan="2">Task ID</th>'
      +'<th>Task</th>'
      +'<th>Date</th>'
      +'<th>Completed</th>'
      +'<th>Owner</th>'
      +'<th colspan="2">Modified</th>'
    +'</tr>';

  if (p.err.id===0){
    var checked;
    for (var x in d) {
      n++;
//      d[x].completed==1?checked='checked':checked='';
//      d[x].completed==1?checked='&check;':checked='';
      (d[x].completed==1)?checked='&#x2705':checked='&#x2610';
      html+='<tr>'
      +'<td align="center">'
      +'<input type="checkbox"'
        +' id="checked_'+x+'_'+indek+'"'
        +' name="checked_'+indek+'">'
        +'</td>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].task_id+'</td>'
      +'<td align="left">'+xHTML(d[x].task)+'</td>'
      +'<td align="center">'+tglEast(d[x].date)+'</td>'
      +'<td align="center">'+checked+'</td>'
      +'<td align="center">'+d[x].user_name+'</td>'
      +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
      +'<td align="center">'+n+'</td>'
      +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
}

Tasks.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM tasks"
          +" WHERE task_id='"+d[i].task_id+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}

Tasks.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT file_id"
      +" FROM tasks"
      +" WHERE task_id='"+bingkai[indek].task_id+"'"
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

Tasks.duplicate=(indek)=>{
  var id='copy_of '+getEV('task_'+indek);
  setEV('task_'+indek,id);
  focus('task_'+indek);
}

Tasks.deadPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Tasks.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.save(indek,()=>{Tasks.updateExecute(indek);})
    toolbar.properties(indek,()=>{Tasks.properties(indek);})
  }
}

Tasks.showTgl=(kolom,indek)=>{
  var abc=bingkai[indek].sub_tasks[kolom].date
  var dt_fake='date_fake_'+kolom+'_'+indek;
  var dt='date_'+kolom+'_'+indek;
  if(abc==undefined || abc==''){
    var tgl=new Date();
    abc=tgl.getFullYear()
      +'-'+String("00"+(tgl.getMonth()+1)).slice(-2)
      +'-'+String("00"+tgl.getDate()).slice(-2);
  }
  document.getElementById(dt_fake).style.display="none";
  document.getElementById(dt).value=abc;
  document.getElementById(dt).style.display="inline";
  document.getElementById(dt).focus();
}

Tasks.hideTgl=(abc,baris,indek)=>{
  var dt_fake='date_fake_'+baris+'_'+indek;
  var dt='date_'+baris+'_'+indek;
  document.getElementById(dt_fake).value=tglWest(abc);
  document.getElementById(dt_fake).style.display="inline";
  document.getElementById(dt).style.display="none";
  bingkai[indek].sub_tasks[baris].date=getEV(dt);
  Tasks.setCell(indek,dt);
}

Tasks.setList=(indek,data)=>{
  var id_kolom=bingkai[indek].id_kolom;
  setEV(id_kolom, data.list_id);
  Tasks.getList(indek);
}

Tasks.getList=(indek)=>{
  Tasks.list.getOne(indek,
    getEV('list_id_'+indek),
  (paket)=>{
    if(paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      setEV('list_'+indek, d.name);
    }
  });
}





// eof: 426;592;677;709;688;689;692;674;677;
