export function validarCampos(namePlayer, numberQuestions) {
    const name = namePlayer.value.trim();
    const num = parseInt(numberQuestions.value, 10);

    if (name.length < 2 || name.length > 20) {
        alert('el nombre debe tener entre 2 y 20 caracteres');
        return false;
    }
    if (isNaN(num) || num < 5 || num > 20) {
        alert('la cantidad de preguntas debe ser entre 5 y 20');
        return false;
    }
    return true;
}
