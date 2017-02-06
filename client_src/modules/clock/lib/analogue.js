
/**
 * http://codepen.io/donovanh/pen/vEjywy
 */

function AnalogueClock(id, options) {

    const clock = document.getElementById(id);
    let timerSeconds, timerMinutes;

    /**
     * Starts any clocks using the user's local time
     */
    function initClock() {
        // Get the local time using JS
        const date = new Date();
        const seconds = date.getSeconds();
        const minutes = date.getMinutes();
        const hours = date.getHours();

        // Create an object with each hand and it's angle in degrees
        const hands = [
            {
                hand: 'hours',
                angle: (hours * 30) + (minutes / 2)
            },
            {
                hand: 'minutes',
                angle: (minutes * 6)
            },
            {
                hand: 'seconds',
                angle: (seconds * 6)
            }
        ];
        // Loop through each of these hands to set their angle
        for (let j = 0; j < hands.length; j++) {
            let elements = clock.querySelectorAll('.' + hands[j].hand);
            for (let k = 0; k < elements.length; k++) {
                elements[k].style.transform = 'rotateZ('+ hands[j].angle +'deg)';
                // If this is a minute hand, note the seconds position (to calculate minute position later)
                if (hands[j].hand === 'minutes') {
                    elements[k].parentNode.setAttribute('data-second-angle', hands[j + 1].angle);
                }
            }
        }
    }

    /**
     * Move the second containers
     */
    function moveSecondHands() {
        const containers = clock.querySelectorAll('.bounce .seconds-container');
        timerSeconds = setInterval(function() {
            for (let i = 0; i < containers.length; i++) {
                if (containers[i].angle === undefined) {
                    containers[i].angle = 6;
                } else {
                    containers[i].angle += 6;
                }
                containers[i].style.webkitTransform = 'rotateZ('+ containers[i].angle +'deg)';
                containers[i].style.transform = 'rotateZ('+ containers[i].angle +'deg)';
            }
        }, 1000);
        for (let i = 0; i < containers.length; i++) {
            // Add in a little delay to make them feel more natural
            let randomOffset = Math.floor(Math.random() * (100 - 10 + 1)) + 10;
            containers[i].style.transitionDelay = '0.0'+ randomOffset +'s';
        }
    }

    /**
     * Set a timeout for the first minute hand movement (less than 1 minute), then rotate it every minute after that
     */
    function setUpMinuteHands() {
        // More tricky, this needs to move the minute hand when the second hand hits zero
        const containers = clock.querySelectorAll('.minutes-container');
        const secondAngle = containers[containers.length - 1].getAttribute('data-second-angle');
        console.log(secondAngle);
        if (secondAngle > 0) {
            // Set a timeout until the end of the current minute, to move the hand
            const delay = (((360 - secondAngle) / 6) + 0.1) * 1000;
            console.log(delay);
            setTimeout(function() {
                moveMinuteHands(containers);
            }, delay);
        }
    }

    /**
     * Do the first minute's rotation, then move every 60 seconds after
     */
    function moveMinuteHands(containers) {
        for (let i = 0; i < containers.length; i++) {
            containers[i].style.webkitTransform = 'rotateZ(6deg)';
            containers[i].style.transform = 'rotateZ(6deg)';
        }
        // Then continue with a 60 second interval
        timerMinutes = setInterval(function() {
            for (let i = 0; i < containers.length; i++) {
                if (containers[i].angle === undefined) {
                    containers[i].angle = 12;
                } else {
                    containers[i].angle += 6;
                }
                containers[i].style.webkitTransform = 'rotateZ('+ containers[i].angle +'deg)';
                containers[i].style.transform = 'rotateZ('+ containers[i].angle +'deg)';
            }
        }, 60000);
    }

    /**
     * Start the clock
     */
    function start() {
        //set start positions
        initClock();
        // Start the seconds container moving
        moveSecondHands();
        // Set the intial minute hand container transition, and then each subsequent step
        setUpMinuteHands();
    }

    function stop() {
        clearTimeout(timerSeconds);
        clearTimeout(timerMinutes);
    }

    this.start = start;
    this.stop = stop;

}


const clocks = {};
exports.startClock = (cid, options) => {
    clocks[cid] = new AnalogueClock(cid, options);
    clocks[cid].start();
    return clocks[cid];

};
exports.stopClock = (cid) => {
    if (clocks[cid]) {
        clocks[cid].stop();
    }
};