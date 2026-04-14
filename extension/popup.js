document.addEventListener("DOMContentLoaded", () => {
  const scanBtn = document.getElementById("scanBtn");
  const insertAllBtn = document.getElementById("insertAllBtn");
  const resultsDiv = document.getElementById("results");
  const statusDiv = document.getElementById("status");

  let currentAnswers = [];
  let currentTabId = null;

  scanBtn.addEventListener("click", async () => {
    statusDiv.textContent = "Scanning page...";
    resultsDiv.innerHTML = `
      <div class="empty-state">
        Scanning the current page for visible fields...
      </div>
    `;
    insertAllBtn.style.display = "none";
    currentAnswers = [];

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTabId = tab.id;

    chrome.tabs.sendMessage(tab.id, { action: "scan_form" }, async (response) => {
      if (chrome.runtime.lastError) {
        statusDiv.textContent = "Scan failed.";
        resultsDiv.innerHTML = `
          <div class="empty-state">
            Error: ${chrome.runtime.lastError.message}
          </div>
        `;
        return;
      }

      const fields = response?.fields || [];

      if (fields.length === 0) {
        statusDiv.textContent = "No fields found.";
        resultsDiv.innerHTML = `
          <div class="empty-state">
            No visible text fields were found on this page.
          </div>
        `;
        return;
      }

      statusDiv.textContent = "Generating answers...";
      resultsDiv.innerHTML = `
        <div class="empty-state">
          Generating suggested answers for detected fields...
        </div>
      `;

      try {
        const apiResponse = await fetch("http://127.0.0.1:5000/generate-answers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ fields })
        });

        const data = await apiResponse.json();
        const answers = data.answers || [];
        currentAnswers = answers;

        if (answers.length === 0) {
          statusDiv.textContent = "No answers generated.";
          resultsDiv.innerHTML = `
            <div class="empty-state">
              No answers were generated.
            </div>
          `;
          return;
        }

        insertAllBtn.style.display = "block";
        statusDiv.textContent = `Generated ${answers.length} answer${answers.length === 1 ? "" : "s"}.`;
        renderAnswers(answers, tab.id);
      } catch (error) {
        statusDiv.textContent = "Backend error.";
        resultsDiv.innerHTML = `
          <div class="empty-state">
            Error calling backend: ${error.message}
          </div>
        `;
      }
    });
  });

  insertAllBtn.addEventListener("click", async () => {
    if (!currentTabId || currentAnswers.length === 0) {
      alert("No generated answers available yet. Click Scan Form first.");
      return;
    }

    let insertedCount = 0;

    for (const item of currentAnswers) {
      await new Promise((resolve) => {
        chrome.tabs.sendMessage(
          currentTabId,
          {
            action: "insert_answer",
            fieldId: item.fieldId,
            answer: item.answer
          },
          (response) => {
            if (response?.success) {
              insertedCount++;
            }
            resolve();
          }
        );
      });
    }

    statusDiv.textContent = `Inserted ${insertedCount} answer${insertedCount === 1 ? "" : "s"}.`;
    alert(`Inserted ${insertedCount} answers.`);
  });

  function renderAnswers(answers, tabId) {
    resultsDiv.innerHTML = answers
      .map(
        (item) => `
          <div class="field-item">
            <div class="field-label">${item.question}</div>
            <div class="field-answer">${item.answer}</div>
            <button 
              class="insert-btn" 
              data-field-id="${item.fieldId}" 
              data-answer="${encodeURIComponent(item.answer)}"
            >
              Insert This
            </button>
          </div>
        `
      )
      .join("");

    const insertButtons = document.querySelectorAll(".insert-btn");

    insertButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const fieldId = button.getAttribute("data-field-id");
        const answer = decodeURIComponent(button.getAttribute("data-answer"));

        chrome.tabs.sendMessage(
          tabId,
          {
            action: "insert_answer",
            fieldId: fieldId,
            answer: answer
          },
          (insertResponse) => {
            if (chrome.runtime.lastError) {
              alert(`Insert error: ${chrome.runtime.lastError.message}`);
              return;
            }

            if (insertResponse?.success) {
              button.textContent = "Inserted";
              button.disabled = true;
              statusDiv.textContent = "Inserted 1 answer.";
            } else {
              alert(insertResponse?.error || "Failed to insert answer.");
            }
          }
        );
      });
    });
  }
});