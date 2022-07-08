lib.include('utils');

function ON_ITEDOC_PRJC() {
    if (ITEDOC.SERIES == 2011) {
        sSQL = 'select trdr, trdbranch,cccwhouse,CCCWHOUSESEC from prjc where prjc= ' + ITEDOC.PRJC;
        ds = X.GETSQLDATASET(sSQL, '');

        ITEDOC.CCCTRDR = ds.trdr;
        ITEDOC.CCCTRDBRANCH = ds.trdbranch;
        MTRDOC.WHOUSE = ds.cccwhousesec;
        MTRDOC.WHOUSESEC = 1;

        //completare FL

        ITEDOC.CCCFLMR = X.SQL('select top 1 findoc from findoc where series in (4067, 4056, 4058, 4059) and prjc=' + ITEDOC.PRJC + ' order by trndate desc', null);

    }
}

function ON_POST() {
    //sterge la salvare cantitatile cu 0

    ITELINES.DISABLECONTROLS;
    ITELINES.FIRST;
    while (!ITELINES.Eof) {
        if (ITELINES.QTY1 == 0)
            ITELINES.DELETE;
        else
            ITELINES.NEXT;
    }
    ITELINES.ENABLECONTROLS;

}
//actualizare sesponsabil la selectie departament
function ON_ITEDOC_CCCDEP() {
    ITEDOC.CCCRESPON = null;
}

function ON_ITEDOC_CCCFLMR() {
    sSQL = 'select CCCRESP,CCCPERSCONST from findoc where findoc=' + ITEDOC.CCCFLMR;
    ds = X.GETSQLDATASET(sSQL, null);

    ITEDOC.CCCRESP = ds.CCCRESP;
    ITEDOC.CCCPERSCONST = ds.CCCPERSCONST;
}

function callStocuri() {
    if (!ITEDOC.CCCMAGAZIONER) {
        X.WARNING('Completati responsabil marfa...');
        return;
    }

    if (!ITEDOC.CCCRESPON) {
        X.WARNING('Completati responsabil departament...');
        return;
    }

    if (!ITEDOC.PRJC) {
        X.WARNING('Completati proiectul...');
        return;
    }

    stocProiect();
    debugger;
    getStocTotalResponsabil(ITEDOC.CCCMAGAZIONER, ITELINES, 'CCCQTY1DEVIZ');

    X.WARNING('Actualizare completa.');
}

function stocProiect() {
    ITELINES.LAST;
    while (ITELINES.RECORDCOUNT != 0) {
        ITELINES.DELETE;
        ITELINES.PREVIOUS;
        X.PROCESSMESSAGES();
    }

    //calcul stocwh in linii NOU
    sSQLSTOC = 'SELECT A.mtrl, ';
    sSQLSTOC += '				 Round(Sum(impqty1) - Sum(expqty1), 3)                   qty1 ';
    sSQLSTOC += '	FROM   vmtrstat A ';
    sSQLSTOC += '				 LEFT OUTER JOIN mtrlines M ';
    sSQLSTOC += '											ON M.findoc = A.findoc ';
    sSQLSTOC += '												 AND M.mtrl = A.mtrl ';
    sSQLSTOC += '												 AND M.qty1 = A.qty1 ';
    sSQLSTOC += '												 AND M.prjc = A.prjc ';
    sSQLSTOC += '												 AND m.mtrlines = A.mtrtrn ';
    sSQLSTOC += '				 LEFT OUTER JOIN mtrl MT ';
    sSQLSTOC += '											ON MT.mtrl = A.mtrl ';
    sSQLSTOC += '				 LEFT OUTER JOIN whouse W ';
    sSQLSTOC += '											ON A.whouse = W.WHOUSE ';
    sSQLSTOC += '				 LEFT OUTER JOIN prjc ML ';
    sSQLSTOC += '											ON ML.prjc = A.prjc ';
    sSQLSTOC += '	WHERE  A.trndate <= ' + X.EVAL('SQLDATE(X.SYS.LOGINDATE)');
    sSQLSTOC += '				 AND A.company =' + X.SYS.COMPANY;
    sSQLSTOC += '				 AND MT.sodtype = 51 ';
    sSQLSTOC += '				 AND A.whouse IN (select CCCWHOUSESEC from prjc where prjc =' + ITEDOC.PRJC + ') ';
    sSQLSTOC += '				 AND A.prjc = ' + ITEDOC.PRJC;
    sSQLSTOC += '	GROUP  BY A.prjc, ';
    sSQLSTOC += '						A.whouse, ';
    sSQLSTOC += '						A.mtrl, ';
    sSQLSTOC += '						MT.code, ';
    sSQLSTOC += '						MT.code2, ';
    sSQLSTOC += '						MT.NAME, ';
    sSQLSTOC += '						W.NAME, ';
    sSQLSTOC += '						ML.code, ';
    sSQLSTOC += '						ML.NAME, ';
    sSQLSTOC += '						ML.finaldate ';
    sSQLSTOC += '	HAVING Round(Sum(impqty1) - Sum(expqty1), 3) <> 0';
    sSQLSTOC += '	ORDER  BY MT.code   ';
    ds = X.GETSQLDATASET(sSQLSTOC, null);

    //Iau datele din select si inserez in etichete
    if (ds.RECORDCOUNT != 0) {

        ds.FIRST;
        while (!ds.EOF()) {
            ITELINES.APPEND;
            ITELINES.MTRL = ds.mtrl;
            ITELINES.QTY1 = 0;
            ITELINES.FINDOCS = ITEDOC.CCCFLMR;
            ITELINES.CCCSTOCWH = ds.qty1;

            sSQLQFL = 'select isnull(sum(qty1),0) qtyFL from mtrlines where findoc=' + ITEDOC.CCCFLMR + ' and mtrl=' + ds.mtrl + ' and company=' + X.SYS.COMPANY;
            dsQFL = X.GETSQLDATASET(sSQLQFL, null);

            ITELINES.CCCQTYINIT = dsQFL.qtyFL;
            ITELINES.POST;

            X.PROCESSMESSAGES();

            ds.NEXT;

        }

    } else {
        X.WARNING('Stoc 0 pe gestiunea reala a proiectului! Va rugam efectuati incarcarea de stoc!!');
    }

}

