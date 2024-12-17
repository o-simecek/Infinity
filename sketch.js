let agents = []
let dead = []
let SEPARATION_DISTANCE = 900
let AGENT_SIZE = 8
let SEPARATION_DAMPENING = 50 //lower number -> more separation
let sep_damp_offset = 0
let SUN_SIZE = 40
let RING_MIN = 200
let RING_MAX = 600
let LIFESPAN_AVG = 80000
let LIFESPAN_STD = 20000

function setup() {
  createCanvas(1920, 1080);
  colorMode(HSB)
  
  background(250, 15, 15);
  
  for (let i = 0; i < 700; i++) {
    //agents.push(new Agent(random(TWO_PI), random(RING_MIN, RING_MAX), 
    //                      color(random(15, 70), random(10, 50), 95)))
    //agents.push(new Agent(random(TWO_PI), random(RING_MIN, RING_MAX), 
    //                      color(random(110, 210), random(10, 90), 95)))
    //let random_hue = random([random(145, 185), random(310, 350)])
    let random_hue = random([random(200, 240), random(320, 360)])
    //let random_hue = random([random(0, 40), random(180, 220)])
    agents.push(new Agent(random(TWO_PI), random(RING_MIN, RING_MAX), 
                          color(random_hue, random(30, 100), 95), randomGaussian(LIFESPAN_AVG, LIFESPAN_STD)))
    dead.push(new Agent(random(TWO_PI), random(RING_MIN, RING_MAX), 
                          color(random_hue, random(30, 100), 95), randomGaussian(LIFESPAN_AVG, LIFESPAN_STD)))
  }
  
  frameRate(30)
}

function draw() {
  background(250, 15, 15, 0.05);
  
  translate(width/2, height/2)

  for (let i = agents.length - 1; i >= 0; i-=1) {
    agents[i].life -= deltaTime
    if (agents[i].life < 0) {
      agents[i].life = randomGaussian(LIFESPAN_AVG, LIFESPAN_STD)
      let removed = agents.splice(i, 1)
      dead.push(removed[0])
    }
  }
  
  for (let i = dead.length - 1; i >= 0; i-=1) {
    dead[i].life -= deltaTime
    if (dead[i].life < 0) {
      dead[i].lifespan = randomGaussian(LIFESPAN_AVG, LIFESPAN_STD)
      dead[i].life = dead[i].lifespan
      let removed = dead.splice(i, 1)
      agents.push(removed[0])
    }
  }
  
  for (let agent of agents) {
    agent.spin()
    agent.draw()
  }

  
  filter(ERODE, 100)
  //for (let agent of agents) {
    //agent.spin()
    //agent.draw()
  //}
  
  //filter(BLUR, 1)
  translate(width/2, height/2)
  noStroke()
  
  fill(56, 10, 95)
  circle(0, 0, SUN_SIZE)
  
  //collisions
  
  for (let i = 0; i < agents.length; i+=1) {
    let agent = agents[i]
    
    for (let j = 0; j < agents.length; j+=1) {
      if (i == j) continue;

      let other = agents[j]
      let distance = distSq(agent.x, agent.y, other.x, other.y)
      
      if (distance < SEPARATION_DISTANCE) {
        agent.rVel += (agent.r - other.r) / ((SEPARATION_DAMPENING-sin(millis()/10000)*30)*SEPARATION_DISTANCE/distance)
        //agent.rVel += (agent.r - other.r) / (SEPARATION_DAMPENING*SEPARATION_DISTANCE/distance)
        agent.aVel += (agent.a - other.a) / (1000*SEPARATION_DISTANCE)
        
      }
    }
    agent.calculateXY()
  }
  
  /*
  strokeWeight(1)
  stroke(0, 0, 80)
  noFill()
  circle(height/2, width/2, 400)*/
  
  
  console.log(frameRate())
}

class Agent {
  constructor(a, r, c, lifespan) {
    this.a = a
    this.r = r
    this.rBase = r
    this.life = lifespan
    this.lifespan = lifespan
    
    this.rVel = 0
    this.speed = random(0.01, 0.03)
    this.aVel = this.speed
    this.x = this.r * cos(this.a)
    this.y = this.r * sin(this.a)
    this.xOld = this.x
    this.yOld = this.y
    this.c = c
  }
  
  spin() {   
    this.a += this.aVel
    this.r += this.rVel
    
    this.aVel = lerp(this.aVel, this.speed, 0.2)
    this.rVel = lerp(this.rVel, (this.rBase - this.r) * abs((this.rBase - this.r)/200), 0.02)
    this.calculateXY()
  }
  
  calculateXY() {
    this.xOld = this.x
    this.yOld = this.y
    this.x = this.r * cos(this.a)
    this.y = this.r * sin(this.a)
  }
  
  draw() {
    let age = this.lifespan - this.life
    this.c = color(hue(this.c), 120 - age/1000, brightness(this.c))
    fill(this.c)
    stroke(this.c)
    strokeWeight(AGENT_SIZE)
    if (age < 18000) {
      strokeWeight(AGENT_SIZE*(age)/18000)
    }
    
    line(this.xOld, this.yOld - this.yOld * 0.5, this.x, this.y - this.y * 0.5)
    
    /*
    strokeWeight(1)
    noFill()
    circle(this.x, this.y, SEPARATION_DISTANCE)*/
  }
}

function distSq(x1, y1, x2, y2) {
  return sq(x1 - x2) + sq(y1 - y2)
}