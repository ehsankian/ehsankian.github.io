const drawType = {
    '1': ['20', '35', '50'],
    '2': ['10', '20', '30']
};

const drawCost = {
    '1': {
        '20': [20, 50, 90, 160, 280, 440, 680, 1100, 1700, 2700],
        '35': [35, 90, 155, 280, 490, 770, 1200, 2000, 2900, 4700],
        '50': [50, 130, 220, 400, 700, 1100, 1700, 2800, 4200, 6700]
    },
    '2': {
        '10': [10, 30, 50, 120, 200, 320, 520, 960, 1300, 2300],
        '20': [20, 55, 80, 210, 350, 560, 900, 1600, 2300, 4000],
        '30': [30, 80, 120, 300, 500, 800, 1300, 2400, 3400, 5800]
    }, 
    '3': {
        '10': [10, 30, 50, 120, 200, 320, 520, 800, 1500, 2200],
        '20': [20, 55, 80, 210, 350, 560, 900, 1400, 2700, 3800],
        '30': [30, 80, 120, 300, 500, 800, 1300, 2400, 3400, 5800]
    },
    '4': {
        '10': [10, 30, 50, 120, 200, 320, 520, 800, 1110, 1800],
        '20': [20, 55, 80, 210, 350, 560, 900, 1400, 1900, 3200],
        '30': [30, 80, 120, 300, 500, 800, 1300, 2000, 2800, 4700]
    },
    '5': {
        '10': [10, 30, 50, 120, 200, 320, 520, 800, 1100, 1400],
        '20': [20, 55, 80, 210, 350, 560, 900, 1400, 1900, 2400],
        '30': [30, 80, 120, 300, 500, 800, 1300, 2000, 2800, 3900]
    },
    '6': {
        '10': [10, 50, 140, 300, 600, 1100, 1600],
        '20': null,
        '30': null
    }
};

const draw = document.getElementById('draw')
const price = document.getElementById('price');
const btn = document.getElementById('submit');
const result = document.getElementById('result');
const total = document.getElementById('total');
const discount = document.getElementById('discount');
const zeroDiscount = document.getElementById('zeroDiscount');

function update(){
    const selectedDraw = this.value;
    
    result.textContent = 'Cost: ';
    total.textContent = 'Total: ';
    price.innerHTML = '<option value="0" selected>Choose...</option>';

    if (selectedDraw == '1' || selectedDraw == '2' || selectedDraw == '3'){
        discount.disabled = true;
        zeroDiscount.selected = true;
    }
    else{
        discount.disabled = false;
    }
    
    if (selectedDraw != '0'){

        const firstDrawCost = Object.keys(drawCost[selectedDraw])
        firstDrawCost.forEach(cost => {
            const option = document.createElement('option');
            option.value = cost;
            option.textContent = cost;
            option.id = 'opt' + cost;
            if (drawCost[selectedDraw][cost] == null){
                option.disabled = true;
            }
            price.appendChild(option);
        });
    }
}

function show(){
    const selectedDraw = draw.value;
    const firstDrawCost = price.value;
    const off = discount.value || 0;
    const drawPrice = drawCost[selectedDraw][firstDrawCost];

    let sum = 0;
    
    result.textContent = 'Cost: ';
    total.textContent = 'Total: ';

    drawPrice.forEach(cost => {
        const span = document.createElement('span');
        span.textContent = parseInt(cost * (100 - off) / 100) + ' ';
        result.appendChild(span);
        sum += parseInt(cost * (100 - off) / 100);
    });

    const span = document.createElement('span');
    span.textContent = sum;
    total.appendChild(span);
}

draw.addEventListener('change', update);
price.addEventListener('change', show);
discount.addEventListener('change', show);