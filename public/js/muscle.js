function muscleDropdown() {
    document.getElementById("muscleDropdown").classList.toggle("show");
  }

function equipmentDropdown() {
    document.getElementById("equipmentDropdown").classList.toggle("show");
}

async function getAllExercises() {
  const exerciseData = await fetch(`http://localhost:3000/muscle/get-all-exercises`)
  
  const realData = await exerciseData.json()
  const allExercises = realData.listArray
  const allMuscles = realData.muscle
  let allExercisesHTML = ''
  allExercises.forEach(exercise => {
    allExercisesHTML += `<li>${exercise}</li>`
  });

  document.querySelector('#all-exercise-list').innerHTML = allExercisesHTML

  let allMuscleHTML = ''
  allMuscles.forEach(muscle => {
    allMuscleHTML += `<a href='/muscle/musclelist/${muscle}'>${muscle}</a>`
  })
  console.log(allMuscleHTML)
  document.querySelector('#muscleDropdown').innerHTML = allMuscleHTML

}

getAllExercises()

