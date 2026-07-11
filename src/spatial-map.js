/*---------------------------------------------------------------------------------------------------------

  Spatial Map 2D (Still a Work in Progress)
  
  Author:    Sean Everett, but mostly known as: Talon

  IRC:       Talon (SwiftIRC: irc.swiftirc.net / Libera.Chat: irc.libera.chat)
  Discord:   talon0039
  GitHub:    https://www.github.com/Talon-1
  
  Credits go to SimonDev for his tutorial on SpatialHashGrid 

  https://github.com/simondevyoutube/Tutorial_SpatialHashGrid

  ---------------------------------------------------------------------------------------------------------*/

import * as vmath from "./vmath.js";

export class SpatialMap2D {
  #Data;
  constructor(minx,miny,maxx,maxy,divisor) {
    this.#Data = {
      Bounds: [minx,miny,maxx,maxy],
      Dimensions: [Math.ceil((maxx-minx)/divisor),Math.ceil((maxy-miny)/divisor)],
      CellSize: [divisor,divisor],
      Map: [],
    }
  }
  spatialMapArray() { return this.#Data.Map; }
  spatialInitialize() { this.#Data.Map = []; } //Basically clear the map...
  spatialIndex(x,y) { return [ Math.min(Math.floor(Math.min(Math.max((x - this.#Data.Bounds[0]) / (this.#Data.Bounds[2] - this.#Data.Bounds[0]),0),1) * this.#Data.Dimensions[0]),this.#Data.Dimensions[0] -1) , Math.min(Math.floor(Math.min(Math.max((y - this.#Data.Bounds[1]) / (this.#Data.Bounds[3] - this.#Data.Bounds[1]),0),1) * this.#Data.Dimensions[1]),this.#Data.Dimensions[1] -1) ]; }
  spatialInsert(Entity,Bounds) {
    let GMin = this.spatialIndex(Bounds[0],Bounds[1]);
    let GMax = this.spatialIndex(Bounds[2],Bounds[3]);
    for (let x = GMin[0]; x <= GMax[0]; x++) {
      for (let y = GMin[1]; y <= GMax[1]; y++) {
        let OneD = y * this.#Data.Dimensions[0] + x;
        if (!Array.isArray(this.#Data.Map[OneD])) { this.#Data.Map[OneD] = []; }
        if (this.#Data.Map[OneD].indexOf(Entity) === -1) {
          this.#Data.Map[OneD].push(Entity);
        }
      }
    }
  }
  spatialDelete(Entity,Bounds) {
    let GMin = this.spatialIndex(Bounds[0],Bounds[1]);
    let GMax = this.spatialIndex(Bounds[2],Bounds[3]);
    for (let x = GMin[0]; x <= GMax[0]; x++) {
      for (let y = GMin[1]; y <= GMax[1]; y++) {
        let OneD = y * this.#Data.Dimensions[0] + x;
        if (Array.isArray(this.#Data.Map[OneD]) && this.#Data.Map[OneD].indexOf(Entity) > -1) { this.#Data.Map[OneD].splice(this.#Data.Map[OneD].indexOf(Entity),1); }
      }
    }
  }
  spatialNearBy(Entity,Bounds) {
    let GMin = this.spatialIndex(Bounds[0],Bounds[1]);
    let GMax = this.spatialIndex(Bounds[2],Bounds[3]);
    let Ret = new Set();
    for (let x = GMin[0]; x <= GMax[0]; x++) {
      for (let y = GMin[1]; y <= GMax[1]; y++) {
        let OneD = y * this.#Data.Dimensions[0] + x;
        if (Array.isArray(this.#Data.Map[OneD])) { this.#Data.Map[OneD].forEach((Object) => { if (Object !== Entity) { Ret.add(Object); } }); }
      }
    }
    return Ret;
  }
  lineSegmentToGridIntersectionPoints(lineseg,isray = false) {
    let Dx = lineseg[2] - lineseg[0] , Dy = lineseg[3] - lineseg[1];
    let magsq = Math.pow(Dx,2) + Math.pow(Dy,2);
    let mag = Math.sqrt(magsq);

    //Start and end of lineseg in grid-space
    let LSx1 = lineseg[0] / (isray ? 1 : this.#Data.CellSize[0]) , LSy1 = lineseg[1] / (isray ? 1 : this.#Data.CellSize[1]);
    let LSx2 = lineseg[2] / (isray ? 1 : this.#Data.CellSize[0]) , LSy2 = lineseg[3] / (isray ? 1 : this.#Data.CellSize[1]);

    let rayDirX = Dx / mag, rayDirY = Dy / mag, mapX = parseInt(LSx1), mapY = parseInt(LSy1) , stepX = 0, stepY = 0, sideDistX = 0, sideDistY = 0;
    let deltaDistX = Math.abs(1 / rayDirX) , deltaDistY = Math.abs(1 / rayDirY);
    if (rayDirX < 0) { stepX = -1; sideDistX = (LSx1 - mapX) * deltaDistX; }
    else { stepX = 1; sideDistX = (mapX + 1 - LSx1) * deltaDistX; }
    if (rayDirY < 0) { stepY = -1; sideDistY = (LSy1 - mapY) * deltaDistY; }
    else { stepY = 1; sideDistY = (mapY + 1 - LSy1) * deltaDistY; }
    let hit = 0, side = 0, Ret = [];

    if (isray) { Ret.push([lineseg[0] * this.#Data.CellSize[0],lineseg[1] * this.#Data.CellSize[0]]); }

    while (!hit) {
      if (mapX > this.#Data.Dimensions[0] || mapY > this.#Data.Dimensions[1]) { hit = 1; break; }
      if (mapX < 0 || mapY < 0) { hit = 1; break; }

      let RayLenX = 0 , RayLenY = 0;
      if (sideDistX < sideDistY) { RayLenX = rayDirX * sideDistX; RayLenY = rayDirY * sideDistX; }
      else { RayLenX = rayDirX * sideDistY; RayLenY = rayDirY * sideDistY; }
      let PointGX = LSx1 + RayLenX, PointGY = LSy1 + RayLenY;
      let PointX = PointGX * this.#Data.CellSize[0] , PointY = PointGY * this.#Data.CellSize[1];

      //Since we're following the lineseg like a ray, we need to abort when we traverse farther than the end of the lineseg.
      if (isray === false && Math.pow(lineseg[0] - PointX,2) + Math.pow(lineseg[1] - PointY,2) > magsq) { hit = 1; break; }
      else { Ret.push([PointX,PointY]); }

      if (sideDistX < sideDistY) { sideDistX += deltaDistX; mapX += stepX; side = 0; }
      else { sideDistY += deltaDistY; mapY += stepY; side = 1; }
    }
    return Ret;
  }
  spatialNearRay(Entity,ray) {
    //ray [x,y,x+dir,y+dir] NOTE: x,y is in grid-space NOT world space!
    let rayDirX = ray[2]-ray[0], rayDirY = ray[3]-ray[1], mapX = parseInt(ray[0]), mapY = parseInt(ray[1]) , stepX = 0, stepY = 0, sideDistX = 0, sideDistY = 0;
    let deltaDistX = Math.abs(1 / rayDirX) , deltaDistY = Math.abs(1 / rayDirY);
    if (rayDirX < 0) { stepX = -1; sideDistX = (ray[0] - mapX) * deltaDistX; }
    else { stepX = 1; sideDistX = (mapX + 1 - ray[0]) * deltaDistX; }
    if (rayDirY < 0) { stepY = -1; sideDistY = (ray[1] - mapY) * deltaDistY; }
    else { stepY = 1; sideDistY = (mapY + 1 - ray[1]) * deltaDistY; }
    let hit = 0, side = 0, Ret = new Set();
    //Include current cell we're in...
    if (Array.isArray(this.#Data.Map[mapY * this.#Data.Dimensions[0] + mapX])) { this.#Data.Map[mapY * this.#Data.Dimensions[0] + mapX].forEach((Object) => { if (Object !== Entity) { Ret.add(Object); } }); }
    while (!hit) {
      if (mapX > this.#Data.Dimensions[0] || mapY > this.#Data.Dimensions[1]) { hit = 1; break; }
      if (mapX < 0 || mapY < 0) { hit = 1; break; }
      if (sideDistX < sideDistY) { sideDistX += deltaDistX; mapX += stepX; side = 0; }
      else { sideDistY += deltaDistY; mapY += stepY; side = 1; }
      //Since we're stepping along cell borders, a border shares 2 cells. If it's an X-Axis crossing we need the above/below cells, a Y-Axis crossing we need the left/right cells
      let OneD = mapY * this.#Data.Dimensions[0] + mapX;
      let OneD2 = (mapY + (side == 1 ? stepY : 0)) * this.#Data.Dimensions[0] + (mapX + (side == 0 ? stepX : 0));
      //Shove entity into our set if it's not the entity itself we're lookin at!
      if (Array.isArray(this.#Data.Map[OneD])) { this.#Data.Map[OneD].forEach((Object) => { if (Object !== Entity) { Ret.add(Object); } }); }
      if (Array.isArray(this.#Data.Map[OneD2])) { this.#Data.Map[OneD2].forEach((Object) => { if (Object !== Entity) { Ret.add(Object); } }); }
    }
    return Ret;
  }
  spatialNearThickRay(Entity,ray,radius) {
    let points = this.lineSegmentToGridIntersectionPoints(ray,true) , Ret = new Set();
    points.forEach((point) => {
      //Gather all Grid Intersection points and grab what's "spatialNearBy" by defined rect
      this.spatialNearBy(Entity,[point[0] - radius,point[1] - radius,point[0] + radius,point[1] + radius]).forEach((entity) => { Ret.add(entity); });
    });
    return Ret;
  }
}

/*---------------------------------------------------------------------------------------------------------
  Generic Entity Class
---------------------------------------------------------------------------------------------------------*/

//Note: It is not necessary to use this class with the SpatialMap. SpatialMap uses bounds, not positions, so as long as you use it proper, you can make your own entity class.
export class SpatialEntity2D {
  #Data;
  constructor(Type,x = 0,y = 0,vx = 0,vy = 0,r = 0.5,m = 5) {
    this.#Data = {
      Type: Type,
      Position: new vmath.Vector2D(x,y), //NOTE: This is the CENTER of the object.
      Direction: new vmath.Vector2D(1,0), //Default Direction: --->
      Velocity: new vmath.Vector2D(vx,vy), //Object Motion Velocity in X and Y
      AngularVelocity: 0, //Object Rotation Velocity in X and Y
      Radius: r,
      Mass: m,
    }
  }
  //Public Static Functions:
  static getData(sub) { if (sub instanceof SpatialEntity2D) { return sub.#Data; } }

  //Public Functions:
  type() { return this.#Data.Type; }
  position() { return this.#Data.Position; }
  direction() { return this.#Data.Direction; }
  velocity() { return this.#Data.Velocity; }
  angularVelocity() { return this.#Data.AngularVelocity; }
  radius() { return this.#Data.Radius; }
  mass() { return this.#Data.Mass; }
  setRadius(r) { this.#Data.Radius = r; }
  update(DeltaSecs,AccumulatedForces) {
    if (!AccumulatedForces) { AccumulatedForces = new vmath.Vector2D(0,0); }
    this.#Data.Velocity.x += AccumulatedForces.x * DeltaSecs;
    this.#Data.Velocity.y += AccumulatedForces.y * DeltaSecs;
    this.#Data.Position.x += this.#Data.Velocity.x * DeltaSecs;
    this.#Data.Position.y += this.#Data.Velocity.y * DeltaSecs;
  }
  bounds() { return [this.#Data.Position.x - this.#Data.Radius,this.#Data.Position.y - this.#Data.Radius,this.#Data.Position.x + this.#Data.Radius,this.#Data.Position.y + this.#Data.Radius]; }
}

export class Capsule extends SpatialEntity2D {
  constructor(Type,x1 = 0,y1 = 0,x2 = 0,y2 = 0,vx = 0,vy = 0,r = 0.5,m = 5) {
    super(Type,x1,y1,vx,vy,r,m);
    let Data = SpatialEntity2D.getData(this);
    Data['Position2'] = new vmath.Vector2D(x2,y2);    
  }
  data() { return SpatialEntity2D.getData(this); }
  position2() { return SpatialEntity2D.getData(this).Position2; }
  update(DeltaSecs,AccumulatedForces) {
    super.update(DeltaSecs,AccumulatedForces);
    let Data = SpatialEntity2D.getData(this);
    if (!AccumulatedForces) { AccumulatedForces = new vmath.Vector2D(0,0); }
    Data.Position2.x += Data.Velocity.x * DeltaSecs;
    Data.Position2.y += Data.Velocity.y * DeltaSecs;
  }
}