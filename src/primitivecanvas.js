/*---------------------------------------------------------------------------------------------------------

  Primitive Canvas Class: Handles some basic graphics primitives shortcuts
  
  Author:    Sean Everett, but mostly known as: Talon

  IRC:       Talon (SwiftIRC: irc.swiftirc.net / Libera.Chat: irc.libera.chat)
  Discord:   talon0039
  GitHub:    https://www.github.com/Talon-1
  
---------------------------------------------------------------------------------------------------------*/

export class PrimitiveCanvas extends HTMLCanvasElement {
  #PrivateData;
  constructor(Parent, Width = 0, Height = 0,hookpointer = false,hookkeys = false) {
    super();
    this.width = Width;
    this.height = Height;
    this.#PrivateData = {
      Keys: [], //Collection for key states.
    }

    //Init callbacks
    if (hookpointer) { this.#InitializePointers(); }
    if (hookkeys) { this.#InitializeKeys(); }

    //Embed into document
    if (Parent instanceof HTMLElement) { Parent.appendChild(this); }
  }
  //Private Functions
  #InitializePointers() { 
    //Pointer events (and mouse wheel)
    this.addEventListener('pointerenter',(e) => { this.dispatchEvent(new CustomEvent('userinput', { bubbles: false, detail: { target: this, jsEvent: e } })); });
    this.addEventListener('pointerdown',(e) => { this.dispatchEvent(new CustomEvent('userinput', { bubbles: false, detail: { target: this, jsEvent: e } })); });
    this.addEventListener('pointermove',(e) => { this.dispatchEvent(new CustomEvent('userinput', { bubbles: false, detail: { target: this, jsEvent: e } })); });
    this.addEventListener('pointerup',(e) => { this.dispatchEvent(new CustomEvent('userinput', { bubbles: false, detail: { target: this, jsEvent: e } })); });
    this.addEventListener('pointercancel',(e) => { this.dispatchEvent(new CustomEvent('userinput', { bubbles: false, detail: { target: this, jsEvent: e } })); });
    this.addEventListener('pointerout',(e) => { this.dispatchEvent(new CustomEvent('userinput', { bubbles: false, detail: { target: this, jsEvent: e } })); });
    this.addEventListener('pointerleave',(e) => { this.dispatchEvent(new CustomEvent('userinput', { bubbles: false, detail: { target: this, jsEvent: e } })); });
    this.addEventListener('wheel',(e) => { this.dispatchEvent(new CustomEvent('userinput', { bubbles: false, detail: { target: this, jsEvent: e } })); });
    //Allow rightclick without bringing up normal browser context menu
    document.addEventListener('contextmenu', (e) => { if (e.target == this) { e.preventDefault(); } });
  }
  #InitializeKeys() { 
    document.addEventListener('keydown', (e) => { if (!e.repeat) { this.#PrivateData.Keys[e.keyCode] = true; } this.dispatchEvent(new CustomEvent('userinput', { bubbles: false, detail: { target: this, jsEvent: e } })); });
    document.addEventListener('keyup', (e) => { if (!e.repeat) { this.#PrivateData.Keys[e.keyCode] = false; } this.dispatchEvent(new CustomEvent('userinput', { bubbles: false, detail: { target: this, jsEvent: e } })); });
  }
  //Return keystate array
  keys() { return this.#PrivateData.Keys; }

  /*
    Flags Common on All Draw Commands:
    f = fill (fill with color)
    s = stroke (outline with color)
  */

    drawClear(props = {}) {
    let Ctx = this.getContext("2d");
    if (typeof props == "object") {
  		Ctx.save();
      Ctx.beginPath();
      Ctx.rect(0,0,this.width,this.height);
      Ctx.closePath();
      Object.assign(Ctx,props);
      Ctx.fill();
      Ctx.restore();
    }
    else { Ctx.clearRect(0, 0, this.width, this.height); }
  }
  drawCircle(props = {},flags,size,x,y) {
    let Ctx = this.getContext("2d");
		Ctx.save();
    Ctx.beginPath();
    Ctx.arc(x,y,size,0,Math.PI*2);
    Ctx.closePath();    
    Object.assign(Ctx,props);
    if (flags.indexOf("s") != -1) { Ctx.stroke(); }
    if (flags.indexOf("f") != -1) { Ctx.fill(); }
    Ctx.restore();
  }
  drawLine(props = {},flags,x1,y1,x2,y2) {
    let Ctx = this.getContext("2d");
		Ctx.save();
    //Ctx.lineWidth = size;
    //Ctx.lineCap = 'round';
    Ctx.beginPath();
    Ctx.moveTo(x1,y1);
    Ctx.lineTo(x2,y2);
    Ctx.moveTo(x2,y2);
    Ctx.closePath();
    Object.assign(Ctx,props);
    if (flags.indexOf("s") != -1) { Ctx.stroke(); }
    if (flags.indexOf("f") != -1) { Ctx.fill(); }
    Ctx.restore();
  }
  drawRect(props = {},flags,x,y,w,h,radius) {
    let Ctx = this.getContext("2d");
		Ctx.save();
    Ctx.beginPath();
    if (flags.indexOf("e") != -1) {
      Ctx.moveTo(x+radius, y);
      Ctx.lineTo(x+w-radius, y);
      Ctx.bezierCurveTo(x+w, y,x+w, y, x+w, y+radius);
      Ctx.lineTo(x+w, y+h-radius);
      Ctx.bezierCurveTo(x+w, y+h, x+w, y+h, x+w-radius, y+h);
      Ctx.lineTo(x+radius, y+h);
      Ctx.bezierCurveTo(x,y+h, x, y+h, x, y+h-radius);
      Ctx.lineTo(x, y+radius);
      Ctx.bezierCurveTo(x, y, x, y, x+radius, y);
    }
    else { Ctx.rect(x,y,w,h); }
    Ctx.closePath();
    Object.assign(Ctx,props);
    if (flags.indexOf("s") != -1) { Ctx.stroke(); }
    if (flags.indexOf("f") != -1) { Ctx.fill(); }
    Ctx.restore();
  }

  //Draws IRC Formatted text at a given x,y
  /*
    Additional Flags:
    c = center (x,y treated as "middle" of text)

    IRC Control Codes Format:
     ✓ Standard Colors     \x03n or \x03n,n where n is 0-99 first is foreground, second is background
         100 in total (0-99), the original 16, mIRC's extended 84
     ✓ Hex Colors          \x04#rrggbb or \x04#rrggbb,#rrggbb where #rrggbb is hex color code
         Found in AdiIRC... (Potential TODO: support 8-digit hex codes for alpha)
     ✓ Bold                \x02
       Underline           \x1f
     ✓ Reverse             \x16
     ✓ Italic              \x1d
       Strikethru          \x1e
       Monospace           \x11
     ✓ Stop All Controls   \x0f
  */
  drawText(props = {},flags,x,y,text) {
    let Ctx = this.getContext("2d");
  	Ctx.save();
    Object.assign(Ctx,props);
    let metrics = Ctx.measureText(text);
    let b = 0, u = 0, r = 0, i = 0, s = 0, m = 0, bg = 100, fg = 100, colors = new Array("#FFFFFF","#000000","#00009D","#009300","#FF0000","#7F0000","#9C009C","#FC7F00","#FFFF00","#00FC00","#009393","#00FFFF","#0000FC","#FF00FF","#7F7F7F","#D2D2D2","#470000","#472100","#474700","#324700","#004700","#00472C","#004747","#002747","#000047","#2E0047","#470047","#47002A","#740000","#743A00","#747400","#517400","#007400","#007449","#007474","#004074","#000074","#4B0074","#740074","#740045","#B50000","#B56300","#B5B500","#7DB500","#00B500","#00B571","#00B5B5","#0063B5","#0000B5","#7500B5","#B500B5","#B5006B","#FF0000","#FF8C00","#FFFF00","#B2FF00","#00FF00","#00FFA0","#00FFFF","#008CFF","#0000FF","#A500FF","#FF00FF","#FF0098","#FF5959","#FFB459","#FFFF71","#CFFF60","#6FFF6F","#65FFC9","#6DFFFF","#59B4FF","#5959FF","#C459FF","#FF66FF","#FF59BC","#FF9C9C","#FFD39C","#FFFF9C","#E2FF9C","#9CFF9C","#9CFFDB","#9CFFFF","#9CD3FF","#9C9CFF","#DC9CFF","#FF9CFF","#FF94D3","#000000","#131313","#282828","#363636","#4D4D4D","#656565","#818181","#9F9F9F","#BCBCBC","#E2E2E2","#FFFFFF","inherit");
    ("" + text).replace(/(\x03(?:(?:\d\d?),)?(?:\d\d?)|[\x04](?:(?:[0-9A-Fa-f]{6}),)?(?:[0-9A-Fa-f]{6})|[\x02\x03\x04\x11\x16\x1d\x1e\x0f\x1f])([^\x02\x03\x04\x11\x16\x1d\x1e\x0f\x1f]*)/gu,(match, control, string) => {
      if (control == '\x03') { fg = bg = 100; } 
      else if (control == '\x02') { b = !b; } 
      else if (control == '\x1f') { u = !u; } 
      else if (control == '\x16') { [bg, fg] = [fg, bg]; } 
      else if (control == '\x1d') { i = !i; } 
      else if (control == '\x1e') { s = !s; } 
      else if (control == '\x11') { m = !m; } 
      else if (control == '\x0f') { b = u = r = i = s = m = 0; fg = bg = 100; } 
      else if (/^\x03/.test(control)) {
        let fgt = /^\x03(\d\d?)$/.exec(control), bt = /^\x03(\d\d?),(\d\d?)$/.exec(control);
        if (Array.isArray(fgt) && fgt.length > 0) { fg = parseInt(fgt[1]) + 0; } 
        else if (Array.isArray(bt) && bt.length > 0) { fg = parseInt(bt[1]) + 0; bg = parseInt(bt[2]) + 0; }
      } 
      else if (/^(?:\x04)/u.test(control)) {
        let fgt = /^[\x04]([0-9A-Fa-f]{6})$/.exec(control), bt = /^[\x04]([0-9A-Fa-f]{6}),([0-9A-Fa-f]{6})$/.exec(control);
        if (Array.isArray(fgt) && fgt.length > 0) { fg = fgt[1]; } 
        else if (Array.isArray(bt) && bt.length > 0) { fg = bt[1]; bg = bt[2]; }
      }
      let smetrics = Ctx.measureText(string);
      if (bg < 100) { this.drawRect({fillStyle: (isNaN(bg) ? '#' + bg : colors[bg]) , lineWidth: 1},"f",x,y,smetrics.width,(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent)); }
      if (fg < 100) { Ctx.fillStyle = (isNaN(fg) ? '#' + fg : colors[fg]); }
      else { Ctx.fillStyle = props.fillStyle; }
      Ctx.font = (b ? "bold " : "") + (i ? "italic " : "") + props.font;
      if (flags.indexOf("s") != -1) { 
        if (flags.indexOf("c") != -1) { Ctx.strokeText(string,x - metrics.width / 2,y + (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) / 2); }
        else { Ctx.strokeText(string,x,y + (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent)); }
      }
      if (flags.indexOf("f") != -1) { 
        if (flags.indexOf("c") != -1) { Ctx.fillText(string,x - metrics.width / 2,y + (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) / 2); }
        else { Ctx.fillText(string,x,y + (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent)); }
      }   
      x += smetrics.width;
    });
    Ctx.restore();
  }

  //Copies x,y,w,h from source (another canvas getcontext2d) and puts it onto canvas at destination dx,dy,dw,dh
  drawCopy(flags,Source,x,y,w,h,dx,dy,dw,dh) {
    if (flags.indexOf("p") != -1) { this.getContext("2d").putImageData(Source.getContext("2d").getImageData(x,y,w,h),dx,dy); }
    else { this.getContext('2d').drawImage(Source,x,y,w,h,dx,dy,dw || w,dh || h); }
  }

  //draws a polygon given an array of xy values [x1,y1,x2,y2,x3,y3,...] at a given offset
  //Assumes these are 2d plot points away from the origin (0,0) in a clockwise or counter-clockwise order.
  // Also note, no need to make the first and last point identical to "close" the polygon
  //Note: Flags - f == fill, without it's just the outline.
  drawPoly(props = {},flags,Poly,ox = 0,oy = 0) {
    let Ctx = this.getContext("2d");
		Ctx.save();
    Object.assign(Ctx,props);
    Ctx.beginPath();
    if (flags.indexOf("f") != -1) {
      Ctx.moveTo(Poly[0] + ox,Poly[1] + oy);
      for (let x = 0; x < Poly.length; x += 2) { Ctx.lineTo(Poly[(x+2) % Poly.length] + ox,Poly[(x+3) % Poly.length] + oy); }
      Ctx.closePath();
      Ctx.fill();
    }
    else {
      for (let x = 0; x < Poly.length; x += 2) {
        Ctx.moveTo(Poly[x] + ox,Poly[x+1] + oy);
        Ctx.lineTo(Poly[(x+2) % Poly.length] + ox,Poly[(x+3) % Poly.length] + oy);
        Ctx.moveTo(Poly[(x+2) % Poly.length] + ox,Poly[(x+3) % Poly.length] + oy);
      }
      Ctx.closePath();
      Ctx.stroke();
    }
    Ctx.restore();
  }

  drawWrappedSphere(size,x,y,from,shift) {
    let Ctx = this.getContext("2d");
    let Image = Ctx.getImageData(0,0,this.width,this.height);
    let Texture = from.getContext("2d").getImageData(0,0,from.width,from.height);
    let rsq = size * size , area = size * size * 4;
    for (var i = 0 ; i < area; i++) {
      let tx = (i % (size * 2)) - size, ty = (i / (size * 2)) - size;
      let msq = tx * tx + ty * ty;
      if (msq <= rsq) {
        let px = (Math.atan2(tx,Math.sqrt(rsq - msq)) / (2 * Math.PI) + 0.5) * (from.width - 1) , py = (Math.acos(-ty / size) / Math.PI) * (from.height - 1);
        let ImageX = Math.floor(tx + x) , ImageY  = Math.floor(ty + y);
        let TexX = Math.floor(px + shift) , TexY  = Math.floor(py);
        if (TexX < 0) { TexX += from.width - 1; }
        if (TexX >= from.width) { TexX = Math.floor(TexX % from.width); }
        if (TexY < 0) { TexY += from.height - 1; }
        if (TexY >= from.height) { TexY = Math.floor(TexY % from.height); }
        let tindex = (ImageX + ImageY * this.width) * 4 , findex = (TexX + TexY * from.width) * 4;
        for (var q = 0; q <= 3; q++) { Image.data[tindex + q] = Texture.data[findex + q]; }
      }
    }
    Ctx.putImageData(Image, 0, 0);
  }
}
customElements.define('primitive-canvas', PrimitiveCanvas, { extends: "canvas" });

export class Color {
  #Data;
  constructor(clr = 0) {
    this.#Data = { R: 0, G: 0, B: 0, A: 0 }
    if (!isNaN(clr)) { this.fromInt(clr); }
    else if (Color.HexExpr().test(clr)) { this.fromHex(clr); }
    else if (Color.RgbExpr().test(clr)) { this.fromRGB(clr); }
  }
  static RgbExpr() { return /^rgba?\x28([^,]+),([^,]+),([^,]+)(?:,([^,]+))?\x29$/i; }
  static HexExpr() { return /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i; }
  a(val) { if (val === undefined) { return this.#Data.A; } else { this.#Data.A = val; } }
  r(val) { if (val === undefined) { return this.#Data.R; } else { this.#Data.R = val; } }
  g(val) { if (val === undefined) { return this.#Data.G; } else { this.#Data.G = val; } }
  b(val) { if (val === undefined) { return this.#Data.B; } else { this.#Data.B = val; } }
  asInt() { return ((this.#Data.A << 24) | (this.#Data.B << 16) | (this.#Data.G << 8) | this.#Data.R); }
  asHex() { return `#${this.#Data.R.toString(16).padStart(2, '0')}${this.#Data.G.toString(16).padStart(2, '0')}${this.#Data.B.toString(16).padStart(2, '0')}`; }
  asHexAlpha() { return `#${this.#Data.R.toString(16).padStart(2, '0')}${this.#Data.G.toString(16).padStart(2, '0')}${this.#Data.B.toString(16).padStart(2, '0')}${this.#Data.A.toString(16).padStart(2, '0')}`; }
  asHSL() {
    let r = this.#Data.R / 255, g = this.#Data.G / 255, b = this.#Data.B / 255, max = Math.max(r, g, b), min = Math.min(r, g, b), h, s, l = (max + min) / 2;
    if (max == min) { h = s = 0; } // achromatic
    else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return `hsl(${(h * 360).toFixed(0)},${(s * 100).toFixed(0)}%,${(l * 100).toFixed(0)}%)`;
  }
  asRGB() { return `rgb(${this.#Data.R},${this.#Data.G},${this.#Data.B})`; }
  asRGBA() { return `rgba(${this.#Data.R},${this.#Data.G},${this.#Data.B},${((255-this.#Data.A)/255).toFixed(2)})`; }
  fromInt(color) { 
    this.#Data.A = (color >> 24) & 0xFF;
    this.#Data.B = (color >> 16) & 0xFF;
    this.#Data.G = (color >> 8) & 0xFF;
    this.#Data.R = color & 0xFF;
  }
  fromHex(hex) {  
    hex.replace(Color.HexExpr(),(m,r,g,b) => {
      this.#Data.R = parseInt(r,16);
      this.#Data.G = parseInt(g,16);
      this.#Data.B = parseInt(b,16);
    });
  }
  fromRGB(rgba) {
    rgba.replace(Color.RgbExpr,(m,r,g,b,a) => {
      this.#Data.R = parseInt(r);
      this.#Data.G = parseInt(g);
      this.#Data.B = parseInt(b);
      this.#Data.A = Math.floor(255 - (parseFloat(a) * 255)) || 0;
    });
  }
}