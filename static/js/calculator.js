/**
 * Lucky Draw CP Calculator
 * ------------------------
 * Calculates the CP (currency) cost of pulling a "Lucky Draw" a certain
 * number of times, factoring in per-draw discounts and an optional
 * "1 CP coupon" for the very first pull.
 */

// ---------------------------------------------------------------------------
// Pricing data
// ---------------------------------------------------------------------------
// Shape: drawCost[drawType][firstDrawPrice] => cumulative cost per pull index.
// A `null` table means that combination is not offered for that draw type.
const DRAW_COST = {
  '1': {
    '20': [20, 50, 90, 160, 280, 440, 680, 1100, 1700, 2700],
    '35': [35, 90, 155, 280, 490, 770, 1200, 2000, 2900, 4700],
    '50': [50, 130, 220, 400, 700, 1100, 1700, 2800, 4200, 6700],
  },
  '2': {
    '10': [10, 30, 50, 120, 200, 320, 520, 960, 1300, 2300],
    '20': [20, 55, 80, 210, 350, 560, 900, 1600, 2300, 4000],
    '30': [30, 80, 120, 300, 500, 800, 1300, 2400, 3400, 5800],
  },
  '3': {
    '10': [10, 30, 50, 120, 200, 320, 520, 800, 1500, 2200],
    '20': [20, 55, 80, 210, 350, 560, 900, 1400, 2700, 3800],
    '30': [30, 80, 120, 300, 500, 800, 1300, 2400, 3400, 5800],
  },
  '4': {
    '10': [10, 30, 50, 120, 200, 320, 520, 800, 1110, 1800],
    '20': [20, 55, 80, 210, 350, 560, 900, 1400, 1900, 3200],
    '30': [30, 80, 120, 300, 500, 800, 1300, 2000, 2800, 4700],
  },
  '5': {
    '10': [10, 30, 50, 120, 200, 320, 520, 800, 1100, 1400],
    '20': [20, 55, 80, 210, 350, 560, 900, 1400, 1900, 2400],
    '30': [30, 80, 120, 300, 500, 800, 1300, 2000, 2800, 3900],
  },
  '6': {
    '10': [10, 50, 140, 300, 600, 1100, 1600],
    '20': null,
    '30': null,
  },
};

// Draw types that never offer a discount, and therefore lock the discount
// select to 0% and hide the "1 CP coupon" option.
const NO_DISCOUNT_DRAWS = ['0', '1', '2', '3'];

