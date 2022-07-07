lib.include('utils');

var fistTime = false,
    witchTab = '';

function ON_POST() {
    if (SALDOC.CCCFLMR > 0) {
        ITELINES.FIRST;
        while (!ITELINES.EOF()) {
            if (ITELINES.ISNULL('FINDOCS') == 1) {
                ITELINES.FINDOCS = SALDOC.CCCFLMR;
            }
            ITELINES.NEXT;
        }

        SRVLINES.FIRST;
        while (!SRVLINES.EOF()) {
            if (SRVLINES.ISNULL('FINDOCS') == 1)
                SRVLINES.FINDOCS = SALDOC.CCCFLMR;
            SRVLINES.NEXT;
        }
    }

    if (SALDOC.FINDOC > 0) {
        var dsStare = X.GETSQLDATASET('select isnull(cccstatus,0) stare from findoc where findoc=' + SALDOC.FINDOC, null);
        if ((SALDOC.SERIES == 4074 && dsStare.stare == 2124) || (SALDOC.SERIES == 4078 && dsStare.stare == 2132) || (SALDOC.SERIES == 4076 && dsStare.stare == 2127) || (SALDOC.SERIES == 4077 && dsStare.stare == 2130)) //validat
        {
            X.EXCEPTION('AFL-ul a fost deja actualizat!')
        }
    }
}

function ON_AFTERPOST() {
    //debugger;
    var r = -1,
        fin = parseInt(SALDOC.FINDOC) > 0 ? parseInt(SALDOC.FINDOC) : X.NEWID,
        q = 'select fincode from findoc where findoc=' + fin,
        fcode = SALDOC.FINCODE != '' ? SALDOC.FINCODE : X.SQL(q, null);
    if (SALDOC.CCCTABLOURI && SALDOC.INT01 && (ITELINES.RECORDCOUNT || SRVLINES.RECORDCOUNT) && ((SALDOC.SERIES == 4074 && SALDOC.CCCSTATUS == 2124) || (SALDOC.SERIES == 4078 && SALDOC.CCCSTATUS == 2132) || (SALDOC.SERIES == 4076 && SALDOC.CCCSTATUS == 2127) || (SALDOC.SERIES == 4077 && SALDOC.CCCSTATUS == 2130))) {
        if (ITELINES.RECORDCOUNT)
            actual(ITELINES, 'ITELINES', fcode);
        if (SRVLINES.RECORDCOUNT)
            actual(SRVLINES, 'SRVLINES', fcode);
    }
}

function ON_SALDOC_PRJC() {
    if (!SALDOC.PRJC)
        return;

    sSQL = 'select TRDBRANCH from prjc where prjc=' + SALDOC.PRJC;
    RD = X.GETSQLDATASET(sSQL, '');

    if (RD.TRDBRANCH)
        SALDOC.TRDBRANCH = RD.TRDBRANCH;

    sSQL = 'select varchar02,varchar03,varchar04 from prjextra where prjc=' + SALDOC.PRJC;
    RCCC = X.GETSQLDATASET(sSQL, '');

    if (RCCC.varchar03)
        SALDOC.CCCNRCME = RCCC.varchar03;
    if (RCCC.varchar04)
        SALDOC.CCCNRCTR = RCCC.varchar04;
    if (RCCC.varchar02)
        SALDOC.CCCNRCOM = RCCC.varchar02;

    //completare FL
    sSQLFLC = 'select count(findoc) contor from findoc where series = 4067 and prjc=' + SALDOC.PRJC;
    dsFLC = X.GETSQLDATASET(sSQLFLC, null);

    if (dsFLC.contor == 1) {
        sSQLFL = 'select ISNULL(findoc, 0) findoc, ISNULL(CCCRESP, 0) CCCRESP, ISNULL(CCCPERSCONST, 0) CCCPERSCONST, ISNULL(CCCHEADER, 0) CCCHEADER ' +
            'from findoc where series = 4067 and prjc=' + SALDOC.PRJC;
        dsFL = X.GETSQLDATASET(sSQLFL, null);

        if (dsFL.findoc)
            SALDOC.CCCFLMR = dsFL.findoc;
        if (dsFL.CCCHEADER)
            SALDOC.CCCHEADER = dsFL.CCCHEADER;
        if (dsFL.CCCRESP)
            SALDOC.CCCRESP = dsFL.CCCRESP;
        if (dsFL.CCCPERSCONST)
            SALDOC.CCCPERSCONST = dsFL.CCCPERSCONST;
    } else {
        X.WARNING('Nu gasesc fisa limita.');
    }
}

