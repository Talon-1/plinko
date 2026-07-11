/*---------------------------------------------------------------------------------------------------------

  Vector Math & Helpers (Still a Work in Progress)
  
  Author:    Sean Everett, but mostly known as: Talon

  IRC:       Talon (SwiftIRC: irc.swiftirc.net / Libera.Chat: irc.libera.chat)
  Discord:   talon0039
  GitHub:    https://www.github.com/Talon-1
  
---------------------------------------------------------------------------------------------------------*/

/*---------------------------------------------------------------------------------------------------------
  Helper Functions
---------------------------------------------------------------------------------------------------------*/
export function scaleNumber(num,log,abr,dec = 2) {
  let x = Math.log(num) / Math.log(log);
  return parseFloat(Math.pow(log,x % 1).toFixed(dec)) + abr[Math.floor(x)];
}
export function getRandomColor() {
  let letters = '0123456789ABCDEF', color = '#';
  for (let i = 0; i < 6; i++) { color += letters[Math.floor(Math.random() * 16)]; }
  return color;
}
export function hexToRgb(hex,alpha) {
  return hex.replace(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,(m,r,g,b) => { 
    if (!isNaN(alpha)) { return `rgba(${parseInt(r,16)},${parseInt(g,16)},${parseInt(b,16)},${alpha})`; }
    else { return `rgb(${parseInt(r,16)},${parseInt(g,16)},${parseInt(b,16)})`; }
  });
}
export function randInt(min,max) { return Math.floor(Math.random() * (max - min + 1) + min); }
export function randFloat(min,max) { return Math.random() * (max - min) + min; }
export function isBit(num,bit) { return num & (1 << (bit - 1)); } //Returns true if bit is active NOTE: starts at 1. (Useful to use a number as an "array" of booleans, IE "14" in Binary is "1110", so 1st bit is off, 2nd-4th is on.)
export function bitOn(num,bit) { return num | (1 << (bit - 1)); } //turns on bit at binary position "bit", NOTE: starts at 1 (so it reads like 1st,2nd,3rd)
export function bitOff(num,bit) { return num & ~(1 << (bit - 1)); } //turns off bit at binary position "bit", NOTE: starts at 1 (so it reads like 1st,2nd,3rd)
//Quadratic Formula has two solutions (-b +/- sqrt(b^2 -4ac)) / 2a ... (https://www.purplemath.com/modules/quadform.htm)
export function quadraticN(a,b,c) { if (a !== 0) { let det = Math.pow(b,2) - 4 * a * c; return ((-b - Math.sqrt(det)) / (2 * a)); } }
export function quadraticP(a,b,c) { if (a !== 0) { let det = Math.pow(b,2) - 4 * a * c; return ((-b + Math.sqrt(det)) / (2 * a)); } }
export function gcd(a,b) { return (b == 0 ? a : gcd(b,a % b)) }

// LineSegment Points from a-b and c-d
export function LineSegmentsIntersect(ax,ay,bx,by,cx,cy,dx,dy) {
  let DiffBA_x = bx - ax , DiffBA_y = by - ay;
  let DiffCD_x = cx - dx , DiffCD_y = cy - dy;
  let DiffCA_x = cx - ax , DiffCA_y = cy - ay;
  //Cross product between DiffBA and DiffCD
  let det = DiffBA_x * DiffCD_y - DiffBA_y * DiffCD_x;
  let t = (DiffCA_x * DiffCD_y - DiffCA_y * DiffCD_x) / det , u = (DiffBA_x * DiffCA_y - DiffBA_y * DiffCA_x) / det;
  if ((t < 0) || (u < 0) || (t > 1) || (u > 1)) { return false; }
  return true;
}