function EXECCOMMAND(cmd) {
    if (cmd == 202001201) {
        var o = X.CreateObjForm('ITEDOC[Form=Transfer intre gestiuni]');
        try {
            o.DBInsert;
            var h = o.FindTable('FINDOC');
            h.Edit;
            h.SERIES = 2012;
            if (ITEDOC.CCCDEP)
                h.CCCDEP = ITEDOC.CCCDEP;
            if (ITEDOC.CCCRESPON)
                h.CCCRESPON = ITEDOC.CCCRESPON;
            if (ITEDOC.CCCMAGAZIONER)
                h.CCCMAGAZIONER = ITEDOC.CCCMAGAZIONER;
            if (ITEDOC.COMMENTS)
                h.COMMENTS = ITEDOC.COMMENTS;
            if (ITEDOC.PRJC)
                h.PRJC = ITEDOC.PRJC;
            if (ITEDOC.CCCFLMR)
                h.CCCFLMR = ITEDOC.CCCFLMR;
            var m = o.FindTable('MTRDOC');
            if (MTRDOC.WHOUSE)
                m.WHOUSE = MTRDOC.WHOUSE;
            m.BRANCHSEC = X.SYS.BRANCH;
            if (MTRDOC.WHOUSESEC)
                m.WHOUSESEC = MTRDOC.WHOUSESEC;
            if (MTRDOC.SHIPDATE)
                m.SHIPDATE = MTRDOC.SHIPDATE;
            var l = o.FindTable('ITELINES');
            ITELINES.FIRST;
            while (!ITELINES.EOF) {
                l.Append;
                l.MTRL = ITELINES.MTRL;
                l.QTY1 = ITELINES.QTY1 - ITELINES.QTY1COV - ITELINES.QTY1CANC;
                l.FINDOCS = ITELINES.FINDOC;
                l.Post;

                ITELINES.NEXT;
            }

            var id = o.SHOWOBJFORM();
        } catch (err) {
            X.WARNING(err.message);
        } finally {
            o.FREE;
            o = null;
        }
    }

    if (cmd == 202109221) {
        callStocuri();
    }
}

var itsMe = false;

function ON_ITELINES_QTY1() {
    if (itsMe) {
        itsMe = false;
        return;
    }
    if (ITELINES.QTY1 == 0)
        return;
    var mi = (!ITELINES.CCCSTOCWH || !ITELINES.CCCQTY1DEVIZ) ? 0 : Math.min(ITELINES.CCCSTOCWH, ITELINES.CCCQTY1DEVIZ);
    if (!mi) {
        X.WARNING('Stoc zero, nu se poate face retur...');
        itsMe = true;
        ITELINES.QTY1 = null;
    } else {
        if (ITELINES.QTY1 > mi) {
            itsMe = true;
            ITELINES.QTY1 = mi;
        }
    }
}