class ExcelGenerator {
    async exportStats(type, data) {
        const workbook = await XlsxPopulate.fromBlankAsync();
        // Modify the workbook.
        const sheet = workbook.addSheet('Overall stats');
        this.statsToSheet(sheet, data);

        for (const i in data.rounds) {
            const round = data.rounds[i];

            let sheetName = `Round ${i} stats`;
            if (i % 4 == 0) {
                sheetName += ' (AIR)';
            }

            const roundSheet = workbook.addSheet(sheetName);
            this.statsToSheet(roundSheet, round, i);
        }

        // Delete default sheet
        workbook.deleteSheet('Sheet1');

        const blob = await workbook.outputAsync();

        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            // If IE, you must uses a different method.
            window.navigator.msSaveOrOpenBlob(blob, `Battle${SERVER_DATA.battleId}_stats.xlsx`);
        } else {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            document.body.appendChild(a);
            a.href = url;
            a.download = `Battle${SERVER_DATA.battleId}_stats.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
    }

    statsToSheet(battleEye, sheet, stats, round) {
        var headingStyle = {
            fontSize: 20,
            verticalAlignment: 'center',
            horizontalAlignment: 'center'
        };

        sheet.range('A1:C1').merged(true).value(battleEye.teamAName).style(headingStyle).style({ fontColor: '27ad60', bold: true });
        sheet.range('I1:K1').merged(true).value(battleEye.teamBName).style(headingStyle).style({ fontColor: 'c1392b', bold: true });

        if (round % 4 != 0) {
            sheet.range('E1:G1').merged(true).value('Divisions').style(headingStyle).style({ fontColor: '27ad60', bold: true });
            sheet.range('M1:O1').merged(true).value('Divisions').style(headingStyle).style({ fontColor: 'c1392b', bold: true });
        }

        function setOverallStats(s, side, left = true) {
            const titleRange = left ? 'A3:C3' : 'I3:K3';
            const valueRange = left ? 'A4:C4' : 'I4:K4';

            s.range(titleRange).value([
                ['Total damage', 'Total kills', 'Average damage']
            ]).style({ bold: true, horizontalAlignment: 'center', fontColor: 'f7ad6f' });

            s.range(valueRange).value([
                [side.damage, side.hits, side.avgHit]
            ]).style({ horizontalAlignment: 'center' });
        }

        setOverallStats(sheet, stats.left);
        setOverallStats(sheet, stats.right, false);

        sheet.range('B6:C6').value([['Damage', 'Kills']]).style({ horizontalAlignment: 'center', fontColor: '68b5fc', bold: true });
        sheet.range('J6:K6').value([['Damage', 'Kills']]).style({ horizontalAlignment: 'center', fontColor: '68b5fc', bold: true });

        function setCountryStats(s, side, left = true, air = false) {
            function range(row) {
                if (air) {
                    return left ? `A${row}:C${row}` : `E${row}:G${row}`;
                }

                return left ? `A${row}:C${row}` : `I${row}:K${row}`;
            }

            function cell(a, b, i) {
                return left ? a + i : b + i;
            }

            var row = 7;
            for (const i in side.countries) {
                const country = side.countries[i];

                s.range(range(row)).value([[country.name, country.damage, country.kills]]);

                if (air) {
                    s.cell(cell('A', 'E', row)).style({ bold: true });
                } else {
                    s.cell(cell('A', 'I', row)).style({ bold: true });
                }

                row++;
            }
        }

        function setDivisionStats(s, side, left = true) {
            function range(row) {
                return left ? `E${row}:G${row}` : `M${row}:O${row}`;
            }

            function cell(a, b, i) {
                return left ? a + i : b + i;
            }

            let row = 3;
            for (const i in side.divisions) {
                if (i == 'div11') continue;
                const div = side.divisions[i];

                s.range(range(row)).merged(true).value(i.toUpperCase()).style({ verticalAlignment: 'center', horizontalAlignment: 'center', bold: true });
                row += 2;
                s.range(range(row)).value([['Total damage', 'Total kills', 'Average damage']]).style({ horizontalAlignment: 'center', bold: true, fontColor: 'f7ad6f' });
                row += 1;
                s.range(range(row)).value([[div.damage, div.hits, div.avgHit]]).style({ horizontalAlignment: 'center' });
                row += 2;

                s.range(range(row)).value([['', 'Damage', 'Kills']]).style({ horizontalAlignment: 'center', fontColor: '68b5fc', bold: true });
                row += 1;

                for (var j in div.countries) {
                    var country = div.countries[j];

                    s.range(range(row)).value([[country.name, country.damage, country.kills]]);
                    s.cell(cell('E', 'M', row)).style({ bold: true });
                    row += 1;
                }
                row += 2;
            }
        }

        setCountryStats(sheet, stats.left, true);
        setCountryStats(sheet, stats.right, false);

        if (round % 4 != 0) {
            setDivisionStats(sheet, stats.left);
            setDivisionStats(sheet, stats.right, false);
        }

        sheet.row(1).height(30);

        for (var i = 1; i <= 16; i++) {
            sheet.column(i).width(20);
        }

        // if air battle
        if (round % 4 == 0) {
            const collapse = [5, 6, 7, 8, 13, 14, 16];
            collapse.forEach(() => {
                sheet.column(collapse[i]).width(1);
            });
        }
    }
}

export default new ExcelGenerator();