//Polygon1-2 is an array of x,y values like: [x,y,x,y]. ONLY pass unique points in clockwise or counter clockwise order. Call it "unclosed".
// Example say you have a triangle with points A,B,C ... to "close" this would be A,B,C,A (a to b, b to c, c back to a). This loop automatically
// re-uses the 1st point when it reaches the last point, treating it as "closed" so no need to pass a "closed" polygon.
export function OnPolygon(Polygon1, Polygon2,escape = true) {
  //Early escape test, if either polygon is fully contained in the other, any and every point will be inside the other
  let Point1 = new Vector2D(Polygon1[0],Polygon1[1]) , Point2 = new Vector2D(Polygon2[0],Polygon2[1]); 
  if (Point1.inPolygon(Polygon2) || Point2.inPolygon(Polygon1)) { return escape; }
  //Else: Iterate line segments and check for intersection
  for (let i = 0; i < Polygon1.length; i += 2) {
    for (let j = 0; j < Polygon2.length; j += 2) {
      if (LineSegmentsIntersect(Polygon1[i],Polygon1[i+1],Polygon1[(i+2) % Polygon1.length],Polygon1[(i+3) % Polygon1.length],Polygon2[j],Polygon2[j+1],Polygon2[(j+2) % Polygon2.length],Polygon2[(j+3) % Polygon2.length])) { return true; }
    }
  }
  return false;
}

export class Quadtree {
  constructor(bounds,max_objects = 10,max_levels = 4, level = 0) {
    this.max_objects = max_objects;
    this.max_levels = max_levels;
    this.level  = level;
    this.bounds = bounds;        
    this.objects = [];
    this.nodes = [];
  }
  split() { 
    let nextLevel   = this.level + 1,
    subWidth    = this.bounds.width/2,
    subHeight   = this.bounds.height/2,
    x           = this.bounds.x,
    y           = this.bounds.y;        
     
    //top right node
    this.nodes[0] = new Quadtree({
      x       : x + subWidth, 
      y       : y, 
      width   : subWidth, 
      height  : subHeight
    }, this.max_objects, this.max_levels, nextLevel);
        
    //top left node
    this.nodes[1] = new Quadtree({
      x       : x, 
      y       : y, 
      width   : subWidth, 
      height  : subHeight
    }, this.max_objects, this.max_levels, nextLevel);
        
    //bottom left node
    this.nodes[2] = new Quadtree({
      x       : x, 
      y       : y + subHeight, 
      width   : subWidth, 
      height  : subHeight
    }, this.max_objects, this.max_levels, nextLevel);
        
    //bottom right node
    this.nodes[3] = new Quadtree({
      x       : x + subWidth, 
      y       : y + subHeight, 
      width   : subWidth, 
      height  : subHeight
    }, this.max_objects, this.max_levels, nextLevel);    
  }
  getIndex(pRect) {
    let indexes = [],
        verticalMidpoint    = this.bounds.x + (this.bounds.width/2),
        horizontalMidpoint  = this.bounds.y + (this.bounds.height/2);    

    let startIsNorth = pRect.y < horizontalMidpoint,
        startIsWest  = pRect.x < verticalMidpoint,
        endIsEast    = pRect.x + pRect.width > verticalMidpoint,
        endIsSouth   = pRect.y + pRect.height > horizontalMidpoint;    

    //top-right quad
    if (startIsNorth && endIsEast) { indexes.push(0); }
    //top-left quad
    if (startIsWest && startIsNorth) { indexes.push(1); }
    //bottom-left quad
    if (startIsWest && endIsSouth) { indexes.push(2); }
    //bottom-right quad
    if (endIsEast && endIsSouth) { indexes.push(3); }

    return indexes;    
  }
  insert(pRect) {
    let i = 0, indexes;   
    //if we have subnodes, call insert on matching subnodes
    if (this.nodes.length) {
      indexes = this.getIndex(pRect);
      for (i = 0; i < indexes.length; i++) { this.nodes[indexes[i]].insert(pRect); }
      return;
    }
    //otherwise, store object here
    this.objects.push(pRect);
    //max_objects reached
    if (this.objects.length > this.max_objects && this.level < this.max_levels) {
      //split if we don't already have subnodes
      if (!this.nodes.length) { this.split(); }            
      //add all objects to their corresponding subnode
      for (i = 0; i < this.objects.length; i++) {
        indexes = this.getIndex(this.objects[i]);
        for (let k = 0; k < indexes.length; k++) { this.nodes[indexes[k]].insert(this.objects[i]); }
      }
      //clean up this node
      this.objects = [];
    }    
  }
  retrieve(pRect) {
    let indexes = this.getIndex(pRect),
        returnObjects = this.objects;
    //if we have subnodes, retrieve their objects
    if (this.nodes.length) { for (let i = 0; i < indexes.length; i++) { returnObjects = returnObjects.concat(this.nodes[indexes[i]].retrieve(pRect)); } }
    //remove duplicates
    if (this.level === 0) { return Array.from(new Set(returnObjects)); } 
    return returnObjects;    
  }
  clear() {
    this.objects = [];
    for(let i = 0; i < this.nodes.length; i++) { if (this.nodes.length) { this.nodes[i].clear(); } }
    this.nodes = [];    
  }
}

