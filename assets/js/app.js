;
$(function() {
  var images = ['a', 'k', 'q', 'j', '10', 'bad', 'borlotta', 'jackpot', 'mayor', 'owl', 'priscilla', 'rango1', 'rango2', 'rango3', 'snake'],
      settings = {
        container: $('#container'),
        showJackpot: false,
        images: images,
        // majorWinOnly: true,
        minorWinOn: 'rango1',
        majorWinOn: 'jackpot'
      };

  $('#win-minor').css('background', 'url("assets/images/rango-win.gif?'+_.now()+'") no-repeat');
  $('#win-major').css('background', 'url("assets/images/rango-win.gif?'+_.now()+'") no-repeat');

  slots.init( settings );

  $(document)
    .on('slots-show-win', function( e ) {
      e.$spinBtn.prop('disabled', true);
      $('#win-'+e.prize)
        .animate({
          top: 0,
          opacity: 1
        }, 250, 'easeOutQuad', function() {
          var $that = $(this);
          setTimeout(function() {
            $that.find('div').fadeIn('fast', function() {
              e.$spinBtn.prop('disabled', false);
            });
          }, 2500);
        });

      if (e.prize == 'major') {
        setInterval(function() {
          $('#jackpot').text(e.$jackpot.text());
        }, 150);
      }
    })
    .on('slots-hide-win', function( e ) {
      $('.win')
        .animate({
          top: '-458px',
          opacity: 0
        }, 250, 'easeOutQuad', function() {
          $(this).find('div').hide();
        });
      });
});