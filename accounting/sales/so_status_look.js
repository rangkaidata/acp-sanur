/*
 * auth: budiono;
 * new : jan-05, 21:52, mon-2026; #87; matrix;
 */ 
 
'use strict';

class SOStatusLook {
  
  constructor(mother){
    this.mother=mother;
    this.url='so_status';
    this.title='SO Status';
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
        +" FROM so_status"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND status=0"// 0=OPEN;1=CLOSE;
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
        query:"SELECT customer_id,so_no,so_date,remaining,status"
          +" FROM so_status "
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND status=0"// 0=OPEN;1=CLOSE;
          +" ORDER BY so_date"
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
      +'<th colspan="2">Customer ID</th>'
      +'<th>SO NO.</th>'
      +'<th>Date</th>'
      +'<th>Remaining</th>'
//      +'<th>Close</th>'
      +'<th colspan="2">Action</th>'

    if (p.err.id===0){
      var x;
      for (x in d){
        n++;
        html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].customer_id+'</td>'
        +'<td align="left">'+d[x].so_no+'</td>'
        +'<td align="left">'+tglWest(d[x].so_date)+'</td>'
        +'<td align="right">'+d[x].remaining+'</td>'
//        +'<td align="center">'+d[x].status+'</td>'
        +'<td align="center">'
            +'<button type="button" '
              +' name="select_'+indek+'"'
              +' class="icon_select" >'
            +'</button>'
        +'<td align="center">'+n+'</td>'
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
    var i;

    for(i=0;i<n.length;i++){
      n[i].dataset.i=i;
      n[i].onclick=function(){
        m.setSOStatus(p,d[this.dataset.i]);
        ui.CLOSE_POP(indek);
      }
    }
  }
  
  getOne(indek,customer_id,so_no,callBack){
    db.run(indek,{
      query:"SELECT * "
        +" FROM so_status"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND customer_id='"+customer_id+"'"
        +" AND so_no='"+so_no+"'"
        +" AND status=0"// 0=OPEN;1=CLOSE;
    },(paket)=>{
      return callBack(paket);
    });
  }
}


//eof : 149;
