export function validarCampos(namePlayer, numberQuestions) {
    const name = namePlayer.value.trim();
    const num = parseInt(numberQuestions.value, 10);

    if (name.length < 2 || name.length > 20) {
        alert('Name must be between 2 and 20 characters');
        return false;
    }
    if (isNaN(num) || num < 5 || num > 20) {
        alert('Number of questions must be between 5 and 20');
        return false;
    }
    return true;
}
