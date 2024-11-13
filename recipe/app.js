(async function () {
    const apiKey = "e5445aa0d86d4c02973fc471df719b06"; 
    const baseUrl = "https://api.spoonacular.com/recipes/complexSearch";
  
    const inputElem = document.getElementById("searchInput");
    const btnElem = document.getElementById("searchBtn");
    const listElem = document.getElementById("recipe-list");
    const detailsElem = document.getElementById("recipeDetailsContainer");
    const addToFavoritesBtn = document.getElementById("addToFavoritesBtn");
    
    let currentRecipe = null;
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  
    function loadRecipeDetails(recipe) {
      currentRecipe = recipe;
      detailsElem.innerHTML = `
        <h2 class="title">${recipe.title}</h2>
        <img src="${recipe.image}" alt="${recipe.title}" />
        <h3>Ingredients:</h3>
        <ul>${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}</ul>
        <h3>Instructions:</h3>
        <p>${recipe.instructions}</p>
      `;
      addToFavoritesBtn.style.display = "block"; 
    }
  
    function displaySearchResults(results) {
        listElem.innerHTML = "";  
        if (results.length === 0) {
          listElem.innerHTML = "<p>No recipes found. Try another search!</p>";
          return;
        }
        results.forEach(function (recipe) {
          const li = document.createElement("li");
          
          const description = recipe.summary ? recipe.summary : "Нажмите, чтобы узнать больше";
          
          const listItem = `
            <h2 class="title">${recipe.title}</h2>
            <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image" />
            <div class="description">${description}</div>
          `;
          
          li.innerHTML = listItem;
          li.addEventListener("click", function () {
            loadRecipeDetails(recipe);
          });
          
        
          listElem.appendChild(li);
        });
      }
      
  
      function updateFavorites() {
        const favoritesListElem = document.getElementById("favoritesList");
        favoritesListElem.innerHTML = "";
        favorites.forEach(function (recipe) {
          const li = document.createElement("li");
          li.innerHTML = `<span class="favorite-title">${recipe.title}</span>`;
          li.addEventListener("click", function () {
            loadRecipeDetails(recipe); 
          });
          favoritesListElem.appendChild(li);
        });
      }
  
    async function search() {
      const query = inputElem.value.trim();
      if (query === "") return;
  
      try {
        const response = await fetch(`${baseUrl}?apiKey=${apiKey}&query=${query}`);
        const data = await response.json();
  
        if (data.results.length === 0) {
          console.log("No recipes found");
          displaySearchResults([]);
        } else {
          const recipes = data.results.map(recipe => ({
            title: recipe.title,
            description: recipe.summary || 'No description available',
            image: recipe.image,
            id: recipe.id,
            ingredients: [], 
            instructions: "", 
          }));
  
          for (const recipe of recipes) {
            const detailsResponse = await fetch(`https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${apiKey}`);
            const detailsData = await detailsResponse.json();
            recipe.ingredients = detailsData.extendedIngredients.map(ingredient => ingredient.original);
            recipe.instructions = detailsData.instructions || "No instructions available";
          }
  
          displaySearchResults(recipes);
        }
      } catch (error) {
        console.error("Error fetching data from Spoonacular API:", error);
        alert("An error occurred while fetching recipes. Please try again later.");
      }
    }
  
    function addToFavorites() {
        if (currentRecipe && !favorites.find(fav => fav.id === currentRecipe.id)) {
          favorites.push(currentRecipe);
          localStorage.setItem("favorites", JSON.stringify(favorites));
          updateFavorites();
        }
      }
  
    btnElem.addEventListener("click", search);
    addToFavoritesBtn.addEventListener("click", addToFavorites);
  
    updateFavorites();
  })();
  