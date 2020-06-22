// Vars
const can = document.getElementById("can")
const ctx = can.getContext("2d")
const res = 10
const destroy = document.getElementById("destroy")
const water = document.getElementById("water")
const build = document.getElementById("build")
const lava = document.getElementById("lava")
const container = document.getElementById("container")
const rainfall = document.getElementById("rainfall")

var holdingClick = 0
var mX
var mY

// Funcs
// #region
function log(data) {
	console.log("-")
	console.log(data)
}

function resize() {
	can.width = window.innerWidth
	can.height = window.innerHeight
} resize()

function clear() {
	ctx.clearRect(0, 0, can.width, can.height)
}

function randomRange(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

function make2DArray(rows, cols) {
	let x = [];
	for (let i = 0; i < rows; i++) {
		x[i] = [];
		for (let j = 0; j < cols; j++) {
			x[i][j] = 0;
		}
	}
	return x;
}

function drawGrid(grid, rows, cols) {
	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {

			// ctx.strokeStyle = "#000"
			// ctx.strokeRect(i*res, j*res, res, res)

			// Water cell
			if (grid[i][j] == 1) {

				if (i < 1) ctx.fillStyle = "#09A"
				else if(i < 3) ctx.fillStyle = "#0AB"
				else if(i < 5) ctx.fillStyle = "#0BC"
				else if(i < 7) ctx.fillStyle = "#0CD"
				else if(i < 9) ctx.fillStyle = "#0DE"
				else ctx.fillStyle = "#0EF"
				ctx.fillRect(i*res, j*res, res, res)
			}

			// Glass cell
			else if (grid[i][j] == 2) {
				ctx.strokeStyle = "#000"
				ctx.strokeRect(i*res, j*res, res, res)
			}

			// Lava cell
			else if (grid[i][j] == 3) {
				ctx.fillStyle = "rgb(255, 180, 0)"
				ctx.fillRect(i*res, j*res, res, res)
				cell_bloom(grid, i, j)
			}

		}
	}
}

function set(x, y, state) {
	box[x][y] = state
}

function tog(x, y) {
	box[x][y] = 1 - box[x][y];
}

function togBrick(x, y) {
	if(box[x][y] == 2) box[x][y] = 0
	else if(box[x][y] == 0) box[x][y] = 2
}

function togArea(x, y, width, height) {
	for (let i = 0; i < width; i++) {
		for (let j = 0; j < height; j++) {
			tog(x+i, y+j);
		} 
	}
}

function setContainer(x, y, width, height, state) {
	for (let i = 0; i < width; i++) {
		for (let j = 0; j < height; j++) {
			set(x+i, y, 2)
			set(x, y+j, 2)
			set(x+i, y+width, 2)
		}
	}
}

function getNeighbors(grid, x, y) {
	let sum = 0
	if (x > 0 && x < grid.length-1 && y > 0 && y < grid[0].length-1) {
		
		sum += grid[x][y-1]
		sum += grid[x+1][y]
		sum += grid[x][y+1]
		sum += grid[x-1][y]

	}
	return sum
}

function cell_populate(grid, x, y) {
	if (x > 0 && x < grid.length-1 && y > 0 && y < grid[y].length-1) {
		grid[x][y-1] = 1
		grid[x+1][y] = 1
		grid[x][y+1] = 1
		grid[x-1][y] = 1
		// log("tick")
	} 
}

function cell_fall(grid, x, y) {
	if (x > 0 && x < grid.length && y > 0 && y < grid[y].length) {
		
		// Water - Space collision
		let evaluator = randomRange(1, 2)
		if (grid[x-1][y] == 0) {
			grid[x-1][y] = 1
			grid[x][y] = 0
		}
		
		// Water - Glass collision
		// else if (grid[x-1][y] == 2) {
		//     grid[x][y] = 2
		// }
	

		// Water - Lava collision below
		else if (grid[x-1][y] == 3) {
			grid[x-1][y] = 2
			grid[x][y] = 0
		}
		// Water - Lava collision above
		else if (grid[x+1][y] == 3) {
			grid[x+1][y] = 2
			grid[x][y] = 0
		}

		else if(grid[x][y+1] == 0 && grid[x][y-1] == 0) {

			let evaluator2 = randomRange(1, 2)

			if (evaluator2 == 1)  {
				grid[x][y+1] = 1
				grid[x][y] = 0
			} if (evaluator2 == 0) {
				grid[x][y-1] = 1
				grid[x][y] = 0
			}

		}
		
		else if (grid[x][y+1] == 0) {
			grid[x][y+1] = 1
			grid[x][y] = 0
		}
		else if (grid[x][y-1] == 0) {
			grid[x][y-1] = 1
			grid[x][y] = 0
		}

	} 

}

