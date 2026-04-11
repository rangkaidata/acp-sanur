/*
 * nama: budiono;
 * new : sep-13, 15:25, wed-2023; new
 * edit: sep-19, 21:01, tue-2023; 
 * edit: oct-13, 15:24, fri-2023; adjustment;
 * -----------------------------; happy new year 2024;
 * edit: jan-06, 10:45, sat-2024; mringkas ke-1;
 * edit: jan-10, 14:11, wed-2024; re-write with class;
 * edit: may-29, 09:03, wed-2024; BasicSQL;
 * edit: sep-11, 21:37, wed-2024; r18;
 */ 

'use strict';

class StockItemLook {

  constructor(mother){
    this.mother=mother;
    this.url='stock_items';
    this.title='Stock Item Lists';
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

    const tiket=JSON.parse(JSON.stringify(bingkai[indek_parent]));
    tiket.parent=indek_parent;
    tiket.modul=this.url;
    tiket.menu.name=this.title;
    tiket.ukuran.lebar=60;
    tiket.ukuran.tinggi=40;
    tiket.bisa.ubah=0;
    tiket.letak.atas=0;
    tiket.look_up=true;
    tiket.pop_up=true;

    const newReg=new BingkaiSpesial(tiket);
    const indek=newReg.show();    
    this.form.modePaging(indek);
  }
  
  count(indek,callback){
    db.run(indek,{
      query:"SELECT COUNT(*) "
        +" FROM items"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND class=0 OR class=5 "
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
        query:"SELECT "
          +" item_id, name, class,"
          +" user_name,date_modified"
          +" FROM items"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND class=0 OR class=5 "
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
    const p=bingkai[indek].paket;
    const d=objectMany(p.fields,p.data);

    var html ='<div style="padding:0.5rem;">'
      +content.title(indek)
      +content.message(indek)
      +totalPagingandLimit(indek)
      +'<table border=1 style="padding:10px;">'
        +'<th>Stock Items</th>'
        +'<th>Name</th>'
        +'<th>Class</th>'
        +'<th>Select</th>';

    if (p.err.id===0){
      for (var x in d){
        html+='<tr>'
        +'<td align="left">'+d[x].item_id+'</td>'
        +'<td align="left">'+xHTML(d[x].name)+'</td>'
        +'<td align="center">'+default_item_class[d[x].class]+'</td>'
        +'<td align="center">'
          +'<button type="button" '
          +' name="select_'+indek+'" '
          +' class="icon_select" '
          +'</button></td>'
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
    const m=this.mother;
    const n=document.getElementsByName('select_'+indek);
    const r=bingkai[indek].paket;
    const d=objectMany(r.fields,r.data);
    const p=bingkai[indek].parent;

    for(var i=0;i<n.length;i++){
      n[i].dataset.i=i;
      n[i].onclick=function(){
        m.setItem(p,d[this.dataset.i]);// here ...
        ui.CLOSE_POP(indek);
      }
    }
  }

  getOne(indek,id_,callBack){
    db.run(indek,{
      query:"SELECT * "
        +" FROM items "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND item_id='"+id_+"'"
    },(paket)=>{
      return callBack(paket);
    });
  }
}


// eof: 108;147;
