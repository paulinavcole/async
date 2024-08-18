'use strict';

const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');

///////////////////////////////////////

const renderCountry = function (data, className = '') {
  const html = `
  <article class="country ${className}">
    <img class="country__img" src="${data.flag}" />
    <div class="country__data">
      <h3 class="country__name">${data.name}</h3>
      <h4 class="country__region">${data.region}</h4>
      <p class="country__row"><span>👫</span>${(
        +data.population / 1000000
      ).toFixed(1)}M people</p>
      <p class="country__row"><span>🗣️</span>${data.languages[0].name}</p>
      <p class="country__row"><span>💰</span>${data.currencies[0].name}</p>
    </div>
  </article>
  `;
  countriesContainer.insertAdjacentHTML('beforeend', html);
};

const renderError = function (msg) {
  countriesContainer.insertAdjacentText('beforeend', msg); // doesn't create any new html elements, just inserts text
};

// const getCountryandNeighbor = function (country) {
//   //AJAX CALL
//   const request = new XMLHttpRequest(); // old school way
//   request.open(
//     'GET',
//     `https://countries-api-836d.onrender.com/countries/name/${country}`
//   );
//   request.send();

//   request.addEventListener('load', function () {
//     const [data] = JSON.parse(this.responseText); //destructure and parse

//     // Render original country
//     renderCountry(data);

//     // Get neighbor country
//     const neighbor = data.borders?.[0]; // using optional chaining to account for countries without borders

//     if (!neighbor) return;
//     const request2 = new XMLHttpRequest(); // old school way
//     request2.open(
//       'GET',
//       `https://countries-api-836d.onrender.com/countries/alpha/${neighbor}`
//     );
//     request2.send();
//     request2.addEventListener('load', function () {
//       const data2 = JSON.parse(this.responseText);
//       console.log(data2);

//       renderCountry(data2, 'neighbor');
//     });
//   });
// };

// async await is just syntactic sugar over promises. it is only pertinent to consuming promises, the way promises are built doesnt matter
async function whereAmI(lat, long) {
  try {
    const url = `https://geocode.xyz/${lat},${long}?geoit=json`;
    const res = await fetch(url);
    const data = await res.json(); // returns a new promise, so previously this would have to be returned and chain another handler

    // console.log(data);
    // console.log(`You are in ${data.city}, ${data.country}`);
    const country = data.country;

    const resCountry = await fetch(
      `https://countries-api-836d.onrender.com/countries/name/${country}`
    );

    const countryData = await resCountry.json();
    console.log(countryData);

    const renderedCountry = renderCountry(countryData[0]);
  } catch (err) {
    console.log(err);
  }
}

// getCountryandNeighbor('usa');
const getJSON = async function (url, errorMsg = 'Something went wrong') {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${errorMsg} (${res.status})`);
  return await res.json();
};

const getCountryData = function (country) {
  // COUNTRY 1

  getJSON(
    `https://countries-api-836d.onrender.com/countries/name/${country}`,
    'Country not found!'
  )
    .then(data => {
      renderCountry(data[0]);
      const neighbor = data[0].borders[0];

      if (!neighbor) throw new Error('No Neighbor Found!');

      // COUNTRY 2
      return getJSON(
        `https://countries-api-836d.onrender.com/countries/alpha/${neighbor}`,
        'Country not found!'
      );
    })
    .then(data => renderCountry(data, 'neighbor'))
    .catch(err => {
      console.log(err);
      renderError(`Something went wrong! ${err.message}`);
    }) // catch at the end of the chain catches any errors that occur anywhere in the promise chain
    .finally(() => (countriesContainer.style.opacity = 1)); // will show whether the promise is resolved successfuly or not, but only works if catch also returns a promise
};

btn.addEventListener('click', function () {
  getCountryData(whereAmI(19.037, 72.873));
});
