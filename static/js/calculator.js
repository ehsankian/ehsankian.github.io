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
const btn = document.getElementById('calculate');
const clearBtn = document.getElementById('clear');
const result = document.getElementById('result');
const total = document.getElementById('total');
const discount = document.getElementById('discount');
const zeroDiscount = document.getElementById('zeroDiscount');
const upgradePart = document.getElementById('upgrade');
const inputCP = document.getElementById('inputCP');
const oneCP = document.getElementById('onecp');
let isBtnUsed = false;

function update(){
    const selectedDraw = this.value;
    const noDiscount = ['0','1','2','3'];
    const onecpdiv = document.getElementById('onecpdiv');
    
    result.textContent = '';
    total.textContent = '';
    price.innerHTML = '';

    if (draw.firstElementChild.value == '0'){
        draw.removeChild(draw.firstElementChild)
    }

    if (noDiscount.includes(selectedDraw)){
        discount.disabled = true;
        zeroDiscount.selected = true;
        if (!onecpdiv.classList.contains('d-none')){
            onecpdiv.classList.add('d-none');
            oneCP.checked = false;
        }
    }
    else{
        discount.disabled = false;
        if (onecpdiv.classList.contains('d-none')){
            onecpdiv.classList.remove('d-none')
        }
    }

    if (selectedDraw != '0'){

        const firstDrawCost = Object.keys(drawCost[selectedDraw])
        firstDrawCost.forEach((cost, index) => {
            const option = document.createElement('option');
            option.value = cost;
            option.textContent = cost;
            option.id = 'opt' + cost;
            if (drawCost[selectedDraw][cost] == null){
                option.disabled = true;
            }
            if (index == 0){
                option.selected = true;
            }
            price.appendChild(option);
        });

        show();

        if (isBtnUsed){
            calculate();
        }
    }
}

function show(){
    const selectedDraw = draw.value;
    if (selectedDraw == '0'){
        return 0;
    }

    const firstDrawCost = price.value;
    const off = discount.value || 0;
    const drawPrice = drawCost[selectedDraw][firstDrawCost];

    let sum = 0;
    
    result.textContent = '';
    total.textContent = '';

    drawPrice.forEach((cost, index) => {
        const span = document.createElement('span');
        if (oneCP.checked && index == 0){
            span.textContent = '1';
            sum += 1;
        }
        else{
            span.textContent = parseInt(cost * (100 - off) / 100);
            sum += parseInt(cost * (100 - off) / 100);
        }
        span.id = 'cost-' + index;
        if (index < drawPrice.length - 1){
            span.textContent += ' - ';
        }
        result.appendChild(span); 
    });

    const span = document.createElement('span');
    span.textContent = sum;
    total.appendChild(span);

    if (isBtnUsed){
        calculate();
    }
}

function validation(){
    let cp = inputCP.value;
    let flag = false;

    if (cp <= 0){
        inputCP.classList.add('is-invalid');
        flag = true;
    }
    else{
        inputCP.classList.remove('is-invalid');
    }

    if (draw.value == '0'){
        draw.classList.add('is-invalid');
        flag = true;
    }
    else{
        draw.classList.remove('is-invalid');
    }

    if (price.value == '0'){
        price.classList.add('is-invalid');
        flag = true;
    }
    else{
        price.classList.remove('is-invalid');
    }

    if (flag){
        return false;
    }

    return true;
}

function calculate(){
    if(validation()){
        const drawPrice = drawCost[draw.value][price.value];
        let cp = inputCP.value;
        let off = discount.value;
        let index = 0;
        let spinPrice = 1;

        if (!oneCP.checked){
            spinPrice = parseInt(drawPrice[index] * (100 - off) / 100);
        }

        document.getElementById('userCP').textContent = cp;

        while (cp >= spinPrice) {
            cp -= spinPrice;
            index++;
            spinPrice = parseInt(drawPrice[index] * (100 - off) / 100);
        }

        document.getElementById('numberOfSpins').textContent = index;
        document.getElementById('remainingCP').textContent = cp;

        for (let h = 0; h < drawPrice.length; h++) {
            document.getElementById('cost-'+h).classList.remove('red');
        }

        for (let k = 0; k < index; k++){
            document.getElementById('cost-'+k).classList.add('red');
        }

        isBtnUsed = true;
    }
}

function onecpUpdate(){
    show();
    if (isBtnUsed){
        calculate();
        return 0;
    }
}

function clear(){
    isBtnUsed = false;
    document.getElementById('userCP').textContent = 0;
    document.getElementById('numberOfSpins').textContent = 0;
    document.getElementById('remainingCP').textContent = 0;
    inputCP.value = '';
    if (inputCP.classList.contains('is-invalid')){
        inputCP.classList.remove('is-invalid')
    }
    show();
}

draw.addEventListener('change', update);
price.addEventListener('change', show);
discount.addEventListener('change', show);
btn.addEventListener('click', calculate);
oneCP.addEventListener('change', onecpUpdate);
clearBtn.addEventListener('click', clear)