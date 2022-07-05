//vValoare=CUSTLINES.CNUM01 * CUSTLINES.CINT04_RSRC_HCOST
//vValoareKM=CUSTLINES.CNUM05 * CUSTLINES.CINT04_RSRC_NUM04
//UTBL02(W[SODTYPE=20 AND ISACTIVE=1])
//CCCSUBANTRPRJCV(W[A.PRJC=:SALDOC.PRJC])
//:SALDOC.CCCSUBANTREPRENOR
//:SALDOC.FINDOC
//:SALDOC.PRJC

/*
CREATE VIEW CCCSUBANTRPRJCV
AS
SELECT A.SUBANTREPRENOR AS CCCSUBANTREPRENOR
,B.NAME
,A.PRJC
FROM CCCSUBANTRPRJC A
INNER JOIN UTBL02 B ON (A.SUBANTREPRENOR=B.UTBL02 AND B.SODTYPE=20)


create table CCCMATERIALMARUNT (CCCMATERIALMARUNT PK, PRJC, CCCCHEADER, FINDOC, MTRLINES, MTRL, QTY1, CCCCIRCUIT)
alter table CCCMATERIALMARUNT ADD CCCCLADIRE INT, CCCPRIMARYSPACE INT, CCCSECONDARYSPACE INT,
CCCINCAPERE INT, CCCSPECIALITATESF INT, CCCSF INT, CCCCOLECTIESF INT, CCCTABLOURI INT, CCCMTRLGEN INT, MTRUNIT SMALLINT, CONVERTIT SMALLINT
 */

var zoomed = false,
    arrPrint = [{
        template: 30,
        table: ITELINES
    }, {
        template: 31,
        table: SRVLINES
    }];

function ON_POST() {
    ITELINES.FILTERED = 0;
    SRVLINES.FILTERED = 0;
}

function ON_SALDOC_CCCFLMR() {
    sSQLA = 'select count(*) contor from mtrlines where  findoc = ' + SALDOC.CCCFLMR + ' and sodtype =51 and prjcstage is not null and cccdeviz is not null';
    dsA = X.GETSQLDATASET(sSQLA, null);

    if (dsA.contor != 0) {
        X.SETFIELDEDITOR('SALDOC.PRJCSTAGE', 'PRJCSTAGE(W[CCCPRJC =:SALDOC.PRJC ])');
        X.SETFIELDEDITOR('SALDOC.CCCDEVIZECM', 'PRJLINES(W[PRJC =:SALDOC.PRJC and PRJLINES in (select * from AR_EDITOR_DEVIZ (:SALDOC.CCCFLMR, :SALDOC.PRJCSTAGE) )])');
        X.SETFIELDEDITOR('ITELINES.PRJCSTAGE', 'PRJCSTAGE(W[CCCPRJC =:SALDOC.PRJC ])');
        X.SETFIELDEDITOR('ITELINES.CCCDEVIZ', 'PRJLINES(W[PRJLINES in (select distinct CCCDEVIZ from mtrlines where findoc=:SALDOC.CCCFLMR and sodtype =51 and prjcstage=:SALDOC.PRJCSTAGE and cccdeviz is not null) and PRJC =:SALDOC.PRJC])');
        X.SETFIELDEDITOR('SRVLINES.PRJCSTAGE', 'PRJCSTAGE(W[CCCPRJC =:SALDOC.PRJC ])');
        X.SETFIELDEDITOR('SRVLINES.CCCDEVIZ', 'PRJLINES(W[PRJLINES in (select distinct CCCDEVIZ from mtrlines where findoc=:SALDOC.CCCFLMR and sodtype =51 and prjcstage=:SALDOC.PRJCSTAGE and cccdeviz is not null) and PRJC =:SALDOC.PRJC])');
    }
}

function xxx() {
    var ds1 = X.GETSQLDATASET("select CONCAT(REPLICATE('0', 8-LEN(CAST(MAX(right(FINCODE, 8)) + 1 AS VARCHAR(8)))), MAX(right(FINCODE, 8)) + 1) nr from FINDOC b where SOSOURCE=1351 AND SERIES = 4066 and b.company= " + X.SYS.COMPANY, null);
    var prefix = 'RFN';
    var zeroLeadingNr = !ds1.nr ? '00000001' : ds1.nr;
    var cod = prefix.toString() + zeroLeadingNr.toString();
    //X.WARNING(cod);
    return cod;
}

function createObligatorii() {
    var ret = [],
        arrMaxGeo = [{
            ui: SALDOC.CCCCLADIRE,
            dbAnte: '',
            multime: 'SELECT DISTINCT CCCCLADIRE FROM MTRLINES WHERE FINDOC=' + SALDOC.CCCFLMR + ' AND SOSOURCE=1351',
            friendlyName: 'Cladire'
        }, {
            ui: SALDOC.CCCPRIMARYSPACE,
            dbAnte: 'CCCCLADIRE',
            multime: 'SELECT DISTINCT CCCPRIMARYSPACE FROM MTRLINES WHERE FINDOC=' + SALDOC.CCCFLMR + ' AND SOSOURCE=1351',
            friendlyName: 'Spatiu primar'
        }, {
            ui: SALDOC.CCCSECONDARYSPACE,
            dbAnte: 'CCCPRIMARYSPACE',
            multime: 'SELECT DISTINCT CCCSECONDARYSPACE FROM MTRLINES WHERE FINDOC=' + SALDOC.CCCFLMR + ' AND SOSOURCE=1351',
            friendlyName: 'Spatiu secundar'
        }],
        /*
        arrMaxSF = [{
        ui: SALDOC.CCCSPECIALITATESF,
        dbAnte: '',
        multime: 'SELECT DISTINCT CCCSPECIALITATESF FROM MTRLINES WHERE FINDOC=' + SALDOC.CCCFLMR + ' AND SOSOURCE=1351',
        friendlyName: 'Specialitate SF'
        }, {
        ui: SALDOC.CCCSF,
        dbAnte: 'CCCSPECIALITATESF',
        multime: 'SELECT DISTINCT CCCSF FROM MTRLINES WHERE FINDOC=' + SALDOC.CCCFLMR + ' AND SOSOURCE=1351',
        friendlyName: 'Sistem functional'
        }
        ],
         */
        arrMusai = [{
            ui: SALDOC.CCCTABLOURI,
            dbAnte: '',
            multime: 'SELECT DISTINCT CCCTABLOURI FROM MTRLINES WHERE FINDOC=' + SALDOC.CCCFLMR + ' AND SOSOURCE=1351',
            friendlyName: 'Sursa'
        }];

    d(arrMaxGeo, ret);
    //d(arrMaxSF, ret);
    d(arrMusai, ret);

    return ret;
}

function d(arrInit, arrRez) {
    var ret = [];
    for (var i = 0; i < arrInit.length; i++) {
        if (arrInit[i].dbAnte) {
            if (X.GETSQLDATASET(arrInit[i].multime + ' AND ' + arrInit[i].dbAnte + ' IN (' + arrInit[i - 1].multime + ')', null).RECORDCOUNT > 0) {
                arrRez.push(arrInit[i]);
            }
        } else {
            if (X.GETSQLDATASET(arrInit[i].multime, null).RECORDCOUNT > 0) {
                arrRez.push(arrInit[i]);
            }
        }
    }
}

