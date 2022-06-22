// Meal API supplied by themealdb.com at https://www.themealdb.com/api.php
//
const meals = document.getElementById("meals");
const favoriteContainer = document.getElementById("fav-meals");

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/random.php"
  );

  // when u fetch u get a promise (response). get the response
  // by json. response (resp) is an object and the first property
  // in that object is the meal [0].

  responseData = await resp.json();

  randomMeal = responseData.meals[0];
  console.log(randomMeal); // this is the same as mealData

  addMeal(randomMeal, (random = true));
}

async function getMealById(id) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
  );

  const responseData = await resp.json();
  const meal = responseData.meals[0];
  return meal;
}

async function getMealBySearch() {
  const mealResult = await fetch(
    "https://www.themealdb.com/api/json/v1/1/search.php?s=" + searchTerm
  );
}

// Selecting Meals and adding to the random section.

function addMeal(mealData, random = false) {
  console.log(mealData); // same as randomMeal
  const mealNumber = mealData.idMeal;
  const meal = document.createElement("div");
  meal.classList.add("meal");

  // not very secured - opened to code injection. use data attribute.
  meal.innerHTML = `<div class="meal-header">
        ${random ? `<h3 class="random-meal-name">Random recipe</h3>` : ""}
            
            <img
            class="random-recipe-img"
            src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}"
            />
        <div class="random-meal-name-container">
        <h4>${mealData.strMeal}</h4>
        <button class="fav-btn "><i class="fa fa-heart"></i></button>
        </div>
        </div>
      `;

  // If random meal is fav (click fav-btn), then add it to LS.
  const fav = meal.querySelector(".fav-btn");

  fav.addEventListener("click", () => {
    if (fav.classList.contains("active")) {
      fav.classList.remove("active");
      removeMealFromLocalStorage(mealData.idMeal);
    } else {
      fav.classList.add("active");
      addMealToLocalStorage(mealData.idMeal);
    }

    // localStorage.clear(); Remove all fav

    // console.log(mealNumber); // TESTING M T. =
    // do fetch the ID.==> push to an array of fav if le length is less than 5... and display the content of that array of the fav list.
    // const arrayOfFav = [];
    // if(arrayOfFav.length < 6){
    //   arrayOfFav.push(mealNumber);
    //  }else{
    // arrayOfFav.shift();  // remove the first or the oldest fav.
    // arrayOfFav.push(mealNumber);
    // }
    // favoriteContainer.innerHTML = ""; No need...???

    fetchFavMeals(); // fetchFavMeals(mealNumber)
  });
  meals.appendChild(meal);
}

//Store meal id
function addMealToLocalStorage(mealId) {
  const mealIds = getMealsFromLocalStorage();
  if (mealIds.length >= 6) {
    mealIds.shift();
    localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
  } else {
    localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
  }
}

// Retrieve meal id
function removeMealFromLocalStorage(mealId) {
  const mealIds = getMealsFromLocalStorage();
  localStorage.setItem(
    "mealIds",
    JSON.stringify(mealIds.filter((id) => id !== mealId))
  );
}

function getMealsFromLocalStorage() {
  //  will get error is null.  So, check it.
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));
  return mealIds === null ? [] : mealIds; //return empty array if null.
}

// Add to favorite - go to GetMealById //
async function fetchFavMeals() {
  // const mealIds = getMealsFromLocalStorage();
  let meal = 0;
  favoriteContainer.innerHTML = "";

  const mealIds = getMealsFromLocalStorage();
  // All meal were stored in LS... read from it by Id.

  for (let i = 0; i < mealIds.length; i++) {
    const mealId = mealIds[i];
    meal = await getMealById(mealId);
    addMealToFav(meal);
    // meal is undefined.
  }
}
// Need to be added to screen

function removeLiFromFav(mealData) {
  // const liToBeRemove = document.getElementById(`${mealData.idMeal}`);

  function removeLi() {
    const liToBeRemove = document.getElementById(`${mealData.idMeal}`);
    liToBeRemove.remove(); //delete li -- removeChild()????
    removeMealFromLocalStorage(mealData.idMeal); // remove data from LS
    // favoriteContainer.removeChild(mealData.idMeal);
  }
  return removeLi;
}

function addMealToFav(mealData) {
  // console.log(mealData); object
  const favMeal = document.createElement("li");
  favMeal.classList.add("fav-meal");
  favMeal.id = `${mealData.idMeal}`; // set id of the li.

  favMeal.innerHTML = `<img
      class="dish-img"
      src="${mealData.strMealThumb}"
      alt="${mealData.strMeal}"
    />
    <h3 class="dish-name">${mealData.strMeal}</h3>
    
    <button class="clear">
    <i class="fas fa-window-close"></i>
  </button>`;

  // ####Button to delete a favorite###### // Closure

  // Modified this to be a closure function... function inside a function.
  // const btnLi = favMeal.querySelector(".clear");
  // btnLi.addEventListener("click", () => {
  //   const favMealId = mealData.idMeal;
  //   removeLiFromFav(favMealId);
  // });

  const btnLi = favMeal.querySelector(".clear");
  const removeFunction = removeLiFromFav(mealData);
  btnLi.addEventListener("click", removeFunction);

  favoriteContainer.appendChild(favMeal);
}