function nullFL() {
    var arr = ['CCCMTRLGEN', 'CCCTABLOURI', 'CCCCIRCUIT', 'CCCCLADIRE', 'CCCPRIMARYSPACE', 'CCCSECONDARYSPACE', 'CCCINCAPERE', 'CCCSPECIALITATESF', 'CCCSF', 'CCCCOLECTIESF', 'CCCCOLECTIE', 'CCCCAPITOL', 'CCCGRUPALUCRARI', 'CCCACTIVITATE'];
    for (var i = 0; i < arr.length; i++) {
        var q = 'update mtrlines set ' + arr[i] + '=null where findoc=' + SALDOC.CCCFLMR + ' and isnull(' + arr[i] + ', 0)=0';
        X.RUNSQL(q, null);
    }
}

function actual(ds, strDs, vFINCODE) {
    nullFL();

    var o = X.CreateObj('SALDOC');

    try {
        o.DBLocate(SALDOC.CCCFLMR);
        var s = o.FindTable(strDs);
        var myFindoc = SALDOC.FINDOC > 0 ? SALDOC.FINDOC : X.NEWID,
            nrLin = X.SQL('select isnull(max(mtrlines), 0) +1 from mtrlines where findoc=' + SALDOC.CCCFLMR, null);
        ds.FIRST;
        while (!ds.EOF()) {
            var a = ds.ISNULL('CCCMTRLGEN') == 1 ? null : ds.CCCMTRLGEN,
                b = ds.ISNULL('CCCTABLOURI') == 1 ? null : ds.CCCTABLOURI,
                c = ds.ISNULL('CCCCIRCUIT') == 1 ? null : ds.CCCCIRCUIT,
                d = ds.ISNULL('CCCCLADIRE') == 1 ? null : ds.CCCCLADIRE,
                e = ds.ISNULL('CCCPRIMARYSPACE') == 1 ? null : ds.CCCPRIMARYSPACE,
                f = ds.ISNULL('CCCSECONDARYSPACE') == 1 ? null : ds.CCCSECONDARYSPACE,
                g = ds.ISNULL('CCCINCAPERE') == 1 ? null : ds.CCCINCAPERE,
                h = ds.ISNULL('CCCSPECIALITATESF') == 1 ? null : ds.CCCSPECIALITATESF,
                i = ds.ISNULL('CCCSF') == 1 ? null : ds.CCCSF,
                j = ds.ISNULL('CCCCOLECTIESF') == 1 ? null : ds.CCCCOLECTIESF,
                k = ds.ISNULL('CCCCOLECTIE') == 1 ? null : ds.CCCCOLECTIE,
                l = ds.ISNULL('CCCCAPITOL') == 1 ? null : ds.CCCCAPITOL,
                m = ds.ISNULL('CCCGRUPALUCRARI') == 1 ? null : ds.CCCGRUPALUCRARI,
                n = ds.ISNULL('CCCACTIVITATE') == 1 ? null : ds.CCCACTIVITATE,

                strLoc = 'FINDOC;MTRL;CCCMTRLGEN;CCCTABLOURI;CCCCIRCUIT;' +
                'CCCCLADIRE;CCCPRIMARYSPACE;CCCSECONDARYSPACE;CCCINCAPERE;' +
                'CCCSPECIALITATESF;CCCSF;CCCCOLECTIESF;' +
                'CCCCOLECTIE;CCCCAPITOL;CCCGRUPALUCRARI;CCCACTIVITATE',
                aa = s.LOCATE(strLoc, SALDOC.CCCFLMR, ds.MTRL, a, b, c, d, e, f, g, h, i, j, k, l, m, n);

            if (aa) {
                //update cu null
            } else {
                //insert
                s.APPEND;
                s.MTRL = ds.MTRL;
                s.MTRLINES = nrLin;
                nrLin++;
            }

            if (ds.CCCTABLOURI)
                s.CCCTABLOURI = ds.CCCTABLOURI;
            if (CCCCIRCUIT)
                s.CCCCIRCUIT = ds.CCCCIRCUIT;
            if (ds.CCCMTRLGEN)
                s.CCCMTRLGEN = ds.CCCMTRLGEN;
            if (ds.CCCCLADIRE)
                s.CCCCLADIRE = ds.CCCCLADIRE;
            if (ds.CCCPRIMARYSPACE)
                s.CCCPRIMARYSPACE = ds.CCCPRIMARYSPACE;
            if (ds.CCCSECONDARYSPACE)
                s.CCCSECONDARYSPACE = ds.CCCSECONDARYSPACE;
            if (ds.CCCINCAPERE)
                s.CCCINCAPERE = ds.CCCINCAPERE;
            if (ds.CCCSPECIALITATESF)
                s.CCCSPECIALITATESF = ds.CCCSPECIALITATESF;
            if (ds.CCCSF)
                s.CCCSF = ds.CCCSF;
            if (ds.CCCCOLECTIESF)
                s.CCCCOLECTIESF = ds.CCCCOLECTIESF;
            if (ds.CCCSPECIALIZARE)
                s.CCCSPECIALIZARE = ds.CCCSPECIALIZARE;
            if (ds.CCCCOLECTIE)
                s.CCCCOLECTIE = ds.CCCCOLECTIE;
            if (ds.CCCCAPITOL)
                s.CCCCAPITOL = ds.CCCCAPITOL;
            if (ds.CCCGRUPALUCRARI)
                s.CCCGRUPALUCRARI = ds.CCCGRUPALUCRARI;
            if (ds.CCCACTIVITATE)
                s.CCCACTIVITATE = ds.CCCACTIVITATE;
            s.QTY1 += ds.QTY1;
            if (ds.CCCUM)
                s.CCCUM = ds.CCCUM;
            s.FINDOCS = myFindoc;
            s.CCCNCSMRS += vFINCODE + ';';
            if (ds.MTRCATEGORY)
                s.MTRCATEGORY = ds.MTRCATEGORY;
            if (ds.WHOUSE)
                s.WHOUSE = ds.WHOUSE;
            s.POST;

            ds.NEXT;
        }

        var id = o.DBPost;
        if (id) {
            X.WARNING('FL actualizata.');
        }
    } catch (err) {
        X.WARNING(err.message);
    } finally {
        o.FREE;
        o = null;
    }
}

