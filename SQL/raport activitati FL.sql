SELECT
    prjc,
    cccsuc,
    utbl03,
    CCCDIV,
    CCCOBIECTIV,
    trdr,
(
        SELECT
            NAME
        FROM
            PRJC
        WHERE
            PRJC = t1.PRJC
    ) LUCRARE,
(
        SELECT
            NUME
        FROM
            CCCOBIECTIV
        WHERE
            CCCOBIECTIV =(
                SELECT
                    CCCOBIECTIV
                FROM
                    PRJC
                WHERE
                    PRJC = t1.PRJC
            )
    ) OBIECTIV,
(
        SELECT
            NUME
        FROM
            CCCSUC
        WHERE
            CCCSUC =(
                SELECT
                    CCCSUC
                FROM
                    PRJC
                WHERE
                    PRJC = t1.PRJC
            )
    ) SUCURSALA,
(
        SELECT
            NAME
        FROM
            UTBL03
        WHERE
            UTBL03 =(
                SELECT
                    UTBL03
                FROM
                    PRJEXTRA
                WHERE
                    PRJC = t1.PRJC
                    AND ISACTIVE = 1
            )
            AND SODTYPE = 40
    ) DIVIZIE,
    cccactivitate,
    ccctablouri,
    densursa,
    cladires,
    dencladires,
    pss,
    denpss,
    sss,
    densss,
    incs,
    denincs,
    ssfs,
    denssfs,
    sfs,
    densfs,
    colsfs,
    dencolsfs,
    circuit,
    dencircuit,
    consumator,
    denconsumator,
    atribut,
    cladirec,
    dencladirec,
    psc,
    denpsc,
    ssc,
    denssc,
    incc,
    denincc,
    ssfc,
    denssfc,
    sfc,
    densfc,
    colsfc,
    dencsfc,
    col,
    dencol,
    cap,
    dencap,
    gl,
    dengl,
    activit,
    denactivit,
    canfl,
    unit,
    normatimp,
    cost,
    part,
    denpart,
    finalizat,
    isnull(sum(isnull(CCCREALIZATZI, 0)), 0) cantreal,
CASE
        WHEN ISNULL(t1.normatimp, 0) = 0 THEN 0
        WHEN isnull(sum(isnull(CCCREALIZATZI, 0)), 0) = 0 THEN 0
        ELSE isnull(sum(isnull(CCCREALIZATZI, 0)), 0) * t1.normatimp
    END orerealnorma,
CASE
        WHEN ISNULL(canfl, 0) = 0 THEN 0
        WHEN ISNULL(sum(isnull(CCCREALIZATZI, 0)), 0) = 0 THEN 0
        ELSE isnull((sum(isnull(CCCREALIZATZI, 0)) / canfl), 0) * 100
    END procrealnorma,
    isnull(canfl, 0) - isnull(sum(isnull(CCCREALIZATZI, 0)), 0) cantnereal,
CASE
        WHEN ISNULL(t1.normatimp, 0) = 0 THEN 0
        WHEN isnull(canfl - sum(isnull(CCCREALIZATZI, 0)), 0) = 0 THEN 0
        ELSE (canfl - sum(isnull(CCCREALIZATZI, 0))) * normatimp
    END orenerealnorma,
CASE
        WHEN ISNULL(canfl, 0) = 0 THEN 0
        WHEN canfl - sum(isnull(CCCREALIZATZI, 0)) = 0 THEN 0
        ELSE ((canfl - sum(isnull(CCCREALIZATZI, 0))) / canfl) * 100
    END procnerealnorma,
    isnull(sum(isnull(num01, 0)), 0) orepontate
