/**
 * Tic Tac Toe
 * Modes: two players, or player (X) vs AI (O) with easy / medium / hard levels.
 * In AI mode, wins / losses / draws are counted for the current page session.
 */
(() => {
  const HUMAN = "X";
  const AI = "O";
  const AI_DELAY_MS = 400;
  const LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // columns
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];

  // -------------------------------------------------------------------------
  // DOM references
  // -------------------------------------------------------------------------
  const boardEl = document.getElementById("board");
  const statusEl = document.getElementById("status");
  const restartBtn = document.getElementById("restart");
  const levelGroup = document.getElementById("levelGroup");
  const statsEl = document.getElementById("stats");
  const winsEl = document.getElementById("wins");
  const lossesEl = document.getElementById("losses");
  const drawsEl = document.getElementById("draws");
  const modeButtons = document.querySelectorAll("[data-mode]");
  const levelButtons = document.querySelectorAll("[data-level]");

  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
  let board = []; // 9 entries: "X", "O" or null
  let current = HUMAN; // whose turn it is
  let gameOver = false;
  let mode = "pvp"; // "pvp" | "ai"
  let level = "medium"; // "easy" | "medium" | "hard"
  let aiTimer = null;
  let stats = { wins: 0, losses: 0, draws: 0 }; // AI mode only, session only

  // Build the 9 cells once
  const cells = Array.from({ length: 9 }, (_, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ttt-cell";
    btn.setAttribute("aria-label", `Cell ${i + 1}`);
    btn.addEventListener("click", () => onCellClick(i));
    boardEl.appendChild(btn);
    return btn;
  });

  // -------------------------------------------------------------------------
  // Board helpers
  // -------------------------------------------------------------------------

  /** Returns { player, line } if someone has three in a row, otherwise null. */
  function getWinner(b) {
    for (const line of LINES) {
      const [a, c, d] = line;
      if (b[a] && b[a] === b[c] && b[a] === b[d]) {
        return { player: b[a], line };
      }
    }
    return null;
  }

  const emptyIndexes = (b) => b.flatMap((v, i) => (v === null ? [i] : []));
  const randomOf = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // -------------------------------------------------------------------------
  // AI
  // -------------------------------------------------------------------------

  /** Returns a cell that completes three for `player`, or null. */
  function findWinningMove(b, player) {
    for (const i of emptyIndexes(b)) {
      b[i] = player;
      const wins = getWinner(b) !== null;
      b[i] = null;
      if (wins) return i;
    }
    return null;
  }

  /** Minimax: AI-favourable scores are positive; quicker wins score higher. */
  function minimax(b, aiTurn, depth) {
    const result = getWinner(b);
    if (result) return result.player === AI ? 10 - depth : depth - 10;
    if (emptyIndexes(b).length === 0) return 0;

    const scores = emptyIndexes(b).map((i) => {
      b[i] = aiTurn ? AI : HUMAN;
      const score = minimax(b, !aiTurn, depth + 1);
      b[i] = null;
      return score;
    });
    return aiTurn ? Math.max(...scores) : Math.min(...scores);
  }

  /** Picks the cell with the best minimax score for the AI. */
  function bestMove(b) {
    let bestScore = -Infinity;
    let move = null;
    for (const i of emptyIndexes(b)) {
      b[i] = AI;
      const score = minimax(b, false, 1);
      b[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
    return move;
  }

  function pickAiMove() {
    const empty = emptyIndexes(board);
    if (level === "easy") return randomOf(empty);
    if (level === "medium") {
      // Take a win, block the opponent's win, otherwise play randomly.
      return (
        findWinningMove(board, AI) ??
        findWinningMove(board, HUMAN) ??
        randomOf(empty)
      );
    }
    return bestMove(board); // hard: never loses
  }

  // -------------------------------------------------------------------------
  // Game flow
  // -------------------------------------------------------------------------

  function render() {
    cells.forEach((btn, i) => {
      const mark = board[i];
      btn.textContent = mark ?? "";
      btn.disabled = gameOver;
      btn.classList.toggle("x", mark === "X");
      btn.classList.toggle("o", mark === "O");
    });
  }

  function describeTurn() {
    if (mode === "pvp") return `Player ${current}'s turn`;
    return current === HUMAN ? "Your turn (X)" : "Computer is thinking...";
  }

  function endMessage(winner) {
    if (winner === null) return "It's a draw.";
    if (mode === "pvp") return `Player ${winner} wins!`;
    return winner === HUMAN ? "You win!" : "Computer wins!";
  }

  /** Updates the AI win / loss / draw counters. Does nothing outside AI mode. */
  function recordResult(winner) {
    if (mode !== "ai") return;
    if (winner === HUMAN) stats.wins += 1;
    else if (winner === AI) stats.losses += 1;
    else stats.draws += 1;
    renderStats();
  }

  function renderStats() {
    winsEl.textContent = stats.wins;
    lossesEl.textContent = stats.losses;
    drawsEl.textContent = stats.draws;
    statsEl.hidden = mode !== "ai";
  }

  /** Applies `player`'s move on cell `i` and advances the game. */
  function place(i, player) {
    board[i] = player;
    const result = getWinner(board);

    if (result || emptyIndexes(board).length === 0) {
      gameOver = true;
      render();
      if (result) result.line.forEach((j) => cells[j].classList.add("win"));
      statusEl.textContent = endMessage(result ? result.player : null);
      recordResult(result ? result.player : null);
      return;
    }

    current = player === HUMAN ? AI : HUMAN;
    render();
    statusEl.textContent = describeTurn();
  }

  function onCellClick(i) {
    if (gameOver || board[i] !== null) return;
    if (mode === "ai" && current === AI) return; // wait for the AI's turn

    place(i, current);

    if (mode === "ai" && !gameOver) {
      aiTimer = setTimeout(() => {
        aiTimer = null;
        place(pickAiMove(), AI);
      }, AI_DELAY_MS);
    }
  }

  function resetGame() {
    clearTimeout(aiTimer);
    aiTimer = null;
    board = Array(9).fill(null);
    current = HUMAN;
    gameOver = false;
    cells.forEach((btn) => btn.classList.remove("win"));
    render();
    statusEl.textContent = describeTurn();
  }

  // -------------------------------------------------------------------------
  // Settings
  // -------------------------------------------------------------------------

  function setMode(newMode) {
    mode = newMode;
    modeButtons.forEach((b) => {
      const active = b.dataset.mode === mode;
      b.classList.toggle("active", active);
      b.setAttribute("aria-pressed", active);
    });
    levelGroup.hidden = mode !== "ai";
    renderStats();
    resetGame();
  }

  function setLevel(newLevel) {
    level = newLevel;
    levelButtons.forEach((b) => {
      const active = b.dataset.level === level;
      b.classList.toggle("active", active);
      b.setAttribute("aria-pressed", active);
    });
    resetGame();
  }

  // -------------------------------------------------------------------------
  // Event bindings and init
  // -------------------------------------------------------------------------
  modeButtons.forEach((b) =>
    b.addEventListener("click", () => setMode(b.dataset.mode)),
  );
  levelButtons.forEach((b) =>
    b.addEventListener("click", () => setLevel(b.dataset.level)),
  );
  restartBtn.addEventListener("click", resetGame);

  setMode(mode);
  setLevel(level);
})();