function EXECCOMMAND(cmd) {
    if (cmd == '20200221') {
        var ds = X.GETSQLDATASET('select COLECTIE, CAPITOL, GRUPALUCRARI, CCCACTIVITATE from CCCACTIVITATEPRJC where prjc=' + SALDOC.PRJC, null);
        if (ds.RECORDCOUNT) {
            ds.FIRST;
            while (!ds.EOF) {
                SRVLINES.APPEND;
                SRVLINES.MTRL = 13498;
                SRVLINES.CCCCOLECTIE = ds.COLECTIE;
                SRVLINES.CCCCAPITOL = ds.CAPITOL;
                SRVLINES.CCCGRUPALUCRARI = ds.GRUPALUCRARI;
                SRVLINES.CCCACTIVITATE = ds.CCCACTIVITATE;
                SRVLINES.POST;
                ds.NEXT;
            }
        }
    }

    if (cmd == 20200930) {
        //Populeaza lista CIRCUITE
        if (SALDOC.PRJC && SALDOC.CCCFLMR) {

            X.OPENSUBFORM('sfCircuite');
        }
    }
}

function ON_sfCircuite_ACCEPT() {}

function ON_CANCEL() {
    markLinesVarFL(ITELINES);
    //SRVLINES also
    markLinesVarFL(SRVLINES);
}

function ON_INSERT() {
    fistTime = true;
}

function ON_ITELINES_NEW() {
    ITELINES.CCCDVTVA = null;
    if (!cerinteLinie(ITELINES))
        return;

    if (!SALDOC.CCCTABLOURI || !SALDOC.INT01)
        return;
    if (SALDOC.CCCHEADER && SALDOC.INT01 && !SALDOC.CCCSERVICIU) {
        witchTab = 'ITE';
        X.OPENSUBFORM('SFLINIICIRCUIT');
    }
}

function cerinteLinie(ds) {
    if (!SALDOC.CCCTABLOURI || !SALDOC.INT01) {
        X.WARNING('Sursa si circuitul sunt obligatorii...');
        ds.DELETE;
        return false;
    }

    return true;
}

function ON_ITELINES_CCCMTRLGEN() {
    if (!cerinteLinie(ITELINES))
        return;
    if (ITELINES.CCCDVTVA) {
        ITELINES.MTRL = null;
        ITELINES.CCCCLADIRE = null;
        ITELINES.CCCPRIMARYSPACE = null;
        ITELINES.CCCSECONDARYSPACE = null;
        ITELINES.CCCSPECIALITATESF = null;
        ITELINES.CCCSF = null;
        ITELINES.CCCCOLECTIESF = null;
        X.OPENSUBFORM('SFLINIICIRCUIT');
    }
}

