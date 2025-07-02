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
            <h2>Game Over!</h2>
            <p><strong>Player:</strong> ${this.namePlayer.value}</p>
            <p><strong>Total Score:</strong> ${this.score}</p>
            <p><strong>Correct Answers:</strong> ${this.correctCount} / ${total}</p>
            <p><strong>Accuracy:</strong> ${percent}%</p>
            <p><strong>Average time per question:</strong> ${avgTime} seconds</p>
            <div style="margin-top:18px;display:flex;flex-direction:column;gap:10px;">
                <button id="restartSame">Play again (same settings)</button>
                <button id="restartConfig">Change settings</button>
                <button id="finishApp">Finish</button>
            </div>
        `;
        document.getElementById('restartSame').onclick = () => {
            this.startGameWithConfig(this.lastConfig.num, this.lastConfig.difficulty, this.lastConfig.category);
        };
        document.getElementById('restartConfig').onclick = () => {
            this.inputsSection.classList.remove('hidden');
            this.difficultyContainer.classList.remove('hidden');
            this.questions.innerHTML = '';
        };
        document.getElementById('finishApp').onclick = () => {
            this.questions.innerHTML = `<h2>Thank you for playing!</h2>`;
        };
    }
}