function EXECCOMMAND(cmd) {
    if (cmd == 202001231) {
        //zoom (show/hide panels)
        if (zoomed) {
            X.SETPROPERTY('PANEL', 'Panel12', 'VISIBLE', 'TRUE');
            X.SETPROPERTY('PANEL', 'pResp', 'VISIBLE', 'TRUE');
        } else {
            X.SETPROPERTY('PANEL', 'Panel12', 'VISIBLE', 'FALSE');
            X.SETPROPERTY('PANEL', 'pResp', 'VISIBLE', 'FALSE');
        }

        zoomed = !zoomed;
        X.SETPROPERTY('MERGECHANGELOG', 1);
    }

    if (cmd == 20190412) {
        if (!SALDOC.PRJC) {
            X.EXCEPTION('Alegeti lucararea.');
        }
        if (!SALDOC.CCCFLMR) {
            X.EXCEPTION('Alegeti fisa limita.');
        }
        var obligatorii = createObligatorii(),
            xx = true,
            strCO = '';
        if (obligatorii.length == 0)
            xx = false;
        for (var i = 0; i < obligatorii.length; i++) {
            if (!obligatorii[i].ui) {
                strCO += obligatorii[i].friendlyName + '\n';
            }
        }
        if (strCO)
            xx = false;
        if (xx) {
            populeazaDinFL();
            actualizeazaMarfaLaResponsabil(SALDOC.CCCMAGAZIONER);
        } else {
            X.WARNING('Urmatoarele campuri sunt obligatorii:\n' + strCO);
        }
    }

    if (cmd == 20190513) {
        var ds = X.GETSQLDATASET('select PRSN from CCCPRJCPRSNLINES ' +
            'where prjc = ' + SALDOC.PRJC + ' and subantreprenor=' + SALDOC.CCCSUBANTREPRENOR, null);
        if (ds.RECORDCOUNT) {
            CCCANGAJATISUBATREPRENOR.FIRST;
            while (!CCCANGAJATISUBATREPRENOR.EOF) {
                CCCANGAJATISUBATREPRENOR.DELETE;
            }

            ds.FIRST;
            while (!ds.EOF) {
                CCCANGAJATISUBATREPRENOR.APPEND;
                CCCANGAJATISUBATREPRENOR.PRSN = ds.PRSN;
                CCCANGAJATISUBATREPRENOR.DELA = SALDOC.DATE01;
                CCCANGAJATISUBATREPRENOR.PANALA = SALDOC.DATE02;
                CCCANGAJATISUBATREPRENOR.POST;
                ds.NEXT;
            }
        }
    }

    if (cmd == 20190514) {
        calculOreActivitati();
    }

    if (cmd == 20190515) {
        if (!SALDOC.CCCAPROBATPLATA) {
            X.WARNING('Alegeti executantul.');
            return;
        }
        //genereaza pontajele per activitate
        //campurile obligatorii care nu au legatura cu propagarea informatiei
        //care face subiectul acestui proiect vor fi completate manual, apoi se salveaza pontajul
        var tot = hProgramTot();
        calculOreActivitati();
        X.EXEC('button:Save');
        var totCuExcl = hProgramTotCuExcluse();
        var strMsg = '';
        SRVLINES.FIRST;
        while (!SRVLINES.EOF) {
            if (SRVLINES.QTY > 0 && !SRVLINES.BOOL02) {
                X.PROCESSMESSAGES;
                var pontaj = X.CREATEOBJFORM('CUSTFINDOC.1011[LIST=Pontaj pe operatie pe lucrare,FORM=Pontaj activitati electric]');
                try {
                    var q2 = 'SELECT distinct 1 FROM CUSTLINES AA ' +
                        'INNER JOIN FINDOC BB ON (AA.FINDOC=BB.FINDOC AND AA.SOSOURCE=BB.SOSOURCE AND AA.COMPANY=BB.COMPANY) ' +
                        'WHERE AA.COMPANY = ' + X.SYS.COMPANY + ' AND AA.SOSOURCE = 1011 AND BB.ISCANCEL = 0 ' +
                        'AND AA.CINT05 = ' + SALDOC.FINDOC +
                        ' AND BB.CCCACTIVITATE = ' + SRVLINES.CCCACTIVITATE +
                        whereAndClause(SRVLINES, ':SRVLINES', 'BB', 0, true);
                    //debugger;
                    var r = X.SQL(q2, null);
                    if (r) {
                        //exista pontaj, nu mai fac
                        strMsg += SRVLINES.LINENUM + ', ';
                    } else {
                        pontaj.DBINSERT;

                        var tblHeader = pontaj.FindTable('CUSTFINDOC');
                        tblHeader.Edit;
                        tblHeader.TRNDATE = SALDOC.TRNDATE;
                        tblHeader.DATE01 = SALDOC.TRNDATE;
                        if (SRVLINES.QTY)
                            tblHeader.NUM01 = SRVLINES.QTY;
                        tblHeader.FPRMS = 1011;
                        if (SALDOC.CCCAPROBATPLATA == 3) {
                            tblHeader.SERIES = 1011; //invest
                        } else if (SALDOC.CCCAPROBATPLATA == 1) {
                            tblHeader.SERIES = 1014; //subantreprenor
                        } else if (SALDOC.CCCAPROBATPLATA == 2) {
                            tblHeader.SERIES = 1012; //partener
                        } else {
                            tblHeader.SERIES = 1011;
                        }
                        tblHeader.PRJC = SALDOC.PRJC;
                        tblHeader.CCCHEADER = SALDOC.CCCHEADER;
                        if (SRVLINES.CCCCLADIRE)
                            tblHeader.CCCCLADIRE = SRVLINES.CCCCLADIRE;
                        else {
                            var c = X.SQL('select ccccladire from mtrlines where findoc=' + SALDOC.CCCFLMR + ' and mtrlines=' + SRVLINES.MTRLINESS, null);
                            if (c)
                                tblHeader.CCCCLADIRE = c;
                        }
                        if (SRVLINES.CCCPRIMARYSPACE)
                            tblHeader.CCCPRIMARYSPACE = SRVLINES.CCCPRIMARYSPACE;
                        else {
                            var ps = X.SQL('select CCCPRIMARYSPACE from mtrlines where findoc=' + SALDOC.CCCFLMR + ' and mtrlines=' + SRVLINES.MTRLINESS, null);
                            if (ps)
                                tblHeader.CCCPRIMARYSPACE = ps;
                        }
                        if (SRVLINES.CCCSECONDARYSPACE)
                            tblHeader.CCCSECONDARYSPACE = SRVLINES.CCCSECONDARYSPACE;
                        else {
                            var ss = X.SQL('select CCCSECONDARYSPACE from mtrlines where findoc=' + SALDOC.CCCFLMR + ' and mtrlines=' + SRVLINES.MTRLINESS, null);
                            if (ss)
                                tblHeader.CCCSECONDARYSPACE = ss;
                        }
                        if (SRVLINES.CCCINCAPERE)
                            tblHeader.CCCINCAPERE = SRVLINES.CCCINCAPERE;
                        else {
                            var incap = X.SQL('select CCCINCAPERE from mtrlines where findoc=' + SALDOC.CCCFLMR + ' and mtrlines=' + SRVLINES.MTRLINESS, null);
                            if (incap)
                                tblHeader.CCCINCAPERE = incap;
                        }
                        if (SRVLINES.CCCSPECIALITATESF)
                            tblHeader.CCCSPECIALITATESF = SRVLINES.CCCSPECIALITATESF;
                        if (SRVLINES.CCCSF)
                            tblHeader.CCCSF = SRVLINES.CCCSF;
                        if (SRVLINES.CCCCOLECTIESF)
                            tblHeader.CCCCOLECTIESF = SRVLINES.CCCCOLECTIESF;
                        if (SRVLINES.CCCTABLOURI)
                            tblHeader.CCCTABLOURI = SRVLINES.CCCTABLOURI;
                        if (SRVLINES.CCCCIRCUIT)
                            tblHeader.INT01 = SRVLINES.CCCCIRCUIT;
                        //debugger;
                        if (SRVLINES.CCCMTRLGEN)
                            tblHeader.INT02 = SRVLINES.CCCMTRLGEN;
                        else {
                            var mtrlg = X.SQL('select CCCMTRLGEN from mtrlines where findoc=' + SALDOC.CCCFLMR + ' and mtrlines=' + SRVLINES.MTRLINESS, null);
                            if (mtrlg)
                                tblHeader.INT02 = mtrlg;
                        }
                        if (SRVLINES.CCCSPECIALIZARE)
                            tblHeader.CCCSPECIALIZARE = SRVLINES.CCCSPECIALIZARE;
                        if (SRVLINES.CCCCOLECTIE)
                            tblHeader.CCCCOLECTIE = SRVLINES.CCCCOLECTIE;
                        if (SRVLINES.CCCCAPITOL)
                            tblHeader.CCCCAPITOL = SRVLINES.CCCCAPITOL;
                        if (SRVLINES.CCCGRUPALUCRARI)
                            tblHeader.CCCGRUPALUCRARI = SRVLINES.CCCGRUPALUCRARI;
                        if (SRVLINES.CCCACTIVITATE)
                            tblHeader.CCCACTIVITATE = SRVLINES.CCCACTIVITATE;
                        if (SRVLINES.CCCUM)
                            tblHeader.CCCMTRUNIT = SRVLINES.CCCUM;
                        if (SALDOC.CCCSUBANTREPRENOR)
                            tblHeader.CCCSUBANTREPRENOR = SALDOC.CCCSUBANTREPRENOR;
                        tblHeader.CCCMTRLINES = SRVLINES.MTRLINES;
                        tblHeader.CCCREALIZATZI = SRVLINES.QTY1;
                        tblHeader.CCCQTY1 = SRVLINES.CCCQTYFL;
                        tblHeader.CCCREALIZATOP = SRVLINES.CCCQTYINIT;

                        //linii
                        tblLinii = pontaj.FindTable('CUSTLINES');
                        CCCANGAJATISUBATREPRENOR.FIRST;
                        while (!CCCANGAJATISUBATREPRENOR.EOF) {
                            tblLinii.Append;
                            tblLinii.CDAT02 = SALDOC.TRNDATE;
                            tblLinii.CINT01 = CCCANGAJATISUBATREPRENOR.PRSN;
                            var M11 = dateDiffH(X.FORMATDATE('hh:MM', CCCANGAJATISUBATREPRENOR.DELA), X.FORMATDATE('hh:MM', CCCANGAJATISUBATREPRENOR.PANALA));
                            var L6 = SRVLINES.QTY;
                            //l6*m11/tot
                            tblLinii.CNUM01 = L6 * M11 / totCuExcl;
                            tblLinii.CINT05 = SALDOC.FINDOC; //FINDOCS like
                            tblLinii.CINT08 = 2;
                            tblLinii.CINT09 = 1;
                            tblLinii.Post;

                            CCCANGAJATISUBATREPRENOR.NEXT;
                        }

                        var id = pontaj.SHOWOBJFORM();
                    }

                } catch (err) {
                    X.WARNING("Error: " + err.message);
                } finally {
                    pontaj.FREE;
                }
            }

            //debugger;
            if (id) {
                SRVLINES.EDIT;
                SRVLINES.BOOL02 = 1; //marcare conversie
                SRVLINES.POST;
            }

            SRVLINES.NEXT;
        }

        X.EXEC('button:Save');

        if (strMsg) {
            X.WARNING('Linia/liniile ' + strMsg.substring(0, strMsg.length - 2) + ' s-au pontat anterior.');
        }
    }

    if (cmd == 20190516) {
        //genereaza bon consum pentru fiecare circuit
        //debugger;
        //filtrare dupa circuite
        var distinctCircuit = [],
            exista = false;
        ITELINES.FIRST;
        while (!ITELINES.EOF) {
            exista = false;
            for (var i = 0; i < distinctCircuit.length; i++) {
                if (distinctCircuit[i] == ITELINES.CCCCIRCUIT) {
                    exista = true;
                }
            }
            if (!exista) {
                distinctCircuit.push(ITELINES.CCCCIRCUIT);
            }
            ITELINES.NEXT;
        }

        for (var j = 0; j < distinctCircuit.length; j++) {
            ITELINES.FILTER = '({ITELINES.CCCCIRCUIT}=' + distinctCircuit[j] + ' AND {ITELINES.QTY1}>0)';
            ITELINES.FILTERED = 1;
            X.PROCESSMESSAGES();
            if (X.FILTERSUM('ITELINES.QTY1', 'CCCCIRCUIT=' + distinctCircuit[j]) > 0)
                createPBC1();
            ITELINES.FILTERED = 0;
            X.PROCESSMESSAGES();
        }
    }

    if (cmd == 20210630) {
        if (CCCMATERIALMARUNT.RECORDCOUNT)
            createPBC2();
    }

    if (cmd == 20190517) {
        //CCCREFNECONFORM[Form=Referat neconformitati 1]
        //referat neconformitati
        try {
            var rn = X.CREATEOBJFORM('CCCREFNECONFORM[Form=Referat neconformitati 1]');
            rn.DBINSERT;

            var tHeader = rn.FindTable('SALDOC');
            tHeader.Edit;
            tHeader.FPRMS = 4066;
            tHeader.SERIES = 4066;
            tHeader.CCCDEP = SALDOC.CCCDEP;
            tHeader.CCCRESPON = SALDOC.CCCRESPON;
            tHeader.PRJC = SALDOC.PRJC;
            tHeader.CCCFLMR = SALDOC.CCCFLMR;
            if (SALDOC.CCCCLADIRE)
                tHeader.CCCCLADIRE = SALDOC.CCCCLADIRE;
            if (SALDOC.CCCPRIMARYSPACE)
                tHeader.CCCPRIMARYSPACE = SALDOC.CCCPRIMARYSPACE;
            if (SALDOC.CCCSECONDARYSPACE)
                tHeader.CCCSECONDARYSPACE = SALDOC.CCCSECONDARYSPACE;
            if (SALDOC.CCCINCAPERE)
                tHeader.CCCINCAPERE = SALDOC.CCCINCAPERE;
            if (SALDOC.CCCSPECIALITATESF)
                tHeader.CCCSPECIALITATESF = SALDOC.CCCSPECIALITATESF;
            if (SALDOC.CCCSF)
                tHeader.CCCSF = SALDOC.CCCSF;
            if (SALDOC.CCCCOLECTIESF)
                tHeader.CCCCOLECTIESF = SALDOC.CCCCOLECTIESF;
            if (SALDOC.CCCTABLOURI)
                tHeader.CCCTABLOURI = SALDOC.CCCTABLOURI;
            if (SALDOC.CCCCIRCUIT)
                tHeader.CCCCIRCUIT = SALDOC.CCCCIRCUIT;
            if (SALDOC.CCCSUBANTREPRENOR)
                tHeader.CCCSUBANTREPRENOR = SALDOC.CCCSUBANTREPRENOR;
            tHeader.CCCRAPZILNIC = SALDOC.FINDOC;
            tHeader.TRNDATE = X.SYS.LOGINDATE;
            var q = 'select max(seriesnum) + 1 nr from  seriesnum where series = 4066';
            tHeader.SERIESNUM = X.GETSQLDATASET(q, null).nr;
            tHeader.FINCODE = xxx();

            var id = rn.SHOWOBJFORM();

        } catch (err) {
            X.WARNING(err.message);
        } finally {
            rn.Free;
        }
    }

    if (cmd == 202005211) {
        //adauga activitati aferente subantr ales din proiect, tab subantr., grid activitati
        var ds = X.GETSQLDATASET('select ISNULL(cccactivitate, 0) cccactivitate from cccsubantractivit where prjc=' + SALDOC.PRJC +
            ' and subantreprenor=' + SALDOC.CCCSUBANTREPRENOR, null);
        if (ds.RECORDCOUNT) {
            SRVLINES.FIRST;
            while (!SRVLINES.EOF) {
                SRVLINES.DELETE;
            }

            if (ds.cccactivitate) {
                SRVLINES.APPEND;
                SRVLINES.CCCACTIVITATE = ds.cccactivitate;
                SRVLINES.POST;
            }

            ds.NEXT;
        } else {
            X.WARNING('Nicio activitate nu a fost inregistrata pe acest proiect/subantreprenor.');
        }

        X.SETPROPERTY('MERGECHANGELOG', 1);
    }

    if (cmd == 202005212) {
        //adauga auto din proiect
        var ds = X.GETSQLDATASET('SELECT RSRC, KMCOST FROM CCCSUBANTRAUTO WHERE PRJC=' + SALDOC.PRJC +
            ' AND SUBANTREPRENOR=' + SALDOC.CCCSUBANTREPRENOR + ' and (select ccctipexecutant from rsrctype where rsrctype=(select rsrctype from rsrc where rsrc=CCCSUBANTRAUTO.RSRC))=' + SALDOC.CCCAPROBATPLATA, null);
        if (ds.RECORDCOUNT && SALDOC.FINDOC && SALDOC.PRJC && SALDOC.CCCSUBANTREPRENOR && SALDOC.CCCAPROBATPLATA) {
            ds.FIRST;
            while (!ds.EOF) {
                CCCRZLSUBANTRAUTO.APPEND;
                CCCRZLSUBANTRAUTO.RSRC = ds.RSRC;
                CCCRZLSUBANTRAUTO.KMCOST = ds.KMCOST;
                CCCRZLSUBANTRAUTO.POST;
                ds.NEXT;
            }
        } else if (!SALDOC.FINDOC) {
            X.WARNING('Salvati documentul.');
        } else if (!SALDOC.CCCSUBANTREPRENOR) {
            X.WARNING('Adaugati subantreprenorul.');
        } else if (!SALDOC.PRJC) {
            X.WARNING('Alegeti proiectul.');
        } else if (!ds.RECORDCOUNT) {
            X.WARNING('Nu este inregistrat transport la nivel de proiect.');
        } else if (!SALDOC.CCCAPROBATPLATA) {
            X.WARNING('Alegeti categorie executant');
        }
    }

    if (cmd == 202005213) {
        //adauga utilaje din proiect
        var ds = X.GETSQLDATASET('SELECT RSRC, KMCOST, HCOST FROM CCCSUBANTRUTIL WHERE PRJC=' + SALDOC.PRJC +
            ' AND SUBANTREPRENOR=' + SALDOC.CCCSUBANTREPRENOR +
            ' and (select ccctipexecutant from rsrctype where rsrctype=(select rsrctype from rsrc where rsrc=CCCSUBANTRUTIL.RSRC))=' + SALDOC.CCCAPROBATPLATA, null);
        if (ds.RECORDCOUNT && SALDOC.FINDOC && SALDOC.PRJC && SALDOC.CCCSUBANTREPRENOR && SALDOC.CCCAPROBATPLATA) {
            ds.FIRST;
            while (!ds.EOF) {
                CCCRZLSUBANTRUTIL.APPEND;
                CCCRZLSUBANTRUTIL.RSRC = ds.RSRC;
                CCCRZLSUBANTRUTIL.KMCOST = ds.KMCOST;
                CCCRZLSUBANTRUTIL.HCOST = ds.HCOST;
                CCCRZLSUBANTRUTIL.POST;
                ds.NEXT;
            }
        } else if (!SALDOC.FINDOC) {
            X.WARNING('Salvati documentul.');
        } else if (!SALDOC.CCCSUBANTREPRENOR) {
            X.WARNING('Adaugati subantreprenorul.');
        } else if (!SALDOC.PRJC) {
            X.WARNING('Alegeti proiectul.');
        } else if (!ds.RECORDCOUNT) {
            X.WARNING('Nu sunt inregistrate utilaje la nivel de proiect.');
        } else if (!SALDOC.CCCAPROBATPLATA) {
            X.WARNING('Alegeti categorie executant');
        }
    }

    if (cmd == 202005225) {
        if (!SALDOC.CCCAPROBATPLATA) {
            X.WARNING('Alegeti categorie executant.');
            return;
        }

        var seria = 0,
            obj;
        //genereaza pontaje auto functie de categ. executant
        if (SALDOC.CCCAPROBATPLATA == 1) {
            //subantr
            seria = 1105;
            obj = 'CUSTFINDOC.1011[LIST=Pontaj pe Auto PARTENER,FORM=Pontaj auto subantreprenor 1]';
        } else if (SALDOC.CCCAPROBATPLATA == 2) {
            //partener
            seria = 1104;
            obj = 'CUSTFINDOC.1011[LIST=Pontaj pe Auto PARTENER,FORM=Pontaj Auto PARTENER 1]';
        } else if (SALDOC.CCCAPROBATPLATA == 3) {
            //Invest
            seria = 1103;
            obj = 'CUSTFINDOC.1011[LIST=Pontaj pe Auto INVEST,FORM=Pontaj Auto INVEST]';
        } else {
            X.WARNING('Nu inteleg categoria executant aleasa.');
            return;
        }

        createPontaj(obj, seria, CCCRZLSUBANTRAUTO);
        X.SETPROPERTY('MERGECHANGELOG', 1);
    }

    if (cmd == 202005226) {
        if (!SALDOC.CCCAPROBATPLATA) {
            X.WARNING('Alegeti categorie executant.');
            return;
        }

        var seria = 0,
            obj;
        //genereaza pontaje auto functie de categ. executant
        if (SALDOC.CCCAPROBATPLATA == 1) {
            //subantr
            seria = 1107;
            obj = 'CUSTFINDOC.1011[LIST=Pontaj pe utilaj TERT,FORM=Pontaj utilaj subantreprenor 1]';
        } else if (SALDOC.CCCAPROBATPLATA == 2) {
            //partener
            seria = 1106;
            obj = 'CUSTFINDOC.1011[LIST=Pontaj pe utilaj TERT,FORM=Pontaj utilaj partener 1]';
        } else if (SALDOC.CCCAPROBATPLATA == 3) {
            //Invest
            seria = 1102;
            obj = 'CUSTFINDOC.1011[LIST=Pontaj pe utilaj,FORM=Pontaj utilaj INVEST]';
        } else {
            X.WARNING('Nu inteleg categoria executant aleasa.');
            return;
        }

        createPontaj(obj, seria, CCCRZLSUBANTRUTIL);
        X.SETPROPERTY('MERGECHANGELOG', 1);
    }

    if (cmd == 20200505) {
        if (!SALDOC.FINDOC) {
            X.WARNING('Salvati documentul.');
            return;
        }

        if (!SALDOC.VARCHAR01) {
            X.WARNING('Alegeti imprimanta.');
            return;
        }

        var nrCopii = X.INPUTQUERY('Print RZL', 'Number of copies: ', 1, 0);
        if (nrCopii != '') {
            var rzl = X.CreateObj('SALDOC'),
                i = 1;
            try {
                rzl.DBLocate(SALDOC.FINDOC);
                while (i <= nrCopii) {
                    for (var j = 0; j < arrPrint.length; j++) {
                        if (arrPrint[j].table.RECORDCOUNT) {
                            rzl.PRINTFORM(arrPrint[j].template, SALDOC.VARCHAR01, '');
                            X.PROCESSMESSAGES;
                        }
                    }
                    i++;
                }
            } catch (e) {
                X.WARNING(e.message);
            } finally {
                rzl.FREE;
                rzl = null;
                X.SETPROPERTY('MERGECHANGELOG', 1);
            }
        }
    }

    if (cmd == 202006151) {
        //utilaj
        var obj,
            pontajUtil = -1;

        if (SALDOC.CCCAPROBATPLATA == 1) {
            //subantr
            obj = X.CREATEOBJFORM('CUSTFINDOC.1011[LIST=Pontaj pe utilaj TERT,FORM=Pontaj utilaj subantreprenor 1]');
        } else if (SALDOC.CCCAPROBATPLATA == 2) {
            //partener
            obj = X.CREATEOBJFORM('CUSTFINDOC.1011[LIST=Pontaj pe utilaj TERT,FORM=Pontaj utilaj partener 1]');
        } else if (SALDOC.CCCAPROBATPLATA == 3) {
            //Invest
            obj = X.CREATEOBJFORM('CUSTFINDOC.1011[LIST=Pontaj pe utilaj,FORM=Pontaj utilaj INVEST]');
        } else {
            X.WARNING('Nu inteleg categoria executant aleasa.');
            return;
        }

        try {
            pontajUtil = X.SQL('SELECT BB.FINDOC ' +
                'FROM CUSTLINES AA ' +
                'INNER JOIN FINDOC BB ON ( ' +
                '		AA.FINDOC = BB.FINDOC ' +
                '		AND AA.SOSOURCE = BB.SOSOURCE ' +
                '		AND AA.COMPANY = BB.COMPANY ' +
                '		) ' +
                'WHERE AA.SOSOURCE = 1011 ' +
                '	AND BB.FPRMS = 1102 ' +
                '	AND BB.SERIES = ( ' +
                '		CASE  ' +
                '			WHEN ' + SALDOC.CCCAPROBATPLATA + ' = 3 ' +
                '				THEN 1102 ' +
                '			WHEN ' + SALDOC.CCCAPROBATPLATA + ' = 2 ' +
                '				THEN 1106 ' +
                '			WHEN ' + SALDOC.CCCAPROBATPLATA + ' = 1 ' +
                '				THEN 1107 ' +
                '			END ' +
                '		) ' +
                '	AND BB.ISCANCEL = 0 ' +
                '	AND AA.CINT05 = ' + SALDOC.FINDOC, null);

            if (pontajUtil) {
                obj.DBLocate(pontajUtil);
                obj.SHOWOBJFORM();
            } else {
                X.WARNING('Nu exista pontaj legat de acest RZL.');
            }
        } finally {
            obj.FREE;
            obj = null;
            X.SETPROPERTY('MERGECHANGELOG', 1);
        }
    }

    if (cmd == 202006152) {
        //transport
        var obj,
            pontajAuto = -1;

        if (SALDOC.CCCAPROBATPLATA == 1) {
            //subantr
            obj = X.CREATEOBJFORM('CUSTFINDOC.1011[LIST=Pontaj pe Auto PARTENER,FORM=Pontaj Auto subantreprenor 1]');
        } else if (SALDOC.CCCAPROBATPLATA == 2) {
            //partener
            obj = X.CREATEOBJFORM('CUSTFINDOC.1011[LIST=Pontaj pe Auto PARTENER,FORM=Pontaj Auto PARTENER 1]');
        } else if (SALDOC.CCCAPROBATPLATA == 3) {
            obj = X.CREATEOBJFORM('CUSTFINDOC.1011[LIST=Pontaj pe Auto INVEST,FORM=Pontaj Auto INVEST]');
        } else {
            X.WARNING('Nu inteleg categoria executant aleasa.');
            return;
        }

        try {
            pontajAuto = X.SQL('SELECT BB.FINDOC ' +
                'FROM CUSTLINES AA ' +
                'INNER JOIN FINDOC BB ON ( ' +
                '		AA.FINDOC = BB.FINDOC ' +
                '		AND AA.SOSOURCE = BB.SOSOURCE ' +
                '		AND AA.COMPANY = BB.COMPANY ' +
                '		) ' +
                'WHERE AA.SOSOURCE = 1011 ' +
                '	AND BB.FPRMS = 1103 ' +
                '	AND BB.SERIES = ( ' +
                '		CASE  ' +
                '			WHEN ' + SALDOC.CCCAPROBATPLATA + ' = 3 ' +
                '				THEN 1103 ' +
                '			WHEN ' + SALDOC.CCCAPROBATPLATA + ' = 2 ' +
                '				THEN 1104 ' +
                '			WHEN ' + SALDOC.CCCAPROBATPLATA + ' = 1 ' +
                '				THEN 1105 ' +
                '			END ' +
                '		) ' +
                '	AND BB.ISCANCEL = 0 ' +
                '	AND AA.CINT05 = ' + SALDOC.FINDOC, null);
            if (pontajAuto) {
                obj.DBLocate(pontajAuto);
                obj.SHOWOBJFORM();
            } else {
                X.WARNING('Nu exista pontaj legat de acest RZL.');
            }
        } finally {
            obj.FREE;
            obj = null;
            X.SETPROPERTY('MERGECHANGELOG', 1);
        }
    }
}

