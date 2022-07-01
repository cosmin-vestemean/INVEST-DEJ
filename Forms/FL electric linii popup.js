//write function for following fields: CCCSPECIALITATESF, CCCSF, CCCCOLECTIESF, CCCTABLOURI, CCCCIRCUIT, CCCMTRLGEN, CCCCLADIRE, CCCPRIMARYSPACE, CCCSECONDARYSPACE, CCCINCAPERE,
//CCCSPECIALIZARE, CCCCOLECTIE, CCCCAPITOL, CCCGRUPALUCRARI, CCCACTIVITATE

function ON_SALDOC_CCCFILTRUSPECIALITATESF() {
    if (SALDOC.BOOL01)
        SALDOC.CCCFILTRUSF = null;
    else
        reevaluateFilter();
}

function ON_SALDOC_CCCFILTRUSF() {
    if (SALDOC.BOOL01)
        SALDOC.CCCFILTRUCOLECTIESF = null;
    else
        reevaluateFilter();
}

function ON_SALDOC_CCCFILTRUCOLECTIESF() {
    reevaluateFilter();
}

function ON_SALDOC_CCCFILTRUTABLOU() {
    if (SALDOC.BOOL01)
        SALDOC.CCCFILTRUOBIECTCM = null;
    else
        reevaluateFilter();
}

function ON_SALDOC_CCCFILTRUOBIECTCM() {
    if (SALDOC.BOOL01)
        SALDOC.CCCFILTRUDEVIZCM = null;
    else
        reevaluateFilter();
}

function ON_SALDOC_CCCFILTRUDEVIZCM() {
    reevaluateFilter();
}

function ON_SALDOC_CCCCLADIRE() {
    if (SALDOC.BOOL01)
        SALDOC.CCCPRIMARYSPACE = null;
    else
        reevaluateFilter();
}

function ON_SALDOC_CCCPRIMARYSPACE() {
    if (SALDOC.BOOL01)
        SALDOC.CCCSECONDARYSPACE = null;
    else
        reevaluateFilter();
}

function ON_SALDOC_CCCSECONDARYSPACE() {
    if (SALDOC.BOOL01)
        SALDOC.CCCINCAPERE = null;
    else
        reevaluateFilter();
}

function ON_SALDOC_CCCINCAPERE() {
    reevaluateFilter();
}

function ON_SALDOC_CCCSPECIALIZARE() {
    if (SALDOC.BOOL01)
        SALDOC.CCCCOLECTIE = null;
    else
        reevaluateFilter();
}

function ON_SALDOC_CCCCOLECTIE() {
    if (SALDOC.BOOL01)
        SALDOC.CCCCAPITOL = null;
    else
        reevaluateFilter();
}

function ON_SALDOC_CCCCAPITOL() {
    if (SALDOC.BOOL01)
        SALDOC.CCCGRUPALUCRARI = null;
    else
        reevaluateFilter();
}

function ON_SALDOC_CCCGRUPALUCRARI() {
    if (SALDOC.BOOL01)
        SALDOC.CCCACTIVITATE = null;
    else
        reevaluateFilter();
}

function ON_SALDOC_CCCACTIVITATE() {
    reevaluateFilter();
}

function reevaluateFilter() {
    //filtru cumulativ
    var a = stareaActualaFiltre(1),
        b = stareaActualaFiltre(2);

    if (a) {
        ITELINES.FILTER = '(' + a + ')';
        ITELINES.FILTERED = 1;
    } else {
        ITELINES.FILTERED = 0;
    }

    if (b) {
        SRVLINES.FILTER = '(' + b + ')';
        SRVLINES.FILTERED = 1;
    } else {
        SRVLINES.FILTERED = 0;
    }
}

