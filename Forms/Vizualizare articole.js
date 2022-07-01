function ON_ITEM_NEW() {
    sSQL = "select max(convert(int,code))+1 as cod from mtrl where sodtype=51 and code not like 'artgen%'";
    ds = X.GETSQLDATASET(sSQL, null);

    ITEM.CODE = ds.cod;
    ITEM.CODE1 = ds.cod;

}

function ON_ITEM_CCCGRUP1()

{
    ITEM.CCCGRUP2 = null;
    ITEM.CCCGRUP3 = null;
    ITEM.CCCGRUP4 = null;
}

function ON_ITEM_CCCGRUP2() {
    ITEM.CCCGRUP3 = null;
    ITEM.CCCGRUP4 = null;
}


function ON_ITEM_CCCGRUP3() {

    ITEM.CCCGRUP4 = null;
}


function ON_ITEM_MTRACN() {
    //daca se modifica categorie contabila la un articol at vf daca am tranzactii cu acel articol pe modulele vanzari, gestiune si achiziti
    if (ITEM.MTRL > 0) {
        sSQLA = 'select count(*) contor from mtrlines where mtrl= ' + ITEM.MTRL + ' and sosource in (1251,1351,1151) and company=' + X.SYS.COMPANY;
        dsA = X.GETSQLDATASET(sSQLA, null);

        if (dsA.contor > 0) {
            X.WARNING('Articolul contine tranzactii salvate, va rugam verificati si informati departamentul contabilitate!');
        }
    }
    // adaug cont de cheltuiala 
    sSQL = 'SELECT A.CCCUTBLCHELTUIALA FROM MTRACN A WHERE A.SODTYPE=51 AND A.COMPANY=' + X.SYS.COMPANY + ' AND A.MTRACN= ' + ITEM.MTRACN;
    ds = X.GETSQLDATASET(sSQL, null);

    ITEEXTRA.UTBL01 = ds.CCCUTBLCHELTUIALA;

    //mai jos adaug conturi pe articol in functie de categoria contabila selectata
    if (ITEM.MTRACN == 1) {
        ITEM.ACNMSK = '371';
        ITEM.ACNMSK1 = '707';
        ITEEXTRA.UTBL01 = '607';
        ITEEXTRA.UTBL05 = '327';
    }
    if (ITEM.MTRACN == 2) {
        ITEM.ACNMSK = '3028';
        ITEM.ACNMSK1 = '704';
        ITEEXTRA.UTBL01 = '6028';
        ITEEXTRA.UTBL05 = '322';
    }
    if (ITEM.MTRACN == 3) {
        ITEM.ACNMSK = '3021';
        ITEM.ACNMSK1 = '704';
        ITEEXTRA.UTBL01 = '6021';
        ITEEXTRA.UTBL05 = '322';
    }
    if (ITEM.MTRACN == 4) {
        ITEM.ACNMSK = '301';
        ITEM.ACNMSK1 = ' ';
        ITEEXTRA.UTBL01 = '601';
        ITEEXTRA.UTBL05 = '321';
    }
    if (ITEM.MTRACN == 5) {
        ITEM.ACNMSK = '345';
        ITEM.ACNMSK1 = '711';
        ITEEXTRA.UTBL01 = '711';
        ITEEXTRA.UTBL05 = '327';
    }
    if (ITEM.MTRACN == 6) {
        ITEM.ACNMSK = '381';
        ITEM.ACNMSK1 = ' ';
        ITEEXTRA.UTBL01 = '608';
        ITEEXTRA.UTBL05 = '328';
    }
    if (ITEM.MTRACN == 7) {
        ITEM.ACNMSK = '303';
        ITEM.ACNMSK1 = '707';
        ITEEXTRA.UTBL01 = '603';
        ITEEXTRA.UTBL05 = '323';

        if (ITEM.ITEM > 0) {} else {
            var ans = X.ASK('Generare Nr. inventar', 'Are numar inventar?');
            if (ans == 6) {
                ITEEXTRA.NUM04 = null;
                dsSQL = X.GETSQLDATASET('select max(isnull(mx.num04,1066))+1 as next from mtrextra mx left outer join mtrl m on mx.mtrl=m.mtrl where m.sodtype=51 and m.mtracn=7 and m.isactive=1 and m.company=' + X.SYS.COMPANY, null);
                ITEEXTRA.NUM04 = dsSQL.next;
            } else {
                ITEEXTRA.NUM04 = null;
            }
        }
    }
    if (ITEM.MTRACN == 8) {
        ITEM.ACNMSK = '3024';
        ITEM.ACNMSK1 = '704';
        ITEEXTRA.UTBL01 = '6024';
        ITEEXTRA.UTBL05 = '322';
    }
    if (ITEM.MTRACN == 9) {
        ITEM.ACNMSK = '5328';
        ITEM.ACNMSK1 = ' ';
        ITEEXTRA.UTBL01 = '6022';
        ITEEXTRA.UTBL05 = '327';
    }
    if (ITEM.MTRACN == 10) {
        ITEM.ACNMSK = '3022';
        ITEM.ACNMSK1 = ' ';
        ITEEXTRA.UTBL01 = '6022';
        ITEEXTRA.UTBL05 = '322';
    }
    if (ITEM.MTRACN == 11) {
        ITEM.ACNMSK = '5328';
        ITEM.ACNMSK1 = ' ';
        ITEEXTRA.UTBL01 = '642';
        ITEEXTRA.UTBL05 = '327';
    }
    if (ITEM.MTRACN == 16) {
        var n = X.SQL(" select FORMAT(max(dbo.udf_GetNumeric(code)) + 1, '0######')from mtrl where isnull(cccprjc, 0) <> 0 ", null);
        ITEM.CODE = 'ARTGEN-' + n.toString();
    }
}

function ON_AFTERPOST() {
    if ((ITEM.MTRACN == 7) && (ITEEXTRA.NUM04 > 0)) {
        if (ITEM.MTRL > 0)
            ITEMID = ITEM.MTRL;
        else
            ITEMID = X.NEWID;

        var nume = ITEM.NAME;
        var subs = ' (Nr. inventar ' + ITEEXTRA.NUM04 + ')';
        X.RUNSQL('update mtrl set NAME = \'' + nume + subs + '\' where mtrl = ' + ITEMID, null);
    }
}

function ON_EDIT() {
    var u = 'select CCCNOEDIT from USERS where USERS=' + X.SYS.USER,
        dsu = X.GETSQLDATASET(u, null);

    if ((dsu.CCCNOEDIT == 1) && (MTRL.CCCHEADER > 0) && MTRL.MTRACN == 16) {
        X.EXCEPTION('Nu aveti drept de modificare!');
    }
}