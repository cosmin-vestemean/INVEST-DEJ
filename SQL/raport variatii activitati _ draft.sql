SELECT cccspecializare
	,ccccolectie
	,ccccapitol
	,cccgrupalucrari
	,cccactivitate
	,qtyDev
	,qtyFL
	,isnull(qtyFL - qtyDev, 0) variatie
	,qtyDoc
	,findoc
	,fincode
	,trndate
	,sodtype
FROM (
	SELECT (
			SELECT isnull(sum(isnull(ld.qty1, 0)), 0)
			FROM mtrlines ld
			INNER JOIN findoc fd ON (
					ld.company = fd.company
					AND ld.sosource = fd.sosource
					AND ld.findoc = fd.findoc
					)
			WHERE fd.sosource = 1351
				AND fd.series = 4068
				AND ld.mtrl = lv.mtrl
				AND ld.cccspecializare = lv.cccspecializare
				AND ld.ccccolectie = lv.ccccolectie
				AND ld.ccccapitol = lv.ccccapitol
				AND ld.cccgrupalucrari = lv.cccgrupalucrari
				AND ld.cccactivitate = lv.cccactivitate
			GROUP BY ld.mtrl
				,ld.cccspecializare
				,ld.ccccolectie
				,ld.ccccapitol
				,ld.cccgrupalucrari
				,ld.cccactivitate
			) qtyDev
		,(
			SELECT isnull(sum(isnull(ld.qty1, 0)), 0)
			FROM mtrlines ld
			INNER JOIN findoc fd ON (
					ld.company = fd.company
					AND ld.sosource = fd.sosource
					AND ld.findoc = fd.findoc
					)
			WHERE fd.sosource = 1351
				AND fd.series = 4067
				AND ld.mtrl = lv.mtrl
				AND ld.cccspecializare = lv.cccspecializare
				AND ld.ccccolectie = lv.ccccolectie
				AND ld.ccccapitol = lv.ccccapitol
				AND ld.cccgrupalucrari = lv.cccgrupalucrari
				AND ld.cccactivitate = lv.cccactivitate
			GROUP BY ld.mtrl
				,ld.cccspecializare
				,ld.ccccolectie
				,ld.ccccapitol
				,ld.cccgrupalucrari
				,ld.cccactivitate
			) qtyFL
		,lv.mtrl
		,fv.findoc
		,fv.fincode
		,fv.trndate
		,sum(lv.qty1) qtyDoc
		,lv.cccspecializare
		,lv.ccccolectie
		,lv.ccccapitol
		,lv.cccgrupalucrari
		,lv.cccactivitate
		,m.sodtype
	FROM mtrlines lv
	INNER JOIN findoc fv ON (
			lv.company = fv.company
			AND lv.sosource = fv.sosource
			AND lv.findoc = fv.findoc
			)
	INNER JOIN mtrl m ON (m.mtrl = lv.mtrl)
	WHERE fv.sosource = 1351
		AND fv.series IN (
			4074
			,4078
			,4076
			,4077
			)
		AND fv.iscancel = 0
		AND fv.prjc = 39538
		AND m.sodtype = 52
	--and lv.mtrl=25987
	GROUP BY lv.mtrl
		,m.name
		,fv.findoc
		,fv.fincode
		,fv.trndate
		,lv.cccspecializare
		,lv.ccccolectie
		,lv.ccccapitol
		,lv.cccgrupalucrari
		,lv.cccactivitate
		,m.sodtype
	) tblo
ORDER BY sodtype
	,cccspecializare
	,ccccolectie
	,ccccapitol
	,cccgrupalucrari
	,cccactivitate
	,trndate
