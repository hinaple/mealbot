const klunch = require('k-lunch');
const async = require('async');

const form = {
  year: 2019,
  month: 12,
  day: 6,
  time: 2, // Breakfast = 1, Lunch = 2, Dinner = 3
  name: '봉담중학교',
  phase: 3 // Elementary School = 2, Middle School = 3, High School = 4
};

const options = {
  autoCode: true,
  autoDomain: true
};

const works = [
    (callback) => {
        klunch.getLunch(form, (err, output) => {
            if(err) throw err;
            callback(null, output);
        }, options);
    },
    (callback) => {
        klunch.getNutrients(form, (err, output) => {
            if(err) throw err;
            callback(null, output);
        }, options);
    }
]

async.series(works, (err, result) => {
    if(err) throw err;
    console.log(result);
});