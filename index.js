import { validarCampos } from './components/validarCampos.js';
import { QuestionComponent } from './components/QuestionComponent.js';
import { ResultsComponent } from './components/ResultsComponent.js';

const namePlayer = document.getElementById('namePlayer');
const numberQuestions = document.getElementById('numberQuestions');
const btnStart = document.getElementById('startGame');
const inputsSection = document.getElementById('inputs');
const questions = document.getElementById('questions');
const loader = document.getElementById('loader');
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
    loader.classList.remove('hidden');
    inputsSection.classList.add('hidden');
    difficultyContainer.classList.add('hidden');
    fetchQuestions(num, difficulty).then(data => {
        triviaData = data;
        loader.classList.add('hidden');
        currentQuestion = 0;
        score = 0;
        correctCount = 0;
        incorrectCount = 0;
        totalTime = 0;
        renderQuestion();
    }).catch(() => {
        loader.classList.add('hidden');
        alert('Error al obtener preguntas. Intenta de nuevo.');
        inputsSection.classList.remove('hidden');
        difficultyContainer.classList.remove('hidden');
    });
}

function renderQuestion() {
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

btnStart.addEventListener('click', async () => {
    if (!validarCampos(namePlayer, numberQuestions)) return;

    loader.classList.remove('hidden');
    inputsSection.classList.add('hidden');
    difficultyContainer.classList.add('hidden');

    const num = parseInt(numberQuestions.value, 10);
    const difficulty = document.getElementById('difficulty').value;
    lastConfig = { num, difficulty };
    try {
        triviaData = await fetchQuestions(num, difficulty);
        loader.classList.add('hidden');
        currentQuestion = 0;
        score = 0;
        correctCount = 0;
        incorrectCount = 0;
        totalTime = 0;
        renderQuestion();
    } catch (e) {
        loader.classList.add('hidden');
        alert('Error al obtener preguntas. Intenta de nuevo.');
        inputsSection.classList.remove('hidden');
        difficultyContainer.classList.remove('hidden');
    }
});