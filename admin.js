const form = document.querySelector('#export-form');
const keyInput = document.querySelector('#admin-key');
const exportButton = document.querySelector('#export-button');
const status = document.querySelector('#admin-status');

function setStatus(message, state = 'info') {
  status.hidden = false;
  status.dataset.state = state;
  status.textContent = message;
}

function filenameFrom(response) {
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^";]+)"?/i);
  return match?.[1] || 'primary-research-responses.csv';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const key = keyInput.value.trim();
  if (!key) {
    keyInput.focus();
    return;
  }

  exportButton.disabled = true;
  exportButton.innerHTML = 'Preparing download… <span aria-hidden="true">↗</span>';
  setStatus('Checking the private response log…');

  try {
    const response = await fetch('/api/admin-export', {
      headers: { 'X-Admin-Key': key },
    });
    if (!response.ok) {
      if (response.status === 404) throw new Error('That admin key was not recognised.');
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || 'The export could not be generated.');
    }

    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filenameFrom(response);
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);
    setStatus('Download ready. You can open the CSV in Excel.', 'success');
  } catch (error) {
    setStatus(error.message || 'The export could not be generated. Please try again.', 'error');
  } finally {
    exportButton.disabled = false;
    exportButton.innerHTML = 'Download CSV <span aria-hidden="true">↗</span>';
  }
});
