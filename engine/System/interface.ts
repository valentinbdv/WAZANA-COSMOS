
export interface point2D {
	x:number,
	y:number
}

export interface point3D {
	x:number,
	z:number,
	y:number
}

export interface option3D {
	x?:number,
	z?:number,
	y?:number
}

export interface string3D {
	x:string,
	z:string,
	y:string
}

export interface position {
	x:number,
	y:number,
}

export interface screenposition {
	top?:number,
	right?:number,
	bottom?:number,
	left?:number,
}

export interface size {
  width:number,
	height:number,
}

// export interface scaleOption {
//   x:boolean,
//   y:boolean,
//   z:boolean,
//   keepratio:boolean,
// }

export interface screensize {
  width:string,
	height:string,
}
