// Procedural grid-based writing.
// SENTENCES are made up of WORDS are made up of LETTERS
// LETTERS are grids of dots, which are connected to each other by random lines

// Editable Variables
let sentences = 6;      // Number of sentences to write (only affects up until the end of the canvas; vertical overflow is cut off)
const words = [3, 10];    // {min, max] no. of words per line
const letters = [2, 10];  // {min, max] no. of letters per word

const background = 29;    // RGB value of the background
const strokeStyle = 220;       // RGB value of the writing
const lineWidth = 1;   // Weight (in pixels) of the writing

const points = [[0, 0], [10, 0], [20, 0], [0, 10], [10, 10], [20, 30]]; // This defines the 'grid' for each letter, where [0, 0] is the top left corner
const variance = 1; // How far line start/end points should deviate from the grid

const letterWidth = 20; // Left of one letter → left of the next
const letterHeight = 20; // Affects last line overflow; if unclear just set it to the highest y-value in points[][];
const wordSpacing = 40; // Space to insert between words
const lineFeed = 50; // Bottom of one line to bottom of the next. Adobe apps call this 'leading' but they shouldn't.

const height = 500;
const width = 1000;
const padding = 100; // Page margins

// System Variables
let finished = false;
let finishedParagraph = false;
let m_words = 0;
let m_letters = 0;
let cursor_x = padding;
let cursor_y = padding;

// Utilities
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min; // min and max are both inclusive
}

// Setup
function setup() {
  let canvas = document.getElementById("sheet");
  canvas.width = width;
  canvas.height = height;
  canvas.style.backgroundColor = `rgb(0, ${background}, 0)`;
}

function draw() {
  while(!finishedParagraph) {
    AddSentence();
  }
}

function AddSentence() {
  if(sentences <= 0) {
    finishedParagraph = true;
  }

  if(!finished) {
    AddWord();
  } else {
    sentences -= 1;
    finished = false;
    m_words = random(words[0], words[1]);
    cursor_x += wordSpacing;
    AddWord();
  }
}

function AddWord() {
  m_letters = random(letters[0], letters[1]);

  if(m_words > 0) {
    m_words--;
  } else if(m_words == 0) {
    finished = true;
  }

  for(let i = 0, l = m_letters; i < l; i ++) {

    if(cursor_x + (letterWidth * m_letters) >= width - padding) {
      cursor_x = padding;
      cursor_y += lineFeed; // Line feed
    }

    if(cursor_y <= height - padding - letterHeight) {
      AddLetter();
    } else {
      finishedParagraph = true;
      return;
    }
  }

  cursor_x += letterWidth;
}

function AddLetter() {
  const canvas = document.getElementById("sheet");
  let ctx = canvas.getContext('2d');
  ctx.strokeStyle = `rgb(0, ${strokeStyle}, 0)`;
  ctx.lineWidth = lineWidth;

  let p = points.map(point => point.slice()); // so that we can manipulate the point grid for just this letter

  if(Math.random() < 0.1) {
    p[3][1] *= 3;
  }

  for(let i = 0, l = random(2, 4); i < l; i ++) {
    let firstPoint = random(0, p.length - 1);
    let secondPoint = random(0, p.length - 1);
    let thirdPoint = random(0, p.length - 1);

    while(firstPoint == secondPoint || secondPoint == thirdPoint || secondPoint >= p.length || secondPoint < 0) { // Reroll if duplicate
      if(secondPoint >= p.length) {
        secondPoint--;
    } else if(secondPoint < 0) {
        secondPoint++;
    } else {
        Math.random() > 0.5 ? secondPoint++ : secondPoint--;
      }
    }

    if(!p[secondPoint])
        debugger;

    const x1 = p[firstPoint][0] + cursor_x + random(-variance, variance);
    const y1 = p[firstPoint][1] + cursor_y + random(-variance, variance);
    const x2 = p[secondPoint][0] + cursor_x + random(-variance, variance);
    const y2 = p[secondPoint][1] + cursor_y + random(-variance, variance);
    const x3 = p[thirdPoint][0] + cursor_x + random(-variance, variance);
    const y3 = p[thirdPoint][1] + cursor_y + random(-variance, variance);

    if(Math.random() < 0.4) { // Draw a linear connection 40% of the time
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.closePath();
    } else { // Draw a curved connection 60% of the time
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(x1, y1, x3, y3, x2, y2);
      ctx.stroke();
      ctx.closePath();
    }
  }

  cursor_x += letterWidth;
}
