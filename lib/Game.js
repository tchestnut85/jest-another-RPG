const inquirer = require('inquirer');
const Enemy = require('./Enemy');
const Player = require('./Player');

function Game() {
    this.roundNumber = 0;
    this.isPlayerTurn = false;
    this.enemies = [];
    this.currentEnemy;
    this.player;

    Game.prototype.initializeGame = function () {
        this.enemies.push(new Enemy('goblin', 'sword'));
        this.enemies.push(new Enemy('orc', 'greatsword'));
        this.enemies.push(new Enemy('skeleton', 'axe'));

        this.currentEnemy = this.enemies[0];

        inquirer
            .prompt({
                type: 'text',
                name: 'name',
                message: "What is your character's name?"
            })
            // desctructure name from the prompt object
            .then(({ name }) => {
                this.player = new Player(name);

                // test the object creation
                this.startNewBattle();
            });
    };

    Game.prototype.startNewBattle = function () {
        if (this.player.agility > this.currentEnemy.agility) {
            this.isPlayerTurn = true;
        } else {
            this.isPlayerTurn = false;
        }

        console.log('Your stats are as follows:');
        console.table(this.player.getStats());
        console.log(this.currentEnemy.getDescription());

        // start each round of the battle
        this.battle();
    };

    Game.prototype.battle = function () {
        if (this.isPlayerTurn) {
            inquirer
                .prompt({
                    type: 'list',
                    message: '\n What would you like to do?',
                    name: 'action',
                    choices: ['Attack', 'Use potion']
                })
                .then(({ action }) => {
                    if (action === 'Use potion') {
                        if (!this.player.getInventory()) {
                            console.log("\n You don't have any potions!");
                            return this.checkEndOfBattle();
                        }

                        inquirer
                            .prompt({
                                type: 'list',
                                message: '\n Which potion would you like to use?',
                                name: 'action',
                                choices: this.player.getInventory().map((item, index) => `${index + 1}: ${item.name}`)
                            })
                            .then(({ action }) => {
                                const potionDetails = action.split(': ');

                                this.player.usePotion(potionDetails[0] - 1);
                                console.log(`\n You used a ${potionDetails[1]} potion!`);

                                this.checkEndOfBattle();
                            });
                    } else {
                        const damage = this.player.getAttackValue();
                        this.currentEnemy.reduceHealth(damage);

                        console.log(`\n You attacked the ${this.currentEnemy.name}!`);
                        console.log(this.currentEnemy.getHealth());

                        this.checkEndOfBattle();
                    }
                });
        } else {
            const damage = this.currentEnemy.getAttackValue();
            this.player.reduceHealth(damage);

            console.log(`\n You were attacked by ${this.currentEnemy.name}!`);
            console.log(this.player.getHealth());

            this.checkEndOfBattle();
        }
    };

    Game.prototype.checkEndOfBattle = function () {

        // verify if both player and enemy are alive
        if (this.player.isAlive() && this.currentEnemy.isAlive()) {
            // if both alive, switch turn order and run battle function again
            this.isPlayerTurn = !this.isPlayerTurn;
            this.battle();
        } else if (this.player.isAlive() && !this.currentEnemy.isAlive()) {
            console.log(`\n You've defeated the ${this.currentEnemy.name}!`);

            this.player.addPotion(this.currentEnemy.potion);
            console.log(`\n ${this.player.name} found a potion of ${this.currentEnemy.potion.name}!`);

            this.roundNumber++;

            if (this.roundNumber < this.enemies.length) {
                this.currentEnemy = this.enemies[this.roundNumber];
                this.startNewBattle();
            } else {
                console.log('\n You slayed all of the monsters!');
            }
        } else {
            console.log('\n The horde of monsters killed you...');
        }
    };
};

module.exports = Game;