function createPontaj(obj, seria, ds) {
    var pontaj = X.CREATEOBJFORM(obj);
    try {
        pontaj.DBINSERT;
        //debugger;
        var tblHeader = pontaj.FindTable('CUSTFINDOC');
        tblHeader.Edit;
        tblHeader.SERIES = seria;
        tblHeader.TRNDATE = SALDOC.TRNDATE;
        tblHeader.DATE01 = SALDOC.TRNDATE;
        tblHeader.PRJC = SALDOC.PRJC;
        if (SALDOC.CCCSUBANTREPRENOR)
            tblHeader.CCCSUBANTREPRENOR = SALDOC.CCCSUBANTREPRENOR;
        if (SALDOC.PRJCSTAGE)
            tblHeader.PRJCSTAGE = SALDOC.PRJCSTAGE;
        if (SALDOC.CCCSPECIALITATESF)
            tblHeader.CCCSPECIALITATESF = SALDOC.CCCSPECIALITATESF;
        if (SALDOC.CCCSF)
            tblHeader.CCCSF = SALDOC.CCCSF;
        if (SALDOC.CCCCOLECTIESF)
            tblHeader.CCCCOLECTIESF = SALDOC.CCCCOLECTIESF;
        if (SALDOC.CCCTABLOU)
            tblHeader.CCCTABLOU = SALDOC.CCCTABLOU;
        if (SALDOC.CCCDEVIZECM)
            tblHeader.CCCDEVIZECM = SALDOC.CCCDEVIZECM;
        tblLinii = pontaj.FindTable('CUSTLINES');

        ds.FIRST;
        while (!ds.EOF) {
            tblLinii.Append;
            tblLinii.CDAT02 = SALDOC.TRNDATE;
            tblLinii.CINT02 = SALDOC.PRJC;
            tblLinii.CINT04 = ds.RSRC;
            tblLinii.CINT05 = SALDOC.FINDOC;
            tblLinii.CCCKM = ds.KMS;
            tblLinii.CNUM01 = ds.HS;
            tblLinii.CCCKMCOST = ds.KMCOST;
            tblLinii.CCCHCOST = ds.HCOST;
            tblLinii.Post;

            ds.NEXT;
        }

        var id = pontaj.SHOWOBJFORM();
    } catch (err) {
        X.WARNING(err.message);
    } finally {
        pontaj.FREE;
    }
}

