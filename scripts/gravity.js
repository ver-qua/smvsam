const G = 1;//6.67430*10**-11;

var simulation_speed = 1;

var canvas = 0;
var ctx = 0;

class vec
{
    constructor(x = 0, y = 0)
    {
        this.x = x;
        this.y = y;
    }

    mul(scalar) 
    {
        return new vec(this.x * scalar, this.y * scalar);
    }

    div(scalar) 
    {
        return new vec(this.x / scalar, this.y / scalar);
    }

    add(adder)
    {
        return new vec(this.x + adder.x, this.y + adder.y);
    }

    sub(subber)
    {
        return new vec(this.x - subber.x, this.y - subber.y);
    }

    length()
    {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    normalized()
    {
        let len = this.length();
        return new vec(this.x / len, this.y / len);
    }
}

class Entity
{
    constructor(name, mass, position, speed, size, color = "#ffffff")
    {
        this.name = name;
        this.mass = mass;
        this.position = position;
        this.speed = speed;
        this.size = size;
        this.color = color;
        this.acceleration = new vec(0, 0);
    }
}

var Scene = new Array();

Scene.push(new Entity("Yo", 10, new vec(100, 100), new vec(0, 0), 10, '#00FF00'));
Scene.push(new Entity("Yo0.5", 50, new vec(360, 400), new vec(0, 0), 10));
Scene.push(new Entity("Yo1", 10, new vec(460, 400), new vec(0, 0), 10));

var solve_physics = () =>
{
    for(i = 0; i < Scene.length; i++)
    {   
        let forse = new vec();
        for(j = 0; j < Scene.length; j++)
        {   
            if(i == j)
                continue;
            
            let r = new vec(Scene[j].position.x - Scene[i].position.x, Scene[j].position.y - Scene[i].position.y);

            if(r.length() > Scene[j].size + Scene[i].size)
                forse = forse.add(r.normalized().mul(G * (Scene[j].mass * Scene[i].mass) / r.length() ** 2));
            else
                Scene[j].speed = Scene[j].speed.mul(-1);
            
        }
        
        Scene[i].acceleration = forse.div(Scene[i].mass);

        Scene[i].speed = Scene[i].speed.add(Scene[i].acceleration.mul(simulation_speed));
        
        Scene[i].position = Scene[i].position.add(Scene[i].speed.mul(simulation_speed));
    }
}

var view_entities = () =>
{
    for(i = 0; i < Scene.length; i++)
    {   
        ctx.beginPath();
        ctx.fillStyle = Scene[i].color;
        ctx.arc(Scene[i].position.x, Scene[i].position.y, Scene[i].size, 0, 2 * Math.PI, false);
        ctx.fill();

        ctx.strokeStyle = "#000000";
        ctx.moveTo(Scene[i].position.x, Scene[i].position.y);
        
        let end = Scene[i].position.add((Scene[i].acceleration).mul(100));
        
        // Стрелочка
        ctx.lineTo(end.x, end.y);
        
        ctx.stroke();
    }
}

var view_creation = () =>
{
    
}

var frame = () =>
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    solve_physics();
    view_entities();
    requestAnimationFrame(frame);
}

document.addEventListener('mousedown', (event) =>
{
    const rect = canvas.getBoundingClientRect();
    lust_x = event.clientX - rect.left;
    lust_y = event.clientY - rect.top;

    if(lust_x < 0 || lust_y < 0 || lust_x > canvas.width || lust_y > canvas.height)
        return 0

    if(event.button === 0)
        left_hold = false;
    else if(event.button === 1)
        mid_hold = false;

    if(left_hold)
        changeCharge(charge1, lust_x, lust_y);
    if(mid_hold)
        changeCharge(charge2, lust_x, lust_y);
});

document.addEventListener('mouseup', (event) =>
{
    const rect = canvas.getBoundingClientRect();
    lust_x = event.clientX - rect.left;
    lust_y = event.clientY - rect.top;
    
    if(lust_x < 0 || lust_y < 0 || lust_x > canvas.width || lust_y > canvas.height)
        return 0

    if(event.button === 0)
        left_hold = false;
    else if(event.button === 1)
        mid_hold = false;

    if(left_hold)
        changeCharge(charge1, lust_x, lust_y);
    if(mid_hold)
        changeCharge(charge2, lust_x, lust_y);
});

document.addEventListener('DOMContentLoaded', (event) =>
{
    canvas = document.getElementById("simulationCanvas");
    ctx = canvas.getContext("2d");
    var ver = new vec(1, 1);
    frame();
    //setInterval(frame, 100)
});