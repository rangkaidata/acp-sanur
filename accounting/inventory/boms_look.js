/*
 * name: budiono
 * date: oct-12, 20:52, thu-2023; 
 * edit: oct-20, 15:25, fri-2023; xHTML;
 * -----------------------------; happy new year 2024;
 * edit: jan-12, 15:48, fri-2024; re-write w class;
 * edit: jun-21, 13:55, fri-2024; BasicSQL;
 * edit: aug-05, 20:47, mon-2024; r11;
 * edit: sep-25, 11:37, wed-2024; r19;
 */ 
 
'use strict';

class BomLook{
  
  constructor(mother){
    this.mother=mother;
    this.url='boms';
    this.title='Bill of Materials';
    this.hideNew=true;
    this.hideExport=true;
    this.hideImport=true;
    this.hideMore=true;
    this.hideSelect=true;
    this.hideRefresh=true;
    this.hideHide=true;
    this.form=new ActionForm2(this);
  }
  
  getPaging(indek_parent,id_kolom,baris,ac){
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
        +" FROM boms"
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
        query:"SELECT item_id,item_name,"
          +" user_name,date_modified"
          +" FROM boms"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" ORDER BY item_id"
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
    var n=bingkai[indek].paging.offset;
    var html ='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +TotalPagingLimit(indek)
    +'<table border=1 style="padding:10px;">'
    +'<th colspan="2">Bom ID</th>'
    +'<th>Bom Name</th>'
    +'<th>Select</th>';

    if (p.err.id===0){
      for (var x in d) {
        n++;
        html+='<tr>'
        +'<td align="left">'+n+'</td>'
        +'<td align="left">'+d[x].item_id+'</td>'
        +'<td align="left">'+xHTML(d[x].item_name)+'</td>'
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
        m.setBom(p,d[this.dataset.i]);
        ui.CLOSE_POP(indek);
      }
    }
  }

  getOne(indek,id_,callBack){
    db.run(indek,{
      query:"SELECT * "
        +" FROM boms"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND item_id='"+id_+"'"
    },(paket)=>{
      return callBack(paket);
    });
  }
  
  getOne2(indek,address,id_,callBack){
    db.run(indek,{
      query:"SELECT * "
        +" FROM boms"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND item_id='"+id_+"'"
    },(paket)=>{
      return callBack(address,paket);
    });
  }

  countSearch=(indek,callback)=>{
    db.run(indek,{
      query:"SELECT COUNT(*) "
      +" FROM boms "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND item_id LIKE '%"+bingkai[indek].text_search+"%'"
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
        query:"SELECT item_id,name,"
          +" user_name,date_modified"
          +" FROM boms"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND item_id LIKE '%"+bingkai[indek].text_search+"%'"
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


// eof:171;105;145;187;
