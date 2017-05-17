#!/usr/bin/env node

const Sails = require('sails').constructor;
const sailsApp = new Sails();
const Q = require('q');
const fs = require('fs');
const rp = require('request-promise');
const cheerio = require('cheerio');
const queryString = require('query-string');

// const SCRAPING_URI = `https://www.seeker.com/services/v1/stack/?options[omitHeader]=true&options[sort]=sort_date_dti
//  desc&options[fl]=&options[start]=3&options[wt]=json&options[fq][]=-nid:(4610372 4594997 4593881 4585019 0)&
//  options[fq][]=-flags:(nsfw nsfa)&options[fq][]=node_type:(article video)&options[fq][]=vertical_sim:"
//  Animals"&options[fq][]=-term:Impact&options[fq][]=promote:true&options[fq][]=company:"Seeker"
//  &options[defType]=edismax&options[rows]=3&options[next_page_start]=3&version=2&page=2&ads=false&layout=column_listing_layout`;

function scape(page = 1, itemsPerPage = 3) {
  const SCRAPING_URI = `https://www.seeker.com/services/v1/stack/`;

  const options = {
    uri: SCRAPING_URI,
    qs: {
      // 'options[fq][]':
      //   [ '-nid:(4610372 4594997 4593881 4585019 0)',
      //     '-flags:(nsfw nsfa)',
      //     'node_type:(article video)',
      //     'vertical_sim:"Animals"',
      //     '-term:Impact',
      //     'promote:true',
      //     'company:"Seeker"' ],
      'options[defType]': 'edismax',
      'options[fl]': '',
      'options[fq][]': [ 'vertical_sim:"Animals"' ],
      'options[next_page_start]': itemsPerPage,
      'options[omitHeader]': 'true',
      'options[rows]': itemsPerPage,
      'options[sort]': 'sort_date_dti desc',
      'options[start]': page + itemsPerPage,
      'options[wt]': 'json',
      page: page,
      version: '2',
      ads: 'false',
      layout: 'column_listing_layout',
    },
    // headers: {},
    json: true,
    transform: body => cheerio.load(body.results)
  };

  return rp(options)
    .then($ => {
      const newItems = $('.small-listing')
        .map(function() {
          return {
            source: 'Seeker',
            icon: '//www.seeker.com/seeker_favicon.ico',
            description: $(this).find('.small-listing__title-text').text().trim(),
            link: $(this).find('.small-listing__link').attr('href'),
            thumbnail: $(this).find('img').attr('src')
          }
        })
        .get();

      const promises = [];
      newItems.forEach(item => {
        let deferred = Q.defer();
        promises.push(deferred.promise);
        Blog.findOne({ link: item.link })
          .then(exists => {
            if (!exists) {
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