/*---------------------------------------------------------------------------------------------------------
  Generic Vector Classes, 2D and 3D
  Credits to javidx9 (OneLoneCoder) as some of the vector maths stuff is a port from his PGE
  (Pixel Game Engine)
  https://github.com/OneLoneCoder/olcPixelGameEngine
---------------------------------------------------------------------------------------------------------*/

export class Vector2D {
  constructor(x = 0,y = 0) {
    this.x = x;
    this.y = y;
  }
  //helpers
  _toRadians(angle) { return angle * (Math.PI / 180); }
  _toDegrees(angle) { return angle * (180 / Math.PI); }

  //DO stuff to (modify self)
  add(Vec) { this.x += Vec.x; this.y += Vec.y; return this; }
  sub(Vec) { this.x -= Vec.x; this.y -= Vec.y; return this; }
  mult(Vec) { this.x *= Vec.x; this.y *= Vec.y; return this; }
  div(Vec) { this.x /= Vec.x; this.y /= Vec.y; return this; }
  mod(Vec) { this.x %= Vec.x; this.y %= Vec.y; return this; }
  addScalar(Scalar) { this.x += Scalar; this.y += Scalar; return this; }
  subScalar(Scalar) { this.x -= Scalar; this.y -= Scalar; return this; }
  multScalar(Scalar) { this.x *= Scalar; this.y *= Scalar; return this; }
  divScalar(Scalar) { this.x /= Scalar; this.y /= Scalar; return this; }
  modScalar(Scalar) { this.x %= Scalar; this.y %= Scalar; return this; }
  normalize() { if (this.mag() > 0) { this.divScalar(this.mag()); } return this; }
  //Rotate (Input is the "angle" to rotate. Pass null for Vec to assume (0,0) or pass the central point to rotate about. set "bool" to true for degrees)
  rotate(Input,Vec,bool) {
    if (!Vec) { Vec = new Vector2D(0,0); }
    let rad = (bool ? this._toRadians(Input) : Input);
    let Cos = Math.cos(rad) , Sin = Math.sin(rad);
    let nx = (Vec.x + ((this.x - Vec.x) * Cos - (this.y - Vec.y) * Sin)), ny = (Vec.y + ((this.y - Vec.y) * Cos + (this.x - Vec.x) * Sin));
    this.x = nx; this.y = ny;
    return this;
  }
  setAngle(Scalar,bool) { let rad = (bool ? this._toRadians(Scalar) : Scalar); this.x = Math.cos(rad); this.y = Math.sin(rad); return this; }
  toFixed(Digits) { this.x = parseFloat(this.x.toFixed(Digits)); this.y = parseFloat(this.y.toFixed(Digits)); return this; }

  //RETURN scalar about
  angle(bool) { let rad = Math.atan2(this.y,this.x); return (bool ? this._toDegrees(rad) : rad); } //Angle of a given vector. Default radians, set bool to true for degrees.
  mag() { return Math.sqrt(Math.pow(this.x,2) + Math.pow(this.y,2)); } //Return magnitude (length)
  magSq() { return Math.pow(this.x,2) + Math.pow(this.y,2); } //return Magnitude (length) Squared
  cross3(Vec2,Vec3) { return ((Vec2.x - this.x) * (Vec3.y - this.y) - (Vec2.y - this.y) * (Vec3.x - this.x)); } //Cross product as a scalar between 3 vectors (self,vec2,vec3)
  invDot(Vec) { return this.x * Vec.x - this.y * Vec.y; } //Inverse Dot product of self and vec
  dot(Vec) { return this.x * Vec.x + this.y * Vec.y; } //Dot product of self and vec
  //cross product as a scalar!
  wedge(Vec) { return this.x * Vec.y - this.y * Vec.x; }

