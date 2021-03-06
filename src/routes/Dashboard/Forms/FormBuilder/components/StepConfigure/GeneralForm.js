import React, {
  Component,
  PropTypes
} from 'react';
import { reduxForm, Field } from 'redux-form';
import { formSchemaGeneral } from './schema';
import TextInput from 'components/TextInput';
import QuestionRichTextEditor from 'components/QuestionEditFields/QuestionRichTextEditor';
import Switch from 'rc-switch';
import Button from 'components/Buttons/DashboardButtons/Button';
import { FaCheck } from 'react-icons/lib/fa';
import styles from './Form.scss';
import classNames from 'classnames';
import { getQuestionsByType, mapQuestionsToDropdown } from 'helpers/formBuilderHelper';

const renderTextInput = field => (
  <div className={classNames([styles.builderItem])}>
    <TextInput {...field.input} type={field.type} label={field.label} labelStyle="major"
      autoFocus={field.autoFocus} prefix={field.prefix} helpText={field.helpText}
      hasError={field.meta.touched && field.meta.error} />
    {field.meta.touched && field.meta.error &&
      <div className={styles.error}>{field.meta.error}</div>
    }
  </div>
);

const renderRTE = field => (
  <div className={classNames([styles.builderItem])}>
    <QuestionRichTextEditor {...field.input} answersPullRight
      title={field.title} labelStyle="major"
      filteredQuestions={field.filteredQuestions} setValue={field.input.onChange} />
    {field.meta.touched && field.meta.error &&
      <div className={styles.error}>{field.meta.error}</div>
    }
  </div>
);

const renderSwitch = field => (
  <div className={classNames([styles.builderItem], [styles.builderSwitch])}>
    <Switch {...field.input} checkedChildren={<FaCheck />} checked={field.input.value} />
    <label>{field.label}</label>
    <span className={styles.help}>{field.helpText}</span>
  </div>
);

const sanitizedSlug = value => value && value.replace(/[ ]/g, '_').replace(/([^a-z0-9_-]+)/gi, '');

class GeneralForm extends Component {

  static propTypes = {
    subdomain: PropTypes.string,
    questions: PropTypes.array,
    handleSubmit: PropTypes.func,
    submitFailed: PropTypes.bool,
    submitSucceeded: PropTypes.bool,
    submitting: PropTypes.bool
  }

  render() {
    const { questions } = this.props;
    const filteredQuestions = mapQuestionsToDropdown(getQuestionsByType(questions, 'Group', false));
    return (
      <form>
        <Field name="title" component={renderTextInput} label="Your form name" />
        <div className={styles.builderDivider} />
        <Field name="slug" component={renderTextInput} label="Hosted form URL"
          prefix={'https://' + this.props.subdomain + '/'}
          helpText="Unsupported characters will automatically be converted"
          normalize={sanitizedSlug} />
        <div className={styles.builderDivider} />
        <Field name="formConfig.redirect" component={renderTextInput} label="Redirect after submitting" />
        <div className={styles.builderDivider} />
        <Field name="formConfig.customise.footer" component={renderRTE}
          title="Form footer"
          filteredQuestions={filteredQuestions} />
        <div className={styles.builderDivider} />
        <Field name="formConfig.customise.emondoBranding" component={renderSwitch}
          label="Emondo branding" helpText="Only premium accounts are eligable to turn this off." />
        <div className={styles.builderDivider} />
        <p className={styles.formSubmit}>
          <Button style="formButton" onClick={this.props.handleSubmit}>Save &amp; Continue</Button>
        </p>
      </form>
    );
  }
}

export default reduxForm({
  form: 'builderConfigureGeneral',
  validate: formSchemaGeneral.validate
})(GeneralForm);
