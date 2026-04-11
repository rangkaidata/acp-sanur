/*
 * name: budiono;
 * date: jul-28, 07:46, mon-2025; #65; 
 * edit: aug-06, 15:17, wed-2025; #65; bad mood parah!;
 */ 
 
'use strict';

class TicketInvoiceLook{
  
  constructor(bigBos){
    this.url='ticket_invoice';
    this.title='Ticket Invoice';
    this.bigBos=bigBos;
    this.hideNew=true;
    this.hideExport=true;
    this.hideImport=true;
    this.hideMore=true;
    this.hideSelect=true;
    this.hideRefresh=true;
    this.hideHide=true;
    this.form=new ActionForm2(this);
  }

  getPaging(indek_parent,kolom,baris){
    bingkai[indek_parent].kolom=kolom;
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
    tiket.customer_id=getEV('customer_id_'+indek_parent);

    const newReg=new BingkaiSpesial(tiket);
    const indek=newReg.show();    
    this.form.modePaging(indek);
  }
  
  count(indek,callback){
    db.run(indek,{
      query:"SELECT COUNT(*)"
        +" FROM ticket_invoice_sum"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND customer_id='"+bingkai[indek].customer_id+"'"
        +" AND remaining!=0"
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
        query:"SELECT customer_id,ticket_no,ticket_date"
          +",item_id,description,remaining,job_phase_cost"
          +" FROM ticket_invoice_sum"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND customer_id='"+bingkai[indek].customer_id+"'"
          +" AND remaining!=0"
          +" ORDER BY ticket_date,ticket_no"
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
    +totalPagingandLimit(indek)
    +'<table border=1 style="padding:10px;">'
      +'<th colspan="2">Ticket No.</th>'
      +'<th>Date</th>'
      +'<th>Item ID</th>'
      +'<th>Description</th>'
      +'<th>Amount</th>'
      +'<th>Job</th>'
      +'<th>Select</th>';

    if (p.err.id===0){
      for (var x in d) {
        n++;
        html+='<tr>'
          +'<td align="center">'+n+'</td>'
          +'<td align="left">'+d[x].ticket_no+'</td>'
          +'<td align="left">'+tglWest(d[x].ticket_date)+'</td>'
          +'<td align="left">'+d[x].item_id+'</td>'
          +'<td align="left">'+d[x].description+'</td>'
          +'<td align="right">'+ribuan(d[x].remaining)+'</td>'
          +'<td align="left">'+d[x].job_phase_cost+'</td>'
          
          +'<td align="center">'
            +'<button type="button" '
            +' name="select_'+indek+'" '
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
    var bigBos=this.bigBos;
    var n=document.getElementsByName('select_'+indek);
    var r=bingkai[indek].paket;
    var d=objectMany(r.fields,r.data);
    var p=bingkai[indek].parent;
    var i;
    
    for(i=0;i<n.length;i++){
      n[i].dataset.i=i;
      n[i].onclick=function(){
        bigBos.setTicket(p,d[this.dataset.i]);// here ...
         ui.CLOSE_POP(indek);
      }
    }
  }
  
  getOne(indek,customer_id,ticket_no,item_id,description,callBack){
    db.run(indek,{
      query:"SELECT * "
        +" FROM ticket_invoice_sum "
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND customer_id='"+customer_id+"'"
        +" AND ticket_no='"+ticket_no+"'"
        +" AND item_id='"+item_id+"'"
        +" AND description='"+description+"'"
    },(paket)=>{
      return callBack(paket);
    });
  }

  countSearch=(indek,callback)=>{
    db.run(indek,{
      query:"SELECT COUNT(*) "
      +" FROM ticket_invoice_sum "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND ticket_no LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR item_id LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR description LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR job_phase_cost LIKE '%"+bingkai[indek].text_search+"%'"
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
        query:"SELECT customer_id,ticket_no,ticket_date,item_id,"
          +" description,remaining AS amount,job_phase_cost"
          +" FROM ticket_invoice_sum"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND ticket_no LIKE '%"+bingkai[indek].text_search+"%'"
          +" OR item_id LIKE '%"+bingkai[indek].text_search+"%'"
          +" OR description LIKE '%"+bingkai[indek].text_search+"%'"
          +" OR job_phase_cost LIKE '%"+bingkai[indek].text_search+"%'"
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




// eof; 200;
