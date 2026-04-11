/*
 * name: budiono;
 * date: jan-09, 09:12, tue-2024; class oop;
 */ 

class ActionForm {
  
  constructor(bigBos){
    this.name="tes";
    this.o=bigBos;
  }

  modePaging(indek){
    console.log('mode-paging: '+this.name);
    ui.destroy_child(indek);// tutup all sub-form;
    
    const pop_up=bingkai[indek].pop_up;
    const look_up=bingkai[indek].look_up;
    bingkai[indek].metode=MODE_READ;
    toolbar.none(indek);
    
    if(pop_up==true) toolbar.cancel(indek,()=>{ui.CLOSE_POP(indek)});
    if(!this.o.hideHide) toolbar.hide(indek);
    if(!this.o.hideSearch) toolbar.search(indek,()=>{this.modeSearch(indek,this.o);});
    if(!this.o.hideRefresh) toolbar.refresh(indek,()=>{this.modePaging(indek,this.o);});
    if(!this.o.hideNew) toolbar.neuu(indek,()=>{this.modeCreate(indek,this.o);});
    if(!this.o.hideExport) toolbar.download(indek,()=>{this.modeExport(indek,this.o);});
    if(!this.o.hideImport) toolbar.upload(indek,()=>{this.modeImport(indek,this.o);});
    if(!this.o.hideSelect) toolbar.select(indek,()=>{this.modeSelect(indek,this.o);});
    if(!this.o.hideMore) toolbar.more(indek,()=>Menu.more(indek));
    
    if(look_up==false){
      db3.readPaging(indek,()=>{this.o.readShow(indek);});
    }else{
      db3.readLook(indek,()=>{this.o.readShow(indek);});
    }
  }
  
  modeCreate(indek){
    console.log('mode-create');
    this.o.formEntry(indek,MODE_CREATE);

    toolbar.none(indek);
    toolbar.hide(indek);
    toolbar.back(indek,()=>{this.modePaging(indek,this.o);});
    toolbar.save(indek,()=>{this.o.createExecute(indek);});
  }

  modeSearch(indek){
    console.log('mode-search');
    bingkai[indek].metode=MODE_SEARCH;
    content.search(indek,()=>this.searchExecute(indek,this.o));
    
    toolbar.none(indek);
    if(!this.o.hideHide) toolbar.hide(indek);
    toolbar.back(indek,()=>{this.modePaging(indek,this.o);});
  }
  
  searchExecute(indek){
    console.log('search-execute');
    bingkai[indek].text_search=getEV('text_search_'+indek);
    this.searchResult(indek,this.o);
  }
  
  searchResult(indek){
    console.log('search-result');
    toolbar.none(indek);
    if(!this.o.hideHide) toolbar.hide(indek);
    toolbar.back(indek,()=>{this.modeSearch(indek,this.o);});
    db3.search(indek,(paket)=>{
      bingkai[indek].paket=paket;
      bingkai[indek].metode=MODE_RESULT;
      this.o.readShow(indek);
    });
  }

  lastMode(indek){
    console.log('last-mode');
    bingkai[indek].text_search==''?
    this.modePaging(indek,this.o):
    this.searchResult(indek,this.o);
  }

  modeUpdate(indek){
    console.log('mode-update');
    toolbar.none(indek);
    toolbar.hide(indek);
    //this.o.formEntry(indek,MODE_UPDATE);
    //this.o.readOne(indek,()=>{
      //toolbar.back(indek,()=>{this.lastMode(indek,this.o);});
      //toolbar.save(indek,()=>{this.o.updateExecute(indek);})
    //});
  }

  modeDelete(indek){
    console.log('mode-delete');
    toolbar.none(indek);
    toolbar.hide(indek);
    this.o.formEntry(indek,MODE_DELETE);
    this.o.readOne(indek,()=>{
      toolbar.back(indek,()=>{this.lastMode(indek,this.o);});
      toolbar.delet(indek,()=>{this.o.deleteExecute(indek);});
    });
  }

  modeExport(indek){
    console.log('mode-export');
    toolbar.none(indek);
    toolbar.hide(indek);
    toolbar.back(indek,()=>{this.modePaging(indek,this.o);});
    this.o.exportExecute(indek);
  }

  modeImport(indek){
    console.log('mode-import');
    toolbar.none(indek);
    toolbar.hide(indek);
    toolbar.back(indek,()=>{this.modePaging(indek,this.o);});
    iii.uploadJSON(indek);
  }
  
  modeSelect(indek){
    console.log('mode-select');
    toolbar.none(indek);
    toolbar.hide(indek);
    toolbar.back(indek,()=>{this.modePaging(indek,this.o);});
    toolbar.delet(indek,()=>{this.modeDeleteAll(indek,this.o);});
    toolbar.delet.disabled(indek);
    db3.readSelect(indek,(paket)=>{
      this.o.selectShow(indek);
    });
  }
  
  modeDeleteAll(indek){
    console.log('mode-deleteAll');
    bingkai[indek].metode=MODE_DELETE;
    toolbar.none(indek);
    toolbar.hide(indek);
    toolbar.back(indek,()=>{this.modeSelect(indek,this.o);});
    this.o.deleteAllExecute(indek);
  }
  
  addPagingFn(indek){// paling mindblowing :D
    console.log('add-paging');
    let abc=this;
    const paket=bingkai[indek].paket;  
    const f1= document.getElementById('page_limit_'+indek);
    const f2=document.getElementById('btn_first_'+indek);
    const f3=document.getElementById('btn_last_'+indek);
    const nm=document.getElementsByName('btn_number_'+indek);

    if(f1){
      f1.onchange=()=>{
        bingkai[indek].page=1;
        bingkai[indek].paging.page=1;
        bingkai[indek].paging.select=getEI('page_limit_'+indek);
        this.modePaging(indek);
      }  
    }
    if(f2){
      f2.onclick=()=>gotoPage(indek,paket.paging.first);
    }
    if(f3){
      f3.onclick=()=>gotoPage(indek,paket.paging.last);
    }
    for(var i=0;i<nm.length;i++){
      const m=paket.paging.pages[i].page;
      nm[i].onclick=function(){
        gotoPage(indek,this.value);
      }
    }
    function gotoPage(indek,page){
      bingkai[indek].page=page;
      abc.modePaging(indek);
    }
  }
};// 143;177;
