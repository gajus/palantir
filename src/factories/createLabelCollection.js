// @flow

import localeCompareProperty from '../utilities/localeCompareProperty';
import type {
  LabelCollectionType,
  LabelsType
} from '../types';

export default (labels: LabelsType): LabelCollectionType => {
  return Object
    .keys(labels)
    .sort((a, b) => {
      return localeCompareProperty(a, b);
    })
    .map((label) => {
      return {
        name: label,
        value: labels[label]
      };
    });
};
