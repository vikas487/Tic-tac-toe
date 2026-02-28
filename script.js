/* ============================================
   TIC TAC TOE - GAME LOGIC
   ============================================ */

(function () {
    'use strict';

    // === DOM ===
    const board = document.getElementById('board');
    const cells = document.querySelectorAll('.cell');
    const turnBadge = document.getElementById('turnBadge');
    const turnIcon = document.getElementById('turnIcon');
    const turnLabel = document.getElementById('turnLabel');
    const scoreX = document.getElementById('scoreX');
    const scoreO = document.getElementById('scoreO');
    const scoreDraw = document.getElementById('scoreDraw');
    const xName = document.getElementById('xName');
    const oName = document.getElementById('oName');
    const restartBtn = document.getElementById('restartBtn');

    const popupOverlay = document.getElementById('popupOverlay');
    const popupEmoji = document.getElementById('popupEmoji');
    const popupTitle = document.getElementById('popupTitle');
    const popupSub = document.getElementById('popupSub');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const confettiCanvas = document.getElementById('confettiCanvas');
    const ctx = confettiCanvas.getContext('2d');

    // === State ===
    let gameBoard = Array(9).fill(null);
    let currentPlayer = 'X';
    let gameActive = true;
    let scores = { X: 0, O: 0, draw: 0 };

    const WIN_COMBOS = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    // === Init ===
    function init() {
        cells.forEach(cell => cell.addEventListener('click', handleClick));
        restartBtn.addEventListener('click', resetGame);
        playAgainBtn.addEventListener('click', () => {
            popupOverlay.classList.remove('active');
            resetGame();
        });
        updateTurn();
        updateHover();
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }


    // === Click ===
    function handleClick(e) {
        const idx = parseInt(e.currentTarget.dataset.index);
        if (gameBoard[idx] || !gameActive) return;
        makeMove(idx, currentPlayer);
    }

    // === Move ===
    function makeMove(idx, player) {
        gameBoard[idx] = player;
        const cell = cells[idx];
        const content = cell.querySelector('.cell-content');
        content.textContent = player === 'X' ? '✕' : '◯';
        cell.classList.add(player.toLowerCase(), 'taken');

        const winCombo = checkWin(player);
        if (winCombo) {
            handleWin(player, winCombo);
            return;
        }
        if (checkDraw()) {
            handleDraw();
            return;
        }

        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateTurn();
        updateHover();
    }

    // === Win ===
    function checkWin(player) {
        for (const c of WIN_COMBOS) {
            if (c.every(i => gameBoard[i] === player)) return c;
        }
        return null;
    }

    function checkDraw() {
        return gameBoard.every(c => c !== null);
    }

    function handleWin(player, combo) {
        gameActive = false;
        scores[player]++;
        updateScores();

        combo.forEach(i => cells[i].classList.add('winning-cell'));
        cells.forEach(c => c.classList.add('game-over'));

            setTimeout(() => {
            const isX = player === 'X';
            popupEmoji.textContent = '🏆';
            popupTitle.textContent = (isX ? 'Player 1' : 'Player 2') + ' Wins!';
            popupSub.textContent = 'Great match!';
            popupTitle.style.color = isX ? 'var(--gold-main)' : 'var(--o-fill)';
            popupOverlay.classList.add('active');
            launchConfetti();
        }, 650);
    }

    function handleDraw() {
        gameActive = false;
        scores.draw++;
        updateScores();
        cells.forEach(c => c.classList.add('game-over'));

        setTimeout(() => {
            popupEmoji.textContent = '🤝';
            popupTitle.textContent = "It's a Draw!";
            popupTitle.style.color = 'var(--text-light)';
            popupSub.textContent = 'Nobody wins this time!';
            popupOverlay.classList.add('active');
        }, 450);
    }

    // === Reset ===
    function resetGame() {
        gameBoard = Array(9).fill(null);
        currentPlayer = 'X';
        gameActive = true;

        cells.forEach(cell => {
            cell.querySelector('.cell-content').textContent = '';
            cell.className = 'cell';
        });
        updateTurn();
        updateHover();
    }

    // === UI Updates ===
    function updateTurn() {
        const isX = currentPlayer === 'X';
        turnIcon.textContent = isX ? '✕' : '◯';
        const name = isX ? "Player 1's" : "Player 2's";
        turnLabel.textContent = name + ' Turn';
        turnBadge.className = 'turn-badge ' + (isX ? 'x-turn' : 'o-turn');
    }

    function updateHover() {
        cells.forEach(cell => {
            cell.classList.remove('x-hover', 'o-hover');
            if (!cell.classList.contains('taken') && gameActive) {
                cell.classList.add(currentPlayer === 'X' ? 'x-hover' : 'o-hover');
            }
        });
    }

    function updateScores() {
        animateNum(scoreX, scores.X);
        animateNum(scoreO, scores.O);
        animateNum(scoreDraw, scores.draw);
    }

    function animateNum(el, val) {
        el.textContent = val;
        el.style.transform = 'scale(1.4)';
        setTimeout(() => el.style.transform = 'scale(1)', 200);
    }


    // === Confetti ===
    function resizeCanvas() {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    }

    function launchConfetti() {
        const particles = [];
        const colors = ['#f0b932', '#fdd835', '#9b5cc6', '#6b2fa0', '#ff7675', '#55efc4', '#ffffff'];

        for (let i = 0; i < 100; i++) {
            particles.push({
                x: confettiCanvas.width / 2 + (Math.random() - 0.5) * 200,
                y: confettiCanvas.height / 2,
                vx: (Math.random() - 0.5) * 15,
                vy: -Math.random() * 18 - 4,
                size: Math.random() * 8 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                rot: Math.random() * 360,
                rotV: (Math.random() - 0.5) * 12,
                gravity: 0.35,
                opacity: 1,
                decay: 0.008 + Math.random() * 0.006,
                shape: Math.random() > 0.5 ? 'r' : 'c',
            });
        }

        function tick() {
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            let alive = false;
            particles.forEach(p => {
                if (p.opacity <= 0) return;
                alive = true;
                p.vy += p.gravity;
                p.x += p.vx; p.y += p.vy;
                p.vx *= 0.99;
                p.rot += p.rotV;
                p.opacity -= p.decay;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot * Math.PI / 180);
                ctx.globalAlpha = Math.max(0, p.opacity);
                ctx.fillStyle = p.color;
                if (p.shape === 'r') ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
                ctx.restore();
            });
            if (alive) requestAnimationFrame(tick);
        }
        tick();
    }

    init();
})();
