[![Build Status](https://travis-ci.com/kevinxin90/explain.js.svg?branch=master)](https://travis-ci.com/kevinxin90/explain.js)

[![Coverage Status](https://coveralls.io/repos/github/kevinxin90/explain.js/badge.svg?branch=master)](https://coveralls.io/github/kevinxin90/explain.js?branch=master)

<a href="https://github.com/kevinxin90/explain.js#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
<a href="https://www.npmjs.com/package/@biothings-explorer/explain" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/@biothings-explorer/explain.svg">
  </a>

# Welcome to @biothings-explorer/explain 👋

A nodejs module to explain how two or more biomedical concepts are connected through shared intermediate nodes.

### 🏠 [Homepage](https://github.com/kevinxin90/explain.js)

## Install

```sh
npm i @biothings-explorer/explain
```

## Usage

- Import and Initialize

    ```javascript
    const explain = require("@biothings-explorer/explain")

    // a BTE representation of drug imatinib from biomedical_id_autocomplete nodejs package
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

    // a BTE representation of drug dasatinib from biomedical_id_autocomplete nodejs package
    const INPUT2 = {
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

    // a BTE representation of disease CML from biomedical_id_autocomplete nodejs package
    const OUTPUT = {
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

    ```

- Explain the connections between the inputs and outputs

    ```javascript
    const ep = new explain();
    //find genes which connect both [Imatinib or DASATINIB] and CML Disease
    let res = await ep.query([INPUT1, INPUT2], [OUTPUT], ['Gene']);

    ```

## Run tests

```sh
npm run test
```

## Author

👤 **Jiwen Xin**

* Website: http://github.com/kevinxin90
* Github: [@kevinxin90](https://github.com/kevinxin90)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/kevinxin90/explain.js/issues).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2020 [Jiwen Xin](https://github.com/kevinxin90).<br />
This project is [ISC](https://github.com/kevinxin90/explain.js/blob/master/LICENSE) licensed.