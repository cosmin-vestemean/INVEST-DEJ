/*
CREATE TABLE CCCVARFLVIA(
CCCVARFLVIA INT NOT NULL IDENTITY(1,1) PRIMARY KEY,SURSA VARCHAR(50) NOT NULL,ISACTIVE SMALLINT NOT NULL DEFAULT 1
)
 */

lib.include('utils');

var zoomed = true,
    dsFL,
    iteFiltru = 1,
    srvFiltru = 1;

function ON_SALDOC_PRJC() {
    var fl = X.SQL('select top 1 findoc CCCFLMR from findoc where sosource=1351 and series=4067 and prjc=' + SALDOC.PRJC, null);
    if (fl) {
        SALDOC.CCCFLMR = fl;
    } else {
        X.WARNING('Nu gasesc fisa limita.');
    }

    var schel = X.SQL('select ISNULL(cccheader, 0) from cccheader where prjc=' + SALDOC.PRJC, null);
    if (schel) {
        SALDOC.CCCHEADER = schel;
    } else {
        X.WARNING('Nu gasesc schema electrica.');
    }
}

function populeazaDinFL() {
    //adu toate liniile din fisa limita aferente acestui combo
    //daca era deja un combo introdus, si urmatorul difera, sterge liniile aferente combo anterior:
    if (ITELINES.RECORDCOUNT || SRVLINES.RECORDCOUNT) {
        if (X.ASK('Schimbare combo', 'Confirmati stergerea liniilor deja introduse?') == 6) {
            ITELINES.FIRST;
            while (!ITELINES.EOF) {
                ITELINES.DELETE;
            }
            SRVLINES.FIRST;
            while (!SRVLINES.EOF) {
                SRVLINES.DELETE;
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
        '(select mine from cccartgen where CCCMTRLGEN = ml.CCCMTRLGEN) MARFAMEA, ' +
        '(select mtracn from mtrl where mtrl=ml.mtrl) CATCON, ' +
        '(select name from mtrl where mtrl = ml.mtrl) ARTICOL, ' +
        '(select  isnull(sum(isnull(x.qty1, 0)), 0) q1 from mtrlines x ' +
        'inner join findoc y on (x.findoc=y.findoc and x.sosource=y.sosource and x.company=y.company) ' +
        'where y.sosource = 1151 and y.series=2101 and y.CCCFLMR = ' + SALDOC.CCCFLMR + ' and x.mtrl=ml.mtrl ' +
        '	AND x.WHOUSESEC=(SELECT CCCWHOUSESEC FROM PRJC WHERE PRJC=' + SALDOC.PRJC + ') AND x.PRJC= ' + SALDOC.PRJC +
        '	AND Y.COMPANY = ' + X.SYS.COMPANY +
        ' and X.CCCTABLOURI=ML.CCCTABLOURI AND X.CCCCIRCUIT=ML.CCCCIRCUIT AND X.CCCCLADIRE=ML.CCCCLADIRE AND X.CCCPRIMARYSPACE=ML.CCCPRIMARYSPACE AND X.CCCSECONDARYSPACE=ML.CCCSECONDARYSPACE AND X.CCCINCAPERE=ML.CCCINCAPERE AND X.CCCSPECIALITATESF=ML.CCCSPECIALITATESF AND X.CCCSF=ML.CCCSF) q1, ' +
        '((SELECT ISNULL(SUM(ISNULL(AA.IMPQTY1-AA.EXPQTY1,0)), 0) AS si3 FROM MTRBALSHEET AA ' +
        'WHERE AA.COMPANY=:X.SYS.COMPANY AND AA.MTRL=ml.MTRL AND AA.FISCPRD=:X.SYS.FISCPRD ' +
        'AND AA.PERIOD<Month(GETDATE()) AND AA.WHOUSE=(SELECT CCCWHOUSESEC FROM PRJC WHERE PRJC=:SALDOC.PRJC)) + ' +
        '(SELECT SUM(ISNULL(AA.QTY1*BB.FLG01,0))-SUM(ISNULL(AA.QTY1*BB.FLG04,0))AS r3 ' +
        'FROM MTRTRN AA ,TPRMS BB WHERE AA.COMPANY =:X.SYS.COMPANY AND AA.MTRL=ml.MTRL AND AA.COMPANY = BB.COMPANY ' +
        'AND AA.WHOUSE=(SELECT CCCWHOUSESEC FROM PRJC WHERE PRJC=:SALDOC.PRJC) AND AA.TPRMS = BB.TPRMS AND ' +
        'AA.SODTYPE = BB.SODTYPE AND BB.SODTYPE = 51 AND AA.FISCPRD=:X.SYS.FISCPRD AND AA.PERIOD=Month(GETDATE()) and prjc=:SALDOC.PRJC ' +
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

    x.FIRST;
    while (!x.EOF) {

        ITELINES.APPEND;
        ITELINES.MTRL = x.MTRL;

        if (x.CCCMTRLGEN && ITELINES.CCCMTRLGEN != x.CCCMTRLGEN)
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
        if (x.CCCTABLOURI && ITELINES.CCCTABLOURI != x.CCCTABLOURI)
            ITELINES.CCCTABLOURI = x.CCCTABLOURI;
        if (x.CCCCIRCUIT && ITELINES.CCCCIRCUIT != x.CCCCIRCUIT)
            ITELINES.CCCCIRCUIT = x.CCCCIRCUIT;
        if (x.q1 && ITELINES.CCCTOTBCV != x.q1)
            ITELINES.CCCTOTBCV = x.q1;
        if (x.q2 && ITELINES.CCCSTOCWH != x.q2)
            ITELINES.CCCSTOCWH = x.q2;
        ITELINES.MTRLINESS = x.MTRLINES;

        try {
            ITELINES.POST;
        } catch (err) {};

        X.PROCESSMESSAGES();
        x.NEXT;
    }

    y.FIRST;
    while (!y.EOF) {

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
            SRVLINES.MTRL = y.MTRL;
        }

        if (y.CCCMTRLGEN && SRVLINES.CCCMTRLGEN != y.CCCMTRLGEN)
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
        if (y.CCCTABLOURI && SRVLINES.CCCTABLOURI != y.CCCTABLOURI)
            SRVLINES.CCCTABLOURI = y.CCCTABLOURI;
        if (y.CCCCIRCUIT && SRVLINES.CCCCIRCUIT != y.CCCCIRCUIT)
            SRVLINES.CCCCIRCUIT = y.CCCCIRCUIT;
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
        } catch (err) {};

        X.PROCESSMESSAGES();
        y.NEXT;
    }

    X.WARNING('Proces incheiat.');
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
    var i = SRVLINES.CCCCIRCUIT ? ' AND CCCCIRCUIT=ISNULL(' + SRVLINES.CCCCIRCUIT + ', 0)' : '';
    if ((SRVLINES.CCCACTIVITATE)) {
        sSQL2 = 'select sum(isnull(cccrealizatzi,0)) cccrealizatzi from findoc where company=' + X.SYS.COMPANY +
            ' and sosource=1011 and fprms=1011 and prjc=' + SALDOC.PRJC +
            ' and CCCSPECIALIZARE=' + SRVLINES.CCCSPECIALIZARE + ' and CCCCOLECTIE=' + SRVLINES.CCCCOLECTIE + ' and CCCCAPITOL=' + SRVLINES.CCCCAPITOL + ' and CCCGRUPALUCRARI=' + SRVLINES.CCCGRUPALUCRARI +
            ' and CCCACTIVITATE=' + SRVLINES.CCCACTIVITATE +
            a + b + c + d + e + f + g + h;
        dsSQL2 = X.GETSQLDATASET(sSQL2, null);

        //iau la intamplare din ccc-uri, ca ma doare sufletul sa mai creez campuri noi:
        if (SRVLINES.CCCQTYINIT != dsSQL2.cccrealizatzi)
            SRVLINES.CCCQTYINIT = dsSQL2.cccrealizatzi;
    }
}

function EXECCOMMAND(cmd) {
    if (cmd == 20181210) {
        if (!zoomed) {
            X.SETPROPERTY('PANEL', 'PANEL12', 'VISIBLE', 'TRUE');
            X.SETPROPERTY('PANEL', 'N_677254920', 'VISIBLE', 'TRUE');
            X.SETPROPERTY('PANEL', 'Panel15', 'VISIBLE', 'TRUE');
            X.SETPROPERTY('PANEL', 'PanelComenzi', 'VISIBLE', 'TRUE');
        } else {
            X.SETPROPERTY('PANEL', 'PANEL12', 'VISIBLE', 'FALSE');
            X.SETPROPERTY('PANEL', 'N_677254920', 'VISIBLE', 'FALSE');
            X.SETPROPERTY('PANEL', 'Panel15', 'VISIBLE', 'FALSE');
            X.SETPROPERTY('PANEL', 'PanelComenzi', 'VISIBLE', 'TRUE');
        }

        zoomed = !zoomed;
    }

    if (cmd == 202104271) {
        populeazaDinFL();
    }

    if (cmd == 20210623) {
        //X.OPENSUBFORM('SFLINIIFL');
        if (ITELINES.RECORDCOUNT == 0 && SRVLINES.RECORDCOUNT == 0) {
            ITELINES.APPEND;
            ITELINES.MTRL = 13499;
            ITELINES.POST;
            X.EXEC('button:Save');
        }

        var fl = X.CREATEOBJFORM('SALDOC[Form=FL electric linii popup');
        try {
            fl.DBLocate(SALDOC.CCCFLMR);
            //fl.dbinsert;
            var f = fl.findtable('findoc');
            f.edit;
            f.NUM01 = SALDOC.FINDOC;
            fl.SHOWOBJFORM;
        } catch (e) {} finally {
            fl.free;
            fl = null;
        }

        X.DBLOCATE(SALDOC.FINDOC);

    }

    if (cmd == 202108071) {
        X.OPENSUBFORM('SFATTACHEXT');
    }

    if (cmd == 20210427) {
        //documente variatii
        if (SALDOC.FINDOC < 0) {
            X.WARNING('Salvati documentul.');
            return;
        }

        var dsUnic = X.GETSQLDATASET('select distinct ccctablouri, ccccircuit from mtrlines where findoc=' + SALDOC.FINDOC +
            ' and isnull(CCCQTYNR, 0) = 0', null);
        if (!dsUnic.RECORDCOUNT) {
            X.WARNING('Nu am ce genera.');
            return;
        } else {
            dsUnic.FIRST;
            while (!dsUnic.EOF) {
                var sursa = dsUnic.ccctablouri,
                    circuit = dsUnic.ccccircuit,
                    filtruIte = '{ITELINES.CCCQTYNR} <> 1 AND ',
                    filtruSrv = '{SRVLINES.CCCQTYNR} <> 1 AND ',
                    postIte = '',
                    postSrv = '',
                    newFindoc = 0;
                if (sursa && circuit) {
                    if (sursa) {
                        filtruIte += '{ITELINES.CCCTABLOURI}=' + sursa;
                        filtruSrv += '{SRVLINES.CCCTABLOURI}=' + sursa;
                    }
                    if (circuit) {
                        if (!sursa) {
                            filtruIte += '{ITELINES.CCCCIRCUIT}=' + circuit;
                            filtruSrv += '{SRVLINES.CCCCIRCUIT}=' + circuit;
                        } else {
                            filtruIte += ' AND {ITELINES.CCCCIRCUIT}=' + circuit;
                            filtruSrv += ' AND {SRVLINES.CCCCIRCUIT}=' + circuit;
                        }
                    }

                    //deviz (nu exista in fl)
                    //daca {sursa;circuit} nu exista in fl, creaza deviz
                    //daca {sursa;circuit} exista in fl, dar nu are deviz, creaza deviz
                    filterDs(ITELINES, '(' + filtruIte + postIte + ')');
                    filterDs(SRVLINES, '(' + filtruSrv + postSrv + ')');
                    if (sursa && circuit) {
                        var lst = circuitsExistsInFl(SALDOC.CCCHEADER, SALDOC.CCCFLMR, [{
                            sursa: sursa,
                            circuit: circuit
                        }], true); //desi ar fi de preferat sa scot lista o singura data (isFirst), prefer sa o cer de fiecare data,
                        //ca sa prind noul (anterior) posibil deviz creat
                        if (lst.length > 0 && !lst[0].exists || (lst.length > 0 && lst[0].exists && !lst[0].deviz)) {
                            //debugger;
                            //createDocVariatii(ITELINES, SRVLINES, 4068, sursa, circuit);
                            newFindoc = creazaDocVariatii(SALDOC, 4068, 'SALDOC[Form=Deviz electric]', SALDOC.PRJC, SALDOC.CCCHEADER, SALDOC.CCCFLMR, sursa, circuit, ITELINES, SRVLINES);
                        }
                    }

                    if (SALDOC.CCCAPROBATPLATA === 0) {
                        //variatii externe: NCS/NR(+/-)
                        //filtreaza dupa pozitive, apoi negative si creaza NCS si NR; ITELINES/SRVLINES
                        if (sursa || circuit) {
                            postIte = ' AND {ITELINES.QTY1}>0';
                            postSrv = ' AND {SRVLINES.QTY1}>0';
                        } else {
                            postIte = '{ITELINES.QTY1}>0';
                            postSrv = '{SRVLINES.QTY1}>0';
                        }

                        filterDs(ITELINES, '(' + filtruIte + postIte + ')');
                        filterDs(SRVLINES, '(' + filtruSrv + postSrv + ')');

                        try {
                            //createDocVariatii(ITELINES, SRVLINES, 4077, sursa, circuit);
                            newFindoc = creazaDocVariatii(SALDOC, 4077, 'SALDOC[Form=AFL electric]', SALDOC.PRJC, SALDOC.CCCHEADER, SALDOC.CCCFLMR, sursa, circuit, ITELINES, SRVLINES);
                        } catch (e) {
                            X.WARNING('Internal err. ' + e.message);
                        } finally {
                            ITELINES.FILTERED = 0;
                            SRVLINES.FILTERED = 0;
                        }


                        //negativ
                        if (sursa || circuit) {
                            postIte = ' AND {ITELINES.QTY1}<0';
                            postSrv = ' AND {SRVLINES.QTY1}<0';
                        } else {
                            postIte = '{ITELINES.QTY1}<0';
                            postSrv = '{SRVLINES.QTY1}<0';
                        }

                        filterDs(ITELINES, '(' + filtruIte + postIte + ')');
                        filterDs(SRVLINES, '(' + filtruSrv + postSrv + ')');

                        try {
                            //createDocVariatii(ITELINES, SRVLINES, 4076, sursa, circuit);
                            newFindoc = creazaDocVariatii(SALDOC, 4076, 'SALDOC[Form=AFL electric]', SALDOC.PRJC, SALDOC.CCCHEADER, SALDOC.CCCFLMR, sursa, circuit, ITELINES, SRVLINES);
                        } catch (e) {
                            X.WARNING('Internal err. ' + e.message);
                        } finally {
                            ITELINES.FILTERED = 0;
                            SRVLINES.FILTERED = 0;
                        }

                    } else if (SALDOC.CCCAPROBATPLATA === 1) {
                        //variatii interne: AFL/AFLM(+/-)
                        if (sursa || circuit) {
                            postIte = ' AND {ITELINES.QTY1}>0';
                            postSrv = ' AND {SRVLINES.QTY1}>0';
                        } else {
                            postIte = '{ITELINES.QTY1}>0';
                            postSrv = '{SRVLINES.QTY1}>0';
                        }

                        filterDs(ITELINES, '(' + filtruIte + postIte + ')');
                        filterDs(SRVLINES, '(' + filtruSrv + postSrv + ')');
                        try {
                            //createDocVariatii(ITELINES, SRVLINES, 4074, sursa, circuit);
                            newFindoc = creazaDocVariatii(SALDOC, 4074, 'SALDOC[Form=AFL electric]', SALDOC.PRJC, SALDOC.CCCHEADER, SALDOC.CCCFLMR, sursa, circuit, ITELINES, SRVLINES);
                        } catch (e) {
                            X.WARNING('Internal err. ' + e.message);
                        } finally {
                            ITELINES.FILTERED = 0;
                            SRVLINES.FILTERED = 0;
                        }

                        //negativ
                        if (sursa || circuit) {
                            postIte = ' AND {ITELINES.QTY1}<0';
                            postSrv = ' AND {SRVLINES.QTY1}<0';
                        } else {
                            postIte = '{ITELINES.QTY1}<0';
                            postSrv = '{SRVLINES.QTY1}<0';
                        }

                        filterDs(ITELINES, '(' + filtruIte + postIte + ')');
                        filterDs(SRVLINES, '(' + filtruSrv + postSrv + ')');

                        try {
                            //createDocVariatii(ITELINES, SRVLINES, 4078, sursa, circuit);
                            newFindoc = creazaDocVariatii(SALDOC, 4078, 'SALDOC[Form=AFL electric]', SALDOC.PRJC, SALDOC.CCCHEADER, SALDOC.CCCFLMR, sursa, circuit, ITELINES, SRVLINES);
                        } catch (e) {
                            X.WARNING('Internal err. ' + e.message);
                        } finally {
                            ITELINES.FILTERED = 0;
                            SRVLINES.FILTERED = 0;
                        }
                    } else {
                        X.WARNING('Completati  campul "Decizie interna".');
                    }
                } else {
                    X.WARNING('Lipsa circuit sau sursa.');
                }
                ITELINES.FILTER = '';
                SRVLINES.FILTER = '';
                ITELINES.FILTERED = 0;
                SRVLINES.FILTERED = 0;
                X.EXEC('button:save');
                X.PROCESSMESSAGES;
                dsUnic.NEXT;
            }
        }
    }

    //actualizare cantitate din FL
    if (cmd == '20220531') {
        actualizeazaCantitateFL(SALDOC.CCCFLMR);
    }

    //actualizare cantitatea din devize
    if (cmd == '20220602') {
        actualizeazaCantitateDevize(SALDOC.PRJC);
    }

    if (cmd == '202206063') {
        actualizeazaCantitateFL_linie(SALDOC.CCCFLMR);
    }

    if (cmd == '202206064') {
        actualizeazaCantitateDevize_linie(SALDOC.PRJC);
    }

    //doar variatii
    if (cmd == '202205311') {
        ITELINES.FILTERED = 0;
        SRVLINES.FILTERED = 0;
        if (iteFiltru) {
            ITELINES.FILTER = '({ITELINES.QTY1}<>0)';
            iteFiltru = 0;
        } else {
            ITELINES.FILTER = '';
            iteFiltru = 1;
        }
        if (srvFiltru) {
            SRVLINES.FILTER = '({SRVLINES.QTY1}<>0)';
            srvFiltru = 0;
        } else {
            SRVLINES.FILTER = '';
            srvFiltru = 1;
        }
        if (ITELINES.FILTER) ITELINES.FILTERED = 1;
        if (SRVLINES.FILTER) SRVLINES.FILTERED = 1;
    }

    if (cmd == '202206302') {
        if (SALDOC.CCCHEADER) {
            var s = X.CREATEOBJFORM('CCCSCHELGEO[Form=schelgeo2]');
            s.DBLOCATE(SALDOC.CCCHEADER);
            s.SHOWOBJFORM();
        } else {
            X.WARNING('Nu gasesc schema electrica.\n(SALDOC.CCCHEADER=null)');
        }
    }
}
//CCCCIRCUIT.DEVIZ = creazaDocVariatii(SALDOC, 4068, 'SALDOC[Form=Deviz electric]', CCCHEADER.PRJC, CCCHEADER.CCCHEADER, CCCTABLOURI.CCCTABLOU, CCCCIRCUIT.CCCCIRCUIT, CCCLINIICIRCUIT);
//pentru fiecare combo unic (sursa, circuit) se va crea un doc aferent
function createDocVariatii(dsIte, dsSrv, docConv, sursa, circuit) {
    dsIte.FIRST;
    dsSrv.FIRST;
    if (dsIte.EOF && dsSrv.EOF)
        return;
    var xlist = '';
    switch (docConv) {
        case 4077:
            xlist = 'NCS electric';
            break;
        case 4076:
            xlist = 'NR electric';
            break;
        case 4074:
            xlist = 'AFL electric';
            break;
        case 4078:
            xlist = 'AFLM electric';
            break;
        default:
            X.WARNING('Internal err. Param "series" empty for func "createDocVariatii".');
            return;
    }

    var doc = X.CREATEOBJFORM('SALDOC[List=' + xlist + ',Form=AFL electric]');
    try {
        doc.DBINSERT;
        var fin = doc.FindTable('FINDOC'),
            ite = doc.FindTable('ITELINES'),
            srv = doc.FindTable('SRVLINES'),
            i = 0,
            j = 0,
            id;
        fin.EDIT;
        //debugger;
        fin.SERIES = docConv;
        fin.CCCSERVICIU = 1; //no popap
        fin.CCCHEADER = SALDOC.CCCHEADER;
        if (SALDOC.PRJC)
            fin.PRJC = SALDOC.PRJC;
        if (SALDOC.CCCRESP)
            fin.CCCRESP = SALDOC.CCCRESP;
        if (SALDOC.CCCPERSCONST)
            fin.CCCPERSCONST = SALDOC.CCCPERSCONST;
        if (SALDOC.CCCMAGAZIONER)
            fin.CCCMAGAZIONER = SALDOC.CCCMAGAZIONER;
        if (SALDOC.COMMENTS)
            fin.COMMENTS = SALDOC.COMMENTS;
        if (sursa)
            fin.CCCTABLOURI = sursa;
        if (circuit)
            fin.INT01 = circuit;
        dsIte.FIRST;
        while (!dsIte.EOF) {
            i++;
            ite.Append;
            common(dsIte, ite);
            ite.Post;
            dsIte.NEXT;
        }

        dsSrv.FIRST;
        while (!dsSrv.EOF) {
            j++;
            srv.Append;
            common(dsSrv, srv);
            if (dsSrv.CCCSPECIALIZARE)
                srv.CCCSPECIALIZARE = dsSrv.CCCSPECIALIZARE;
            else {
                X.WARNING('Nu exista specializare pe ' + dsSrv.CCCACTIVITATE);
                RETURN;
            }
            if (dsSrv.CCCCOLECTIE)
                srv.CCCCOLECTIE = dsSrv.CCCCOLECTIE;
            if (dsSrv.CCCCAPITOL)
                srv.CCCCAPITOL = dsSrv.CCCCAPITOL;
            if (dsSrv.CCCGRUPALUCRARI)
                srv.CCCGRUPALUCRARI = dsSrv.CCCGRUPALUCRARI;
            if (dsSrv.CCCACTIVITATE)
                srv.CCCACTIVITATE = dsSrv.CCCACTIVITATE;
            srv.Post;
            dsSrv.NEXT;
        }
        if (i || j) {
            id = doc.SHOWOBJFORM();
            if (!id) {
                X.WARNING('Ati optat sa nu salvati documentul propus.');
                if (i) {
                    dsIte.FIRST;
                    while (!dsIte.EOF) {
                        dsIte.CCCQTYNR = 0;
                        dsIte.NEXT;
                    }
                }
                if (j) {
                    dsSrv.FIRST;
                    while (!dsSrv.EOF) {
                        dsSrv.CCCQTYNR = 0;
                        dsSrv.NEXT;
                    }
                }
            } else {
                var doc = X.SQL('select fincode from findoc where findoc=' + id, null);
                if (i) {
                    dsIte.FIRST;
                    while (!dsIte.EOF) {
                        dsIte.CCCQTYNR = 1;
                        if (doc)
                            dsIte.CCCBULLSHIT1 = doc;
                        dsIte.CCCINT01 += id;
                        dsIte.NEXT;
                    }
                }
                if (j) {
                    dsSrv.FIRST;
                    while (!dsSrv.EOF) {
                        dsSrv.CCCQTYNR = 1;
                        if (doc)
                            dsSrv.CCCBULLSHIT1 = doc;
                        dsSrv.CCCINT01 += id;
                        dsSrv.NEXT;
                    }
                }
            }
        }
    } catch (err) {
        if (err.message.indexOf('Selector record not found') > -1) {
            X.EXCEPTION('Verificati daca activitatea (specializare, colectie, etc) este adaugata in proiect.\n' + err.message);
        } else {
            X.EXCEPTION(err.message);
        }
    } finally {
        ITELINES.FILTERED = 0;
        SRVLINES.FILTERED = 0;
        X.EXEC('Button:Save');
        doc.FREE;
        doc = null;
    }
}

function common(src, dest) {
    if (src.CCCMTRLGEN)
        dest.CCCMTRLGEN = src.CCCMTRLGEN;
    if (src.MTRL)
        dest.MTRL = src.MTRL;
    if (src.QTY1)
        dest.QTY1 = src.QTY1;
    if (src.CCCCLADIRE)
        dest.CCCCLADIRE = src.CCCCLADIRE;
    if (src.CCCPRIMARYSPACE)
        dest.CCCPRIMARYSPACE = src.CCCPRIMARYSPACE;
    if (src.CCCSECONDARYSPACE)
        dest.CCCSECONDARYSPACE = src.CCCSECONDARYSPACE;
    if (src.CCCINCAPERE)
        dest.CCCINCAPERE = src.CCCINCAPERE;
    if (src.CCCSPECIALITATESF)
        dest.CCCSPECIALITATESF = src.CCCSPECIALITATESF;
    if (src.CCCSF)
        dest.CCCSF = src.CCCSF;
    if (src.CCCCOLECTIESF)
        dest.CCCCOLECTIESF = src.CCCCOLECTIESF;
    if (src.CCCTABLOURI)
        dest.CCCTABLOURI = src.CCCTABLOURI;
    if (src.CCCCIRCUIT)
        dest.CCCCIRCUIT = src.CCCCIRCUIT;
    if (src.MTRLINES)
        dest.MTRLINESS = src.MTRLINES;
    if (src.FINDOC)
        dest.FINDOCS = src.FINDOC;
    dest.CCCQTYNR = 1;
}

//NCS=1, NR=2, AFL=3, AFLM=4
function filterDs(ds, filtru) {
    ds.FILTER = '';
    ds.FILTERED = 0;
    ds.FILTER = filtru;
    ds.FILTERED = 1;
}

var activCnt = 0;
//nu stiu de ce dar se activate de doua ori, bad shit, yo (tribute to Breaking bad series)
function ON_SFLINIIFL_ACTIVATE() {
    CCCFLVT.FILTERED = 0;
    if (!activCnt)
        activCnt += fillFL();
    //X.SETPROPERTY('MERGECHANGELOG', 'True');
}

function ON_SFLINIIFL_ACCEPT() {
    var ds,
        msg = '';
    CCCFLVT.FIRST;
    while (!CCCFLVT.EOF) {
        if (CCCFLVT.TIP == 'Material') {
            ds = ITELINES;
        } else if (CCCFLVT.TIP == 'Activitate') {
            ds = SRVLINES;
        } else {
            ds = null;
        }

        if (ds) {
            try {
                ds.APPEND;
                if (CCCFLVT.MTRL)
                    ds.MTRL = CCCFLVT.MTRL;
                if (CCCFLVT.CCCTABLOURI)
                    ds.CCCTABLOURI = CCCFLVT.CCCTABLOURI;
                if (CCCFLVT.CCCCIRCUIT)
                    ds.CCCCIRCUIT = CCCFLVT.CCCCIRCUIT;
                if (CCCFLVT.CCCMTRLGEN)
                    ds.CCCMTRLGEN = CCCFLVT.CCCMTRLGEN;
                if (CCCFLVT.QTY1)
                    ds.CCCQTYFL = CCCFLVT.QTY1;
                if (CCCFLVT.CCCSPECIALIZARE)
                    ds.CCCSPECIALIZARE = CCCFLVT.CCCSPECIALIZARE;
                if (CCCFLVT.CCCCOLECTIE)
                    ds.CCCCOLECTIE = CCCFLVT.CCCCOLECTIE;
                if (CCCFLVT.CCCCAPITOL)
                    ds.CCCCAPITOL = CCCFLVT.CCCCAPITOL;
                if (CCCFLVT.CCCGRUPALUCRARI)
                    ds.CCCGRUPALUCRARI = CCCFLVT.CCCGRUPALUCRARI;
                if (CCCFLVT.CCCACTIVITATE)
                    ds.CCCACTIVITATE = CCCFLVT.CCCACTIVITATE;
                if (CCCFLVT.CCCCLADIRE)
                    ds.CCCCLADIRE = CCCFLVT.CCCCLADIRE;
                if (CCCFLVT.CCCPRIMARYSPACE)
                    ds.CCCPRIMARYSPACE = CCCFLVT.CCCPRIMARYSPACE;
                if (CCCFLVT.CCCSECONDARYSPACE)
                    ds.CCCSECONDARYSPACE = CCCFLVT.CCCSECONDARYSPACE;
                if (CCCFLVT.CCCINCAPERE)
                    ds.CCCINCAPERE = CCCFLVT.CCCINCAPERE;
                if (CCCFLVT.CCCSPECIALITATESF)
                    ds.CCCSPECIALITATESF = CCCFLVT.CCCSPECIALITATESF;
                if (CCCFLVT.CCCSF)
                    ds.CCCSF = CCCFLVT.CCCSF;
                if (CCCFLVT.CCCCOLECTIESF)
                    ds.CCCCOLECTIESF = CCCFLVT.CCCCOLECTIESF;
                ds.POST;
                //X.PROCESSMESSAGES();
            } catch (err) {
                if (err.message.indexOf('Selector record not found (CCCACTIVITATE') > -1) {
                    X.EXCEPTION('Activitati lipsa din proiect.');
                } else {
                    msg += err.message;
                }
            }
        }
        CCCFLVT.NEXT;
    }

    if (msg.length) {
        X.WARNING(msg);
    }
}

function ON_SFLINIIFL_CANCEL() {
    CCCFLVT.FILTERED = 0;
}

function fillFL() {
    var ds = X.GETSQLDATASET("select TOP 1000000 case sodtype when 51 then 'Material' when 52 then 'Activitate' else 'Altele' end as TIP, " +
            //var ds = X.GETSQLDATASET("select TOP 50 case sodtype when 51 then 'Material' when 52 then 'Activitate' else 'Altele' end as TIP, " +
            "MTRL, CCCTABLOURI, CCCCIRCUIT, CCCMTRLGEN, QTY1, CCCSPECIALIZARE, CCCCOLECTIE, CCCCAPITOL, CCCGRUPALUCRARI, CCCACTIVITATE, " +
            "CCCCLADIRE, CCCPRIMARYSPACE, CCCSECONDARYSPACE, CCCINCAPERE, CCCSPECIALITATESF, CCCSF, CCCCOLECTIESF " +
            "from mtrlines where findoc=" + SALDOC.CCCFLMR + " order by CCCTABLOURI, CCCCIRCUIT, CCCMTRLGEN", null),
        msg = '';

    if (CCCFLVT.RECORDCOUNT) {
        CCCFLVT.FIRST;
        while (!CCCFLVT.EOF) {
            CCCFLVT.DELETE;
        }
    }

    if (ds.RECORDCOUNT) {
        X.SETPROPERTY('PANEL', 'N_454163896', 'CAPTION', 'Total de incarcat: ' + ds.RECORDCOUNT);
        try {
            ds.FIRST;
            var i = 0;
            while (!ds.EOF) {
                i++;
                X.PROCESSMESSAGES();
                CCCFLVT.APPEND;
                if (ds.TIP)
                    CCCFLVT.TIP = ds.TIP;
                if (ds.MTRL)
                    CCCFLVT.MTRL = ds.MTRL;
                if (ds.CCCTABLOURI)
                    CCCFLVT.CCCTABLOURI = ds.CCCTABLOURI;
                if (ds.CCCCIRCUIT)
                    CCCFLVT.CCCCIRCUIT = ds.CCCCIRCUIT;
                if (ds.CCCMTRLGEN)
                    CCCFLVT.CCCMTRLGEN = ds.CCCMTRLGEN;
                if (ds.QTY1)
                    CCCFLVT.QTY1 = ds.QTY1;
                if (ds.CCCSPECIALIZARE)
                    CCCFLVT.CCCSPECIALIZARE = ds.CCCSPECIALIZARE;
                if (ds.CCCCOLECTIE)
                    CCCFLVT.CCCCOLECTIE = ds.CCCCOLECTIE;
                if (ds.CCCCAPITOL)
                    CCCFLVT.CCCCAPITOL = ds.CCCCAPITOL;
                if (ds.CCCGRUPALUCRARI)
                    CCCFLVT.CCCGRUPALUCRARI = ds.CCCGRUPALUCRARI;
                if (ds.CCCACTIVITATE)
                    CCCFLVT.CCCACTIVITATE = ds.CCCACTIVITATE;
                if (ds.CCCCLADIRE)
                    CCCFLVT.CCCCLADIRE = ds.CCCCLADIRE;
                if (ds.CCCPRIMARYSPACE)
                    CCCFLVT.CCCPRIMARYSPACE = ds.CCCPRIMARYSPACE;
                if (ds.CCCSECONDARYSPACE)
                    CCCFLVT.CCCSECONDARYSPACE = ds.CCCSECONDARYSPACE;
                if (ds.CCCINCAPERE)
                    CCCFLVT.CCCINCAPERE = ds.CCCINCAPERE;
                if (ds.CCCSPECIALITATESF)
                    CCCFLVT.CCCSPECIALITATESF = ds.CCCSPECIALITATESF;
                if (ds.CCCSF)
                    CCCFLVT.CCCSF = ds.CCCSF;
                if (ds.CCCCOLECTIESF)
                    CCCFLVT.CCCCOLECTIESF = ds.CCCCOLECTIESF;
                CCCFLVT.POST;
                X.PROCESSMESSAGES();
                ds.NEXT;
            }
        } catch (err) {
            msg += err.message + '\n';
        } finally {
            //CCCFLVT.ENABLECONTROLS;
            if (msg.length > 0)
                X.WARNING(msg);
        }
    }

    return 1;
}

//reutilizare camp CCCAPROBATPLATA si CCCAPROBATPLATA in loc sa mai creez unele
function ON_SALDOC_CCCAPROBATPLATA() {
    if (SALDOC.CCCAPROBATPLATA == 1) {
        X.SETPROPERTY('FIELD', 'SALDOC.CCCNUSEAPLICA1', 'READONLY', 1);
        X.SETPROPERTY('FIELD', 'SALDOC.CCCNUSEAPLICA5', 'READONLY', 1);
        X.SETPROPERTY('FIELD', 'SALDOC.CCCNRCOM', 'READONLY', 1);
        X.SETPROPERTY('FIELD', 'SALDOC.CCCPAYDATE', 'READONLY', 1);
    } else if (SALDOC.CCCAPROBATPLATA == 0) {
        X.SETPROPERTY('FIELD', 'SALDOC.CCCNUSEAPLICA1', 'READONLY', 0);
        X.SETPROPERTY('FIELD', 'SALDOC.CCCNUSEAPLICA5', 'READONLY', 0);
        X.SETPROPERTY('FIELD', 'SALDOC.CCCNRCOM', 'READONLY', 0);
        X.SETPROPERTY('FIELD', 'SALDOC.CCCPAYDATE', 'READONLY', 0);
    }
}

function ON_POST() {
    if (SALDOC.CCCAPROBATPLATA == 0 && !SALDOC.CCCNUSEAPLICA1)
        X.EXCEPTION("Fiind decizie externa trebuie sa alegeti 'Motiv variatii'");

    //debugger;
    if (arguments.callee.caller) {
        actualizeazaCantitateFL(SALDOC.CCCFLMR);
        actualizeazaCantitateDevize(SALDOC.PRJC);
    }
}

function ON_LOCATE() {
    if (ITELINES.LOCATE('MTRL', 13499) == 1) {
        ITELINES.DELETE;
    }
    //X.EXEC('button:Save');

    ITELINES.FILTERED = 0;
    SRVLINES.FILTERED = 0;
}

function ON_AFTERPOST() {
    //RO on decizie fields
    //SALDOC.CCCAPROBATPLATA
    X.SETPROPERTY('FIELD', 'SALDOC.CCCAPROBATPLATA', 'READONLY', 1);
    X.SETPROPERTY('FIELD', 'SALDOC.CCCNUSEAPLICA5', 'READONLY', 1);
    X.SETPROPERTY('FIELD', 'SALDOC.CCCNRCOM', 'READONLY', 1);
    X.SETPROPERTY('FIELD', 'SALDOC.CCCPAYDATE', 'READONLY', 1);
    X.SETPROPERTY('FIELD', 'SALDOC.CCCNUSEAPLICA1', 'READONLY', 1);
}

function ON_ITELINES_QTY1() {
    if (ITELINES.QTY1) {
        if (parseFloat(ITELINES.CCCQTYFL) + parseFloat(ITELINES.QTY1) < 0) {
            X.WARNING("Nu puteti depasi cantitatea din FL.");
            ITELINES.QTY1 = 0;
        }
    }
}

function ON_SRVLINES_QTY1() {
    if (SRVLINES.QTY1) {
        if (parseFloat(SRVLINES.CCCQTYFL) + parseFloat(SRVLINES.QTY1) < 0) {
            X.WARNING("Nu puteti depasi cantitatea din FL.");
            SRVLINES.QTY1 = 0;
        }
    }
}

function ON_ITELINES_BEFOREDELETE() {
    if (ITELINES.CCCQTYNR)
        X.EXCEPTION('Nu se poate sterge linia\nA fost generat documentul de variatie.');
}

function ON_SRVLINES_BEFOREDELETE() {
    if (SRVLINES.CCCQTYNR)
        X.EXCEPTION('Nu se poate sterge linia\nA fost generat documentul de variatie.');
}

function ON_SRVLINES_NEW() {
    SRVLINES.MTRL = 13498;
}

function ON_ITELINES_CCCMTRLGEN() {
    setDetails(ITELINES);
}

function ON_SRVLINES_CCCMTRLGEN() {
    setDetails(SRVLINES);
}

function setDetails(ds) {
    if (ds.CCCMTRLGEN && SALDOC.CCCHEADER && ds.CCCTABLOURI && ds.CCCCIRCUIT) {
        var dsDetails = getDetailsForGeneric(SALDOC.CCCHEADER, ds.CCCTABLOURI, ds.CCCCIRCUIT, ds.CCCMTRLGEN);
        if (dsDetails.RECORDCOUNT) {
            dsDetails.FIRST;
            while (!dsDetails.EOF) {
                ds.CCCCLADIRE = dsDetails.CCCCLADIRE;
                ds.CCCPRIMARYSPACE = dsDetails.CCCPRIMARYSPACE;
                ds.CCCSECONDARYSPACE = dsDetails.CCCSECONDARYSPACE;
                ds.CCCINCAPERE = dsDetails.CCCINCAPERE;
                ds.CCCSPECIALITATESF = dsDetails.CCCSPECIALITATESF;
                ds.CCCSF = dsDetails.CCCSF;
                ds.CCCCOLECTIESF = dsDetails.CCCCOLECTIESF;
                dsDetails.NEXT;
            }
        }
    }
}