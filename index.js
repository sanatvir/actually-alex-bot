const mineflayer = require('mineflayer');
const express = require('express');
const vec3 = require('vec3');

const app = express();
const PORT = process.env.PORT || 3001; 

// Keep Koyeb healthy with a web response
app.get('/', (req, res) => res.send('Actually_Alex: Elite Stealth Engine Online.'));
app.listen(PORT, '0.0.0.0', () => console.log(`Alex Uptime server live on port ${PORT}`));

const botArgs = {
    host: 'PIXELSMP-coHE.aternos.me',
    username: 'Actually_Alex',
    version: '1.20.1',
};

let bot;
let isBypassing = false;
let isEscaping = false;
let isLongPausing = false;

function createBot() {
    bot = mineflayer.createBot(botArgs);

    const triggerLongPause = () => {
        const nextPauseDelay = (Math.random() * (18 - 12) + 12) * 60 * 1000;
        setTimeout(() => {
            isLongPausing = true;
            bot.clearControlStates(); 
            console.log("Alex starting a long silent pause (4-8s)...");
            const pauseDuration = Math.random() * (8000 - 4000) + 4000;
            setTimeout(() => {
                isLongPausing = false;
                console.log("Alex pause finished. Resuming.");
                moveLogic(); 
                triggerLongPause(); 
            }, pauseDuration);
        }, nextPauseDelay);
    };

    const moveLogic = () => {
        if (!bot || !bot.entity || isBypassing || isEscaping || isLongPausing) {
            if (!isLongPausing) setTimeout(moveLogic, 1000);
            return;
        }

        // Random Sneak
        bot.setControlState('sneak', Math.random() < 0.15);

        // Random Jump
        if (Math.random() < 0.1) {
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 300);
        }

        // Random Sprint
        bot.setControlState('sprint', Math.random() > 0.6);

        // Randomized Movement
        const actions = ['forward', 'left', 'right', 'back'];
        bot.clearControlStates(); 
        bot.setControlState(actions[Math.floor(Math.random() * actions.length)], true);
        
        // Human Look Logic
        if (Math.random() < 0.2) {
            const nearby = bot.nearestEntity((e) => e.type === 'player');
            if (nearby && bot.entity.position.distanceTo(nearby.position) < 10) {
                bot.lookAt(nearby.position.plus(new vec3(0, 1.6, 0)));
            } else {
                bot.look(bot.entity.yaw + (Math.random() - 0.5), (Math.random() - 0.5));
            }
        }

        if (Math.random() < 0.1) bot.swingArm('right');
        setTimeout(moveLogic, Math.random() * 2000 + 2500);
    };

    bot.on('spawn', () => {
        // --- FIX: Physics settings now wait until the bot spawns ---
        if (bot.physics) {
            bot.physics.yield = true; 
            bot.physics.maxUpdateDelay = 500; 
        }
        
        console.log('🐐 ALEX ELITE: Operational.');
        moveLogic();
        triggerLongPause(); 
    });

    bot.on('death', () => bot.respawn());

    bot.on('end', () => {
        const rejoinDelay = Math.random() * (10000 - 5000) + 5000;
        console.log(`Connection lost. Rejoining randomly in ${rejoinDelay/1000}s...`);
        setTimeout(createBot, rejoinDelay);
    });

    bot.on('error', (err) => console.log('Engine Error:', err.message));
}

createBot();