function createPBC1() {
    //debugger;
    if (X.FILTERSUM('ITELINES.BOOL01', '1=1') == ITELINES.RECORDCOUNT) {
        X.WARNING('Toate bonurile au fost generate.');
        return;
    }
    var bc = X.CREATEOBJFORM('ITEDOC[Form=PBC electric]'),
        tHeader = bc.FindTable('FINDOC'),
        tLinii = bc.FindTable('ITELINES'),
        mtrlin = [];
    try {
        bc.DBINSERT;

        tHeader.Edit;
        tHeader.SERIES = 2090;
        if (SALDOC.CCCDEP)
            tHeader.CCCDEP = SALDOC.CCCDEP;
        if (SALDOC.CCCRESPON)
            tHeader.CCCRESPON = SALDOC.CCCRESPON;
        if (SALDOC.PRJC)
            tHeader.PRJC = SALDOC.PRJC;
        if (SALDOC.CCCFLMR)
            tHeader.CCCFLMR = SALDOC.CCCFLMR;
        if (SALDOC.CCCSUBANTREPRENOR)
            tHeader.CCCSUBANTREPRENOR = SALDOC.CCCSUBANTREPRENOR;
        if (SALDOC.CCCAPROBATPLATA)
            tHeader.CCCAPROBATPLATA = SALDOC.CCCAPROBATPLATA;
        if (SALDOC.CCCRESP)
            tHeader.CCCRESP = SALDOC.CCCRESP;
        if (SALDOC.CCCPERSCONST)
            tHeader.CCCPERSCONST = SALDOC.CCCPERSCONST;
        if (SALDOC.CCCMAGAZIONER)
            tHeader.CCCMAGAZIONER = SALDOC.CCCMAGAZIONER;
        if (SALDOC.CCCCLADIRE)
            tHeader.CCCCLADIRE = SALDOC.CCCCLADIRE;
        if (SALDOC.CCCPRIMARYSPACE)
            tHeader.CCCPRIMARYSPACE = SALDOC.CCCPRIMARYSPACE;
        if (SALDOC.CCCSECONDARYSPACE)
            tHeader.CCCSECONDARYSPACE = SALDOC.CCCSECONDARYSPACE;
        if (SALDOC.CCCINCAPERE)
            tHeader.CCCINCAPERE = SALDOC.CCCINCAPERE;
        if (SALDOC.CCCSPECIALITATESF)
            tHeader.CCCSPECIALITATESF = SALDOC.CCCSPECIALITATESF;
        if (SALDOC.CCCSF)
            tHeader.CCCSF = SALDOC.CCCSF;
        if (SALDOC.CCCCOLECTIESF)
            tHeader.CCCCOLECTIESF = SALDOC.CCCCOLECTIESF;
        if (SALDOC.CCCTABLOURI)
            tHeader.CCCTABLOURI = SALDOC.CCCTABLOURI;
        if (ITELINES.CCCCIRCUIT)
            tHeader.INT01 = ITELINES.CCCCIRCUIT;

        //debugger;
        ITELINES.FIRST;
        while (!ITELINES.EOF) {
            if (ITELINES.QTY1 > 0) {
                //daca nu a mai fost convertit
                if (ITELINES.QTY1 + ITELINES.CCCTOTBCV <= ITELINES.CCCQTYFL && !ITELINES.BOOL01) {
                    tLinii.Append;
                    tLinii.MTRL = ITELINES.MTRL;
                    tLinii.MTRUNIT = ITELINES.MTRUNIT;
                    tLinii.CCCQTYFL = ITELINES.CCCQTYFL;
                    if (SALDOC.CCCMAGAZIONER)
                        tHeader.CCCMAGAZIONER = SALDOC.CCCMAGAZIONER;
                    tLinii.QTY1 = ITELINES.QTY1;
                    tLinii.CCCTOTBCV = ITELINES.CCCTOTBCV;
                    tLinii.FINDOCS = SALDOC.FINDOC;
                    if (ITELINES.CCCCLADIRE)
                        tLinii.CCCCLADIRE = ITELINES.CCCCLADIRE;
                    if (ITELINES.CCCPRIMARYSPACE)
                        tLinii.CCCPRIMARYSPACE = ITELINES.CCCPRIMARYSPACE;
                    if (ITELINES.CCCSECONDARYSPACE)
                        tLinii.CCCSECONDARYSPACE = ITELINES.CCCSECONDARYSPACE;
                    if (ITELINES.CCCINCAPERE)
                        tLinii.CCCINCAPERE = ITELINES.CCCINCAPERE;
                    if (ITELINES.CCCSPECIALITATESF)
                        tLinii.CCCSPECIALITATESF = ITELINES.CCCSPECIALITATESF;
                    if (ITELINES.CCCSF)
                        tLinii.CCCSF = ITELINES.CCCSF;
                    if (ITELINES.CCCCOLECTIESF)
                        tLinii.CCCCOLECTIESF = ITELINES.CCCCOLECTIESF;
                    if (ITELINES.CCCTABLOURI)
                        tLinii.CCCTABLOURI = ITELINES.CCCTABLOURI;
                    if (ITELINES.CCCCIRCUIT)
                        tLinii.CCCCIRCUIT = ITELINES.CCCCIRCUIT;
                    if (ITELINES.CCCMTRLGEN)
                        tLinii.CCCMTRLGEN = ITELINES.CCCMTRLGEN;
                    tLinii.Post;
                    ITELINES.EDIT;
                    //X.RUNSQL('update mtrlines set bool01 = 1 where findoc='+SALDOC.FINDOC+' and mtrlines='+ITELINES.MTRLINES, null); //semnalizez conversia liniei
                    ITELINES.BOOL01 = 1;
                    ITELINES.POST;
                    mtrlin.push(ITELINES.MTRLINES);
                } else {
                    if (ITELINES.BOOL01) {
                        //convertit deja
                    } else
                    if (ITELINES.QTY1 + ITELINES.CCCTOTBCV <= ITELINES.CCCQTYFL) {
                        X.WARNING(ITELINES.MTRL_ITEM_NAME + ' depaseste cantitatea din FL.');
                    }
                }
            }
            ITELINES.NEXT;
        }

        var id = bc.SHOWOBJFORM();
        //debugger;
        //daca nu salveaza, undo semnalizarea
        if (!id) {
            ITELINES.EDIT;
            ITELINES.FIRST;
            while (!ITELINES.EOF) {
                for (var x = 0; x < mtrlin.length; x++) {
                    if (mtrlin[x] == ITELINES.MTRLINES) {
                        //X.RUNSQL('update mtrlines set bool01 = null where findoc='+SALDOC.FINDOC+' and mtrlines='+ITELINES.MTRLINES, null); //anuleaza conversia liniei
                        ITELINES.BOOL01 = null;
                        ITELINES.POST;
                        break;
                    }
                }
                ITELINES.NEXT;
            }
            X.EXEC('button:Save');
        }
    } catch (err) {
        X.WARNING(err.message);
    } finally {
        //X.WARNING(tLinii.RECORDCOUNT);
        //X.MTRLINES.REFRESH;
        X.EXEC('button:Save');
        bc.FREE;
        bc = null;
    }
}

function createPBC2() {
    //debugger;
    var bc = X.CREATEOBJFORM('ITEDOC[Form=PBC electric]'),
        tHeader = bc.FindTable('FINDOC'),
        tLinii = bc.FindTable('ITELINES');
    try {
        bc.DBINSERT;

        tHeader.Edit;
        tHeader.SERIES = 2090;
        if (SALDOC.CCCDEP)
            tHeader.CCCDEP = SALDOC.CCCDEP;
        if (SALDOC.CCCRESPON)
            tHeader.CCCRESPON = SALDOC.CCCRESPON;
        if (SALDOC.PRJC)
            tHeader.PRJC = SALDOC.PRJC;
        if (SALDOC.CCCFLMR)
            tHeader.CCCFLMR = SALDOC.CCCFLMR;
        if (SALDOC.CCCSUBANTREPRENOR)
            tHeader.CCCSUBANTREPRENOR = SALDOC.CCCSUBANTREPRENOR;
        if (SALDOC.CCCAPROBATPLATA)
            tHeader.CCCAPROBATPLATA = SALDOC.CCCAPROBATPLATA;
        if (SALDOC.CCCRESP)
            tHeader.CCCRESP = SALDOC.CCCRESP;
        if (SALDOC.CCCPERSCONST)
            tHeader.CCCPERSCONST = SALDOC.CCCPERSCONST;
        if (SALDOC.CCCMAGAZIONER)
            tHeader.CCCMAGAZIONER = SALDOC.CCCMAGAZIONER;
        if (CCCMATERIALMARUNT.CCCCLADIRE)
            tHeader.CCCCLADIRE = CCCMATERIALMARUNT.CCCCLADIRE;
        if (CCCMATERIALMARUNT.CCCPRIMARYSPACE)
            tHeader.CCCPRIMARYSPACE = CCCMATERIALMARUNT.CCCPRIMARYSPACE;
        if (CCCMATERIALMARUNT.CCCSECONDARYSPACE)
            tHeader.CCCSECONDARYSPACE = CCCMATERIALMARUNT.CCCSECONDARYSPACE;
        if (CCCMATERIALMARUNT.CCCINCAPERE)
            tHeader.CCCINCAPERE = CCCMATERIALMARUNT.CCCINCAPERE;
        if (CCCMATERIALMARUNT.CCCSPECIALITATESF)
            tHeader.CCCSPECIALITATESF = CCCMATERIALMARUNT.CCCSPECIALITATESF;
        if (CCCMATERIALMARUNT.CCCSF)
            tHeader.CCCSF = CCCMATERIALMARUNT.CCCSF;
        if (SALDOC.CCCCOLECTIESF)
            tHeader.CCCCOLECTIESF = CCCMATERIALMARUNT.CCCCOLECTIESF;
        if (CCCMATERIALMARUNT.CCCTABLOURI)
            tHeader.CCCTABLOURI = CCCMATERIALMARUNT.CCCTABLOURI;
        if (CCCMATERIALMARUNT.CCCCIRCUIT)
            tHeader.INT01 = CCCMATERIALMARUNT.CCCCIRCUIT;

        //debugger;

        CCCMATERIALMARUNT.FIRST;
        while (!CCCMATERIALMARUNT.EOF) {
            if (CCCMATERIALMARUNT.QTY1 > 0 && CCCMATERIALMARUNT.QTY1 + CCCMATERIALMARUNT.CCCTOTBCV <= CCCMATERIALMARUNT.CCCQTYFL && !CCCMATERIALMARUNT.CONVERTIT) {
                //daca nu a mai fost convertit
                if (!CCCMATERIALMARUNT.CONVERTIT) {
                    tLinii.Append;
                    tLinii.MTRL = CCCMATERIALMARUNT.MTRL;
                    tLinii.MTRUNIT = CCCMATERIALMARUNT.MTRUNIT;
                    if (CCCMATERIALMARUNT.CCCQTYFL)
                        tLinii.CCCQTYFL = CCCMATERIALMARUNT.CCCQTYFL;
                    if (CCCMATERIALMARUNT.CCCQTYRESPMARFA)
                        tLinii.CCCQTY1SRV = CCCMATERIALMARUNT.CCCQTYRESPMARFA;
                    if (CCCMATERIALMARUNT.STOCLUCRARE)
                        tLinii.CCCSTOCWH = CCCMATERIALMARUNT.STOCLUCRARE;
                    tLinii.QTY1 = CCCMATERIALMARUNT.QTY1;
                    tLinii.FINDOCS = SALDOC.FINDOC;
                    if (CCCMATERIALMARUNT.CCCCLADIRE)
                        tLinii.CCCCLADIRE = CCCMATERIALMARUNT.CCCCLADIRE;
                    if (CCCMATERIALMARUNT.CCCPRIMARYSPACE)
                        tLinii.CCCPRIMARYSPACE = CCCMATERIALMARUNT.CCCPRIMARYSPACE;
                    if (CCCMATERIALMARUNT.CCCSECONDARYSPACE)
                        tLinii.CCCSECONDARYSPACE = CCCMATERIALMARUNT.CCCSECONDARYSPACE;
                    if (CCCMATERIALMARUNT.CCCINCAPERE)
                        tLinii.CCCINCAPERE = CCCMATERIALMARUNT.CCCINCAPERE;
                    if (CCCMATERIALMARUNT.CCCSPECIALITATESF)
                        tLinii.CCCSPECIALITATESF = CCCMATERIALMARUNT.CCCSPECIALITATESF;
                    if (CCCMATERIALMARUNT.CCCSF)
                        tLinii.CCCSF = CCCMATERIALMARUNT.CCCSF;
                    if (CCCMATERIALMARUNT.CCCCOLECTIESF)
                        tLinii.CCCCOLECTIESF = CCCMATERIALMARUNT.CCCCOLECTIESF;
                    if (CCCMATERIALMARUNT.CCCTABLOURI)
                        tLinii.CCCTABLOURI = CCCMATERIALMARUNT.CCCTABLOURI;
                    if (CCCMATERIALMARUNT.CCCCIRCUIT)
                        tLinii.CCCCIRCUIT = CCCMATERIALMARUNT.CCCCIRCUIT;
                    if (CCCMATERIALMARUNT.CCCMTRLGEN)
                        tLinii.CCCMTRLGEN = CCCMATERIALMARUNT.CCCMTRLGEN;
                    tLinii.Post;
                    CCCMATERIALMARUNT.CONVERTIT = 1; //semnalizez conversia liniei
                    CCCMATERIALMARUNT.POST;
                }
            }
            CCCMATERIALMARUNT.NEXT;
        }

        var id = bc.SHOWOBJFORM();
        if (tLinii.RECORDCOUNT) {
            //daca nu salveaza, undo semnalizarea
            if (!id) {
                CCCMATERIALMARUNT.FIRST;
                while (!CCCMATERIALMARUNT.EOF) {
                    CCCMATERIALMARUNT.CONVERTIT = null;
                    CCCMATERIALMARUNT.NEXT;
                }
            }
        }

    } catch (err) {
        X.WARNING(err.message);
    } finally {
        //X.WARNING(tLinii.RECORDCOUNT);
        bc.FREE;
        bc = null;
    }
}

