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

var example_select_value = 1;

var substep_count = 4;

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

var Scene = new Array();
var PrevScene = new Array();

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
    result_velocity = velocity.add(forse.div(mass).mul(step));
    return result_velocity;
}

var next_position = (position, velocity, step) =>
{
    result_position = position.add(velocity.mul(step));
    return result_position;
}

var euler = (entity, forse) =>
{
    let velocity_0 = entity.velocity.clone();
    let position_0 = entity.position.clone();
    let mass = entity.mass;

    var result_velocity = next_velocity(velocity_0, forse, mass, simulation_step / 2);
    var result_position = next_position(position_0, result_velocity, simulation_step / 2);

    result_velocity = next_velocity(result_velocity, forse, mass, simulation_step / 2);
    result_position = next_position(result_position, result_velocity, simulation_step / 2);

    entity.velocity = result_velocity.clone();
    entity.position = result_position.clone();
}

var rk4 = (entity, forse) =>
{
    let velocity_0 = entity.velocity.clone();
    let position_0 = entity.position.clone();
    let mass = entity.mass;

    var result_velocity = next_velocity(velocity_0, forse, mass, simulation_step);
    var result_position = next_position(position_0, result_velocity, simulation_step);

    var k1_velocity = velocity_0.clone();
    var k1_position = position_0.clone();

    var k2_velocity = next_velocity(k1_velocity.mul(simulation_step / 2).add(velocity_0), forse, mass, simulation_step / 2)
    var k2_position = next_position(k1_position.mul(simulation_step / 2).add(position_0), k2_velocity, simulation_step / 2);

    var k3_velocity = next_velocity(k2_velocity.mul(simulation_step / 2).add(velocity_0), forse, mass, simulation_step / 2);
    var k3_position = next_position(k2_position.mul(simulation_step / 2).add(position_0), k3_velocity, simulation_step / 2);
    
    var k4_velocity = next_velocity(k3_velocity.add(velocity_0), forse, mass, simulation_step);
    var k4_position = next_position(k3_position.add(position_0), k4_velocity, simulation_step);
    
    result_velocity = k1_velocity.clone();
    result_velocity = result_velocity.add(k2_velocity.mul(2));
    result_velocity = result_velocity.add(k3_velocity.mul(2));
    result_velocity = result_velocity.add(k4_velocity);
    result_velocity = result_velocity.div(6);
    result_velocity = result_velocity.add(velocity_0);
    
    result_position = k1_position.clone();
    result_position = result_position.add(k2_position.mul(2));
    result_position = result_position.add(k3_position.mul(2));
    result_position = result_position.add(k4_position);
    result_position = result_position.div(6);
    result_position = result_position.add(position_0);

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

    if(event.target.id == "size_slider")
    {
        handmade_size = event.target.value * 1;
        l_size_slider.textContent = `Размер: ${event.target.value} ус. ед.`;
    }

    if(event.target.id == "substep_count_slider")
    {
        substep_count = event.target.value * 1;
        l_substep_count_slider.textContent = `Количество межшагов: ${event.target.value}`
    }

    if(event.target.id == "simulation_step_slider")
    {
        simulation_step = event.target.value * 1;
        l_simulation_step_slider.textContent = `Скорость: ${event.target.value} ус. ед.`
    }

});

document.addEventListener('keydown', (event) =>
{
    if(event.key === 'Control')
        ctrl_down = true;

    if(ctrl_down && (event.key === 'z' || event.key === 'я'))
    {
        Scene.pop(Scene.size - 1);
        console.log('ЗА ЧТОООО!! НЕЕееееет.....');
    }

    if(event.key === 'r' || event.key === 'к')
        set_example(example_select_value);
});

document.addEventListener('keyup', (event) =>
{   
    if(event.key == 'Control')
        ctrl_down = false;
});

document.addEventListener('mousedown', (event) =>
{
    const rect = canvas.getBoundingClientRect();
    var lust_x = event.clientX - rect.left;
    var lust_y = event.clientY - rect.top;

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
    const rect = canvas.getBoundingClientRect();
    var lust_x = event.clientX - rect.left;
    var lust_y = event.clientY - rect.top;
    
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
        const rect = canvas.getBoundingClientRect();
        var lust_x = event.clientX - rect.left;
        var lust_y = event.clientY - rect.top;

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
    l_substep_count_slider = document.getElementById("l_substep_count_slider");
    
    frame();
});