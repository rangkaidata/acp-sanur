/*
 * auth: budiono;
 * code: L2;
 * path: /apps/notes.js;
 * --------------------;
 * date: sep-04, 20:15, mon-2023;new;44;
 * edit: oct-02, 20:45, mon-2023;with crudse;
 * edit: oct-12, 15:06, thu-2023;str10;
 * -----------------------------; happy new year 2025;
 * edit: jan-07, 21:07, tue-2025; #34; apps common;
 * edit: feb-06, 06:56, thu-2025; #39; *dir;
 * edit: feb-26, 20:16, wed-2025; #41; file_id;
 * edit: mar-15, 22:33, sat-2025; #43; deep-folder;
 * edit: mar-28, 09:20, fri-2025; #45; ctables;cstructure;
 */ 
 
'use strict';

var Notes={};
/*
(function(namespace) {
  var i=0;
  namespace.counter=function(){
    return i++;
  };
})(Notes);
*/
Notes.table_name='notes';
Notes.form=new ActionForm2(Notes);
Notes.label=new LabelLook(Notes);

Notes.show=(tiket)=>{
  tiket.modul=Notes.table_name;
  tiket.bisa.tambah=1;
  
  const baru=exist(tiket);
  if(baru==-1){
    const newReg=new BingkaiUtama(tiket);
    const indek=newReg.show();
    createFolder(indek,()=>{
      Notes.ix=indek;// ini namespace global;
      Notes.form.modePaging(indek);
      bingkai[indek].labels=[];
    });
  }else{
    show(baru);
  }
}

Notes.readPaging=(indek)=>{
  bingkai[indek].labels=[];
  bingkai[indek].metode=MODE_READ;
  Notes.count(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT note_id,title,note,labels,pinned"
        +" ,user_name,date_modified"
        +" FROM notes"
        +" ORDER BY pinned DESC, date_created DESC"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=true;
      Notes.readShow(indek);
    });
  })
}

Notes.count=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*)"
      +" FROM notes"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Notes.readShow=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var n=bingkai[indek].paging.offset;
  
  var html='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +pagingLimit(indek)
    +'<table border=1>'
    +'<tr>'
      +'<th colspan="2">Title</th>'
      +'<th>Note</th>'
      +'<th>Pinned</th>'
      +'<th>Owner</th>'
      +'<th>Modified</th>'
      +'<th colspan="3">Action</th>'
    +'</tr>';

  if (p.err.id===0){
    var pinned='';
    var x;
    for (x in d) {
      pinned='';
      if(Number(d[x].pinned)==1) pinned='&#x1f4CD';
      n++;
      html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+xHTML(d[x].title)+'</td>'
        +'<td align="left">'+xHTML(strN(atob(d[x].note),30))+'</td>'
        +'<td align="center">'+pinned+'</td>'
        +'<td align="center">'+d[x].user_name+'</td>'
        +'<td align="center">'+tglInt(d[x].date_modified)+'</td>'
        +'<td align="center">'
          +'<button type="button" '
          +' id="btn_change" '
          +' onclick="Notes.formUpdate(\''+indek+'\''
          +',\''+d[x].note_id+'\');">'
          +'</button></td>'
        +'<td align="center">'
          +'<button type="button" '
          +' id="btn_delete" '
          +' onclick="Notes.formDelete(\''+indek+'\''
          +',\''+d[x].note_id+'\');">'
          +'</button></td>'
        +'<td align="center">'+n+'</td>'
        +'</tr>';
    }
  }
  html+='</table></div>';
  content.html(indek,html);
  if(p.err.id!=0) content.infoPaket(indek,p);
  Notes.form.addPagingFn(indek);// #here
}

Notes.formEntry=(indek,metode)=>{
  bingkai[indek].metode=metode;
  var html ='<div style="padding:0.5rem">'
    +content.title(indek)
    +content.message(indek)
    +'<form autocomplete="off">'

      +'<label>Title</label>'
        +'<div>'
        +'<input type="text" '
          +' id="title_'+indek+'"'
          +' style="width:99%;">'
        +'</div>'
      +'<br>'
      
      +'<label>Note</label>'
      +'<div align="left">'
        +'<textarea '
        +' id="note_'+indek+'"'
        +' spellcheck="false"'
        +' style="width:99%;'
          +' height:250px;'
          +' padding-top:10px;'
          +' padding-bottom:10px;'
          +' font-size:14px;">'
        +'</textarea>'
      +'</div>'
      
      +'<input type="button" '
      +' value="Add label"'
      +' onclick="Notes.label.getPaging(\''+indek+'\')"><br><br>'

      +'<div id="labels_'+indek+'"></div>'

      +'<br><br>'
      
      +'<label>Pinned '
        +'<input type="checkbox" id="pinned_'+indek+'">'
      +'</label>'
    +'</form>'
  
  +'</div>';
  content.html(indek,html);
  statusbar.ready(indek);
  document.getElementById('title_'+indek).focus();
}

