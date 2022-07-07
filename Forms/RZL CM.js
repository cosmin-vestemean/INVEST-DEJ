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
    CCCVTCOMBOS.FILTERED = 0;
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
        X.WARNING('Selectati un combo aferent proiectului!');
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
    }

    if (cmd == 20190412) {
        //Populeaza lista devize, show combos
        if (SALDOC.PRJC && SALDOC.CCCFLMR) {
            var ds = X.GETSQLDATASET('select * from ccccombos where findoc=' + SALDOC.CCCFLMR + ' and prjc=' + SALDOC.PRJC, null);
            if (ds.RECORDCOUNT) {
                CCCVTCOMBOS.DISABLECONTROLS;
                CCCVTCOMBOS.FIRST;
                while (CCCVTCOMBOS.RECORDCOUNT) {
                    CCCVTCOMBOS.DELETE;
                }
                CCCVTCOMBOS.FIRST;
                if (1 == 1) {
                    ds.FIRST;
                    while (!ds.EOF) {
                        CCCVTCOMBOS.APPEND;
                        if (ds.TRNDATE) {
                            CCCVTCOMBOS.TRNDATE = ds.TRNDATE;
                        }
                        if (ds.FINCODE) {
                            CCCVTCOMBOS.FINCODE = ds.FINCODE;
                        }
                        if (ds.PRJCSTAGE) {
                            CCCVTCOMBOS.PRJCSTAGE = ds.PRJCSTAGE;
                        }
                        if (ds.CCCDEVIZECM) {
                            CCCVTCOMBOS.CCCDEVIZECM = ds.CCCDEVIZECM;
                        }
                        if (ds.CCCSPECIALITATESF) {
                            CCCVTCOMBOS.CCCSPECIALITATE = ds.CCCSPECIALITATESF;
                        }
                        if (ds.CCCSF) {
                            CCCVTCOMBOS.CCCSF = ds.CCCSF;
                        }
                        if (ds.CCCCOLECTIESF) {
                            CCCVTCOMBOS.CCCCOLECTIESF = ds.CCCCOLECTIESF;
                        }
                        if (ds.CCCTABLOU) {
                            CCCVTCOMBOS.CCCTABLOU = ds.CCCTABLOU;
                        }
                        CCCVTCOMBOS.POST;
                        ds.NEXT;
                    }
                }
                CCCVTCOMBOS.ENABLECONTROLS;
            }
        }
        X.OPENSUBFORM('sfCombos');
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
        //genereaza pontajele per activitate
        //campurile obligatorii care nu au legatura cu propagarea informatiei
        //care face subiectul acestui proiect vor fi completate manual, apoi se salveaza pontajul
        //debugger;
        var tot = hProgramTot();
        calculOreActivitati();
        X.EXEC('button:Save');
        var tot = hProgramTot();
        var strMsg = '';
        SRVLINES.FIRST;
        while (!SRVLINES.EOF) {
            if (SRVLINES.QTY > 0) {
                var pontaj = X.CREATEOBJFORM('CUSTFINDOC.1011[LIST=Pontaj pe operatie pe lucrare,FORM=PONTAJ/STADII FIZICE-SUBANTREPRENOR]');
                try {
                    var q2 = 'SELECT 1 FROM CUSTLINES AA ' +
                        'INNER JOIN FINDOC BB ON (AA.FINDOC=BB.FINDOC AND AA.SOSOURCE=BB.SOSOURCE AND AA.COMPANY=BB.COMPANY) ' +
                        'WHERE AA.COMPANY = ' + X.SYS.COMPANY + ' AND AA.SOSOURCE = 1011 AND BB.ISCANCEL = 0 ' +
                        'AND BB.CCCACTIVITATE = ' + SRVLINES.CCCACTIVITATE + ' AND AA.CINT05 = ' + SALDOC.FINDOC;
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
                        if (SALDOC.PRJCSTAGE)
                            tblHeader.PRJCSTAGE = SALDOC.PRJCSTAGE;
                        if (SALDOC.CCCDEVIZECM)
                            tblHeader.CCCDEVIZECM = SALDOC.CCCDEVIZECM;
                        if (SALDOC.CCCSPECIALITATESF)
                            tblHeader.CCCSPECIALITATESF = SALDOC.CCCSPECIALITATESF;
                        if (SALDOC.CCCSF)
                            tblHeader.CCCSF = SALDOC.CCCSF;
                        if (SALDOC.CCCCOLECTIESF)
                            tblHeader.CCCCOLECTIESF = SALDOC.CCCCOLECTIESF;
                        if (SALDOC.CCCTABLOU)
                            tblHeader.CCCTABLOU = SALDOC.CCCTABLOU;
                        if (SRVLINES.CCCCOLECTIE)
                            tblHeader.CCCCOLECTIE = SRVLINES.CCCCOLECTIE;
                        if (SRVLINES.CCCCAPITOL)
                            tblHeader.CCCCAPITOL = SRVLINES.CCCCAPITOL;
                        if (SRVLINES.CCCGRUPALUCRARI)
                            tblHeader.CCCGRUPALUCRARI = SRVLINES.CCCGRUPALUCRARI;
                        if (SRVLINES.CCCACTIVITATE)
                            tblHeader.CCCACTIVITATE = SRVLINES.CCCACTIVITATE;
                        if (SALDOC.CCCSUBANTREPRENOR)
                            tblHeader.CCCSUBANTREPRENOR = SALDOC.CCCSUBANTREPRENOR;
                        tblHeader.CCCCOSTACTIVITATE1 = X.GETSQLDATASET('SELECT  ISNULL(NORMATIMP, 0) NORMATIMP FROM CCCACTIVITATEPRJC ' +
                                'WHERE CCCACTIVITATE=:SRVLINES.CCCACTIVITATE AND PRJC=:SALDOC.PRJC', null).NORMATIMP +
                            X.GETSQLDATASET('SELECT ISNULL(TARIFORAR, 0) TARIFORAR FROM CCCSUBANTRPRJC ' +
                                'WHERE SUBANTREPRENOR=:SALDOC.CCCSUBANTREPRENOR AND PRJC=:SALDOC.PRJC', null).TARIFORAR;
                        tblHeader.CCCREALIZATZI = SRVLINES.QTY1;

                        //debugger;
                        tblLinii = pontaj.FindTable('CUSTLINES');
                        CCCANGAJATISUBATREPRENOR.FIRST;
                        while (!CCCANGAJATISUBATREPRENOR.EOF) {
                            tblLinii.Append;
                            tblLinii.CDAT02 = SALDOC.TRNDATE;
                            tblLinii.CINT01 = CCCANGAJATISUBATREPRENOR.PRSN;
                            var M11 = dateDiffH(X.FORMATDATE('hh:MM', CCCANGAJATISUBATREPRENOR.DELA), X.FORMATDATE('hh:MM', CCCANGAJATISUBATREPRENOR.PANALA));
                            var L6 = SRVLINES.QTY;
                            //l6*m11/tot
                            tblLinii.CNUM01 = L6 * M11 / tot;
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

            SRVLINES.NEXT;
        }

        if (strMsg) {
            X.WARNING('Linia/liniile ' + strMsg.substring(0, strMsg.length - 2) + ' s-au pontat anterior.');
        }
    }

    if (cmd == 20190516) {
        //genereaza bon consum
        //debugger;
        if (X.FILTERSUM('ITELINES.BOOL01', '1=1') == ITELINES.RECORDCOUNT) {
            X.WARNING('Toate bonurile au fost generate.');
            return;
        }
        var bc = X.CREATEOBJFORM('ITEDOC[Form=Bon consum santiere]');
        try {
            bc.DBINSERT;

            var tHeader = bc.FindTable('FINDOC');
            tHeader.Edit;
            tHeader.SERIES = 2099;
            if (SALDOC.CCCDEP)
                tHeader.CCCDEP = SALDOC.CCCDEP;
            if (SALDOC.CCCRESPON)
                tHeader.CCCRESPON = SALDOC.CCCRESPON;
            if (SALDOC.CCCRESP)
                tHeader.CCCRESP = SALDOC.CCCRESP;
            if (SALDOC.CCCPERSCONST)
                tHeader.CCCPERSCONST = SALDOC.CCCPERSCONST;
            if (SALDOC.CCCMAGAZIONER)
                tHeader.CCCMAGAZIONER = SALDOC.CCCMAGAZIONER;
            if (SALDOC.PRJC)
                tHeader.PRJC = SALDOC.PRJC;
            if (SALDOC.CCCFLMR)
                tHeader.CCCFLMR = SALDOC.CCCFLMR;
            if (SALDOC.PRJCSTAGE)
                tHeader.PRJCSTAGE = SALDOC.PRJCSTAGE;
            if (SALDOC.CCCDEVIZECM)
                tHeader.CCCDEVIZECM = SALDOC.CCCDEVIZECM;
            if (SALDOC.CCCSPECIALITATESF)
                tHeader.CCCSPECIALITATESF = SALDOC.CCCSPECIALITATESF;
            if (SALDOC.CCCSF)
                tHeader.CCCSF = SALDOC.CCCSF;
            if (SALDOC.CCCCOLECTIESF)
                tHeader.CCCCOLECTIESF = SALDOC.CCCCOLECTIESF;
            if (SALDOC.CCCTABLOU)
                tHeader.CCCTABLOU = SALDOC.CCCTABLOU;
            if (SALDOC.CCCSUBANTREPRENOR)
                tHeader.CCCSUBANTREPRENOR = SALDOC.CCCSUBANTREPRENOR;
            var tMtrdoc = bc.FindTable('MTRDOC');

            tLinii = bc.FindTable('ITELINES');
            var strWa = 'Aceste articole nu se pot consuma:\n',
                mtrlin = [];
            //var arrRamase = [];
            ITELINES.FIRST;
            while (!ITELINES.EOF) {
                if (ITELINES.QTY1 > 0) {
                    //daca nu a mai fost convertit
                    if (!ITELINES.BOOL01) {
                        if (ITELINES.QTY1 > 0) {
                            //debugger;
                            if (ITELINES.QTY1 + ITELINES.CCCTOTBCV <= ITELINES.CCCQTYFL) {
                                tLinii.Append;
                                tLinii.MTRL = ITELINES.MTRL;
                                tLinii.MTRUNIT = ITELINES.MTRUNIT;
                                tLinii.CCCQTYFL = ITELINES.CCCQTYFL;
                                tLinii.CCCTOTBCV = ITELINES.CCCTOTBCV;
                                tLinii.CCCQTY1SRV = ITELINES.CCCQTY1SRV;
                                tLinii.QTY1 = ITELINES.QTY1;
                                tLinii.FINDOCS = SALDOC.FINDOC;
                                if (SALDOC.PRJCSTAGE)
                                    tLinii.PRJCSTAGE = SALDOC.PRJCSTAGE;
                                if (SALDOC.CCCDEVIZECM)
                                    tLinii.CCCDEVIZ = SALDOC.CCCDEVIZECM;
                                if (SALDOC.CCCSPECIALITATESF)
                                    tLinii.CCCSPECIALITATESF = SALDOC.CCCSPECIALITATESF;
                                if (SALDOC.CCCSF)
                                    tLinii.CCCSF = SALDOC.CCCSF;
                                if (SALDOC.CCCCOLECTIESF)
                                    tLinii.CCCCOLECTIESF = SALDOC.CCCCOLECTIESF;
                                if (SALDOC.CCCTABLOU)
                                    tLinii.CCCTABLOU = SALDOC.CCCTABLOU;
                                if (SALDOC.CCCSPECIALITATESF)
                                    tLinii.CCCBULLSHIT1 = SALDOC.CCCSPECIALITATESF_CCCSPECIALITATESF_NAME;
                                if (SALDOC.CCCSF)
                                    tLinii.CCCBULLSHIT2 = SALDOC.CCCSF_CCCSF_NAME;
                                if (SALDOC.CCCCOLECTIESF)
                                    tLinii.CCCBULLSHIT3 = SALDOC.CCCCOLECTIESF_CCCCOLECTIESF_NAME;
                                if (SALDOC.CCCTABLOU)
                                    tLinii.CCCBULLSHIT4 = SALDOC.CCCTABLOU_CCCTABLOU_NAME;
                                ITELINES.BOOL01 = 1;
                                mtrlin.push(ITELINES.MTRLINES);
                                tLinii.Post;
                            } else {
                                strWa += ITELINES.MTRL_ITEM_NAME + '\n';
                                /*
                                var xx = {};
                                xx.MTRL = ITELINES.MTRL;
                                xx.QTY1 = ITELINES.QTY1 + ITELINES.CCCTOTBCV - ITELINES.CCCQTYFL;
                                arrRamase.push(xx);
                                 */
                            }
                        }
                    }
                }
                ITELINES.NEXT;
            }

            if (strWa != 'Aceste articole nu se pot consuma:\n') {
                X.WARNING(strWa + 'Actualizati fisa limita, bon incomplet.');
                /*
                var afl = X.CreateObjForm('SALDOC[LIST=AFL CM,FORM=AFL CM]');
                try {
                afl.DBINSERT;
                var h = afl.FindTable('FINDOC');
                h.Edit;
                h.SERIES = 	4064;
                h.FINSTATES = 113;
                h.PRJC = SALDOC.PRJC;
                if (SALDOC.PRJCSTAGE) h.PRJCSTAGE = SALDOC.PRJCSTAGE;
                if (SALDOC.CCCDEVIZECM) h.CCCDEVIZECM = SALDOC.CCCDEVIZECM;
                if (SALDOC.CCCSPECIALITATE) h.CCCSPECIALITATE = SALDOC.CCCSPECIALITATE;
                if (SALDOC.CCCSF) h.CCCSF = SALDOC.CCCSF;
                if (SALDOC.CCCCOLECTIESF) h.CCCCOLECTIESF = SALDOC.CCCCOLECTIESF;
                if (SALDOC.CCCTABLOU) h.CCCTABLOU = SALDOC.CCCTABLOU;
                if (SALDOC.CCCRESP) h.CCCRESP = SALDOC.CCCRESP;
                if (SALDOC.CCCPERSCONST) h.CCCPERSCONST = SALDOC.CCCPERSCONST;
                if (SALDOC.CCCMAGAZIONER) h.CCCMAGAZIONER = SALDOC.CCCMAGAZIONER;
                h.POST;
                var l = afl.FindTable('ITELINES');
                for (var i =0;i<arrRamase.length;i++) {
                l.Append;
                l.MTRL = arrRamase[i].MTRL;
                l.QTY1 = arrRamase[i].QTY1;
                l.POST;
                }

                var idAfl = afl.SHOWOBJFORM();

                }
                catch (e) {
                X.WARNING(e.message);
                }
                finally {
                afl.FREE;
                afl = null;
                }
                 */
            }

            if (tLinii.RECORDCOUNT) {
                var id = bc.SHOWOBJFORM();
            }

            if (!id) {
                ITELINES.FIRST;
                while (!ITELINES.EOF) {
                    for (var x = 0; x < mtrlin.length; x++) {
                        if (mtrlin[x] == ITELINES.MTRLINES) {
                            ITELINES.BOOL01 = null;
                            break;
                        }
                    }
                    ITELINES.NEXT;
                }
            }

        } catch (err) {
            X.WARNING(err.message);
        } finally {
            bc.Free;
            bc = null;
        }
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
            if (SALDOC.PRJCSTAGE)
                tHeader.PRJCSTAGE = SALDOC.PRJCSTAGE;
            if (SALDOC.CCCDEVIZECM)
                tHeader.CCCDEVIZECM = SALDOC.CCCDEVIZECM;
            if (SALDOC.CCCSPECIALITATESF)
                tHeader.CCCSPECIALITATESF = SALDOC.CCCSPECIALITATESF;
            if (SALDOC.CCCSF)
                tHeader.CCCSF = SALDOC.CCCSF;
            if (SALDOC.CCCCOLECTIESF)
                tHeader.CCCCOLECTIESF = SALDOC.CCCCOLECTIESF;
            if (SALDOC.CCCTABLOU)
                tHeader.CCCTABLOU = SALDOC.CCCTABLOU;
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

function dateDiffH(start, stop) {
    var s1 = '2020-02-22T' + start.toString();
    var s2 = '2020-02-22T' + stop.toString();
    var dsta = new Date(s1);
    var dsto = new Date(s2);
    var dif = Math.abs(dsto - dsta);
    var ret = (stop.substring(0, 2)) > 12 ? (((dif / 1000) / 60) / 60) - SALDOC.CCCPAUZAMASA : (((dif / 1000) / 60) / 60);
    return ret;
}

function ON_sfCombos_SHOW() {}

function ON_sfCombos_ACCEPT() {
    if (CCCVTCOMBOS.PRJCSTAGE) {
        SALDOC.PRJCSTAGE = CCCVTCOMBOS.PRJCSTAGE;
    }
    if (CCCVTCOMBOS.CCCDEVIZECM) {
        SALDOC.CCCDEVIZECM = CCCVTCOMBOS.CCCDEVIZECM;
    }
    if (CCCVTCOMBOS.CCCSPECIALITATE) {
        SALDOC.CCCSPECIALITATESF = CCCVTCOMBOS.CCCSPECIALITATE;
    }
    if (CCCVTCOMBOS.CCCSF) {
        SALDOC.CCCSF = CCCVTCOMBOS.CCCSF;
    }
    if (CCCVTCOMBOS.CCCCOLECTIESF) {
        SALDOC.CCCCOLECTIESF = CCCVTCOMBOS.CCCCOLECTIESF;
    }
    if (CCCVTCOMBOS.CCCTABLOU) {
        SALDOC.CCCTABLOU = CCCVTCOMBOS.CCCTABLOU;
    }

    populeazaDinFL();
}

function populeazaDinFL() {
    //adu toate liniile din fisa limita aferente acestui combo
    //debugger;

    var x = X.GETSQLDATASET('select  MTRL, QTY1, PRJCSTAGE, CCCDEVIZ, CCCSPECIALITATESF, CCCSF, ' +
        'CCCCOLECTIESF, CCCTABLOU , ' +
        '(select  isnull(sum(isnull(x.qty1, 0)), 0) q1 from mtrlines x ' +
        'inner join findoc y on (x.findoc=y.findoc and x.sosource=y.sosource and x.company=y.company) ' +
        'where y.sosource = 1151 and y.series=2101 and y.CCCFLMR = ' + SALDOC.CCCFLMR + ' and x.mtrl=ml.mtrl ' +
        '	AND x.WHOUSESEC=(SELECT CCCWHOUSESEC FROM PRJC WHERE PRJC=' + SALDOC.PRJC + ') AND x.PRJC= ' + SALDOC.PRJC +
        '	AND Y.COMPANY = ' + X.SYS.COMPANY +
        createWhereClause('y') + ') q1, ' +
        '((SELECT ISNULL(SUM(ISNULL(AA.IMPQTY1-AA.EXPQTY1,0)), 0) AS si3 FROM MTRBALSHEET AA ' +
        'WHERE AA.COMPANY=:X.SYS.COMPANY AND AA.MTRL=ml.MTRL AND AA.FISCPRD=:X.SYS.FISCPRD ' +
        'AND AA.PERIOD<:X.SYS.PERIOD AND AA.WHOUSE=(SELECT CCCWHOUSESEC FROM PRJC WHERE PRJC=:SALDOC.PRJC)) + ' +
        '(SELECT SUM(ISNULL(AA.QTY1*BB.FLG01,0))-SUM(ISNULL(AA.QTY1*BB.FLG04,0))AS r3 ' +
        'FROM MTRTRN AA ,TPRMS BB WHERE AA.COMPANY =:X.SYS.COMPANY AND AA.MTRL=ml.MTRL AND AA.COMPANY = BB.COMPANY ' +
        'AND AA.WHOUSE=(SELECT CCCWHOUSESEC FROM PRJC WHERE PRJC=:SALDOC.PRJC) AND AA.TPRMS = BB.TPRMS AND ' +
        'AA.SODTYPE = BB.SODTYPE AND BB.SODTYPE = 51 AND AA.FISCPRD=:X.SYS.FISCPRD AND AA.PERIOD=:X.SYS.PERIOD and prjc=:SALDOC.PRJC ' +
        'AND AA.TRNDATE <DateAdd(d,1,CAST(GETDATE() AS DATE)))) q2' +
        ' FROM MTRLINES ml WHERE FINDOC=' + SALDOC.CCCFLMR + ' AND SODTYPE=51' +
        ' AND isnull(PRJCSTAGE, 0)=' + SALDOC.PRJCSTAGE + ' AND isnull(CCCDEVIZ, 0)=' + SALDOC.CCCDEVIZECM +
        ' AND isnull(CCCSPECIALITATESF, 0)=' + SALDOC.CCCSPECIALITATESF + ' AND isnull(CCCSF, 0)=' + SALDOC.CCCSF +
        ' AND isnull(CCCCOLECTIESF, 0)=' + SALDOC.CCCCOLECTIESF + ' AND isnull(CCCTABLOU, 0)=' + SALDOC.CCCTABLOU, null);

    var qq = 'SELECT MTRL, QTY1, CCCUM, PRJCSTAGE, CCCDEVIZ, CCCSPECIALITATESF, CCCSF, CCCCOLECTIESF, CCCTABLOU, ' +
        'CCCCOLECTIE, CCCCAPITOL, CCCGRUPALUCRARI, CCCACTIVITATE FROM MTRLINES WHERE FINDOC=' + SALDOC.CCCFLMR + ' AND SODTYPE=52' +
        ' AND isnull(PRJCSTAGE, 0)=' + SALDOC.PRJCSTAGE + ' AND isnull(CCCDEVIZ, 0)=' + SALDOC.CCCDEVIZECM +
        ' AND isnull(CCCSPECIALITATESF, 0)=' + SALDOC.CCCSPECIALITATESF + ' AND isnull(CCCSF, 0)=' + SALDOC.CCCSF +
        ' AND isnull(CCCCOLECTIESF, 0)=' + SALDOC.CCCCOLECTIESF + ' AND isnull(CCCTABLOU, 0)=' + SALDOC.CCCTABLOU,
        y = X.GETSQLDATASET(qq, null);

    x.FIRST;
    while (!x.EOF) {
        if (ITELINES.LOCATE('MTRL', x.MTRL) == 1) {
            //m-am dus pe linia potrivita, urmeaza update-ul mai jos
        } else {
            //nu este, adauga
            ITELINES.APPEND;
            ITELINES.MTRL = x.MTRL;
        }

        if (ITELINES.CCCQTYFL != x.QTY1)
            ITELINES.CCCQTYFL = x.QTY1;
        if (ITELINES.PRJCSTAGE != x.PRJCSTAGE)
            ITELINES.PRJCSTAGE = x.PRJCSTAGE;
        if (ITELINES.CCCDEVIZ != x.CCCDEVIZ)
            ITELINES.CCCDEVIZ = x.CCCDEVIZ;
        if (ITELINES.CCCSPECIALITATESF != x.CCCSPECIALITATESF)
            ITELINES.CCCSPECIALITATESF = x.CCCSPECIALITATESF;
        if (ITELINES.CCCSF != x.CCCSF)
            ITELINES.CCCSF = x.CCCSF;
        if (ITELINES.CCCCOLECTIESF != x.CCCCOLECTIESF)
            ITELINES.CCCCOLECTIESF = x.CCCCOLECTIESF;
        if (ITELINES.CCCTABLOU != x.CCCTABLOU)
            ITELINES.CCCTABLOU = x.CCCTABLOU;
        if (ITELINES.CCCBULLSHIT1 != SALDOC.CCCSPECIALITATESF_CCCSPECIALITATESF_NAME)
            ITELINES.CCCBULLSHIT1 = SALDOC.CCCSPECIALITATESF_CCCSPECIALITATESF_NAME;
        if (ITELINES.CCCBULLSHIT2 != SALDOC.CCCSF_CCCSF_NAME)
            ITELINES.CCCBULLSHIT2 = SALDOC.CCCSF_CCCSF_NAME;
        if (ITELINES.CCCBULLSHIT3 != SALDOC.CCCCOLECTIESF_CCCCOLECTIESF_NAME)
            ITELINES.CCCBULLSHIT3 = SALDOC.CCCCOLECTIESF_CCCCOLECTIESF_NAME;
        if (ITELINES.CCCBULLSHIT4 != SALDOC.CCCTABLOU_CCCTABLOU_NAME)
            ITELINES.CCCBULLSHIT4 = SALDOC.CCCTABLOU_CCCTABLOU_NAME;
        if (ITELINES.CCCTOTBCV != x.q1)
            ITELINES.CCCTOTBCV = x.q1;
        if (ITELINES.CCCSTOCWH != x.q2)
            ITELINES.CCCSTOCWH = x.q2;

        try {
            ITELINES.POST;
        } catch (err) {};

        x.NEXT;
    }

    y.FIRST;
    while (!y.EOF) {
        if (SRVLINES.LOCATE('MTRL;CCCCOLECTIE;CCCCAPITOL;CCCGRUPALUCRARI;CCCACTIVITATE', y.MTRL, y.CCCCOLECTIE, y.CCCCAPITOL, y.CCCGRUPALUCRARI, y.CCCACTIVITATE) == 1) {
            //m-am dus pe linia potrivita, urmeaza update-ul mai jos
        } else {
            //nu este, adauga
            SRVLINES.APPEND;
            SRVLINES.MTRL = y.MTRL;
        }

        if (SRVLINES.CCCQTYFL != y.QTY1)
            SRVLINES.CCCQTYFL = y.QTY1;
        if (SRVLINES.CCCUM != y.CCCUM)
            SRVLINES.CCCUM = y.CCCUM;
        if (SRVLINES.PRJCSTAGE != y.PRJCSTAGE)
            SRVLINES.PRJCSTAGE = y.PRJCSTAGE;
        if (SRVLINES.CCCDEVIZ != y.CCCDEVIZ)
            SRVLINES.CCCDEVIZ = y.CCCDEVIZ;
        if (SRVLINES.CCCSPECIALITATESF != y.CCCSPECIALITATESF)
            SRVLINES.CCCSPECIALITATESF = y.CCCSPECIALITATESF;
        if (SRVLINES.CCCSF != y.CCCSF)
            SRVLINES.CCCSF = y.CCCSF;
        if (SRVLINES.CCCCOLECTIESF != y.CCCCOLECTIESF)
            SRVLINES.CCCCOLECTIESF = y.CCCCOLECTIESF;
        if (SRVLINES.CCCTABLOU != y.CCCTABLOU)
            SRVLINES.CCCTABLOU = y.CCCTABLOU;
        if (SRVLINES.CCCCOLECTIE != y.CCCCOLECTIE)
            SRVLINES.CCCCOLECTIE = y.CCCCOLECTIE;
        if (SRVLINES.CCCCAPITOL != y.CCCCAPITOL)
            SRVLINES.CCCCAPITOL = y.CCCCAPITOL;
        if (SRVLINES.CCCGRUPALUCRARI != y.CCCGRUPALUCRARI)
            SRVLINES.CCCGRUPALUCRARI = y.CCCGRUPALUCRARI;
        if (SRVLINES.CCCACTIVITATE != y.CCCACTIVITATE)
            SRVLINES.CCCACTIVITATE = y.CCCACTIVITATE;
        if (SRVLINES.CCCBULLSHIT1 != SALDOC.CCCSPECIALITATESF_CCCSPECIALITATESF_NAME)
            SRVLINES.CCCBULLSHIT1 = SALDOC.CCCSPECIALITATESF_CCCSPECIALITATESF_NAME;
        if (SRVLINES.CCCBULLSHIT2 != SALDOC.CCCSF_CCCSF_NAME)
            SRVLINES.CCCBULLSHIT2 = SALDOC.CCCSF_CCCSF_NAME;
        if (SRVLINES.CCCBULLSHIT3 != SALDOC.CCCCOLECTIESF_CCCCOLECTIESF_NAME)
            SRVLINES.CCCBULLSHIT3 = SALDOC.CCCCOLECTIESF_CCCCOLECTIESF_NAME;
        if (SRVLINES.CCCBULLSHIT4 != SALDOC.CCCTABLOU_CCCTABLOU_NAME)
            SRVLINES.CCCBULLSHIT4 = SALDOC.CCCTABLOU_CCCTABLOU_NAME;
        extra();

        try {
            SRVLINES.POST;
        } catch (err) {};

        y.NEXT;
    }
}

function createWhereClause(z) {
    var response = '';
    var x = SALDOC;
    var y = ':SALDOC';
    var arrFldDoc = [x.PRJCSTAGE, x.CCCDEVIZECM, x.CCCSPECIALITATESF, x.CCCSF, x.CCCCOLECTIESF, x.CCCTABLOU];
    var arrStrDoc = [y + '.PRJCSTAGE', y + '.CCCDEVIZECM', y + '.CCCSPECIALITATESF', y + '.CCCSF', y + '.CCCCOLECTIESF', y + '.CCCTABLOU'];
    var arrStrLin = [z + '.PRJCSTAGE', z + '.CCCDEVIZECM', z + '.CCCSPECIALITATESF', z + '.CCCSF', z + '.CCCCOLECTIESF', z + '.CCCTABLOU'];
    for (var i = 0; i < arrFldDoc.length; i++) {
        if (arrFldDoc[i]) {
            response += ' and ' + arrStrLin[i] + '=' + arrStrDoc[i];
        }
    }

    return response;
}

function extra() {
    var a = SRVLINES.CCCSPECIALITATESF ? ' AND CCCSPECIALITATESF=ISNULL(' + SRVLINES.CCCSPECIALITATESF + ', 0)' : ''
    var b = SRVLINES.CCCSF ? ' AND CCCSF=ISNULL(' + SRVLINES.CCCSF + ', 0)' : ''
    var c = SRVLINES.CCCCOLECTIESF ? ' AND CCCCOLECTIESF=ISNULL(' + SRVLINES.CCCCOLECTIESF + ', 0)' : ''
    var c = SRVLINES.CCCCOLECTIESF ? ' AND CCCCOLECTIESF=ISNULL(' + SRVLINES.CCCCOLECTIESF + ', 0)' : ''
    var d = SRVLINES.CCCTABLOU ? ' AND CCCTABLOU=ISNULL(' + SRVLINES.CCCTABLOU + ', 0)' : ''
    if ((SRVLINES.CCCACTIVITATE == 0) || (SRVLINES.CCCACTIVITATE == null) || (SRVLINES.CCCACTIVITATE == '')) {} else {
        sSQL2 = 'select sum(isnull(cccrealizatzi,0)) cccrealizatzi from findoc where company=' + X.SYS.COMPANY +
            ' and sosource=1011 and fprms=1011 and prjc=' + SALDOC.PRJC + ' and PRJCSTAGE=' + SRVLINES.PRJCSTAGE +
            ' and CCCDEVIZECM=' + SRVLINES.CCCDEVIZ + ' and CCCCOLECTIE=' + SRVLINES.CCCCOLECTIE +
            ' and CCCCAPITOL=' + SRVLINES.CCCCAPITOL + ' and CCCGRUPALUCRARI=' + SRVLINES.CCCGRUPALUCRARI +
            ' and CCCACTIVITATE=' + SRVLINES.CCCACTIVITATE +
            a + b + c + d;
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
    filterThis(SALDOC.CCCFILTRUSPECIALITATESF, 'CCCSPECIALITATE');
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

function filterThis(intCampFiltru, strCampFiltrat) {
    //filtru cumulativ
    var a = stareaActualaFiltre(1);
    if (intCampFiltru) {
        if (a) {
            CCCVTCOMBOS.FILTER = '(' + a + ' AND {CCCVTCOMBOS.' + strCampFiltrat + '}=' + intCampFiltru + ')';
            CCCVTCOMBOS.FILTERED = 1;
        } else {
            CCCVTCOMBOS.FILTER = '({CCCVTCOMBOS.' + strCampFiltrat + '}=' + intCampFiltru + ')';
            CCCVTCOMBOS.FILTERED = 1;
        }
    } else {
        if (a) {
            CCCVTCOMBOS.FILTER = '(' + a + ')';
            CCCVTCOMBOS.FILTERED = 1;
        } else {
            CCCVTCOMBOS.FILTERED = 0;
        }
    }
}

function stareaActualaFiltre() {
    var arrFilters = [SALDOC.CCCFILTRUOBIECTCM, SALDOC.CCCFILTRUDEVIZCM, SALDOC.CCCFILTRUSPECIALITATESF, SALDOC.CCCFILTRUSF, SALDOC.CCCFILTRUCOLECTIESF, SALDOC.CCCFILTRUTABLOU];
    var ret = ''; //default

    var arrFields = ['CCCVTCOMBOS.PRJCSTAGE', 'CCCVTCOMBOS.CCCDEVIZECM', 'CCCVTCOMBOS.CCCSPECIALITATE', 'CCCVTCOMBOS.CCCSF', 'CCCVTCOMBOS.CCCCOLECTIESF', 'CCCVTCOMBOS.CCCTABLOU'];

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
    CCCVTCOMBOS.FILTERED = 0;
}

function ON_SALDOC_PRJC() {
    var sSQL = 'select TRDBRANCH, CCCWHOUSESEC from prjc where prjc=' + SALDOC.PRJC;
    var ds = X.GETSQLDATASET(sSQL, '');

    SALDOC.TRDBRANCH = ds.TRDBRANCH;
    MTRDOC.WHOUSE = ds.CCCWHOUSESEC;

    sSQL = 'select varchar02,varchar03,varchar04 from prjextra where prjc=' + SALDOC.PRJC;
    RCCC = X.GETSQLDATASET(sSQL, '');

    SALDOC.CCCNRCME = RCCC.varchar03;
    SALDOC.CCCNRCTR = RCCC.varchar04;
    SALDOC.CCCNRCOM = RCCC.varchar02;

    //completare FL
    sSQLFLC = 'select count(findoc) contor from findoc where series = 4059 and prjc=' + SALDOC.PRJC;
    dsFLC = X.GETSQLDATASET(sSQLFLC, null);

    if (dsFLC.contor > 0) {
        sSQLFL = 'select findoc, CCCRESP, CCCPERSCONST from findoc where series = 4059 and prjc=' + SALDOC.PRJC;
        dsFL = X.GETSQLDATASET(sSQLFL, null);

        SALDOC.CCCFLMR = dsFL.findoc;
        SALDOC.CCCRESP = dsFL.CCCRESP;
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
    var q = 'select distinct a.cccactivitate, b.cccgrupalucrari, c.ccccapitol, d.ccccolectie, a.normatimp from cccactivitate a ' +
        'inner join cccgrupalucrari b on (a.cccgrupalucrari=b.cccgrupalucrari) ' +
        'inner join ccccapitol c on (b.ccccapitol=c.ccccapitol) ' +
        'inner join ccccolectie d on (c.ccccolectie=d.ccccolectie) ' +
        'where a.cccactivitate=' + SRVLINES.CCCACTIVITATE;
    var ds = X.GETSQLDATASET(q, null);

    if (ds.RECORDCOUNT) {
        ds.FIRST;
        SRVLINES.CCCCOLECTIE = ds.ccccolectie;
        SRVLINES.CCCCAPITOL = ds.ccccapitol;
        SRVLINES.CCCGRUPALUCRARI = ds.cccgrupalucrari;
    }
}

function ON_SRVLINES_QTY1() {
    SRVLINES.QTY2 = calcTimpNormat(SRVLINES.QTY1);
}

function ON_ITELINES_QTY1() {
    if (ITELINES.QTY1) {
        if (ITELINES.QTY1 > ITELINES.CCCQTY1SRV) {
            X.WARNING('Cantitate mai mare decat stoc responsabil');
            ITELINES.QTY1 = 0;
        }
    }
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
    } catch (err) {
        X.WARNING(err.message);
    } finally {
        o.Free;
        o = null;
    }
}

function hProgramTot() {
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
        hNormatTot += SRVLINES.QTY2;
        SRVLINES.NEXT;
    }
    SRVLINES.ENABLECONTROLS;

    SRVLINES.FIRST;
    while (!SRVLINES.EOF) {
        SRVLINES.QTY = SRVLINES.QTY2 * tot / hNormatTot;
        SRVLINES.NEXT;
    }
}

function ON_LOCATE() {
    highlightUI();
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
        //SALDOC.CCCAPROBATPLATA = X.SQL('select isnull(ccctipexecutant, 0) from rsrctype where rsrctype='+SALDOC.CCCSUBANTREPRENOR, null);
    }
}