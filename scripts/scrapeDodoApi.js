#!/usr/bin/env node

const Sails = require('sails').constructor;
const sailsApp = new Sails();
const Q = require('q');
const fs = require('fs');
const rp = require('request-promise');
const cheerio = require('cheerio');
const queryString = require('query-string');

function scape(page = 1, itemsPerPage = 3) {
  const SCRAPING_URI = `https://www.thedodo.com/services/v1/stack/`;

  const options = {
    uri: SCRAPING_URI,
    qs: {
      'options[defType]': 'edismax',
      'options[fl]': '',
      'options[fq][]': [ 'primary_vertical.name:"Close To Home"' ],
      'options[next_page_start]': itemsPerPage,
      'options[omitHeader]': 'true',
      'options[rows]': itemsPerPage,
      'options[sort]': 'sort_date_dti desc',
      'options[start]': page + itemsPerPage,
      'options[wt]': 'json',
      page: page,
      version: '2',
      ads: 'false',
      limit: '8',
      layout: 'column_listing_layout',
    },
    // headers: {},
    json: true,
    transform: body => cheerio.load(body.results)
  };

  return rp(options)
    .then($ => {
      const newItems = $('.double-column-listing')
        .map(function() {
          return {
            source: 'The Dodo',
            icon: '//pbs.twimg.com/profile_images/775401262028300292/Vzvp_QN5.jpg',
            description: $(this).find('.double-column-listing__title-text').text().trim(),
            link: $(this).find('.double-column-listing__link').attr('href'),
            thumbnail: $(this).find('img').attr('src')
          }
        })
        .get();

      console.log(newItems)
      const promises = [];
      newItems.forEach(item => {
        let deferred = Q.defer();
        promises.push(deferred.promise);
        Blog.findOne({ link: item.link })
          .then(exists => {
            if (!exists) {
              // item.sourceCreatedAt = null;
              Blog.create(item)
                .then(deferred.resolve(item))
                .catch(deferred.reject);
            }
            deferred.resolve(item);
          })
      });

      return Q.all(promises);
    })
}

sailsApp.load({}, (err) => {
  if (err) {
    sailsApp.log.error('Error occurred loading Sails app:', err);
    return;
  }

  sailsApp.log('Sails app loaded successfully!');

  let page = 1;
  function runScare() {
    scape(page)
      .then(newItems => {
        sailsApp.log('Scraped page', page);
        page++;
        runScare();
      })
  }

  runScare();
});
