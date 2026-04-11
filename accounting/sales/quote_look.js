/*
 * auth: budiono;
 * new : dec-01, 20:50, fri-2023; new;
 * -----------------------------; happy new year 2024;
 * edit: jan-20, 11:21, sat-2024; move to class;
 * edit: sep-30, 20:32, mon-2024; #19;
 * edit: oct-01, 07:47, tue-2024; #19;
 */
 
/*
 * JavaScript itu bahasa functional atau object oriented !?;
 */ 

'use strict';

class QuoteLook{
  
  constructor(mother){
    this.mother=mother;
    this.url='quotes';
    this.title='Sales Quotes';
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
        +" FROM quote_convert_sum"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND status=0"
        +" GROUP BY customer_id,quote_no"
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
        query:"SELECT customer_id,quote_no,so_no,invoice_no"
          +" FROM quote_convert_sum"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND status=0"
          +" ORDER BY quote_no"
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
    +pagingLimit(indek)
    +'<table border=1 style="padding:10px;">'
    +'<tr>'
      +'<th colspan="2">Date</th>'
      +'<th>Quote NO.</th>'
      +'<th>Customer ID</th>'
      +'<th>Select</th>'
    +'</tr>';

    if (p.err.id===0){
      for (var x in d){
        n++;
        html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+tglWest(d[x].date)+'</td>'
        +'<td align="left">'+d[x].quote_no+'</td>'
        +'<td align="left">'+xHTML(d[x].customer_id)+'</td>'
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
    var s=bingkai[indek].paket;
    var d=objectMany(s.fields, s.data);
    var p=bingkai[indek].parent;

    for(var i=0;i<n.length;i++){
      n[i].dataset.i=i;
      n[i].onclick=function(){
        m.setQuote(p,d[this.dataset.i]);
        ui.CLOSE_POP(indek);
      }
    }
  }

  getOne(indek,customer_id,quote_no,callBack){
    db.run(indek,{
      query:"SELECT * "
        +" FROM quotes"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND customer_id='"+customer_id+"'"
        +" AND quote_no='"+quote_no+"'"
    },(paket)=>{
      return callBack(paket);
    });
  }
}


// eof: 175;114;
