/*
 * name: budiono;
 * date: jan-12, 15:15, fri-2024; fresh new;
 */ 

class Grid{
  
  constructor(mother){
    this.mother=mother
  }
  
  addRow(indek,baris,oldBasket){
    console.log('add-row ');
    var newBasket=[];
    // var oldBasket=bingkai[indek].journal_detail;
    
    for(var i=0;i<oldBasket.length;i++){
      newBasket.push(oldBasket[i]);
      if(i==baris) this.mother.newRow(newBasket);
    }
    if(oldBasket.length==0) this.mother.newRow(newBasket);
    this.mother.setRows(indek,newBasket);
  }
  
  removeRow(indek,number,oldBasket){
    console.log('remove-row');
    var newBasket=[];
    // var oldBasket=bingkai[indek].journal_detail;
    
    this.mother.setRows(indek,oldBasket);
    for(let i=0;i<oldBasket.length;i++){
      if (i!=number) newBasket.push(oldBasket[i])
    }
    this.mother.setRows(indek,newBasket);
  }
} //eof:36
