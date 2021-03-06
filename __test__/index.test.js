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

const INPUT3 = {
    "CHEMBL.COMPOUND": "CHEMBL1421",
    "DRUGBANK": "DB01254",
    "PUBCHEM": 3062316,
    "CHEBI": "CHEBI:49375",
    "UMLS": "C1455147",
    "MESH": "D000069439",
    "UNII": "RBZ1571X5H",
    "name": "DASATINIB",
    "primary": {
        "identifier": "CHEBI",
        "cls": "ChemicalSubstance",
        "value": "CHEBI:49375"
    },
    "display": "CHEBI(CHEBI:49375) CHEMBL.COMPOUND(CHEMBL1421) DRUGBANK(DB01254) PUBCHEM(3062316) MESH(D000069439) UNII(RBZ1571X5H) UMLS(C1455147) name(DASATINIB)",
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

    test("test groupResultByDirectionAndOutput function", () => {
        const res = [
            {
                $input: "UMLS:C0935989",
                $original_input: {
                    "UMLS:C0935989": {
                        obj: 1,
                        source: "left"
                    }
                },
                $output: "LKK:123"
            },
            {
                $input: "CHEBI:901",
                $original_input: {
                    "CHEBI:901": {
                        obj: 1,
                        source: "right"
                    }
                },
                $output: "LKK:999"
            },
            {
                $input: "CHEBI:901",
                $original_input: {
                    "CHEBI:901": {
                        obj: 1,
                        source: "right"
                    }
                },
                $output: "LKK:999"
            },
            {
                $input: "UMLS:C0935989",
                $original_input: {
                    "UMLS:C0935989": {
                        obj: 1,
                        source: "left"
                    }
                },
                $output: "LKK:999"
            },
        ]
        let result = query.groupResultByDirectionAndOutput(res);
        expect(result).toHaveProperty('left');
        expect(Object.keys(result.left)).toHaveLength(2);
        expect(result.right["LKK:999"]).toHaveLength(2);
    })

    test("test findIntersection function", () => {
        let res = {
            left: {
                'mls': 1,
                'kkk': 2
            },
            right: {
                'mls': 4,
                'jj': 2
            }
        }
        let result = query.findIntersections(res);
        expect(result).toHaveLength(1);
        expect(result[0]).toBe("mls");
        let res1 = {
            left: {
                'mls': 1,
                'kkk': 2
            },
            right: {
                'ms': 4,
                'jj': 2
            }
        }
        result = query.findIntersections(res1);
        expect(result).toHaveLength(0);
        let res2 = {
            left: {
                'mls': 1,
                'kkk': 2
            },
            right: {
            }
        }
        result = query.findIntersections(res2);
        expect(result).toHaveLength(0);
    })

    test("test explain main function using single input and output", async () => {
        let res = await query.query([INPUT1], [OUTPUT1], ['Gene']);
        expect(res).toHaveProperty("log");
        expect(res).toHaveProperty("data");
        expect(res.data).toHaveProperty("result");
        expect(res.data).toHaveProperty("resolved_ids")
    });

    test("test explain main function using multiple input and output", async () => {
        let res = await query.query([INPUT1, INPUT3], [OUTPUT1], ['Gene']);
        expect(res).toHaveProperty("log");
        expect(res).toHaveProperty("data");
        expect(res.data).toHaveProperty("result");
        expect(res.data).toHaveProperty("resolved_ids");
        expect(res.data.result.filter(item => item.input_label === "DASATINIB").length).toBeGreaterThan(0)
    })

    test("test explain main function if no connection found", async () => {
        let res = await query.query([INPUT2], [OUTPUT1], ['Gene']);
        expect(res).toHaveProperty("log");
        expect(res).toHaveProperty("data");
        expect(res.data).toHaveProperty("result");
        expect(res.data).toHaveProperty("resolved_ids");
        expect(res.data.result).toHaveLength(0);
    })

    test("test explain main function if no connection found reverse", async () => {
        let res = await query.query([OUTPUT1], [INPUT2], ['Gene']);
        expect(res).toHaveProperty("log");
        expect(res).toHaveProperty("data");
        expect(res.data).toHaveProperty("result");
        expect(res.data).toHaveProperty("resolved_ids");
        expect(res.data.result).toHaveLength(0);
    })

    test("test explain main function if no edges found", async () => {
        let res = await query.query([OUTPUT1], [INPUT2], ['Gene1']);
        expect(res).toHaveProperty("log");
        expect(res).toHaveProperty("data");
        expect(res.data).toHaveProperty("result");
        expect(res.data).toHaveProperty("resolved_ids");
        expect(res.data.result).toHaveLength(0);
    })
})