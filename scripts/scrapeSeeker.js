#!/usr/bin/env node

const Sails = require('sails').constructor;
const osmosis = require('osmosis');
const sailsApp = new Sails();

sailsApp.load({}, (err) => {
  if (err) {
    sailsApp.log.error('Error occurred loading Sails app:', err);
    return;
  }

  // --•
  sailsApp.log('Sails app loaded successfully!');

  osmosis
    .get('http://www.seeker.com/dnews-animals/')
    .find('.primary .image-article')
    .set({
      'thumbnail': '.widget__image@style',
      'description':  '.custom-post-headline',
      'date': '.widget__timestamp',
      'link': '.custom-post-headline@href'
    })
    .data((listing) => {
      listing.source = 'SEEKER';
      listing.thumbnail = listing.thumbnail.match(/\((.*?)\)/)[1].replace(/('|")/g,'');

      BlogService.createBlog(listing)
        .then(sailsApp.log)
        .catch(sailsApp.log.error);
    })
    .log(sailsApp.log)
    .error(sailsApp.log.error)
    .debug(sailsApp.log.debug)
    .end(() => {
      sailsApp.log('END')
    })

});
