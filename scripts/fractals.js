class plex
{
    constructor(x = 0, y = x)
    {
        this.x = x;
        this.y = y;
    }

    assign(x = 0, y = x)
    {
        this.x = x;
        this.y = y;
    }

    add(other)
    {
        return new plex(this.x + other.x, this.y + other.y);
    }

    sub(other)
    {
        return new plex(this.x - other.x, this.y - other.y);
    }

    mul(other)
    {
        return new plex(this.x * other.x - this.y * other.y, this.y * other.x + this.x * other.y);
    }

    div(other)
    {
        return new plex((this.x * other.y + this.y * other.y) / (other.x * other.x + other.y * other.y), (this.y * other.x - this.x * other.y) / (other.x * other.x + other.y * other.y));
    }

    inv()
    {
        return new plex(this.x / (this.x * this.x + this.y * this.y), -1 * this.y / (this.x * this.x + this.y * this.y));
    }

    len()
    {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    len_sqrd()
    {
        return this.x * this.x + this.y * this.y;
    }

    abs()
    {
        return new plex(Math.abs(this.x), Math.abs(this.y));
    }
}

var canvas = 0;
var ctx = 0;

var l_maximum_iterations = 0;
var l_transtation_exponent_slider = 0;
var l_step_size_slider = 0;
var p_info = 0;

var maximum_iterations = 20;
var center = new plex(-0.7, 0);
var transtation_exponent = 50;
var scale = 0.007;
var step_size = 2;

var C = new plex();
var Z = new plex();
var took = 0;

var mandelbrot_set = (i, j) =>
{
    C.assign(center.x + (i - (canvas.width / 2)) * scale, center.y + ((j - canvas.height / 2)) * scale);
    Z.assign();
    took = 0;

    while(Z.len_sqrd() <= 4 && took < maximum_iterations)
    {
        took++;
        Z = Z.mul(Z).add(C);
    }
}

var burning_ship = (i, j) =>
{
    C.assign(center.x + (i - (canvas.width / 2)) * scale, center.y + ((j - canvas.height / 2)) * scale);
    Z.assign();
    took = 0;

    while(Z.len_sqrd() <= 4 && took < maximum_iterations)
    {
        took++;
        Z = Z.abs().mul(Z.abs()).add(C);
    }
}

var blot = (i, j) =>
{
    C.assign(center.x + (i - (canvas.width / 2)) * scale, center.y + ((j - canvas.height / 2)) * scale);
    Z.assign();
    took = 0;

    while(Z.len_sqrd() <= 4 && took < maximum_iterations)
    {
        took++;
        // Мамма Mia!
        Z = Z.mul(Z.add(C.inv())).add(C.add(C.mul(C.abs()))).mul(Z.add(C.inv())).add(C.add(C.mul(C.abs())));
    }
}

var current_fractal = mandelbrot_set;

var draw_fractal = () =>
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for(i = 0; i < canvas.width; i += step_size) 
    {
        for(j = 0; j < canvas.height; j += step_size)
        {
            current_fractal(i, j);
        
            ctx.fillStyle = `rgb(${(took / maximum_iterations) * 205}, ${(took / maximum_iterations) * 255}, ${(took / maximum_iterations) * 225})`;
            ctx.fillRect(i, j, step_size, step_size);
        }
    }
}

var change_info = () =>
{
    p_info.textContent = `X: ${center.x} | Y: ${center.y} | Масштаб: ${scale} ед. на пиксель`;
}

document.addEventListener("DOMContentLoaded", (event) =>
{
    canvas = document.getElementById("simulationCanvas");
    ctx = canvas.getContext("2d");
    ctx.font = "10px sans";

    l_maximum_iterations = document.getElementById("l_maximum_iterations_slider");
    l_transtation_exponent_slider = document.getElementById("l_transtation_exponent_slider");
    l_step_size_slider = document.getElementById("l_step_size_slider");
    p_info = document.getElementById("p_info");

    draw_fractal();
});

var reset_values = () =>
{
    if(current_fractal == mandelbrot_set)
    {
        scale = 0.007;
        center.assign(-0.7, 0);
        maximum_iterations = 20;
    }
    else if(current_fractal == burning_ship)
    {
        scale = 0.007;
        center.assign(-0.3499999999999999, -0.35000000000000003);
        maximum_iterations = 20;
    }
    else if(current_fractal == blot)
    {
        scale = 0.0033480782999999997;
        center.assign(-0.7, 0);
        maximum_iterations = 20;
    }

    l_maximum_iterations.textContent = `Количество итераций: ${maximum_iterations}`;
}

document.addEventListener("keypress", (event) => 
{
    if(event.key === "w" || event.key === "ц")
        center = center.add(new plex(0, -scale * transtation_exponent));    
    else if(event.key === "s" || event.key === "ы")
        center = center.add(new plex(0, scale * transtation_exponent));
    else if(event.key === "a" || event.key === "ф")
        center = center.add(new plex(-scale * transtation_exponent, 0));
    else if(event.key === "d" || event.key === "в")
        center = center.add(new plex(scale * transtation_exponent, 0));
    else if(event.key === "q" || event.key === "й")
        scale += scale / 10;
    else if(event.key === "e" || event.key === "у")
        scale -= scale / 10;
    else if(event.key === "r" || event.key === "к")
        reset_values();

    console.log(event.key);
    
    draw_fractal();
    change_info();
});

document.addEventListener("change", (event) =>
{
    if(event.target.id === "fractal_select")
    {
        switch(event.target.value * 1)
        {
            case 1:
                current_fractal = mandelbrot_set;
                break;
            case 2:
                current_fractal = burning_ship;
                break;
            case 3:
                current_fractal = blot;
                break;
        }
        reset_values();
    }

    draw_fractal();
    change_info();
});

document.addEventListener("input", (event) =>
{
    if(event.target.id === "maximum_iterations_slider")
    {
        maximum_iterations = event.target.value * 1;
        l_maximum_iterations.textContent = `Количество итераций: ${maximum_iterations}`;
    }
    else if(event.target.id === "transtation_exponent_slider")
    {
        transtation_exponent = event.target.value * 1;
        l_transtation_exponent_slider.textContent = `Величина перемещения: ${transtation_exponent} пикселей`;
    }
    else if(event.target.id === "step_size_slider")
    {
        step_size = event.target.value * 1;
        l_step_size_slider.textContent = `Размер пикселя: ${step_size}`;
    }

    draw_fractal();
    change_info();
});