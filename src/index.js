const kg = require("@biothings-explorer/smartapi-kg");
const resolver = require("biomedical_id_resolver");
const call_apis = require("@biothings-explorer/call-apis");
const config = require("./config");

/**
 * Perform Explain Type of Queries for BioThings Explorer
 */
module.exports = class {
    /**
     * Load Meta-KG containing BioThings APIs only.
     */
    constructor() {
        this.meta_kg = new kg();
        this.meta_kg.constructMetaKGSync("biothings");
        this.logs = [];
    }

    /**
     * Query for common nodes connecting input and output
     * @param {object} input - The input biomedical concept
     * @param {object} output - The output biomedical concpet
     * @param {array|undefined} intermediate - intermediate semantic types connecting input and output; if undefined, refer to all semantic types
     */
    async query(input, output, intermediate = undefined) {
        let edges = this.findEdges(input, output, intermediate);
        if (edges === null) {
            return null;
        }
        let left_annotated_edges = this.annotateEdgesWithInputID(edges.left, input, 'left');
        if (left_annotated_edges.length === 0) {
            return null;
        }
        let right_annotated_edges = this.annotateEdgesWithInputID(edges.right, output, 'right');
        if (right_annotated_edges.length === 0) {
            return null;
        }
        let annotated_edges = [...left_annotated_edges, ...right_annotated_edges];
        let caller = new call_apis(annotated_edges);
        await caller.query();
        let grped_res = this.groupResultByDirectionAndOutput(caller.result);
        let intersect = this.findIntersections(grped_res);
        return {
            data: this.output(grped_res, intersect),
            log: this.logs
        };
    }

    /**
     * Find edges connecting input-intermediate and edges connecting output-intermediate
     * @param {object} input - The input biomedical concept
     * @param {object} output - The output biomedical concpet
     * @param {array|undefined} intermediate - intermediate semantic types connecting input and output; if undefined, refer to all semantic types
     */
    findEdges(input, output, intermediate) {
        let left_edges = this.meta_kg.filter(
            {
                input_type: input.type,
                output_type: intermediate
            }
        )
        if (!(Array.isArray(left_edges)) || left_edges.length === 0) {
            return null;
        }

        let right_edges = this.meta_kg.filter(
            {
                input_type: output.type,
                output_type: intermediate
            }
        )
        if (!(Array.isArray(right_edges)) || right_edges.length === 0) {
            return null;
        }
        return {
            left: left_edges,
            right: right_edges
        }
    }

    /**
     * Add Appropriate Input ID to the edges based on edge input id
     * @param {array} edges - array of bte edges from smartapi-kg query
     * @param {object} obj - a resolved obj from biomedical_id_autocomplete
     * @param {string} source - left (input) or right (output)
     */
    annotateEdgesWithInputID(edges, obj, source) {
        let res = [];
        edges.map(edge => {
            if (edge.association.input_id in obj) {
                edge.input = [obj[edge.association.input_id]];
                if (!(config.ID_WITH_PREFIXES.includes(edge.association.input_id))) {
                    edge["original_input"] = {
                        [edge.association.input_id + ':' + edge.input]: {
                            source,
                            obj
                        }
                    }
                } else {
                    edge["original_input"] = {
                        [edge.input]: {
                            source,
                            obj
                        }
                    }
                }
                res.push(edge);
            }
        });
        return res;
    }

    groupResultByDirectionAndOutput(res) {
        let grp_res = { left: {}, right: {} };
        res.map(item => {
            let direction = item.$original_input[item.$input].source;
            if (!(item.$output in grp_res[direction])) {
                grp_res[direction][item.$output] = [];
            }
            grp_res[direction][item.$output].push(item);
        });
        return grp_res;
    }

    /**
     * Find intersection between left query and right query
     * @param {object} res - grouped response
     */
    findIntersections(res) {
        let left = new Set(Object.keys(res.left));
        let right = new Set(Object.keys(res.right));
        let intersect = new Set([...left].filter(i => right.has(i)));
        return Array.from(intersect);
    }

    output(res, intersect) {
        let result = [];
        let resolved_ids = {};
        intersect.map(id => {
            res.left[id].map(left_res => {
                res.right[id].map(right_res => {
                    let input_name, output_name;
                    if ("symbol" in left_res.$original_input[left_res.$input].obj) {
                        input_name = left_res.$original_input[left_res.$input].obj.symbol;
                    } else if ("name" in left_res.$original_input[left_res.$input].obj) {
                        input_name = left_res.$original_input[left_res.$input].obj.name;
                    } else {
                        input_name = left_res.$original_input[left_res.$input].obj.primary.value;
                    }
                    if ("symbol" in right_res.$original_input[right_res.$input].obj) {
                        output_name = right_res.$original_input[right_res.$input].obj.symbol;
                    } else if ("name" in right_res.$original_input[right_res.$input].obj) {
                        output_name = right_res.$original_input[right_res.$input].obj.name;
                    } else {
                        output_name = right_res.$original_input[right_res.$input].obj.primary.value;
                    }
                    let tmp = {
                        input_id: left_res.$original_input[left_res.$input].obj.primary.value,
                        input_name: input_name,
                        pred1: left_res.$association.predicate,
                        pred1_api: left_res.$association.api_name,
                        pred1_publications: left_res.publications,
                        node1_id: left_res.$output_id_mapping.resolved.id.identifier,
                        node1_label: left_res.$output_id_mapping.resolved.id.label,
                        node1_type: left_res.$association.output_type,
                        pred2: right_res.$association.predicate,
                        pred2_api: right_res.$association.api_name,
                        pred2_publications: right_res.publications,
                        output_id: right_res.$original_input[right_res.$input].obj.primary.value,
                        output_label: output_name
                    };
                    resolved_ids[left_res.$original_input[left_res.$input].obj.primary.value] = left_res.$original_input[left_res.$input].obj;
                    resolved_ids[right_res.$original_input[right_res.$input].obj.primary.value] = right_res.$original_input[right_res.$input].obj;
                    result.push(tmp);
                })
            })
        })
        return { result, resolved_ids };
    }

}