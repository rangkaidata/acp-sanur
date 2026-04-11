/*
 * nama: budiono
 * new : sep-13, 16:11, wed-2023; new;
 * edit: sep-20, 10:52, wed-2023; 
 * edit: sep-29, 11:09, fri-2023;
 * edit: oct-27, 11:14, fri-2023; purchase_orders;
 * edit: nov-02, 11:40, thu-2023; receive_inventory;
 * edit: nov-16, 08:33, thu-2023; payments;
 * edit: nov-18, 17:53, sat-2023; vendor_credits;
 * edit: dec-01, 14:20, fri-2023; quotes;
 * edit: dec-02, 12:08, sat-2023; sales_orders;
 * edit: dec-03, 07:24, sun-2023; invoices;
 * edit: dec-03, 12:11, sun-2023; receipts;
 * -----------------------------; happy new year 2024;
 * edit: jan-11, 19:33, thu-2024; re-write w class;
 * edit: may-27, 12:00, mon-2024; basic-sql;
 * edit: sep-11, 16:22, wed-2024; r18;
 * edit: sep-25, 21:19, wed-2024; r19;
 */ 
 
'use strict';

class ItemLook{
  
  constructor(mother){
    this.mother=mother;
    this.url='items';
    this.title='Inventory Items';
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
      query:"SELECT COUNT(*)"
      +" FROM items"
      +" WHERE company_id='"+bingkai[indek].company.id+"'"
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
        query:"SELECT item_id,name,class,"
          +" user_name,date_modified"
          +" FROM items"
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
    +totalPagingandLimit(indek)
    +'<table border=1 style="padding:10px;">'
    +'<tr>'
      +'<th colspan="2">Items</th>'
      +'<th>Name</th>'
      +'<th>Class</th>'
      +'<th>Select</th>'
    +'</tr>';

    if (p.err.id===0){
      for (var x in d){
        n++;
        html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].item_id+'</td>'
        +'<td align="left">'+xHTML(d[x].name)+'</td>'
        +'<td align="center">'+default_item_class[d[x].class]+'</td>'
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
      +'</div>'
      +'</div>'
      +'</div>';
    content.html(indek,html);
    if(p.err.id!=0) content.infoPaket(indek,p);
    this.form.addPagingFn(indek);
    this.addSelectFn(indek);
  }
  
  addSelectFn(indek){
    const m=this.mother;
    const n=document.getElementsByName('select_'+indek);
    const p=bingkai[indek].paket;
    const d=objectMany(p.fields,p.data);
    const ip=bingkai[indek].parent;

    for(var i=0;i<n.length;i++){
      n[i].dataset.i=i;
      n[i].onclick=function(){
        m.setItem(ip, d[this.dataset.i]);
        ui.CLOSE_POP(indek);
      }
    }
  }

  getOne(indek,id_,callBack){
    db.run(indek,{
      query: "SELECT * "
        +" FROM items "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND item_id='"+id_+"'"
    },(paket)=>{
      return callBack(paket);
    });
  }
  
  getOne2(indek,address,id_,callBack){
    db.run(indek,{
      query: "SELECT * "
        +" FROM items "
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
        +" FROM items "
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
        query:"SELECT item_id,name,class,"
          +" user_name,date_modified"
          +" FROM items"
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


// eof:202;119;158;212;214;
