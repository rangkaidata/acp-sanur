/*
 * name: budiono;
 * date: jan-09, 09:12, tue-2024; class oop;
 * edit: mar-15, 09:43, fri-2024; dibuat karena menggunakan basic sql (small query);
 * edit: nov-22, 10:12, fri-2024; #27; data_locker;
 * edit: dec-09, 20:50, mon-2024; #30; add save as;
 * edit: dec-14, 15:21, sat-2024; #31; add properties button;
 * edit: dec-17, 17:05, tue-2024; #31; new callback properties;
 * edit: dec-20, 13:06, thu-2024; #31; 
 * ----------------------------------; happy new year 2026;
 * edit: mar-18, 14:13, wed-2026; #91; preview, next, prev;
 */ 

class ActionForm2 {
  
  constructor(bigBos){
    this.name="tes";
    this.o=bigBos;
  }

  modePaging(indek){
    console.log('mode-paging: '+this.name);
    ui.destroy_child(indek);// tutup all sub-form;
    
    const pop_up=bingkai[indek].pop_up;
    const look_up=bingkai[indek].look_up;
    toolbar.none(indek);
    
    bingkai[indek].metode=MODE_READ;
    bingkai[indek].text_search='';
    
    if(pop_up==true)toolbar.cancel(indek,()=>{ui.CLOSE_POP(indek)});
    if(!this.o.hideHide) toolbar.hide(indek);
    if(!this.o.hideClose) {
      if(pop_up!=true) toolbar.close(indek);// tdk digunakan di pop_up;
    }
    if(!this.o.hideSearch) toolbar.search(indek,()=>{this.modeSearch(indek,this.o);});
    if(!this.o.hideRefresh) toolbar.refresh(indek,()=>{
      bingkai[indek].refresh=false;
      this.modePaging(indek,this.o);
    });
    if(!this.o.hideNew) toolbar.neuu(indek,()=>{this.modeCreate(indek,this.o);});
    if(!this.o.hideExport) toolbar.download(indek,()=>{this.modeExport(indek,this.o);});
    if(!this.o.hideImport) toolbar.upload(indek,()=>{this.modeImport(indek,this.o);});
    if(!this.o.hideSelect) toolbar.select(indek,()=>{this.modeSelect(indek,this.o);});
    if(!this.o.hideMore) toolbar.more(indek,()=>Menu.more(indek));
    
    if(this.o.hidePreview==false) toolbar.preview(indek,()=>{
      this.modePreview(indek,true);
    });
    
    //alert(bingkai[indek].paging.limit);
    getPagingLimit(indek);
    this.o.readPaging(indek);
  }
  
  modeCreate(indek){
    console.log('mode-create');
    this.o.formEntry(indek,MODE_CREATE);

    toolbar.none(indek);
    toolbar.hide(indek);
    toolbar.back(indek,()=>{this.modePaging(indek,this.o);});
    if(!this.o.hideSave) {
      toolbar.save(indek,()=>{this.o.createExecute(indek);});
      if(!this.o.hidePaste){
// PASTE: belum bisa paste, nanti aja, paste belum prioritas;
//        toolbar.paste(indek,()=>{this.o.paste(indek);})
      }
    }
  }

  modeSearch(indek){
    console.log('mode-search');
    bingkai[indek].paging.page=1;
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
    this.o.search(indek);
  }

  lastMode(indek){
    console.log('last-mode');
    bingkai[indek].text_search==''?
    this.modePaging(indek,this.o):
    this.searchResult(indek,this.o);
  }
/*  
  lastModeOffset(indek){
    console.log('last-mode');
    bingkai[indek].text_search==''?
    this.modePaging(indek,this.o):
    this.searchResult(indek,this.o);
  }
*/
  modeUpdate(indek){
    console.log('mode-update');
    toolbar.none(indek);
    toolbar.hide(indek);
    this.o.formEntry(indek,MODE_UPDATE);
    this.o.readOne(indek,()=>{
      toolbar.back(indek,()=>{this.lastMode(indek,this.o);});
      if(!this.o.hideSave) {
        toolbar.save(indek,()=>{this.o.updateExecute(indek);})
      }
      if(!this.o.hideSaveAs){
        toolbar.saveas(indek,()=>{this.modeDuplicate(indek);})
      }
      if(!this.o.hideProperties){
        toolbar.properties(indek,()=>{this.o.properties(indek);})
      }
      if(!this.o.hideCopy){
        toolbar.copy(indek,()=>{
          getPath(indek,'clipboard',(h)=>{
            mkdir(indek,h.folder,(h2)=>{
              // return callback(h2);
              this.copy_to_clipboard(indek,this.o.table_name);
            });
          });
          
        })
      }
      if(this.o.hidePreview==false) toolbar.preview(indek,()=>{
        this.modePreview(indek,false);
      });
    });
    if(!this.o.hideNext){
      toolbar.next(indek,()=>{this.o.nextPrevious(indek,1);})
    }
    if(!this.o.hidePrevious){
      toolbar.previous(indek,()=>{this.o.nextPrevious(indek,-1);})
    }
  }
    
