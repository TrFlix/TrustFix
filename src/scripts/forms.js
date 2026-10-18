/**
 * Form validation helpers.
 * Each field can include an element like:
 *   <p class="field-error" id="email-error" hidden></p>
 * The helpers also create one on demand when it is missing.
 */

export const isEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(value).trim());

export const isPhone = (value) =>
  /^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(String(value).replace(/[\s-]/g, ''));

export const isStrongEnough = (value) => String(value).length >= 8;

export function fieldErrorElement(input) {
  if (!input?.id) return null;
  let element = document.getElementById(`${input.id}-error`);
  if (!element) {
    element = document.createElement('p');
    element.id = `${input.id}-error`;
    element.className = 'field-error';
    const host = input.closest('[data-field]') || input.parentElement;
    host?.append(element);
  }
  return element;
}

export function setFieldError(input, message) {
  const element = fieldErrorElement(input);
  if (!element) return;
  input.setAttribute('aria-invalid', 'true');
  input.setAttribute('aria-describedby', element.id);
  element.textContent = message;
  element.hidden = false;
}

export function clearFieldError(input) {
  const element = fieldErrorElement(input);
  input.removeAttribute('aria-invalid');
  if (element) {
    element.textContent = '';
    element.hidden = true;
  }
}

export function clearFormErrors(form) {
  form.querySelectorAll('[aria-invalid="true"]').forEach((input) => {
    input.removeAttribute('aria-invalid');
  });
  form.querySelectorAll('.field-error').forEach((element) => {
    element.textContent = '';
    element.hidden = true;
  });
  hideFormAlert(form);
}

export function showFormAlert(form, message, type = 'error') {
  const alert = form.querySelector('[data-form-alert]');
  if (!alert) return;
  alert.hidden = false;
  alert.textContent = message;
  alert.className =
    type === 'success'
      ? 'mt-4 rounded-lg border border-success-line bg-success-soft px-4 py-3 text-[13px] leading-5 text-success-ink'
      : 'mt-4 rounded-lg border border-danger-line bg-danger-soft px-4 py-3 text-[13px] leading-5 text-danger-ink';
}

export function hideFormAlert(form) {
  const alert = form.querySelector('[data-form-alert]');
  if (alert) {
    alert.hidden = true;
    alert.textContent = '';
  }
}

/**
 * Applies validation rules to a form.
 * rules: [{ input, required, label, email, phone, min, match, custom }]
 */
export function validateFields(rules) {
  let valid = true;
  let firstInvalid = null;

  for (const rule of rules) {
    const input = rule.input;
    if (!input) continue;

    clearFieldError(input);
    const value = String(input.value ?? '').trim();

    if (rule.required && !value) {
      setFieldError(input, rule.message || `${rule.label || 'This field'} is required.`);
      valid = false;
      firstInvalid ||= input;
      continue;
    }

    if (value && rule.email && !isEmail(value)) {
      setFieldError(input, 'Enter a valid email address.');
      valid = false;
      firstInvalid ||= input;
      continue;
    }

    if (value && rule.phone && !isPhone(value)) {
      setFieldError(input, 'Enter a valid 10-digit Indian mobile number.');
      valid = false;
      firstInvalid ||= input;
      continue;
    }

    if (value && rule.min && value.length < rule.min) {
      setFieldError(input, rule.message || `Use at least ${rule.min} characters.`);
      valid = false;
      firstInvalid ||= input;
      continue;
    }

    if (value && rule.match && value !== rule.match.value) {
      setFieldError(input, rule.message || 'The values do not match.');
      valid = false;
      firstInvalid ||= input;
      continue;
    }

    if (value && rule.custom) {
      const customMessage = rule.custom(value);
      if (customMessage) {
        setFieldError(input, customMessage);
        valid = false;
        firstInvalid ||= input;
      }
    }
  }

  if (firstInvalid) {
    firstInvalid.focus();
    firstInvalid.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  return valid;
}

export function formValues(form) {
  return Object.fromEntries(new FormData(form).entries());
}
