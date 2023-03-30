function updateButtons() {
    const updateClass = document.querySelectorAll('.update-class')
const updateButtons = document.querySelectorAll('#update-button')
const hideForm = document.querySelectorAll('#update-form')
const stopUpdate = document.querySelectorAll('#stop-update')

updateClass.forEach(function(i, index) {
    i.children[1].style.display = 'none'
    i.children[2].style.display = 'none'
})

// if update button is clicked, hide "update button" and show form and "stop update button"
updateButtons.forEach(function(i, index) {
    const x = index
    i.addEventListener('click', () => {   
        console.log('button was clicked')
        updateButtons[x].style.display = 'none'
        hideForm[x].style.display = 'block'
        stopUpdate[x].style.display = 'block'
    })
})

// // if "stop button is clicked", unhide "update button" and re-hide "stop update" button and form 
stopUpdate.forEach(function(i, index) {  
    const x = index
    i.addEventListener('click', () => {     
        updateButtons[x].style.display = 'block'
        hideForm[x].style.display = 'none'
        stopUpdate[x].style.display = 'none'
    })
})
}

// 1) send a fetch request to query db
async function queryExerciseNames() {
    const muscle = document.querySelector('#muscle').textContent
    const equipment = document.querySelector('#equipment').textContent
    const exerciseData = await fetch(`http://localhost:3000/muscle/getExerciseNames?muscle=${muscle}&equipment=${equipment}`)
    const realData = await exerciseData.json()

    const allExercises = document.querySelector('.all-exercises')
    // const exerciseHTML = `
    //     <span>${realData.exerciseNames[0]}</span>

    // `

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
queryExerciseNames()
// 2) with the data received, update html