function ON_SRVLINES_NEW() {
    SRVLINES.MTRL = 13498;;
    if (!SALDOC.CCCTABLOURI || !SALDOC.INT01)
        return;
    if (SALDOC.CCCHEADER && SALDOC.INT01 && !SALDOC.CCCSERVICIU) {
        witchTab = 'SRV';
        X.OPENSUBFORM('SFLINIICIRCUIT');
    }
}

function ON_SFLINIICIRCUIT_SHOW() {
    if (witchTab == 'ITE') {
        ds = ITELINES;
        ITELINES.MTRL = 13499;
    } else if (witchTab == 'SRV') {
        ds = SRVLINES;
    }
    ds.CCCDVTVA = null;
}

function ON_SFLINIICIRCUIT_ACCEPT() {
    var ds,
        mm;

    if (witchTab == 'ITE') {
        ds = ITELINES;
        ITELINES.MTRL = 13499;
    } else if (witchTab == 'SRV') {
        ds = SRVLINES;
    }

    if (CCCCONLOC.CONSUMATOR == 'MATERIAL MARUNT') {
        if (CCCCONLOC.MTRL == 73724) {
            X.WARNING('Nu ati ales material marunt valid.');
            return
        } else {
            mm = CCCCONLOC.MTRL;
        }
    }

    if (CCCCONLOC.CCCCONSUMATOR) {
        ds.CCCMTRLGEN = CCCCONLOC.CCCCONSUMATOR;
        ds.CCCDVTVA = ITELINES.CCCMTRLGEN;
        //ds.MTRL = mm;
    }
    if (CCCCONLOC.CCCCLADIRE)
        ds.CCCCLADIRE = CCCCONLOC.CCCCLADIRE;
    if (CCCCONLOC.CCCPRIMARYSPACE)
        ds.CCCPRIMARYSPACE = CCCCONLOC.CCCPRIMARYSPACE;
    if (CCCCONLOC.CCCSECONDARYSPACE)
        ds.CCCSECONDARYSPACE = CCCCONLOC.CCCSECONDARYSPACE;
    if (CCCCONLOC.CCCINCAPERE)
        ds.CCCINCAPERE = CCCCONLOC.CCCINCAPERE;
    if (CCCCONLOC.SSF)
        ds.CCCSPECIALITATESF = CCCCONLOC.SSF;
    if (CCCCONLOC.SF)
        ds.CCCSF = CCCCONLOC.SF;
    if (CCCCONLOC.CSF)
        ds.CCCCOLECTIESF = CCCCONLOC.CSF;
}

function ON_SALDOC_INT01() {
    populeazaPopUp();

}

function ON_LOCATE() {
    populeazaPopUp();
    X.SETPROPERTY('MERGECHANGELOG', 'True');
}

function getConsumator(mm) {
    return "(select cccconsumator from cccconsumator where prjc=" + SALDOC.PRJC + " and cccheader=" + SALDOC.CCCHEADER + " and denumire='" + mm + "'";
}