  //RETURN bool about
  isEqual(Vec) { return (this.x === Vec.x && this.y === Vec.y); }
  notEqual(Vec) { return (this.x !== Vec.x && this.y !== Vec.y); }
  isLess(Vec) { return (this.y < Vec.y || (this.y === Vec.y && this.x < Vec.x)); }
  isGreater(Vec) { return (this.y > Vec.y || (this.y === Vec.y && this.x > Vec.x)); }
  //Point & size are both Vector2D... Point is x,y (top-left) Size x,y is it's width/height
  inRect(Point,Size) { return ((this.x >= Point.x && this.x <= Point.x + Size.x) && (this.y >= Point.y && this.y <= Point.y + Size.y)); }
  //Array is: [x,y,w,h] Note: for convenience, easier than making a new Vector2D() twice from an array to use the above one..
  inRectArray(Array) { return ((this.x >= Array[0] && this.x <= Array[0] + Array[2]) && (this.y >= Array[1] && this.y <= Array[1] + Array[3])); }
  //Center is a Vector2D, Radius is scalar
  inCircle(Center,Radius) { return ((Math.pow(Center.x - this.x, 2) + Math.pow(Center.y - this.y, 2)) <= Math.pow(Radius, 2)); }
  //Poly is an array of x,y values like: [x,y,x,y]. ONLY pass unique points in clockwise or counter clockwise order. (think connect the dots) Call it "unclosed".
  // Example say you have a triangle with points A,B,C ... to "close" this would be A,B,C,A (a to b, b to c, c back to a). This loop automatically
  // re-uses the 1st point when it reaches the last point, treating it as "closed" so no need to pass a "closed" polygon.
  inPolygon(Poly) {
    let cn = 0; //Crossing counter
    for (let i = 0; i < Poly.length; i += 2) { //Iterate through all edges of the polygon
      if ((Poly[i+1] <= this.y) && (Poly[(i+3) % Poly.length] > this.y) || (Poly[i+1] > this.y) && (Poly[(i+3) % Poly.length] <= this.y)) { //Condition1 = Upward Crossing, Condition2 = downward crossing
        //compute the actual edge-ray intersect x-coordinate
        let vt = (this.y - Poly[i+1]) / (Poly[(i+3) % Poly.length] - Poly[i+1]);
        if (this.x < Poly[i] + vt * (Poly[(i+2) % Poly.length] - Poly[i])) { cn++; } //If X < intersect, a valid crossing of polyY=Y right of X
      }
    }
    // Bitwise trick, basically ensures the number is odd. every "valid cross" we flop from inside/outside. if we have an odd number of
    // flops, we're inside! (/1: in, 2: out, 3: in, 4: out, etc...) if we have an even number of flops, we're outside.
    if ((cn & 1) > 0) { return true; }
  }

  //RETURN vector about
  cross(Vec) { //Cross Product between two vectors (technically this only works in 3D but this is used all the time to get the perpendicular direction in 2D)
    if (arguments.length > 0) { return new Vector2D(Vec.y - this.y,this.x - Vec.x); }
    else { return new Vector2D(-this.y,this.x); }
  }
  clone() { return new Vector2D(this.x,this.y); } //Return a new vector with cloned values
  norm() { let mag = this.mag(); return new Vector2D(this.x / mag,this.y / mag); } //Return a new vector normalized (unit length = 1)
  perp(negate = false) { return new Vector2D(-this.y,this.x).multScalar((negate ? -1 : 1)); } //Return a new vector of the perpendicular direction
  neg() { return new Vector2D(-this.x,-this.y); } //Return a new vector with cloned values negated
  floor() { return new Vector2D(Math.floor(this.x),Math.floor(this.y)); } //Return new vector with values floored
  ceil() { return new Vector2D(Math.ceil(this.x),Math.ceil(this.y)); } //Return new vector with values ceil'd
  max(Vec) { return new Vector2D(Math.max(this.x,Vec.x),Math.max(this.y,Vec.y)); } //Return new vector with maximum values between self and vec.
  min(Vec) { return new Vector2D(Math.min(this.x,Vec.x),Math.min(this.y,Vec.y)); } //Return new vector with minimum values between self and vec.
  cart() { return new Vector2D(Math.cos(this.y) * this.x,Math.sin(this.y) * this.x); } //Cartesian form
  polar() { return new Vector2D(this.mag(),this.angle()); } //Polar form
  //Linear Interpolation: returns a point along the origin (self) and destination (Vec) by factor: T. T is of range 0-1. 0 is origin, 1 is destination, 0.5 would be half-way between.
  lerp(Vec,T) { return new Vector2D(((1 - T) * this.x) + (T * Vec.x),((1 - T) * this.y) + (T * Vec.y)); }
  invLerp(T) { return (this.x !== this.y ? (T - this.x) / (this.y - this.x) : 0); }
  toStr() { return "(" + this.x + "," + this.y + ")"; } //Returns vector as a string (useful for debug, etc...)

