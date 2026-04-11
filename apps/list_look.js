/*
 * name: budiono
 * date: jan-07, 14:59, tue-2025; #34; app-common;
 */ 
 
'use strict';

class ListLook {

  constructor(mother){
    this.mother=mother;
    this.url='lists';
    this.title='Lists';
    this.hideNew=true;
    this.hideExport=true;
    this.hideImport=true;
    this.hideMore=true;
    this.hideSelect=true;
    this.hideRefresh=true;
    this.hideHide=true;
    this.form=new ActionForm2(this);
  }

  getPaging(indek_parent,id_kolom,baris){
    bingkai[indek_parent].id_kolom=id_kolom;
    bingkai[indek_parent].baris=baris;

    var tiket=JSON.parse(JSON.stringify(bingkai[indek_parent]));
    tiket.parent=indek_parent;
    tiket.modul=this.url;
    tiket.menu.name=this.title;
    tiket.ukuran.lebar=60;
    tiket.ukuran.tinggi=40;
    tiket.bisa.ubah=0;
    tiket.letak.atas=0;
    tiket.look_up=true;
    tiket.pop_up=true;

    var newReg=new BingkaiSpesial(tiket);
    var indek=newReg.show();    
    this.form.modePaging(indek);
  }
  
  count(indek,callback){
    db.run(indek,{
      query:"SELECT COUNT(*)"
        +" FROM lists"
    },(paket)=>{
      bingkai[indek].count=0;
      if(paket.err.id==0){
        bingkai[indek].count=paket.data[0][0];
      }
      return callback()
    });
  }

  readPaging(indek){
    bingkai[indek].metode=MODE_READ;
    this.count(indek,()=>{
      bijiPaging(indek);
      db.execute(indek,{
        query:"SELECT list_id,name,"
          +" user_name,date_modified"
          +" FROM lists"
          +" ORDER BY list_id"
          +" LIMIT "+bingkai[indek].paging.limit
          +" OFFSET "+bingkai[indek].paging.offset
      },()=>{
        PAGING=true;
        this.readShow(indek);
      });
    })
  }

  readShow(indek){
    var p=bingkai[indek].paket;
    var d=objectMany(p.fields, p.data);
    var html ='<div style="padding:0.5rem;">'
      +content.title(indek)
      +content.message(indek)
      +pagingLimit(indek)
      +'<table border=1 style="padding:10px;">'
      +'<th>ID</th>'
      +'<th>List</th>'
      +'<th>Select</th>';

    if (p.err.id===0){
      for (var x in d){
        html+='<tr>'
        +'<td align="left">'+d[x].list_id+'</td>'
        +'<td align="left">'+xHTML(d[x].name)+'</td>'
        +'<td align="center">'
          +'<button type="button" '
          +' name="select_'+indek+'" '
          +' class="icon_select" >'
          +'</button></td>'
        +'</tr>';
      }
    }
    html+='</table></div>';
    content.html(indek,html);
    if(p.err.id!=0) content.infoPaket(indek, p);
    this.form.addPagingFn(indek);
    this.addSelectFn(indek);
  }

  addSelectFn(indek){
    var m=this.mother;
    var n=document.getElementsByName('select_'+indek);
    var s=bingkai[indek].paket;
    var d=objectMany(s.fields, s.data);
    var p=bingkai[indek].parent;

    for(var i=0;i<n.length;i++){
      n[i].dataset.i=i;
      n[i].onclick=function(){
        m.setList(p,d[this.dataset.i]);
        ui.CLOSE_POP(indek);
      }
    }
  }

  getOne(indek,id_, callBack){
    db.run(indek,{
      query:"SELECT * "
        +" FROM lists"
        +" WHERE list_id='"+id_+"'"
    },(paket)=>{
      return callBack(paket);
    });
  }
  
  countSearch=(indek,callback)=>{
    db.run(indek,{
      query:"SELECT COUNT(*) "
        +" FROM lists "
        +" WHERE list_id LIKE '%"+bingkai[indek].text_search+"%'"
        +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
    },(paket)=>{
      bingkai[indek].count=0;
      if(paket.err.id==0 && paket.count>0){
        bingkai[indek].count=paket.data[0][0];
      }
      return callback()
    });
  }

  search=(indek)=>{
    this.countSearch(indek,()=>{
      bijiPaging(indek);
      db.execute(indek,{
        query:"SELECT list_id,name,"
          +" user_name,date_modified "
          +" FROM lists"
          +" WHERE list_id LIKE '%"+bingkai[indek].text_search+"%'"
          +" OR name LIKE '%"+bingkai[indek].text_search+"%'"
          +" LIMIT "+bingkai[indek].paging.limit
          +" OFFSET "+bingkai[indek].paging.offset
      },()=>{
        PAGING=false;
        bingkai[indek].metode=MODE_RESULT;
        this.readShow(indek);
      });
    });
  }
}


//eof:173;166;
