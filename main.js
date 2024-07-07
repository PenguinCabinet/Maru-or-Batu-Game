
const Game_Time = 30;

class UI_text {
    constructor(text, text_func) {
        this.text = text;
        this.text_func = text_func;
    }

    My_Update() {
        this.text.text = this.text_func();
    }
}


class GameMain extends Phaser.Scene {
    constructor() {
        super({ key: 'GameMain', active: false });
    }

    preload() {
        this.load.image('red', 'https://labs.phaser.io/assets/particles/red.png');
        this.load.audio("wrong_ans", "assets/wrong_ans.mp3");
        this.load.audio("correct_answer", "assets/correct_answer.mp3");
    }

    bool_to_str(v) {
        return v ? "O" : "X"
    }

    make_problem() {
        this.state.problem_ans = Boolean(Math.floor(Math.random() * 2));
        this.left_text.text = this.bool_to_str(this.state.problem_ans);
        this.right_text.text = this.bool_to_str(!this.state.problem_ans);

        this.wrong_ans_se = this.sound.add("wrong_ans");
        this.correct_answer_se = this.sound.add("correct_answer");
    }

    user_input(p) {
        this.state.input_wait = true;
        let user_ans = (p.x <= config.width / 2);
        if (user_ans == this.state.problem_ans) {
            let temp = this.add.particles(p.x, p.y, 'red', {
                speed: 100,
                scale: { start: 1, end: 0 },
                timeScale: 3,
                lifespan: 500,
            });;
            setTimeout(() => { temp.stop(true); }, 500);

            this.correct_answer_se.play();

            this.state.correct_answer_score++;
            this.correct_answer();
            this.make_problem();
        } else {
            this.wrong_ans_se.play();

            this.state.wrong_answer_score++;
            this.wrong_ans();
        }
        this.state.input_wait = false;
    }

    create() {
        this.state = {};
        this.state.score = 0;
        this.state.correct_answer_score = 0;
        this.state.wrong_answer_score = 0;
        this.state.game_time = Game_Time;
        this.state.start_time = new Date();

        this.left_text = this.add.text(0, 0, 'O', {
            fontSize: '700px'
        });
        this.right_text = this.add.text(400, 0, 'X', {
            fontSize: '700px'
        });

        this.score_UI = new UI_text(
            this.add.text(0, 0, "", {
                fontSize: '30px'
            }),
            () => `スコア:${this.state.score}`
        );

        this.time_UI = new UI_text(
            this.add.text(500, 0, "", {
                fontSize: '30px'
            }),
            () => `残り時間:${(() => {
                var now_time = new Date();
                let game_time = (now_time.getTime() - this.state.start_time.getTime()) / 1000;
                this.state.game_time = Game_Time - game_time;
                return Math.floor(this.state.game_time);
            })()}s`
        );

        this.make_problem();

        this.input.on('pointerup', (p) => { this.user_input(p); });
        this.input.keyboard.on('keydown-LEFT', () => {
            this.user_input({ x: config.width / 4, y: config.height / 2 })
        });
        this.input.keyboard.on('keydown-RIGHT', () => {
            this.user_input({ x: config.width / 4 * 3, y: config.height / 2 })
        });
    }

    wrong_ans() {
        this.state.score -= 200;
    }

    correct_answer() {
        this.state.score += 100;
    }

    update() {


        if (this.state.game_time < 0) {
            this.scene.start("GameEnd", {
                "score": this.state.score,
                "correct_answer_score": this.state.correct_answer_score,
                "wrong_answer_score": this.state.wrong_answer_score,
            });
        }

        this.score_UI.My_Update();
        this.time_UI.My_Update();

    }
}

class GameTitle extends Phaser.Scene {
    constructor() {
        super({ key: 'GameTitle', active: true });
    }

    init({ score }) {
        this.score = score;
    }

    preload() {
    }
    create() {
        this.state = {};

        this.text1 = this.add.text(200, 100, `O or Xゲーム`, {
            fontSize: '60px'
        });

        this.start_button = this.add.text(250, 400, `スタート`, {
            fontSize: '30px'
        });
        this.add.rectangle(250, 400, 120, 30).on('pointerup', () => {
            this.scene.start("GameMain");
        })
            .setOrigin(0, 0)
            .setInteractive({ useHandCursor: true });

        this.text2 = this.add.text(0, 570, `使用素材: フリー効果音素材 くらげ工匠`, {
            fontSize: '12px'
        });
    }

    update() {
    }
}

function score_to_rank(score) {
    const ranks = {
        "十級": 0,
        "九級": 200,
        "八級": 500,
        "七級": 1000,
        "六級": 2000,
        "五級": 3000,
        "四級": 4000,
        "三級": 5000,
        "二級": 5500,
        "一級": 6000,
        "初段": 6500,
        "二段": 7000,
        "三段": 7500,
        "四段": 8000,
        "五段": 9000,
        "六段": 10000,
        "七段": 11000,
        "八段": 12000,
        "九段": 13000,
        "十段": 14000,
    }

    const key = Object.keys(ranks)
        .filter((k) => ranks[k] > score)
        .sort((a, b) => ranks[a] - ranks[b])
        .reduce((a, b) => {
            if (ranks[a] >= ranks[b]) {
                return b;
            } else {
                return a;
            }
        });

    return key;
}


class GameEnd extends Phaser.Scene {
    constructor() {
        super({ key: 'GameEnd', active: false });
    }

    init({ score, correct_answer_score, wrong_answer_score }) {
        this.score = score;
        this.correct_answer_score = correct_answer_score;
        this.wrong_answer_score = wrong_answer_score;
    }

    preload() {
    }
    create() {
        this.state = {};

        this.text1 = this.add.text(200, 100, `ゲームクリア`, {
            fontSize: '60px'
        });
        this.rank_text = this.add.text(250, 200, `Rank: ${score_to_rank(this.score)}`, {
            fontSize: '30px'
        });
        this.score_text = this.add.text(250, 250, `スコア: ${this.score}`, {
            fontSize: '30px'
        });

        this.score_text = this.add.text(250, 300, `正解率: ${Math.floor(1000 * this.correct_answer_score / (this.correct_answer_score + this.wrong_answer_score)) / 10
            }%`, {
            fontSize: '30px'
        });

        this.add.text(250, 450, `再挑戦`, {
            fontSize: '30px'
        });
        this.add.rectangle(250, 450, 120, 30).on('pointerup', () => {
            this.scene.start("GameMain");
        })
            .setOrigin(0, 0)
            .setInteractive({ useHandCursor: true });

        this.add.text(250, 500, `タイトルへ戻る`, {
            fontSize: '30px'
        });
        this.add.rectangle(250, 500, 120, 30).on('pointerup', () => {
            this.scene.start("GameTitle");
        })
            .setOrigin(0, 0)
            .setInteractive({ useHandCursor: true });

    }

    update() {
    }
}


var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [GameTitle, GameMain, GameEnd],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    }
    //canvasStyle: "display: flex;justify-content: center;"
};


var game = new Phaser.Game(config);

