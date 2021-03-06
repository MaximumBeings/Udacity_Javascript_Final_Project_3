// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
let store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined
  };
  
  let raceInterval = null;
  let countdownInterval = null;
  
  // We need our javascript to wait until the DOM is loaded
  document.addEventListener('DOMContentLoaded', function () {
	onPageLoad();
	setupClickHandlers();
  });
  
  async function onPageLoad() {
	try {
	  getTracks().then(tracks => {
		const html = renderTrackCards(tracks);
		renderAt('#tracks', html);
	  });
  
	  getRacers().then(racers => {
		const html = renderRacerCars(racers);
		renderAt('#racers', html);
	  });
	} catch (error) {
	  console.log('Problem getting tracks and racers ::', error.message);
	  console.error(error);
	}
  }
  
  function setupClickHandlers() {
	document.addEventListener(
	  'click',
	  function (event) {
		const { target } = event;
		const { parentElement } = target;
  
		if (parentElement.matches('.card')) target.parentElement.click();
  
		// Race track form field
		if (target.matches('.card.track')) {
		  handleSelectTrack(target);
		}
  
		// Podracer form field
		if (target.matches('.card.podracer')) {
		  handleSelectPodRacer(target);
		}
  
		// Submit create race form
		if (target.matches('#submit-create-race')) {
		  event.preventDefault();
  
		  // start race
		  handleCreateRace();
		}
  
		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
		  handleAccelerate(target);
		}
	  },
	  false
	);
  }
  
  
  async function delay(ms) {
	try {
	  return await new Promise(resolve => setTimeout(resolve, ms));
	} catch (error) {
	  console.log(error);
	}
  }
  // ^ PROVIDED CODE ^ DO NOT REMOVE
  
  function notifyUserAndRetry(message) {
	alert(`
  The following error occured: "${message}."
  Once you close this box you'll automatically be returned to the home page where you can try again to start a race.
  `);
	return (window.location = '/');
  }
  
  // This async function controls the flow of the race, add the logic and error handling
  // (1) TODO - Get player_id and track_id from the store
	// (1A) const race = TODO - invoke the API call to create the race, then save the result
	// (2) TODO - update the store with the race id
	// (3) render starting UI - Signature - renderRaceStartView(track, racers)
	// The race has been created, now start the countdown; 
	// (4) TODO - call the async function runCountdown - Signature - runCountdown()
	// (5) TODO - call the async function startRace - Signature - startRace(id)
	// (6) TODO - call the async function runRace - Signature - runRace(raceID)

  async function handleCreateRace() {
	// Get player_id and track_id from the store
	
	const { player_id, track_id } = store;
	if (!player_id || !track_id)
	  return alert('You need to select both a racer and a track.');
	const race = await createRace(player_id, track_id);
	
	  store.race_id=race.ID - 1
	

	renderAt('#race', renderRaceStartView(race.Track, race.Cars));
	runCountdown();
	startRace(store.race_id);
	runRace(store.race_id);
  }
  
  function runRace(raceID) {
	return new Promise(resolve => {
	 // TODO - use Javascript's built in setInterval method to get race info every 500ms
	/* 
		TODO - if the race info status property is "in-progress", update the leaderboard by calling:
		renderAt('#leaderBoard', raceProgress(res.positions))
	*/
	/* 
		TODO - if the race info status property is "finished", run the following:
		clearInterval(raceInterval) // to stop the interval from repeating
		renderAt('#race', resultsView(res.positions)) // to render the results view
		reslove(res) // resolve the promise
	*/
	let raceInterval = setInterval(async () => {
	let res = await getRace(raceID);

	if (res.status === 'in-progress') {
		renderAt('#leaderBoard', raceProgress(res.positions));
	} else {
		clearInterval(raceInterval);
		renderAt('#race', resultsView(res.positions)); // to render the results view
		resolve(res); // resolve the promise
	}
	  }, 500);
	}).catch(error => console.log('Problem with runRace function ->', error))
  }
  
  async function runCountdown() {
	try {
	  // wait for the DOM to load
	  await delay(1000);
	  let timer = 3;
  
	  return new Promise(resolve => {
		countdownInterval = setInterval(() => {
		  if (timer === 0) {
			clearInterval(countdownInterval);
			// NOTE - If the countdown is done, clear the interval, resolve the promise, and return
			return resolve();
		  } else {
			// NOTE - Use Javascript's built in setInterval method to count down once per second
			document.getElementById('big-numbers').innerHTML = --timer;
		  }
		}, 1000);
	  });
	} catch (error) {
	  console.log(error);
	}
  }
  
  function handleSelectTrack(target) {
	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected');
	if (selected) {
	  selected.classList.remove('selected');
	}
  
	// add class selected to current target
	target.classList.add('selected');
  
	// NOTE - save the selected track id to the store

	  store.track_id = parseInt(target.id)
	
  }
  
  function handleSelectPodRacer(target) {
	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected');
	if (selected) {
	  selected.classList.remove('selected');
	}
  
	// add class selected to current target
	target.classList.add('selected');
  
	// Save the selected racer to the store

	  store.player_id = parseInt(target.id)
	
  }
  
  function handleAccelerate() {
	// Invoke the API call to accelerate
	accelerate(store.race_id);
  }
  
  // HTML VIEWS ------------------------------------------------
  // Provided code - do not remove
  
  function renderError(error) {
	return `
		  <header class="down">
			  <h1 class="header-title">An Error Occured!</h1>
		  </header>
		  <main>
			  <section>
				  ${error.message}
			  </section>
			  <section>
				  <a class="button center" href="/">Back to Home Page</a>
			  </section>
		  </main>
	  `;
  }
  
  function renderRacerCars(racers) {
	if (!racers.length) {
	  return `
			  <h4>Loading Racers...</4>
		  `;
	}
  
	const results = racers.map(renderRacerCard).join('');
  
	return `
		  <ul id="racers">
			  ${results}
		  </ul>
	  `;
  }
  
  function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer;
  
	return `
		  <li class="card podracer" id="${id}">
			  <h3>${driver_name}</h3>
			  <p>${top_speed}</p>
			  <p>${acceleration}</p>
			  <p>${handling}</p>
		  </li>
	  `;
  }
  
  function renderTrackCards(tracks) {
	if (!tracks.length) {
	  return `
			  <h4>Loading Tracks...</4>
		  `;
	}
  
	const results = tracks.map(renderTrackCard).join('');
  
	return `
		  <ul id="tracks">
			  ${results}
		  </ul>
	  `;
  }
  
  function renderTrackCard(track) {
	const { id, name } = track;
  
	return `
		  <li id="${id}" class="card track">
			  <h3 class="track-name">${name}</h3>
		  </li>
	  `;
  }
  
  function renderCountdown(count) {
	return `
		  <h2>Race Starts In...</h2>
		  <p id="big-numbers">${count}</p>
	  `;
  }
  
  function renderRaceStartView(track, racers) {
	return `
		  <header>
			  <h1 class="header-title">Race: ${track.name}</h1>
		  </header>
		  <main id="two-columns">
			  <section id="leaderBoard">
				  ${renderCountdown(3)}
			  </section>
			  <section id="accelerate">
				  <h2>Directions</h2>
				  <p>Click the button as fast as you can to make your racer go faster!</p>
				  <button id="gas-peddle">Click Me To Win!</button>
			  </section>
		  </main>
		  <footer></footer>
	  `;
  }
  
  function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position ? 1 : -1));
  
	return `
		  <header>
			  <h1 class="header-title">Race Results</h1>
		  </header>
		  <main>
			  ${raceProgress(positions)}
			  <a href="/race">Start a new race</a>
		  </main>
	  `;
  }
  
  function raceProgress(positions) {
	let userPlayer = positions.find(e => e.id === store.player_id);
  
	if (!userPlayer) {
	  clearInterval(countdownInterval);
	  clearInterval(raceInterval);
	  renderAt('#race', renderError({ message: 'player not found!' }));
	  return;
	}
  
	userPlayer.driver_name += ' (you)';
	positions = positions.sort((a, b) => (a.segment > b.segment ? -1 : 1));
  
	let count = 1;
  
	const results = () =>
	  positions.map(p => {
		return `
			  <tr>
				  <td>
					  <h3>${count++} - ${p.driver_name}</h3>
				  </td>
			  </tr>
		  `;
	  });
  
	return `
		  <main>
			  <h3>Leaderboard</h3>
			  <section id="leaderBoard">
				  ${results()}
			  </section>
		  </main>
	  `;
  }
  
  function renderAt(element, html) {
	const node = document.querySelector(element);
	node.innerHTML = html;
  }
  
  // API CALLS ------------------------------------------------
  
  
