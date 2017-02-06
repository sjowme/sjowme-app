const moment = require('moment');

function DigitalClock(id, options) {

    // Cache some selectors

    const clock = jQuery(`#${id}`),
        ampm = clock.find('.ampm');

    let timer;

    // Map digits to their names (this will be an array)
    const digit_to_name = 'zero one two three four five six seven eight nine'.split(' ');

    // This object will hold the digit elements
    const digits = {};

    // Positions for the hours, minutes, and seconds
    const positions = [
        'h1', 'h2', ':', 'm1', 'm2', ':', 's1', 's2'
    ];

    // Generate the digits with the needed markup,
    // and add them to the clock

    const digit_holder = clock.find('.digits');

    positions.forEach(posisiton => {
        if(posisiton === ':'){
            digit_holder.append('<div class="dots">');
        } else{

            const pos = jQuery('<div>');

            for(let i=1; i<8; i++){
                pos.append(`<span class="d${i}">`);
            }

            // Set the digits as key:value pairs in the digits object
            digits[posisiton] = pos;

            // Add the digit elements to the page
            digit_holder.append(pos);
        }

    });

    // Add the weekday names
    const weekday_names = 'MA DI WO DO VR ZA ZO'.split(' '),
        weekday_holder = clock.find('.weekdays');

    weekday_names.forEach(weekday_name => {
        weekday_holder.append(`<span>${weekday_name}</span>`);
    });

    const weekdays = clock.find('.weekdays span');

    // hh is for the hours in 12-hour format,
    // mm - minutes, ss-seconds (all with leading zeroes),
    // d is for day of week and A is for AM/PM
    const format = options.format === '24h' ? 'HHmmssd' : 'hhmmssdA';

    // Run a timer every second and update the clock
    function start() {
        // Use moment.js to output the current time as a string

        var now = moment().format(format);

        digits.h1.attr('class', digit_to_name[now[0]]);
        digits.h2.attr('class', digit_to_name[now[1]]);
        digits.m1.attr('class', digit_to_name[now[2]]);
        digits.m2.attr('class', digit_to_name[now[3]]);
        digits.s1.attr('class', digit_to_name[now[4]]);
        digits.s2.attr('class', digit_to_name[now[5]]);

        // The library returns Sunday as the first day of the week.
        // Stupid, I know. Lets shift all the days one position down,
        // and make Sunday last

        var dow = now[6];
        dow--;

        // Sunday!
        if(dow < 0){
            // Make it last
            dow = 6;
        }

        // Mark the active day of the week
        weekdays.removeClass('active').eq(dow).addClass('active');

        if (options.format === '12h') {
            // Set the am/pm text:
            ampm.text(now[7] + now[8]);
        }

        // Schedule this function to be run again in 1 sec
        timer = setTimeout(() => this.start(), 1000);


    }

    function stop() {
        clearTimeout(timer);
    }

    this.start = start;
    this.stop = stop;
}

const clocks = {};
exports.startClock = (cid, options) => {
    clocks[cid] = new DigitalClock(cid, options);
    clocks[cid].start();
    return clocks[cid];
};
exports.stopClock = (cid) => {
    if (clocks[cid]) {
        clocks[cid].stop();
    }
};