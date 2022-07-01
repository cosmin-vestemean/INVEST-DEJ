/*
CCCCOLECTIE(W[CCCCOLECTIE IN (SELECT * FROM AR_EDITOR_COLECTIE_SRV (:CUSTFINDOC.CCCFINDOCOP, :CUSTFINDOC.PRJCSTAGE, :CUSTFINDOC.CCCDEVIZECM))])
CCCCAPITOL(W[CCCCAPITOL IN (SELECT * FROM AR_EDITOR_CAPITOL_SRV (:CUSTFINDOC.CCCFINDOCOP, :CUSTFINDOC.PRJCSTAGE, :CUSTFINDOC.CCCDEVIZECM, :CUSTFINDOC.CCCCOLECTIE))])
CCCGRUPALUCRARI(W[CCCGRUPALUCRARI IN (SELECT * FROM AR_EDITOR_GRUPA_SRV (:CUSTFINDOC.CCCFINDOCOP, :CUSTFINDOC.PRJCSTAGE, :CUSTFINDOC.CCCDEVIZECM, :CUSTFINDOC.CCCCAPITOL))])
CCCACTIVITATE(W[CCCACTIVITATE IN (SELECT * FROM AR_EDITOR_ACTIVITATE_SRV(:CUSTFINDOC.CCCFINDOCOP, :CUSTFINDOC.PRJCSTAGE, :CUSTFINDOC.CCCDEVIZECM, :CUSTFINDOC.CCCCOLECTIE, :CUSTFINDOC.CCCCAPITOL, :CUSTFINDOC.CCCGRUPALUCRARI))])
 */

var zoomed = false;

function EXECCOMMAND(CMD) {
    if (CMD == 20200925) {
        X.SETPROPERTY('PANEL', 'Panel2', 'VISIBLE', zoomed);
        zoomed = !zoomed;
    }

    // Update hours
    if (CMD == 15002) {
        updateDurationColumn(FINDOC.NUM01);
    }

    // Update date
    if (CMD == 15003) {
        updateDateColumn(FINDOC.DATE01);
    }
}

function updateDurationColumn(nValue) {

    CUSTLINES.FIRST;
    while (!CUSTLINES.Eof) {
        if (CUSTLINES.CINT03 == 100) {
            CUSTLINES.CNUM01 = nValue;
        }
        CUSTLINES.NEXT;
    }
}

function updateDateColumn(nValue) {
    CUSTLINES.FIRST;
    while (!CUSTLINES.Eof) {
        CUSTLINES.CDAT02 = nValue;

        CUSTLINES.NEXT;
    }
}

function formatDate(dDateV) {
    strDt = X.FORMATDATE('YYYYMMDD', dDateV);
    return strDt;
}

function ON_POST() {
    //debugger;
    //interdictie daca am catitate realizata operatie vs cantitate fl
    if (CUSTFINDOC.CCCQTY1 < CUSTFINDOC.CCCREALIZATOP) {
        X.EXCEPTION('Atentie cantitatea realizata pe operatie depaseste cantitatea de pe fisa limita.');
    }

    CUSTLINES.FIRST;
    while (!CUSTLINES.Eof) {
        var dDate = new Date(CUSTLINES.CDAT02);
        var nDay = dDate.getDate();
        var nMonth = dDate.getMonth() + 1;
        var nYear = dDate.getYear();
        sSQLD = 'select isnull(count(CUSTLINES),0) as NUM from CUSTLINES where CINT01 = ' + CUSTLINES.CINT01 + ' and FINDOC <> ' + CUSTLINES.FINDOC + ' and CINT02 	 = ' + CUSTLINES.CINT02 + ' and CUSTLINES.CDAT02 = ' + X.EVAL('SQLDATE(CUSTLINES.CDAT02)') + '';
        dsDUPLICATE = X.GETSQLDATASET(sSQLD, '');

        CUSTLINES.NEXT;
    }

    var prsn = CUSTLINES.CINT01;
    var dep = CUSTLINES.CCCDEPLASAREPTJ;
    var data = X.EVAL('SQLDATE(CUSTLINES.CDAT02)');
    var linie = CUSTLINES.LINENUM;
    var verif = 0;

    if (CUSTLINES.CINT02 && CUSTLINES.CINT01) {
        CUSTLINES.FIRST;
        while (!CUSTLINES.Eof) {
            if ((CUSTLINES.CINT01 == prsn) && (CUSTLINES.CCCDEPLASAREPTJ != dep) && (X.EVAL('SQLDATE(CUSTLINES.CDAT02)') == data) && (CUSTLINES.LINENUM != linie)) {
                verif = 1;
            }
            CUSTLINES.NEXT;
        }

        if (verif == 1) {
            X.EXCEPTION(' Atentie! Acest angajat: ' + CUSTLINES.CINT01_PRSNIN_NAME2 + ' a mai fost pontat in aceeasi zi cu deplasare diferita!');
        }

    }

    //total ore pontate- start
    var total_ore = 0;

    CUSTLINES.FIRST;
    while (!CUSTLINES.EOF()) {
        total_ore = total_ore + CUSTLINES.CNUM01;
        CUSTLINES.NEXT;
    }
    CUSTFINDOC.CCCTOTALORE = total_ore;
    //total ore pontate- end

    catCosta();
}

