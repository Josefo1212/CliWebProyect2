export class ResultsComponent {
    constructor({ triviaData, score, correctCount, totalTime, namePlayer, inputsSection, difficultyContainer, questions, lastConfig, startGameWithConfig }) {
        this.triviaData = triviaData;
        this.score = score;
        this.correctCount = correctCount;
        this.totalTime = totalTime;
        this.namePlayer = namePlayer;
        this.inputsSection = inputsSection;
        this.difficultyContainer = difficultyContainer;
        this.questions = questions;
        this.lastConfig = lastConfig;
        this.startGameWithConfig = startGameWithConfig;
    }

    render() {
        const total = this.triviaData.length;
        const percent = total > 0 ? Math.round((this.correctCount / total) * 100) : 0;
        const avgTime = total > 0 ? (this.totalTime / total).toFixed(1) : 0;

        this.questions.innerHTML = `
            <h2>¡Juego terminado!</h2>
            <p><strong>Jugador:</strong> ${this.namePlayer.value}</p>
            <p><strong>Puntuación total:</strong> ${this.score}</p>
            <p><strong>Respuestas correctas:</strong> ${this.correctCount} / ${total}</p>
            <p><strong>Porcentaje de aciertos:</strong> ${percent}%</p>
            <p><strong>Tiempo promedio por pregunta:</strong> ${avgTime} segundos</p>
            <div style="margin-top:18px;display:flex;flex-direction:column;gap:10px;">
                <button id="restartSame">Jugar de nuevo (misma configuración)</button>
                <button id="restartConfig">Cambiar configuración</button>
                <button id="finishApp">Finalizar</button>
            </div>
        `;
        document.getElementById('restartSame').onclick = () => {
            this.startGameWithConfig(this.lastConfig.num, this.lastConfig.difficulty);
        };
        document.getElementById('restartConfig').onclick = () => {
            this.inputsSection.classList.remove('hidden');
            this.difficultyContainer.classList.remove('hidden');
            this.questions.innerHTML = '';
        };
        document.getElementById('finishApp').onclick = () => {
            this.questions.innerHTML = `<h2>¡Gracias por jugar!</h2>`;
        };
    }
}