  //Clone & DO stuff to (Doesn't modify self, returns new Vector2D)
  cAdd(Vec) { return new Vector2D(this.x + Vec.x, this.y + Vec.y); }
  cSub(Vec) { return new Vector2D(this.x - Vec.x, this.y - Vec.y); }
  cMult(Vec) { return new Vector2D(this.x * Vec.x, this.y * Vec.y); }
  cDiv(Vec) { return new Vector2D(this.x / Vec.x, this.y / Vec.y); }
  cAddScalar(Scalar) { return new Vector2D(this.x + Scalar, this.y + Scalar); }
  cSubScalar(Scalar) { return new Vector2D(this.x - Scalar, this.y - Scalar); }
  cMultScalar(Scalar) { return new Vector2D(this.x * Scalar, this.y * Scalar); }
  cDivScalar(Scalar) { return new Vector2D(this.x / Scalar, this.y / Scalar); }
  //Same as Rotate but returns a new vector rather than modifying the original.
  cRotate(Input,Vec,bool) {
    if (!Vec) { Vec = new Vector2D(0,0); }
    let rad = (bool ? this._toRadians(Input) : Input);
    let Cos = Math.cos(rad) , Sin = Math.sin(rad);
    return new Vector2D( (Vec.x + ((this.x - Vec.x) * Cos - (this.y - Vec.y) * Sin)) , (Vec.y + ((this.y - Vec.y) * Cos + (this.x - Vec.x) * Sin)) );
  }
}

/*-------------------------------------------------------------------------------------------------------*/

