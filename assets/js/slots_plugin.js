;
window.slots = (function() {
  'use strict';

  var 
    settings = {
      container: null,
      jackpot: 2467589.32,
      images: [],
      imagesDir: 'assets/images/',
      imageExt: '.png',
      imageWidth: 87,
      imageHeight: 96,
      cols: 5,
      rows: 3,
      minorWinRate: 2,
      majorWinRate: 5,
      minorWinOn: '',
      majorWinOn: '',
      noWinOn: 1,
      duration: 600,
      delayed: 200,
      easing: 'easeOutBounce'
    },

    jqueryMap = {
      $container: null,
      $slots: null,
      $jackpot: null,
      $spinBtn: null
    },

    stateMap = {
      slots: [],
      spins: 0,
      isSpinning: false,
      minorWinAt: 0,
      majorWinAt: 0,
      offsetPixel: 0,
      topPixel: '',
      minorWin: false,
      majorWin: false,
      jackpot: settings.jackpot
    },

    setJqueryMap, genRandomWin, setup, build, createSlots, createSlotCol, 
    createSlotElems, willLose, createProgressiveJackpot, jackpotInt,
    createSpinBtn, spinIt, showWin, reset, init
  ;

  setJqueryMap = function( extend ) {
    $.extend(jqueryMap, extend);
  };

  genRandomWin = function() {
    stateMap.minorWinAt = 
      _.random( settings.noWinOn + 1, settings.minorWinRate );

    stateMap.majorWinAt = 
      _.random( settings.minorWinRate + 1, settings.majorWinRate );

    console.log('minor win on: ' + stateMap.minorWinAt);
    console.log('major win on: ' + stateMap.majorWinAt);
  };

  setup = function() {
    setJqueryMap( { $container: settings.container } );
    console.log(jqueryMap);
    genRandomWin();

    stateMap.offsetPixel = parseInt(
      ( settings.imageHeight * (_.size(settings.images) - settings.rows) )
    );

    stateMap.topPixel = '-' + 
      parseInt( settings.imageHeight * settings.rows ) + 'px';
  };

  /* DOM METHODS */
  // build
  // TODO: Loading...
  build = function() {
    var slots = document.createElement('div');
    slots.className = 'slots';

    jqueryMap.$container.append(slots);

    setJqueryMap( { $slots: jqueryMap.$container.find('.slots') } );

    jqueryMap.$slots
      .css('height', settings.imageHeight * settings.rows);

    _.each(createSlots(), function(slot) {
      jqueryMap.$slots.append(slot);
    });

    createProgressiveJackpot();
    createSpinBtn();
  };

  // returns an array of ul elements
  createSlots = function() {
    var i = 0,
        slots = [];

    stateMap.slots = [];

    for (; i < settings.cols; i++) {
      slots.push(createSlotCol());
    }

    if (willLose()) return slots;
    else createSlots();
  };

  // return ul list of random slot elements
  createSlotCol = function() {
    var ul = document.createElement('ul');

    ul.style.marginTop = '-' + stateMap.offsetPixel + 'px';

    _.each(createSlotElems(), function(li) {
      ul.appendChild(li);
    });

    return ul;
  };

  createSlotElems = function() {
    var shuffled = [],
        slotElems = [],
        slotValues = [],
        index = 0,
        randomPos = _.random(1, settings.rows - 1);

    $.extend(shuffled, _.shuffle(settings.images));

    stateMap.minorWin = false;
    stateMap.majorWin = false;

    if (stateMap.spins == (stateMap.minorWinAt - 1)) {
      stateMap.minorWin = true;

      index = shuffled.indexOf(settings.minorWinOn);
      shuffled.splice(index, 1);
      shuffled.splice(randomPos, 0, settings.minorWinOn);
    } else if (stateMap.spins == (stateMap.majorWinAt - 1)) {
      stateMap.majorWin = true;

      index = shuffled.indexOf(settings.majorWinOn);
      shuffled.splice(index, 1);
      shuffled.splice(randomPos, 0, settings.majorWinOn);
    }

    _.each(shuffled, function(image) {
      var li = document.createElement('li'),
          img = document.createElement('img');

      img.src = settings.imagesDir + image + settings.imageExt;
      img.setAttribute('data-value', image);

      li.appendChild(img);
      slotElems.push(li);
      slotValues.push(image);
    });

    stateMap.slots.push(slotValues);

    return slotElems;
  };

  willLose = function() {
    var i = 0,
        outerFirst = [],
        outerLast = [],
        innerFirst = [],
        innerLast = [],
        interFirst = [],
        interLast = [];

    // check first three elems in each slot
    for (; i < stateMap.slots.length; i++) {
      innerFirst = stateMap.slots[i].slice(0, settings.rows);
      innerLast = stateMap.slots[i].slice(-settings.rows);

      if (i > 0) {
        interFirst = _.intersection(innerFirst, outerFirst);
        interLast = _.intersection(innerLast, outerLast);

        if (!interFirst.length || !interLast.length) return true;
        else {
          outerFirst = interFirst;
          outerLast = interLast;
        }
      } else {
        outerFirst = innerFirst;
        outerLast = innerLast;
      }
    }

    return false;
  };

  createProgressiveJackpot = function() {
    var jackpot = document.createElement('div');
    jackpot.className = 'slots-jackpot';
    jackpot.innerHTML = settings.jackpot;

    jqueryMap.$container.prepend(jackpot);

    setJqueryMap( { $jackpot: jqueryMap.$container.find('.slots-jackpot') } );

    jackpotInt = setInterval(function() {
      // console.log(_.random(15, 30));
    }, 100);
  };

  createSpinBtn = function() {
    var btn = document.createElement('button');
    btn.className = 'slots-btn';
    btn.innerHTML = 'SPIN';

    jqueryMap.$container.append(btn);

    setJqueryMap( { $spinBtn: jqueryMap.$container.find('.slots-btn') } );
  };

  /* EVENT HANDLERS */
  spinIt = function( e ) {
    e.preventDefault();

    if (!stateMap.isSpinning) {
      var i = 0,
          duration = 0,
          totalDuration = (stateMap.minorWin || stateMap.majorWin) ? 
            (settings.duration * 2) : settings.duration;

      stateMap.isSpinning = true;
      stateMap.slots = [];

      for (; i < settings.cols; i++) {
        duration = settings.duration;

        if ((stateMap.minorWin || stateMap.majorWin) && 
            (i == (settings.cols - 1))) {
          duration = duration * 2;
        }

        jqueryMap.$slots
          .find('ul:eq(' + i + ')')
            .delay( settings.delayed * i )
            .animate({
              'top': stateMap.offsetPixel
            }, duration, settings.easing);

        totalDuration += settings.delayed;
      }

      console.log('totalDuration: ' + totalDuration);

      setTimeout(function() {
        stateMap.isSpinning = false;
        
        console.log('spins: '+stateMap.spins);
        console.log('minorWin: '+stateMap.minorWin);
        console.log('majorWin: '+stateMap.majorWin);

        if (stateMap.minorWin) {
          showWin('minor');
        }

        if (stateMap.majorWin){
          console.log('resetting...');
          showWin('major');
          reset();
        }

        _.each(createSlots(), function(slot, i) {
          jqueryMap.$slots
            .find( 'ul:eq(' + i + ')' )
            .prepend(slot.innerHTML)
            .css('top', stateMap.topPixel);
        });
      }, totalDuration);

      stateMap.spins++;
    }

  };

  showWin = function( prize ) {
    alert('show prize: ' + prize);
  };

  reset = function() {
    stateMap.spins = 0;
    genRandomWin();
  };

  /* PUBLIC METHODS */
  // init
  init = function( input_map ) {
    $.extend(settings, input_map);

    setup();
    build();
    
    jqueryMap.$spinBtn
      .on('click', spinIt);
  };

  // return public methods
  return { init: init }
}());