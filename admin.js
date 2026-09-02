const form = document.querySelector('#export-form');
const keyInput = document.querySelector('#admin-key');
const exportButtons = [...form.querySelectorAll('button[data-format]')];
const status = document.querySelector('#admin-status');

function setStatus(message, state = 'info') {
  status.hidden = false;
  status.dataset.state = state;
  status.textContent = message;
}

function filenameFrom(response, format) {
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^";]+)"?/i);
  return match?.[1] || `primary-research-responses.${format === 'xlsx' ? 'xlsx' : 'csv'}`;
}

async function download(format) {
  const button = exportButtons.find((candidate) => candidate.dataset.format === format);
  const key = keyInput.value.trim();
  if (!key) {
    keyInput.focus();
    return;
  }

  exportButtons.forEach((candidate) => { candidate.disabled = true; });
  button.innerHTML = `Preparing ${format === 'xlsx' ? 'Excel' : 'CSV'} download… <span aria-hidden="true">↗</span>`;
  setStatus('Checking the private response log…');

  try {
    const endpoint = format === 'xlsx' ? '/api/admin-export-xlsx' : '/api/admin-export';
    const response = await fetch(endpoint, {
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
    link.download = filenameFrom(response, format);
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);
    setStatus(`Download ready. You can open the ${format === 'xlsx' ? 'styled workbook' : 'CSV'} in Excel.`, 'success');
  } catch (error) {
    setStatus(error.message || 'The export could not be generated. Please try again.', 'error');
  } finally {
    exportButtons.forEach((candidate) => { candidate.disabled = false; });
    button.innerHTML = format === 'xlsx'
      ? 'Download styled Excel <span aria-hidden="true">↗</span>'
      : 'Download CSV instead';
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  download('xlsx');
});

document.querySelector('#export-csv-button').addEventListener('click', () => download('csv'));
