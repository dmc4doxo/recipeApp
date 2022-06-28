// Meal API supplied by themealdb.com at https://www.themealdb.com/api.php
//
const mealsEl = document.getElementById("meals");
const favoriteContainer = document.getElementById("fav-meals");

const searchInput = document.getElementById("search-text");
const searchBtn = document.getElementById("search");

const mealPopup = document.getElementById("meal-popup"); // big group
const popupBtn = document.getElementById("close-popup-btn");
const mealPopupEl = document.getElementById("meal-info");

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/random.php"
  );

  responseData = await resp.json();
  randomMeal = responseData.meals[0];
  // console.log(randomMeal); // this is the same as mealData

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

async function getMealBySearch(term) {
  const searchResponse = await fetch(
    "https://www.themealdb.com/api/json/v1/1/search.php?s=" + term
  );
  const responseData = await searchResponse.json();
  const searchedResults = await responseData.meals; // Why are we appending .meals (what does this do?)

  return searchedResults;
}

// Selecting Meals and adding to the random section.

function addMeal(mealData, random = false) {
  //console.log(mealData); // same as randomMeal
  // const mealNumber = mealData.idMeal;
  const meal = document.createElement("div");
  meal.classList.add("meal");

  // not very secured - opened to code injection. use data attribute.
  meal.innerHTML = `<div class="meal-header">
        ${
          random
            ? `<h3 class="random-meal-name">Random recipe </h3>`
            : `<h3 class="random-meal-name">Search Results </h3>`
        }
            
            <img
            class="random-recipe-img" id="mealImg"
            src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}"
            />
        <div class="random-meal-name-container">
        <h4>${mealData.strMeal}</h4>
    <button class="fav-btn ">
  <i class="fa fa-heart"></i>
     </button>
        </div>
        </div>
      `;
  // Put after h4 above
  // <button class="fav-btn ">
  //<i class="fa fa-heart"></i>
  //  </button>;
  // const mealImgEl = meal.getElementById("mealImg");

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
    fetchFavMeals(); // fetchFavMeals(mealNumber)
  });

  mealsEl.appendChild(meal);

  //********HERE
  // Display popup info -- meal.addEventListener
  //const detailsDiv = createDiv();

  // meal.addEventListener("click", () => {
  //   showMealInfo(mealData);
  // });

  const mealImg = meal.querySelector(".random-recipe-img");
  mealImg.addEventListener("click", () => {
    showMealInfo(mealData);
  });

  // Click on Random or Search Results to reload
  const randomSearchName = meal.querySelector(".random-meal-name");
  randomSearchName.addEventListener("click", () => {
    document.location.reload();
  });
}

//Store meal id
function addMealToLocalStorage(mealId) {
  const mealIds = getMealsFromLocalStorage();
  if (mealIds.length >= 8) {
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
// END of FetchFavMeal
// Need to be added to screen

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

  // ####Button to delete a favorite###### // Made into closure

  const btnLi = favMeal.querySelector(".clear");
  btnLi.addEventListener("click", () => {
    const liToBeRemove = document.getElementById(`${mealData.idMeal}`);
    liToBeRemove.remove(); //delete li -- removeChild()????
    removeMealFromLocalStorage(mealData.idMeal); // remove data from LS
  });
  favoriteContainer.appendChild(favMeal);

  const dishImg = favMeal.querySelector(".dish-img");
  // Popop display meal info used to be: favMeal
  dishImg.addEventListener("click", () => {
    // mealPopup.innerHTML = ``;
    showMealInfo(mealData);
  });
}
// END of addMealtoFav added

// ***** HERE
// function createDiv() {
//   const divNew = document.createElement("div");
//   return divNew;
// }
//  Function to open the popup to show details

function showMealInfo(mealData) {
  //const mealPopupEl = document.getElementById("meal-info");
  mealPopupEl.innerHTML = ""; // clean up

  const mealInfoDetails = document.createElement("div");

  const ingredients = []; // store the ingredient in an array.
  // Clean it in case it
  // Get ingredients
  // ======
  // Note that mealData is an object. so object.property or object["Property"] work
  for (let i = 1; i <= 20; i++) {
    if (mealData["strIngredient" + i]) {
      ingredients.push(
        `${mealData["strIngredient" + i]} : ${mealData["strMeasure" + i]}`
      );
    } else {
      break;
    }
  }

  // =====
  mealInfoDetails.innerHTML = ` `;

  // Need to understand all the ingreedient stuff
  mealInfoDetails.innerHTML = `

        <h2>${mealData.strMeal}</h2>
        <img
          src="${mealData.strMealThumb}"
          alt=""
        />
        <p>${mealData.strInstructions} </p>
        <h3> Ingredients: </h3>
        <h4> Watch it on youtube at : <a href="${
          mealData.strYoutube
        }" target="_blank"> Youtube Link</a></h4>
          <ul>   
          ${ingredients
            .map(
              (ing) => `
            <li>${ing}</li>`
            )
            .join(" ")}
          </ul>       
`;
  mealPopupEl.appendChild(mealInfoDetails);
  // const mealInfoEl = document.getElementById("meal-info"); // we will clear this
  mealPopup.classList.add("show-meal-popup");
}
// END of Show Meal Info?

searchBtn.addEventListener("click", async () => {
  mealsEl.innerHTML = ""; // clear the container
  const search = searchInput.value;
  searchedMeals = await getMealBySearch(search);
  // console.log(searchedMeals);

  if (searchedMeals) {
    // in case search is null.
    searchedMeals.forEach((meal) => {
      addMeal(meal, (random = false));
    });
  }
});

//HERE Close the meal popup window.
popupBtn.addEventListener("click", () => {
  mealPopup.classList.remove("show-meal-popup");
});
