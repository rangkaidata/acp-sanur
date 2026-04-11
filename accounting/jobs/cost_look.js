/*
 * name: budiono;
 * new : sep-14, 14:18, thu-2023; new;
 * edit: sep-19, 21:42, tue-2023;
 * edit: sep-28, 23:01, thu-2023;
 * -----------------------------; happy new year 2024;
 * edit: jan-09, 15:14, tue-2024; re-write with class;
 * edit: jun-09, 12:17, sun-2024; BasicSQL;
 * edit: aug-02, 18:42, fri-2024; r11;
 * edit: sep-12, 16:35, thu-2024; r19; 
 */ 
 
'use strict';

class CostLook {
  
  constructor(mother){
    this.url='cost_codes';
    this.title='Cost Codes';
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
        +" FROM cost_codes"
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
          +" cost_id, name,"
          +" user_name,date_modified"
          +" FROM cost_codes"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" ORDER BY cost_id"
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
      +'<th>Cost ID</th>'
      +'<th>Cost Name</th>'
      +'<th>Select</th>';

    if (p.err.id===0){
      for (var x in d) {
        html+='<tr>'
        +'<td align="left">'+d[x].cost_id+'</td>'
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
    html+='</table>'
      +'</div>';
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
        m.setCost(p,d[this.dataset.i]);// here ...
        ui.CLOSE_POP(indek);
      }
    }
  }

  getOne(indek,id_,callBack){
    db.run(indek,{
      query:"SELECT * "
        +" FROM cost_codes"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND cost_id='"+id_+"'"
    },(paket)=>{
      return callBack(paket);
    });
  }
}


// eof: 155;104;144;148;