  copy_to_clipboard(indek,table_name){// disini pecah ke text-1000;
    var id=new Date().getTime();
    var name=bingkai[indek].copy_data.name;
    var copy_data=btoa(JSON.stringify(bingkai[indek].copy_data));
    var i;
    var srb='';
    var new_copy=[];
    
    for(i=0;i<copy_data.length;i++){
      if(i==0){
        srb=copy_data[i];
      }else{
        srb+=copy_data[i];
        if((i % 1000)==0) {//mod
          new_copy.push(srb);
          srb=''; // kosongkan
        };
      }
    }
    if(srb!=""){// salin potongan terakhir
      new_copy.push(srb);
    }

    db.execute(indek,{
      query:"INSERT INTO clipboard"
        +"(clipboard_id,modul,name,content)"
        +" VALUES "
        +"('copy_"+id+"'"
        +",'"+table_name+"'"
        +",'"+name+"'"
        +",'"+JSON.stringify(new_copy)+"'"
        +")"
    });
  }
  
  modeDelete(indek){
    console.log('mode-delete');
    toolbar.none(indek);
    toolbar.hide(indek);
    this.o.formEntry(indek,MODE_DELETE);
    this.o.readOne(indek,()=>{
      toolbar.back(indek,()=>{this.lastMode(indek,this.o);});
      toolbar.delet(indek,()=>{this.o.deleteExecute(indek);});
      if(!this.o.hideProperties){
        toolbar.properties(indek,()=>{this.o.properties(indek);})
      }
    });
  }

  modeExport(indek){
    console.log('mode-export');
    bingkai[indek].metode=MODE_EXPORT;
    toolbar.none(indek);
    toolbar.hide(indek);
    toolbar.back(indek,()=>{this.modePaging(indek,this.o);});
    this.o.exportExecute(indek);
  }

  modeImport(indek){
    console.log('mode-import');
    bingkai[indek].metode=MODE_IMPORT;
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
    
    bingkai[indek].metode=MODE_READ;
    
    this.o.readSelect(indek);
  }
  
  modePreview(indek,kursor){
    console.log('mode-preview');
    toolbar.none(indek);
    toolbar.hide(indek);
    toolbar.back(indek,()=>{this.modePaging(indek,this.o);});
    toolbar.print(indek,()=>{this.modePrint(indek);});
    toolbar.edit(indek,()=>{this.modeUpdate(indek);});

    toolbar.previous(indek,()=>{
      this.o.nextPrevious(indek,-1);
    });
    toolbar.next(indek,()=>{
      this.o.nextPrevious(indek,1);
    });
    
    bingkai[indek].metode=MODE_VIEW;
    if(bingkai[indek].offset==undefined) 
      bingkai[indek].offset=0;// default=0;
    
    this.o.preview(indek,kursor);
  }
  
  modePrint(indek){
    const svgElement = document.getElementById('mySVG_'+indek);
    const svgCode = svgElement.outerHTML;
    const printWindow = window.open('', 'PrintWindow');
    
    
    printWindow.document.write('<html><body>' + svgCode + '</body></html>');
    printWindow.document.close();
    
    // Wait briefly for content to load, then print
  //  setTimeout(function() {
      printWindow.print();
      printWindow.close();
  //  }, 500); 
  }
  
  modeDeleteAll(indek){
    console.log('mode-deleteAll');
    bingkai[indek].metode=MODE_DELETE;
    toolbar.none(indek);
    toolbar.hide(indek);
    toolbar.back(indek,()=>{this.modeSelect(indek,this.o);});
    this.o.deleteAllExecute(indek);
  }
  
  modeDuplicate(indek){
    console.log('mode-create-as');
    this.o.duplicate(indek);

    toolbar.none(indek);
    toolbar.hide(indek);
    toolbar.back(indek,()=>{this.modePaging(indek,this.o);});
    toolbar.save(indek,()=>{this.o.createExecute(indek);});
  }
  
  addPagingFn(indek){// paling mindblowing :D
    console.log('add-paging');
    let abc=this;
    let limit=bingkai[0].paging.select;

    const paket=bingkai[indek].paket;  
    const biji=bingkai[indek].biji;
    const f1=document.getElementById('page_limit_'+indek);
    const f2=document.getElementById('btn_first_'+indek);
    const f3=document.getElementById('btn_last_'+indek);
    const nm=document.getElementsByName('btn_number_'+indek);

    if(f1){
      f1.onchange=()=>{
        bingkai[indek].page=1;
        bingkai[indek].paging.page=1;
        bingkai[indek].paging.select=getEI('page_limit_'+indek);
        
        var pg_def=bingkai[indek].paging.select;
        switch (bingkai[indek].paging.select){
          case 0:limit=10;break;
          case 1:limit=20;break;
          case 2:limit=50;break;
          case 3:limit=100;break;
          case 4:limit=200;break;
        }
        bingkai[indek].paging.limit=limit;
        setPagingLimit(indek);
        if(PAGING){
          abc.modePaging(indek);
        }else{
          abc.searchResult(indek);
        }
      }  
    }
    if(f2){
      f2.onclick=()=>gotoPage(indek,biji.first);
    }
    if(f3){
      f3.onclick=()=>gotoPage(indek,biji.last);
    }
    for(var i=0;i<nm.length;i++){
      nm[i].onclick=function(){
        gotoPage(indek,this.value);
      }
    }
    function gotoPage(indek,page){
      bingkai[indek].paging.page=page;
      if(PAGING){
        abc.modePaging(indek);
      }else{
        abc.searchResult(indek);
      }
    }
  }
};

// eof: 143;177;194;
