class plex
{
    constructor(x = 0, y = x)
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

    len()
    {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    abs()
    {
        return new plex(Math.abs(this.x), Math.abs(this.y));
    }
}

var canvas = 0;
var ctx = 0;

var l_maximum_iterations = 0;
var l_scale_slider = 0;
var l_transtation_exponent_slider = 0;

var maximum_iterations = 5;
var center = new plex(-0.7, 0);
var transtation_exponent = 50;
var scale = 0.007;

var draw_fractal = () =>
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(i = 0; i < canvas.width; i++) 
    {
        for(j = 0; j < canvas.height; j++)
        {
            var C = new plex(center.x + (i - Math.floor((canvas.width / 2))) * scale, center.y + ((j - Math.floor(canvas.height / 2))) * scale);
            var Z = new plex();
            var took = 0;

            while(Z.len() <= 2 && took < maximum_iterations)
            {
                took++;
                Z = Z.mul(Z).add(C);
            }
            
        
            ctx.fillStyle = `rgb(${(1 - took / maximum_iterations) * 100}, ${(1 - took / maximum_iterations) * 255}, ${(1 - took / maximum_iterations) * 200})`;
            ctx.fillRect(i, j, 1, 1);
        }
    }
}

document.addEventListener("DOMContentLoaded", (event) =>
{
    canvas = document.getElementById("simulationCanvas");
    ctx = canvas.getContext("2d");

    l_maximum_iterations = document.getElementById("l_maximum_iterations_slider");
    l_scale_slider = document.getElementById("l_scale_slider");
    l_transtation_exponent_slider = document.getElementById("l_transtation_exponent_slider");

    draw_fractal();
});

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
    
    draw_fractal();
});

document.addEventListener("input", (event) =>
{
    if(event.target.id === "maximum_iterations_slider")
    {
        maximum_iterations = event.target.value * 1;
        l_maximum_iterations.textContent = `Количество итераций: ${maximum_iterations}`;
    }
    else if(event.target.id === "scale_slider")
    {   
        scale = event.target.value * 1;
        l_scale_slider.textContent = `Масштаб: ${scale} ед. на пиксель`;
    }
    else if(event.target.id === "transtation_exponent_slider")
    {
        transtation_exponent = event.target.value * 1;
        l_transtation_exponent_slider.textContent = `Величина перемещения: ${transtation_exponent} пикселя`;
    }

    draw_fractal();
});