const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

// TODO - Make a fetch call (with error handling!) to each of the following API endpoints 

function getTracks() {
	// GET request to `${SERVER}/api/tracks`
    return fetch(`${SERVER}/api/tracks`, {
		method: 'GET',
		...defaultFetchOpts(),
	})
	.then(res => res.json())
	//.then(res => console.log(res))
	.catch(err => console.log("Problem with getTracks request::", err))
}



function getRacers() {
	// GET request to `${SERVER}/api/cars`
	return fetch(`${SERVER}/api/cars`, {
		method: 'GET',
		...defaultFetchOpts(),
	})
	.then(res => res.json())
	//.then(res => console.log(res))
	.catch(err => console.log("Problem with getRacers request::", err))
}



function createRace(player_id, track_id) {
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = { player_id, track_id }
	
	return fetch(`${SERVER}/api/races`, {
		method: 'POST',
		...defaultFetchOpts(),
		dataType: 'jsonp',
		body: JSON.stringify(body)
	})
	.then(res => res.json())
	.catch(err => console.log("Problem with createRace request::", err))
}



function getRace(id) {
	// GET request to `${SERVER}/api/races/${id}`
	return fetch(`${SERVER}/api/races/${id}`, {
		method: 'GET',
		...defaultFetchOpts(),
	})
	.then(res => res.json())
	.catch(err => console.log("Problem with getRace request::", err))
}



function startRace(id) {
	return fetch(`${SERVER}/api/races/${id}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
	.then(res => res.json())
	//.then(res => console.log(res))
	.catch(err => console.log("Problem with startRace request::", err))
}



function accelerate(id) {
	// POST request to `${SERVER}/api/races/${id}/accelerate`
	// options parameter provided as defaultFetchOpts
	// no body or datatype needed for this request
	return fetch(`${SERVER}/api/races/${id}/accelerate`, {
		method: 'POST',
		...defaultFetchOpts()
	})
	.then(res => res.json())
	.catch(err => console.log("Problem with accelerate request::", err))
}

