const G = 1;

var simulation_step = 0.5;

var canvas = 0;
var ctx = 0;

var left_hold = false;
var ctrl_down = false;

var l_mass_slider = 0;
var l_size_slider = 0;

var handmade_mass = 10;
var handmade_size = 10;
var handmade_color = "#aaff00";

var canvas_rect = 0;
var lust_x = 0;
var lust_y = 0;

var example_select_value = 1;

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

    add_scalar(scalar)
    {
        return new vec(this.x + scalar, this.y + scalar);
    }

    sub_scalar(scalar)
    {
        return new vec(this.x - scalar, this.y - scalar);
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

    clone()
    {
        return new vec(this.x, this.y);
    }
}

var creation_start = new vec();
var creation_end = new vec();

class Entity
{
    constructor(name, mass, position, velocity, size, color = "#ffffff")
    {
        this.name = name;
        this.mass = mass;
        this.position = position;
        this.velocity = velocity;
        this.size = size;
        this.color = color;
    }
}

class DEntity
{
    constructor(velocity, acceleration)
    {
        this.velocity = velocity;
        this.acceleration = acceleration;
    }
}

var Scene = new Array();

var elevate = (scene) =>
{
    let result_d_scene = new Array();

    for(i = 0; i < scene.length; i++)
    {   
        let acceleration = new vec();
        for(j = 0; j < scene.length; j++)
        {   
            if(i == j)
                continue;
            
            let r = new vec(scene[j].position.x - scene[i].position.x, scene[j].position.y - scene[i].position.y);
            let r_len = r.length();

            if(r.length() > scene[j].size + scene[i].size)
                acceleration = acceleration.add(r.div(r_len ** 3).mul(G * (scene[j].mass)));
        }

        result_d_scene.push(new DEntity(scene[i].velocity.clone(), acceleration));
    }

    return result_d_scene;
}

var sum_d_scenes = (scene1, scene2) =>
{
    let result_scene = new Array(scene1.size);

    for(i = 0; i < scene1.length(); i++)
    {
        result_scene[i] = new Entity(scene1.name, scene1.mass, scene1.position.add(scene2.position), scene1.velocity.add(scene2.velocity), scene1.size, scene1.color);
    }

    return result_scene;
}

var mul_d_scene = (d_scene, exponent) =>
{
    let result_d_scene = new Array(d_scene.size);

    for(i = 0; i < d_scene.size(); i++)
    {
        result_d_scene[i] = new DEntity(d_scene[i].velocity.mul(exponent), d_scene[i].acceleration.mul(exponent));
    }

    return result_d_scene;
}

var add_d_scene = (scene, d_scene) =>
{
    let result_scene = new Array(scene.size);

    for(i = 0; i < scene.length(); i++)
    {
        result_scene[i] = new Entity(scene.name, scene.mass, scene.position.add(d_scene.velocity), scene.velocity.add(d_scene.acceleration), scene.size, scene.color);
    }

    return result_scene;
}

var rk4 = () =>
{
    k1 = elevate(Scene);
    k2 = elevate(add_d_scene(Scene, mul_d_scene(k1, simulation_step / 2)));
    k3 = elevate(add_d_scene(Scene, mul_d_scene(k2, simulation_step / 2)));
    k4 = elevate(add_d_scene(Scene, mul_d_scene(k3, simulation_step)));

    Scene
}

var set_example = () =>
{
    Scene = [];
    switch(example_select_value)
    {
        case 1:
            Scene.push(new Entity("Sun", 1000, new vec(250, 250), new vec(), 10, "#ffff00"));

            Scene.push(new Entity("Alpha", 0.1, new vec(150, 250), new vec(0, -3.2), 5, "#c66d29"));
            Scene.push(new Entity("Beta", 0.1, new vec(100, 250), new vec(0, -2.6), 5, "#29c675"));
            Scene.push(new Entity("Gamma", 0.1, new vec(50, 250), new vec(0, -2.2), 5, "#4459e2"));
            break;
        case 2:
            Scene.push(new Entity("LSun", 1000, new vec(230, 250), new vec(0, 3.5), 7, "#ffff00"));
            Scene.push(new Entity("RSun", 1000, new vec(270, 250), new vec(0, -3.5), 7, "#ffff00"));

            Scene.push(new Entity("Alpha", 0.1, new vec(150, 250), new vec(0, -4.2), 5, "#c66d29"));
            Scene.push(new Entity("Beta", 0.1, new vec(100, 250), new vec(0, -3.6), 5, "#29c675"));
            Scene.push(new Entity("Gamma", 0.1, new vec(50, 250), new vec(0, -3), 5, "#4459e2"));
            break;
        case 3:
            Scene.push(new Entity("Alpha", 100, new vec(300, 250), new vec(-1, 0), 8, "#c66d29"));
            Scene.push(new Entity("Beta", 100, new vec(200, 250), new vec(0, -1), 8, "#29c675"));
            Scene.push(new Entity("Gamma", 100, new vec(250, 175), new vec(1, 0), 8, "#4459e2"));
            break;
    }
}

var next_velocity = (velocity, forse, mass, step) =>
{
    let result_velocity = velocity.add(forse.div(mass).mul(step));
    return result_velocity;
}

