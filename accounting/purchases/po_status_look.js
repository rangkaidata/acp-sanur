/*
 * auth: budiono;
 * new : jan-05, 13:17, mon-2026; #87; matrix;
 */ 
 
'use strict';

class POStatusLook {
  
  constructor(mother){
    this.mother=mother;
    this.url='po_status';
    this.title='PO Status';
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
        +" FROM po_status"
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
        query:"SELECT vendor_id,po_no,po_date,remaining,status"
          +" FROM po_status "
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND status=0"// 0=OPEN;1=CLOSE;
          +" ORDER BY po_date"
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
    var n=bingkai[indek].paging.offset;
    
    var html ='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +TotalPagingLimit(indek)
    +'<table border=1 style="padding:10px;">'
      +'<th colspan="2">Vendor ID</th>'
      +'<th>PO NO.</th>'
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
        +'<td align="left">'+d[x].vendor_id+'</td>'
        +'<td align="left">'+d[x].po_no+'</td>'
        +'<td align="left">'+tglWest(d[x].po_date)+'</td>'
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
    const m=this.mother;
    const n=document.getElementsByName('select_'+indek);
    const r=bingkai[indek].paket;
    const d=objectMany(r.fields,r.data);
    const p=bingkai[indek].parent;

    for(var i=0;i<n.length;i++){
      n[i].dataset.i=i;
      n[i].onclick=function(){
        m.setPOStatus(p,d[this.dataset.i]);
        ui.CLOSE_POP(indek);
      }
    }
  }
  
  getOne(indek,vendor_id,po_no,callBack){
    db.run(indek,{
      query:"SELECT * "
        +" FROM po_status"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND vendor_id='"+vendor_id+"'"
        +" AND po_no='"+po_no+"'"
        +" AND status=0"// 0=OPEN;1=CLOSE;
    },(paket)=>{
      return callBack(paket);
    });
  }
}


//eof : 149;