export class Vector3D {
  constructor(x = 0,y = 0,z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  //helpers
  _toRadians(angle) { return angle * (Math.PI / 180); }
  _toDegrees(angle) { return angle * (180 / Math.PI); }

  //DO stuff to (modify self)
  add(Vec) { this.x += Vec.x; this.y += Vec.y; this.z += Vec.z; return this; }
  sub(Vec) { this.x -= Vec.x; this.y -= Vec.y; this.z -= Vec.z; return this; }
  mult(Vec) { this.x *= Vec.x; this.y *= Vec.y; this.z *= Vec.z; return this; }
  div(Vec) { this.x /= Vec.x; this.y /= Vec.y; this.z /= Vec.z; return this; }
  addScalar(Scalar) { this.x += Scalar; this.y += Scalar; this.z += Scalar; return this; }
  subScalar(Scalar) { this.x -= Scalar; this.y -= Scalar; this.z -= Scalar; return this; }
  multScalar(Scalar) { this.x *= Scalar; this.y *= Scalar; this.z *= Scalar; return this; }
  divScalar(Scalar) { this.x /= Scalar; this.y /= Scalar; this.z /= Scalar; return this; }
  normalize() { this.divScalar(this.mag()); return this; }
  rotate(rotX = 0,rotY = 0,rotZ = 0,bool) { //Bool is if degrees, default radians
    let ox = this.x, oy = this.y, oz = this.z;
    let nx = this.x, ny = this.y, nz = this.z;
    let Cos, Sin;
    if (rotX !== 0) {
      Cos = Math.cos((bool ? this._toRadians(rotX) : rotX));
      Sin = Math.sin((bool ? this._toRadians(rotX) : rotX));
      ny = (oy * Cos) + (oz * -Sin);
      nz = (oy * Sin) + (oz * Cos);
      ox = nx;
      oz = nz;
    }
    if (rotY !== 0) {
      Cos = Math.cos((bool ? this._toRadians(rotY) : rotY));
      Sin = Math.sin((bool ? this._toRadians(rotY) : rotY));
      nx = (ox * Cos) + (oz * Sin);
      nz = (ox * -Sin) + (oz * Cos);
      ox = nx;
      oy = ny;
    }
    if (rotZ !== 0) {
      Cos = Math.cos((bool ? this._toRadians(rotZ) : rotZ));
      Sin = Math.sin((bool ? this._toRadians(rotZ) : rotZ));
      nx = (ox * Cos) + (oy * -Sin);
      ny = (ox * Sin) + (oy * Cos);
    }
    this.x = nx;
    this.y = ny;
    this.z = nz;
    return this;
  }

  //RETURN scalar about
  mag() { return Math.sqrt(Math.pow(this.x,2) + Math.pow(this.y,2) + Math.pow(this.z,2)); } //Return magnitude (length)
  magSq() { return Math.pow(this.x,2) + Math.pow(this.y,2) + Math.pow(this.z,2); } //return Magnitude (length) Squared
  invDot(Vec) { return this.x * Vec.x - this.y * Vec.y - this.z * Vec.z; } //Inverse Dot product of self and vec
  dot(Vec) { return this.x * Vec.x + this.y * Vec.y + this.z * Vec.z; } //Dot product of self and vec

  //RETURN vector about
  clone() { return new Vector3D(this.x,this.y,this.z); } //Return a new vector with cloned values
  cross(Vec) { return new Vector3D(this.y * Vec.z - this.z * Vec.y, this.z * Vec.x - this.x * Vec.z, this.x * Vec.y - this.y * Vec.x); }
  //cross3(Vec1,Vec2) { return new Vector3D(,,); }
  norm() { let mag = this.mag(); return new Vector3D(this.x / mag,this.y / mag,this.z / mag); } //Return a new vector normalized (unit length = 1)
  //Linear Interpolation: returns a point along the origin (self) and destination (Vec) by factor: T. T is of range 0-1. 0 is origin, 1 is destination, 0.5 would be half-way between.
  lerp(Vec,T) { return new Vector3D(((1 - T) * this.x) + (T * Vec.x),((1 - T) * this.y) + (T * Vec.y),((1 - T) * this.z) + (T * Vec.z)); }

  //Clone & DO stuff to (Doesn't modify self, returns new Vector2D)
  cAdd(Vec) { return new Vector3D(this.x + Vec.x, this.y + Vec.y, this.z + Vec.z); }
  cSub(Vec) { return new Vector3D(this.x - Vec.x, this.y - Vec.y, this.z - Vec.z); }
  cMult(Vec) { return new Vector3D(this.x * Vec.x, this.y * Vec.y, this.z * Vec.z); }
  cDiv(Vec) { return new Vector3D(this.x / Vec.x, this.y / Vec.y, this.z / Vec.z); }
  cAddScalar(Scalar) { return new Vector3D(this.x + Scalar, this.y + Scalar, this.z + Scalar); }
  cSubScalar(Scalar) { return new Vector3D(this.x - Scalar, this.y - Scalar, this.z - Scalar); }
  cMultScalar(Scalar) { return new Vector3D(this.x * Scalar, this.y * Scalar, this.z * Scalar); }
  cDivScalar(Scalar) { return new Vector3D(this.x / Scalar, this.y / Scalar, this.z / Scalar); }
  cRotate(rotX = 0,rotY = 0,rotZ = 0,bool) {
    let ox = this.x, oy = this.y, oz = this.z;
    let nx = this.x, ny = this.y, nz = this.z;
    let Cos, Sin;
    if (rotX !== 0) {
      Cos = Math.cos((bool ? this._toRadians(rotX) : rotX));
      Sin = Math.sin((bool ? this._toRadians(rotX) : rotX));
      ny = (oy * Cos) + (oz * -Sin);
      nz = (oy * Sin) + (oz * Cos);
      ox = nx;
      oz = nz;
    }
    if (rotY !== 0) {
      Cos = Math.cos((bool ? this._toRadians(rotY) : rotY));
      Sin = Math.sin((bool ? this._toRadians(rotY) : rotY));
      nx = (ox * Cos) + (oz * Sin);
      nz = (ox * -Sin) + (oz * Cos);
      ox = nx;
      oy = ny;
    }
    if (rotZ !== 0) {
      Cos = Math.cos((bool ? this._toRadians(rotZ) : rotZ));
      Sin = Math.sin((bool ? this._toRadians(rotZ) : rotZ));
      nx = (ox * Cos) + (oy * -Sin);
      ny = (ox * Sin) + (oy * Cos);
    }
    return new Vector3D(nx,ny,nz);
  }
}

