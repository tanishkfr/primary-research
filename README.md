# How We Learn Now — anonymous questionnaire

A small, dependency-free web questionnaire for college students across all majors. It uses open-text prompts, keeps responses anonymous, and appends each valid submission to `data/responses.csv`, which opens directly in Excel.

## Run locally

From this folder, run:

```powershell
node server.mjs
```

Then open [http://localhost:4173](http://localhost:4173).

To share it with people on the same Wi-Fi network, find your computer's local IPv4 address and share `http://YOUR-IP:4173`. Windows Firewall may ask for permission for Node on private networks.

## Response log

The response file is `data/responses.csv`. It is written with a UTF-8 BOM and quoted fields so Excel can open long answers cleanly. It contains only a random response ID, UTC timestamp, and answers; no name, email, IP address, or user agent is recorded.

For a protected browser download, set an admin key before starting the server:

```powershell
$env:ADMIN_KEY = "choose-a-long-private-key"
node server.mjs
```

Then use `/admin/download?key=choose-a-long-private-key`. Do not share that URL publicly.

## Public hosting

This app is ready for any Node.js host that supports a persistent writable volume. Set the start command to `node server.mjs`, set `PORT` if the host requires it, and set a long random `ADMIN_KEY`. A host with ephemeral storage can serve the form but may lose the CSV when the instance restarts, so use persistent storage for real collection.

The supplied `data/questionnaire_responses_template.xlsx` is a formatted Excel starter workbook with a response-log sheet and a question map. For live collection, open `data/responses.csv` in Excel or import it into that workbook after gathering responses.

## Question design note

The source image skips from question 14 to 16. The final prompt is labelled 15 in this form so the questionnaire has a continuous sequence. Yes/no wording was converted into open prompts so respondents can explain their experience.
