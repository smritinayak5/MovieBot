const apiKey = '59557660c9d5955d0dae19ab581d0f70';
let genreId, language, actorName;

document.addEventListener('DOMContentLoaded', () => {
    addBotMessage('Welcome to MovieBot! What genre are you interested in?');
});

function handleUserInput() {
    const userInput = document.getElementById('userInput').value.trim();
    if (userInput) {
        addUserMessage(userInput);
        processUserInput(userInput);
    }
}

function addUserMessage(message) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('user');
    messageContainer.textContent = message;
    document.getElementById('messages').appendChild(messageContainer);
    document.getElementById('userInput').value = '';
}

function addBotMessage(message) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('bot');
    messageContainer.textContent = message;
    document.getElementById('messages').appendChild(messageContainer);
}

async function processUserInput(input) {
    if (!genreId) {
        genreId = await getGenreId(input);
        if (genreId) {
            addBotMessage('What language do you prefer? (You can type "skip" to skip this question)');
        } else {
            addBotMessage('Sorry, I did not recognize that genre. Please try again.');
        }
    } else if (!language) {
        if (input.toLowerCase() === 'skip') {
            language = null;
        } else {
            language = input;
        }
        addBotMessage('Any specific actor you like in this genre? (You can type "skip" to skip this question)');
    } else if (!actorName) {
        if (input.toLowerCase() === 'skip') {
            actorName = null;
        } else {
            actorName = input;
        }
        const movies = await getMovies();
        displayMovies(movies);
    }
}

async function getGenreId(genreName) {
    const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`);
    const data = await response.json();
    const genre = data.genres.find(genre => genre.name.toLowerCase() === genreName.toLowerCase());
    return genre ? genre.id : null;
}

async function getMovies() {
    let url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}`;
    if (language) {
        url += `&language=${language}`;
    }
    if (actorName) {
        const actorId = await getActorId(actorName);
        if (actorId) {
            url += `&with_cast=${actorId}`;
        }
    }
    const response = await fetch(url);
    const data = await response.json();
    return data.results;
}

async function getActorId(actorName) {
    const response = await fetch(`https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${actorName}`);
    const data = await response.json();
    return data.results.length > 0 ? data.results[0].id : null;
}

function displayMovies(movies) {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = '';
    addBotMessage('Here are some movie recommendations:');
    movies.forEach(movie => {
        const movieDiv = document.createElement('div');
        movieDiv.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}" onclick="askPlatform('${movie.id}')">
            <p>${movie.title}</p>
        `;
        messagesDiv.appendChild(movieDiv);
    });
    addBotMessage('Click on a movie poster to select it.');
}

function askPlatform(movieId) {
    const platformDiv = document.createElement('div');
    platformDiv.classList.add('bot');
    platformDiv.innerHTML = `
        <p>Which platform do you want to watch the movie on?</p>
        <button onclick="openPlatform('${movieId}', 'Netflix')">Netflix</button>
        <button onclick="openPlatform('${movieId}', 'Amazon Prime')">Amazon Prime</button>
        <button onclick="openPlatform('${movieId}', 'Disney+')">Disney+</button>
    `;
    document.getElementById('messages').appendChild(platformDiv);
}

function openPlatform(movieId, platform) {
    const platformUrls = {
        'Netflix': `https://www.netflix.com/search?q=${movieId}`,
        'Amazon Prime': `https://www.primevideo.com/offers/nonprimehomepage/ref=dv_web_force_root?k=${movieId}`,
        'Disney+': `https://www.disneyplus.com/search?q=${movieId}`
    };
    window.open(platformUrls[platform], '_blank');
    addBotMessage('Do you want to start over? Click below.');
    const restartButton = document.createElement('div');
    restartButton.classList.add('bot');
    restartButton.textContent = 'Start Over';
    restartButton.onclick = () => location.reload();
    restartButton.innerHTML = `
    <button onclick="() => location.reload();, 'Start Over')">Start Over</button>
    `;
    document.getElementById('messages').appendChild(restartButton);
}
