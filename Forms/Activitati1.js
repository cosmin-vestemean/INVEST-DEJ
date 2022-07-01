var itsMe = false,
    x_33 = 0,
    y = 0;

function ON_INSERT() {
    CCCCOLECTIE.CODE = X.SQL('select max(code) + 1 from CCCCOLECTIE', null);;
}

function ON_CCCCOLECTIE_NEW() {
    codeIt(CCCCOLECTIE, 'CCCCOLECTIE');
}

function ON_CCCCAPITOL_NEW() {
    codeIt(CCCCAPITOL, 'CCCCAPITOL');
}

function ON_CCCGRUPALUCRARI_NEW() {
    codeIt(CCCGRUPALUCRARI, 'CCCGRUPALUCRARI');
}

function ON_CCCACTIVITATE_NEW() {
    codeIt(CCCACTIVITATE, 'CCCACTIVITATE');
}


function ON_DELETE() {
    X.EXCEPTION('Atentie! Specializarile nu pot fi sterse!')
}

function ON_CCCCOLECTIE_BEFOREDELETE() {
    if (!semafoare.del || X.SYS.USER != 999) {
        X.EXCEPTION('Atentie! Colectiile nu pot fi sterse!')
    }
}

function ON_CCCCAPITOL_BEFOREDELETE() {
    if (!semafoare.del || X.SYS.USER != 999) {
        X.EXCEPTION('Atentie! Capitolele nu pot fi sterse!')
    }
}

function ON_CCCGRUPALUCRARI_BEFOREDELETE() {
    if (!semafoare.del || X.SYS.USER != 999) {
        X.EXCEPTION('Atentie! Grupele de lucrari nu pot fi sterse!')
    }
}

function ON_CCCACTIVITATE_BEFOREDELETE() {
    if (!semafoare.del || X.SYS.USER != 999) {
        X.EXCEPTION('Atentie! Activitatile nu pot fi sterse!')
    }
}

function codeIt(ds, strDs) {
    //debugger;
    if (ds.RECNO == -1) {
        ds.CODE = X.SQL('select max(code) + 1 from ' + strDs, null);
    } else {
        if (!itsMe) {
            ds.DELETE;
            x_33 = ds.CODE;
            itsMe = true;
            ds.APPEND;
        }
        itsMe = false;
        ds.CODE = x_33 + 1;
    }
}

function ON_LOCATE() {
    filterIt(1);
}

function filterIt(x) {
    CCCCOLECTIE.FILTER = '({CCCCOLECTIE.ISACTIVE}=1)';
    CCCCOLECTIE.FILTERED = x;
    CCCCAPITOL.FILTER = '({CCCCAPITOL.ISACTIVE}=1)';
    CCCCAPITOL.FILTERED = x;
    CCCGRUPALUCRARI.FILTER = '({CCCGRUPALUCRARI.ISACTIVE}=1)';
    CCCGRUPALUCRARI.FILTERED = x;
    CCCACTIVITATE.FILTER = '({CCCACTIVITATE.ISACTIVE}=1)';
    CCCACTIVITATE.FILTERED = x;
}

function EXECCOMMAND(cmd) {
    if (cmd == 202108131) {
        y = !y;
        filterIt(y);
    }
}

var semafoare = {
    filter: true,
    del: false
};

function ON_CCCCOLECTIE_COLLECTION() {
    //vezi in Adv JS, JSCommon
    debugger;
    if (CCCCOLECTIE.COLLECTION) {
        semafoare.filter = !semafoare.filter;
        if (!semafoare.filter) {
            CCCCOLECTIE.COLLECTION = fieldToUpperCase(CCCCOLECTIE.COLLECTION);
        }
        var ccccolectie = blockDuplicate(CCCCOLECTIE, 'CCCCOLECTIE', 'CCCCOLECTIE', 'COLLECTION', CCCCOLECTIE.COLLECTION, 'CCCSPECIALIZARE', CCCCOLECTIE.CCCSPECIALIZARE, semafoare);
        //CCCCOLECTIE.LOCATE('CCCCOLECTIE', ccccolectie);
    }
}

function ON_CCCCAPITOL_CAPITOL() {
    //debugger;
    if (CCCCAPITOL.CAPITOL) {
        semafoare.filter = !semafoare.filter;
        if (!semafoare.filter) {
            CCCCAPITOL.CAPITOL = fieldToUpperCase(CCCCAPITOL.CAPITOL);
        }
        blockDuplicate(CCCCAPITOL, 'CCCCAPITOL', 'CCCCAPITOL', 'CAPITOL', CCCCAPITOL.CAPITOL, 'CCCCOLECTIE', CCCCOLECTIE.CCCCOLECTIE, semafoare);
    }
}

function ON_CCCGRUPALUCRARI_GRUPALUCRARI() {
    //debugger;
    if (CCCGRUPALUCRARI.GRUPALUCRARI) {
        semafoare.filter = !semafoare.filter;
        if (!semafoare.filter) {
            CCCGRUPALUCRARI.GRUPALUCRARI = fieldToUpperCase(CCCGRUPALUCRARI.GRUPALUCRARI);
        }
        blockDuplicate(CCCGRUPALUCRARI, 'CCCGRUPALUCRARI', 'CCCGRUPALUCRARI', 'GRUPALUCRARI', CCCGRUPALUCRARI.GRUPALUCRARI, 'CCCCAPITOL', CCCCAPITOL.CCCCAPITOL, semafoare);
    }
}

function ON_CCCACTIVITATE_ACTIVITATE() {
    debugger;
    if (CCCACTIVITATE.ACTIVITATE) {
        semafoare.filter = !semafoare.filter;
        if (!semafoare.filter) {
            CCCACTIVITATE.ACTIVITATE = fieldToUpperCase(CCCACTIVITATE.ACTIVITATE);
        }

        blockDuplicate(CCCACTIVITATE, 'CCCACTIVITATE', 'CCCACTIVITATE', 'ACTIVITATE', CCCACTIVITATE.ACTIVITATE, 'CCCGRUPALUCRARI', CCCGRUPALUCRARI.CCCGRUPALUCRARI, semafoare);
    }
}

function ON_CCCACTIVITATE_POST() {
    if (semafoare.filter && !CCCACTIVITATE.CCCUNITATEMASURA && !CCCACTIVITATE.NORMATIMP) {
        try {
            X.EXCEPTION('UM si Norma timp obligatorii.');
        } catch (e) {
            X.WARNING(e.message);
        } finally {
            X.FOCUSFIELD('CCCACTIVITATE.CCCUNITATEMASURA');
        }
    }
}