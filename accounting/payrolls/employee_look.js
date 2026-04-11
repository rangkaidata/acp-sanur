/*
 * auth: budiono
 * date: sep-30, 07:05, sat-2023; new;
 * edit: oct-13, 07:54, thu-2023; builds;unbuilds;moves;adjustment;
 * -----------------------------; happy new year 2024;
 * edit: jan-12, 16:02, fri-2024; re-write w class;
 * edit: jul-10, 11:57, wed-2024; r7;
 * edit: aug-05, 20:52, mon-2024; r11;
 * edit: sep-14, 17:32, sat-2024; r19;
 */ 

'use strict';

class EmployeeLook{
  
  constructor(mother){
    this.mother=mother;
    this.url='employees';
    this.title='Employees';
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
        +" FROM employees "
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
        query:"SELECT employee_id, name, pay_frequency, "
          +" user_name, date_modified"
          +" FROM employees"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" ORDER BY employee_id"
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
    var n=bingkai[indek].paging.offset;
    var html ='<div style="padding:0.5rem;">'
    +content.title(indek)
    +content.message(indek)
    +totalPagingandLimit(indek)
    +'<table border=1 style="padding:10px;">'
      +'<th colspan="2">Employee ID</th>'
      +'<th>Employee Name</th>'
      +'<th>Frequency</th>'
      +'<th>Select</th>';

    if (p.err.id===0){
      for (var x in d) {
        n++;
        html+='<tr>'
        +'<td align="center">'+n+'</td>'
        +'<td align="left">'+d[x].employee_id+'</td>'
        +'<td align="left">'+xHTML(d[x].name)+'</td>'
        +'<td align="center">'
          +array_pay_frequency[d[x].pay_frequency]
          +'</td>'
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
        m.setEmployee(p,d[this.dataset.i]);
        ui.CLOSE_POP(indek);
      }
    }
  }

  getOne(indek,id_,callBack){
    db.run(indek,{
      query:"SELECT * "
        +" FROM employees"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND employee_id='"+id_+"'"
    },(paket)=>{
      return callBack(paket);
    });
  }
}

// eof: 228;149;153;
