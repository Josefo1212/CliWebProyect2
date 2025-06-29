import { decodeHtml } from './utils.js';

export class QuestionComponent {
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

    render() {
        clearInterval(this.timer);
        this.questions.innerHTML = '';
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
        const answers = [...q.incorrect_answers, q.correct_answer]
            .map(decodeHtml)
            .sort(() => Math.random() - 0.5);

        // Progreso
        const progress = document.createElement('div');
        progress.textContent = `Pregunta ${this.index + 1} de ${this.triviaData.length}`;
        progress.style.marginBottom = '12px';
        this.questions.appendChild(progress);

        // Puntuación en tiempo real
        const scoreDiv = document.createElement('div');
        scoreDiv.textContent = `Puntuación: ${this.score} | Correctas: ${this.correctCount} | Incorrectas: ${this.incorrectCount}`;
        scoreDiv.style.marginBottom = '10px';
        scoreDiv.style.fontSize = '1em';
        scoreDiv.style.color = '#3466c2';
        this.questions.appendChild(scoreDiv);

        // Pregunta
        const questionText = document.createElement('div');
        questionText.textContent = decodeHtml(q.question);
        questionText.style.fontWeight = 'bold';
        questionText.style.marginBottom = '16px';
        this.questions.appendChild(questionText);

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
            btn.addEventListener('click', () => this.handleAnswer(btn, ans, decodeHtml(q.correct_answer)));
            optionsDiv.appendChild(btn);
        });
        this.questions.appendChild(optionsDiv);

        // Temporizador
        const timerDiv = document.createElement('div');
        timerDiv.id = 'timer';
        timerDiv.style.marginTop = '18px';
        timerDiv.style.fontWeight = 'bold';
        timerDiv.style.color = '#3466c2';
        this.questions.appendChild(timerDiv);

        this.timeLeft = 20;
        this.updateTimerDisplay(timerDiv, this.timeLeft);
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay(timerDiv, this.timeLeft);
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.handleTimeout(decodeHtml(q.correct_answer));
            }
        }, 1000);
    }

    updateTimerDisplay(timerDiv, seconds) {
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

    handleTimeout(correct) {
        let newIncorrect = this.incorrectCount + 1;
        let newTotalTime = this.totalTime + 20;
        this.showFeedback(null, correct, newIncorrect, newTotalTime);
    }

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
