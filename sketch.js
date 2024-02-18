var coordinationTest = false; //will check if we are doing the coordination test
var reactionTest = false; //will check if we are doing the reaction test
let targetX, targetY; //will get the positioning of the target for the coordination test
let targetSize = 50; // Assuming target size
let score = 0;
let timer = 30; // seconds
let timerInterval;
let gameover = false;
let highestScore = localStorage.getItem('highestScore') ? parseInt(localStorage.getItem('highestScore')) : 0; // gets the high score from local storage

var numIterationsReactionTest = 0; //sets variable holding how many of the "reaction tests" have been done so far; total 5
var timePerIteration = new Array(0, 0, 0, 0, 0); //each value in the array holds the time for each reaction test in milliseconds
var globalReactionStartTime = 0; //we calculate how much time the user takes in the reaction test by comparing global current time to this time
var isRed = false; //checks if the reaction test shows a red space; meaning the screen can now be clicked.
var waitUntilClickReaction = false; //basically after each mini-reaction test, the app won't move automatically to the next test and will wait for the client's input.
var averageReactionTime = 0;


function setup() 
{
  createCanvas(windowWidth, windowHeight);
  //setting up a blue background.
  background(50, 100, 200);

  document.body.style.margin = '0';
  document.body.style.padding = '0';
  //here, need to subtract by targetSize because otherwise, the object might clip into the right border of the screen.
  targetX = random(width - targetSize);
  //here, we make sure that the target can only spawn on the bottom half of the screen; this way, it won't intersect any of hte text
  targetY = random(height/2, height - targetSize);
  timerInterval = setInterval(countdown, 1000);
  //here, we set all text related to coordination test to be non visible
  document.getElementById('CoordinationScore').hidden = true;
  document.getElementById('CoordinationTime').hidden = true;
  document.getElementById('CoordinationHighScore').hidden = true;
  document.getElementById('CoordinationTutorial').hidden = true;
  document.getElementById('CoordinationGameOver').hidden = true;
  document.getElementById('CoordinationFunFact').hidden = true;
  document.getElementById('CoordinationReturn').hidden = true;
  //here, we set all text related to the reaction test to be non visible
  document.getElementById('ReactionTime').hidden = true;
  document.getElementById('ReactionTutorial').hidden = true;
  document.getElementById('ReactionTestNum').hidden = true;
  document.getElementById('ReactionAverage').hidden = true;
}
function draw() 
{
  //this event will basically occur whenever the "r" key is
  //pressed no matter where in the code the current line is, so
  //we've moved it to the front of the draw function, and use
  //if statements to separate the multiple possibilities.
  document.addEventListener('keydown', (event)=> 
  {
    if(event.key == 'r')
    {
      //here, we will only go back from the reaction test if we're currently on that test and have already finished the 5 tests, as shown by the "numIterationsReactionTest + 1 == 5" part
      if(numIterationsReactionTest + 1 == 5 && waitUntilClickReaction && reactionTest)
      {
        reactionTest = false;
        //hide the text for the reaction test
        document.getElementById('ReactionTime').hidden = true;
        document.getElementById('ReactionTutorial').hidden = true;
        document.getElementById('ReactionTestNum').hidden = true;
        document.getElementById('ReactionAverage').hidden = true;
      }
      //here, only go back from coordination test if we've finished one round of it.
      if(coordinationTest && gameover)
      {
        coordinationTest = false;
        document.getElementById('CoordinationScore').hidden = true;
        document.getElementById('CoordinationTime').hidden = true;
        document.getElementById('CoordinationHighScore').hidden = true;
        document.getElementById('CoordinationTutorial').hidden = true;
        document.getElementById('CoordinationGameOver').hidden = true;
        document.getElementById('CoordinationFunFact').hidden = true;
        document.getElementById('CoordinationReturn').hidden = true;
        resetCoordination();
      }
    }
  });
  //this way, we know we're in the main menu
  if(coordinationTest == false && reactionTest == false)
  {
    //set to blue background
    background(50, 100, 200);
    //make the menu buttons visible.
    document.getElementById('CoordinationButton').hidden = false;
    document.getElementById('ReactionButton').hidden = false;
    document.getElementById('TitleButton').hidden = false;
    const coordinationButton = document.getElementById("CoordinationButton");
    coordinationButton.addEventListener("click", function()
    { 
      //if the button is clicked, it will load the coordination test, and make
      //all the text available for it
      coordinationTest = true; 
      document.getElementById('CoordinationButton').hidden = true;
      document.getElementById('ReactionButton').hidden = true;
      document.getElementById('TitleButton').hidden = true;
      document.getElementById('CoordinationScore').hidden = false;
      document.getElementById('CoordinationTime').hidden = false;
      document.getElementById('CoordinationHighScore').hidden = false;
      document.getElementById('CoordinationTutorial').hidden = false;
      resetCoordination();
    })
    const reactionButton = document.getElementById("ReactionButton");
    reactionButton.addEventListener("click", function()
    { 
      //if the button is clicked, it will load the reaction test, and make
      //all the text available for it
      reactionTest = true; 
      document.getElementById('CoordinationButton').hidden = true;
      document.getElementById('ReactionButton').hidden = true;
      document.getElementById('TitleButton').hidden = true;
      document.getElementById('ReactionTutorial').hidden = false;
      document.getElementById('ReactionTestNum').hidden = false;
      fullResetReactionTime();
    })
  }
  else if(coordinationTest == true)
  {
    //gray background
    background(220);
    //if the game continues, we continue to display background, score/timer, and target.
    if(gameover == false)
    {
      displayScoreAndTimer();
      drawTarget();
    }
  }
  else if(reactionTest == true)
  {
    //basically, for the reaction time, for a couple seconds the green screen will be shown, but the client must wait until the red screen pops up. This code determines when it's time to switch from the green to red screen, and does that process.
    if(!isRed && timer + globalReactionStartTime <= Date.now() && !waitUntilClickReaction)
    {
        background(255, 0, 0);
        globalReactionStartTime = Date.now();
        isRed = true;
        timer = 0;
    }
  }
}
//continually update text to show current time, score, and high score
function displayScoreAndTimer() 
{
  document.getElementById('CoordinationScore').innerHTML = "Score: " + score;
  document.getElementById('CoordinationTime').innerHTML = "Time Left: " + timer;
  document.getElementById('CoordinationHighScore').innerHTML = "Highest Score: " + highestScore;
}

