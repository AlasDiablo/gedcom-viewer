import { Individual } from './type.ts';

import { SelectionGedcom } from 'read-gedcom';

import type { RawNodeDatum } from 'react-d3-tree';
import type { SelectionFamilyRecord, SelectionIndividualRecord } from 'read-gedcom';

type Attributes = Record<'sex' | 'birth' | 'death' | string, string | number | boolean>;

const getAttributes = (individual: SelectionIndividualRecord) => {
    const attributes: Attributes = {};

    const sex = individual.getSex().value()[0];
    if (sex) {
        attributes.sex = sex;
    }

    const birth = individual.getEventBirth().value()[0];
    if (birth) {
        attributes.birth = birth;
    }

    return attributes;
};

const createParentTree = (
    source: SelectionIndividualRecord,
    family: SelectionFamilyRecord,
    depth = 10,
): RawNodeDatum | undefined => {
    if (depth <= 0) {
        return undefined;
    }

    const attributes = getAttributes(source);

    const mother = family.getWife().getIndividualRecord();
    const father = family.getHusband().getIndividualRecord();

    const motherTree = createParentTree(mother, mother.getFamilyAsChild(), depth - 1);
    const fatherTree = createParentTree(father, father.getFamilyAsChild(), depth - 1);

    const parents = [];

    if (motherTree) {
        parents.push(motherTree);
    }

    if (fatherTree) {
        parents.push(fatherTree);
    }

    return {
        name: source.getName().valueNonNull()[0],
        attributes,
        children: parents,
    };
};

export const createTree = (
    gedcom: SelectionGedcom,
    source: Individual & { firstLetter: string },
): RawNodeDatum => {
    const sourceRecord = gedcom.getIndividualRecord(source.pointer);
    return createParentTree(sourceRecord, sourceRecord.getFamilyAsChild()) as RawNodeDatum;
};
