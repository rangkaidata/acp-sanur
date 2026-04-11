/*
 * name: budiono;
 * date: sep-28, 22:52, thu-2023; new;
 * edit: oct-14, 20:01, sat-2023; 
 * edit: oct-19, 22:19, thu-2023; xHTML;
 * edit: oct-27, 11:04, fri-2023; purchase_orders;
 * edit: nov-02, 11:58, thu-2023; receive_inventory;
 * edit: nov-16, 13:13, thu-2023; payments;
 * edit: nov-17, 06:51, fri-2023; vendor_checks;
 * edit: nov-18, 18:01, sat-2023; vendor_credits;
 * edit: dec-01, 14:01, fri-2023; quotes;
 * edit: dec-02, 12:14, sat-2023; sales_orders;
 * edit: dec-03, 07:22, sun-2023; invoices;
 * edit: dec-04, 10:20, mon-2023; receipts;
 * -----------------------------; happy new year 2024;
 * edit: jan-11, 10:05, thu-2024; re-write with class;
 * edit: jan-12, 14:47, fri-2024; lanjut;
 * edit: sep-19, 08:36, thu-2024; r19;
 */ 
 
'use strict';

class JobLook{
  
  constructor(mother){
    this.mother=mother;
    this.url='jobs';
    this.title='Jobs';
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
        +" FROM jobs"
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
        query:"SELECT job_id, name, use_phases, "
        +" user_name,date_modified"
        +" FROM jobs"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" ORDER BY job_id"
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
    var metode=bingkai[indek].metode;
    var nama_kolom=bingkai[indek].baris;// -2=show job only
    var html ='<div style="padding:0.5rem;">'
      +content.title(indek)
      +content.message(indek)
      +TotalPagingLimit(indek)
      +'<table border=1 style="padding:10px;">'
        +'<th>Job ID</th>'
        +'<th>Job Name</th>'
        +'<th>Select</th>';

    if (p.err.id===0){
      for (var x in d) {
        html+='<tr>'
        +'<td align="left">';
          if(nama_kolom==-2){
            // no phases, no cost, job only;
          }else{
            if(d[x].use_phases==1){
              html+='<input type="button" '
              +' id="btn_job_'+x+'_'+indek+'"'
              +' name="plus_job_'+indek+'"'
              +' value="+" >'
            }else{
              html+='<input type="button"'
              +' id="btn_job_'+x+'_'+indek+'"'
              +' name="plus_job_'+indek+'"'
              +' value="-" disabled>&nbsp;';
            }
          }
          html+=d[x].job_id
          +'<input type="hidden" '
          +' id="job_id_'+x+'_'+indek+'"'
          +' value="'+d[x].job_id+'">'
          +'</td>'

        +'<td align="left">'+xHTML(d[x].name)+'</td>'
        +'<td align="center">'
          +'<button type="button" '
          +' name="select_'+indek+'"'
          +' class="icon_select" >'
          +'</button>'
          +'</td>'
        +'</tr>';

        if(d[x].use_phases==1){
          html+='<tr '
            +' id="tr_'+x+'_'+indek+'"'
            +' style="display:none;">'
            +'<td colspan="3">'
            +'<div id="phase_look_'+x+'_'+indek+'"'
            +' style="padding-left:10px;"></div>'
            +'</td></tr>'
        }
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
    var m=this.mother;
    var m2=this;
    var n=document.getElementsByName('select_'+indek);
    var n2=document.getElementsByName('plus_job_'+indek);
    var r=bingkai[indek].paket;
    var d=objectMany(r.fields,r.data);
    var p=bingkai[indek].parent;
    var i;

    for(i=0;i<n.length;i++){
      n[i].dataset.i=i;
      n[i].dataset.job_id=getEV('job_id_'+i+'_'+indek);
      n[i].onclick=function(){
        m.setJob(p,this.dataset.job_id);
        ui.CLOSE_POP(indek);
      }
    }

    for(i=0;i<n2.length;i++){// phase
      n2[i].dataset.i=i;
      n2[i].onclick=function(){
        m2.phaseLook(indek,this.dataset.i);
      }
    }
  }
  
  phaseLook(indek,baris_a){
    if(getEV('btn_job_'+baris_a+'_'+indek)=="-"){
      setEV('btn_job_'+baris_a+'_'+indek, '+');
      setEH('phase_look_'+baris_a+'_'+indek, '');
      setDisplay('tr_'+baris_a+'_'+indek, "none");
      return;
    }else{
      setEV('btn_job_'+baris_a+'_'+indek, '-') ;
      setDisplay('tr_'+baris_a+'_'+indek, "table-row");
    }
    
    //Phases.getPaging(indek,(paket)=>{
    db.run(indek,{
      query:"SELECT phase_id,name,use_cost"
        +" FROM phases"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND inactive=0"
    },(paket)=>{
      var d=objectMany(paket.fields,paket.data);
      var phase_id='';
      var html='<table border=1 style="padding:10px;">'
      if (paket.err.id===0){
        for (var x in d) {
          phase_id=getEV("job_id_"+baris_a+"_"+indek)
            +','+d[x].phase_id;
            
          html+='<tr>'
          +'<td align="left">';
            if(d[x].use_cost==1){
              html+='<input type="button" '
              +' id="btn_phase_'+baris_a+'_'+x+'_'+indek+'"'
              +' name="plus_phase_'+baris_a+'_'+indek+'"'
              +' value="+" >';
            }else{
              html+='<input type="button"'
              +' id="btn_phase_'+baris_a+'_'+x+'_'+indek+'"'
              +' name="plus_phase_'+baris_a+'_'+indek+'"'
              +' value="-" disabled>&nbsp;';
            }
            html+=d[x].phase_id;
            html+='<input type="hidden"'
            +' id="phase_id_'+baris_a+'_'+x+'_'+indek+'"'
            +' value="'+phase_id+'">'
          +'</td>'
          +'<td align="left">'+xHTML(d[x].name)
          //+'-->'+baris_a+'-'+x
          +'</td>'
          +'<td align="center">';
            if(d[x].use_cost==0){//tampilin
              html+='<button type="button" '
              +' name="select_phase_'+baris_a+'_'+indek+'"'
              +' class="icon_select" >'
              +'</button>';
            }else{// umpetin;
              html+='<button type="button" '
              +' name="select_phase_'+baris_a+'_'+indek+'"'
              +' class="icon_select" hidden>'
              +'</button>';
            }
          html+='</td>'
          +'</tr>';
          
          if(d[x].use_cost==1){
            html+='<tr '
            +' id="tr2_'+baris_a+'_'+x+'_'+indek+'"'
            +' style="display:none;">'
              +'<td colspan="3">'
                +'<div id="cost_look_'+baris_a+'_'+x+'_'+indek+'"'
                  +' style="padding-left:10px;">'
                +'</div>'
              +'</td>'
            +'</tr>'
          }
        }
      }
      html+='</table>';
      setiH('phase_look_'+baris_a+'_'+indek, html);
      if(paket.err.id!=0) content.infoPaket(indek,paket);
      this.addSelectFnPhase(indek, baris_a);
    });
  }

  addSelectFnPhase(indek,baris_a){
    var m=this.mother;
    var m2=this;
    var n=document.getElementsByName('select_phase_'+baris_a+'_'+indek);
    var n2=document.getElementsByName('plus_phase_'+baris_a+'_'+indek);
    var d=bingkai[indek].paket.data;
    var p=bingkai[indek].parent;
    var i;

    for(i=0;i<n.length;i++){
      n[i].dataset.i=i;
      n[i].dataset.phase_id=getEV('phase_id_'+baris_a+'_'+i+'_'+indek);
      n[i].onclick=function(){
        m.setJob(p,this.dataset.phase_id);
        ui.CLOSE_POP(indek);
      }
    }
    
    for(i=0;i<n2.length;i++){// plus phase
      n2[i].dataset.i=i;
      n2[i].onclick=function(){
        console.log(i);
        m2.costLook(indek,baris_a,this.dataset.i);
      }
    }
  }

  costLook(indek,baris_a,baris_b){
    if(getEV('btn_phase_'+baris_a+'_'+baris_b+'_'+indek)=="-"){
      setEV('btn_phase_'+baris_a+'_'+baris_b+'_'+indek, '+');
      setiH('cost_look_'+baris_a+'_'+baris_b+'_'+indek, '');
      setDisplay('tr2_'+baris_a+'_'+baris_b+'_'+indek, "none");
      return;
    }else{
      setEV('btn_phase_'+baris_a+'_'+baris_b+'_'+indek, '-');
      setDisplay('tr2_'+baris_a+'_'+baris_b+'_'+indek, "table-row");
    }
    
    //Costs.getPaging(indek,(paket)=>{
    db.run(indek,{
      query:"SELECT cost_id,name"
        +" FROM cost_codes"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND inactive=0"
    },(paket)=>{
      var d=objectMany(paket.fields,paket.data);
      var cost_id='';
      var html='<table border=1 style="padding:10px;">'

      if (paket.err.id===0){
        for (var x in d) {
          cost_id=getEV("phase_id_"+baris_a+'_'+baris_b+'_'+indek)
            +','+d[x].cost_id;
            
          html+='<tr>'
          +'<td align="left">'
            +d[x].cost_id
            +'<input type="hidden" '
            +' id="cost_id_'+baris_a+'_'+baris_b+'_'+x+'_'+indek+'"'
            +' value="'+cost_id+'">'
            
            +'</td>'
          +'<td align="left">'+xHTML(d[x].name)+'</td>'

          +'<td align="center">';
            html+='<button type="button" '
              +' name="select_cost_'+baris_a+'_'+baris_b+'_'+indek+'"'
              +' class="icon_select" >'
              +'</button>'
            +'</td>'
          +'</tr>';
        }
      }
      html+='</table>';
      setiH('cost_look_'+baris_a+'_'+baris_b+'_'+indek, html);
      if(paket.err.id!=0) content.infoPaket(indek,paket);
      this.addSelectFnCost(indek,baris_a,baris_b);
    });
  }
  
  addSelectFnCost(indek,baris_a,baris_b){
    var m=this.mother;
    var t='select_cost_'+baris_a+'_'+baris_b+'_'+indek;
    var n=document.getElementsByName(t);
    var d=bingkai[indek].paket.data;
    var p=bingkai[indek].parent;
    var i;
    var x;

    for(i=0;i<n.length;i++){
      n[i].dataset.i=i;
      x='cost_id_'+baris_a+'_'+baris_b+'_'+i+'_'+indek;
      n[i].dataset.cost_id=getEV(x);
      n[i].onclick=function(){
        m.setJob(p,this.dataset.cost_id);
        ui.CLOSE_POP(indek);
      }
    }
  }
  
  getOne(indek,id_,callBack){
    db.run(indek,{
      query:"SELECT * "
        +" FROM jobs"
        +" WHERE admin_name='"+bingkai[indek].admin.name+"'"
        +" AND company_id='"+bingkai[indek].company.id+"'"
        +" AND job_id='"+id_+"'"
    },(paket)=>{
      return callBack(paket);
    });
  }
}





// eof;346;319;
