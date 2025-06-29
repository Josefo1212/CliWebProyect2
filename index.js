const namePlayer = document.getElementById('namePlayer');
const numberQuestions = document.getElementById('numberQuestions');
const btnStart = document.getElementById('startGame');
const btnEnd = document.getElementById('endGame');
const inputsSection = document.getElementById('inputs');
const questions = document.getElementById('questions');
const loader = document.getElementById('loader');
const difficultyContainer = document.getElementById('difficultyContainer');

let triviaData = [];
let currentQuestion = 0;
let score = 0;
let timer = null;
let timeLeft = 20; // segundos por pregunta

function validarCampos(){
    const name = namePlayer.value.trim();
    const num = parseInt(numberQuestions.value, 10);

    if(name.length < 2 || name.length > 20){
        alert('el nombre debe tener entre 2 y 20 caracteres');
        return false;
    }
    if(isNaN(num) || num < 5|| num > 20){
        alert('la cantidad de preguntas debe ser entre 5 y 20');
        return false;
    }
    return true;
}

function decodeHtml(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

async function fetchQuestions(amount, difficulty) {
    // Mapear dificultad a valores de la API
    const diffMap = { facil: 'easy', media: 'medium', dificil: 'hard' };
    const url = `https://opentdb.com/api.php?amount=${amount}&difficulty=${diffMap[difficulty]}&type=multiple`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results;
}

function showQuestion(index) {
    clearInterval(timer);
    questions.innerHTML = '';
    if (index >= triviaData.length) {
        showResults();
        return;
    }
    const q = triviaData[index];
    // Mezclar respuestas
    const answers = [...q.incorrect_answers, q.correct_answer]
        .map(decodeHtml)
        .sort(() => Math.random() - 0.5);

    // Progreso
    const progress = document.createElement('div');
    progress.textContent = `Pregunta ${index + 1} de ${triviaData.length}`;
    progress.style.marginBottom = '12px';
    questions.appendChild(progress);

    // Pregunta
    const questionText = document.createElement('div');
    questionText.textContent = decodeHtml(q.question);
    questionText.style.fontWeight = 'bold';
    questionText.style.marginBottom = '16px';
    questions.appendChild(questionText);

    // Opciones
    const optionsDiv = document.createElement('div');
    optionsDiv.style.display = 'flex';
    optionsDiv.style.flexDirection = 'column';
    optionsDiv.style.gap = '10px';

    answers.forEach(ans => {
        const btn = document.createElement('button');
        btn.textContent = ans;
        btn.style.padding = '10px';
        btn.style.borderRadius = '4px';
        btn.style.border = '1px solid #bbb';
        btn.style.background = '#f2f6ff';
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', () => handleAnswer(btn, ans, decodeHtml(q.correct_answer)));
        optionsDiv.appendChild(btn);
    });
    questions.appendChild(optionsDiv);

    // Temporizador
    const timerDiv = document.createElement('div');
    timerDiv.id = 'timer';
    timerDiv.style.marginTop = '18px';
    timerDiv.style.fontWeight = 'bold';
    timerDiv.style.color = '#3466c2';
    questions.appendChild(timerDiv);

    timeLeft = 20;
    updateTimerDisplay(timerDiv, timeLeft);
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(timerDiv, timeLeft);
        if (timeLeft <= 0) {
            clearInterval(timer);
            showFeedback(null, decodeHtml(q.correct_answer));
        }
    }, 1000);
}

function updateTimerDisplay(timerDiv, seconds) {
    timerDiv.textContent = `Tiempo restante: ${seconds}s`;
    if (seconds <= 5) {
        timerDiv.style.color = '#d43c3c';
        timerDiv.style.background = '#fff0f0';
        timerDiv.style.padding = '6px 10px';
        timerDiv.style.borderRadius = '6px';
        timerDiv.style.transition = 'background 0.2s, color 0.2s';
    } else {
        timerDiv.style.color = '#3466c2';
        timerDiv.style.background = 'transparent';
        timerDiv.style.padding = '';
        timerDiv.style.borderRadius = '';
    }
}

function handleAnswer(btn, selected, correct) {
    clearInterval(timer);
    const allBtns = questions.querySelectorAll('button');
    allBtns.forEach(b => b.disabled = true);

    if (selected === correct) {
        btn.style.background = '#b6f7b0';
        btn.style.borderColor = '#3bb143';
        score++;
    } else {
        btn.style.background = '#ffb6b6';
        btn.style.borderColor = '#d43c3c';
        // Resaltar la correcta
        allBtns.forEach(b => {
            if (b.textContent === correct) {
                b.style.background = '#b6f7b0';
                b.style.borderColor = '#3bb143';
            }
        });
    }
    setTimeout(() => {
        currentQuestion++;
        showQuestion(currentQuestion);
    }, 1200);
}

function showFeedback(selected, correct) {
    const allBtns = questions.querySelectorAll('button');
    allBtns.forEach(b => {
        b.disabled = true;
        if (b.textContent === correct) {
            b.style.background = '#b6f7b0';
            b.style.borderColor = '#3bb143';
        } else {
            b.style.background = '#ffb6b6';
            b.style.borderColor = '#d43c3c';
        }
    });
    setTimeout(() => {
        currentQuestion++;
        showQuestion(currentQuestion);
    }, 1200);
}

function showResults() {
    questions.innerHTML = `<h2>¡Juego terminado!</h2>
        <p>Puntaje de ${namePlayer.value}: ${score} / ${triviaData.length}</p>
        <button id="restartBtn">Jugar de nuevo</button>`;
    document.getElementById('restartBtn').onclick = () => {
        // Resetear todo
        inputsSection.classList.remove('hidden');
        difficultyContainer.classList.remove('hidden');
        questions.innerHTML = '';
        score = 0;
        currentQuestion = 0;
    };
}

btnStart.addEventListener('click', async ()=>{
    if(!validarCampos())return;
    
    loader.classList.remove('hidden');
    inputsSection.classList.add('hidden');
    difficultyContainer.classList.add('hidden'); 

    // Obtener preguntas
    const num = parseInt(numberQuestions.value, 10);
    const difficulty = document.getElementById('difficulty').value;
    try {
        triviaData = await fetchQuestions(num, difficulty);
        loader.classList.add('hidden');
        currentQuestion = 0;
        score = 0;
        showQuestion(currentQuestion);
    } catch (e) {
        loader.classList.add('hidden');
        alert('Error al obtener preguntas. Intenta de nuevo.');
        inputsSection.classList.remove('hidden');
        difficultyContainer.classList.remove('hidden');
    }
});