function catCosta() {
    if (!CUSTFINDOC.CCCSUBANTREPRENOR) {
        X.WARNING('Nu am partener.');
        return;
    }

    if (!CUSTFINDOC.PRJC) {
        X.WARNING('Nu am proiect.');
        return;
    }

    if (!CUSTFINDOC.CCCACTIVITATE) {
        X.WARNING('Nu am activitate.');
    }

    //debugger;
    var pret = X.SQL('select isnull(PRETACTIVITUM, 0) PRETACTIVITUM from CCCSUBANTRACTIVIT ' +
        'where prjc=' + CUSTFINDOC.PRJC + ' and subantreprenor=' + CUSTFINDOC.CCCSUBANTREPRENOR + ' and cccactivitate=' + CUSTFINDOC.CCCACTIVITATE, null);
    if (CUSTFINDOC.CCCACTIVITATE && pret) {
        if (parseFloat(pret.replace(/,/g, '.'))) {
            CUSTFINDOC.CCCCOSTACTIVITATE1 = CUSTFINDOC.CCCREALIZATZI * parseFloat(pret.replace(/,/g, '.'));
        } else {
            X.EXCEPTION('Aceasta activitate nu are pret (Proiect/Subantreprenori).');
        }
    } else {
        X.EXCEPTION('Aceasta activitate nu se regaseste in Proiect/Subantreprenori.');
    }
}

//tablou bidimensional cu inregistrarile documentului curent
var dsCustLines = new Array();
var nCustLines = 0;

//functia de verificare a duplicatelor din documentul curent
function Verify(Prsn, Prjc, Date, Activity) {
    var Bool = 0;

    for (i = 0; i < nCustLines; i++) {
        if ((dsCustLines[i][0] == Prsn) && (dsCustLines[i][1] == Prjc) && (dsCustLines[i][2] == formatDate(Date)) && (dsCustLines[i][3] == Activity)) {
            Bool = Bool + 1;
        }
    }
    return Bool;
}

function formatDateException(dDateV) {
    /*var dDate = new Date (dDateV);
    var nDay = dDate.getDate();
    var nMonth = dDate.getMonth() + 1;
    var nYear = dDate.getYear();
    var sDay = '';
    var SMonth = '';
    var sYear = nYear.toString();
    if (nMonth < 10){
    sMonth = '0' + nMonth.toString();
    }
    else{
    sMonth = nMonth.toString();
    }

    if (nDay < 10){
    sDay = '0' + nDay.toString();
    }
    else{
    sDay = nDay.toString();
    }

    var sValue = sDay + '/' + sMonth + '/' + sYear ;
    return  sValue;*/
    strDt = X.FORMATDATE('YYYYMMDD', dDateV);
    return strDt;

}

function ON_CUSTLINES_CINT03() {
    if (CUSTLINES.CINT03 != 100) {
        if ((CUSTLINES.CINT03 == 100) || (CUSTLINES.CINT03 == 300) || (CUSTLINES.CINT03 == 400) || (CUSTLINES.CINT03 == 500) || (CUSTLINES.CINT03 == 202)) {
            CUSTLINES.CNUM01 = 8;
        } else {
            if (CUSTLINES.CINT03 == 201) {
                CUSTLINES.CNUM01 = 8 * 75 / 100;
            }

            if (CUSTLINES.CINT03 == 203) {
                CUSTLINES.CNUM01 = 8 * 85 / 100;
            }

            if (CUSTLINES.CINT03 == 205) {
                CUSTLINES.CNUM01 = 8 * 80 / 100;
            }

            if (CUSTLINES.CINT03 == 204) {
                CUSTLINES.CNUM01 = 8 * 15 / 100;
            }
        }

    }
}

