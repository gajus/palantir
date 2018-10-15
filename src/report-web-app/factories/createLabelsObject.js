// @flow

import type {
  LabelCollectionType,
  LabelsType
} from '../types';

export default (labelCollection: LabelCollectionType): LabelsType => {
  // eslint-disable-next-line flowtype/no-weak-types
  const labels: Object = {};

  for (const label of labelCollection) {
    labels[label.name] = label.value;
  }

  return labels;
};