Notes.setLabel=(indek,data)=>{
  var i
  var d=bingkai[indek].labels;
  for(i=0;i<d.length;i++){
    if(d[i].label_id==data.label_id){
      return;
    }
  }
  
  bingkai[indek].labels.push({
    'label_id':data.label_id
  });
  Notes.refreshLabel(indek);
}

Notes.refreshLabel=(indek)=>{
  var d=bingkai[indek].labels;
  var html='';
  
  for(var x=0;x<d.length;x++){
    html+='<span style="padding:1px 5px 1px 10px;margin-right:5px;'
      +'border:1px solid grey;'
      +'background-color:lightgrey;'
      +'border-radius:20px;'
      +'display:inline-block;">'+d[x].label_id
      +'<input type="button" style="color:red;"'
      +' onclick="Notes.removeLabel(\''+indek+'\''
      +',\''+x+'\')"'
      +'value="x">&nbsp;</span>';
  }
  setiH('labels_'+indek,html);
}

Notes.removeLabel=(indek,i)=>{
  var l=bingkai[indek].labels;
  var n=[];
  
  for(var x=0;x<l.length;x++){
    if(x==i){
      
    }else{
      n.push(l[x]);
    }
  }
  bingkai[indek].labels=n;
  Notes.refreshLabel(indek);
}

Notes.createExecute=(indek)=>{
  var note_id=String(new Date().getTime());
  var labels=JSON.stringify( bingkai[indek].labels );
  var note=btoa(getEV("note_"+indek));
  
  db.execute(indek,{
    query:"INSERT INTO notes"
      +"(note_id,title,note,labels,pinned"
      +") VALUES"
      +"('"+note_id+"'"
      +",'"+getEV("title_"+indek)+"'"
      +",'"+note+"'"
      +",'"+labels+"'"
      +",'"+getEC("pinned_"+indek)+"'"
      +")"
  });
}

Notes.readOne=(indek,callback)=>{
  db.execute(indek,{
    query:"SELECT * "
    +" FROM notes"
    +" WHERE note_id='"+bingkai[indek].note_id+"'"
  },(paket)=>{
    if (paket.count>0){
      var d=objectOne(paket.fields,paket.data);
      //alert(String(d.note).length +'|convert: '+String(atob(d.note)).length);
      setEV('title_'+indek, d.title );
      setEV('note_'+indek, atob(d.note));
      
      setEC('pinned_'+indek, d.pinned);
      bingkai[indek].labels=JSON.parse(d.labels);
      Notes.refreshLabel( indek );
      message.none(indek);
    }
    return callback();
  });
}

Notes.formUpdate=(indek,id_)=>{
  bingkai[indek].note_id=id_;
  Notes.form.modeUpdate(indek);
}

Notes.updateExecute=(indek)=>{
//  bingkai[indek].label=[];
  var labels=JSON.stringify( bingkai[indek].labels );
  var note=btoa(getEV("note_"+indek));
  
  db.execute(indek,{
    query:"UPDATE notes "
      +" SET title='"+getEV("title_"+indek) +"'"
      +",pinned='"+getEC("pinned_"+indek)+"'"
      +",note='"+note+"'"
      +",labels='"+labels+"'"
      +" WHERE note_id='"+bingkai[indek].note_id+"'"
  },(p)=>{
    if(p.err.id==0) {
      Notes.endPath( indek );
    }
  });
}

Notes.formDelete=(indek,id_)=>{
  bingkai[indek].note_id=id_;
  Notes.form.modeDelete(indek);
}

Notes.deleteExecute=function(indek){
  db.execute(indek,{
    query:"DELETE FROM notes"
      +" WHERE note_id='"+bingkai[indek].note_id+"'"
  },(p)=>{
    if(p.err.id==0) Notes.endPath( indek );
  });
}

Notes.duplicate=(indek)=>{
  var id='copy_of '+getEV('title_'+indek);
  setEV('title_'+indek,id);
  focus('title_'+indek);
}

Notes.properties=(indek)=>{
  db.execute(indek,{
    query:"SELECT note_id,date_created"
      +" FROM notes"
      +" WHERE note_id='"+bingkai[indek].note_id+"'"
  },(p)=>{
    message.none(indek);
    if (p.count>0) {
      var d=objectOne(p.fields,p.data) ;      
      bingkai[indek].file_id=String(":/").concat(
        Notes.table_name,"/",
        d.note_id);
      Properties.lookup(indek);
    }
    if(p.err.id!=0) message.infoPaket(indek,p);
  });
}