function cell_drip(grid, x, y) {
	if (x > 0 && x < grid.length && y > 0 && y < grid[y].length) {
		
		// Water - Space collision
		let evaluator = randomRange(1, 2)
		if (grid[x-1][y] == 0) {
			grid[x-1][y] = 3
			grid[x][y] = 0
		}

		// Lava - Water collision below
		else if (grid[x-1][y] == 1) {
			grid[x-1][y] = 2
			grid[x][y] = 0
		}
		// Water - Lava collision above
		else if (grid[x+1][y] == 1) {
			grid[x+1][y] = 2
			grid[x][y] = 0
		}
		
		else if(grid[x][y+1] == 0 && grid[x][y-1] == 0) {

			let evaluator2 = randomRange(1, 2)

			if (evaluator2 == 1)  {
				grid[x][y+1] = 3
				grid[x][y] = 0
			} if (evaluator2 == 0) {
				grid[x][y-1] = 3
				grid[x][y] = 0
			}

		}
		
		else if (grid[x][y+1] == 0) {
			grid[x][y+1] = 3
			grid[x][y] = 0
		}
		else if (grid[x][y-1] == 0) {
			grid[x][y-1] = 3
			grid[x][y] = 0
		}

	} 

}

function cell_poof(grid, x, y, chance) {
	let evaluator = randomRange(1, chance)
	if (evaluator == 50) grid[x][y] = 1
}

function cell_bloom(grid, x, y) {
	if (x > 0 && x < grid.length-1 && y > 0 && y < grid[0].length-1) {

		for(let i = 0; i < 4; i++) {
			if (grid[x+i][y] == 0) {
				ctx.fillStyle = "rgba(255, 180, 0, 0."+ (4-i) +")"
				ctx.fillRect((x+i)*res, y*res, res, res)
			}
			// if (grid[x-i][y] == 0) {
			//     ctx.fillStyle = "rgba(255, 220, 0, 0."+ (6-i) +")"
			//     ctx.fillRect((x-i)*res, y*res, res, res)
			// }
			if (grid[x][y+i] == 0) {
				ctx.fillStyle = "rgba(255, 180, 0, 0."+ (4-i) +")"
				ctx.fillRect(x*res, (y+i)*res, res, res)
			}
			if (grid[x][y-i] == 0) {
				ctx.fillStyle = "rgba(255, 180, 0, 0."+ (4-i) +")"
				ctx.fillRect(x*res, (y-i)*res, res, res)
			}
		}

	}
}

rows = Math.floor(can.width / res)
cols = Math.floor(can.height / res)
let box = make2DArray(rows, cols)
log(`Initiated a grid of\nrows: ${rows}\ncols: ${cols}`)

// tog(20, 10)
// tog(7, 3)

// togArea(100, 45, 10, 10)

// drawGrid(box, rows, cols)
function loop() {

	clear()

	let next = box

	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			
			if(box[i][j] == 1) {
				// log(`Cell: x.${i} y.${j} has ${getNeighbors(box, i, j)} neighbor(s)`)
				// cell_populate(next, i, j)
				cell_fall(next, i, j)
			} else if(box[i][j] == 0) {
				if (rainfall.checked) cell_poof(box, rows-1, j, 20000)
			} else if(box[i][j] == 3) {
				cell_drip(next, i, j)
			}

		}
	}

	box = next

	drawGrid(box, rows, cols)
	// log(destroy)

} 

loop()
setInterval(loop, 1)

document.addEventListener('keyup', (e) => {
	if (e.code === "ArrowUp") {
		for (let i = 0; i < 20; i++) {
			set(50, 30+i, 0)
		}
	}
	if (e.code === "ArrowDown") {
		for (let i = 0; i < 20; i++) {
			set(50, 30+i, 2)
		}
	}
	if (e.code === "ArrowLeft") {
		togArea(120, randomRange(35, 50), 10, 10)
	}
})

document.addEventListener('mousedown', (e) => {
	holdingClick = 1
	if (container.checked) setContainer(Math.floor(mX/res), Math.floor(mY/res), 15, 15, 2)
})

document.addEventListener('mouseup', (e) => {
	holdingClick = 0
})

document.addEventListener('mousemove', (e) => {

	mX = e.clientX
	mY = e.clientY

	if (holdingClick) {
		if (destroy.checked) set(Math.floor(mX/res), Math.floor(mY/res), 0)
		else if (water.checked) set(Math.floor(mX/res), Math.floor(mY/res), 1)
		else if (build.checked) set(Math.floor(mX/res), Math.floor(mY/res), 2)
		else if (lava.checked) set(Math.floor(mX/res), Math.floor(mY/res), 3)
	}
})