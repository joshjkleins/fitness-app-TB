// send a fetch request to query db
async function queryEquipmentList() {
    const muscle = document.querySelector('#muscle').textContent
    const equipment = document.querySelector('#equipment').textContent
    const exerciseData = await fetch(`http://localhost:3000/muscle/getExerciseNames?muscle=${muscle}&equipment=${equipment}`)
    const realData = await exerciseData.json()

    const allExercises = document.querySelector('.all-exercises')
    let exerciseHTML = []

    realData.exerciseNames.forEach((i) => {
        const exercise = `
        <li>
        
        ${i} 
        <div class="update-class">
            <button id="update-button">Update ${i}</button>        
            <button id="stop-update">Stop updating ${i}</button>
            <form  method="post" id="update-form" action="/muscle/${muscle}/${equipment}/${i}/update">
                <input type="text" placeholder="Update ${i} here" name="update" required>
                <input type="submit" value="Update ${i}">
            </form> 
        </div>
        <form style='display:inline' id="add-exercise" method='post' action="/muscle/${muscle}/${equipment}/${i}/delete"><input type="submit" value="Delete ${i}"></form>
        
    </li>
        `
        exerciseHTML.push(exercise)
    })
    allExercises.innerHTML = exerciseHTML
    updateButtons()
}
queryEquipmentList()