Notes.endPath=(indek)=>{
  toolbar.none(indek);
  toolbar.hide(indek);
  toolbar.back(indek,()=>{Notes.form.modePaging(indek);});
  if(bingkai[indek].metode!=MODE_DELETE){
    toolbar.properties(indek,()=>{Notes.properties(indek);})
    toolbar.save(indek,()=>{Notes.updateExecute(indek);})
  }
}

Notes.countSearch=(indek,callback)=>{
  db.run(indek,{
    query:"SELECT COUNT(*) "
      +" FROM notes "
      +" WHERE title LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR note LIKE '%"+bingkai[indek].text_search+"%'"
  },(paket)=>{
    bingkai[indek].count=0;
    if(paket.err.id==0 && paket.count>0){
      bingkai[indek].count=paket.data[0][0];
    }
    return callback()
  });
}

Notes.search=(indek)=>{
  Notes.countSearch(indek,()=>{
    bijiPaging(indek);
    db.execute(indek,{
      query:"SELECT note_id,title,note,labels,pinned,"
        +" user_name,date_modified "
        +" FROM notes"
        +" WHERE title LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR note LIKE '%"+bingkai[indek].text_search+"%'"
        +" LIMIT "+bingkai[indek].paging.limit
        +" OFFSET "+bingkai[indek].paging.offset
    },()=>{
      PAGING=false;
      bingkai[indek].metode=MODE_RESULT;
      Notes.readShow(indek);
    });
  });
}

Notes.exportExecute=(indek)=>{
  var table_name=Notes.table_name;
  var sql=sqlDatabase3(indek,table_name);
  DownloadEmpat.display(indek,sql,table_name);
}

Notes.importExecute=(indek)=>{
  var n=0;
  var m="<p>[Start]</p>";
  var o={};
  var d=bingkai[indek].dataImport.data;
  var j=d.length;

  document.getElementById('btn_import_all_'+indek).disabled=true;
  
  for (var i=0;i<j;i++){
    db.run(indek,{
      query:"INSERT INTO notes "
        +"(note_id,title,note,labels,pinned"
        +") VALUES "
        +"('"+d[i][0]+"'" // note_id
        +",'"+d[i][1]+"'" // title
        +",'"+d[i][2]+"'" // note
        +",'"+d[i][3]+"'" // label
        +",'"+d[i][4]+"'" // pinned
        +")"
    },(paket)=>{
      n++;
      m='['+n+'] '+db.error(paket)+'<br>'+m;
      progressBar(indek,n,j,m);
    });
  }
}

Notes.readSelect=(indek)=>{
  db.execute(indek,{
    query:"SELECT note_id,title,note,labels,pinned,"
      +" user_name,date_modified"
      +" FROM notes"
      +" ORDER BY pinned DESC,date_modified"
      +" LIMIT "+bingkai[indek].paging.limit
      +" OFFSET "+bingkai[indek].paging.offset
  },()=>{
    bingkai[indek].metode=MODE_SELECT;
    Notes.selectShow(indek);
  });
}

Notes.selectShow=(indek)=>{
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
      +'<th colspan="2">Title</th>'
      +'<th>Note</th>'
      +'<th>Pinned</th>'
      +'<th>Owner</th>'
      +'<th colspan="2">Modified</th>'
    +'</tr>';

  if (p.err.id===0){
    for (var x in d) {
      n++;
      html+='<tr>'
      +'<td align="center">'
      +'<input type="checkbox"'
        +' id="checked_'+x+'_'+indek+'"'
        +' name="checked_'+indek+'"'
        +' value="'+d[x].note_id+'">'
        +'</td>'
      +'<td align="center">'+n+'</td>'
      +'<td align="left">'+d[x].title+'</td>'
      +'<td align="left">'+strN(xHTML(d[x].note),30)+'</td>'      
      +'<td align="left">'+d[x].pinned+'</td>'
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

Notes.deleteAllExecute=(indek)=>{
  var p=bingkai[indek].paket;
  var d=objectMany(p.fields,p.data);
  var e=document.getElementsByName('checked_'+indek);
  var c=e.length;
  var a=[];
  
  for(var i=0;i<c;i++){
    if(document.getElementById('checked_'+i+'_'+indek).checked==true){
      a.push({
        query:"DELETE FROM notes"
          +" WHERE note_id = '"+d[i].note_id+"'"
      });
    }
  }
  db.deleteMany(indek,a);
}





// eof:437;464;467;471;
