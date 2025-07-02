import { decodeHtml } from './utils.js';

/**
 * Componente para mostrar y controlar una pregunta de trivia.
 */
export class QuestionComponent {
    /**
     * @param {Object} params - Parámetros para inicializar el componente.
     */
    constructor({ index, triviaData, score, correctCount, incorrectCount, totalTime, namePlayer, questions, onNext }) {
        this.index = index;
        this.triviaData = triviaData;
        this.score = score;
        this.correctCount = correctCount;
        this.incorrectCount = incorrectCount;
        this.totalTime = totalTime;
        this.namePlayer = namePlayer;
        this.questions = questions;
        this.onNext = onNext;
        this.timer = null;
        this.timeLeft = 20;
        this.questionStartTime = 0;
    }

    /**
     * Renderiza la pregunta actual y sus opciones.
     */
    render() {
        clearInterval(this.timer);
        this.questions.innerHTML = '';
        // Efecto fade-in
        this.questions.style.opacity = '0';
        setTimeout(() => { this.questions.style.opacity = '1'; }, 50);

        // Si no hay más preguntas, llama a onNext para mostrar resultados
        if (this.index >= this.triviaData.length) {
            this.onNext({
                currentQuestion: this.index,
                score: this.score,
                correctCount: this.correctCount,
                incorrectCount: this.incorrectCount,
                totalTime: this.totalTime
            });
            return;
        }

        this.questionStartTime = Date.now();
        const q = this.triviaData[this.index];
        // Mezcla las respuestas
        const answers = [...q.incorrect_answers, q.correct_answer]
            .map(decodeHtml)
            .sort(() => Math.random() - 0.5);

        // Progreso
        const progress = document.createElement('div');
        progress.textContent = `Question ${this.index + 1} of ${this.triviaData.length}`;
        progress.style.marginBottom = '12px';
        this.questions.appendChild(progress);

        // Puntuación en tiempo real
        const scoreDiv = document.createElement('div');
        scoreDiv.textContent = `Score: ${this.score} | Correct: ${this.correctCount} | Incorrect: ${this.incorrectCount}`;
        scoreDiv.style.marginBottom = '10px';
        scoreDiv.style.fontSize = '1em';
        scoreDiv.style.color = '#bfa046';
        this.questions.appendChild(scoreDiv);

        // Pregunta
        const questionText = document.createElement('div');
        questionText.textContent = decodeHtml(q.question);
        questionText.style.fontWeight = 'bold';
        questionText.style.marginBottom = '16px';
        this.questions.appendChild(questionText);

        // Opciones de respuesta
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
            btn.addEventListener('click', () => this.handleAnswer(btn, ans, decodeHtml(q.correct_answer)));
            optionsDiv.appendChild(btn);
        });
        this.questions.appendChild(optionsDiv);

        // Barra de salud (timer visual)
        const timerDiv = document.createElement('div');
        timerDiv.id = 'timer';
        timerDiv.style.marginTop = '18px';
        timerDiv.style.fontWeight = 'bold';
        timerDiv.style.color = '#fff';

        // Fondo de la barra de salud
        const healthBg = document.createElement('div');
        healthBg.className = 'health-bar-bg';
        const healthBar = document.createElement('div');
        healthBar.className = 'health-bar';
        healthBg.appendChild(healthBar);
        timerDiv.appendChild(healthBg);

        // Etiqueta del timer
        const timerLabel = document.createElement('span');
        timerLabel.className = 'timer-label';
        timerDiv.appendChild(timerLabel);
        this.questions.appendChild(timerDiv);

        // Inicializa el timer
        this.timeLeft = 20;
        this.updateTimerDisplay(timerLabel, healthBar, this.timeLeft, timerDiv);
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay(timerLabel, healthBar, this.timeLeft, timerDiv);
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.handleTimeout(decodeHtml(q.correct_answer));
            }
        }, 1000);
    }

    /**
     * Actualiza la barra de salud y el texto del timer.
     * Añade efecto visual cuando queden menos de 5 segundos.
     */
    updateTimerDisplay(timerLabel, healthBar, seconds, timerDiv) {
        timerLabel.textContent = `Vitality: ${seconds}s`;
        healthBar.style.width = (seconds * 5) + '%';
        healthBar.style.background = seconds <= 5
            ? 'linear-gradient(90deg, #d72631 0%, #bfa046 100%)'
            : 'linear-gradient(90deg, #bfa046 0%, #d72631 100%)';

        // Indicador visual especial (parpadeo) cuando queden menos de 5 segundos
        if (timerDiv) {
            if (seconds <= 5) {
                timerDiv.classList.add('timer-warning');
            } else {
                timerDiv.classList.remove('timer-warning');
            }
        }
    }

    /**
     * Maneja la selección de una respuesta.
     */
    handleAnswer(btn, selected, correct) {
        clearInterval(this.timer);
        const allBtns = this.questions.querySelectorAll('button');
        allBtns.forEach(b => b.disabled = true);

        const elapsed = Math.min(20, Math.round((Date.now() - this.questionStartTime) / 1000));
        let newScore = this.score;
        let newCorrect = this.correctCount;
        let newIncorrect = this.incorrectCount;
        let newTotalTime = this.totalTime + elapsed;

        if (selected === correct) {
            btn.style.background = '#b6f7b0';
            btn.style.borderColor = '#3bb143';
            newScore += 10;
            newCorrect++;
        } else {
            btn.style.background = '#ffb6b6';
            btn.style.borderColor = '#d43c3c';
            newIncorrect++;
            allBtns.forEach(b => {
                if (b.textContent === correct) {
                    b.style.background = '#b6f7b0';
                    b.style.borderColor = '#3bb143';
                }
            });
        }
        setTimeout(() => {
            this.onNext({
                currentQuestion: this.index + 1,
                score: newScore,
                correctCount: newCorrect,
                incorrectCount: newIncorrect,
                totalTime: newTotalTime
            });
        }, 1200);
    }

    /**
     * Maneja el caso en que se acaba el tiempo para responder.
     */
    handleTimeout(correct) {
        let newIncorrect = this.incorrectCount + 1;
        let newTotalTime = this.totalTime + 20;
        this.showFeedback(null, correct, newIncorrect, newTotalTime);
    }

    /**
     * Muestra el feedback visual tras una respuesta incorrecta o timeout.
     */
    showFeedback(selected, correct, newIncorrect, newTotalTime) {
        const allBtns = this.questions.querySelectorAll('button');
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
            this.onNext({
                currentQuestion: this.index + 1,
                score: this.score,
                correctCount: this.correctCount,
                incorrectCount: newIncorrect,
                totalTime: newTotalTime
            });
        }, 1200);
    }
}

