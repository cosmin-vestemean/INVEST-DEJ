---ARTICOLE GENERICE ORFANE--------------------------
select
c.name, b.mtrl, b.code, b.name, b.mtracn, b.insdate,
a.*
from mtrl b
left join cccartgen a on (a.cccmtrlgen=b.mtrl and a.prjc=b.cccprjc)
left join prjc c on c.prjc=b.cccprjc
where b.mtracn=16 and b.cccprjc=38465 and  b.isactive=1
order by b.name, b.mtrl, b.insdate

select
distinct c.name, b.mtrl, b.code, b.name, b.mtracn, b.insdate,
a.cccmtrlgen, a.mtrlstocabil, a.cccheader, a.mine, f.fincode
from mtrl b
left join cccartgen a on (a.cccmtrlgen=b.mtrl and a.prjc=b.cccprjc)
left join mtrlines ml on (a.cccmtrlgen=ml.mtrl)
left join findoc f on (f.findoc=ml.findoc)
left join prjc c on c.prjc=b.cccprjc
where b.mtracn=16 and b.cccprjc=38465 and  b.isactive=1
order by b.name, a.cccmtrlgen, b.mtrl

fl:
update b set b.cccmtrlgen=77841
from
findoc a
inner join mtrlines b on (a.findoc=b.findoc and a.sosource=b.sosource)
where a.series=4067
and a.cccheader=2089
and b.cccmtrlgen in (77842)

devize:
update b set b.mtrl=77731
from
findoc a
inner join mtrlines b on (a.findoc=b.findoc and a.sosource=b.sosource)
where a.series=4068
and a.prjc=38465
and b.mtrl in (77799)

update mtrl set inactive=0 where mtrl in (77799)

-------------------------CIRCUITE DUBLATE---------------------------------------
delete from ccccircuit where ccccircuit in (select aa.ccccircuit from
(
select a.deviz, a.ccctablou, a.ccccircuit, a.denumire, b.cccliniicircuit
from ccccircuit a
left join cccliniicircuit b on (a.ccccircuit=b.ccccircuit and a.cccheader=b.cccheader)
where a.prjc=38465
and a.ccctablou=2874
) aa
left join (select a.deviz fincode, a.ccctablou, a.ccccircuit, a.denumire, b.cccliniicircuit
from ccccircuit a
left join cccliniicircuit b on (a.ccccircuit=b.ccccircuit and a.cccheader=b.cccheader)
where a.prjc=38465
and a.ccctablou=2874) bb
on (aa.denumire=bb.denumire and aa.ccccircuit=bb.ccccircuit)
where aa.cccliniicircuit is null
)

--------------------ACTIVITATI DUBLATE in proiect--------------------
select (select name from prjc where prjc=CCCSUBANTRACTIVIT.prjc), prjc, subantreprenor, cccspecializare, ccccolectie, ccccapitol, cccgrupalucrari, cccactivitate, count(*) nr, pretactivitum
from CCCSUBANTRACTIVIT 
group by prjc, subantreprenor, cccspecializare, ccccolectie, ccccapitol, cccgrupalucrari, cccactivitate, pretactivitum
having count(*) > 1
order by prjc, subantreprenor, cccspecializare, ccccolectie, ccccapitol, cccgrupalucrari, cccactivitate, pretactivitum
