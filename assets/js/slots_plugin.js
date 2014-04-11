;
window.slots = (function() {
  'use strict';

  var 
    settings = {
      container: null,
      jackpot: 2467589.32,
      spinBtnText: '',
      images: [],
      // imagesDir: 'https://raw.githubusercontent.com/jpvuong/slots-app/master/assets/images/slot_elements/',
      // imagesDir: 'assets/images/slot_elements/',
      imagesDir: 'build/images/slot_elements/',
      imageExt: '.png',
      imageWidth: 100,
      imageHeight: 103,
      cols: 5,
      rows: 3,
      majorWinOnly: false,
      minorWinRate: 2,
      majorWinRate: 5,
      minorWinOn: '',
      majorWinOn: '',
      noWinOn: 1,
      duration: 600,
      delayed: 200,
      easing: 'easeOutBounce',
      startMsg: '',
      tryAgainMsg: ''
    },

    jqueryMap = {
      $container: null,
      $slotsWrapper: null,
      $slots: null,
      $winningLine: null,
      $jackpot: null,
      $statusDisplay: null,
      $spinBtn: null
    },

    stateMap = {
      slots: [],
      spins: 0,
      isSpinning: false,
      colLoadedCounter: 0,
      minorWinAt: 0,
      majorWinAt: 0,
      width: '',
      height: '',
      offsetPixel: 0,
      topPixel: '',
      minorWin: false,
      majorWin: false,
      jackpot: '',
      prize: null
    },

    setJqueryMap, genRandomWin, setup, build, createSlots, createSlotCol, 
    createSlotElems, willLose, createProgressiveJackpot, jackpotInt,
    createStatusDisplay, createSpinBtn, createWinningLine, spinIt,
    slotsSpinning, slotsStopped, loadComplete, registerRedirect, showWin, 
    reset, init
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
    genRandomWin();

    stateMap.width = parseInt(settings.imageWidth * settings.cols) + 'px';
    stateMap.height = parseInt(settings.imageHeight * settings.rows) + 'px';

    stateMap.offsetPixel = parseInt(
      ( settings.imageHeight * (_.size(settings.images) - settings.rows) )
    );

    stateMap.topPixel = '-' + 
      parseInt( settings.imageHeight * settings.rows ) + 'px';
  };

  /* DOM METHODS */
  // build
  build = function() {
    var slotsWrapper = document.createElement('div'),
        slots = document.createElement('div');

    slotsWrapper.className = 'slots-wrapper';
    slots.className = 'slots';

    slotsWrapper.appendChild(slots);

    jqueryMap.$container
      .addClass('slots-loading')
      .append(slotsWrapper);

    setJqueryMap({
      $slotsWrapper: jqueryMap.$container.find('.slots-wrapper'),
      $slots: jqueryMap.$container.find('.slots')
    });

    slots.style.width = stateMap.width;
    slots.style.height = stateMap.height;

    _.each(createSlots(), function(slot) {
      slots.appendChild(slot);
    });

    createProgressiveJackpot();
    createStatusDisplay();
    createSpinBtn();
    createWinningLine();
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
        i = 0;

    $.extend(shuffled, _.shuffle(settings.images));

    stateMap.minorWin = false;
    stateMap.majorWin = false;

    if (stateMap.spins == (stateMap.minorWinAt - 1) && !settings.majorWinOnly) {
      stateMap.minorWin = true;

      index = shuffled.indexOf(settings.minorWinOn);
      shuffled.splice(index, 1);
      shuffled.splice(1, 0, settings.minorWinOn);
    } else if (stateMap.spins == (stateMap.majorWinAt - 1)) {
      stateMap.majorWin = true;

      index = shuffled.indexOf(settings.majorWinOn);
      shuffled.splice(index, 1);
      shuffled.splice(2, 0, settings.majorWinOn);
    }

    _.each(shuffled, function(image) {
      var li = document.createElement('li'),
          img = new Image();


      li.style.width = settings.imageWidth + 'px';
      li.style.height = settings.imageHeight + 'px';

      img.src = settings.imagesDir + image + settings.imageExt;
      img.setAttribute('data-value', image);

      img.onload = function() {
        i++;
        if (i == settings.images.length)
          $(document).trigger('load-complete');
      }

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

    jqueryMap.$slotsWrapper.prepend(jackpot);

    setJqueryMap( { $jackpot: jqueryMap.$slotsWrapper.find('.slots-jackpot') } );

    jackpotInt = setInterval(function() {
      var random = _.random(0, 50);

      settings.jackpot += (random / 100);

      stateMap.jackpot = '$' + settings.jackpot.toLocaleString('en-US', {minimumFractionDigits: 2});

      jackpot.innerHTML = stateMap.jackpot;
    }, 150);
  };

  createStatusDisplay = function() {
    var display = document.createElement('div'),
        start = document.createElement('span'),
        tryAgain = document.createElement('span');

    display.className = 'slots-status-display show-start';

    start.className = 'slots-status-start';
    start.innerHTML = settings.startMsg;

    tryAgain.className = 'slots-status-try-again';
    tryAgain.innerHTML = settings.tryAgainMsg;

    display.appendChild(start);
    display.appendChild(tryAgain);

    jqueryMap.$slotsWrapper.append(display);

    setJqueryMap({
      $statusDisplay: jqueryMap.$slotsWrapper.find('.slots-status-display')
    });

    $(document)
      .on('slots-spinning', function() {
        display.className = 'slots-status-display';
      })
      .on('slots-stopped', function() {
        if (!stateMap.minorWin && !stateMap.majorWin)
          display.className = 'slots-status-display show-try-again';
      });
  };

  createSpinBtn = function() {
    var btn = document.createElement('button');

    btn.className = 'slots-btn';
    btn.innerHTML = settings.spinBtnText;

    jqueryMap.$slotsWrapper.append(btn);

    setJqueryMap( { $spinBtn: jqueryMap.$slotsWrapper.find('.slots-btn') } );

    $(document)
      .on('slots-spinning', function() {
        btn.disabled = true;
      })
      .on('slots-stopped', function() {
        btn.disabled = false;
      });
  };

  createWinningLine = function() {
    var winningLine = document.createElement('div');

    winningLine.className = 'slots-winning-line';

    jqueryMap.$slots.append(winningLine);

    setJqueryMap( { $winningLine: jqueryMap.$slots.find('.slots-winning-line') } );
  };

  /* EVENT HANDLERS */
  spinIt = function( e ) {
    e.preventDefault();

    if (stateMap.prize == 'minor') {
      $(document).trigger('slots-hide-win');
      stateMap.prize = null;
    }

    if (!stateMap.isSpinning) {
      var i = 0,
          duration = 0,
          totalDuration = (stateMap.minorWin || stateMap.majorWin) ? 
            (settings.duration * 2) : settings.duration;

      $(document).trigger('slots-spinning');

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

      setTimeout(function() {
        $(document).trigger('slots-stopped');
        
        console.log('spins: '+stateMap.spins);
        console.log('minorWin: '+stateMap.minorWin);
        console.log('majorWin: '+stateMap.majorWin);

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

  slotsSpinning = function() {
    console.log('slotsSpinning');
    stateMap.isSpinning = true;
  };

  slotsStopped = function() {
    console.log('slotsStopped');
    stateMap.isSpinning = false;

    if (stateMap.minorWin || stateMap.majorWin) showWin();

    if (stateMap.majorWin) {
      jqueryMap.$spinBtn
        .off('click')
        .on('click', registerRedirect);
    }
  };

  loadComplete = function() {
    stateMap.colLoadedCounter++;

    if (stateMap.colLoadedCounter == settings.cols)
      jqueryMap.$container.removeClass('slots-loading');
  };

  registerRedirect = function( e ) {
    window.location = 'register';
  };

  showWin = function() {
    var top = '';

    stateMap.prize = stateMap.minorWin ? 'minor' : 'major';

    top = stateMap.prize == 'minor' ? '50%' : '257px';

    jqueryMap.$winningLine
      .css({ top: top })
      .addClass('flashing');

    jqueryMap.$spinBtn.prop('disabled', true);

    setTimeout(function() {
      jqueryMap.$winningLine
        .css({ opacity: 0 })
        .removeClass('flashing');

      jqueryMap.$spinBtn.prop('disabled', false);

      $(document).trigger({
        type: 'slots-show-win',
        prize: stateMap.prize,
        $spinBtn: jqueryMap.$spinBtn,
        $jackpot: jqueryMap.$jackpot
      });
    }, 3000);
  };

  // reset = function() {
  //   stateMap.spins = 0;
  //   genRandomWin();
  // };

  /* PUBLIC METHODS */
  // init
  init = function( input_map ) {
    $.extend(settings, input_map);

    setup();
    build();
    
    jqueryMap.$spinBtn
      .on('click', spinIt);

    $(document)
      .on('load-complete', loadComplete)
      .on('slots-spinning', slotsSpinning)
      .on('slots-stopped', slotsStopped);
  };

  // return public methods
  return { init: init }
}());