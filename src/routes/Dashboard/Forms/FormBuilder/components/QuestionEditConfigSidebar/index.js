import React from 'react';
import {
  ShortTextFieldBasicTab,
  ShortTextFieldAdvancedTab
} from './ShortTextField';
import {
  EmailFieldBasicTab,
  EmailFieldAdvancedTab
} from './EmailField';
import {
  NumberFieldBasicTab,
  NumberFieldAdvancedTab
} from './NumberField';
import {
  PhoneNumberFieldBasicTab,
  PhoneNumberFieldAdvancedTab
} from './PhoneNumberField';

export const getQuestionTypeConfigComponent = function (questionTypeName, tabName = 'general', componentProps) {
  var ConfigComponent;
  switch (questionTypeName) {
    case 'ShortTextField':
      if (tabName === 'general') {
        ConfigComponent = ShortTextFieldBasicTab;
      } else {
        ConfigComponent = ShortTextFieldAdvancedTab;
      }
      break;
    case 'EmailField':
      if (tabName === 'general') {
        ConfigComponent = EmailFieldBasicTab;
      } else {
        ConfigComponent = EmailFieldAdvancedTab;
      }
      break;
    case 'LongTextField':
    case 'StatementField':
    case 'NumberField':
      if (tabName === 'general') {
        ConfigComponent = NumberFieldBasicTab;
      } else {
        ConfigComponent = NumberFieldAdvancedTab;
      }
      break;
    case 'PhoneNumberField':
      if (tabName === 'general') {
        ConfigComponent = PhoneNumberFieldBasicTab;
      } else {
        ConfigComponent = PhoneNumberFieldAdvancedTab;
      }
      break;
    case 'DropdownField':
    case 'MultipleChoiceField':
    case 'YesNoChoiceField':
    case 'DateField':
    case 'AddressField':
    case 'SignatureField':
      break;
  }
  return <ConfigComponent {...componentProps} />;
};