//draw target for the coordination training
function drawTarget() 
{
  fill(255, 0, 0);
  if(coordinationTest == true)
  {
    targetSize = 50;
  }
  //basically, this ensures that the target won't be visible whenever the app is not on the coordination training
  else
  {
    targetSize = 0;
  }
  ellipse(targetX, targetY, targetSize);
}

function countdown() 
{
  //only changes timer if we're currently on coordination training
  if(coordinationTest == true)
  {
    if (timer > 0) 
    {
      timer--;
    }
    else 
    {
      //if the timer has stopped, move into the end phase
      gameover = true;
      clearInterval(timerInterval);
      updateHighestScore();
      displayRandomFact();
      document.getElementById('CoordinationGameOver').hidden = false;
      document.getElementById('CoordinationReturn').hidden = false;
    } 
  }
}

function mousePressed() 
{
  //check if target was clicked for coordination training
  if(coordinationTest)
  {
    let d = dist(mouseX, mouseY, targetX, targetY);
    if (d < targetSize / 2) 
    {
      score++;
      targetX = random(width - targetSize*2);
      targetY = random(height/2, height - targetSize);
    }
    return;
  }
  //checks if a mini-sample of the reaction test has been done, and the player has inputted
  //a click signifying that it's time for the next test.
  if(reactionTest == true && waitUntilClickReaction == true && numIterationsReactionTest + 1 < 5)
  {
    waitUntilClickReaction = false;
    numIterationsReactionTest++;
    resetReactionTime();
    return;
  }
  //basically, this runs when the client clicks on the red square.
  if(reactionTest == true && isRed == true && waitUntilClickReaction == false)
  {
    timePerIteration[numIterationsReactionTest] = Date.now() - globalReactionStartTime;
    isRed = false;
    //checks if this is the last iteration or not
    if(numIterationsReactionTest + 1 < 5)
    {
      document.getElementById('ReactionTime').hidden = false;
      document.getElementById('ReactionTime').innerHTML = "Reaction Time (ms): " + (timePerIteration[numIterationsReactionTest]);
      document.getElementById('ReactionTutorial').innerHTML = "Click Again To Continue To The Next Test!";
    }
    //if it is the last iteration, do this:
    else
    {
      document.getElementById('ReactionTime').hidden = false;
      //take average of all the times
      for(var i = 0; i < 5; i++)
      {
        averageReactionTime+= timePerIteration[i];
      }
      averageReactionTime /= 5;
      document.getElementById('ReactionAverage').hidden = false;
      document.getElementById('ReactionAverage').innerHTML = "Average Reaction Speed (ms): " + averageReactionTime;
      document.getElementById('ReactionTutorial').innerHTML = "Double Click To Redo, Or press r to exit!";
    }
    waitUntilClickReaction = true;
    return;
  }
  //checks if the client selected the green box before the red popped up
    if(reactionTest == true && isRed == false)
    {
      //has a time penalty for selecting too early  
        timePerIteration[numIterationsReactionTest] = 9999;
        isRed = true;
        waitUntilClickReaction = true;
        background(255, 0, 0);
        //in case this is the last iteration, we want to print out some more things, 
        //specifically average reaction speed.
        if(numIterationsReactionTest + 1 == 5)
        {
           document.getElementById('ReactionTime').hidden = false;
           for(var i = 0; i < 5; i++)
           {
              averageReactionTime+= timePerIteration[i];
           }
           averageReactionTime /= 5;
           document.getElementById('ReactionAverage').hidden = false;
           document.getElementById('ReactionAverage').innerHTML = "Average Reaction Speed (ms): " + averageReactionTime;
           document.getElementById('ReactionTutorial').innerHTML = "Double Click To Redo, Or press r to exit!";
        }
        else
        {
          document.getElementById('ReactionTime').hidden = false;
          document.getElementById('ReactionTime').innerHTML = "Reaction Time (ms): " + 9999;
          document.getElementById('ReactionTutorial').innerHTML = "Don't Click On The Green!";
          globalReactionStartTime = Date.now();
          timer = 0;
        }
        return;
    }
}