var next_position = (position, velocity, step) =>
{
    let result_position = position.add(velocity.mul(step));
    return result_position;
}

var euler = (entity, forse) =>
{
    let velocity_0 = entity.velocity.clone();
    let position_0 = entity.position.clone();
    let mass = entity.mass;

    let result_velocity = next_velocity(velocity_0, forse, mass, simulation_step / 2);
    let result_position = next_position(position_0, result_velocity, simulation_step / 2);

    result_velocity = next_velocity(result_velocity, forse, mass, simulation_step / 2);
    result_position = next_position(result_position, result_velocity, simulation_step / 2);

    entity.velocity = result_velocity.clone();
    entity.position = result_position.clone();
}

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
        }

        euler(Scene[i], forse);
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
    }
}

var view_creation = () =>
{
    if(left_hold)
    {
        arrow_size = 10;

        ctx.beginPath();

        ctx.moveTo(creation_start.x, creation_start.y);
        ctx.lineTo(creation_end.x, creation_end.y);

        ctx.moveTo(creation_start.x / 2, creation_start.y / 2);
                
        // Стрелочка

        const angle = Math.atan2(creation_end.y - creation_start.y, creation_end.x - creation_start.x);

        ctx.moveTo(creation_end.x, creation_end.y);
        ctx.lineTo
        (
            creation_end.x - arrow_size * Math.cos(angle - Math.PI / 6),
            creation_end.y - arrow_size * Math.sin(angle - Math.PI / 6)
        );

        ctx.moveTo(creation_end.x, creation_end.y);
        ctx.lineTo
        (
            creation_end.x - arrow_size * Math.cos(angle + Math.PI / 6),
            creation_end.y - arrow_size * Math.sin(angle + Math.PI / 6)
        );

        ctx.lineWidth = 3;
        ctx.strokeStyle = "#11aaFF";
        ctx.stroke();
    }
}

var handmake_entity = () =>
{
    Scene.push(new Entity("Handmade", handmade_mass, creation_start, creation_end.sub(creation_start).div(20), handmade_size, handmade_color));
}

var frame = () =>
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    solve_physics();
    view_entities();
    view_creation();
    requestAnimationFrame(frame);
}

document.addEventListener('change', (event) =>
{
    if(event.target.id == "example_select")
    {
        example_select_value = event.target.value * 1;
        set_example();
    }
})

document.addEventListener('input', (event) =>
{
    if(event.target.id == "mass_slider")
    {
        handmade_mass = event.target.value * 1;
        l_mass_slider.textContent = `Масса: ${event.target.value} ус. ед.`;
    }
    else if(event.target.id == "size_slider")
    {
        handmade_size = event.target.value * 1;
        l_size_slider.textContent = `Размер: ${event.target.value} ус. ед.`;
    }
    else if(event.target.id == "simulation_step_slider")
    {
        simulation_step = event.target.value * 1;
        l_simulation_step_slider.textContent = `Скорость: ${event.target.value} ус. ед.`
    }

});

document.addEventListener('keydown', (event) =>
{
    if(event.key === 'Control')
        ctrl_down = true;
    else if(ctrl_down && (event.key === 'z' || event.key === 'я'))
    {
        Scene.pop(Scene.size - 1);
        console.log('ЗА ЧТОООО!! НЕЕееееет.....');
    }
    else if(event.key === 'r' || event.key === 'к')
        set_example(example_select_value);
});

document.addEventListener('keyup', (event) =>
{   
    if(event.key == 'Control')
        ctrl_down = false;
});

document.addEventListener('mousedown', (event) =>
{
    var lust_x = event.clientX - canvas_rect.left;
    var lust_y = event.clientY - canvas_rect.top;

    if(lust_x < 0 || lust_y < 0 || lust_x > canvas.width || lust_y > canvas.height)
        return 0;
        
    if(event.button === 0)
    {
        left_hold = true;
        creation_start = new vec(lust_x, lust_y);
        creation_end = new vec(lust_x, lust_y);
    }
});

document.addEventListener('mouseup', (event) =>
{
    var lust_x = event.clientX - canvas_rect.left;
    var lust_y = event.clientY - canvas_rect.top;
    
    if(lust_x < 0 || lust_y < 0 || lust_x > canvas.width || lust_y > canvas.height)
        return 0

    if(event.button === 0)
    {
        left_hold = false;
        creation_end = new vec(lust_x, lust_y);
        handmake_entity();
        creation_start = new vec();
        creation_end = new vec();
    }
});

document.addEventListener("mousemove", (event) =>
{
    if(left_hold)
    {
        lust_x = event.clientX - canvas_rect.left;
        lust_y = event.clientY - canvas_rect.top;
    
        if(lust_x < 0 || lust_y < 0 || lust_x > canvas.width || lust_y > canvas.height)
            return 0

        creation_end = new vec(lust_x, lust_y);
    }
})

document.addEventListener('DOMContentLoaded', (event) =>
{
    canvas = document.getElementById("simulationCanvas");
    ctx = canvas.getContext("2d");

    set_example();

    l_mass_slider = document.getElementById("l_mass_slider");
    l_size_slider = document.getElementById("l_size_slider");
    l_simulation_step_slider = document.getElementById("l_simulation_step_slider");
    canvas_rect = canvas.getBoundingClientRect();
    
    frame();
});