function stareaActualaFiltre(filtrulSeAplicaPe) {
    //1 = ITELINES, 2 = SRVLINES, 0 = oricare din cele 2
    var ret = '',
        mapDs = {
            1: 'ITELINES',
            2: 'SRVLINES'
        },
        dsName = mapDs[filtrulSeAplicaPe] + '.',
        arr_filter_fields = [{
                filter: SALDOC.CCCFILTRUSPECIALITATESF,
                field: dsName + 'CCCSPECIALITATESF',
                ds: 0
            }, {
                filter: SALDOC.CCCFILTRUSF,
                field: dsName + 'CCCSF',
                ds: 0
            }, {
                filter: SALDOC.CCCFILTRUCOLECTIESF,
                field: dsName + 'CCCCOLECTIESF',
                ds: 0
            }, {
                filter: SALDOC.CCCFILTRUTABLOU,
                field: dsName + 'CCCTABLOURI',
                ds: 0
            }, {
                filter: SALDOC.CCCFILTRUOBIECTCM,
                field: dsName + 'CCCCIRCUIT',
                ds: 0
            }, {
                filter: SALDOC.CCCFILTRUDEVIZCM ? X.SQL('select cccmtrlgen from cccconsumator where cccconsumator=' + SALDOC.CCCFILTRUDEVIZCM, null) : null,
                field: dsName + 'CCCMTRLGEN',
                ds: 0
            }, {
                filter: SALDOC.CCCLADIRE,
                field: dsName + 'CCCCLADIRE',
                ds: 0
            }, {
                filter: SALDOC.CCCPRIMARYSPACE,
                field: dsName + 'CCCPRIMARYSPACE',
                ds: 0
            }, {
                filter: SALDOC.CCCSECONDARYSPACE,
                field: dsName + 'CCCSECONDARYSPACE',
                ds: 0
            }, {
                filter: SALDOC.CCCINCAPERE,
                field: dsName + 'CCCINCAPERE',
                ds: 0
            }, {
                filter: SALDOC.CCCSPECIALIZARE,
                field: dsName + 'CCCSPECIALIZARE',
                ds: 2
            },
            {
                filter: SALDOC.CCCCOLECTIE,
                field: dsName + 'CCCCOLECTIE',
                ds: 2
            }, {
                filter: SALDOC.CCCCAPITOL,
                field: dsName + 'CCCCAPITOL',
                ds: 2
            }, {
                filter: SALDOC.CCCGRUPALUCRARI,
                field: dsName + 'CCCGRUPALUCRARI',
                ds: 2
            }, {
                filter: SALDOC.CCCACTIVITATE,
                field: dsName + 'CCCACTIVITATE',
                ds: 2
            }
        ];

    for (var i = 0; i < arr_filter_fields.length; i++) {
        if (arr_filter_fields[i].filter) {
            if (!arr_filter_fields[i].ds || arr_filter_fields[i].ds == filtrulSeAplicaPe) {
                ret += '{' + arr_filter_fields[i].field + '}=' + arr_filter_fields[i].filter + ' AND ';
            }
        }
    }

    if (ret) {
        //am un ' AND ' (5 caractere) care ma incurca la sfarsitul frazei
        ret = ret.substring(0, ret.length - 5);
    }

    return ret;
}