function populeazaPopUp() {
    if (!SALDOC.CCCHEADER && !SALDOC.INT01)
        return;

    CCCCONLOC.FIRST;
    while (!CCCCONLOC.EOF) {
        CCCCONLOC.DELETE;
    }

    var q = 'SELECT BB.CCCMTRLGEN, AA.CCCCONSUMATOR, BB.DENUMIRE CONSUMATOR, AA.QTY CANT, ' +
        'AA.CCCCLADIRE, CC.DENUMIRE CLADIRE, ' +
        'AA.CCCPRIMARYSPACE, DD.DENUMIRE PRIMAR, ' +
        'AA.CCCSECONDARYSPACE, EE.DENUMIRE SECUNDAR, ' +
        'AA.CCCINCAPERE, FF.DENUMIRE INCAPERE, ' +
        'AA.CCCSPECIALITATESF, ' +
        'HH.NAME SPECIALITATESF, ' +
        'AA.CCCSF, ' +
        'II.NAME SF, ' +
        'AA.CCCCOLECTIESF, ' +
        'GG.NAME COLECTIESF ' +
        'FROM CCCLINIICIRCUIT AA ' +
        'LEFT JOIN CCCCONSUMATOR BB ON (AA.CCCCONSUMATOR=BB.CCCCONSUMATOR AND AA.CCCHEADER=BB.CCCHEADER) ' +
        'LEFT JOIN CCCCLADIRE CC ON (CC.CCCCLADIRE=AA.CCCCLADIRE) ' +
        'LEFT JOIN CCCPRIMARYSPACE DD ON (DD.CCCPRIMARYSPACE=AA.CCCPRIMARYSPACE) ' +
        'LEFT JOIN CCCSECONDARYSPACE EE ON (EE.CCCSECONDARYSPACE=AA.CCCSECONDARYSPACE) ' +
        'LEFT JOIN CCCINCAPERE FF ON (FF.CCCINCAPERE=AA.CCCINCAPERE) ' +
        'LEFT JOIN CCCSPECIALITATESF HH ON (HH.CCCSPECIALITATESF=AA.CCCSPECIALITATESF) ' +
        'LEFT JOIN CCCSF II ON (II.CCCSF=AA.CCCSF) ' +
        'LEFT JOIN CCCCOLECTIESF GG ON (GG.CCCCOLECTIESF=AA.CCCCOLECTIESF) ' +
        'WHERE AA.CCCHEADER = ' + SALDOC.CCCHEADER + ' AND AA.CCCCIRCUIT=' + SALDOC.INT01 +
        ' UNION ALL ' +
        'SELECT AA.CCCMTRLGEN, AA.CCCCONSUMATOR, AA.DENUMIRE CONSUMATOR, 1 CANT, ' +
        'AA.CCCCLADIRE, CC.DENUMIRE CLADIRE, ' +
        'AA.CCCPRIMARYSPACE, DD.DENUMIRE PRIMAR, ' +
        'AA.CCCSECONDARYSPACE, EE.DENUMIRE SECUNDAR, ' +
        'AA.CCCINCAPERE, FF.DENUMIRE INCAPERE, ' +
        'AA.CCCSPECIALITATESF, ' +
        'HH.NAME SPECIALITATESF, ' +
        'AA.CCCSF, ' +
        'II.NAME SF, ' +
        'AA.CCCCOLECTIESF, ' +
        'GG.NAME COLECTIESF ' +
        " FROM CCCCONSUMATOR AA " +
        'LEFT JOIN CCCCLADIRE CC ON (CC.CCCCLADIRE=AA.CCCCLADIRE) ' +
        'LEFT JOIN CCCPRIMARYSPACE DD ON (DD.CCCPRIMARYSPACE=AA.CCCPRIMARYSPACE) ' +
        'LEFT JOIN CCCSECONDARYSPACE EE ON (EE.CCCSECONDARYSPACE=AA.CCCSECONDARYSPACE) ' +
        'LEFT JOIN CCCINCAPERE FF ON (FF.CCCINCAPERE=AA.CCCINCAPERE) ' +
        'LEFT JOIN CCCSPECIALITATESF HH ON (HH.CCCSPECIALITATESF=AA.CCCSPECIALITATESF) ' +
        'LEFT JOIN CCCSF II ON (II.CCCSF=AA.CCCSF) ' +
        'LEFT JOIN CCCCOLECTIESF GG ON (GG.CCCCOLECTIESF=AA.CCCCOLECTIESF) ' +
        'WHERE AA.CCCHEADER = ' + SALDOC.CCCHEADER + " AND AA.DENUMIRE='MATERIAL MARUNT'";
    ds = X.GETSQLDATASET(q, null);

    if (ds.RECORDCOUNT) {
        ds.FIRST;
        while (!ds.EOF) {
            CCCCONLOC.APPEND;
            CCCCONLOC.CCCCONSUMATOR = ds.CCCMTRLGEN;
            CCCCONLOC.CONSUMATOR = ds.CONSUMATOR;
            CCCCONLOC.CANT = ds.CANT;
            CCCCONLOC.CCCCLADIRE = ds.CCCCLADIRE;
            CCCCONLOC.CLADIRE = ds.CLADIRE;
            CCCCONLOC.CCCPRIMARYSPACE = ds.CCCPRIMARYSPACE;
            CCCCONLOC.PRIMAR = ds.PRIMAR;
            CCCCONLOC.CCCSECONDARYSPACE = ds.CCCSECONDARYSPACE;
            CCCCONLOC.SECUNDAR = ds.SECUNDAR;
            CCCCONLOC.CCCINCAPERE = ds.CCCINCAPERE;
            CCCCONLOC.INCAPERE = ds.INCAPERE;
            CCCCONLOC.SSF = ds.CCCSPECIALITATESF;
            CCCCONLOC.SPECIALITATESF = ds.SPECIALITATESF;
            CCCCONLOC.SF = ds.CCCSF;
            CCCCONLOC.SISTEMFUNCTIONAL = ds.SF;
            CCCCONLOC.CSF = ds.CCCCOLECTIESF;
            CCCCONLOC.COLECTIESF = ds.COLECTIESF;
            if (CCCCONLOC.CONSUMATOR == 'MATERIAL MARUNT')
                CCCCONLOC.MTRL = 73724;
            if (CCCCONLOC.MTRL)
                CCCCONLOC.ARTICOL = X.SQL('select name from mtrl where mtrl=' + CCCCONLOC.MTRL, null);
            CCCCONLOC.POST;
            ds.NEXT;
        }
    }

    //X.SETPROPERTY('MERGECHANGELOG', 'True');
}

