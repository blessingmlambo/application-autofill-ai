const fieldMap = {};

function findQuestionText(element) {
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label && label.innerText.trim()) {
      return label.innerText.trim();
    }
  }

  let current = element.parentElement;
  let depth = 0;

  while (current && depth < 8) {
    const textBlocks = Array.from(current.querySelectorAll("div, span"))
      .map(el => el.innerText.trim())
      .filter(text =>
        text.length > 0 &&
        text !== "Your answer" &&
        text !== "Short answer text" &&
        text !== "Long answer text"
      );

    const likelyQuestion = textBlocks.find(text =>
      text.endsWith("?") ||
      text.length < 120
    );

    if (likelyQuestion) {
      return likelyQuestion;
    }

    current = current.parentElement;
    depth++;
  }

  const ariaLabel = element.getAttribute("aria-label");
  if (ariaLabel && ariaLabel.trim() && ariaLabel.trim() !== "Your answer") {
    return ariaLabel.trim();
  }

  if (element.placeholder && element.placeholder.trim()) {
    return element.placeholder.trim();
  }

  return "Unlabeled field";
}

function getVisibleFormFields() {
  const fields = [];
  const elements = document.querySelectorAll('textarea, input[type="text"], input:not([type])');

  elements.forEach((element, index) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);

    const isVisible =
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== "none" &&
      style.visibility !== "hidden";

    if (!isVisible) return;

    const fieldId = `field_${index}`;
    const labelText = findQuestionText(element);

    fieldMap[fieldId] = element;

    fields.push({
      fieldId: fieldId,
      label: labelText,
      tagName: element.tagName.toLowerCase(),
      type: element.type || "",
      placeholder: element.placeholder || ""
    });
  });

  return fields;
}

function insertAnswerIntoField(fieldId, answer) {
  const element = fieldMap[fieldId];

  if (!element) {
    return { success: false, error: `Field not found for ${fieldId}` };
  }

  element.focus();
  element.value = answer;

  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
  element.blur();

  return { success: true };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "scan_form") {
    const fields = getVisibleFormFields();
    sendResponse({ fields });
  }

  if (message.action === "insert_answer") {
    const result = insertAnswerIntoField(message.fieldId, message.answer);
    sendResponse(result);
  }
});