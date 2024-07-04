var labels = document.querySelectorAll("label");
var ok_elements = Array.from(labels)
    .filter((element) => element.textContent === '○');
var dates = {};
for (var i = 0;ok_elements.length > i;i++) {
    var ok_element = ok_elements[i];
    var can_reservation = true;
    if (ok_element.closest('td').classList.contains('readonly')) {
        can_reservation = false;
    }
    var member = ok_element.closest('table').getElementsByTagName('td');
    var number_of_mine = 0;
    for (var j = 0;member.length > j;j++) {
        if (ok_element.parentElement === member[j]) {
            number_of_mine = j;
            break;
        }
    }
    var place = ok_element.closest('.item.clearfix').getElementsByTagName('h3')[0].innerText;
    var time = ok_element.closest('table').getElementsByTagName('th')[number_of_mine].innerText.replace(/\r?\n/g, '');
    var from_time = time.replace(/^(.+)～.+$/, '$1');
    var from_hour = from_time.replace(/^(\d+):.+$/, '$1');
    var from_minute = from_time.replace(/^\d+:(\d+)$/, '$1');
    var to_time = time.replace(/^.+～(.+)$/, '$1');
    var to_hour = to_time.replace(/^(\d+):.+$/, '$1');
    var to_minute = to_time.replace(/^\d+:(\d+)$/, '$1');
    var date_string = ok_element.closest('table').getElementsByTagName('th')[0].innerText.replace(/\r?\n/g, '');
    var year = date_string.replace(/^(\d+)年.+$/, '$1');
    var month = date_string.replace(/^.+年(\d+)月.+$/, '$1');
    var day = date_string.replace(/^.+月(\d+)日.+$/, '$1');
    var date_key = new Date(year, month - 1, day);
    var days_of_week = ['日', '月', '火', '水', '木', '金', '土'];
    if (!dates.hasOwnProperty(date_key)) {
        dates[date_key] = []
        dates[date_key].push({
            from: new Date(year, month -1, day, from_hour, from_minute),
            to: new Date(year, month -1, day, to_hour, to_minute),
            week: days_of_week[date_key.getDay()],
            can_reservation: can_reservation,
            place: place,
        });
    } else {
        dates[date_key].push({
            from: new Date(year, month -1, day, from_hour, from_minute),
            to: new Date(year, month -1, day, to_hour, to_minute),
            week: days_of_week[date_key.getDay()],
            can_reservation: can_reservation,
            place: place,
        });
    }
}
var date_keys = Object.keys(dates).sort(function (a, b) {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
});
var new_dates = {};
for (var l = 0;date_keys.length > l;l++) {
    new_dates[date_keys[l]] = dates[date_keys[l]];
}
var ymds = {};

Object.keys(new_dates).forEach(function (key) {
    var sort_dates = dates[key].sort(function (a, b) {
        if (a.from < b.from) {
            return -1;
        }
        if (a.from > b.from) {
            return 1;
        }
        return 0;
    });
    var place = {};
    for (var l = 0;sort_dates.length > l;l++) {
        var sort_date = sort_dates[l];
        var ymd = sort_date.from.getFullYear() + '/' + (sort_date.from.getMonth() + 1) + '/' + sort_date.from.getDate();
        var md = (sort_date.from.getMonth() + 1) + '/' + sort_date.from.getDate();
        var from_hi = sort_date.from.getHours() + ':' + ('0' + sort_date.from.getMinutes()).slice(-2);
        var to_hi = sort_date.to.getHours() + ':' + ('0' + sort_date.to.getMinutes()).slice(-2);
        if (!ymds.hasOwnProperty(ymd)) {
            ymds[ymd] = {};
            ymds[ymd][from_hi] = {
                ymd_string: ymd,
                md_string: md,
                from: sort_date.from,
                from_string: from_hi,
                to: sort_date.to,
                to_string: to_hi,
                week: sort_date.week,
                places: {},
            };
            ymds[ymd][from_hi].places[sort_date.place] = {
                name: sort_date.place,
                can_reservation: sort_date.can_reservation,
            };
        } else {
            if (ymds[ymd].hasOwnProperty(from_hi)) {
                if (!ymds[ymd][from_hi].places.hasOwnProperty(sort_date.place)) {
                    ymds[ymd][from_hi].places[sort_date.place] = {
                        name: sort_date.place,
                        can_reservation: sort_date.can_reservation,
                    };
                } else if (ymds[ymd][from_hi].places[sort_date.place].can_reservation === false && sort_date.can_reservation === true) {
                    ymds[ymd][from_hi].places[sort_date.place].can_reservation = true;
                }
            } else {
                ymds[ymd][from_hi] = {
                    ymd_string: ymd,
                    md_string: md,
                    from: sort_date.from,
                    from_string: from_hi,
                    to: sort_date.to,
                    to_string: to_hi,
                    week: sort_date.week,
                    places: {},
                };
                ymds[ymd][from_hi].places[sort_date.place] = {
                    name: sort_date.place,
                    can_reservation: sort_date.can_reservation,
                };
            }
        }
    }
});

var string = '';
//y/m/d
Object.keys(ymds).forEach(function (key) {
    var times = ymds[key];
    Object.keys(times).forEach(function (time_key) {
        var time = times[time_key];
        var place_array = [];
        Object.keys(time.places).forEach(function (place_key) {
            var place_name = time.places[place_key].name;
            if (!time.places[place_key].can_reservation) {
                place_name += '(当日予約)';
            }
            place_array.push(place_name);
        });
        var child_string = time.ymd_string + '(' + time.week + ') ' + time.from_string + '〜' + '(' + place_array.join(',') + ')';
        string += child_string + '\n';
    });
});


string += '----------------------------------------------\n';

//m/d
Object.keys(ymds).forEach(function (key) {
    var times = ymds[key];
    Object.keys(times).forEach(function (time_key) {
        var time = times[time_key];
        var place_array = [];
        Object.keys(time.places).forEach(function (place_key) {
            var place_name = time.places[place_key].name;
            if (!time.places[place_key].can_reservation) {
                place_name += '(当日予約)';
            }
            place_array.push(place_name);
        });
        var child_string = time.md_string + '(' + time.week + ') ' + time.from_string + '〜' + '(' + place_array.join(',') + ')';
        string += child_string + '\n';
    });
});

console.log(string);