;
$(function() {
  var images = ['a', 'k', 'q', 'j', '10', 'bad', 'borlotta', 'jackpot', 'mayor', 'owl', 'priscilla', 'rango1', 'rango2', 'rango3', 'snake'],
      settings = {
        container: $('#container'),
        images: images,
        minorWinOn: 'rango1',
        majorWinOn: 'jackpot'
      };

  slots.init( settings );
});