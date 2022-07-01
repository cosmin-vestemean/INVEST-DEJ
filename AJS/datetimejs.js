//// datetimejs
function checkDateBtwStr(_input, _start, _end) {
    function parseDate(x) {
        if (typeof x === 'string') {
            var parts = x.split(/[-: ]/g).map(Number);
            x = new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
        }
        return x;
    }

    _input = parseDate(_input);
    _start = parseDate(_start);
    _end = parseDate(_end);

    return _input > _start && _input < _end;
}


function checkDateBtwDT(_input, _start, _end) {
    return _input > _start && _input < _end;
}

function dateDiffH(start, stop, arePauzaDeMasa) {
    //36e5 is the scientific notation for 60*60*1000
    if (!arePauzaDeMasa)
        arePauzaDeMasa = false;
    var s1 = start.replace(' ', 'T'),
        s2 = stop.replace(' ', 'T'),
        d1 = new Date(s1),
        d2 = new Date(s2),
        dif = Math.abs(d2 - d1),
        pauzaMasa = SALDOC.CCCPAUZAMASA,
        ret = arePauzaDeMasa ? dif / 36e5 - pauzaMasa : dif / 36e5;
    return ret;
}

function dateToSQLStr(d, dateSeparator, timeSeparator) {
    return d.getFullYear() + dateSeparator +
        ("00" + (d.getMonth() + 1)).slice(-2) + dateSeparator +
        ("00" + d.getDate()).slice(-2) + ' ' +
        ("00" + d.getHours()).slice(-2) + timeSeparator +
        ("00" + d.getMinutes()).slice(-2) + timeSeparator +
        ("00" + d.getSeconds()).slice(-2);
}