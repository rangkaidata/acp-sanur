/*
 * name: budiono
 * new : sep-14, 14:13, thu-2023; new;
 * edit: sep-19, 21:47, tue-2023;
 * edit: sep-28, 22:57, thu-2023;job_begins;
 * -----------------------------; happy new year 2024;
 * edit: jan-09, 15:02, tue-2024; re-write with class;
 * edit: jun-09, 12:06, sun-2024; BasicSQL;
 * edit: aug-02, 18:42, fri-2024; r11;
 * edit: sep-12, 16:33, thu-2024; r19;
 */ 
 
'use strict';

class PhaseLook{
  
  constructor(mother){
    this.url='phases';
    this.title='Phases';
    this.mother=mother;
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
        +" FROM phases"
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

  readPaging(indek){
    bingkai[indek].metode=MODE_READ;
    this.count(indek,()=>{
      bijiPaging(indek);
      db.execute(indek,{
        query:"SELECT"
          +" phase_id, name,"
          +" user_name,date_modified"
          +" FROM phases"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" ORDER BY phase_id"
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
    var d=objectMany(p.fields,p.data);
    var html ='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +totalPagingandLimit(indek)
    +'<table border=1 style="padding:10px;">'
    +'<th>Phase ID</th>'
    +'<th>Phase Name</th>'
    +'<th>Select</th>';

    if (p.err.id===0){
      for (var x in d) {
        html+='<tr>'
        +'<td align="left">'+d[x].phase_id+'</td>'
        +'<td align="left">'+xHTML(d[x].name)+'</td>'
        +'<td align="center">'
          +'<button type="button" '
          +' name="select_'+indek+'"'
          +' class="icon_select" >'
          +'</button>'
        +'</td>'
        +'</tr>';
      }
    }
    html+='</table></div>';
    content.html(indek,html);
    if(p.err.id!=0) content.infoPaket(indek,p);
    this.form.addPagingFn(indek);
    this.addSelectFn(indek);
  }

  addSelectFn(indek){
    var m=this.mother;
    var n=document.getElementsByName('select_'+indek);
    var r=bingkai[indek].paket;
    var d=objectMany(r.fields,r.data);
    var p=bingkai[indek].parent;

    for(var i=0;i<n.length;i++){
      n[i].dataset.i=i;
      n[i].onclick=function(){
        m.setPhase(p,d[this.dataset.i]);// here ...
        ui.CLOSE_POP(indek);
      }
    }
  }
  
  getOne(indek,pkey,callBack){
    db.run(indek,{
      query:"SELECT * "
        +" FROM phases"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND phase_id='"+id_+"'"
    },(paket)=>{
      return callBack(paket);
    });
  }
}



// eof:160;102;142;147;