function doubleClicked() 
{
  //if double clicked on the coordination test, restarts it
  if (gameover && coordinationTest) 
  {
    resetCoordination();
  }
  //if double clicked on reaction test, restarts is
  if (numIterationsReactionTest + 1 == 5 && reactionTest && waitUntilClickReaction) 
  {
    fullResetReactionTime();
  }
}

//reset the coordination training to its starting position
function resetCoordination() 
{
  score = 0;
  timer = 30;
  gameover = false;
  clearInterval(timerInterval);
  timerInterval = setInterval(countdown, 1000);
  document.getElementById('CoordinationFunFact').hidden = true;
  document.getElementById('CoordinationGameOver').hidden = true;
  document.getElementById('CoordinationReturn').hidden = true;
}


function updateHighestScore() 
{
  if (score > highestScore) 
  {
    highestScore = score;
    localStorage.setItem('highestScore', highestScore);
  }
}

function displayRandomFact() 
{
  let randomIndex = floor(random(funFacts.length));
  let fact = funFacts[randomIndex];
  document.getElementById('CoordinationFunFact').innerHTML = "Fun fact: " + fact;
  document.getElementById('CoordinationFunFact').hidden = false;
}

function resetReactionTime()
{
  background(0, 255, 0);
  //sets random time for when green background becomes red.
  timer = random(2500, 4500);
  globalReactionStartTime = Date.now();
  document.getElementById('ReactionTime').hidden = true;
  document.getElementById('ReactionTestNum').hidden = false;
  document.getElementById('ReactionTestNum').innerHTML = "Test Number: " + (numIterationsReactionTest + 1);
  document.getElementById('ReactionTutorial').innerHTML = "Click When The Color Changes To Red!";
  isRed = false;
  document.getElementById('ReactionAverage').hidden = true;
  waitUntilClickReaction = false;
}

//difference between this and the above function is that this function resets the values only after all 5 mini-tests are done, while the above function resets values after every mini-test
function fullResetReactionTime() 
{
  numIterationsReactionTest = 0;
  averageReactionTime = 0;
  for(var i = 0;i < 5; i++)
  {
    timePerIteration[i] = 0;
  }
  resetReactionTime();
}
const funFacts = 
[
  "Home healthcare can help patients recover from surgery or manage chronic conditions from the comfort of their own homes.",
  "Home healthcare services can include nursing care, physical therapy, occupational therapy, and more.",
  "Many patients prefer home healthcare because it allows them to maintain their independence and privacy.",
  "Home healthcare providers can offer personalized care plans tailored to each patient's needs and preferences.",
  "Home healthcare can reduce the need for hospital readmissions and emergency room visits.",
  "Home healthcare can be more cost-effective than long-term hospital stays or nursing home care.",
  "Advancements in technology have made it easier for home healthcare providers to monitor patients remotely and deliver care efficiently.",
  "Family caregivers play a crucial role in supporting patients receiving home healthcare.",
  "Home healthcare allows patients to receive care in a familiar and comfortable environment, which can promote healing and well-being."
];