//TODO: pass intDataset as parameter and use it to filter ITELINES and SRVLINES
function ON_SALDOC_BOOL01() {
    var whHeader1 = ' AND A.CCCHEADER=:SALDOC.CCCHEADER])',
        whHeader2 = '(W(A.CCCHEADER=:SALDOC.CCCHEADER)]';


    X.SETFIELDEDITOR('SALDOC.CCCTABLOURI', 'CCCTABLOURI' + whHeader2);
    X.SETFIELDEDITOR('SALDOC.CCCCLADIRE', 'CCCCLADIRE' + whHeader2);
    X.SETFIELDEDITOR('SALDOC.CCCSPECIALIZARE', 'CCCSPECIALIZARE');
    X.SETFIELDEDITOR('SALDOC.CCCCOLECTIE', 'CCCCOLECTIE(W[A.CCCSPECIALIZARE=:SALDOC.CCCSPECIALIZARE])');
    X.SETFIELDEDITOR('SALDOC.CCCCAPITOL', 'CCCCAPITOL(W[A.CCCCOLECTIE=:SALDOC.CCCCOLECTIE])');
    X.SETFIELDEDITOR('SALDOC.CCCGRUPALUCRARI', 'CCCGRUPALUCRARI(W[A.CCCCAPITOL=:SALDOC.CCCCAPITOL])');
    X.SETFIELDEDITOR('SALDOC.CCCACTIVITATE', 'CCCACTIVITATE(W[A.CCCGRUPALUCRARI=:SALDOC.CCCGRUPALUCRARI])');

    if (SALDOC.BOOL01 == 1) {
        X.SETFIELDEDITOR('SALDOC.CCCFILTRUSF', 'CCCSF(W[A.CCCSPECIALITATESF=:SALDOC.CCCFILTRUSPECIALITATESF])');
        X.SETFIELDEDITOR('SALDOC.CCCFILTRUCOLECTIESF', 'CCCCOLECTIESF(W[A.CCCSF=:SALDOC.CCCFILTRUSF])');
        X.SETFIELDEDITOR('SALDOC.CCCFILTRUOBIECTCM', 'CCCCIRCUIT(W[A.CCCTABLOU=:SALDOC.CCCFILTRUTABLOU' + whHeader1);
        X.SETFIELDEDITOR('SALDOC.CCCPRIMARYSPACE', 'CCCPRIMARYSPACE(W[A.CCCCLADIRE=:SALDOC.CCCCLADIRE' + whHeader1);
        X.SETFIELDEDITOR('SALDOC.CCCSECONDARYSPACE', 'CCCSECONDARYSPACE(W[A.CCCPRIMARYSPACE=:SALDOC.CCCPRIMARYSPACE' + whHeader1);
        X.SETFIELDEDITOR('SALDOC.CCCINCAPERE', 'CCCINCAPERE(W[A.CCCSECONDARYSPACE=:SALDOC.CCCSECONDARYSPACE' + whHeader1);
        X.SETFIELDEDITOR('SALDOC.CCCFILTRUDEVIZCM', 'CCCCONSUMATOR(W[A.CCCCONSUMATOR IN (SELECT DISTINCT CCCCONSUMATOR FROM CCCLINIICIRCUIT WHERE CCCCIRCUIT=:SALDOC.CCCFILTRUOBIECTCM)' + whHeader1);
    } else {
        X.SETFIELDEDITOR('SALDOC.CCCFILTRUSF', 'CCCSF');
        X.SETFIELDEDITOR('SALDOC.CCCFILTRUCOLECTIESF', 'CCCCOLECTIESF');
        X.SETFIELDEDITOR('SALDOC.CCCFILTRUOBIECTCM', 'CCCCIRCUIT' + whHeader2);
        X.SETFIELDEDITOR('SALDOC.CCCPRIMARYSPACE', 'CCCPRIMARYSPACE' + whHeader2);
        X.SETFIELDEDITOR('SALDOC.CCCSECONDARYSPACE', 'CCCSECONDARYSPACE' + whHeader2);
        X.SETFIELDEDITOR('SALDOC.CCCINCAPERE', 'CCCINCAPERE' + whHeader2);
        X.SETFIELDEDITOR('SALDOC.CCCFILTRUDEVIZCM', 'CCCCONSUMATOR' + whHeader2);
    }
}

function ON_LOCATE() {
    SALDOC.BOOL01 = 1;
}