function dateDiffH(start, stop) {
    var s1 = '2020-02-22T' + start.toString();
    var s2 = '2020-02-22T' + stop.toString();
    var dsta = new Date(s1);
    var dsto = new Date(s2);
    var dif = Math.abs(dsto - dsta);
    var ret = (stop.substring(0, 2)) > 12 ? (((dif / 1000) / 60) / 60) - SALDOC.CCCPAUZAMASA : (((dif / 1000) / 60) / 60);
    return ret;
}

function populeazaDinFL() {
    //adu toate liniile din fisa limita aferente acestui combo
    //daca era deja un combo introdus, si urmatorul difera, sterge liniile aferente combo anterior:
    if (ITELINES.RECORDCOUNT || SRVLINES.RECORDCOUNT) {
        if (X.ASK('Schimbare combo', 'Confirmati stergerea liniilor deja introduse?') == 6) {
            ITELINES.FIRST;
            while (!ITELINES.EOF) {
                ITELINES.DELETE;
                X.PROCESSMESSAGES;
            }
            SRVLINES.FIRST;
            while (!SRVLINES.EOF) {
                SRVLINES.DELETE;
                X.PROCESSMESSAGES;
            }

            CCCMATERIALMARUNT.FIRST;
            while (!CCCMATERIALMARUNT.EOF) {
                CCCMATERIALMARUNT.DELETE;
                X.PROCESSMESSAGES;
            }
        } else
            return;
    }

    //daca (select mtracn from mtrl where mtrl=ml.mtrl)<> 16 or ((select mtracn from mtrl where mtrl=ml.mtrl)=16 and (select mine from cccartgen where CCCMTRLGEN = ml.CCCMTRLGEN) = 0)
    var qq1 = 'select  MTRLINES, MTRL, CCCMTRLGEN, QTY1, ' +
        'CCCCLADIRE, CCCPRIMARYSPACE, CCCSECONDARYSPACE, CCCINCAPERE, ' +
        'CCCSPECIALITATESF, CCCSF, CCCCOLECTIESF, ' +
        'CCCTABLOURI , ' +
        'CCCCIRCUIT, ' +
        '(select isnull(mine, 777) mine from cccartgen where CCCMTRLGEN = ml.mtrl and cccheader=:SALDOC.CCCHEADER) MARFAMEA, ' +
        '(select isnull(mtracn, 0) mtracn from mtrl where mtrl=ml.mtrl) CATCON, ' +
        '(select name from mtrl where mtrl = ml.mtrl) ARTICOL, ' +
        '(select  isnull(sum(isnull(x.qty1, 0)), 0) q1 from mtrlines x ' +
        'inner join findoc y on (x.findoc=y.findoc and x.sosource=y.sosource and x.company=y.company) ' +
        'where y.sosource = 1151 and y.series=2101 and y.CCCFLMR = ' + SALDOC.CCCFLMR + ' and x.mtrl=ml.mtrl ' +
        '	AND x.WHOUSESEC=(SELECT CCCWHOUSESEC FROM PRJC WHERE PRJC=' + SALDOC.PRJC + ') AND x.PRJC= ' + SALDOC.PRJC +
        '	AND Y.COMPANY = ' + X.SYS.COMPANY +
        ' and X.CCCTABLOURI=ML.CCCTABLOURI AND X.CCCCIRCUIT=ML.CCCCIRCUIT AND X.CCCCLADIRE=ML.CCCCLADIRE AND X.CCCPRIMARYSPACE=ML.CCCPRIMARYSPACE ' +
        'AND X.CCCSECONDARYSPACE=ML.CCCSECONDARYSPACE AND X.CCCINCAPERE=ML.CCCINCAPERE AND X.CCCSPECIALITATESF=ML.CCCSPECIALITATESF AND X.CCCSF=ML.CCCSF and x.cccmtrlgen=ml.cccmtrlgen) q1, ' +
        '((SELECT ISNULL(SUM(ISNULL(AA.IMPQTY1-AA.EXPQTY1,0)), 0) AS si3 FROM MTRBALSHEET AA ' +
        'WHERE AA.COMPANY=:X.SYS.COMPANY AND AA.MTRL=ml.MTRL AND AA.FISCPRD=:X.SYS.FISCPRD ' +
        'AND AA.PERIOD<:X.SYS.PERIOD AND AA.WHOUSE=(SELECT CCCWHOUSESEC FROM PRJC WHERE PRJC=:SALDOC.PRJC)) + ' +
        '(SELECT SUM(ISNULL(AA.QTY1*BB.FLG01,0))-SUM(ISNULL(AA.QTY1*BB.FLG04,0))AS r3 ' +
        'FROM MTRTRN AA ,TPRMS BB WHERE AA.COMPANY =:X.SYS.COMPANY AND AA.MTRL=ml.MTRL AND AA.COMPANY = BB.COMPANY ' +
        'AND AA.WHOUSE=(SELECT CCCWHOUSESEC FROM PRJC WHERE PRJC=:SALDOC.PRJC) AND AA.TPRMS = BB.TPRMS AND ' +
        'AA.SODTYPE = BB.SODTYPE AND BB.SODTYPE = 51 AND AA.FISCPRD=:X.SYS.FISCPRD AND AA.PERIOD=:X.SYS.PERIOD and prjc=:SALDOC.PRJC ' +
        'AND AA.TRNDATE <DateAdd(d,1,CAST(GETDATE() AS DATE)))) q2 ' +
        'FROM MTRLINES ml ' +
        'WHERE FINDOC=' + SALDOC.CCCFLMR + ' AND SODTYPE=51 ' +
        whereAndClause(SALDOC, ':SALDOC', 'ml', 4, false) + ' order by ml.ccccircuit,ml.mtrl, CCCCLADIRE, CCCPRIMARYSPACE, CCCSECONDARYSPACE, CCCINCAPERE,' +
        'CCCSPECIALITATESF, CCCSF, CCCCOLECTIESF, CCCTABLOURI';
    var x = X.GETSQLDATASET(qq1, null);

    var qq = 'SELECT aa.MTRLINES, aa.MTRL, aa.QTY1, aa.CCCUM, CCCMTRLGEN, ' +
        '(select isnull(farageografie, 0) from cccactivitate where cccactivitate=aa.CCCACTIVITATE) FARAGEO, ' +
        'aa.CCCCLADIRE, aa.CCCPRIMARYSPACE, aa.CCCSECONDARYSPACE, aa.CCCINCAPERE, ' +
        'aa.CCCSPECIALITATESF, aa.CCCSF, aa.CCCCOLECTIESF, aa.CCCTABLOURI, ' +
        'aa.CCCCIRCUIT, ' +
        'aa.CCCSPECIALIZARE, aa.CCCCOLECTIE, aa.CCCCAPITOL, aa.CCCGRUPALUCRARI, aa.CCCACTIVITATE,  ' +
        'aa.COMMENTS, aa.COMMENTS1, aa.COMMENTS2  ' +
        'FROM MTRLINES aa WHERE aa.FINDOC=' + SALDOC.CCCFLMR + ' AND aa.SODTYPE=52 ' +
        'and isnull(aa.bool01, 0) <> 1 and ' +
        '(select isnull(farageografie, 0) from cccactivitate where cccactivitate=aa.CCCACTIVITATE) = 0 ' +
        whereAndClause(SALDOC, ':SALDOC', 'aa', 2, false) + ' ' +
        'union all ' +
        'select bb.MTRLINES, bb.MTRL, bb.QTY1, bb.CCCUM, bb.CCCMTRLGEN, ' +
        '(select isnull(farageografie, 0) from cccactivitate where cccactivitate=bb.CCCACTIVITATE) FARAGEO, ' +
        'null CCCCLADIRE, null CCCPRIMARYSPACE, null CCCSECONDARYSPACE, null CCCINCAPERE, ' +
        'bb.CCCSPECIALITATESF, bb.CCCSF, bb.CCCCOLECTIESF, bb.CCCTABLOURI, ' +
        'bb.CCCCIRCUIT, ' +
        'bb.CCCSPECIALIZARE, bb.CCCCOLECTIE, bb.CCCCAPITOL, bb.CCCGRUPALUCRARI, bb.CCCACTIVITATE, ' +
        'bb.COMMENTS, bb.COMMENTS1, bb.COMMENTS2  ' +
        'FROM MTRLINES bb WHERE bb.FINDOC=' + SALDOC.CCCFLMR + ' AND bb.SODTYPE=52 ' +
        'and isnull(bb.bool01, 0) <> 1 ' +
        'and (select isnull(farageografie, 0) from cccactivitate where cccactivitate=bb.CCCACTIVITATE) = 1 ' +
        whereAndClauseNoGeo('bb', false),
        y = X.GETSQLDATASET(qq, null);

    //mtracn=16 <=> articole deviz, care nu au stocabil; interzise in montaj
    //pot lucra cu articole deviz DOAR daca NU este marfa mea (adica lucrez cu marfa beneficiarului, nu trebuie sa o inregistrez niciunde)
    var str = '',
        str1 = '',
        str2 = '',
        str3 = '',
        valid = false;;
    x.FIRST;
    while (!x.EOF) {
        valid = false;
        //daca nu este articol deviz (generic) sau ESTE  DAR NU este marfa mea (marfa beneficiarului, nu trebuie inregistrata in sistemeul meu)
        if (x.MARFAMEA == 1) {
            if (x.CATCON == 16) {
                //nu are stocabil
                valid = false;
                str += x.ARTICOL + ' nu are stocabil desi este marfa mea.\n';
            } else {
                //este stocabil
                valid = true;
            }
        } else {
            //marfa beneficiar, poate trece
            valid = true;
            str += x.ARTICOL + ' nu are stocabil dar nu este marfa mea.\n';
        }

        //flag pentru utilizare material marunt pe flux
        //daca material marunt, mesaj + mutarea lui in tab-ul corespunzator; nu uita sa filter out materialul marunt din tab materiale.

        if (valid) {

            ITELINES.APPEND;
            X.PROCESSMESSAGES;
            ITELINES.MTRL = x.MTRL;
            if (x.CCCTABLOURI && ITELINES.CCCTABLOURI != x.CCCTABLOURI)
                ITELINES.CCCTABLOURI = x.CCCTABLOURI;
            if (x.CCCCIRCUIT && ITELINES.CCCCIRCUIT != x.CCCCIRCUIT && ITELINES.CCCTABLOURI)
                ITELINES.CCCCIRCUIT = x.CCCCIRCUIT;
            if (x.CCCMTRLGEN && ITELINES.CCCMTRLGEN != x.CCCMTRLGEN && ITELINES.CCCTABLOURI && ITELINES.CCCCIRCUIT)
                ITELINES.CCCMTRLGEN = x.CCCMTRLGEN;
            if (x.QTY1 && ITELINES.CCCQTYFL != x.QTY1)
                ITELINES.CCCQTYFL = x.QTY1;
            if (x.CCCCLADIRE && ITELINES.CCCCLADIRE != x.CCCCLADIRE)
                ITELINES.CCCCLADIRE = x.CCCCLADIRE;
            if (x.CCCPRIMARYSPACE && ITELINES.CCCPRIMARYSPACE != x.CCCPRIMARYSPACE)
                ITELINES.CCCPRIMARYSPACE = x.CCCPRIMARYSPACE;
            if (x.CCCSECONDARYSPACE && ITELINES.CCCSECONDARYSPACE != x.CCCSECONDARYSPACE)
                ITELINES.CCCSECONDARYSPACE = x.CCCSECONDARYSPACE;
            if (x.CCCINCAPERE && ITELINES.CCCINCAPERE != x.CCCINCAPERE)
                ITELINES.CCCINCAPERE = x.CCCINCAPERE;
            if (x.CCCSPECIALITATESF && ITELINES.CCCSPECIALITATESF != x.CCCSPECIALITATESF)
                ITELINES.CCCSPECIALITATESF = x.CCCSPECIALITATESF;
            if (x.CCCSF && ITELINES.CCCSF != x.CCCSF)
                ITELINES.CCCSF = x.CCCSF;
            if (x.CCCCOLECTIESF && ITELINES.CCCCOLECTIESF != x.CCCCOLECTIESF)
                ITELINES.CCCCOLECTIESF = x.CCCCOLECTIESF;
            if (x.q1 && ITELINES.CCCTOTBCV != x.q1)
                ITELINES.CCCTOTBCV = x.q1;
            if (x.q2 && ITELINES.CCCSTOCWH != x.q2)
                ITELINES.CCCSTOCWH = x.q2;
            ITELINES.MTRLINESS = x.MTRLINES;

            try {
                ITELINES.POST;
                X.PROCESSMESSAGES;
            } catch (err) {};

        }

        X.PROCESSMESSAGES();
        x.NEXT;
    }

    if (str)
        str1 += '\nMATERIALE:\n' + str + 'Nu se permite preluarea in RZL.';

    y.FIRST;
    while (!y.EOF) {
        valid = true;

        if (valid) {
            var geny = y.ISNULL('CCCMTRLGEN') == 1 ? null : y.CCCMTRLGEN;
            var ay = y.ISNULL('CCCCLADIRE') == 1 ? null : y.CCCCLADIRE;
            var by = y.ISNULL('CCCPRIMARYSPACE') == 1 ? null : y.CCCPRIMARYSPACE;
            var cy = y.ISNULL('CCCSECONDARYSPACE') == 1 ? null : y.CCCSECONDARYSPACE;
            var dy = y.ISNULL('CCCINCAPERE') == 1 ? null : y.CCCINCAPERE;
            var ey = y.ISNULL('CCCCIRCUIT') == 1 ? null : y.CCCCIRCUIT;
            var fy = y.ISNULL('CCCSPECIALITATESF') == 1 ? null : y.CCCSPECIALITATESF;
            var gy = y.ISNULL('CCCSF') == 1 ? null : y.CCCSF;
            var hy = y.ISNULL('CCCCOLECTIESF') == 1 ? null : y.CCCCOLECTIESF;
            var iy = y.ISNULL('CCCTABLOURI') == 1 ? null : y.CCCTABLOURI;
            var jy = y.ISNULL('CCCSPECIALIZARE') == 1 ? null : y.CCCSPECIALIZARE;
            var jky = y.ISNULL('CCCCOLECTIE') == 1 ? null : y.CCCCOLECTIE;
            var ky = y.ISNULL('CCCCAPITOL') == 1 ? null : y.CCCCAPITOL;
            var ly = y.ISNULL('CCCGRUPALUCRARI') == 1 ? null : y.CCCGRUPALUCRARI;
            var my = y.ISNULL('CCCACTIVITATE') == 1 ? null : y.CCCACTIVITATE;
            var aa = SRVLINES.LOCATE('MTRL;CCCMTRLGEN;CCCCLADIRE;CCCPRIMARYSPACE;CCCSECONDARYSPACE;CCCINCAPERE;CCCCIRCUIT;CCCSPECIALITATESF;CCCSF;CCCCOLECTIESF;CCCTABLOURI;CCCSPECIALIZARE;CCCCOLECTIE;CCCCAPITOL;CCCGRUPALUCRARI;CCCACTIVITATE',
                y.MTRL, geny, ay, by, cy, dy, ey, fy, gy, hy, iy, jy, jky, ky, ly, my);

            if (aa) {
                //m-am dus pe linia potrivita, urmeaza update-ul mai jos
            } else {
                //nu este, adauga
                SRVLINES.APPEND;
                X.PROCESSMESSAGES;
                SRVLINES.MTRL = y.MTRL;
            }

            if (y.CCCTABLOURI && SRVLINES.CCCTABLOURI != y.CCCTABLOURI)
                SRVLINES.CCCTABLOURI = y.CCCTABLOURI;
            if (y.CCCCIRCUIT && SRVLINES.CCCCIRCUIT != y.CCCCIRCUIT && SRVLINES.CCCTABLOURI)
                SRVLINES.CCCCIRCUIT = y.CCCCIRCUIT;
            if (y.CCCMTRLGEN && SRVLINES.CCCMTRLGEN != y.CCCMTRLGEN && SRVLINES.CCCTABLOURI && SRVLINES.CCCCIRCUIT)
                SRVLINES.CCCMTRLGEN = y.CCCMTRLGEN;
            if (y.QTY1 && SRVLINES.CCCQTYFL != y.QTY1)
                SRVLINES.CCCQTYFL = y.QTY1;
            if (y.CCCUM && SRVLINES.CCCUM != y.CCCUM)
                SRVLINES.CCCUM = y.CCCUM;
            if (y.CCCCLADIRE && SRVLINES.CCCCLADIRE != y.CCCCLADIRE)
                SRVLINES.CCCCLADIRE = y.CCCCLADIRE;
            if (y.CCCPRIMARYSPACE && SRVLINES.CCCPRIMARYSPACE != y.CCCPRIMARYSPACE)
                SRVLINES.CCCPRIMARYSPACE = y.CCCPRIMARYSPACE;
            if (y.CCCSECONDARYSPACE && SRVLINES.CCCSECONDARYSPACE != y.CCCSECONDARYSPACE)
                SRVLINES.CCCSECONDARYSPACE = y.CCCSECONDARYSPACE;
            if (y.CCCINCAPERE && SRVLINES.CCCINCAPERE != y.CCCINCAPERE)
                SRVLINES.CCCINCAPERE = y.CCCINCAPERE;
            if (y.CCCSPECIALITATESF && SRVLINES.CCCSPECIALITATESF != y.CCCSPECIALITATESF)
                SRVLINES.CCCSPECIALITATESF = y.CCCSPECIALITATESF;
            if (y.CCCSF && SRVLINES.CCCSF != y.CCCSF)
                SRVLINES.CCCSF = y.CCCSF;
            if (y.CCCCOLECTIESF && SRVLINES.CCCCOLECTIESF != y.CCCCOLECTIESF)
                SRVLINES.CCCCOLECTIESF = y.CCCCOLECTIESF;
            if (y.CCCSPECIALIZARE && SRVLINES.CCCSPECIALIZARE != y.CCCSPECIALIZARE)
                SRVLINES.CCCSPECIALIZARE = y.CCCSPECIALIZARE;
            if (y.CCCCOLECTIE && SRVLINES.CCCCOLECTIE != y.CCCCOLECTIE)
                SRVLINES.CCCCOLECTIE = y.CCCCOLECTIE;
            if (y.CCCCAPITOL && SRVLINES.CCCCAPITOL != y.CCCCAPITOL)
                SRVLINES.CCCCAPITOL = y.CCCCAPITOL;
            if (y.CCCGRUPALUCRARI && SRVLINES.CCCGRUPALUCRARI != y.CCCGRUPALUCRARI)
                SRVLINES.CCCGRUPALUCRARI = y.CCCGRUPALUCRARI;
            if (y.CCCACTIVITATE && SRVLINES.CCCACTIVITATE != y.CCCACTIVITATE)
                SRVLINES.CCCACTIVITATE = y.CCCACTIVITATE;
            SRVLINES.MTRLINESS = y.MTRLINES;
            SRVLINES.COMMENTS = y.COMMENTS;
            SRVLINES.COMMENTS1 = y.COMMENTS1;
            SRVLINES.COMMENTS2 = y.COMMENTS2;
            extra();

            try {
                SRVLINES.POST;
                X.PROCESSMESSAGES;
            } catch (err) {};
        }

        X.PROCESSMESSAGES();
        y.NEXT;
    }

    if (str2) {
        //if (!ITELINES.RECORDCOUNT)
        //str3 += '\nACTIVITATI:\n' + 'Nu am materiale, deci nu am activitati.\n';
        str3 += '\nACTIVITATI:\n' + str2;
    }

    var dsMM = X.GETSQLDATASET('select aaa.cccmtrlgen, aaa.mtrl, bbb.cccestematerialmarunt x, cc.cccestematerialmarunt y, aaa.qty1, ' +
        'aaa.ccccladire, aaa.cccprimaryspace, aaa.cccsecondaryspace, aaa.cccincapere, aaa.ccccolectiesf, aaa.cccsf, aaa.cccspecialitatesf, aaa.ccctablouri, aaa.ccccircuit, ' +
        '(SELECT isnull(SUM(isnull(IMPQTY1, 0) - isnull(EXPQTY1, 0)), 0) FROM MTRBALSHEET WHERE COMPANY = :X.SYS.COMPANY AND MTRL =  aaa.mtrl ' +

        ' and fiscprd=:X.SYS.FISCPRD and whouse=(SELECT CCCWHOUSESEC FROM PRJC WHERE PRJC=:SALDOC.PRJC)) stocLuc, ' +
        '(select  isnull(sum(isnull(x.qty1, 0)), 0) q1 from mtrlines x ' +
        'inner join findoc y on (x.findoc=y.findoc and x.sosource=y.sosource and x.company=y.company) ' +
        'where y.sosource = 1151 and y.series=2101 and y.CCCFLMR = ' + SALDOC.CCCFLMR + ' and x.mtrl=aaa.mtrl ' +
        '	AND x.WHOUSESEC=(SELECT CCCWHOUSESEC FROM PRJC WHERE PRJC=' + SALDOC.PRJC + ') AND x.PRJC= ' + SALDOC.PRJC +
        '	AND Y.COMPANY = ' + X.SYS.COMPANY +
        ' and X.CCCTABLOURI=aaa.CCCTABLOURI AND X.CCCCIRCUIT=aaa.CCCCIRCUIT AND X.CCCCLADIRE=aaa.CCCCLADIRE AND X.CCCPRIMARYSPACE=aaa.CCCPRIMARYSPACE ' +
        'AND X.CCCSECONDARYSPACE=aaa.CCCSECONDARYSPACE AND X.CCCINCAPERE=aaa.CCCINCAPERE AND X.CCCSPECIALITATESF=aaa.CCCSPECIALITATESF AND X.CCCSF=aaa.CCCSF and x.cccmtrlgen=aaa.cccmtrlgen) q1 ' +
        'from mtrlines aaa ' +
        'inner join mtrl bbb on(aaa.mtrl = bbb.mtrl) ' +
        'left join mtrl cc on(aaa.cccmtrlgen = cc.mtrl) ' +
        'where aaa.findoc = ' + SALDOC.CCCFLMR + ' and isnull(bbb.cccestematerialmarunt, 0) =1 and  isnull(cc.cccestematerialmarunt, 0) = 1', null);
    if (dsMM.RECORDCOUNT) {
        dsMM.FIRST;
        while (!dsMM.EOF) {
            CCCMATERIALMARUNT.APPEND;
            if (dsMM.cccmtrlgen)
                CCCMATERIALMARUNT.CCCMTRLGEN = dsMM.cccmtrlgen;
            if (dsMM.mtrl)
                CCCMATERIALMARUNT.MTRL = dsMM.mtrl;
            if (dsMM.ccccladire)
                CCCMATERIALMARUNT.CCCCLADIRE = dsMM.ccccladire;
            if (dsMM.cccprimaryspace)
                CCCMATERIALMARUNT.CCCPRIMARYSPACE = dsMM.cccprimaryspace;
            if (dsMM.cccsecondaryspace)
                CCCMATERIALMARUNT.CCCSECONDARYSPACE = dsMM.cccsecondaryspace;
            if (dsMM.cccincapere)
                CCCMATERIALMARUNT.CCCINCAPERE = dsMM.cccincapere;
            if (dsMM.ccccolectiesf)
                CCCMATERIALMARUNT.CCCCOLECTIESF = dsMM.ccccolectiesf;
            if (dsMM.cccsf)
                CCCMATERIALMARUNT.CCCSF = dsMM.cccsf;
            if (dsMM.cccspecialitatesf)
                CCCMATERIALMARUNT.CCCSPECIALITATESF = dsMM.cccspecialitatesf;
            if (dsMM.ccctablouri)
                CCCMATERIALMARUNT.CCCTABLOURI = dsMM.ccctablouri;
            if (dsMM.ccccircuit)
                CCCMATERIALMARUNT.CCCCIRCUIT = dsMM.ccccircuit;
            if (dsMM.qty1)
                CCCMATERIALMARUNT.CCCQTYFL = dsMM.qty1;
            if (dsMM.stocLuc && CCCMATERIALMARUNT.STOCLUCRARE != dsMM.stocLuc)
                CCCMATERIALMARUNT.STOCLUCRARE = dsMM.stocLuc;
            if (dsMM.q1 && CCCMATERIALMARUNT.CCCTOTBCV != dsMM.q1)
                CCCMATERIALMARUNT.CCCTOTBCV = dsMM.q1;
            CCCMATERIALMARUNT.POST;
            X.PROCESSMESSAGES;
            dsMM.NEXT;
        }
    }

    X.WARNING('Proces incheiat.\n' + str1 + '\n' + str3);
}