FROM
    (
        SELECT
            p.prjc,
            p.cccsuc,
            pe.utbl03,
            p.CCCDIV,
            p.trdr,
            p.CCCOBIECTIV,
            m.cccactivitate,
            m.ccctablouri,
            aa.num01,
            aa.trndate dataPontaje,
            m.bool01 finalizat,
(
                SELECT
                    denumire
                FROM
                    ccctablouri
                WHERE
                    ccctablou = m.ccctablouri
                    AND cccheader = s.cccheader
                    AND isactive = 1
            ) densursa,
            cc.ccccladire cladires,
(
                SELECT
                    denumire
                FROM
                    ccccladire
                WHERE
                    ccccladire = cc.ccccladire
                    AND cccheader = s.cccheader
            ) dencladires,
            cc.cccprimaryspace pss,
(
                SELECT
                    denumire
                FROM
                    cccprimaryspace
                WHERE
                    cccprimaryspace = cc.cccprimaryspace
                    AND cccheader = s.cccheader
            ) denpss,
            cc.cccsecondaryspace sss,
(
                SELECT
                    denumire
                FROM
                    cccsecondaryspace
                WHERE
                    cccsecondaryspace = cc.cccsecondaryspace
                    AND cccheader = s.cccheader
            ) densss,
            cc.cccincapere incs,
(
                SELECT
                    denumire
                FROM
                    cccincapere
                WHERE
                    cccincapere = cc.cccincapere
                    AND cccheader = s.cccheader
            ) denincs,
            cc.cccspecialitatesf ssfs,
(
                SELECT
                    name
                FROM
                    cccspecialitatesf
                WHERE
                    cccspecialitatesf = cc.cccspecialitatesf
            ) denssfs,
            cc.cccsf sfs,
(
                SELECT
                    name
                FROM
                    cccsf
                WHERE
                    cccsf = cc.cccsf
            ) densfs,
            cc.ccccolectiesf colsfs,
(
                SELECT
                    name
                FROM
                    ccccolectiesf
                WHERE
                    ccccolectiesf = cc.ccccolectiesf
            ) dencolsfs,
            m.ccccircuit circuit,
(
                SELECT
                    denumire
                FROM
                    ccccircuit
                WHERE
                    ccccircuit = m.ccccircuit
                    AND cccheader = s.cccheader
                    AND isactive = 1
            ) dencircuit,
            m.cccmtrlgen consumator,
            dd.denumire denconsumator,
CASE
                dd.atribut
                WHEN 1 THEN 'Sursa'
                WHEN 2 THEN 'General'
                WHEN 3 THEN 'Unic'
            END AS atribut,
            m.ccccladire cladirec,
(
                SELECT
                    denumire
                FROM
                    ccccladire
                WHERE
                    ccccladire = m.ccccladire
                    AND cccheader = s.cccheader
            ) dencladirec,
            m.cccprimaryspace psc,
(
                SELECT
                    denumire
                FROM
                    cccprimaryspace
                WHERE
                    cccprimaryspace = m.cccprimaryspace
                    AND cccheader = s.cccheader
            ) denpsc,
            m.cccsecondaryspace ssc,
(
                SELECT
                    denumire
                FROM
                    cccsecondaryspace
                WHERE
                    cccsecondaryspace = m.cccsecondaryspace
                    AND cccheader = s.cccheader
            ) denssc,
            m.cccincapere incc,
(
                SELECT
                    denumire
                FROM
                    cccincapere
                WHERE
                    cccincapere = m.cccincapere
                    AND cccheader = s.cccheader
            ) denincc,
            m.cccspecialitatesf ssfc,
(
                SELECT
                    name
                FROM
                    cccspecialitatesf
                WHERE
                    cccspecialitatesf = m.cccspecialitatesf
            ) denssfc,
            m.cccsf sfc,
(
                SELECT
                    name
                FROM
                    cccsf
                WHERE
                    cccsf = m.cccsf
            ) densfc,
            m.ccccolectiesf colsfc,
(
                SELECT
                    name
                FROM
                    ccccolectiesf
                WHERE
                    ccccolectiesf = m.ccccolectiesf
            ) dencsfc,
            m.cccactivitate activit,
(
                SELECT
                    activitate
                FROM
                    cccactivitate
                WHERE
                    cccactivitate = m.cccactivitate
            ) denactivit,
            m.ccccolectie col,
(
                SELECT
                    COLLECTION
                FROM
                    ccccolectie
                WHERE
                    ccccolectie = m.ccccolectie
            ) dencol,
            m.ccccapitol cap,
(
                SELECT
                    capitol
                FROM
                    ccccapitol
                WHERE
                    ccccapitol = m.ccccapitol
            ) dencap,
            m.cccgrupalucrari gl,
(
                SELECT
                    grupalucrari
                FROM
                    cccgrupalucrari
                WHERE
                    cccgrupalucrari = m.cccgrupalucrari
            ) dengl,
            aa.CCCREALIZATZI,
            m.qty1 canfl,
(
                SELECT
                    shortcut
                FROM
                    mtrunit
                WHERE
                    mtrunit = bb.CCCUNITATEMASURA
            ) unit,
            bb.normatimp normatimp,
(
                SELECT
                    1
            ) cost,
            aa.CCCSUBANTREPRENOR part,
(
                SELECT
                    name
                FROM
                    utbl02
                WHERE
                    sodtype = 20
                    AND utbl02 = aa.CCCSUBANTREPRENOR
            ) denpart
        FROM
            mtrlines m
            INNER JOIN findoc s ON (
                s.findoc = m.findoc
                AND s.sosource = m.sosource
            )
            left join prjc p on (p.prjc = s.prjc)
            left join prjextra pe on (
                pe.prjc = p.prjc
                and pe.sodtype = 40
            )
            LEFT JOIN findoc aa ON (
                --m.mtrlines=aa.cccmtrlines
                aa.sosource = 1011
                AND aa.fprms = 1011
                AND s.cccheader = aa.cccheader
                AND aa.prjc = s.prjc
                AND aa.CCCFINDOCOP = s.findoc
                AND aa.iscancel = 0
                AND m.cccspecialitatesf = aa.cccspecialitatesf
                AND m.cccsf = aa.cccsf
                AND m.ccccolectiesf = aa.ccccolectiesf
                AND m.ccctablouri = aa.ccctablouri
                AND m.ccccircuit = aa.int01
                AND m.ccccladire = aa.ccccladire
                AND m.cccprimaryspace = aa.cccprimaryspace
                AND m.cccsecondaryspace = aa.cccsecondaryspace
                AND m.cccincapere = aa.cccincapere
                AND aa.int02 = m.cccmtrlgen
                AND aa.CCCACTIVITATE = m.cccactivitate
                AND cast(aa.trndate as date) BETWEEN cast(:Usr.dataPontajeL as date) and cast(:Usr.dataPontajeH as DATE)
            )
            LEFT JOIN cccactivitate bb ON (m.cccactivitate = bb.cccactivitate)
            LEFT JOIN ccctablouri cc ON (
                cc.ccctablou = m.ccctablouri
                AND cc.cccheader = s.cccheader
            )
            LEFT JOIN cccconsumator dd ON (
                dd.cccmtrlgen = m.cccmtrlgen
                AND dd.cccheader = s.cccheader
            )
        WHERE
            m.findoc =(
                SELECT
                    TOP 1 findoc
                FROM
                    findoc
                WHERE
                    sosource = 1351
                    AND series = 4067
                    AND prjc = m.prjc
            )
            AND m.sodtype = 52 --AND s.prjc=31979
            $W
    ) t1
