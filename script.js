'use strict';

const body = document.querySelector('body')
const overlay = document.querySelector('.overlay')
const intro = document.querySelector('.introduction')
const introXmark = document.querySelector('.intro-xmark')
const formXmark = document.querySelector('.form-xmark')
const sidebar = document.querySelector('.sidebar')
const itypedT = document.querySelector('.ityped')
const stories = document.querySelector('.stories')
const form = document.querySelector('.form')
const suject = document.querySelector('.form__input--suject')
const message = document.querySelector('.form__input--message')


ityped.init(itypedT, {
  strings: ['applet'],
  typeSpeed: 100,
  backSpeed: 300,
  startDelay: 900,
  showCursor: false,
})

const date = new Date()

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const month = months[date.getMonth()]
const day = date.getDate()

const closeIntro = function () {
  intro.classList.add('intro__hidden')
  overlay.classList.add('intro__hidden')
  suject.focus()
}

const toggleForm = () => form.classList.toggle('hidden')
const toggleHt = () => stories.classList.toggle('height')
toggleForm()

introXmark.addEventListener('click', closeIntro)
formXmark.addEventListener('click', function () {
  toggleForm()
  toggleHt()
})



body.addEventListener('click', function (e) {
  if (e.target.classList.contains('sidebar')) stories.classList.toggle('height')
  if (e.target.classList.contains('overlay')) closeIntro()
})

let map, marker, clickedPosition, currentPosition, storiesInst = [];
const storyObj = {}


if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition(function (position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    currentPosition = [latitude, longitude]

    const id = (Date.now() + '').slice(-10);

    map = new L.Map('map', { drawControl: true, center: new L.LatLng(latitude, longitude), zoom: 13 });
    const drawnItems = L.featureGroup().addTo(map);

    const osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      osm = L.tileLayer(osmUrl, { attribution: osmAttrib }).addTo(map);

    L.control.layers({
      'osm': osm.addTo(map),
      "google": L.tileLayer('http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}', {
        attribution: 'google'
      })
    }, { 'drawlayer': drawnItems }, { position: 'topleft', collapsed: false }).addTo(map);


    stories.classList.add('height')

    map.on('click', function (mapE) {
      const { lat, lng } = mapE.latlng
      clickedPosition = [lat, lng]

      suject.focus()
      toggleHt()
      toggleForm()
    })

    storiesInst.forEach(storyObj => {
      renderMaker(storyObj)
    });
  }, function () {
    alert('Could not get your position');
  })

//Submit form 
form.addEventListener('submit', function (e) {
  e.preventDefault()

  const id = (Date.now() + '').slice(-10);

  //Create a story object
  storyObj.id = id
  storyObj.coords = clickedPosition || currentPosition
  storyObj.suject = suject.value
  storyObj.message = message.value


  renderedStory(storyObj)
  renderMaker(storyObj)


  //Story object push to storiesIntance
  storiesInst.push(storyObj);

  //Stories stalled in LocalStorage
  localStorage.setItem('storyObj', JSON.stringify(storiesInst))

  //Clear input
  suject.value = message.value = '';

  toggleHt()
  toggleForm()
});


//Create marker on clicked position 
const renderMaker = function (storyObj) {
  marker = L.marker(storyObj.coords).addTo(map);
  marker.bindPopup(L.popup({
    maxWidth: 250,
    minWidth: 100,
    autoClose: false,
    closeOnClick: false,
  })).setPopupContent(`${storyObj.suject[0].toUpperCase()}${storyObj.suject.slice(1)}  ${month} ${day}`)
    .openPopup();
}

const renderedStory = function (storyObj) {
  const html = `
    <li class="story" data-id="${storyObj.id}"> 
      <div class="story__topbar"> 
      <div class="story__date">${month} ${day}</div>
        <div class="xmark story__xmark">x</div>
      </div>
      <h2 class="story__title">${storyObj.suject[0].toUpperCase()}${storyObj.suject.slice(1)}</h2>
      <div class="story__details">
        <span class="story__text">${storyObj.message}</span>
      </div>
    </li>
  `
  form.insertAdjacentHTML('afterend', html);
}

const getLocalStorage = function () {
  const data = JSON.parse(localStorage.getItem('storyObj'))
  if (!data) return


  if (data.length > 0) {
    closeIntro()
    form.classList.add('hidden')
  }

  storiesInst = data

  storiesInst.forEach(storyObj => {
    renderedStory(storyObj)
  });
}
getLocalStorage()



stories.addEventListener('click', function (e) {
  const storyEl = e.target.closest('.story');

  //Move story to it's position
  if (storyEl) {
    const story = storiesInst.find(story => story.id === storyEl.dataset.id)
    map.setView(story.coords, 13)

  }

  //Delete a story
  const xmarkEl = e.target.closest('.story__xmark')
  if (xmarkEl) {
    const story = storiesInst.find(story => story.id === storyEl.dataset.id)
    const storyindx = storiesInst.indexOf(story)

    storiesInst.splice(storyindx, 1)

    localStorage.setItem('storyObj', JSON.stringify(storiesInst))
    location.reload();
  }
})

stories.addEventListener('dblclick', function (e) {
  const storyEl = e.target.closest('.story');
  if (!storyEl) return

  const story = storiesInst.find(story => story.id === storyEl.dataset.id)
  const storyIndx = storiesInst.indexOf(story);

  console.log('hello');

  const formHtml = `
    <form class="form edit-form">
      <div class="form__row">
        <input class="form__input form__input--suject edit-subject" value="${story.suject}" required />
      </div>
      <div class="form__row">
        <textarea class="form__input form__input--message edit-message" rows="6" required>${story.message}</textarea>
      </div>

      <button type="submit" class="form__btn">Save</button>
    </form>
  `

  const storyHtml = document.querySelector(`.story[data-id="${story.id}"]`)

  storyHtml.innerHTML = formHtml

  const formEd = document.querySelector('.edit-form')
  const suject = document.querySelector('.edit-subject')
  const message = document.querySelector('.edit-message')

  suject.focus()

  formEd.addEventListener('submit', function (e) {
    e.preventDefault()


    storyObj.id = story.id
    storyObj.day = day
    storyObj.month = month
    storyObj.coords = clickedPosition || currentPosition
    storyObj.suject = suject.value
    storyObj.message = message.value


    const storyE = storiesInst[storyIndx]

    storyE.suject = storyObj.suject
    storyE.message = storyObj.message

    localStorage.setItem('storyObj', JSON.stringify(storiesInst))


    const html = `
        <li class="story" data-id="${storyObj.id}">
          <div class="story__topbar"> 
          <div class="story__date">${month} ${day}</div>
            <div class="xmark">x</div>
          </div>
          <h2 class="story__title">${storyObj.suject[0].toUpperCase()}${storyObj.suject.slice(1)}</h2>
          <div class="story__details">
            <p class="story__text">${storyObj.message}</p>
          </div>
        </li>
      `
    storyHtml.innerHTML = html

    location.reload()
  })
})
