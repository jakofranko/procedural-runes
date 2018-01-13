// Procedural grid-based writing.
// SENTENCES are made up of WORDS are made up of LETTERS
// LETTERS are grids of dots, which are connected to each other by random lines

class Runes {
    constructor(options) {
        // Options
        const defaults = {
            el: document.getElementById("sheet"),
            height: 500,
            width: 1000,
            padding: 100,
            sentences: 6,
            words: [3, 10],
            letters: [2, 10],
            points: [[0, 0], [10, 0], [20, 0], [0, 10], [10, 10], [20, 30]], // This defines the 'grid' for each letter, where [0, 0] is the top left corner
            variance: 1,
            letterWidth: 20,
            letterHeight: 20,
            wordSpacing: 40,
            lineFeed: 50,
        };

        Object.assign(this, defaults, options);

        this.finished = false;
        this.finishedParagraph = false;
        this.m_words = 0;
        this.m_letters = 0;
        this.cursor_x = this.padding;
        this.cursor_y = this.padding;
    }

    static random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min; // min and max are both inclusive
    }

    init() {
        const dark = `${Runes.random(100, 255)}, ${Runes.random(100, 255)}, ${Runes.random(100, 255)}`;
        const light = `${Runes.random(0, 40)}, ${Runes.random(0, 40)}, ${Runes.random(0, 40)}`;
        const colorScheme = Math.random() < 0.5;
        const lineWidth = 1;   // Weight (in pixels) of the writing

        let ctx = this.el.getContext('2d');

        this.el.width = this.width;
        this.el.height = this.height;
        this.el.style.backgroundColor = colorScheme ? `rgb(${light})` : `rgb(${dark})`;
        document.body.style.backgroundColor = colorScheme ? `rgb(${light})` : `rgb(${dark})`;

        ctx.strokeStyle = colorScheme ? `rgb(${dark})` : `rgb(${light})`;
        ctx.lineWidth = this.lineWidth;
    }

    draw() {
        while(!this.finishedParagraph) this.addSentence();
    }

    addSentence() {
        if(this.sentences <= 0)
            this.finishedParagraph = true;

        if(!this.finishedSentence) {
            this.addWord();
        } else {
            this.sentences -= 1;
            this.finishedSentence = false;
            this.m_words = Runes.random(this.words[0], this.words[1]);
            this.cursor_x += this.wordSpacing;
            this.addWord();
        }
    }

    addWord() {
        this.m_letters = Runes.random(this.letters[0], this.letters[1]);

        if(this.m_words > 0)
            this.m_words--;
        else if(this.m_words == 0)
            this.finishedSentence = true;

      for(let i = 0, l = this.m_letters; i < l; i ++) {

        if(this.cursor_x + (this.letterWidth * this.m_letters) >= this.width - this.padding) {
          this.cursor_x = this.padding;
          this.cursor_y += this.lineFeed; // Line feed
        }

        if(this.cursor_y <= this.height - this.padding - this.letterHeight) {
          this.addLetter();
        } else {
          this.finishedParagraph = true;
          return;
        }
      }

      this.cursor_x += this.letterWidth;
    }

    addLetter() {
        let ctx = this.el.getContext('2d');

        let p = this.points.map(point => point.slice()); // so that we can manipulate the point grid for just this letter

        if(Math.random() < 0.1)
            p[3][1] *= 3;

        for(let i = 0, l = Runes.random(2, 4); i < l; i ++) {
            let firstPoint = Runes.random(0, p.length - 1);
            let secondPoint = Runes.random(0, p.length - 1);
            let thirdPoint = Runes.random(0, p.length - 1);

            while(firstPoint == secondPoint || secondPoint == thirdPoint || secondPoint >= p.length || secondPoint < 0) { // Reroll if duplicate
                if(secondPoint >= p.length)
                    secondPoint--;
                else if(secondPoint < 0)
                    secondPoint++;
                else
                    Math.random() > 0.5 ? secondPoint++ : secondPoint--;
            }

            if(!p[secondPoint])
                debugger;

            const x1 = p[firstPoint][0] + this.cursor_x + Runes.random(-this.variance, this.variance);
            const y1 = p[firstPoint][1] + this.cursor_y + Runes.random(-this.variance, this.variance);
            const x2 = p[secondPoint][0] + this.cursor_x + Runes.random(-this.variance, this.variance);
            const y2 = p[secondPoint][1] + this.cursor_y + Runes.random(-this.variance, this.variance);
            const x3 = p[thirdPoint][0] + this.cursor_x + Runes.random(-this.variance, this.variance);
            const y3 = p[thirdPoint][1] + this.cursor_y + Runes.random(-this.variance, this.variance);

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

        this.cursor_x += this.letterWidth;
    }
}