function EXECCOMMAND(command) {
    if (command == '20211214') {
        var selectedMTRLINES1 = X.GETPROPERTY('GRIDSELECTED:MATERIALE|MTRLINES'),
            ArraySelMtrlines1 = selectedMTRLINES1.replace(/\r\n/g, ","),
            ArraySelMtrlines11 = ArraySelMtrlines1.substring(0, ArraySelMtrlines1.length - 1),
            selectedMTRLINES2 = X.GETPROPERTY('GRIDSELECTED:ACTIVITATI|MTRLINES'),
            ArraySelMtrlines2 = selectedMTRLINES2.replace(/\r\n/g, ","),
            ArraySelMtrlines22 = ArraySelMtrlines2.substring(0, ArraySelMtrlines2.length - 1);
        var totalSelectedMtrlines = '';
        if (ArraySelMtrlines11 != '' && ArraySelMtrlines22 != '') {
            totalSelectedMtrlines = ArraySelMtrlines11 + ',' + ArraySelMtrlines22;
        } else if (ArraySelMtrlines11 != '' && ArraySelMtrlines22 == '') {
            totalSelectedMtrlines = ArraySelMtrlines11;
        } else if (ArraySelMtrlines11 == '' && ArraySelMtrlines22 != '') {
            totalSelectedMtrlines = ArraySelMtrlines22;
        } else if (ArraySelMtrlines11 == '' && ArraySelMtrlines22 == '') {
            totalSelectedMtrlines = '';
        }
        if (totalSelectedMtrlines == '') {
            X.WARNING('Nu a fost selectat niciun element');
            return;
        }
        var dsSelected = X.GETSQLDATASET('select QTY1, SODTYPE, MTRL, CCCMTRLGEN, CCCTABLOURI, CCCCIRCUIT, CCCCLADIRE, CCCPRIMARYSPACE, CCCSECONDARYSPACE, CCCINCAPERE, ' +
                'CCCSPECIALITATESF, CCCSF, CCCCOLECTIESF, CCCSPECIALIZARE, CCCCOLECTIE, CCCCAPITOL, CCCGRUPALUCRARI, CCCACTIVITATE ' +
                'from MTRLINES where FINDOC=' + SALDOC.FINDOC + ' AND MTRLINES IN (' + totalSelectedMtrlines + ')', null),
            i = 1,
            vfl = X.CREATEOBJ('SALDOC');
        try {
            vfl.DBLOCATE(SALDOC.NUM01);
            var ite = vfl.findTable('ITELINES'),
                srv = vfl.findTable('SRVLINES'),
                ds;

            ite.Edit;
            srv.Edit;
            if (dsSelected.RECORDCOUNT > 0) {
                dsSelected.FIRST;
                while (!dsSelected.EOF) {
                    if (dsSelected.SODTYPE == 51) {
                        ds = ite;
                    } else if (dsSelected.SODTYPE == 52) {
                        ds = srv;
                    } else {
                        X.WARNING('Sodtype unknown.');
                        ds = null;
                    }
                    if (ds) {
                        ds.Append;
                        if (dsSelected.MTRL)
                            ds.MTRL = dsSelected.MTRL;
                        if (dsSelected.CCCMTRLGEN)
                            ds.CCCMTRLGEN = dsSelected.CCCMTRLGEN;
                        if (dsSelected.CCCTABLOURI)
                            ds.CCCTABLOURI = dsSelected.CCCTABLOURI;
                        if (dsSelected.CCCCIRCUIT)
                            ds.CCCCIRCUIT = dsSelected.CCCCIRCUIT;
                        if (dsSelected.CCCCLADIRE)
                            ds.CCCCLADIRE = dsSelected.CCCCLADIRE;
                        if (dsSelected.CCCPRIMARYSPACE)
                            ds.CCCPRIMARYSPACE = dsSelected.CCCPRIMARYSPACE;
                        if (dsSelected.CCCSECONDARYSPACE)
                            ds.CCCSECONDARYSPACE = dsSelected.CCCSECONDARYSPACE;
                        if (dsSelected.CCCINCAPERE)
                            ds.CCCINCAPERE = dsSelected.CCCINCAPERE;
                        if (dsSelected.CCCSPECIALITATESF)
                            ds.CCCSPECIALITATESF = dsSelected.CCCSPECIALITATESF;
                        if (dsSelected.CCCSF)
                            ds.CCCSF = dsSelected.CCCSF;
                        if (dsSelected.CCCCOLECTIESF)
                            ds.CCCCOLECTIESF = dsSelected.CCCCOLECTIESF;
                        if (dsSelected.CCCSPECIALIZARE)
                            ds.CCCSPECIALIZARE = dsSelected.CCCSPECIALIZARE;
                        if (dsSelected.CCCCOLECTIE)
                            ds.CCCCOLECTIE = dsSelected.CCCCOLECTIE;
                        if (dsSelected.CCCCAPITOL)
                            ds.CCCCAPITOL = dsSelected.CCCCAPITOL;
                        if (dsSelected.CCCGRUPALUCRARI)
                            ds.CCCGRUPALUCRARI = dsSelected.CCCGRUPALUCRARI;
                        if (dsSelected.CCCACTIVITATE)
                            ds.CCCACTIVITATE = dsSelected.CCCACTIVITATE;
                        if (dsSelected.QTY1)
                            ds.CCCQTYFL = dsSelected.QTY1;
                        ds.Post;
                    }

                    dsSelected.NEXT;
                }
            }

            vfl.DBPOST;
        } catch (e) {
            X.WARNING(e.message);
        } finally {
            vfl.FREE;
            vfl = null;
        }

        X.CLOSEFORM();
    }

    if (command == '202205091') {
        SALDOC.CCCFILTRUSPECIALITATESF = null;
        SALDOC.CCCFILTRUSF = null;
        SALDOC.CCCFILTRUCOLECTIESF = null;
        SALDOC.CCCSPECIALIZARE = null;
        SALDOC.CCCCOLECTIE = null;
        SALDOC.CCCCAPITOL = null;
        SALDOC.CCCGRUPALUCRARI = null;
        SALDOC.CCCACTIVITATE = null;
        SALDOC.CCCCLADIRE = null;
        SALDOC.CCCPRIMARYSPACE = null;
        SALDOC.CCCSECONDARYSPACE = null;
        SALDOC.CCCINCAPERE = null;
        SALDOC.CCCFILTRUTABLOU = null;
        SALDOC.CCCFILTRUOBIECTCM = null;
        SALDOC.CCCFILTRUDEVIZCM = null;
        ITELINES.FILTER = '';
        ITELINES.FILTERED = false;
        SRVLINES.FILTER = '';
        SRVLINES.FILTERED = false;
    }
}