(() => {
  // -------------------------------------------------------------------------
  // DOM references
  // -------------------------------------------------------------------------
  const drawSelect = document.getElementById('draw');
  const priceSelect = document.getElementById('price');
  const discountSelect = document.getElementById('discount');
  const zeroDiscountOption = document.getElementById('zeroDiscount');

  const calculateBtn = document.getElementById('calculate');
  const clearBtn = document.getElementById('clear');

  const resultEl = document.getElementById('result');
  const totalEl = document.getElementById('total');

  const inputCP = document.getElementById('inputCP');
  const oneCpCheckbox = document.getElementById('onecp');
  const oneCpWrapper = document.getElementById('onecpdiv');

  const userCpEl = document.getElementById('userCP');
  const numberOfSpinsEl = document.getElementById('numberOfSpins');
  const remainingCpEl = document.getElementById('remainingCP');

  // Tracks whether "Calculate" has been run at least once, so later changes
  // (price, discount, coupon) can live-refresh the result without a re-click.
  let hasCalculated = false;

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  /** Applies a percentage discount to a cost and truncates to a whole number. */
  const applyDiscount = (cost, discountPercent) =>
    parseInt((cost * (100 - discountPercent)) / 100, 10);

  /** Toggles a Bootstrap validation class on/off based on a condition. */
  const setInvalid = (el, isInvalid) => el.classList.toggle('is-invalid', isInvalid);

  // -------------------------------------------------------------------------
  // Core behaviour
  // -------------------------------------------------------------------------

  /**
   * Rebuilds the "First draw price" options whenever the Draw type changes,
   * and toggles discount/coupon availability accordingly.
   */
  function handleDrawChange() {
    const selectedDraw = drawSelect.value;

    resultEl.textContent = '';
    totalEl.textContent = '';
    priceSelect.innerHTML = '';

    // Remove the initial "Choose..." placeholder once a real draw is picked.
    if (drawSelect.firstElementChild.value === '0') {
      drawSelect.removeChild(drawSelect.firstElementChild);
    }

    if (NO_DISCOUNT_DRAWS.includes(selectedDraw)) {
      discountSelect.disabled = true;
      zeroDiscountOption.selected = true;
      oneCpWrapper.classList.add('d-none');
      oneCpCheckbox.checked = false;
    } else {
      discountSelect.disabled = false;
      oneCpWrapper.classList.remove('d-none');
    }

    if (selectedDraw === '0') return;

    // Populate the price dropdown with every entry price for this draw type.
    Object.keys(DRAW_COST[selectedDraw]).forEach((cost, index) => {
      const option = document.createElement('option');
      option.value = cost;
      option.textContent = cost;
      option.id = `opt${cost}`;
      option.disabled = DRAW_COST[selectedDraw][cost] == null;
      option.selected = index === 0;
      priceSelect.appendChild(option);
    });

    renderCostBreakdown();

    if (hasCalculated) calculateSpins();
  }

  /**
   * Renders the per-pull cost breakdown ("Cost: 20 - 50 - 90...") and the
   * running total for the currently selected draw/price/discount/coupon.
   */
  function renderCostBreakdown() {
    const selectedDraw = drawSelect.value;
    if (selectedDraw === '0') return 0;

    const drawPrice = DRAW_COST[selectedDraw][priceSelect.value];
    const discountPercent = discountSelect.value || 0;

    resultEl.textContent = '';
    totalEl.textContent = '';

    let sum = 0;

    drawPrice.forEach((cost, index) => {
      const span = document.createElement('span');
      const isFirstPullWithCoupon = oneCpCheckbox.checked && index === 0;
      const displayCost = isFirstPullWithCoupon ? 1 : applyDiscount(cost, discountPercent);

      sum += displayCost;
      span.id = `cost-${index}`;
      span.textContent = index < drawPrice.length - 1 ? `${displayCost} - ` : `${displayCost}`;
      resultEl.appendChild(span);
    });

    const totalSpan = document.createElement('span');
    totalSpan.textContent = sum;
    totalEl.appendChild(totalSpan);

    if (hasCalculated) calculateSpins();
  }

  /**
   * Validates the three required inputs (CP amount, draw type, price),
   * flagging any invalid fields with Bootstrap's `is-invalid` class.
   * Returns true only if every field is valid.
   */
  function isFormValid() {
    const cpIsInvalid = Number(inputCP.value) <= 0;
    const drawIsInvalid = drawSelect.value === '0';
    const priceIsInvalid = priceSelect.value === '0';

    setInvalid(inputCP, cpIsInvalid);
    setInvalid(drawSelect, drawIsInvalid);
    setInvalid(priceSelect, priceIsInvalid);

    return !(cpIsInvalid || drawIsInvalid || priceIsInvalid);
  }

  /**
   * Works out how many times the user can spin with their available CP,
   * spending it pull-by-pull (each pull costs more than the last) and
   * highlighting the affordable pulls in the cost breakdown.
   */
  function calculateSpins() {
    if (!isFormValid()) return;

    const drawPrice = DRAW_COST[drawSelect.value][priceSelect.value];
    const discountPercent = discountSelect.value;
    let remainingCp = Number(inputCP.value);
    let spinIndex = 0;

    // The first pull costs a flat 1 CP if the coupon is applied, otherwise
    // it's the normal discounted price.
    let spinPrice = oneCpCheckbox.checked ? 1 : applyDiscount(drawPrice[spinIndex], discountPercent);

    userCpEl.textContent = remainingCp;

    while (remainingCp >= spinPrice) {
      remainingCp -= spinPrice;
      spinIndex += 1;
      spinPrice = applyDiscount(drawPrice[spinIndex], discountPercent);
    }

    numberOfSpinsEl.textContent = spinIndex;
    remainingCpEl.textContent = remainingCp;

    // Reset then re-apply the "affordable pull" highlight.
    drawPrice.forEach((_, i) => document.getElementById(`cost-${i}`).classList.remove('red'));
    for (let i = 0; i < spinIndex; i += 1) {
      document.getElementById(`cost-${i}`).classList.add('red');
    }

    hasCalculated = true;
  }

  /** Re-renders the breakdown when the "1 CP coupon" checkbox is toggled. */
  function handleOneCpToggle() {
    renderCostBreakdown();
    if (hasCalculated) calculateSpins();
  }

  /** Resets the calculator back to its initial (no CP entered) state. */
  function resetCalculator() {
    hasCalculated = false;
    userCpEl.textContent = '0';
    numberOfSpinsEl.textContent = '0';
    remainingCpEl.textContent = '0';
    inputCP.value = '';
    setInvalid(inputCP, false);
    renderCostBreakdown();
  }

  // -------------------------------------------------------------------------
  // Event bindings
  // -------------------------------------------------------------------------
  drawSelect.addEventListener('change', handleDrawChange);
  priceSelect.addEventListener('change', renderCostBreakdown);
  discountSelect.addEventListener('change', renderCostBreakdown);
  calculateBtn.addEventListener('click', calculateSpins);
  oneCpCheckbox.addEventListener('change', handleOneCpToggle);
  clearBtn.addEventListener('click', resetCalculator);
})();