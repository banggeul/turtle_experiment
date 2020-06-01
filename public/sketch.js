import store from './utils/storage.js'

const {data} = store.getState();
let experiment = {};
let choices = [];
const set = [0,1,0,0,1,1,0,1,1,1,0,1,1,0,0,0,1,0,0,0,0];
const cardNum = 21;
let activeCard = 0;

const $getUserContext = document.querySelector('#collectUserContext');
const $welcomeScreen = document.querySelector('#user-context')
const $game = document.querySelector('#content');
const $thanks = document.querySelector('.thanks');

experiment.set = set;
$getUserContext.addEventListener('click', getUserContext);

function getUserContext() {
  const userID = document.querySelector('#name').value;
  const timestamp = Date.now();
  experiment.userID = userID;
  experiment.timestamp = timestamp;
  $game.style.display = "none";
  $game.style.opacity = 0;
  setUpCards();
  //fade out the welcome screen and fade in the game screen
  fadeOut($welcomeScreen, true);
  fadeIn($game);
}

function setUpCards(){
  let cards = [];
  for(let i=0; i < cardNum; i++){
    const card = document.createElement('div');
    card.classList.add('card');
    $game.append(card);
    cards.push(card);
    if(i==0){
      card.classList.add('next');
    }
  }

  let i = 0;

  for(let row=0; row < 3; row++){
    for(let col=0; col < 7; col++){
      cards[i].style.top = row*30 + "%";
      cards[i].style.left = col*14 + "%";
      i++;
    }
  }

  const options = document.createElement('div');
  options.innerHTML = `
    <label class="container">Yes
    <input class="choice" type="radio" name="radio" value="1">
    <span class="checkmark"></span>
    </label>
    <label class="container">No
    <input class="choice" type="radio" name="radio" value="0">
    <span class="checkmark"></span>
    </label>
  `;
  document.body.append(options);

  document.querySelectorAll('.choice').forEach(choice =>{
    choice.addEventListener('click', function(){
      fadeOut(options);
      cards[activeCard].classList.add('active');
      choices.push(this.value);
      this.checked = false;
      console.log(choices);
      //reveal card
      setTimeout(revealCard, 500);
    })
  });

  function revealCard() {
    console.log("reveal the card");
    cards[activeCard].classList.remove('active');
    if(set[activeCard]==0){
      cards[activeCard].classList.add('revealed-nofood');
    } else {
      cards[activeCard].classList.add('revealed-food');
    }

    fadeIn(options);

    if(activeCard < cardNum-1){
      activeCard++;
    } else {
      console.log("end of the session, upload the data to the database.")
      // isGameOn = false;
      experiment.choices = choices;
      // console.log(experiment);
      store.dispatch({
          type: choices.length > 0 ? "ADD_DATA" : "REMOVE_DATA",
          payload: { data: experiment }
      });

      choices = [];
      console.log("data logged");
      fadeOut($game, true);
      fadeIn($thanks);
    }
    cards[activeCard].classList.add('next');
  }


  cards.forEach(card=>{
    card.addEventListener('click',function(){
      console.log("reveal the card");
      this.classList.remove('active');

      if(set[activeCard]==0){
        this.classList.add('revealed-nofood');
      } else {
        this.classList.add('revealed-food');
      }
      fadeIn(options);

      if(activeCard < cardNum-1){
        activeCard++;
      } else {
        console.log("end of the session, upload the data to the database.")
        // isGameOn = false;
        experiment.choices = choices;
        // console.log(experiment);
        store.dispatch({
            type: choices.length > 0 ? "ADD_DATA" : "REMOVE_DATA",
            payload: { data: experiment }
        });

        choices = [];
        console.log("data logged");
        fadeOut($game, true);
        fadeIn($thanks);
      }

      cards[activeCard].classList.add('next');
    })
  })
}

function fadeIn(elem){
  elem.style.display = "block";
  elem.style.opacity = 0;
  gsap.to(elem, { duration: 1, ease: "power1.inOut", opacity:1, delay:.5});
}

function fadeOut(elem, hide) {
  // elem.style.display = "none";
  gsap.to(elem, { duration: .5, ease: "power1.inOut", opacity:0, onComplete:hide?hideElem:null, onCompleteParams:[elem]});
}

function hideElem(elem){
  elem.style.display = "none";
  elem.style.pointerEvents = "none";
}