function whereAndClause(obj, sqlObj, alias, offset, itsPontaj) {
    var response = '';
    //debugger;
    var aliasArtGen,
        aliasCircuit;
    if (!itsPontaj) {
        aliasArtGen = alias + '.CCCMTRLGEN';
        aliasCircuit = alias + '.CCCCIRCUIT';
    } else {
        aliasArtGen = alias + '.INT02';
        aliasCircuit = alias + '.INT01';
    }
    var campuriRef = [obj.CCCCLADIRE, obj.CCCPRIMARYSPACE, obj.CCCSECONDARYSPACE, obj.CCCINCAPERE, obj.CCCSPECIALITATESF, obj.CCCSF, obj.CCCCOLECTIESF, obj.CCCTABLOURI, obj.CCCSPECIALIZARE, obj.CCCCOLECTIE, obj.CCCCAPITOL, obj.CCCMTRLGEN, obj.CCCCIRCUIT];
    var valoriRef = [sqlObj + '.CCCCLADIRE', sqlObj + '.CCCPRIMARYSPACE', sqlObj + '.CCCSECONDARYSPACE', sqlObj + '.CCCINCAPERE', sqlObj + '.CCCSPECIALITATESF', sqlObj + '.CCCSF', sqlObj + '.CCCCOLECTIESF', sqlObj + '.CCCTABLOURI', sqlObj + '.CCCSPECIALIZARE', sqlObj + '.CCCCOLECTIE', sqlObj + '.CCCCAPITOL', sqlObj + '.CCCMTRLGEN', sqlObj + '.CCCCIRCUIT'];
    var aDatasetToBeFiltered = [alias + '.CCCCLADIRE', alias + '.CCCPRIMARYSPACE', alias + '.CCCSECONDARYSPACE', alias + '.CCCINCAPERE', alias + '.CCCSPECIALITATESF', alias + '.CCCSF', alias + '.CCCCOLECTIESF', alias + '.CCCTABLOURI', alias + '.CCCCOLECTIE', alias + '.CCCSPECIALIZARE', alias + '.CCCCAPITOL', aliasArtGen, aliasCircuit];
    var capat = aDatasetToBeFiltered.length - offset;

    for (var i = 0; i < capat; i++) {
        if (campuriRef[i]) {
            response += ' and ' + aDatasetToBeFiltered[i] + '=' + valoriRef[i];
        }
    }

    return response;
}