function ON_CUSTLINES_CINT01() {
    sSQL = 'SELECT    C.name  as nume FROM   prsn A  left outer join prsextra B on A.prsn=B.prsn  left outer join utbl02 C on B.utbl02= C.utbl02 WHERE  A.sodtype = 20 and A.company=' + X.SYS.COMPANY + ' and C.sodtype=20 and C.company=' + X.SYS.COMPANY + ' and A.prsn = ' + CUSTLINES.CINT01;
    ds = X.GETSQLDATASET(sSQL, '');

    CUSTLINES.CSTR05 = ds.nume;

    if ((CUSTLINES.CCCDEPLASAREPTJ != null) && (CUSTLINES.CCCDEPLASAREPTJ != '')) {
        var prsn = CUSTLINES.CINT01;
        var dep = CUSTLINES.CCCDEPLASAREPTJ;
        var data = X.EVAL('SQLDATE(CUSTLINES.CDAT02)');
        var linie = CUSTLINES.LINENUM;
        var verif = 0;

        if (CUSTLINES.CINT02 && CUSTLINES.CINT01) {
            CUSTLINES.FIRST;
            while (!CUSTLINES.Eof) {
                if ((CUSTLINES.CINT01 == prsn) && (CUSTLINES.CCCDEPLASAREPTJ != dep) && (X.EVAL('SQLDATE(CUSTLINES.CDAT02)') == data) && (CUSTLINES.LINENUM != linie)) {
                    verif = 1;
                }
                CUSTLINES.NEXT;
            }

            if (verif == 1) {
                X.EXCEPTION(' Atentie! Acest angajat: ' + CUSTLINES.CINT01_PRSNIN_NAME2 + ' a mai fost pontat in aceeasi zi cu deplasare diferita!');
            }

        }
    }

}

function ON_CUSTLINES_CNUM01() {
    if (CUSTLINES.CCCSPORSEPTJ == 1) {
        CUSTLINES.CNUM05 = CUSTLINES.CNUM01 * 0.1;
    } else {
        CUSTLINES.CNUM05 = null;
    }

    if ((CUSTLINES.CINT08 == 6) || (CUSTLINES.CINT08 == 12) || (CUSTLINES.CINT08 == 18)) {
        CUSTLINES.CNUM04 = CUSTLINES.CNUM01;
    } else {
        CUSTLINES.CNUM04 = 0;
    }
}

//la calcul de cantitate realizata in zi facem sume si restrictii
function ON_CUSTFINDOC_CCCREALIZATZI() {
    sSQLA = 'SELECT sum(isnull(A.CCCREALIZATZI,0)) CCCREALIZATOP FROM   findoc A WHERE  A.company = ' + X.SYS.COMPANY + ' AND A.sosource = 1011 AND A.fprms IN ( 1011 ) and A.CCCMTRCATEGORY=' + CUSTFINDOC.CCCMTRCATEGORY + '  and A.CCCCOMMENTS2=\'' + CUSTFINDOC.CCCCOMMENTS2 + '\' and A.CCCFINDOCOP=' + CUSTFINDOC.CCCFINDOCOP + '   and A.CCCMTRLINES=' + CUSTFINDOC.CCCMTRLINES;
    dsA = X.GETSQLDATASET(sSQLA, null);

    if (CUSTFINDOC.FINDOC > 0) {
        sSQLB = 'SELECT A.CCCREALIZATZI  FROM   findoc A WHERE  A.findoc= ' + CUSTFINDOC.FINDOC;
        dsB = X.GETSQLDATASET(sSQLB, null);

        CUSTFINDOC.CCCREALIZATOP = CUSTFINDOC.CCCREALIZATZI + dsA.CCCREALIZATOP - dsB.CCCREALIZATZI;
    } else {
        CUSTFINDOC.CCCREALIZATOP = CUSTFINDOC.CCCREALIZATZI + dsA.CCCREALIZATOP;
    }

    if (CUSTFINDOC.CCCQTY1 < CUSTFINDOC.CCCREALIZATOP) {
        X.WARNING('Atentie cantitatea realizata pe operatie ' + CUSTFINDOC.CCCREALIZATOP + ', depaseste cantitatea de pe fisa limita.');
    }

    catCosta();
}

function ON_CUSTFINDOC_PRJC() {
    if (CUSTFINDOC.PRJC) {
        var ds = X.GETSQLDATASET('select isnull(findoc, 0) FINDOC, ISNULL(CCCHEADER, 0) CCCHEADER from findoc where company =' + X.SYS.COMPANY +
            ' AND sosource = 1351  AND series = 4067  AND prjc = ' + CUSTFINDOC.PRJC, null);
        if (!ds.FINDOC) {
            X.EXCEPTION('Nu gasesc fisa limita aferenta acestu proiect.');
        } else {
            CUSTFINDOC.CCCFINDOCOP = ds.FINDOC;
        }

        if (ds.CCCHEADER) {
            CUSTFINDOC.CCCHEADER = ds.CCCHEADER;
        }

    }
}

