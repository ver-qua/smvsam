const k = 9 * Math.pow(10, 9);
var charge1 = {x: 300, y: 100, q: -1 * Math.pow(10, -6)};
var charge2 = {x: 100, y: 100, q: 1 * Math.pow(10, -6)};

var equipotential_count = 10;

var max_potential = 20;
var min_potential = 0.5;

var equipotentials = new Array();
var density = 10;

var render_equipotentials = false;

var easy_render = false;

var brightness = 20 

var canvas = 0;

var ctx = 0;

var calculateEquipotentials = () =>
{
    equipotentials = equipotentials.splice(0, equipotentials.length);

    for(let i = 0; i <= equipotential_count; i++)
        equipotentials.push(min_potential + (max_potential - min_potential) / equipotential_count * i);
}

var lenght = (vec) =>
{
    return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
}

var mult_vec = (vec, exp) =>
{
    return {x: vec.x * exp, y: vec.y * exp}
}

var normalized = (vec) =>
{
    const l = lenght(vec)
    return {x: vec.x / l, y: vec.y / l}
}

var calculateStrengthVector = (x, y, charge1, charge2) => 
{
    const r1 = Math.sqrt(Math.pow(x - charge1.x, 2) + Math.pow(y - charge1.y, 2));
    const r2 = Math.sqrt(Math.pow(x - charge2.x, 2) + Math.pow(y - charge2.y, 2));

    const strength1 = k * charge1.q / Math.pow(r1, 2);
    const strength2 = k * charge2.q / Math.pow(r2, 2);

    const field1 = mult_vec(normalized({x: x - charge1.x, y: y - charge1.y}), strength1);
    const field2 = mult_vec(normalized({x: x - charge2.x, y: y - charge2.y}), strength2);

    const fieldX = field1.x + field2.x;
    const fieldY = field1.y + field2.y;

    return {x: fieldX, y: fieldY};
}

var drawField = () =>
{
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    arrow_size = density / 2.5;

    for(let i = 0; i < canvas.width;)
    {
        for(let j = 0; j < canvas.height;)
        {
            // Направление и величина напряжённости
            const strength = calculateStrengthVector(i, j, charge1, charge2);

            // Длинна вектора напряжённости
            const len = lenght(strength);

            if(i % density == 0 && j % density == 0)
            {
                ctx.beginPath();

                ctx.lineWidth = arrow_size / 2;

                ctx.strokeStyle = `rgb(0, ${len * brightness + brightness / 2}, 0)`;

                const norm_strength = mult_vec(normalized(strength), arrow_size * 2);

                ctx.moveTo(i - norm_strength.x / 2, j - norm_strength.y / 2);
                
                // Стрелочка
                ctx.lineTo(i + norm_strength.x / 2, j + norm_strength.y / 2);

                const angle = Math.atan2(j + norm_strength.y - j, i + norm_strength.x - i);

                ctx.moveTo(i + norm_strength.x / 2.4, j + norm_strength.y / 2.4);
                ctx.lineTo
                (
                    i + norm_strength.x / 2.4 - arrow_size * Math.cos(angle - Math.PI / 6),
                    j + norm_strength.y / 2.4 - arrow_size * Math.sin(angle - Math.PI / 6)
                );

                ctx.moveTo(i + norm_strength.x / 2.4, j + norm_strength.y / 2.4);
                ctx.lineTo
                (
                    i + norm_strength.x / 2.4 - arrow_size * Math.cos(angle + Math.PI / 6),
                    j + norm_strength.y / 2.4 - arrow_size * Math.sin(angle + Math.PI / 6)
                );

                ctx.stroke();
            }
            
            if(render_equipotentials && !((i * easy_render) % 2))
            {
                ctx.fillStyle = "white";

                for(let o = 0; o < equipotential_count; o++)
                    if(len < equipotentials[o] + equipotentials[o] / 40 && len > equipotentials[o] - equipotentials[o] / 40)
                        ctx.fillRect(i, j, 1, 1);
            }

            if(render_equipotentials)
                j++;
            else
                j += density;
        }

        if(render_equipotentials)
                i++;
            else
                i += density;
    }
    
    //Сами заряды
    const radius = 10;

    ctx.beginPath();
    ctx.arc(charge1.x, charge1.y, radius, 0, 2 * Math.PI, false);

    if(charge1.q > 0)
        ctx.fillStyle = 'red';
    else if(charge1.q < 0)
        ctx.fillStyle = 'blue';
    else
        ctx.fillStyle = 'gray';
    
    ctx.fill();

    ctx.beginPath();

    ctx.arc(charge2.x, charge2.y, radius, 0, 2 * Math.PI, false);

    if(charge2.q > 0)
        ctx.fillStyle = 'red';
    else if(charge2.q < 0)
        ctx.fillStyle = 'blue';
    else
        ctx.fillStyle = 'gray';

    ctx.fill();

    requestAnimationFrame(drawField);
}

var changeCharge = (charge, x, y) =>
{
    charge.x = x;
    charge.y = y;
}

document.addEventListener('DOMContentLoaded', (event) =>
{
    canvas = document.getElementById("simulationCanvas");
    ctx = canvas.getContext("2d");

    var p_charge1 = document.getElementById("p_charge1");
    var p_charge2 = document.getElementById("p_charge2");

    calculateEquipotentials();

    var left_hold = false;
    var mid_hold = false;

    var lust_x = 0;
    var lust_y = 0;

    document.addEventListener('mousedown', (event) =>
    {
        const rect = canvas.getBoundingClientRect();
        lust_x = event.clientX - rect.left;
        lust_y = event.clientY - rect.top;

        if(lust_x < 0 || lust_y < 0 || lust_x > canvas.width || lust_y > canvas.height)
            return 0

        if(event.button === 0)
            left_hold = true;
        else if(event.button === 1)
            mid_hold = true;

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

    document.addEventListener('mousemove', (event) =>
    {
        const rect = canvas.getBoundingClientRect();
        lust_x = event.clientX - rect.left;
        lust_y = event.clientY - rect.top;

        if(lust_x < 0 || lust_y < 0 || lust_x > canvas.width || lust_y > canvas.height)
            return 0

        if(left_hold)
            changeCharge(charge1, lust_x, lust_y);
        if(mid_hold)
            changeCharge(charge2, lust_x, lust_y);
    })

    document.addEventListener('input', (event) =>
    {
        if(event.target.id == "slider_charge1")
        {
            charge1.q = event.target.value * Math.pow(10, -6);
            p_charge1.textContent = `${event.target.value} * 10^-6 В/м`;
        }

        if(event.target.id == "slider_charge2")
        {
            charge2.q = event.target.value * Math.pow(10, -6);
            p_charge2.textContent = `${event.target.value} * 10^-6 В/м`;    
        }

        if(event.target.id == "slider_brightness")
            brightness = event.target.value * 1;

        if(event.target.id == "slider_desity")
            density = event.target.min * 1 + event.target.max * 1 - event.target.value * 1;

        if(event.target.id == "checkbox_equipotentials")
            render_equipotentials = event.target.checked;

        if(event.target.id == "checkbox_easy_render")
            easy_render = event.target.checked;
    })
    
    drawField();
});
  

