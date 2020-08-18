/**
 * @jest-environment node
 */

const explain = require("../src/index");

const INPUT1 = {
    "DRUGBANK": "DB00619",
    "CHEBI": "CHEBI:45783",
    "UMLS": "C0935989",
    "MESH": "D000068877",
    "name": "imatinib",
    "primary": {
        "identifier": "CHEBI",
        "cls": "ChemicalSubstance",
        "value": "CHEBI:45783"
    },
    "display": "CHEBI(CHEBI:45783) DRUGBANK(DB00619) name(imatinib)",
    "type": "ChemicalSubstance"
}

const INPUT2 = {
    "CHEBI": "CHEBI:8863",
    "name": "Riluzole",
    "primary": {
        "identifier": "CHEBI",
        "cls": "ChemicalSubstance",
        "value": "CHEBI:8863"
    },
    "display": "CHEBI(CHEBI:8863) name(Riluzole)",
    "type": "ChemicalSubstance"
}

const OUTPUT1 = {
    "MONDO": "MONDO:0011996",
    "DOID": "DOID:8552",
    "UMLS": "C0023473",
    "name": "chronic myelogenous leukemia, BCR-ABL1 positive",
    "OMIM": "608232",
    "ORPHANET": "521",
    "primary": {
        "identifier": "MONDO",
        "cls": "Disease",
        "value": "MONDO:0011996"
    },
    "display": "MONDO(MONDO:0011996) DOID(DOID:8552) OMIM(608232) ORPHANET(521) UMLS(C0023473) name(chronic myelogenous leukemia, BCR-ABL1 positive)",
    "type": "Disease"
}

describe("test main explain function", () => {

    let query;

    beforeEach(() => {
        query = new explain();
    })

    test("test find edges if input is empty array", () => {
        let res = query.findEdges([], [OUTPUT1], ['Gene'])
        expect(res).toBeNull();
    });

    test("test find edges if input is not an array", () => {
        let res = query.findEdges(INPUT1, [OUTPUT1], ['Gene'])
        expect(res).toBeNull();
    });

    test("test find edges if output is empty array", () => {
        let res = query.findEdges([INPUT1], [], ['Gene'])
        expect(res).toBeNull();
    });

    test("test find edges if output is not an array", () => {
        let res = query.findEdges([INPUT1], OUTPUT1, ['Gene'])
        expect(res).toBeNull();
    });

    test("test find edges with valid input and output", () => {
        let res = query.findEdges([INPUT1], [OUTPUT1], ['Gene']);
        expect(res).toHaveProperty('left');
        expect(res.left).toHaveProperty('0');
        expect(res.left).not.toHaveProperty('1');
        expect(res).toHaveProperty('right');
        res = query.findEdges([INPUT1, INPUT2], [OUTPUT1], ['Gene']);
        expect(res.left).toHaveProperty('1');
    });

    test("test annotateEdgesWithInputIDs function", () => {
        const edges = [
            {
                association: {
                    input_id: 'CHEBI'
                }
            },
            {
                association: {
                    input_id: 'UMLS'
                }
            },
            {
                association: {
                    input_id: 'KK'
                }
            }
        ]
        let res = query.annotateEdgesWithInputID(edges, INPUT1, 'left');
        expect(res[0]).toHaveProperty('input', ['CHEBI:45783']);
        expect(res[0]).toHaveProperty('original_input');
        expect(res[0].original_input).toHaveProperty('CHEBI:45783');
        expect(res[1]).toHaveProperty('input', ['C0935989']);
        expect(res[1]).toHaveProperty('original_input');
        expect(res[1].original_input).toHaveProperty('UMLS:C0935989');
        expect(res).toHaveLength(2);
    })

})