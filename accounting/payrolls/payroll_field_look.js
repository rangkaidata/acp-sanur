/*
 * auth: budiono
 * date: jun-03, 10:18, tue-2025; #57; payroll_fields;
 */ 
 
'use strict';

class PayrollFieldLook {
  
  constructor(bigBos){
    this.url='payroll_fields';
    this.title='Payroll Fields';
    this.bigBos=bigBos;
    this.hideNew=true;
    this.hideExport=true;
    this.hideImport=true;
    this.hideMore=true;
    this.hideSelect=true;
    this.hideRefresh=true;
    this.hideHide=true;
    this.form=new ActionForm2(this);
    this.ac=-1;// ALL
  }

  fieldClass(){
    if(this.ac==-1){
      return "";
    }else{
      return " AND class="+this.ac;
    }
  }
  
  /*
   * @NAME : modePaging (form bentuk paging) 
   * @PARAM: indek_parent (indexs dari form)
   * @PARAM: id_kolom (id dari object) 
   * @PARAM: baris (id baris bila lebih dari satu object sama)
   * @PARAM: ac (account kelas dari chart)
   */ 
  
  getPaging(indek_parent,id_kolom,baris,ac){
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
    this.ac=ac;
    this.form.modePaging(indek);
  }
  
  count(indek,callback){
    db.run(indek,{
      query:"SELECT COUNT(*)"
        +" FROM payroll_fields"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"      
        + this.fieldClass()
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
        query:"SELECT field_name,description,class"
          +",user_name, date_modified "
          +" FROM payroll_fields"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          + this.fieldClass()
          +" ORDER BY field_name"
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
      +'<b>[Class: '+array_payroll_field_class[this.ac] +']</b>'
      +content.message(indek)
      +totalPagingandLimit(indek)
      +'<table border=1 style="padding:10px;">'
        +'<th colspan="2">Field Name</th>'
        +'<th>Description</th>'
        +'<th>Class</th>'
        +'<th>Select</th>';

    if (p.err.id===0){
      for (var x in d) {
        n++;
        html+='<tr>'
          +'<td align="center">'+n+'</td>'
          +'<td>'+d[x].field_name+'</td>'
          +'<td>'+xHTML(d[x].description)+'</td>'
          +'<td align="center">'+array_payroll_field_class[d[x].class]
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
    html+='</table></div>';
    content.html(indek,html);
    if(p.err.id!=0) content.infoPaket(indek,p);
    this.form.addPagingFn(indek);
    this.addSelectFn(indek,this.bigBos);
  }
  
  addSelectFn(indek,obj){
    const abc=this.bigBos;
    const n=document.getElementsByName('select_'+indek);
    const p=bingkai[indek].paket;
    const data=objectMany(p.fields,p.data);
    const indek_parent=bingkai[indek].parent;

    for(var i=0;i<n.length;i++){
      n[i].dataset.i=i;
      n[i].onclick=function(){
        abc.setField(indek_parent,data[this.dataset.i]);// here ...
        ui.CLOSE_POP(indek);
      }
    }
  }
  
  getOne(indek,id_,callBack){
    db.run(indek,{
      query:"SELECT * "
        +" FROM payroll_fields"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"      
        +" AND field_name='"+id_+"'"
    },(paket)=>{
      return callBack(paket);
    });
  }
  
  countSearch=(indek,callback)=>{
    db.run(indek,{
      query:"SELECT COUNT(*) "
      +" FROM payroll_fields "
      +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
      +" AND company_id='"+bingkai[indek].company.id+"'"
      +" AND field_name LIKE '%"+bingkai[indek].text_search+"%'"
      +" OR description LIKE '%"+bingkai[indek].text_search+"%'"
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
        query:"SELECT field_name,description,class,"
          +" user_name, date_modified "
          +" FROM payroll_fields"
          +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
          +" AND company_id='"+bingkai[indek].company.id+"'"
          +" AND field_name LIKE '%"+bingkai[indek].text_search+"%'"
          +" OR description LIKE '%"+bingkai[indek].text_search+"%'"
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




// eof;205;
