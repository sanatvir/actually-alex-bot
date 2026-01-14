const mineflayer = require('mineflayer');
const express = require('express');
const vec3 = require('vec3');

const app = express();
const PORT = process.env.PORT || 3001; 
app.get('/', (req, res) => res.send('Actually_Alex: Stealth Engine Online.'));
app.listen(PORT, '0.0.0.0', () => console.log(`Alex Uptime server live on port ${PORT}`));

const botArgs = {
    host: 'PIXELSMP-coHE.aternos.me',
    username: 'Actually_Alex',
    version: '1.20.1',
};

let bot;
let isBypassing = false;
let isEscaping = false;
let lastPosition = null;
let stuckTicks = 0;

function createBot() {
    bot = mineflayer.createBot(botArgs);
    bot.physics.yield = true; // This reduces the calculation load on the server

    const moveLogic = () => {
        if (!bot || !bot.entity || isBypassing || isEscaping) {
            setTimeout(moveLogic, 500);
            return;
        }

        if (lastPosition && bot.entity.position.distanceTo(lastPosition) < 0.15) {
            stuckTicks++;
        } else {
            stuckTicks = 0;
        }
        lastPosition = bot.entity.position.clone();

        const yaw = bot.entity.yaw;
        const moveDir = new vec3(-Math.sin(yaw), 0, -Math.cos(yaw));
        const blockInFront = bot.blockAt(bot.entity.position.plus(moveDir.scaled(1)));
        
        if (blockInFront && blockInFront.boundingBox !== 'empty') {
            if (stuckTicks > 3) {
                bot.look(yaw + (Math.random() > 0.5 ? 1.5 : -1.5), 0);
                stuckTicks = 0;
            } else {
                bot.setControlState('jump', true);
            }
        } else {
            bot.setControlState('jump', false);
        }

        const actions = ['forward', 'left', 'right'];
        bot.setControlState(actions[Math.floor(Math.random() * 3)], true);
        bot.setControlState('sprint', Math.random() > 0.1);

        const nearby = bot.nearestEntity((e) => e.type === 'player');
        if (nearby && bot.entity.position.distanceTo(nearby.position) < 8) {
            const offset = new vec3((Math.random() - 0.5), nearby.height * 0.8, (Math.random() - 0.5));
            bot.lookAt(nearby.position.plus(offset));
        } else {
            bot.look(yaw + (Math.random() * 0.4 - 0.2), (Math.random() * 0.2 - 0.1), false);
        }

        if (Math.random() < 0.1) bot.swingArm('right'); 
        if (Math.random() < 0.05) bot.setQuickBarSlot(Math.floor(Math.random() * 9));

        setTimeout(moveLogic, Math.random() * 1200 + 800);
    };

    bot.on('end', () => {
        const delay = Math.floor(Math.random() * 10000) + 5000; 
        console.log(`Alex disconnected. Rejoining in ${delay / 1000}s...`);
        setTimeout(createBot, delay);
    });

    bot.on('spawn', () => {
        console.log('🐐 ALEX GOAT: Online and ready.');
        const scheduleBypass = () => {
            setTimeout(() => {
                isBypassing = true;
                bot.clearControlStates();
                setTimeout(() => {
                    isBypassing = false;
                    moveLogic();
                    scheduleBypass();
                }, Math.random() * 5000 + 5000);
            }, 720000); 
        };
        moveLogic();
        scheduleBypass();
    });

    bot.on('health', () => {
        if (bot.health < 19 && !isEscaping) {
            isEscaping = true;
            bot.setControlState('back', true);
            bot.setControlState('sprint', true);
            bot.setControlState('jump', true);
            setTimeout(() => { 
                isEscaping = false; 
                bot.clearControlStates();
                moveLogic(); 
            }, 5000);
        }
    });

    bot.on('error', (err) => console.log('Alex Engine Error:', err.message));
}

createBot();