function whereAndClauseNoGeo(alias, isIte) {
    var response = '',
        x = SALDOC,
        y = ':SALDOC',
        docFields = [x.CCCSPECIALITATESF, x.CCCSF, x.CCCCOLECTIESF, x.CCCTABLOURI, x.CCCSPECIALIZARE, x.CCCCOLECTIE, x.CCCCAPITOL],
        docFldStr = [y + '.CCCSPECIALITATESF', y + '.CCCSF', y + '.CCCCOLECTIESF', y + '.CCCTABLOURI', y + '.CCCSPECIALIZARE', y + '.CCCCOLECTIE', y + '.CCCCAPITOL'],
        LiniiFldStr = [alias + '.CCCSPECIALITATESF', alias + '.CCCSF', alias + '.CCCCOLECTIESF', alias + '.CCCTABLOURI', alias + '.CCCSPECIALIZARE', alias + '.CCCCOLECTIE', alias + '.CCCCAPITOL'],
        capat = isIte ? docFields.length - 2 : docFields.length;

    for (var i = 0; i < capat; i++) {
        if (docFields[i]) {
            response += ' and ' + LiniiFldStr[i] + '=' + docFldStr[i];
        }
    }

    return response;
}

function extra() {
    var a = SRVLINES.CCCSPECIALITATESF ? ' AND CCCSPECIALITATESF=ISNULL(' + SRVLINES.CCCSPECIALITATESF + ', 0)' : '';
    var b = SRVLINES.CCCSF ? ' AND CCCSF=ISNULL(' + SRVLINES.CCCSF + ', 0)' : '';
    var c = SRVLINES.CCCCOLECTIESF ? ' AND CCCCOLECTIESF=ISNULL(' + SRVLINES.CCCCOLECTIESF + ', 0)' : '';
    var d = SRVLINES.CCCTABLOURI ? ' AND CCCTABLOURI=ISNULL(' + SRVLINES.CCCTABLOURI + ', 0)' : '';
    var e = SRVLINES.CCCCLADIRE ? ' AND CCCCLADIRE=ISNULL(' + SRVLINES.CCCCLADIRE + ', 0)' : '';
    var f = SRVLINES.CCCPRIMARYSPACE ? ' AND CCCPRIMARYSPACE=ISNULL(' + SRVLINES.CCCPRIMARYSPACE + ', 0)' : '';
    var g = SRVLINES.CCCSECONDARYSPACE ? ' AND CCCSECONDARYSPACE=ISNULL(' + SRVLINES.CCCSECONDARYSPACE + ', 0)' : '';
    var h = SRVLINES.CCCINCAPERE ? ' AND CCCINCAPERE=ISNULL(' + SRVLINES.CCCINCAPERE + ', 0)' : '';
    var i = SRVLINES.CCCCIRCUIT ? ' AND INT01=ISNULL(' + SRVLINES.CCCCIRCUIT + ', 0)' : '';
    if ((SRVLINES.CCCACTIVITATE)) {
        sSQL2 = 'select sum(isnull(cccrealizatzi,0)) cccrealizatzi from findoc where company=' + X.SYS.COMPANY +
            ' and sosource=1011 and fprms=1011 and prjc=' + SALDOC.PRJC +
            ' and CCCSPECIALIZARE=' + SRVLINES.CCCSPECIALIZARE + ' and CCCCOLECTIE=' + SRVLINES.CCCCOLECTIE + ' and CCCCAPITOL=' + SRVLINES.CCCCAPITOL +
            ' and CCCGRUPALUCRARI=' + SRVLINES.CCCGRUPALUCRARI + ' and CCCACTIVITATE=' + SRVLINES.CCCACTIVITATE +
            a + b + c + d + e + f + g + h + i;
        dsSQL2 = X.GETSQLDATASET(sSQL2, null);

        //iau la intamplare din ccc-uri, ca ma doare sufletul sa mai creez campuri noi:
        if (SRVLINES.CCCQTYINIT != dsSQL2.cccrealizatzi)
            SRVLINES.CCCQTYINIT = dsSQL2.cccrealizatzi;
    }
}

//filtru in linii pe deviz si obiect CM
function ON_SALDOC_CCCFILTRUOBIECTCM() {
    filterThis(SALDOC.CCCFILTRUOBIECTCM, 'PRJCSTAGE');
}

function ON_SALDOC_CCCFILTRUDEVIZCM() {
    filterThis(SALDOC.CCCFILTRUDEVIZCM, 'CCCDEVIZECM');
}

function ON_SALDOC_CCCFILTRUSPECIALITATESF() {
    filterThis(SALDOC.CCCFILTRUSPECIALITATESF, 'CCCSPECIALITATESF');
}

function ON_SALDOC_CCCFILTRUSF() {
    filterThis(SALDOC.CCCFILTRUSF, 'CCCSF');
}

function ON_SALDOC_CCCFILTRUCOLECTIESF() {
    filterThis(SALDOC.CCCFILTRUCOLECTIESF, 'CCCCOLECTIESF');
}

function ON_SALDOC_CCCFILTRUTABLOU() {
    filterThis(SALDOC.CCCFILTRUTABLOU, 'CCCTABLOU');
}

function filterThis(ds, intCampFiltru, strCampFiltrat) {
    //filtru cumulativ
    var a = stareaActualaFiltre(strDs),
        strDs = "'" + ds + "'";
    if (intCampFiltru) {
        if (a) {
            ds.FILTER = '(' + a + ' AND {' + strDs + '.' + strCampFiltrat + '}=' + intCampFiltru + ')';
            ds.FILTERED = 1;
        } else {
            ds.FILTER = '({' + strDs + '.' + strCampFiltrat + '}=' + intCampFiltru + ')';
            ds.FILTERED = 1;
        }
    } else {
        if (a) {
            ds.FILTER = '(' + a + ')';
            ds.FILTERED = 1;
        } else {
            ds.FILTERED = 0;
        }
    }
}

function stareaActualaFiltre(strDs) {
    var arrFilters = [SALDOC.CCCFILTRUOBIECTCM, SALDOC.CCCFILTRUDEVIZCM, SALDOC.CCCFILTRUSPECIALITATESF, SALDOC.CCCFILTRUSF, SALDOC.CCCFILTRUCOLECTIESF, SALDOC.CCCFILTRUTABLOU];
    var ret = ''; //default

    var arrFields = [strDs + '.PRJCSTAGE', strDs + '.CCCDEVIZECM', strDs + '.CCCSPECIALITATE', strDs + '.CCCSF', strDs + '.CCCCOLECTIESF', strDs + '.CCCTABLOU'];

    for (var i = 0; i < arrFilters.length; i++) {
        if (arrFilters[i]) {
            ret += '{' + arrFields[i] + '}=' + arrFilters[i] + ' AND ';
        }
    }

    if (ret) {
        //am un ' AND ' (5 caractere) care ma incurca la sfarsitul frazei
        ret = ret.substring(0, ret.length - 5);
    }

    return ret;
}

function ON_CANCEL() {
    ITELINES.FILTERED = 0;
    SRVLINES.FILTERED = 0;
}

function ON_SALDOC_PRJC() {
    var sSQL = 'select TRDBRANCH, CCCWHOUSESEC from prjc where prjc=' + SALDOC.PRJC;
    var ds = X.GETSQLDATASET(sSQL, '');

    SALDOC.TRDBRANCH = ds.TRDBRANCH;
    MTRDOC.WHOUSE = ds.CCCWHOUSESEC;

    if (SALDOC.PRJC) {

        sSQL = 'select varchar02,varchar03,varchar04 from prjextra where prjc=' + SALDOC.PRJC;
        RCCC = X.GETSQLDATASET(sSQL, '');

        SALDOC.CCCNRCME = RCCC.varchar03;
        SALDOC.CCCNRCTR = RCCC.varchar04;
        SALDOC.CCCNRCOM = RCCC.varchar02;

        //completare FL si CCCHEADER
        coun = X.SQL('select count(findoc) contor from findoc where series = 4067 and prjc=' + SALDOC.PRJC, null);

        if (coun > 0) {
            sSQLFL = 'select findoc, CCCRESP, CCCPERSCONST from findoc where series = 4067 and prjc=' + SALDOC.PRJC;
            dsFL = X.GETSQLDATASET(sSQLFL, null);

            if (dsFL.findoc)
                SALDOC.CCCFLMR = dsFL.findoc;
            if (dsFL.CCCRESP)
                SALDOC.CCCRESP = dsFL.CCCRESP;
            if (dsFL.CCCPERSCONST)
                SALDOC.CCCPERSCONST = dsFL.CCCPERSCONST;
        }

        var schel = X.SQL('select ISNULL(cccheader, 0) from cccheader where prjc=' + SALDOC.PRJC, null);
        if (schel) {
            SALDOC.CCCHEADER = schel;
        }
    }
}

function ON_SALDOC_DATE01() {
    CCCANGAJATISUBATREPRENOR.FIRST;
    while (!CCCANGAJATISUBATREPRENOR.EOF) {
        CCCANGAJATISUBATREPRENOR.DELA = SALDOC.DATE01;
        CCCANGAJATISUBATREPRENOR.NEXT;
    }
}

