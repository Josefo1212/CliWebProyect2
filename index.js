import { validarCampos } from './components/validarCampos.js';
import { QuestionComponent } from './components/QuestionComponent.js';
import { ResultsComponent } from './components/ResultsComponent.js';

const namePlayer = document.getElementById('namePlayer');
const numberQuestions = document.getElementById('numberQuestions');
const btnStart = document.getElementById('startGame');
const inputsSection = document.getElementById('inputs');
const questions = document.getElementById('questions');
const loader = document.getElementById('loader');
const swordsLoader = document.getElementById('swordsLoader');
const difficultyContainer = document.getElementById('difficultyContainer');

let triviaData = [];
let currentQuestion = 0;
let score = 0;
let correctCount = 0;
let incorrectCount = 0;
let totalTime = 0;
let lastConfig = { num: 10, difficulty: 'facil' };

function fetchQuestions(amount, difficulty) {
    const diffMap = { facil: 'easy', media: 'medium', dificil: 'hard' };
    const url = `https://opentdb.com/api.php?amount=${amount}&difficulty=${diffMap[difficulty]}&type=multiple`;
    return fetch(url)
        .then(res => res.json())
        .then(data => data.results);
}

function startGameWithConfig(num, difficulty) {
    swordsLoader.classList.remove('hidden');
    loader.classList.add('hidden');
    inputsSection.classList.add('hidden');
    difficultyContainer.classList.add('hidden');
    // Espera al menos 1.5 segundos aunque la API responda rápido
    Promise.all([
        fetchQuestions(num, difficulty),
        new Promise(res => setTimeout(res, 1500))
    ]).then(([data]) => {
        triviaData = data;
        swordsLoader.classList.add('hidden');
        loader.classList.add('hidden');
        currentQuestion = 0;
        score = 0;
        correctCount = 0;
        incorrectCount = 0;
        totalTime = 0;
        renderQuestion();
    }).catch(() => {
        swordsLoader.classList.add('hidden');
        loader.classList.add('hidden');
        alert('Error al obtener preguntas. Intenta de nuevo.');
        inputsSection.classList.remove('hidden');
        difficultyContainer.classList.remove('hidden');
    });
}

function renderQuestion() {
    // Oculta ambos loaders antes de mostrar la pregunta
    swordsLoader.classList.add('hidden');
    loader.classList.add('hidden');
    const questionComp = new QuestionComponent({
        index: currentQuestion,
        triviaData,
        score,
        correctCount,
        incorrectCount,
        totalTime,
        namePlayer,
        questions,
        onNext: (stateUpdate) => {
            currentQuestion = stateUpdate.currentQuestion;
            score = stateUpdate.score;
            correctCount = stateUpdate.correctCount;
            incorrectCount = stateUpdate.incorrectCount;
            totalTime = stateUpdate.totalTime;
            if (currentQuestion >= triviaData.length) {
                renderResults();
            } else {
                renderQuestion();
            }
        }
    });
    questionComp.render();
}

function renderResults() {
    // Oculta ambos loaders antes de mostrar resultados
    swordsLoader.classList.add('hidden');
    loader.classList.add('hidden');
    const resultsComp = new ResultsComponent({
        triviaData,
        score,
        correctCount,
        totalTime,
        namePlayer,
        inputsSection,
        difficultyContainer,
        questions,
        lastConfig,
        startGameWithConfig
    });
    resultsComp.render();
}

btnStart.addEventListener('click', async (e) => {
    e.preventDefault();

    if (!validarCampos(namePlayer, numberQuestions)) return;

    swordsLoader.classList.remove('hidden');
    loader.classList.add('hidden');
    inputsSection.classList.add('hidden');
    difficultyContainer.classList.add('hidden');

    const num = parseInt(numberQuestions.value, 10);
    const difficulty = document.getElementById('difficulty').value;
    lastConfig = { num, difficulty };
    try {
        // Espera al menos 1.5 segundos aunque la API responda rápido
        const [data] = await Promise.all([
            fetchQuestions(num, difficulty),
            new Promise(res => setTimeout(res, 1500))
        ]);
        triviaData = data;
        swordsLoader.classList.add('hidden');
        loader.classList.add('hidden');
        currentQuestion = 0;
        score = 0;
        correctCount = 0;
        incorrectCount = 0;
        totalTime = 0;
        renderQuestion();
    } catch (e) {
        swordsLoader.classList.add('hidden');
        loader.classList.add('hidden');
        alert('Error al obtener preguntas. Intenta de nuevo.');
        inputsSection.classList.remove('hidden');
        difficultyContainer.classList.remove('hidden');
    }
});

// Partículas cenizas
function startAshParticles() {
    const canvas = document.getElementById('ash-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    let ashes = [];
    for (let i = 0; i < 60; i++) {
        ashes.push({
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 1.8 + 0.7,
            d: Math.random() * 1.5 + 0.5,
            alpha: Math.random() * 0.5 + 0.2
        });
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        for (let i = 0; i < ashes.length; i++) {
            let a = ashes[i];
            ctx.beginPath();
            ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2, false);
            ctx.fillStyle = `rgba(191,160,70,${a.alpha})`;
            ctx.shadowColor = "#d72631";
            ctx.shadowBlur = 6;
            ctx.fill();
        }
        update();
    }
    function update() {
        for (let i = 0; i < ashes.length; i++) {
            let a = ashes[i];
            a.y += a.d;
            a.x += Math.sin(a.y / 40) * 0.5;
            if (a.y > H) {
                a.y = -10;
                a.x = Math.random() * W;
            }
        }
    }
    function animate() {
        draw();
        requestAnimationFrame(animate);
    }
    animate();
    window.addEventListener('resize', () => {
        W = window.innerWidth; H = window.innerHeight;
        canvas.width = W; canvas.height = H;
    });
}
startAshParticles();