function ON_CUSTFINDOC_CCCACTIVITATE() {
    var a = CUSTFINDOC.CCCSPECIALITATESF ? ' AND CCCSPECIALITATESF=ISNULL(' + CUSTFINDOC.CCCSPECIALITATESF + ', 0)' : '';
    var b = CUSTFINDOC.CCCSF ? ' AND CCCSF=ISNULL(' + CUSTFINDOC.CCCSF + ', 0)' : '';
    var c = CUSTFINDOC.CCCCOLECTIESF ? ' AND CCCCOLECTIESF=ISNULL(' + CUSTFINDOC.CCCCOLECTIESF + ', 0)' : '';
    var d = CUSTFINDOC.CCCTABLOURI ? ' AND CCCTABLOURI=ISNULL(' + CUSTFINDOC.CCCTABLOURI + ', 0)' : '';
    var e = CUSTFINDOC.CCCCLADIRE ? ' AND CCCCLADIRE=ISNULL(' + CUSTFINDOC.CCCCLADIRE + ', 0)' : '';
    var f = CUSTFINDOC.CCCPRIMARYSPACE ? ' AND CCCPRIMARYSPACE=ISNULL(' + CUSTFINDOC.CCCPRIMARYSPACE + ', 0)' : '';
    var g = CUSTFINDOC.CCCSECONDARYSPACE ? ' AND CCCSECONDARYSPACE=ISNULL(' + CUSTFINDOC.CCCSECONDARYSPACE + ', 0)' : '';
    var h = CUSTFINDOC.CCCINCAPERE ? ' AND CCCINCAPERE=ISNULL(' + CUSTFINDOC.CCCINCAPERE + ', 0)' : '';
    var i = CUSTFINDOC.CCCCOLECTIE ? ' AND CCCCOLECTIE=ISNULL(' + CUSTFINDOC.CCCCOLECTIE + ', 0)' : '';
    var j = CUSTFINDOC.CCCCAPITOL ? ' AND CCCCAPITOL=ISNULL(' + CUSTFINDOC.CCCCAPITOL + ', 0)' : '';
    var k = CUSTFINDOC.CCCGRUPALUCRARI ? ' AND CCCGRUPALUCRARI=ISNULL(' + CUSTFINDOC.CCCGRUPALUCRARI + ', 0)' : '';
    var l = CUSTFINDOC.CCCACTIVITATE ? ' AND CCCACTIVITATE=ISNULL(' + CUSTFINDOC.CCCACTIVITATE + ', 0)' : '';
    var m = CUSTFINDOC.INT01 ? ' AND CCCCIRCUIT=ISNULL(' + CUSTFINDOC.INT01 + ', 0)' : '';
    var n = CUSTFINDOC.INT01 ? ' AND INT01=ISNULL(' + CUSTFINDOC.INT01 + ', 0)' : '';
    if (CUSTFINDOC.CCCACTIVITATE) {
        var q = 'select isnull(qty1,0) qty1 from mtrlines ' +
            'where sodtype= 52 and company=' + X.SYS.COMPANY + ' and findoc = ' + CUSTFINDOC.CCCFINDOCOP +
            a + b + c + d + e + f + g + h + i + j + k + l + m;

        CUSTFINDOC.CCCQTY1 = X.SQL(q, null);
        q = 'select isnull(sum(isnull(cccrealizatzi,0)), 0) cccrealizatzi from findoc where company=' + X.SYS.COMPANY +
            ' and sosource=1011 and fprms=1011 and prjc=' + CUSTFINDOC.PRJC +
            a + b + c + d + e + f + g + h + i + j + k + l + n;

        CUSTFINDOC.CCCREALIZATOP = X.SQL(q, null);
    }
}

function ON_DELETE() {
    X.RUNSQL('update mtrlines set bool02=0 where findoc=' + CUSTLINES.CINT05 + ' and cccspecializare= ' + CUSTFINDOC.CCCSPECIALIZARE + ' and ccccolectie=' + CUSTFINDOC.CCCCOLECTIE +
        ' and ccccapitol=' + CUSTFINDOC.CCCCAPITOL + ' and cccgrupalucrari=' + CUSTFINDOC.CCCGRUPALUCRARI + ' and cccactivitate= ' + CUSTFINDOC.CCCACTIVITATE +
        ' and cccspecialitatesf=' + CUSTFINDOC.CCCSPECIALITATESF + ' and cccsf= ' + CUSTFINDOC.CCCSF + ' and ccccolectiesf=' + CUSTFINDOC.CCCCOLECTIESF +
        ' and ccctablouri =  ' + CUSTFINDOC.CCCTABLOURI + ' and ccccircuit=' + CUSTFINDOC.INT01 + ' and CCCMTRLGEN=' + CUSTFINDOC.INT02 +
        ' and ccccladire=' + CUSTFINDOC.CCCCLADIRE + 'and cccprimaryspace= ' + CUSTFINDOC.CCCPRIMARYSPACE + ' and cccsecondaryspace=' + CUSTFINDOC.CCCSECONDARYSPACE + ' and cccincapere=' + CUSTFINDOC.CCCINCAPERE, null);
}