function ON_SALDOC_DATE02() {
    CCCANGAJATISUBATREPRENOR.FIRST;
    while (!CCCANGAJATISUBATREPRENOR.EOF) {
        CCCANGAJATISUBATREPRENOR.PANALA = SALDOC.DATE02;
        CCCANGAJATISUBATREPRENOR.NEXT;
    }
}

function ON_SRVLINES_CCCACTIVITATE() {
    if (!SRVLINES.CCCACTIVITATE) {
        return;
    }
    //autofill colectie, capitol, grupa
    var q = 'select distinct a.cccactivitate, b.cccgrupalucrari, c.ccccapitol, d.ccccolectie, e.cccspecializare, a.normatimp from cccactivitate a ' +
        'inner join cccgrupalucrari b on (a.cccgrupalucrari=b.cccgrupalucrari) ' +
        'inner join ccccapitol c on (b.ccccapitol=c.ccccapitol) ' +
        'inner join ccccolectie d on (c.ccccolectie=d.ccccolectie) ' +
        'inner join ccccolectie e on (d.ccccolectie=e.cccspecializare) ' +
        'where a.cccactivitate=' + SRVLINES.CCCACTIVITATE;
    var ds = X.GETSQLDATASET(q, null);

    if (ds.RECORDCOUNT) {
        ds.FIRST;
        SRVLINES.CCCSPECIALIZARE = ds.cccspecializare;
        SRVLINES.CCCCOLECTIE = ds.ccccolectie;
        SRVLINES.CCCCAPITOL = ds.ccccapitol;
        SRVLINES.CCCGRUPALUCRARI = ds.cccgrupalucrari;
    }

    if (SRVLINES.CCCACTIVITATE) {
        var um = X.SQL('select isnull(cccunitatemasura, 0) from cccactivitate where cccactivitate=' + SRVLINES.CCCACTIVITATE, null);
        if (um && SRVLINES.CCCUM != um)
            //SRVLINES.EDIT;
            SRVLINES.CCCUM = um;
    }
}

function ON_SRVLINES_QTY1() {
    SRVLINES.QTY2 = calcTimpNormat(SRVLINES.QTY1); //cant * norma timp
}

function ON_ITELINES_QTY1() {
    var str = '';
    if (ITELINES.QTY1) {
        if (ITELINES.QTY1 > ITELINES.CCCQTY1SRV) {
            str += 'Cantitate mai mare decat stoc responsabil.\n';
            ITELINES.QTY1 = 0;
        }
        if (convToFixed(ITELINES.QTY1) > convToFixed(ITELINES.CCCQTYFL) - convToFixed(ITELINES.CCCTOTBCV)) {
            str += 'Cantitate mai mare decat cea din FL.\n';
            ITELINES.QTY1 = 0;
        }

        if (str) {
            X.WARNING(str);
        }
    }
}

function convToFixed(nr) {
    return (Math.floor(nr / 1000) * 1000).toFixed(2);
}

function calcTimpNormat(qty1) {
    //localizeaza norma timp aferenta activitatii in proiectul curent; timp normat = norma timp * qty1
    var nt = X.GETSQLDATASET('select isnull(normatimp, 0) normatimp from CCCACTIVITATEPRJC where prjc = ' + SALDOC.PRJC +
        ' and cccactivitate=' + SRVLINES.CCCACTIVITATE, null).normatimp;
    if (nt == 0) {
        //X.WARNING('Nu este definita norma timp pe aceasta activitate in proiect.\nNorma timp = 1.');
        return 1;
    } else {
        return qty1 * nt;
    }
}

function ON_SFMAGAZIONERI_PRSN() {
    //adu centralizatorul aferent responsabilului de marfa

}

function ON_SALDOC_CCCMAGAZIONER() {
    actualizeazaMarfaLaResponsabil(SALDOC.CCCMAGAZIONER);
}

function actualizeazaMarfaLaResponsabil(respMa) {
    //debugger;
    var o = X.CreateObj('ITEDOC');

    try {
        o.DBLocate(X.GETSQLDATASET('select findoc from findoc where sosource=1151 and series=2015 and fprms=2015 and iscancel=0 and ' +
            'cccmagazioner=' + respMa, null).findoc);
        var l = o.FindTable('ITELINES');
        ITELINES.FIRST;
        while (!ITELINES.EOF) {
            if (l.LOCATE('MTRL', ITELINES.MTRL) == 1) {
                ITELINES.CCCQTY1SRV = l.QTY1;
            }
            ITELINES.NEXT;
        }

        CCCMATERIALMARUNT.FIRST;
        while (!CCCMATERIALMARUNT.EOF) {
            if (l.LOCATE('MTRL', CCCMATERIALMARUNT.MTRL) == 1) {
                CCCMATERIALMARUNT.CCCQTYRESPMARFA = l.QTY1;
            }
            CCCMATERIALMARUNT.NEXT;
        }
    } catch (err) {
        X.WARNING(err.message);
    } finally {
        o.Free;
        o = null;
    }
}

function hProgramTot() {
    var oreExcluse = X.FILTERSUM('SRVLINES.QTY1', 'CCCUM=6'),
        ret = 0;
    CCCANGAJATISUBATREPRENOR.DISABLECONTROLS;
    CCCANGAJATISUBATREPRENOR.FIRST;
    while (!CCCANGAJATISUBATREPRENOR.EOF) {
        var dif = dateDiffH(X.FORMATDATE('hh:MM', CCCANGAJATISUBATREPRENOR.DELA), X.FORMATDATE('hh:MM', CCCANGAJATISUBATREPRENOR.PANALA));

        ret += dif;

        CCCANGAJATISUBATREPRENOR.NEXT;
    }
    CCCANGAJATISUBATREPRENOR.ENABLECONTROLS;

    return ret - oreExcluse;
}

function hProgramTotCuExcluse() {
    var ret = 0;
    CCCANGAJATISUBATREPRENOR.DISABLECONTROLS;
    CCCANGAJATISUBATREPRENOR.FIRST;
    while (!CCCANGAJATISUBATREPRENOR.EOF) {
        var dif = dateDiffH(X.FORMATDATE('hh:MM', CCCANGAJATISUBATREPRENOR.DELA), X.FORMATDATE('hh:MM', CCCANGAJATISUBATREPRENOR.PANALA));

        ret += dif;

        CCCANGAJATISUBATREPRENOR.NEXT;
    }
    CCCANGAJATISUBATREPRENOR.ENABLECONTROLS;

    return ret;
}

function calculOreActivitati() {
    //Calcul ore om

    //pentru fiecare activitate creaza o fisa pontaj subantreprenor, cu calcul timpi per om:
    //timp normat activitate * total ore program / total nr ore normate toate activitatile / nr persoane
    //total ore program = sum(ore program angajat, din linii)

    //debugger;
    var hNormatTot = 0,
        tot = hProgramTot();

    SRVLINES.DISABLECONTROLS;
    SRVLINES.FIRST;
    while (!SRVLINES.EOF) {
        if (SRVLINES.CCCUM != 6) {
            hNormatTot += SRVLINES.QTY2;
        }
        SRVLINES.NEXT;
    }
    SRVLINES.ENABLECONTROLS;

    SRVLINES.EDIT;
    SRVLINES.FIRST;
    while (!SRVLINES.EOF) {
        if (SRVLINES.CCCUM != 6)
            SRVLINES.QTY = SRVLINES.QTY2 * tot / hNormatTot;
        else {
            SRVLINES.QTY = SRVLINES.QTY2;
        }
        SRVLINES.POST;
        SRVLINES.NEXT;
    }
}

function ON_LOCATE() {
    ITELINES.FILTERED = 0;
    highlightUI();
}

function ON_INSERT() {
    //X.OPENSUBFORM('SFSUBANTR');
}

function highlightUI() {
    X.FIELDCOLOR('SALDOC.PRJC', 52428);
}

function ON_CCCRZLSUBANTRAUTO_KMS() {
    CCCRZLSUBANTRAUTO.VALUE = CCCRZLSUBANTRAUTO.KMS * CCCRZLSUBANTRAUTO.KMCOST;
}

function ON_CCCRZLSUBANTRUTIL_KMS() {
    CCCRZLSUBANTRUTIL.KMVALUE = CCCRZLSUBANTRUTIL.KMS * CCCRZLSUBANTRUTIL.KMCOST;
}

function ON_CCCRZLSUBANTRUTIL_HS() {
    CCCRZLSUBANTRUTIL.HVALUE = CCCRZLSUBANTRUTIL.HS * CCCRZLSUBANTRUTIL.HCOST;
}

function ON_CCCRZLSUBANTRAUTO_HS() {
    CCCRZLSUBANTRAUTO.HVALUE = CCCRZLSUBANTRAUTO.HS * CCCRZLSUBANTRAUTO.HCOST;
}

function ON_SALDOC_CCCSUBANTREPRENOR() {
    if (SALDOC.CCCSUBANTREPRENOR) {
        //SALDOC.CCCAPROBATPLATA = X.SQL('select isnull(ccctipexecutant, 0) from rsrctype where rsrctype=' + SALDOC.CCCSUBANTREPRENOR, null);
    }
}

function ON_SRVLINES_BOOL01() {
    if (!setFinalizat(SRVLINES.BOOL01))
        X.WARNING('Nu s-a actualizat FL.');
}

function setFinalizat(yn) {
    var q = 'update c set c.bool01 = ' + yn +
        ' from mtrlines a ' +
        'inner join findoc b on (a.findoc=b.findoc) ' +
        'inner join mtrlines c on (c.findoc=b.cccflmr and c.mtrlines=a.mtrliness) ' +
        'where a.findoc=' + SALDOC.FINDOC + ' and c.mtrlines=' + SRVLINES.MTRLINESS,
        r = X.RUNSQL(q, null);
    if (r)
        return true;
    else
        return false;
}

function ON_ITELINES_NEW() {
    //debugger;
    if (ITELINES.RECNO == -1 && SALDOC.FINDOC < 0) {
        checkDuble();
    }
}

function ON_SRVLINES_NEW() {
    if (SRVLINES.RECNO == -1 && SALDOC.FINDOC < 0) {
        checkDuble();
    }
}

function checkDuble() {
    var cladire = SALDOC.CCCCLADIRE ? ' and ccccladire=' + SALDOC.CCCCLADIRE : '',
        ps = SALDOC.CCCPRIMARYSPACE ? ' and cccprimaryspace=' + SALDOC.CCCPRIMARYSPACE : '',
        ss = SALDOC.CCCSECONDARYSPACE ? ' and cccsecondaryspace=' + SALDOC.CCCSECONDARYSPACE : '',
        inc = SALDOC.CCCINCAPERE ? ' and cccincapere=' + SALDOC.CCCINCAPERE : '',
        ssf = SALDOC.CCCSPECIALITATESF ? ' and CCCSPECIALITATESF=' + SALDOC.CCCSPECIALITATESF : '',
        sf = SALDOC.CCCSF ? ' and cccsf=' + SALDOC.CCCSF : '',
        csf = SALDOC.CCCCOLECTIESF ? ' and ccccolectiesf=' + SALDOC.CCCCOLECTIESF : '',
        s = SALDOC.CCCSPECIALIZARE ? ' and cccspecializare=' + SALDOC.CCCSPECIALIZARE : '',
        c = SALDOC.CCCCOLECTIE ? ' and ccccolectie=' + SALDOC.CCCCOLECTIE : '',
        ca = SALDOC.CCCCAPITOL ? ' and ccccapitol=' + SALDOC.CCCCAPITOL : '',
        t = SALDOC.CCCTABLOURI ? ' and ccctablouri=' + SALDOC.CCCTABLOURI : '',
        e = SALDOC.CCCSUBANTREPRENOR ? ' and cccsubantreprenor=' + SALDOC.CCCSUBANTREPRENOR : '',
        q = cladire ? "select isnull(fincode, '') from findoc where series=4075 and trndate = '" + X.FORMATDATE('YYYYMMDD', SALDOC.TRNDATE) + "'" + cladire + ps + ss + inc + ssf + sf + csf + s + c + ca + t + e : 'select 0',
        altul = X.SQL(q, null);
    if (altul != 0) {
        X.EXCEPTION('Exista urmatorul RZL pe acest combo: ' + altul);
    }
}

function ON_EDIT() {
    if (X.FILTERSUM('ITELINES.BOOL01', '1=1') > 0 || X.FILTERSUM('SRVLINES.BOOL02', '1=1') > 0) {
        //exista linii convertite fie in bon consum fie in pontaje, nu poti schimba header sau linii convertite

    }
}