function ON_CCCCONLOC_MTRL() {
    if (!CCCCONLOC.MTRL)
        return;
    //mai tarziu
    if (CCCCONLOC.MTRL == 73725)
        return;
    if (CCCCONLOC.CONSUMATOR != 'MATERIAL MARUNT') {
        {
            CCCCONLOC.MTRL = 73725;
            return;
        }
    }
    //musai material marunt
    if (CCCCONLOC.MTRL == 73724)
        return;
    else
    if (CCCCONLOC.CONSUMATOR == 'MATERIAL MARUNT') {

        var eMM = X.SQL('select isnull(CCCESTEMATERIALMARUNT, 0) from mtrl where mtrl=' + CCCCONLOC.MTRL, null);
        if (eMM == 0) {
            X.WARNING('Articolul selectat nu este material marunt.');
            CCCCONLOC.MTRL = 73724;
        } else {
            X.WARNING('Este material marunt.\nVa fi preluat in linie.');
        }
    }
}

function ON_SRVLINES_CCCSPECIALIZARE() {
    SRVLINES.CCCCOLECTIE = null;
    SRVLINES.CCCCAPITOL = null;
    SRVLINES.CCCGRUPALUCRARI = null;
    SRVLINES.CCCACTIVITATE = null;
}

function ON_SRVLINES_CCCCOLECTIE() {
    SRVLINES.CCCCAPITOL = null;
    SRVLINES.CCCGRUPALUCRARI = null;
    SRVLINES.CCCACTIVITATE = null;
}

function ON_SRVLINES_CCCCAPITOL() {
    SRVLINES.CCCGRUPALUCRARI = null;
    SRVLINES.CCCACTIVITATE = null;
}

function ON_SRVLINES_CCCGRUPALUCRARI() {
    SRVLINES.CCCACTIVITATE = null;
}

function ON_INSERT() {
    if (X.LIST == 'AFL electric')
        SALDOC.SERIES = 4074;
    else if (X.LIST == 'NR electric')
        SALDOC.SERIES = 4076;
    else if (X.LIST == 'NCS electric')
        SALDOC.SERIES = 4077;
    else if (X.LIST == 'AFLM electric')
        SALDOC.SERIES = 4078
}

function ON_SALDOC_SERIES () {
    setEditors(series);
}

function ON_DELETE() {
    //loop thru lines and update ITELINES.CCCQTYNR = 0 WHERE  FINDOCS, MTRLINESS
    markLinesVarFL(ITELINES);

    //SRVLINES also
    markLinesVarFL(SRVLINES);

}

function markLinesVarFL(ds) {
    ds.FIRST;
    while (!ds.EOF) {
        markLineVarFL(ds);
        ds.NEXT;
    }
}

function ON_ITELINES_BEFOREDELETE() {
    markLineVarFL(ITELINES);
}

function ON_SRVLINES_BEFOREDELETE() {
    markLineVarFL(SRVLINES);
}

function markLineVarFL(ds) {
    if (ds.CCCQTYNR && ds.FINDOCS && ds.MTRLINESS) {
        var q = 'UPDATE MTRLINES SET CCCQTYNR = 0, CCCINT01 = NULL, CCCBULLSHIT1 = NULL WHERE FINDOC = ' + ds.FINDOCS + ' AND MTRLINES = ' + ds.MTRLINESS;
        X.RUNSQL(q, null);
    }
}