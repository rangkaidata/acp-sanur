/*
 * name: budiono;
 * date: mar-14, 15:50, sat-2026; #91; svg;
 */


class TemplateSVG {

  constructor(stroke,stroke_width){
    this.stroke = stroke;
    this.stroke_width = stroke_width;
    this.font_family="Helvetica";
  }
  
  gambar(left,top,id,height,width,href){
    return ' <image '
      +' id="'+id+'"'
      +' x="'+left+'" y="'+top+'" '
      +' height="'+height+'" width="'+width+'" '
      +' href="'+href+'" />';
  }
  
  teks(left,top,id,size,caption,color,weight){
    return  '<text '
      +' id="'+id+'"'
      +' fill="'+color+'" '
      +' font-size="'+size+'" '
      +' font-family='+this.font_family 
      +' font-weight="'+weight+'" '
      +' x="'+left+'" y="'+top+'">'+caption
      +'</text>';
  }
  
  teksAnchor(left,top,id,size,caption,color,weight){
    return  '<text '
      +' id="'+id+'"'
      +' fill="'+color+'" '
      +' font-size="'+size+'" '
      +' font-family='+this.font_family 
      +' font-weight="'+weight+'" '
      +' text-anchor="end"'
      +' x="'+left+'" y="'+top+'">'+caption
      +'</text>';
  }
  
  panel(top,left,width,height,hcolor,color){
    return '<rect x="'+top+'" y="'+left+'" '
        +' width="'+width+'" height="20" '
        +' stroke='+this.stroke
        +' stroke-width='+this.stroke_width
        +' fill="'+hcolor+'" />'

      +' <rect x="'+top+'" y="'+(left+20)+'" '
        +' width="'+width+'" height="'+(height-20)+'" '
        +' stroke='+ this.stroke
        +' stroke-width='+ this.stroke_width
        +' fill="'+color+'" />'
  }

  garis (x1,y1,x2,y2) {
    return ' <line x1="'+x1+'" y1="'+y1+'" '
      +' x2="'+x2+'" y2="'+y2+'" '
      +' stroke='+this.stroke
      +' stroke-width='+this.stroke_width+' />'
  }

  kotak(top,left,width,height,color){
    return ' <rect x="'+top+'" y="'+left+'" '
      +' width="'+width+'" height="'+height+'" '
      +' stroke='+this.stroke
      +' stroke-width='+this.stroke_width
      +' fill="'+color+'" />';
  }
  
  halaman(top,left,width,height,color,stroke){
    return ' <rect x="'+top+'" y="'+left+'" '
      +' width="'+width+'" height="'+height+'" '
      +' stroke='+stroke
      +' stroke-width='+this.stroke_width
      +' fill="'+color+'" />';
  }

  tabel(top,left,width,height,hcolor,color,garis,kolom){
    let ga=garis;
    let g=[top+ga[0],left,top+ga[0],left+height];
    let gg=0;
    let g_svg='';
    
    for(gg=0;gg<garis.length;gg++){// garis table kolom
      
      g=[top+Number(garis[gg]), left, top+Number(garis[gg]), left+Number(height)];
      
      g_svg+=' <line x1="'+g[0]+'" y1="'+g[1]+'" ' // garis
        +' x2="'+g[2]+'" y2="'+g[3]+'" '
        +' stroke="#000" '
        +' stroke-width="0.5" />'
    }
    
    let letak=0;
    let tiga;

    for(gg=0;gg<kolom.length;gg++){// text

      tiga=kolom[gg];

      g_svg+='<text '
        +' fill="#555" '
        +' font-size="12" '
        +' font-family="Helvetica" '
        +' font-weight="bold" '
        +' x="'+tiga[0]+'" y="'+tiga[1]+'">'+tiga[2]
        +'</text>'
    }
    
    return '<rect x="'+top+'" y="'+left+'" '
        +' width="'+width+'" height="20" '
        +' stroke='+this.stroke
        +' stroke-width="0.5" '
        +' fill="'+hcolor+'" />'

      +' <rect x="'+top+'" y="'+(left+20)+'" '
        +' width="'+width+'" height="'+(height-20)+'" '
        +' stroke="#000" '
        +' stroke-width="0.5" '
        +' fill="'+color+'" />'

      +g_svg;
  }

  panel(top,left,width,height,hcolor,color){
    return '<rect x="'+top+'" y="'+left+'" '
        +' width="'+width+'" height="20" '
        +' stroke='+this.stroke
        +' stroke-width='+this.stroke_width
        +' fill="'+hcolor+'" />'

      +' <rect x="'+top+'" y="'+(left+20)+'" '
        +' width="'+width+'" height="'+(height-20)+'" '
        +' stroke='+this.stroke
        +' stroke-width='+this.stroke_width
        +' fill="'+color+'" />'
  }
}