GROUP BY
    prjc,
    CCCSUC,
    utbl03,
    CCCOBIECTIV,
    trdr,
    CCCDIV,
    cccactivitate,
    ccctablouri,
    densursa,
    cladires,
    dencladires,
    pss,
    denpss,
    sss,
    densss,
    incs,
    denincs,
    ssfs,
    denssfs,
    sfs,
    densfs,
    colsfs,
    dencolsfs,
    circuit,
    dencircuit,
    consumator,
    denconsumator,
    atribut,
    cladirec,
    dencladirec,
    psc,
    denpsc,
    ssc,
    denssc,
    incc,
    denincc,
    ssfc,
    denssfc,
    sfc,
    densfc,
    colsfc,
    dencsfc,
    activit,
    denactivit,
    col,
    dencol,
    cap,
    dencap,
    gl,
    dengl,
    canfl,
    unit,
    normatimp,
    cost,
    part,
    denpart,
    finalizat
ORDER BY
    finalizat DESC,
    procnerealnorma ASC --sucursala si divizie in coloane si filtre
    --PRJC(J[p.PRJC])
    --CCCSUC(J[p.cccsuc])
    --utbl03(J[pe.utbl03])
    --CCCDIV(j[p.cccdiv])
    --CCCOBIECTIV(j[p.cccobiectiv])
    --customer(j[p.trdr])
    --$Y(J[m.bool01])