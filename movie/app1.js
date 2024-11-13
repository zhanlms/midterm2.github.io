const apiKey = "69d884d9fb5c2ef3a7343accf56169d6";
const baseUrl = "https://api.themoviedb.org/3";

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const suggestions = document.getElementById("suggestions");
  const movieList = document.getElementById("movie-list");
  const sortSelect = document.getElementById("sortSelect");
  const watchlistContainer = document.getElementById("watchlistContainer");

  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

  searchInput.addEventListener("input", async () => {
    const query = searchInput.value.trim();
    if (query) {
      const res = await fetch(`${baseUrl}/search/movie?api_key=${apiKey}&query=${query}`);
      const data = await res.json();
      showSuggestions(data.results);
    } else {
      suggestions.innerHTML = "";
      suggestions.style.display = "none";
      fetchMovies('', sortSelect.value);  // Refetch movies when search input is cleared
    }
  });

  sortSelect.addEventListener("change", () => {
    fetchMovies(searchInput.value.trim(), sortSelect.value); // Refetch movies when sort option changes
  });

  function showSuggestions(movies) {
    suggestions.innerHTML = "";
    movies.forEach(movie => {
      const suggestion = document.createElement("div");
      suggestion.textContent = movie.title;
      suggestion.addEventListener("click", () => {
        searchInput.value = movie.title;
        fetchMovies(movie.title, sortSelect.value);
        suggestions.style.display = "none";
      });
      suggestions.appendChild(suggestion);
    });
    suggestions.style.display = "block";
  }

  async function fetchMovies(query, sortBy = 'popularity.desc') {
    let url;
    if (query) {
      url = `${baseUrl}/search/movie?api_key=${apiKey}&query=${query}`;
    } else {
      url = `${baseUrl}/discover/movie?api_key=${apiKey}&sort_by=${sortBy}`;
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (query) {
        sortMovies(data.results, sortBy);
      } else {
        displayMovies(data.results, sortBy);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  }

  function sortMovies(movies, sortBy) {
    switch (sortBy) {
      case 'popularity.desc':
        movies.sort((a, b) => b.popularity - a.popularity);
        break;
      case 'popularity.asc':
        movies.sort((a, b) => a.popularity - b.popularity);
        break;
      case 'release_date.desc':
        movies.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
        break;
      case 'release_date.asc':
        movies.sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
        break;
      case 'vote_average.desc':
        movies.sort((a, b) => b.vote_average - a.vote_average);
        break;
      case 'vote_average.asc':
        movies.sort((a, b) => a.vote_average - b.vote_average);
        break;
      default:
        break;
    }
    displayMovies(movies, sortBy);
  }

  function displayMovies(movies, sortBy) {
    movieList.innerHTML = '';
    if (movies.length === 0) {
      movieList.innerHTML = "<p>No movies found</p>";
      return;
    }

    movies.forEach(movie => {
      const movieElement = document.createElement('div');
      movieElement.classList.add('movie');
      const posterPath = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
        : 'path/to/placeholder-image.jpg';

      movieElement.innerHTML = `
        <img src="${posterPath}" alt="${movie.title}" />
        <h3>${movie.title}</h3>
        <p>Release Date: ${movie.release_date}</p>
        <button data-movie-id="${movie.id}" class="add-to-watchlist">Add to Watchlist</button>
      `;

      const addToWatchlistBtn = movieElement.querySelector(".add-to-watchlist");
      addToWatchlistBtn.addEventListener("click", (e) => {
        e.stopPropagation();  // Prevent click from triggering the movie details function
        addToWatchlist(movie.id);
      });

      movieElement.addEventListener("click", () => showMovieDetails(movie.id));
      movieList.appendChild(movieElement);
    });
  }

  async function showMovieDetails(movieId) {
    try {
      const res = await fetch(`${baseUrl}/movie/${movieId}?api_key=${apiKey}&append_to_response=credits`);
      const movie = await res.json();

      const movieDetailsContainer = document.getElementById("movieDetailsContainer");
      movieDetailsContainer.innerHTML = `
        <button id="closeDetails">Close</button>
        <h2>${movie.title}</h2>
        <p><strong>Synopsis:</strong> ${movie.overview || "No description available."}</p>
        <p><strong>Rating:</strong> ${movie.vote_average || "N/A"}</p>
        <p><strong>Runtime:</strong> ${movie.runtime || "N/A"} minutes</p>
        <h3>Cast & Crew</h3>
        <ul>
          ${movie.credits.cast.slice(0, 5).map(actor => `<li>${actor.name} as ${actor.character}</li>`).join("")}
        </ul>
        <ul>
          ${movie.credits.crew.slice(0, 3).map(member => `<li>${member.name} - ${member.job}</li>`).join("")}
        </ul>
      `;

      document.getElementById("closeDetails").addEventListener("click", closeMovieDetails);

      document.getElementById("movieDetails").style.display = "flex";
    } catch (error) {
      console.error("Error fetching movie details:", error);
    }
  }

  function closeMovieDetails() {
    document.getElementById("movieDetails").style.display = "none";
  }

  function addToWatchlist(movieId) {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    if (!watchlist.includes(movieId)) {
      watchlist.push(movieId);
      localStorage.setItem('watchlist', JSON.stringify(watchlist));
      renderWatchlist();
    }
  }

  async function renderWatchlist() {
    watchlistContainer.innerHTML = '';
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

    if (watchlist.length === 0) {
      watchlistContainer.innerHTML = "<p>Your watchlist is empty</p>";
      return;
    }

    for (const movieId of watchlist) {
      try {
        const res = await fetch(`${baseUrl}/movie/${movieId}?api_key=${apiKey}`);
        const movie = await res.json();

        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.innerHTML = `
          <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
          <h3>${movie.title}</h3>
          <p>Release Date: ${movie.release_date}</p>
        `;

        movieCard.addEventListener('click', () => showMovieDetails(movie.id));
        watchlistContainer.appendChild(movieCard);
      } catch (error) {
        console.error('Error fetching movie details for watchlist:', error);
      }
    }
  }

  fetchMovies('');
  renderWatchlist();
});
